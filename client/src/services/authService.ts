import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { storage } from './storage';

const API_BASE = '/api/auth';

export interface AuthResponse {
  user: UserProfile;
  token?: string;
  message?: string;
  requiresEmailVerification?: boolean;
  email?: string;
  isRateLimit?: boolean;
  retryAfterSeconds?: number;
}

export interface ParsedAuthError {
  isRateLimit: boolean;
  isNetworkError: boolean;
  isEmailUnconfirmed: boolean;
  isUserAlreadyExists: boolean;
  retryAfterSeconds?: number;
  friendlyMessage: string;
}

export function parseAuthError(error: any): ParsedAuthError {
  if (!error) {
    return {
      isRateLimit: false,
      isNetworkError: false,
      isEmailUnconfirmed: false,
      isUserAlreadyExists: false,
      friendlyMessage: 'An unexpected authentication error occurred. Please try again.'
    };
  }

  const rawMessage = typeof error === 'string' ? error : (error.message || '');
  const msgLower = rawMessage.toLowerCase();
  const code = (error.code || '').toLowerCase();
  const status = error.status || (error.response && error.response.status);

  // 1. Rate Limit Detection
  const isRateLimit =
    status === 429 ||
    code === 'over_email_send_rate_limit' ||
    code === 'rate_limit_exceeded' ||
    code === 'over_request_rate_limit' ||
    msgLower.includes('rate limit') ||
    msgLower.includes('over_email_send_rate_limit') ||
    msgLower.includes('too many requests') ||
    msgLower.includes('too many verification email requests');

  if (isRateLimit) {
    let retryAfterSeconds: number | undefined;

    if (typeof error.retry_after === 'number' && error.retry_after > 0) {
      retryAfterSeconds = Math.round(error.retry_after);
    } else if (typeof error.retryAfter === 'number' && error.retryAfter > 0) {
      retryAfterSeconds = Math.round(error.retryAfter);
    } else {
      const match = rawMessage.match(/(?:once every|retry after|wait)\s+(\d+)\s*(?:seconds|second|s)/i);
      if (match && match[1]) {
        const parsed = parseInt(match[1], 10);
        if (!isNaN(parsed) && parsed > 0) {
          retryAfterSeconds = parsed;
        }
      }
    }

    return {
      isRateLimit: true,
      isNetworkError: false,
      isEmailUnconfirmed: false,
      isUserAlreadyExists: false,
      retryAfterSeconds, // Only defined when Supabase provided an exact retry delay
      friendlyMessage: "Too many verification email requests. Please wait a while before trying again."
    };
  }

  // 2. Network Error Detection
  const isNetworkError =
    (typeof window !== 'undefined' && typeof navigator !== 'undefined' && navigator.onLine === false) ||
    (error.name === 'TypeError' && msgLower.includes('fetch')) ||
    msgLower.includes('failed to fetch') ||
    msgLower.includes('network error') ||
    msgLower.includes('networkerror') ||
    msgLower.includes('network request failed') ||
    msgLower.includes('net::err') ||
    msgLower.includes('timeout') ||
    msgLower.includes('abort');

  if (isNetworkError) {
    return {
      isRateLimit: false,
      isNetworkError: true,
      isEmailUnconfirmed: false,
      isUserAlreadyExists: false,
      friendlyMessage: "Network connection error. Please check your internet connection and try again."
    };
  }

  // 3. Email Not Confirmed
  const isEmailUnconfirmed =
    code === 'email_not_confirmed' ||
    msgLower.includes('email not confirmed') ||
    msgLower.includes('email not verified') ||
    msgLower.includes("email isn't verified");

  if (isEmailUnconfirmed) {
    return {
      isRateLimit: false,
      isNetworkError: false,
      isEmailUnconfirmed: true,
      isUserAlreadyExists: false,
      friendlyMessage: "Your email isn't verified yet. Please check your inbox and click the verification link before logging in."
    };
  }

  // 4. User Already Exists
  const isUserAlreadyExists =
    code === 'user_already_exists' ||
    msgLower.includes('already registered') ||
    msgLower.includes('already in use') ||
    msgLower.includes('user already exists');

  if (isUserAlreadyExists) {
    return {
      isRateLimit: false,
      isNetworkError: false,
      isEmailUnconfirmed: false,
      isUserAlreadyExists: true,
      friendlyMessage: "An account with this email address already exists. Please sign in instead."
    };
  }

  // 5. Invalid Credentials
  if (msgLower.includes('invalid login credentials') || msgLower.includes('invalid credentials')) {
    return {
      isRateLimit: false,
      isNetworkError: false,
      isEmailUnconfirmed: false,
      isUserAlreadyExists: false,
      friendlyMessage: "Incorrect email or password. Please verify your credentials and try again."
    };
  }

  return {
    isRateLimit: false,
    isNetworkError: false,
    isEmailUnconfirmed: false,
    isUserAlreadyExists: false,
    friendlyMessage: rawMessage || "Authentication failed. Please verify your details."
  };
}

