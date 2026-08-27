import { getDb } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

export interface SkillWeights {
  knowledge: number;
  implementation: number;
  problemSolving: number;
  debugging: number;
  autonomy: number;
  threshold: number;
}

export class SkillService {
  private db = getDb();

  getWeights(): SkillWeights {
    const getSetting = (k: string, def: number) => {
      const row = this.db.prepare('SELECT value FROM admin_settings WHERE key = ?').get(k) as any;
      return row ? parseFloat(row.value) : def;
    };

    return {
      knowledge: getSetting('knowledge_weight', 0.15),
      implementation: getSetting('implementation_weight', 0.30),
      problemSolving: getSetting('problem_solving_weight', 0.25),
      debugging: getSetting('debugging_weight', 0.20),
      autonomy: getSetting('autonomy_weight', 0.10),
      threshold: getSetting('mastery_threshold', 75.0),
    };
  }

  getStudentSkills(userId: string) {
    const rows = this.db.prepare(`
      SELECT 
        s.id as skill_id,
        s.code,
        s.name,
        s.category,
        s.description,
        s.icon,
        COALESCE(ss.status, 'NOT_LEARNED') as status,
        COALESCE(ss.knowledge_score, 0) as knowledge_score,
        COALESCE(ss.implementation_score, 0) as implementation_score,
        COALESCE(ss.problem_solving_score, 0) as problem_solving_score,
        COALESCE(ss.debugging_score, 0) as debugging_score,
        COALESCE(ss.autonomy_score, 100) as autonomy_score,
        COALESCE(ss.composite_score, 0) as composite_score,
        ss.updated_at
      FROM skills s
      LEFT JOIN student_skills ss ON ss.skill_id = s.id AND ss.user_id = ?
      ORDER BY s.category, s.name
    `).all(userId) as any[];

    return rows;
  }

  updateSkillMetric(
    userId: string,
    skillCodeOrId: string,
    delta: {
      knowledge?: number;
      implementation?: number;
      problemSolving?: number;
      debugging?: number;
      autonomyPenalty?: number; // degrades autonomy if heavy hints were used
    }
  ) {
    const skill = this.db.prepare('SELECT id, code FROM skills WHERE id = ? OR code = ?').get(skillCodeOrId, skillCodeOrId) as any;
    if (!skill) return null;

    let studentSkill = this.db.prepare(`
      SELECT * FROM student_skills WHERE user_id = ? AND skill_id = ?
    `).get(userId, skill.id) as any;

    if (!studentSkill) {
      const id = uuidv4();
      this.db.prepare(`
        INSERT INTO student_skills (id, user_id, skill_id, status, knowledge_score, implementation_score, problem_solving_score, debugging_score, autonomy_score, composite_score)
        VALUES (?, ?, ?, 'NOT_LEARNED', 0, 0, 0, 0, 100, 0)
      `).run(id, userId, skill.id);
      studentSkill = {
        id,
        user_id: userId,
        skill_id: skill.id,
        status: 'NOT_LEARNED',
        knowledge_score: 0,
        implementation_score: 0,
        problem_solving_score: 0,
        debugging_score: 0,
        autonomy_score: 100,
        composite_score: 0,
      };
    }

    const weights = this.getWeights();

    const clamp = (val: number) => Math.min(100, Math.max(0, val));

    const newKnowledge = delta.knowledge !== undefined ? clamp(delta.knowledge) : studentSkill.knowledge_score;
    const newImpl = delta.implementation !== undefined ? clamp(delta.implementation) : studentSkill.implementation_score;
    const newProb = delta.problemSolving !== undefined ? clamp(delta.problemSolving) : studentSkill.problem_solving_score;
    const newDebug = delta.debugging !== undefined ? clamp(delta.debugging) : studentSkill.debugging_score;
    
    let newAutonomy = studentSkill.autonomy_score;
    if (delta.autonomyPenalty) {
      newAutonomy = clamp(newAutonomy - delta.autonomyPenalty);
    }

    // Composite Calculation = Sum(score_i * weight_i)
    const compositeScore = 
      (newKnowledge * weights.knowledge) +
      (newImpl * weights.implementation) +
      (newProb * weights.problemSolving) +
      (newDebug * weights.debugging) +
      (newAutonomy * weights.autonomy);

    // Determine status: NOT_LEARNED, FRAGILE, ASSISTED, MASTERED
    let newStatus = 'NOT_LEARNED';
    if (compositeScore >= weights.threshold) {
      newStatus = 'MASTERED';
    } else if (newAutonomy < 60 || compositeScore < 50) {
      newStatus = 'FRAGILE';
    } else {
      newStatus = 'ASSISTED';
    }

    this.db.prepare(`
      UPDATE student_skills
      SET 
        knowledge_score = ?,
        implementation_score = ?,
        problem_solving_score = ?,
        debugging_score = ?,
        autonomy_score = ?,
        composite_score = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newKnowledge, newImpl, newProb, newDebug, newAutonomy, compositeScore, newStatus, studentSkill.id);

    return {
      skillId: skill.id,
      code: skill.code,
      compositeScore,
      status: newStatus,
      scores: {
        knowledge: newKnowledge,
        implementation: newImpl,
        problemSolving: newProb,
        debugging: newDebug,
        autonomy: newAutonomy
      }
    };
  }
}

export const skillService = new SkillService();
