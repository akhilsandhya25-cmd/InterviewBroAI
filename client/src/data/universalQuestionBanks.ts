/**
 * InterviewBro AI — Universal Student Expansion
 * client/src/data/universalQuestionBanks.ts
 * 
 * Multi-stream, level-calibrated question banks covering:
 * 1. Self-Introduction Questions (Intermediate, Diploma, UG, PG, Professional, ITI)
 * 2. General HR & Values Questions
 * 3. Communication & Interpersonal Questions
 * 4. Career Exploration Pathways (Intermediate & College transitions)
 * 5. College Admission & Competitive Entrance Prep (CUET, IPMAT, Law, NEET/Medical Viva, SSB)
 * 6. Internship & Entry-Level Job Questions
 * 7. Subject-Specific Questions (All 13 Academic Streams + Intermediate MPC/BiPC/MEC/CEC/HEC)
 * 8. Aptitude & Reasoning Questions (Numerical, Logical, Situational)
 */

import { EducationLevelId, AcademicStreamId, IntermediateGroupId } from './studentStreams';

export type UniversalQuestionCategory =
  | 'self_introduction'
  | 'hr_general'
  | 'communication'
  | 'career_exploration'
  | 'college_admission'
  | 'internship_entry_level'
  | 'subject_specific'
  | 'aptitude_reasoning';

export interface UniversalQuestion {
  id: string;
  questionText: string;
  category: UniversalQuestionCategory;
  targetEducationLevels: EducationLevelId[];
  targetStreams?: AcademicStreamId[];
  intermediateGroup?: IntermediateGroupId;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  hints: string;
  whatInterviewerLooksFor: string;
  sampleAnswerOutline?: string[];
  subDomainTag?: string;
}

