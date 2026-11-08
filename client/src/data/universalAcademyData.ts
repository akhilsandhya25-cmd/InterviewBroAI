/**
 * InterviewBro AI — Universal Student Expansion (Stage 5)
 * client/src/data/universalAcademyData.ts
 * 
 * Defines learning pathways and 8 additional specialized modules (Lessons 9 - 24):
 * - Intermediate Academy (MPC, BiPC, MEC, CEC, HEC, MBiPC, Vocational)
 * - Diploma & Polytechnic Academy (Applied Engineering & Lab Vivas)
 * - Undergraduate Academy (Academic Projects, Portfolios & GDs)
 * - Postgraduate Academy (Thesis Defense, Research & Leadership)
 * - Professional Degree Academy (Healthcare, Legal & Corporate Articleship)
 * - ITI & Vocational Academy (Trade Theory, Workshop Safety & Apprenticeships)
 * - Corporate & Technology Academy (System Design & Behavioral STAR Mastery)
 */

import { AcademyPathway, AcademyModule, AcademyPathwayId } from '../types/academy';

export const ACADEMY_PATHWAYS: AcademyPathway[] = [
  {
    id: 'foundation',
    title: 'Common Foundation',
    subtitle: 'Universal Interview Readiness for Every Student',
    description: 'Master first impressions, the self-introduction formula, spoken English clarity, body language, and post-interview etiquette.',
    iconName: 'Compass',
    badge: 'Universal Core',
    targetEducationLevels: ['intermediate', 'diploma_polytechnic', 'undergraduate', 'postgraduate', 'professional_degree', 'iti_vocational'],
    moduleIds: [
      'module-1-preparation',
      'module-2-entry-greeting',
      'module-3-tell-me-about-yourself',
      'module-4-common-hr-questions',
      'module-5-strengths-weaknesses-salary',
      'module-6-communication-body-language',
      'module-7-difficult-questions-curveballs',
      'module-8-asking-questions-ending'
    ]
  },
  {
    id: 'intermediate',
    title: 'Intermediate & Junior College',
    subtitle: 'MPC, BiPC, MEC, CEC, HEC & Vocational Students',
    description: 'Prepare for college admission vivas, articulate your favorite subjects, explore higher degree pathways, and build your first student resume.',
    iconName: 'GraduationCap',
    badge: '10+2 / Junior College',
    targetEducationLevels: ['intermediate'],
    moduleIds: [
      'module-inter-admissions',
      'module-inter-pathways'
    ]
  },
  {
    id: 'diploma',
    title: 'Diploma & Polytechnic',
    subtitle: 'Applied Engineering, Lab Vivas & Lateral Entry',
    description: 'Learn how to explain laboratory experiments, machinery blueprints, capstone projects, and ace NATS/NEAPS technician apprenticeship interviews.',
    iconName: 'Wrench',
    badge: 'Polytechnic',
    targetEducationLevels: ['diploma_polytechnic'],
    moduleIds: [
      'module-diploma-practical'
    ]
  },
  {
    id: 'undergraduate',
    title: 'Undergraduate Degrees',
    subtitle: 'Campus Placements, Internships & GD Mastery',
    description: 'Turn college capstones into interview assets, navigate group discussions (GDs), and secure competitive internships and placement offers.',
    iconName: 'BookOpen',
    badge: 'Bachelor Degrees',
    targetEducationLevels: ['undergraduate'],
    moduleIds: [
      'module-ug-placement'
    ]
  },
  {
    id: 'postgraduate',
    title: 'Postgraduate & Masters',
    subtitle: 'Thesis Defense, Specialist Roles & Strategy Cases',
    description: 'Defend your research dissertation, tackle management case frameworks, and present data-backed recommendations with executive composure.',
    iconName: 'Award',
    badge: 'Masters & MBA',
    targetEducationLevels: ['postgraduate'],
    moduleIds: [
      'module-pg-research'
    ]
  },
  {
    id: 'professional_degree',
    title: 'Professional Qualifications',
    subtitle: 'Healthcare Clinical Cases, Law & CA Articleship',
    description: 'Systematic clinical SOAP case presentations for MBBS/Nursing/Pharmacy, and IRAC legal advocacy & corporate audit trainee preparation.',
    iconName: 'Activity',
    badge: 'Clinical, Law & CA',
    targetEducationLevels: ['professional_degree'],
    moduleIds: [
      'module-prof-clinical-legal'
    ]
  },
  {
    id: 'iti_vocational',
    title: 'ITI & Vocational Trades',
    subtitle: 'Trade Theory, Tool Usage & Workshop Safety',
    description: 'Practical explanations for electrical wiring, fitting, machining, and strict workplace PPE safety compliance for railway and PSU jobs.',
    iconName: 'ShieldAlert',
    badge: 'ITI & Technical Trades',
    targetEducationLevels: ['iti_vocational'],
    moduleIds: [
      'module-iti-trade'
    ]
  },
  {
    id: 'corporate_tech',
    title: 'Corporate & Technology',
    subtitle: 'System Design Architecture & Advanced Behavioral STAR',
    description: 'Whiteboard scalable distributed systems, APIs, database trade-offs, and deliver high-stakes executive leadership stories.',
    iconName: 'Sparkles',
    badge: 'Tech & Product',
    targetEducationLevels: ['undergraduate', 'postgraduate'],
    moduleIds: [
      'module-corp-advanced'
    ]
  }
];

