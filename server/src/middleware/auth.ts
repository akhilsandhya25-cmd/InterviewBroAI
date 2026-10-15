import { Request, Response, NextFunction } from 'express';
import { serverAuthService } from '../services/authService.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
}

/**
 * Middleware that requires a valid Bearer token in the Authorization header.
 * Rejects with 401 Unauthorized if missing, expired, or invalid.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied. Please sign in to access this resource.'
    });
  }

  const token = authHeader.substring(7).trim();
  const user = serverAuthService.validateSession(token);

  if (!user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired session. Please sign in again.'
    });
  }

  req.user = {
    id: user.id,
    email: user.email,
    full_name: user.full_name
  };

  next();
}

/**
 * Optional authentication middleware: populates req.user if a valid token is present,
 * but allows the request to continue if not.
 */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const user = serverAuthService.validateSession(token);
    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        full_name: user.full_name
      };
    }
  }

  next();
}
