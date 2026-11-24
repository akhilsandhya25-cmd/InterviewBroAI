import type { EducationLevelId, AcademicStreamId, IntermediateGroupId } from '../data/studentStreams';
import type {
  CandidateProfile,
  SimpleCandidateProfile,
  CurrentStatus,
  EducationLevelType,
  InterviewDeliveryMode
} from './candidateProfile';

export * from './candidateProfile';

export type ExperienceLevel = 'student' | 'fresher' | 'junior' | 'mid' | 'senior';

export type InterviewType = 'technical' | 'behavioral' | 'hr' | 'system_design' | 'managerial' | 'mixed';

export type CompanyCategory = 'Service Giant' | 'Product Unicorn' | 'FAANG / MNC' | 'Startup' | 'Fintech' | 'Academic Preparation';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type SessionStatus = 'setup' | 'in_progress' | 'paused' | 'completed' | 'abandoned';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  name?: string;
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

  // Simple Candidate Profile Fields
  current_status?: CurrentStatus;
  education_level?: EducationLevelType | string;
  degree_stream?: string;
  target_role?: string;
  city?: string;
  preferred_language?: string;
  interview_mode?: InterviewDeliveryMode;
  readiness_score?: number;
  readiness_breakdown?: {
    hr: number;
    technical: number;
    communication: number;
  };
  strengths?: string[];
  weak_areas?: string[];
  candidateSkills?: any;
  resume_file_name?: string;
  resume_text?: string;
  resumeFileName?: string;
  resumeText?: string;

  // Legacy Compatibility Aliases
  city_state?: string;
  preferred_interview_language?: string;
  primary_target_role?: string;
  target_roles?: string[];
  target_industry?: string;
  interview_type_focus?: string;
  company_type_preference?: string;
  preparation_timeline?: string;
  weakAreas?: string[];
  strengthAreas?: string[];
  readinessScores?: any;
  preferences?: any;
  communicationBaseline?: any;
  selfReportedComfort?: any;

  // Adaptive Profile Extensions
  phone?: string;
  location?: string;
  academicStatus?: string;
  professionalStage?: string;
  employmentStatus?: string;
  currentIndustry?: string;
  totalExperienceYears?: string;
  previousJobRole?: string;
  previousQualification?: string;
  preferredCareerField?: string;
  preferredIndustry?: string;
  preferredCompanies?: string;
  preferredJobType?: string;
  projects?: {
    id?: string;
    title: string;
    description: string;
    techStack?: string;
    link?: string;
  }[];
  certifications?: string[];
  achievements?: string[];
  skillProficiencies?: Record<string, 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>;

  // Universal Student Expansion — Optional Academic Profile Fields (Stage 2)
  educationLevel?: EducationLevelId | string;
  academicStream?: AcademicStreamId | string;
  degreeCourse?: string;
  specialisation?: string;
  intermediateGroup?: IntermediateGroupId | string;
  yearOfStudy?: string;
  careerInterests?: string[];
  careerGoal?: string;

  // Database / Snake-case compatibility aliases
  academic_stream?: AcademicStreamId | string;
  degree_course?: string;
  intermediate_group?: IntermediateGroupId | string;
  year_of_study?: string;
  career_interests?: string[];
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

  // Universal Student Expansion (Stage 3 Integration)
  isAcademic?: boolean;
  educationLevel?: string;
  academicStream?: string;
  degreeCourse?: string;
  specialisation?: string;
  intermediateGroup?: string;
  yearOfStudy?: string;
  careerGoal?: string;
  careerInterests?: string[];
  preparationMode?: string;
  subject?: string;
  targetRole?: string;
  interviewDuration?: number;
  candidateProfile?: CandidateProfile;
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
  fillerCount?: number;
  fillerWords?: string[];
  fillerDensity?: number;
  fluencyScore?: number;
  fluencyFeedback?: string;
}

export type AdaptiveDecision = 'PROBE' | 'CLARIFY' | 'CHALLENGE' | 'MOVE_FORWARD' | 'ENCOURAGE';

export interface AdaptiveDecisionInfo {
  decision: AdaptiveDecision;
  reason: string;
  competencyAssessed?: string;
  conceptsDemonstrated?: string[];
  knowledgeGapsDetected?: string[];
  calibratedDifficulty?: DifficultyLevel;
  orderIndex?: number;
}

export interface InterviewCompetency {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty?: DifficultyLevel;
  targetOrder: number;
  explored: boolean;
  fallbackQuestions?: string[];
}

