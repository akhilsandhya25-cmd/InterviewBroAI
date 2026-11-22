/**
 * InterviewBro AI - Normalized Candidate Profile Types
 * Stream-agnostic, relational, progressive candidate profile system.
 */

export type CurrentStatus = 'Student' | 'Fresher' | 'Job seeker' | 'Working professional';

export type EducationLevelType = 'diploma' | 'undergraduate' | 'postgraduate' | 'professional';

export type ExperienceCategory =
  | 'project'
  | 'internship'
  | 'work_experience'
  | 'certification'
  | 'achievement'
  | 'leadership';

export type SkillCategory = 'Technical' | 'Domain' | 'Communication' | 'Analytical' | 'Management';

export type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export type InterviewTypeFocus = 'HR' | 'Technical' | 'Domain' | 'Group discussion' | 'Mixed';

export type CompanyTypePreference = 'Startup' | 'MNC' | 'PSU-Government' | 'Not sure';

export type PreparationTimeline = '1 week' | '1 month' | 'exploring';

export interface CandidateEducation {
  id: string;
  userId: string;
  level: EducationLevelType;
  degree: string;
  stream: string;
  specialization?: string;
  institution: string;
  yearOfStudy?: string;
  graduationYear?: string;
  scoreCgpaPercentage?: string;
  keySubjects: string[];
  isPrimary: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateSkill {
  id: string;
  userId: string;
  name: string;
  category: SkillCategory;
  selfRating: SkillProficiency;
  verified?: boolean;
  createdAt?: string;
}

export interface CandidateExperience {
  id: string;
  userId: string;
  category: ExperienceCategory;
  title: string;
  organization?: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
  techTools?: string[];
  outcomeMetric?: string;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CandidateResume {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  storagePath?: string;
  targetRole: string;
  resumeScore: number;
  strengths: string[];
  gaps: string[];
  suggestedFixes: string[];
  parsedData?: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CommunicationBaseline {
  confidence: number; // 0 - 100
  clarity: number; // 0 - 100
  pace: 'slow' | 'moderate' | 'fast';
  fillerWordsPerMin: number;
  answerStructureStar: number; // 0 - 100
  evaluatedFromSessionsCount: number;
}

export interface SelfReportedComfort {
  nervous: boolean;
  englishFluency: 'struggling' | 'comfortable' | 'fluent';
  freezesOnTechnical: boolean;
}

export interface CandidatePreferences {
  deliveryMode: 'voice' | 'text';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sessionLengthMinutes: number;
  remindersEnabled: boolean;
  accessibilityNeeds?: string;
  languageMix: string;
}

export interface ReadinessScores {
  overall: number; // 0 - 100
  hr: number;
  technical: number;
  communication: number;
  resume: number;
}

export interface CareerTarget {
  targetRoles: string[];
  primaryTargetRole: string;
  targetIndustry: string;
  interviewTypeFocus: InterviewTypeFocus;
  companyTypePreference: CompanyTypePreference;
  timeline: PreparationTimeline;
}

export interface CandidateProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  cityState?: string;
  preferredInterviewLanguage: string;
  currentStatus: CurrentStatus;

  // Career Target
  careerTarget: CareerTarget;

  // Satellite normalized collections
  education: CandidateEducation[];
  skills: CandidateSkill[];
  experience: CandidateExperience[];
  resumes: CandidateResume[];

  // Practice & AI auto-generated sections
  communicationBaseline: CommunicationBaseline;
  selfReportedComfort: SelfReportedComfort;
  preferences: CandidatePreferences;
  readinessScores: ReadinessScores;
  weakAreas: string[];
  strengthAreas: string[];

  // Quota & completion
  interviewsRemaining: number;
  totalInterviewsTaken: number;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}
