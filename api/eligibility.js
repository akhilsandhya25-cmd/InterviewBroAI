/**
 * InterviewBro AI — Central Interview Eligibility Policy
 * 
 * POLICY: Only B.Tech/B.E. students and recognised undergraduate/postgraduate
 * degree students can access and participate in AI mock interviews.
 * 
 * Intermediate, Diploma/Polytechnic and ITI students are strictly blocked.
 */

// Normalized terms that unambiguously indicate non-degree or pre-degree education
const BLOCKED_LEVELS = new Set([
  'intermediate',
  'diploma_polytechnic',
  'diploma',
  'polytechnic',
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

// Non-degree keywords that disqualify a student even if educationLevel was marked undergraduate
const DISQUALIFYING_COURSE_PATTERNS = [
  /\bdiploma\b/i,
  /\bpolytechnic\b/i,
  /\bpoly\b/i,
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

// Recognised degree patterns (undergraduate, postgraduate, professional degrees)
const RECOGNISED_DEGREE_PATTERNS = [
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
 * for AI mock interviews under the B.Tech & Degree student policy.
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
      isEligible: false,
      status: 'incomplete',
      reason: INCOMPLETE_PROFILE_EXPLANATION
    };
  }

  // Normalize education fields from either camelCase or snake_case
  const rawEduLevel = (
    profile.educationLevel ||
    profile.education_level ||
    ''
  ).toLowerCase().trim();

  const rawGroup = (
    profile.intermediateGroup ||
    profile.intermediate_group ||
    ''
  ).toLowerCase().trim();

  const rawDegree = (
    profile.degreeCourse ||
    profile.degree_course ||
    profile.degree ||
    ''
  ).trim();

  const rawSpecialisation = (
    profile.specialisation ||
    profile.specialization ||
    ''
  ).trim();

  const rawStream = (
    profile.academicStream ||
    profile.academic_stream ||
    ''
  ).toLowerCase().trim();

  const combinedCourseText = `${rawDegree} ${rawSpecialisation} ${rawStream}`.trim();

  // 1. Check explicitly blocked intermediate groups (MPC, BiPC, MEC, CEC, HEC, MBiPC, Vocational)
  if (rawGroup && BLOCKED_INTERMEDIATE_GROUPS.has(rawGroup)) {
    return {
      isEligible: false,
      status: 'ineligible',
      reason: INELIGIBILITY_EXPLANATION,
      educationLevel: rawEduLevel || 'intermediate',
      degreeCourse: rawDegree
    };
  }

  // 2. Check explicitly blocked education levels (Intermediate, Diploma, ITI)
  if (rawEduLevel && BLOCKED_LEVELS.has(rawEduLevel)) {
    return {
      isEligible: false,
      status: 'ineligible',
      reason: INELIGIBILITY_EXPLANATION,
      educationLevel: rawEduLevel,
      degreeCourse: rawDegree
    };
  }

  // 3. Inspect degree/course text for disqualifying non-degree patterns (prevents Diploma classifying as UG)
  if (combinedCourseText) {
    for (const pattern of DISQUALIFYING_COURSE_PATTERNS) {
      if (pattern.test(combinedCourseText)) {
        return {
          isEligible: false,
          status: 'ineligible',
          reason: INELIGIBILITY_EXPLANATION,
          educationLevel: rawEduLevel || 'non_degree',
          degreeCourse: rawDegree
        };
      }
    }
  }

  // 4. Check for recognised degree course explicitly stated
  if (combinedCourseText) {
    for (const pattern of RECOGNISED_DEGREE_PATTERNS) {
      if (pattern.test(combinedCourseText)) {
        return {
          isEligible: true,
          status: 'eligible',
          reason: 'Eligible degree candidate.',
          educationLevel: rawEduLevel || 'undergraduate',
          degreeCourse: rawDegree
        };
      }
    }
  }

  // 5. Check if education level is recognized degree level
  const isDegreeLevel = (
    rawEduLevel === 'undergraduate' ||
    rawEduLevel === 'postgraduate' ||
    rawEduLevel === 'professional_degree'
  );

  if (isDegreeLevel) {
    // If degree level is selected and degree course is not disqualifying, candidate is eligible
    return {
      isEligible: true,
      status: 'eligible',
      reason: 'Eligible degree candidate.',
      educationLevel: rawEduLevel,
      degreeCourse: rawDegree || 'Degree Programme'
    };
  }

  // 6. Unknown / Incomplete education level: Blocked until verified
  return {
    isEligible: false,
    status: 'incomplete',
    reason: INCOMPLETE_PROFILE_EXPLANATION,
    educationLevel: rawEduLevel || undefined,
    degreeCourse: rawDegree || undefined
  };
}

/**
 * Convenience boolean helper for interview eligibility
 */
export function isInterviewEligible(profile) {
  return checkInterviewEligibility(profile).isEligible;
}

/**
 * Enforces dual-layer backend authorization across authenticated profile and request payload.
 * Prevents payload tampering (e.g. Intermediate profile claiming B.Tech in payload).
 * 
 * @param {Object} userMetadata - Profile from trusted auth token / database
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
  const profileEligibility = checkInterviewEligibility(userMetadata);

  // If profile is explicitly ineligible, reject immediately (regardless of payload claims)
  if (profileEligibility.status === 'ineligible') {
    return {
      allowed: false,
      status: 403,
      error: 'INELIGIBLE_STUDENT_CATEGORY',
      message: INELIGIBILITY_EXPLANATION,
      details: profileEligibility
    };
  }

  // Check request payload
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

  // If both profile and payload are incomplete (no degree or education provided)
  if (profileEligibility.status === 'incomplete' && configEligibility.status === 'incomplete') {
    return {
      allowed: false,
      status: 403,
      error: 'INELIGIBLE_STUDENT_CATEGORY',
      message: INCOMPLETE_PROFILE_EXPLANATION,
      details: profileEligibility
    };
  }

  // Verify combined effective data
  const combined = { ...userMetadata, ...requestConfig };
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