export const ACADEMY_EXPANSION_MODULES: AcademyModule[] = [
  // =========================================================================
  // MODULE 9: INTERMEDIATE ADMISSIONS & STREAM COMMUNICATION
  // =========================================================================
  {
    id: 'module-inter-admissions',
    order: 9,
    pathwayId: 'intermediate',
    title: 'College Admissions & Subject Communication',
    subtitle: 'Navigating Vivas & Articulating Intermediate Groups',
    description: 'Master college admission interviews, explain your choice of MPC, BiPC, MEC, CEC, HEC, or Vocational, and speak with academic clarity.',
    iconName: 'GraduationCap',
    category: 'Intermediate Prep',
    targetAudience: 'Intermediate (11th & 12th Grade) Students',
    lessons: [
      {
        id: 'lesson-inter-1',
        moduleId: 'module-inter-admissions',
        pathwayId: 'intermediate',
        number: 9,
        title: 'College Admission Interviews & Personal Statements',
        subtitle: 'Standing Out in Competitive Higher Education Selection Vivas',
        estimatedMinutes: 8,
        tags: ['Intermediate', 'College Admissions', 'Personal Statement', 'Viva', '10+2'],
        objective: 'Learn how to introduce yourself to admission panels, articulate your genuine academic interests, and explain why you deserve a seat in competitive undergraduate degree programs.',
        sections: [
          {
            id: 'inter1-s1',
            title: '1. What Admission Panels Actually Look For',
            content: `College admission interviews at top universities (central universities, private institutes, liberal arts colleges, and degree vivas) evaluate character, academic passion, and self-discipline rather than mechanical memorization:

1. **Curiosity Beyond Textbooks:** Do you read beyond standard syllabus guides? Have you explored science articles, business news, or literary works on your own?
2. **Resilience & Growth Mindset:** How do you react when you don't know the answer to a tricky conceptual problem?
3. **Clarity of Purpose:** Why this specific college and course rather than simply joining wherever your friends enrolled?
4. **Active Listening:** Answering what was asked directly rather than reciting memorized speeches.`,
            keyTakeaways: [
              'College admission panels prioritize curiosity and attitude over rote percentage memorization.',
              'Admitting you do not know a niche fact with polite humility is better than guessing wildly.',
              'Prepare 2 specific reasons why this particular college and department aligns with your learning goals.'
            ]
          },
          {
            id: 'inter1-s2',
            title: '2. The 3-Step Student Introduction Formula (A-P-A)',
            content: `When the panel asks: *"Tell us about yourself and why you applied to this degree,"* use the **A-P-A Formula**:

- **Academic Roots (A):** Where you completed your 10+2/Intermediate, your group (MPC, BiPC, MEC, etc.), and your core academic foundation.
- **Passionate Subject/Project (P):** One specific concept, laboratory experiment, debate topic, or school project that fascinated you.
- **Aspirational Goal (A):** How this degree connects to your immediate next phase of intellectual growth.`,
            keyTakeaways: [
              'Use the Academic Roots -> Passionate Project -> Aspirational Goal structure.',
              'Keep the introduction between 60 to 75 seconds.',
              'Avoid mentioning childhood hobbies unless directly tied to your academic passion.'
            ]
          },
          {
            id: 'inter1-s3',
            title: '3. Handling "What If You Don\'t Clear Entrance Exams?"',
            content: `Panels often test your emotional resilience with pressure questions:
- *"What will you do if your JEE / NEET / CUET score doesn't fetch your dream branch?"*
- *"Are you only applying here as a backup option?"*

**Winning Response Strategy:**
Acknowledge competitive reality without panic. Emphasize that while entrance exams test single-day ranking, your passion for the subject (e.g., mathematics, biosciences, economics) is enduring, and this degree provides a rigorous foundation regardless of entrance test volatility.`,
            keyTakeaways: [
              'Never badmouth entrance examinations or blame examiners.',
              'Reiterate commitment to the underlying field of study.',
              'Demonstrate maturity by having backup academic pathways in mind.'
            ]
          }
        ],
        examples: [
          {
            id: 'inter1-ex1',
            scenario: 'Admission Panel asks: "Why do you want to join our B.Sc Economics program after completing Intermediate MEC?"',
            badExample: {
              text: 'Sir, my parents told me that economics has good bank job opportunities. Also my marks were not enough for engineering so I thought economics is easy.',
              analysis: 'Passive, unmotivated, and frames the degree as an easy compromise based on family pressure.'
            },
            goodExample: {
              text: 'During my Intermediate MEC coursework, I was deeply intrigued by how fiscal policy and interest rate adjustments influence inflation and small business borrowing in India. When reading about the 1991 economic reforms, I realized I want to understand macroeconomic modeling rigorously. Your department\'s focus on applied econometrics and student research projects makes this the ideal environment for me to build quantitative analytical skills.',
              analysis: 'Demonstrates authentic curiosity, references specific curriculum areas (macro modeling, econometrics), and shows proactive interest.'
            },
            proTip: 'Connect a specific chapter from your 11th/12th syllabus to the college degree you are targeting.'
          }
        ],
        exercise: {
          id: 'ex-inter-1',
          title: 'Draft Your College Admission Statement',
          type: 'script_builder',
          instructions: 'Draft an authentic 60-second college admission self-introduction using the A-P-A Formula.',
          prompt: 'Write your: 1) Academic Roots (College & Group), 2) One specific topic or experiment that sparked your interest, 3) Why this specific degree program.',
          starterTemplate: 'Good morning respected professors. My name is... and I recently completed my Intermediate education in the... group from...\n\nDuring my studies, what truly captivated me was...\n\nI am applying for this program because...',
          evaluationRubric: [
            { criterion: 'Authenticity & Passion', idealTarget: 'Speaks genuinely about subject interest rather than repeating generic lines' },
            { criterion: 'Structured Progression', idealTarget: 'Transitions smoothly from Intermediate foundation to future degree goals' },
            { criterion: 'Humility & Respect', idealTarget: 'Maintains polite academic tone suitable for university faculty' }
          ]
        },
        quiz: [
          {
            id: 'q-inter1-1',
            question: 'What is the primary objective of a college admission interview panel?',
            conceptKey: 'Admission Objective',
            options: [
              { id: 'a', text: 'To test if you can recite the entire textbook from memory', isCorrect: false, explanation: 'Entrance exams test memorization; viva panels test curiosity and critical thinking.' },
              { id: 'b', text: 'To evaluate your genuine academic passion, discipline, and communication clarity', isCorrect: true, explanation: 'Panels want engaged learners who will contribute actively to the college community.' },
              { id: 'c', text: 'To verify if your parents are wealthy', isCorrect: false, explanation: 'Academic merit and student suitability are the focus of faculty interviews.' },
              { id: 'd', text: 'To ask trick questions and intentionally disqualify every candidate', isCorrect: false, explanation: 'Faculty panels want to discover promising students and assess potential.' }
            ]
          },
          {
            id: 'q-inter1-2',
            question: 'When asked about your academic background, what does the A-P-A formula stand for?',
            conceptKey: 'A-P-A Formula',
            options: [
              { id: 'a', text: 'Awards, Percentages, and Arguments', isCorrect: false, explanation: 'Incorrect formulation.' },
              { id: 'b', text: 'Academic Roots, Passionate Project/Subject, and Aspirational Goal', isCorrect: true, explanation: 'The A-P-A structure presents a clean, logical story from foundation to ambition.' },
              { id: 'c', text: 'Always Polite Answers', isCorrect: false, explanation: 'Manners are important, but A-P-A is a structured content methodology.' },
              { id: 'd', text: 'Admission, Payment, and Attendance', isCorrect: false, explanation: 'Incorrect formulation.' }
            ]
          },
          {
            id: 'q-inter1-3',
            question: 'How should an Intermediate student respond if asked a conceptual question they do not know?',
            conceptKey: 'Handling Unknown Concepts',
            options: [
              { id: 'a', text: 'Make up a confident-sounding lie and hope they don\'t notice', isCorrect: false, explanation: 'Faculty spot fabricated technical answers immediately, ruining credibility.' },
              { id: 'b', text: 'Politely state you have not covered that specific topic yet, but share what relevant related concept you do know', isCorrect: true, explanation: 'Honesty combined with intellectual curiosity leaves a favorable academic impression.' },
              { id: 'c', text: 'Remain completely silent and stare at the table for two minutes', isCorrect: false, explanation: 'Silence creates uncomfortable tension and indicates defeat.' },
              { id: 'd', text: 'Argue that the question is outside the syllabus and unfair', isCorrect: false, explanation: 'Defensiveness and arrogance are immediate red flags for admission panels.' }
            ]
          },
          {
            id: 'q-inter1-4',
            question: 'Why should you avoid stating that you chose a degree simply because "your parents told you to"?',
            conceptKey: 'Personal Agency',
            options: [
              { id: 'a', text: 'It shows lack of personal agency, maturity, and genuine intellectual motivation', isCorrect: true, explanation: 'Professors look for students with independent enthusiasm who will stick through tough coursework.' },
              { id: 'b', text: 'It is strictly forbidden by university rules', isCorrect: false, explanation: 'It is not a formal rule, but a major behavioral warning sign.' },
              { id: 'c', text: 'Panels always prefer students who hate their parents', isCorrect: false, explanation: 'Respect for family is fine, but personal purpose must be demonstrated.' },
              { id: 'd', text: 'Parents are not allowed to know what degree you pursue', isCorrect: false, explanation: 'Completely incorrect.' }
            ]
          }
        ]
      },
      {
        id: 'lesson-inter-2',
        moduleId: 'module-inter-admissions',
        pathwayId: 'intermediate',
        number: 10,
        title: 'Explaining Intermediate Groups & Academic Streams',
        subtitle: 'Articulating the Strengths of MPC, BiPC, MEC, CEC, HEC & Vocational Streams',
        estimatedMinutes: 8,
        tags: ['Intermediate', 'MPC', 'BiPC', 'MEC', 'CEC', 'HEC', 'Vocational'],
        objective: 'Learn how to articulate the unique foundational value of your specific Intermediate group and demonstrate conceptual mastery of your core subjects.',
        sections: [
          {
            id: 'inter2-s1',
            title: '1. Deconstructing Your Specific Intermediate Stream',
            content: `Each Intermediate group builds a unique cognitive mindset. When asked about your group, connect it to your thinking style:

- **MPC (Maths, Physics, Chemistry):** Analytical problem solving, spatial intuition, mathematical modeling, and logical deduction.
- **BiPC (Biology, Physics, Chemistry):** Living systems, biochemical pathways, empirical observation, and healthcare/life sciences aptitude.
- **MEC (Maths, Economics, Commerce):** Quantitative commerce, market dynamics, statistical modeling, and financial acumen.
- **CEC (Civics, Economics, Commerce):** Socio-economic governance, business law, constitutional fundamentals, and trade operations.
- **HEC (History, Economics, Civics):** Policy analysis, historical causation, governance, social research, and critical humanities thinking.
- **Vocational:** Direct hands-on trade skills, practical lab competency, and industrial readiness.`,
            keyTakeaways: [
              'Never apologize for your stream; every group develops valuable critical thinking capabilities.',
              'Link your group subjects together: e.g. how mathematics complements economics in MEC.',
              'Be prepared to answer 1-2 fundamental conceptual questions from your favorite subject.'
            ]
          },
          {
            id: 'inter2-s2',
            title: '2. Demonstrating Subject Mastery with Everyday Examples',
            content: `Examiners love asking: *"What was your favorite subject in Intermediate, and why?"*
To answer powerfully:
1. **Name the subject and chapter:** (e.g. Thermodynamics in Physics, Organic Reaction Mechanisms in Chemistry, Cell Division in Botany, National Income Accounting in Economics).
2. **Explain the underlying concept simply:** In your own plain English words without memorized textbook lines.
3. **Connect to real life:** E.g. how Bernoulli\'s principle explains airplane lift, or how opportunity cost affects consumer decisions.`,
            keyTakeaways: [
              'Pick a specific topic you genuinely enjoyed rather than a generic subject name.',
              'Using a real-world everyday observation proves conceptual understanding.',
              'Keep the explanation under 90 seconds to retain the panel\'s engagement.'
            ]
          }
        ],
        examples: [
          {
            id: 'inter2-ex1',
            scenario: 'Interviewer asks a BiPC student: "Why did you choose BiPC and what concept fascinated you most?"',
            badExample: {
              text: 'I took BiPC because my uncle is a doctor and told me to write NEET. My favorite topic is human anatomy because it gives easy marks in board exams.',
              analysis: 'Shows zero personal intellectual passion; focuses purely on marks and external pressure.'
            },
            goodExample: {
              text: 'I chose BiPC because I\'ve always been fascinated by microscopic cellular processes. Specifically, when we studied genetics and DNA replication in Botany, I was amazed by how cellular DNA polymerase acts as a biological proofreader with such high fidelity. Understanding that a single nucleotide mismatch can alter protein synthesis sparked my interest in molecular biology and pharmacy research.',
              analysis: 'Speaks with precision (DNA polymerase, proofreading fidelity, nucleotide mismatch), conveys genuine enthusiasm, and links theory to future research goals.'
            },
            proTip: 'Use accurate scientific terminology (e.g., enzyme names, economic laws) when describing your favorite topic.'
          }
        ],
        exercise: {
          id: 'ex-inter-2',
          title: 'Explain Your Favorite Subject in 60 Seconds',
          type: 'reflection',
          instructions: 'Pick one subject from your Intermediate course and explain why you enjoy it using a real-world example.',
          prompt: 'Write a 60-second explanation: 1) Subject & chapter name, 2) The core concept in simple terms, 3) An everyday example of this concept in action.',
          evaluationRubric: [
            { criterion: 'Conceptual Precision', idealTarget: 'Accurately explains the underlying principle' },
            { criterion: 'Everyday Relevance', idealTarget: 'Connects the concept to a tangible real-world observation' },
            { criterion: 'Clarity of Expression', idealTarget: 'Uses straightforward language without unnecessary jargon' }
          ]
        },
        quiz: [
          {
            id: 'q-inter2-1',
            question: 'When asked why you chose your Intermediate group, what is the best strategy?',
            conceptKey: 'Group Choice Articulation',
            options: [
              { id: 'a', text: 'Admit that your 10th marks forced you into this stream', isCorrect: false, explanation: 'Framing your education as a compromise diminishes your credibility.' },
              { id: 'b', text: 'State that you selected the easiest group to get a passing certificate', isCorrect: false, explanation: 'Academic interviewers look for curiosity and dedication, not the easiest path.' },
              { id: 'c', text: 'Highlight your natural interest in those subjects and how they prepare you for your degree goals', isCorrect: true, explanation: 'Presenting your stream as an intentional choice shows maturity and purpose.' },
              { id: 'd', text: 'Tell the panel that your friends recommended it because there were no exams', isCorrect: false, explanation: 'Shows poor independence and lack of seriousness.' }
            ]
          },
          {
            id: 'q-inter2-2',
            question: 'Why is it effective to include a real-world example when talking about your favorite subject?',
            conceptKey: 'Real-World Concept Demonstration',
            options: [
              { id: 'a', text: 'It proves you understand how the theory functions outside of a textbook', isCorrect: true, explanation: 'Connecting theory to everyday observations demonstrates genuine conceptual mastery.' },
              { id: 'b', text: 'It wastes interview time so they ask fewer questions', isCorrect: false, explanation: 'Panels appreciate concise, insightful answers, not stalling.' },
              { id: 'c', text: 'It shows you memorized the entire guide book', isCorrect: false, explanation: 'Examiners want original thinking, not rote guide book lines.' },
              { id: 'd', text: 'It is required by university law', isCorrect: false, explanation: 'There is no such legal requirement; it is a communication best practice.' }
            ]
          },
          {
            id: 'q-inter2-3',
            question: 'How should an Intermediate CEC or HEC student respond if asked about the practical value of humanities?',
            conceptKey: 'Humanities Value Proposition',
            options: [
              { id: 'a', text: 'Apologize and agree that humanities subjects have no practical value', isCorrect: false, explanation: 'Never demean your field of study; own its value proudly.' },
              { id: 'b', text: 'Explain how commerce, civics, and history build essential skills in governance, legal analysis, policy formulation, and societal leadership', isCorrect: true, explanation: 'Clear reasoning demonstrates pride and understanding of liberal arts and commerce value.' },
              { id: 'c', text: 'Claim that humanities is secretly better than all sciences and mock STEM fields', isCorrect: false, explanation: 'Arrogance and dismissive attitudes alienate academic interviewers.' },
              { id: 'd', text: 'Say that you only chose it because you dislike math', isCorrect: false, explanation: 'Negative justifications highlight weaknesses rather than strengths.' }
            ]
          },
          {
            id: 'q-inter2-4',
            question: 'What is the ideal way to explain a low mark or difficult chapter in your Intermediate record?',
            conceptKey: 'Addressing Academic Difficulties',
            options: [
              { id: 'a', text: 'Acknowledge the conceptual challenge and explain the specific steps you took to improve your understanding', isCorrect: true, explanation: 'Shows self-awareness, accountability, and proactive learning habits.' },
              { id: 'b', text: 'Blame the board examiner for correcting your paper harshly', isCorrect: false, explanation: 'Blaming evaluators reflects poorly on candidate maturity.' },
              { id: 'c', text: 'Pretend the mark sheet has a typographical error from the university', isCorrect: false, explanation: 'Dishonesty leads to instant rejection.' },
              { id: 'd', text: 'Claim you deliberately failed to focus on other subjects', isCorrect: false, explanation: 'Sounds implausible and irresponsible.' }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MODULE 10: INTERMEDIATE CAREER PATHWAYS & STUDENT RESUME
  // =========================================================================
  {
    id: 'module-inter-pathways',
    order: 10,
    pathwayId: 'intermediate',
    title: 'Career Pathways & First Student Resume',
    subtitle: 'Exploring Degree Options & Building a Clean Profile',
    description: 'Explore undergraduate degree options, understand internships vs apprenticeships, and build your very first student resume without work experience.',
    iconName: 'Compass',
    category: 'Intermediate Prep',
    targetAudience: 'Intermediate Students Preparing for College Transitions',
    lessons: [
      {
        id: 'lesson-inter-3',
        moduleId: 'module-inter-pathways',
        pathwayId: 'intermediate',
        number: 11,
        title: 'Career Exploration & Higher Education Pathways',
        subtitle: 'Mapping Intermediate Streams to Degree Horizons & Professional Trajectories',
        estimatedMinutes: 8,
        tags: ['Intermediate', 'Career Pathways', 'Undergraduate Degrees', 'Higher Education'],
        objective: 'Understand the wide spectrum of degree pathways open to your Intermediate group—beyond standard conventional paths—and articulate realistic 3-to-5-year academic goals.',
        sections: [
          {
            id: 'inter3-s1',
            title: '1. Horizon Mapping: Degrees Beyond the Obvious',
            content: `Many 12th-grade students assume only 1 or 2 degree paths exist. Modern higher education offers diverse, lucrative options:

- **From MPC:** B.Tech / B.E., B.Arch, Integrated M.Sc (Physics/Maths), Data Science, Merchant Navy, Defense (NDA), Commercial Aviation, Industrial Design.
- **From BiPC:** MBBS / BDS, B.Pharm, B.Sc Nursing, Biotechnology, Agricultural Sciences, Forensic Science, Food Technology, Physiotherapy (BPT), Veterinary Science.
- **From MEC / CEC:** B.Com (Honours), BBA / BMS, CA / CS / CMA foundation, B.A. Economics, Actuarial Science, Corporate Law (5-Year BA LLB), Hotel Management.
- **From HEC:** Civil Services preparation, Journalism & Mass Communication, Public Policy, Social Work, International Relations, Law, Archaeology.`,
            keyTakeaways: [
              'Do not restrict your horizon to just 1 conventional degree.',
              'Interdisciplinary combinations (e.g. Economics + Data Science, Law + Technology) are in high demand.',
              'Interviewers respect students who explore multiple relevant pathways thoughtfully.'
            ]
          },
          {
            id: 'inter3-s2',
            title: '2. Articulating a 5-Year Academic Vision',
            content: `When asked: *"Where do you see yourself in 5 years?"* as an Intermediate student:
- **Do not say:** *"I want to be a billionaire CEO with a luxury sports car."* (Immature).
- **Do not say:** *"I have no idea, whatever my college decides."* (Passive).
- **Instead say:** *"In five years, I aim to have completed my bachelor degree with strong practical research projects, completed at least two relevant internships, and either be stepping into an entry-level analyst role or preparing for specialized postgraduate studies."*`,
            keyTakeaways: [
              'Focus your 5-year vision on degree completion and skill building.',
              'Mention practical internships as milestones during your college years.',
              'Demonstrate humility: acknowledge that learning is your top priority.'
            ]
          }
        ],
        examples: [
          {
            id: 'inter3-ex1',
            scenario: 'Interviewer asks: "Where do you see yourself in 5 years?"',
            badExample: {
              text: 'Sir, in five years I want to earn 50 lakhs per year and be the CEO of my own startup company in America.',
              analysis: 'Unrealistic, arrogant, and detached from practical educational steps.'
            },
            goodExample: {
              text: 'In five years, I see myself having completed my bachelor degree in Economics with distinction. By that time, I aim to have completed at least two practical research internships and either be working as an economic research analyst or pursuing my master degree in public policy.',
              analysis: 'Structured, humble, realistic, and focused on educational milestones.'
            },
            proTip: 'Acknowledge that learning and skill-building are your top priorities for the next five years.'
          }
        ],
        exercise: {
          id: 'ex-inter-3',
          title: 'Draft Your 5-Year Academic & Career Vision',
          type: 'script_builder',
          instructions: 'Write a grounded, realistic 5-year educational goal statement.',
          prompt: 'Outline your 5-year timeline: 1) Target undergraduate degree, 2) One practical skill or internship you want to pursue during college, 3) Where you want to begin your career.',
          starterTemplate: 'Five years from now, my primary goal is to have completed my degree in...\n\nDuring my college years, I plan to develop practical skills in...\n\nThis will prepare me to step into...',
          evaluationRubric: [
            { criterion: 'Realistic Sequencing', idealTarget: 'Follows degree -> skill -> entry-level career progression' },
            { criterion: 'Humility & Growth Mindset', idealTarget: 'Emphasizes learning and practical experience' }
          ]
        },
        quiz: [
          {
            id: 'q-inter3-1',
            question: 'What is the most effective approach for an Intermediate student answering "Where do you see yourself in 5 years?"',
            conceptKey: '5-Year Vision',
            options: [
              { id: 'a', text: 'Boasting about becoming a millionaire CEO immediately', isCorrect: false, explanation: 'Sounds unrealistic and shows a lack of understanding of the educational path.' },
              { id: 'b', text: 'Outlining your degree completion, practical skill development, and entry-level career step', isCorrect: true, explanation: 'Demonstrates a thoughtful, mature understanding of the timeline ahead.' },
              { id: 'c', text: 'Saying you have no idea and live only day-to-day', isCorrect: false, explanation: 'Shows complete lack of ambition and planning.' },
              { id: 'd', text: 'Stating you will only do whatever your parents decide for you', isCorrect: false, explanation: 'Lacks personal initiative and agency.' }
            ]
          },
          {
            id: 'q-inter3-2',
            question: 'Which of the following represents an interdisciplinary career pathway from an Intermediate background?',
            conceptKey: 'Interdisciplinary Horizons',
            options: [
              { id: 'a', text: 'Combining Commerce with Data Science or Computer Applications for financial analytics', isCorrect: true, explanation: 'Combining quantitative analytical skills with commerce creates high-demand career horizons.' },
              { id: 'b', text: 'Quitting studies completely without any qualification', isCorrect: false, explanation: 'Not an academic pathway.' },
              { id: 'c', text: 'Memorizing dictionary words without understanding their meaning', isCorrect: false, explanation: 'Rote work without practical context does not build a career.' },
              { id: 'd', text: 'Writing board exams repeatedly for ten years', isCorrect: false, explanation: 'Pointless stagnation.' }
            ]
          },
          {
            id: 'q-inter3-3',
            question: 'Why is pursuing internships during undergraduate college highly recommended?',
            conceptKey: 'Value of College Internships',
            options: [
              { id: 'a', text: 'They bridge the gap between classroom theory and real workplace execution', isCorrect: true, explanation: 'Internships allow students to test concepts on real problems and build verifiable resumes.' },
              { id: 'b', text: 'They are required in order to get a passport', isCorrect: false, explanation: 'Passports have no connection to college internships.' },
              { id: 'c', text: 'They exempt you from taking final exams in college', isCorrect: false, explanation: 'Internships complement coursework; they do not replace required degree examinations.' },
              { id: 'd', text: 'They guarantee you never have to prepare for an interview again', isCorrect: false, explanation: 'Interviews are required throughout your entire career.' }
            ]
          },
          {
            id: 'q-inter3-4',
            question: 'If an admission panel asks why you picked their institution over a higher-ranked university, how should you answer?',
            conceptKey: 'Institutional Alignment',
            options: [
              { id: 'a', text: 'Highlight specific faculty, lab facilities, or curriculum specializations that suit your personal goals', isCorrect: true, explanation: 'Shows you did actual research on the institution and value substance over mere brand rankings.' },
              { id: 'b', text: 'Say that the other university was too far for you to wake up in the morning', isCorrect: false, explanation: 'Shows laziness and trivial priorities.' },
              { id: 'c', text: 'Claim that all other universities are corrupt and terrible', isCorrect: false, explanation: 'Disparaging other institutions reflects very poorly on character.' },
              { id: 'd', text: 'Admit that the higher-ranked university rejected you yesterday', isCorrect: false, explanation: 'Framing your choice as a forced second choice undermines your enthusiasm.' }
            ]
          }
        ]
      },
      {
        id: 'lesson-inter-4',
        moduleId: 'module-inter-pathways',
        pathwayId: 'intermediate',
        number: 12,
        title: 'Building Your First Student Resume & Profile',
        subtitle: 'Crafting a Clean, Compelling CV with Zero Prior Work Experience',
        estimatedMinutes: 9,
        tags: ['Intermediate', 'Resume Building', 'Student CV', 'First Resume'],
        objective: 'Build an authentic, high-impact student resume highlighting 10th and 12th academic coursework, science fair projects, school competitions, community volunteering, and extracurricular achievements.',
        sections: [
          {
            id: 'inter4-s1',
            title: '1. What Belongs on a School/Junior College Student Resume?',
            content: `When you have no formal employment history, your resume is an **Academic & Activities Profile**:

1. **Header:** Full Name, Professional Email (e.g. 'firstname.lastname@gmail.com'), Mobile Number, City & State. (No full home address or photos needed).
2. **Education Section (Top Priority):**
   - Intermediate / +2: Junior College Name, Board (State Board / CBSE / ISC), Stream (MPC/BiPC/CEC/etc.), Year of Completion, Percentage or GPA.
   - 10th Standard: School Name, Board, Year, Percentage or CGPA.
3. **Academic Projects & Practical Work:** Science exhibition models, commerce trade fair stalls, essay competitions, or laboratory demonstrations.
4. **Skills & Tools:** Basic computer literacy (MS Word, Excel, PowerPoint), typing speed, spoken languages.
5. **Extracurricular & Leadership:** Sports teams, NCC, NSS, scout/guides, school prefect, cultural fest organizing, debate clubs.`,
            keyTakeaways: [
              'Keep a student resume strictly to 1 clean single page.',
              'Use a clean professional font like Inter, Calibri, or Arial.',
              'Highlight extracurricular activities that prove teamwork, punctuality, and leadership.'
            ]
          },
          {
            id: 'inter4-s2',
            title: '2. Fatal Mistakes on First Student Resumes',
            content: `Avoid these common errors that cause immediate rejection:
- **Unprofessional Email IDs:** Addresses like 'rockstar.rahul99@yahoo.com' or 'angel.priya@gmail.com'. Create a clean email with your real name.
- **Copy-Pasted Objectives:** Generic lines like *"Seeking a challenging position in a prestigious organization..."* (You are a 17-year-old student applying for college or an entry internship!). Replace with an authentic objective.
- **Spelling Errors in Subject Names:** Double check terms like *"Mathematics"*, *"Economics"*, *"Accountancy"*, and *"Laboratory"*.
- **Submitting Word (.docx) Files Instead of PDF:** Always export and submit a neat, locked PDF file.`,
            keyTakeaways: [
              'Use a professional name-based email address.',
              'Always save and submit resumes in PDF format to preserve formatting.',
              'Triple-check spelling of academic subjects and school names.'
            ]
          }
        ],
        examples: [
          {
            id: 'inter4-ex1',
            scenario: 'Student Objective Statement on Resume',
            badExample: {
              text: 'OBJECTIVE: Looking for a dynamic career in a reputed MNC company where I can utilize my innovative skills and leadership qualities to enhance corporate profitability and shareholder value.',
              analysis: 'Absurd corporate template copied from the internet; completely unsuitable for a 12th-grade student.'
            },
            goodExample: {
              text: 'ACADEMIC OBJECTIVE: Motivated Intermediate (MPC) student with a strong foundation in mathematics and physics, seeking admission to a Bachelor of Science program. Eager to contribute disciplined analytical skills and active participation to university research societies.',
              analysis: 'Honest, accurate, respectful, and appropriately calibrated to the student\'s true stage of life.'
            },
            proTip: 'Never copy-paste resume objectives from corporate templates—authenticity stands out.'
          }
        ],
        exercise: {
          id: 'ex-inter-4',
          title: 'Draft Your Student Resume Objective & Education Block',
          type: 'checklist',
          instructions: 'Draft the top half of your student resume.',
          prompt: 'Write your: 1) Professional contact header, 2) Authentic student objective, 3) Formatted education table for 10th and Intermediate.',
          evaluationRubric: [
            { criterion: 'Professionalism', idealTarget: 'Clean contact info and name-based email' },
            { criterion: 'Accurate Information', idealTarget: 'Accurate board names, years, and stream titles' }
          ]
        },
        quiz: [
          {
            id: 'q-inter4-1',
            question: 'What is the recommended maximum page length for an Intermediate / student resume?',
            conceptKey: 'Resume Length',
            options: [
              { id: 'a', text: 'Strictly 1 single clean page', isCorrect: true, explanation: 'A student with no multi-year career history should never exceed one well-formatted page.' },
              { id: 'b', text: 'At least 3 pages to prove you studied hard', isCorrect: false, explanation: 'Multi-page resumes for high school students contain fluff and get disregarded.' },
              { id: 'c', text: '5 pages with copies of all certificates attached inside the text', isCorrect: false, explanation: 'Certificates are brought in a physical folder, never pasted inside a resume.' },
              { id: 'd', text: 'A single sentence on WhatsApp', isCorrect: false, explanation: 'A formal resume requires structured formatting.' }
            ]
          },
          {
            id: 'q-inter4-2',
            question: 'Why should you always submit your resume as a PDF rather than a Word (.docx) document?',
            conceptKey: 'File Format',
            options: [
              { id: 'a', text: 'PDFs prevent formatting shifts and display identically across all phones and computers', isCorrect: true, explanation: 'Word documents often shift margins and fonts on recruiters\' screens; PDFs remain locked.' },
              { id: 'b', text: 'PDFs are required by the Indian Constitution', isCorrect: false, explanation: 'It is a digital document standard, not a constitutional requirement.' },
              { id: 'c', text: 'Word files cannot be sent via email', isCorrect: false, explanation: 'Word files can be sent, but their layout easily breaks.' },
              { id: 'd', text: 'PDF files make you look like a software coder', isCorrect: false, explanation: 'PDF is the universal standard for all professions.' }
            ]
          },
          {
            id: 'q-inter4-3',
            question: 'Which of the following email addresses is appropriate to place on a student resume?',
            conceptKey: 'Professional Contact Details',
            options: [
              { id: 'a', text: 'cool_surya_mass2006@gmail.com', isCorrect: false, explanation: 'Unprofessional nicknames create an immature impression.' },
              { id: 'b', text: 'surya.narayan.edu@gmail.com', isCorrect: true, explanation: 'A clean, first-and-last-name email conveys immediate professional readiness.' },
              { id: 'c', text: 'gamer_boy_priya@yahoo.com', isCorrect: false, explanation: 'Gaming handles are unsuitable for formal academic applications.' },
              { id: 'd', text: 'donotreply_anonymous@hotmail.com', isCorrect: false, explanation: 'Admissions and employers must be able to reach you directly.' }
            ]
          },
          {
            id: 'q-inter4-4',
            question: 'How should extracurricular activities (like sports or NCC) be framed on a student resume?',
            conceptKey: 'Extracurricular Framing',
            options: [
              { id: 'a', text: 'Highlight transferable virtues like teamwork, discipline, punctuality, and leadership', isCorrect: true, explanation: 'Panels value extracurriculars because they demonstrate reliable character and collaborative habits.' },
              { id: 'b', text: 'Boast that sports are more important than academics and you never study', isCorrect: false, explanation: 'Academic interviewers look for balance and commitment to learning.' },
              { id: 'c', text: 'Leave them off completely because only marks matter', isCorrect: false, explanation: 'Well-rounded students who participate in community activities stand out positively.' },
              { id: 'd', text: 'List 50 computer video games you have finished', isCorrect: false, explanation: 'Video game hobby records do not substitute for formal extracurricular activities.' }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MODULE 11: DIPLOMA & POLYTECHNIC PRACTICAL VIVA & APPRENTICESHIPS
  // =========================================================================
  {
    id: 'module-diploma-practical',
    order: 11,
    pathwayId: 'diploma',
    title: 'Applied Engineering, Lab Vivas & Lateral Entry',
    subtitle: 'Practical Project Presentations & Technician Apprenticeships',
    description: 'Learn how to clearly explain laboratory experiments, machinery blueprints, diploma capstone projects, and ace NATS/NEAPS technician apprenticeship interviews.',
    iconName: 'Wrench',
    category: 'Applied Engineering',
    targetAudience: 'Polytechnic & Diploma Engineering Students',
    lessons: [
      {
        id: 'lesson-diploma-1',
        moduleId: 'module-diploma-practical',
        pathwayId: 'diploma',
        number: 13,
        title: 'Acing Practical Lab & Workshop Vivas',
        subtitle: 'Explaining Experiments, Blueprints, and Technical Projects with Confidence',
        estimatedMinutes: 9,
        tags: ['Diploma', 'Polytechnic', 'Practical Viva', 'Lab Experiments', 'Engineering'],
        objective: 'Learn how to explain engineering drawings, circuit schematics, lab machinery setups, and your final diploma project to external examiners with technical precision.',
        sections: [
          {
            id: 'dip1-s1',
            title: '1. What External Examiners Evaluate in a Practical Viva',
            content: `In polytechnic examinations, external examiners evaluate whether you genuinely operated the machinery or merely copied observation tables from your classmates:

1. **Principle of Operation:** E.g. In an electrical lab, can you explain the principle of a 3-phase induction motor or transformer without reading notes?
2. **Component Identification:** Pointing to physical components (commutator, slip rings, manometer, lathe tool post, breadboard ICs) and describing their specific function.
3. **Safety & Calibration Pre-Checks:** Did you check the zero error on the dial gauge? Did you ensure earthing was connected before powering on?
4. **Calculations & Error Analysis:** Explaining why experimental readings differ slightly from theoretical calculations due to friction, resistance, or line losses.`,
            keyTakeaways: [
              'Examiners test hands-on physical familiarity, not just formula memorization.',
              'Always mention safety precautions taken before turning on any equipment.',
              'Explain experimental error with sound engineering logic (friction, voltage drop, instrument tolerance).'
            ]
          },
          {
            id: 'dip1-s2',
            title: '2. Deconstructing Your Diploma Capstone Project',
            content: `When presenting your final year diploma project, use the 4-part **E-P-D-O Framework**:
- **Engineering Need (E):** What real-world problem does the project address? (e.g. Automated irrigation pump controller, pneumatic sheet metal punch).
- **Process & Blueprint (P):** Walk through the circuit schematic or CAD drawing.
- **Demonstration & Fabrication (D):** What materials did you cut, wire, solder, or code? What challenges arose during fabrication?
- **Outcome & Efficiency (O):** What was the tested result? (e.g. *"Operated within 5% tolerance under continuous 2-hour testing."*)`,
            keyTakeaways: [
              'Use the E-P-D-O framework to give a crisp, structured project walkthrough.',
              'Highlight the physical fabrication and troubleshooting you did with your own hands.',
              'State your specific individual contribution within the group project.'
            ]
          }
        ],
        examples: [
          {
            id: 'dip1-ex1',
            scenario: 'External Examiner asks: "Walk me through your diploma project circuit and why you chose this relay module."',
            badExample: {
              text: 'Sir, this is our project for automatic water pump. My friend purchased the circuit from market and we connected the wires. It worked yesterday but today voltage is problem.',
              analysis: 'Reveals that the project was outsourced and the student cannot explain the circuit components or failure mode.'
            },
            goodExample: {
              text: 'Our project is an automatic water level controller designed for agricultural borewells. We selected a 12-volt electromagnetic relay with optocoupler isolation to protect our microcontroller from inductive voltage spikes when the 1-horsepower motor switches off. During initial breadboard testing, we faced contact chattering, which we resolved by adding a freewheeling diode across the relay coil. In our final lab trial, the pump cut off automatically within two seconds of the overhead sensor reaching threshold level.',
              analysis: 'Demonstrates deep component knowledge (optocoupler, inductive spike, freewheeling diode), hands-on troubleshooting, and verified test metrics.'
            },
            proTip: 'Explaining a practical problem you encountered and how you solved it proves you built the project yourself.'
          }
        ],
        exercise: {
          id: 'ex-dip-1',
          title: 'Structure Your Diploma Project Breakdown',
          type: 'script_builder',
          instructions: 'Write a 2-minute walkthrough of a laboratory experiment or diploma project.',
          prompt: 'Follow E-P-D-O: 1) Engineering need, 2) Blueprint / Circuit principle, 3) Troubleshooting challenge faced, 4) Final test result.',
          starterTemplate: 'Our diploma project is [Project Title] designed to solve [Engineering Need]...\n\nThe core principle relies on [Schematic / Mechanism]...\n\nA significant practical challenge we solved during testing was...\n\nOur final verified test showed that...',
          evaluationRubric: [
            { criterion: 'Technical Terminology', idealTarget: 'Uses accurate component names and units of measurement' },
            { criterion: 'Hands-on Authenticity', idealTarget: 'Details real physical troubleshooting steps' }
          ]
        },
        quiz: [
          {
            id: 'q-dip1-1',
            question: 'What is the most effective way to prove to a viva examiner that you physically built your lab project?',
            conceptKey: 'Project Authenticity',
            options: [
              { id: 'a', text: 'Presenting a glossy laminated project report with 100 pages of copied theory', isCorrect: false, explanation: 'Examiners know copied reports; they test physical understanding.' },
              { id: 'b', text: 'Explaining a specific component challenge you faced during wiring/fabrication and how you resolved it', isCorrect: true, explanation: 'Recounting real troubleshooting proves authentic hands-on involvement.' },
              { id: 'c', text: 'Repeating that you paid a lot of money for the components', isCorrect: false, explanation: 'Outsourcing projects is an academic violation.' },
              { id: 'd', text: 'Letting your project partner answer every technical question', isCorrect: false, explanation: 'Individual marks depend on your own articulation.' }
            ]
          },
          {
            id: 'q-dip1-2',
            question: 'In an engineering lab viva, why do experimental results differ slightly from theoretical formulas?',
            conceptKey: 'Experimental Error Analysis',
            options: [
              { id: 'a', text: 'Physical factors like friction, line resistance, ambient temperature, and instrument tolerances', isCorrect: true, explanation: 'Real-world machinery always encounters physical losses that ideal theoretical formulas omit.' },
              { id: 'b', text: 'Because physics formulas in textbooks are completely false', isCorrect: false, explanation: 'Formulas model idealized conditions without friction and losses.' },
              { id: 'c', text: 'Because the lab assistant purposely broke the equipment', isCorrect: false, explanation: 'Unprofessional excuse.' },
              { id: 'd', text: 'There is never any difference between theory and practice', isCorrect: false, explanation: 'Friction and measurement tolerances always cause minor real-world variations.' }
            ]
          },
          {
            id: 'q-dip1-3',
            question: 'What should a diploma student do before powering on heavy electrical or mechanical machinery in a lab exam?',
            conceptKey: 'Pre-Operation Safety',
            options: [
              { id: 'a', text: 'Perform zero-error calibration, inspect ground earthing, and verify safety interlocks/guards', isCorrect: true, explanation: 'Demonstrating systematic pre-operation checks shows workshop discipline and safety competence.' },
              { id: 'b', text: 'Switch it on immediately at maximum voltage to save time', isCorrect: false, explanation: 'Causes equipment damage and electrical hazards.' },
              { id: 'c', text: 'Look away and press random buttons', isCorrect: false, explanation: 'Extremely dangerous.' },
              { id: 'd', text: 'Remove safety shields to get a better photo', isCorrect: false, explanation: 'Severe workplace safety violation.' }
            ]
          },
          {
            id: 'q-dip1-4',
            question: 'In the E-P-D-O project presentation framework, what does the "D" represent?',
            conceptKey: 'E-P-D-O Framework',
            options: [
              { id: 'a', text: 'Disregard', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'b', text: 'Demonstration & Fabrication (the physical materials, assembly, and testing challenges)', isCorrect: true, explanation: 'D stands for physical demonstration, fabrication steps, and troubleshooting resolution.' },
              { id: 'c', text: 'Doctorate', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'Dismissal', isCorrect: false, explanation: 'Incorrect.' }
            ]
          }
        ]
      },
      {
        id: 'lesson-diploma-2',
        moduleId: 'module-diploma-practical',
        pathwayId: 'diploma',
        number: 14,
        title: 'Apprenticeship Interviews & Lateral Entry Selection',
        subtitle: 'Securing NATS/NEAPS Apprenticeships & B.Tech ECET Interviews',
        estimatedMinutes: 8,
        tags: ['Diploma', 'Apprenticeship', 'Lateral Entry', 'NATS', 'ECET', 'PSU Interviews'],
        objective: 'Prepare for technician interviews at PSUs, manufacturing plants, and automotive giants, and master technical communication for lateral-entry engineering degree transitions.',
        sections: [
          {
            id: 'dip2-s1',
            title: '1. What Manufacturing Plants & PSUs Look for in Diploma Technicians',
            content: `When recruiting technician apprentices through NATS or campus drives (e.g. Tata Motors, L&T, BHEL, Ashok Leyland, State Electricity Boards), hiring managers evaluate three core attributes:

1. **Safety Mindset:** Will this candidate follow Standard Operating Procedures (SOPs) or take reckless shortcuts that endanger themselves and equipment?
2. **Blueprint Literacy:** Can you read engineering orthographic projections, electrical single-line diagrams (SLDs), or piping instrumentation diagrams (P&IDs)?
3. **Shopfloor Discipline:** Punctuality, willingness to work in rotating shifts, physical stamina, and respectful communication with senior supervisors.`,
            keyTakeaways: [
              'Safety and SOP adherence are prioritized above theoretical derivations.',
              'Be ready to sketch and read basic engineering diagrams on paper during the interview.',
              'Express willingness to learn on the plant floor under senior chargehands.'
            ]
          },
          {
            id: 'dip2-s2',
            title: '2. Articulating Lateral Entry Aspirations (Why B.Tech?)',
            content: `If you are interviewing for B.Tech lateral entry or being asked why you want to pursue engineering after diploma:
- **Do not say:** *"Diploma has no value so I need a B.Tech degree."*
- **Instead say:** *"My diploma gave me rigorous hands-on practical skills on the shopfloor and in the lab. Pursuing B.Tech lateral entry allows me to deepen my mathematical and computational design knowledge, enabling me to grow from technician execution into engineering systems design."*`,
            keyTakeaways: [
              'Frame your diploma as a practical strength, not a deficiency.',
              'Explain how theoretical design complements your existing hands-on skills.'
            ]
          }
        ],
        examples: [
          {
            id: 'dip2-ex1',
            scenario: 'Plant Manager asks a Diploma Mechanical candidate: "How do you handle a situation where a machine makes an abnormal rattling sound during your shift?"',
            badExample: {
              text: 'Sir, I will ignore it if production quota is pending, or I will tap the motor with a hammer to see if sound stops.',
              analysis: 'Extremely dangerous answer that shows complete disregard for machine safety and protocol.'
            },
            goodExample: {
              text: 'I would immediately follow plant safety protocol. First, I would safely pause the machine using the standard cycle stop, tag the lockout switch, and notify my shift supervisor. I would check for obvious loose fasteners, foreign debris in the drive belt, or bearing overheating. I would document the exact operating rpm and sound in the shift maintenance log rather than attempting unauthorized dismantling.',
              analysis: 'Demonstrates immediate safety compliance, lockout-tagout protocol, chain of command communication, and structured root-cause logging.'
            },
            proTip: 'In manufacturing and technician interviews, standard safety procedures always come first.'
          }
        ],
        exercise: {
          id: 'ex-dip-2',
          title: 'Explain Your Shift Safety & Troubleshooting Response',
          type: 'reflection',
          instructions: 'Describe your step-by-step reaction to a workshop equipment anomaly.',
          prompt: 'Write out your response: 1) Immediate safety action, 2) Supervisor reporting, 3) Visual/instrument check, 4) Documentation in the logbook.',
          evaluationRubric: [
            { criterion: 'Safety Compliance', idealTarget: 'Emphasizes immediate machine isolation and safety' },
            { criterion: 'Chain of Command', idealTarget: 'Reports accurately to supervisors' }
          ]
        },
        quiz: [
          {
            id: 'q-dip2-1',
            question: 'In a manufacturing plant or technician interview, what is the most important principle when addressing equipment failure?',
            conceptKey: 'Plant Safety Priority',
            options: [
              { id: 'a', text: 'Keeping the machine running at all costs to meet daily production quotas', isCorrect: false, explanation: 'Violating safety to meet quotas leads to catastrophic equipment damage and injuries.' },
              { id: 'b', text: 'Safety protocol first: isolate the machine, notify supervisor, and log the incident', isCorrect: true, explanation: 'Adherence to safety procedures and clear reporting is the top hiring criteria for technicians.' },
              { id: 'c', text: 'Disassembling the machine completely without supervisor approval', isCorrect: false, explanation: 'Unauthorized repairs violate plant standard operating procedures.' },
              { id: 'd', text: 'Leaving the shopfloor without telling anyone', isCorrect: false, explanation: 'Abandoning a malfunctioning machine creates extreme workplace hazards.' }
            ]
          },
          {
            id: 'q-dip2-2',
            question: 'What is Lockout-Tagout (LOTO) in plant maintenance?',
            conceptKey: 'LOTO Safety Protocol',
            options: [
              { id: 'a', text: 'A safety procedure to ensure machinery is properly de-energized and cannot be turned on during maintenance', isCorrect: true, explanation: 'LOTO physically secures switches with padlocks and tags so nobody inadvertently energizes equipment while personnel are working on it.' },
              { id: 'b', text: 'A password used to unlock computer games during shift breaks', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'c', text: 'A tool used to cut sheet metal', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'A method for calculating technician overtime pay', isCorrect: false, explanation: 'Incorrect.' }
            ]
          },
          {
            id: 'q-dip2-3',
            question: 'When asked why you want to transition from a polytechnic diploma into B.Tech lateral entry, what is the best explanation?',
            conceptKey: 'Lateral Entry Articulation',
            options: [
              { id: 'a', text: 'Diploma gave me hands-on execution skills; B.Tech will equip me with advanced mathematical modeling and systems design', isCorrect: true, explanation: 'Presents diploma experience as a foundation and B.Tech as an intentional step towards engineering architecture.' },
              { id: 'b', text: 'Diploma is useless and I regret studying it', isCorrect: false, explanation: 'Devaluing your own diploma harms your credibility.' },
              { id: 'c', text: 'I just want to attend college fests for three more years', isCorrect: false, explanation: 'Demonstrates lack of career seriousness.' },
              { id: 'd', text: 'Because someone told me B.Tech graduates never have to do any work', isCorrect: false, explanation: 'Engineering roles involve demanding problem solving.' }
            ]
          },
          {
            id: 'q-dip2-4',
            question: 'What does NATS stand for in the context of diploma technician hiring in India?',
            conceptKey: 'Apprenticeship Framework',
            options: [
              { id: 'a', text: 'National Apprenticeship Training Scheme', isCorrect: true, explanation: 'NATS is the government program managed by the Ministry of Education facilitating 1-year paid industry apprenticeships.' },
              { id: 'b', text: 'National Aviation Traffic System', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'c', text: 'New Academic Teaching Standard', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'North Asian Technology Summit', isCorrect: false, explanation: 'Incorrect.' }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MODULE 12: UNDERGRADUATE ACADEMY (PROJECTS, GDS & INTERNSHIPS)
  // =========================================================================
  {
    id: 'module-ug-placement',
    order: 12,
    pathwayId: 'undergraduate',
    title: 'Campus Placements & Academic Projects',
    subtitle: 'Project Presentations, Group Discussions & Internship Selection',
    description: 'Turn college capstones into interview assets, navigate group discussions (GDs), and secure competitive internships and placement offers across all streams.',
    iconName: 'BookOpen',
    category: 'Campus & Degree',
    targetAudience: 'Undergraduate Students Across Engineering, Commerce, Science & Arts',
    lessons: [
      {
        id: 'lesson-ug-1',
        moduleId: 'module-ug-placement',
        pathwayId: 'undergraduate',
        number: 15,
        title: 'Presenting Academic Projects & Technical Portfolios',
        subtitle: 'Turning College Capstones into Powerful Interview Assets',
        estimatedMinutes: 9,
        tags: ['Undergraduate', 'Project Presentation', 'Campus Placement', 'Engineering', 'Commerce', 'Science'],
        objective: 'Learn how to structure and present your undergraduate final-year project—whether in engineering, commerce auditing, or social science research—highlighting individual contribution and quantifiable results.',
        sections: [
          {
            id: 'ug1-s1',
            title: '1. The 4-Step Academic Project Presentation Formula',
            content: `Interviewers in placement drives spend up to 70% of the technical round discussing your final-year or semester projects. Use the **P-A-R-I Formula**:

1. **Problem Statement (P):** What real-world challenge were you solving? (E.g. *"Small retailers struggle to track inventory and reconcile GST invoices efficiently."*)
2. **Architecture & Approach (A):** What methodology, framework, or tools did you select? (E.g. Node.js backend with PostgreSQL, or SPSS statistical regression).
3. **Role & Individual Ownership (R):** What specific modules did you write, wire, or analyze? (Never say *"we did everything together"*—specify your exact module).
4. **Impact & Key Takeaway (I):** What metric proved it worked? What was the biggest technical roadblock you overcame?`,
            keyTakeaways: [
              'Clearly separate your individual contribution from the overall team project.',
              'State why you selected a specific tool over alternative options.',
              'Quantify outcomes whenever possible (latency, accuracy percentage, time saved).'
            ]
          },
          {
            id: 'ug1-s2',
            title: '2. Multi-Stream Project Examples (Tech, Commerce & Science)',
            content: `Academic projects differ across streams:
- **Computer Science / IT:** Highlight database schema design, API latency optimization, authentication security, and edge-case testing.
- **Commerce / Management:** Highlight financial ratio analysis, GST compliance audit models, consumer survey sample size, and variance analysis.
- **Pure Science / Biotech:** Highlight control group parameters, reagent purity, spectrometer calibration, and statistical hypothesis verification.`,
            keyTakeaways: [
              'Every academic discipline has quantitative metrics to share.',
              'Be ready to answer: *"If you had two more months, what architectural feature would you improve?"*'
            ]
          }
        ],
        examples: [
          {
            id: 'ug1-ex1',
            scenario: 'Interviewer asks: "Walk me through your final year college project."',
            badExample: {
              text: 'Sir, our project is an AI E-Commerce Website. It has login page, cart page, and payment gateway. We used HTML, CSS, JavaScript, React, Node, MongoDB, and Python AI. My four friends and I did everything together.',
              analysis: 'Lists buzzwords without architecture; fails to define individual ownership or problem statement.'
            },
            goodExample: {
              text: 'For our final year capstone, my team built a real-time inventory management tool for local pharmacies. My personal responsibility was designing the database schema in PostgreSQL and writing the REST API endpoints in Node.js. One major challenge was preventing inventory race conditions when multiple billing counters requested the same medicine stock simultaneously. I implemented database transaction locks with row-level isolation, ensuring zero stock discrepancies under concurrent testing with 50 simulated counters. The system reduced manual stock auditing time by 40%.',
              analysis: 'Clear problem statement, explicit individual ownership, concrete technical challenge (race conditions), exact solution (transaction locks), and measurable metric (40% time saved).'
            },
            proTip: 'Explicitly naming a concurrency bug, database bottleneck, or experimental error you fixed proves genuine engineering mastery.'
          }
        ],
        exercise: {
          id: 'ex-ug-1',
          title: 'Draft Your 2-Minute Project Narrative',
          type: 'script_builder',
          instructions: 'Structure your undergraduate project narrative using the P-A-R-I formula.',
          prompt: 'Write out your: 1) Problem statement, 2) Technical/methodological architecture, 3) Personal module contribution, 4) Quantifiable test result.',
          starterTemplate: 'The problem our project addresses is...\n\nWe implemented our solution using [Tech Stack / Methodology] because...\n\nMy specific individual contribution was...\n\nA significant challenge I solved was...\n\nOur verified result showed...',
          evaluationRubric: [
            { criterion: 'Personal Ownership', idealTarget: 'Clearly articulates individual module responsibility' },
            { criterion: 'Problem Solving Depth', idealTarget: 'Explains a concrete obstacle and its technical resolution' }
          ]
        },
        quiz: [
          {
            id: 'q-ug1-1',
            question: 'When presenting a college group project in an interview, what is the biggest mistake candidates make?',
            conceptKey: 'Project Presentation',
            options: [
              { id: 'a', text: 'Saying "we did everything together" and failing to specify individual ownership', isCorrect: true, explanation: 'Interviewers hire individuals, not teams; they must know exactly what code, circuits, or analysis you authored.' },
              { id: 'b', text: 'Explaining the problem statement clearly in the first sentence', isCorrect: false, explanation: 'Starting with the problem statement is a recommended best practice.' },
              { id: 'c', text: 'Mentioning the database or tools selected', isCorrect: false, explanation: 'Specifying your tools demonstrates architectural awareness.' },
              { id: 'd', text: 'Admitting a technical challenge you resolved', isCorrect: false, explanation: 'Troubleshooting stories prove hands-on mastery.' }
            ]
          },
          {
            id: 'q-ug1-2',
            question: 'What does the "I" in the P-A-R-I project presentation formula represent?',
            conceptKey: 'P-A-R-I Impact Metric',
            options: [
              { id: 'a', text: 'Impact & Key Takeaway (quantifiable outcome, metric, or major obstacle solved)', isCorrect: true, explanation: 'Impact validates that the project worked and delivers measurable value.' },
              { id: 'b', text: 'Income made from selling the project', isCorrect: false, explanation: 'College projects rarely generate commercial revenue.' },
              { id: 'c', text: 'Internet bandwidth utilized', isCorrect: false, explanation: 'Irrelevant metric.' },
              { id: 'd', text: 'Interviewer impression', isCorrect: false, explanation: 'Incorrect formulation.' }
            ]
          },
          {
            id: 'q-ug1-3',
            question: 'If an interviewer asks: "What would you improve if you had 2 more months to work on this project?", what are they assessing?',
            conceptKey: 'Architectural Self-Critique',
            options: [
              { id: 'a', text: 'Your ability to critically analyze design trade-offs, identify bottlenecks, and envision scalable improvements', isCorrect: true, explanation: 'Strong engineers and analysts can reflect on limitations and identify high-value upgrades.' },
              { id: 'b', text: 'Whether you think your project was completely broken', isCorrect: false, explanation: 'Recognizing areas for improvement is a sign of excellence, not failure.' },
              { id: 'c', text: 'If you want to delay graduation', isCorrect: false, explanation: 'It is a technical inquiry into future roadmap thinking.' },
              { id: 'd', text: 'Whether you can insult your teammates', isCorrect: false, explanation: 'Team conflicts should never be aired in technical interviews.' }
            ]
          },
          {
            id: 'q-ug1-4',
            question: 'In a commerce or management project presentation, what kind of evidence makes the strongest impression?',
            conceptKey: 'Commerce Project Metrics',
            options: [
              { id: 'a', text: 'Quantitative data: sample sizes, variance percentages, cost reduction models, or audit ratios', isCorrect: true, explanation: 'Quantifiable financial or statistical evidence validates analytical rigor.' },
              { id: 'b', text: 'Copy-pasting definitions of marketing from Wikipedia', isCorrect: false, explanation: 'Textbook definitions do not demonstrate practical analysis.' },
              { id: 'c', text: 'Using colourful clip art in PowerPoint', isCorrect: false, explanation: 'Substance matters far more than graphic embellishments.' },
              { id: 'd', text: 'Saying that everyone in the company was very friendly', isCorrect: false, explanation: 'Subjective impressions lack academic and analytical value.' }
            ]
          }
        ]
      },
      {
        id: 'lesson-ug-2',
        moduleId: 'module-ug-placement',
        pathwayId: 'undergraduate',
        number: 16,
        title: 'Mastering Group Discussions & Internship Rounds',
        subtitle: 'Standing Out with Thought Leadership, Active Listening & Professional Poise',
        estimatedMinutes: 8,
        tags: ['Undergraduate', 'Group Discussion', 'GD Preparation', 'Campus Placement', 'Internships'],
        objective: 'Master campus placement Group Discussions (GDs), learn when and how to enter conversations politely, handle contentious topics with data, and excel in competitive summer internship screening.',
        sections: [
          {
            id: 'ug2-s1',
            title: '1. The Real Scoring Rubric of Campus Placement GDs',
            content: `Recruiters in Indian campus drives (e.g. TCS, Wipro, Deloitte, Cognizant, banks, consulting firms) use Group Discussions to eliminate up to 60% of candidates. They do NOT reward candidates who shout loudest. They look for:

1. **Content Quality & Frameworks:** Using structures like PESTLE (Political, Economic, Social, Technological, Legal, Environmental) or Stakeholder Impact.
2. **Conversation Facilitation:** Bringing quiet candidates into the discussion (*"Let us hear from our colleague on the right who was trying to speak"*).
3. **Poise Under Interruption:** Continuing calmly without aggression or personal insults.
4. **Conclusion & Synthesis:** Summarizing conflicting viewpoints objectively when the moderator calls for final remarks.`,
            keyTakeaways: [
              'Shouting or dominating conversation gets you disqualified for poor teamwork.',
              'Entering 2 to 3 times with data-backed points is far superior to speaking continuously.',
              'Acknowledge previous speakers: *"Building on the valid point made by candidate 4..."*'
            ]
          },
          {
            id: 'ug2-s2',
            title: '2. The 3 Golden GD Entry Phrases',
            content: `Breaking into a chaotic fish-market GD requires diplomatic assertiveness:
- **To Agree & Build:** *"I agree with the point regarding infrastructure, and to add a quantitative perspective, recent budget allocations indicate..."*
- **To Counter Politely:** *"That is an interesting viewpoint on subsidies; however, from a fiscal deficit perspective, we must also consider..."*
- **To Steer Back on Track:** *"Friends, while that historical context is valuable, let us refocus our discussion on the core topic of renewable energy adoption..."*`,
            keyTakeaways: [
              'Use polite bridges instead of saying "You are wrong".',
              'Steering an off-track group back to the core topic scores top leadership marks.',
              'Maintain calm breathing and open hand gestures during intense debates.'
            ]
          }
        ],
        examples: [
          {
            id: 'ug2-ex1',
            scenario: 'During a heated GD on "Artificial Intelligence: Threat or Opportunity for Indian Employment?"',
            badExample: {
              text: 'NO NO NO! SHUT UP! YOU ARE WRONG! AI WILL KILL ALL JOBS! LISTEN TO ME! LISTEN TO ME!',
              analysis: 'Aggressive, disrespectful, and completely fails recruiter teamwork criteria.'
            },
            goodExample: {
              text: 'I appreciate the valid concern regarding routine job displacement. However, if we examine the historical precedent of computerized banking in the 1990s, automation eliminated manual ledger entry but created millions of higher-value roles in software, compliance, and ATM logistics. Similarly, while routine clerical work may automate, demand for data annotators, domain prompt engineers, and cybersecurity analysts will surge in India.',
              analysis: 'Validates previous speaker respectfully, cites historical precedent, and provides balanced, concrete workforce examples.'
            },
            proTip: 'Connecting current debate topics to historical precedents or government data instantly elevates your credibility.'
          }
        ],
        exercise: {
          id: 'ex-ug-2',
          title: 'Draft a Diplomatic GD Counter-Argument',
          type: 'reflection',
          instructions: 'Write a polite, evidence-backed counterpoint for a campus GD debate.',
          prompt: 'Choose a debatable topic (e.g. Remote Work vs Office, Electric Vehicles vs Hybrids) and write: 1) Respectful acknowledgment of opposing view, 2) Data-backed counter-evidence, 3) Constructive synthesis.',
          evaluationRubric: [
            { criterion: 'Diplomatic Tone', idealTarget: 'Uses respectful transitional phrases' },
            { criterion: 'Evidence Quality', idealTarget: 'Provides logical, balanced counterpoints' }
          ]
        },
        quiz: [
          {
            id: 'q-ug2-1',
            question: 'What is the most effective strategy to get selected in a campus placement Group Discussion (GD)?',
            conceptKey: 'GD Success Strategy',
            options: [
              { id: 'a', text: 'Shouting continuously and preventing anyone else from speaking', isCorrect: false, explanation: 'Dominating candidates are eliminated for poor collaboration.' },
              { id: 'b', text: 'Making 2 to 3 structured, data-backed contributions and facilitating polite discussion', isCorrect: true, explanation: 'Recruiters reward leadership, content depth, and active listening.' },
              { id: 'c', text: 'Remaining silent the entire time and smiling politely', isCorrect: false, explanation: 'Zero contribution results in zero evaluation marks.' },
              { id: 'd', text: 'Arguing aggressively with the panel moderator', isCorrect: false, explanation: 'Hostility towards moderators leads to immediate disqualification.' }
            ]
          },
          {
            id: 'q-ug2-2',
            question: 'How should you politely enter an ongoing Group Discussion without screaming?',
            conceptKey: 'GD Entry Etiquette',
            options: [
              { id: 'a', text: 'Use a bridge phrase: "Building upon the valid point made by Candidate 4, I would like to add..."', isCorrect: true, explanation: 'Acknowledging previous speakers demonstrates active listening and smooth conversational entry.' },
              { id: 'b', text: 'Bang your fist on the table until everyone stops talking', isCorrect: false, explanation: 'Unacceptable unprofessional behavior.' },
              { id: 'c', text: 'Whistle loudly into the room', isCorrect: false, explanation: 'Disruptive and disrespectful.' },
              { id: 'd', text: 'Tell the person speaking that they are talking nonsense', isCorrect: false, explanation: 'Personal attacks result in disqualification.' }
            ]
          },
          {
            id: 'q-ug2-3',
            question: 'What does the PESTLE framework in GD topic analysis help you do?',
            conceptKey: 'PESTLE Analytical Framework',
            options: [
              { id: 'a', text: 'Analyze a topic holistically across Political, Economic, Social, Technological, Legal, and Environmental dimensions', isCorrect: true, explanation: 'PESTLE ensures multi-dimensional thought leadership rather than shallow one-sided opinions.' },
              { id: 'b', text: 'Memorize sports statistics', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'c', text: 'Calculate simple interest', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'Order food for the group discussion team', isCorrect: false, explanation: 'Incorrect.' }
            ]
          },
          {
            id: 'q-ug2-4',
            question: 'If a GD group drifts completely away from the designated topic into personal gossip, what action scores the highest leadership marks?',
            conceptKey: 'Discussion Steering',
            options: [
              { id: 'a', text: 'Politely intervening to steer the group back: "Friends, while this discussion is interesting, let us bring our focus back to our core agenda..."', isCorrect: true, explanation: 'Steering the group productively back on track showcases natural leadership and maturity.' },
              { id: 'b', text: 'Joining in the gossip enthusiastically', isCorrect: false, explanation: 'Wastes the evaluation round.' },
              { id: 'c', text: 'Standing up and walking out of the room', isCorrect: false, explanation: 'Abandoning the session forfeits your candidature.' },
              { id: 'd', text: 'Complaining to the moderator that everyone else is foolish', isCorrect: false, explanation: 'Shows poor team mediation skills.' }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MODULE 13: POSTGRADUATE ACADEMY (RESEARCH DEFENSE & LEADERSHIP)
  // =========================================================================
  {
    id: 'module-pg-research',
    order: 13,
    pathwayId: 'postgraduate',
    title: 'Research Defense & Specialist Recruitment',
    subtitle: 'Dissertation Defense, Case Frameworks & Executive Presence',
    description: 'Prepare for master thesis defenses, research associate interviews, and high-stakes specialist and management trainee positions.',
    iconName: 'Award',
    category: 'Research & Defense',
    targetAudience: 'Postgraduate & Masters Students (M.Tech, MBA, M.Sc, M.Com, M.A)',
    lessons: [
      {
        id: 'lesson-pg-1',
        moduleId: 'module-pg-research',
        pathwayId: 'postgraduate',
        number: 17,
        title: 'Defending Your Thesis & Research Methodology',
        subtitle: 'Communicating Empirical Findings, Hypotheses, and Literature Gaps',
        estimatedMinutes: 9,
        tags: ['Postgraduate', 'Thesis Defense', 'Research Methodology', 'Masters', 'Dissertation'],
        objective: 'Learn how to defend a master dissertation or research project, justify your research methodology, address statistical limitations, and engage in high-level intellectual debate with examiners.',
        sections: [
          {
            id: 'pg1-s1',
            title: '1. Structuring the 10-Minute Thesis Defense',
            content: `In a master thesis defense or research viva, external examiners expect academic rigor:
1. **The Research Gap:** What unanswered question in literature prompted your work?
2. **Methodological Justification:** Why did you select this specific algorithm, experimental protocol, or econometric model over alternatives?
3. **Core Empirical Findings:** What did the experimental data or statistical regression prove?
4. **Limitations & Future Work:** Acknowledging boundary conditions with academic maturity.`,
            keyTakeaways: [
              'Frame critiques from examiners as intellectual engagement, not personal attacks.',
              'Never hide statistical anomalies; explain them with scientific curiosity.'
            ]
          },
          {
            id: 'pg1-s2',
            title: '2. Handling Methodological Scrutiny & Edge Cases',
            content: `Examiners will challenge your chosen framework:
- *"Why didn't you utilize Deep Learning or a different control group?"*
- *"Is your sample statistically representative across geographical clusters?"*

**The Defensible Response Blueprint:**
1. **Acknowledge the Alternative:** *"That is a very pertinent alternative methodology."*
2. **State Empirical Constraint:** Explain why your dataset, compute constraints, or domain requirements favored your chosen method.
3. **Present Comparative Validation:** Show you tested baseline alternatives before committing.`,
            keyTakeaways: [
              'Validating alternative baselines demonstrates research thoroughness.',
              'Acknowledge constraints without defensiveness.',
              'Cite literature benchmarks to support your choices.'
            ]
          }
        ],
        examples: [
          {
            id: 'pg1-ex1',
            scenario: 'Examiner asks: "Why did you use Random Forest instead of a Deep Neural Network for this classification dataset?"',
            badExample: {
              text: 'Sir, neural networks are too complicated and take long time to train, so I just used Random Forest because sklearn code was ready.',
              analysis: 'Lacks intellectual rigor; bases methodology on personal convenience rather than data characteristics.'
            },
            goodExample: {
              text: 'We evaluated both architectures during exploratory data analysis. Given our tabular dataset size of 15,000 observations with high feature heterogeneity, Random Forest demonstrated superior resistance to overfitting without requiring extensive hyperparameter tuning. Furthermore, in our domain of credit risk assessment, tree-based feature importance provided vital interpretability required by regulatory compliance, which black-box deep models do not offer natively.',
              analysis: 'Justifies choice using dataset characteristics (tabular, 15k rows), performance properties (overfitting resistance), and domain constraints (interpretability for regulatory compliance).'
            },
            proTip: 'In postgraduate defenses, explaining why you rejected alternative methods is just as important as explaining your chosen method.'
          }
        ],
        exercise: {
          id: 'ex-pg-1',
          title: 'Defend Your Research Methodology & Trade-offs',
          type: 'script_builder',
          instructions: 'Draft an answer justifying your chosen methodology and explaining why you ruled out an alternative approach.',
          prompt: 'Write: 1) Chosen methodology, 2) Data / problem constraint that motivated it, 3) Why an alternative method was unsuitable, 4) Acknowledged limitation.',
          starterTemplate: 'For our research, we selected [Methodology] because our dataset exhibits...\n\nWhile [Alternative Method] is widely used, it was suboptimal in our context due to...\n\nOne recognized constraint of our approach is...',
          evaluationRubric: [
            { criterion: 'Methodological Rigor', idealTarget: 'Provides scientific or empirical justification for choices' },
            { criterion: 'Academic Honesty', idealTarget: 'Clearly articulates scope limitations' }
          ]
        },
        quiz: [
          {
            id: 'q-pg1-1',
            question: 'During a master thesis defense, how should you respond when an external examiner points out a limitation in your sample size?',
            conceptKey: 'Thesis Defense Composure',
            options: [
              { id: 'a', text: 'Argue aggressively that your sample size is completely flawless', isCorrect: false, explanation: 'Hostile defensiveness indicates lack of academic maturity.' },
              { id: 'b', text: 'Acknowledge the boundary constraint, explain how you controlled for variance, and suggest it as future research', isCorrect: true, explanation: 'Academic rigor welcomes constructive peer review and recognizes statistical boundaries.' },
              { id: 'c', text: 'Blame your university laboratory for not providing funding', isCorrect: false, explanation: 'Complaining about resources deflects responsibility.' },
              { id: 'd', text: 'Break down in tears', isCorrect: false, explanation: 'Maintain professional poise under examination.' }
            ]
          },
          {
            id: 'q-pg1-2',
            question: 'Why is defining the "Research Gap" in your thesis opening essential?',
            conceptKey: 'Research Gap Identification',
            options: [
              { id: 'a', text: 'It proves why your investigation was necessary and how it contributes novel insight beyond existing literature', isCorrect: true, explanation: 'A master dissertation must establish the specific unanswered question it addresses.' },
              { id: 'b', text: 'It is a page-filler requirement to reach 100 pages', isCorrect: false, explanation: 'Research quality is evaluated on intellectual contribution, not page quantity.' },
              { id: 'c', text: 'It is used to criticize your professors', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'It proves that no one in history ever studied science before you', isCorrect: false, explanation: 'Research builds upon previous scholarly work.' }
            ]
          },
          {
            id: 'q-pg1-3',
            question: 'What is the hallmark of a high-quality scientific explanation of unexpected experimental data?',
            conceptKey: 'Empirical Anomaly Analysis',
            options: [
              { id: 'a', text: 'Deleting the conflicting data points so your graphs look perfect', isCorrect: false, explanation: 'Falsifying or trimming data is a catastrophic academic crime.' },
              { id: 'b', text: 'Hypothesizing potential confounding variables, equipment calibration tolerances, or underlying chemical/physical phenomena that caused the variance', isCorrect: true, explanation: 'Investigating anomalies scientifically is often where the deepest scientific insights are discovered.' },
              { id: 'c', text: 'Pretending the experiment never happened', isCorrect: false, explanation: 'Unethical and unacceptable.' },
              { id: 'd', text: 'Claiming the laws of thermodynamics temporarily stopped working', isCorrect: false, explanation: 'Absurd.' }
            ]
          },
          {
            id: 'q-pg1-4',
            question: 'When asked why you selected a simpler statistical model over a complex black-box deep learning architecture, what is a sound justification?',
            conceptKey: 'Model Interpretability & Parsimony',
            options: [
              { id: 'a', text: 'Occam\'s Razor: the model offered high interpretability, resistance to overfitting on limited tabular data, and compliance transparency without unnecessary computational overhead', isCorrect: true, explanation: 'Choosing parsimonious, interpretable models aligned with dataset properties shows senior engineering wisdom.' },
              { id: 'b', text: 'Because you forgot how to install Python libraries', isCorrect: false, explanation: 'Indicates technical incompetence.' },
              { id: 'c', text: 'Because deep learning is completely useless in every industry', isCorrect: false, explanation: 'Sweeping inaccurate claims demonstrate poor awareness.' },
              { id: 'd', text: 'Because you did not want to leave your laptop on overnight', isCorrect: false, explanation: 'Trivial personal excuse.' }
            ]
          }
        ]
      },
      {
        id: 'lesson-pg-2',
        moduleId: 'module-pg-research',
        pathwayId: 'postgraduate',
        number: 18,
        title: 'Specialist, Consulting & Management Trainee Interviews',
        subtitle: 'Solving Business Cases, Executive Communication & Strategy Rounds',
        estimatedMinutes: 9,
        tags: ['Postgraduate', 'MBA', 'Case Interviews', 'Management Trainee', 'Consulting'],
        objective: 'Master case interviews, structured problem breakdown (MECE framework), strategic prioritization, and executive communication expected in master level campus placement.',
        sections: [
          {
            id: 'pg2-s1',
            title: '1. Deconstructing the Business Case Interview',
            content: `In MBA and postgraduate leadership interviews (e.g. McKinsey, BCG, HUL, Amazon, Bain, Tata Administrative Services), interviewers evaluate how you decompose ambiguous business dilemmas:

1. **Clarify Scope:** Ask 2 targeted questions before jumping to solutions (e.g. *"Is the revenue decline company-specific or industry-wide?"*).
2. **Structure with MECE:** Mutually Exclusive, Collectively Exhaustive breakdown (Revenue = Price × Volume; Costs = Fixed + Variable).
3. **Hypothesis-Driven Synthesis:** Formulate an early educated thesis and test it against data provided by the interviewer.`,
            keyTakeaways: [
              'Do not guess random solutions; the framework of your thinking is what is scored.',
              'Think out loud so the interviewer can observe your logical deduction.'
            ]
          },
          {
            id: 'pg2-s2',
            title: '2. Executive Communication (Top-Down Synthesis)',
            content: `Postgraduate candidates often make the mistake of rambling through chronological background details before delivering recommendations.
**Executive Pyramid Principle:**
1. **Lead with the Recommendation:** *"We recommend expanding into Tier-2 distribution centers to reduce order turnaround from 4 days to 24 hours."*
2. **Support with 3 Pillars:** Financial Viability, Operational Feasibility, Risk Mitigation.
3. **State Clear Next Steps & Metrics:** Immediate 90-day pilot scope and KPIs.`,
            keyTakeaways: [
              'Lead with the conclusion/recommendation first.',
              'Structure supporting evidence in threes.',
              'Always specify a measurable pilot phase to mitigate risk.'
            ]
          }
        ],
        examples: [
          {
            id: 'pg2-ex1',
            scenario: 'Case Interviewer asks: "A major Indian telecom provider is seeing a 15% drop in EBITDA margin this fiscal year. How would you diagnose the root cause?"',
            badExample: {
              text: 'They should launch 5G and spend 100 crores on TV advertising with Bollywood celebrities to get more customers.',
              analysis: 'Jumps directly to unsubstantiated marketing tactics without diagnosing whether the problem is cost escalation, churn, or ARPU compression.'
            },
            goodExample: {
              text: 'To diagnose the 15% EBITDA decline, I would structure my analysis into two mutually exclusive branches: Revenue compression and Cost escalation. On the Revenue side, I would analyze whether the drop is driven by subscriber volume loss (churn) or average revenue per user (ARPU) decline across prepaid versus postpaid tiers. On the Cost side, I would evaluate network operating costs such as tower lease escalations, energy expenses, and spectrum amortizations. Before deep-diving, may I ask: is this margin compression industry-wide or unique to our client?',
              analysis: 'Structured, MECE, demonstrates business acumen (ARPU, churn, tower leases), and asks a clarifying diagnostic question.'
            },
            proTip: 'In case interviews, structured diagnosis always precedes solution brainstorming.'
          }
        ],
        exercise: {
          id: 'ex-pg-2',
          title: 'Structure a Strategic Problem Breakdown',
          type: 'script_builder',
          instructions: 'Break down an ambiguous business problem using the MECE framework.',
          prompt: 'Problem: "A regional retail grocery chain is losing market share to quick-commerce delivery apps." Write: 1) Diagnostic branches (Customer / Product / Channel), 2) Two clarifying questions, 3) Recommended hypothesis.',
          starterTemplate: 'To diagnose the loss of market share, I would structure the inquiry into three pillars...\n\nFirst, on Channel Dynamics...\n\nSecond, on Customer Demographics...\n\nMy preliminary hypothesis to test with data is...',
          evaluationRubric: [
            { criterion: 'MECE Completeness', idealTarget: 'Branches are non-overlapping and collectively exhaustive' },
            { criterion: 'Business Acumen', idealTarget: 'Incorporates realistic operational and financial considerations' }
          ]
        },
        quiz: [
          {
            id: 'q-pg2-1',
            question: 'What does the MECE principle stand for in management case structuring?',
            conceptKey: 'MECE Principle',
            options: [
              { id: 'a', text: 'Mutually Exclusive, Collectively Exhaustive', isCorrect: true, explanation: 'MECE ensures problem branches do not overlap and no major possibility is omitted.' },
              { id: 'b', text: 'More Energy, Clearer English', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'c', text: 'Managing Employees and Corporate Executives', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'Maximum Earnings, Controlled Expenses', isCorrect: false, explanation: 'Incorrect.' }
            ]
          },
          {
            id: 'q-pg2-2',
            question: 'What is the "Pyramid Principle" in executive communication?',
            conceptKey: 'Executive Communication',
            options: [
              { id: 'a', text: 'Delivering the main recommendation/conclusion first, followed by supporting grouped arguments and evidence', isCorrect: true, explanation: 'Executives need the headline conclusion upfront, backed by structured supporting logic.' },
              { id: 'b', text: 'Speaking only to the person with the highest salary', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'c', text: 'Drawing triangles on every slide', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'Starting with your childhood history before mentioning business results', isCorrect: false, explanation: 'Chronological rambling frustrates busy executives.' }
            ]
          },
          {
            id: 'q-pg2-3',
            question: 'In a management case interview, why should you pause and ask clarifying questions before proposing solutions?',
            conceptKey: 'Diagnostic Rigor',
            options: [
              { id: 'a', text: 'To ensure you understand the exact problem constraints, industry benchmark, and objective function before solving', isCorrect: true, explanation: 'Proposing solutions to the wrong problem is the primary reason candidates fail case interviews.' },
              { id: 'b', text: 'To delay the interview because you do not know the answer', isCorrect: false, explanation: 'Questions must be purposeful and diagnostic.' },
              { id: 'c', text: 'To prove that the interviewer wrote a bad case', isCorrect: false, explanation: 'Combative behavior ruins candidate suitability.' },
              { id: 'd', text: 'Clarifying questions are forbidden in consulting interviews', isCorrect: false, explanation: 'Clarifying questions are expected and actively evaluated.' }
            ]
          },
          {
            id: 'q-pg2-4',
            question: 'How should an MBA candidate address risk when presenting a strategic business proposal?',
            conceptKey: 'Risk Mitigation Framework',
            options: [
              { id: 'a', text: 'Explicitly identify potential downside risks and outline actionable mitigation triggers and pilot testing milestones', isCorrect: true, explanation: 'Mature business leaders anticipate risks and build governance safeguards.' },
              { id: 'b', text: 'Promise that your strategy has exactly zero risk and can never fail', isCorrect: false, explanation: 'All commercial initiatives carry risk; denying it reveals lack of real-world experience.' },
              { id: 'c', text: 'Refuse to discuss risk because it sounds pessimistic', isCorrect: false, explanation: 'Ignoring risk leads to operational failure.' },
              { id: 'd', text: 'Blame government regulations in advance', isCorrect: false, explanation: 'Regulatory compliance must be baked into feasibility analysis.' }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MODULE 14: PROFESSIONAL DEGREES (CLINICAL, LAW & CA ARTICLESHIP)
  // =========================================================================
  {
    id: 'module-prof-clinical-legal',
    order: 14,
    pathwayId: 'professional_degree',
    title: 'Clinical Vivas, Legal Advocacy & CA Articleship',
    subtitle: 'SOAP Clinical Cases, Statutory Auditing & IRAC Legal Arguments',
    description: 'Specialized preparation for clinical bed-side vivas (MBBS/Nursing/Pharmacy), moot court and chamber advocacy (Law), and Big 4 CA articleship interviews.',
    iconName: 'Activity',
    category: 'Clinical & Legal',
    targetAudience: 'MBBS, BDS, Nursing, Pharmacy, Law (LLB), and Chartered Accountancy Students',
    lessons: [
      {
        id: 'lesson-prof-1',
        moduleId: 'module-prof-clinical-legal',
        pathwayId: 'professional_degree',
        number: 19,
        title: 'Clinical Case Presentations & Medical Residency Vivas',
        subtitle: 'Mastering the SOAP Format, Bedside Vivas & Patient Communication',
        estimatedMinutes: 9,
        tags: ['Healthcare', 'Medicine', 'MBBS', 'Nursing', 'Pharmacy', 'Clinical Viva', 'SOAP'],
        objective: 'Learn how to present real patient case records using the SOAP framework, defend differential diagnoses with clinical pharmacology, and communicate empathetically with patient families.',
        sections: [
          {
            id: 'prof1-s1',
            title: '1. The Universal Clinical Case Presentation: SOAP Method',
            content: `In medical, nursing, and clinical pharmacy vivas, examiners evaluate patient safety, systematic diagnostic deduction, and clinical ethics using **SOAP**:

- **Subjective (S):** Chief complaint in patient\'s own words with duration, History of Present Illness (HPI), past medical history, drug allergies.
- **Objective (O):** Vital signs (BP, pulse, SpO2, respiratory rate, temp), systemic physical exam findings, verified lab and imaging data.
- **Assessment (A):** Primary differential diagnosis supported by specific exam findings, rule-outs.
- **Plan (P):** Immediate therapeutic interventions, confirmatory diagnostic investigations, nursing care plan, and patient education.`,
            keyTakeaways: [
              'Never present random lab numbers without tying them back to the primary clinical assessment.',
              'Always state drug allergies before discussing pharmacological management.',
              'Patient confidentiality and dignity must be preserved in all case discussions.'
            ]
          },
          {
            id: 'prof1-s2',
            title: '2. Defending Differential Diagnoses Under Examiner Cross-Examination',
            content: `Medical examiners test your diagnostic boundaries:
- *"Why did you rule out pulmonary embolism in this dyspneic patient?"*
- *"What contraindication prevents prescribing NSAIDs here?"*

**The Structured Clinical Defense:**
1. Cite pertinent negatives from history (e.g., no calf swelling, normal D-dimer).
2. Point to hemodynamic stability parameters.
3. Balance therapeutic benefits against contraindications (e.g., renal impairment, active peptic ulcer).`,
            keyTakeaways: [
              'Use "pertinent negatives" to justify excluding alternative diagnoses.',
              'Pharmacological mechanism and renal/hepatic clearance must guide drug choice.',
              'Maintain composed bedside professional bedside manner.'
            ]
          }
        ],
        examples: [
          {
            id: 'prof1-ex1',
            scenario: 'Clinical Examiner asks: "Walk me through your assessment of this 58-year-old diabetic patient presenting with acute epigastric pain."',
            badExample: {
              text: 'Sir, it is clearly acid gastritis because he ate spicy food yesterday. I prescribed antacids and ranitidine.',
              analysis: 'Fatal diagnostic oversight: fails to consider atypical acute myocardial infarction in diabetic patients.'
            },
            goodExample: {
              text: 'In any diabetic patient presenting with acute epigastric discomfort, atypical acute coronary syndrome must remain at the top of our differential diagnosis due to autonomic neuropathy blunting classic retrosternal angina. My immediate objective step was obtaining a 12-lead ECG within 10 minutes and ordering serial cardiac troponins. While the patient reported mild nausea, vital signs showed a BP of 90/60 and diaphoresis, which heightens suspicion of an inferior wall MI involving the right coronary artery before considering peptic ulcer disease.',
              analysis: 'Exemplifies clinical maturity, prioritizes life-threatening emergencies, cites pathophysiological mechanisms (autonomic neuropathy), and acts on vital hemodynamic signs.'
            },
            proTip: 'In healthcare vivas, always rule out life-threatening differential emergencies before settling on benign diagnoses.'
          }
        ],
        exercise: {
          id: 'ex-prof-1',
          title: 'Draft a SOAP Clinical Case Presentation',
          type: 'script_builder',
          instructions: 'Structure a clinical case presentation using the SOAP methodology.',
          prompt: 'Select a clinical case scenario and outline: 1) Subjective chief complaint & pertinent history, 2) Objective vitals & physical findings, 3) Primary differential with justification, 4) Treatment & investigation plan.',
          starterTemplate: 'Presenting patient [Age/Gender] who presented with chief complaints of...\n\nOn objective examination, vital signs showed...\n\nBased on these findings, our primary assessment is [Diagnosis] because...\n\nOur initial management plan consists of...',
          evaluationRubric: [
            { criterion: 'Diagnostic Hierarchy', idealTarget: 'Prioritizes life-threatening conditions appropriately' },
            { criterion: 'Clinical Evidence', idealTarget: 'Supports assessment with objective examination findings' }
          ]
        },
        quiz: [
          {
            id: 'q-prof1-1',
            question: 'What does the SOAP clinical presentation format stand for?',
            conceptKey: 'SOAP Clinical Methodology',
            options: [
              { id: 'a', text: 'Subjective, Objective, Assessment, Plan', isCorrect: true, explanation: 'SOAP is the global standard for patient case documentation and clinical viva presentation.' },
              { id: 'b', text: 'Standard Operating Administrative Procedure', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'c', text: 'Symptoms, Observations, Antibiotics, Prescription', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'Surgery, Oncology, Anesthesia, Pediatrics', isCorrect: false, explanation: 'Incorrect.' }
            ]
          },
          {
            id: 'q-prof1-2',
            question: 'In diabetic patients presenting with vague epigastric discomfort, why must an ECG and cardiac enzymes be ordered immediately?',
            conceptKey: 'Atypical ACS in Diabetes',
            options: [
              { id: 'a', text: 'Diabetic autonomic neuropathy frequently blunts classic angina, presenting with atypical acute coronary syndrome', isCorrect: true, explanation: 'Diabetics often experience silent or atypical heart attacks without classic chest pressure.' },
              { id: 'b', text: 'Because diabetes is caused by heart valves', isCorrect: false, explanation: 'Factually inaccurate.' },
              { id: 'c', text: 'Hospital policy requires ECGs for all headaches', isCorrect: false, explanation: 'Irrelevant.' },
              { id: 'd', text: 'To increase the hospital bill', isCorrect: false, explanation: 'Ethical clinical care mandates emergency ruling-out of life threats.' }
            ]
          },
          {
            id: 'q-prof1-3',
            question: 'What are "pertinent negatives" in a clinical viva examination?',
            conceptKey: 'Pertinent Negatives',
            options: [
              { id: 'a', text: 'The absence of specific symptoms or signs that helps rule out alternative life-threatening diagnoses', isCorrect: true, explanation: 'Documenting that a patient has NO fever, NO neck stiffness, or NO jaundice systematically narrows differentials.' },
              { id: 'b', text: 'Negative thoughts that a doctor has during surgery', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'c', text: 'Lost laboratory blood samples', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'Complaints made by rude patients', isCorrect: false, explanation: 'Incorrect.' }
            ]
          },
          {
            id: 'q-prof1-4',
            question: 'Before prescribing or administering any pharmacological agent, what is the mandatory safety verification?',
            conceptKey: 'Medication Safety & Allergies',
            options: [
              { id: 'a', text: 'Verify patient identity, known drug allergies, renal/hepatic clearance status, and drug-drug interactions', isCorrect: true, explanation: 'Systematic pre-administration safety checks prevent fatal anaphylaxis and toxicity.' },
              { id: 'b', text: 'Ask if the patient likes the colour of the tablet', isCorrect: false, explanation: 'Irrelevant.' },
              { id: 'c', text: 'Administer the maximum possible dose to see if it works fast', isCorrect: false, explanation: 'Dangerous and causes severe toxicity.' },
              { id: 'd', text: 'Check the patient\'s bank balance', isCorrect: false, explanation: 'Unethical.' }
            ]
          }
        ]
      },
      {
        id: 'lesson-prof-2',
        moduleId: 'module-prof-clinical-legal',
        pathwayId: 'professional_degree',
        number: 20,
        title: 'Legal Advocacy, Mooting & CA Articleship Interviews',
        subtitle: 'Statutory Interpretation, IRAC Argumentation & Big 4 Auditing Rounds',
        estimatedMinutes: 9,
        tags: ['Law', 'LLB', 'Chartered Accountancy', 'CA Articleship', 'Big 4', 'Auditing', 'Legal Advocacy'],
        objective: 'Master statutory interpretation and IRAC advocacy for legal interviews, and demonstrate audit compliance, accounting standards (Ind AS), and tax acumen for CA articleship selection.',
        sections: [
          {
            id: 'prof2-s1',
            title: '1. Legal Advocacy & Chamber Interviews: The IRAC Method',
            content: `Senior advocates, law firms (e.g. Cyril Amarchand Mangaldas, Shardul Amarchand, Khaitan & Co), and judicial interviewers evaluate structured statutory argumentation using **IRAC**:

- **Issue (I):** State the precise legal question in controversy.
- **Rule (R):** Cite relevant constitutional provisions, statutes, or landmark Supreme Court precedents.
- **Application (A):** Apply the statutory rule to the specific material facts of the case.
- **Conclusion (C):** Deliver the reasoned legal relief or outcome.`,
            keyTakeaways: [
              'Ground legal arguments in statutory provisions and binding judicial ratio decidendi.',
              'Distinguish between judicial ratio decidendi and obiter dicta when citing precedents.',
              'Maintain judicial decorum, respectful speech, and precise legal terminology.'
            ]
          },
          {
            id: 'prof2-s2',
            title: '2. Acing Big 4 CA Articleship Selection (Audit & Tax)',
            content: `For CA students clearing intermediate and interviewing at Big 4 firms (Deloitte, PwC, EY, KPMG) or leading tax consultancies:
1. **Auditing Standards & Skepticism:** Can you explain how you would verify revenue recognition under Ind AS 115? How do you test for management override of controls?
2. **Substantive Testing vs Control Testing:** Walk through vouching, third-party bank confirmations, and inventory physical verification procedures.
3. **Professional Skepticism:** Demonstrating an inquiring mind that does not accept management representations blindly without corroborating audit trail evidence.`,
            keyTakeaways: [
              'Highlight professional skepticism and ethical independence.',
              'Know recent changes in corporate compliance, GST notifications, and direct tax case law.',
              'Be prepared to explain practical excel modeling and audit sampling techniques.'
            ]
          }
        ],
        examples: [
          {
            id: 'prof2-ex1',
            scenario: 'Big 4 Partner asks a CA articleship candidate: "How would you verify whether a client company has overstated its accounts receivable at financial year-end?"',
            badExample: {
              text: 'Sir, I will check the balance sheet and if the CFO says the debtors are good, I will sign the audit report.',
              analysis: 'Displays catastrophic lack of professional skepticism and zero knowledge of audit procedures.'
            },
            goodExample: {
              text: 'I would perform a combination of substantive analytical procedures and test of details. First, I would prepare a debtor aging analysis to assess the adequacy of expected credit loss provisions under Ind AS 109. Second, I would send direct, independent external balance confirmations to a stratified sample of major debtors under SA 505. For unconfirmed balances, I would perform alternative procedures by inspecting subsequent period cash realizations in bank statements and verifying underlying GST e-invoices and proof of delivery.',
              analysis: 'Demonstrates professional standards (Ind AS 109, SA 505), concrete audit procedures (external confirmation, subsequent realization, delivery proof), and professional skepticism.'
            },
            proTip: 'Referencing specific Auditing Standards (SA) and Accounting Standards (Ind AS) demonstrates industry-ready competence.'
          }
        ],
        exercise: {
          id: 'ex-prof-2',
          title: 'Draft a Structured Audit or Legal Response',
          type: 'script_builder',
          instructions: 'Draft a structured professional answer using either IRAC (Law) or Standard Auditing Procedures (CA).',
          prompt: 'Write your response: 1) Applicable statute / standard (e.g. SA 500 / Sec 9 CPC), 2) Core verification procedure or legal test, 3) Handling contradictory evidence.',
          starterTemplate: 'Under the provisions of [Statute / Standard]...\n\nThe primary verification procedure involves...\n\nIf contradictory evidence arises, the appropriate professional action is...',
          evaluationRubric: [
            { criterion: 'Statutory Grounding', idealTarget: 'Accurately cites relevant legal or auditing standards' },
            { criterion: 'Professional Skepticism', idealTarget: 'Exhibits due professional care and independent validation' }
          ]
        },
        quiz: [
          {
            id: 'q-prof2-1',
            question: 'What does IRAC stand for in structured legal argumentation?',
            conceptKey: 'IRAC Legal Framework',
            options: [
              { id: 'a', text: 'Issue, Rule, Application, Conclusion', isCorrect: true, explanation: 'IRAC is the universal standard for legal briefs, oral arguments, and judicial reasoning.' },
              { id: 'b', text: 'International Rights and Arbitration Council', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'c', text: 'Investigation, Report, Action, Closure', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'Income, Revenue, Assets, Capital', isCorrect: false, explanation: 'Incorrect.' }
            ]
          },
          {
            id: 'q-prof2-2',
            question: 'In statutory financial audits, what is the core meaning of "Professional Skepticism"?',
            conceptKey: 'Professional Skepticism',
            options: [
              { id: 'a', text: 'An attitude that includes a questioning mind, being alert to conditions indicating possible misstatement, and critical assessment of audit evidence', isCorrect: true, explanation: 'Auditors must not assume management is dishonest, but must independently verify representations with documentary evidence.' },
              { id: 'b', text: 'Believing that every client is an international criminal without looking at numbers', isCorrect: false, explanation: 'Skepticism is objective and evidence-based, not malicious bias.' },
              { id: 'c', text: 'Refusing to do any work because you doubt everything', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'Signing every financial statement without reviewing the receipts', isCorrect: false, explanation: 'That is the opposite of skepticism; it is audit negligence.' }
            ]
          },
          {
            id: 'q-prof2-3',
            question: 'Under Standard on Auditing (SA) 505, why are independent external debtor confirmations superior to internal company receipts?',
            conceptKey: 'Audit Evidence Hierarchy',
            options: [
              { id: 'a', text: 'Audit evidence obtained directly from independent external third parties is generally more reliable than evidence generated internally by the client', isCorrect: true, explanation: 'External confirmations reduce the risk of internal document manipulation and fictitious receivables.' },
              { id: 'b', text: 'Because external letters look nicer in the audit file', isCorrect: false, explanation: 'Substance and legal reliability determine evidence quality.' },
              { id: 'c', text: 'Because internal company receipts are legally prohibited in India', isCorrect: false, explanation: 'Internal receipts exist, but are subject to internal control risks.' },
              { id: 'd', text: 'To avoid speaking to the company CFO', isCorrect: false, explanation: 'Incorrect.' }
            ]
          },
          {
            id: 'q-prof2-4',
            question: 'In legal cross-examination, what is the distinction between "Ratio Decidendi" and "Obiter Dicta"?',
            conceptKey: 'Legal Precedent Principles',
            options: [
              { id: 'a', text: 'Ratio Decidendi is the binding legal principle essential to the court\'s decision; Obiter Dicta are incidental judicial observations that carry persuasive but not binding authority', isCorrect: true, explanation: 'Only the ratio of a judgment forms binding precedent under Article 141 of the Constitution.' },
              { id: 'b', text: 'Ratio is for criminal cases; Obiter is for civil cases', isCorrect: false, explanation: 'Both concepts apply across civil, criminal, and constitutional law.' },
              { id: 'c', text: 'Ratio is written in English; Obiter is written in Latin', isCorrect: false, explanation: 'Both are Latin legal terms used in modern judicial writing.' },
              { id: 'd', text: 'There is no difference between them', isCorrect: false, explanation: 'Understanding the distinction is fundamental to legal advocacy.' }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MODULE 15: ITI & VOCATIONAL ACADEMY (WORKSHOP SAFETY & TRADES)
  // =========================================================================
  {
    id: 'module-iti-trade',
    order: 15,
    pathwayId: 'iti_vocational',
    title: 'Trade Theory, Tool Usage & Workshop Safety',
    subtitle: 'Machinery Operation, Safety Compliance & Technical Apprenticeships',
    description: 'Practical explanations for electrical wiring, fitting, machining, and strict workplace PPE safety compliance for railway and PSU jobs.',
    iconName: 'ShieldAlert',
    category: 'Trade & Vocational',
    targetAudience: 'ITI Students (Electrician, Fitter, Welder, Machinist, Turner, Motor Mechanic)',
    lessons: [
      {
        id: 'lesson-iti-1',
        moduleId: 'module-iti-trade',
        pathwayId: 'iti_vocational',
        number: 21,
        title: 'Workshop Safety, Machine Operation & Trade Theory',
        subtitle: 'Articulating Hands-On Competency in Electrical, Mechanical and Fitting Trades',
        estimatedMinutes: 8,
        tags: ['ITI', 'Trade Theory', 'Electrician', 'Fitter', 'Workshop Safety', 'Apprenticeship'],
        objective: 'Learn how to describe trade tools, instrument calibration, machine operation procedures, and workplace safety compliance for technical trade hiring boards.',
        sections: [
          {
            id: 'iti1-s1',
            title: '1. What Trade Testing Boards & Industrial Employers Evaluate',
            content: `In interviews for ITI technicians (e.g. Indian Railways RRB ALP/Technician, DRDO, ISRO technicians, BHEL, state power utilities, automotive assembly lines), examiners assess:

1. **Precision Measuring Instruments:** Reading vernier calipers, micrometers, multimeters, and wire gauges accurately without parallax error.
2. **Tool Identification & Care:** Proper maintenance of files, hacksaws, chisels, reamers, and crimping tools.
3. **Safe Machinery Startup:** Knowing the step-by-step procedure to start and stop a lathe, drill press, welding transformer, or motor-generator set.
4. **Fire Safety & Classes of Fire:** Knowing whether to use water, CO2, foam, or dry chemical powder for electrical versus oil fires.`,
            keyTakeaways: [
              'Name precision measuring tools and their least count (e.g. Vernier micrometer least count = 0.01 mm).',
              'Never touch an electrical fire with water; use CO2 or dry chemical powder extinguishers.',
              'Emphasize disciplined tool cleaning and storage after every job.'
            ]
          },
          {
            id: 'iti1-s2',
            title: '2. Personal Protective Equipment (PPE) & First Aid',
            content: `Safety questions are pass/fail elimination criteria:
- **Footwear:** Steel-toed leather safety shoes with electrical insulation.
- **Eye & Face Protection:** Shaded welding helmets for arc eye prevention, safety goggles on grinders.
- **Hands:** Heat-resistant leather gloves for welding; insulating rubber gloves for live electrical testing.
- **First Aid Protocol:** Immediate action in case of electric shock: isolate power supply, do not touch victim directly with bare hands; use wooden dry stick, initiate CPR if pulse absent.`,
            keyTakeaways: [
              'Memorize the exact PPE required for your trade.',
              'Know the electric shock resuscitation emergency sequence step by step.',
              'Explain shopfloor housekeeping (5S methodology).'
            ]
          }
        ],
        examples: [
          {
            id: 'iti1-ex1',
            scenario: 'Railway Trade Examiner asks an ITI Electrician candidate: "What will you do first if a coworker suffers an electric shock in the substation workshop?"',
            badExample: {
              text: 'Sir, I will grab his hand and pull him away immediately, then run out to call everyone.',
              analysis: 'Fatal error: grabbing an energized person conducts current into your own body, causing two casualties.'
            },
            goodExample: {
              text: 'I will immediately isolate the electrical power by hitting the emergency trip switch or main circuit breaker. If the switch is not immediately reachable, I will stand on a dry insulating rubber mat and use a dry wooden stick or non-conductive prop to disengage the victim from the live wire without touching them directly. Once separated, I will check airway, breathing, and pulse, call the plant medical emergency number, and initiate CPR if breathing is absent.',
              analysis: 'Flawless emergency protocol: isolations first, non-conductive rescue tool, immediate medical notification, and life-saving CPR sequence.'
            },
            proTip: 'In trade safety questions, never touch an energized victim with bare hands—isolate the circuit first.'
          }
        ],
        exercise: {
          id: 'ex-iti-1',
          title: 'Explain Safe Tool Operation & Pre-Check Steps',
          type: 'checklist',
          instructions: 'Outline the safety pre-check and operating steps for a core machine in your trade.',
          prompt: 'Choose one machine (Lathe, Grinder, Transformer, Milling machine): 1) PPE required, 2) Zero-error and guard check, 3) Safe start sequence, 4) Post-operation cleanup.',
          evaluationRubric: [
            { criterion: 'Safety Thoroughness', idealTarget: 'Lists correct PPE and emergency stop verification' },
            { criterion: 'Technical Terminology', idealTarget: 'Uses correct trade terminology' }
          ]
        },
        quiz: [
          {
            id: 'q-iti1-1',
            question: 'What type of fire extinguisher must NEVER be used on an energized electrical fire?',
            conceptKey: 'Fire Extinguisher Safety',
            options: [
              { id: 'a', text: 'Water-based fire extinguisher', isCorrect: true, explanation: 'Water conducts electricity and causes fatal electrocution when sprayed on energized circuits.' },
              { id: 'b', text: 'Carbon Dioxide (CO2) extinguisher', isCorrect: false, explanation: 'CO2 is non-conductive and standard for electrical fires.' },
              { id: 'c', text: 'Dry Chemical Powder (DCP) extinguisher', isCorrect: false, explanation: 'DCP is approved for Class C electrical fires.' },
              { id: 'd', text: 'Dry clean sand', isCorrect: false, explanation: 'Dry sand is a non-conductive extinguishing agent.' }
            ]
          },
          {
            id: 'q-iti1-2',
            question: 'What is the standard least count of a metric vernier caliper commonly used in trade workshops?',
            conceptKey: 'Precision Instruments',
            options: [
              { id: 'a', text: '0.02 mm', isCorrect: true, explanation: 'Standard metric vernier calipers have a least count of 0.02 mm (50 vernier scale divisions over 49 mm).' },
              { id: 'b', text: '2.0 cm', isCorrect: false, explanation: 'Completely inaccurate.' },
              { id: 'c', text: '1 meter', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: '0.5 inches', isCorrect: false, explanation: 'Incorrect.' }
            ]
          },
          {
            id: 'q-iti1-3',
            question: 'Why must bench grinding machines always be fitted with a sturdy wheel guard and transparent eye shield?',
            conceptKey: 'Machine Guarding',
            options: [
              { id: 'a', text: 'To protect the technician from flying metal sparks, abrasive grit, and catastrophic wheel fragmentation', isCorrect: true, explanation: 'Grinding wheels rotate at high RPM; fragmentation without guards can cause fatal projectile injuries.' },
              { id: 'b', text: 'To make the workshop look neat', isCorrect: false, explanation: 'Guards are life-saving physical barriers, not aesthetic decorations.' },
              { id: 'c', text: 'To stop the motor from getting dusty', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'To hide the wheel when it is not working', isCorrect: false, explanation: 'Incorrect.' }
            ]
          },
          {
            id: 'q-iti1-4',
            question: 'What does the 5S methodology widely practiced in industrial workshops emphasize?',
            conceptKey: '5S Shopfloor Methodology',
            options: [
              { id: 'a', text: 'Sort, Set in order, Shine, Standardize, and Sustain', isCorrect: true, explanation: '5S is the foundational workplace organization methodology creating clean, efficient, accident-free shopfloors.' },
              { id: 'b', text: 'Speed, Salary, Sleeping, Screaming, and Shifting', isCorrect: false, explanation: 'Absurd.' },
              { id: 'c', text: 'Selling Steel to Several Secondary Suppliers', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'System Security Software Server Storage', isCorrect: false, explanation: 'Incorrect.' }
            ]
          }
        ]
      },
      {
        id: 'lesson-iti-2',
        moduleId: 'module-iti-trade',
        pathwayId: 'iti_vocational',
        number: 22,
        title: 'Railway, PSU & Industrial Apprenticeship Selection',
        subtitle: 'Cracking Trade Tests, Medical Standards & Government Verification',
        estimatedMinutes: 8,
        tags: ['ITI', 'Railways', 'RRB', 'DRDO', 'PSU', 'Apprenticeship', 'Trade Test'],
        objective: 'Prepare for public sector apprenticeship and technician recruitment tests, understand trade test formats, document verification, and medical fitness standards.',
        sections: [
          {
            id: 'iti2-s1',
            title: '1. Public Sector Trade Test & Document Verification Protocols',
            content: `Selection for public sector technicians (Indian Railways, Ordnance Factories, Power Grid, IOCL, ONGC, SAIL) involves a 2-stage verification:

1. **Hands-on Trade Skill Test:** You are given a technical drawing and raw workpiece (e.g. MS flat for fitting, copper cable for conduit wiring). You must cut, file, drill, tap, or wire within a strict time limit (usually 2-3 hours) adhering to engineering tolerances.
2. **Original Certificate Verification:** National Trade Certificate (NTC) / National Apprenticeship Certificate (NAC) issued by NCVT/SCVT, caste certificate, age proof.
3. **Medical Fitness Categories:** E.g. Indian Railways A-1, B-1 categories with strict distant vision (6/6), color blindness testing (Ishihara chart), and absence of vertigo.`,
            keyTakeaways: [
              'Trade tests are qualifying in nature; finish accurately within tolerances rather than rushing.',
              'Ensure all NCVT certificates have zero spelling discrepancies with your Aadhaar and 10th marks memo.',
              'Be aware of strict eyesight criteria if targeting train operator (ALP) roles.'
            ]
          },
          {
            id: 'iti2-s2',
            title: '2. Answering Personal Interview Questions for Trade Roles',
            content: `Recruiters evaluate punctuality, willingness to perform physical labor, and adaptability:
- *"Are you comfortable working in underground pits, trackside lines, or heights?"*
- *"Why do you want an apprenticeship rather than a higher degree right now?"*

**Winning Trade Response:**
Emphasize that hands-on technical craftsmanship is your chosen trade. Express pride in building and maintaining critical physical infrastructure, and state your long-term goal of becoming a master technician or chargehand.`,
            keyTakeaways: [
              'Show genuine pride in skilled technical craftsmanship.',
              'Confirm physical readiness for outdoor, shift, and trackside maintenance work.'
            ]
          }
        ],
        examples: [
          {
            id: 'iti2-ex1',
            scenario: 'PSU Interview Board asks: "Why should we hire you as a technician apprentice over candidates who have diploma degrees?"',
            badExample: {
              text: 'Sir, diploma people are too proud and will not do dirty work, but I will do whatever you say because I have no choice.',
              analysis: 'Demeaning and sounds desperate rather than professionally capable.'
            },
            goodExample: {
              text: 'My two years of rigorous ITI training have been 70% hands-on in the workshop. I have spent over 1,200 hours physically operating lathes, calibrating micrometers, and practicing precision fitting within 0.05 mm tolerances. I am trained specifically for shopfloor execution, tool maintenance, and strict safety compliance from day one, without needing basic workshop familiarization.',
              analysis: 'Focuses on verified practical hours (1200+ hours), precision metrics (0.05 mm), and immediate shopfloor productivity.'
            },
            proTip: 'Quantify your workshop hours and precision tolerances when proving your hands-on advantage.'
          }
        ],
        exercise: {
          id: 'ex-iti-2',
          title: 'Draft Your Technical Apprenticeship Value Statement',
          type: 'script_builder',
          instructions: 'Draft a 60-second response highlighting your hands-on trade skills for an industrial employer.',
          prompt: 'Write your: 1) ITI Trade & NCVT training summary, 2) Core machines/tools you operate confidently, 3) Precision tolerance or safety record, 4) Willingness to learn under senior supervisors.',
          starterTemplate: 'Respected interview panel, I completed my ITI in [Trade] from...\n\nI have practical hands-on experience in operating...\n\nI take pride in working with precision and strict safety compliance...\n\nI look forward to contributing as a disciplined technician apprentice...',
          evaluationRubric: [
            { criterion: 'Hands-on Competence', idealTarget: 'Mentions specific tools and operational familiarity' },
            { criterion: 'Professional Discipline', idealTarget: 'Emphasizes punctuality and safety commitment' }
          ]
        },
        quiz: [
          {
            id: 'q-iti2-1',
            question: 'What certificate certifies that a candidate has successfully completed ITI training under the National Council for Vocational Training in India?',
            conceptKey: 'Vocational Certification',
            options: [
              { id: 'a', text: 'National Trade Certificate (NTC)', isCorrect: true, explanation: 'The NTC is the recognized national credential awarded by NCVT upon passing all trade examinations.' },
              { id: 'b', text: 'Driving License', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'c', text: 'Passport', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'Bank passbook', isCorrect: false, explanation: 'Incorrect.' }
            ]
          },
          {
            id: 'q-iti2-2',
            question: 'In Indian Railways and PSU technician trade tests, what is the primary evaluation criteria?',
            conceptKey: 'Trade Test Scoring',
            options: [
              { id: 'a', text: 'Dimensional accuracy according to the engineering drawing, tool handling technique, and safety compliance within time limit', isCorrect: true, explanation: 'Workpieces are evaluated with precision instruments for exact dimensional tolerance.' },
              { id: 'b', text: 'Singing songs while filing metal', isCorrect: false, explanation: 'Nonsense.' },
              { id: 'c', text: 'Who finished in the first five minutes regardless of size errors', isCorrect: false, explanation: 'Rushing with dimensional errors results in failing the trade test.' },
              { id: 'd', text: 'Painting the workpiece with gold color', isCorrect: false, explanation: 'Incorrect.' }
            ]
          },
          {
            id: 'q-iti2-3',
            question: 'Why is the Ishihara color vision test strictly administered for Railway technician and loco pilot candidates?',
            conceptKey: 'Railway Medical Standards',
            options: [
              { id: 'a', text: 'To ensure candidates can distinguish colored railway signal lights (red, green, amber) accurately for operational train safety', isCorrect: true, explanation: 'Color blindness causes signal passing at danger (SPAD), endangering passenger safety.' },
              { id: 'b', text: 'To see if candidates like art and painting', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'c', text: 'To check if the candidate has an eye infection', isCorrect: false, explanation: 'Ishihara plates specifically test for red-green congenital color vision deficiencies.' },
              { id: 'd', text: 'It is a test of handwriting speed', isCorrect: false, explanation: 'Incorrect.' }
            ]
          },
          {
            id: 'q-iti2-4',
            question: 'When asked if you are willing to work in rotating night shifts or outdoor trackside environments, how should you respond?',
            conceptKey: 'Industrial Shift Willingness',
            options: [
              { id: 'a', text: 'Confirm your physical fitness, positive attitude, and full commitment to shift requirements and maintenance schedules', isCorrect: true, explanation: 'Public sector utilities and railways operate 24/7; operational dependability is vital.' },
              { id: 'b', text: 'Say that you only work from 10 AM to 4 PM in an air-conditioned cabin', isCorrect: false, explanation: 'Completely incompatible with technical field roles.' },
              { id: 'c', text: 'Demand double pay in advance before answering', isCorrect: false, explanation: 'Inappropriate and arrogant.' },
              { id: 'd', text: 'Say you get sleepy after 8 PM every day', isCorrect: false, explanation: 'Shows unsuitability for rotating operational shifts.' }
            ]
          }
        ]
      }
    ]
  },

  // =========================================================================
  // MODULE 16: CORPORATE & TECHNOLOGY ACADEMY (SYSTEM DESIGN & STAR)
  // =========================================================================
  {
    id: 'module-corp-advanced',
    order: 16,
    pathwayId: 'corporate_tech',
    title: 'System Design Architecture & Advanced STAR',
    subtitle: 'Distributed Systems, High-Level Architecture & Leadership Principles',
    description: 'Whiteboard scalable distributed systems, APIs, database trade-offs, and deliver high-stakes executive leadership stories for product companies.',
    iconName: 'Sparkles',
    category: 'Corporate & System Design',
    targetAudience: 'Senior Engineers, Tech Leads, Engineering Graduates targeting Tier-1 Product Companies',
    lessons: [
      {
        id: 'lesson-corp-1',
        moduleId: 'module-corp-advanced',
        pathwayId: 'corporate_tech',
        number: 23,
        title: 'System Design & High-Level Architecture',
        subtitle: 'Scalability, Load Balancing, Caching & Database Sharding',
        estimatedMinutes: 10,
        tags: ['System Design', 'Architecture', 'High Level Design', 'Distributed Systems', 'Tech Product'],
        objective: 'Master system design whiteboard interviews: requirements estimation, API design, data modeling, caching strategies, and CAP theorem trade-offs for scalable systems.',
        sections: [
          {
            id: 'corp1-s1',
            title: '1. The 5-Step System Design Interview Framework',
            content: `In Tier-1 tech interviews (e.g. Google, Microsoft, Uber, Amazon, Swiggy, Razorpay), system design rounds evaluate how you navigate trade-offs:

1. **Scope & Requirements (5 mins):** Clarify functional (e.g. generate short URL, redirect) vs non-functional requirements (low latency < 20ms, 99.99% availability).
2. **Back-of-the-Envelope Estimation (5 mins):** Calculate read/write QPS, daily active users (DAU), storage capacity over 5 years, and bandwidth throughput.
3. **High-Level Diagram (10 mins):** Client -> DNS -> Load Balancer -> API Gateway -> Stateless App Servers -> Cache (Redis) -> Primary/Replica Database.
4. **Data Model & Schema (10 mins):** Relational (ACID) vs NoSQL (Document/KV/Wide-column) justification.
5. **Deep Dive & Bottlenecks (15 mins):** Caching eviction policy (LRU), single points of failure (SPOF), partition sharding strategies, rate limiting.`,
            keyTakeaways: [
              'Never start drawing boxes before defining requirements and traffic estimates.',
              'Every architectural choice is a trade-off: state clearly what you gain and what you sacrifice.',
              'Design for failure: explain what happens if a database replica crashes.'
            ]
          },
          {
            id: 'corp1-s2',
            title: '2. The CAP Theorem & Consistency Trade-Offs',
            content: `When designing distributed systems across network partitions (P):
- **Consistency (CP):** Every read receives the most recent write or an error. Crucial for financial transactions, stock trades, and billing (e.g., PostgreSQL with synchronous replication, Google Spanner).
- **Availability (AP):** Every request receives a non-error response, without guaranteeing it contains the most recent write. Ideal for social feeds, video views, and chat status (e.g., Cassandra, DynamoDB with eventual consistency).`,
            keyTakeaways: [
              'You cannot have Consistency AND 100% Availability across an unreliable network partition.',
              'Justify choosing CP vs AP using business impact (financial correctness vs user engagement).'
            ]
          }
        ],
        examples: [
          {
            id: 'corp1-ex1',
            scenario: 'Interviewer asks: "Design a URL shortener like bit.ly that handles 100 million new URLs per month."',
            badExample: {
              text: 'I will write a Python script with Flask and save everything in MySQL. When user requests, I find it in MySQL and redirect.',
              analysis: 'Fails to calculate scale, ignores caching, lacks read/write ratio analysis, and creates a massive database bottleneck.'
            },
            goodExample: {
              text: 'Let us start with scale estimation. 100 million writes/month equals roughly 40 writes/second. Assuming a 100:1 read-to-write ratio, read traffic is 4,000 QPS, so our system is heavily read-dominant. For storage, 100M URLs * 500 bytes per record is 50 GB/month or 3 TB over 5 years, easily manageable on disk. Because reads dominate, we must place a Redis distributed cache in front of our database holding the top 20% most accessed URLs using an LRU eviction policy, resolving 80% of reads in sub-5ms memory time without touching the persistent database.',
              analysis: 'Exemplary back-of-the-envelope calculation, recognizes read-heavy pattern (100:1), calculates multi-year storage (3 TB), and introduces Redis LRU cache to shield the database.'
            },
            proTip: 'Explicitly calculating the read:write ratio immediately guides your caching and database replica architecture.'
          }
        ],
        exercise: {
          id: 'ex-corp-1',
          title: 'Draft Back-of-the-Envelope Capacity Estimations',
          type: 'script_builder',
          instructions: 'Calculate traffic and storage requirements for a high-scale service.',
          prompt: 'For a messaging service with 50M daily active users sending 10 messages/day: 1) Calculate write QPS, 2) Storage required per day (assume 200 bytes/msg), 3) Caching capacity needed.',
          starterTemplate: '1. Traffic Estimation: 50M users * 10 msgs = 500M msgs/day... QPS = ...\n\n2. Storage Estimation: 500M msgs * 200 bytes = ... GB/day...\n\n3. Caching Strategy: To cache 20% of peak daily active chat sessions...',
          evaluationRubric: [
            { criterion: 'Mathematical Accuracy', idealTarget: 'Converts daily volume into QPS correctly' },
            { criterion: 'Architectural Justification', idealTarget: 'Uses numbers to size cache and disk capacity' }
          ]
        },
        quiz: [
          {
            id: 'q-corp1-1',
            question: 'What is the first step you should take in a 45-minute system design interview?',
            conceptKey: 'System Design Framework',
            options: [
              { id: 'a', text: 'Clarify functional and non-functional requirements, traffic scale, and system boundaries', isCorrect: true, explanation: 'Jumping into diagrams before defining requirements leads to designing the wrong architecture.' },
              { id: 'b', text: 'Start drawing database tables immediately', isCorrect: false, explanation: ' Premature modeling without knowing query patterns creates flawed designs.' },
              { id: 'c', text: 'Ask the interviewer to solve it for you', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'Write 100 lines of Java code on the whiteboard', isCorrect: false, explanation: 'System design evaluates high-level architecture, not low-level code syntax.' }
            ]
          },
          {
            id: 'q-corp1-2',
            question: 'In a heavily read-dominant distributed system (e.g. 100 reads for every 1 write), what architectural component is critical to prevent database saturation?',
            conceptKey: 'Distributed Caching',
            options: [
              { id: 'a', text: 'In-memory distributed cache (like Redis or Memcached) with an LRU eviction policy and read replicas', isCorrect: true, explanation: 'Caches absorb 80-90% of read traffic in sub-millisecond memory time, preventing disk I/O bottlenecks on primary databases.' },
              { id: 'b', text: 'A bigger hard drive on the server', isCorrect: false, explanation: 'Disk capacity does not solve concurrent read IOPS saturation.' },
              { id: 'c', text: 'Turning off the database every hour', isCorrect: false, explanation: 'Causes total system downtime.' },
              { id: 'd', text: 'Deleting all customer accounts', isCorrect: false, explanation: 'Incorrect.' }
            ]
          },
          {
            id: 'q-corp1-3',
            question: 'According to the CAP Theorem, in the presence of a network partition, what fundamental trade-off must a distributed system make?',
            conceptKey: 'CAP Theorem Trade-Off',
            options: [
              { id: 'a', text: 'Choose between Consistency (returning latest data or error) or Availability (returning non-error response, possibly stale)', isCorrect: true, explanation: 'Network partitions are inevitable; distributed systems must choose CP or AP based on business requirements.' },
              { id: 'b', text: 'Choose between buying Dell or HP servers', isCorrect: false, explanation: 'Irrelevant.' },
              { id: 'c', text: 'Choose between paying taxes or paying employees', isCorrect: false, explanation: 'Irrelevant.' },
              { id: 'd', text: 'A system can easily guarantee 100% Consistency, 100% Availability, and 100% Partition Tolerance simultaneously', isCorrect: false, explanation: 'The CAP theorem mathematically proves this simultaneous guarantee is impossible across partitions.' }
            ]
          },
          {
            id: 'q-corp1-4',
            question: 'What is Database Sharding in high-scale data architectures?',
            conceptKey: 'Database Sharding',
            options: [
              { id: 'a', text: 'Horizontally partitioning a database table across multiple independent server instances using a shard key', isCorrect: true, explanation: 'Sharding distributes data and query load horizontally when a single database server hits physical write limits.' },
              { id: 'b', text: 'Deleting duplicate rows in a single Excel sheet', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'c', text: 'Backing up a database to a floppy disk', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'Encrypting a database with a secret password', isCorrect: false, explanation: 'That is encryption, not sharding.' }
            ]
          }
        ]
      },
      {
        id: 'lesson-corp-2',
        moduleId: 'module-corp-advanced',
        pathwayId: 'corporate_tech',
        number: 24,
        title: 'Advanced Behavioral Leadership & Amazon STAR Principles',
        subtitle: 'Delivering High-Impact Executive Stories with Measurable Business ROI',
        estimatedMinutes: 9,
        tags: ['Behavioral', 'Leadership Principles', 'Amazon LP', 'Executive Interview', 'STAR Method'],
        objective: 'Master high-stakes behavioral leadership rounds: delivering quantifiable STAR stories covering ownership, disagreement, bias for action, customer obsession, and failure reflection.',
        sections: [
          {
            id: 'corp2-s1',
            title: '1. The Senior STAR+R Framework',
            content: `For mid-to-senior corporate and tech roles, basic STAR stories are insufficient. Bar-raisers evaluate the **STAR+R Framework**:

- **Situation (S - 15%):** Business context, stakes, and team scale.
- **Task (T - 10%):** Your specific accountability and the conflict/constraint.
- **Action (A - 50%):** Your technical leadership, architectural decisions, and stakeholder management. What did YOU do (avoid generic *"we"*).
- **Result (R - 15%):** Quantifiable business outcome (revenue increase, latency drop, cost saved).
- **Reflection (R - 10%):** What you learned, what you would do differently with hindsight, and how it improved your future leadership.`,
            keyTakeaways: [
              'Spend 50% of your time on Action (what you decided, coded, mediated, or designed).',
              'Every Result must have numbers (% improvement, dollar savings, engineering hours freed).',
              'Bar-raisers love self-reflection: admitting what you learned shows executive maturity.'
            ]
          },
          {
            id: 'corp2-s2',
            title: '2. Handling "Have Backbone; Disagree and Commit"',
            content: `Top product tech companies look for leaders who respectfully challenge consensus when data contradicts intuition:
- Show you voiced concerns with data, not emotion.
- Show you proposed a safe compromise or A/B experiment.
- Show that once the final decision was made, you backed it 100% without passive-aggressive undermining.`,
            keyTakeaways: [
              'Disagreement must be backed by data and user impact.',
              'Once leadership decides, commit completely and execute with enthusiasm.'
            ]
          }
        ],
        examples: [
          {
            id: 'corp2-ex1',
            scenario: 'Interviewer asks: "Tell me about a time you strongly disagreed with a product manager or tech lead on a critical decision."',
            badExample: {
              text: 'My manager wanted to launch a feature with bugs. I told him he was making a huge mistake, but he did not listen. The feature crashed in production and I said I told you so.',
              analysis: 'Combative, uncollaborative, displays toxic "I told you so" attitude, and fails to offer constructive solutions.'
            },
            goodExample: {
              text: 'Our product team wanted to launch our checkout overhaul directly to 100% of users on Black Friday to meet quarterly targets. Based on our load testing, I was concerned that our payment gateway reconciliation API would face high latency spikes under 10x traffic. Instead of simply objecting, I proposed an automated canary deployment to 5% of traffic with automated rollbacks on any 5xx error spike above 0.1%. At 5% rollout, we detected a database dead-lock condition. We patched the query indexing within 30 minutes, successfully scaled to 100% traffic, and preserved 4.2 crores in festive sales volume with 99.98% checkout uptime.',
              analysis: 'Data-driven concern, proactive constructive compromise (canary release), quantifiable risk prevented, and huge financial metric saved (4.2 crores).'
            },
            proTip: 'Never leave a disagreement story at an impasse—show how you proposed a data-driven compromise like an A/B test or canary rollout.'
          }
        ],
        exercise: {
          id: 'ex-corp-2',
          title: 'Draft an Executive STAR+R Leadership Story',
          type: 'script_builder',
          instructions: 'Draft an executive behavioral leadership story with measurable business metrics.',
          prompt: 'Write out your: 1) Situation & business stakes, 2) Specific Task & challenge, 3) Action taken (decisions and stakeholder handling), 4) Quantifiable Result, 5) Reflection / retrospective insight.',
          starterTemplate: 'The situation was at [Company] where our team faced...\n\nMy specific responsibility was...\n\nTo resolve this, I took three decisive actions: first... second... third...\n\nThe verified business result was...\n\nLooking back, the key lesson I learned that informs my leadership today is...',
          evaluationRubric: [
            { criterion: 'Quantifiable Metrics', idealTarget: 'Includes percentages, time saved, or revenue impact' },
            { criterion: 'Personal Accountability', idealTarget: 'Emphasizes individual leadership decisions and actions' },
            { criterion: 'Executive Reflection', idealTarget: 'Articulates a clear retrospective leadership takeaway' }
          ]
        },
        quiz: [
          {
            id: 'q-corp2-1',
            question: 'What is the most common flaw in candidate answers to behavioral leadership questions?',
            conceptKey: 'STAR Method Execution',
            options: [
              { id: 'a', text: 'Spending 80% of the time describing the background situation and using "we" without specifying individual action and quantifiable results', isCorrect: true, explanation: 'Interviewers cannot score candidate capability when actions are hidden behind vague team descriptions.' },
              { id: 'b', text: 'Speaking too clearly and answering within 3 minutes', isCorrect: false, explanation: 'Concise, structured answers are ideal.' },
              { id: 'c', text: 'Mentioning measurable percentage results', isCorrect: false, explanation: 'Quantifiable metrics are strongly rewarded.' },
              { id: 'd', text: 'Admitting a lesson learned through self-reflection', isCorrect: false, explanation: 'Reflective maturity is a key bar-raiser criterion.' }
            ]
          },
          {
            id: 'q-corp2-2',
            question: 'What does the Amazon Leadership Principle "Have Backbone; Disagree and Commit" require of leaders?',
            conceptKey: 'Disagree and Commit Principle',
            options: [
              { id: 'a', text: 'Respectfully challenge decisions with data when you disagree, but once a decision is finalized, commit to it wholeheartedly without passive resistance', isCorrect: true, explanation: 'True leaders debate passionately for what is right, but align completely behind the team once a decision is made.' },
              { id: 'b', text: 'Always agree with your boss to avoid conflict', isCorrect: false, explanation: 'Passive compliance without critical thinking violates leadership principles.' },
              { id: 'c', text: 'Refuse to work if your idea is not chosen', isCorrect: false, explanation: 'Unacceptable unprofessional behavior.' },
              { id: 'd', text: 'Secretly sabotage the project to prove you were right', isCorrect: false, explanation: 'Toxic and unacceptable.' }
            ]
          },
          {
            id: 'q-corp2-3',
            question: 'Why is adding a "Reflection / Retrospective" step at the end of a STAR behavioral story so powerful for senior roles?',
            conceptKey: 'STAR+R Reflection Value',
            options: [
              { id: 'a', text: 'It demonstrates growth mindset, humility, self-awareness, and continuous improvement from past experiences', isCorrect: true, explanation: 'Senior hiring managers look for candidates who learn from obstacles and elevate their teams.' },
              { id: 'b', text: 'It gives you an excuse to blame your junior team members', isCorrect: false, explanation: 'Blaming others indicates poor leadership.' },
              { id: 'c', text: 'It is required by the labor department', isCorrect: false, explanation: 'Incorrect.' },
              { id: 'd', text: 'It proves you have never made any mistakes in your life', isCorrect: false, explanation: 'Claiming you have never made mistakes proves lack of self-awareness.' }
            ]
          },
          {
            id: 'q-corp2-4',
            question: 'When asked "Tell me about a time you failed", what is the winning approach?',
            conceptKey: 'Failure Reflection Authenticity',
            options: [
              { id: 'a', text: 'Discuss a genuine professional setback, take full personal accountability without blaming others, explain the root cause, and highlight the permanent system or process fix you implemented to prevent recurrence', isCorrect: true, explanation: 'Authentic accountability and systemic learning show true executive maturity.' },
              { id: 'b', text: 'Say: "My only failure is that I work too hard and care too much"', isCorrect: false, explanation: 'Fake humble-brag answers cause immediate eye-rolls and score zero for authenticity.' },
              { id: 'c', text: 'Say you have never failed at anything in your entire career', isCorrect: false, explanation: 'Implausible and indicates dishonesty or lack of real experience.' },
              { id: 'd', text: 'Blame your intern for deleting the production database', isCorrect: false, explanation: 'Passing blame downwards is a toxic leadership red flag.' }
            ]
          }
        ]
      }
    ]
  }
];

export function getRecommendedPathway(userProfile?: {
  educationLevel?: string;
  academicStream?: string;
  intermediateGroup?: string;
  target_role?: string;
  role_target?: string;
} | null): AcademyPathway {
  if (!userProfile) {
    return ACADEMY_PATHWAYS[0]; // Common Foundation
  }

  const eduLevel = (userProfile.educationLevel || '').toLowerCase();
  const stream = (userProfile.academicStream || '').toLowerCase();
  const role = (userProfile.target_role || userProfile.role_target || '').toLowerCase();

  // 1. Intermediate / 10+2
  if (eduLevel === 'intermediate' || userProfile.intermediateGroup) {
    return ACADEMY_PATHWAYS.find(p => p.id === 'intermediate') || ACADEMY_PATHWAYS[0];
  }

  // 2. ITI & Vocational Trades
  if (eduLevel === 'iti_vocational' || stream === 'iti_trades' || stream === 'vocational_skills') {
    return ACADEMY_PATHWAYS.find(p => p.id === 'iti_vocational') || ACADEMY_PATHWAYS[0];
  }

  // 3. Diploma & Polytechnic
  if (eduLevel === 'diploma_polytechnic') {
    return ACADEMY_PATHWAYS.find(p => p.id === 'diploma') || ACADEMY_PATHWAYS[0];
  }

  // 4. Professional Degrees (Clinical, Law, CA)
  if (
    eduLevel === 'professional_degree' ||
    stream === 'healthcare_medicine' ||
    stream === 'nursing' ||
    stream === 'pharmacy' ||
    stream === 'law_legal'
  ) {
    return ACADEMY_PATHWAYS.find(p => p.id === 'professional_degree') || ACADEMY_PATHWAYS[0];
  }

  // 5. Postgraduate & Masters
  if (eduLevel === 'postgraduate') {
    return ACADEMY_PATHWAYS.find(p => p.id === 'postgraduate') || ACADEMY_PATHWAYS[0];
  }

  // 6. Corporate / Senior Tech Roles
  if (role.includes('architect') || role.includes('lead') || role.includes('senior') || role.includes('system design')) {
    return ACADEMY_PATHWAYS.find(p => p.id === 'corporate_tech') || ACADEMY_PATHWAYS[0];
  }

  // 7. Undergraduate (Default campus placement pathway)
  if (eduLevel === 'undergraduate') {
    return ACADEMY_PATHWAYS.find(p => p.id === 'undergraduate') || ACADEMY_PATHWAYS[0];
  }

  // 8. Default fallback to Common Foundation
  return ACADEMY_PATHWAYS[0];
}
