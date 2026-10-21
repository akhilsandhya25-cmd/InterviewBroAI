/**
 * Structured Company Interview Tracks Catalog (Client Side)
 * 
 * NOTE & STATUS DISCLAIMER:
 * These company tracks represent general industry patterns, to be verified against real candidate
 * experiences and recent placement debriefs. They are educational simulation baselines, not guaranteed
 * facts. Specific recruitment drives (e.g. TCS Digital vs Ninja, Amazon SDE-1 campus vs off-campus)
 * frequently adjust round counts, question formats, and cutoff criteria.
 * 
 * TODO: Review and calibrate these patterns against real candidate interview experiences and 2025-2026
 * campus recruitment drive feedback.
 */

export interface CompanyTrack {
  id: string;
  companyName: string;
  category: 'Service Giant' | 'Product Unicorn' | 'FAANG / MNC' | 'Startup';
  tagline: string;
  status: 'General patterns, to be verified against real candidate experiences';
  todoReviewNote: string;
  typicalRoundStructure: string[];
  commonTopicAreas: string[];
  difficultyEmphasis: string;
  interviewStyle: string;
  exampleQuestionThemes: string[];
}

export const COMPANY_TRACKS: Record<string, CompanyTrack> = {
  tcs: {
    id: 'tcs',
    companyName: 'Tata Consultancy Services (TCS)',
    category: 'Service Giant',
    tagline: 'TCS NQT, Digital & Prime Placement Rounds',
    status: 'General patterns, to be verified against real candidate experiences',
    todoReviewNote: 'TODO: Review TCS Prime vs Digital vs Ninja cutoff criteria with recent candidate debriefs.',
    typicalRoundStructure: [
      'Round 1: TCS National Qualifier Test (NQT) - Cognitive & Advanced Coding assessment debrief',
      'Round 2: Technical Interview (OOPs 4 pillars, DBMS & SQL queries, basic DSA, project deep-dive)',
      'Round 3: Managerial Round (MR) (Problem-solving approach, project trade-offs, scenario adaptability, willingness to relocate)',
      'Round 4: HR Round (Communication verification, shift flexibility, service agreement, academic background)'
    ],
    commonTopicAreas: [
      'Core OOPs Concepts (Inheritance, Polymorphism, Encapsulation, Abstraction in Java/C++/Python)',
      'Relational Databases & SQL (Joins, Group By, Having, Normalization 1NF-3NF, Indexing basics)',
      'Linear Data Structures (Arrays, Strings, Linked Lists, Stack, Queue)',
      'Core CS Fundamentals (Operating System processes, threads, deadlocks, SDLC Agile models)',
      'Academic & Final-Year Project Architecture'
    ],
    difficultyEmphasis: 'Foundational to moderate. Prioritizes conceptual clarity, error-free basic coding, clean verbal explanation, and honest walkthrough of college projects over competitive programming tricks.',
    interviewStyle: 'Structured, formal, and polite. Rapid verification of textbook computer science fundamentals followed by questions on anything listed on the resume.',
    exampleQuestionThemes: [
      'Explain method overloading vs method overriding with a clean code snippet in your primary language.',
      'Write a SQL query to find the second highest salary in an employee table, and explain how the subquery executes.',
      'What are the ACID properties in database management systems, and why is atomicity critical in financial transactions?',
      'Walk me through the database schema and architecture of your college project. Why did you choose this technology stack?',
      'What is a deadlock in Operating Systems, and what are the four Coffman conditions necessary for deadlock to happen?'
    ]
  },

  infosys: {
    id: 'infosys',
    companyName: 'Infosys',
    category: 'Service Giant',
    tagline: 'Specialist Programmer (SP), Digital Specialist Engineer (DSE) & Systems Engineer',
    status: 'General patterns, to be verified against real candidate experiences',
    todoReviewNote: 'TODO: Calibrate HackWithInfy / InfyTQ problem distributions against real 2025/2026 student rounds.',
    typicalRoundStructure: [
      'Round 1: Online Coding Contest (HackWithInfy / InfyTQ / Coding Assessment for SP/DSE)',
      'Round 2: Technical Interview (Algorithmic problem solving, Dynamic Programming & Graphs for SP/DSE, OOPs, Database design)',
      'Round 3: HR & Cultural Fit Interview (Eagerness to upskill, communication clarity, situational judgment)'
    ],
    commonTopicAreas: [
      'Algorithmic Problem Solving (Dynamic Programming, Graph traversals, Binary Search trees for DSE/SP tracks)',
      'Object-Oriented Design & Clean Code in Java / C++ / Python',
      'Database Architecture (Transaction isolation levels, indexing, normalization)',
      'Data Structures (HashMaps, Balanced Trees, Recursion, Two-Pointers)',
      'Web & API Basics (REST endpoints, JSON processing, exception handling)'
    ],
    difficultyEmphasis: 'Tiered difficulty. Systems Engineer emphasizes clean fundamentals; Digital Specialist Engineer (DSE) and Specialist Programmer (SP) emphasize hard algorithmic problems (DP, Graphs, Trees).',
    interviewStyle: 'Code-first and analytical. Interviewers often inspect the logic submitted during the online test or ask candidates to write algorithms on a shared editor.',
    exampleQuestionThemes: [
      'How would you approach solving the 0/1 Knapsack problem? Walk me through the state transition equation and space optimization.',
      'Given a binary tree, how do you find the lowest common ancestor (LCA) of two given nodes without storing paths?',
      'Explain how indexing works internally in relational databases using B+ trees, and describe a situation where adding an index hurts write performance.',
      'What is the difference between an abstract class and an interface in Java, and when should you design an architecture using interfaces instead?',
      'Describe a complex bug you encountered while developing your project. What debugging steps and tools did you use to isolate the root cause?'
    ]
  },

  wipro: {
    id: 'wipro',
    companyName: 'Wipro',
    category: 'Service Giant',
    tagline: 'Wipro Elite & Turbo National Talent Hunt',
    status: 'General patterns, to be verified against real candidate experiences',
    todoReviewNote: 'TODO: Verify Wipro Elite National Talent Hunt verbal and technical interview rubric with campus reps.',
    typicalRoundStructure: [
      'Round 1: National Talent Hunt Online Assessment (Aptitude, Verbal, Coding & Written Communication)',
      'Round 2: Technical Interview (Programming fundamentals, Data Structures, Web concepts, Networking & OS)',
      'Round 3: HR Round (Career vision, relocation flexibility, communication and soft-skills review)'
    ],
    commonTopicAreas: [
      'Core Programming (Memory allocation, pointers/references, functions, arrays in C/C++/Java/Python)',
      'Networking & Internet Fundamentals (TCP/IP vs UDP, DNS lookup resolution, HTTP/HTTPS handshake)',
      'Operating System Basics (Virtual memory, paging, CPU scheduling algorithms, multi-threading)',
      'Basic Data Structures (Array rotation, string manipulation, linked list cycle detection, stack/queue)',
      'Cloud & Digital Transformation Concepts (Cloud service models IaaS/PaaS/SaaS, REST APIs)'
    ],
    difficultyEmphasis: 'Foundational. Emphasizes rock-solid basics, zero syntax mistakes on common operations, and a strong engineering attitude.',
    interviewStyle: 'Conversational and encouraging. Interviewers look for good problem breakdown skills, clear English communication, and enthusiasm for enterprise software delivery.',
    exampleQuestionThemes: [
      'What is the difference between TCP and UDP? In which real-world scenarios is UDP preferred over TCP?',
      'How does garbage collection work in modern managed runtimes, and what is the difference between the stack and the heap?',
      'Write an algorithm to reverse a singly linked list in-place with O(1) auxiliary space.',
      'Explain the difference between a process and a thread. How do threads communicate with one another within the same process?',
      'What are the primary differences between IaaS, PaaS, and SaaS cloud delivery models? Give practical enterprise examples of each.'
    ]
  },

  accenture: {
    id: 'accenture',
    companyName: 'Accenture',
    category: 'Service Giant',
    tagline: 'Advanced Associate Software Engineer (AASE) & Associate Software Engineer (ASE)',
    status: 'General patterns, to be verified against real candidate experiences',
    todoReviewNote: 'TODO: Review Accenture cognitive and technical assessment changes for recent graduate recruitment.',
    typicalRoundStructure: [
      'Round 1: Cognitive Assessment & Technical Assessment (Critical thinking, abstract reasoning, technical MCQs)',
      'Round 2: Coding Assessment (Algorithmic challenges in hands-on coding sandbox)',
      'Round 3: Technical & Project Interview (Resume deep-dive, enterprise frameworks, database operations, problem solving)',
      'Round 4: HR & Cultural Interview (Client communication scenario, collaboration, adaptability)'
    ],
    commonTopicAreas: [
      'Modern Web Frameworks & Microservices (React, Angular, Spring Boot, Node.js basics)',
      'Cloud Platforms & DevOps Fundamentals (AWS/Azure fundamentals, containerization with Docker, CI/CD pipelines)',
      'Relational Database Modeling & SQL Queries',
      'Data Structures & Algorithms (Searching, sorting, hash sets, two-pointer techniques)',
      'Enterprise Software Engineering Principles (Agile Scrum, unit testing, modular architecture)'
    ],
    difficultyEmphasis: 'Moderate practical engineering. Strong weightage on ability to deliver in enterprise client environments, modern full-stack awareness, and professional client-facing communication.',
    interviewStyle: 'Scenario-driven and project-centric. Interviewers examine real engineering scenarios, troubleshooting techniques, and team contributions.',
    exampleQuestionThemes: [
      'What are RESTful API best practices, and what is the semantic difference between HTTP PUT and HTTP PATCH?',
      'Explain synchronous vs asynchronous programming in modern applications. How does the event loop or thread pool handle I/O operations?',
      'If an enterprise client application is experiencing intermittent slow queries under peak traffic, how would you diagnose and resolve the bottleneck?',
      'Describe the role of Docker containers in modern deployment pipelines. How does containerization differ from traditional virtual machines?',
      'Walk me through a team conflict you experienced during a hackathon or group project. How did you resolve differences to meet the delivery deadline?'
    ]
  },

  swiggy: {
    id: 'swiggy',
    companyName: 'Swiggy',
    category: 'Product Unicorn',
    tagline: 'Hyperlocal Logistics, High Concurrency & Real-Time Delivery Systems',
    status: 'General patterns, to be verified against real candidate experiences',
    todoReviewNote: 'TODO: Verify Swiggy SDE-1 machine coding problem types and time allocations with recent hires.',
    typicalRoundStructure: [
      'Round 1: Online Coding Round (2-3 Algorithmic problems on HackerEarth / HackerRank)',
      'Round 2: Machine Coding Round (2 hours: live coding of a working, compilable module with clean OOP and unit tests)',
      'Round 3: Low-Level Design (LLD) & Data Structures (Concurrency, thread safety, design patterns, scalable data structures)',
      'Round 4: Hiring Manager / Culture & Values (Ownership, delivery velocity, post-incident RCA thinking)'
    ],
    commonTopicAreas: [
      'Machine Coding: SOLID principles, Factory, Strategy, Observer design patterns, clean separation of concerns',
      'Real-Time Event Architectures (Kafka, message queues, asynchronous workers, WebSockets)',
      'Concurrency & Thread Safety (Mutexes, race condition mitigation, thread-safe collections, optimistic vs pessimistic locks)',
      'Geospatial & Spatial Indexing (Geohash, QuadTrees, spatial distance algorithms)',
      'Data Structures: Heaps, Tries, HashMaps, Graph shortest paths (Dijkstra)'
    ],
    difficultyEmphasis: 'High practical and algorithmic bar. Expects working, clean, production-grade object-oriented code with clean abstractions, not just pseudocode.',
    interviewStyle: 'Rigorous engineering deep-dive. Fast-paced, expects modular code, clear discussion of architectural trade-offs, and handling of scale edge cases.',
    exampleQuestionThemes: [
      'Design a real-time order dispatch engine where delivery executives receive batched assignments. How do you prevent race conditions when multiple executives accept an order concurrently?',
      'Implement an in-memory caching system with LRU eviction and configurable TTL that is safe for concurrent access across multiple worker threads.',
      'How would you compute delivery rider ETA when traffic conditions change dynamically across road network nodes?',
      'Walk me through the design of an idempotent payment webhook receiver that protects against duplicate delivery order triggers.',
      'Tell me about an instance where you pushed code to production that broke a critical path. What was your immediate remediation and root cause analysis?'
    ]
  },

  zomato: {
    id: 'zomato',
    companyName: 'Zomato',
    category: 'Product Unicorn',
    tagline: 'High-Throughput Consumer Scale, Fast Delivery & Resilient Architecture',
    status: 'General patterns, to be verified against real candidate experiences',
    todoReviewNote: 'TODO: Review Zomato live coding format and low-level design expectations against real candidate rounds.',
    typicalRoundStructure: [
      'Round 1: Online Coding Round (Algorithmic problem solving and data structures)',
      'Round 2: Technical Round 1 - Problem Solving & DSA (Trees, Graphs, Heaps, String algorithms)',
      'Round 3: Technical Round 2 - Systems & Low-Level Design (Database design, Redis caching, Microservices, API latency optimization)',
      'Round 4: Engineering Director / Founder Mindset Round (Product intuition, high agency, performance under pressure)'
    ],
    commonTopicAreas: [
      'High-Throughput Web Systems (Go/Node.js microservices, asynchronous job queues)',
      'Database Query Optimization, Connection Pooling, Read Replicas & Sharding',
      'Distributed Caching Strategies (Cache-aside, Write-through, preventing cache stampedes/thundering herd)',
      'Data Structures: Sliding Windows, Two Pointers, Heaps, Dynamic Programming',
      'Product Engineering Mindset (Latency budgets, measuring user drop-off, graceful degradation)'
    ],
    difficultyEmphasis: 'High. Demands sharp DSA problem-solving combined with real-world understanding of high-concurrency consumer traffic spikes.',
    interviewStyle: 'Pragmatic, intense, product-focused. Questions often reflect actual challenges faced during high-volume events (e.g. New Year Eve order peaks).',
    exampleQuestionThemes: [
      'During a flash sale or festival evening, your search service experiences a 50x surge in requests. How do you design the caching and rate-limiting layer to keep p99 latency under 50ms?',
      'Design the database schema and indexing strategy for a restaurant reviews and ratings feature with millions of daily updates.',
      'Given a stream of real-time restaurant orders, find the top K trending dishes over the last 15-minute sliding window efficiently.',
      'Explain how you would handle database connection exhaustion when hundreds of concurrent microservices query a relational database.',
      'What does high agency mean to you as a software engineer? Describe a situation where you took initiative outside your assigned job scope.'
    ]
  },

  flipkart: {
    id: 'flipkart',
    companyName: 'Flipkart',
    category: 'Product Unicorn',
    tagline: 'High-Concurrency E-Commerce Engineering & Machine Coding Bar',
    status: 'General patterns, to be verified against real candidate experiences',
    todoReviewNote: 'TODO: Calibrate Flipkart Big Billion Days machine coding problem prompts with recent candidates.',
    typicalRoundStructure: [
      'Round 1: Machine Coding Round (90-120 minutes: Build an end-to-end working OOP console/API application with clean separation of layers and unit tests)',
      'Round 2: Problem Solving & DSA (Hard algorithms, Dynamic Programming, Graphs, Tries, Binary Search variants)',
      'Round 3: System Design / Low-Level Design (State machines, Schema design, Separation of Concerns, Extensibility)',
      'Round 4: Hiring Manager / Culture Fit (Leadership, grit, customer backward thinking, handling scale)'
    ],
    commonTopicAreas: [
      'Machine Coding: SOLID principles, design patterns, separation of controller/service/repository layers, error handling',
      'Advanced DSA: Graph traversals, Topological sort, Trie prefix trees, Segment Trees, Priority Queues',
      'Distributed Systems: Inventory locking, idempotent payment processing, eventual consistency',
      'Object-Oriented Design (Locker systems, Flash sale engines, Ride booking architectures)',
      'Resiliency Patterns (Circuit breakers, bulkheads, rate-limiting, retry with exponential backoff)'
    ],
    difficultyEmphasis: 'Very High. The Machine Coding round is a notorious filter where non-extensible code or unhandled edge cases lead to rejection.',
    interviewStyle: 'Systematic, demanding, code-first. Expects candidates to clarify requirements, state assumptions, write production-grade code, and demonstrate extensibility for future requirements.',
    exampleQuestionThemes: [
      'Design an in-memory Flash Sale inventory booking engine. Multiple users attempt to checkout the last available item. Code must be thread-safe, handle concurrency, and support pluggable discount strategies.',
      'Given a directed graph representing package distribution hubs, find the shortest path with at most K stops, analyzing time and space complexity.',
      'How do you guarantee that an order payment webhook from an external gateway is processed idempotently without double-crediting?',
      'Design an e-commerce shopping cart system that supports coupon codes with complex conditional rules (e.g. buy 2 get 1, category-specific caps).',
      'Tell me about a time when you had to deliver a feature under tight deadlines and had to make technical debt trade-offs. How did you document and remediate the debt?'
    ]
  },

  amazon: {
    id: 'amazon',
    companyName: 'Amazon India',
    category: 'FAANG / MNC',
    tagline: '16 Leadership Principles & Bar Raiser Standard',
    status: 'General patterns, to be verified against real candidate experiences',
    todoReviewNote: 'TODO: Review latest 2025/2026 Amazon Bar Raiser behavioral rubrics and online assessment formats.',
    typicalRoundStructure: [
      'Round 1: Online Assessment (Debugging assessment, 2 DSA coding problems, Work Styles behavioral assessment)',
      'Round 2: Technical Onsite 1 (DSA Problem Solving + 2 Amazon Leadership Principles probed with STAR stories)',
      'Round 3: Technical Onsite 2 (Data Structures & Object-Oriented Design + 2 Leadership Principles)',
      'Round 4: Technical Onsite 3 (Logical / System Design + 2 Leadership Principles)',
      'Round 5: Bar Raiser Round (Calibrated independent evaluator probing behavioral integrity, ownership, customer obsession, and high bar)'
    ],
    commonTopicAreas: [
      '16 Amazon Leadership Principles (Customer Obsession, Ownership, Bias for Action, Dive Deep, Earn Trust, Deliver Results, Invent and Simplify)',
      'STAR Format Answers (Situation, Task, Action, Result with quantifiable impact metrics)',
      'Data Structures: Trees, Heaps, BFS/DFS, Binary Search, Sliding Window, Two Pointers, Dynamic Programming',
      'Object-Oriented Design & System Design: Modular class diagrams, extensibility, high availability, CAP theorem',
      'Scalable Architecture: Load balancers, caching layers, database sharding, asynchronous decoupled services'
    ],
    difficultyEmphasis: 'High algorithmic bar combined with 50% weightage on behavioral Leadership Principles. Failure on LPs causes rejection even with perfect coding.',
    interviewStyle: 'Rigorous, calibrated, metric-driven. Every technical question is paired with deep behavioral probes: "Tell me about a time when you had a disagreement with a peer", "Tell me about a time you made a decision with incomplete data".',
    exampleQuestionThemes: [
      'Design an Amazon Locker package assignment algorithm that minimizes walk distance while accommodating varying parcel dimensions.',
      'Given a stream of customer search queries, design an autocomplete system that returns the top 5 most frequent matching suggestions in real-time.',
      'Tell me about a time when you took a calculated risk and failed. What did you learn and how did you pivot? (Leadership Principle: Bias for Action / Earn Trust).',
      'Describe a situation where you had to dive deep into a complex codebase to diagnose an obscure bug. What data did you look at? (Leadership Principle: Dive Deep).',
      'Design a distributed rate limiter that handles millions of customer requests per minute across multiple AWS regions.'
    ]
  },

  google: {
    id: 'google',
    companyName: 'Google India',
    category: 'FAANG / MNC',
    tagline: 'Algorithmic Excellence, Scalable Systems & Googleyness',
    status: 'General patterns, to be verified against real candidate experiences',
    todoReviewNote: 'TODO: Validate Google CoderPad whiteboard constraints and Googleyness question bank against real campus hiring.',
    typicalRoundStructure: [
      'Round 1: Technical Phone Screen / Screening Round (45 minutes: live coding in shared editor without IDE syntax completion)',
      'Round 2: Technical Onsite 1 (45 minutes: Deep Algorithmic Problem Solving & Big-O complexity analysis)',
      'Round 3: Technical Onsite 2 (45 minutes: Advanced DSA, edge case verification, optimal space/time bounds)',
      'Round 4: Technical Onsite 3 (45 minutes: Graph / Tree / DP / Combinatorics problem solving)',
      'Round 5: Googleyness & Leadership (45 minutes: Navigating ambiguity, ethical engineering, intellectual humility, collaborative communication)'
    ],
    commonTopicAreas: [
      'Mathematical & Algorithmic Foundations: Amortized complexity, Big-O proofs, Combinatorics',
      'Deep Data Structures: Tries, Segment Trees, Binary Indexed Trees, Disjoint Set Union (Union-Find), Directed Acyclic Graphs (DAG)',
      'Clean, minimal, bug-free code written from scratch without autocompletion or library shortcuts',
      'Googleyness: Navigating ambiguous requirements, intellectual humility, receptiveness to hints, constructive communication',
      'System Scalability: Distributed storage, consistent hashing, map-reduce concepts, consensus protocols'
    ],
    difficultyEmphasis: 'Very High. Zero tolerance for unoptimized O(N^2) approaches when O(N log N) or O(N) exists. Clean code and proactive communication are essential.',
    interviewStyle: 'Collaborative whiteboard problem solving. Interviewers present an intentionally ambiguous or underspecified problem and watch how the candidate clarifies constraints, brainstorms multiple approaches, analyzes trade-offs, and drives to optimal code.',
    exampleQuestionThemes: [
      'Design an algorithm to find the median of two sorted arrays of different sizes in O(log(min(m, n))) time complexity.',
      'Given a set of words, construct a sequence where each word differs from the previous by exactly one letter (Word Ladder problem). Optimize the search using Bidirectional BFS.',
      'How would you handle an engineering disagreement where your tech lead advocates for a design that you have benchmarked as having a severe scalability bottleneck? (Googleyness & Navigating Ambiguity).',
      'Implement an efficient data structure that supports insert, delete, getRandom in O(1) average time complexity.',
      'Given a graph of dependencies between software packages, detect cycles and return a valid build compilation order (Topological Sort with Kahn algorithm).'
    ]
  },

  microsoft: {
    id: 'microsoft',
    companyName: 'Microsoft India',
    category: 'FAANG / MNC',
    tagline: 'Engineering Craftsmanship, Cloud Scale & Growth Mindset',
    status: 'General patterns, to be verified against real candidate experiences',
    todoReviewNote: 'TODO: Verify Microsoft Codility coding patterns and Partner As-Appropriate (AA) interview rubric with alumni.',
    typicalRoundStructure: [
      'Round 1: Online Coding Assessment (Codility / Mettl: 3 coding problems with strict edge case tests)',
      'Round 2: Technical Round 1 (Problem Solving, Binary Trees, Linked Lists, Arrays, Recursion)',
      'Round 3: Technical Round 2 (Algorithms, Dynamic Programming, System Concepts, Memory Management)',
      'Round 4: Technical Round 3 (Low-Level Design / System Design / Code Quality & Scalability)',
      'Round 5: As-Appropriate (AA) / Partner Director Round (Cultural fit, growth mindset, technical passion, long-term vision)'
    ],
    commonTopicAreas: [
      'Core Data Structures: Trees (Binary Search Trees, AVL, Serialization/Deserialization), Linked Lists, Graphs',
      'System Internals & Memory: Pointers, references, memory leaks, multithreading, concurrency primitives',
      'Scalable Cloud Architecture: Microservices, Azure concepts, distributed cache, asynchronous message queues',
      'Growth Mindset: Microsoft core cultural attribute—learning from failures and embracing feedback',
      'Defensive Coding: Handling edge cases (null inputs, integer overflows, boundary conditions, cyclic references)'
    ],
    difficultyEmphasis: 'High. Balanced focus on clean algorithmic code, practical software engineering craftsmanship, and system reliability.',
    interviewStyle: 'Thorough, professional, and mentoring-oriented. Interviewers often drill into code correctness, testing edge cases, and memory efficiency.',
    exampleQuestionThemes: [
      'Serialize and deserialize a binary tree into a string format and reconstruct the identical tree structure efficiently.',
      'Implement an LRU Cache with O(1) get and put operations, explaining your choice of data structures and thread synchronization mechanism.',
      'Tell me about a technical project where you faced unexpected constraints. How did you demonstrate a Growth Mindset to overcome the blocker?',
      'Given an array of integers representing stock prices, find the maximum profit you can achieve with at most two transactions.',
      'Design a scalable distributed file synchronization service like OneDrive. How do you handle file chunking, delta sync, and network interruptions?'
    ]
  }
};

