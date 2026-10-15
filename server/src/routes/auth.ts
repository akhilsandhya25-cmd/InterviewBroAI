import { Router, Request, Response } from 'express';
import { serverAuthService } from '../services/authService.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

// GET /api/auth/status - Check auth service configuration
authRouter.get('/status', (_req: Request, res: Response) => {
  const isSupabaseConfigured = Boolean(
    process.env.VITE_SUPABASE_URL &&
    process.env.VITE_SUPABASE_ANON_KEY &&
    !process.env.VITE_SUPABASE_URL.includes('your-project-id')
  );

  return res.json({
    status: 'ok',
    provider: isSupabaseConfigured ? 'supabase' : 'local-secure',
    isSupabaseConfigured,
    supportsPasswordReset: true,
    supportsUserIsolation: true
  });
});

// POST /api/auth/signup
authRouter.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, confirmPassword, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Full name, email address, and password are required.'
      });
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      return res.status(400).json({
        error: 'Password mismatch',
        message: 'Passwords do not match. Please verify both password fields.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address.'
      });
    }

    const { user, token } = serverAuthService.registerUser({
      email,
      password,
      full_name: fullName
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user,
      token
    });
  } catch (error: any) {
    return res.status(400).json({
      error: 'Registration failed',
      message: error.message || 'Could not complete registration'
    });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Please provide both your email and password.'
      });
    }

    const { user, token } = serverAuthService.loginUser(email, password);

    return res.json({
      success: true,
      message: 'Login successful',
      user,
      token
    });
  } catch (error: any) {
    return res.status(401).json({
      error: 'Authentication failed',
      message: error.message || 'Invalid credentials'
    });
  }
});

// GET /api/auth/me - Validate session and get current profile
authRouter.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = serverAuthService.getUserById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password_hash, password_salt, ...safeUser } = user;
    return res.json({ success: true, user: safeUser });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/profile - Update candidate profile
authRouter.put('/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = serverAuthService.updateProfile(req.user!.id, req.body);
    const { password_hash, password_salt, ...safeUser } = updated;
    return res.json({ success: true, user: safeUser });
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/logout
authRouter.post('/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    serverAuthService.invalidateSession(token);
  }
  return res.json({ success: true, message: 'Logged out successfully' });
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const result = serverAuthService.requestPasswordReset(email);
    return res.json({ success: true, ...result });
  } catch (error: any) {
    return res.status(400).json({ error: 'Reset request failed', message: error.message });
  }
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', (req: Request, res: Response) => {
  try {
    const { email, code, newPassword, confirmNewPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'Email, verification code, and new password are required.'
      });
    }

    if (confirmNewPassword !== undefined && newPassword !== confirmNewPassword) {
      return res.status(400).json({
        error: 'Password mismatch',
        message: 'New passwords do not match.'
      });
    }

    serverAuthService.resetPasswordWithCode(email, code, newPassword);
    return res.json({
      success: true,
      message: 'Password has been successfully reset. You can now sign in with your new password.'
    });
  } catch (error: any) {
    return res.status(400).json({ error: 'Reset failed', message: error.message });
  }
});
