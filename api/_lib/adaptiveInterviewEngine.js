// =========================================================================
// InterviewBro AI - Adaptive Interview Intelligence Engine
// Implements:
// 1. Session-level Interview Blueprint creation & memory tracking
// 2. Multi-turn decision matrix: PROBE | CLARIFY | CHALLENGE | MOVE_FORWARD | ENCOURAGE
// 3. Dynamic difficulty calibration (Beginner / Intermediate / Advanced)
// 4. Candidate & Stream-specific questioning (B.Tech, B.Com, BBA, CEC, etc.)
// 5. Semantic repetition prevention & natural conversational spoken phrasing
// 6. Zero-failure resilient deterministic fallbacks
// =========================================================================

import { sanitizeForPrompt } from './security.js';
import { buildGeminiProfileContext } from './geminiProfileContext.js';
import {
  callGemini,
  cleanAndParseJson,
  cleanSpokenQuestion,
  isDuplicateQuestion,
  isSubstantiveAnswer,
  getIsGeminiConfigured,
  clampScore
} from './gemini.js';

/**
 * Checks if a candidate's academic stream, group, or target role is non-technical.
 * Under no circumstances should non-technical candidates be given coding or DSA questions.
 */
export function isNonTechnicalCandidate(stream = '', role = '', group = '') {
  const text = `${stream} ${role} ${group}`.toLowerCase();

  const nonTechKeywords = [
    'b.com', 'bcom', 'm.com', 'mcom', 'accounting', 'accountant', 'chartered accountant', 'ca',
    'gst', 'auditing', 'taxation', 'bba', 'mba', 'marketing', 'sales', 'human resources', 'hr',
    'cec', 'hec', 'mec', 'bipc', 'commerce', 'economics', 'civics', 'arts', 'humanities',
    'history', 'political science', 'law', 'legal', 'advocate', 'nursing', 'pharmacy',
    'healthcare', 'hospital administration', 'biology', 'botany', 'zoology'
  ];

  const techKeywords = [
    'software', 'developer', 'programmer', 'fullstack', 'frontend', 'backend', 'web dev',
    'dsa', 'data structures', 'algorithms', 'computer science', 'cse', 'b.tech cse', 'bca', 'mca',
    'm.tech', 'ai/ml', 'machine learning', 'devops', 'cloud engineer'
  ];

  const hasNonTech = nonTechKeywords.some(k => text.includes(k));
  const hasTech = techKeywords.some(k => text.includes(k));

  // If explicit commerce/management stream (e.g. B.Com Fresher targeting Accountant) -> strictly non-technical
  if (hasNonTech && !hasTech) return true;
  if (text.includes('b.com') || text.includes('bba') || text.includes('cec') || text.includes('accountant')) return true;

  return false;
}

/**
 * Returns structured competencies for a stream, role, and education level.
 */
