import { Router, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { curriculumService } from '../services/curriculum.service.js';
import { progressService } from '../services/progress.service.js';
import { skillService } from '../services/skill.service.js';
import { mentorService } from '../services/mentor.service.js';
import { sandboxService } from '../services/sandbox.service.js';
import { adaptiveService } from '../services/adaptive.service.js';
import { projectService } from '../services/project.service.js';
import { videoEngineService } from '../services/video-engine/video.service.js';
import { examService } from '../services/exam.service.js';
import { analyticsService } from '../services/analytics.service.js';
import { adminService } from '../services/admin.service.js';
import { freeNeuralTts } from '../services/tts.service.js';
import { stripeService } from '../services/stripe.service.js';
import { authMiddleware, AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { requireRoles } from '../middlewares/rbac.middleware.js';

export const apiRouter = Router();

const getIdParam = (param: any): string => (Array.isArray(param) ? param[0] : String(param));

// Helper to extract or fallback to default student user ID
const getUserId = (req: AuthenticatedRequest): string => {
  return req.user?.id || 'user_student_001';
};

// Optional auth middleware (identifies user if token is present, defaults to student if absent)
const optionalAuthMiddleware = (req: AuthenticatedRequest, _res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = authService.verifyToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
};

// ==================== SYSTEM STATUS & BOOT ====================
apiRouter.get('/system/status', (_req, res) => {
  res.json({
    status: 'ONLINE',
    kernel: 'Developer OS v1.0.0-PRO',
    uptime: process.uptime(),
    subsystems: {
      mentorAI: 'READY',
      codeLabSandbox: 'READY',
      learningEngine: 'ONLINE',
      curriculumModules: 24,
      videoPipelineEngine: 'ONLINE',
      voiceTTS: 'Free Neural Voice Engine (pt-BR Voz Grossa 100% Free)',
      stripePaymentGateway: 'READY (R$ 9,90/mês)',
      pwaServiceWorker: 'ACTIVE'
    }
  });
});

// ==================== STRIPE / SUBSCRIPTION ====================
apiRouter.get('/user/subscription', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const subscription = stripeService.getUserSubscription(userId);
  res.json({ subscription });
});

apiRouter.post('/stripe/create-checkout-session', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = getUserId(req);
    const { returnUrl } = req.body;
    const session = await stripeService.createCheckoutSession(userId, returnUrl);
    res.json(session);
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/stripe/verify-session', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user?.id;
    if (!sessionId) {
      res.status(400).json({ error: 'SESSION_ID_REQUIRED' });
      return;
    }
    const result = await stripeService.verifySession(sessionId, userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/stripe/mock-activate', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = getUserId(req);
    const result = await stripeService.mockActivate(userId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ==================== TTS / VOICE SYNTHESIS ====================
apiRouter.post('/tts/synthesize', optionalAuthMiddleware, async (req, res) => {
  try {
    const { text, voice, pitch } = req.body;
    if (!text) {
      res.status(400).json({ error: 'TEXT_REQUIRED' });
      return;
    }

    const audioResult = await freeNeuralTts.generateSpeech(text, voice || 'pt-BR-AntonioNeural', pitch || '-8Hz');
    if (audioResult.audioUrl) {
      res.json({
        success: true,
        audioUrl: audioResult.audioUrl,
        durationSeconds: audioResult.durationSeconds,
        provider: audioResult.provider
      });
    } else {
      res.json({
        success: false,
        fallback: true,
        provider: 'BROWSER_SPEECH',
        message: 'Using browser speech synthesis'
      });
    }
  } catch (err: any) {
    res.json({
      success: false,
      fallback: true,
      provider: 'BROWSER_SPEECH',
      error: err.message
    });
  }
});

// ==================== AUTH ====================
apiRouter.post('/auth/register', async (req, res, next) => {
  try {
    const { email, password, name, handle } = req.body;
    if (!email || !password || !name || !handle) {
      res.status(400).json({ error: 'MISSING_FIELDS', message: 'Email, senha, nome e @handle são obrigatórios.' });
      return;
    }
    const result = await authService.register({ email, password, name, handle });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/auth/login', async (req, res, next) => {
  try {
    const { emailOrHandle, password } = req.body;
    if (!emailOrHandle || !password) {
      res.status(400).json({ error: 'MISSING_CREDENTIALS' });
      return;
    }
    const result = await authService.login(emailOrHandle, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Quick guest / auto-boot token generator
apiRouter.post('/auth/guest-boot', async (_req, res) => {
  const result = await authService.login('student@devos.academy', 'student123');
  res.json(result);
});

apiRouter.get('/auth/me', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const user = authService.getUserById(userId);
  res.json({ user });
});

// ==================== CURRICULUM ====================
apiRouter.get('/curriculum/courses', (_req, res) => {
  res.json({ courses: curriculumService.getCourses() });
});

apiRouter.get('/curriculum/modules', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const modules = curriculumService.getModulesWithProgress(getUserId(req));
  res.json({ modules });
});

apiRouter.get('/curriculum/modules/:id', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const module = curriculumService.getModuleDetails(getIdParam(req.params.id), getUserId(req));
  if (!module) {
    res.status(404).json({ error: 'MODULE_NOT_FOUND' });
    return;
  }
  res.json({ module });
});

apiRouter.get('/curriculum/lessons/:id', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const lesson = curriculumService.getLessonDetails(getIdParam(req.params.id), getUserId(req));
  if (!lesson) {
    res.status(404).json({ error: 'LESSON_NOT_FOUND' });
    return;
  }
  res.json({ lesson });
});

// ==================== PROGRESSION ====================
apiRouter.post('/progress/lesson/:id/start', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const result = progressService.startLesson(getUserId(req), getIdParam(req.params.id));
  res.json(result);
});

apiRouter.post('/progress/lesson/:id/video-watched', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const result = progressService.markVideoWatched(getUserId(req), getIdParam(req.params.id));
  res.json(result);
});

apiRouter.post('/progress/lesson/:id/exercise', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { exerciseId, code, hintsUsed, maxHintLevel, testCases } = req.body;
    const lessonId = getIdParam(req.params.id);
    const userId = getUserId(req);
    
    // Run sandbox tests
    const execResult = await sandboxService.runCodeWithTests(code, testCases || []);
    
    const score = execResult.totalCount > 0 
      ? Math.round((execResult.passedCount / execResult.totalCount) * 100)
      : (execResult.success ? 100 : 0);

    const progressResult = progressService.submitExerciseAttempt(
      userId,
      lessonId,
      exerciseId,
      {
        passed: execResult.success,
        score,
        code,
        hintsUsed: hintsUsed || 0,
        maxHintLevel: maxHintLevel || 0,
        executionOutput: execResult.output
      }
    );

    // If student struggled, check for remedial microaulas
    if (!execResult.success || (maxHintLevel && maxHintLevel >= 3)) {
      await adaptiveService.checkAndGenerateRemedials(userId, lessonId);
    }

    res.json({
      execution: execResult,
      progress: progressResult
    });
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/progress/lesson/:id/quiz', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { quizId, answers } = req.body;
  const result = progressService.submitQuiz(getUserId(req), getIdParam(req.params.id), quizId, answers || {});
  res.json(result);
});

// ==================== SKILLS ====================
apiRouter.get('/skills', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const skills = skillService.getStudentSkills(getUserId(req));
  const weights = skillService.getWeights();
  res.json({ skills, weights });
});

// ==================== CODE LAB SANDBOX ====================
apiRouter.post('/sandbox/run', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { code, testCases } = req.body;
    const result = await sandboxService.runCodeWithTests(code, testCases || []);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ==================== AI MENTOR ====================
apiRouter.get('/mentor/history', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const lessonId = req.query.lessonId ? String(req.query.lessonId) : undefined;
  const history = await mentorService.getSessionHistory(getUserId(req), lessonId);
  res.json(history);
});

apiRouter.post('/mentor/chat', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { message, lessonId, codeSnippet, hintLevel } = req.body;
    if (!message) {
      res.status(400).json({ error: 'MESSAGE_REQUIRED' });
      return;
    }
    const reply = await mentorService.chatWithMentor({
      userId: getUserId(req),
      lessonId,
      message,
      codeSnippet,
      hintLevel: hintLevel ? parseInt(hintLevel, 10) : 1
    });
    res.json(reply);
  } catch (err) {
    next(err);
  }
});