export const authService = {
  /**
   * Check if Supabase or Local Secure Auth is active
   */
  isSupabase(): boolean {
    return isSupabaseConfigured;
  },

  /**
   * Register a new account
   */
  async signup(params: {
    email: string;
    password: string;
    confirmPassword?: string;
    fullName: string;
  }): Promise<AuthResponse> {
    const { email, password, confirmPassword, fullName } = params;

    // Client-side validations
    if (!email || !password || !fullName) {
      throw new Error('Please fill in all required fields.');
    }

    if (confirmPassword !== undefined && password !== confirmPassword) {
      throw new Error('Passwords do not match. Please verify both passwords.');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      throw new Error('Please enter a valid email address.');
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. If Supabase is connected, register with Supabase Auth
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim()
          },
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      });

      if (error) {
        const parsed = parseAuthError(error);
        const customErr: any = new Error(parsed.friendlyMessage);
        customErr.isRateLimit = parsed.isRateLimit;
        customErr.isNetworkError = parsed.isNetworkError;
        customErr.isUserAlreadyExists = parsed.isUserAlreadyExists;
        customErr.retryAfterSeconds = parsed.retryAfterSeconds;
        customErr.email = cleanEmail;
        throw customErr;
      }

      const uid = data.user?.id || `usr-${Date.now()}`;
      const newUser: UserProfile = {
        id: uid,
        email: cleanEmail,
        full_name: fullName.trim(),
        role_target: 'Full Stack Developer',
        experience_level: 'fresher',
        skills: ['JavaScript', 'React', 'Problem Solving'],
        interviews_remaining: 9999,
        total_interviews_taken: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (data.user) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: cleanEmail,
            full_name: fullName.trim(),
            role_target: 'Full Stack Developer',
            experience_level: 'fresher',
            skills: ['JavaScript', 'React', 'Problem Solving'],
            interviews_remaining: 9999,
            total_interviews_taken: 0
          });
        } catch {
          // Handled by Postgres trigger if present
        }
      }

      // Check whether session exists (auto-confirm enabled) or verification is required
      const requiresEmailVerification = !data.session;

      if (!requiresEmailVerification) {
        storage.setUser(newUser);
        if (data.session?.access_token) {
          storage.setToken(data.session.access_token);
        }
      }

      return { 
        user: requiresEmailVerification ? (null as any) : newUser, 
        token: data.session?.access_token,
        requiresEmailVerification,
        email: cleanEmail,
        message: requiresEmailVerification
          ? "Account created successfully! 📩 We've sent a verification link to your email address. Please check your inbox and spam folder, then verify your email before logging in."
          : `Welcome to InterviewBro AI, ${fullName.trim()}! Your account has been created successfully.`
      };
    }

    // 2. Local Secure Server Mode (Express API with salted hash)
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password, confirmPassword, fullName })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Registration failed');
    }

    storage.setUser(data.user);
    storage.setToken(data.token);
    return { user: data.user, token: data.token, requiresEmailVerification: false, email: cleanEmail };
  },

  /**
   * Log into an existing account
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    if (!email || !password) {
      throw new Error('Please enter both your email address and password.');
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Supabase Mode
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        const parsed = parseAuthError(error);
        const customErr: any = new Error(parsed.friendlyMessage);
        customErr.isRateLimit = parsed.isRateLimit;
        customErr.isNetworkError = parsed.isNetworkError;
        customErr.isEmailUnconfirmed = parsed.isEmailUnconfirmed;
        customErr.isUserAlreadyExists = parsed.isUserAlreadyExists;
        customErr.retryAfterSeconds = parsed.retryAfterSeconds;
        customErr.unconfirmedEmail = cleanEmail;
        throw customErr;
      }

      let profile: UserProfile | null = null;
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (profileData) profile = profileData;
      } catch (e) {
        // Fallback profile if DB table not yet created
      }

      const user: UserProfile = profile || {
        id: data.user.id,
        email: data.user.email || cleanEmail,
        full_name: data.user.user_metadata?.full_name || cleanEmail.split('@')[0],
        role_target: 'Full Stack Developer',
        experience_level: 'fresher',
        skills: ['JavaScript', 'React', 'Problem Solving'],
        interviews_remaining: 9999,
        total_interviews_taken: 0,
        created_at: data.user.created_at,
        updated_at: new Date().toISOString()
      };

      storage.setUser(user);
      storage.setToken(data.session.access_token);
      return { user, token: data.session.access_token };
    }

    // 2. Local Secure Server Mode
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Authentication failed');
    }

    storage.setUser(data.user);
    storage.setToken(data.token);
    return { user: data.user, token: data.token };
  },

  /**
   * Resend signup email verification link
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    if (!email || !email.trim()) {
      throw new Error('Please enter your email address to resend the verification link.');
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      });

      if (error) {
        const parsed = parseAuthError(error);
        const customErr: any = new Error(parsed.friendlyMessage);
        customErr.isRateLimit = parsed.isRateLimit;
        customErr.isNetworkError = parsed.isNetworkError;
        customErr.retryAfterSeconds = parsed.retryAfterSeconds;
        customErr.email = cleanEmail;
        throw customErr;
      }

      return {
        success: true,
        message: `Verification link has been resent to ${cleanEmail}. Please check your inbox and spam folder.`
      };
    }

    return {
      success: true,
      message: `Verification link simulated for ${cleanEmail} (local sandbox mode).`
    };
  },

  /**
   * Validate persistent session on page refresh
   */
  async restoreSession(): Promise<UserProfile | null> {
    const token = storage.getToken();
    const cachedUser = storage.getUser();

    // 1. Supabase Mode
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user) {
          if (data.session.access_token) {
            storage.setToken(data.session.access_token);
          }
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          if (profile) {
            storage.setUser(profile);
            return profile;
          }
        }
      } catch (e) {
        console.warn('Supabase session restore check failed:', e);
      }
      return cachedUser;
    }

    // 2. Local Mode with Server Verification
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            storage.setUser(data.user);
            return data.user;
          }
        } else {
          // Token invalid or expired
          storage.setUser(null);
          storage.setToken(null);
          return null;
        }
      } catch (e) {
        // Network offline, return cached user if available
        return cachedUser;
      }
    }

    return cachedUser;
  },

  /**
   * Request password reset instructions
   */
  async forgotPassword(email: string): Promise<{ 
    message: string; 
    resetCode?: string; 
    emailDeliveryConfigured?: boolean;
    configuredProvider?: string;
  }> {
    if (!email) {
      throw new Error('Please enter your registered email address.');
    }

    // 1. Supabase Mode
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}`
      });
      if (error) {
        const parsed = parseAuthError(error);
        const customErr: any = new Error(parsed.friendlyMessage);
        customErr.isRateLimit = parsed.isRateLimit;
        customErr.isNetworkError = parsed.isNetworkError;
        customErr.retryAfterSeconds = parsed.retryAfterSeconds;
        throw customErr;
      }
      return { 
        message: 'Password recovery email dispatched via Supabase Auth. Please check your inbox for instructions.',
        emailDeliveryConfigured: true,
        configuredProvider: 'Supabase Auth'
      };
    }

    // 2. Local Mode
    const res = await fetch(`${API_BASE}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to request password reset');
    }

    return {
      message: data.message,
      resetCode: data.resetCode,
      emailDeliveryConfigured: Boolean(data.emailDeliveryConfigured),
      configuredProvider: data.configuredProvider || 'None (Local Sandbox)'
    };
  },

  /**
   * Reset password with reset code / token
   */
  async resetPassword(params: {
    email: string;
    code: string;
    newPassword: string;
    confirmNewPassword?: string;
  }): Promise<{ message: string }> {
    const { email, code, newPassword, confirmNewPassword } = params;

    if (!newPassword || newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    if (confirmNewPassword !== undefined && newPassword !== confirmNewPassword) {
      throw new Error('New passwords do not match. Please verify both fields.');
    }

    // 1. Supabase Mode
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw new Error(error.message);
      return { message: 'Password updated successfully!' };
    }

    // 2. Local Mode
    const res = await fetch(`${API_BASE}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword, confirmNewPassword })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Failed to reset password');
    }

    return { message: data.message };
  },

  /**
   * Update profile
   */
  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const currentUser = storage.getUser();
    if (!currentUser) throw new Error('Not authenticated');

    const updated = {
      ...currentUser,
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Save locally
    storage.setUser(updated);

    // Save to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('profiles').update(updates).eq('id', currentUser.id);
      } catch (e) {
        console.warn('Could not sync profile to Supabase:', e);
      }
    } else {
      // Save to server
      const token = storage.getToken();
      if (token) {
        try {
          await fetch(`${API_BASE}/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(updates)
          });
        } catch (e) {
          console.warn('Could not sync profile to server:', e);
        }
      }
    }

    return updated;
  },

  /**
   * Log out
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
      }
    } else {
      const token = storage.getToken();
      if (token) {
        try {
          await fetch(`${API_BASE}/logout`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (e) {
          // Ignore offline errors on logout
        }
      }
    }

    storage.setUser(null);
    storage.setToken(null);
  }
};
