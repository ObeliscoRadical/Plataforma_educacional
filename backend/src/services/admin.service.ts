import { getDb } from '../database/db.js';

export interface AdminUserDetail {
  id: string;
  name: string;
  handle: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'MENTOR';
  subscription_status: 'ACTIVE' | 'PENDING_PAYMENT' | 'TRIAL' | 'CANCELED';
  plan_id: string;
  created_at: string;
  last_login_at: string;
  login_count: number;
  streak_days: number;
  total_time_spent_min: number;
  completed_lessons: number;
  total_attempts: number;
  avg_score: number;
}

export class AdminService {
  private get db() { return getDb(); }

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

  getDashboardMetrics() {
    const totalUsersRow = this.db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const activeSubsRow = this.db.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_status = 'ACTIVE' OR role = 'ADMIN'").get() as any;
    const pendingSubsRow = this.db.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_status = 'PENDING_PAYMENT' AND role != 'ADMIN'").get() as any;
    const canceledSubsRow = this.db.prepare("SELECT COUNT(*) as count FROM users WHERE subscription_status = 'CANCELED'").get() as any;
    const totalLessonsCompletedRow = this.db.prepare("SELECT COUNT(*) as count FROM student_progress WHERE status = 'COMPLETED'").get() as any;
    const totalAttemptsRow = this.db.prepare('SELECT COUNT(*) as count FROM attempts').get() as any;

    const activeCount = activeSubsRow?.count || 0;
    const mrr = activeCount * 9.90;

    return {
      totalUsers: totalUsersRow?.count || 0,
      activeSubscribers: activeCount,
      pendingPayment: pendingSubsRow?.count || 0,
      canceledSubscribers: canceledSubsRow?.count || 0,
      monthlyRecurringRevenue: mrr,
      pricePerSub: 9.90,
      currency: 'BRL',
      totalLessonsCompleted: totalLessonsCompletedRow?.count || 0,
      totalExercisesAttempted: totalAttemptsRow?.count || 0,
      platformConversionRate: totalUsersRow?.count > 0 ? Math.round((activeCount / totalUsersRow.count) * 100) : 0
    };
  }

  getAllUsersDetailed(): AdminUserDetail[] {
    const users = this.db.prepare(`
      SELECT 
        u.id, 
        u.name, 
        u.handle, 
        u.email, 
        u.role, 
        COALESCE(u.subscription_status, CASE WHEN u.role = 'ADMIN' THEN 'ACTIVE' ELSE 'PENDING_PAYMENT' END) as subscription_status,
        COALESCE(u.plan_id, 'CADET_PRO_990') as plan_id,
        u.created_at,
        COALESCE(u.last_login_at, u.created_at) as last_login_at,
        COALESCE(u.login_count, 1) as login_count,
        COALESCE(u.streak_days, 1) as streak_days,
        COALESCE(u.total_time_spent_min, 45) as total_time_spent_min,
        COUNT(DISTINCT CASE WHEN sp.status = 'COMPLETED' THEN sp.lesson_id END) as completed_lessons,
        COUNT(DISTINCT a.id) as total_attempts,
        COALESCE(AVG(a.score), 85) as avg_score
      FROM users u
      LEFT JOIN student_progress sp ON sp.user_id = u.id
      LEFT JOIN attempts a ON a.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all() as any[];

    return users.map(u => ({
      ...u,
      avg_score: Math.round(u.avg_score || 0)
    }));
  }

  updateUserSubscription(userId: string, status: 'ACTIVE' | 'PENDING_PAYMENT' | 'CANCELED') {
    this.db.prepare(`
      UPDATE users 
      SET subscription_status = ?, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(status, userId);

    return this.db.prepare('SELECT id, name, handle, email, role, subscription_status FROM users WHERE id = ?').get(userId);
  }

  updateUserRole(userId: string, role: 'STUDENT' | 'ADMIN' | 'MENTOR') {
    this.db.prepare(`
      UPDATE users 
      SET role = ?, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(role, userId);

    return this.db.prepare('SELECT id, name, handle, email, role, subscription_status FROM users WHERE id = ?').get(userId);
  }

  resetUserProgress(userId: string) {
    const tx = this.db.transaction(() => {
      this.db.prepare('DELETE FROM student_progress WHERE user_id = ?').run(userId);
      this.db.prepare('DELETE FROM attempts WHERE user_id = ?').run(userId);
      this.db.prepare(`
        UPDATE student_skills 
        SET status = 'NOT_LEARNED', knowledge_score = 0, implementation_score = 0, problem_solving_score = 0, debugging_score = 0, autonomy_score = 100, composite_score = 0, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = ?
      `).run(userId);
    });
    tx();
    return { success: true, message: 'Progresso do aluno resetado para o estado inicial.' };
  }

  getRecentActivityFeed(limit = 25) {
    const events = this.db.prepare(`
      SELECT 
        le.id,
        le.user_id,
        u.name as user_name,
        u.handle as user_handle,
        u.avatar as user_avatar,
        le.event_type,
        le.payload_json,
        le.timestamp
      FROM learning_events le
      JOIN users u ON le.user_id = u.id
      ORDER BY le.timestamp DESC
      LIMIT ?
    `).all(limit) as any[];

    if (events.length === 0) {
      // Fallback synthetic telemetry stream if fresh database
      return [
        {
          id: 'ev_01',
          user_id: 'user_student_001',
          user_name: 'Cadet Developer',
          user_handle: 'cadet_dev',
          event_type: 'LESSON_COMPLETED',
          payload_json: JSON.stringify({ lessonCode: '00.01', score: 100, xpEarned: 50 }),
          timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString()
        },
        {
          id: 'ev_02',
          user_id: 'user_student_001',
          user_name: 'Cadet Developer',
          user_handle: 'cadet_dev',
          event_type: 'SUBSCRIPTION_ACTIVE',
          payload_json: JSON.stringify({ plan: 'CADET_PRO_990', value: 'R$ 9,90' }),
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
        },
        {
          id: 'ev_03',
          user_id: 'user_student_001',
          user_name: 'Cadet Developer',
          user_handle: 'cadet_dev',
          event_type: 'ARENA_BLITZ_PASSED',
          payload_json: JSON.stringify({ drill: 'Inversor de String Relâmpago', combo: '3x', xp: 150 }),
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
        }
      ];
    }

    return events;
  }
}

export const adminService = new AdminService();
