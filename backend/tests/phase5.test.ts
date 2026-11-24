import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server.js';
import { runSeed } from '../src/database/seed.js';
import { getDb } from '../src/database/db.js';
import { entitlementService, DEFAULT_COURSE_ID } from '../src/services/entitlement.service.js';
import { stripeService } from '../src/services/stripe.service.js';

let app: any; let tok = ''; let adm = ''; let uid = ''; let lessonId = '';
const login = async (e: string, p: string) => (await request(app).post('/api/auth/login').send({ emailOrHandle: e, password: p })).body.token;
const A = (t: string) => ({ Authorization: `Bearer ${t}` });

beforeAll(async () => {
  await runSeed(); app = createServer().app;
  const db = getDb();
  lessonId = (db.prepare("SELECT id FROM lessons WHERE code <> '00.01' ORDER BY code LIMIT 1").get() as any).id;
  await request(app).post('/api/auth/register').send({ email: 'p5@teste.com', password: 'Senha123!', name: 'P5', handle: 'p5_teste' });
  tok = await login('p5@teste.com', 'Senha123!'); adm = await login('admin@devos.academy', 'admin123');
  uid = (db.prepare("SELECT id FROM users WHERE email='p5@teste.com'").get() as any).id;
});

describe('phase 5', () => {
  it('video-engine anon 401, student 403', async () => {
    expect((await request(app).get('/api/video-engine/jobs')).status).toBe(401);
    const r = await request(app).get('/api/video-engine/jobs').set(A(tok));
    expect(r.status).toBe(403);
  });
  it('refund revokes enrollment', async () => {
    const db = getDb();
    entitlementService.grant(uid, DEFAULT_COURSE_ID, 'PURCHASE');
    db.prepare("INSERT OR REPLACE INTO orders (id,user_id,course_id,amount_cents,currency,status,provider,provider_ref) VALUES ('o_p5',?,?,100,'eur','PAID','stripe','ref_p5')").run(uid, DEFAULT_COURSE_ID);
    db.prepare("INSERT OR REPLACE INTO payment_refs (payment_intent, order_id) VALUES ('pi_p5','o_p5')").run();
    expect(entitlementService.hasActiveEnrollment(uid, DEFAULT_COURSE_ID)).toBe(true);
    const out = await stripeService.applyEvent({ type: 'charge.refunded', data: { object: { payment_intent: 'pi_p5' } } } as any);
    expect(out?.handled).toBe('refunded');
    expect(entitlementService.hasActiveEnrollment(uid, DEFAULT_COURSE_ID)).toBe(false);
  });
  it('notes need enrollment', async () => {
    expect((await request(app).post(`/api/lessons/${lessonId}/notes`).set(A(tok)).send({ body: 'x' })).status).toBe(403);
    entitlementService.grant(uid, DEFAULT_COURSE_ID, 'ADMIN');
    expect((await request(app).post(`/api/lessons/${lessonId}/notes`).set(A(tok)).send({ body: 'x' })).status).toBe(201);
  });
  it('certificate blocked until course done', async () =>
    expect((await request(app).post('/api/certificates').set(A(tok))).status).toBe(409));
  it('csv admin only', async () => {
    expect((await request(app).get('/api/admin/audit.csv').set(A(tok))).status).toBe(403);
    expect((await request(app).get('/api/admin/audit.csv').set(A(adm))).status).toBe(200);
  });
  it('rgpd export + erase', async () => {
    expect((await request(app).get('/api/me/data').set(A(tok))).body.user.email).toBe('p5@teste.com');
    expect((await request(app).delete('/api/me/data').set(A(tok))).status).toBe(200);
    expect(entitlementService.hasActiveEnrollment(uid, DEFAULT_COURSE_ID)).toBe(false);
  });
});
