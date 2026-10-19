import { Router, Request, Response } from 'express';
import { serverAuthService } from '../services/authService.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { 
  isServerSupabaseConfigured, 
  serverSupabase,
  getSupabaseProfile, 
  updateSupabaseProfile 
} from '../services/supabaseService.js';

function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return 'unknown';
  const parts = email.split('@');
  if (parts.length !== 2) return 'invalid-email';
  const name = parts[0];
  const maskedName = name.length <= 2 ? name[0] + '*' : name[0] + '*'.repeat(Math.max(1, name.length - 2)) + name[name.length - 1];
  return `${maskedName}@${parts[1]}`;
}

export const authRouter = Router();

// GET /api/auth/status - Check auth service configuration
authRouter.get('/status', (_req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    provider: isServerSupabaseConfigured ? 'supabase' : 'local-secure',
    isSupabaseConfigured: isServerSupabaseConfigured,
    supportsPasswordReset: true,
    supportsUserIsolation: true
  });
});

// GET /api/auth/signup - Rejection for browser GET navigation
authRouter.get('/signup', (_req: Request, res: Response) => {
  return res.status(405).json({
    error: 'Method Not Allowed',
    message: 'The /api/auth/signup endpoint requires a POST request with email, password, and fullName in the request body.'
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

    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName = fullName.trim();
    console.log(`[Server Auth] Signup attempt received for ${maskEmail(cleanEmail)}`);

    // Route directly to Supabase Auth when available
    if (isServerSupabaseConfigured && serverSupabase) {
      const { data, error } = await serverSupabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: cleanFullName }
        }
      });

      if (error) {
        console.warn(`[Server Auth] Supabase signup error for ${maskEmail(cleanEmail)}: HTTP ${error.status || 400}`, {
          code: error.code,
          message: error.message
        });

        let friendlyMsg = error.message;
        if (error.code === 'over_email_send_rate_limit' || error.message.includes('rate limit')) {
          friendlyMsg = 'Too many verification email requests. Please wait a while before trying again.';
        } else if (error.code === 'user_already_exists' || error.message.includes('already registered')) {
          friendlyMsg = 'An account with this email address already exists. Please log in instead.';
        } else if (error.code === 'validation_failed') {
          friendlyMsg = 'Unable to validate email address. Please provide a valid email format.';
        } else if (error.code === 'weak_password') {
          friendlyMsg = 'Password must be at least 6 characters long.';
        }

        return res.status(error.status || 400).json({
          error: error.message,
          message: friendlyMsg,
          code: error.code
        });
      }

      console.log(`[Server Auth] Supabase signup succeeded for ${maskEmail(cleanEmail)}, user ID: ${data.user?.id}`);

      const user = {
        id: data.user?.id || `usr-${Date.now()}`,
        email: data.user?.email || cleanEmail,
        full_name: data.user?.user_metadata?.full_name || cleanFullName,
        role_target: '',
        experience_level: 'fresher',
        college: '',
        graduation_year: '',
        skills: [],
        career_goals: '',
        interviews_remaining: 9999,
        total_interviews_taken: 0,
        profile_completed: false,
        created_at: data.user?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const requiresEmailVerification = !data.session;
      return res.status(200).json({
        success: true,
        user: requiresEmailVerification ? null : user,
        token: data.session?.access_token,
        session: data.session,
        requiresEmailVerification,
        email: cleanEmail,
        message: requiresEmailVerification
          ? "Account created successfully! We've sent a verification link to your email address."
          : `Welcome to InterviewBro AI, ${user.full_name}!`
      });
    }

    // Local Secure Server Mode fallback
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address.'
      });
    }

    const { user, token } = serverAuthService.registerUser({
      email: cleanEmail,
      password,
      full_name: cleanFullName
    });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user,
      token
    });
  } catch (error: any) {
    console.error('[Server Auth] Exception during signup:', error.message || error);
    return res.status(500).json({
      error: 'Registration failed',
      message: error.message || 'Could not complete registration'
    });
  }
});

// GET /api/auth/login - Rejection for browser GET navigation
authRouter.get('/login', (_req: Request, res: Response) => {
  return res.status(405).json({
    error: 'Method Not Allowed',
    message: 'The /api/auth/login endpoint requires a POST request with email and password in the request body.'
  });
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

    const cleanEmail = email.trim().toLowerCase();
    console.log(`[Server Auth] Login attempt received for ${maskEmail(cleanEmail)}`);

    // Route directly to Supabase Auth when available
    if (isServerSupabaseConfigured && serverSupabase) {
      const { data, error } = await serverSupabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        console.warn(`[Server Auth] Supabase login error for ${maskEmail(cleanEmail)}: HTTP ${error.status || 400}`, error.message);
        return res.status(error.status || 400).json({
          error: error.message,
          message: error.message
        });
      }

      const user = {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
        role_target: '',
        experience_level: 'fresher',
        college: '',
        graduation_year: '',
        skills: [],
        career_goals: '',
        interviews_remaining: 9999,
        total_interviews_taken: 0,
        profile_completed: false,
        created_at: data.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return res.json({
        success: true,
        message: 'Login successful',
        user,
        token: data.session.access_token,
        session: data.session
      });
    }

    // Local Secure Server Mode fallback
    const { user, token } = serverAuthService.loginUser(cleanEmail, password);

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
authRouter.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Check local session engine
    const localUser = serverAuthService.getUserById(req.user!.id);
    if (localUser) {
      const { password_hash, password_salt, ...safeUser } = localUser;
      return res.json({ success: true, user: safeUser });
    }

    // 2. Check Supabase profile table
    if (isServerSupabaseConfigured) {
      const supabaseProfile = await getSupabaseProfile(req.user!.id);
      if (supabaseProfile) {
        return res.json({ success: true, user: supabaseProfile });
      }
    }

    // 3. Fallback profile from authenticated Bearer token claims
    return res.json({
      success: true,
      user: {
        id: req.user!.id,
        email: req.user!.email,
        full_name: req.user!.full_name,
        role_target: '',
        experience_level: 'fresher',
        college: '',
        graduation_year: '',
        skills: [],
        career_goals: '',
        interviews_remaining: 9999,
        total_interviews_taken: 0,
        profile_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/auth/profile - Update candidate profile
authRouter.put('/profile', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Check local engine
    const localUser = serverAuthService.getUserById(req.user!.id);
    if (localUser) {
      const updated = serverAuthService.updateProfile(req.user!.id, req.body);
      const { password_hash, password_salt, ...safeUser } = updated;
      return res.json({ success: true, user: safeUser });
    }

    // 2. Check Supabase
    if (isServerSupabaseConfigured) {
      const updated = await updateSupabaseProfile(req.user!.id, req.body);
      return res.json({ success: true, user: updated });
    }

    return res.status(404).json({ error: 'User profile not found' });
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
