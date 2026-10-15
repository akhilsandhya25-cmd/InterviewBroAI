import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UsageQuota } from '../types';
import { storage } from '../services/storage';
import { authService } from '../services/authService';
import { isSupabaseConfigured, supabase } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  quota: UsageQuota;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, confirmPassword?: string, fullName?: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ 
    message: string; 
    resetCode?: string; 
    emailDeliveryConfigured?: boolean; 
    configuredProvider?: string; 
  }>;
  resetPassword: (email: string, code: string, newPassword: string, confirmNewPassword?: string) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  decrementInterviewQuota: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => storage.getUser());
  const [quota, setQuota] = useState<UsageQuota>(() => storage.getQuota());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore and verify session on initial mount / page refresh
  useEffect(() => {
    let isMounted = true;

    authService.restoreSession()
      .then((restoredUser) => {
        if (isMounted) {
          setUser(restoredUser);
          if (restoredUser) {
            setQuota(storage.getQuota(restoredUser.id));
            // Hydrate cloud data if Supabase is active
            storage.syncWithCloud(restoredUser.id);
          }
        }
      })
      .catch((err) => {
        console.warn('Session restoration check error:', err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    // Listen for Supabase session changes and token refreshes
    let authListener: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
        if (event === 'TOKEN_REFRESHED' && session?.access_token) {
          storage.setToken(session.access_token);
        } else if (event === 'SIGNED_IN' && session?.user) {
          if (session.access_token) storage.setToken(session.access_token);
          storage.syncWithCloud(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          storage.setUser(null);
          storage.setToken(null);
          if (isMounted) setUser(null);
        }
      });
      authListener = subscription;
    }

    // Refresh quota when storage synchronizes with cloud
    const handleStorageSynced = () => {
      const activeUid = storage.getActiveUserId();
      if (activeUid && isMounted) {
        setQuota(storage.getQuota(activeUid));
      }
    };
    window.addEventListener('interviewbro_storage_synced', handleStorageSynced);

    return () => {
      isMounted = false;
      if (authListener) authListener.unsubscribe();
      window.removeEventListener('interviewbro_storage_synced', handleStorageSynced);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setQuota(storage.getQuota(response.user.id));
      storage.syncWithCloud(response.user.id);
    } finally {
      setIsLoading(false);
    }
  };


  const signup = async (email: string, password: string, confirmPassword?: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const response = await authService.signup({
        email,
        password,
        confirmPassword,
        fullName: fullName || email.split('@')[0]
      });
      setUser(response.user);
      setQuota(storage.getQuota(response.user.id));
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    return await authService.forgotPassword(email);
  };

  const resetPassword = async (email: string, code: string, newPassword: string, confirmNewPassword?: string) => {
    return await authService.resetPassword({ email, code, newPassword, confirmNewPassword });
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await authService.updateProfile(updates);
    setUser(updated);
  };

  const decrementInterviewQuota = (): boolean => {
    const updated = storage.decrementQuota(user?.id);
    setQuota(updated);
    if (user) {
      setUser({
        ...user,
        interviews_remaining: updated.interviewsRemaining,
        total_interviews_taken: updated.interviewsUsed
      });
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        quota,
        isAuthenticated: !!user,
        isLoading,
        isSupabaseConnected: isSupabaseConfigured,
        login,
        signup,
        forgotPassword,
        resetPassword,
        logout,
        updateProfile,
        decrementInterviewQuota
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
