import { UserProfile, InterviewSession, FeedbackReport, ResumeAnalysis, UsageQuota } from '../types';

const USER_KEY = 'interviewbro_user';
const SESSIONS_KEY = 'interviewbro_sessions';
const REPORTS_KEY = 'interviewbro_reports';
const RESUMES_KEY = 'interviewbro_resumes';
const QUOTA_KEY = 'interviewbro_quota';

const DEFAULT_USER: UserProfile = {
  id: 'usr-student-001',
  email: 'candidate@interviewbro.ai',
  full_name: 'Aditya Sharma',
  role_target: 'Full Stack Developer',
  experience_level: 'fresher',
  college: 'IIT / NIT / State Engineering University',
  graduation_year: '2025',
  skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Data Structures', 'Git'],
  career_goals: 'Targeting SDE-1 roles at high-growth Indian tech unicorns and product companies.',
  interviews_remaining: 5,
  total_interviews_taken: 3,
  created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  updated_at: new Date().toISOString()
};

const DEFAULT_QUOTA: UsageQuota = {
  freeInterviewsTotal: 9999,
  interviewsUsed: 0,
  interviewsRemaining: 9999,
  planName: 'Placement Unlimited'
};

// Seed realistic sample sessions so the dashboard immediately shows realistic metrics
const DEFAULT_SESSIONS: InterviewSession[] = [
  {
    id: 'sess-001',
    userId: 'usr-student-001',
    title: 'Flipkart SDE-1 Technical & Problem Solving',
    config: {
      role: 'Full Stack Developer (React + Node)',
      experienceLevel: 'fresher',
      interviewType: 'mixed',
      companyName: 'Flipkart',
      companyCategory: 'Product Unicorn',
      difficulty: 'intermediate',
      durationMinutes: 20,
      questionCount: 3,
      language: 'English'
    },
    status: 'completed',
    startedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    completedAt: new Date(Date.now() - 2 * 86400000 + 1200000).toISOString(),
    elapsedSeconds: 1180,
    currentQuestionIndex: 2,
    questions: [
      {
        id: 'q-001',
        orderIndex: 0,
        questionText: 'Explain how the JavaScript Event Loop works and the difference between Microtasks and Macrotasks.',
        category: 'technical',
        candidateAnswer: 'The event loop checks if the call stack is empty. If it is empty, it processes microtasks like Promise callbacks first before taking callbacks from the macrotask queue like setTimeout.',
        timeTakenSeconds: 95,
        evaluation: {
          score: 88,
          accuracyScore: 90,
          communicationScore: 85,
          structureScore: 85,
          completenessScore: 88,
          feedback: 'Solid foundational understanding. Good articulation of queue priority.',
          strengths: ['Accurate microtask vs macrotask distinction', 'Concise and to the point'],
          missedPoints: ['Could mention MutationObserver and process.nextTick in Node.js context'],
          betterAnswerExample: 'The JavaScript Event Loop coordinates single-threaded execution. When the Call Stack clears, the engine drains the Microtask Queue completely (including Promises, queueMicrotask) before picking one task from the Macrotask Queue (setTimeout, DOM events).'
        }
      },
      {
        id: 'q-002',
        orderIndex: 1,
        questionText: 'How would you optimize high-concurrency database queries during a mega shopping festival sale?',
        category: 'system_design',
        candidateAnswer: 'We should use Redis caching for hot products, read-replicas for catalog searches, and queue checkout write operations with Kafka or RabbitMQ to avoid database connection exhaustion.',
        timeTakenSeconds: 140,
        evaluation: {
          score: 84,
          accuracyScore: 86,
          communicationScore: 82,
          structureScore: 84,
          completenessScore: 84,
          feedback: 'Great architectural awareness mentioning Redis caching and message queues.',
          strengths: ['Separated read vs write scalability', 'Understood connection exhaustion'],
          missedPoints: ['Did not discuss database connection pooling (HikariCP/pgBouncer) or optimistic locking'],
          betterAnswerExample: 'To handle flash sale spikes, apply multi-tier caching with Redis Cluster, separate read/write traffic using read replicas, enforce optimistic locking at row level with version columns, and buffer flash orders via an event-driven queue.'
        }
      },
      {
        id: 'q-003',
        orderIndex: 2,
        questionText: 'Tell me about a challenging technical bug you resolved during a project or internship.',
        category: 'behavioral',
        candidateAnswer: 'In my college final year project, we had memory leaks causing the Node server to crash under load. I profiled the heap with Chrome DevTools, found unclosed database connections in an async loop, fixed the connection pooling, and latency dropped by 40%.',
        timeTakenSeconds: 110,
        evaluation: {
          score: 92,
          accuracyScore: 92,
          communicationScore: 90,
          structureScore: 95,
          completenessScore: 90,
          feedback: 'Excellent STAR format answer with measurable results and clear technical ownership.',
          strengths: ['Used STAR structure naturally', 'Quoted concrete 40% latency metric', 'Mentioned actual profiling tools'],
          missedPoints: ['Could mention automated tests or alerts added to prevent recurrence'],
          betterAnswerExample: 'Situation: Server crashed under load. Task: Isolate the memory leak. Action: Used heap snapshots to detect unclosed connection handles. Result: Fixed pool configuration, decreasing memory footprint by 60% and latency by 40%.'
        }
      }
    ]
  }
];

