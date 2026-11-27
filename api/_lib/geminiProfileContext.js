import { sanitizeForPrompt } from './security.js';

/**
 * InterviewBro AI - Simple Serverless Gemini Profile Context Transformer (Backend)
 */
export function buildGeminiProfileContext(profile) {
  if (!profile || typeof profile !== 'object') {
    return {
      targetRole: 'Software Engineer',
      degreeStream: 'B.Tech Computer Science',
      educationLevel: 'UG',
      currentStatus: 'Student',
      skills: ['Problem Solving', 'Communication'],
      resumeHighlights: 'No resume uploaded yet.',
      weakAreas: [],
      strengths: ['Core domain foundation'],
      promptContextBlock: `[CANDIDATE CONTEXT]
Target Role: Software Engineer
Education: UG (B.Tech Computer Science)
Status: Student / Fresher`
    };
  }

  const currentStatus = sanitizeForPrompt(String(profile.currentStatus || profile.current_status || profile.experience_level || 'Student')).slice(0, 50);
  const educationLevel = sanitizeForPrompt(String(profile.educationLevel || profile.education_level || 'UG')).slice(0, 50);
  const degreeStream = sanitizeForPrompt(String(profile.academicStream || profile.stream || profile.degreeStream || profile.degree_stream || profile.degreeCourse || profile.degree_course || 'B.Tech Computer Science')).slice(0, 100);
  const targetRole = sanitizeForPrompt(String(profile.role || profile.targetRole || profile.target_role || profile.role_target || 'Software Engineer')).slice(0, 100);

  const skillsArr = Array.isArray(profile.skills) ? profile.skills.map(s => sanitizeForPrompt(String(s)).slice(0, 50)) : [];
  const weakAreas = Array.isArray(profile.weakAreas)
    ? profile.weakAreas
    : (Array.isArray(profile.weak_areas) ? profile.weak_areas.map(w => sanitizeForPrompt(String(w)).slice(0, 60)) : []);

  let resumeHighlights = 'No resume uploaded yet.';
  if (profile.resumeText && typeof profile.resumeText === 'string') {
    resumeHighlights = `Uploaded Resume Snippet: ${sanitizeForPrompt(profile.resumeText).slice(0, 300).replace(/\s+/g, ' ')}...`;
  } else if (profile.resumeFileName) {
    resumeHighlights = `Resume File on record: ${sanitizeForPrompt(profile.resumeFileName)}`;
  }

  const promptContextBlock = `[VERIFIED CANDIDATE PROFILE]
- Target Role: ${targetRole}
- Academic Degree / Stream: ${degreeStream} (${educationLevel})
- Candidate Status: ${currentStatus}
- Core Skills: ${skillsArr.length > 0 ? skillsArr.join(', ') : 'Domain fundamentals'}
- Known Improvement Areas: ${weakAreas.length > 0 ? weakAreas.join(', ') : 'None recorded yet'}
- Resume Context: ${resumeHighlights}
MANDATE: Calibrate questions, technical depth, and scenarios strictly to the candidate's exact degree/stream (${degreeStream}) and target role (${targetRole}). If non-technical (e.g. B.Com, MBA, Arts), DO NOT ask programming or coding questions unless explicitly relevant to their stream.`;

  return {
    targetRole,
    degreeStream,
    educationLevel,
    currentStatus,
    skills: skillsArr,
    resumeHighlights,
    weakAreas,
    strengths: Array.isArray(profile.strengths) ? profile.strengths : [],
    promptContextBlock
  };
}