export function getDomainCompetencies(stream = '', role = '', educationLevel = '', intermediateGroup = '') {
  const normStream = (stream || '').toLowerCase();
  const normRole = (role || '').toLowerCase();
  const normGroup = (intermediateGroup || '').toLowerCase();

  // 1. Commerce, Accounting & Finance (B.Com, M.Com, Accountant, Financial Analyst)
  if (
    normStream.includes('b.com') ||
    normStream.includes('commerce') ||
    normRole.includes('accountant') ||
    normRole.includes('financial analyst') ||
    normRole.includes('tax') ||
    normStream.includes('finance')
  ) {
    return [
      {
        id: 'comp_comm_intro',
        name: 'Academic Foundation & Double-Entry Principles',
        description: 'Self-introduction, core accounting rules, debit/credit mechanisms, and journalizing.',
        category: 'subject_specific',
        difficulty: 'beginner',
        fallbackQuestions: [
          'To start our session, please walk me through your background in commerce, and explain the golden rules of accounting with a brief practical example of a transaction.',
          'Welcome! Tell me about your academic journey in commerce, and how the dual-aspect concept forms the basis of modern double-entry bookkeeping.'
        ]
      },
      {
        id: 'comp_comm_statements',
        name: 'Financial Statements, Trial Balance & Adjustments',
        description: 'Trial balance errors, accruals, depreciation methods, and balance sheet preparation.',
        category: 'technical',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'When preparing year-end financial statements, how do you handle prepaid expenses and accrued revenues, and how do they impact the profit and loss statement?',
          'If a trial balance balances out, does that guarantee there are no accounting errors? Walk me through errors of principle or commission that might still exist.'
        ]
      },
      {
        id: 'comp_comm_tax',
        name: 'Taxation & Statutory Compliance (GST, TDS)',
        description: 'GST input tax credit, TDS deductions, statutory filing deadlines, and invoices.',
        category: 'technical',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'Under the GST regime, what conditions must a business fulfill to claim Input Tax Credit on vendor purchases?',
          'Could you explain the practical mechanics of deducting TDS on professional fees, and how it is remitted to the government?'
        ]
      },
      {
        id: 'comp_comm_audit',
        name: 'Bank Reconciliation & Internal Controls',
        description: 'Bank reconciliation statements (BRS), uncredited cheques, cash book variance, and audit verification.',
        category: 'technical',
        difficulty: 'advanced',
        fallbackQuestions: [
          'Suppose your company cash book shows a different closing balance than the bank passbook. Walk me step-by-step through how you prepare a Bank Reconciliation Statement.',
          'What internal checks or voucher verification steps would you put in place to prevent duplicate payments or unrecorded cash transactions?'
        ]
      },
      {
        id: 'comp_comm_ethics',
        name: 'Professional Integrity & Financial Scenarios',
        description: 'Handling discrepancies, strict client confidentiality, deadlines, and behavioral ethics.',
        category: 'behavioral',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'How would you handle a situation where a manager asks you to record an expense in the wrong financial period to adjust quarterly tax liability?',
          'Tell me about a time you had to meet a tight filing or reporting deadline with incomplete client documentation. How did you organize your priorities?'
        ]
      }
    ];
  }

  // 2. Business Administration & Marketing (BBA, MBA, Marketing Executive, HR)
  if (
    normStream.includes('bba') ||
    normStream.includes('mba') ||
    normStream.includes('marketing') ||
    normRole.includes('marketing') ||
    normRole.includes('hr') ||
    normRole.includes('sales')
  ) {
    return [
      {
        id: 'comp_mgmt_intro',
        name: 'Business Mindset & Career Aspiration',
        description: 'Background, motivation for business management, and industry awareness.',
        category: 'hr',
        difficulty: 'beginner',
        fallbackQuestions: [
          'Welcome to the interview! Please introduce yourself, your academic background in business administration, and what sparked your interest in marketing and strategy.',
          'To begin, walk me through your background and the core business subjects that have shaped your approach to problem solving.'
        ]
      },
      {
        id: 'comp_mgmt_marketing',
        name: 'Marketing Fundamentals & Customer Segmentation',
        description: 'The 4Ps of marketing, STP framework, buyer personas, and market positioning.',
        category: 'technical',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'How would you apply the STP framework (Segmentation, Targeting, and Positioning) to launch a new affordable consumer product in a crowded market?',
          'Walk me through the 4 Ps of marketing for a modern subscription-based service, and how pricing strategy influences brand perception.'
        ]
      },
      {
        id: 'comp_mgmt_channels',
        name: 'Digital Channels & Customer Acquisition Metrics',
        description: 'CAC, LTV, organic vs paid channels, campaign optimization, and conversion funnels.',
        category: 'technical',
        difficulty: 'advanced',
        fallbackQuestions: [
          'When evaluating a digital marketing campaign, how do you balance Customer Acquisition Cost (CAC) against Customer Lifetime Value (LTV)?',
          'Suppose website traffic is high but conversion to signups is dropping. What diagnostic steps would you take to identify where potential customers drop off?'
        ]
      },
      {
        id: 'comp_mgmt_sales',
        name: 'Sales Scenarios & Objection Handling',
        description: 'Overcoming customer price resistance, product pitching, and competitor differentiation.',
        category: 'situational',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'If a potential client tells you that a competitor is offering a similar product at 20 percent lower cost, how do you handle their objection without discounting your value?',
          'Describe how you would research and pitch your company services to a traditional, cautious business client.'
        ]
      },
      {
        id: 'comp_mgmt_team',
        name: 'Stakeholder Collaboration & Conflict Management',
        description: 'Team leadership, cross-functional alignment, and handling workplace disagreements.',
        category: 'behavioral',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'Tell me about a group project or campaign where team members disagreed on the creative direction. How did you bring consensus and deliver on time?',
          'How do you manage communication when delivering critical project updates to senior stakeholders who have competing priorities?'
        ]
      }
    ];
  }

  // 3. Intermediate CEC (Commerce, Economics, Civics)
  if (normGroup === 'cec' || normStream.includes('cec') || (normStream.includes('intermediate') && normStream.includes('commerce'))) {
    return [
      {
        id: 'comp_cec_intro',
        name: 'Introduction & Subject Choice Motivation',
        description: 'Candidate self-introduction, explanation of CEC stream choice, and future study goals.',
        category: 'hr',
        difficulty: 'beginner',
        fallbackQuestions: [
          'Welcome to your interview! Please introduce yourself, tell me about your Intermediate CEC group, and what inspired you to choose Commerce, Economics, and Civics.',
          'To start, share a brief introduction about your schooling, your favorite subject among Commerce, Economics, and Civics, and your future career goals.'
        ]
      },
      {
        id: 'comp_cec_bookkeeping',
        name: 'Basic Bookkeeping & Ledger Principles',
        description: 'Cash book, debit/credit rules, trade transactions, and trial balance basics.',
        category: 'subject_specific',
        difficulty: 'beginner',
        fallbackQuestions: [
          'In Commerce, what is the difference between a cash transaction and a credit transaction, and how are they entered into a simple cash book?',
          'Can you explain why debit and credit must always balance out, using a simple example like purchasing goods for cash?'
        ]
      },
      {
        id: 'comp_cec_economics',
        name: 'Fundamental Economic Concepts & Markets',
        description: 'Law of demand, elasticity, production factors, and the Indian economy.',
        category: 'subject_specific',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'Can you explain the Law of Demand with an everyday example, and mention one exception where price rise does not reduce demand?',
          'What are the primary factors of production in an economy, and what reward does each factor receive?'
        ]
      },
      {
        id: 'comp_cec_civics',
        name: 'Civics, Governance & Rights',
        description: 'Fundamental rights, Indian constitution features, and local governance.',
        category: 'subject_specific',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'In Civics, what is the importance of Fundamental Rights in the Indian Constitution, and which right do you consider most essential for citizens?',
          'What is the role of local self-government (such as Panchayati Raj or Municipalities) in community development?'
        ]
      },
      {
        id: 'comp_cec_career',
        name: 'Career Readiness & Analytical Communication',
        description: 'Articulation, plans for higher education (B.Com, BBA, Law, CA Foundation), and practical reasoning.',
        category: 'communication',
        difficulty: 'beginner',
        fallbackQuestions: [
          'Looking ahead after Intermediate, which degree course or professional track (such as B.Com, CA Foundation, or Law) are you preparing for, and why?',
          'How have your studies in CEC helped you understand daily news about business, trade, and government policies?'
        ]
      }
    ];
  }

  // 4. Intermediate MPC (Mathematics, Physics, Chemistry)
  if (normGroup === 'mpc' || normStream.includes('mpc')) {
    return [
      {
        id: 'comp_mpc_intro',
        name: 'Educational Background & STEM Aspirations',
        description: 'Self-introduction, group overview, and engineering or science aspirations.',
        category: 'hr',
        difficulty: 'beginner',
        fallbackQuestions: [
          'Welcome! Please introduce yourself, your intermediate MPC group, and tell me which engineering or science branch you aspire to pursue.',
          'To start, tell me about your intermediate journey so far and which chapter in Mathematics or Physics has fascinated you the most.'
        ]
      },
      {
        id: 'comp_mpc_math',
        name: 'Mathematical Principles & Calculus',
        description: 'Differentiation, integration, vectors, and coordinate geometry.',
        category: 'subject_specific',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'In calculus, what does a derivative geometrically represent on a curve, and how do you find maximum or minimum points of a function?',
          'Can you explain the difference between a scalar product and a vector product with a real-world physical example?'
        ]
      },
      {
        id: 'comp_mpc_physics',
        name: 'Physical Laws & Thermodynamics / Mechanics',
        description: 'Newtonian mechanics, conservation of energy, work-energy theorem, and thermodynamics.',
        category: 'subject_specific',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'State the Work-Energy Theorem and explain how it applies when a moving vehicle comes to a stop under braking.',
          'What is the difference between isothermal and adiabatic processes in thermodynamics, and what happens to internal energy in each?'
        ]
      },
      {
        id: 'comp_mpc_chem',
        name: 'Chemical Principles & Bonding / Reactions',
        description: 'Periodic trends, chemical bonding, organic functional groups, and equilibrium.',
        category: 'subject_specific',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'Explain Le Chatelier’s Principle and how changes in temperature and pressure affect the yield in the Haber process for ammonia synthesis.',
          'What is the difference between ionic and covalent bonding, and how does electronegativity determine bond character?'
        ]
      },
      {
        id: 'comp_mpc_goals',
        name: 'Problem-Solving & Engineering Readiness',
        description: 'Analytical approach, tackling difficult numerical problems, and entrance exam preparation.',
        category: 'communication',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'When you encounter a complex multi-step physics or math problem that you cannot immediately solve, what is your step-by-step problem-solving strategy?',
          'How do you manage your time and consistency while preparing for competitive entrance examinations like JEE or state CETs?'
        ]
      }
    ];
  }

  // 5. Intermediate BiPC (Biology, Physics, Chemistry)
  if (normGroup === 'bipc' || normStream.includes('bipc') || normStream.includes('biology')) {
    return [
      {
        id: 'comp_bipc_intro',
        name: 'Background & Medical / Life Sciences Aspirations',
        description: 'Introduction, BiPC group details, and medical or healthcare aspirations.',
        category: 'hr',
        difficulty: 'beginner',
        fallbackQuestions: [
          'Welcome! Please introduce yourself, your intermediate BiPC studies, and what motivated you to pursue the medical and life sciences track.',
          'Tell me about your intermediate journey and what sparked your curiosity about living systems and human physiology.'
        ]
      },
      {
        id: 'comp_bipc_bio',
        name: 'Cell Biology, Genetics & Human Physiology',
        description: 'Cell division, Mendelian inheritance, circulatory system, and photosynthesis.',
        category: 'subject_specific',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'Walk me through the stages of Mitosis and explain why maintaining chromosome number is crucial during tissue growth and repair.',
          'Explain the double circulation system in human hearts, and trace the path of deoxygenated blood through the pulmonary circuit.'
        ]
      },
      {
        id: 'comp_bipc_chem',
        name: 'Biochemical Foundations & Organic Chemistry',
        description: 'Biomolecules, enzymes, functional groups, and solutions.',
        category: 'subject_specific',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'How do enzymes act as biological catalysts, and how do pH and temperature variations affect enzymatic reaction rates?',
          'Explain the difference between primary, secondary, and tertiary structures of proteins, and what happens during denaturation.'
        ]
      },
      {
        id: 'comp_bipc_physics',
        name: 'Applied Biophysics, Optics & Pressure',
        description: 'Lenses, vision correction, fluid pressure, and thermodynamics in biological contexts.',
        category: 'subject_specific',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'Explain how convex and concave lenses correct myopia and hypermetropia in human vision.',
          'How does Pascal’s law or fluid pressure explain blood pressure measurement with a sphygmomanometer?'
        ]
      },
      {
        id: 'comp_bipc_ethics',
        name: 'Healthcare Empathy & Clinical Mindset',
        description: 'Patient care dedication, perseverance, and handling demanding study schedules.',
        category: 'communication',
        difficulty: 'intermediate',
        fallbackQuestions: [
          'Why is patient empathy just as important as scientific knowledge for someone entering healthcare or medicine?',
          'How do you maintain focus and resilience when preparing for intensive medical entrance examinations like NEET?'
        ]
      }
    ];
  }

  // 6. Default: Software Engineering / Computer Science (B.Tech CSE, IT, BCA, MCA, Software Developer)
  return [
    {
      id: 'comp_tech_intro',
      name: 'Technical Journey, Projects & Architecture Overview',
      description: 'Candidate self-introduction, tech stack familiarity, key projects, and architectural choices.',
      category: 'technical',
      difficulty: 'beginner',
      fallbackQuestions: [
        'Welcome! To start our session, please introduce yourself, walk me through your technical background, and tell me about a project you built that you are particularly proud of.',
        'Please introduce yourself, share the tech stack you are most comfortable with, and describe the architecture of a full-stack or system project you worked on recently.'
      ]
    },
    {
      id: 'comp_tech_dsa',
      name: 'Data Structures & Algorithmic Problem Solving',
      description: 'Time and space complexity, arrays, hashmaps, trees, search/sort algorithms, and trade-offs.',
      category: 'technical',
      difficulty: 'intermediate',
      fallbackQuestions: [
        'How would you design an efficient lookup structure for a system with millions of unique user IDs? Walk me through the time complexity and memory trade-offs.',
        'Explain how a hash map resolves collisions internally, and what worst-case scenario degrades its lookup time to O(N).'
      ]
    },
    {
      id: 'comp_tech_system',
      name: 'System Architecture, State & API Design',
      description: 'REST vs GraphQL, state management, caching strategies, latency, and database query design.',
      category: 'system_design',
      difficulty: 'intermediate',
      fallbackQuestions: [
        'When designing a RESTful API for an e-commerce checkout flow, how do you ensure idempotent transactions so users are never charged twice on duplicate requests?',
        'How do you approach state management in a growing frontend application, and when is local component state preferred over a global store?'
      ]
    },
    {
      id: 'comp_tech_debugging',
      name: 'Debugging, Edge Cases & Error Handling',
      description: 'Troubleshooting production bugs, race conditions, memory leaks, and input sanitization.',
      category: 'technical',
      difficulty: 'advanced',
      fallbackQuestions: [
        'Walk me through a challenging bug or memory bottleneck you tracked down in your code. What systematic steps did you use to isolate the root cause?',
        'How do you handle asynchronous race conditions when multiple concurrent requests attempt to update the same resource simultaneously?'
      ]
    },
    {
      id: 'comp_tech_collaboration',
      name: 'Engineering Collaboration & STAR Behavioral',
      description: 'Code reviews, handling technical debt, sprint deadlines, and constructive disagreements.',
      category: 'behavioral',
      difficulty: 'intermediate',
      fallbackQuestions: [
        'Tell me about a time a teammate suggested an architectural approach that you disagreed with. How did you discuss the trade-offs and reach a decision?',
        'Describe a situation where you had to ship a feature under tight deadlines. How did you balance rapid delivery against code quality and test coverage?'
      ]
    }
  ];
}

