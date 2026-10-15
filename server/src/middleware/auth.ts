import { Request, Response, NextFunction } from 'express';
import { serverAuthService } from '../services/authService.js';
import { isServerSupabaseConfigured, verifySupabaseToken } from '../services/supabaseService.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
}

/**
 * Middleware that requires a valid Bearer token in the Authorization header.
 * Supports both cloud Supabase JWT access tokens and local development sessions.
 * Rejects with 401 Unauthorized if missing, expired, or invalid.
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access denied. Please sign in to access this resource.'
    });
  }

  const token = authHeader.substring(7).trim();

  // 1. If Supabase is configured, check if token is a valid Supabase access token
  if (isServerSupabaseConfigured) {
    const supabaseUser = await verifySupabaseToken(token);
    if (supabaseUser) {
      req.user = supabaseUser;
      return next();
    }
  }

  // 2. Fall back to local development session store
  const localUser = serverAuthService.validateSession(token);
  if (localUser) {
    req.user = {
      id: localUser.id,
      email: localUser.email,
      full_name: localUser.full_name
    };
    return next();
  }

  return res.status(401).json({
    error: 'Unauthorized',
    message: 'Invalid or expired session. Please sign in again.'
  });
}

/**
 * Optional authentication middleware: populates req.user if a valid token is present,
 * but allows the request to continue if not.
 */
export async function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();

    if (isServerSupabaseConfigured) {
      const supabaseUser = await verifySupabaseToken(token);
      if (supabaseUser) {
        req.user = supabaseUser;
        return next();
      }
    }

    const localUser = serverAuthService.validateSession(token);
    if (localUser) {
      req.user = {
        id: localUser.id,
        email: localUser.email,
        full_name: localUser.full_name
      };
    }
  }

  next();
}

