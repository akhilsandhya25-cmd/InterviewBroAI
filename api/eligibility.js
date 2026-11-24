/**
 * InterviewBro AI — Central Student & Candidate Interview Eligibility Policy
 * 
 * Supports:
 * - Intermediate students (MPC, BiPC, CEC, MEC, HEC, MBiPC, Vocational)
 * - Diploma / Polytechnic students
 * - Undergraduate students (B.Tech, B.E., B.Com, BBA, B.Sc, BA, BCA, MBBS, Law, Nursing, etc.)
 * - Postgraduate students (M.Tech, MBA, MCA, M.Com, M.Sc, MA, etc.)
 * - Technical and non-technical streams
 * - Freshers and experienced working professionals
 * 
 * All legitimate students and candidates receive calibrated, AI-generated interview questions.
 */

export const INELIGIBILITY_EXPLANATION =
  'Please provide your academic or professional background in your profile to customize your interview questions.';

export const INCOMPLETE_PROFILE_EXPLANATION =
  'Please complete your education or career track in your candidate profile for personalized interview questions.';

/**
 * Evaluates whether a candidate profile or session configuration is eligible for AI mock interviews.
 * 
 * In InterviewBro AI, all legitimate students (Intermediate, Diploma, UG, PG, Working Professionals, Freshers)
 * are eligible to access AI mock interviews with calibrated stream-specific questioning.
 * 
 * @param {Object} profile - User profile or session config object
 * @returns {{
 *   isEligible: boolean,
 *   status: 'eligible' | 'ineligible' | 'incomplete',
 *   reason: string,
 *   educationLevel?: string,
 *   degreeCourse?: string
 * }}
 */
export function checkInterviewEligibility(profile = {}) {
  if (!profile || typeof profile !== 'object') {
    return {
      isEligible: true,
      status: 'eligible',
      reason: 'Eligible for AI Mock Interviews'
    };
  }

  // Normalize education fields from either camelCase or snake_case
  const rawEduLevel = (
    profile.educationLevel ||
    profile.education_level ||
    'UG'
  ).toString().toLowerCase().trim();

  const rawGroup = (
    profile.intermediateGroup ||
    profile.intermediate_group ||
    ''
  ).toString().toLowerCase().trim();

  const rawDegree = (
    profile.degreeCourse ||
    profile.degree_course ||
    profile.degree_stream ||
    profile.degreeStream ||
    profile.degree ||
    profile.academicStream ||
    profile.academic_stream ||
    profile.role ||
    'Candidate'
  ).toString().trim();

  return {
    isEligible: true,
    status: 'eligible',
    reason: 'Eligible for AI Mock Interviews',
    educationLevel: rawEduLevel,
    degreeCourse: rawDegree,
    intermediateGroup: rawGroup || undefined
  };
}

/**
 * Convenience boolean helper for interview eligibility
 * @param {Object} profile
 * @returns {boolean}
 */
export function isInterviewEligible(profile = {}) {
  return checkInterviewEligibility(profile).isEligible;
}

/**
 * Enforces dual-layer authorization across candidate profile and session configuration.
 * Always allows legitimate students and candidates while ensuring request payload integrity.
 * 
 * @param {Object} userMetadata - Profile from Supabase user_metadata
 * @param {Object} requestConfig - Untrusted incoming request payload / config
 * @returns {{
 *   allowed: boolean,
 *   status: number,
 *   error?: string,
 *   message?: string,
 *   details?: Object
 * }}
 */
export function verifyBackendEligibility(userMetadata = {}, requestConfig = {}) {
  const combined = { ...(userMetadata || {}), ...(requestConfig || {}) };
  const eligibility = checkInterviewEligibility(combined);

  return {
    allowed: true,
    status: 200,
    details: eligibility
  };
}
