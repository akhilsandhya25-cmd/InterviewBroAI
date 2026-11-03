import { CompanyPreset, ExperienceLevel, InterviewType } from '../types';
import { COMPANY_TRACKS } from './companyTracks';

export const COMPANY_PRESETS: CompanyPreset[] = [
  {
    id: 'tcs',
    name: 'Tata Consultancy Services (TCS)',
    category: 'Service Giant',
    tagline: COMPANY_TRACKS.tcs.tagline,
    code: 'TCS',
    logo: 'TCS',
    color: 'from-blue-600 to-indigo-800',
    popularRoles: ['Software Engineer', 'TCS Digital Associate', 'TCS Prime Architect', 'System Engineer'],
    focusAreas: COMPANY_TRACKS.tcs.commonTopicAreas,
    interviewStructure: COMPANY_TRACKS.tcs.typicalRoundStructure,
    difficultyEmphasis: COMPANY_TRACKS.tcs.difficultyEmphasis,
    interviewStyle: COMPANY_TRACKS.tcs.interviewStyle,
    exampleQuestionThemes: COMPANY_TRACKS.tcs.exampleQuestionThemes,
    status: COMPANY_TRACKS.tcs.status,
    todoReviewNote: COMPANY_TRACKS.tcs.todoReviewNote
  },
  {
    id: 'infosys',
    name: 'Infosys',
    category: 'Service Giant',
    tagline: COMPANY_TRACKS.infosys.tagline,
    code: 'INF',
    logo: 'INF',
    color: 'from-sky-600 to-blue-700',
    popularRoles: ['Specialist Programmer (SP)', 'Digital Specialist Engineer (DSE)', 'Systems Engineer'],
    focusAreas: COMPANY_TRACKS.infosys.commonTopicAreas,
    interviewStructure: COMPANY_TRACKS.infosys.typicalRoundStructure,
    difficultyEmphasis: COMPANY_TRACKS.infosys.difficultyEmphasis,
    interviewStyle: COMPANY_TRACKS.infosys.interviewStyle,
    exampleQuestionThemes: COMPANY_TRACKS.infosys.exampleQuestionThemes,
    status: COMPANY_TRACKS.infosys.status,
    todoReviewNote: COMPANY_TRACKS.infosys.todoReviewNote
  },
  {
    id: 'wipro',
    name: 'Wipro',
    category: 'Service Giant',
    tagline: COMPANY_TRACKS.wipro.tagline,
    code: 'WIP',
    logo: 'WIP',
    color: 'from-teal-600 to-emerald-800',
    popularRoles: ['Project Engineer (Turbo)', 'Elite Associate', 'Cloud Developer'],
    focusAreas: COMPANY_TRACKS.wipro.commonTopicAreas,
    interviewStructure: COMPANY_TRACKS.wipro.typicalRoundStructure,
    difficultyEmphasis: COMPANY_TRACKS.wipro.difficultyEmphasis,
    interviewStyle: COMPANY_TRACKS.wipro.interviewStyle,
    exampleQuestionThemes: COMPANY_TRACKS.wipro.exampleQuestionThemes,
    status: COMPANY_TRACKS.wipro.status,
    todoReviewNote: COMPANY_TRACKS.wipro.todoReviewNote
  },
  {
    id: 'accenture',
    name: 'Accenture',
    category: 'Service Giant',
    tagline: COMPANY_TRACKS.accenture.tagline,
    code: 'ACN',
    logo: 'ACN',
    color: 'from-purple-700 to-indigo-900',
    popularRoles: ['Advanced Associate Software Engineer (AASE)', 'Associate Software Engineer (ASE)', 'Cloud Application Developer'],
    focusAreas: COMPANY_TRACKS.accenture.commonTopicAreas,
    interviewStructure: COMPANY_TRACKS.accenture.typicalRoundStructure,
    difficultyEmphasis: COMPANY_TRACKS.accenture.difficultyEmphasis,
    interviewStyle: COMPANY_TRACKS.accenture.interviewStyle,
    exampleQuestionThemes: COMPANY_TRACKS.accenture.exampleQuestionThemes,
    status: COMPANY_TRACKS.accenture.status,
    todoReviewNote: COMPANY_TRACKS.accenture.todoReviewNote
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    category: 'Product Unicorn',
    tagline: COMPANY_TRACKS.swiggy.tagline,
    code: 'SWG',
    logo: 'SWG',
    color: 'from-orange-500 to-red-600',
    popularRoles: ['Software Development Engineer I/II', 'Data Analyst', 'Frontend Engineer'],
    focusAreas: COMPANY_TRACKS.swiggy.commonTopicAreas,
    interviewStructure: COMPANY_TRACKS.swiggy.typicalRoundStructure,
    difficultyEmphasis: COMPANY_TRACKS.swiggy.difficultyEmphasis,
    interviewStyle: COMPANY_TRACKS.swiggy.interviewStyle,
    exampleQuestionThemes: COMPANY_TRACKS.swiggy.exampleQuestionThemes,
    status: COMPANY_TRACKS.swiggy.status,
    todoReviewNote: COMPANY_TRACKS.swiggy.todoReviewNote
  },
  {
    id: 'zomato',
    name: 'Zomato',
    category: 'Product Unicorn',
    tagline: COMPANY_TRACKS.zomato.tagline,
    code: 'ZOM',
    logo: 'ZOM',
    color: 'from-rose-600 to-red-700',
    popularRoles: ['SDE I (Backend / Web)', 'Growth Engineer', 'Product Analyst'],
    focusAreas: COMPANY_TRACKS.zomato.commonTopicAreas,
    interviewStructure: COMPANY_TRACKS.zomato.typicalRoundStructure,
    difficultyEmphasis: COMPANY_TRACKS.zomato.difficultyEmphasis,
    interviewStyle: COMPANY_TRACKS.zomato.interviewStyle,
    exampleQuestionThemes: COMPANY_TRACKS.zomato.exampleQuestionThemes,
    status: COMPANY_TRACKS.zomato.status,
    todoReviewNote: COMPANY_TRACKS.zomato.todoReviewNote
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    category: 'Product Unicorn',
    tagline: COMPANY_TRACKS.flipkart.tagline,
    code: 'FK',
    logo: 'FK',
    color: 'from-yellow-500 to-amber-700',
    popularRoles: ['SDE-1 (Full Stack / Backend)', 'Data Platform Engineer', 'Mobile SDE'],
    focusAreas: COMPANY_TRACKS.flipkart.commonTopicAreas,
    interviewStructure: COMPANY_TRACKS.flipkart.typicalRoundStructure,
    difficultyEmphasis: COMPANY_TRACKS.flipkart.difficultyEmphasis,
    interviewStyle: COMPANY_TRACKS.flipkart.interviewStyle,
    exampleQuestionThemes: COMPANY_TRACKS.flipkart.exampleQuestionThemes,
    status: COMPANY_TRACKS.flipkart.status,
    todoReviewNote: COMPANY_TRACKS.flipkart.todoReviewNote
  },
  {
    id: 'amazon',
    name: 'Amazon India',
    category: 'FAANG / MNC',
    tagline: COMPANY_TRACKS.amazon.tagline,
    code: 'AMZ',
    logo: 'AMZ',
    color: 'from-amber-600 to-yellow-800',
    popularRoles: ['SDE-1', 'SDE-2', 'Support Engineer', 'Quality Assurance Engineer (SDET)'],
    focusAreas: COMPANY_TRACKS.amazon.commonTopicAreas,
    interviewStructure: COMPANY_TRACKS.amazon.typicalRoundStructure,
    difficultyEmphasis: COMPANY_TRACKS.amazon.difficultyEmphasis,
    interviewStyle: COMPANY_TRACKS.amazon.interviewStyle,
    exampleQuestionThemes: COMPANY_TRACKS.amazon.exampleQuestionThemes,
    status: COMPANY_TRACKS.amazon.status,
    todoReviewNote: COMPANY_TRACKS.amazon.todoReviewNote
  },
  {
    id: 'google',
    name: 'Google India',
    category: 'FAANG / MNC',
    tagline: COMPANY_TRACKS.google.tagline,
    code: 'GOOG',
    logo: 'GOOG',
    color: 'from-blue-600 to-red-600',
    popularRoles: ['Software Engineer (L3/L4)', 'Site Reliability Engineer (SRE)', 'Machine Learning Engineer'],
    focusAreas: COMPANY_TRACKS.google.commonTopicAreas,
    interviewStructure: COMPANY_TRACKS.google.typicalRoundStructure,
    difficultyEmphasis: COMPANY_TRACKS.google.difficultyEmphasis,
    interviewStyle: COMPANY_TRACKS.google.interviewStyle,
    exampleQuestionThemes: COMPANY_TRACKS.google.exampleQuestionThemes,
    status: COMPANY_TRACKS.google.status,
    todoReviewNote: COMPANY_TRACKS.google.todoReviewNote
  },
  {
    id: 'microsoft',
    name: 'Microsoft India',
    category: 'FAANG / MNC',
    tagline: COMPANY_TRACKS.microsoft.tagline,
    code: 'MSFT',
    logo: 'MSFT',
    color: 'from-sky-700 to-blue-800',
    popularRoles: ['Software Engineer (L59/L60)', 'Cloud Solution Architect', 'Applied Scientist'],
    focusAreas: COMPANY_TRACKS.microsoft.commonTopicAreas,
    interviewStructure: COMPANY_TRACKS.microsoft.typicalRoundStructure,
    difficultyEmphasis: COMPANY_TRACKS.microsoft.difficultyEmphasis,
    interviewStyle: COMPANY_TRACKS.microsoft.interviewStyle,
    exampleQuestionThemes: COMPANY_TRACKS.microsoft.exampleQuestionThemes,
    status: COMPANY_TRACKS.microsoft.status,
    todoReviewNote: COMPANY_TRACKS.microsoft.todoReviewNote
  },
  {
    id: 'early-startup',
    name: 'High-Growth Tech Startup',
    category: 'Startup',
    tagline: 'Speed of Execution & Fullstack Pragmatism',
    code: 'STU',
    logo: 'STU',
    color: 'from-purple-600 to-pink-600',
    popularRoles: ['Full Stack Engineer (React + Node)', 'Founding Engineer', 'DevOps & AI Integrator'],
    focusAreas: ['Hands-on Project Architecture', 'Fast Prototyping', 'Database Schema Design', 'Debugging Under Pressure'],
    interviewStructure: ['Practical Take-Home or Pair Programming', 'Project Deep-Dive & Code Walkthrough', 'Founder Fit & Grit Interview']
  }
];

