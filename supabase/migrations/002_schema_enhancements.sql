-- =========================================================================
-- Migration 002: Schema Enhancements & Idempotency Updates
-- 1. Adds `source` column to sessions, reports, and resumes with 'ai' | 'fallback' check
-- 2. Adds waitlist table with insert-only RLS
-- 3. Creates missing user_id and composite query performance indexes
-- 4. Upgrades handle_new_user() trigger with search_path protection and safe fallback
-- 5. Adds atomic increment_interview_usage() quota function
-- Idempotent: Can be safely run and re-run on any environment
-- =========================================================================

-- Enable UUID extension if not already present
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- -------------------------------------------------------------------------
-- 1. Add `source` column to existing tables (with fallback default)
-- -------------------------------------------------------------------------
alter table if exists public.interview_sessions 
  add column if not exists source text not null default 'ai';

alter table if exists public.feedback_reports 
  add column if not exists source text not null default 'ai';

alter table if exists public.resume_analyses 
  add column if not exists source text not null default 'ai';

-- Add check constraints idempotently via DO block
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'chk_sessions_source'
  ) then
    alter table public.interview_sessions 
      add constraint chk_sessions_source check (source in ('ai', 'fallback'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'chk_reports_source'
  ) then
    alter table public.feedback_reports 
      add constraint chk_reports_source check (source in ('ai', 'fallback'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'chk_resumes_source'
  ) then
    alter table public.resume_analyses 
      add constraint chk_resumes_source check (source in ('ai', 'fallback'));
  end if;
end $$;

-- -------------------------------------------------------------------------
-- 2. Performance Indexes on user_id and query filters
-- -------------------------------------------------------------------------
create index if not exists idx_sessions_user_id on public.interview_sessions(user_id);
create index if not exists idx_sessions_started_at on public.interview_sessions(started_at desc);
create index if not exists idx_sessions_user_status on public.interview_sessions(user_id, status);

create index if not exists idx_reports_user_id on public.feedback_reports(user_id);
create index if not exists idx_reports_session_id on public.feedback_reports(session_id);
create index if not exists idx_reports_user_created on public.feedback_reports(user_id, created_at desc);

create index if not exists idx_resumes_user_id on public.resume_analyses(user_id);
create index if not exists idx_resumes_created_at on public.resume_analyses(created_at desc);

create index if not exists idx_profiles_email on public.profiles(email);

-- -------------------------------------------------------------------------
-- 3. Provision Waitlist Table with Insert-Only RLS
-- -------------------------------------------------------------------------
create table if not exists public.waitlist (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  plan text not null default 'pro',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_waitlist_email on public.waitlist(email);
create index if not exists idx_waitlist_created_at on public.waitlist(created_at desc);
create unique index if not exists idx_waitlist_email_plan on public.waitlist(lower(email), plan);

-- Enable RLS
alter table public.waitlist enable row level security;

-- Insert-only RLS: Public and authenticated users can insert their emails
drop policy if exists "Enable insert for anyone" on public.waitlist;
create policy "Enable insert for anyone" 
  on public.waitlist for insert 
  to anon, authenticated 
  with check (true);

-- Explicitly ensure public has insert access only
grant insert on public.waitlist to anon, authenticated;

-- -------------------------------------------------------------------------
-- 4. Secure handle_new_user() Trigger Function
-- -------------------------------------------------------------------------
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

-- Rebind trigger safely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -------------------------------------------------------------------------
-- 5. Atomic Quota Functions (consume & increment)
-- -------------------------------------------------------------------------
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

-- Grant execution permissions
grant execute on function public.consume_interview_quota(uuid) to authenticated, anon, service_role;
grant execute on function public.increment_interview_usage(uuid, integer) to authenticated, anon, service_role;

-- -------------------------------------------------------------------------
-- 6. Reload PostgREST Cache
-- -------------------------------------------------------------------------
grant select on public.interview_sessions to anon;
grant select on public.feedback_reports to anon;
grant select on public.resume_analyses to anon;
grant insert, select on public.waitlist to anon, authenticated;
notify pgrst, 'reload schema';