export const storage = {
  getUser(): UserProfile | null {
    try {
      const loggedOut = localStorage.getItem('interviewbro_logged_out');
      if (loggedOut === 'true') return null;
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : DEFAULT_USER;
    } catch {
      return DEFAULT_USER;
    }
  },

  setUser(user: UserProfile | null): void {
    try {
      if (!user) {
        localStorage.removeItem(USER_KEY);
        localStorage.setItem('interviewbro_logged_out', 'true');
      } else {
        localStorage.removeItem('interviewbro_logged_out');
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (e) {
      console.error('Failed to save user', e);
    }
  },

  getQuota(): UsageQuota {
    try {
      const data = localStorage.getItem(QUOTA_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.interviewsRemaining < 100) {
          parsed.interviewsRemaining = 9999;
          parsed.freeInterviewsTotal = 9999;
          parsed.planName = 'Placement Unlimited';
          localStorage.setItem(QUOTA_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
      return DEFAULT_QUOTA;
    } catch {
      return DEFAULT_QUOTA;
    }
  },

  decrementQuota(): UsageQuota {
    const quota = this.getQuota();
    quota.interviewsUsed += 1;
    quota.interviewsRemaining = 9999;
    try {
      localStorage.setItem(QUOTA_KEY, JSON.stringify(quota));
      const user = this.getUser();
      if (user) {
        user.interviews_remaining = 9999;
        user.total_interviews_taken = quota.interviewsUsed;
        this.setUser(user);
      }
    } catch (e) {
      console.error('Failed to update quota', e);
    }
    return quota;
  },

  getSessions(): InterviewSession[] {
    try {
      const data = localStorage.getItem(SESSIONS_KEY);
      if (!data) {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(DEFAULT_SESSIONS));
        return DEFAULT_SESSIONS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_SESSIONS;
    }
  },

  getSessionById(id: string): InterviewSession | undefined {
    const sessions = this.getSessions();
    return sessions.find(s => s.id === id);
  },

  saveSession(session: InterviewSession): void {
    try {
      const sessions = this.getSessions();
      const index = sessions.findIndex(s => s.id === session.id);
      if (index >= 0) {
        sessions[index] = session;
      } else {
        sessions.unshift(session);
      }
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save session', e);
    }
  },

  deleteSession(id: string): void {
    try {
      const sessions = this.getSessions().filter(s => s.id !== id);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to delete session', e);
    }
  },

  getReports(): FeedbackReport[] {
    try {
      const data = localStorage.getItem(REPORTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveReport(report: FeedbackReport): void {
    try {
      const reports = this.getReports();
      const index = reports.findIndex(r => r.id === report.id || r.sessionId === report.sessionId);
      if (index >= 0) {
        reports[index] = report;
      } else {
        reports.unshift(report);
      }
      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    } catch (e) {
      console.error('Failed to save report', e);
    }
  },

  getResumes(): ResumeAnalysis[] {
    try {
      const data = localStorage.getItem(RESUMES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveResume(resume: ResumeAnalysis): void {
    try {
      const resumes = this.getResumes();
      const index = resumes.findIndex(r => r.id === resume.id);
      if (index >= 0) {
        resumes[index] = resume;
      } else {
        resumes.unshift(resume);
      }
      localStorage.setItem(RESUMES_KEY, JSON.stringify(resumes));
    } catch (e) {
      console.error('Failed to save resume analysis', e);
    }
  },

  deleteResume(id: string): void {
    try {
      const resumes = this.getResumes().filter(r => r.id !== id);
      localStorage.setItem(RESUMES_KEY, JSON.stringify(resumes));
    } catch (e) {
      console.error('Failed to delete resume', e);
    }
  }
};
