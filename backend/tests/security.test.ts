import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server.js';
import { runSeed } from '../src/database/seed.js';

let app: any;
let studentToken = '';
let adminToken = '';

beforeAll(async () => {
  await runSeed();
  app = createServer().app;
  studentToken = (await request(app).post('/api/auth/login').send({ emailOrHandle: 'student@devos.academy', password: 'student123' })).body.token;
  adminToken = (await request(app).post('/api/auth/login').send({ emailOrHandle: 'admin@devos.academy', password: 'admin123' })).body.token;
});

describe('Admin routes require ADMIN role', () => {
  const routes: [string, string][] = [
    ['get', '/api/admin/dashboard'], ['get', '/api/admin/users'], ['get', '/api/admin/settings'],
    ['get', '/api/admin/students'], ['get', '/api/admin/activity-feed'],
  ];
  for (const [m, url] of routes) {
    it(`${url} anonymous -> 401`, async () => {
      expect((await (request(app) as any)[m](url)).status).toBe(401);
    });
    it(`${url} student -> 403`, async () => {
      expect((await (request(app) as any)[m](url).set('Authorization', `Bearer ${studentToken}`)).status).toBe(403);
    });
    it(`${url} admin -> 200`, async () => {
      expect((await (request(app) as any)[m](url).set('Authorization', `Bearer ${adminToken}`)).status).toBe(200);
    });
  }

  it('student cannot escalate own role', async () => {
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${studentToken}`);
    const res = await request(app).post(`/api/admin/users/${me.body.user.id}/role`)
      .set('Authorization', `Bearer ${studentToken}`).send({ role: 'ADMIN' });
    expect(res.status).toBe(403);
  });

  it('anonymous cannot change role / subscription / reset', async () => {
    for (const p of ['role', 'subscription', 'reset']) {
      expect((await request(app).post(`/api/admin/users/user_student_001/${p}`).send({ role: 'ADMIN', status: 'ACTIVE' })).status).toBe(401);
    }
  });
});
