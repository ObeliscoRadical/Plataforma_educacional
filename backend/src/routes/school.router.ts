import { Router, Response } from 'express';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/db.js';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/rbac.middleware.js';
import { entitlementService, DEFAULT_COURSE_ID } from '../services/entitlement.service.js';
import { auditService } from '../services/audit.service.js';

export const schoolRouter = Router();
const uid = (req: AuthenticatedRequest) => req.user!.id;

// Legal pages: static, public. Texts are templates: owner must review with a lawyer before real sales.
schoolRouter.get('/legal/:doc', (req, res) => {
  const docs: Record<string, string> = {
    terms: 'Termos de Serviço (modelo). Acesso pessoal e intransmissível ao curso adquirido.',
    privacy: 'Política de Privacidade (modelo). Dados tratados: conta, progresso, compras. Direitos RGPD: exportar e apagar em /api/me/data.',
    withdrawal: 'Direito de livre resolução de 14 dias (modelo). Ao iniciar o acesso imediato, o aluno consente em perder o direito após o início da prestação.',
  };
  const t = docs[req.params.doc];
  if (!t) { res.status(404).json({ error: 'NOT_FOUND' }); return; }
  res.json({ doc: req.params.doc, text: t, template: true });
});

schoolRouter.post('/consents', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const kind = String(req.body?.kind || '');
  if (!['TERMS', 'PRIVACY', 'WITHDRAWAL_WAIVER'].includes(kind)) { res.status(400).json({ error: 'INVALID_KIND' }); return; }
  getDb().prepare('INSERT INTO consents (user_id, kind, course_id, ip) VALUES (?,?,?,?)')
    .run(uid(req), kind, req.body?.courseId || DEFAULT_COURSE_ID, req.ip);
  res.status(201).json({ ok: true });
});

// RGPD: export and erase own data
schoolRouter.get('/me/data', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDb(); const id = uid(req);
  const rows = (sql: string) => db.prepare(sql).all(id);
  res.json({
    user: db.prepare('SELECT id,email,name,handle,role,created_at FROM users WHERE id=?').get(id),
    enrollments: rows('SELECT * FROM enrollments WHERE user_id=?'),
    orders: rows('SELECT * FROM orders WHERE user_id=?'),
    consents: rows('SELECT * FROM consents WHERE user_id=?'),
    notes: rows('SELECT * FROM lesson_notes WHERE user_id=?'),
    progress: rows('SELECT * FROM student_progress WHERE user_id=?'),
    certificates: rows('SELECT * FROM certificates WHERE user_id=?'),
  });
});

// Erase = anonymize account (orders kept for tax law, detached from identity) + delete personal content.
schoolRouter.delete('/me/data', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDb(); const id = uid(req);
  if (req.user!.role === 'ADMIN') { res.status(403).json({ error: 'ADMIN_CANNOT_SELF_DELETE' }); return; }
  db.transaction(() => {
    db.prepare('DELETE FROM lesson_notes WHERE user_id=?').run(id);
    db.prepare('DELETE FROM consents WHERE user_id=?').run(id);
    db.prepare('UPDATE enrollments SET status=\'REVOKED\' WHERE user_id=?').run(id);
    db.prepare('UPDATE users SET email=?, name=\'Conta removida\', handle=?, password_hash=\'!\' WHERE id=?')
      .run(`deleted+${id}@invalid.local`, `deleted_${id.slice(0, 8)}`, id);
    auditService.log(id, 'ACCOUNT_ERASED', `user:${id}`);
  })();
  res.json({ ok: true });
});

