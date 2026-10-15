import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';
import { storage } from './storage';

const API_BASE = '/api/auth';

export interface AuthResponse {
  user: UserProfile;
  token?: string;
  message?: string;
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

    // 1. If Supabase is connected, register with Supabase Auth
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const uid = data.user?.id || `usr-${Date.now()}`;
      const newUser: UserProfile = {
        id: uid,
        email: email.trim().toLowerCase(),
        full_name: fullName.trim(),
        role_target: 'Full Stack Developer',
        experience_level: 'fresher',
        skills: ['JavaScript', 'React', 'Problem Solving'],
        interviews_remaining: 9999,
        total_interviews_taken: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      storage.setUser(newUser);
      if (data.session?.access_token) {
        storage.setToken(data.session.access_token);
      }
      return { user: newUser, token: data.session?.access_token };
    }

    // 2. Local Secure Server Mode (Express API with salted hash)
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, confirmPassword, fullName })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Registration failed');
    }

    storage.setUser(data.user);
    storage.setToken(data.token);
    return { user: data.user, token: data.token };
  },

  /**
   * Log into an existing account
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    if (!email || !password) {
      throw new Error('Please enter both your email address and password.');
    }

    // 1. Supabase Mode
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        throw new Error(error.message);
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
        email: data.user.email || email,
        full_name: data.user.user_metadata?.full_name || email.split('@')[0],
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
      body: JSON.stringify({ email, password })
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
      if (error) throw new Error(error.message);
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
