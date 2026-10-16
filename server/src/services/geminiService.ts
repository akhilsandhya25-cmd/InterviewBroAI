import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from standard local locations
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

export const getIsGeminiConfigured = (): boolean => {
  const rawKey = (process.env.GEMINI_API_KEY || '').trim();
  return Boolean(
    rawKey &&
    !rawKey.includes('your-gemini-api-key') &&
    rawKey.length > 10
  );
};

export const isGeminiConfigured = getIsGeminiConfigured();

function getGeminiClient(): GoogleGenAI | null {
  const rawKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!rawKey || rawKey.includes('your-gemini-api-key') || rawKey.length < 10) {
    return null;
  }
  return new GoogleGenAI({ apiKey: rawKey });
}

// ---------------------------------------------------------------------------
// DETERMINISTIC DEDUPLICATION & SIMILARITY ENGINE
// ---------------------------------------------------------------------------

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'would', 'should', 'could', 'can', 'will', 'your', 'you', 'we', 'i', 'they', 'it', 'this', 'that',
  'welcome', 'company', 'interview', 'position', 'role', 'please', 'tell', 'about', 'explain',
  'describe', 'walk', 'through', 'how', 'what', 'why', 'discuss', 'using'
]);

/**
 * Strips punctuation and conversational boilerplates to reveal the semantic core of a question
 */
export function normalizeQuestion(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\b(welcome to|this interview for the|interview for|position at|tell me about|can you explain|walk me through|how would you|what is|how do you|in your opinion|give me an example of)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts meaningful keyword tokens for set-based intersection
 */
export function getQuestionTokens(text: string): Set<string> {
  const normalized = normalizeQuestion(text);
  const words = normalized.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(words);
}

/**
 * Extracts 2-grams (bigrams) for phrasing pattern detection
 */
export function getQuestionBigrams(text: string): Set<string> {
  const normalized = normalizeQuestion(text);
  const words = normalized.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  const bigrams = new Set<string>();
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.add(`${words[i]}_${words[i + 1]}`);
  }
  return bigrams;
}

/**
 * Computes deterministic similarity score [0.0 - 1.0] using Jaccard and Bigram Dice coefficients
 */
export function calculateQuestionSimilarity(q1: string, q2: string): number {
  if (!q1 || !q2) return 0;

  const n1 = normalizeQuestion(q1);
  const n2 = normalizeQuestion(q2);

  // Exact normalized match or direct substring
  if (n1 === n2 || (n1.length > 20 && n2.length > 20 && (n1.includes(n2) || n2.includes(n1)))) {
    return 1.0;
  }

  const t1 = getQuestionTokens(q1);
  const t2 = getQuestionTokens(q2);
  if (t1.size === 0 || t2.size === 0) return 0;

  let tokenIntersection = 0;
  for (const token of t1) {
    if (t2.has(token)) tokenIntersection++;
  }
  const tokenUnion = new Set([...t1, ...t2]).size;
  const jaccard = tokenUnion > 0 ? tokenIntersection / tokenUnion : 0;

  const b1 = getQuestionBigrams(q1);
  const b2 = getQuestionBigrams(q2);
  let bigramIntersection = 0;
  for (const bg of b1) {
    if (b2.has(bg)) bigramIntersection++;
  }
  const bigramTotal = b1.size + b2.size;
  const bigramDice = bigramTotal > 0 ? (2 * bigramIntersection) / bigramTotal : 0;

  return Math.max(jaccard * 0.65 + bigramDice * 0.35, jaccard);
}

/**
 * Checks if candidateText matches any previously asked question above similarity threshold
 */
export function isDuplicateQuestion(
  candidateText: string,
  existingQuestions: string[],
  threshold = 0.52
): { isDuplicate: boolean; matchedWith?: string; similarity?: number } {
  for (const existing of existingQuestions) {
    if (!existing) continue;
    const similarity = calculateQuestionSimilarity(candidateText, existing);
    if (similarity >= threshold) {
      return { isDuplicate: true, matchedWith: existing, similarity };
    }
  }
  return { isDuplicate: false };
}

// ---------------------------------------------------------------------------
// DIVERSE FALLBACK QUESTION CATALOG (Guaranteed Zero Duplicates Offline)
// ---------------------------------------------------------------------------