// Notes: only with active enrollment on the lesson
const noteGuard = (req: AuthenticatedRequest, res: Response, next: () => void) => {
  if (!entitlementService.canAccessLesson(req.user, String(req.params.lessonId))) { res.status(403).json({ error: 'ENROLLMENT_REQUIRED' }); return; }
  next();
};
schoolRouter.get('/lessons/:lessonId/notes', authMiddleware, noteGuard, (req: AuthenticatedRequest, res) => {
  res.json({ notes: getDb().prepare('SELECT id, body, created_at FROM lesson_notes WHERE user_id=? AND lesson_id=? ORDER BY created_at').all(uid(req), req.params.lessonId) });
});
schoolRouter.post('/lessons/:lessonId/notes', authMiddleware, noteGuard, (req: AuthenticatedRequest, res) => {
  const body = String(req.body?.body || '').trim().slice(0, 4000);
  if (!body) { res.status(400).json({ error: 'EMPTY_NOTE' }); return; }
  const id = uuidv4();
  getDb().prepare('INSERT INTO lesson_notes (id,user_id,lesson_id,body) VALUES (?,?,?,?)').run(id, uid(req), req.params.lessonId, body);
  res.status(201).json({ id });
});

// Certificate: only when every lesson of the course is COMPLETED for this user
schoolRouter.post('/certificates', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const db = getDb(); const id = uid(req);
  if (!entitlementService.hasActiveEnrollment(id, DEFAULT_COURSE_ID)) { res.status(403).json({ error: 'ENROLLMENT_REQUIRED' }); return; }
  const total = (db.prepare('SELECT COUNT(*) c FROM lessons l JOIN modules m ON m.id=l.module_id WHERE m.course_id=?').get(DEFAULT_COURSE_ID) as any).c;
  const done = (db.prepare("SELECT COUNT(DISTINCT p.lesson_id) c FROM student_progress p JOIN modules m ON m.id=p.module_id WHERE p.user_id=? AND m.course_id=? AND p.status='COMPLETED'").get(id, DEFAULT_COURSE_ID) as any).c;
  if (done < total) { res.status(409).json({ error: 'COURSE_NOT_COMPLETED', done, total }); return; }
  const existing = db.prepare('SELECT code FROM certificates WHERE user_id=? AND course_id=?').get(id, DEFAULT_COURSE_ID) as any;
  const code = existing?.code ?? randomBytes(8).toString('hex').toUpperCase();
  if (!existing) db.prepare('INSERT INTO certificates (code,user_id,course_id) VALUES (?,?,?)').run(code, id, DEFAULT_COURSE_ID);
  res.json({ code, verifyUrl: `/api/certificates/${code}` });
});
// Public verification: reveals only name + date
schoolRouter.get('/certificates/:code', (req, res) => {
  const c = getDb().prepare('SELECT c.code, c.issued_at, u.name FROM certificates c JOIN users u ON u.id=c.user_id WHERE c.code=?').get(req.params.code);
  c ? res.json({ valid: true, ...(c as object) }) : res.status(404).json({ valid: false });
});

// Admin: audit log + enrollments CSV
schoolRouter.get('/admin/audit.csv', authMiddleware, requireRoles('ADMIN'), (_req, res) => {
  res.type('text/csv').send(auditService.csv());
});
schoolRouter.get('/admin/enrollments.csv', authMiddleware, requireRoles('ADMIN'), (req: AuthenticatedRequest, res) => {
  const rows = getDb().prepare('SELECT user_id, course_id, status, source, granted_at FROM enrollments').all() as any[];
  const q = (v: unknown) => { let t = String(v ?? ''); if (/^[=+\-@]/.test(t)) t = "'" + t; return `"${t.replace(/"/g, '""')}"`; };
  auditService.log(uid(req), 'EXPORT_ENROLLMENTS', null as any);
  res.type('text/csv').send(['user_id,course_id,status,source,granted_at', ...rows.map(r => [r.user_id, r.course_id, r.status, r.source, r.granted_at].map(q).join(','))].join('\n'));
});

// Tutor report button
schoolRouter.post('/mentor/report', authMiddleware, (req: AuthenticatedRequest, res) => {
  getDb().prepare('INSERT INTO tutor_reports (user_id, feedback_id, reason) VALUES (?,?,?)')
    .run(uid(req), req.body?.feedbackId || null, String(req.body?.reason || '').slice(0, 500));
  res.status(201).json({ ok: true });
});
