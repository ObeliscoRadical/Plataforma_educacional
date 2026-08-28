import { getDb } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';
import { skillService } from './skill.service.js';

export class ProgressService {
  private get db() { return getDb(); }

  getProgressForLesson(userId: string, lessonId: string) {
    let progress = this.db.prepare(`
      SELECT * FROM student_progress WHERE user_id = ? AND lesson_id = ?
    `).get(userId, lessonId) as any;

    if (!progress) {
      const lesson = this.db.prepare('SELECT module_id FROM lessons WHERE id = ?').get(lessonId) as any;
      if (lesson) {
        const id = uuidv4();
        this.db.prepare(`
          INSERT INTO student_progress (id, user_id, module_id, lesson_id, status, video_watched, exercise_completed, quiz_passed)
          VALUES (?, ?, ?, ?, 'AVAILABLE', 0, 0, 0)
        `).run(id, userId, lesson.module_id, lessonId);

        progress = {
          id,
          user_id: userId,
          module_id: lesson.module_id,
          lesson_id: lessonId,
          status: 'AVAILABLE',
          video_watched: 0,
          exercise_completed: 0,
          quiz_passed: 0
        };
      }
    }
    return progress;
  }

  recordEvent(userId: string, eventType: string, payload: any = {}) {
    const id = uuidv4();
    this.db.prepare(`
      INSERT INTO learning_events (id, user_id, event_type, payload_json)
      VALUES (?, ?, ?, ?)
    `).run(id, userId, eventType, JSON.stringify(payload));
  }