/**
 * Normalizes company queries and returns the matched CompanyTrack, or null if no track exists.
 */
export function getCompanyTrack(nameOrId?: string): CompanyTrack | null {
  if (!nameOrId || typeof nameOrId !== 'string') return null;
  const clean = nameOrId.trim().toLowerCase();

  // Direct ID check
  if (COMPANY_TRACKS[clean]) {
    return COMPANY_TRACKS[clean];
  }

  // Common substring / alias mappings
  if (clean.includes('tcs') || clean.includes('tata')) return COMPANY_TRACKS.tcs;
  if (clean.includes('infosys') || clean.includes('infy')) return COMPANY_TRACKS.infosys;
  if (clean.includes('wipro')) return COMPANY_TRACKS.wipro;
  if (clean.includes('accenture')) return COMPANY_TRACKS.accenture;
  if (clean.includes('swiggy')) return COMPANY_TRACKS.swiggy;
  if (clean.includes('zomato')) return COMPANY_TRACKS.zomato;
  if (clean.includes('flipkart')) return COMPANY_TRACKS.flipkart;
  if (clean.includes('amazon') || clean.includes('amz')) return COMPANY_TRACKS.amazon;
  if (clean.includes('google') || clean.includes('goog')) return COMPANY_TRACKS.google;
  if (clean.includes('microsoft') || clean.includes('msft')) return COMPANY_TRACKS.microsoft;

  return null;
}
