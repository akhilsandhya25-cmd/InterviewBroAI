import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from './supabase';
import { storage } from './storage';

const API_BASE = '/api/auth';

/**
 * Safely parse HTTP responses without crashing on empty bodies or HTML error pages.
 * Prevents "Failed to execute 'json' on 'Response': Unexpected end of JSON input".
 */
async function safeParseResponse<T = any>(res: Response): Promise<{ ok: boolean; status: number; data: T | null; errorText: string }> {
  try {
    const rawText = await res.text();
    const trimmed = (rawText || '').trim();
    if (!trimmed) {
      return { 
        ok: res.ok, 
        status: res.status, 
        data: null, 
        errorText: res.ok ? '' : `Server returned HTTP ${res.status} with an empty response.` 
      };
    }

    try {
      const data = JSON.parse(trimmed);
      return { ok: res.ok, status: res.status, data, errorText: '' };
    } catch {
      // Body is not valid JSON (e.g. HTML error page or raw text)
      const sanitized = trimmed.replace(/<[^>]*>?/gm, '').slice(0, 150);
      return { 
        ok: false, 
        status: res.status, 
        data: null, 
        errorText: sanitized || `Server returned HTTP ${res.status} with non-JSON content.` 
      };
    }
  } catch (err: any) {
    return { 
      ok: false, 
      status: res.status, 
      data: null, 
      errorText: err?.message || 'Failed to read response stream from authentication service.' 
    };
  }
}

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
   * Register a new account directly via Supabase Auth serverless API
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
    const cleanFullName = fullName.trim();

    // Direct Supabase SDK signup fallback helper
    const signUpDirectlyWithSupabase = async () => {
      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: { full_name: cleanFullName },
              emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
            }
          });

          if (error) {
            const parsed = parseAuthError(error);
            const err: any = new Error(parsed.friendlyMessage);
            err.isRateLimit = parsed.isRateLimit;
            err.isUserAlreadyExists = parsed.isUserAlreadyExists;
            err.isEmailUnconfirmed = parsed.isEmailUnconfirmed;
            err.retryAfterSeconds = parsed.retryAfterSeconds;
            throw err;
          }

          if (data && (data.user || data.session)) {
            const uid = data.user?.id || `usr-${Date.now()}`;
            const newUser: UserProfile = {
              id: uid,
              email: cleanEmail,
              full_name: cleanFullName,
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
            };

            const sessionToken = data.session?.access_token || (data as any)?.access_token;
            const requiresEmailVerification = !sessionToken;
            if (!requiresEmailVerification) {
              storage.setUser(newUser);
              if (sessionToken) storage.setToken(sessionToken);
            }

            return {
              user: requiresEmailVerification ? (null as any) : newUser,
              token: sessionToken,
              requiresEmailVerification,
              email: cleanEmail,
              message: requiresEmailVerification
                ? "Account created! Please check your inbox to confirm your email before logging in."
                : `Welcome to InterviewBro AI, ${cleanFullName}!`
            };
          }
        } catch (directErr: any) {
          throw directErr;
        }
      }
      const err: any = new Error('Unable to connect to authentication service. Please check your internet connection.');
      err.isNetworkError = true;
      throw err;
    };

    // 1. Primary: Serverless API proxy to Supabase Auth (/api/auth/signup)
    let res: Response | null = null;
    try {
      res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
          confirmPassword,
          fullName: cleanFullName,
          emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        })
      });
    } catch (networkErr: any) {
      console.warn('[AuthService] /api/auth/signup network fetch failed, using direct Supabase fallback:', networkErr?.message || networkErr);
      return await signUpDirectlyWithSupabase();
    }

    // 2. Gateway/Proxy resilience: If serverless proxy returned a 502/503/504 Bad Gateway, immediately fall back to direct Supabase SDK
    if (res && !res.ok && (res.status === 502 || res.status === 503 || res.status === 504)) {
      console.warn(`[AuthService] /api/auth/signup returned HTTP ${res.status}, falling back to direct Supabase SDK.`);
      return await signUpDirectlyWithSupabase();
    }

    const parsed = await safeParseResponse<{
      success?: boolean;
      user?: UserProfile;
      token?: string;
      session?: any;
      requiresEmailVerification?: boolean;
      message?: string;
      error?: string;
      code?: string;
    }>(res);

    if (parsed.ok && parsed.data?.success) {
      const requiresEmailVerification = Boolean(parsed.data.requiresEmailVerification);
      const user = parsed.data.user;
      const token = parsed.data.token || parsed.data.session?.access_token;

      if (!requiresEmailVerification && user) {
        storage.setUser(user);
        if (token) storage.setToken(token);
        if (supabase && parsed.data.session?.access_token && parsed.data.session?.refresh_token) {
          try {
            await supabase.auth.setSession({
              access_token: parsed.data.session.access_token,
              refresh_token: parsed.data.session.refresh_token
            });
          } catch (sessionErr) {
            console.warn('[AuthService] Could not hydrate client Supabase session:', sessionErr);
          }
        }
      }

      return {
        user: requiresEmailVerification ? (null as any) : user!,
        token,
        requiresEmailVerification,
        email: cleanEmail,
        message: parsed.data.message || `Welcome to InterviewBro AI, ${cleanFullName}!`
      };
    }

    // Process structured error response from Supabase Auth / Serverless API
    const errorDetails = parsed.data || { message: parsed.errorText };
    const authErr = parseAuthError(errorDetails);
    const customErr: any = new Error(authErr.friendlyMessage || parsed.data?.message || parsed.errorText || 'Registration failed.');
    customErr.isRateLimit = authErr.isRateLimit;
    customErr.isNetworkError = authErr.isNetworkError;
    customErr.isUserAlreadyExists = authErr.isUserAlreadyExists;
    customErr.isEmailUnconfirmed = authErr.isEmailUnconfirmed;
    customErr.retryAfterSeconds = authErr.retryAfterSeconds;
    customErr.email = cleanEmail;
    throw customErr;
  },

  /**
   * Log into an existing account via Supabase Auth
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    if (!email || !password) {
      throw new Error('Please enter both your email address and password.');
    }

    const cleanEmail = email.trim().toLowerCase();

    // Direct Supabase SDK login fallback helper
    const signInDirectlyWithSupabase = async () => {
      if (supabase) {
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

        if (data?.user && data?.session) {
          let profile: UserProfile | null = null;
          try {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();
            if (profileData) profile = profileData;
          } catch {
            // Non-critical profile fetch
          }

          const user: UserProfile = profile || {
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
            created_at: data.user.created_at,
            updated_at: new Date().toISOString()
          };

          storage.setUser(user);
          storage.setToken(data.session.access_token);
          return { user, token: data.session.access_token };
        }
      }

      const err: any = new Error('Unable to connect to authentication service. Please check your internet connection.');
      err.isNetworkError = true;
      throw err;
    };

    // 1. Primary: Serverless API proxy to Supabase Auth (/api/auth/login)
    let res: Response | null = null;
    try {
      res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: cleanEmail,
          password
        })
      });
    } catch (networkErr: any) {
      console.warn('[AuthService] /api/auth/login network fetch failed, using direct Supabase fallback:', networkErr?.message || networkErr);
      return await signInDirectlyWithSupabase();
    }

    // 2. Gateway/Proxy resilience: If serverless proxy returned 502/503/504 Bad Gateway, immediately fall back to direct Supabase SDK
    if (res && !res.ok && (res.status === 502 || res.status === 503 || res.status === 504)) {
      console.warn(`[AuthService] /api/auth/login returned HTTP ${res.status}, falling back to direct Supabase SDK.`);
      return await signInDirectlyWithSupabase();
    }

    const parsed = await safeParseResponse<{
      success?: boolean;
      user?: UserProfile;
      token?: string;
      session?: any;
      message?: string;
      error?: string;
    }>(res);

    if (parsed.ok && parsed.data?.success && parsed.data.user) {
      const user = parsed.data.user;
      const token = parsed.data.token || parsed.data.session?.access_token;
      storage.setUser(user);
      if (token) storage.setToken(token);
      if (supabase && parsed.data.session) {
        try {
          await supabase.auth.setSession(parsed.data.session);
        } catch {
          // Non-critical SDK session sync
        }
      }
      return {
        user,
        token,
        message: parsed.data.message || 'Login successful'
      };
    }

    // Process structured error response
    const errorDetails = parsed.data || { message: parsed.errorText };
    const authErr = parseAuthError(errorDetails);
    const customErr: any = new Error(authErr.friendlyMessage || parsed.data?.message || parsed.errorText || 'Authentication failed. Please verify your credentials.');
    customErr.isRateLimit = authErr.isRateLimit;
    customErr.isNetworkError = authErr.isNetworkError;
    customErr.isEmailUnconfirmed = authErr.isEmailUnconfirmed;
    customErr.retryAfterSeconds = authErr.retryAfterSeconds;
    customErr.unconfirmedEmail = cleanEmail;
    throw customErr;
  },

  /**
   * Resend signup email verification link
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
    if (!email || !email.trim()) {
      throw new Error('Please enter your email address to resend the verification link.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim().toLowerCase();
    if (!emailRegex.test(cleanEmail)) {
      throw new Error('Please enter a valid email address.');
    }

    // Direct client-side Supabase SDK resend (requires no backend endpoint)
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

    throw new Error('Verification email service is unavailable. Please check your connection.');
  },

  /**
   * Initiate Google OAuth Sign-In via Supabase Auth
   */
  async signInWithGoogle(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined
        }
      });
      if (error) {
        throw new Error(error.message || 'Google sign-in could not be initiated.');
      }
      return;
    }
    throw new Error('Google Sign-In is unavailable because Supabase is not configured.');
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
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Supabase stored session invalid, resetting auth state:', error.message);
          await supabase.auth.signOut().catch(() => {});
          storage.setToken(null);
          storage.setUser(null);
          return null;
        }

        if (data?.session?.user) {
          if (data.session.access_token) {
            storage.setToken(data.session.access_token);
          }
          let profile: UserProfile | null = null;
          try {
            const { data: profileData, error: pErr } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .maybeSingle();

            if (!pErr && profileData) {
              profile = profileData;
            }
          } catch (e) {
            // Handled if DB table not yet created
          }

          const userToSet: UserProfile = profile || {
            id: data.session.user.id,
            email: data.session.user.email || (cachedUser?.email || ''),
            full_name: data.session.user.user_metadata?.full_name || cachedUser?.full_name || (data.session.user.email ? data.session.user.email.split('@')[0] : 'Candidate'),
            role_target: cachedUser?.role_target || '',
            experience_level: cachedUser?.experience_level || 'fresher',
            college: cachedUser?.college || '',
            graduation_year: cachedUser?.graduation_year || '',
            skills: cachedUser?.skills || [],
            career_goals: cachedUser?.career_goals || '',
            interviews_remaining: cachedUser?.interviews_remaining ?? 9999,
            total_interviews_taken: cachedUser?.total_interviews_taken ?? 0,
            profile_completed: cachedUser?.profile_completed ?? Boolean(cachedUser?.role_target && cachedUser?.skills && cachedUser.skills.length > 0),
            created_at: data.session.user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          storage.setUser(userToSet);
          return userToSet;
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

        const parsed = await safeParseResponse<{ user: UserProfile }>(res);
        if (parsed.ok && parsed.data?.user) {
          storage.setUser(parsed.data.user);
          return parsed.data.user;
        } else if (!parsed.ok && (parsed.status === 401 || parsed.status === 403)) {
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
    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const parsed = await safeParseResponse<any>(res);
      if (parsed.ok && parsed.data) {
        return {
          message: parsed.data.message || 'Password reset instructions dispatched.',
          resetCode: parsed.data.resetCode,
          emailDeliveryConfigured: Boolean(parsed.data.emailDeliveryConfigured),
          configuredProvider: parsed.data.configuredProvider || 'None (Local Sandbox)'
        };
      }

      if (parsed.data?.message || parsed.data?.error) {
        throw new Error(parsed.data.message || parsed.data.error);
      }

      throw new Error(parsed.errorText || 'Failed to request password reset. Please try again.');
    } catch (err: any) {
      if (err.message && !err.message.includes('JSON')) {
        throw err;
      }
      throw new Error('Password reset service is temporarily unavailable. Please try again later.');
    }
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
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword, confirmNewPassword })
      });

      const parsed = await safeParseResponse<any>(res);
      if (parsed.ok && parsed.data) {
        return { message: parsed.data.message || 'Password updated successfully!' };
      }

      if (parsed.data?.message || parsed.data?.error) {
        throw new Error(parsed.data.message || parsed.data.error);
      }

      throw new Error(parsed.errorText || 'Failed to reset password. Please try again.');
    } catch (err: any) {
      if (err.message && !err.message.includes('JSON')) {
        throw err;
      }
      throw new Error('Password reset service returned an unexpected response. Please try again.');
    }
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