/**
 * Creates the internal session blueprint before or at session start.
 */
export function generateInterviewBlueprint(config = {}) {
  const profile = buildGeminiProfileContext(config.candidateProfile || config);
  const targetRole = profile.targetRole || config.role || 'Software Engineer';
  const degreeStream = profile.degreeStream || config.academicStream || 'B.Tech Computer Science';
  const educationLevel = profile.educationLevel || config.educationLevel || 'UG';
  const intermediateGroup = config.intermediateGroup || '';
  const companyName = config.companyName || 'Technology Company';
  const requestedCount = Math.min(10, Math.max(3, Number(config.questionCount) || 5));
  const baseDifficulty = ['beginner', 'intermediate', 'advanced'].includes(String(config.difficulty).toLowerCase())
    ? String(config.difficulty).toLowerCase()
    : 'intermediate';

  const competencies = getDomainCompetencies(degreeStream, targetRole, educationLevel, intermediateGroup);

  // Formulate a progressive difficulty curve based on base difficulty
  const difficultyProgression = [];
  for (let i = 0; i < requestedCount; i++) {
    if (i === 0) {
      difficultyProgression.push(baseDifficulty === 'advanced' ? 'intermediate' : 'beginner');
    } else if (i === requestedCount - 1) {
      difficultyProgression.push(baseDifficulty === 'beginner' ? 'intermediate' : baseDifficulty);
    } else if (i === 1) {
      difficultyProgression.push(baseDifficulty);
    } else {
      difficultyProgression.push(baseDifficulty === 'beginner' ? 'intermediate' : 'advanced');
    }
  }

  return {
    id: `bp-${Date.now()}`,
    targetRole,
    degreeStream,
    educationLevel,
    intermediateGroup,
    targetCompany: companyName,
    baseDifficulty,
    totalTargetQuestions: requestedCount,
    difficultyProgression,
    competencies: competencies.slice(0, requestedCount).map((c, idx) => ({
      ...c,
      targetOrder: idx,
      explored: false,
      questionsAsked: []
    })),
    createdAt: new Date().toISOString()
  };
}

