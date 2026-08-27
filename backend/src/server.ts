import express from 'express';
import cors from 'cors';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import rateLimit from 'express-rate-limit';
import { apiRouter } from './routes/api.router.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { getDb } from './database/db.js';

export function createServer() {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  // Initialize DB
  getDb();

  // Basic Middlewares
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

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

  // Mount API Router
  app.use('/api', apiRouter);

  // Serve Frontend Static Assets if built
  const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
  if (fs.existsSync(frontendDistPath)) {
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