// ==================== ADAPTIVE & REMEDIALS ====================
apiRouter.get('/remedials', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const remedials = adaptiveService.getStudentRemedials(getUserId(req));
  res.json({ remedials });
});

apiRouter.post('/remedials/:id/complete', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const result = adaptiveService.completeRemedial(getIdParam(req.params.id), getUserId(req));
  res.json(result);
});

// ==================== PROJECTS ====================
apiRouter.get('/projects', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const projects = projectService.getProjects(getUserId(req));
  res.json({ projects });
});

apiRouter.post('/projects/:id/submit', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { repositoryUrl, deployUrl, notes } = req.body;
    const result = await projectService.submitProject(getUserId(req), getIdParam(req.params.id), { repositoryUrl, deployUrl, notes });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ==================== VIDEO ENGINE ====================
apiRouter.get('/video-engine/jobs', optionalAuthMiddleware, (_req, res) => {
  const jobs = videoEngineService.getJobs();
  res.json({ jobs });
});

apiRouter.get('/video-engine/jobs/:id', optionalAuthMiddleware, (req, res) => {
  const job = videoEngineService.getJobById(getIdParam(req.params.id));
  if (!job) {
    res.status(404).json({ error: 'JOB_NOT_FOUND' });
    return;
  }
  res.json({ job });
});

apiRouter.post('/video-engine/generate', optionalAuthMiddleware, async (req, res, next) => {
  try {
    const { lessonId } = req.body;
    const result = await videoEngineService.createGenerationJob(lessonId);
    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
});

apiRouter.post('/video-engine/approve', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { lessonId } = req.body;
  const result = videoEngineService.approveAndPublishVideo(lessonId, getUserId(req));
  res.json(result);
});

// ==================== EXAM & DEVELOPER CHALLENGE ====================
apiRouter.get('/exam/status', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const status = examService.getExamStatus(getUserId(req));
  res.json({ exam: status });
});

