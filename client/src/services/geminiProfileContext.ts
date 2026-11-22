/**
 * InterviewBro AI - Unified Gemini Profile Context Transformer
 * 
 * Transforms the rich, normalized CandidateProfile into a compact, high-signal
 * context object injected into Gemini system instructions and user prompts.
 * 
 * Functions:
 * 1. Stream + Target Role selects question banks and domain depth
 * 2. Resume content generates personalized project and tool questions
 * 3. Weak areas increase question frequency in specific categories and trigger Academy lessons
 * 4. Timeline shapes the 7-day or 30-day preparation strategy
 * 5. Communication baseline tunes feedback tone, scaffolding, and difficulty
 */

import { CandidateProfile, UserProfile } from '../types';

export interface GeminiProfileContext {
  targetRole: string;
  targetIndustry: string;
  stream: string;
  degree: string;
  educationLevel: string;
  currentStatus: string;
  skills: string[];
  topSkillsList: string;
  weakAreas: string[];
  strengthAreas: string[];
  timeline: string;
  prepStrategyDirective: string;
  communicationToneDirective: string;
  questionGenerationDirective: string;
  evaluationRubricDirective: string;
  resumeHighlights: string;
  academyLessonRecommendations: Array<{ id: string; title: string; reason: string }>;
  promptContextBlock: string;
}

