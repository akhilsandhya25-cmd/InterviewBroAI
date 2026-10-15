-- =========================================================================
-- InterviewBro AI - Supabase Database & Security Schema
-- Compatible with Supabase Free Tier (PostgreSQL + RLS + GoTrue Auth)
-- =========================================================================

-- 1. PROFILES TABLE
-- Automatically populated when a new user signs up via Supabase Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
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

-- RLS Policy: Users can only view their own profile
create policy "Users can view own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

-- RLS Policy: Users can only update their own profile
create policy "Users can update own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

-- Trigger to automatically create a profile on new auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. INTERVIEW SESSIONS TABLE
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

-- Enable RLS
alter table public.interview_sessions enable row level security;

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


-- 3. FEEDBACK REPORTS TABLE
create table if not exists public.feedback_reports (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  session_id text not null,
  overall_score integer not null,
  technical_accuracy_score integer not null,
  communication_score integer not null,
  structure_star_score integer not null,
  completeness_score integer not null,
  key_strengths text[] default array[]::text[],
  critical_gaps text[] default array[]::text[],
  detailed_breakdown jsonb not null default '{}'::jsonb,
  generated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.feedback_reports enable row level security;

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


-- 4. RESUME ANALYSES TABLE
create table if not exists public.resume_analyses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  file_name text not null,
  file_size integer not null,
  parsed_text text,
  target_role text not null,
  ats_score integer not null,
  recommended_roles text[] default array[]::text[],
  identified_skills text[] default array[]::text[],
  missing_skills text[] default array[]::text[],
  bullet_point_improvements jsonb not null default '[]'::jsonb,
  summary text,
  analyzed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.resume_analyses enable row level security;

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
