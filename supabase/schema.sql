-- =========================================================================
-- InterviewBro AI - Complete Supabase Database & Security Schema (Master)
-- Compatible with PostgreSQL 15+ with Row Level Security (RLS) & GoTrue Auth
-- Idempotent: Safe to execute and re-execute on fresh or existing databases
-- =========================================================================

-- Enable UUID extension for PostgreSQL
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================================================
-- 1. PROFILES TABLE
-- Contains candidate profile details, career targets, and interview quotas
-- =========================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  role_target text default 'Full Stack Developer',
  experience_level text default 'fresher',
  skills text[] default array['JavaScript', 'React', 'Problem Solving'],
  college text,
  graduation_year text,
  career_goals text,
  interviews_remaining integer default 5,
  total_interviews_taken integer default 0,
  profile_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for profiles
create index if not exists idx_profiles_email on public.profiles(email);

-- Enable Row Level Security (RLS) on profiles
alter table public.profiles enable row level security;

-- Drop existing policies for idempotency
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can delete own profile" on public.profiles;

-- RLS Policy: Users can only view their own profile
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

-- RLS Policy: Users can only insert their own profile
create policy "Users can insert own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- RLS Policy: Users can only update their own profile
create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- RLS Policy: Users can delete their own profile (DPDP Act 2023 Right to Erasure)
create policy "Users can delete own profile" 
  on public.profiles for delete 
  using (auth.uid() = id);


-- =========================================================================
-- 2. AUTH TRIGGER: AUTO-PROVISION PROFILE ROW ON USER SIGNUP
-- =========================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Candidate'
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture',
      null
    )
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Re-create trigger idempotently
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =========================================================================
-- 3. ATOMIC QUOTA MANAGEMENT FUNCTIONS
-- Prevents race conditions and client-side bypass of 5-session limit
-- =========================================================================
create or replace function public.consume_interview_quota(p_user_id uuid)
returns jsonb as $$
declare
  v_used integer;
  v_remaining integer;
  v_limit integer := 5;
begin
  -- Lock candidate row for update to prevent concurrent race conditions
  select coalesce(total_interviews_taken, 0) into v_used
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'USER_NOT_FOUND', 'remaining', 0, 'used', 0);
  end if;

  if v_used >= v_limit then
    return jsonb_build_object(
      'success', false,
      'error', 'QUOTA_EXCEEDED',
      'remaining', 0,
      'used', v_used,
      'limit', v_limit
    );
  end if;

  update public.profiles
  set 
    total_interviews_taken = v_used + 1,
    interviews_remaining = greatest(0, v_limit - (v_used + 1)),
    updated_at = timezone('utc'::text, now())
  where id = p_user_id
  returning total_interviews_taken, interviews_remaining into v_used, v_remaining;

  return jsonb_build_object(
    'success', true,
    'used', v_used,
    'remaining', v_remaining,
    'limit', v_limit
  );
end;
$$ language plpgsql security definer set search_path = public;

-- Explicit quota increment function
create or replace function public.increment_interview_usage(p_user_id uuid, p_increment integer default 1)
returns jsonb as $$
declare
  v_used integer;
  v_remaining integer;
  v_limit integer := 5;
begin
  select coalesce(total_interviews_taken, 0) into v_used
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'USER_NOT_FOUND', 'remaining', 0, 'used', 0);
  end if;

  if (v_used + p_increment) > v_limit then
    return jsonb_build_object(
      'success', false,
      'error', 'QUOTA_EXCEEDED',
      'remaining', greatest(0, v_limit - v_used),
      'used', v_used,
      'limit', v_limit
    );
  end if;

  update public.profiles
  set
    total_interviews_taken = v_used + p_increment,
    interviews_remaining = greatest(0, v_limit - (v_used + p_increment)),
    updated_at = timezone('utc'::text, now())
  where id = p_user_id
  returning total_interviews_taken, interviews_remaining into v_used, v_remaining;

  return jsonb_build_object(
    'success', true,
    'used', v_used,
    'remaining', v_remaining,
    'limit', v_limit
  );
