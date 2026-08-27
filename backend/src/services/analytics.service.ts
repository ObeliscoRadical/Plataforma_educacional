import { getDb } from '../database/db.js';

export class AnalyticsService {
  private db = getDb();

  getSystemMetrics() {
    const totalUsers = this.db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "STUDENT"').get() as any;
    const completedLessons = this.db.prepare('SELECT COUNT(*) as count FROM student_progress WHERE status = "COMPLETED"').get() as any;
    const totalAttempts = this.db.prepare('SELECT COUNT(*) as count FROM attempts').get() as any;
    const averageHints = this.db.prepare('SELECT AVG(hints_used_count) as avg_hints FROM attempts').get() as any;
    const totalEvents = this.db.prepare('SELECT COUNT(*) as count FROM learning_events').get() as any;

    const eventDistribution = this.db.prepare(`
      SELECT event_type, COUNT(*) as count 
      FROM learning_events 
      GROUP BY event_type 
      ORDER BY count DESC
    `).all();

    const lessonDropoff = this.db.prepare(`
      SELECT l.code, l.title, m.code as module_code,
        COUNT(CASE WHEN sp.status = 'IN_PROGRESS' THEN 1 END) as in_progress_count,
        COUNT(CASE WHEN sp.status = 'COMPLETED' THEN 1 END) as completed_count
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      LEFT JOIN student_progress sp ON sp.lesson_id = l.id
      GROUP BY l.id
      ORDER BY m.order_index ASC, l.order_index ASC
      LIMIT 10
    `).all();

    return {
      totalStudents: totalUsers.count,
      completedLessons: completedLessons.count,
      totalAttempts: totalAttempts.count,
      averageHintsPerAttempt: Math.round((averageHints.avg_hints || 0) * 10) / 10,
      totalEventsLogged: totalEvents.count,
      eventDistribution,
      lessonDropoff
    };
  }
}

export const analyticsService = new AnalyticsService();
