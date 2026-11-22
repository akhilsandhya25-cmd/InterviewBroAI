-- =========================================================================
-- Migration 005: Ultra-Simple Candidate Profile Architecture
-- 
-- Consolidates all candidate information into:
-- 1. public.profiles (Identity, 4 Core Fields, Optional Details, Auto-Generated Stats)
-- 2. public.skills (Candidate skill tags with RLS)
--
-- Drops complex satellite tables cleanly and preserves historical data.
-- =========================================================================

-- 1. Add / ensure simple profile fields on public.profiles
alter table public.profiles
  add column if not exists current_status text default 'Student', -- Student, Fresher, Job seeker, Working professional
  add column if not exists education_level text default 'UG', -- Diploma, UG, PG, Professional
  add column if not exists degree_stream text default 'B.Tech Computer Science', -- e.g. B.Com, B.Tech, MBA, BCA
  add column if not exists target_role text default 'Software Engineer', -- Target job role
  add column if not exists city text,
  add column if not exists college text,
  add column if not exists graduation_year text,
  add column if not exists preferred_language text default 'English',
  add column if not exists interview_mode text default 'voice', -- voice or text
  add column if not exists resume_file_name text,
  add column if not exists resume_text text,
  add column if not exists readiness_score integer default 70,
  add column if not exists readiness_breakdown jsonb default '{"hr": 70, "technical": 70, "communication": 70}'::jsonb,
  add column if not exists strengths text[] default array[]::text[],
  add column if not exists weak_areas text[] default array[]::text[];

-- Ensure default quota
alter table public.profiles alter column interviews_remaining set default 5;
alter table public.profiles alter column total_interviews_taken set default 0;

-- 2. Simple Skills Table
create table if not exists public.skills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  skill_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_skill_name unique (user_id, skill_name)
);

create index if not exists idx_skills_user_id on public.skills(user_id);
create index if not exists idx_skills_name on public.skills(skill_name);

alter table public.skills enable row level security;
drop policy if exists "Users can access own skills" on public.skills;
create policy "Users can access own skills" on public.skills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update, delete on public.skills to authenticated, anon, service_role;

-- 3. Migrate any existing data from candidate_skills into skills if table exists
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'candidate_skills') then
    insert into public.skills (user_id, skill_name)
    select user_id, name from public.candidate_skills
    on conflict (user_id, skill_name) do nothing;
  end if;
end $$;

-- 4. Clean up satellite tables to remove unnecessary schema overhead
drop table if exists public.candidate_feedback_scores cascade;
drop table if exists public.candidate_resumes cascade;
drop table if exists public.candidate_experience cascade;
drop table if exists public.candidate_education cascade;
drop table if exists public.candidate_skills cascade;

-- 5. Updated Right-to-Erasure RPC function
create or replace function public.delete_candidate_data(p_user_id uuid)
returns jsonb as $$
begin
  if auth.uid() <> p_user_id and current_user not in ('service_role', 'postgres', 'supabase_admin') then
    return jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
  end if;

  delete from public.skills where user_id = p_user_id;
  delete from public.feedback_reports where user_id = p_user_id;
  delete from public.interview_sessions where user_id = p_user_id;
  delete from public.resume_analyses where user_id = p_user_id;
  delete from public.profiles where id = p_user_id;

  return jsonb_build_object('success', true, 'message', 'All candidate data erased successfully.');
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.delete_candidate_data(uuid) to authenticated, anon, service_role;

notify pgrst, 'reload schema';
