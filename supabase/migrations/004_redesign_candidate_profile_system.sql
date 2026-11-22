-- =========================================================================
-- Migration 004: Normalized Candidate Profile Architecture
-- 
-- Replaces single-row giant profile with separate normalized relational tables:
-- 1. public.profiles (Identity, contact, status, targets, baseline, quotas)
-- 2. public.candidate_education (Stream-agnostic degrees, streams, institutions, grades)
-- 3. public.candidate_experience (Work experience, internships, projects, leadership)
-- 4. public.candidate_skills (Skill tags with self-ratings & categories)
-- 5. public.candidate_resumes (Multi-version resume intelligence & parsed data)
-- 6. public.candidate_feedback_scores (Historical scores, strength & gap analytics)
--
-- Includes data migration from legacy columns, RLS policies, and "delete my data" RPC.
-- Idempotent & non-destructive data migration.
-- =========================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================================================
-- 1. UPGRADE PUBLIC.PROFILES TABLE
-- =========================================================================
alter table public.profiles
  add column if not exists city_state text,
  add column if not exists preferred_interview_language text default 'English',
  add column if not exists current_status text default 'Student', -- Student, Fresher, Job seeker, Working professional
  add column if not exists target_roles text[] default array['Software Engineer'],
  add column if not exists primary_target_role text default 'Software Engineer',
  add column if not exists target_industry text default 'Technology',
  add column if not exists interview_type_focus text default 'Technical', -- HR, Technical, Domain, Group discussion, Mixed
  add column if not exists company_type_preference text default 'Not sure', -- Startup, MNC, PSU-Government, Not sure
  add column if not exists preparation_timeline text default '1 month', -- 1 week, 1 month, exploring
  add column if not exists self_reported_comfort jsonb default '{"nervous": false, "englishFluency": "comfortable", "freezesOnTechnical": false}'::jsonb,
  add column if not exists communication_baseline jsonb default '{"confidence": 75, "clarity": 75, "pace": "moderate", "fillerWordsPerMin": 2, "answerStructureStar": 70}'::jsonb,
  add column if not exists preferences jsonb default '{"deliveryMode": "voice", "difficulty": "intermediate", "sessionLengthMinutes": 15, "remindersEnabled": true, "accessibilityNeeds": "", "languageMix": "English"}'::jsonb,
  add column if not exists readiness_scores jsonb default '{"overall": 70, "hr": 70, "technical": 70, "communication": 70, "resume": 70}'::jsonb,
  add column if not exists weak_areas text[] default array[]::text[],
  add column if not exists strength_areas text[] default array[]::text[];

-- Update status constraint or defaults
alter table public.profiles alter column interviews_remaining set default 5;
alter table public.profiles alter column total_interviews_taken set default 0;

