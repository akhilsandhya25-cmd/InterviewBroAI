export type ExperienceLevel = 'student' | 'fresher' | 'junior' | 'mid' | 'senior';

export type InterviewType = 'technical' | 'behavioral' | 'hr' | 'system_design' | 'managerial' | 'mixed';

export type CompanyCategory = 'Service Giant' | 'Product Unicorn' | 'FAANG / MNC' | 'Startup' | 'Fintech';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type SessionStatus = 'setup' | 'in_progress' | 'paused' | 'completed' | 'abandoned';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role_target: string;
  experience_level: ExperienceLevel;
  college?: string;
  graduation_year?: string;
  skills: string[];
  career_goals?: string;
  interviews_remaining: number;
  total_interviews_taken: number;
  profile_completed?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyPreset {
  id: string;
  name: string;
  category: CompanyCategory;
  tagline: string;
  code?: string;
  logo: string;
  color: string;
  popularRoles: string[];
  focusAreas: string[];
  interviewStructure: string[];
  difficultyEmphasis?: string;
  interviewStyle?: string;
  exampleQuestionThemes?: string[];
  status?: string;
  todoReviewNote?: string;
}

export type InterviewDeliveryMode = 'video' | 'voice_only' | 'text_only';

export interface InterviewConfig {
  role: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  companyName: string;
  companyCategory: CompanyCategory;
  difficulty: DifficultyLevel;
  durationMinutes: number;
  questionCount: number;
  language: string;
  mode?: InterviewDeliveryMode;
  jobDescription?: string;
  resumeFileName?: string;
  resumeText?: string;
  companyTrack?: any;
}

export type InterviewSource = 'ai' | 'fallback';

export interface RubricPillar {
  key: string;
  label: string;
  score: number | null;
  description: string;
  color?: string;
}

export interface RubricCategoryScore {
  name?: string;
  score: number; // 0 - 100
  reasoning: string;
  evidenceQuote?: string;
}

export interface QuestionEvaluation {
  status?: 'evaluated' | 'unavailable';
  source?: InterviewSource;
  unavailableReason?: string;
  score?: number | null; // 0 - 100 or null when fallback/demo
  technicalDepthScore?: number;
  relevanceScore?: number;
  reasoningScore?: number;
  completenessScore?: number;
  communicationScore?: number;
  accuracyScore?: number;
  structureScore?: number;
  rubricBreakdown?: Record<string, RubricCategoryScore>;
  verifiedClaims?: string[];
  unverifiedOrQuestionableClaims?: string[];
  feedback: string;
  strengths: string[];
  missedPoints: string[];
  betterAnswerExample: string;
  starMethodologyUsed?: boolean;
}

export interface InterviewQuestion {
  id: string;
  orderIndex: number;
  questionText: string;
  category: 'technical' | 'behavioral' | 'hr' | 'system_design' | 'situational';
  contextOrHints?: string;
  candidateAnswer?: string;
  timeTakenSeconds?: number;
  evaluation?: QuestionEvaluation;
  followUpToQuestionId?: string;
  isFollowUp?: boolean;
  followUpReason?: string;
  source?: InterviewSource;
}

export interface FeedbackReport {
  id: string;
  sessionId: string;
  candidateName: string;
  role: string;
  company: string;
  interviewType: InterviewType;
  source?: InterviewSource;
  overallScore?: number | null; // 0 - 100 or null when fallback/demo
  rubricPillars?: RubricPillar[];
  technicalAccuracyScore?: number | null;
  communicationScore?: number | null;
  structureStarScore?: number | null;
  relevanceScore?: number | null;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missedConcepts: string[];
  actionableImprovements: string[];
  recommendedTopics: string[];
  exampleImprovedAnswers: {
    question: string;
    originalSummary: string;
    improvedAnswer: string;
    whyBetter: string;
  }[];
  prepPlan: {
    dayOrPhase: string;
    focus: string;
    actionItems: string[];
  }[];
  questionsEvaluated: InterviewQuestion[];
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  title: string;
  config: InterviewConfig;
  status: SessionStatus;
  questions: InterviewQuestion[];
  currentQuestionIndex: number;
  feedbackReport?: FeedbackReport;
  startedAt: string;
  completedAt?: string;
  elapsedSeconds: number;
}

export interface ResumeAnalysis {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  extractedSkills: string[];
  missingSkillsForRole: string[];
  source?: InterviewSource;
  atsScoreEstimate?: number | null; // 0 - 100 or null when fallback/demo
  educationFound: string[];
  experienceSummary: string;
  projectsDetected: string[];
  strengths: string[];
  keywordGaps: string[];
  actionableImprovements: string[];
  tailoredInterviewQuestions: string[];
  createdAt: string;
}

export interface UsageQuota {
  freeInterviewsTotal: number;
  interviewsUsed: number;
  interviewsRemaining: number;
  planName: 'Free Tier' | 'Student Pro' | 'Placement Unlimited';
  resetsAt?: string;
}

export interface PrivacyPreferences {
  // Truly optional candidate preferences (unselected/opt-in by default where appropriate):
  voiceSynthesisEnabled: boolean; // defaults to true; when false, tts.speak() in speech.ts is silenced immediately
  ephemeralPracticeMode: boolean; // defaults to false (unselected); when true, transcripts are scrubbed before saving
  analyticsOptIn: boolean; // defaults to false (unselected); honest disclosure that zero 3rd-party trackers are used
  // Legacy compatibility fields:
  saveTranscriptsLocally?: boolean;
  allowVoiceSimulation?: boolean;
  optInAnonymousDiagnostics?: boolean;
  consentAcknowledgedAt?: string;
  consentVersion?: string;
}
