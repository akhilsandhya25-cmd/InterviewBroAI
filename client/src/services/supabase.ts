import { createClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://ochbpanyltnoltelpguk.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_MqZB3tEluAhgl6NAqhyxew_6NQ1vYp2';

function sanitizeSupabaseUrl(raw?: string): string {
  if (!raw || typeof raw !== 'string') return DEFAULT_SUPABASE_URL;
  const trimmed = raw.trim();
  if (
    !trimmed.startsWith('http') ||
    trimmed.includes('undefined') ||
    trimmed.includes('null') ||
    trimmed.includes('your-supabase-url') ||
    trimmed.includes('your-project-id')
  ) {
    return DEFAULT_SUPABASE_URL;
  }
  return trimmed.replace(/\/+$/, '');
}

function sanitizeSupabaseKey(raw?: string): string {
  if (!raw || typeof raw !== 'string') return DEFAULT_SUPABASE_ANON_KEY;
  const trimmed = raw.trim();
  if (
    trimmed.length < 20 ||
    trimmed.includes('undefined') ||
    trimmed.includes('null') ||
    trimmed.includes('your-supabase-anon-key')
  ) {
    return DEFAULT_SUPABASE_ANON_KEY;
  }
  return trimmed;
}

export const supabaseUrl = sanitizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
export const supabaseAnonKey = sanitizeSupabaseKey(import.meta.env.VITE_SUPABASE_ANON_KEY);

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') && 
  !supabaseUrl.includes('your-supabase-url') &&
  !supabaseUrl.includes('your-project-id')
);

// Resilient Supabase client with isolated storage key and token refresh
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'interviewbro_supabase_auth'
      }
    })
  : (null as any);
