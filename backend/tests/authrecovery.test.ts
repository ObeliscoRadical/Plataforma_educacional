import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server.js';
import { runSeed } from '../src/database/seed.js';

let app: any;
const email = 'recup@teste.com';
const login = (p: string) => request(app).post('/api/auth/login').send({ emailOrHandle: email, password: p });

beforeAll(async () => {
  await runSeed();
  app = createServer().app;
  await request(app).post('/api/auth/register').send({ email, password: 'Senha123!', name: 'Rec', handle: 'recup_teste' });
});

describe('password recovery + email verification', () => {
  it('unknown email gets the same 200 and no token', async () => {
    const r = await request(app).post('/api/auth/forgot-password').send({ email: 'ninguem@x.com' });
    expect(r.status).toBe(200);
    expect(r.body.devToken).toBeUndefined();
  });

  it('reset works once, old password stops working, token is single-use', async () => {
    const f = await request(app).post('/api/auth/forgot-password').send({ email });
    const t = f.body.devToken;
    expect(t).toBeTruthy();
    expect((await request(app).post('/api/auth/reset-password').send({ token: t, password: 'curta' })).status).toBe(400);
    expect((await request(app).post('/api/auth/reset-password').send({ token: t, password: 'NovaSenha456!' })).status).toBe(200);
    expect((await login('Senha123!')).status).not.toBe(200);
    expect((await login('NovaSenha456!')).status).toBe(200);
    expect((await request(app).post('/api/auth/reset-password').send({ token: t, password: 'Outra789!!' })).status).toBe(400);
  });

  it('email verification needs auth and a valid token', async () => {
    const tok = (await login('NovaSenha456!')).body.token;
    expect((await request(app).post('/api/auth/verify-email/request')).status).toBe(401);
    const r = await request(app).post('/api/auth/verify-email/request').set('Authorization', `Bearer ${tok}`);
    expect(r.status).toBe(200);
    expect((await request(app).post('/api/auth/verify-email').send({ token: 'lixo' })).status).toBe(400);
    expect((await request(app).post('/api/auth/verify-email').send({ token: r.body.devToken })).status).toBe(200);
  });
});