export function buildGeminiProfileContext(profile: Partial<CandidateProfile | UserProfile> | null | undefined): GeminiProfileContext {
  if (!profile) {
    return {
      targetRole: 'Software Engineer',
      targetIndustry: 'Technology',
      stream: 'Engineering & Technology',
      degree: 'Bachelor of Technology',
      educationLevel: 'undergraduate',
      currentStatus: 'Fresher',
      skills: ['Problem Solving', 'Communication'],
      topSkillsList: 'Problem Solving, Communication',
      weakAreas: [],
      strengthAreas: [],
      timeline: '1 month',
      prepStrategyDirective: 'Standard 4-week structured preparation cadence.',
      communicationToneDirective: 'Professional, encouraging, high-standards placement coach tone.',
      questionGenerationDirective: 'Focus on balanced foundational concepts, practical scenarios, and structured answers.',
      evaluationRubricDirective: 'Standard campus hiring rubric: Relevance, Structure, Concrete Evidence, and Composure.',
      resumeHighlights: 'No resume uploaded yet.',
      academyLessonRecommendations: [
        { id: 'star-methodology', title: 'Mastering the STAR Method', reason: 'Essential foundation for structured behavioral answers.' }
      ],
      promptContextBlock: `[CANDIDATE CONTEXT]
Target Role: Software Engineer
Current Status: Fresher / Graduate
Education: Undergraduate Degree
Focus: Practical interview scenarios and structured answers.`
    };
  }

  // 1. Resolve Identity & Education
  const primaryEdu = (profile as any).education?.[0] || (profile as any).candidateEducation?.[0];
  const eduLevel = String(primaryEdu?.level || (profile as any).educationLevel || (profile as any).education_level || 'undergraduate').toLowerCase();
  const degree = String(primaryEdu?.degree || (profile as any).degreeCourse || (profile as any).degree_course || 'Bachelor of Technology');
  const stream = String(primaryEdu?.stream || (profile as any).academicStream || (profile as any).academic_stream || 'Engineering & Technology');
  const institution = String(primaryEdu?.institution || (profile as any).college || 'University');
  const currentStatus = String((profile as any).currentStatus || (profile as any).current_status || (profile as any).experience_level || 'Fresher');

  // 2. Resolve Career Target
  const careerTarget = (profile as any).careerTarget;
  const targetRole = String(
    careerTarget?.primaryTargetRole ||
    (profile as any).primary_target_role ||
    (profile as any).role_target ||
    (profile as any).target_roles?.[0] ||
    'Software Engineer'
  );
  const targetIndustry = String(
    careerTarget?.targetIndustry ||
    (profile as any).target_industry ||
    (profile as any).currentIndustry ||
    'Technology'
  );
  const timeline = String(
    careerTarget?.timeline ||
    (profile as any).preparation_timeline ||
    '1 month'
  );
  const interviewTypeFocus = String(
    careerTarget?.interviewTypeFocus ||
    (profile as any).interview_type_focus ||
    'Technical'
  );

  // 3. Resolve Skills & Proficiencies
  let skillsArr: string[] = [];
  if (Array.isArray((profile as any).skills)) {
    skillsArr = (profile as any).skills;
  } else if (Array.isArray((profile as any).candidateSkills)) {
    skillsArr = (profile as any).candidateSkills.map((s: any) => s.name);
  }
  const topSkillsList = skillsArr.slice(0, 10).join(', ') || 'Core domain fundamentals';

  // 4. Resolve Resume Highlights & Detected Projects
  const activeResume = (profile as any).resumes?.find((r: any) => r.isActive) || (profile as any).candidateResumes?.[0];
  const projectsList = (profile as any).experience?.filter((e: any) => e.category === 'project') || (profile as any).projects || [];
  
  let resumeHighlights = 'No active resume parsed.';
  if (activeResume) {
    const resumeScore = activeResume.resumeScore || 75;
    const keyStrengths = (activeResume.strengths || []).slice(0, 3).join('; ');
    const keyGaps = (activeResume.gaps || []).slice(0, 3).join('; ');
    resumeHighlights = `Resume Score: ${resumeScore}/100. Strengths: ${keyStrengths || 'Solid fundamentals'}. Gaps: ${keyGaps || 'Needs quantified metrics'}.`;
  } else if (projectsList.length > 0) {
    const projSummary = projectsList.slice(0, 2).map((p: any) => p.title || p.description).join('; ');
    resumeHighlights = `Candidate Projects: ${projSummary}`;
  }

  // 5. Weak Areas & Strengths
  const weakAreas: string[] = Array.isArray((profile as any).weakAreas)
    ? (profile as any).weakAreas
    : (Array.isArray((profile as any).weak_areas) ? (profile as any).weak_areas : []);

  const strengthAreas: string[] = Array.isArray((profile as any).strengthAreas)
    ? (profile as any).strengthAreas
    : (Array.isArray((profile as any).strength_areas) ? (profile as any).strength_areas : []);

  // 6. Communication Baseline & Self-Reported Comfort
  const commBaseline = (profile as any).communicationBaseline || (profile as any).communication_baseline || {
    confidence: 75,
    clarity: 75,
    pace: 'moderate',
    fillerWordsPerMin: 2,
    answerStructureStar: 70
  };

  const selfComfort = (profile as any).selfReportedComfort || (profile as any).self_reported_comfort || {
    nervous: false,
    englishFluency: 'comfortable',
    freezesOnTechnical: false
  };

  // 7. Compute Communication Tone Directive
  let toneDirective = 'Maintain a supportive yet rigorous coaching tone.';
  if (selfComfort.nervous || commBaseline.confidence < 60) {
    toneDirective = 'Candidate reports interview nervousness and developing confidence. Start with warm, conversational validation, offer encouraging feedback before critiques, and scaffold complex multi-part questions.';
  } else if (commBaseline.pace === 'fast' || commBaseline.fillerWordsPerMin > 4) {
    toneDirective = 'Candidate exhibits rapid speech or elevated filler words under pressure. Prompt for structured pauses and explicitly coach STAR structure (Situation, Task, Action, Result).';
  } else if (commBaseline.confidence >= 85 && commBaseline.answerStructureStar >= 80) {
    toneDirective = 'Candidate exhibits strong baseline communication. Challenge with high-level architectural trade-offs, edge-case pressure testing, and executive presence probes.';
  }

  // 8. Compute Prep Strategy Directive (Timeline shaped)
  let prepStrategy = '4-Week Structured Mastery: Week 1 Foundations; Week 2 Core Domain; Week 3 Behavioral STAR; Week 4 Mock Simulations.';
  if (timeline.includes('1 week') || timeline.includes('urgent')) {
    prepStrategy = 'High-Yield 7-Day Sprint: Prioritize top-frequency interview questions, concise self-introduction, and 2 polished STAR project narratives.';
  } else if (timeline.includes('exploring')) {
    prepStrategy = 'Exploratory & Comprehensive: Build domain depth, experiment with diverse question categories, and develop cross-functional fluency.';
  }

  // 9. Compute Question Generation Directive (Stream + Target Role + Weak Areas)
  let qGenDirective = `Tailor all questions directly to the target role "${targetRole}" in the "${stream}" domain.`;
  if (weakAreas.length > 0) {
    qGenDirective += `\n- HIGH PRIORITY: Allocate at least 2 questions to probe and reinforce candidate weak areas: [${weakAreas.slice(0, 3).join(', ')}].`;
  }
  if (projectsList.length > 0) {
    qGenDirective += `\n- GROUNDING: Directly reference or cross-examine candidate practical projects and tools where appropriate.`;
  }

  // 10. Recommend Academy Lessons based on Weak Areas & Stream
  const academyRecs: Array<{ id: string; title: string; reason: string }> = [];
  const weakStr = weakAreas.join(' ').toLowerCase();

  if (weakStr.includes('star') || weakStr.includes('structure') || commBaseline.answerStructureStar < 70) {
    academyRecs.push({
      id: 'star-methodology',
      title: 'Mastering the STAR Framework',
      reason: 'Strengthens logical answer structure and concrete result articulation.'
    });
  }
  if (weakStr.includes('filler') || commBaseline.fillerWordsPerMin > 3) {
    academyRecs.push({
      id: 'filler-elimination',
      title: 'Eliminating Fillers & Strategic Pausing',
      reason: 'Reduces filler word density and improves poise under interview pressure.'
    });
  }
  if (weakStr.includes('technical') || weakStr.includes('code') || selfComfort.freezesOnTechnical) {
    academyRecs.push({
      id: 'technical-clarity',
      title: 'Explaining Technical Concepts with Intuition',
      reason: 'Helps break down complex technical solutions without freezing.'
    });
  }
  if (academyRecs.length === 0) {
    academyRecs.push(
      { id: 'impactful-self-intro', title: 'The 90-Second Self-Introduction', reason: 'High-impact opening for every campus and professional interview.' },
      { id: 'handling-unknown-questions', title: 'What to Say When You Don\'t Know the Answer', reason: 'Demonstrates honest problem-solving without guessing.' }
    );
  }

  // 11. Format Compact Prompt Context Block
  const promptContextBlock = `[VERIFIED CANDIDATE PROFILE CONTEXT]
- Target Role: ${targetRole} (${targetIndustry})
- Candidate Status: ${currentStatus} | Timeline: ${timeline}
- Academic Background: ${degree} in ${stream} (${institution})
- Known Skills & Tools: ${topSkillsList}
- Active Resume Context: ${resumeHighlights}
- Known Improvement Areas: ${weakAreas.length > 0 ? weakAreas.join(', ') : 'None logged yet'}
- Candidate Known Strengths: ${strengthAreas.length > 0 ? strengthAreas.join(', ') : 'Broad domain foundation'}
- Coaching Baseline Tone: ${toneDirective}
- Preparation Cadence: ${prepStrategy}`;

  return {
    targetRole,
    targetIndustry,
    stream,
    degree,
    educationLevel: eduLevel,
    currentStatus,
    skills: skillsArr,
    topSkillsList,
    weakAreas,
    strengthAreas,
    timeline,
    prepStrategyDirective: prepStrategy,
    communicationToneDirective: toneDirective,
    questionGenerationDirective: qGenDirective,
    evaluationRubricDirective: `Evaluate through the candidate's exact background (${degree} / ${targetRole}). Benchmark answers realistically against a ${currentStatus} standard.`,
    resumeHighlights,
    academyLessonRecommendations: academyRecs,
    promptContextBlock
  };
}
