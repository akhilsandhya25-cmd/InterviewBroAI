-- =========================================================================
-- Migration 003: Universal Student Academic Profile Columns
-- Idempotent: Safe to execute on existing databases without data loss
-- NOTE: Do NOT run automatically. Provided for manual execution upon user approval.
-- =========================================================================

alter table public.profiles
  add column if not exists education_level text,
  add column if not exists academic_stream text,
  add column if not exists degree_course text,
  add column if not exists specialisation text,
  add column if not exists intermediate_group text,
  add column if not exists year_of_study text,
  add column if not exists career_goal text,
  add column if not exists career_interests text[];

-- Optional performance indices
create index if not exists idx_profiles_education_level on public.profiles(education_level);
create index if not exists idx_profiles_academic_stream on public.profiles(academic_stream);
create index if not exists idx_profiles_intermediate_group on public.profiles(intermediate_group);
