/**
 * InterviewBro AI - Simple Gemini Profile Context Transformer
 * 
 * Extracts candidate status, education level, stream/degree, target role,
 * and resume context to personalize Gemini questions and feedback.
 */

import { CandidateProfile, UserProfile } from '../types';

export interface GeminiProfileContext {
  targetRole: string;
  degreeStream: string;
  educationLevel: string;
  currentStatus: string;
  skills: string[];
  resumeHighlights: string;
  weakAreas: string[];
  strengths: string[];
  promptContextBlock: string;
}

export function buildGeminiProfileContext(profile: Partial<CandidateProfile | UserProfile> | null | undefined): GeminiProfileContext {
  if (!profile) {
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

  const currentStatus = String((profile as any).currentStatus || (profile as any).current_status || (profile as any).experience_level || 'Student');
  const educationLevel = String((profile as any).educationLevel || (profile as any).education_level || 'UG');
  const degreeStream = String((profile as any).degreeStream || (profile as any).degree_stream || (profile as any).degreeCourse || (profile as any).degree_course || 'B.Tech Computer Science');
  const targetRole = String((profile as any).targetRole || (profile as any).target_role || (profile as any).role_target || 'Software Engineer');

  const skillsArr: string[] = Array.isArray(profile.skills) ? profile.skills : [];
  const weakAreas: string[] = Array.isArray(profile.weakAreas)
    ? profile.weakAreas
    : (Array.isArray((profile as any).weak_areas) ? (profile as any).weak_areas : []);

  const strengths: string[] = Array.isArray(profile.strengths) ? profile.strengths : [];

  let resumeHighlights = 'No resume uploaded yet.';
  const rText = (profile as any).resumeText || (profile as any).resume_text;
  const rFile = (profile as any).resumeFileName || (profile as any).resume_file_name;
  if (rText && typeof rText === 'string' && rText.trim()) {
    resumeHighlights = `Uploaded Resume Snippet: ${rText.slice(0, 300).replace(/\s+/g, ' ')}...`;
  } else if (rFile) {
    resumeHighlights = `Resume File on record: ${rFile}`;
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
    strengths,
    promptContextBlock
  };
}
