import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server.js';
import { runSeed } from '../src/database/seed.js';
import { getDb } from '../src/database/db.js';
import { entitlementService, DEFAULT_COURSE_ID } from '../src/services/entitlement.service.js';

let app: any;
let tok = '';
let lessonId = '';

beforeAll(async () => {
  await runSeed();
  app = createServer().app;
  const db = getDb();
  lessonId = (db.prepare("SELECT id FROM lessons WHERE code <> '00.01' ORDER BY code LIMIT 1").get() as any).id;
  const email = 'scaffold@teste.com';
  const reg = await request(app).post('/api/auth/register')
    .send({ email, password: 'Senha123!', name: 'Scaf', handle: 'scaf_teste' });
  tok = reg.body.token || (await request(app).post('/api/auth/login').send({ emailOrHandle: email, password: 'Senha123!' })).body.token;
  const uid = (db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any).id;
  entitlementService.grant(uid, DEFAULT_COURSE_ID, 'ADMIN');
});

describe('mentor scaffolding is server-enforced', () => {
  it('first message asking level 5 does not return the level-5 solution', async () => {
    const res = await request(app).post('/api/mentor/chat').set('Authorization', `Bearer ${tok}`)
      .send({ message: 'me dê a solução', hintLevel: 5, lessonId });
    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).not.toContain('NÍVEL 5');
  });
});
