-- =========================================================================
-- Migration 006: Security Hardening & Strict Row-Level Security (RLS) Master
-- 
-- 1. Enforces Row Level Security (RLS) on all application tables.
-- 2. Restricts user profiles, interview sessions, reports, and resumes strictly to row owners (auth.uid() = user_id).
-- 3. Fixes user_feedback and waitlist information leakage: revokes public/anon SELECT policies.
-- 4. Ensures DPDP Act compliance and prevents unauthorized data exposure.
-- =========================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================================================
-- 1. PROFILES SECURITY HARDENING
-- =========================================================================
alter table if exists public.profiles enable row level security;

-- Drop legacy broad policies
drop policy if exists "Users can access own profile" on public.profiles;
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;

-- Granular per-operation policies for profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- =========================================================================
-- 2. INTERVIEW SESSIONS SECURITY HARDENING
-- =========================================================================
alter table if exists public.interview_sessions enable row level security;

drop policy if exists "Users can access own interview sessions" on public.interview_sessions;
drop policy if exists "interview_sessions_owner_access" on public.interview_sessions;

create policy "interview_sessions_select_own" on public.interview_sessions
  for select using (auth.uid() = user_id);

create policy "interview_sessions_insert_own" on public.interview_sessions
  for insert with check (auth.uid() = user_id);

create policy "interview_sessions_update_own" on public.interview_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "interview_sessions_delete_own" on public.interview_sessions
  for delete using (auth.uid() = user_id);

-- =========================================================================
-- 3. FEEDBACK REPORTS SECURITY HARDENING
-- =========================================================================
alter table if exists public.feedback_reports enable row level security;

drop policy if exists "Users can access own feedback reports" on public.feedback_reports;
drop policy if exists "feedback_reports_owner_access" on public.feedback_reports;

create policy "feedback_reports_select_own" on public.feedback_reports
  for select using (auth.uid() = user_id);

create policy "feedback_reports_insert_own" on public.feedback_reports
  for insert with check (auth.uid() = user_id);

create policy "feedback_reports_update_own" on public.feedback_reports
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "feedback_reports_delete_own" on public.feedback_reports
  for delete using (auth.uid() = user_id);

-- =========================================================================
-- 4. RESUME ANALYSES SECURITY HARDENING
-- =========================================================================
alter table if exists public.resume_analyses enable row level security;

drop policy if exists "Users can access own resume analyses" on public.resume_analyses;
drop policy if exists "resume_analyses_owner_access" on public.resume_analyses;

create policy "resume_analyses_select_own" on public.resume_analyses
  for select using (auth.uid() = user_id);

create policy "resume_analyses_insert_own" on public.resume_analyses
  for insert with check (auth.uid() = user_id);

create policy "resume_analyses_update_own" on public.resume_analyses
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "resume_analyses_delete_own" on public.resume_analyses
  for delete using (auth.uid() = user_id);

-- =========================================================================
-- 5. SKILLS SECURITY HARDENING
-- =========================================================================
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'skills') then
    alter table public.skills enable row level security;
    drop policy if exists "Users can access own skills" on public.skills;
    
    create policy "skills_select_own" on public.skills
      for select using (auth.uid() = user_id);
    create policy "skills_insert_own" on public.skills
      for insert with check (auth.uid() = user_id);
    create policy "skills_update_own" on public.skills
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
    create policy "skills_delete_own" on public.skills
      for delete using (auth.uid() = user_id);
  end if;
end $$;

-- =========================================================================
-- 6. WAITLIST SECURITY HARDENING (PREVENT EMAIL HARVESTING)
-- =========================================================================
alter table if exists public.waitlist enable row level security;

drop policy if exists "Anyone can join waitlist" on public.waitlist;
drop policy if exists "Anyone can read waitlist" on public.waitlist;
drop policy if exists "waitlist_insert_public" on public.waitlist;
drop policy if exists "waitlist_select_admin" on public.waitlist;

-- Public can insert valid email entries only
create policy "waitlist_insert_public" on public.waitlist
  for insert with check (email is not null and length(trim(email)) > 3);

-- Revoke public SELECT on waitlist: prevents competitors or scrapers from dumping waitlist emails
revoke select on public.waitlist from anon;
revoke select on public.waitlist from authenticated;
grant select on public.waitlist to service_role;

-- =========================================================================
-- 7. USER & FRIEND FEEDBACK SECURITY HARDENING (PREVENT PII EXPOSURE)
-- =========================================================================
alter table if exists public.user_feedback enable row level security;

-- Add optional user_id linkage if not already present
alter table if exists public.user_feedback
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- CRITICAL FIX: Drop legacy permissive policy that allowed anyone to read all feedback
drop policy if exists "Anyone can read feedback" on public.user_feedback;
drop policy if exists "Anyone can submit feedback" on public.user_feedback;
drop policy if exists "feedback_insert_public" on public.user_feedback;
drop policy if exists "feedback_select_owner" on public.user_feedback;

-- Anyone can submit feedback with valid content
create policy "feedback_insert_public" on public.user_feedback
  for insert with check (message is not null and length(trim(message)) > 0);

-- Only authenticated authors can inspect their own feedback submissions
create policy "feedback_select_owner" on public.user_feedback
  for select using (auth.uid() is not null and auth.uid() = user_id);

-- Revoke broad anonymous SELECT privileges; only service_role (backend API) has full admin review
revoke select on public.user_feedback from anon;
grant select on public.user_feedback to service_role;

-- =========================================================================
-- 8. REFRESH POSTGREST SCHEMA CACHE
-- =========================================================================
notify pgrst, 'reload schema';
