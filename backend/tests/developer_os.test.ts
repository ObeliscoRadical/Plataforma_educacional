import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server.js';
import { runSeed } from '../src/database/seed.js';

let app: any;
let studentToken = '';
let adminToken = '';

beforeAll(async () => {
  await runSeed();
  const serverObj = createServer();
  app = serverObj.app;

  // Login Student
  const studentRes = await request(app)
    .post('/api/auth/login')
    .send({ emailOrHandle: 'student@devos.academy', password: 'student123' });
  studentToken = studentRes.body.token;

  // Login Admin
  const adminRes = await request(app)
    .post('/api/auth/login')
    .send({ emailOrHandle: 'admin@devos.academy', password: 'admin123' });
  adminToken = adminRes.body.token;
});

describe('Developer OS: Core Kernel & Subsystems', () => {
  it('GET /api/system/status should report ONLINE status and 24 modules', async () => {
    const res = await request(app).get('/api/system/status');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ONLINE');
    expect(res.body.subsystems.curriculumModules).toBe(24);
  });

  it('GET /api/curriculum/modules should return 24 curriculum modules', async () => {
    const res = await request(app)
      .get('/api/curriculum/modules')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.modules.length).toBe(24);
    expect(res.body.modules[0].code).toBe('MOD_00');
    expect(res.body.modules[23].code).toBe('MOD_23');
  });

  it('POST /api/progress/lesson/:id/video-watched should acknowledge video WITHOUT marking lesson as completed', async () => {
    const res = await request(app)
      .post('/api/progress/lesson/lesson_00_01/video-watched')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.videoWatched).toBe(true);
    expect(res.body.lessonCompleted).toBe(false);
  });

  it('POST /api/sandbox/run should execute code safely and evaluate test assertions', async () => {
    const res = await request(app)
      .post('/api/sandbox/run')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        code: 'function add(a, b) { return a + b; }',
        testCases: [
          { name: '1+1=2', assertion: 'return add(1, 1) === 2;' },
          { name: '2+3=5', assertion: 'return add(2, 3) === 5;' }
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.passedCount).toBe(2);
    expect(res.body.totalCount).toBe(2);
  });

  it('POST /api/progress/lesson/:id/exercise should complete exercise, update skill and complete lesson', async () => {
    const res = await request(app)
      .post('/api/progress/lesson/lesson_00_01/exercise')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        exerciseId: 'ex_00_01',
        code: `function simulateProcessAllocation(processName, memoryBytes) {
          if (!memoryBytes || memoryBytes <= 0) throw new Error("INVALID_MEM");
          return { pid: 1234, name: processName, allocatedBytes: memoryBytes, status: "ALLOCATED" };
        }`,
        testCases: [
          { name: 'allocates', assertion: 'const r = simulateProcessAllocation("node", 1024); return r.status === "ALLOCATED" && r.allocatedBytes === 1024;' }
        ],
        hintsUsed: 1,
        maxHintLevel: 1
      });
    expect(res.status).toBe(200);
    expect(res.body.execution.success).toBe(true);
  });

  it('POST /api/mentor/chat should support 5 progressive hint scaffolding levels', async () => {
    const resLevel1 = await request(app)
      .post('/api/mentor/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        message: 'Como aloco memória no processo?',
        lessonId: 'lesson_00_01',
        hintLevel: 1
      });
    expect(resLevel1.status).toBe(200);
    expect(resLevel1.body.message).toContain('NÍVEL 1: PERGUNTA ORIENTADORA');

    // Level can only escalate one step per message (server-enforced)
    for (const lv of [2, 3, 4]) {
      await request(app).post('/api/mentor/chat').set('Authorization', `Bearer ${studentToken}`)
        .send({ message: 'Preciso de mais ajuda', lessonId: 'lesson_00_01', hintLevel: lv });
    }
    const resLevel5 = await request(app)
      .post('/api/mentor/chat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        message: 'Preciso da solução de referência',
        lessonId: 'lesson_00_01',
        hintLevel: 5
      });
    expect(resLevel5.status).toBe(200);
    expect(resLevel5.body.message).toContain('NÍVEL 5: SOLUÇÃO COMENTADA');
    expect(resLevel5.body.suggestedCode).toBeDefined();
  });

  it('GET /api/skills should return student skills with 5 dimensions', async () => {
    const res = await request(app)
      .get('/api/skills')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(200);
    expect(res.body.skills.length).toBe(24);
    expect(res.body.weights.implementation).toBe(0.30);
    expect(res.body.weights.problemSolving).toBe(0.25);
  });

  it('POST /api/video-engine/generate and approve pipeline workflow', async () => {
    // 1. Generate video job (Admin/Mentor)
    const genRes = await request(app)
      .post('/api/video-engine/generate')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ lessonId: 'lesson_00_01' });
    expect(genRes.status).toBe(202);
    expect(genRes.body.jobId).toBeDefined();

    // 2. Approve and publish video (Admin)
    const approveRes = await request(app)
      .post('/api/video-engine/approve')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ lessonId: 'lesson_00_01' });
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.status).toBe('PUBLISHED');
  });

  it('POST /api/exam/stage1 through stage4 should complete the Developer Challenge', async () => {
    // Stage 1
    const s1 = await request(app)
      .post('/api/exam/stage1')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ answers: [{ questionIndex: 0, selected: 'A', isCorrect: true }] });
    expect(s1.status).toBe(200);
    expect(s1.body.passed).toBe(true);

    // Stage 2
    const s2 = await request(app)
      .post('/api/exam/stage2')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ fixCode: 'fixed', testResults: [{ name: 't1', passed: true }] });
    expect(s2.status).toBe(200);
    expect(s2.body.passed).toBe(true);

    // Stage 3
    const s3 = await request(app)
      .post('/api/exam/stage3')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ featureCode: 'feature', testResults: [{ name: 't1', passed: true }] });
    expect(s3.status).toBe(200);
    expect(s3.body.passed).toBe(true);

    // Stage 4
    const s4 = await request(app)
      .post('/api/exam/stage4')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ defenseAnswers: [{ question: 'Por que sliding window?', answer: 'Complexidade O(1) e janela precisa.' }] });
    expect(s4.status).toBe(200);
    expect(s4.body.status).toBe('PASSED');
    expect(s4.body.overallGrade).toBeGreaterThanOrEqual(75);
  });
});