apiRouter.post('/exam/stage1', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { answers } = req.body;
  const result = examService.submitStage1Knowledge(getUserId(req), answers || []);
  res.json(result);
});

apiRouter.post('/exam/stage2', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { fixCode, testResults } = req.body;
  const result = examService.submitStage2Debugging(getUserId(req), fixCode, testResults || []);
  res.json(result);
});

apiRouter.post('/exam/stage3', optionalAuthMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { featureCode, testResults } = req.body;
  const result = examService.submitStage3Feature(getUserId(req), featureCode, testResults || []);
  res.json(result);
});

apiRouter.post('/exam/stage4', optionalAuthMiddleware, async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { defenseAnswers } = req.body;
    const result = await examService.submitStage4Defense(getUserId(req), defenseAnswers || []);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ==================== ANALYTICS ====================
apiRouter.get('/analytics/metrics', optionalAuthMiddleware, (_req, res) => {
  const metrics = analyticsService.getSystemMetrics();
  res.json({ metrics });
});

// ==================== ADMIN & GOVERNANCE ====================
apiRouter.get('/admin/dashboard', optionalAuthMiddleware, (_req, res) => {
  const metrics = adminService.getDashboardMetrics();
  res.json({ metrics });
});

apiRouter.get('/admin/users', optionalAuthMiddleware, (_req, res) => {
  const users = adminService.getAllUsersDetailed();
  res.json({ users });
});

apiRouter.post('/admin/users/:id/subscription', optionalAuthMiddleware, (req, res) => {
  const { status } = req.body;
  const user = adminService.updateUserSubscription(getIdParam(req.params.id), status);
  res.json({ success: true, user });
});

apiRouter.post('/admin/users/:id/role', optionalAuthMiddleware, (req, res) => {
  const { role } = req.body;
  const user = adminService.updateUserRole(getIdParam(req.params.id), role);
  res.json({ success: true, user });
});

apiRouter.post('/admin/users/:id/reset', optionalAuthMiddleware, (req, res) => {
  const result = adminService.resetUserProgress(getIdParam(req.params.id));
  res.json(result);
});

apiRouter.get('/admin/activity-feed', optionalAuthMiddleware, (_req, res) => {
  const feed = adminService.getRecentActivityFeed(30);
  res.json({ feed });
});

apiRouter.get('/admin/settings', optionalAuthMiddleware, (_req, res) => {
  res.json({ settings: adminService.getSettings() });
});

apiRouter.put('/admin/settings', optionalAuthMiddleware, (req, res) => {
  const { key, value } = req.body;
  const result = adminService.updateSetting(key, value);
  res.json(result);
});

apiRouter.get('/admin/students', optionalAuthMiddleware, (_req, res) => {
  const users = adminService.getAllUsersDetailed();
  res.json({ students: users });
});
