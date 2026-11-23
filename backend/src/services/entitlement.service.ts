import { randomUUID } from 'crypto';
import { getDb } from '../database/db.js';

export const DEFAULT_COURSE_ID = 'course_devos_fullstack';

function courseOfLesson(lessonId: string): { courseId: string; code: string } | null {
  const row = getDb().prepare(`
    SELECT m.course_id AS courseId, l.code AS code
    FROM lessons l JOIN modules m ON m.id = l.module_id
    WHERE l.id = ? OR l.code = ? OR l.slug = ?`).get(lessonId, lessonId, lessonId) as any;
  return row || null;
}

function courseOfModule(moduleId: string): string | null {
  const row = getDb().prepare('SELECT course_id AS courseId FROM modules WHERE id = ? OR code = ? OR slug = ?')
    .get(moduleId, moduleId, moduleId) as any;
  return row?.courseId ?? null;
}

export const entitlementService = {
  hasActiveEnrollment(userId: string, courseId: string): boolean {
    const row = getDb().prepare(`
      SELECT 1 FROM enrollments
      WHERE user_id = ? AND course_id = ? AND status = 'ACTIVE'
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`).get(userId, courseId);
    return !!row;
  },

  hasAnyActiveEnrollment(userId: string): boolean {
    return !!getDb().prepare(`
      SELECT 1 FROM enrollments WHERE user_id = ? AND status = 'ACTIVE'
        AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`).get(userId);
  },

  isPreviewLesson(code: string): boolean {
    return !!getDb().prepare('SELECT 1 FROM preview_lessons WHERE code = ?').get(code);
  },

  /** true when the user may see this lesson. Unknown lesson => true (route returns its own 404). */
  canAccessLesson(user: { id: string; role: string } | undefined, lessonId: string): boolean {
    const info = courseOfLesson(lessonId);
    if (!info) return true;
    if (this.isPreviewLesson(info.code)) return true;
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return this.hasActiveEnrollment(user.id, info.courseId);
  },

  canAccessModule(user: { id: string; role: string } | undefined, moduleId: string): boolean {
    const courseId = courseOfModule(moduleId);
    if (!courseId) return true;
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return this.hasActiveEnrollment(user.id, courseId);
  },

  grant(userId: string, courseId: string, source: string, orderId?: string) {
    const db = getDb();
    db.prepare(`
      INSERT INTO enrollments (id, user_id, course_id, status, source, order_id)
      VALUES (?, ?, ?, 'ACTIVE', ?, ?)
      ON CONFLICT(user_id, course_id) DO UPDATE SET status = 'ACTIVE', source = excluded.source,
        order_id = COALESCE(excluded.order_id, enrollments.order_id), revoked_at = NULL`)
      .run(randomUUID(), userId, courseId, source, orderId ?? null);
  },

  revoke(userId: string, courseId: string) {
    getDb().prepare(`UPDATE enrollments SET status = 'REVOKED', revoked_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND course_id = ?`).run(userId, courseId);
  },

  createOrder(userId: string, courseId: string, amountCents: number, provider: string, providerRef: string, status = 'PAID') {
    const id = randomUUID();
    getDb().prepare(`INSERT OR IGNORE INTO orders (id, user_id, course_id, amount_cents, currency, status, provider, provider_ref)
      VALUES (?, ?, ?, ?, 'BRL', ?, ?, ?)`).run(id, userId, courseId, amountCents, status, provider, providerRef);
    const row = getDb().prepare('SELECT id FROM orders WHERE provider = ? AND provider_ref = ?').get(provider, providerRef) as any;
    return row.id as string;
  },

  redeemCode(userId: string, code: string): { ok: boolean; error?: string; courseId?: string } {
    const db = getDb();
    const ac = db.prepare('SELECT * FROM access_codes WHERE code = ?').get(code) as any;
    if (!ac) return { ok: false, error: 'CODE_NOT_FOUND' };
    if (ac.expires_at && ac.expires_at < new Date().toISOString().replace('T', ' ').slice(0, 19)) return { ok: false, error: 'CODE_EXPIRED' };
    const tx = db.transaction(() => {
      const upd = db.prepare('UPDATE access_codes SET used_count = used_count + 1 WHERE code = ? AND used_count < max_uses').run(code);
      if (upd.changes === 0) return false;
      this.grant(userId, ac.course_id, 'ACCESS_CODE');
      return true;
    });
    return tx() ? { ok: true, courseId: ac.course_id } : { ok: false, error: 'CODE_EXHAUSTED' };
  },

  listForUser(userId: string) {
    return getDb().prepare(`SELECT e.course_id AS courseId, c.title, e.status, e.source, e.granted_at AS grantedAt
      FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE e.user_id = ?`).all(userId);
  },
};
