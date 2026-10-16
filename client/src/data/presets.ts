import { CompanyPreset, ExperienceLevel, InterviewType } from '../types';

export const COMPANY_PRESETS: CompanyPreset[] = [
  {
    id: 'tcs',
    name: 'Tata Consultancy Services (TCS)',
    category: 'Service Giant',
    tagline: 'TCS NQT, Digital & Prime Placement Rounds',
    code: 'TCS',
    logo: 'TCS',
    color: 'from-blue-600 to-indigo-800',
    popularRoles: ['Software Engineer', 'TCS Digital Associate', 'TCS Prime Architect', 'System Engineer'],
    focusAreas: ['Core Java / Python', 'DBMS & SQL', 'Data Structures & Algorithms', 'Operating Systems', 'Puzzles & Aptitude'],
    interviewStructure: ['NQT Online Assessment Review', 'Technical Round (OOPs, SQL, Coding)', 'Managerial / MR Round', 'HR Round']
  },
  {
    id: 'infosys',
    name: 'Infosys',
    category: 'Service Giant',
    tagline: 'Specialist Programmer (SP) & Digital Specialist Engineer (DSE)',
    code: 'INF',
    logo: 'INF',
    color: 'from-sky-600 to-blue-700',
    popularRoles: ['Specialist Programmer (SP)', 'Digital Specialist Engineer (DSE)', 'Systems Engineer'],
    focusAreas: ['Dynamic Programming', 'Graph Theory', 'OOPs in C++/Java', 'Database Design', 'SDLC & Agile'],
    interviewStructure: ['HackWithInfy / InfyTQ validation', 'Deep Technical Round', 'HR & Cultural Round']
  },
  {
    id: 'wipro',
    name: 'Wipro',
    category: 'Service Giant',
    tagline: 'Wipro Elite & Turbo National Talent Hunt',
    code: 'WIP',
    logo: 'WIP',
    color: 'from-teal-600 to-emerald-800',
    popularRoles: ['Project Engineer (Turbo)', 'Elite Associate', 'Cloud Developer'],
    focusAreas: ['Basic Data Structures', 'C/C++/Java basics', 'Web Technologies', 'Networking & Cloud Fundamentals'],
    interviewStructure: ['Coding Assessment Debrief', 'Technical + Project Discussion', 'HR Verification']
  },
  {
    id: 'flipkart',
    name: 'Flipkart',
    category: 'Product Unicorn',
    tagline: 'High-Concurrency E-Commerce Engineering',
    code: 'FK',
    logo: 'FK',
    color: 'from-yellow-500 to-amber-700',
    popularRoles: ['SDE-1 (Full Stack / Backend)', 'Data Platform Engineer', 'Mobile SDE'],
    focusAreas: ['Machine Coding (2 hours working code)', 'Low-Level Design (LLD)', 'Distributed Caching (Redis/Kafka)', 'STAR Behavioral'],
    interviewStructure: ['Machine Coding Round', 'Problem Solving & DSA Round', 'System Design Round', 'Hiring Manager (Cultural Fit)']
  },
  {
    id: 'swiggy',
    name: 'Swiggy',
    category: 'Product Unicorn',
    tagline: 'Hyperlocal Logistics & Real-Time Delivery Systems',
    code: 'SWG',
    logo: 'SWG',
    color: 'from-orange-500 to-red-600',
    popularRoles: ['Software Development Engineer I/II', 'Data Analyst', 'Frontend Engineer'],
    focusAreas: ['Real-time Geolocation systems', 'Event-Driven Architectures', 'Concurrency & Multithreading', 'Clean Code Principles'],
    interviewStructure: ['Online Coding Round', 'Data Structures & Algorithmic Problem Solving', 'Object-Oriented Design', 'Values & Leadership Round']
  },
  {
    id: 'zomato',
    name: 'Zomato',
    category: 'Product Unicorn',
    tagline: 'High-Throughput Consumer Scale Tech',
    code: 'ZOM',
    logo: 'ZOM',
    color: 'from-rose-600 to-red-700',
    popularRoles: ['SDE I (Backend / Web)', 'Growth Engineer', 'Product Analyst'],
    focusAreas: ['Fast Database Query Optimization', 'Scalable Microservices in Go/Node', 'Product Empathy', 'System Resiliency'],
    interviewStructure: ['Practical Live Coding', 'Architecture & Architecture Trade-offs', 'Culture & Founder Mindset']
  },
  {
    id: 'amazon',
    name: 'Amazon India',
    category: 'FAANG / MNC',
    tagline: '16 Leadership Principles & Bar Raiser Standard',
    code: 'AMZ',
    logo: 'AMZ',
    color: 'from-amber-600 to-yellow-800',
    popularRoles: ['SDE-1', 'SDE-2', 'Support Engineer', 'Quality Assurance Engineer (SDET)'],
    focusAreas: ['16 Leadership Principles (Customer Obsession, Ownership)', 'STAR Format Answers', 'DSA & Trees/Graphs', 'System Scalability'],
    interviewStructure: ['Online Assessment (Debugging + Coding)', 'Technical Round 1 (DSA + LPs)', 'Technical Round 2 (OOP + LPs)', 'Bar Raiser Round']
  },
  {
    id: 'google-msft',
    name: 'Google / Microsoft India',
    category: 'FAANG / MNC',
    tagline: 'Algorithmic Excellence & Large Scale Computing',
    code: 'MNC',
    logo: 'MNC',
    color: 'from-blue-700 to-purple-800',
    popularRoles: ['Software Engineer', 'Cloud Solution Architect', 'Applied AI Scientist'],
    focusAreas: ['Algorithmic Complexity & Big-O', 'Deep DSA (Tries, DP, Segment Trees)', 'System Scalability', 'Googleyness & Ambiguity'],
    interviewStructure: ['Screening Technical Round', '4x Onsite Virtual Rounds (DSA, System Design, Googleyness)']
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
      text: "How would you design a database schema and indexing strategy to handle high-frequency order placements during a flash sale without deadlocks?",
      category: "technical",
      hints: "Mention optimistic vs pessimistic locking, queuing with Redis/Kafka, read-write replicas, and database indexing."
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
      text: "Explain how connection pooling functions in backend applications, and how you diagnose connection pool starvation under sudden traffic spikes.",
      category: "technical",
      hints: "Discuss pool sizing, connection acquisition timeouts, leak detection, database CPU usage, and circuit breaking."
    },
    {
      text: "What are the trade-offs between JWT authentication and server-side session cookies in distributed multi-service systems?",
      category: "technical",
      hints: "Cover stateless verification, instant token revocation, CSRF vs XSS attack surfaces, and HttpOnly cookie attributes."
    },
    {
      text: "What is the difference between concurrency and parallelism? How does your primary backend runtime handle thread scheduling and memory safety?",
      category: "technical",
      hints: "Discuss thread pools, coroutines/event loop, race condition detection, atomic primitives, and memory garbage collection."
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
      text: "Give an example of a failure in a past project or production deployment. What caused the failure, and what concrete steps did you take to prevent it in the future?",
      category: "behavioral",
      hints: "Take genuine ownership without deflecting blame. Detail the post-mortem analysis and changes implemented."
    },
    {
      text: "Describe a scenario where you had to quickly learn an unfamiliar technology, library, or framework to unblock a project milestone.",
      category: "behavioral",
      hints: "Detail your rapid learning strategy, prototyping, seeking guidance, and delivering the milestone on time."
    },
    {
      text: "Tell me about a time you noticed technical debt or a security vulnerability that was not assigned to you, and took the initiative to resolve it.",
      category: "behavioral",
      hints: "Explain how you quantified the risk, obtained stakeholder support, and safely tested and deployed the refactor."
    }
  ],
  hr: [
    {
      text: "Why do you want to join our company specifically, and how does this role align with your long-term career aspirations over the next 3 to 5 years?",
      category: "hr",
      hints: "Reference company-specific products or engineering culture. Connect your current skills with where you want to grow."
    },
    {
      text: "What are your greatest technical strengths, and what is one area of technical skill you are actively working to improve right now?",
      category: "hr",
      hints: "Be authentic. Pair a real area of improvement with tangible actions you are already taking (courses, open source, side projects)."
    },
    {
      text: "How do you stay updated with rapidly evolving technology trends, such as generative AI, new cloud architectures, or framework updates?",
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
      text: "Tell me about yourself and walk me through the most technically challenging project you have built from your resume.",
      category: "hr",
      hints: "Keep the pitch to 2 minutes: background, key technologies used, problem solved, your specific contribution, and the impact."
    },
    {
      text: "In that project, what was the most difficult bug or architectural bottleneck you encountered, and how did you debug and optimize it?",
      category: "technical",
      hints: "Explain your debugging methodology, profiling tools used, metrics before and after optimization, and key takeaways."
    },
    {
      text: "If you had to rewrite that project today with 100x user traffic, what parts of the system would break first and what would you re-architect?",
      category: "system_design",
      hints: "Analyze database bottlenecks, caching layers, load balancing, stateless servers, and async processing."
    },
    {
      text: "Tell me about a situation during that project where project requirements suddenly changed mid-cycle. How did you adapt your architecture?",
      category: "behavioral",
      hints: "Discuss agile flexibility, modular code structure, proactive communication, and preventing scope creep."
    },
    {
      text: "How did you ensure test coverage, code quality, and continuous integration before deploying that project?",
      category: "technical",
      hints: "Discuss unit, integration, and E2E testing strategies, mock services, and automated CI/CD pipelines."
    }
  ],
  system_design: [
    {
      text: "How would you design a scalable URL shortener service like TinyURL that handles 100 million new URLs per month with low read latency?",
      category: "system_design",
      hints: "Cover API design, base62 encoding vs hashing, database schema (NoSQL vs SQL), caching hot URLs with Redis, and rate limiting."
    },
    {
      text: "Design a notification service that sends real-time push, SMS, and email notifications reliably without dropping messages during peak events.",
      category: "system_design",
      hints: "Discuss message brokers (Kafka/RabbitMQ), retry mechanisms, idempotency keys, third-party vendor fallbacks, and priority queues."
    },
    {
      text: "How would you design a distributed rate limiter that operates across multiple application server instances?",
      category: "system_design",
      hints: "Compare token bucket vs sliding window log algorithms, centralized Redis vs local memory with sync, and race condition mitigations."
    },
    {
      text: "Design a real-time collaborative document editor like Google Docs or Notion. How do you handle simultaneous edits by multiple users?",
      category: "system_design",
      hints: "Discuss Operational Transformation (OT) vs Conflict-free Replicated Data Types (CRDTs), WebSockets, and state synchronization."
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
      text: "How do you balance product managers pushing for rapid feature delivery against engineering needs for technical debt refactoring?",
      category: "managerial",
      hints: "Explain how to quantify technical debt risk, allocate 20% capacity per sprint to debt, and align engineering health with product stability."
    }
  ]
};
