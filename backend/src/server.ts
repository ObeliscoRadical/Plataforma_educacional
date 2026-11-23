import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import rateLimit from 'express-rate-limit';
import { stripeService } from './services/stripe.service.js';
import { apiRouter } from './routes/api.router.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { getDb } from './database/db.js';
import { config } from './config/index.js';
import { connectMongo } from './database/mongo.js';

export function createServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Initialize DBs (SQLite & MongoDB)
  getDb();
  connectMongo().catch(() => {});

  // Basic Middlewares
  app.use(cors({
    origin: config.corsOrigins.length ? config.corsOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Webhook Stripe precisa do corpo cru (assinatura) — antes do express.json
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    try {
      res.json(stripeService.handleWebhook(req.body as Buffer, req.headers['stripe-signature'] as string | undefined));
    } catch (e: any) {
      const code = e.message === 'WEBHOOK_NOT_CONFIGURED' ? 503 : 400;
      res.status(code).json({ error: e.message });
    }
  });

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global Rate Limiter
  const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 300, // max 300 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'TOO_MANY_REQUESTS', message: 'Rate limit exceeded for this IP.' }
  });
  app.use('/api/', limiter);

  // Limites estritos: login/registro (brute force) e mentor (custo de IA).
  // Em teste fica desligado, a menos que AUTH_RATE_MAX seja definido.
  const strict = (max: number, windowMs: number) => rateLimit({
    windowMs, max, standardHeaders: true, legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test' && !process.env.AUTH_RATE_MAX,
    message: { error: 'TOO_MANY_REQUESTS', message: 'Muitas tentativas. Aguarde e tente de novo.' }
  });
  const authMax = Number(process.env.AUTH_RATE_MAX) || 10;
  app.use('/api/auth/login', strict(authMax, 15 * 60 * 1000));
  app.use('/api/auth/register', strict(authMax, 15 * 60 * 1000));
  app.use('/api/mentor/chat', strict(Number(process.env.MENTOR_RATE_MAX) || 20, 60 * 1000));

  // Mount API Router
  app.use('/api', apiRouter);

  // Serve Frontend Static Assets if built
  const potentialPaths = [
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), 'dist')
  ];
  const frontendDistPath = potentialPaths.find(p => fs.existsSync(p));
  if (frontendDistPath) {
    app.use(express.static(frontendDistPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
        return next();
      }
      res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  // WebSocket connection for real-time terminal & system telemetry
  wss.on('connection', (ws: WebSocket) => {
    ws.send(JSON.stringify({
      type: 'SYSTEM_BOOT',
      message: 'Developer OS Terminal Telemetry Socket Connected.',
      timestamp: new Date().toISOString()
    }));

    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
        }
      } catch {
        // ignore malformed ws messages
      }
    });
  });

  return { app, server, wss };
}
