import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UsageQuota } from '../types';
import { storage } from '../services/storage';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  quota: UsageQuota;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  login: (email: string, fullName?: string) => Promise<void>;
  signup: (email: string, password?: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  decrementInterviewQuota: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => storage.getUser());
  const [quota, setQuota] = useState<UsageQuota>(() => storage.getQuota());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // If Supabase is configured, check active session
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then((res: any) => {
        const session = res?.data?.session;
        if (session?.user) {
          // Fetch profile from supabase
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then((profileRes: any) => {
              if (profileRes?.data) {
                setUser(profileRes.data);
                storage.setUser(profileRes.data);
              }
            });
        }
        setIsLoading(false);
      });

      const { data: authData } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        if (session?.user) {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then((profileRes: any) => {
              if (profileRes?.data) {
                setUser(profileRes.data);
                storage.setUser(profileRes.data);
              }
            });
        }
      });
      const subscription = authData?.subscription;

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, fullName?: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithOtp({ email });
        if (error) throw error;
      }
      
      const existingUser = storage.getUser();
      const updated: UserProfile = {
        ...existingUser,
        email,
        full_name: fullName || existingUser.full_name || email.split('@')[0],
        updated_at: new Date().toISOString()
      };
      storage.setUser(updated);
      setUser(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, _password?: string, fullName?: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase.auth.signUp({
          email,
          password: _password || 'InterviewBro@2025',
          options: { data: { full_name: fullName } }
        });
        if (error) throw error;
      }

      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email,
        full_name: fullName || email.split('@')[0],
        role_target: 'Full Stack Developer',
        experience_level: 'fresher',
        skills: ['JavaScript', 'React', 'Problem Solving'],
        interviews_remaining: 5,
        total_interviews_taken: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      storage.setUser(newUser);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    // We don't wipe data so user can log right back in demo mode
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    setUser(updated);
    storage.setUser(updated);

    if (isSupabaseConfigured && supabase) {
      supabase.from('profiles').update(updates).eq('id', user.id).then();
    }
  };

  const decrementInterviewQuota = (): boolean => {
    const currentQuota = storage.getQuota();
    if (currentQuota.interviewsRemaining <= 0) {
      return false;
    }
    const updated = storage.decrementQuota();
    setQuota(updated);
    if (user) {
      setUser({ ...user, interviews_remaining: updated.interviewsRemaining, total_interviews_taken: updated.interviewsUsed });
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