export const UNIVERSAL_QUESTION_BANKS: UniversalQuestion[] = [
  // =========================================================================
  // 1. SELF-INTRODUCTION QUESTIONS (Level Calibrated)
  // =========================================================================
  {
    id: 'intro-inter-01',
    questionText: 'Welcome! Please introduce yourself, tell me about your Intermediate subjects, and what made you choose this particular stream.',
    category: 'self_introduction',
    targetEducationLevels: ['intermediate'],
    difficulty: 'beginner',
    hints: 'Follow the Name & School -> Intermediate Subjects Chosen -> Passion / Turning Point -> Immediate Next Step formula. Keep it under 90 seconds.',
    whatInterviewerLooksFor: 'Clarity of speech, enthusiasm, and authentic reason for choosing their stream (e.g., MPC, BiPC, MEC, CEC, HEC).',
    sampleAnswerOutline: [
      'Name, junior college name, and current year of Intermediate.',
      'Core subjects studied and which subject you enjoy the most and why.',
      'A specific concept or project that sparked your curiosity.',
      'Your next goal (target university, degree course, or career entrance exam).'
    ],
    subDomainTag: 'Intermediate Junior College'
  },
  {
    id: 'intro-inter-pathway-02',
    questionText: 'Tell me about yourself, your academic journey so far, and how your hobbies or interests have shaped your plans after 12th standard.',
    category: 'self_introduction',
    targetEducationLevels: ['intermediate'],
    difficulty: 'beginner',
    hints: 'Do not just list grades. Mention co-curriculars like sports, science fairs, essay writing, or student council that show personal character.',
    whatInterviewerLooksFor: 'Self-awareness, balance between academic focus and active personality, clear goals.',
    subDomainTag: 'Intermediate Holistic'
  },
  {
    id: 'intro-diploma-01',
    questionText: 'Please introduce yourself, walk me through your polytechnic diploma specialization, and highlight the most hands-on workshop project you have completed.',
    category: 'self_introduction',
    targetEducationLevels: ['diploma_polytechnic'],
    difficulty: 'intermediate',
    hints: 'Highlight your practical advantage over pure theoretical students. Mention machinery, tools, software (like CAD or MATLAB), or workshop tasks.',
    whatInterviewerLooksFor: 'Practical craftsmanship, technical vocabulary, workshop safety consciousness, and pride in engineering hands-on skill.',
    subDomainTag: 'Polytechnic Engineering'
  },
  {
    id: 'intro-ug-01',
    questionText: 'Please introduce yourself, walk me through your undergraduate degree journey, and highlight the area of your course you are most passionate about.',
    category: 'self_introduction',
    targetEducationLevels: ['undergraduate'],
    difficulty: 'intermediate',
    hints: 'Use the Present-Past-Future model: What you study now -> Key internships, projects, or achievements -> Why you are excited for this opportunity.',
    whatInterviewerLooksFor: 'Structured articulation, connection between coursework and industry application, confidence without arrogance.',
    subDomainTag: 'Undergraduate Fresher'
  },
  {
    id: 'intro-pg-01',
    questionText: 'Walk me through your professional and academic trajectory. How did your undergraduate experiences lead you to pursue your current Master’s specialization?',
    category: 'self_introduction',
    targetEducationLevels: ['postgraduate'],
    difficulty: 'advanced',
    hints: 'Explain the conscious choice to specialize. Mention research thesis, advanced coursework, or prior work experience that justified postgraduation.',
    whatInterviewerLooksFor: 'Strategic career thinking, deep domain command, maturity, and research-backed perspective.',
    subDomainTag: 'Master’s / Postgraduate'
  },
  {
    id: 'intro-prof-01',
    questionText: 'Please introduce yourself, summarizing your professional degree background, key clinical/articleship/courtroom milestones, and your intended area of practice.',
    category: 'self_introduction',
    targetEducationLevels: ['professional_degree'],
    difficulty: 'advanced',
    hints: 'Focus on regulated internship or articleship experiences. Quantify cases handled, audits completed, or clinical patient rotations managed.',
    whatInterviewerLooksFor: 'Professional poise, adherence to statutory and ethical standards, practical decision-making.',
    subDomainTag: 'Professional Licensure'
  },
  {
    id: 'intro-iti-01',
    questionText: 'Tell me about yourself, which ITI trade you were trained in, and the machinery and safety equipment you are most confident operating.',
    category: 'self_introduction',
    targetEducationLevels: ['iti_vocational'],
    difficulty: 'beginner',
    hints: 'Speak confidently about your tools (multimeter, lathe, welding arc, vernier caliper). Mention adherence to workshop safety.',
    whatInterviewerLooksFor: 'Discipline, trade terminology, willingness to work in plant shifts, and safety compliance.',
    subDomainTag: 'ITI Trade Craft'
  },

  // =========================================================================
  // 2. GENERAL HR & VALUES QUESTIONS (Universal)
  // =========================================================================
  {
    id: 'hr-gen-01',
    questionText: 'What are your greatest strengths, and what is one genuine area of improvement you are actively working on?',
    category: 'hr_general',
    targetEducationLevels: ['intermediate', 'diploma_polytechnic', 'undergraduate', 'postgraduate', 'professional_degree', 'iti_vocational'],
    difficulty: 'intermediate',
    hints: 'Pair your strength with an example. For improvement, pick a real skill (e.g., stage fright, perfectionism, delegating) and show what you are doing to fix it.',
    whatInterviewerLooksFor: 'Authenticity, self-awareness, absence of fake weaknesses like "I work too hard", growth mindset.',
    subDomainTag: 'Strengths & Growth'
  },
  {
    id: 'hr-gen-02',
    questionText: 'Can you describe a situation where you had a disagreement with a classmate, teammate, or colleague? How did you resolve it?',
    category: 'hr_general',
    targetEducationLevels: ['intermediate', 'diploma_polytechnic', 'undergraduate', 'postgraduate', 'professional_degree', 'iti_vocational'],
    difficulty: 'intermediate',
    hints: 'Use the STAR method (Situation, Task, Action, Result). Focus on resolving the issue professionally without personal animosity.',
    whatInterviewerLooksFor: 'Emotional maturity, active listening, ability to find common ground, team-first attitude.',
    subDomainTag: 'Conflict Resolution'
  },
  {
    id: 'hr-gen-03',
    questionText: 'Where do you see yourself three to five years from now in terms of your knowledge, responsibilities, and professional contributions?',
    category: 'hr_general',
    targetEducationLevels: ['diploma_polytechnic', 'undergraduate', 'postgraduate', 'professional_degree'],
    difficulty: 'intermediate',
    hints: 'Show ambition paired with realism. Focus on mastery of your discipline, taking on mentorship or leadership, and contributing to the organization.',
    whatInterviewerLooksFor: 'Long-term stability, motivation, realistic career growth expectations, alignment with the domain.',
    subDomainTag: 'Long-Term Vision'
  },
  {
    id: 'hr-gen-04',
    questionText: 'Tell me about a time you faced an unexpected setback or failed to achieve a target. How did you react, and what did you learn from the experience?',
    category: 'hr_general',
    targetEducationLevels: ['intermediate', 'diploma_polytechnic', 'undergraduate', 'postgraduate', 'professional_degree', 'iti_vocational'],
    difficulty: 'intermediate',
    hints: 'Take genuine accountability without blaming teachers, teammates, or circumstances. Highlight the resilience and adjustments made afterward.',
    whatInterviewerLooksFor: 'Accountability, resilience, humility, and actionable learning.',
    subDomainTag: 'Resilience & Failure'
  },
  {
    id: 'hr-gen-05',
    questionText: 'If you have to handle multiple demanding deadlines in the same week, how do you prioritize your tasks and manage pressure?',
    category: 'hr_general',
    targetEducationLevels: ['intermediate', 'diploma_polytechnic', 'undergraduate', 'postgraduate', 'professional_degree'],
    difficulty: 'intermediate',
    hints: 'Mention concrete prioritization techniques: Eisenhower matrix (urgent vs important), daily to-do lists, early communication if a deadline is at risk.',
    whatInterviewerLooksFor: 'Systematic task management, composure under stress, proactive communication.',
    subDomainTag: 'Time & Stress Management'
  },

  // =========================================================================
  // 3. COMMUNICATION & INTERPERSONAL QUESTIONS
  // =========================================================================
  {
    id: 'comm-01',
    questionText: 'How would you explain a complex concept from your studies to someone who has zero background in your field?',
    category: 'communication',
    targetEducationLevels: ['intermediate', 'diploma_polytechnic', 'undergraduate', 'postgraduate', 'professional_degree'],
    difficulty: 'intermediate',
    hints: 'Pick a real concept (e.g., Photosynthesis, Inflation, Double Entry, Voltage, Immunity). Use a clean real-world analogy without technical jargon.',
    whatInterviewerLooksFor: 'Empathy for non-experts, conceptual mastery (you only explain simply if you understand deeply), clarity of expression.',
    subDomainTag: 'Simplification & Analogies'
  },
  {
    id: 'comm-02',
    questionText: 'Describe an occasion where active listening helped you prevent an error or misunderstanding in an academic project or team assignment.',
    category: 'communication',
    targetEducationLevels: ['intermediate', 'diploma_polytechnic', 'undergraduate', 'postgraduate'],
    difficulty: 'intermediate',
    hints: 'Explain how you listened to the full requirements or concerns before jumping to conclusions or interrupting.',
    whatInterviewerLooksFor: 'Patience, comprehension over reply-speed, precision in taking instructions.',
    subDomainTag: 'Active Listening'
  },
  {
    id: 'comm-03',
    questionText: 'If a team member or client does not understand your instructions or point of view, what steps do you take to bridge the communication gap?',
    category: 'communication',
    targetEducationLevels: ['diploma_polytechnic', 'undergraduate', 'postgraduate', 'professional_degree', 'iti_vocational'],
    difficulty: 'intermediate',
    hints: 'Highlight switching formats: using diagrams, written checklists, visual demonstrations, or asking confirming questions.',
    whatInterviewerLooksFor: 'Adaptability in communication, avoiding frustration, collaborative problem solving.',
    subDomainTag: 'Cross-Communication'
  },

  // =========================================================================
  // 4. CAREER EXPLORATION QUESTIONS (Specialized for Intermediate & Freshers)
  // =========================================================================
  {
    id: 'career-exp-inter-01',
    questionText: 'Why did you choose your current Intermediate group (MPC / BiPC / MEC / CEC / HEC)? Was it driven by personal passion, family advice, or a specific career goal?',
    category: 'career_exploration',
    targetEducationLevels: ['intermediate'],
    difficulty: 'beginner',
    hints: 'Be honest. If it started as family advice, explain how you developed your own genuine interest in the subjects over the past year.',
    whatInterviewerLooksFor: 'Honesty, independent thinking, clarity of academic motivation, absence of passive drifting.',
    subDomainTag: 'Stream Choice Motivation'
  },
  {
    id: 'career-exp-inter-02',
    questionText: 'What career fields or degrees are you considering after 12th standard, and what steps have you taken so far to learn more about them?',
    category: 'career_exploration',
    targetEducationLevels: ['intermediate'],
    difficulty: 'beginner',
    hints: 'Mention specific degrees (B.Tech, MBBS, B.Com, BBA, B.A LL.B, B.Sc Agri) or career pathways. Discuss speaking to seniors, reading articles, or watching expert lectures.',
    whatInterviewerLooksFor: 'Proactive exploration, curiosity, understanding of the pathway ahead, structured planning.',
    subDomainTag: 'Post-12th Exploration'
  },
  {
    id: 'career-exp-inter-03',
    questionText: 'Between pursuing a professional degree, taking national competitive entrance exams, or seeking direct career employment after Intermediate, what is your primary strategy and backup plan?',
    category: 'career_exploration',
    targetEducationLevels: ['intermediate'],
    difficulty: 'intermediate',
    hints: 'A good candidate always has a clear Plan A (e.g. NEET / JEE / CUET) and a mature, constructive Plan B (e.g. B.Sc Biotech, B.Pharm, BCA, State Degree colleges).',
    whatInterviewerLooksFor: 'Strategic foresight, emotional resilience, realistic options, absence of single-point anxiety.',
    subDomainTag: 'Plan A vs Plan B Strategy'
  },
  {
    id: 'career-exp-ug-01',
    questionText: 'Looking back at your college years, what is the most valuable insight you gained about the kind of career environment where you feel most motivated?',
    category: 'career_exploration',
    targetEducationLevels: ['undergraduate', 'postgraduate'],
    difficulty: 'intermediate',
    hints: 'Do you thrive in analytical desk research, fast-paced field operations, creative marketing, or structured corporate compliance? Give examples.',
    whatInterviewerLooksFor: 'Self-knowledge, alignment between personal work style and the targeted job role.',
    subDomainTag: 'Work Environment Fit'
  },

  // =========================================================================
  // 5. COLLEGE ADMISSION & COMPETITIVE ENTRANCE PREPARATION
  // =========================================================================
  {
    id: 'adm-cuet-01',
    questionText: 'Why are you targeting this particular university or college program, and what unique contributions will you bring to our campus community?',
    category: 'college_admission',
    targetEducationLevels: ['intermediate', 'undergraduate'],
    difficulty: 'intermediate',
    hints: 'Mention specific professors, clubs, academic library resources, or the institution’s culture. Connect your past extracurriculars to campus life.',
    whatInterviewerLooksFor: 'Institutional knowledge, genuine intent to join, active extracurricular participation, positive presence.',
    subDomainTag: 'University Personal Interview'
  },
  {
    id: 'adm-ipmat-01',
    questionText: 'You are applying for a prestigious 5-year Integrated Management Program right after 12th standard. What makes you ready for business management at this early age?',
    category: 'college_admission',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'mec',
    difficulty: 'advanced',
    hints: 'Highlight leadership in school fests, interest in business news, analytical math foundations, and long-term organizational vision.',
    whatInterviewerLooksFor: 'Executive presence, business awareness, maturity beyond typical 17-year-old standards, communication poise.',
    subDomainTag: 'IIM IPMAT Interview'
  },
  {
    id: 'adm-law-clat-01',
    questionText: 'Why do you wish to pursue a 5-Year Integrated B.A LL.B degree? Can you discuss one recent constitutional or legal issue that caught your attention?',
    category: 'college_admission',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'cec',
    difficulty: 'advanced',
    hints: 'Mention topics like freedom of speech, data privacy, environmental PILs, or judicial reforms. Focus on legal reasoning rather than political bias.',
    whatInterviewerLooksFor: 'Legal awareness, objective argumentation, respect for constitutional values, analytical reasoning.',
    subDomainTag: 'NLU / Law School Admission'
  },
  {
    id: 'adm-med-viva-01',
    questionText: 'Medical training demands immense stamina, empathy, and emotional fortitude through long emergency duties. What convinced you that healthcare is your true calling?',
    category: 'college_admission',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'bipc',
    difficulty: 'intermediate',
    hints: 'Share an authentic personal experience or observation of healthcare caregiving. Avoid clichéd lines like "I want to help poor people" unless backed by real intent.',
    whatInterviewerLooksFor: 'True humanitarian compassion, realistic understanding of clinical hardship, emotional stability.',
    subDomainTag: 'Medical / Nursing Admission'
  },
  {
    id: 'adm-nda-ssb-01',
    questionText: 'What inspired you to consider the Armed Forces through the National Defence Academy right after 12th standard, and how do you maintain physical and mental fitness?',
    category: 'college_admission',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'mpc',
    difficulty: 'advanced',
    hints: 'Focus on officer-like qualities (OLQs): physical discipline, team leadership, patriotism through service, and decisive courage.',
    whatInterviewerLooksFor: 'Officer Like Qualities (OLQ), stamina, mental grit, truthfulness, teamwork under physical stress.',
    subDomainTag: 'NDA SSB Officer Interview'
  },

  // =========================================================================
  // 6. INTERNSHIP & ENTRY-LEVEL JOB QUESTIONS
  // =========================================================================
  {
    id: 'job-fresher-01',
    questionText: 'As a fresher with no previous full-time corporate experience, how have your college projects, coursework, and activities prepared you for this role?',
    category: 'internship_entry_level',
    targetEducationLevels: ['diploma_polytechnic', 'undergraduate', 'iti_vocational'],
    difficulty: 'intermediate',
    hints: 'Connect coursework directly to job duties. Treat academic deadlines as delivery commitments and lab projects as practical trial runs.',
    whatInterviewerLooksFor: 'Translating academic knowledge into immediate professional readiness, eagerness to be trained.',
    subDomainTag: 'Fresher Value Proposition'
  },
  {
    id: 'job-fresher-02',
    questionText: 'If you are assigned a task that involves a software tool or procedure you have never used before, how would you approach completing it on time?',
    category: 'internship_entry_level',
    targetEducationLevels: ['diploma_polytechnic', 'undergraduate', 'postgraduate', 'iti_vocational'],
    difficulty: 'intermediate',
    hints: '1. Read available documentation/SOP. 2. Attempt a trial or sample. 3. Ask a senior targeted, intelligent questions rather than asking them to do it for you.',
    whatInterviewerLooksFor: 'Resourcefulness, independent initiative, knowing when to ask for guidance, fast learning curve.',
    subDomainTag: 'Learning on the Job'
  },
  {
    id: 'job-fresher-03',
    questionText: 'Are you comfortable working in rotational shifts, relocating to our facility, or traveling for field operations if required by the company?',
    category: 'internship_entry_level',
    targetEducationLevels: ['diploma_polytechnic', 'undergraduate', 'iti_vocational'],
    difficulty: 'beginner',
    hints: 'Express genuine flexibility and enthusiasm to gain hands-on experience in new environments.',
    whatInterviewerLooksFor: 'Operational flexibility, realistic readiness for plant, hospital, or corporate shifts.',
    subDomainTag: 'Operational Adaptability'
  },

  // =========================================================================
  // 7. SUBJECT-SPECIFIC QUESTIONS (Covering all Streams & Intermediate Groups)
  // =========================================================================

  // --- Intermediate: MPC (Maths, Physics, Chemistry) ---
  {
    id: 'subj-mpc-01',
    questionText: 'Can you explain the physical significance of the derivative in Calculus, and give a real-world example from Physics where differentiation is used?',
    category: 'subject_specific',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'mpc',
    difficulty: 'intermediate',
    hints: 'Define derivative as the instantaneous rate of change. Contrast average velocity (displacement/time) with instantaneous velocity (ds/dt) or acceleration (dv/dt).',
    whatInterviewerLooksFor: 'Conceptual understanding of calculus beyond mechanical formula memorization.',
    subDomainTag: 'Calculus & Physics Mechanics'
  },
  {
    id: 'subj-mpc-02',
    questionText: 'Explain Newton’s Third Law of Motion. Why don’t the action and reaction forces cancel each other out to produce zero motion?',
    category: 'subject_specific',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'mpc',
    difficulty: 'intermediate',
    hints: 'Emphasize that action and reaction act on two entirely DIFFERENT bodies simultaneously, so they never cancel each other on a single free body.',
    whatInterviewerLooksFor: 'Free-body diagram clarity, foundational mechanics logic.',
    subDomainTag: 'Newtonian Physics'
  },
  {
    id: 'subj-mpc-03',
    questionText: 'In Organic Chemistry, what is the difference between an SN1 and SN2 nucleophilic substitution reaction in terms of reaction mechanism and intermediate carbocations?',
    category: 'subject_specific',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'mpc',
    difficulty: 'advanced',
    hints: 'SN1 is two-step involving a carbocation intermediate (favored in tertiary halides). SN2 is a single-step concerted mechanism with inversion of configuration (Walden inversion).',
    whatInterviewerLooksFor: 'Stereochemistry awareness, carbocation stability order, reaction kinetics.',
    subDomainTag: 'Organic Chemistry'
  },

  // --- Intermediate: BiPC (Biology, Physics, Chemistry) ---
  {
    id: 'subj-bipc-01',
    questionText: 'Can you describe the pathway of blood circulation through the human heart, clearly explaining the distinction between pulmonary and systemic circulation?',
    category: 'subject_specific',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'bipc',
    difficulty: 'intermediate',
    hints: 'Trace: Vena cava -> Right Atrium -> Tricuspid valve -> Right Ventricle -> Pulmonary artery -> Lungs -> Pulmonary veins -> Left Atrium -> Bicuspid -> Left Ventricle -> Aorta.',
    whatInterviewerLooksFor: 'Precision in anatomical terminology, valves, deoxygenated vs oxygenated pathways.',
    subDomainTag: 'Human Physiology'
  },
  {
    id: 'subj-bipc-02',
    questionText: 'Explain Mendel’s Law of Independent Assortment. Under what biological circumstance does this law fail to hold true?',
    category: 'subject_specific',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'bipc',
    difficulty: 'intermediate',
    hints: 'The law states alleles of two different genes sort independently. It fails when genes are tightly linked on the same chromosome (Genetic Linkage, discovered by T.H. Morgan).',
    whatInterviewerLooksFor: 'Understanding dihybrid ratios, exceptions to Mendelian laws, linkage concept.',
    subDomainTag: 'Genetics'
  },
  {
    id: 'subj-bipc-03',
    questionText: 'How do the light-dependent reactions of photosynthesis differ from the Calvin cycle (light-independent reactions) in terms of location and energy carriers produced?',
    category: 'subject_specific',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'bipc',
    difficulty: 'intermediate',
    hints: 'Light reactions happen in Thylakoid membranes generating ATP and NADPH. Calvin cycle happens in Stroma using ATP/NADPH to fix CO2 into glucose.',
    whatInterviewerLooksFor: 'Chloroplast structure, energy currency transfer, biochemical cycle understanding.',
    subDomainTag: 'Plant Physiology'
  },

  // --- Intermediate: MEC & CEC (Commerce, Economics, Civics) ---
  {
    id: 'subj-mec-cec-01',
    questionText: 'Walk me through the Golden Rules of Accounting for Personal, Real, and Nominal accounts, and give one sample journal entry for each.',
    category: 'subject_specific',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'mec',
    difficulty: 'beginner',
    hints: 'Personal: Debit the receiver, Credit the giver. Real: Debit what comes in, Credit what goes out. Nominal: Debit all expenses/losses, Credit all incomes/gains.',
    whatInterviewerLooksFor: 'Rock-solid accounting basics, instant classification of transactions.',
    subDomainTag: 'Financial Accounting Fundamentals'
  },
  {
    id: 'subj-mec-cec-02',
    questionText: 'What is the Law of Demand in Economics, and what are two real-world exceptions where demand actually increases when price goes up?',
    category: 'subject_specific',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'cec',
    difficulty: 'intermediate',
    hints: 'Law: Price and quantity demanded are inversely related, ceteris paribus. Exceptions: Giffen goods (staple foods during poverty) and Veblen goods (conspicuous luxury items).',
    whatInterviewerLooksFor: 'Economic principle definition, consumer behavior awareness, ceteris paribus assumption.',
    subDomainTag: 'Microeconomics'
  },
  {
    id: 'subj-cec-hec-01',
    questionText: 'What are the Fundamental Rights guaranteed under the Indian Constitution, and what makes Article 32 the "Heart and Soul" of our Constitution according to Dr. B.R. Ambedkar?',
    category: 'subject_specific',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'cec',
    difficulty: 'intermediate',
    hints: 'List core rights (Equality, Freedom, Against Exploitation, Religion, Culture/Education, Constitutional Remedies). Article 32 empowers citizens to petition the Supreme Court directly via Writs (Habeas Corpus, Mandamus, etc.).',
    whatInterviewerLooksFor: 'Civics and constitutional foundation, understanding of judicial remedies and civil liberties.',
    subDomainTag: 'Indian Constitution & Civics'
  },

  // --- Intermediate: HEC (History, Economics, Civics) ---
  {
    id: 'subj-hec-01',
    questionText: 'How did the Non-Cooperation Movement and the Civil Disobedience Movement led by Mahatma Gandhi differ in their scope, strategy, and popular participation?',
    category: 'subject_specific',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'hec',
    difficulty: 'intermediate',
    hints: 'Non-Cooperation (1920-22) focused on boycotting British titles, schools, courts, and cloth. Civil Disobedience (1930 - Dandi Salt March) actively broke colonial laws (e.g., salt tax, forest laws).',
    whatInterviewerLooksFor: 'Historical chronology, strategic mass movements, nuanced analysis of Indian freedom struggle.',
    subDomainTag: 'Modern Indian History'
  },

  // --- Intermediate: MBiPC (Math, Biology, Physics, Chemistry) ---
  {
    id: 'subj-mbipc-01',
    questionText: 'How are mathematical differential equations and exponential growth models used in Biology to predict bacterial colony population dynamics and virus transmission rates?',
    category: 'subject_specific',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'mbipc',
    difficulty: 'intermediate',
    hints: 'dN/dt = rN (logistic vs exponential growth). Carrying capacity K limits growth in reality. Mention how calculus formalizes biology rates.',
    whatInterviewerLooksFor: 'Interdisciplinary synthesis between Mathematics and Biology.',
    subDomainTag: 'Mathematical Biology & Population Dynamics'
  },
  {
    id: 'subj-mbipc-02',
    questionText: 'How does the thermodynamic principle of free energy (Gibbs Free Energy Delta G) govern whether biochemical metabolic reactions like ATP hydrolysis occur spontaneously in living cells?',
    category: 'subject_specific',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'mbipc',
    difficulty: 'advanced',
    hints: 'Delta G = Delta H - T * Delta S. Negative Delta G signifies an exergonic reaction. Coupling of endergonic reactions with ATP hydrolysis drives cellular metabolism.',
    whatInterviewerLooksFor: 'Biochemistry and physics thermodynamics crossover.',
    subDomainTag: 'Biophysics & Bioenergetics'
  },

  // --- Intermediate: Vocational (Applied Trades & Skills) ---
  {
    id: 'subj-voc-01',
    questionText: 'In practical laboratory or workshop environments, why is adherence to Standard Operating Procedures (SOPs) and personal protective equipment (PPE) mandatory before operating testing instruments?',
    category: 'subject_specific',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'vocational_inter',
    difficulty: 'beginner',
    hints: 'Prevent hazardous chemical exposure, equipment calibration drift, electrical short circuits, and personal injury.',
    whatInterviewerLooksFor: 'Applied vocational discipline, workplace safety compliance, practical readiness.',
    subDomainTag: 'Vocational Workshop Safety'
  },
  {
    id: 'subj-voc-02',
    questionText: 'Describe a hands-on practical assignment or trade project you completed during your vocational curriculum. What tools did you use and how did you verify the final outcome?',
    category: 'subject_specific',
    targetEducationLevels: ['intermediate'],
    intermediateGroup: 'vocational_inter',
    difficulty: 'intermediate',
    hints: 'Explain problem statement, step-by-step assembly or testing procedure, tools handled, and verification criteria.',
    whatInterviewerLooksFor: 'Authentic practical experience, familiarity with real trade tools.',
    subDomainTag: 'Practical Trade Project'
  },

  // --- Stream 1: Commerce & Accounting ---
  {
    id: 'subj-comm-01',
    questionText: 'What is the difference between Capital Expenditure and Revenue Expenditure? How does an erroneous classification impact the Profit & Loss statement and Balance Sheet?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate', 'professional_degree'],
    targetStreams: ['commerce'],
    difficulty: 'intermediate',
    hints: 'Capital Exp yields long-term economic benefits over multiple years (capitalized on Balance Sheet). Revenue Exp relates to current operations (charged to P&L). Misclassifying distorts current net profit.',
    whatInterviewerLooksFor: 'Financial statement integrity, accrual concepts, impact on taxation and depreciation.',
    subDomainTag: 'Financial Accounting'
  },
  {
    id: 'subj-comm-02',
    questionText: 'Can you explain the Input Tax Credit (ITC) mechanism under Goods and Services Tax (GST)? What are the mandatory conditions for a registered business to claim ITC?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate', 'professional_degree'],
    targetStreams: ['commerce'],
    difficulty: 'advanced',
    hints: 'ITC eliminates the cascading effect of tax on tax. Conditions: Tax invoice in possession, goods/services received, supplier paid tax to government (GSTR-2B reflection), and return filed under Section 39.',
    whatInterviewerLooksFor: 'GST statutory compliance, reconciliation between GSTR-1, 3B, and 2B, anti-fraud awareness.',
    subDomainTag: 'Taxation & GST'
  },
  {
    id: 'subj-comm-03',
    questionText: 'What is Working Capital, and how does a negative Cash Conversion Cycle benefit certain business models like supermarkets or e-commerce giants?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate'],
    targetStreams: ['commerce', 'management_business'],
    difficulty: 'advanced',
    hints: 'Working Capital = Current Assets - Current Liabilities. Negative CCC means collecting cash from customers immediately while paying suppliers after 60-90 days, effectively funding growth with supplier credit.',
    whatInterviewerLooksFor: 'Cash flow mastery, inventory days, debtor days, creditor days.',
    subDomainTag: 'Corporate Finance'
  },

  // --- Stream 2: Arts & Humanities ---
  {
    id: 'subj-arts-01',
    questionText: 'In sociological or field research, what is the difference between Qualitative and Quantitative data, and how do you ensure objectivity when conducting one-on-one personal interviews?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate'],
    targetStreams: ['arts_humanities'],
    difficulty: 'intermediate',
    hints: 'Quantitative focuses on numerical metrics and surveys; Qualitative explores lived experiences and cultural nuances. Objectivity requires avoiding leading questions, active reflexivity, and triangulation.',
    whatInterviewerLooksFor: 'Research methodology, bias minimization, empathetic inquiry.',
    subDomainTag: 'Social Science Research'
  },
  {
    id: 'subj-arts-02',
    questionText: 'How has the emergence of digital media and algorithmic social feeds impacted traditional journalistic ethics, source verification, and public discourse?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate'],
    targetStreams: ['arts_humanities'],
    difficulty: 'advanced',
    hints: 'Discuss speed vs accuracy pressure, echo chambers, confirmation bias, clickbait economics, and fact-checking protocols.',
    whatInterviewerLooksFor: 'Media literacy, ethical depth, understanding democratic implications.',
    subDomainTag: 'Journalism & Media'
  },

  // --- Stream 3: Science & Mathematics ---
  {
    id: 'subj-sci-01',
    questionText: 'What is the difference between a Type I Error (false positive) and a Type II Error (false negative) in statistical hypothesis testing? In which scenario is a Type I error far more hazardous?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate'],
    targetStreams: ['science'],
    difficulty: 'intermediate',
    hints: 'Type I: Rejecting null hypothesis when it is actually true (alpha). Type II: Failing to reject null when it is false (beta). In criminal law or medical toxicity, false positives or false negatives have different severities.',
    whatInterviewerLooksFor: 'Statistical reasoning, p-values, significance levels, real-world consequence analysis.',
    subDomainTag: 'Statistics & Data Science'
  },
  {
    id: 'subj-sci-02',
    questionText: 'Explain the working principle of High-Performance Liquid Chromatography (HPLC). How do the mobile phase and stationary phase interact to separate a complex chemical mixture?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate'],
    targetStreams: ['science', 'pharmacy'],
    difficulty: 'advanced',
    hints: 'Separation based on relative affinities of analytes between mobile (liquid under high pressure) and stationary phase (column packing). Differentiate normal-phase from reverse-phase chromatography.',
    whatInterviewerLooksFor: 'Instrumental analytical chemistry, retention time logic, peak resolution.',
    subDomainTag: 'Analytical Chemistry'
  },

  // --- Stream 4: Healthcare & Medicine ---
  {
    id: 'subj-med-01',
    questionText: 'A 55-year-old diabetic patient presents to the Emergency Room with severe crushing substernal chest pain radiating to the left arm, sweating, and nausea. What is your immediate diagnostic and treatment protocol?',
    category: 'subject_specific',
    targetEducationLevels: ['professional_degree', 'postgraduate'],
    targetStreams: ['healthcare_medicine'],
    difficulty: 'advanced',
    hints: 'Suspect Acute Coronary Syndrome (STEMI/NSTEMI). Immediate: 12-lead ECG within 10 minutes, high-flow oxygen if SpO2 < 90%, IV access, Aspirin chewable, sublingual Nitroglycerin (check BP first), and Troponin I/T markers.',
    whatInterviewerLooksFor: 'Emergency protocol (MONA/FONA), time-sensitive golden hour management, contraindication awareness.',
    subDomainTag: 'Clinical Emergency Medicine'
  },
  {
    id: 'subj-med-02',
    questionText: 'How do you conduct an empathetic conversation to disclose a critical medical diagnosis or adverse prognosis to an anxious family, following the SPIKES protocol?',
    category: 'subject_specific',
    targetEducationLevels: ['professional_degree', 'postgraduate'],
    targetStreams: ['healthcare_medicine', 'nursing_allied'],
    difficulty: 'advanced',
    hints: 'SPIKES: Setting up interview, Perception of patient, Invitation, Knowledge giving, Emotions addressing, Strategy & Summary.',
    whatInterviewerLooksFor: 'Bedside communication, doctor-patient empathy, professional emotional composure.',
    subDomainTag: 'Medical Ethics & Communication'
  },

  // --- Stream 5: Pharmacy ---
  {
    id: 'subj-pharma-01',
    questionText: 'What is the distinction between Pharmacokinetics and Pharmacodynamics? Walk me through the ADME parameters and why Bioavailability matters in oral drug delivery.',
    category: 'subject_specific',
    targetEducationLevels: ['diploma_polytechnic', 'undergraduate', 'postgraduate', 'professional_degree'],
    targetStreams: ['pharmacy'],
    difficulty: 'intermediate',
    hints: 'Pharmacokinetics = What the body does to the drug (Absorption, Distribution, Metabolism, Excretion). Pharmacodynamics = What the drug does to the body (Receptor binding, therapeutic effect). Bioavailability is fraction reaching systemic circulation intact.',
    whatInterviewerLooksFor: 'Core pharmacological principles, first-pass metabolism awareness, dosage regimen calculation.',
    subDomainTag: 'Pharmacology'
  },
  {
    id: 'subj-pharma-02',
    questionText: 'In Pharmacovigilance, what constitutes an "Adverse Drug Reaction" (ADR) versus an "Adverse Event" (AE)? What criteria categorize an ADR as "Serious" under global regulatory guidelines (ICH E2A)?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate', 'professional_degree'],
    targetStreams: ['pharmacy'],
    difficulty: 'advanced',
    hints: 'AE is any untoward medical occurrence during drug use without necessarily having causal relationship. ADR has reasonable causal link. Serious if: Death, Life-threatening, Hospitalization, Disability/Incapacity, Congenital anomaly.',
    whatInterviewerLooksFor: 'Drug safety regulations, ICH guidelines, MedDRA terminology, reporting timelines.',
    subDomainTag: 'Pharmacovigilance'
  },

  // --- Stream 6: Nursing & Allied Health ---
  {
    id: 'subj-nurs-01',
    questionText: 'What are the "Rights of Medication Administration", and what immediate steps would you take if you discovered a medication error occurred during your shift?',
    category: 'subject_specific',
    targetEducationLevels: ['diploma_polytechnic', 'undergraduate', 'postgraduate'],
    targetStreams: ['nursing_allied'],
    difficulty: 'intermediate',
    hints: 'Rights: Right Patient, Right Drug, Right Dose, Right Route, Right Time, Right Documentation. If error: 1. Immediately assess patient vitals. 2. Notify doctor/nurse in charge. 3. Administer antidote if ordered. 4. Complete incident report honestly.',
    whatInterviewerLooksFor: 'Patient safety priority, clinical integrity without covering up errors, rapid monitoring.',
    subDomainTag: 'Nursing Patient Safety'
  },
  {
    id: 'subj-nurs-02',
    questionText: 'How is Bio-Medical Waste (BMW) segregated at source in an Indian hospital ward according to color-coded bins (Yellow, Red, White, Blue)?',
    category: 'subject_specific',
    targetEducationLevels: ['diploma_polytechnic', 'undergraduate'],
    targetStreams: ['nursing_allied'],
    difficulty: 'beginner',
    hints: 'Yellow: Anatomical, soiled cotton, expired drugs, blood bags (Incineration). Red: Contaminated recyclable plastics (tubings, catheters, IV bottles - Autoclave). White Translucent: Sharps, needles, scalpels (Puncture-proof). Blue: Broken glass, ampoules, metallic implants.',
    whatInterviewerLooksFor: 'Strict hospital infection control, statutory compliance, waste handler safety.',
    subDomainTag: 'Infection Control & BMW'
  },

  // --- Stream 7: Education & Teaching ---
  {
    id: 'subj-edu-01',
    questionText: 'How do you apply Bloom’s Revised Taxonomy when drafting lesson plans and designing assessment questions to move students from passive memorization to creative application?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate'],
    targetStreams: ['education_teaching'],
    difficulty: 'intermediate',
    hints: 'Hierarchy: Remembering -> Understanding -> Applying -> Analyzing -> Evaluating -> Creating. Give sample questions for lower-order (recall) vs higher-order (evaluate/create).',
    whatInterviewerLooksFor: 'Pedagogical design, student-centric assessment, progressive cognitive development.',
    subDomainTag: 'Pedagogical Frameworks'
  },
  {
    id: 'subj-edu-02',
    questionText: 'How would you handle a classroom situation where three students are visibly disinterested and causing mild disruption while the rest of the class is engaged?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate'],
    difficulty: 'intermediate',
    hints: 'Avoid public humiliation or aggressive shouting. Use non-verbal proximity, ask them to read or demonstrate, check if the task is too easy/hard, speak privately after class.',
    whatInterviewerLooksFor: 'Positive classroom management, emotional intelligence, dignity of the student, restorative discipline.',
    subDomainTag: 'Classroom Leadership'
  },

  // --- Stream 8: Law & Legal Studies ---
  {
    id: 'subj-law-01',
    questionText: 'What are the essential elements required to constitute a valid contract under Section 10 of the Indian Contract Act, 1872? When does an agreement become void ab initio?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate'],
    targetStreams: ['law_legal'],
    difficulty: 'intermediate',
    hints: 'Essentials: Offer & Acceptance, Free Consent, Competent Parties (age, sound mind), Lawful Consideration, Lawful Object, not expressly declared void. Void ab initio if party is minor (Mohori Bibee v. Dharmodas Ghose) or unlawful object.',
    whatInterviewerLooksFor: 'Statutory precision, case law citation, distinction between void and voidable.',
    subDomainTag: 'Contract Law'
  },
  {
    id: 'subj-law-02',
    questionText: 'How has the Supreme Court of India expanded the scope of Article 21 (Protection of Life and Personal Liberty) from the A.K. Gopalan era to the landmark Maneka Gandhi and K.S. Puttaswamy (Right to Privacy) judgments?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate'],
    targetStreams: ['law_legal'],
    difficulty: 'advanced',
    hints: 'Transition from rigid "procedure established by law" (Gopalan) to "due process of law" requiring just, fair, and reasonable laws (Maneka). Puttaswamy recognized informational and bodily privacy as intrinsic fundamental rights under Art 21.',
    whatInterviewerLooksFor: 'Constitutional evolution, golden triangle (Art 14, 19, 21), landmark precedent command.',
    subDomainTag: 'Constitutional Law'
  },

  // --- Stream 9: Agriculture & Horticulture ---
  {
    id: 'subj-agri-01',
    questionText: 'What is Integrated Pest Management (IPM), and how does it balance cultural, biological, and chemical methods to protect crops while minimizing ecological toxicity?',
    category: 'subject_specific',
    targetEducationLevels: ['diploma_polytechnic', 'undergraduate', 'postgraduate'],
    targetStreams: ['agriculture_forestry'],
    difficulty: 'intermediate',
    hints: 'IPM avoids prophylactic chemical spraying. Uses crop rotation, pheromone traps, natural predators (ladybird beetles, Trichogramma), and chemical spraying only when pest crosses Economic Threshold Level (ETL).',
    whatInterviewerLooksFor: 'Sustainable agronomy, ecological food safety, economic threshold concept.',
    subDomainTag: 'Plant Protection & IPM'
  },
  {
    id: 'subj-agri-02',
    questionText: 'How do you test and manage soil salinity and alkalinity in irrigated farm lands? What amendments (such as Gypsum) are prescribed for sodic soils?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate'],
    targetStreams: ['agriculture_forestry'],
    difficulty: 'intermediate',
    hints: 'Test Electrical Conductivity (EC) and Exchangeable Sodium Percentage (ESP). For sodic/alkali soil, apply Gypsum (CaSO4) so calcium replaces sodium on soil colloids, followed by deep leaching.',
    whatInterviewerLooksFor: 'Soil chemistry, reclamation techniques, practical farmer advisory.',
    subDomainTag: 'Soil Science'
  },

  // --- Stream 10: Hospitality & Hotel Management ---
  {
    id: 'subj-hosp-01',
    questionText: 'A guest at a luxury hotel arrives at the front desk after a long flight and finds their reserved suite is occupied due to an unexpected system overbooking. How do you resolve this using the Service Recovery Paradox?',
    category: 'subject_specific',
    targetEducationLevels: ['diploma_polytechnic', 'undergraduate'],
    targetStreams: ['hospitality_tourism'],
    difficulty: 'intermediate',
    hints: '1. Empathize immediately and invite guest to sit with welcome refreshments. 2. Upgrade to higher suite or sister property with chauffeur transport. 3. Offer complimentary dining. 4. General Manager greeting.',
    whatInterviewerLooksFor: 'Composure under guest anger, empowering frontline service recovery, transforming frustration into loyalty.',
    subDomainTag: 'Front Office & Guest Delight'
  },
  {
    id: 'subj-hosp-02',
    questionText: 'What are the critical Hazard Analysis and Critical Control Points (HACCP) principles enforced in a commercial star-hotel kitchen to prevent foodborne contamination?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate'],
    targetStreams: ['hospitality_tourism'],
    difficulty: 'intermediate',
    hints: '7 principles: Hazard analysis, CCP identification (cooking temps, chilling), Critical limits, Monitoring, Corrective actions, Verification, Record keeping. Mention temperature danger zone (5°C to 60°C).',
    whatInterviewerLooksFor: 'Culinary hygiene standards, food safety laws (FSSAI/HACCP), cross-contamination prevention.',
    subDomainTag: 'Food Safety & Kitchen Ops'
  },

  // --- Stream 11: Management & Business Administration ---
  {
    id: 'subj-mgmt-01',
    questionText: 'Walk me through the 4Ps of the Marketing Mix (Product, Price, Place, Promotion) for a newly launched organic beverage entering a highly competitive retail market.',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate'],
    targetStreams: ['management_business'],
    difficulty: 'intermediate',
    hints: 'Product (eco-packaging, clean label), Price (penetration vs premium value-based), Place (modern trade supermarkets, quick-commerce Zepto/Blinkit), Promotion (sampling, influencer health wellness campaigns).',
    whatInterviewerLooksFor: 'Marketing strategy, distribution channel understanding, competitive positioning.',
    subDomainTag: 'Marketing Strategy'
  },
  {
    id: 'subj-mgmt-02',
    questionText: 'How do you calculate and interpret Customer Acquisition Cost (CAC) versus Customer Lifetime Value (LTV)? What does an LTV:CAC ratio of less than 1:1 signify for a business?',
    category: 'subject_specific',
    targetEducationLevels: ['undergraduate', 'postgraduate'],
    targetStreams: ['management_business'],
    difficulty: 'advanced',
    hints: 'CAC = Total sales & marketing spend / New customers acquired. LTV = Average margin per customer * retention duration. Ratio < 1:1 means burning money on acquisition without recouping unit economics.',
    whatInterviewerLooksFor: 'Business analytics, unit economics, startup sustainability, profitability thinking.',
    subDomainTag: 'Business Analytics & Metrics'
  },

  // --- Stream 12: ITI & Technical Trades ---
  {
    id: 'subj-iti-01',
    questionText: 'How do you accurately measure the internal diameter of a cylindrical pipe using a Vernier Caliper, and how do you calculate the Least Count (LC) of the instrument?',
    category: 'subject_specific',
    targetEducationLevels: ['iti_vocational', 'diploma_polytechnic'],
    targetStreams: ['iti_vocational'],
    difficulty: 'beginner',
    hints: 'Use internal measuring jaws. Least Count = Value of 1 Main Scale Division (MSD) - Value of 1 Vernier Scale Division (VSD), typically 0.02 mm or 0.1 mm. Check for zero error first.',
    whatInterviewerLooksFor: 'Hands-on precision measurement, tool maintenance, zero error check.',
    subDomainTag: 'Precision Measurement & Fitting'
  },
  {
    id: 'subj-iti-02',
    questionText: 'What is the purpose of Earthing in an electrical installation? How does an Earth Leakage Circuit Breaker (ELCB / RCCB) protect human life from fatal electric shocks?',
    category: 'subject_specific',
    targetEducationLevels: ['iti_vocational', 'diploma_polytechnic'],
    targetStreams: ['iti_vocational'],
    difficulty: 'intermediate',
    hints: 'Earthing provides low-resistance path for leakage current to ground. RCCB/ELCB senses residual imbalance between phase and neutral current (>30mA) and trips within milliseconds.',
    whatInterviewerLooksFor: 'Electrical safety rules, wiring codes, life-safety circuit mechanisms.',
    subDomainTag: 'Electrical Safety & Trade'
  },

  // =========================================================================
  // 8. APTITUDE & REASONING QUESTIONS (Campus & Placement Drives)
  // =========================================================================
  {
    id: 'apt-math-01',
    questionText: 'A shopkeeper marks an article 40% above its cost price and offers a cash discount of 20% to customers. What is the shopkeeper’s net profit percentage?',
    category: 'aptitude_reasoning',
    targetEducationLevels: ['intermediate', 'diploma_polytechnic', 'undergraduate'],
    difficulty: 'beginner',
    hints: 'Let Cost Price = 100. Marked Price = 140. Discount of 20% on 140 = 28. Selling Price = 140 - 28 = 112. Net Profit = (112 - 100) = 12%.',
    whatInterviewerLooksFor: 'Mental math speed, percentage calculation logic, clear step-by-step reasoning.',
    sampleAnswerOutline: [
      'Assume base cost price as 100 for easy calculation.',
      'Compute marked price at 140.',
      'Calculate 20% discount on 140 which is 28.',
      'Selling price is 112, giving a net profit of 12%.'
    ],
    subDomainTag: 'Quantitative Aptitude'
  },
  {
    id: 'apt-math-02',
    questionText: 'Pipe A can fill a water tank in 6 hours, while Pipe B can empty the same tank in 9 hours. If both pipes are opened simultaneously into an empty tank, how many hours will it take to fill completely?',
    category: 'aptitude_reasoning',
    targetEducationLevels: ['intermediate', 'diploma_polytechnic', 'undergraduate'],
    difficulty: 'intermediate',
    hints: 'In 1 hour: Pipe A fills 1/6, Pipe B empties 1/9. Net filling in 1 hour = (1/6 - 1/9) = (3 - 2)/18 = 1/18. Therefore, it takes 18 hours.',
    whatInterviewerLooksFor: 'Time and work logic, rate of work method, fractions.',
    subDomainTag: 'Pipes & Cisterns'
  },
  {
    id: 'apt-logic-01',
    questionText: 'Consider this logical premise: "All doctors are graduates. Some graduates are teachers." Can we logically conclude that "Some doctors are definitely teachers"? Explain your reasoning.',
    category: 'aptitude_reasoning',
    targetEducationLevels: ['intermediate', 'diploma_polytechnic', 'undergraduate', 'postgraduate'],
    difficulty: 'intermediate',
    hints: 'No. The subset of graduates who are teachers may have zero overlap with the subset of graduates who are doctors. Draw or describe the Venn diagram.',
    whatInterviewerLooksFor: 'Syllogism rules, avoiding assumptions, rigorous formal logic.',
    subDomainTag: 'Logical Deduction & Syllogisms'
  },
  {
    id: 'apt-sit-01',
    questionText: 'You find two important tasks on your desk: Task A is requested by a senior colleague and is due tomorrow, but Task B involves an urgent customer safety discrepancy that needs immediate attention. How do you resolve this dilemma?',
    category: 'aptitude_reasoning',
    targetEducationLevels: ['intermediate', 'diploma_polytechnic', 'undergraduate', 'postgraduate', 'professional_degree'],
    difficulty: 'intermediate',
    hints: 'Safety and compliance take unconditional priority. Immediately address Task B while politely informing the senior with expected completion time for Task A.',
    whatInterviewerLooksFor: 'Ethical judgment, safety-first mindset, professional upward communication.',
    subDomainTag: 'Situational & Ethical Reasoning'
  }
];

