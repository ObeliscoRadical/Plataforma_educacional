import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createServer } from '../src/server.js';
import { runSeed } from '../src/database/seed.js';
import { getDb } from '../src/database/db.js';
import { stripeService } from '../src/services/stripe.service.js';
import { entitlementService, DEFAULT_COURSE_ID } from '../src/services/entitlement.service.js';

let app: any;
beforeAll(async () => { await runSeed(); app = createServer().app; });

describe('payments', () => {
  it('webhook sem Stripe configurado -> 503', async () => {
    const r = await request(app).post('/api/stripe/webhook').set('Content-Type', 'application/json').send('{}');
    expect(r.status).toBe(503);
  });
  it('createOrder e idempotente', () => {
    const db = getDb();
    const a = entitlementService.createOrder('user_student_001', DEFAULT_COURSE_ID, 990, 'stripe', 'cs_dup_1');
    const b = entitlementService.createOrder('user_student_001', DEFAULT_COURSE_ID, 990, 'stripe', 'cs_dup_1');
    expect(a).toBe(b);
    expect((db.prepare("SELECT COUNT(*) c FROM orders WHERE provider_ref='cs_dup_1'").get() as any).c).toBe(1);
  });
  it('verify mock com Stripe real -> sem ativacao', async () => {
    (stripeService as any).stripe = {};
    const r = await stripeService.verifySession('cs_test_mock_1_user_student_001', 'user_student_001');
    (stripeService as any).stripe = null;
    expect(r.success).toBe(false);
  });
});
