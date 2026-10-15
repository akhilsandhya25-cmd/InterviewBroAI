import { UserProfile, InterviewSession, FeedbackReport, ResumeAnalysis, UsageQuota } from '../types';

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
    const uid = userId || this.getActiveUserId();
    if (!uid) return;

    try {
      const resumes = this.getResumes(uid);
      const index = resumes.findIndex(r => r.id === resume.id);
      if (index >= 0) {
        resumes[index] = resume;
      } else {
        resumes.unshift(resume);
      }
      localStorage.setItem(`interviewbro_resumes_${uid}`, JSON.stringify(resumes));
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
    } catch (e) {
      console.error('Failed to delete resume', e);
    }
  }
};
