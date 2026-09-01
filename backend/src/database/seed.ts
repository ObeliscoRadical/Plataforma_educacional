import bcrypt from 'bcryptjs';
import { getDb } from './db.js';
import { skillsSeedData } from './seeds/skills.js';
import { curriculumSeedData } from './seeds/curriculum.js';
import { v4 as uuidv4 } from 'uuid';

export async function runSeed() {
  console.log('⚡ [DEVELOPER OS] Starting database seeding process...');
  const db = getDb();

  // Run in a single transaction for atomicity and high performance
  const seedTransaction = db.transaction(() => {
    // 1. Admin Settings
    const insertSetting = db.prepare(`
      INSERT OR REPLACE INTO admin_settings (key, value, description)
      VALUES (?, ?, ?)
    `);

    insertSetting.run('knowledge_weight', '0.15', 'Peso do conhecimento teórico na nota de competência');
    insertSetting.run('implementation_weight', '0.30', 'Peso da implementação prática de código');
    insertSetting.run('problem_solving_weight', '0.25', 'Peso de resolução de problemas algorítmicos');
    insertSetting.run('debugging_weight', '0.20', 'Peso de capacidade de debugging e diagnóstico');
    insertSetting.run('autonomy_weight', '0.10', 'Peso da autonomia e menor dependência de dicas do Mentor');
    insertSetting.run('mastery_threshold', '75.0', 'Percentual mínimo para atingir status MASTERED');
    insertSetting.run('platform_version', '1.0.0-PRO', 'Versão do kernel do Developer OS');

    // 2. Default Users
    const insertUser = db.prepare(`
      INSERT OR REPLACE INTO users (id, email, password_hash, name, handle, role, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const adminHash = bcrypt.hashSync('admin123', 10);
    const studentHash = bcrypt.hashSync('student123', 10);
    const mentorHash = bcrypt.hashSync('mentor123', 10);

    const adminId = 'user_admin_001';
    const studentId = 'user_student_001';
    const mentorId = 'user_mentor_001';

    insertUser.run(adminId, 'admin@devos.academy', adminHash, 'Lead Architect Admin', 'root_admin', 'ADMIN', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin');
    insertUser.run(studentId, 'student@devos.academy', studentHash, 'Cadet Developer', 'developer_cadet', 'STUDENT', 'https://api.dicebear.com/7.x/bottts/svg?seed=student');
    insertUser.run(mentorId, 'mentor@devos.academy', mentorHash, 'AI Mentor Process', 'mentor_daemon', 'MENTOR', 'https://api.dicebear.com/7.x/bottts/svg?seed=mentor');

    // 3. Skills
    const insertSkill = db.prepare(`
      INSERT OR REPLACE INTO skills (id, code, name, category, description, icon)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const skill of skillsSeedData) {
      insertSkill.run(skill.id, skill.code, skill.name, skill.category, skill.description, skill.icon);
      
      // Initialize Student Skill record for default student
      db.prepare(`
        INSERT OR IGNORE INTO student_skills (
          id, user_id, skill_id, status, knowledge_score, implementation_score,
          problem_solving_score, debugging_score, autonomy_score, composite_score
        ) VALUES (?, ?, ?, 'NOT_LEARNED', 0, 0, 0, 0, 100, 0)
      `).run(uuidv4(), studentId, skill.id);
    }

    // 4. Master Course
    const courseId = 'course_devos_fullstack';
    db.prepare(`
      INSERT OR REPLACE INTO courses (id, title, slug, description, level, is_published)
      VALUES (?, ?, ?, ?, ?, 1)
    `).run(
      courseId,
      'Developer OS: Formação Integral de Software Engineer',
      'developer-os-formacao-integral',
      'Do zero absoluto à arquitetura full-stack avançada com IA, PWA, DevOps e Exame de Mestria.',
      'ZERO_TO_PRO'
    );

    // 5. Modules, Lessons, Exercises, Quizzes, Challenges, Projects
    const insertModule = db.prepare(`
      INSERT OR REPLACE INTO modules (id, course_id, order_index, code, title, slug, summary, icon, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertLesson = db.prepare(`
      INSERT OR REPLACE INTO lessons (id, module_id, order_index, code, title, slug, duration_min, difficulty, is_checkpoint)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertLessonContent = db.prepare(`
      INSERT OR REPLACE INTO lesson_contents (id, lesson_id, objective, prerequisites, competences, content_markdown, guided_practice_markdown, expected_output, commented_solution, resources)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertVideoLesson = db.prepare(`
      INSERT OR REPLACE INTO video_lessons (id, lesson_id, title, duration_seconds, video_url, thumbnail_url, transcript_json, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertExercise = db.prepare(`
      INSERT OR REPLACE INTO exercises (id, lesson_id, title, description, initial_code, solution_code, test_cases_json, difficulty, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertChallenge = db.prepare(`
      INSERT OR REPLACE INTO challenges (id, module_id, title, prompt, starter_files_json, verification_criteria_json, xp_reward)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertQuiz = db.prepare(`
      INSERT OR REPLACE INTO quizzes (id, lesson_id, title, passing_score, is_adaptive)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertQuestion = db.prepare(`
      INSERT OR REPLACE INTO questions (id, quiz_id, prompt, explanation, difficulty_level, weight)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertAnswer = db.prepare(`
      INSERT OR REPLACE INTO answers (id, question_id, text, is_correct, explanation)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertProject = db.prepare(`
      INSERT OR REPLACE INTO projects (id, module_id, title, slug, tier, rubric_json, template_repo_url, required_skills)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertProgress = db.prepare(`
      INSERT OR IGNORE INTO student_progress (id, user_id, module_id, lesson_id, status, video_watched, exercise_completed, quiz_passed)
      VALUES (?, ?, ?, ?, ?, 0, 0, 0)
    `);

    for (const mod of curriculumSeedData) {
      const moduleId = `mod_${mod.code.toLowerCase()}`;
      const moduleStatus = mod.orderIndex === 0 ? 'AVAILABLE' : 'LOCKED';
      
      insertModule.run(moduleId, courseId, mod.orderIndex, mod.code, mod.title, mod.slug, mod.summary, mod.icon, moduleStatus);

      for (const lesson of mod.lessons) {
        const lessonId = `lesson_${lesson.code.replace('.', '_')}`;
        insertLesson.run(lessonId, moduleId, lesson.orderIndex, lesson.code, lesson.title, lesson.slug, lesson.durationMin, lesson.difficulty, lesson.isCheckpoint);

        insertLessonContent.run(
          uuidv4(),
          lessonId,
          lesson.objective,
          JSON.stringify(lesson.prerequisites),
          JSON.stringify(lesson.competences),
          lesson.contentMarkdown,
          lesson.guidedPracticeMarkdown,
          lesson.expectedOutput,
          lesson.commentedSolution,
          JSON.stringify(lesson.resources)
        );

        insertVideoLesson.run(
          uuidv4(),
          lessonId,
          lesson.videoTitle,
          lesson.durationMin * 60,
          `https://stream.devos.academy/videos/${lesson.slug}.mp4`,
          `https://stream.devos.academy/thumbnails/${lesson.slug}.jpg`,
          JSON.stringify([
            { scene: 1, title: 'Introdução & Problema', narration: `Bem-vindo à aula de ${lesson.title}. Vamos entender como dominar este conceito fundamental.` },
            { scene: 2, title: 'Demonstração de Código', narration: 'Observe a estrutura de execução no terminal e no editor.' },
            { scene: 3, title: 'Prática Guiada e Desafio', narration: 'Agora é a sua vez de executar no Code Lab e provar seu domínio.' }
          ]),
          'APPROVED'
        );

        if (lesson.exercise) {
          insertExercise.run(
            uuidv4(),
            lessonId,
            lesson.exercise.title,
            lesson.exercise.description,
            lesson.exercise.initialCode,
            lesson.exercise.solutionCode,
            JSON.stringify(lesson.exercise.testCases),
            lesson.exercise.difficulty,
            1
          );
        }

        if (lesson.quiz) {
          const quizId = uuidv4();
          insertQuiz.run(quizId, lessonId, lesson.quiz.title, lesson.quiz.passingScore, 1);
          for (const q of lesson.quiz.questions) {
            const questionId = uuidv4();
            insertQuestion.run(questionId, quizId, q.prompt, q.explanation, q.difficultyLevel, 1.0);
            for (const ans of q.answers) {
              insertAnswer.run(uuidv4(), questionId, ans.text, ans.isCorrect ? 1 : 0, ans.explanation);
            }
          }
        }

        // Initialize progress for default student
        const initialStatus = mod.orderIndex === 0 && lesson.orderIndex === 1 ? 'AVAILABLE' : 'LOCKED';
        insertProgress.run(uuidv4(), studentId, moduleId, lessonId, initialStatus);
      }

      if (mod.challenge) {
        insertChallenge.run(
          uuidv4(),
          moduleId,
          mod.challenge.title,
          mod.challenge.prompt,
          JSON.stringify(mod.challenge.starterFiles),
          JSON.stringify(mod.challenge.verificationCriteria),
          mod.challenge.xpReward
        );
      }

      if (mod.project) {
        insertProject.run(
          uuidv4(),
          moduleId,
          mod.project.title,
          mod.project.slug,
          mod.project.tier,
          JSON.stringify(mod.project.rubric),
          mod.project.templateRepoUrl,
          JSON.stringify(mod.project.requiredSkills)
        );
      }
    }
  });

  seedTransaction();
  console.log('✅ [DEVELOPER OS] Seeding successfully completed! 24 modules, skills, users and settings initialized.');
}

// Auto-run if executed directly
if (process.argv[1] && (process.argv[1].endsWith('seed.ts') || process.argv[1].endsWith('seed.js') || process.argv[1].includes('seed'))) {
  runSeed().catch((err) => {
    console.error('❌ [DEVELOPER OS] Seed error:', err);
    process.exit(1);
  });
}
