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
  created_at: string;
  updated_at: string;
}

export interface CompanyPreset {
  id: string;
  name: string;
  category: CompanyCategory;
  tagline: string;
  logo: string;
  color: string;
  popularRoles: string[];
  focusAreas: string[];
  interviewStructure: string[];
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
}

export interface RubricCategoryScore {
  score: number; // 0 - 100
  reasoning: string;
  evidenceQuote?: string;
}

export interface QuestionEvaluation {
  status?: 'evaluated' | 'unavailable';
  unavailableReason?: string;
  score: number; // 0 - 100
  technicalDepthScore?: number;
  relevanceScore?: number;
  reasoningScore?: number;
  completenessScore?: number;
  communicationScore?: number;
  accuracyScore?: number;
  structureScore?: number;
  rubricBreakdown?: {
    technicalCorrectness: RubricCategoryScore;
    relevance: RubricCategoryScore;
    problemSolvingReasoning: RubricCategoryScore;
    completenessAndExamples: RubricCategoryScore;
    communicationClarity: RubricCategoryScore;
  };
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
}

export interface FeedbackReport {
  id: string;
  sessionId: string;
  candidateName: string;
  role: string;
  company: string;
  interviewType: InterviewType;
  overallScore: number; // 0 - 100
  technicalAccuracyScore: number;
  communicationScore: number;
  structureStarScore: number;
  relevanceScore: number;
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
  atsScoreEstimate: number; // 0 - 100
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