const CURATED_FALLBACK_CATALOG: Record<string, Array<{ text: string; category: string; hints: string }>> = {
  technical: [
    {
      text: "Can you explain how the JavaScript Event Loop coordinates the Call Stack, Web APIs, Microtask Queue (Promises), and Macrotask Queue (setTimeout)?",
      category: "technical",
      hints: "Discuss microtask priority, starvation prevention, and execution order with an asynchronous code example."
    },
    {
      text: "How would you design a database schema and indexing strategy to handle high-frequency order placement during a flash sale without deadlocks?",
      category: "technical",
      hints: "Cover optimistic vs pessimistic locking, queue-based decoupling (Kafka/Redis), read replicas, and composite B-tree indexes."
    },
    {
      text: "Walk me through how React reconciliation and the Virtual DOM diffing algorithm function. Why are array indexes discouraged as element keys?",
      category: "technical",
      hints: "Cover O(n) heuristic diffing assumptions, component mounting vs updating, and key stability during list reordering."
    },
    {
      text: "What are the trade-offs between SQL (PostgreSQL) and NoSQL (MongoDB/Cassandra)? When would you architect a polyglot persistence layer?",
      category: "technical",
      hints: "Explain ACID transaction guarantees, horizontal sharding vs vertical scaling, normalized relations vs denormalized documents."
    },
    {
      text: "Explain how connection pooling works in a backend service, and how you diagnose connection pool exhaustion under sudden traffic spikes.",
      category: "technical",
      hints: "Discuss max connections, timeout configurations, leak detection, database CPU bottlenecks, and circuit breaker patterns."
    },
    {
      text: "How do modern browser rendering engines handle critical rendering path optimization, DOM construction, CSSOM, and paint reflows?",
      category: "technical",
      hints: "Discuss layout thrashing, GPU composite layers, script defer/async, and resource hints (preload, preconnect)."
    },
    {
      text: "Explain the implementation and operational trade-offs of JWT authentication versus server-side session cookies in distributed architectures.",
      category: "technical",
      hints: "Cover stateless verification, token revocation strategies, XSS vs CSRF attack vectors, and HttpOnly/SameSite cookie attributes."
    },
    {
      text: "What is the difference between concurrency and parallelism? How does your primary backend language manage thread scheduling and memory safety?",
      category: "technical",
      hints: "Discuss OS threads vs green threads/coroutines, race conditions, atomic operations, and garbage collection pauses."
    }
  ],
  behavioral: [
    {
      text: "Tell me about a time when you had to ship a critical feature under a tight deadline with incomplete requirements. How did you prioritize and execute?",
      category: "behavioral",
      hints: "Use the STAR method: state the high-stakes situation, specific trade-offs accepted, and quantifiable business impact."
    },
    {
      text: "Describe a situation where you had a strong technical disagreement with a teammate or senior engineer. How did you resolve it constructively?",
      category: "behavioral",
      hints: "Emphasize data-driven benchmarks, active listening, separating ego from technical decisions, and committing to the team outcome."
    },
    {
      text: "Give an example of an outage, bug, or mistake you were personally responsible for in production. What caused it and what guardrails did you put in place?",
      category: "behavioral",
      hints: "Demonstrate ownership without blame shifting. Walk through root-cause analysis, post-mortem documentation, and automated tests added."
    },
    {
      text: "Describe a project where you had to quickly learn an unfamiliar technology stack or framework to deliver a business objective.",
      category: "behavioral",
      hints: "Detail your self-directed learning approach, proof-of-concept prototyping, asking for mentorship, and delivering on schedule."
    },
    {
      text: "Tell me about a time you identified technical debt that was slowing your team down and advocated for refactoring or architectural cleanup.",
      category: "behavioral",
      hints: "Explain how you quantified the impact of tech debt, aligned product stakeholders, and incrementally migrated the system safely."
    }
  ],
  system_design: [
    {
      text: "How would you design a scalable URL shortener service (like TinyURL or Bitly) handling 500 million new URLs per month with sub-20ms redirect latency?",
      category: "system_design",
      hints: "Discuss base62 encoding vs hashing, database schema (NoSQL key-value vs SQL), distributed caching with Redis, and cache eviction."
    },
    {
      text: "Design a notification service capable of delivering real-time push, SMS, and email alerts reliably to millions of users during a mega-event.",
      category: "system_design",
      hints: "Cover message queues (Kafka/RabbitMQ), idempotency keys, third-party vendor failover, rate limiting, and dead-letter queues."
    },
    {
      text: "How would you architect a rate-limiting middleware capable of enforcing distributed sliding-window request limits across multiple autoscaling servers?",
      category: "system_design",
      hints: "Compare token bucket vs sliding window log, centralized Redis atomic operations (Lua scripts), memory footprint, and network latency."
    },
    {
      text: "Design an analytics ingestion pipeline that ingests 50,000 telemetry events per second, aggregates metrics in real time, and persists them for dashboarding.",
      category: "system_design",
      hints: "Discuss stream processing (Kafka/Flink), time-series databases (ClickHouse/Timescale), write batching, and aggregation rollups."
    }
  ],
  hr: [
    {
      text: "Why are you interested in joining our engineering team specifically, and what unique perspective or strengths will you bring to our culture?",
      category: "hr",
      hints: "Demonstrate genuine knowledge of company products, architecture challenges, and articulate clear personal growth goals."
    },
    {
      text: "What are your core technical strengths, and what is one area of technical skill or engineering discipline you are actively leveling up right now?",
      category: "hr",
      hints: "Pair honest self-awareness with concrete actions already underway (e.g. side projects, books, open source contributions)."
    },
    {
      text: "Where do you envision your career progressing over the next 2 to 3 years in terms of technical scope, architectural ownership, or mentorship?",
      category: "hr",
      hints: "Balance healthy ambition with commitment to mastering foundational engineering execution and team collaboration."
    }
  ],
  managerial: [
    {
      text: "Suppose halfway through a two-week sprint, your lead architect discovers a breaking flaw in a key dependency that requires delaying the launch. How do you manage this?",
      category: "managerial",
      hints: "Detail risk triage, transparent stakeholder management, re-scoping MVP deliverables, and psychological safety for the team."
    },
    {
      text: "How do you evaluate engineering trade-offs when business stakeholders demand a fast, hacky release while your team insists on a complete refactor?",
      category: "managerial",
      hints: "Frame trade-offs as calculated technical debt with an explicit payback plan, isolating risks, and aligning on product business value."
    }
  ]
};

/**
 * Returns non-duplicate fallback questions guaranteeing zero repetition
 */
