/**
 * InterviewBro AI — Central Interview Eligibility Policy (Client)
 * 
 * POLICY: Only B.Tech/B.E. students and recognised undergraduate/postgraduate
 * degree students can access and participate in AI mock interviews.
 * 
 * Intermediate, Diploma/Polytechnic and ITI students are strictly blocked.
 */

import { UserProfile, InterviewConfig } from '../types';

export interface EligibilityResult {
  isEligible: boolean;
  status: 'eligible' | 'ineligible' | 'incomplete';
  reason: string;
  educationLevel?: string;
  degreeCourse?: string;
}

const BLOCKED_LEVELS = new Set([
  'intermediate',
  'iti_vocational',
  'iti',
  'vocational',
  'vocational_inter'
]);

const BLOCKED_INTERMEDIATE_GROUPS = new Set([
  'mpc',
  'bipc',
  'mec',
  'cec',
  'hec',
  'mbipc',
  'vocational',
  'vocational_inter'
]);

const DISQUALIFYING_COURSE_PATTERNS = [
  /\biti\b/i,
  /\bintermediate\b/i,
  /\b10\s*\+\s*2\b/i,
  /\bjunior\s*college\b/i,
  /\bhigher\s*secondary\b/i,
  /\bpuc\b/i,
  /\bpre[\s-]*university\b/i,
  /\bclass\s*(11|12|xi|xii)\b/i,
  /\bvocational\b/i,
  /\bfitter\b/i,
  /\bwelder\b/i,
  /\bmachinist\b/i,
  /\bwireman\b/i,
  /\btrade\s*certificate\b/i,
  /\bmpc\b/i,
  /\bbipc\b/i,
  /\bmec\b/i,
  /\bcec\b/i,
  /\bhec\b/i,
  /\bmbipc\b/i
];

const RECOGNISED_DEGREE_PATTERNS = [
  /\bdiploma\b/i,
  /\bpolytechnic\b/i,
  /\bb[\s.]*tech\b/i,
  /\bb[\s.]*e\b/i,
  /\bbachelor\s*of\s*(technology|engineering|science|commerce|arts|business|computer|pharmacy|architecture|design|laws|medicine)\b/i,
  /\bm[\s.]*tech\b/i,
  /\bm[\s.]*e\b/i,
  /\bmaster\s*of\s*(technology|engineering|science|commerce|arts|business|computer|pharmacy|architecture|design|laws)\b/i,
  /\bb[\s.]*com\b/i,
  /\bm[\s.]*com\b/i,
  /\bbba\b/i,
  /\bmba\b/i,
  /\bbca\b/i,
  /\bmca\b/i,
  /\bb[\s.]*sc\b/i,
  /\bm[\s.]*sc\b/i,
  /\bb[\s.]*a\b/i,
  /\bm[\s.]*a\b/i,
  /\bb[\s.]*pharm\b/i,
  /\bm[\s.]*pharm\b/i,
  /\bpharm[\s.]*d\b/i,
  /\bmbbs\b/i,
  /\bbds\b/i,
  /\bbams\b/i,
  /\bbhms\b/i,
  /\bb[\s.]*sc\s*nursing\b/i,
  /\bnursing\s*degree\b/i,
  /\bll[\s.]*b\b/i,
  /\bll[\s.]*m\b/i,
  /\bph[\s.]*d\b/i,
  /\bdoctorate\b/i,
  /\bb[\s.]*arch\b/i,
  /\bm[\s.]*arch\b/i,
  /\bb[\s.]*des\b/i,
  /\bm[\s.]*des\b/i,
  /\bca\b/i,
  /\bcma\b/i,
  /\bcs\b/i
];

export const INELIGIBILITY_EXPLANATION =
  'AI Mock Interviews are currently available for B.Tech and degree students. You can still explore the learning resources and other available features of InterviewBro AI.';

export const INCOMPLETE_PROFILE_EXPLANATION =
  'Please complete your degree and education details in your candidate profile to verify eligibility for AI Mock Interviews.';

/**
 * Evaluates whether a candidate profile or session configuration is eligible
 * for AI mock interviews.
 * 
 * In InterviewBro AI 2.0, all candidates (Students, Freshers, Job Seekers,
 * Working Professionals, Diploma, UG, PG) are 100% eligible to practice mock
 * interviews immediately. Nothing blocks the user from practicing.
 */
export function checkInterviewEligibility(profile?: Partial<UserProfile> | Partial<InterviewConfig> | null): EligibilityResult {
  return {
    isEligible: true,
    status: 'eligible',
    reason: 'Eligible for AI Mock Interviews'
  };
}

/**
 * Convenience boolean helper for interview eligibility
 */
export function isInterviewEligible(profile?: Partial<UserProfile> | Partial<InterviewConfig> | null): boolean {
  return checkInterviewEligibility(profile).isEligible;
}

/**
 * Enforces dual-layer authorization across candidate profile and session configuration.
 */
export function verifyBackendEligibility(
  userMetadata?: Partial<UserProfile> | null,
  requestConfig?: Partial<InterviewConfig> | null
): {
  allowed: boolean;
  status: number;
  error?: string;
  message?: string;
  details?: EligibilityResult;
} {
  const profileEligibility = checkInterviewEligibility(userMetadata);

  if (profileEligibility.status === 'ineligible') {
    return {
      allowed: false,
      status: 403,
      error: 'INELIGIBLE_STUDENT_CATEGORY',
      message: INELIGIBILITY_EXPLANATION,
      details: profileEligibility
    };
  }

  const configEligibility = checkInterviewEligibility(requestConfig);
  if (configEligibility.status === 'ineligible') {
    return {
      allowed: false,
      status: 403,
      error: 'INELIGIBLE_STUDENT_CATEGORY',
      message: INELIGIBILITY_EXPLANATION,
      details: configEligibility
    };
  }

  if (profileEligibility.status === 'incomplete' && configEligibility.status === 'incomplete') {
    return {
      allowed: false,
      status: 403,
      error: 'INELIGIBLE_STUDENT_CATEGORY',
      message: INCOMPLETE_PROFILE_EXPLANATION,
      details: profileEligibility
    };
  }

  const combined = { ...(userMetadata || {}), ...(requestConfig || {}) };
  const combinedEligibility = checkInterviewEligibility(combined);
  if (!combinedEligibility.isEligible) {
    return {
      allowed: false,
      status: 403,
      error: 'INELIGIBLE_STUDENT_CATEGORY',
      message: combinedEligibility.reason || INELIGIBILITY_EXPLANATION,
      details: combinedEligibility
    };
  }

  return { allowed: true, status: 200, details: combinedEligibility };
}

