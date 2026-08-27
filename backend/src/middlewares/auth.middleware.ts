import { Request, Response, NextFunction } from 'express';
import { authService, UserPayload } from '../services/auth.service.js';

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'UNAUTHORIZED', message: 'No Bearer token provided in Authorization header.' });
    return;
  }

  const token = authHeader.substring(7);
  const user = authService.verifyToken(token);
  if (!user) {
    res.status(401).json({ error: 'INVALID_TOKEN', message: 'JWT verification failed or token expired.' });
    return;
  }

  req.user = user;
  next();
}
