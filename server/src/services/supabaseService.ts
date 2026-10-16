import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment configurations from root and server directories
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isServerSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseUrl.includes('your-supabase-url')
);

export const serverSupabase: SupabaseClient | null = isServerSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

/**
 * Verify a Supabase JWT access token on the server
 */
export async function verifySupabaseToken(token: string): Promise<{ id: string; email: string; full_name: string } | null> {
  if (!isServerSupabaseConfigured || !serverSupabase) return null;

  try {
    const { data, error } = await serverSupabase.auth.getUser(token);
    if (error || !data?.user) {
      return null;
    }

    const user = data.user;
    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'User')
    };
  } catch (err) {
    console.warn('Error verifying Supabase token on backend:', err);
    return null;
  }
}

/**
 * Fetch user profile from Supabase 'profiles' table
 */
export async function getSupabaseProfile(userId: string) {
  if (!isServerSupabaseConfigured || !serverSupabase) return null;

  try {
    const { data, error } = await serverSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.warn('Error fetching Supabase profile:', err);
    return null;
  }
}

/**
 * Update user profile in Supabase 'profiles' table
 */
export async function updateSupabaseProfile(userId: string, updates: any) {
  if (!isServerSupabaseConfigured || !serverSupabase) return null;

  try {
    const { data, error } = await serverSupabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'Failed to update profile in Supabase');
  }
}
