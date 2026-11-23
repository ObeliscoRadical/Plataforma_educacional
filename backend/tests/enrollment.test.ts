import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server.js';
import { runSeed } from '../src/database/seed.js';
import { getDb } from '../src/database/db.js';
import { entitlementService, DEFAULT_COURSE_ID } from '../src/services/entitlement.service.js';

let app: any;
let tok = '';
let userId = '';
let lessonId = '';
let previewId = '';

const login = async (e: string, p: string) =>
  (await request(app).post('/api/auth/login').send({ emailOrHandle: e, password: p })).body;

beforeAll(async () => {
  await runSeed();
  app = createServer().app;
  const db = getDb();
  lessonId = (db.prepare("SELECT id FROM lessons WHERE code <> '00.01' ORDER BY code LIMIT 1").get() as any).id;
  previewId = (db.prepare("SELECT id FROM lessons WHERE code = '00.01'").get() as any).id;
  const reg = await request(app).post('/api/auth/register')
    .send({ email: 'novo@teste.com', password: 'Senha123!', name: 'Novo', handle: 'novo_teste' });
  tok = reg.body.token || (await login('novo@teste.com', 'Senha123!')).token;
  userId = (db.prepare("SELECT id FROM users WHERE email='novo@teste.com'").get() as any).id;
  db.prepare("DELETE FROM enrollments WHERE user_id = ?").run(userId);
});

const get = (url: string, t?: string) => {
  const r = request(app).get(url);
  return t ? r.set('Authorization', `Bearer ${t}`) : r;
};

describe('lesson access needs active enrollment', () => {
  it('anonymous -> 401', async () => expect((await get(`/api/curriculum/lessons/${lessonId}`)).status).toBe(401));
  it('logged without enrollment -> 403', async () =>
    expect((await get(`/api/curriculum/lessons/${lessonId}`, tok)).status).toBe(403));
  it('no enrollment cannot start progress', async () =>
    expect((await request(app).post(`/api/progress/lesson/${lessonId}/start`).set('Authorization', `Bearer ${tok}`)).status).toBe(403));
  it('no enrollment cannot use mentor on lesson', async () =>
    expect((await request(app).post('/api/mentor/chat').set('Authorization', `Bearer ${tok}`)
      .send({ message: 'oi', lessonId })).status).toBe(403));
  it('preview lesson is public', async () =>
    expect((await get(`/api/curriculum/lessons/${previewId}`)).status).toBe(200));
  it('active enrollment -> 200', async () => {
    entitlementService.grant(userId, DEFAULT_COURSE_ID, 'ADMIN');
    expect((await get(`/api/curriculum/lessons/${lessonId}`, tok)).status).toBe(200);
  });
  it('revoked enrollment -> 403 again', async () => {
    entitlementService.revoke(userId, DEFAULT_COURSE_ID);
    expect((await get(`/api/curriculum/lessons/${lessonId}`, tok)).status).toBe(403);
  });
  it('admin always allowed', async () => {
    const a = await login('admin@devos.academy', 'admin123');
    expect((await get(`/api/curriculum/lessons/${lessonId}`, a.token)).status).toBe(200);
  });
});

describe('access codes', () => {
  it('redeem grants enrollment once', async () => {
    getDb().prepare("INSERT OR REPLACE INTO access_codes (code, course_id, max_uses, used_count) VALUES ('TESTE-1', ?, 1, 0)").run(DEFAULT_COURSE_ID);
    const ok = await request(app).post('/api/enrollments/redeem').set('Authorization', `Bearer ${tok}`).send({ code: 'TESTE-1' });
    expect(ok.status).toBe(200);
    expect((await get(`/api/curriculum/lessons/${lessonId}`, tok)).status).toBe(200);
    const again = await request(app).post('/api/enrollments/redeem').set('Authorization', `Bearer ${tok}`).send({ code: 'TESTE-1' });
    expect(again.body.error).toBe('CODE_EXHAUSTED');
  });
  it('unknown code -> 400', async () =>
    expect((await request(app).post('/api/enrollments/redeem').set('Authorization', `Bearer ${tok}`).send({ code: 'NOPE' })).status).toBe(400));
});
