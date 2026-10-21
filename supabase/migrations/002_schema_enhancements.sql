-- =========================================================================
-- Migration 002: Schema Hardening, Complete Tables & Quota Atomic RPC
-- Idempotent: Safe to re-run on fresh or existing databases
-- =========================================================================

-- Enable UUID extension for PostgreSQL
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. INTERVIEW SESSIONS TABLE
create table if not exists public.interview_sessions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Mock Interview',
  config jsonb not null default '{}'::jsonb,
  status text not null default 'setup',
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  completed_at timestamp with time zone,
  elapsed_seconds integer default 0,
  current_question_index integer default 0,
  questions jsonb not null default '[]'::jsonb,
  feedback_report jsonb,
  source text not null default 'ai',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_sessions_user_id on public.interview_sessions(user_id);
create index if not exists idx_sessions_started_at on public.interview_sessions(started_at desc);

alter table public.interview_sessions enable row level security;
drop policy if exists "Users can access own interview sessions" on public.interview_sessions;
create policy "Users can access own interview sessions" on public.interview_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2. FEEDBACK REPORTS TABLE
create table if not exists public.feedback_reports (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  session_id text not null,
  candidate_name text not null default '',
  role text not null default '',
  company text not null default '',
  interview_type text not null default 'technical',
  source text not null default 'ai',
  rubric_version text default 'rubric_v2_multitrack',
  overall_score integer not null default 0,
  pillars jsonb not null default '{}'::jsonb,
  performance_tier text not null default 'Needs Practice',
  strengths text[] default array[]::text[],
  growth_areas text[] default array[]::text[],
  actionable_drills text[] default array[]::text[],
  readiness_status text default 'Practice Recommended',
  market_percentile integer default 50,
  report_summary text default '',
  question_evaluations jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_feedback_user_id on public.feedback_reports(user_id);
create index if not exists idx_feedback_session_id on public.feedback_reports(session_id);

alter table public.feedback_reports enable row level security;
drop policy if exists "Users can access own feedback reports" on public.feedback_reports;
create policy "Users can access own feedback reports" on public.feedback_reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. RESUME ANALYSES TABLE
create table if not exists public.resume_analyses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  file_size integer not null default 0,
  role_target text not null default '',
  source text not null default 'ai',
  ats_score integer not null default 0,
  key_findings text[] default array[]::text[],
  missing_keywords text[] default array[]::text[],
  formatting_feedback text[] default array[]::text[],
  bullet_point_improvements jsonb default '[]'::jsonb,
  parsed_skills text[] default array[]::text[],
  summary text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_resume_user_id on public.resume_analyses(user_id);

alter table public.resume_analyses enable row level security;
drop policy if exists "Users can access own resume analyses" on public.resume_analyses;
create policy "Users can access own resume analyses" on public.resume_analyses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 4. WAITLIST TABLE
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  plan text not null default 'pro',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_waitlist_email on public.waitlist(email);
create unique index if not exists idx_waitlist_email_plan on public.waitlist(lower(email), plan);

alter table public.waitlist enable row level security;
drop policy if exists "Anyone can join waitlist" on public.waitlist;
create policy "Anyone can join waitlist" on public.waitlist for insert with check (true);

-- 5. ATOMIC QUOTA MANAGEMENT FUNCTIONS
create or replace function public.consume_interview_quota(p_user_id uuid)
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

-- 6. ROLE GRANTS
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated, anon;
grant select, insert, update, delete on public.interview_sessions to authenticated, anon;
grant select, insert, update, delete on public.feedback_reports to authenticated, anon;
grant select, insert, update, delete on public.resume_analyses to authenticated, anon;
grant insert, select on public.waitlist to authenticated, anon;

grant execute on function public.consume_interview_quota(uuid) to authenticated, anon, service_role;
grant execute on function public.increment_interview_usage(uuid, integer) to authenticated, anon, service_role;

notify pgrst, 'reload schema';