// ============================================================================
// 9. FILTER & RETRIEVAL UTILITIES
// ============================================================================

export function getQuestionsByEducationLevel(levelId: EducationLevelId): UniversalQuestion[] {
  return UNIVERSAL_QUESTION_BANKS.filter(q => q.targetEducationLevels.includes(levelId));
}

export function getQuestionsByIntermediateGroup(groupId: IntermediateGroupId): UniversalQuestion[] {
  const normGrp = String(groupId || '').toLowerCase();
  return UNIVERSAL_QUESTION_BANKS.filter(q => {
    if (q.intermediateGroup === normGrp) return true;
    if (normGrp === 'mbipc') {
      // MBiPC draws questions from dedicated pool as well as MPC & BiPC science questions
      if (q.intermediateGroup === 'mpc' || q.intermediateGroup === 'bipc') return true;
    }
    if ((normGrp === 'vocational' || normGrp === 'vocational_inter') && q.intermediateGroup === 'vocational_inter') return true;
    if (q.targetEducationLevels.includes('intermediate') && !q.intermediateGroup) return true;
    return false;
  });
}

export function getQuestionsByStream(streamId: AcademicStreamId, levelId?: EducationLevelId): UniversalQuestion[] {
  return UNIVERSAL_QUESTION_BANKS.filter(q => {
    const matchesStream = !q.targetStreams || q.targetStreams.includes(streamId);
    const matchesLevel = !levelId || q.targetEducationLevels.includes(levelId);
    return matchesStream && matchesLevel;
  });
}

export function getQuestionsByCategory(category: UniversalQuestionCategory, levelId?: EducationLevelId): UniversalQuestion[] {
  return UNIVERSAL_QUESTION_BANKS.filter(q => {
    const matchesCat = q.category === category;
    const matchesLevel = !levelId || q.targetEducationLevels.includes(levelId);
    return matchesCat && matchesLevel;
  });
}

export function getQuestionCountSummary(): Record<UniversalQuestionCategory, number> {
  const counts: Record<UniversalQuestionCategory, number> = {
    self_introduction: 0,
    hr_general: 0,
    communication: 0,
    career_exploration: 0,
    college_admission: 0,
    internship_entry_level: 0,
    subject_specific: 0,
    aptitude_reasoning: 0
  };

  for (const q of UNIVERSAL_QUESTION_BANKS) {
    if (counts[q.category] !== undefined) {
      counts[q.category]++;
    }
  }

  return counts;
}
