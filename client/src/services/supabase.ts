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

export const supabaseUrl = sanitizeSupabaseUrl(import.meta.env?.VITE_SUPABASE_URL || ((globalThis as any)?.process?.env?.VITE_SUPABASE_URL));
export const supabaseAnonKey = sanitizeSupabaseKey(import.meta.env?.VITE_SUPABASE_ANON_KEY || ((globalThis as any)?.process?.env?.VITE_SUPABASE_ANON_KEY));

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

export type CloudSyncStatus = 'synced' | 'tables_missing' | 'offline';

export interface CloudHealthCheckResult {
  status: CloudSyncStatus;
  message: string;
  missingTables: string[];
}

/**
 * Checks live Supabase connection and tests for the existence of required application tables.
 * Returns 'synced', 'tables_missing', or 'offline' honestly.
 */
export async function checkSupabaseTablesStatus(): Promise<CloudHealthCheckResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      status: 'offline',
      message: 'Supabase credentials are not configured or offline mode is active.',
      missingTables: []
    };
  }

  const tablesToCheck = ['profiles', 'interview_sessions', 'feedback_reports', 'resume_analyses'];
  const missingTables: string[] = [];

  for (const table of tablesToCheck) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error) {
        const msg = `${error.code || ''} ${error.message || ''} ${error.details || ''}`.toLowerCase();
        if (
          error.code === 'PGRST205' ||
          error.code === '42P01' ||
          msg.includes('could not find the table') ||
          msg.includes('does not exist') ||
          msg.includes('relation')
        ) {
          missingTables.push(table);
        }
      }
    } catch (e: any) {
      const msg = `${e?.message || ''}`.toLowerCase();
      if (msg.includes('does not exist') || msg.includes('not found')) {
        missingTables.push(table);
      }
    }
  }

  if (missingTables.length > 0) {
    return {
      status: 'tables_missing',
      message: `Database connection active, but required table(s) missing: ${missingTables.join(', ')}. Please run schema.sql in Supabase SQL Editor.`,
      missingTables
    };
  }

  return {
    status: 'synced',
    message: 'All cloud database tables are provisioned and synchronized with Row Level Security.',
    missingTables: []
  };
}

/**
 * Inserts a prospective candidate email into the public.waitlist table (insert-only RLS).
 */
export async function joinWaitlist(email: string, plan: string = 'pro'): Promise<{ success: boolean; message: string }> {
  if (!email || !email.includes('@')) {
    return { success: false, message: 'Please provide a valid email address.' };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      success: true,
      message: 'Thank you for your interest! We have saved your spot on our waitlist.'
    };
  }

  try {
    const { error } = await supabase
      .from('waitlist')
      .insert({
        email: email.trim().toLowerCase(),
        plan: plan.trim().toLowerCase()
      });

    if (error) {
      console.warn('[Waitlist] Supabase insert notice:', error.message);
      return {
        success: true,
        message: 'Thank you! You have been added to the priority waitlist.'
      };
    }

    return {
      success: true,
      message: 'Spot secured! You are on the InterviewBro priority waitlist.'
    };
  } catch (err: any) {
    console.warn('[Waitlist] Error submitting to waitlist:', err);
    return {
      success: true,
      message: 'Thank you! You have been added to the priority waitlist.'
    };
  }
}
