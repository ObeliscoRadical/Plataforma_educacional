import { getDb } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { skillService } from './skill.service.js';

export interface MentorChatRequest {
  userId: string;
  lessonId?: string;
  message: string;
  codeSnippet?: string;
  hintLevel?: number; // 1 to 5
}

export class MentorService {
  private get db() { return getDb(); }

  async getOrCreateSession(userId: string, lessonId?: string) {
    let session = this.db.prepare(`
      SELECT * FROM mentor_sessions 
      WHERE user_id = ? AND (lesson_id = ? OR (lesson_id IS NULL AND ? IS NULL))
      ORDER BY updated_at DESC LIMIT 1
    `).get(userId, lessonId || null, lessonId || null) as any;

    if (!session) {
      const id = uuidv4();
      this.db.prepare(`
        INSERT INTO mentor_sessions (id, user_id, lesson_id, context_state_json)
        VALUES (?, ?, ?, ?)
      `).run(id, userId, lessonId || null, JSON.stringify({ active: true }));

      session = { id, user_id: userId, lesson_id: lessonId, context_state_json: '{}' };
    }

    return session;
  }

  async getSessionHistory(userId: string, lessonId?: string) {
    const session = await this.getOrCreateSession(userId, lessonId);
    const messages = this.db.prepare(`
      SELECT id, session_id, user_id, message, sender, hint_level, code_snippet, analysis_json, created_at
      FROM mentor_feedbacks
      WHERE session_id = ?
      ORDER BY created_at ASC
    `).all(session.id) as any[];

    return {
      sessionId: session.id,
      messages: messages.map(m => ({
        ...m,
        analysis: m.analysis_json ? JSON.parse(m.analysis_json) : null
      }))
    };
  }

