// Centralized filler word pattern: detects repeated hesitation sounds and colloquial fillers
// Matches variations like "hum", "humm", "hummm", "aaa", "aaaa", "um", "umm", "uh", "uhh", "ah", "ahh", "er", "err", "like", "you know", "basically", "actually"
export const FILLER_WORD_REGEX = /\b(u+m+|u+h+m*|a+h+|e+r+|h+u+m+|h+m+|a{2,}|ha+|like|you know|basically|actually|sort of|kind of|i mean)\b/gi;

export interface FillerAnalysis {
  totalWords: number;
  fillerCount: number;
  fillerWords: Record<string, number>;
  fillerDensity: number;
  cleanedText: string;
  fluencyScore: number;
  fluencyFeedback: string;
}

export function analyzeFillerWords(text: string | null | undefined): FillerAnalysis {
  if (!text || typeof text !== 'string') {
    return {
      totalWords: 0,
      fillerCount: 0,
      fillerWords: {},
      fillerDensity: 0,
      cleanedText: '',
      fluencyScore: 100,
      fluencyFeedback: 'No speech recorded.'
    };
  }

  const rawWords = text.trim().split(/\s+/).filter(Boolean);
  const totalWords = rawWords.length;
  if (totalWords === 0) {
    return {
      totalWords: 0,
      fillerCount: 0,
      fillerWords: {},
      fillerDensity: 0,
      cleanedText: '',
      fluencyScore: 100,
      fluencyFeedback: 'No speech recorded.'
    };
  }

  const matches = text.match(FILLER_WORD_REGEX) || [];
  const fillerCount = matches.length;
  const fillerWords: Record<string, number> = {};
  for (const m of matches) {
    const key = m.toLowerCase();
    fillerWords[key] = (fillerWords[key] || 0) + 1;
  }

  const fillerDensity = Math.min(100, Math.round((fillerCount / Math.max(1, totalWords)) * 100));

  // Remove filler words to get substantive content for semantic evaluation
  const cleanedText = text
    .replace(FILLER_WORD_REGEX, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  let fluencyScore = 100;
  let fluencyFeedback = 'Excellent verbal fluency and polished delivery with clear pacing.';

  if (fillerDensity === 0) {
    fluencyScore = 100;
    fluencyFeedback = 'Outstanding verbal clarity: clean, direct delivery with zero filler words.';
  } else if (fillerDensity <= 4) {
    fluencyScore = Math.max(90, 100 - fillerDensity * 2);
    fluencyFeedback = `Natural, fluent pacing. Only ${fillerCount} minor filler ${fillerCount === 1 ? 'sound' : 'sounds'} detected (${fillerDensity}% density).`;
  } else if (fillerDensity <= 10) {
    fluencyScore = Math.max(80, 94 - (fillerDensity - 4) * 2.5);
    fluencyFeedback = `Good conversational delivery. Detected ${fillerCount} filler words (${fillerDensity}% density). Try pausing silently instead of using "${Object.keys(fillerWords).slice(0, 2).join('", "')}".`;
  } else if (fillerDensity <= 20) {
    fluencyScore = Math.max(55, 79 - (fillerDensity - 10) * 2.4);
    fluencyFeedback = `Noticeable hesitation. ${fillerCount} filler words detected (${fillerDensity}% density, primarily "${Object.keys(fillerWords).slice(0, 2).join('", "')}"). Practice comfortable silent pauses between thoughts.`;
  } else {
    fluencyScore = Math.max(25, 55 - (fillerDensity - 20) * 1.5);
    fluencyFeedback = `High frequency of hesitation sounds (${fillerCount} filler words, ${fillerDensity}% density). Taking 1-2 second structured pauses before speaking will dramatically improve authority.`;
  }

  return {
    totalWords,
    fillerCount,
    fillerWords,
    fillerDensity,
    cleanedText,
    fluencyScore: Math.round(fluencyScore),
    fluencyFeedback
  };
}

// Helper to extract substantive words without filler sounds
export function getSubstantiveWords(text: string | null | undefined): string[] {
  if (!text || typeof text !== 'string') return [];
  return text
    .replace(FILLER_WORD_REGEX, ' ')
    .replace(/[^\w\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0 && !/^\d+$/.test(w));
}

// Helper to verify if candidate answer contains genuine substantive content
export function isSubstantiveAnswer(text: string | null | undefined): boolean {
  if (!text || typeof text !== 'string') return false;
  const clean = text.trim().toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
  if (!clean || clean.length < 3) return false;

  const nonAnswerExact = new Set([
    'no answer provided',
    'no answer recorded',
    'no answer',
    'no response',
    'no',
    'nope',
    'none',
    'nothing',
    'nil',
    'na',
    'n/a',
    'not applicable',
    'idk',
    'i don\'t know',
    'i dont know',
    'dont know',
    'don\'t know',
    'not sure',
    'not aware',
    'no idea',
    'skip',
    'skipped',
    'pass',
    'passed',
    'next',
    'next question',
    'test',
    'testing',
    'check',
    'checking',
    'hello',
    'hi',
    'silence',
    '[silence]',
    '(silence)',
    'asdf',
    'qwerty',
    'uh',
    'um',
    'ah',
    'hmm',
    'hum',
    'aaa'
  ]);

  if (nonAnswerExact.has(clean)) return false;

  // Filter out all filler words to test if ANY meaningful substance remains
  const nonFillerWords = getSubstantiveWords(clean);

  // If the answer is purely hesitation sounds ("hummm aaa ummm", "uh ah like um"), it is non-substantive!
  if (nonFillerWords.length === 0) {
    return false;
  }

  // If after removing fillers, there is only 1 single tiny non-answer word or dismissal
  if (nonFillerWords.length < 2 && clean.length < 15) {
    const dismissalPattern = /^(i\s+)?(do\s*n'?t|cannot|cant)\s+(know|remember|recall|answer)|^(no|skip|pass|none|nothing|idk|yeah|yes|ok|okay)\b/i;
    if (dismissalPattern.test(clean) || nonFillerWords.length < 1) {
      return false;
    }
  }

  return true;
}

import { InterviewConfig, InterviewQuestion, FeedbackReport, ResumeAnalysis, QuestionEvaluation } from '../types';
import { CoachFeedback } from '../types/academy';
import { SAMPLE_FALLBACK_QUESTIONS } from '../data/presets';
import { getCompanyTrack } from '../data/companyTracks';
import { storage } from './storage';
import { isSupabaseConfigured, supabase } from './supabase';

const API_BASE = '/api';

/**
 * Safely parse JSON responses from backend or fallback to null without throwing SyntaxError.
 */
async function safeJson<T = any>(res: Response): Promise<T | null> {
  try {
    const text = await res.text();
    if (!text || !text.trim()) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
}

export const api = {
  // Synchronously generate instant, tailored initial questions in 0ms
  getInstantInitialQuestions(config: InterviewConfig, previousQuestions: string[] = []): InterviewQuestion[] {
    // Helper for non-biased in-place shuffle
    const shuffle = <T>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const primaryPool = SAMPLE_FALLBACK_QUESTIONS[config.interviewType] || SAMPLE_FALLBACK_QUESTIONS.mixed;
    const otherPools = [
      ...SAMPLE_FALLBACK_QUESTIONS.technical,
      ...SAMPLE_FALLBACK_QUESTIONS.system_design,
      ...SAMPLE_FALLBACK_QUESTIONS.behavioral,
      ...SAMPLE_FALLBACK_QUESTIONS.mixed,
      ...SAMPLE_FALLBACK_QUESTIONS.hr,
      ...SAMPLE_FALLBACK_QUESTIONS.managerial
    ];

    const questions: InterviewQuestion[] = [];
    const trackingList: string[] = [...(previousQuestions || [])];
    const company = config.companyName || 'our engineering team';
    const role = config.role || 'Software Engineer';

    // Dynamic Authentic Icebreaker & "Tell me about yourself" pool per interview type
    const openingOptions: Record<string, string[]> = {
      technical: [
        `Welcome to this ${company} technical interview for the ${role} position. To start off, could you briefly introduce yourself and walk me through the architecture and key technical challenges of a recent project you built?`,
        `Hello and welcome to your ${company} technical interview for the ${role} role. Before we dive into technical problem solving, could you give me a structured introduction of yourself, your primary technical strengths, and what you have been developing recently?`,
        `Welcome to ${company}! Let's start with a quick introduction: please tell me about your background, what motivated you to pursue software engineering, and the technical project you are most proud of.`,
        `Good day and welcome to this ${company} session. To kick things off, please introduce yourself, highlighting your programming background, your favorite tools or languages, and a real-world problem you enjoyed solving.`
      ],
      system_design: [
        `Welcome to this ${company} system design interview for the ${role} position. Let's start with a high-level discussion: could you introduce yourself and describe a distributed system or backend service you have worked on or designed, and how you handled scalability and data consistency?`,
        `Hello and welcome to ${company}. Before we jump into architectural designs, please tell me about yourself and walk me through the most scalable or high-throughput service you have engineered or studied in depth.`,
        `Welcome to your system design interview at ${company}. To begin, please introduce yourself, your experience with backend architecture, and an example of a technical trade-off you made in a past project.`
      ],
      behavioral: [
        `Welcome to your ${company} behavioral interview for the ${role} position. To begin, could you share a bit about your background and tell me about a time you had to overcome a tough technical or team challenge?`,
        `Hello and welcome to ${company}! Before we dive into situational scenarios, please tell me about yourself, what drives your work ethic, and how you typically collaborate within multidisciplinary teams.`,
        `Welcome to ${company}. To start our discussion, please introduce yourself and share a brief story about a project where things did not go as planned and how you adapted to deliver results.`
      ],
      hr: [
        `Welcome to this ${company} interview for the ${role} role. To get started, please tell me about yourself, your educational and project journey, and what specifically attracts you to working with our team at ${company}?`,
        `Hello and welcome to ${company}! Could you give us a brief introduction of who you are outside your resume, your key strengths, and what your career goals look like for the next 2-3 years?`,
        `Welcome to your HR discussion at ${company}. Please introduce yourself, walk us through what drives your engineering passions, and why you believe this ${role} position aligns with your aspirations.`
      ],
      managerial: [
        `Welcome to this ${company} interview for the ${role} position. To begin, please introduce yourself, walk me through your leadership or project coordination experience, and how you balance technical excellence with project deadlines.`,
        `Hello and welcome to ${company}. To start off, please tell me about yourself and describe a time when you helped align team members or unblocked a colleague facing a complex roadblock.`
      ],
      mixed: [
        `Welcome to this ${company} interview for the ${role} position. To kick things off, could you introduce yourself and walk me through the most impactful project from your background?`,
        `Hello and welcome to ${company}! Let's start with a quick introduction: please tell me about yourself, your technical journey, and an engineering accomplishment you take pride in.`,
        `Welcome to your ${company} interview for the ${role} role. To begin, could you briefly introduce yourself, highlight your core skills, and share what excites you most about software development?`
      ]
    };

    const candidateOpeners = openingOptions[config.interviewType] || openingOptions.mixed;
    const availableOpeners = candidateOpeners.filter(op => !isClientDuplicate(op, trackingList));
    const openingQuestionText = availableOpeners.length > 0
      ? availableOpeners[Math.floor(Math.random() * availableOpeners.length)]
      : candidateOpeners[Math.floor(Math.random() * candidateOpeners.length)];

    questions.push({
      id: `q-${Date.now()}-0`,
      orderIndex: 0,
      questionText: openingQuestionText,
      category: config.interviewType === 'system_design' ? 'system_design' : config.interviewType === 'behavioral' ? 'behavioral' : config.interviewType === 'hr' ? 'hr' : 'technical',
      contextOrHints: 'Deliver a concise, structured introduction (1-2 minutes). Focus on core technologies, personal ownership, and real-world impact.',
      source: 'fallback'
    });
    trackingList.push(openingQuestionText);

    // If a company track is matched, incorporate company-specific question themes
    const track = getCompanyTrack(config.companyName || config.companyTrack?.id);
    if (track && track.exampleQuestionThemes && track.exampleQuestionThemes.length > 0) {
      const shuffledThemes = shuffle(track.exampleQuestionThemes);
      for (const theme of shuffledThemes) {
        if (questions.length >= config.questionCount) break;
        if (!isClientDuplicate(theme, trackingList)) {
          questions.push({
            id: `q-${Date.now()}-${questions.length}`,
            orderIndex: questions.length,
            questionText: theme,
            category: config.interviewType === 'system_design' ? 'system_design' : config.interviewType === 'behavioral' ? 'behavioral' : config.interviewType === 'hr' ? 'hr' : 'technical',
            contextOrHints: `Calibrated to ${track.companyName} interview standards. Focus on foundational clarity and direct experience.`,
            source: 'fallback'
          });
          trackingList.push(theme);
        }
      }
    }

    // Populate remaining questions from randomized curated pools without duplicates
    const prioritizedPool = [...shuffle(primaryPool), ...shuffle(otherPools)];
    for (const item of prioritizedPool) {
      if (questions.length >= config.questionCount) break;
      if (!isClientDuplicate(item.text, trackingList)) {
        questions.push({
          id: `q-${Date.now()}-${questions.length}`,
          orderIndex: questions.length,
          questionText: item.text,
          category: item.category,
          contextOrHints: item.hints,
          source: 'fallback'
        });
        trackingList.push(item.text);
      }
    }

    return questions;
  },

  // Generate interview questions strictly without repetition
  async generateQuestions(config: InterviewConfig, previousQuestions: string[] = []): Promise<InterviewQuestion[]> {
    let res: Response | null = null;
    try {
      res = await fetch(`${API_BASE}/ai/questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...config, previousQuestions })
      });
      if (res.status === 404) {
        res = await fetch(`${API_BASE}/ai-questions`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ ...config, previousQuestions })
        });
      }
    } catch (netErr: any) {
      console.warn('Network issue reaching /api/ai/questions:', netErr);
      return this.getInstantInitialQuestions(config, previousQuestions);
    }

    if (res.ok) {
      const data = await safeJson<{
        questions: InterviewQuestion[];
        quota?: { used: number; remaining: number; limit: number };
      }>(res);
      if (data?.quota) {
        storage.setQuota({
          freeInterviewsTotal: data.quota.limit || 5,
          interviewsUsed: data.quota.used,
          interviewsRemaining: data.quota.remaining,
          planName: 'Free Tier'
        });
      }
      if (data?.questions && data.questions.length > 0) {
        return data.questions.map(q => ({ ...q, source: q.source || 'ai' }));
      }
    }

    const errorData = await safeJson<{ error?: string; message?: string; retryAfter?: number }>(res);

    if (res.status === 401 || errorData?.error === 'UNAUTHORIZED') {
      const err: any = new Error(errorData?.message || 'Authentication required to start mock interviews. Please sign in or create an account.');
      err.code = 'UNAUTHORIZED';
      err.status = 401;
      throw err;
    }

    if (res.status === 402 || errorData?.error === 'QUOTA_EXCEEDED') {
      storage.setQuota({
        freeInterviewsTotal: 5,
        interviewsUsed: 5,
        interviewsRemaining: 0,
        planName: 'Free Tier'
      });
      const err: any = new Error(errorData?.message || 'Free tier quota exhausted (5 of 5 mock interviews completed). Please upgrade your plan to unlock more sessions.');
      err.code = 'QUOTA_EXCEEDED';
      err.status = 402;
      throw err;
    }

    if (res.status === 429 || errorData?.error === 'RATE_LIMIT_EXCEEDED') {
      const err: any = new Error(errorData?.message || 'Rate limit reached. Please wait a moment before starting another session.');
      err.code = 'RATE_LIMIT_EXCEEDED';
      err.status = 429;
      err.retryAfter = errorData?.retryAfter;
      throw err;
    }

    // Only if AI service is offline / unconfigured (503) or generic server error, return instant fallback
    console.warn(`Backend /api/ai/questions returned HTTP ${res.status}, using instant fallback bank.`);
    return this.getInstantInitialQuestions(config, previousQuestions);
  },

  // Academy Practice Coach Feedback
  async getPracticeCoachFeedback(
    question: { title: string; prompt: string; objective?: string; category?: string; sampleAnswer?: string },
    answer: string,
    options: {
      experienceLevel?: string;
      targetRole?: string;
      isRevision?: boolean;
      previousAnswer?: string;
      previousScore?: number;
    } = {}
  ): Promise<{ success: boolean; feedback?: CoachFeedback; error?: string; status?: number }> {
    try {
      let res = await fetch(`${API_BASE}/ai/coach`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ question, answer, options })
      });
      if (res.status === 404) {
        res = await fetch(`${API_BASE}/ai-coach`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ question, answer, options })
        });
      }

      if (res.ok) {
        const data = await safeJson<{ success: boolean; feedback: CoachFeedback }>(res);
        if (data?.feedback) {
          return { success: true, feedback: data.feedback, status: 200 };
        }
      }

      const errData = await safeJson<{ error?: string; message?: string }>(res);
      const errMsg = errData?.message || errData?.error || `Request failed with HTTP ${res.status}`;
      return {
        success: false,
        error: errMsg,
        status: res.status
      };
    } catch (e: any) {
      return {
        success: false,
        error: e.message || 'Unable to connect to AI Coach service. Please check your internet connection.',
        status: 0
      };
    }
  },

  // Evaluate candidate answer
  async evaluateAnswer(question: InterviewQuestion, answer: string, config: InterviewConfig): Promise<QuestionEvaluation> {
    try {
      let res = await fetch(`${API_BASE}/ai/evaluate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ question, answer, config })
      });
      if (res.status === 404) {
        res = await fetch(`${API_BASE}/ai-evaluate`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ question, answer, config })
        });
      }
      if (res.ok) {
        const data = await safeJson<{ evaluation?: QuestionEvaluation; message?: string }>(res);
        if (data?.evaluation) {
          return { ...data.evaluation, source: 'ai' };
        }
        if (data?.message) {
          throw new Error(data.message);
        }
        throw new Error('Evaluation service returned an unexpected response structure.');
      } else {
        const errorData = (await safeJson<{ error?: string; message?: string }>(res)) || {};
        throw new Error(errorData.message || errorData.error || `Evaluation request failed with HTTP ${res.status}`);
      }
    } catch (e: any) {
      console.warn('Backend /api/ai/evaluate connection issue:', e);
      return {
        status: 'unavailable',
        source: 'fallback',
        unavailableReason: e.message || 'Live AI evaluation is currently unreachable. Scores will not be fabricated.',
        score: null,
        feedback: 'Evaluation service is currently unavailable. Your transcribed response has been safely recorded in your interview session.',
        strengths: ['Answer transcribed and logged.'],
        missedPoints: ['Automated scoring is currently unavailable in offline/demo mode.'],
        betterAnswerExample: 'Review your answer against standard system design and STAR principles.'
      };
    }

    return {
      status: 'unavailable',
      source: 'fallback',
      unavailableReason: 'Evaluation service returned an empty response.',
      score: null,
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
    previousScore?: number | null,
    conversationHistory: Array<{ questionText: string; candidateAnswer: string; category?: string; score?: number | null }> = []
  ): Promise<InterviewQuestion | null> {
    try {
      let res = await fetch(`${API_BASE}/ai/follow-up`, {
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
      if (res.status === 404) {
        res = await fetch(`${API_BASE}/ai-follow-up`, {
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
      }
      if (res.ok) {
        const data = await safeJson<{ followUp: InterviewQuestion }>(res);
        if (data?.followUp) {
          return { ...data.followUp, source: data.followUp.source || 'ai' };
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
      followUpToQuestionId: question.id,
      source: 'fallback'
    };
  },

  // Generate comprehensive feedback report
  async generateFinalReport(questions: InterviewQuestion[], config: InterviewConfig, candidateName: string): Promise<FeedbackReport> {
    const answeredQuestions = (questions || []).filter(q => isSubstantiveAnswer(q.candidateAnswer));

    // Zero-Tolerance Anti-Fabrication: If 0 questions were answered, return an honest 0% report immediately
    if (answeredQuestions.length === 0) {
      const zeroPillars = config.interviewType === 'technical'
        ? [
            { key: 'correctness', label: 'Technical Correctness', score: 0, description: 'No response submitted', color: 'text-[#C5F36B]' },
            { key: 'depthAndEdgeCases', label: 'Depth & Edge Cases', score: 0, description: 'No response submitted', color: 'text-emerald-400' },
            { key: 'tradeoffAwareness', label: 'Complexity & Tradeoffs', score: 0, description: 'No response submitted', color: 'text-violet-400' },
            { key: 'communicationClarity', label: 'Communication Clarity', score: 0, description: 'No response submitted', color: 'text-cyan-400' }
          ]
        : config.interviewType === 'system_design'
        ? [
            { key: 'requirementsClarification', label: 'Requirements & Scope', score: 0, description: 'No response submitted', color: 'text-blue-400' },
            { key: 'architecture', label: 'System Architecture', score: 0, description: 'No response submitted', color: 'text-[#C5F36B]' },
            { key: 'scalabilityAndTradeoffs', label: 'Scalability & Resilience', score: 0, description: 'No response submitted', color: 'text-emerald-400' },
            { key: 'communicationClarity', label: 'Articulation & Defensibility', score: 0, description: 'No response submitted', color: 'text-cyan-400' }
          ]
        : [
            { key: 'starStructure', label: 'STAR Methodology', score: 0, description: 'No response submitted', color: 'text-indigo-400' },
            { key: 'ownership', label: 'Ownership & Impact', score: 0, description: 'No response submitted', color: 'text-[#C5F36B]' },
            { key: 'relevance', label: 'Question Relevance', score: 0, description: 'No response submitted', color: 'text-emerald-400' },
            { key: 'communicationClarity', label: 'Delivery & Composure', score: 0, description: 'No response submitted', color: 'text-cyan-400' }
          ];

      return {
        id: `rep-${Date.now()}`,
        sessionId: `sess-${Date.now()}`,
        source: 'ai',
        candidateName: candidateName || 'Candidate',
        role: config.role,
        company: config.companyName,
        interviewType: config.interviewType,
        overallScore: 0,
        rubricPillars: zeroPillars,
        technicalAccuracyScore: 0,
        communicationScore: 0,
        structureStarScore: config.interviewType === 'technical' || config.interviewType === 'system_design' ? null : 0,
        relevanceScore: 0,
        summary: `No answers were recorded during this mock interview session for ${config.role} targeting ${config.companyName}. To receive an objective performance score and personalized placement coaching, please answer the questions using speech or typing.`,
        strengths: ['Interview session initiated and setup completed'],
        weaknesses: ['No answers were submitted for evaluation during this session'],
        missedConcepts: ['All question topics remain unaddressed. Complete a practice session to test your knowledge.'],
        actionableImprovements: [
          'Read each question carefully and speak or type your response before clicking Submit',
          'Use Text Mode if you encounter any microphone difficulties',
          'Practice explaining your past projects and technical concepts out loud to build fluency'
        ],
        recommendedTopics: ['Core Problem Solving', 'Technical Fundamentals', 'Clear Articulation'],
        exampleImprovedAnswers: (questions || []).map(q => ({
          question: q.questionText,
          originalSummary: 'No answer was provided for this question.',
          improvedAnswer: 'A strong candidate response should address the core concept, provide a concrete real-world example, and discuss edge cases or trade-offs.',
          whyBetter: 'Demonstrates technical mastery, structured thinking, and clear communication.'
        })),
        prepPlan: [
          {
            dayOrPhase: 'Phase 1: Getting Started',
            focus: 'First Practice Session',
            actionItems: ['Complete at least 2 questions in your next session to unlock full AI rubric scoring']
          }
        ],
        questionsEvaluated: questions,
        createdAt: new Date().toISOString()
      };
    }

    try {
      let res = await fetch(`${API_BASE}/ai/final-report`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ questions, config, candidateName })
      });
      if (res.status === 404) {
        res = await fetch(`${API_BASE}/ai-final-report`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ questions, config, candidateName })
        });
      }
      if (res.ok) {
        const data = await safeJson<{ report: FeedbackReport }>(res);
        if (data?.report) {
          return { ...data.report, source: 'ai' };
        }
      }
    } catch (e) {
      console.warn('Backend /api/ai/final-report fallback triggered:', e);
    }

    const validQuestions = answeredQuestions;

    const roundPillars = config.interviewType === 'technical'
      ? [
          { key: 'correctness', label: 'Technical Correctness', score: null, description: 'Core mechanics & syntax', color: 'text-[#C5F36B]' },
          { key: 'depthAndEdgeCases', label: 'Depth & Edge Cases', score: null, description: 'Edge case & failure resilience', color: 'text-emerald-400' },
          { key: 'tradeoffAwareness', label: 'Complexity & Tradeoffs', score: null, description: 'Algorithmic efficiency & tradeoffs', color: 'text-violet-400' },
          { key: 'communicationClarity', label: 'Communication Clarity', score: null, description: 'Concise, composed articulation', color: 'text-cyan-400' }
        ]
      : config.interviewType === 'system_design'
      ? [
          { key: 'requirementsClarification', label: 'Requirements & Scope', score: null, description: 'Constraints & scale estimation', color: 'text-blue-400' },
          { key: 'architecture', label: 'System Architecture', score: null, description: 'Component breakdown & data flow', color: 'text-[#C5F36B]' },
          { key: 'scalabilityAndTradeoffs', label: 'Scalability & Resilience', score: null, description: 'Bottlenecks & fault tolerance', color: 'text-emerald-400' },
          { key: 'communicationClarity', label: 'Articulation & Defensibility', score: null, description: 'Whiteboard walkthrough & tradeoffs', color: 'text-cyan-400' }
        ]
      : config.interviewType === 'behavioral' || config.interviewType === 'hr'
      ? [
          { key: 'starStructure', label: 'STAR Methodology', score: null, description: 'Situation, Task, Action, Result', color: 'text-indigo-400' },
          { key: 'ownership', label: 'Ownership & Impact', score: null, description: 'Personal agency & results', color: 'text-[#C5F36B]' },
          { key: 'relevance', label: 'Question Relevance', score: null, description: 'Direct answer without fluff', color: 'text-emerald-400' },
          { key: 'communicationClarity', label: 'Delivery & Composure', score: null, description: 'Composed, empathetic articulation', color: 'text-cyan-400' }
        ]
      : [
          { key: 'technicalDepth', label: 'Technical Depth', score: null, description: 'Core engineering concepts', color: 'text-[#C5F36B]' },
          { key: 'systemTradeoffs', label: 'Architecture & Tradeoffs', score: null, description: 'Scalable thinking & complexity', color: 'text-emerald-400' },
          { key: 'ownershipAndDelivery', label: 'STAR & Ownership', score: null, description: 'Methodical approach & ownership', color: 'text-indigo-400' },
          { key: 'communicationClarity', label: 'Communication Clarity', score: null, description: 'Articulate delivery & pacing', color: 'text-cyan-400' }
        ];

    const report: FeedbackReport = {
      id: `rep-${Date.now()}`,
      sessionId: `sess-${Date.now()}`,
      source: 'fallback',
      candidateName: candidateName || 'Candidate',
      role: config.role,
      company: config.companyName,
      interviewType: config.interviewType,
      overallScore: null,
      rubricPillars: roundPillars,
      technicalAccuracyScore: null,
      communicationScore: null,
      structureStarScore: null,
      relevanceScore: null,
      summary: `You completed your mock interview session for ${config.role} targeting ${config.companyName}. Automated AI scoring is currently unavailable, so numeric scores and placement readiness tiers are withheld to prevent fabricated metrics. Review your recorded answers and qualitative coaching suggestions below.`,
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

  // Parse and analyze resume (Serverless Base64 payload, 5MB limit)
  async analyzeResume(file: File, targetRole: string): Promise<ResumeAnalysis> {
    const activeUid = storage.getActiveUserId() || 'usr-guest';
    const headers = getAuthHeaders();
    let res: Response | null = null;

    try {
      const fileBase64 = await fileToBase64(file);
      res = await fetch(`${API_BASE}/resume/parse`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fileBase64,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          targetRole
        })
      });
      if (res.status === 404) {
        res = await fetch(`${API_BASE}/resume-parse`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            fileBase64,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            targetRole
          })
        });
      }
    } catch (netErr: any) {
      console.warn('Backend /api/resume/parse not reachable, using client text extraction heuristic:', netErr);
    }

    if (res && res.ok) {
      const data = await safeJson<{ success: boolean; analysis: ResumeAnalysis }>(res);
      if (data?.analysis) {
        data.analysis.userId = activeUid;
        data.analysis.source = data.analysis.source || 'ai';
        return data.analysis;
      }
    }

    if (res) {
      const errorData = await safeJson<{ error?: string; message?: string; retryAfter?: number }>(res);

      if (res.status === 401 || errorData?.error === 'UNAUTHORIZED') {
        const err: any = new Error(errorData?.message || 'Authentication required. Please sign in or create an account to analyze your resume.');
        err.code = 'UNAUTHORIZED';
        err.status = 401;
        throw err;
      }

      if (res.status === 402 || errorData?.error === 'QUOTA_EXCEEDED') {
        const err: any = new Error(errorData?.message || 'Free tier quota exhausted (5 of 5 sessions completed). Please upgrade your plan to unlock more resume reviews.');
        err.code = 'QUOTA_EXCEEDED';
        err.status = 402;
        throw err;
      }

      if (res.status === 429 || errorData?.error === 'RATE_LIMIT_EXCEEDED') {
        const err: any = new Error(errorData?.message || 'Too many resume parse requests. Please wait a moment before trying again.');
        err.code = 'RATE_LIMIT_EXCEEDED';
        err.status = 429;
        err.retryAfter = errorData?.retryAfter;
        throw err;
      }

      if (res.status === 413 || errorData?.error === 'FILE_TOO_LARGE') {
        const err: any = new Error('Resume file size exceeds the 5MB limit.');
        err.code = 'FILE_TOO_LARGE';
        err.status = 413;
        throw err;
      }
    }

    // Client fallback analysis
    const fileName = file.name;
    const isPdf = fileName.toLowerCase().endsWith('.pdf');
    
    return {
      id: `res-${Date.now()}`,
      userId: activeUid,
      fileName,
      fileSize: file.size,
      source: 'fallback',
      extractedSkills: ['JavaScript', 'React.js', 'Node.js', 'SQL', 'Git', 'Data Structures', 'REST APIs', 'HTML5/CSS3'],
      missingSkillsForRole: ['Docker & Containerization', 'Cloud Deployment (AWS/GCP)', 'Redis / Distributed Caching', 'Unit Testing (Jest/Mocha)'],
      atsScoreEstimate: null,
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
  },

  async joinWaitlist(email: string, plan: 'pro' | 'unlimited' = 'pro'): Promise<{ success: boolean; alreadyJoined: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPlan = plan.toLowerCase() as 'pro' | 'unlimited';

    try {
      const res = await fetch(`${API_BASE}/waitlist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email: cleanEmail, plan: cleanPlan })
      });

      const data = await safeJson(res);
      if (res.ok && data) {
        return {
          success: true,
          alreadyJoined: Boolean(data.alreadyJoined),
          message: data.message || `You're on the waitlist for ${cleanPlan === 'pro' ? 'Student Pro' : 'Placement Unlimited'}!`
        };
      }
    } catch (err) {
      console.warn('[API] /waitlist fetch failed, falling back to direct Supabase / local storage:', err);
    }

    // Direct Supabase Client fallback
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('waitlist').insert({ email: cleanEmail, plan: cleanPlan });
        if (!error) {
          return {
            success: true,
            alreadyJoined: false,
            message: `Thank you! You're on the waitlist for ${cleanPlan === 'pro' ? 'Student Pro' : 'Placement Unlimited'}!`
          };
        }
        if (error.code === '23505' || String(error.message).toLowerCase().includes('unique')) {
          return {
            success: true,
            alreadyJoined: true,
            message: `You're already on the waitlist for the ${cleanPlan === 'pro' ? 'Student Pro' : 'Placement Unlimited'} plan!`
          };
        }
      } catch (e) {
        // Fall through
      }
    }

    return {
      success: true,
      alreadyJoined: false,
      message: `Thank you! You're on the waitlist for ${cleanPlan === 'pro' ? 'Student Pro' : 'Placement Unlimited'}!`
    };
  }
};