export interface InterviewBlueprint {
  id: string;
  targetRole: string;
  degreeStream: string;
  educationLevel: string;
  intermediateGroup?: string;
  targetCompany: string;
  baseDifficulty: DifficultyLevel;
  totalTargetQuestions: number;
  difficultyProgression: DifficultyLevel[];
  competencies: InterviewCompetency[];
  createdAt: string;
}

export interface InterviewSessionMemory {
  blueprint: InterviewBlueprint;
  previousQuestions: string[];
  topicsExplored: string[];
  demonstratedCompetencies: string[];
  knowledgeGaps: string[];
  decisionsHistory: AdaptiveDecisionInfo[];
  currentDifficulty: DifficultyLevel;
  currentCompetency?: string;
}

export interface InterviewQuestion {
  id: string;
  orderIndex: number;
  questionText: string;
  category:
    | 'technical'
    | 'behavioral'
    | 'hr'
    | 'system_design'
    | 'situational'
    | 'subject_specific'
    | 'college_admission'
    | 'communication'
    | 'career_exploration'
    | 'aptitude_reasoning';
  contextOrHints?: string;
  candidateAnswer?: string;
  timeTakenSeconds?: number;
  evaluation?: QuestionEvaluation;
  followUpToQuestionId?: string;
  isFollowUp?: boolean;
  followUpReason?: string;
  adaptiveDecision?: AdaptiveDecisionInfo;
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
  speechFluency?: {
    totalFillers: number;
    fillerDensity: number;
    overallFluencyScore: number;
    topFillers: Array<{ word: string; count: number }>;
    deliveryAdvice: string;
  };
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
  sessionMemory?: InterviewSessionMemory;
  blueprint?: InterviewBlueprint;
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

  // Stage 6 Multi-Stream Additions
  educationLevel?: string;
  academicStream?: string;
  intermediateGroup?: string;
  evaluationCriteria?: string[];
  isStudent?: boolean;
}

export type ResumeType =
  | 'student_intermediate'
  | 'diploma_polytechnic'
  | 'undergraduate'
  | 'postgraduate'
  | 'professional'
  | 'iti_trade'
  | 'corporate_experienced';

export type ResumeTemplateStyle = 'classic' | 'modern' | 'minimal' | 'technical';

export interface EducationEntry {
  id: string;
  institution: string;
  degreeOrGroup: string; // e.g. "Intermediate (MPC)", "B.Com General", "Diploma Mechanical"
  boardOrUniversity?: string;
  yearOfCompletion: string;
  scoreOrGrade: string; // e.g. "88%", "8.5 CGPA"
  location?: string;
}

export interface ProjectEntry {
  id: string;
  title: string;
  role?: string;
  toolsOrTech?: string; // e.g. "Python, SQL", "Lab equipment, Dial gauge", "Tally, Excel"
  description: string;
  outcomeMetric?: string; // e.g. "Science Fair 2nd Place", "Audited 120 sample transactions"
  link?: string;
}

export interface ExperienceEntry {
  id: string;
  organization: string;
  roleTitle: string; // e.g. "Accounts Intern", "Technician Apprentice", "Staff Nurse (Trainee)"
  startDate: string;
  endDate: string; // or "Present"
  location?: string;
  keyResponsibilities: string[];
}

export interface ResumeBuilderData {
  id: string;
  userId: string;
  resumeType: ResumeType;
  templateStyle: ResumeTemplateStyle;
  
  // Contact & Personal
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinOrPortfolio?: string;
  githubUrl?: string;

  // Core Sections
  summaryOrObjective: string;
  education: EducationEntry[];
  subjects: string[]; // Core coursework subjects
  skills: string[]; // Technical / domain / trade skills
  projects: ProjectEntry[];
  experience: ExperienceEntry[]; // Optional: articleship / clinical postings / apprenticeships / jobs
  certifications: string[];
  achievements: string[];
  extracurricular: string[];

  // Customization & Ordering
  hiddenSections: string[];
  customSectionTitles?: Record<string, string>;
  updatedAt: string;
}

export interface UsageQuota {
  freeInterviewsTotal: number;
  interviewsUsed: number;
  interviewsRemaining: number;
  planName: 'Free Tier' | 'Student Pro' | 'Placement Unlimited' | 'Unlimited Practice';
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


// Re-export Interview Academy types
export * from './academy';

export interface UserFeedback {
  id: string;
  rating: number; // 1 to 5
  category: string;
  categoryLabel?: string;
  message: string;
  name?: string;
  email?: string;
  pageUrl?: string;
  createdAt: string;
}

export interface UserFeedbackInput {
  rating: number;
  category: string;
  message: string;
  name?: string;
  email?: string;
  pageUrl?: string;
}