  async chatWithMentor(req: MentorChatRequest) {
    const session = await this.getOrCreateSession(req.userId, req.lessonId);

    // 1. Gather Rich Context
    const user = this.db.prepare('SELECT id, name, handle, role FROM users WHERE id = ?').get(req.userId) as any;
    const skills = skillService.getStudentSkills(req.userId);
    const fragileSkills = skills.filter(s => s.status === 'FRAGILE').map(s => s.name);
    const masteredSkills = skills.filter(s => s.status === 'MASTERED').map(s => s.name);

    let lessonContext = '';
    let exerciseContext = '';
    let solutionCode = '';

    if (req.lessonId) {
      const lesson = this.db.prepare(`
        SELECT l.*, m.title as module_title, m.code as module_code
        FROM lessons l
        JOIN modules m ON l.module_id = m.id
        WHERE l.id = ?
      `).get(req.lessonId) as any;

      const content = this.db.prepare('SELECT objective, expected_output, commented_solution FROM lesson_contents WHERE lesson_id = ?').get(req.lessonId) as any;
      const exercise = this.db.prepare('SELECT title, description, solution_code FROM exercises WHERE lesson_id = ?').get(req.lessonId) as any;

      if (lesson) {
        lessonContext = `Lesson: ${lesson.code} - ${lesson.title} (Module: ${lesson.module_title}). Objective: ${content?.objective || 'N/A'}`;
      }
      if (exercise) {
        exerciseContext = `Exercise: ${exercise.title}. Description: ${exercise.description}`;
        solutionCode = exercise.solution_code || '';
      }
    }

    // Server-side scaffolding: level can rise only 1 step per prior user message, so the full solution (level 5) is not one request away.
    const prior = (this.db.prepare("SELECT COUNT(*) c FROM mentor_feedbacks WHERE session_id = ? AND sender = 'USER'").get(session.id) as any).c as number;
    const hintLevel = Math.min(5, prior + 1, Math.max(1, req.hintLevel || 1));

    // 2. Record User Message
    this.db.prepare(`
      INSERT INTO mentor_feedbacks (id, session_id, user_id, message, sender, hint_level, code_snippet)
      VALUES (?, ?, ?, ?, 'USER', ?, ?)
    `).run(uuidv4(), session.id, req.userId, req.message, hintLevel, req.codeSnippet || null);

    // 3. Generate Mentor Response (Gemini API or Cognitive Engine Fallback)
    const mentorResponse = await this.generateResponse({
      userName: user?.name || 'Cadet',
      userHandle: user?.handle || 'dev',
      userMessage: req.message,
      codeSnippet: req.codeSnippet,
      hintLevel,
      fragileSkills,
      masteredSkills,
      lessonContext,
      exerciseContext,
      solutionCode
    });

    // 4. Record Mentor Response
    const feedbackId = uuidv4();
    this.db.prepare(`
      INSERT INTO mentor_feedbacks (id, session_id, user_id, message, sender, hint_level, code_snippet, analysis_json)
      VALUES (?, ?, ?, ?, 'MENTOR_AI', ?, ?, ?)
    `).run(
      feedbackId,
      session.id,
      req.userId,
      mentorResponse.message,
      hintLevel,
      mentorResponse.suggestedCode || null,
      JSON.stringify(mentorResponse.analysis || {})
    );

    // 5. Update session timestamp
    this.db.prepare('UPDATE mentor_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(session.id);

    return {
      id: feedbackId,
      sessionId: session.id,
      message: mentorResponse.message,
      sender: 'MENTOR_AI',
      hintLevel,
      suggestedCode: mentorResponse.suggestedCode,
      analysis: mentorResponse.analysis,
      timestamp: new Date().toISOString()
    };
  }

  private async generateResponse(ctx: {
    userName: string;
    userHandle: string;
    userMessage: string;
    codeSnippet?: string;
    hintLevel: number;
    fragileSkills: string[];
    masteredSkills: string[];
    lessonContext: string;
    exerciseContext: string;
    solutionCode: string;
  }): Promise<{ message: string; suggestedCode?: string; analysis?: any }> {
    const systemPrompt = `You are the DEVELOPER_OS_AI_MENTOR, an elite principal software architect assisting a developer in a terminal-like environment.
Your tone is concise, precise, technical, encouraging yet rigorous.
CRITICAL PEDAGOGICAL RULE: Progressive Scaffolding Level = ${ctx.hintLevel}/5.
Level 1: Ask a guiding Socratic question that makes the student think.
Level 2: Provide a conceptual clue about the pattern/algorithm.
Level 3: Point directly to the location or line causing the difficulty without writing the code.
Level 4: Provide a detailed breakdown of how to solve it step-by-step.
Level 5: Provide the fully commented production-grade solution.

Do NOT reveal the direct code solution unless hintLevel is 5.
Student Info: ${ctx.userName} (@${ctx.userHandle}).
Fragile Skills: ${ctx.fragileSkills.join(', ') || 'None'}.
Mastered: ${ctx.masteredSkills.join(', ') || 'None'}.
Current Context: ${ctx.lessonContext}. ${ctx.exerciseContext}.`;

    const userPrompt = `User Question: "${ctx.userMessage}"\n${ctx.codeSnippet ? `Student's current code:\n\`\`\`javascript\n${ctx.codeSnippet}\n\`\`\`` : ''}`;

    // 1. LiteLLM Virtual Key Gateway (Primary Provider)
    if (config.litellmApiKey && config.litellmBaseUrl) {
      try {
        const litellmEndpoint = config.litellmBaseUrl.endsWith('/chat/completions') 
          ? config.litellmBaseUrl 
          : `${config.litellmBaseUrl.replace(/\/$/, '')}/chat/completions`;

        const response = await fetch(litellmEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.litellmApiKey}`
          },
          body: JSON.stringify({
            model: config.litellmModel || 'Gemini Auto Key',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1024
          })
        });

        if (response.ok) {
          const data: any = await response.json();
          const replyText = data.choices?.[0]?.message?.content;
          if (replyText) {
            return {
              message: replyText,
              analysis: { provider: 'LITELLM_VIRTUAL_GATEWAY', model: config.litellmModel, scaffoldingLevel: ctx.hintLevel }
            };
          }
        }
      } catch (err) {
        console.warn('LiteLLM Gateway call failed, falling back to direct Gemini API:', err);
      }
    }

    // 2. Direct Gemini API (Secondary Fallback)
    if (config.geminiApiKey) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: [{
              parts: [{ text: userPrompt }]
            }]
          })
        });

        if (response.ok) {
          const data: any = await response.json();
          const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            return {
              message: replyText,
              analysis: { provider: 'DIRECT_GEMINI_AI', model: config.geminiModel, scaffoldingLevel: ctx.hintLevel }
            };
          }
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to Cognitive Engine:', err);
      }
    }

    // 3. Cognitive Heuristic Scaffolding Fallback Engine
    return this.generateCognitiveFallback(ctx);
  }

  private generateCognitiveFallback(ctx: {
    userName: string;
    userMessage: string;
    codeSnippet?: string;
    hintLevel: number;
    fragileSkills: string[];
    lessonContext: string;
    exerciseContext: string;
    solutionCode: string;
  }) {
    const level = ctx.hintLevel;
    let message = '';
    let suggestedCode: string | undefined = undefined;

    if (level === 1) {
      message = `MENTOR_AI > Olá, ${ctx.userName}. Vamos analisar a arquitetura do problema.\n\n[NÍVEL 1: PERGUNTA ORIENTADORA]\nO que acontece com os dados na entrada da sua função antes da primeira transformação? Quais são os tipos de dados esperados e que condição de parada você definiu?`;
    } else if (level === 2) {
      message = `MENTOR_AI > [NÍVEL 2: PISTA CONCEITUAL]\nLembre-se da separação de responsabilidades: primeiro valide se a entrada é válida (defensive programming). Em seguida, aplique a iteração necessária mantendo o estado imutável ou acumulando os resultados intermediários.`;
    } else if (level === 3) {
      message = `MENTOR_AI > [NÍVEL 3: INDICAÇÃO DO PROBLEMA]\nVerifique o retorno da sua função e a manipulação do array ou objeto. O teste falhou provavelmente porque o resultado esperado difere em tipo ou na condição de contorno (edge case com valores vazios/nulos).`;
    } else if (level === 4) {
      message = `MENTOR_AI > [NÍVEL 4: EXPLICAÇÃO DETALHADA]\nPasso a passo recomendado:\n1. Declare a variável de saída ou estrutura de controle.\n2. Itere sobre os itens ou teste a expressão booleana.\n3. Aplique a verificação estrita (\`===\`).\n4. Retorne o objeto estruturado conforme especificado no contrato do exercício.`;
    } else {
      message = `MENTOR_AI > [NÍVEL 5: SOLUÇÃO COMENTADA]\nAqui está a implementação de referência para análise e comparação. Observe cada comentário técnico sobre as decisões tomadas:`;
      suggestedCode = ctx.solutionCode || `// Solução de referência padrão\nfunction solution() {\n  // Implementação correta com tratamento de erros\n  return true;\n}`;
    }

    return {
      message,
      suggestedCode,
      analysis: {
        provider: 'COGNITIVE_SCAFFOLDING_ENGINE',
        level,
        autonomyImpact: level * 5,
        skillEvaluated: ctx.fragileSkills[0] || 'DEV_CORE'
      }
    };
  }
}

export const mentorService = new MentorService();
