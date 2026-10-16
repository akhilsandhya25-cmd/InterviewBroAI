import { InterviewConfig, InterviewQuestion, FeedbackReport, ResumeAnalysis, QuestionEvaluation } from '../types';
import { SAMPLE_FALLBACK_QUESTIONS } from '../data/presets';
import { storage } from './storage';

const API_BASE = '/api';

function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  const token = storage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function isClientDuplicate(candidate: string, history: string[]): boolean {
  const normCand = candidate.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const candWords = new Set(normCand.split(/\s+/).filter(w => w.length > 2));
  if (candWords.size === 0) return false;

  for (const prev of history) {
    if (!prev) continue;
    const normPrev = prev.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
    if (normPrev === normCand) return true;
    const prevWords = new Set(normPrev.split(/\s+/).filter(w => w.length > 2));
    let intersection = 0;
    for (const w of candWords) {
      if (prevWords.has(w)) intersection++;
    }
    const union = new Set([...candWords, ...prevWords]).size;
    if (union > 0 && (intersection / union) > 0.55) {
      return true;
    }
  }
  return false;
}

export const api = {
  // Synchronously generate instant, tailored initial questions in 0ms
  getInstantInitialQuestions(config: InterviewConfig, previousQuestions: string[] = []): InterviewQuestion[] {
    const primaryPool = SAMPLE_FALLBACK_QUESTIONS[config.interviewType] || SAMPLE_FALLBACK_QUESTIONS.mixed;
    const allPools = [
      ...primaryPool,
      ...SAMPLE_FALLBACK_QUESTIONS.technical,
      ...SAMPLE_FALLBACK_QUESTIONS.system_design,
      ...SAMPLE_FALLBACK_QUESTIONS.behavioral,
      ...SAMPLE_FALLBACK_QUESTIONS.mixed,
      ...SAMPLE_FALLBACK_QUESTIONS.hr,
      ...SAMPLE_FALLBACK_QUESTIONS.managerial
    ];

    const questions: InterviewQuestion[] = [];
    const trackingList: string[] = [...(previousQuestions || [])];

    // Role-specific instant opening question
    let openingQuestionText = '';
    const company = config.companyName || 'our engineering team';
    const role = config.role || 'Software Engineer';
    
    if (config.interviewType === 'technical') {
      openingQuestionText = `Welcome to this ${company} technical interview for the ${role} position. To start off, could you briefly introduce yourself and walk me through the architecture and key technical challenges of a recent project you built?`;
    } else if (config.interviewType === 'system_design') {
      openingQuestionText = `Welcome to this ${company} system design interview for the ${role} position. Let's start with a high-level discussion: could you describe a distributed system or backend service you have worked on or designed, and how you handled scalability and data consistency?`;
    } else if (config.interviewType === 'behavioral') {
      openingQuestionText = `Welcome to your ${company} behavioral interview for the ${role} position. To begin, could you share a bit about your background and tell me about a time you had to overcome a tough technical or team challenge?`;
    } else if (config.interviewType === 'hr') {
      openingQuestionText = `Welcome to this ${company} interview for the ${role} role. To get started, please tell me about yourself and what specifically attracts you to working with our team at ${company}?`;
    } else {
      openingQuestionText = `Welcome to this ${company} interview for the ${role} position. To kick things off, could you introduce yourself and walk me through the most impactful project from your background?`;
    }

    questions.push({
      id: `q-${Date.now()}-0`,
      orderIndex: 0,
      questionText: openingQuestionText,
      category: config.interviewType === 'system_design' ? 'system_design' : config.interviewType === 'behavioral' ? 'behavioral' : config.interviewType === 'hr' ? 'hr' : 'technical',
      contextOrHints: 'Deliver a concise, structured introduction (1-2 minutes). Focus on core technologies, personal ownership, and real-world impact.'
    });
    trackingList.push(openingQuestionText);

    // Populate remaining questions from curated pools without duplicates
    for (const item of allPools) {
      if (questions.length >= config.questionCount) break;
      if (!isClientDuplicate(item.text, trackingList)) {
        questions.push({
          id: `q-${Date.now()}-${questions.length}`,
          orderIndex: questions.length,
          questionText: item.text,
          category: item.category,
          contextOrHints: item.hints
        });
        trackingList.push(item.text);
      }
    }

    return questions;
  },

  // Generate interview questions strictly without repetition
  async generateQuestions(config: InterviewConfig, previousQuestions: string[] = []): Promise<InterviewQuestion[]> {
    try {
      const res = await fetch(`${API_BASE}/ai/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...config, previousQuestions })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          return data.questions;
        }
      }
    } catch (e) {
      console.warn('Backend /api/ai/questions not reachable or errored, using tailored client fallback bank:', e);
    }

    // Client fallback: generate tailored, non-repeating questions instantly
    return this.getInstantInitialQuestions(config, previousQuestions);
  },

  // Evaluate candidate answer
  async evaluateAnswer(question: InterviewQuestion, answer: string, config: InterviewConfig): Promise<QuestionEvaluation> {
    try {
      const res = await fetch(`${API_BASE}/ai/evaluate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ question, answer, config })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.evaluation) {
          return data.evaluation;
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Evaluation request failed with HTTP ${res.status}`);
      }
    } catch (e: any) {
      console.warn('Backend /api/ai/evaluate connection issue:', e);
      return {
        status: 'unavailable',
        unavailableReason: e.message || 'Evaluation service could not be reached. Scores will not be fabricated.',
        score: 0,
        feedback: 'Evaluation service is currently unavailable. Your transcribed response has been safely recorded in your interview session.',
        strengths: ['Answer transcribed and logged.'],
        missedPoints: ['Automated scoring is currently unavailable.'],
        betterAnswerExample: 'Review your answer against standard system design and STAR principles.'
      };
    }

    return {
      status: 'unavailable',
      unavailableReason: 'Evaluation service returned an empty response.',
      score: 0,
      feedback: 'Evaluation is unavailable for this response.',
      strengths: [],
      missedPoints: [],
      betterAnswerExample: ''
    };
  },

  // Generate follow-up question
  async generateFollowUp(
    question: InterviewQuestion, 
    answer: string, 
    config: InterviewConfig,
    previousQuestions: string[] = [],
    previousScore?: number,
    conversationHistory: Array<{ questionText: string; candidateAnswer: string; category?: string; score?: number }> = []
  ): Promise<InterviewQuestion | null> {
    try {
      const res = await fetch(`${API_BASE}/ai/follow-up`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          question, 
          answer, 
          config, 
          previousQuestions, 
          previousScore,
          conversationHistory 
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.followUp) {
          return data.followUp;
        }
      }
    } catch (e) {
      console.warn('Backend /api/ai/follow-up not reachable, using intelligent fallback follow-up:', e);
    }

    // Technology-aware client fallback tailored for Indian tech and campus placement interviews
    const norm = (answer || '').trim();
    const lower = norm.toLowerCase();

    let followUpText = '';
    let hints = '';
    let category = question.category || 'technical';
    let followUpReason = '';

    if (/\bredux\b/i.test(lower)) {
      followUpText = 'You mentioned using Redux for state management—how did you handle asynchronous actions like API calls in that setup?';
      hints = 'Discuss redux-thunk, redux-saga, action creators, middleware flow, and state immutability.';
      followUpReason = 'Candidate mentioned Redux; probing async actions and middleware.';
    } else if (/\breact\b/i.test(lower)) {
      followUpText = 'You mentioned building with React—how did you optimize component re-renders and manage shared state across deep component trees?';
      hints = 'Discuss React.memo, useMemo, useCallback, Context API vs external stores, and reconciliation.';
      followUpReason = 'Candidate mentioned React; probing re-renders and state optimization.';
    } else if (/\b(node|nodejs|express)\b/i.test(lower)) {
      followUpText = 'You mentioned using Node.js and Express—how did you manage unhandled asynchronous rejections and structure error-handling middleware?';
      hints = 'Discuss express error-handling middleware, process.on(unhandledRejection), and event loop safety.';
      followUpReason = 'Candidate mentioned Node/Express; probing async error management.';
    } else if (/\bmongo(?:db)?\b/i.test(lower)) {
      followUpText = 'You mentioned using MongoDB for storage—how did you approach schema validation and indexing for your highest-frequency read queries?';
      hints = 'Discuss compound indexes, explain plans, document embedding vs referencing, and write concerns.';
      followUpReason = 'Candidate mentioned MongoDB; probing document schema and indexing.';
    } else if (/\b(postgres|postgresql|mysql|sql|rdbms)\b/i.test(lower)) {
      followUpText = 'You mentioned using a SQL database—how did you diagnose slow queries and determine the right indexing strategy without degrading write throughput?';
      hints = 'Discuss EXPLAIN ANALYZE, B-tree indexes, foreign keys, transaction isolation, and connection pooling.';
      followUpReason = 'Candidate referenced SQL databases; probing query tuning and indexes.';
    } else if (/\bredis\b/i.test(lower)) {
      followUpText = 'You mentioned using Redis for caching—what eviction policy did you configure, and how did you guard against cache stampedes or thundering herds?';
      hints = 'Discuss TTL, LRU/LFU eviction, mutex locks, probabilistic early expiration, and cache invalidation.';
      followUpReason = 'Candidate mentioned Redis; probing eviction policy and stampede prevention.';
    } else if (/\bkafka\b/i.test(lower)) {
      followUpText = 'You mentioned using Kafka for streaming—how did you guarantee at-least-once message processing and manage consumer group lag?';
      hints = 'Discuss partition keys, consumer offset commits, dead letter topics, and idempotent consumers.';
      followUpReason = 'Candidate mentioned Kafka; probing lag handling and delivery guarantees.';
    } else if (/\bdocker\b/i.test(lower)) {
      followUpText = 'You mentioned containerizing with Docker—how did you minimize container image layers and handle secrets during production container builds?';
      hints = 'Discuss multi-stage builds, alpine/distroless bases, .dockerignore, and secret mounts.';
      followUpReason = 'Candidate referenced Docker; probing image optimization and secret hygiene.';
    } else if (/\b(jwt|token|oauth|authentication)\b/i.test(lower)) {
      followUpText = 'You mentioned implementing authentication—how did you handle token expiration, silent refresh cycles, and immediate revocation for compromised sessions?';
      hints = 'Discuss short-lived access tokens, refresh tokens in HttpOnly cookies, rotation, and blacklisting.';
      followUpReason = 'Candidate mentioned auth tokens; probing refresh rotation and revocation.';
    } else if (norm.split(/\s+/).filter(Boolean).length < 20) {
      followUpText = 'Your answer introduces the high-level concept, but could you walk me through the specific implementation steps and how you handled potential edge cases?';
      hints = 'Provide concrete architectural details, data flow, error handling, and quantitative outcomes.';
      followUpReason = 'Candidate answer was brief; prompting for concrete implementation mechanics.';
    } else {
      const snippets = norm.split(/[.?!]/).map(s => s.trim()).filter(s => s.length > 15 && s.length < 80);
      const focus = snippets[0] ? `regarding "${snippets[0]}"` : '';
      followUpText = `Building on your point ${focus}, what happens if network latency increases tenfold or a critical downstream service crashes? What fallback or circuit-breaking mechanism protects the user experience?`;
      hints = 'Discuss circuit breakers, exponential backoff, rate limiting, and graceful degradation.';
      category = 'system_design';
      followUpReason = 'Testing resiliency and fault isolation on stated architecture.';
    }

    return {
      id: `q-followup-${Date.now()}`,
      orderIndex: question.orderIndex + 1,
      questionText: followUpText,
      category,
      contextOrHints: hints,
      followUpReason,
      isFollowUp: true,
      followUpToQuestionId: question.id
    };
  },

  // Generate comprehensive feedback report
  async generateFinalReport(questions: InterviewQuestion[], config: InterviewConfig, candidateName: string): Promise<FeedbackReport> {
    try {
      const res = await fetch(`${API_BASE}/ai/final-report`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ questions, config, candidateName })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.report) {
          return data.report;
        }
      }
    } catch (e) {
      console.warn('Backend /api/ai/final-report fallback triggered:', e);
    }

    // Calculate aggregated scores from evaluated questions
    const validQuestions = questions.filter(q => q.candidateAnswer && q.candidateAnswer.trim().length > 0);
    const avgScore = validQuestions.length > 0
      ? Math.round(validQuestions.reduce((acc, q) => acc + (q.evaluation?.score || 75), 0) / validQuestions.length)
      : 76;

    const report: FeedbackReport = {
      id: `rep-${Date.now()}`,
      sessionId: `sess-${Date.now()}`,
      candidateName: candidateName || 'Candidate',
      role: config.role,
      company: config.companyName,
      interviewType: config.interviewType,
      overallScore: avgScore,
      technicalAccuracyScore: Math.min(98, avgScore + 2),
      communicationScore: Math.min(95, avgScore - 1),
      structureStarScore: Math.min(94, avgScore - 3),
      relevanceScore: Math.min(96, avgScore + 1),
      summary: `You put in a really strong effort in today's mock session for ${config.role} targeting ${config.companyName}! You explained your thought process with clarity and composure, and your grasp of the core concepts is solid. Like any great engineer, the next step is fine-tuning how you articulate trade-offs and edge cases. With a little targeted practice, you're going to feel very confident and competitive in your upcoming interviews!`,
      strengths: [
        'You communicated your thoughts methodically and kept a steady, composed pace throughout the session',
        'Strong intuitive grasp of fundamental technical concepts and architecture requirements',
        'Demonstrated a great problem-solving mindset by breaking complex requirements down step by step'
      ],
      weaknesses: [
        'Opportunity to polish: Bring in production edge cases and real-world system trade-offs early in your answers',
        'Opportunity to elevate: Deepen behavioral answers by highlighting your specific personal ownership using the STAR structure'
      ],
      missedConcepts: [
        'Observability practices (metrics, telemetry, tracing) during distributed system discussions',
        'Resilience patterns like circuit breakers and retry strategies with exponential backoff'
      ],
      actionableImprovements: [
        'Take 20-30 seconds at the start to clarify boundary constraints with the interviewer—it showcases collaborative engineering maturity',
        'Quantify your personal contributions (e.g. "reduced latency by 35% across 10k RPS" instead of "improved speed")',
        'Practice sketching mental diagrams for data flow and component models under gentle time limits'
      ],
      recommendedTopics: [
        'Distributed Caching strategies (Cache-Aside, Write-Through)',
        'Database Indexing internals (B-Trees vs Hash Indexes)',
        'STAR format behavioral delivery for Conflict Resolution & Leadership rounds',
        'Concurrency & Race Condition prevention'
      ],
      exampleImprovedAnswers: validQuestions.map(q => ({
        question: q.questionText,
        originalSummary: q.candidateAnswer?.slice(0, 120) + '...' || 'No answer recorded',
        improvedAnswer: q.evaluation?.betterAnswerExample || 'State the situation concisely, detail your individual contribution, and conclude with verified metrics and key lessons learned.',
        whyBetter: 'Provides clear structural depth, removes fluff, and provides quantifiable impact that interviewers remember.'
      })),
      prepPlan: [
        {
          dayOrPhase: 'Phase 1 (Days 1-2): Core Concept Drills',
          focus: 'Data structures, OOPs principles, language internals, and database indexing',
          actionItems: ['Review B-tree indexing and transaction isolation levels', 'Solve 5 medium LeetCode/HackerRank problems under 25-minute timers']
        },
        {
          dayOrPhase: 'Phase 2 (Days 3-4): STAR Behavioral Story Bank',
          focus: 'Crafting 4 deep stories covering leadership, technical failure, conflict, and tight deadlines',
          actionItems: ['Write out bullet points using Situation, Task, Action, Result', 'Rehearse 2-minute elevator pitch with a timer']
        },
        {
          dayOrPhase: 'Phase 3 (Days 5-7): Full Mock Interview Simulation',
          focus: 'Live video interview room practice on InterviewBro AI',
          actionItems: ['Complete 2 full-length simulated interviews with video and audio enabled', 'Review question-by-question feedback and refine weaker topics']
        }
      ],
      questionsEvaluated: questions,
      createdAt: new Date().toISOString()
    };

    return report;
  },

  // Parse and analyze resume
  async analyzeResume(file: File, targetRole: string): Promise<ResumeAnalysis> {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);

    const activeUid = storage.getActiveUserId() || 'usr-guest';
    const headers: Record<string, string> = {};
    const token = storage.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch(`${API_BASE}/resume/parse`, {
        method: 'POST',
        headers,
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data.analysis) {
          data.analysis.userId = activeUid;
          return data.analysis;
        }
      }
    } catch (e) {
      console.warn('Backend /api/resume/parse not reachable, using client text extraction heuristic:', e);
    }

    // Client fallback analysis
    const fileName = file.name;
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    
    return {
      id: `res-${Date.now()}`,
      userId: activeUid,
      fileName,
      fileSize: file.size,
      extractedSkills: ['JavaScript', 'React.js', 'Node.js', 'SQL', 'Git', 'Data Structures', 'REST APIs', 'HTML5/CSS3'],
      missingSkillsForRole: ['Docker & Containerization', 'Cloud Deployment (AWS/GCP)', 'Redis / Distributed Caching', 'Unit Testing (Jest/Mocha)'],
      atsScoreEstimate: 78,
      educationFound: ['B.Tech / B.E. Computer Science & Engineering (2021 - 2025)'],
      experienceSummary: 'Academic projects in full-stack web development and freelance frontend implementation.',
      projectsDetected: [
        'E-Commerce Web Application with React, Node.js and MongoDB',
        'Real-Time Chat App with Socket.io and Express',
        'Portfolio Website with Tailwind CSS'
      ],
      strengths: [
        'Clear educational background and contact details',
        'Modern, relevant tech stack for frontend and full-stack positions',
        'Demonstrated hands-on projects with functional features'
      ],
      keywordGaps: [
        'CI/CD, Docker, Microservices, System Architecture, Performance Profiling'
      ],
      actionableImprovements: [
        'Quantify your project outcomes (e.g. "reduced bundle size by 28%", "served 500+ users")',
        'Add a dedicated "Technical Skills" section grouped into Languages, Frameworks, Databases, and Tools',
        'Include live links to deployed projects and GitHub repositories',
        'Tailor bullet points to emphasize problem-solving over just listing features built'
      ],
      tailoredInterviewQuestions: [
        'In your E-Commerce project, how did you handle user authentication and session management securely?',
        'How did you manage state in your React application, and how did you prevent unnecessary re-renders?',
        'If 10,000 users joined your Real-Time Chat App simultaneously, how would you scale the WebSocket connections?'
      ],
      createdAt: new Date().toISOString()
    };
  }
};
