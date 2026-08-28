import Stripe from 'stripe';
import { getDb } from '../database/db.js';
import { config } from '../config/index.js';

export class StripeService {
  private stripe: Stripe | null = null;
  private db = getDb();

  constructor() {
    if (config.stripeSecretKey) {
      this.stripe = new Stripe(config.stripeSecretKey, {
        apiVersion: '2025-02-24.acacia' as any
      });
    }
  }

  async createCheckoutSession(userId: string, returnUrl?: string): Promise<{ url: string; sessionId: string; isMock: boolean }> {
    const user = this.db.prepare('SELECT id, email, name, handle, subscription_status FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    const successUrl = returnUrl 
      ? `${returnUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}` 
      : `${config.appBaseUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = returnUrl 
      ? `${returnUrl}?payment=cancelled` 
      : `${config.appBaseUrl}?payment=cancelled`;

    // Real Stripe Integration if API key is provided
    if (this.stripe) {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: 'brl',
              product_data: {
                name: 'Developer OS — Plano Cadete Pro (Acesso Completo)',
                description: 'Acesso a 60+ missões atômicas, Mentor IA com voz neural, salas de aula interativas, simuladores e arena blitz.',
              },
              unit_amount: 990, // R$ 9,90 in cents
              recurring: {
                interval: 'month'
              }
            },
            quantity: 1
          }
        ],
        metadata: {
          userId: user.id,
          handle: user.handle
        },
        success_url: successUrl,
        cancel_url: cancelUrl
      });

      this.db.prepare('UPDATE users SET stripe_session_id = ? WHERE id = ?').run(session.id, user.id);

      return {
        url: session.url || successUrl.replace('{CHECKOUT_SESSION_ID}', session.id),
        sessionId: session.id,
        isMock: false
      };
    }

    // High-fidelity fallback / Sandbox mode (Instant test workflow)
    const mockSessionId = `cs_test_mock_${Date.now()}_${userId}`;
    this.db.prepare('UPDATE users SET stripe_session_id = ? WHERE id = ?').run(mockSessionId, user.id);

    return {
      url: successUrl.replace('{CHECKOUT_SESSION_ID}', mockSessionId),
      sessionId: mockSessionId,
      isMock: true
    };
  }

  async verifySession(sessionId: string, userId?: string): Promise<{ success: boolean; user: any; message: string }> {
    let targetUserId = userId;

    if (!targetUserId) {
      const user = this.db.prepare('SELECT id FROM users WHERE stripe_session_id = ?').get(sessionId) as any;
      if (user) {
        targetUserId = user.id;
      }
    }

    if (!targetUserId) {
      throw new Error('SESSION_NOT_FOUND');
    }

    // If real stripe, verify payment status
    if (this.stripe && !sessionId.startsWith('cs_test_mock_')) {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid' && session.status !== 'complete') {
        return {
          success: false,
          user: null,
          message: 'O pagamento ainda não foi confirmado pela operadora.'
        };
      }
    }

    // Activate subscription in database
    this.db.prepare(`
      UPDATE users 
      SET subscription_status = 'ACTIVE', 
          plan_id = 'CADET_PRO_990',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(targetUserId);

    const updatedUser = this.db.prepare(`
      SELECT id, email, name, handle, role, avatar, subscription_status, plan_id 
      FROM users 
      WHERE id = ?
    `).get(targetUserId);

    return {
      success: true,
      user: updatedUser,
      message: 'Assinatura ativada com sucesso! Bem-vindo ao Developer OS.'
    };
  }

  async mockActivate(userId: string): Promise<{ success: boolean; user: any; message: string }> {
    this.db.prepare(`
      UPDATE users 
      SET subscription_status = 'ACTIVE', 
          plan_id = 'CADET_PRO_990',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(userId);

    const updatedUser = this.db.prepare(`
      SELECT id, email, name, handle, role, avatar, subscription_status, plan_id 
      FROM users 
      WHERE id = ?
    `).get(userId);

    return {
      success: true,
      user: updatedUser,
      message: 'Plano Cadete Pro (R$ 9,90/mês) ativado com sucesso em modo sandbox!'
    };
  }

  getUserSubscription(userId: string) {
    const user = this.db.prepare(`
      SELECT subscription_status, plan_id, stripe_customer_id, stripe_session_id 
      FROM users 
      WHERE id = ?
    `).get(userId) as any;

    if (!user) return null;

    return {
      status: user.subscription_status || 'PENDING_PAYMENT',
      planId: user.plan_id || 'CADET_PRO_990',
      planName: 'Plano Cadete Pro // Acesso Completo',
      priceFormatted: 'R$ 9,90 / mês',
      features: [
        'Acesso irrestrito a todos os 5 Estágios de Carreira (60+ missões)',
        'Sala de Aula Interativa com Professor Virtual e Áudio Neural',
        'Mentor IA Socrático 24/7 com suporte a comando de voz',
        'Laboratório ao vivo, Raio-X Stepper e Desafios de Bug do Estagiário',
        'Arena Blitz de Speed Coding e Certificado de Conclusão'
      ]
    };
  }
}

export const stripeService = new StripeService();
