import { describe, it, expect } from 'vitest';
import request from 'supertest';

describe('rate limit de login', () => {
  it('bloqueia com 429 apos AUTH_RATE_MAX tentativas', async () => {
    process.env.AUTH_RATE_MAX = '3';
    const { createServer } = await import('../src/server.js');
    const app = createServer().app;
    const codes: number[] = [];
    for (let i = 0; i < 5; i++) {
      codes.push((await request(app).post('/api/auth/login').send({ emailOrHandle: 'x@x.com', password: 'errada' })).status);
    }
    expect(codes.slice(0, 3).every(c => c !== 429)).toBe(true);
    expect(codes[4]).toBe(429);
    delete process.env.AUTH_RATE_MAX;
  });
});
