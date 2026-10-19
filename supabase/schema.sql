-- =========================================================================
-- InterviewBro AI - Supabase Database & Security Schema
-- Compatible with Supabase Free Tier (PostgreSQL 15+ with RLS & GoTrue Auth)
-- =========================================================================

-- Enable uuid generation if needed
create extension if not exists "uuid-ossp";

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
  interviews_remaining integer default 9999,
  total_interviews_taken integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on profiles
alter table public.profiles enable row level security;

-- Drop existing policies if re-running
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


-- Trigger to automatically provision a profile row on new auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =========================================================================
-- 2. INTERVIEW SESSIONS TABLE
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for performance
create index if not exists idx_sessions_user_id on public.interview_sessions(user_id);
create index if not exists idx_sessions_started_at on public.interview_sessions(started_at desc);

-- Enable RLS
alter table public.interview_sessions enable row level security;

-- Drop existing policies if re-running
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
-- 3. FEEDBACK REPORTS TABLE
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

-- Indexes for performance
create index if not exists idx_reports_user_id on public.feedback_reports(user_id);
create index if not exists idx_reports_session_id on public.feedback_reports(session_id);

-- Enable RLS
alter table public.feedback_reports enable row level security;

-- Drop existing policies if re-running
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
-- 4. RESUME ANALYSES TABLE
-- Stores ATS score estimates, extracted skills, gaps, and tailored questions
-- =========================================================================
create table if not exists public.resume_analyses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  file_size integer not null default 0,
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

-- Indexes for performance
create index if not exists idx_resumes_user_id on public.resume_analyses(user_id);
create index if not exists idx_resumes_created_at on public.resume_analyses(created_at desc);

-- Enable RLS
alter table public.resume_analyses enable row level security;

-- Drop existing policies if re-running
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
-- 5. PERMISSIONS & ROLE GRANTS
-- Grants access to the public schema and user-owned tables
-- Row Level Security (RLS) ensures candidates only see their own records
-- =========================================================================
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select on public.profiles to anon;

grant select, insert, update, delete on public.interview_sessions to authenticated;
grant select, insert, update, delete on public.feedback_reports to authenticated;
grant select, insert, update, delete on public.resume_analyses to authenticated;

-- Reload PostgREST schema cache so tables are immediately discoverable
notify pgrst, 'reload schema';