  startLesson(userId: string, lessonId: string) {
    const progress = this.getProgressForLesson(userId, lessonId);
    if (progress && progress.status === 'AVAILABLE') {
      this.db.prepare(`
        UPDATE student_progress
        SET status = 'IN_PROGRESS', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(progress.id);
    }
    this.recordEvent(userId, 'lesson_started', { lessonId });
    return { status: 'IN_PROGRESS' };
  }

  markVideoWatched(userId: string, lessonId: string) {
    const progress = this.getProgressForLesson(userId, lessonId);
    if (progress) {
      this.db.prepare(`
        UPDATE student_progress
        SET video_watched = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(progress.id);
    }
    this.recordEvent(userId, 'video_completed', { lessonId });

    // CRITICAL: Watching the video does NOT complete the lesson!
    // The student must complete the practical exercise / quiz to demonstrate mastery.
    return {
      videoWatched: true,
      lessonCompleted: false,
      message: 'Video watched acknowledged. Now proceed to Code Lab practice to demonstrate mastery.'
    };
  }

  submitExerciseAttempt(
    userId: string,
    lessonId: string,
    exerciseId: string,
    attemptData: {
      passed: boolean;
      score: number;
      code: string;
      hintsUsed: number;
      maxHintLevel: number;
      executionOutput: string;
    }
  ) {
    const status = attemptData.passed 
      ? (attemptData.maxHintLevel > 2 ? 'ASSISTED' : 'PASSED')
      : 'FAILED';

    // 1. Record Attempt
    this.db.prepare(`
      INSERT INTO attempts (id, user_id, exercise_id, code_submitted, score, status, hints_used_count, max_hint_level, execution_output)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      uuidv4(),
      userId,
      exerciseId,
      attemptData.code,
      attemptData.score,
      status,
      attemptData.hintsUsed,
      attemptData.maxHintLevel,
      attemptData.executionOutput
    );

    // 2. Fetch associated skills of this lesson
    const content = this.db.prepare('SELECT competences FROM lesson_contents WHERE lesson_id = ?').get(lessonId) as any;
    const competences: string[] = content ? JSON.parse(content.competences || '[]') : [];

    // 3. Update Skill Scores
    for (const comp of competences) {
      skillService.updateSkillMetric(userId, comp, {
        implementation: attemptData.passed ? 85 : 40,
        problemSolving: attemptData.passed ? 80 : 35,
        autonomyPenalty: attemptData.maxHintLevel * 5 // degrades if heavy hints used
      });
    }

    // 4. Update Progress if passed
    if (attemptData.passed) {
      const progress = this.getProgressForLesson(userId, lessonId);
      this.db.prepare(`
        UPDATE student_progress
        SET exercise_completed = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(progress.id);

      return this.evaluateLessonCompletion(userId, lessonId);
    }

    this.recordEvent(userId, 'exercise_submitted', { lessonId, exerciseId, passed: false });
    return {
      passed: false,
      lessonCompleted: false,
      message: 'Exercise test cases failed. Consult AI Mentor for guided hints and try again.'
    };
  }

  submitQuiz(userId: string, lessonId: string, quizId: string, answers: Record<string, string>) {
    const quiz = this.db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quizId) as any;
    if (!quiz) throw new Error('QUIZ_NOT_FOUND');

    const questions = this.db.prepare('SELECT id FROM questions WHERE quiz_id = ?').all(quizId) as any[];
    let correctCount = 0;

    for (const q of questions) {
      const chosenAnswerId = answers[q.id];
      if (chosenAnswerId) {
        const ans = this.db.prepare('SELECT is_correct FROM answers WHERE id = ? AND question_id = ?').get(chosenAnswerId, q.id) as any;
        if (ans && ans.is_correct) {
          correctCount++;
        }
      }
    }

    const total = questions.length;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 100;
    const passed = score >= (quiz.passing_score || 75);

    // Update Knowledge score for associated skills
    const content = this.db.prepare('SELECT competences FROM lesson_contents WHERE lesson_id = ?').get(lessonId) as any;
    const competences: string[] = content ? JSON.parse(content.competences || '[]') : [];
    for (const comp of competences) {
      skillService.updateSkillMetric(userId, comp, {
        knowledge: score
      });
    }

    if (passed) {
      const progress = this.getProgressForLesson(userId, lessonId);
      this.db.prepare(`
        UPDATE student_progress
        SET quiz_passed = 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(progress.id);

      this.recordEvent(userId, 'quiz_completed', { lessonId, quizId, score, passed: true });
      return this.evaluateLessonCompletion(userId, lessonId);
    }

    this.recordEvent(userId, 'quiz_completed', { lessonId, quizId, score, passed: false });
    return {
      score,
      passed: false,
      lessonCompleted: false,
      message: `Quiz score (${score}%) below passing threshold (${quiz.passing_score}%). Review lesson material.`
    };
  }

  evaluateLessonCompletion(userId: string, lessonId: string) {
    const progress = this.getProgressForLesson(userId, lessonId);
    const exercise = this.db.prepare('SELECT id FROM exercises WHERE lesson_id = ?').get(lessonId);
    const quiz = this.db.prepare('SELECT id FROM quizzes WHERE lesson_id = ?').get(lessonId);

    const exerciseRequired = !!exercise;
    const quizRequired = !!quiz;

    const isExerciseDone = !exerciseRequired || progress.exercise_completed === 1;
    const isQuizDone = !quizRequired || progress.quiz_passed === 1;

    if (isExerciseDone && isQuizDone) {
      this.db.prepare(`
        UPDATE student_progress
        SET status = 'COMPLETED', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(progress.id);

      // Unlock next lesson or next module
      this.unlockNextItem(userId, lessonId);

      this.recordEvent(userId, 'lesson_completed', { lessonId });

      return {
        passed: true,
        lessonCompleted: true,
        message: '✓ Lesson MASTERED and COMPLETED! Next mission node unlocked in curriculum tree.'
      };
    }

    return {
      passed: true,
      lessonCompleted: false,
      message: 'Step accomplished! Complete the remaining exercise or quiz to finalize lesson mastery.'
    };
  }

  private unlockNextItem(userId: string, currentLessonId: string) {
    const currentLesson = this.db.prepare(`
      SELECT l.*, m.order_index as module_order 
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      WHERE l.id = ?
    `).get(currentLessonId) as any;

    if (!currentLesson) return;

    // Check for next lesson in same module
    const nextLessonInMod = this.db.prepare(`
      SELECT id, module_id FROM lessons 
      WHERE module_id = ? AND order_index > ? 
      ORDER BY order_index ASC 
      LIMIT 1
    `).get(currentLesson.module_id, currentLesson.order_index) as any;

    if (nextLessonInMod) {
      this.db.prepare(`
        INSERT INTO student_progress (id, user_id, module_id, lesson_id, status)
        VALUES (?, ?, ?, ?, 'AVAILABLE')
        ON CONFLICT(user_id, lesson_id) DO UPDATE SET status = CASE WHEN status = 'LOCKED' THEN 'AVAILABLE' ELSE status END
      `).run(uuidv4(), userId, nextLessonInMod.module_id, nextLessonInMod.id);
    } else {
      // All lessons in this module done! Unlock next module's first lesson
      const nextModule = this.db.prepare(`
        SELECT id FROM modules 
        WHERE order_index > ? 
        ORDER BY order_index ASC 
        LIMIT 1
      `).get(currentLesson.module_order) as any;

      if (nextModule) {
        const firstLessonInNextMod = this.db.prepare(`
          SELECT id FROM lessons WHERE module_id = ? ORDER BY order_index ASC LIMIT 1
        `).get(nextModule.id) as any;

        if (firstLessonInNextMod) {
          this.db.prepare(`
            INSERT INTO student_progress (id, user_id, module_id, lesson_id, status)
            VALUES (?, ?, ?, ?, 'AVAILABLE')
            ON CONFLICT(user_id, lesson_id) DO UPDATE SET status = CASE WHEN status = 'LOCKED' THEN 'AVAILABLE' ELSE status END
          `).run(uuidv4(), userId, nextModule.id, firstLessonInNextMod.id);
        }
      }
      this.recordEvent(userId, 'module_completed', { moduleId: currentLesson.module_id });
    }
  }
}

export const progressService = new ProgressService();
