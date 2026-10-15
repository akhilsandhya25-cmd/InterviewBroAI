import { UserProfile, InterviewSession, FeedbackReport, ResumeAnalysis, UsageQuota } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

const CURRENT_USER_KEY = 'interviewbro_current_user';
const SESSION_TOKEN_KEY = 'interviewbro_session_token';
const LOGGED_OUT_KEY = 'interviewbro_logged_out';

const DEFAULT_QUOTA: UsageQuota = {
  freeInterviewsTotal: 9999,
  interviewsUsed: 0,
  interviewsRemaining: 9999,
  planName: 'Placement Unlimited'
};

export const storage = {
  // Session Token
  getToken(): string | null {
    try {
      return localStorage.getItem(SESSION_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(SESSION_TOKEN_KEY, token);
      } else {
        localStorage.removeItem(SESSION_TOKEN_KEY);
      }
    } catch (e) {
      console.error('Failed to set token', e);
    }
  },

  // Active User Profile
  getUser(): UserProfile | null {
    try {
      const loggedOut = localStorage.getItem(LOGGED_OUT_KEY);
      if (loggedOut === 'true') return null;

      const data = localStorage.getItem(CURRENT_USER_KEY);
      if (!data) return null;

      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  setUser(user: UserProfile | null): void {
    try {
      if (!user) {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(SESSION_TOKEN_KEY);
        localStorage.setItem(LOGGED_OUT_KEY, 'true');
      } else {
        localStorage.removeItem(LOGGED_OUT_KEY);
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      }
    } catch (e) {
      console.error('Failed to save user', e);
    }
  },

  getActiveUserId(): string | null {
    const user = this.getUser();
    return user ? user.id : null;
  },

  // User-Isolated Quota
  getQuota(userId?: string | null): UsageQuota {
    const uid = userId || this.getActiveUserId();
    if (!uid) return DEFAULT_QUOTA;

    try {
      const data = localStorage.getItem(`interviewbro_quota_${uid}`);
      if (data) {
        return JSON.parse(data);
      }
      return DEFAULT_QUOTA;
    } catch {
      return DEFAULT_QUOTA;
    }
  },

  decrementQuota(userId?: string | null): UsageQuota {
    const uid = userId || this.getActiveUserId();
    const quota = this.getQuota(uid);
    quota.interviewsUsed += 1;
    quota.interviewsRemaining = 9999;

    if (uid) {
      try {
        localStorage.setItem(`interviewbro_quota_${uid}`, JSON.stringify(quota));
        const user = this.getUser();
        if (user && user.id === uid) {
          user.interviews_remaining = 9999;
          user.total_interviews_taken = quota.interviewsUsed;
          this.setUser(user);

          // If Supabase is active, persist quota stats to profiles table
          if (isSupabaseConfigured && supabase) {
            supabase
              .from('profiles')
              .update({
                interviews_remaining: 9999,
                total_interviews_taken: quota.interviewsUsed,
                updated_at: new Date().toISOString()
              })
              .eq('id', uid)
              .then(({ error }: any) => {
                if (error) console.warn('Supabase profile quota update error:', error.message);
              });
          }
        }
      } catch (e) {
        console.error('Failed to update quota', e);
      }
    }
    return quota;
  },

  // User-Isolated Interview Sessions
  getSessions(userId?: string | null): InterviewSession[] {
    const uid = userId || this.getActiveUserId();
    if (!uid) return [];

    try {
      const data = localStorage.getItem(`interviewbro_sessions_${uid}`);
      if (!data) return [];
      const parsed: InterviewSession[] = JSON.parse(data);
      // Ensure all returned sessions belong to this user
      return parsed.filter(s => s.userId === uid || !s.userId);
    } catch {
      return [];
    }
  },

  getSessionById(id: string, userId?: string | null): InterviewSession | undefined {
    const sessions = this.getSessions(userId);
    return sessions.find(s => s.id === id);
  },

  saveSession(session: InterviewSession, userId?: string | null): void {
    const uid = userId || session.userId || this.getActiveUserId();
    if (!uid) return;

    // Attach user ownership
    session.userId = uid;

    try {
      const sessions = this.getSessions(uid);
      const index = sessions.findIndex(s => s.id === session.id);
      if (index >= 0) {
        sessions[index] = session;
      } else {
        sessions.unshift(session);
      }
      localStorage.setItem(`interviewbro_sessions_${uid}`, JSON.stringify(sessions));

      // Asynchronously persist to Supabase cloud if configured
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('interview_sessions')
          .upsert({
            id: session.id,
            user_id: uid,
            title: session.title,
            config: session.config,
            status: session.status,
            started_at: session.startedAt,
            completed_at: session.completedAt || null,
            elapsed_seconds: session.elapsedSeconds || 0,
            current_question_index: session.currentQuestionIndex || 0,
            questions: session.questions || [],
            feedback_report: session.feedbackReport || null
          })
          .then(({ error }: any) => {
            if (error) console.warn('Supabase saveSession error:', error.message);
          });
      }
    } catch (e) {
      console.error('Failed to save session', e);
    }
  },

  deleteSession(id: string, userId?: string | null): void {
    const uid = userId || this.getActiveUserId();
    if (!uid) return;

    try {
      const sessions = this.getSessions(uid).filter(s => s.id !== id);
      localStorage.setItem(`interviewbro_sessions_${uid}`, JSON.stringify(sessions));

      // Asynchronously delete from Supabase cloud if configured
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('interview_sessions')
          .delete()
          .eq('id', id)
          .eq('user_id', uid)
          .then(({ error }: any) => {
            if (error) console.warn('Supabase deleteSession error:', error.message);
          });
      }
    } catch (e) {
      console.error('Failed to delete session', e);
    }
  },

  // User-Isolated Feedback Reports
  getReports(userId?: string | null): FeedbackReport[] {
    const uid = userId || this.getActiveUserId();
    if (!uid) return [];

    try {
      const data = localStorage.getItem(`interviewbro_reports_${uid}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveReport(report: FeedbackReport, userId?: string | null): void {
    const uid = userId || this.getActiveUserId();
    if (!uid) return;

    try {
      const reports = this.getReports(uid);
      const index = reports.findIndex(r => r.id === report.id || r.sessionId === report.sessionId);
      if (index >= 0) {
        reports[index] = report;
      } else {
        reports.unshift(report);
      }
      localStorage.setItem(`interviewbro_reports_${uid}`, JSON.stringify(reports));

      // Asynchronously persist to Supabase cloud if configured
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('feedback_reports')
          .upsert({
            id: report.id,
            user_id: uid,
            session_id: report.sessionId,
            candidate_name: report.candidateName || '',
            role: report.role || '',
            company: report.company || '',
            interview_type: report.interviewType || 'technical',
            overall_score: report.overallScore || 0,
            technical_accuracy_score: report.technicalAccuracyScore || 0,
            communication_score: report.communicationScore || 0,
            structure_star_score: report.structureStarScore || 0,
            relevance_score: report.relevanceScore || 0,
            summary: report.summary || '',
            strengths: report.strengths || [],
            weaknesses: report.weaknesses || [],
            missed_concepts: report.missedConcepts || [],
            actionable_improvements: report.actionableImprovements || [],
            recommended_topics: report.recommendedTopics || [],
            example_improved_answers: report.exampleImprovedAnswers || [],
            prep_plan: report.prepPlan || [],
            questions_evaluated: report.questionsEvaluated || [],
            created_at: report.createdAt || new Date().toISOString()
          })
          .then(({ error }: any) => {
            if (error) console.warn('Supabase saveReport error:', error.message);
          });
      }
    } catch (e) {
      console.error('Failed to save report', e);
    }
  },

  // User-Isolated Resumes
  getResumes(userId?: string | null): ResumeAnalysis[] {
    const uid = userId || this.getActiveUserId();
    if (!uid) return [];

    try {
      const data = localStorage.getItem(`interviewbro_resumes_${uid}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveResume(resume: ResumeAnalysis, userId?: string | null): void {
    const uid = userId || resume.userId || this.getActiveUserId();
    if (!uid) return;

    resume.userId = uid;

    try {
      const resumes = this.getResumes(uid);
      const index = resumes.findIndex(r => r.id === resume.id);
      if (index >= 0) {
        resumes[index] = resume;
      } else {
        resumes.unshift(resume);
      }
      localStorage.setItem(`interviewbro_resumes_${uid}`, JSON.stringify(resumes));

      // Asynchronously persist to Supabase cloud if configured
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('resume_analyses')
          .upsert({
            id: resume.id,
            user_id: uid,
            file_name: resume.fileName,
            file_size: resume.fileSize || 0,
            extracted_skills: resume.extractedSkills || [],
            missing_skills_for_role: resume.missingSkillsForRole || [],
            ats_score_estimate: resume.atsScoreEstimate || 0,
            education_found: resume.educationFound || [],
            experience_summary: resume.experienceSummary || '',
            projects_detected: resume.projectsDetected || [],
            strengths: resume.strengths || [],
            keyword_gaps: resume.keywordGaps || [],
            actionable_improvements: resume.actionableImprovements || [],
            tailored_interview_questions: resume.tailoredInterviewQuestions || [],
            created_at: resume.createdAt || new Date().toISOString()
          })
          .then(({ error }: any) => {
            if (error) console.warn('Supabase saveResume error:', error.message);
          });
      }
    } catch (e) {
      console.error('Failed to save resume analysis', e);
    }
  },

  deleteResume(id: string, userId?: string | null): void {
    const uid = userId || this.getActiveUserId();
    if (!uid) return;

    try {
      const resumes = this.getResumes(uid).filter(r => r.id !== id);
      localStorage.setItem(`interviewbro_resumes_${uid}`, JSON.stringify(resumes));

      // Asynchronously delete from Supabase cloud if configured
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('resume_analyses')
          .delete()
          .eq('id', id)
          .eq('user_id', uid)
          .then(({ error }: any) => {
            if (error) console.warn('Supabase deleteResume error:', error.message);
          });
      }
    } catch (e) {
      console.error('Failed to delete resume', e);
    }
  },

  /**
   * Bidirectional cloud synchronization:
   * Hydrates local browser cache from Supabase tables for the authenticated user.
   */
  async syncWithCloud(userId?: string | null): Promise<void> {
    const uid = userId || this.getActiveUserId();
    if (!uid || !isSupabaseConfigured || !supabase) return;

    try {
      // 1. Synchronize Sessions
      const { data: sessionRows, error: sErr } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', uid)
        .order('started_at', { ascending: false });

      if (!sErr && sessionRows && sessionRows.length > 0) {
        const parsedSessions: InterviewSession[] = sessionRows.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          title: row.title,
          config: row.config,
          status: row.status,
          startedAt: row.started_at,
          completedAt: row.completed_at || undefined,
          elapsedSeconds: row.elapsed_seconds || 0,
          currentQuestionIndex: row.current_question_index || 0,
          questions: row.questions || [],
          feedbackReport: row.feedback_report || undefined
        }));
        localStorage.setItem(`interviewbro_sessions_${uid}`, JSON.stringify(parsedSessions));
      }

      // 2. Synchronize Reports
      const { data: reportRows, error: rErr } = await supabase
        .from('feedback_reports')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (!rErr && reportRows && reportRows.length > 0) {
        const parsedReports: FeedbackReport[] = reportRows.map((row: any) => ({
          id: row.id,
          sessionId: row.session_id,
          candidateName: row.candidate_name,
          role: row.role,
          company: row.company,
          interviewType: row.interview_type,
          overallScore: row.overall_score,
          technicalAccuracyScore: row.technical_accuracy_score,
          communicationScore: row.communication_score,
          structureStarScore: row.structure_star_score,
          relevanceScore: row.relevance_score,
          summary: row.summary,
          strengths: row.strengths || [],
          weaknesses: row.weaknesses || [],
          missedConcepts: row.missed_concepts || [],
          actionableImprovements: row.actionable_improvements || [],
          recommendedTopics: row.recommended_topics || [],
          exampleImprovedAnswers: row.example_improved_answers || [],
          prepPlan: row.prep_plan || [],
          questionsEvaluated: row.questions_evaluated || [],
          createdAt: row.created_at
        }));
        localStorage.setItem(`interviewbro_reports_${uid}`, JSON.stringify(parsedReports));
      }

      // 3. Synchronize Resumes
      const { data: resumeRows, error: resErr } = await supabase
        .from('resume_analyses')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (!resErr && resumeRows && resumeRows.length > 0) {
        const parsedResumes: ResumeAnalysis[] = resumeRows.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          fileName: row.file_name,
          fileSize: row.file_size,
          extractedSkills: row.extracted_skills || [],
          missingSkillsForRole: row.missing_skills_for_role || [],
          atsScoreEstimate: row.ats_score_estimate,
          educationFound: row.education_found || [],
          experienceSummary: row.experience_summary || '',
          projectsDetected: row.projects_detected || [],
          strengths: row.strengths || [],
          keywordGaps: row.keyword_gaps || [],
          actionableImprovements: row.actionable_improvements || [],
          tailoredInterviewQuestions: row.tailored_interview_questions || [],
          createdAt: row.created_at
        }));
        localStorage.setItem(`interviewbro_resumes_${uid}`, JSON.stringify(parsedResumes));
      }

      // Notify listening UI components to refresh their state
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('interviewbro_storage_synced'));
      }
    } catch (err) {
      console.warn('Error during Supabase cloud synchronization:', err);
    }
  }
};