-- =========================================================================
-- 2. CANDIDATE EDUCATION TABLE (Stream-Agnostic)
-- =========================================================================
create table if not exists public.candidate_education (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  education_level text not null default 'undergraduate', -- diploma, undergraduate, postgraduate, professional
  degree text not null default 'Bachelor of Technology',
  stream text not null default 'Engineering & Technology',
  specialization text,
  institution text not null default '',
  year_of_study text, -- e.g. "3rd Year", "Final Year"
  graduation_year text, -- e.g. "2026"
  score_cgpa_percentage text, -- e.g. "8.5 CGPA" or "82%"
  key_subjects text[] default array[]::text[],
  is_primary boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_education_user_id on public.candidate_education(user_id);
create index if not exists idx_education_level on public.candidate_education(education_level);
create index if not exists idx_education_stream on public.candidate_education(stream);

alter table public.candidate_education enable row level security;
drop policy if exists "Users can access own education" on public.candidate_education;
create policy "Users can access own education" on public.candidate_education
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================================
-- 3. CANDIDATE EXPERIENCE & PROJECTS TABLE
-- =========================================================================
create table if not exists public.candidate_experience (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null default 'project', -- project, internship, work_experience, certification, achievement, leadership
  title text not null,
  organization text, -- company name, college, club, or issuing body
  start_date text,
  end_date text,
  is_current boolean default false,
  description text default '',
  tech_tools text[] default array[]::text[],
  outcome_metric text, -- e.g. "Improved query performance by 40%"
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_experience_user_id on public.candidate_experience(user_id);
create index if not exists idx_experience_category on public.candidate_experience(category);

alter table public.candidate_experience enable row level security;
drop policy if exists "Users can access own experience" on public.candidate_experience;
create policy "Users can access own experience" on public.candidate_experience
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================================
-- 4. CANDIDATE SKILLS TABLE
-- =========================================================================
create table if not exists public.candidate_skills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text default 'Technical', -- Technical, Domain, Communication, Analytical, Management
  self_rating text not null default 'Intermediate', -- Beginner, Intermediate, Advanced, Expert
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_skill unique (user_id, name)
);

create index if not exists idx_skills_user_id on public.candidate_skills(user_id);
create index if not exists idx_skills_category on public.candidate_skills(category);

alter table public.candidate_skills enable row level security;
drop policy if exists "Users can access own skills" on public.candidate_skills;
create policy "Users can access own skills" on public.candidate_skills
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================================
-- 5. CANDIDATE RESUMES TABLE (Multiple versions per target role)
-- =========================================================================
create table if not exists public.candidate_resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  file_size integer not null default 0,
  storage_path text,
  target_role text not null default 'General',
  resume_score integer default 0,
  parsed_data jsonb default '{}'::jsonb,
  strengths text[] default array[]::text[],
  gaps text[] default array[]::text[],
  suggested_fixes text[] default array[]::text[],
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_candidate_resumes_user on public.candidate_resumes(user_id);
create index if not exists idx_candidate_resumes_role on public.candidate_resumes(target_role);

alter table public.candidate_resumes enable row level security;
drop policy if exists "Users can access own resumes" on public.candidate_resumes;
create policy "Users can access own resumes" on public.candidate_resumes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================================
-- 6. CANDIDATE FEEDBACK SCORES & ANALYTICS TABLE
-- =========================================================================
create table if not exists public.candidate_feedback_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  session_id text not null,
  overall_score integer not null default 0,
  hr_score integer default 0,
  technical_score integer default 0,
  communication_score integer default 0,
  resume_score integer default 0,
  strengths text[] default array[]::text[],
  weak_areas text[] default array[]::text[],
  confidence_rating integer default 70,
  clarity_rating integer default 70,
  pacing_rating text default 'good',
  filler_word_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_feedback_scores_user on public.candidate_feedback_scores(user_id);
create index if not exists idx_feedback_scores_session on public.candidate_feedback_scores(session_id);

alter table public.candidate_feedback_scores enable row level security;
drop policy if exists "Users can access own feedback scores" on public.candidate_feedback_scores;
create policy "Users can access own feedback scores" on public.candidate_feedback_scores
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================================
-- 7. SAFE DATA MIGRATION FROM LEGACY COLUMNS INTO NEW TABLES
-- =========================================================================
do $$
declare
  r record;
  skill_item text;
begin
  -- 7a. Populate candidate_education from legacy profile columns if not already populated
  for r in (
    select id, college, graduation_year, education_level, academic_stream, degree_course, specialisation, year_of_study
    from public.profiles
    where (college is not null or degree_course is not null or education_level is not null)
  ) loop
    if not exists (select 1 from public.candidate_education where user_id = r.id) then
      insert into public.candidate_education (
        user_id,
        education_level,
        degree,
        stream,
        specialization,
        institution,
        year_of_study,
        graduation_year,
        is_primary
      ) values (
        r.id,
        coalesce(r.education_level, 'undergraduate'),
        coalesce(r.degree_course, 'Bachelor of Technology'),
        coalesce(r.academic_stream, 'Engineering & Technology'),
        r.specialisation,
        coalesce(r.college, 'University / College'),
        r.year_of_study,
        r.graduation_year,
        true
      );
    end if;
  end loop;

  -- 7b. Populate candidate_skills from legacy profile text[] skills
  for r in (
    select id, skills from public.profiles where skills is not null and array_length(skills, 1) > 0
  ) loop
    foreach skill_item in array r.skills loop
      if skill_item is not null and trim(skill_item) <> '' then
        insert into public.candidate_skills (user_id, name, category, self_rating)
        values (r.id, trim(skill_item), 'Technical', 'Intermediate')
        on conflict (user_id, name) do nothing;
      end if;
    end loop;
  end loop;

  -- 7c. Populate target_roles from legacy role_target
  update public.profiles
  set 
    primary_target_role = coalesce(role_target, primary_target_role, 'Software Engineer'),
    target_roles = case
      when role_target is not null and role_target <> '' then array[role_target]
      else array['Software Engineer']
    end
  where primary_target_role is null or primary_target_role = 'Software Engineer';
end $$;

-- =========================================================================
-- 8. STATUTORY "DELETE MY DATA" FUNCTION (Complete Right-to-Erasure)
-- =========================================================================
create or replace function public.delete_candidate_data(p_user_id uuid)
returns jsonb as $$
declare
begin
  -- Security check: Caller can only delete their own data unless service_role
  if auth.uid() <> p_user_id and current_user not in ('service_role', 'postgres', 'supabase_admin') then
    return jsonb_build_object('success', false, 'error', 'UNAUTHORIZED');
  end if;

  -- Purge all normalized profile satellite tables
  delete from public.candidate_feedback_scores where user_id = p_user_id;
  delete from public.candidate_resumes where user_id = p_user_id;
  delete from public.candidate_skills where user_id = p_user_id;
  delete from public.candidate_experience where user_id = p_user_id;
  delete from public.candidate_education where user_id = p_user_id;
  delete from public.feedback_reports where user_id = p_user_id;
  delete from public.interview_sessions where user_id = p_user_id;
  delete from public.resume_analyses where user_id = p_user_id;
  delete from public.profiles where id = p_user_id;

  return jsonb_build_object('success', true, 'message', 'All candidate data erased successfully.');
end;
$$ language plpgsql security definer set search_path = public;

-- Grant execution permissions
grant execute on function public.delete_candidate_data(uuid) to authenticated, anon, service_role;

grant select, insert, update, delete on public.candidate_education to authenticated, anon, service_role;
grant select, insert, update, delete on public.candidate_experience to authenticated, anon, service_role;
grant select, insert, update, delete on public.candidate_skills to authenticated, anon, service_role;
grant select, insert, update, delete on public.candidate_resumes to authenticated, anon, service_role;
grant select, insert, update, delete on public.candidate_feedback_scores to authenticated, anon, service_role;

notify pgrst, 'reload schema';