export function getUniqueFallbackQuestions(
  config: any,
  count: number,
  excludedList: string[] = []
): Array<{ text: string; category: string; hints: string }> {
  const type = config.interviewType || 'mixed';
  let primaryPool: Array<{ text: string; category: string; hints: string }> = [];

  if (type === 'mixed') {
    primaryPool = [
      ...CURATED_FALLBACK_CATALOG.technical,
      ...CURATED_FALLBACK_CATALOG.system_design,
      ...CURATED_FALLBACK_CATALOG.behavioral,
      ...CURATED_FALLBACK_CATALOG.hr
    ];
  } else {
    primaryPool = CURATED_FALLBACK_CATALOG[type] || CURATED_FALLBACK_CATALOG.technical;
  }

  // Backup pools to draw from if primary is exhausted
  const backupPool = [
    ...CURATED_FALLBACK_CATALOG.technical,
    ...CURATED_FALLBACK_CATALOG.behavioral,
    ...CURATED_FALLBACK_CATALOG.system_design,
    ...CURATED_FALLBACK_CATALOG.hr,
    ...CURATED_FALLBACK_CATALOG.managerial
  ];

  const selected: Array<{ text: string; category: string; hints: string }> = [];
  const trackingList = [...excludedList];

  for (const q of [...primaryPool, ...backupPool]) {
    if (selected.length >= count) break;
    const customizedText = config.companyName && selected.length === 0 && trackingList.length === 0
      ? `Welcome to this ${config.companyName} interview for the ${config.role} position. ${q.text}`
      : q.text;

    const dupCheck = isDuplicateQuestion(customizedText, trackingList, 0.50);
    if (!dupCheck.isDuplicate) {
      selected.push({
        text: customizedText,
        category: q.category,
        hints: q.hints
      });
      trackingList.push(customizedText);
    }
  }

  return selected;
}

// ---------------------------------------------------------------------------
// GEMINI API UTILITIES
// ---------------------------------------------------------------------------

function cleanAndParseJson<T>(rawText: string, fallback: T): T {
  if (!rawText) return fallback;
  try {
    const cleaned = rawText
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (e) {
    const firstBrace = rawText.indexOf('{');
    const lastBrace = rawText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(rawText.slice(firstBrace, lastBrace + 1)) as T;
      } catch (err2) {
        console.warn('Regex fallback JSON parse failed:', err2);
      }
    }
    return fallback;
  }
}

async function callGemini(prompt: string, temperature = 0.4): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error(
      'GEMINI_API_KEY is not configured on the server. Please add your Gemini API key to server/.env.local or .env.local (Get a free key at https://aistudio.google.com/app/apikey)'
    );
  }

  const candidateModels = [
    process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
    'gemini-flash-lite-latest',
    'gemini-flash-latest',
    'gemini-3.8-flash',
    'gemma-4-26b-a4b-it'
  ];
  const uniqueModels = Array.from(new Set(candidateModels));

  let lastError: any = null;
  for (const model of uniqueModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature,
          responseMimeType: 'application/json'
        }
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Gemini model [${model}] request notice:`, err.message?.slice(0, 120) || err);
      lastError = err;
      if (err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('API key not valid'))) {
        throw new Error(`Invalid GEMINI_API_KEY: ${err.message}`);
      }
    }
  }

  throw lastError || new Error('Google Gemini API request failed across candidate models.');
}

// ---------------------------------------------------------------------------
// CONVERSATION TYPES & VOICE/SPOKEN SANITIZATION ENGINE
// ---------------------------------------------------------------------------

export interface ConversationTurn {
  questionText: string;
  candidateAnswer: string;
  category?: string;
  score?: number;
}

/**
 * Strips formatting gimmicks (markdown bolding, italics, code ticks, bullets, numbered lists, emojis)
 * and limits spoken output to 1-3 concise sentences for clean, natural Text-to-Speech playback.
 */
export function cleanSpokenQuestion(text: string): string {
  if (!text) return '';
  let cleaned = text
    .replace(/^["']\s*|\s*["']$/g, '') // remove surrounding quotes
    .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold asterisks
    .replace(/\*(.*?)\*/g, '$1') // remove italic asterisks
    .replace(/`([^`]+)`/g, '$1') // remove code backticks
    .replace(/#+\s/g, '') // remove markdown headings
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // remove links
    .replace(/^[\s*•\-–—\d.]+\s+/gm, '') // remove bullet points & numbers
    .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '') // remove emojis
    .replace(/\s+/g, ' ')
    .trim();

  // Enforce at most 3 sentences so interviewer doesn't produce long unnatural spoken monologues
  const sentences = cleaned.match(/[^.!?]+[.!?]+(\s+|$)/g);
  if (sentences && sentences.length > 3) {
    cleaned = sentences.slice(0, 3).join('').trim();
  }
  return cleaned;
}

/**
 * Generates an intelligent, technology-aware follow-up question when offline or Gemini is unconfigured.
 * Directly detects technical keywords, concepts, or brevity from the candidate's transcribed answer.
 */