/**
 * Evaluates candidate answer substance and classifies the adaptive decision.
 * Decisions: PROBE | CLARIFY | CHALLENGE | MOVE_FORWARD | ENCOURAGE
 */
export function classifyAdaptiveDecision(currentQuestion, candidateAnswer, currentDifficulty = 'intermediate', isNonTechnical = false) {
  const raw = (candidateAnswer || '').trim();
  const clean = raw.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = raw.split(/\s+/).filter(Boolean).length;

  // Strip leading filler sounds ("um", "uh", "ah", "hmm", "well")
  const strippedClean = clean.replace(/^(u+m+|u+h+|a+h+|h+m+|well|like)\s+/i, '').trim();

  // 1. Check for empty, silence, or dismissive answers ("I don't know", "skip", "no idea", "pass", "not really sure")
  const dismissalRegex = /\b(i\s+)?(do\s*n'?t|don\s+t|cannot|cant|can\s+t)\s+(know|remember|recall|answer|have\s+(any\s+)?idea)\b|\b(not\s+(really\s+)?sure|no\s+idea|not\s+aware|don\s+t\s+know|dont\s+know)\b|^(no|skip|pass|none|nothing|idk|cannot answer)\b/i;

  const isDismissal =
    !isSubstantiveAnswer(raw) ||
    dismissalRegex.test(strippedClean) ||
    dismissalRegex.test(clean) ||
    wordCount < 4;

  if (isDismissal) {
    return {
      decision: 'ENCOURAGE',
      reason: 'Candidate struggled, was unsure, or gave a very short answer. Calibrating down to offer a guided foundational stepping-stone.',
      calibratedDifficulty: 'beginner',
      conceptsDemonstrated: [],
      knowledgeGapsDetected: ['Unable to recall or formulate detailed explanation on the requested topic.']
    };
  }

  // 2. Check for ambiguous, contradictory, or vague answers
  const isAmbiguous =
    /\b(maybe|sort of|kind of|i guess|something like that|not really sure but|confused between)\b/i.test(clean) ||
    (wordCount < 12 && /\b(both|either|depends)\b/i.test(clean));

  if (isAmbiguous) {
    return {
      decision: 'CLARIFY',
      reason: 'Candidate provided an ambiguous or tentative response. Seeking explicit clarification on key distinctions.',
      calibratedDifficulty: currentDifficulty,
      conceptsDemonstrated: ['Initial conceptual awareness'],
      knowledgeGapsDetected: ['Uncertain boundary conditions or terminology precision']
    };
  }

  // 3. Check for high-level buzzword claims without technical depth (Probing needed)
  const isProbeWorthy =
    wordCount >= 10 &&
    wordCount <= 30 &&
    !currentQuestion?.isFollowUp;

  if (isProbeWorthy) {
    return {
      decision: 'PROBE',
      reason: 'Candidate made valid claims but omitted concrete implementation steps, formulas, or practical mechanics.',
      calibratedDifficulty: currentDifficulty,
      conceptsDemonstrated: ['Relevant domain concepts mentioned'],
      knowledgeGapsDetected: ['Practical depth and concrete trade-offs remain unverified']
    };
  }

  // 4. Candidate gave an extensive theoretical answer (>= 35 words) -> Challenge practical edge cases / trade-offs
  if (wordCount >= 35 && currentDifficulty !== 'beginner' && !currentQuestion?.isFollowUp) {
    return {
      decision: 'CHALLENGE',
      reason: 'Candidate demonstrated strong baseline understanding. Testing real-world edge cases, trade-offs, and failure modes.',
      calibratedDifficulty: currentDifficulty === 'beginner' ? 'intermediate' : 'advanced',
      conceptsDemonstrated: ['Thorough conceptual explanation', 'Relevant terminology'],
      knowledgeGapsDetected: []
    };
  }

  // 5. Default: Competency satisfied or follow-up answered adequately -> MOVE_FORWARD to next competency
  return {
    decision: 'MOVE_FORWARD',
    reason: 'Candidate provided a satisfactory response for this competency. Progressing to the next interview objective in the blueprint.',
    calibratedDifficulty: currentDifficulty,
    conceptsDemonstrated: ['Solid understanding demonstrated'],
    knowledgeGapsDetected: []
  };
}

/**
 * Deterministic fallback generator for the adaptive next question.
 * Ensures zero failures if Gemini API times out or is offline.
 */
export function generateAdaptiveNextQuestionFallback(config, currentQuestion, candidateAnswer, sessionMemory = {}) {
  const blueprint = sessionMemory.blueprint || generateInterviewBlueprint(config);
  const exploredTopics = Array.isArray(sessionMemory.topicsExplored) ? sessionMemory.topicsExplored : [];
  const previousQuestions = Array.isArray(sessionMemory.previousQuestions) ? sessionMemory.previousQuestions : [];
  const currentDiff = sessionMemory.currentDifficulty || config.difficulty || 'intermediate';
  const isNonTech = isNonTechnicalCandidate(config.academicStream || config.degreeStream, config.role, config.intermediateGroup);

  const decisionObj = classifyAdaptiveDecision(currentQuestion, candidateAnswer, currentDiff, isNonTech);
  const orderIdx = (currentQuestion?.orderIndex !== undefined ? currentQuestion.orderIndex : 0) + 1;

  // Find remaining unexplored competencies
  const unexplored = blueprint.competencies.filter(c => !c.explored);
  const targetComp = (decisionObj.decision === 'MOVE_FORWARD' || unexplored.length > 0)
    ? (unexplored[0] || blueprint.competencies[blueprint.competencies.length - 1])
    : (blueprint.competencies.find(c => c.name === sessionMemory.currentCompetency) || blueprint.competencies[0]);

  let questionText = '';
  let hints = '';
  let topic = targetComp.name;

  if (decisionObj.decision === 'ENCOURAGE') {
    // Gentle guided question
    if (isNonTech) {
      questionText = `No worries at all! Let's break this down to the basics. Can you tell me in your own words what the core purpose of ${targetComp.name.toLowerCase()} is, and where you encounter it in practice?`;
    } else {
      questionText = `That's completely fine, interview situations can be high pressure. Let's step back to the foundational concept: how would you describe the basic purpose of ${targetComp.name.toLowerCase()} in simple terms?`;
    }
    hints = 'Focus on the simplest core definition and practical real-world intuition.';
  } else if (decisionObj.decision === 'PROBE') {
    if (isNonTech) {
      questionText = `You highlighted an interesting point in your answer. Could you walk me through the specific calculations, steps, or documentation you would use to execute that in practice?`;
    } else {
      questionText = `Building on what you just shared, what specific implementation steps or trade-offs did you consider when putting that approach into practice?`;
    }
    hints = 'Elaborate with concrete technical steps, parameters, or real-life examples.';
  } else if (decisionObj.decision === 'CLARIFY') {
    questionText = `Could you clarify the distinction in your statement earlier? Specifically, what criteria determine which approach you would choose in a real-world scenario?`;
    hints = 'Clearly differentiate the two sides of your explanation with a specific condition.';
  } else if (decisionObj.decision === 'CHALLENGE') {
    if (isNonTech) {
      questionText = `That's a sound textbook approach. But what happens if figures do not reconcile, or unexpected statutory changes occur right before a filing deadline? How do you adapt?`;
    } else {
      questionText = `That covers the happy path well. But how does that system behave under high contention, unexpected node failure, or edge-case input values?`;
    }
    hints = 'Address non-obvious failure modes, bottlenecks, and resilient mitigation steps.';
  } else {
    // MOVE_FORWARD: Pick question from next competency
    const pool = targetComp.fallbackQuestions || [];
    const valid = pool.find(q => !previousQuestions.some(prev => isDuplicateQuestion(q, [prev], 0.40).isDuplicate));
    questionText = valid || pool[0] || `Let's transition to our next focus area: ${targetComp.name}. Can you walk me through your understanding of this topic?`;
    hints = targetComp.description || 'Provide a structured, comprehensive answer.';
    targetComp.explored = true;
  }

  const cleanQ = cleanSpokenQuestion(questionText);

  return {
    decision: decisionObj.decision,
    decisionReason: decisionObj.reason,
    conceptsDemonstrated: decisionObj.conceptsDemonstrated,
    knowledgeGapsDetected: decisionObj.knowledgeGapsDetected,
    competencyAssessed: targetComp.name,
    adjustedDifficulty: decisionObj.calibratedDifficulty,
    nextQuestion: {
      id: `q-adaptive-${Date.now()}-${orderIdx}`,
      orderIndex: orderIdx,
      questionText: cleanQ,
      category: targetComp.category || 'technical',
      contextOrHints: hints,
      isFollowUp: decisionObj.decision === 'PROBE' || decisionObj.decision === 'CLARIFY' || decisionObj.decision === 'CHALLENGE',
      followUpReason: decisionObj.reason,
      adaptiveDecision: {
        decision: decisionObj.decision,
        reason: decisionObj.reason,
        competencyAssessed: targetComp.name,
        calibratedDifficulty: decisionObj.calibratedDifficulty
      },
      source: 'fallback'
    },
    exploredTopic: topic,
    updatedMemory: {
      ...sessionMemory,
      topicsExplored: [...exploredTopics, topic].filter((v, i, a) => a.indexOf(v) === i),
      demonstratedCompetencies: [...(sessionMemory.demonstratedCompetencies || []), ...decisionObj.conceptsDemonstrated],
      knowledgeGaps: [...(sessionMemory.knowledgeGaps || []), ...decisionObj.knowledgeGapsDetected],
      decisionsHistory: [
        ...(sessionMemory.decisionsHistory || []),
        {
          decision: decisionObj.decision,
          reason: decisionObj.reason,
          competency: targetComp.name,
          calibratedDifficulty: decisionObj.calibratedDifficulty,
          orderIndex: orderIdx
        }
      ],
      currentDifficulty: decisionObj.calibratedDifficulty,
      currentCompetency: targetComp.name
    }
  };
}

/**
 * Generates the next adaptive question dynamically via Gemini.
 * Follows the 7 core intelligence directives from user specification.
 */
export async function generateAdaptiveNextQuestion(config, currentQuestion, candidateAnswer, sessionMemory = {}) {
  const profile = buildGeminiProfileContext(config.candidateProfile || config);
  const targetRole = profile.targetRole || config.role || 'Software Engineer';
  const degreeStream = profile.degreeStream || config.academicStream || 'B.Tech Computer Science';
  const educationLevel = profile.educationLevel || config.educationLevel || 'UG';
  const intermediateGroup = config.intermediateGroup || '';
  const companyName = config.companyName || 'Target Company';
  const isNonTech = isNonTechnicalCandidate(degreeStream, targetRole, intermediateGroup);

  const blueprint = sessionMemory.blueprint || generateInterviewBlueprint(config);
  const previousQuestions = (Array.isArray(sessionMemory.previousQuestions)
    ? sessionMemory.previousQuestions
    : (currentQuestion ? [currentQuestion] : [])
  ).map(q => typeof q === 'string' ? q : (q?.questionText || q?.text || '')).filter(Boolean);
  const topicsExplored = (Array.isArray(sessionMemory.topicsExplored) ? sessionMemory.topicsExplored : [])
    .map(t => typeof t === 'string' ? t : (t?.name || t?.topic || ''))
    .filter(Boolean);
  const currentDiff = sessionMemory.currentDifficulty || config.difficulty || 'intermediate';
  const orderIdx = (currentQuestion?.orderIndex !== undefined ? currentQuestion.orderIndex : 0) + 1;

  // Unexplored competencies remaining in blueprint
  const remainingCompetencies = (blueprint?.competencies || [])
    .filter(c => !topicsExplored.some(t => t.toLowerCase() === (c.name || '').toLowerCase()))
    .map(c => c.name);

  const systemInstruction = `You are a calibrated, human-like Principal Interviewer conducting an adaptive oral mock interview.
Your goal is to listen carefully to the candidate's response, assess their depth, and determine the exact next conversational move.

ADAPTIVE DECISION MATRIX:
Evaluate the candidate's response and select exactly one decision:
1. PROBE: If the candidate mentioned a tool, method, or claim without sufficient depth. Ask for the specific mechanism, steps, or trade-offs.
2. CLARIFY: If the candidate made an ambiguous, confusing, or contradictory statement. Politely ask them to explain what they meant.
3. CHALLENGE: If the candidate gave a solid textbook answer. Test practical edge cases, failure modes, trade-offs, or real-world pressure.
4. MOVE_FORWARD: If the candidate gave a well-structured, complete answer covering this competency. Move forward to the next competency from the blueprint.
5. ENCOURAGE: If the candidate struggled, said "I don't know", gave an empty/short answer, or showed confusion. Step difficulty down and ask a gentle, foundational stepping-stone question.

STRICT HUMAN CONVERSATION RULES:
- 1 to 3 spoken sentences maximum for the questionText.
- Conversational phrasing that naturally acknowledges the previous answer (e.g. "You mentioned...", "That is a solid point regarding...", "Let's explore that further...").
- ABSOLUTELY NO MARKDOWN (no asterisks, no bold, no bullet points, no code blocks).
- ABSOLUTELY NO EMOJIS.
- STRICT DOMAIN & STREAM CALIBRATION: ${isNonTech ? 'The candidate is in a NON-TECHNICAL stream (' + degreeStream + '). It is STRICTLY FORBIDDEN to ask programming, coding, DSA, React, or IT questions. All questions must test ' + degreeStream + ' concepts!' : 'Calibrate to ' + targetRole + ' engineering standards.'}
- DEDUPLICATION: Never ask the same question or rephrase a previously asked topic.

Respond ONLY with a JSON object matching this schema:
{
  "decision": "PROBE" | "CLARIFY" | "CHALLENGE" | "MOVE_FORWARD" | "ENCOURAGE",
  "decisionReason": "Short explanation of why this decision was made",
  "conceptsDemonstrated": ["Concept 1", "Concept 2"],
  "knowledgeGapsDetected": ["Knowledge gap 1"],
  "competencyAssessed": "Name of the competency assessed",
  "adjustedDifficulty": "beginner" | "intermediate" | "advanced",
  "questionText": "Natural spoken question here (1-3 sentences, plain text)",
  "category": "technical" | "behavioral" | "subject_specific" | "hr",
  "contextOrHints": "Brief key concepts the candidate should address",
  "exploredTopic": "Specific topic name covered"
}`;

  const userPrompt = `[CANDIDATE_PROFILE]
Role: "${targetRole}"
Stream / Degree: "${degreeStream}" (${educationLevel})
${intermediateGroup ? `Intermediate Group: "${intermediateGroup}"` : ''}
Company: "${companyName}"
Current Difficulty Baseline: "${currentDiff}"
Stream Non-Technical Policy: ${isNonTech ? 'MANDATORY NON-TECHNICAL (NO PROGRAMMING)' : 'Technical / Engineering'}
[/CANDIDATE_PROFILE]

[SESSION_MEMORY]
Previously Asked Questions:
${previousQuestions.slice(-6).map((q, i) => `${i + 1}. "${q}"`).join('\n') || 'None'}

Topics Explored So Far:
${topicsExplored.length > 0 ? topicsExplored.join(', ') : 'None yet'}

Blueprint Remaining Competencies:
${remainingCompetencies.length > 0 ? remainingCompetencies.join(' -> ') : 'All core competencies initiated'}
[/SESSION_MEMORY]

[CURRENT_TURN]
Question Just Asked: "${sanitizeForPrompt(typeof currentQuestion === 'string' ? currentQuestion : (currentQuestion?.questionText || currentQuestion?.text || ''))}"
Candidate's Spoken Answer:
"""
${sanitizeForPrompt(candidateAnswer || '').slice(0, 3500)}
"""
[/CURRENT_TURN]

Analyze the candidate's answer and produce the adaptive decision, difficulty calibration, and next spoken question.`;

  try {
    const raw = await callGemini(userPrompt, 0.4, systemInstruction);
    const parsed = cleanAndParseJson(raw, {});

    const validDecisions = ['PROBE', 'CLARIFY', 'CHALLENGE', 'MOVE_FORWARD', 'ENCOURAGE'];
    const decision = validDecisions.includes(parsed.decision) ? parsed.decision : 'MOVE_FORWARD';
    const adjustedDiff = ['beginner', 'intermediate', 'advanced'].includes(parsed.adjustedDifficulty)
      ? parsed.adjustedDifficulty
      : currentDiff;

    let cleanQ = cleanSpokenQuestion(parsed.questionText || '');
    let isQuestionFromAi = true;

    // Check for duplicate with previous questions
    const dupCheck = isDuplicateQuestion(cleanQ, previousQuestions, 0.45);
    if (!cleanQ || cleanQ.length < 15 || dupCheck.isDuplicate) {
      // Use fallback question if Gemini produced empty, too short, or duplicate text
      const fallback = generateAdaptiveNextQuestionFallback(config, currentQuestion, candidateAnswer, sessionMemory);
      cleanQ = fallback.nextQuestion.questionText;
      isQuestionFromAi = false;
    }

    const topic = parsed.exploredTopic || currentQuestion?.category || 'Domain Competency';

    return {
      decision,
      decisionReason: parsed.decisionReason || 'Adaptive progression based on candidate answer analysis.',
      conceptsDemonstrated: Array.isArray(parsed.conceptsDemonstrated) ? parsed.conceptsDemonstrated : [],
      knowledgeGapsDetected: Array.isArray(parsed.knowledgeGapsDetected) ? parsed.knowledgeGapsDetected : [],
      competencyAssessed: parsed.competencyAssessed || currentQuestion?.category || 'Domain Competency',
      adjustedDifficulty: adjustedDiff,
      nextQuestion: {
        id: `q-adaptive-${Date.now()}-${orderIdx}`,
        orderIndex: orderIdx,
        questionText: cleanQ,
        category: parsed.category || currentQuestion?.category || 'technical',
        contextOrHints: parsed.contextOrHints || '',
        isFollowUp: decision === 'PROBE' || decision === 'CLARIFY' || decision === 'CHALLENGE',
        followUpReason: parsed.decisionReason || '',
        adaptiveDecision: {
          decision,
          reason: parsed.decisionReason || '',
          competencyAssessed: parsed.competencyAssessed || 'Domain Competency',
          calibratedDifficulty: adjustedDiff
        },
        source: isQuestionFromAi ? 'ai' : 'fallback'
      },
      exploredTopic: topic,
      updatedMemory: {
        ...sessionMemory,
        topicsExplored: [...topicsExplored, topic].filter((v, i, a) => a.indexOf(v) === i),
        demonstratedCompetencies: [
          ...(sessionMemory.demonstratedCompetencies || []),
          ...(Array.isArray(parsed.conceptsDemonstrated) ? parsed.conceptsDemonstrated : [])
        ],
        knowledgeGaps: [
          ...(sessionMemory.knowledgeGaps || []),
          ...(Array.isArray(parsed.knowledgeGapsDetected) ? parsed.knowledgeGapsDetected : [])
        ],
        decisionsHistory: [
          ...(sessionMemory.decisionsHistory || []),
          {
            decision,
            reason: parsed.decisionReason || '',
            competency: parsed.competencyAssessed || 'Domain Competency',
            calibratedDifficulty: adjustedDiff,
            orderIndex: orderIdx
          }
        ],
        currentDifficulty: adjustedDiff,
        currentCompetency: parsed.competencyAssessed || sessionMemory.currentCompetency
      }
    };
  } catch (err) {
    console.warn('[AdaptiveEngine] Gemini API notice, engaging intelligent fallback:', err.message);
    return generateAdaptiveNextQuestionFallback(config, currentQuestion, candidateAnswer, sessionMemory);
  }
}
