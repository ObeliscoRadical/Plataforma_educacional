import { getDb } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';
import { skillService } from './skill.service.js';

export class AdaptiveService {
  private get db() { return getDb(); }

  /**
   * Scans student's skill proficiency and automatically generates a targeted
   * Remedial Lesson (microaula de reforço) whenever a skill drops to FRAGILE.
   */
  async checkAndGenerateRemedials(userId: string, triggeredByLessonId?: string) {
    const skills = skillService.getStudentSkills(userId);
    const fragileSkills = skills.filter(s => s.status === 'FRAGILE');
    const createdRemedials = [];

    for (const skill of fragileSkills) {
      // Check if there is already an active pending remedial for this skill
      const existing = this.db.prepare(`
        SELECT id FROM remedial_lessons 
        WHERE user_id = ? AND skill_id = ? AND status = 'PENDING'
      `).get(userId, skill.skill_id);

      if (!existing) {
        const remedialId = uuidv4();
        const title = `Microaula de Reforço: ${skill.name}`;
        const reason = `Detecção de fragilidade na competência [${skill.code}]. Score atual: ${Math.round(skill.composite_score)}%.`;
        const content = `# Reforço Operacional: ${skill.name}

O Mentor identificou dificuldades recorrentes na aplicação prática desta competência.

### Diagnóstico de Fragilidade:
- **Autonomia Registrada**: ${Math.round(skill.autonomy_score)}% (Dependência elevada de níveis avançados de dica).
- **Implementação Prática**: ${Math.round(skill.implementation_score)}%.

### Instrução de Recuperação:
Revise a decomposição do problema:
1. Isolar o caso base.
2. Evitar efeitos colaterais.
3. Testar a invariante antes de prosseguir.`;

        const microExercise = {
          title: `Desafio de Recuperação: ${skill.code}`,
          description: `Implemente uma versão simplificada e defensiva para reestabelecer o status da competência ${skill.name}.`,
          initialCode: `function recover_${skill.code.toLowerCase()}() {\n  // Implemente a correção defensiva\n}`,
          solutionCode: `function recover_${skill.code.toLowerCase()}() {\n  return { recovered: true, skill: "${skill.code}", timestamp: Date.now() };\n}`,
          testCases: [
            { name: 'Deve retornar confirmação de recuperação', assertion: `const r = recover_${skill.code.toLowerCase()}(); return r && r.recovered === true && r.skill === "${skill.code}";` }
          ]
        };

        this.db.prepare(`
          INSERT INTO remedial_lessons (id, user_id, skill_id, triggered_by_lesson_id, title, reason, content_markdown, micro_exercise_json, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
        `).run(
          remedialId,
          userId,
          skill.skill_id,
          triggeredByLessonId || null,
          title,
          reason,
          content,
          JSON.stringify(microExercise)
        );

        createdRemedials.push({ remedialId, skillCode: skill.code, title });
      }
    }

    return createdRemedials;
  }

  getStudentRemedials(userId: string) {
    const rows = this.db.prepare(`
      SELECT rl.*, s.name as skill_name, s.code as skill_code
      FROM remedial_lessons rl
      JOIN skills s ON rl.skill_id = s.id
      WHERE rl.user_id = ?
      ORDER BY rl.created_at DESC
    `).all(userId) as any[];

    return rows.map(r => ({
      ...r,
      microExercise: JSON.parse(r.micro_exercise_json || '{}')
    }));
  }

  completeRemedial(remedialId: string, userId: string) {
    const remedial = this.db.prepare(`
      SELECT * FROM remedial_lessons WHERE id = ? AND user_id = ?
    `).get(remedialId, userId) as any;

    if (!remedial) throw new Error('REMEDIAL_NOT_FOUND');

    this.db.prepare(`
      UPDATE remedial_lessons 
      SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(remedialId);

    // Boost skill scores out of FRAGILE state
    skillService.updateSkillMetric(userId, remedial.skill_id, {
      knowledge: 75,
      implementation: 78,
      problemSolving: 75,
      debugging: 75,
      autonomyPenalty: -20 // recovers autonomy
    });

    return {
      status: 'COMPLETED',
      message: 'Remedial completed! Skill proficiency restored.'
    };
  }
}

export const adaptiveService = new AdaptiveService();
