import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/db.js';
import { config } from '../config/index.js';

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  handle: string;
  role: 'STUDENT' | 'ADMIN' | 'MENTOR';
  avatar?: string;
}

export class AuthService {
  private db = getDb();

  generateToken(user: UserPayload): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        handle: user.handle,
        role: user.role,
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): UserPayload | null {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      return {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        handle: decoded.handle,
        role: decoded.role,
      };
    } catch {
      return null;
    }
  }

  async register(data: { email: string; password: string; name: string; handle: string }): Promise<{ user: UserPayload; token: string }> {
    const existing = this.db.prepare('SELECT id FROM users WHERE email = ? OR handle = ?').get(data.email, data.handle);
    if (existing) {
      throw new Error('USER_ALREADY_EXISTS');
    }

    const id = `user_${uuidv4().substring(0, 8)}`;
    const passwordHash = bcrypt.hashSync(data.password, 10);
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.handle)}`;

    this.db.prepare(`
      INSERT INTO users (id, email, password_hash, name, handle, role, avatar)
      VALUES (?, ?, ?, ?, ?, 'STUDENT', ?)
    `).run(id, data.email, passwordHash, data.name, data.handle, avatar);

    // Initialize all skills for new student
    const skills = this.db.prepare('SELECT id FROM skills').all() as { id: string }[];
    const insertStudentSkill = this.db.prepare(`
      INSERT INTO student_skills (id, user_id, skill_id, status, knowledge_score, implementation_score, problem_solving_score, debugging_score, autonomy_score, composite_score)
      VALUES (?, ?, ?, 'NOT_LEARNED', 0, 0, 0, 0, 100, 0)
    `);

    // Initialize first module / first lesson available
    const firstLesson = this.db.prepare(`
      SELECT l.id as lesson_id, l.module_id 
      FROM lessons l 
      JOIN modules m ON l.module_id = m.id 
      ORDER BY m.order_index ASC, l.order_index ASC 
      LIMIT 1
    `).get() as { lesson_id: string; module_id: string } | undefined;

    const tx = this.db.transaction(() => {
      for (const s of skills) {
        insertStudentSkill.run(uuidv4(), id, s.id);
      }
      if (firstLesson) {
        this.db.prepare(`
          INSERT INTO student_progress (id, user_id, module_id, lesson_id, status)
          VALUES (?, ?, ?, ?, 'AVAILABLE')
        `).run(uuidv4(), id, firstLesson.module_id, firstLesson.lesson_id);
      }
    });
    tx();

    const user: UserPayload = {
      id,
      email: data.email,
      name: data.name,
      handle: data.handle,
      role: 'STUDENT',
      avatar
    };

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(emailOrHandle: string, password: string): Promise<{ user: UserPayload; token: string }> {
    const userRow = this.db.prepare(`
      SELECT id, email, password_hash, name, handle, role, avatar 
      FROM users 
      WHERE email = ? OR handle = ?
    `).get(emailOrHandle, emailOrHandle) as any;

    if (!userRow) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isValid = bcrypt.compareSync(password, userRow.password_hash);
    if (!isValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const user: UserPayload = {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      handle: userRow.handle,
      role: userRow.role,
      avatar: userRow.avatar
    };

    const token = this.generateToken(user);
    return { user, token };
  }

  getUserById(id: string): UserPayload | null {
    const userRow = this.db.prepare(`
      SELECT id, email, name, handle, role, avatar, created_at 
      FROM users 
      WHERE id = ?
    `).get(id) as any;

    if (!userRow) return null;
    return {
      id: userRow.id,
      email: userRow.email,
      name: userRow.name,
      handle: userRow.handle,
      role: userRow.role,
      avatar: userRow.avatar
    };
  }
}

export const authService = new AuthService();