export function generateIntelligentFollowUpFallback(
  question: any,
  answer: string,
  config: any
): { questionText: string; category: string; hints: string; followUpReason: string } {
  const normAnswer = (answer || '').trim();
  const lower = normAnswer.toLowerCase();

  // Targeted technology patterns tailored for Indian tech placements and job interviews
  const techPatterns: Array<{
    regex: RegExp;
    name: string;
    question: string;
    hints: string;
    reason: string;
  }> = [
    {
      regex: /\bredux\b/i,
      name: 'Redux',
      question: 'You mentioned using Redux for state management—how did you handle asynchronous actions like API calls in that setup?',
      hints: 'Discuss redux-thunk, redux-saga, action creators, middleware flow, and state immutability.',
      reason: 'Candidate mentioned Redux for state management; probing async action handling and middleware.'
    },
    {
      regex: /\breact\b/i,
      name: 'React',
      question: 'You mentioned building with React—how did you optimize component re-renders and manage shared state across deep component trees?',
      hints: 'Discuss React.memo, useMemo, useCallback, Context API vs external stores, and reconciliation.',
      reason: 'Candidate mentioned React; probing re-render optimization and state propagation.'
    },
    {
      regex: /\b(node|nodejs|express)\b/i,
      name: 'Node.js/Express',
      question: 'You mentioned using Node.js and Express—how did you manage unhandled asynchronous rejections and structure error-handling middleware?',
      hints: 'Discuss express error-handling middleware, process.on(unhandledRejection), and event loop safety.',
      reason: 'Candidate highlighted Node/Express backend; evaluating async error handling.'
    },
    {
      regex: /\bmongo(?:db)?\b/i,
      name: 'MongoDB',
      question: 'You mentioned using MongoDB for storage—how did you approach schema validation and indexing for your highest-frequency read queries?',
      hints: 'Discuss compound indexes, explain plans, document embedding vs referencing, and write concerns.',
      reason: 'Candidate mentioned MongoDB; probing indexing strategy and document modeling.'
    },
    {
      regex: /\b(postgres|postgresql|mysql|sql|rdbms|relational database)\b/i,
      name: 'SQL Databases',
      question: 'You mentioned using a SQL database—how did you diagnose slow queries and determine the right indexing strategy without degrading write throughput?',
      hints: 'Discuss EXPLAIN ANALYZE, B-tree indexes, foreign keys, transaction isolation, and connection pooling.',
      reason: 'Candidate referenced relational SQL databases; evaluating query optimization and indexing.'
    },
    {
      regex: /\bredis\b/i,
      name: 'Redis',
      question: 'You mentioned using Redis for caching—what eviction policy did you configure, and how did you guard against cache stampedes or thundering herds?',
      hints: 'Discuss TTL, LRU/LFU eviction, mutex locks, probabilistic early expiration, and cache invalidation.',
      reason: 'Candidate highlighted Redis caching; probing eviction policy and stampede prevention.'
    },
    {
      regex: /\bkafka\b/i,
      name: 'Kafka',
      question: 'You mentioned using Kafka for streaming—how did you guarantee at-least-once message processing and manage consumer group lag?',
      hints: 'Discuss partition keys, consumer offset commits, dead letter topics, and idempotent consumers.',
      reason: 'Candidate mentioned Kafka; probing consumer lag management and delivery guarantees.'
    },
    {
      regex: /\bdocker\b/i,
      name: 'Docker',
      question: 'You mentioned containerizing with Docker—how did you minimize container image layers and handle secrets during production container builds?',
      hints: 'Discuss multi-stage builds, alpine/distroless bases, .dockerignore, and secret mounts.',
      reason: 'Candidate referenced Docker containerization; probing image optimization and secret hygiene.'
    },
    {
      regex: /\b(jwt|json web token|token|oauth|authentication)\b/i,
      name: 'Authentication',
      question: 'You mentioned implementing authentication—how did you handle token expiration, silent refresh cycles, and immediate revocation for compromised sessions?',
      hints: 'Discuss short-lived access tokens, refresh tokens in HttpOnly cookies, rotation, and blacklisting.',
      reason: 'Candidate mentioned authentication tokens; probing token lifecycle and revocation mechanics.'
    },
    {
      regex: /\b(aws|amazon web services|s3|ec2|lambda|cloud)\b/i,
      name: 'Cloud Infrastructure',
      question: 'You mentioned deploying to the cloud—how did you configure auto-scaling triggers and manage environment secrets securely in production?',
      hints: 'Discuss target tracking scaling, AWS Secrets Manager, IAM roles with least privilege, and VPC isolation.',
      reason: 'Candidate mentioned cloud deployment; evaluating auto-scaling and secrets management.'
    },
    {
      regex: /\b(microservices?|micro-services?)\b/i,
      name: 'Microservices',
      question: 'You mentioned a microservices architecture—how did you handle inter-service communication failures and avoid cascading outages across services?',
      hints: 'Discuss circuit breakers, retries with exponential backoff, distributed tracing, and service meshes.',
      reason: 'Candidate highlighted microservices; testing resiliency and fault isolation.'
    },
    {
      regex: /\b(python|django|fastapi|flask)\b/i,
      name: 'Python',
      question: 'You mentioned building with Python—how did you manage concurrency and handle database connection pooling under high concurrent traffic?',
      hints: 'Discuss GIL implications, asyncio vs multiprocessing, Gunicorn/Uvicorn worker pools, and connection pool limits.',
      reason: 'Candidate mentioned Python frameworks; probing concurrency model and connection pooling.'
    },
    {
      regex: /\b(java|spring|spring boot)\b/i,
      name: 'Java / Spring',
      question: 'You mentioned using Java and Spring Boot—how did you structure transactional boundaries and ensure rollback occurred when encountering custom checked exceptions?',
      hints: 'Discuss @Transactional rollbackFor, propagation levels, AOP proxy behavior, and Hibernate dirty checking.',
      reason: 'Candidate mentioned Java/Spring Boot; probing transaction isolation and rollback behavior.'
    },
    {
      regex: /\b(websocket|websockets|socket\.io)\b/i,
      name: 'WebSockets',
      question: 'You mentioned using WebSockets—how did you handle unexpected client disconnects and synchronize missed events when clients reconnected?',
      hints: 'Discuss heartbeat pings, sequence numbering, message queues/Redis pub-sub backplane, and state reconciliation.',
      reason: 'Candidate mentioned WebSockets; evaluating disconnect handling and state sync.'
    }
  ];

  for (const item of techPatterns) {
    if (item.regex.test(lower)) {
      return {
        questionText: item.question,
        category: question.category || 'technical',
        hints: item.hints,
        followUpReason: item.reason
      };
    }
  }

  // If answer is very brief (< 20 words), prompt for depth
  const wordCount = normAnswer.split(/\s+/).filter(Boolean).length;
  if (wordCount < 20) {
    return {
      questionText: 'Your answer introduces the high-level concept, but could you walk me through the specific implementation steps and how you handled potential edge cases?',
      category: question.category || 'technical',
      hints: 'Provide concrete architectural details, data flow, error handling, and quantitative outcomes.',
      followUpReason: 'Candidate answer was brief; prompting for concrete implementation mechanics.'
    };
  }

  // If no tech matched, extract first clean sentence / clause and challenge it with an Indian tech interview scenario
  const snippets = normAnswer.split(/[.?!]/).map(s => s.trim()).filter(s => s.length > 15 && s.length < 80);
  const snippet = snippets[0] ? `regarding "${snippets[0]}"` : '';
  return {
    questionText: `Building on your point ${snippet}, what happens if network latency increases tenfold or a critical downstream service crashes? What fallback or circuit-breaking mechanism protects the user experience?`,
    category: question.category || 'technical',
    hints: 'Discuss timeout configurations, retry with exponential backoff, bulkheading, and graceful degradation.',
    followUpReason: 'Testing resiliency and graceful failure handling on candidate stated architecture.'
  };
}

