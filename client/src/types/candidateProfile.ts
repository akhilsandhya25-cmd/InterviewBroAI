/**
 * InterviewBro AI - Simple Candidate Profile Types
 * 
 * Minimal, low-friction candidate profile:
 * - 4 core fields at signup (Status, Education, Stream/Degree, Target Role)
 * - Optional extras (Resume, Skills, College, Year, City, Preferences)
 * - Auto-generated practice stats (Readiness, Strengths, Weaknesses)
 */

export type CurrentStatus = 'Student' | 'Fresher' | 'Job seeker' | 'Working professional';

export type EducationLevelType = 'Diploma' | 'UG' | 'PG' | 'Professional';

export type InterviewDeliveryMode = 'video' | 'voice_only' | 'text_only' | 'voice' | 'text';

export interface SimpleCandidateProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;

  // The 4 Core Questions (Signup / Onboarding)
  currentStatus: CurrentStatus;
  educationLevel: EducationLevelType;
  degreeStream: string; // e.g. B.Tech Computer Science, B.Com, MBA, BCA, Mechanical
  targetRole: string;   // e.g. Software Engineer, Financial Analyst, HR Executive

  // Optional (Fill later or auto-fill from resume)
  college?: string;
  graduationYear?: string;
  city?: string;
  preferredLanguage: string; // e.g. English, Hindi, Hinglish, Telugu
  interviewMode: InterviewDeliveryMode;
  skills: string[];
  resumeFileName?: string;
  resumeText?: string;

  // Auto-Generated (Derived from practice sessions & AI feedback)
  readinessScore: number; // 0 - 100
  readinessBreakdown: {
    hr: number;
    technical: number;
    communication: number;
  };
  strengths: string[];
  weakAreas: string[];

  // Quota & Tracking
  interviewsRemaining: number;
  totalInterviewsTaken: number;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// Alias for existing imports
export type CandidateProfile = SimpleCandidateProfile;