end;
$$ language plpgsql security definer set search_path = public;


-- =========================================================================
-- 4. INTERVIEW SESSIONS TABLE
-- Stores full session metadata, configurations, generated questions, and answers
-- =========================================================================
create table if not exists public.interview_sessions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  config jsonb not null default '{}'::jsonb,
  status text not null default 'setup',
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  elapsed_seconds integer default 0,
  current_question_index integer default 0,
  questions jsonb not null default '[]'::jsonb,
  feedback_report jsonb,
  source text not null default 'ai' check (source in ('ai', 'fallback')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure source column exists if re-running on pre-existing tables
alter table public.interview_sessions 
  add column if not exists source text not null default 'ai';

-- Indexes for performance & user isolation
create index if not exists idx_sessions_user_id on public.interview_sessions(user_id);
create index if not exists idx_sessions_started_at on public.interview_sessions(started_at desc);
create index if not exists idx_sessions_user_status on public.interview_sessions(user_id, status);

-- Enable RLS
alter table public.interview_sessions enable row level security;

-- Drop existing policies for idempotency
drop policy if exists "Users can read own interview sessions" on public.interview_sessions;
drop policy if exists "Users can insert own interview sessions" on public.interview_sessions;
drop policy if exists "Users can update own interview sessions" on public.interview_sessions;
drop policy if exists "Users can delete own interview sessions" on public.interview_sessions;

-- RLS Policies for Sessions: Strictly isolate per user
create policy "Users can read own interview sessions" 
  on public.interview_sessions for select 
  using (auth.uid() = user_id);

create policy "Users can insert own interview sessions" 
  on public.interview_sessions for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own interview sessions" 
  on public.interview_sessions for update 
  using (auth.uid() = user_id);

create policy "Users can delete own interview sessions" 
  on public.interview_sessions for delete 
  using (auth.uid() = user_id);


-- =========================================================================
-- 5. FEEDBACK REPORTS TABLE
-- Stores detailed evaluation reports, rubric scores, and personalized prep plans
-- =========================================================================
create table if not exists public.feedback_reports (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  session_id text not null,
  candidate_name text not null default '',
  role text not null default '',
  company text not null default '',
  interview_type text not null default 'technical',
  source text not null default 'ai' check (source in ('ai', 'fallback')),
  overall_score integer not null default 0,
  technical_accuracy_score integer not null default 0,
  communication_score integer not null default 0,
  structure_star_score integer not null default 0,
  relevance_score integer not null default 0,
  summary text not null default '',
  strengths text[] default array[]::text[],
  weaknesses text[] default array[]::text[],
  missed_concepts text[] default array[]::text[],
  actionable_improvements text[] default array[]::text[],
  recommended_topics text[] default array[]::text[],
  example_improved_answers jsonb not null default '[]'::jsonb,
  prep_plan jsonb not null default '[]'::jsonb,
  questions_evaluated jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure source column exists if re-running on pre-existing tables
alter table public.feedback_reports 
  add column if not exists source text not null default 'ai';

-- Indexes for performance & user isolation
create index if not exists idx_reports_user_id on public.feedback_reports(user_id);
create index if not exists idx_reports_session_id on public.feedback_reports(session_id);
create index if not exists idx_reports_user_created on public.feedback_reports(user_id, created_at desc);

-- Enable RLS
alter table public.feedback_reports enable row level security;

-- Drop existing policies for idempotency
drop policy if exists "Users can read own feedback reports" on public.feedback_reports;
drop policy if exists "Users can insert own feedback reports" on public.feedback_reports;
drop policy if exists "Users can update own feedback reports" on public.feedback_reports;
drop policy if exists "Users can delete own feedback reports" on public.feedback_reports;

create policy "Users can read own feedback reports" 
  on public.feedback_reports for select 
  using (auth.uid() = user_id);

create policy "Users can insert own feedback reports" 
  on public.feedback_reports for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own feedback reports" 
  on public.feedback_reports for update 
  using (auth.uid() = user_id);

create policy "Users can delete own feedback reports" 
  on public.feedback_reports for delete 
  using (auth.uid() = user_id);


-- =========================================================================
-- 6. RESUME ANALYSES TABLE
-- Stores ATS score estimates, extracted skills, gaps, and tailored questions
-- =========================================================================
create table if not exists public.resume_analyses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  file_size integer not null default 0,
  source text not null default 'ai' check (source in ('ai', 'fallback')),
  extracted_skills text[] default array[]::text[],
  missing_skills_for_role text[] default array[]::text[],
  ats_score_estimate integer not null default 0,
  education_found text[] default array[]::text[],
  experience_summary text default '',
  projects_detected text[] default array[]::text[],
  strengths text[] default array[]::text[],
  keyword_gaps text[] default array[]::text[],
  actionable_improvements text[] default array[]::text[],
  tailored_interview_questions text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure source column exists if re-running on pre-existing tables
alter table public.resume_analyses 
  add column if not exists source text not null default 'ai';

-- Indexes for performance & user isolation
create index if not exists idx_resumes_user_id on public.resume_analyses(user_id);
create index if not exists idx_resumes_created_at on public.resume_analyses(created_at desc);

-- Enable RLS
alter table public.resume_analyses enable row level security;

-- Drop existing policies for idempotency
drop policy if exists "Users can read own resume analyses" on public.resume_analyses;
drop policy if exists "Users can insert own resume analyses" on public.resume_analyses;
drop policy if exists "Users can update own resume analyses" on public.resume_analyses;
drop policy if exists "Users can delete own resume analyses" on public.resume_analyses;

create policy "Users can read own resume analyses" 
  on public.resume_analyses for select 
  using (auth.uid() = user_id);

create policy "Users can insert own resume analyses" 
  on public.resume_analyses for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own resume analyses" 
  on public.resume_analyses for update 
  using (auth.uid() = user_id);

create policy "Users can delete own resume analyses" 
  on public.resume_analyses for delete 
  using (auth.uid() = user_id);


-- =========================================================================
-- 7. WAITLIST TABLE (INSERT-ONLY RLS)
-- Stores prospective user registrations for upcoming plans & tiers
-- RLS: Public insert allowed; reading/updating strictly restricted to service role
-- =========================================================================
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  plan text not null default 'pro',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for waitlist
create index if not exists idx_waitlist_email on public.waitlist(email);
create index if not exists idx_waitlist_created_at on public.waitlist(created_at desc);
create unique index if not exists idx_waitlist_email_plan on public.waitlist(lower(email), plan);

-- Enable RLS on waitlist
alter table public.waitlist enable row level security;

-- Insert-only RLS: anyone (anon or authenticated) can submit email to waitlist
drop policy if exists "Enable insert for anyone" on public.waitlist;
create policy "Enable insert for anyone" 
  on public.waitlist for insert 
  to anon, authenticated 
  with check (true);

-- No select, update, or delete policies are created for anon/authenticated.
-- Therefore, by default RLS rules, only service_role can read or manage waitlist entries.


-- =========================================================================
-- 8. PERMISSIONS & ROLE GRANTS
-- Grants access to the public schema and user-owned tables
-- Row Level Security (RLS) ensures candidates only access their own records
-- =========================================================================
grant usage on schema public to anon, authenticated;

-- Profiles
grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.profiles to anon;

-- Application User Data Tables
grant select, insert, update, delete on public.interview_sessions to authenticated;
grant select, insert, update, delete on public.feedback_reports to authenticated;
grant select, insert, update, delete on public.resume_analyses to authenticated;

-- Waitlist (Insert-only for public)
grant insert on public.waitlist to anon, authenticated;

-- Quota RPC Execution
grant execute on function public.consume_interview_quota(uuid) to authenticated, anon, service_role;
grant execute on function public.increment_interview_usage(uuid, integer) to authenticated, anon, service_role;

-- Reload PostgREST schema cache so all tables and columns are immediately discoverable
notify pgrst, 'reload schema';
