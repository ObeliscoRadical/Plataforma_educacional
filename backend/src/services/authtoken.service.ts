import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDb } from '../database/db.js';

type Kind = 'RESET' | 'VERIFY';
const TTL_MS: Record<Kind, number> = { RESET: 60 * 60 * 1000, VERIFY: 24 * 60 * 60 * 1000 };
const hash = (t: string) => crypto.createHash('sha256').update(t).digest('hex');

// One-time tokens (stored hashed). Delivery is the caller's job: no mail provider is configured yet.
export const authTokenService = {
  issue(userId: string, kind: Kind): string {
    const db = getDb();
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('UPDATE auth_tokens SET used_at = CURRENT_TIMESTAMP WHERE user_id = ? AND kind = ? AND used_at IS NULL').run(userId, kind);
    db.prepare('INSERT INTO auth_tokens (token_hash, user_id, kind, expires_at) VALUES (?, ?, ?, ?)')
      .run(hash(token), userId, kind, new Date(Date.now() + TTL_MS[kind]).toISOString());
    return token;
  },

  // Returns user id and marks the token used, or null if unknown/expired/used.
  consume(token: string, kind: Kind): string | null {
    const db = getDb();
    const row = db.prepare('SELECT user_id, expires_at, used_at FROM auth_tokens WHERE token_hash = ? AND kind = ?').get(hash(token), kind) as any;
    if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) return null;
    db.prepare('UPDATE auth_tokens SET used_at = CURRENT_TIMESTAMP WHERE token_hash = ?').run(hash(token));
    return row.user_id;
  },

  forgot(email: string): string | null {
    const u = getDb().prepare('SELECT id FROM users WHERE email = ?').get(String(email).trim()) as any;
    return u ? this.issue(u.id, 'RESET') : null;
  },

  reset(token: string, password: string): boolean {
    const uid = this.consume(token, 'RESET');
    if (!uid) return false;
    getDb().prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(bcrypt.hashSync(password, 10), uid);
    return true;
  },

  verify(token: string): boolean {
    return this.consume(token, 'VERIFY') !== null;
  },

  isVerified(userId: string): boolean {
    return !!getDb().prepare("SELECT 1 FROM auth_tokens WHERE user_id = ? AND kind = 'VERIFY' AND used_at IS NOT NULL LIMIT 1").get(userId);
  },
};
