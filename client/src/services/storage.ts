import { UserProfile, InterviewSession, FeedbackReport, ResumeAnalysis, UsageQuota, PrivacyPreferences } from '../types';
import { supabase, isSupabaseConfigured, checkSupabaseTablesStatus, CloudSyncStatus, CloudHealthCheckResult } from './supabase';

const CURRENT_USER_KEY = 'interviewbro_current_user';
const SESSION_TOKEN_KEY = 'interviewbro_session_token';
const LOGGED_OUT_KEY = 'interviewbro_logged_out';

const DEFAULT_QUOTA: UsageQuota = {
  freeInterviewsTotal: 9999,
  interviewsUsed: 0,
  interviewsRemaining: 9999,
  planName: 'Unlimited Practice'
};

function handleCloudStorageError(action: string, error: any) {
  if (!error) return;
  if (error.code === 'PGRST205' || (error.message && error.message.includes('schema cache'))) {
    // Database table not yet provisioned in Supabase project.
    // Local storage is safely preserving candidate state until schema.sql is executed.
    return;
  }
  console.warn(`Supabase ${action} notice:`, error.message);
}


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
      const user = this.getUser();
      if (user && user.id === uid) {
        const remaining = typeof user.interviews_remaining === 'number' ? user.interviews_remaining : 5;
        const used = typeof user.total_interviews_taken === 'number' ? user.total_interviews_taken : 0;
        const q: UsageQuota = {
          freeInterviewsTotal: 9999,
          interviewsUsed: used,
          interviewsRemaining: 9999,
          planName: 'Unlimited Practice'
        };
        localStorage.setItem(`interviewbro_quota_${uid}`, JSON.stringify(q));
        return q;
      }
      return DEFAULT_QUOTA;
    } catch {
      return DEFAULT_QUOTA;
    }
  },

  setQuota(quota: UsageQuota, userId?: string | null): void {
    const uid = userId || this.getActiveUserId();
    if (!uid) return;
    try {
      localStorage.setItem(`interviewbro_quota_${uid}`, JSON.stringify(quota));
      const user = this.getUser();
      if (user && user.id === uid) {
        user.interviews_remaining = quota.interviewsRemaining;
        user.total_interviews_taken = quota.interviewsUsed;
        this.setUser(user);
      }
      window.dispatchEvent(new CustomEvent('interviewbro_storage_synced'));
    } catch (e) {
      console.error('Failed to set quota', e);
    }
  },

  decrementQuota(userId?: string | null): UsageQuota {
    const uid = userId || this.getActiveUserId();
    const quota = this.getQuota(uid);
    quota.interviewsUsed += 1;
    quota.interviewsRemaining = Math.max(0, quota.freeInterviewsTotal - quota.interviewsUsed);

    if (uid) {
      try {
        localStorage.setItem(`interviewbro_quota_${uid}`, JSON.stringify(quota));
        const user = this.getUser();
        if (user && user.id === uid) {
          user.interviews_remaining = quota.interviewsRemaining;
          user.total_interviews_taken = quota.interviewsUsed;
          this.setUser(user);

          // If Supabase is active, persist quota stats to profiles table
          if (isSupabaseConfigured && supabase) {
            supabase
              .from('profiles')
              .update({
                interviews_remaining: quota.interviewsRemaining,
                total_interviews_taken: quota.interviewsUsed,
                updated_at: new Date().toISOString()
              })
              .eq('id', uid)
              .then(({ error }: any) => {
                handleCloudStorageError('profile quota update', error);
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

    // Check candidate privacy preferences for Ephemeral Practice Mode (Zero Transcript Retention)
    const prefs = this.getPrivacyPreferences(uid);
    let sessionToSave = session;
    if (prefs.ephemeralPracticeMode) {
      sessionToSave = {
        ...session,
        questions: (session.questions || []).map(q => ({
          ...q,
          userAnswer: '[Scrubbed under Ephemeral Practice Mode]',
          transcript: '[Scrubbed under Ephemeral Practice Mode]'
        }))
      };
    }

    try {
      const sessions = this.getSessions(uid);
      const index = sessions.findIndex(s => s.id === sessionToSave.id);
      if (index >= 0) {
        sessions[index] = sessionToSave;
      } else {
        sessions.unshift(sessionToSave);
      }
      localStorage.setItem(`interviewbro_sessions_${uid}`, JSON.stringify(sessions));

      // Asynchronously persist to Supabase cloud if configured
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('interview_sessions')
          .upsert({
            id: sessionToSave.id,
            user_id: uid,
            title: sessionToSave.title,
            config: sessionToSave.config,
            status: sessionToSave.status,
            started_at: sessionToSave.startedAt,
            completed_at: sessionToSave.completedAt || null,
            elapsed_seconds: sessionToSave.elapsedSeconds || 0,
            current_question_index: sessionToSave.currentQuestionIndex || 0,
            questions: sessionToSave.questions || [],
            feedback_report: sessionToSave.feedbackReport || null,
            source: (sessionToSave as any).source || 'ai'
          })
          .then(({ error }: any) => {
            handleCloudStorageError('saveSession', error);
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
            handleCloudStorageError('deleteSession', error);
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

    // Check candidate privacy preferences for Ephemeral Practice Mode (Zero Transcript Retention)
    const prefs = this.getPrivacyPreferences(uid);
    let reportToSave = report;
    if (prefs.ephemeralPracticeMode) {
      reportToSave = {
        ...report,
        questionsEvaluated: (report.questionsEvaluated || []).map((q: any) => ({
          ...q,
          userAnswer: '[Scrubbed under Ephemeral Practice Mode]',
          transcript: '[Scrubbed under Ephemeral Practice Mode]'
        }))
      };
    }

    try {
      const reports = this.getReports(uid);
      const index = reports.findIndex(r => r.id === reportToSave.id || r.sessionId === reportToSave.sessionId);
      if (index >= 0) {
        reports[index] = reportToSave;
      } else {
        reports.unshift(reportToSave);
      }
      localStorage.setItem(`interviewbro_reports_${uid}`, JSON.stringify(reports));

      // Asynchronously persist to Supabase cloud if configured
      if (isSupabaseConfigured && supabase) {
        supabase
          .from('feedback_reports')
          .upsert({
            id: reportToSave.id,
            user_id: uid,
            session_id: reportToSave.sessionId,
            candidate_name: reportToSave.candidateName || '',
            role: reportToSave.role || '',
            company: reportToSave.company || '',
            interview_type: reportToSave.interviewType || 'technical',
            source: reportToSave.source || 'ai',
            overall_score: reportToSave.overallScore || 0,
            technical_accuracy_score: reportToSave.technicalAccuracyScore || 0,
            communication_score: reportToSave.communicationScore || 0,
            structure_star_score: reportToSave.structureStarScore || 0,
            relevance_score: reportToSave.relevanceScore || 0,
            summary: reportToSave.summary || '',
            strengths: reportToSave.strengths || [],
            weaknesses: reportToSave.weaknesses || [],
            missed_concepts: reportToSave.missedConcepts || [],
            actionable_improvements: reportToSave.actionableImprovements || [],
            recommended_topics: reportToSave.recommendedTopics || [],
            example_improved_answers: reportToSave.exampleImprovedAnswers || [],
            prep_plan: reportToSave.prepPlan || [],
            questions_evaluated: reportToSave.questionsEvaluated || [],
            created_at: reportToSave.createdAt || new Date().toISOString()
          })
          .then(({ error }: any) => {
            handleCloudStorageError('saveReport', error);
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
            source: resume.source || 'ai',
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
            handleCloudStorageError('saveResume', error);
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
            handleCloudStorageError('deleteResume', error);
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

      if (sErr) handleCloudStorageError('syncSessions', sErr);
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

      if (rErr) handleCloudStorageError('syncReports', rErr);
      if (!rErr && reportRows && reportRows.length > 0) {
        const parsedReports: FeedbackReport[] = reportRows.map((row: any) => ({
          id: row.id,
          sessionId: row.session_id,
          candidateName: row.candidate_name,
          role: row.role,
          company: row.company,
          interviewType: row.interview_type,
          source: row.source || (row.overall_score && row.overall_score > 0 ? 'ai' : 'fallback'),
          overallScore: (row.source === 'fallback' || row.overall_score === 0) ? null : row.overall_score,
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

      if (resErr) handleCloudStorageError('syncResumes', resErr);

      if (!resErr && resumeRows && resumeRows.length > 0) {
        const parsedResumes: ResumeAnalysis[] = resumeRows.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
          fileName: row.file_name,
          fileSize: row.file_size,
          extractedSkills: row.extracted_skills || [],
          missingSkillsForRole: row.missing_skills_for_role || [],
          source: row.source || (row.ats_score_estimate && row.ats_score_estimate > 0 ? 'ai' : 'fallback'),
          atsScoreEstimate: (row.source === 'fallback' || row.ats_score_estimate === 0) ? null : row.ats_score_estimate,
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

      // 4. One-Time Migration of existing localStorage sessions to Supabase
      const migrationFlagKey = `interviewbro_cloud_migrated_${uid}`;
      const isAlreadyMigrated = localStorage.getItem(migrationFlagKey) === 'true';

      if (!sErr && !isAlreadyMigrated) {
        try {
          // Read local sessions for this user plus any unnamespaced guest sessions
          const localSessionsUid: InterviewSession[] = JSON.parse(localStorage.getItem(`interviewbro_sessions_${uid}`) || '[]');
          const localSessionsGuest: InterviewSession[] = JSON.parse(localStorage.getItem('interviewbro_sessions') || '[]');
          
          // Deduplicate local sessions by id
          const combinedLocalSessionsMap = new Map<string, InterviewSession>();
          [...localSessionsUid, ...localSessionsGuest].forEach(s => {
            if (s && s.id) combinedLocalSessionsMap.set(s.id, s);
          });

          const cloudSessionIds = new Set((sessionRows || []).map((r: any) => r.id));
          const sessionsToMigrate = Array.from(combinedLocalSessionsMap.values())
            .filter(s => !cloudSessionIds.has(s.id));

          if (sessionsToMigrate.length > 0) {
            console.log(`[Storage Migration] Migrating ${sessionsToMigrate.length} local session(s) to Supabase cloud...`);
            for (const s of sessionsToMigrate) {
              await supabase
                .from('interview_sessions')
                .upsert({
                  id: s.id,
                  user_id: uid,
                  title: s.title || 'Practice Interview Session',
                  config: s.config || {},
                  status: s.status || 'completed',
                  started_at: s.startedAt || new Date().toISOString(),
                  completed_at: s.completedAt || null,
                  elapsed_seconds: s.elapsedSeconds || 0,
                  current_question_index: s.currentQuestionIndex || 0,
                  questions: s.questions || [],
                  feedback_report: s.feedbackReport || null,
                  source: (s as any).source || 'ai'
                });
            }
          }

          // Migrate any local reports not yet in Supabase
          const localReportsUid: FeedbackReport[] = JSON.parse(localStorage.getItem(`interviewbro_reports_${uid}`) || '[]');
          const localReportsGuest: FeedbackReport[] = JSON.parse(localStorage.getItem('interviewbro_reports') || '[]');
          const combinedReportsMap = new Map<string, FeedbackReport>();
          [...localReportsUid, ...localReportsGuest].forEach(r => {
            if (r && r.id) combinedReportsMap.set(r.id, r);
          });

          const cloudReportIds = new Set((reportRows || []).map((r: any) => r.id));
          const reportsToMigrate = Array.from(combinedReportsMap.values())
            .filter(r => !cloudReportIds.has(r.id));

          if (reportsToMigrate.length > 0) {
            for (const r of reportsToMigrate) {
              await supabase
                .from('feedback_reports')
                .upsert({
                  id: r.id,
                  user_id: uid,
                  session_id: r.sessionId,
                  candidate_name: r.candidateName || '',
                  role: r.role || '',
                  company: r.company || '',
                  interview_type: r.interviewType || 'technical',
                  source: r.source || 'ai',
                  overall_score: r.overallScore || 0,
                  technical_accuracy_score: r.technicalAccuracyScore || 0,
                  communication_score: r.communicationScore || 0,
                  structure_star_score: r.structureStarScore || 0,
                  relevance_score: r.relevanceScore || 0,
                  summary: r.summary || '',
                  strengths: r.strengths || [],
                  weaknesses: r.weaknesses || [],
                  missed_concepts: r.missedConcepts || [],
                  actionable_improvements: r.actionableImprovements || [],
                  recommended_topics: r.recommendedTopics || [],
                  example_improved_answers: r.exampleImprovedAnswers || [],
                  prep_plan: r.prepPlan || [],
                  questions_evaluated: r.questionsEvaluated || [],
                  created_at: r.createdAt || new Date().toISOString()
                });
            }
          }

          // Mark migration completed
          localStorage.setItem(migrationFlagKey, 'true');
          // Clean up legacy guest keys
          localStorage.removeItem('interviewbro_sessions');
          localStorage.removeItem('interviewbro_reports');
        } catch (migrationErr) {
          console.warn('[Storage Migration] Non-fatal migration notice:', migrationErr);
        }
      }

      // Notify listening UI components to refresh their state
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('interviewbro_storage_synced'));
      }
    } catch (err) {
      console.warn('Error during Supabase cloud synchronization:', err);
    }
  },

  /**
   * Retrieves user-configurable privacy preferences with DPDP default baseline.
   */
  getPrivacyPreferences(userId?: string | null): PrivacyPreferences {
    const uid = userId || this.getActiveUserId();
    const defaultPrefs: PrivacyPreferences = {
      voiceSynthesisEnabled: true,
      ephemeralPracticeMode: false,
      analyticsOptIn: false,
      // Legacy compatibility mirrors
      saveTranscriptsLocally: true,
      allowVoiceSimulation: true,
      optInAnonymousDiagnostics: false,
      consentVersion: '1.2'
    };
    try {
      const raw = localStorage.getItem(`interviewbro_privacy_prefs_${uid}`);
      if (!raw) return defaultPrefs;
      const parsed = JSON.parse(raw);
      
      // Ensure sync between legacy and new explicit settings
      const voiceEnabled = typeof parsed.voiceSynthesisEnabled === 'boolean'
        ? parsed.voiceSynthesisEnabled
        : (typeof parsed.allowVoiceSimulation === 'boolean' ? parsed.allowVoiceSimulation : true);

      const ephemeral = typeof parsed.ephemeralPracticeMode === 'boolean'
        ? parsed.ephemeralPracticeMode
        : (parsed.saveTranscriptsLocally === false ? true : false);

      const analytics = typeof parsed.analyticsOptIn === 'boolean'
        ? parsed.analyticsOptIn
        : (typeof parsed.optInAnonymousDiagnostics === 'boolean' ? parsed.optInAnonymousDiagnostics : false);

      return {
        ...defaultPrefs,
        ...parsed,
        voiceSynthesisEnabled: voiceEnabled,
        ephemeralPracticeMode: ephemeral,
        analyticsOptIn: analytics,
        allowVoiceSimulation: voiceEnabled,
        saveTranscriptsLocally: !ephemeral,
        optInAnonymousDiagnostics: analytics
      };
    } catch {
      return defaultPrefs;
    }
  },

  /**
   * Updates user privacy preferences in local storage and dispatches sync event.
   */
  savePrivacyPreferences(prefs: Partial<PrivacyPreferences>, userId?: string | null): void {
    const uid = userId || this.getActiveUserId();
    const current = this.getPrivacyPreferences(uid);
    const updated: PrivacyPreferences = {
      ...current,
      ...prefs
    };

    // Keep legacy mirrors in sync
    if (typeof prefs.voiceSynthesisEnabled === 'boolean') {
      updated.allowVoiceSimulation = prefs.voiceSynthesisEnabled;
    } else if (typeof prefs.allowVoiceSimulation === 'boolean') {
      updated.voiceSynthesisEnabled = prefs.allowVoiceSimulation;
    }

    if (typeof prefs.ephemeralPracticeMode === 'boolean') {
      updated.saveTranscriptsLocally = !prefs.ephemeralPracticeMode;
    } else if (typeof prefs.saveTranscriptsLocally === 'boolean') {
      updated.ephemeralPracticeMode = !prefs.saveTranscriptsLocally;
    }

    if (typeof prefs.analyticsOptIn === 'boolean') {
      updated.optInAnonymousDiagnostics = prefs.analyticsOptIn;
    } else if (typeof prefs.optInAnonymousDiagnostics === 'boolean') {
      updated.analyticsOptIn = prefs.optInAnonymousDiagnostics;
    }

    try {
      localStorage.setItem(`interviewbro_privacy_prefs_${uid}`, JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('interviewbro_privacy_updated', { detail: updated }));
      }
    } catch (e) {
      console.error('Failed to save privacy preferences', e);
    }
  },

  /**
   * Generates and downloads a complete, structured JSON archive of all candidate data
   * (Complies with DPDP Act 2023 Right to Access & Data Portability).
   */
  exportAllUserData(userId?: string | null): void {
    const uid = userId || this.getActiveUserId();
    const profile = this.getUser();
    const sessions = this.getSessions(uid);
    const reports = this.getReports(uid);
    const resumes = this.getResumes(uid);
    const prefs = this.getPrivacyPreferences(uid);

    const exportPayload = {
      exportMetadata: {
        platform: 'InterviewBro AI',
        version: '1.2',
        exportDate: new Date().toISOString(),
        userId: uid || 'anonymous',
        complianceFramework: 'Digital Personal Data Protection Act, 2023 (India)',
        totalSessionsExported: sessions.length,
        totalReportsExported: reports.length,
        totalResumesExported: resumes.length,
        mediaStorageDisclaimer: 'InterviewBro AI does NOT store video recordings on any server. Video preview was rendered strictly in your local browser canvas.'
      },
      candidateProfile: profile,
      privacyPreferences: prefs,
      interviewSessions: sessions,
      evaluationReports: reports,
      resumeAnalyses: resumes
    };

    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `interviewbro_data_export_${(profile?.full_name || 'candidate').replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }
  },

  /**
   * Complete account erasure (DPDP Act 2023 Statutory Compliance):
   * 1. Calls single serverless /api/auth/delete-account with bearer token.
   * 2. Server verifies caller JWT, purges database rows and GoTrue auth.users via SUPABASE_SERVICE_ROLE_KEY.
   * 3. If server fails or service key is missing, fails loudly and aborts. Never reports success on partial deletion.
   * 4. Only after confirmed success, clears localStorage and signs out of Supabase.
   */
  async deleteAccountAndData(userId: string): Promise<{ success: boolean; message: string }> {
    const uid = userId || this.getActiveUserId();
    if (!uid) {
      return { success: false, message: 'No active user found to delete.' };
    }

    // Retrieve active auth token from Supabase or storage
    let token = this.getToken();
    if (!token && isSupabaseConfigured && supabase) {
      try {
        const sessionRes = await supabase.auth.getSession();
        token = sessionRes.data.session?.access_token || null;
      } catch (err) {
        console.warn('[Storage] Failed to retrieve Supabase session token:', err);
      }
    }

    // If Supabase is configured, enforce serverless deletion
    if (isSupabaseConfigured) {
      if (!token) {
        return {
          success: false,
          message: 'Active authentication session is required to delete your account. Please log in again.'
        };
      }

      let res: Response;
      let data: any = null;
      try {
        res = await fetch('/api/auth/delete-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId: uid })
        });
        data = await res.json().catch(() => ({}));
      } catch (networkErr: any) {
        console.error('[Storage] Network error calling /api/auth/delete-account:', networkErr);
        return {
          success: false,
          message: `Network error connecting to deletion service: ${networkErr?.message || 'Server unreachable'}. Account data was not deleted.`
        };
      }

      if (!res.ok || !data?.success) {
        const errorMsg = data?.message || data?.error || `Account deletion failed (HTTP ${res.status}).`;
        console.error('[Storage] Account deletion failed on server:', errorMsg);
        return {
          success: false,
          message: errorMsg
        };
      }
    }

    // CONFIRMED SUCCESS (or pure offline local mode):
    // Only now clear localStorage and sign out
    try {
      localStorage.removeItem(`interviewbro_sessions_${uid}`);
      localStorage.removeItem(`interviewbro_reports_${uid}`);
      localStorage.removeItem(`interviewbro_resumes_${uid}`);
      localStorage.removeItem(`interviewbro_privacy_prefs_${uid}`);
      localStorage.removeItem(`interviewbro_profile_completed_${uid}`);
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(SESSION_TOKEN_KEY);
      localStorage.removeItem('interviewbro_user');
      localStorage.removeItem('interviewbro_auth_session');
      localStorage.removeItem('interviewbro_onboarding_active');
      localStorage.removeItem('interviewbro_active_session');
      localStorage.removeItem('interviewbro_active_report');
      localStorage.setItem(LOGGED_OUT_KEY, 'true');
    } catch (e) {
      console.error('Error clearing local storage on delete:', e);
    }

    // Supabase Auth signout
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Signout during deletion error:', e);
      }
    }

    // Notify app
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('interviewbro_account_deleted'));
      window.dispatchEvent(new CustomEvent('interviewbro_storage_synced'));
    }

    return {
      success: true,
      message: 'Your account credentials and all associated interview sessions, resumes, and reports have been permanently deleted.'
    };
  },

  /**
   * Evaluates cloud database readiness: 'synced', 'tables_missing', or 'offline'.
   */
  async checkCloudSyncStatus(): Promise<CloudHealthCheckResult> {
    return checkSupabaseTablesStatus();
  }
};