// ---------------------------------------------------------------------------
// CORE INTERVIEW AI SERVICE WITH DEDUPLICATION & ADAPTIVE DIFFICULTY
// ---------------------------------------------------------------------------

export const geminiService = {
  /**
   * Generates strictly non-duplicate, role-tailored interview questions
   * Accepts previousQuestions history to enforce zero repetition across sessions
   */
  async generateInterviewQuestions(config: any, previousQuestions: string[] = []): Promise<any[]> {
    const requestedCount = config.questionCount || 3;
    const historyList = (previousQuestions || []).filter(Boolean);

    // Build blacklist for Gemini system prompt
    const excludedListFormatted = historyList.length > 0
      ? `\nPREVIOUSLY ASKED QUESTIONS (STRICT PROHIBITION - DO NOT REPEAT ANY OF THESE TOPICS OR CONCEPTS):\n${historyList.slice(-15).map((q, idx) => `${idx + 1}. "${q}"`).join('\n')}\n`
      : '';

    // Adaptive difficulty guidance
    const adaptiveContext = config.adaptiveContext || {};
    const performanceGuidance = adaptiveContext.averageScore !== undefined
      ? `\nCANDIDATE PERFORMANCE ADAPTATION:
Current Average Score: ${adaptiveContext.averageScore}/100.
${adaptiveContext.averageScore >= 80 
  ? 'Candidate is performing strongly. Elevate difficulty: probe edge cases, high concurrency, failure modes, internals, and non-obvious engineering tradeoffs.' 
  : adaptiveContext.averageScore <= 55 
  ? 'Candidate struggled on earlier questions. Focus on practical foundational reasoning, clear architecture choices, and guided problem solving before probing deeper.' 
  : 'Maintain a balanced, rigorous pace testing real-world engineering decisions.'}\n`
      : '';

    const accumulatedQuestions: any[] = [];
    const allKnownQuestions = [...historyList];
    const maxRetries = 3;
    let attempts = 0;

    while (accumulatedQuestions.length < requestedCount && attempts < maxRetries) {
      attempts++;
      const needed = requestedCount - accumulatedQuestions.length;

      const prompt = `You are a Principal Software Engineer and Bar Raiser conducting an interview tailored for campus placements and technical hiring in India (spanning service giants like TCS Digital/Prime, Infosys SP, product unicorns like Swiggy, Flipkart, Zomato, to MNCs like Amazon India and high-growth tech startups).
Candidate Target Role: ${config.role}
Experience Level: ${config.experienceLevel || 'fresher'} (student / fresher / junior / senior)
Interview Type: ${config.interviewType || 'mixed'} (technical / behavioral / hr / system_design / mixed)
Difficulty: ${config.difficulty || 'intermediate'}
Number of distinct questions needed: ${needed}
Target Company Style: ${config.companyCategory || 'General Product Company'}
${config.jobDescription ? `Target Job Description: ${config.jobDescription}` : ''}
${config.resumeText ? `Candidate Resume / Projects: ${config.resumeText}` : ''}
${performanceGuidance}
${excludedListFormatted}
CRITICAL UNIQUENESS & DIVERSITY REQUIREMENTS:
1. Every generated question MUST be completely distinct, novel, and non-repeating.
2. DO NOT repeat, rephrase, or ask questions semantically equivalent to ANY previously asked question listed above.
3. If technical, distribute questions across core CS fundamentals (DSA, DBMS, OS, Networks, OOPs for college/freshers) or practical system architecture for experienced roles.
4. If behavioral, ask about distinct situations (e.g. college capstone challenges, technical failures, scope negotiations, or team conflict).

FORMAT CONSTRAINTS FOR SPOKEN VOICE (CRITICAL):
- Each question MUST be concise: 1 to 3 sentences maximum.
- The question will be read aloud immediately using Text-to-Speech (TTS). It must sound natural and conversational.
- ABSOLUTELY NO MARKDOWN: NO bolding (**), NO italics (*), NO code ticks (\`), NO bullet points, NO numbered lists.
- ABSOLUTELY NO EMOJIS.

Respond ONLY with a JSON object in this exact format:
{
  "questions": [
    {
      "orderIndex": 0,
      "questionText": "Question text here (1 to 3 natural spoken sentences, plain text, no markdown)",
      "category": "technical",
      "contextOrHints": "What key concepts the candidate should cover"
    }
  ]
}`;

      try {
        const raw = await callGemini(prompt, 0.7);
        const parsed = cleanAndParseJson<{ questions: any[] }>(raw, { questions: [] });
        const generatedBatch = parsed.questions || [];

        for (const candidate of generatedBatch) {
          if (!candidate.questionText || candidate.questionText.trim().length < 15) continue;

          const cleanedQuestionText = cleanSpokenQuestion(candidate.questionText);
          if (cleanedQuestionText.length < 15) continue;

          const dupCheck = isDuplicateQuestion(cleanedQuestionText, allKnownQuestions, 0.50);
          if (!dupCheck.isDuplicate) {
            accumulatedQuestions.push({
              id: `q-gemini-${Date.now()}-${accumulatedQuestions.length}`,
              orderIndex: accumulatedQuestions.length,
              questionText: cleanedQuestionText,
              category: candidate.category || config.interviewType || 'technical',
              contextOrHints: candidate.contextOrHints || ''
            });
            allKnownQuestions.push(cleanedQuestionText);
          } else {
            console.warn(`[Deduplication] Blocked similar question (${((dupCheck.similarity || 0) * 100).toFixed(0)}% match): "${cleanedQuestionText.slice(0, 60)}..."`);
          }

          if (accumulatedQuestions.length >= requestedCount) break;
        }
      } catch (err) {
        console.warn(`Gemini generation attempt ${attempts} warning:`, err);
        break; // If Gemini API fails, smoothly fallback to curated non-duplicate catalog
      }
    }

    // If still short of requestedCount (due to duplicate rejections or network issue), fill with guaranteed unique fallback questions
    if (accumulatedQuestions.length < requestedCount) {
      const remainingNeeded = requestedCount - accumulatedQuestions.length;
      const fallbackItems = getUniqueFallbackQuestions(config, remainingNeeded, allKnownQuestions);
      for (const item of fallbackItems) {
        accumulatedQuestions.push({
          id: `q-curated-${Date.now()}-${accumulatedQuestions.length}`,
          orderIndex: accumulatedQuestions.length,
          questionText: item.text,
          category: item.category,
          contextOrHints: item.hints
        });
        allKnownQuestions.push(item.text);
      }
    }

    return accumulatedQuestions.slice(0, requestedCount);
  },

  /**
   * Evaluates candidate answer with strict 5-category rubric and verified claims
   */
  async evaluateCandidateAnswer(question: any, answer: string, config: any): Promise<any> {
    const prompt = `You are a Principal Software Engineer and Bar Raiser evaluating a candidate's answer for the position of "${config.role || 'Software Engineer'}" at "${config.companyName || 'Tech Company'}" (${config.difficulty || 'intermediate'} level).
Question Asked: "${question.questionText}"
Question Category: ${question.category}
Context / Expected Competencies: "${question.contextOrHints || 'Demonstrate technical correctness, practical engineering tradeoffs, and structured communication.'}"
Candidate Transcribed Spoken Answer: "${answer}"

EVALUATION RUBRIC & INSTRUCTIONS:
Evaluate strictly on content, technical depth, and actual problem-solving, NOT on length or superficial fluency.
Do not fabricate facts or award points for unsupported buzzwords. If a candidate makes incorrect or unsupported technical claims, penalize them explicitly and explain why.

Evaluate across exactly 5 criteria (each scored 0 to 100):
1. technicalCorrectness: Technical accuracy, depth of concepts, correct terminology, absence of technical hallucinations.
2. relevance: How directly and specifically the answer addresses the question asked without rambling.
3. problemSolvingReasoning: Logical reasoning, architectural tradeoffs (latency vs memory, consistency vs availability, complexity), handling edge cases.
4. completenessAndExamples: Concrete real-world implementation details, metrics, edge cases, or STAR structure (for behavioral/situational questions).
5. communicationClarity: Articulation, structure, conciseness, avoiding rambles.

Composite Score calculation:
score = Math.round(technicalCorrectness * 0.35 + relevance * 0.20 + problemSolvingReasoning * 0.20 + completenessAndExamples * 0.15 + communicationClarity * 0.10).

Identify:
- verifiedClaims: 1-3 specific technical facts or valid arguments verified in their answer.
- unverifiedOrQuestionableClaims: Any incorrect, dubious, or unsupported claims (or empty array if none).
- strengths: 2-3 specific strengths citing the candidate's actual words.
- missedPoints: 2-3 essential missing concepts or deeper edge cases.
- betterAnswerExample: A concise, high-impact model answer demonstrating senior-level competence with concrete numbers/tradeoffs.

Respond ONLY with valid JSON in this exact schema:
{
  "status": "evaluated",
  "score": 82,
  "technicalDepthScore": 85,
  "relevanceScore": 90,
  "reasoningScore": 78,
  "completenessScore": 75,
  "communicationScore": 85,
  "accuracyScore": 85,
  "structureScore": 80,
  "rubricBreakdown": {
    "technicalCorrectness": {
      "score": 85,
      "reasoning": "Direct explanation of why this score was awarded or deducted.",
      "evidenceQuote": "Short quote from candidate's answer"
    },
    "relevance": {
      "score": 90,
      "reasoning": "Direct explanation of why this score was awarded or deducted.",
      "evidenceQuote": "Short quote from candidate's answer"
    },
    "problemSolvingReasoning": {
      "score": 78,
      "reasoning": "Direct explanation of why this score was awarded or deducted.",
      "evidenceQuote": "Short quote from candidate's answer"
    },
    "completenessAndExamples": {
      "score": 75,
      "reasoning": "Direct explanation of why this score was awarded or deducted.",
      "evidenceQuote": "Short quote from candidate's answer"
    },
    "communicationClarity": {
      "score": 85,
      "reasoning": "Direct explanation of why this score was awarded or deducted.",
      "evidenceQuote": "Short quote from candidate's answer"
    }
  },
  "verifiedClaims": ["Verified technical fact 1"],
  "unverifiedOrQuestionableClaims": ["Unverified or incorrect claim 1"],
  "feedback": "2-3 sentences of clear constructive feedback directly to the candidate.",
  "strengths": ["Strength 1 with short quote", "Strength 2 with short quote"],
  "missedPoints": ["Missed point 1", "Missed point 2"],
  "betterAnswerExample": "How a top candidate would formulate this answer concisely with concrete metrics and architecture.",
  "starMethodologyUsed": true
}`;

    const raw = await callGemini(prompt, 0.3);
    const parsed = cleanAndParseJson<any>(raw, {});
    return {
      status: 'evaluated',
      source: 'gemini',
      ...parsed
    };
  },

  /**
   * Generates realistic, contextual follow-up challenge probing the candidate's actual answer.
   * Maintains session conversation history, analyzes transcribed answers, and enforces voice-first constraints.
   */
  async generateFollowUpQuestion(
    question: any, 
    answer: string, 
    config: any, 
    previousQuestions: string[] = [],
    previousScore?: number,
    conversationHistory: ConversationTurn[] = []
  ): Promise<any> {
    const historyList = (previousQuestions || []).filter(Boolean);
    const excludedListFormatted = historyList.length > 0
      ? `\nPREVIOUSLY COVERED QUESTIONS (DO NOT REPEAT OR DUPLICATE):\n${historyList.slice(-10).map((q, i) => `${i + 1}. "${q}"`).join('\n')}\n`
      : '';

    const formattedConversationHistory = (conversationHistory || []).length > 0
      ? `\nSESSION CONVERSATION HISTORY (Previous turns in this interview):\n${conversationHistory.slice(-5).map((turn, idx) => `Turn ${idx + 1}:
Interviewer: "${turn.questionText}"
Candidate Answer: "${turn.candidateAnswer}"${turn.score !== undefined ? ` (Score: ${turn.score}/100)` : ''}`).join('\n')}\n`
      : '';

    const adaptiveTone = previousScore !== undefined && previousScore >= 80
      ? 'The candidate gave a strong answer. Acknowledge briefly and challenge them with a high-stakes edge case, scale bottleneck (e.g. 20x traffic spike or network partition), or defend non-obvious engineering trade-offs.'
      : 'The candidate answered at a high level or missed implementation details. Probe deeper into their specific mechanics, failure recovery, or quantitative outcomes.';

    const prompt = `You are a professional, empathetic, yet sharp technical and behavioral interviewer conducting an interview for college placements and tech jobs in India (tailored for ${config.companyName || 'top tech companies'}, role: ${config.role}, ${config.experienceLevel || 'fresher'} level).

Current Question Asked: "${question.questionText}"
Candidate's Transcribed Spoken Answer: "${answer}"
${adaptiveTone}
${excludedListFormatted}
${formattedConversationHistory}

INTERVIEWER PERSONA & REASONING INSTRUCTIONS:
You are an empathetic, encouraging, yet technically sharp interviewer.
Listen attentively to what the candidate actually said in their transcribed answer.

STEP 1: ANALYZE THE CANDIDATE'S TRANSCRIBED ANSWER:
- Check if the candidate explicitly mentioned any specific technology, framework, database, tool, or architectural pattern (e.g., Redux, React, Node.js, Express, MongoDB, PostgreSQL, Redis, Kafka, Docker, Kubernetes, AWS, WebSockets, JWT, microservices, indexing, caching).
- Check if the answer is brief, vague, or missing critical implementation details, edge cases, or STAR metrics.
- Check if the answer is already complete, accurate, and thorough.

STEP 2: FORMULATE YOUR INTERVIEWER RESPONSE:
- IF THEY MENTIONED A SPECIFIC TECHNOLOGY OR CONCEPT:
  Generate a natural 1-sentence follow-up question drilling directly into that specific technology or concept.
  For example: "You mentioned using Redux for state management—how did you handle asynchronous actions like API calls in that setup?"
  For example: "You mentioned using MongoDB for storage—how did you approach schema validation and indexing for your highest-frequency read queries?"
- IF THE ANSWER WAS BRIEF OR MISSING KEY DETAILS:
  Generate a targeted 1-sentence follow-up asking for the missing concrete implementation mechanics, failure handling, or metrics.
  For example: "Could you elaborate on how your service handles database reconnection if the primary database node fails?"
- IF THE ANSWER WAS COMPLETE AND THOROUGH:
  Acknowledge briefly with professional warmth (e.g., "That makes sense." or "Good point on that.") and either probe an edge case or transition smoothly to the next core dimension.

FORMAT CONSTRAINTS FOR SPOKEN VOICE (CRITICAL):
1. Output MUST be concise: 1 to 3 sentences maximum.
2. The question will be read aloud immediately using Text-to-Speech (TTS). It must sound completely natural, spoken, and conversational.
3. ABSOLUTELY NO MARKDOWN: NO bolding (**), NO italics (*), NO code ticks (\`), NO bullet points (* or -), NO numbered lists.
4. ABSOLUTELY NO EMOJIS.
5. Do NOT include filler headers like "Interviewer:" or "Follow-up Question:".

Respond ONLY with a JSON object in this exact schema:
{
  "questionText": "Natural spoken follow-up question here (1 to 3 sentences, plain conversational text)",
  "category": "${question.category || 'technical'}",
  "contextOrHints": "What specific engineering depth or trade-off the interviewer is probing",
  "followUpReason": "Brief explanation of why this follow-up was chosen from their answer"
}`;

    let followUpQuestionText = '';
    let category = question.category || 'technical';
    let hints = '';
    let followUpReason = '';

    try {
      const raw = await callGemini(prompt, 0.7);
      const parsed = cleanAndParseJson<any>(raw, {});
      if (parsed.questionText) {
        const cleaned = cleanSpokenQuestion(parsed.questionText);
        if (cleaned.length >= 15) {
          const dupCheck = isDuplicateQuestion(cleaned, historyList, 0.50);
          if (!dupCheck.isDuplicate) {
            followUpQuestionText = cleaned;
            category = parsed.category || question.category || 'technical';
            hints = parsed.contextOrHints || '';
            followUpReason = parsed.followUpReason || '';
          }
        }
      }
    } catch (e) {
      console.warn('Gemini follow-up generation notice, using intelligent fallback:', e);
    }

    if (!followUpQuestionText) {
      // Use intelligent technology-aware fallback matching the exact candidate answer
      const fallback = generateIntelligentFollowUpFallback(question, answer, config);
      followUpQuestionText = cleanSpokenQuestion(fallback.questionText);
      category = fallback.category;
      hints = fallback.hints;
      followUpReason = fallback.followUpReason;
    }

    return {
      id: `q-followup-${Date.now()}`,
      orderIndex: (question.orderIndex || 0) + 1,
      questionText: followUpQuestionText,
      category,
      contextOrHints: hints,
      followUpReason,
      isFollowUp: true,
      followUpToQuestionId: question.id,
      source: 'gemini'
    };
  },

  /**
   * Synthesizes executive feedback report across all evaluated session questions
   */
  async generateComprehensiveReport(questions: any[], config: any, candidateName: string): Promise<any> {
    const transcriptSummary = questions.map((q, i) => `
Question ${i + 1} (${q.category}): ${q.questionText}
Candidate Answer: ${q.candidateAnswer || 'No answer provided'}
Score: ${q.evaluation?.score ?? 'N/A'}/100
Feedback: ${q.evaluation?.feedback || 'N/A'}
Strengths: ${(q.evaluation?.strengths || []).join('; ')}
Missed Points: ${(q.evaluation?.missedPoints || []).join('; ')}
`).join('\n---\n');

    const prompt = `You are the lead bar raiser and hiring committee member.
Candidate: ${candidateName}
Target Role: ${config.role}
Company: ${config.companyName}
Interview Type: ${config.interviewType}

Transcript of the session:
${transcriptSummary}

Synthesize a comprehensive, executive evaluation report with actionable growth recommendations.
Respond ONLY with a JSON object matching this schema:
{
  "overallScore": 82,
  "technicalAccuracyScore": 84,
  "communicationScore": 80,
  "structureStarScore": 82,
  "relevanceScore": 85,
  "summary": "Executive summary of candidate performance",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "weaknesses": ["Area for improvement 1", "Area for improvement 2"],
  "missedConcepts": ["Concept 1", "Concept 2"],
  "actionableImprovements": ["Tip 1", "Tip 2", "Tip 3"],
  "recommendedTopics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"],
  "exampleImprovedAnswers": [
    {
      "question": "Question text",
      "originalSummary": "Brief recap of what candidate said",
      "improvedAnswer": "Exemplary model answer",
      "whyBetter": "Explanation of structural improvement"
    }
  ],
  "prepPlan": [
    {
      "dayOrPhase": "Phase 1: Foundation & Core Concepts",
      "focus": "Topic focus",
      "actionItems": ["Action 1", "Action 2"]
    },
    {
      "dayOrPhase": "Phase 2: Behavioral STAR Stories",
      "focus": "Topic focus",
      "actionItems": ["Action 1", "Action 2"]
    },
    {
      "dayOrPhase": "Phase 3: High-Pressure Mock Drills",
      "focus": "Topic focus",
      "actionItems": ["Action 1", "Action 2"]
    }
  ]
}`;

    const raw = await callGemini(prompt, 0.4);
    const parsed = cleanAndParseJson<any>(raw, {});
    return {
      ...parsed,
      id: `rep-${Date.now()}`,
      sessionId: `sess-${Date.now()}`,
      candidateName,
      role: config.role,
      company: config.companyName,
      interviewType: config.interviewType,
      questionsEvaluated: questions,
      source: 'gemini',
      createdAt: new Date().toISOString()
    };
  }
};