export const POPULAR_ROLES = [
  'Full Stack Developer (React + Node)',
  'Frontend Developer (React / Next.js / TypeScript)',
  'Backend Developer (Java Spring Boot / Node / Go)',
  'Software Development Engineer I (SDE-1)',
  'Data Scientist / AI & ML Engineer',
  'DevOps & Cloud Engineer (AWS / Docker / Kubernetes)',
  'SDET / QA Automation Engineer',
  'Product Analyst / Associate Product Manager'
];

export const EXPERIENCE_LEVELS: { id: ExperienceLevel; label: string; desc: string }[] = [
  { id: 'student', label: 'College Student', desc: 'Pre-final or final year engineering/CS student preparing for campus placements' },
  { id: 'fresher', label: 'Fresh Graduate (0-1 yrs)', desc: 'Recent graduate aiming for off-campus recruitment or entry-level roles' },
  { id: 'junior', label: 'Junior Engineer (1-3 yrs)', desc: '1 to 3 years experience looking to switch into tier-1 or product firms' },
  { id: 'mid', label: 'Mid-Level Engineer (3-5 yrs)', desc: 'Looking for SDE-2 roles with system design & leadership expectations' },
  { id: 'senior', label: 'Senior Engineer (5+ yrs)', desc: 'Senior roles emphasizing high-level architecture & team leadership' }
];

