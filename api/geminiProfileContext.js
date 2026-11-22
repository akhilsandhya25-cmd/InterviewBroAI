import { sanitizeForPrompt } from './security.js';

/**
 * InterviewBro AI - Unified Serverless Gemini Profile Context Transformer (Backend)
 * Converts Candidate Profile data into high-signal Gemini prompt directives.
 */
export function buildGeminiProfileContext(profile) {
  if (!profile || typeof profile !== 'object') {
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
  const primaryEdu = Array.isArray(profile.education) ? profile.education[0] : (profile.candidateEducation?.[0] || null);
  const eduLevel = sanitizeForPrompt(String(primaryEdu?.level || profile.educationLevel || profile.education_level || 'undergraduate')).toLowerCase().slice(0, 50);
  const degree = sanitizeForPrompt(String(primaryEdu?.degree || profile.degreeCourse || profile.degree_course || 'Bachelor of Technology')).slice(0, 100);
  const stream = sanitizeForPrompt(String(primaryEdu?.stream || profile.academicStream || profile.academic_stream || 'Engineering & Technology')).slice(0, 100);
  const institution = sanitizeForPrompt(String(primaryEdu?.institution || profile.college || 'University')).slice(0, 100);
  const currentStatus = sanitizeForPrompt(String(profile.currentStatus || profile.current_status || profile.experience_level || 'Fresher')).slice(0, 50);

  // 2. Resolve Career Target
  const careerTarget = profile.careerTarget || {};
  const targetRole = sanitizeForPrompt(String(
    careerTarget.primaryTargetRole ||
    profile.primary_target_role ||
    profile.role_target ||
    (Array.isArray(profile.target_roles) ? profile.target_roles[0] : '') ||
    'Software Engineer'
  )).slice(0, 100);

  const targetIndustry = sanitizeForPrompt(String(
    careerTarget.targetIndustry ||
    profile.target_industry ||
    profile.currentIndustry ||
    'Technology'
  )).slice(0, 100);

  const timeline = sanitizeForPrompt(String(
    careerTarget.timeline ||
    profile.preparation_timeline ||
    '1 month'
  )).slice(0, 50);

  // 3. Resolve Skills
  let skillsArr = [];
  if (Array.isArray(profile.skills)) {
    skillsArr = profile.skills.map(s => sanitizeForPrompt(String(s)).slice(0, 60));
  } else if (Array.isArray(profile.candidateSkills)) {
    skillsArr = profile.candidateSkills.map(s => sanitizeForPrompt(String(s?.name || '')).slice(0, 60));
  }
  const topSkillsList = skillsArr.slice(0, 10).join(', ') || 'Core domain fundamentals';

  // 4. Resolve Resume Highlights
  const activeResume = (Array.isArray(profile.resumes) ? profile.resumes.find(r => r.isActive) : null) || (profile.candidateResumes?.[0] || null);
  const projectsList = (Array.isArray(profile.experience) ? profile.experience.filter(e => e.category === 'project') : null) || profile.projects || [];

  let resumeHighlights = 'No active resume parsed.';
  if (activeResume) {
    const resumeScore = typeof activeResume.resumeScore === 'number' ? activeResume.resumeScore : 75;
    const keyStrengths = (activeResume.strengths || []).slice(0, 3).map(s => sanitizeForPrompt(String(s))).join('; ');
    const keyGaps = (activeResume.gaps || []).slice(0, 3).map(g => sanitizeForPrompt(String(g))).join('; ');
    resumeHighlights = `Resume Score: ${resumeScore}/100. Strengths: ${keyStrengths || 'Solid fundamentals'}. Gaps: ${keyGaps || 'Needs quantified metrics'}.`;
  } else if (Array.isArray(projectsList) && projectsList.length > 0) {
    const projSummary = projectsList.slice(0, 2).map(p => sanitizeForPrompt(String(p.title || p.description || ''))).join('; ');
    resumeHighlights = `Candidate Projects: ${projSummary}`;
  }

  // 5. Weak & Strength Areas
  const weakAreas = (Array.isArray(profile.weakAreas) ? profile.weakAreas : (Array.isArray(profile.weak_areas) ? profile.weak_areas : [])).map(w => sanitizeForPrompt(String(w)).slice(0, 80));
  const strengthAreas = (Array.isArray(profile.strengthAreas) ? profile.strengthAreas : (Array.isArray(profile.strength_areas) ? profile.strength_areas : [])).map(s => sanitizeForPrompt(String(s)).slice(0, 80));

  // 6. Communication Baseline
  const commBaseline = profile.communicationBaseline || profile.communication_baseline || {
    confidence: 75,
    clarity: 75,
    pace: 'moderate',
    fillerWordsPerMin: 2,
    answerStructureStar: 70
  };

  const selfComfort = profile.selfReportedComfort || profile.self_reported_comfort || {
    nervous: false,
    englishFluency: 'comfortable',
    freezesOnTechnical: false
  };

  let toneDirective = 'Maintain a supportive yet rigorous coaching tone.';
  if (selfComfort.nervous || commBaseline.confidence < 60) {
    toneDirective = 'Candidate reports interview nervousness and developing confidence. Start with warm conversational validation, offer encouraging feedback before critiques, and scaffold multi-part questions.';
  } else if (commBaseline.pace === 'fast' || commBaseline.fillerWordsPerMin > 4) {
    toneDirective = 'Candidate exhibits rapid delivery or elevated filler words under pressure. Prompt for structured pauses and explicitly coach STAR structure (Situation, Task, Action, Result).';
  } else if (commBaseline.confidence >= 85 && commBaseline.answerStructureStar >= 80) {
    toneDirective = 'Candidate exhibits strong baseline communication. Challenge with high-level architectural trade-offs, edge-case pressure testing, and executive presence probes.';
  }

  let prepStrategy = '4-Week Structured Mastery: Week 1 Foundations; Week 2 Core Domain; Week 3 Behavioral STAR; Week 4 Mock Simulations.';
  if (timeline.includes('1 week') || timeline.includes('urgent')) {
    prepStrategy = 'High-Yield 7-Day Sprint: Prioritize top-frequency interview questions, concise self-introduction, and 2 polished STAR project narratives.';
  } else if (timeline.includes('exploring')) {
    prepStrategy = 'Exploratory & Comprehensive: Build domain depth, experiment with diverse question categories, and develop cross-functional fluency.';
  }

  let qGenDirective = `Tailor all questions directly to the target role "${targetRole}" in the "${stream}" domain.`;
  if (weakAreas.length > 0) {
    qGenDirective += `\n- HIGH PRIORITY: Allocate at least 2 questions to probe candidate weak areas: [${weakAreas.slice(0, 3).join(', ')}].`;
  }
  if (Array.isArray(projectsList) && projectsList.length > 0) {
    qGenDirective += `\n- GROUNDING: Directly reference or cross-examine candidate practical projects and tools where appropriate.`;
  }

  const academyRecs = [];
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
