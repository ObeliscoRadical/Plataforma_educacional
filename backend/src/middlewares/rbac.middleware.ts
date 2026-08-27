import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware.js';

export function requireRoles(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'UNAUTHORIZED' });
      return;
    }

    if (!roles.includes(req.user.role) && !roles.includes('*')) {
      res.status(403).json({
        error: 'FORBIDDEN',
        message: `Role '${req.user.role}' lacks permission for this endpoint. Required: [${roles.join(', ')}]`
      });
      return;
    }

    next();
  };
}
