-- =========================================================================
-- InterviewBro AI - Complete Supabase PostgreSQL Schema & Security Policies
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL DEFAULT 'Candidate',
    avatar_url TEXT,
    role_target TEXT DEFAULT 'Software Engineer',
    experience_level TEXT DEFAULT 'fresher' CHECK (experience_level IN ('student', 'fresher', 'junior', 'mid', 'senior')),
    college TEXT,
    graduation_year TEXT,
    skills TEXT[] DEFAULT '{}',
    career_goals TEXT,
    interviews_remaining INTEGER DEFAULT 5 CHECK (interviews_remaining >= 0),
    total_interviews_taken INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. INTERVIEW SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    role TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_category TEXT NOT NULL,
    interview_type TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'intermediate',
    duration_minutes INTEGER NOT NULL DEFAULT 20,
    question_count INTEGER NOT NULL DEFAULT 5,
    language TEXT NOT NULL DEFAULT 'English',
    job_description TEXT,
    resume_file_name TEXT,
    resume_text TEXT,
    status TEXT NOT NULL DEFAULT 'setup' CHECK (status IN ('setup', 'in_progress', 'paused', 'completed', 'abandoned')),
    elapsed_seconds INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" 
    ON public.interview_sessions FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions" 
    ON public.interview_sessions FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" 
    ON public.interview_sessions FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" 
    ON public.interview_sessions FOR DELETE 
    USING (auth.uid() = user_id);


-- 3. INTERVIEW QUESTIONS & ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    category TEXT NOT NULL,
    context_or_hints TEXT,
    candidate_answer TEXT,
    time_taken_seconds INTEGER DEFAULT 0,
    accuracy_score INTEGER,
    communication_score INTEGER,
    structure_score INTEGER,
    completeness_score INTEGER,
    overall_score INTEGER,
    feedback TEXT,
    strengths TEXT[],
    missed_points TEXT[],
    better_answer_example TEXT,
    is_follow_up BOOLEAN DEFAULT FALSE,
    follow_up_to_id UUID REFERENCES public.interview_questions(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view questions of their own sessions" 
    ON public.interview_questions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.interview_sessions 
            WHERE interview_sessions.id = interview_questions.session_id 
            AND interview_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert questions to their own sessions" 
    ON public.interview_questions FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.interview_sessions 
            WHERE interview_sessions.id = interview_questions.session_id 
            AND interview_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update questions of their own sessions" 
    ON public.interview_questions FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.interview_sessions 
            WHERE interview_sessions.id = interview_questions.session_id 
            AND interview_sessions.user_id = auth.uid()
        )
    );


-- 4. FEEDBACK REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.feedback_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL UNIQUE REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL,
    technical_accuracy_score INTEGER NOT NULL,
    communication_score INTEGER NOT NULL,
    structure_star_score INTEGER NOT NULL,
    relevance_score INTEGER NOT NULL,
    summary TEXT NOT NULL,
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    missed_concepts TEXT[] DEFAULT '{}',
    actionable_improvements TEXT[] DEFAULT '{}',
    recommended_topics TEXT[] DEFAULT '{}',
    example_improved_answers JSONB DEFAULT '[]'::jsonb,
    prep_plan JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.feedback_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback reports" 
    ON public.feedback_reports FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback reports" 
    ON public.feedback_reports FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedback reports" 
    ON public.feedback_reports FOR DELETE 
    USING (auth.uid() = user_id);


-- 5. RESUME ANALYSES TABLE
CREATE TABLE IF NOT EXISTS public.resume_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    extracted_skills TEXT[] DEFAULT '{}',
    missing_skills_for_role TEXT[] DEFAULT '{}',
    ats_score_estimate INTEGER NOT NULL,
    education_found TEXT[] DEFAULT '{}',
    experience_summary TEXT,
    projects_detected TEXT[] DEFAULT '{}',
    strengths TEXT[] DEFAULT '{}',
    keyword_gaps TEXT[] DEFAULT '{}',
    actionable_improvements TEXT[] DEFAULT '{}',
    tailored_interview_questions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own resume analyses" 
    ON public.resume_analyses FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own resume analyses" 
    ON public.resume_analyses FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own resume analyses" 
    ON public.resume_analyses FOR DELETE 
    USING (auth.uid() = user_id);


-- 6. USAGE QUOTAS & LIMITS TABLE
CREATE TABLE IF NOT EXISTS public.usage_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    free_interviews_total INTEGER DEFAULT 5,
    interviews_used INTEGER DEFAULT 0,
    plan_name TEXT DEFAULT 'Free Tier' CHECK (plan_name IN ('Free Tier', 'Student Pro', 'Placement Unlimited')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.usage_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quota" 
    ON public.usage_quotas FOR SELECT 
    USING (auth.uid() = user_id);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.interview_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_session_id ON public.interview_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.feedback_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_user_id ON public.resume_analyses(user_id);