export const INTERVIEW_TYPES: { id: InterviewType; label: string; icon: string; desc: string }[] = [
  { id: 'mixed', label: 'Comprehensive Mixed Round', icon: 'layers', desc: 'Realistic interview combining technical questions, projects, and behavioral checks' },
  { id: 'technical', label: 'Technical & Coding Round', icon: 'terminal', desc: 'Data structures, algorithms, language internals, frameworks, and database queries' },
  { id: 'behavioral', label: 'Behavioral (STAR Method)', icon: 'users', desc: 'Situational scenarios, conflict resolution, teamwork, ownership, and adaptability' },
  { id: 'hr', label: 'HR & Cultural Fit Round', icon: 'user-check', desc: 'Strengths, weaknesses, salary expectations, career aspirations, and company alignment' },
  { id: 'system_design', label: 'System Design & Architecture', icon: 'cpu', desc: 'High-level and low-level system design, scalability, caching, and database trade-offs' },
  { id: 'managerial', label: 'Managerial & Problem Solving', icon: 'compass', desc: 'Handling deadlines, cross-functional communication, and engineering trade-offs' }
];

export const SAMPLE_FALLBACK_QUESTIONS: Record<InterviewType, Array<{ text: string; category: any; hints: string }>> = {
  technical: [
    {
      text: "Can you explain how the JavaScript event loop works, specifically distinguishing between the microtask queue and macrotask queue?",
      category: "technical",
      hints: "Discuss call stack, Web APIs, Promise callbacks (microtask) vs setTimeout/setInterval (macrotask), and execution order."
    },
    {
      text: "Explain the four core pillars of Object-Oriented Programming (Encapsulation, Abstraction, Inheritance, Polymorphism) and provide a concrete real-world example of Polymorphism.",
      category: "technical",
      hints: "Define compile-time overloading vs runtime overriding, interface contracts, and access control."
    },
    {
      text: "How do INNER JOIN, LEFT OUTER JOIN, and FULL OUTER JOIN differ in SQL? Walk me through a scenario where a LEFT JOIN is strictly necessary.",
      category: "technical",
      hints: "Explain Venn diagram logic, null handling for missing rows on the right table, and query execution efficiency."
    },
    {
      text: "In database design, explain why we perform Normalization (1NF, 2NF, 3NF), and describe a practical situation where you would intentionally denormalize a table.",
      category: "technical",
      hints: "Discuss data redundancy, update anomalies, foreign key relationships, and read performance trade-offs."
    },
    {
      text: "Walk me through the difference between SQL and NoSQL databases. When would you choose MongoDB or Cassandra over PostgreSQL?",
      category: "technical",
      hints: "Discuss ACID vs BASE, relational integrity, horizontal scaling vs vertical scaling, schema flexibility, and read/write access patterns."
    },
    {
      text: "How does React reconciliation and Virtual DOM diffing work internally? Why are array indices strongly discouraged as keys in dynamic lists?",
      category: "technical",
      hints: "Explain fiber architecture, component lifecycle updates, key stability, and child re-rendering efficiency."
    },
    {
      text: "What happens under the hood when a user types a URL into their web browser and presses Enter? Walk me through DNS resolution, TCP handshake, TLS negotiation, and DOM rendering.",
      category: "technical",
      hints: "Cover browser cache, recursive DNS resolver, SYN/ACK handshake, HTTP GET request, and critical rendering path."
    },
    {
      text: "How does indexing work internally in databases using B-Trees vs Hash Indexes, and what is the trade-off of maintaining too many indexes on an insert-heavy table?",
      category: "technical",
      hints: "Explain tree node traversal, range queries, write penalty during inserts/updates, and memory overhead."
    },
    {
      text: "What are the trade-offs between JWT authentication and server-side session cookies in distributed multi-service systems?",
      category: "technical",
      hints: "Cover stateless verification, instant token revocation, CSRF vs XSS attack surfaces, and HttpOnly cookie attributes."
    },
    {
      text: "What is the difference between a Process and a Thread? How does inter-process communication (IPC) differ from multi-threaded shared memory?",
      category: "technical",
      hints: "Discuss memory isolation, context switching cost, race conditions, mutexes/semaphores, and socket/pipe IPC."
    },
    {
      text: "Explain how connection pooling functions in backend applications, and how you diagnose connection pool starvation under sudden traffic spikes.",
      category: "technical",
      hints: "Discuss pool sizing, connection acquisition timeouts, leak detection, database CPU usage, and circuit breaking."
    },
    {
      text: "Walk me through how the Two-Pointer and Sliding Window techniques optimize array and substring search problems from O(N^2) to linear O(N) time.",
      category: "technical",
      hints: "Discuss two sum on sorted arrays, maximum subarray sum (Kadane's algorithm), and maintaining window state."
    },
    {
      text: "What is the difference between synchronous and asynchronous code execution in Node.js? How does Node.js handle thousands of concurrent I/O operations on a single thread?",
      category: "technical",
      hints: "Explain libuv, thread pool for file/crypto ops, non-blocking network sockets, and callback queues."
    },
    {
      text: "How do you detect, handle, and prevent deadlocks in relational database management systems during high-concurrency transactions?",
      category: "technical",
      hints: "Discuss lock ordering, isolation levels, row-level locks, timeout configurations, and transaction retries."
    }
  ],
  behavioral: [
    {
      text: "Tell me about a time when you had to deliver a critical project under an unrealistic deadline. How did you prioritize tasks and communicate with stakeholders?",
      category: "behavioral",
      hints: "Structure your answer using the STAR method (Situation, Task, Action, Result). Highlight trade-offs made and measurable outcomes."
    },
    {
      text: "Describe a situation where you had a strong technical disagreement with a team member or senior engineer. How did you resolve it?",
      category: "behavioral",
      hints: "Focus on data-driven decision making, respectful communication, listening to alternative viewpoints, and committing to the final choice."
    },
    {
      text: "Give an example of a failure or mistake in a past academic or internship project. What caused it, how did you take ownership, and what did you learn?",
      category: "behavioral",
      hints: "Take genuine ownership without deflecting blame. Detail the post-mortem analysis and changes implemented."
    },
    {
      text: "Describe a scenario where you had to quickly learn an unfamiliar programming language, framework, or cloud tool to unblock a project milestone.",
      category: "behavioral",
      hints: "Detail your rapid learning strategy, prototyping, seeking guidance, and delivering the milestone on time."
    },
    {
      text: "Tell me about a time you noticed technical debt, a software bug, or a security vulnerability that was not assigned to you, and took the initiative to resolve it.",
      category: "behavioral",
      hints: "Explain how you quantified the risk, obtained stakeholder support, and safely tested and deployed the refactor."
    },
    {
      text: "Describe a time when you had to collaborate with a difficult teammate who was not contributing equally to a group project or hackathon.",
      category: "behavioral",
      hints: "Highlight empathy, private one-on-one communication, aligning on strengths, and ensuring project delivery."
    },
    {
      text: "Tell me about a situation where project requirements were abruptly changed midway through development. How did you adapt your architecture and schedule?",
      category: "behavioral",
      hints: "Discuss agile flexibility, modular code structure, proactive communication, and preventing scope creep."
    },
    {
      text: "Describe a time when you received constructive or critical feedback on your code during a review. How did you react and apply that feedback?",
      category: "behavioral",
      hints: "Show receptiveness, humility, separating personal identity from code quality, and implementing better standards."
    }
  ],
  hr: [
    {
      text: "To start our conversation, please tell me about yourself, your educational journey in software development, and the core technologies you love building with.",
      category: "hr",
      hints: "Deliver a crisp 90-second Present-Past-Future introduction. Focus on tech passions, key projects, and career enthusiasm."
    },
    {
      text: "Why do you want to join our company specifically, and how does this role align with your long-term career aspirations over the next 3 to 5 years?",
      category: "hr",
      hints: "Reference company-specific products or engineering culture. Connect your current skills with where you want to grow."
    },
    {
      text: "What are your greatest technical strengths, and what is one genuine area of weakness or technical skill you are actively working to improve right now?",
      category: "hr",
      hints: "Be authentic. Pair a real area of improvement with tangible actions you are already taking (courses, open source, side projects)."
    },
    {
      text: "Are you comfortable with relocation to different company development centers and working in rotational or night shift schedules if required?",
      category: "hr",
      hints: "Express adaptability, enthusiasm for new environments, and professional openness to team requirements."
    },
    {
      text: "Why should we hire you over other candidates who have similar academic qualifications and college degrees?",
      category: "hr",
      hints: "Highlight hands-on problem solving, self-starter curiosity, fast learning curve, and dedication to team goals."
    },
    {
      text: "Where do you realistically see yourself three to five years from now in terms of technical depth, domain expertise, and engineering responsibility?",
      category: "hr",
      hints: "Emphasize mastering production software systems, contributing to architectural decisions, and mentoring incoming juniors."
    },
    {
      text: "How do you stay updated with rapidly evolving technology trends, such as generative AI, new cloud architectures, or modern frameworks?",
      category: "hr",
      hints: "Mention newsletters, tech blogs, building proof-of-concept repositories, and participating in tech communities."
    },
    {
      text: "Describe a work environment or team culture where you feel most productive, challenged, and motivated to do your best engineering work.",
      category: "hr",
      hints: "Discuss psychological safety, collaborative code reviews, autonomy, clear product vision, and continuous learning."
    }
  ],
  mixed: [
    {
      text: "Welcome! To begin, please introduce yourself, walk me through your background, and highlight the most technically challenging project from your resume.",
      category: "hr",
      hints: "Keep the pitch to 2 minutes: background, key technologies used, problem solved, your specific contribution, and the impact."
    },
    {
      text: "In that project, what was the most difficult architectural bug, bottleneck, or edge-case you encountered, and how did you diagnose and resolve it?",
      category: "technical",
      hints: "Explain your debugging methodology, profiling tools used, metrics before and after optimization, and key takeaways."
    },
    {
      text: "If you had to re-architect that project today to handle 100 times higher user traffic, what parts of the system would break first and what would you redesign?",
      category: "system_design",
      hints: "Analyze database bottlenecks, caching layers, load balancing, stateless servers, and async processing."
    },
    {
      text: "Walk me through the database schema you designed for that project. How did you structure your tables or collections, and how did you ensure data consistency?",
      category: "technical",
      hints: "Discuss normalization vs denormalization, primary and foreign keys, transaction handling, and query performance."
    },
    {
      text: "Tell me about a situation during that project where team members disagreed on technical choices or deadlines were in jeopardy. How did you handle it?",
      category: "behavioral",
      hints: "Discuss agile flexibility, modular code structure, proactive communication, and preventing scope creep."
    },
    {
      text: "How did you ensure test coverage, code quality, and continuous integration before deploying that project to production or demonstration?",
      category: "technical",
      hints: "Discuss unit, integration, and E2E testing strategies, mock services, and automated CI/CD pipelines."
    },
    {
      text: "To conclude our conversation, what questions do you have for me about our engineering challenges, team culture, or tech stack?",
      category: "hr",
      hints: "Ask thoughtful questions about engineering roadmaps, testing standards, or junior onboarding and mentorship."
    }
  ],
  system_design: [
    {
      text: "How would you design a scalable URL shortener service like TinyURL that handles 100 million new URLs per month with sub-50 millisecond read latency?",
      category: "system_design",
      hints: "Cover API design, base62 encoding vs hashing, database schema (NoSQL vs SQL), caching hot URLs with Redis, and rate limiting."
    },
    {
      text: "Design a notification service that sends real-time push, SMS, and email notifications reliably without dropping messages during high-volume peak events.",
      category: "system_design",
      hints: "Discuss message brokers (Kafka/RabbitMQ), retry mechanisms, idempotency keys, third-party vendor fallbacks, and priority queues."
    },
    {
      text: "How would you design an inventory reservation system for an e-commerce flash sale that guarantees zero overselling under 50,000 concurrent requests per second?",
      category: "system_design",
      hints: "Discuss distributed locks (Redlock), atomic Redis counters (DECRBY), message queues, and eventual database reconciliation."
    },
    {
      text: "How would you design a distributed rate limiter that operates accurately across multiple application server instances in a cloud cluster?",
      category: "system_design",
      hints: "Compare token bucket vs sliding window log algorithms, centralized Redis vs local memory with sync, and race condition mitigations."
    },
    {
      text: "Design a real-time collaborative document editor like Google Docs or Notion. How do you handle simultaneous conflicting edits by multiple users?",
      category: "system_design",
      hints: "Discuss Operational Transformation (OT) vs Conflict-free Replicated Data Types (CRDTs), WebSockets, and state synchronization."
    },
    {
      text: "How would you design a distributed caching layer using Redis for a high-traffic social media feed? What cache invalidation and eviction policies would you use?",
      category: "system_design",
      hints: "Cover Cache-Aside vs Write-Through patterns, LRU/LFU eviction, cache stampede prevention via mutexes, and TTL strategies."
    }
  ],
  managerial: [
    {
      text: "Suppose you are leading a sprint and discover halfway through that a critical third-party dependency is deprecated and unstable. What actions do you take immediately?",
      category: "managerial",
      hints: "Cover risk assessment, immediate stakeholder communication, feasibility of alternatives, scope readjustment, and mitigation."
    },
    {
      text: "How do you handle a team scenario where one engineer consistently misses deadlines or delivers code with recurring regressions?",
      category: "managerial",
      hints: "Discuss private 1-on-1 feedback, identifying root causes (clarity, skill gap, personal), pairing/mentorship, and setting clear checkpoints."
    },
    {
      text: "How do you balance product managers pushing for rapid feature delivery against engineering needs for technical debt refactoring and test coverage?",
      category: "managerial",
      hints: "Explain how to quantify technical debt risk, allocate 20% capacity per sprint to debt, and align engineering health with product stability."
    },
    {
      text: "Walk me through how you would conduct an engineering post-mortem after a critical customer-facing outage caused by a flawed production deployment.",
      category: "managerial",
      hints: "Emphasize blameless culture, 5 Whys root cause analysis, timeline documentation, and actionable preventive engineering action items."
    }
  ]
};
