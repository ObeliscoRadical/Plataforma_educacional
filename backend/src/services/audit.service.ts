import { getDb } from '../database/db.js';

export const auditService = {
  log(actorId: string | null, action: string, target?: string, meta?: unknown) {
    getDb().prepare('INSERT INTO audit_log (actor_id, action, target, meta_json) VALUES (?,?,?,?)')
      .run(actorId, action, target ?? null, meta ? JSON.stringify(meta) : null);
  },
  csv(): string {
    const rows = getDb().prepare('SELECT id, actor_id, action, target, meta_json, created_at FROM audit_log ORDER BY id DESC LIMIT 5000').all() as any[];
    // prefix = - + @ cells so spreadsheets don't run them as formulas
    const q = (v: unknown) => { let t = String(v ?? ''); if (/^[=+\-@]/.test(t)) t = "'" + t; return `"${t.replace(/"/g, '""')}"`; };
    return ['id,actor_id,action,target,meta,created_at', ...rows.map(r => [r.id, r.actor_id, r.action, r.target, r.meta_json, r.created_at].map(q).join(','))].join('\n');
  },
};
