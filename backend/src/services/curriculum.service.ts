import { getDb } from '../database/db.js';

export class CurriculumService {
  private get db() { return getDb(); }

  getCourses() {
    return this.db.prepare('SELECT * FROM courses WHERE is_published = 1').all();
  }

  getModulesWithProgress(userId: string) {
    const modules = this.db.prepare(`
      SELECT m.*, 
        COUNT(l.id) as total_lessons,
        SUM(CASE WHEN sp.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_lessons
      FROM modules m
      LEFT JOIN lessons l ON l.module_id = m.id
      LEFT JOIN student_progress sp ON sp.lesson_id = l.id AND sp.user_id = ?
      GROUP BY m.id
      ORDER BY m.order_index ASC
    `).all(userId) as any[];

    return modules.map(m => {
      // Determine overall module status
      let calculatedStatus = 'LOCKED';
      if (m.order_index === 0) {
        calculatedStatus = m.completed_lessons >= m.total_lessons && m.total_lessons > 0 ? 'COMPLETED' : 'AVAILABLE';
      } else {
        // Check if previous module was completed
        const prevModule = modules.find(pm => pm.order_index === m.order_index - 1);
        if (prevModule && prevModule.completed_lessons >= prevModule.total_lessons && prevModule.total_lessons > 0) {
          calculatedStatus = m.completed_lessons >= m.total_lessons && m.total_lessons > 0 ? 'COMPLETED' : 'AVAILABLE';
        }
      }

      return {
        ...m,
        status: calculatedStatus,
        progressPercent: m.total_lessons > 0 ? Math.round((m.completed_lessons / m.total_lessons) * 100) : 0
      };
    });
  }

  getModuleDetails(moduleId: string, userId: string) {
    const module = this.db.prepare('SELECT * FROM modules WHERE id = ? OR code = ? OR slug = ?').get(moduleId, moduleId, moduleId) as any;
    if (!module) return null;

    const lessons = this.db.prepare(`
      SELECT l.*, 
        COALESCE(sp.status, 'LOCKED') as progress_status,
        COALESCE(sp.video_watched, 0) as video_watched,
        COALESCE(sp.exercise_completed, 0) as exercise_completed,
        COALESCE(sp.quiz_passed, 0) as quiz_passed
      FROM lessons l
      LEFT JOIN student_progress sp ON sp.lesson_id = l.id AND sp.user_id = ?
      WHERE l.module_id = ?
      ORDER BY l.order_index ASC
    `).all(userId, module.id);

    const challenge = this.db.prepare('SELECT * FROM challenges WHERE module_id = ?').get(module.id) as any;
    const project = this.db.prepare('SELECT * FROM projects WHERE module_id = ?').get(module.id) as any;

    return {
      ...module,
      lessons,
      challenge: challenge ? {
        ...challenge,
        starterFiles: JSON.parse(challenge.starter_files_json || '{}'),
        verificationCriteria: JSON.parse(challenge.verification_criteria_json || '[]')
      } : null,
      project: project ? {
        ...project,
        rubric: JSON.parse(project.rubric_json || '[]'),
        requiredSkills: JSON.parse(project.required_skills || '[]')
      } : null
    };
  }

  getLessonDetails(lessonId: string, userId: string) {
    const lesson = this.db.prepare(`
      SELECT l.*, m.code as module_code, m.title as module_title, m.order_index as module_order
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      WHERE l.id = ? OR l.code = ? OR l.slug = ?
    `).get(lessonId, lessonId, lessonId) as any;

    if (!lesson) return null;

    const content = this.db.prepare('SELECT * FROM lesson_contents WHERE lesson_id = ?').get(lesson.id) as any;
    const video = this.db.prepare('SELECT * FROM video_lessons WHERE lesson_id = ?').get(lesson.id) as any;
    const exercise = this.db.prepare('SELECT * FROM exercises WHERE lesson_id = ?').get(lesson.id) as any;
    const quiz = this.db.prepare('SELECT * FROM quizzes WHERE lesson_id = ?').get(lesson.id) as any;

    let quizWithQuestions = null;
    if (quiz) {
      const questions = this.db.prepare('SELECT * FROM questions WHERE quiz_id = ?').all(quiz.id) as any[];
      const questionsWithAnswers = questions.map(q => {
        const answers = this.db.prepare('SELECT id, text, explanation, is_correct FROM answers WHERE question_id = ?').all(q.id);
        return {
          ...q,
          answers
        };
      });
      quizWithQuestions = {
        ...quiz,
        questions: questionsWithAnswers
      };
    }

    const progress = this.db.prepare(`
      SELECT * FROM student_progress WHERE user_id = ? AND lesson_id = ?
    `).get(userId, lesson.id) as any;

    return {
      ...lesson,
      content: content ? {
        ...content,
        prerequisites: JSON.parse(content.prerequisites || '[]'),
        competences: JSON.parse(content.competences || '[]'),
        resources: JSON.parse(content.resources || '[]')
      } : null,
      video: video ? {
        ...video,
        transcript: JSON.parse(video.transcript_json || '[]')
      } : null,
      exercise: exercise ? {
        ...exercise,
        testCases: JSON.parse(exercise.test_cases_json || '[]')
      } : null,
      quiz: quizWithQuestions,
      progress: progress || {
        status: 'AVAILABLE',
        video_watched: 0,
        exercise_completed: 0,
        quiz_passed: 0
      }
    };
  }
}

export const curriculumService = new CurriculumService();
