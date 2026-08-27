import { getDb } from '../database/db.js';

export class AdminService {
  private db = getDb();

  getSettings() {
    return this.db.prepare('SELECT * FROM admin_settings').all();
  }

  updateSetting(key: string, value: string) {
    this.db.prepare(`
      INSERT INTO admin_settings (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `).run(key, value);
    return { key, value };
  }

  getAllStudentsProgress() {
    return this.db.prepare(`
      SELECT u.id, u.name, u.handle, u.email, u.created_at,
        COUNT(CASE WHEN sp.status = 'COMPLETED' THEN 1 END) as completed_lessons,
        COUNT(DISTINCT sp.module_id) as started_modules
      FROM users u
      LEFT JOIN student_progress sp ON sp.user_id = u.id
      WHERE u.role = 'STUDENT'
      GROUP BY u.id
    `).all();
  }
}

export const adminService = new AdminService();
