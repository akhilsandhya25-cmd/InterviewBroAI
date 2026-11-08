/**
 * InterviewBro AI — Universal Student Expansion
 * client/src/data/studentStreams.ts
 * 
 * Comprehensive taxonomy covering:
 * - All Education Levels (Intermediate, Diploma, UG, PG, Professional, ITI)
 * - Detailed Intermediate Groups (MPC, BiPC, MEC, CEC, HEC, MBiPC, Vocational)
 * - Career Exploration and Higher Study Pathways
 * - All 13 Academic & Professional Streams
 */

// ============================================================================
// 1. EDUCATION LEVELS
// ============================================================================

export type EducationLevelId =
  | 'intermediate'
  | 'diploma_polytechnic'
  | 'undergraduate'
  | 'postgraduate'
  | 'professional_degree'
  | 'iti_vocational';

export interface EducationLevel {
  id: EducationLevelId;
  name: string;
  shortName: string;
  description: string;
  typicalDuration: string;
  focusType: 'exploration_foundational' | 'practical_applied' | 'degree_career' | 'advanced_specialized' | 'trade_technical';
  primaryGoals: string[];
}

export const EDUCATION_LEVELS: EducationLevel[] = [
  {
    id: 'intermediate',
    name: 'Intermediate / 10+2 / Higher Secondary / Pre-University',
    shortName: 'Intermediate (10+2)',
    description: 'Foundational two-year junior college education preparing for university admissions, competitive entrance exams, and early career pathways.',
    typicalDuration: '2 Years (11th & 12th / Class XI & XII)',
    focusType: 'exploration_foundational',
    primaryGoals: [
      'College & University Admission Preparation',
      'National & State Competitive Entrance Exams (JEE, NEET, CUET, CLAT, IPMAT, NDA)',
      'Career Stream Exploration & Subject Clarity',
      'Early Entry Job Options (Defense, Clerical, Government Exams, Apprenticeships)'
    ]
  },
  {
    id: 'diploma_polytechnic',
    name: 'Diploma & Polytechnic Technical Education',
    shortName: 'Diploma / Polytechnic',
    description: 'Hands-on technical and engineering education designed for practical industry application, lateral entry into B.Tech/B.E, or direct junior engineering jobs.',
    typicalDuration: '3 Years (Post-10th) or 2 Years (Lateral Post-12th)',
    focusType: 'practical_applied',
    primaryGoals: [
      'Junior Engineer (JE) & Technician Campus Placements',
      'Lateral Entry into Engineering Degree (2nd Year B.Tech/B.E)',
      'Industrial Plant, Site Supervision, and Workshop Roles',
      'Core Technical Problem Solving & Machinery Handling'
    ]
  },
  {
    id: 'undergraduate',
    name: 'Undergraduate Degree (Bachelor’s Degrees)',
    shortName: 'Undergraduate (UG)',
    description: 'Foundational three or four-year university degree across arts, science, commerce, management, agriculture, nursing, and technology.',
    typicalDuration: '3 to 4 Years (B.A, B.Com, B.Sc, BBA, B.Tech, B.Sc Nursing, B.Sc Agri)',
    focusType: 'degree_career',
    primaryGoals: [
      'Campus Placements & Corporate Recruitment',
      'Off-Campus Entry-Level Fresher Jobs',
      'Postgraduate Entrance Exam Preparation (CAT, GATE, JAM, CUET-PG)',
      'Professional Internships and Real-World Project Work'
    ]
  },
  {
    id: 'postgraduate',
    name: 'Postgraduate Degree (Master’s & Doctoral Degrees)',
    shortName: 'Postgraduate (PG)',
    description: 'Advanced specialized degree emphasizing research, strategic business administration, advanced clinical practice, or specialized domain mastery.',
    typicalDuration: '2 Years (M.A, M.Com, M.Sc, MBA, MCA, M.Tech, M.Pharm, LL.M)',
    focusType: 'advanced_specialized',
    primaryGoals: [
      'Senior Corporate Campus Hiring & Management Trainee Programs',
      'Research & Development (R&D), Teaching, and Ph.D Pathways',
      'Consulting, Strategic Planning, and Specialized Domain Roles',
      'Advanced Thesis Defense & Subject Matter Expertise'
    ]
  },
  {
    id: 'professional_degree',
    name: 'Professional Degrees & Licensures',
    shortName: 'Professional Degree',
    description: 'Rigorous statutory degrees and chartered licensures requiring regulated internships, court moots, clinical rotations, or articleship.',
    typicalDuration: '4.5 to 5.5 Years (MBBS, BDS, LL.B, CA, CMA, CS, B.Arch, Pharm.D)',
    focusType: 'degree_career',
    primaryGoals: [
      'Clinical Residency, Articleship, or Judicial Clerkship',
      'Statutory Licensure and Professional Practice Registration',
      'Corporate Legal, Financial Auditing, or Hospital Practice',
      'High-Stakes Case Studies, Viva Voce, and Board Interviews'
    ]
  },
  {
    id: 'iti_vocational',
    name: 'ITI & Vocational Skill Certification',
    shortName: 'ITI & Vocational',
    description: 'Skill-based technical craft training under NCVT/SCVT focusing on practical trade machinery, safety compliance, and direct workshop employment.',
    typicalDuration: '1 to 2 Years (Electrician, Fitter, Welder, Machinist, COPA)',
    focusType: 'trade_technical',
    primaryGoals: [
      'Apprenticeship in PSUs (Railways, BHEL, ONGC, State Electricity Boards)',
      'Manufacturing Plant, Assembly Line, and Maintenance Technician Jobs',
      'Self-Employment and Small-Scale Technical Services',
      'Trade Viva, Practical Demonstration, and Workshop Safety Interviews'
    ]
  }
];

// ============================================================================
// 2. INTERMEDIATE (10+2) GROUPS & EXPLORATION PATHWAYS
// ============================================================================

export type IntermediateGroupId =
  | 'mpc'
  | 'bipc'
  | 'mec'
  | 'cec'
  | 'hec'
  | 'mbipc'
  | 'vocational_inter';

export interface CareerPathway {
  title: string;
  type: 'higher_education' | 'competitive_exam' | 'direct_entry' | 'professional_course' | 'career_exploration';
  targetCourseOrRole: string;
  description: string;
  typicalInterviewType: 'college_admission' | 'career_exploration' | 'competitive_viva' | 'entry_level_job';
}

export interface IntermediateGroup {
  id: IntermediateGroupId;
  code: string;
  name: string;
  subjects: string[];
  description: string;
  isJobSeekingDefault: boolean; // false: primary focus is college admission / entrance prep
  entranceExams: string[];
  careerPathways: CareerPathway[];
  coreInterviewThemes: string[];
  sampleRolesOrPrograms: string[];
}

export const INTERMEDIATE_GROUPS: IntermediateGroup[] = [
  {
    id: 'mpc',
    code: 'MPC',
    name: 'Mathematics, Physics & Chemistry',
    subjects: ['Mathematics (Calculus, Algebra, Coordinate Geometry)', 'Physics (Mechanics, Optics, Electromagnetism)', 'Chemistry (Organic, Inorganic, Physical)'],
    description: 'The premier STEM gateway for engineering, defense, pure sciences, computer applications, and analytical mathematics.',
    isJobSeekingDefault: false,
    entranceExams: ['JEE Main & Advanced', 'BITSAT', 'State Engineering CETs (EAMCET, KCET, MHT-CET, WBJEE)', 'NDA (National Defence Academy)', 'NATA (Architecture)', 'CUET (UG Science)', 'IISER / NISER / IAT'],
    careerPathways: [
      {
        title: 'Engineering & Technology (B.Tech / B.E)',
        type: 'higher_education',
        targetCourseOrRole: 'B.Tech in CSE, ECE, Mechanical, Civil, AI/DS',
        description: 'Four-year professional degree leading to core engineering, software architecture, and research.',
        typicalInterviewType: 'college_admission'
      },
      {
        title: 'National Defence Academy (NDA - Army/Navy/Air Force)',
        type: 'competitive_exam',
        targetCourseOrRole: 'Officer Cadet in Indian Armed Forces',
        description: 'Prestigious direct officer entry through UPSC written exam and Service Selection Board (SSB) 5-day interview.',
        typicalInterviewType: 'competitive_viva'
      },
      {
        title: 'Architecture & Design (B.Arch / B.Des)',
        type: 'higher_education',
        targetCourseOrRole: 'B.Arch via JEE Paper-2 / NATA',
        description: 'Focuses on structural design, 3D spatial thinking, urban planning, and building aesthetics.',
        typicalInterviewType: 'college_admission'
      },
      {
        title: 'Pure Sciences & Research (B.Sc / BS-MS)',
        type: 'higher_education',
        targetCourseOrRole: 'BS-MS at IISER / IISc / Central Universities',
        description: 'Deep dive into pure physics, pure mathematics, data analysis, or astronomical sciences.',
        typicalInterviewType: 'career_exploration'
      },
      {
        title: 'Merchant Navy & Commercial Pilot Training',
        type: 'direct_entry',
        targetCourseOrRole: 'Deck Cadet (IMU-CET) / Trainee Pilot',
        description: 'High-discipline maritime or aviation navigation careers with direct technical and psychometric interviews.',
        typicalInterviewType: 'entry_level_job'
      }
    ],
    coreInterviewThemes: [
      'Why did you choose Mathematics & Physics?',
      'Conceptual understanding of Calculus, Vectors, and Newton’s Laws',
      'Target college aspirations (IITs, NITs, BITS, State Universities)',
      'Analytical problem-solving and handling high-pressure time-bound tests',
      'Extracurricular science exhibitions, Olympiads, or coding curiosity'
    ],
    sampleRolesOrPrograms: ['Prospective B.Tech Aspirant', 'NDA Candidate', 'B.Sc Physics/Maths Student', 'Architecture Candidate', 'Merchant Navy Trainee']
  },
  {
    id: 'bipc',
    code: 'BiPC',
    name: 'Biology, Physics & Chemistry',
    subjects: ['Biology (Botany, Zoology, Genetics, Ecology)', 'Physics (Thermodynamics, Waves, Electronics)', 'Chemistry (Biomolecules, Solutions, Periodic Table)'],
    description: 'The dedicated healthcare, medical, biological science, and life-sciences gateway.',
    isJobSeekingDefault: false,
    entranceExams: ['NEET-UG (National Eligibility cum Entrance Test)', 'State Pharmacy & Agri CETs', 'ICAR AIEEA (Agriculture)', 'CUET (UG Biology & Biotechnology)', 'AIIMS Nursing Entrance'],
    careerPathways: [
      {
        title: 'Medicine & Surgery (MBBS / BDS)',
        type: 'higher_education',
        targetCourseOrRole: 'MBBS / Bachelor of Dental Surgery',
        description: 'Rigorous 5.5-year medical clinical graduation for aspiring doctors and surgeons.',
        typicalInterviewType: 'college_admission'
      },
      {
        title: 'Ayush & Alternate Medicine (BAMS, BHMS, BNYS)',
        type: 'higher_education',
        targetCourseOrRole: 'Ayurvedic, Homeopathic, or Naturopathic Physician',
        description: 'Holistic clinical medicine systems with expanding public and private healthcare roles.',
        typicalInterviewType: 'career_exploration'
      },
      {
        title: 'Pharmacy & Drug Research (B.Pharm / Pharm.D)',
        type: 'higher_education',
        targetCourseOrRole: 'Clinical Pharmacist, Formulation Scientist, Drug Inspector',
        description: 'Focus on pharmaceutical chemistry, drug discovery, clinical trials, and manufacturing.',
        typicalInterviewType: 'college_admission'
      },
      {
        title: 'B.Sc Nursing & Allied Healthcare',
        type: 'higher_education',
        targetCourseOrRole: 'Registered Nurse (RN), Medical Lab Technologist, Dialysis Tech',
        description: 'High-demand patient care, ICU triaging, and global healthcare nursing opportunities.',
        typicalInterviewType: 'college_admission'
      },
      {
        title: 'Agricultural & Veterinary Sciences (B.Sc Agri / BVSc)',
        type: 'higher_education',
        targetCourseOrRole: 'Agricultural Officer, Veterinary Surgeon, Food Technologist',
        description: 'Crop genetics, animal husbandry, agro-climatic farming, and rural bio-economy.',
        typicalInterviewType: 'career_exploration'
      }
    ],
    coreInterviewThemes: [
      'Motivation to enter healthcare, biology, or clinical sciences',
      'Empathy, patient care mindset, and resilience under medical pressure',
      'Conceptual biology (Genetics, Human Physiology, Plant Anatomy, Immunology)',
      'Backup pathways if exploring beyond NEET (Biotech, Agri, Pharmacy, Nursing)',
      'Ethical dilemmas in medical care and biological conservation'
    ],
    sampleRolesOrPrograms: ['NEET Medical Aspirant', 'B.Pharm Candidate', 'B.Sc Nursing Student', 'B.Sc Agriculture Aspirant', 'Biotechnology Researcher']
  },
  {
    id: 'mec',
    code: 'MEC',
    name: 'Mathematics, Economics & Commerce',
    subjects: ['Mathematics (Matrices, Statistics, Probability)', 'Economics (Micro, Macro, Indian Economic Development)', 'Commerce (Accountancy, Business Studies)'],
    description: 'The elite analytical business and finance stream blending quantitative mathematical rigor with commercial enterprise.',
    isJobSeekingDefault: false,
    entranceExams: ['IPMAT (IIM Indore/Rohtak 5-Year Integrated Program)', 'CA Foundation (ICAI)', 'CMA Foundation', 'CUET (B.Com Hons / Economics Hons)', 'NPAT', 'SET (Symbiosis)'],
    careerPathways: [
      {
        title: 'Chartered Accountancy & Cost Accounting (CA / CMA)',
        type: 'professional_course',
        targetCourseOrRole: 'Chartered Accountant (CA) / CMA Professional',
        description: 'Premier Indian accounting qualification with articleship, auditing, and corporate governance.',
        typicalInterviewType: 'competitive_viva'
      },
      {
        title: 'Integrated Management at IIMs (IPM - BBA+MBA)',
        type: 'higher_education',
        targetCourseOrRole: 'IIM 5-Year Integrated Program in Management',
        description: 'Direct entry after 12th into prestigious IIMs through IPMAT and personal interview (PI).',
        typicalInterviewType: 'college_admission'
      },
      {
        title: 'Economics (Hons) & Actuarial Science',
        type: 'higher_education',
        targetCourseOrRole: 'B.A / B.Sc Economics Hons, Actuarial Risk Analyst',
        description: 'Mathematical economic modeling, financial econometrics, and risk pricing for insurance/fintech.',
        typicalInterviewType: 'college_admission'
      },
      {
        title: 'Banking, Investment & Financial Analytics (B.Com / BBA Finance)',
        type: 'higher_education',
        targetCourseOrRole: 'Financial Analyst, Wealth Manager, Equity Research Intern',
        description: 'Corporate finance, stock market operations, and algorithmic accounting.',
        typicalInterviewType: 'career_exploration'
      }
    ],
    coreInterviewThemes: [
      'Why choose the combination of Mathematics with Economics & Commerce?',
      'Basic accounting logic (Golden Rules, Journal Entries, Balance Sheet balance)',
      'Understanding of current Indian economic developments (inflation, budget, RBI repo rates)',
      'Personal interview preparation for IPMAT or top university admissions',
      'Analytical thinking: interpreting graphs, statistical data, and market trends'
    ],
    sampleRolesOrPrograms: ['IPMAT Aspirant', 'CA Foundation Candidate', 'Economics (Hons) Aspirant', 'B.Com Analytical Finance Student', 'Banking Trainee']
  },
  {
    id: 'cec',
    code: 'CEC',
    name: 'Commerce, Economics & Civics',
    subjects: ['Commerce (Accountancy, Business Studies, Banking)', 'Economics (National Income, Market Structures, Banking)', 'Civics / Political Science (Indian Constitution, Governance, Public Administration)'],
    description: 'The classical foundation for commerce, enterprise, business administration, legal studies, and civil services.',
    isJobSeekingDefault: false,
    entranceExams: ['CUET-UG (Commerce & Humanities)', 'CLAT (Common Law Admission Test for 5-Year Law)', 'CA / CMA / CS Foundation', 'State University Entrance Tests'],
    careerPathways: [
      {
        title: 'Corporate Secretaryship & Legal Studies (CS / 5-Year B.A LL.B)',
        type: 'professional_course',
        targetCourseOrRole: 'Company Secretary (ICSI) / Corporate Legal Advocate',
        description: 'Corporate compliance, board meetings, legal filings, and contract arbitration.',
        typicalInterviewType: 'college_admission'
      },
      {
        title: 'Bachelor of Commerce & Business Studies (B.Com General/Computers/BBA)',
        type: 'higher_education',
        targetCourseOrRole: 'B.Com / BBA Graduate',
        description: 'Three-year university degree leading to corporate banking, operations, and sales roles.',
        typicalInterviewType: 'career_exploration'
      },
      {
        title: 'Civil Services & Public Administration Foundation',
        type: 'competitive_exam',
        targetCourseOrRole: 'UPSC / State PSC Civil Services Foundation',
        description: 'Long-term preparatory track for IAS, IPS, State Revenue, and administrative governance.',
        typicalInterviewType: 'competitive_viva'
      },
      {
        title: 'Banking, Retail Operations & Clerical Entry',
        type: 'direct_entry',
        targetCourseOrRole: 'Customer Service Associate, Retail Banking Assistant, Junior Cashier',
        description: 'Immediate operational and clerical jobs in local branches, retail firms, and cooperatives.',
        typicalInterviewType: 'entry_level_job'
      }
    ],
    coreInterviewThemes: [
      'Understanding the fundamentals of business transactions and accounting',
      'Knowledge of Indian Constitution, fundamental rights, and political governance',
      'Choosing between Law, Chartered Studies, General B.Com, and Civil Services',
      'Verbal communication, debate capability, and ethical business values',
      'Real-world business observation: local enterprise, banking services, and trade'
    ],
    sampleRolesOrPrograms: ['5-Year Integrated Law Aspirant', 'Company Secretary Candidate', 'B.Com General Student', 'Civil Services Foundation Aspirant', 'Retail Banking Trainee']
  },
  {
    id: 'hec',
    code: 'HEC',
    name: 'History, Economics & Civics',
    subjects: ['History (Ancient, Medieval, Modern India, World History)', 'Economics (Developmental Economics, Agriculture, Poverty)', 'Civics (Political Systems, International Relations, Judiciary)'],
    description: 'The premier social science and liberal arts stream for civil services, diplomacy, law, journalism, and public policy.',
    isJobSeekingDefault: false,
    entranceExams: ['CLAT / AILET (National Law Universities)', 'CUET (Arts & Humanities - DU, JNU, BHU, HCU)', 'Civil Services Foundation', 'Journalism & Mass Comm Entrances'],
    careerPathways: [
      {
        title: '5-Year Integrated Law (B.A LL.B at NLUs)',
        type: 'higher_education',
        targetCourseOrRole: 'Advocate, Legal Researcher, Judicial Magistrate Aspirant',
        description: 'Top-tier legal education combining historical jurisprudence with modern constitutional law.',
        typicalInterviewType: 'college_admission'
      },
      {
        title: 'Liberal Arts & Social Sciences (B.A Honours)',
        type: 'higher_education',
        targetCourseOrRole: 'B.A in Political Science, History, Sociology, English Lit',
        description: 'In-depth humanities study developing critical inquiry, research writing, and civil service readiness.',
        typicalInterviewType: 'college_admission'
      },
      {
        title: 'Journalism, Media & Mass Communication',
        type: 'higher_education',
        targetCourseOrRole: 'Broadcast Journalist, Content Writer, Public Relations Executive',
        description: 'Investigative reporting, digital media storytelling, broadcasting, and editorial writing.',
        typicalInterviewType: 'career_exploration'
      },
      {
        title: 'Social Work, NGOs & Public Policy',
        type: 'career_exploration',
        targetCourseOrRole: 'Community Development Coordinator, NGO Program Associate',
        description: 'Grassroots social impact, education initiatives, and public welfare execution.',
        typicalInterviewType: 'career_exploration'
      }
    ],
    coreInterviewThemes: [
      'Why choose the Humanities & Social Sciences in an era of technology?',
      'Analysis of historical events and their relevance to modern democratic society',
      'Awareness of current social challenges: education, equality, governance, and rural growth',
      'Reading habits, analytical essay writing, and public speaking ability',
      'Interview preparation for Central Universities, Law schools, and scholarship programs'
    ],
    sampleRolesOrPrograms: ['NLU Law Candidate', 'B.A Political Science Aspirant', 'Journalism & Mass Media Student', 'Civil Services Foundation Aspirant', 'Public Policy Intern']
  },
  {
    id: 'mbipc',
    code: 'MBiPC',
    name: 'Mathematics, Biology, Physics & Chemistry (4-Subject Science)',
    subjects: ['Mathematics', 'Biology', 'Physics', 'Chemistry'],
    description: 'The dual-path science stream keeping both Engineering and Medical/Biotechnology opportunities open simultaneously.',
    isJobSeekingDefault: false,
    entranceExams: ['JEE Main', 'NEET-UG', 'Biotechnology Entrances', 'State CETs for both Engg & Agri/Pharmacy', 'CUET Science'],
    careerPathways: [
      {
        title: 'Biomedical & Genetic Engineering',
        type: 'higher_education',
        targetCourseOrRole: 'B.Tech Biomedical Engineering, Bioinformatics Specialist',
        description: 'Applies engineering principles to medical diagnostics, prosthetics, and genomics.',
        typicalInterviewType: 'college_admission'
      },
      {
        title: 'Dual Option Strategy (NEET & JEE)',
        type: 'competitive_exam',
        targetCourseOrRole: 'Medical (MBBS) or Engineering (B.Tech) Selection',
        description: 'Managing parallel preparation for medical and engineering entrance exams.',
        typicalInterviewType: 'career_exploration'
      }
    ],
    coreInterviewThemes: [
      'Managing the demanding workload of four major science subjects',
      'How to evaluate whether you lean more toward engineering or healthcare',
      'Interdisciplinary fields: Bioinformatics, Computational Biology, Neuroscience',
      'Time management and psychological resilience under heavy study schedules'
    ],
    sampleRolesOrPrograms: ['Biomedical Engineering Aspirant', 'Bioinformatics Student', 'Dual NEET/JEE Candidate']
  },
  {
    id: 'vocational_inter',
    code: 'Vocational Inter',
    name: 'Vocational Intermediate / Applied Practical 10+2',
    subjects: ['Applied Trade / Domain Practicals', 'Accounting & Taxation / Paramedical / Computer Applications / Auto Servicing', 'General English & Life Skills'],
    description: 'Direct skill-oriented intermediate qualification combining 10+2 academic equivalence with immediate practical trade readiness.',
    isJobSeekingDefault: true,
    entranceExams: ['Lateral Entry CETs to Polytechnic / Degrees', 'Apprenticeship Tests', 'State Vocational Merit Drives'],
    careerPathways: [
      {
        title: 'Direct Industry Entry & Apprenticeships',
        type: 'direct_entry',
        targetCourseOrRole: 'Junior Lab Tech, Tax Assistant, Field Auto Technician, Data Entry Operator',
        description: 'Immediate employment in local businesses, clinics, accounting firms, and service centers.',
        typicalInterviewType: 'entry_level_job'
      },
      {
        title: 'Lateral Entry into Regular Degree or Diploma',
        type: 'higher_education',
        targetCourseOrRole: 'Polytechnic 2nd Year, Regular B.Com / BCA',
        description: 'Transitioning from vocational diploma to university degree with practical edge.',
        typicalInterviewType: 'college_admission'
      }
    ],
    coreInterviewThemes: [
      'Hands-on practical equipment or software handled during vocational training',
      'Customer interaction, trade safety, and reliability on the job',
      'Balancing immediate family financial goals with long-term educational growth',
      'Willingness to learn, follow standard operating procedures, and maintain discipline'
    ],
    sampleRolesOrPrograms: ['Junior Accounting Assistant', 'Paramedical Lab Trainee', 'Computer Operator', 'Service Center Technician']
  }
];

// ============================================================================
// 3. ALL 13 ACADEMIC & PROFESSIONAL STREAMS
// ============================================================================

export type AcademicStreamId =
  | 'commerce'
  | 'arts_humanities'
  | 'science'
  | 'engineering_technology'
  | 'healthcare_medicine'
  | 'pharmacy'
  | 'nursing_allied'
  | 'education_teaching'
  | 'law_legal'
  | 'agriculture_forestry'
  | 'hospitality_tourism'
  | 'management_business'
  | 'iti_vocational';

export interface AcademicStream {
  id: AcademicStreamId;
  name: string;
  tagline: string;
  categoryBadge: string;
  iconName: string;
  accentColor: string;
  description: string;
  supportedDegrees: {
    levelId: EducationLevelId;
    degreeName: string;
    abbreviation: string;
    specialisations: string[];
  }[];
  popularTargetRoles: string[];
  coreCompetencyPillars: {
    key: string;
    label: string;
    description: string;
  }[];
  commonHiringCompaniesOrSectors: string[];
  typicalInterviewFormat: string[];
}

export const ACADEMIC_STREAMS: AcademicStream[] = [
  // 1. COMMERCE & ACCOUNTING
  {
    id: 'commerce',
    name: 'Commerce, Accounting & Taxation',
    tagline: 'Financial Integrity, Corporate Audits & Business Compliance',
    categoryBadge: 'Commerce & Finance',
    iconName: 'Calculator',
    accentColor: 'from-amber-600 to-emerald-700',
    description: 'Covers financial accounting, taxation (GST & Direct Tax), auditing, commercial laws, corporate finance, and banking operations.',
    supportedDegrees: [
      {
        levelId: 'intermediate',
        degreeName: 'Intermediate Commerce (MEC / CEC)',
        abbreviation: 'MEC / CEC',
        specialisations: ['Mathematics & Commerce', 'Economics & Accountancy', 'Civics & Commerce']
      },
      {
        levelId: 'undergraduate',
        degreeName: 'Bachelor of Commerce',
        abbreviation: 'B.Com / B.Com (Hons)',
        specialisations: ['Accounting & Finance', 'Corporate Secretaryship', 'Taxation & GST', 'Banking & Insurance', 'Computer Applications in Business']
      },
      {
        levelId: 'postgraduate',
        degreeName: 'Master of Commerce',
        abbreviation: 'M.Com',
        specialisations: ['Advanced Costing', 'Financial Management', 'International Business', 'Direct & Indirect Taxes']
      },
      {
        levelId: 'professional_degree',
        degreeName: 'Chartered Accountancy & Cost Accounting',
        abbreviation: 'CA / CMA / CS',
        specialisations: ['Statutory Audit', 'Direct Taxation', 'Forensic Audit', 'Corporate Legal Compliance']
      }
    ],
    popularTargetRoles: [
      'Accountant / Accounts Executive',
      'Tax Associate (Direct & Indirect Tax / GST)',
      'Audit Assistant / Internal Auditor',
      'Financial Analyst / Cost Trainee',
      'Accounts Payable / Receivable Specialist',
      'KYC & Banking Compliance Officer'
    ],
    coreCompetencyPillars: [
      { key: 'accountingPrinciples', label: 'Accounting Fundamentals', description: 'Application of Golden Rules, Journal Entries, Trial Balance, Ledger reconciliation, and financial statement structure.' },
      { key: 'taxationAndCompliance', label: 'Taxation & Regulatory Knowledge', description: 'Understanding GST mechanisms, TDS deductions, Income Tax slabs, and statutory filing calendars.' },
      { key: 'analyticalAccuracy', label: 'Numerical & Analytical Accuracy', description: 'Discrepancy detection, bank reconciliation, ratio analysis, and working capital optimization.' },
      { key: 'professionalCommunication', label: 'Audit & Client Articulation', description: 'Communicating findings objectively, ethical integrity, and professional correspondence.' }
    ],
    commonHiringCompaniesOrSectors: ['Big 4 (Deloitte, EY, PwC, KPMG)', 'BDO & Grant Thornton', 'Private & Public Sector Banks (HDFC, ICICI, SBI)', 'Genpact / WNS', 'Corporate Accounting Departments', 'Mid-sized CA Firms'],
    typicalInterviewFormat: ['Technical Accounting Test (Journal & Ledger)', 'GST & Tax Technical Viva', 'Excel & Tally Practical Round', 'Managerial & Ethical Fit']
  },

  // 2. ARTS & HUMANITIES
  {
    id: 'arts_humanities',
    name: 'Arts, Humanities & Social Sciences',
    tagline: 'Critical Inquiry, Cultural Analysis & Human-Centered Communication',
    categoryBadge: 'Humanities & Social Work',
    iconName: 'BookOpen',
    accentColor: 'from-purple-600 to-indigo-800',
    description: 'Encompasses literature, sociology, history, political science, psychology, public relations, mass communication, and social work.',
    supportedDegrees: [
      {
        levelId: 'intermediate',
        degreeName: 'Intermediate Arts (HEC / CEC)',
        abbreviation: 'HEC',
        specialisations: ['History, Economics, Civics', 'Sociology & Public Admin']
      },
      {
        levelId: 'undergraduate',
        degreeName: 'Bachelor of Arts',
        abbreviation: 'B.A',
        specialisations: ['English Literature', 'Psychology', 'Political Science', 'Journalism & Mass Comm', 'Social Work (BSW)']
      },
      {
        levelId: 'postgraduate',
        degreeName: 'Master of Arts',
        abbreviation: 'M.A / MSW',
        specialisations: ['Applied Psychology', 'Development Studies', 'Public Policy', 'Corporate Social Responsibility (CSR)', 'Media Studies']
      }
    ],
    popularTargetRoles: [
      'Content Strategist / Copywriter',
      'Public Relations (PR) Coordinator',
      'HR Trainee & Talent Acquisition',
      'Social Worker / NGO Project Officer',
      'Instructional Designer & Academic Editor',
      'Civil Services / Government Aspirant'
    ],
    coreCompetencyPillars: [
      { key: 'criticalThinking', label: 'Critical Thinking & Analysis', description: 'Deconstructing societal issues, cross-cultural perspectives, and nuanced argument formation.' },
      { key: 'verbalArticulation', label: 'Written & Spoken Eloquence', description: 'Compelling storytelling, empathetic listening, clarity of thought, and persuasive speech.' },
      { key: 'humanRelations', label: 'Empathy & Stakeholder Handling', description: 'Understanding human psychology, counseling fundamentals, and community engagement.' },
      { key: 'researchMethodology', label: 'Qualitative Research & Fact-Finding', description: 'Survey methodology, source verification, archival research, and editorial rigor.' }
    ],
    commonHiringCompaniesOrSectors: ['Publishing Houses (OUP, Pearson)', 'Media & News Networks (NDTV, Hindu, Indian Express)', 'NGOs & UN Agencies (Oxfam, CRY, UNICEF)', 'Corporate CSR Wings', 'Advertising & PR Agencies (Ogilvy, Edelman)'],
    typicalInterviewFormat: ['Portfolio / Writing Sample Evaluation', 'Case Scenario & Social Analysis Viva', 'Extempore Spoken Speech Round', 'HR & Cultural Alignment']
  },

  // 3. SCIENCE & MATHEMATICS
  {
    id: 'science',
    name: 'Science & Mathematics',
    tagline: 'Empirical Discovery, Laboratory Rigor & Quantitative Modeling',
    categoryBadge: 'Physical & Bio Sciences',
    iconName: 'Atom',
    accentColor: 'from-blue-600 to-cyan-700',
    description: 'Encompasses physics, chemistry, mathematics, statistics, biotechnology, microbiology, and environmental sciences.',
    supportedDegrees: [
      {
        levelId: 'intermediate',
        degreeName: 'Intermediate Science (MPC / BiPC)',
        abbreviation: 'MPC / BiPC',
        specialisations: ['Physics & Maths', 'Chemistry & Biology', 'Electronics']
      },
      {
        levelId: 'undergraduate',
        degreeName: 'Bachelor of Science',
        abbreviation: 'B.Sc / BS',
        specialisations: ['Physics', 'Chemistry', 'Mathematics', 'Statistics', 'Biotechnology', 'Microbiology', 'Data Science']
      },
      {
        levelId: 'postgraduate',
        degreeName: 'Master of Science',
        abbreviation: 'M.Sc',
        specialisations: ['Analytical Chemistry', 'Applied Statistics', 'Molecular Biology', 'Theoretical Physics', 'Biochemical Tech']
      }
    ],
    popularTargetRoles: [
      'Quality Control (QC) & QA Chemist',
      'Laboratory Research Assistant',
      'Statistical Data Analyst',
      'Clinical Trial Data Coordinator',
      'Environmental Impact Officer',
      'Academic Science Instructor'
    ],
    coreCompetencyPillars: [
      { key: 'scientificMethod', label: 'Scientific Principles & Theory', description: 'Deep comprehension of chemical reactions, physical laws, statistical probability, and biological pathways.' },
      { key: 'laboratoryProficiency', label: 'Experimental & Lab Standards', description: 'Safe chemical handling, calibration of instruments (Spectrophotometer, Titration, Centrifuge), and GMP.' },
      { key: 'dataInterpretation', label: 'Quantitative & Statistical Logic', description: 'Hypothesis testing, error margins, regression analysis, and data visualization.' },
      { key: 'scientificDocumentation', label: 'Technical Reporting & Precision', description: 'SOP documentation, lab notebook accuracy, and objective presentation of findings.' }
    ],
    commonHiringCompaniesOrSectors: ['R&D Testing Labs', 'Chemical & Fertilizer Plants', 'Biotech Companies (Biocon, Serum Institute)', 'Data Analytics Consultancies', 'Academic & Research Institutions (CSIR, ICMR)'],
    typicalInterviewFormat: ['Subject Theory Viva (Organic/Physical/Calculus)', 'Lab Instrumentation & Safety Viva', 'Numerical Aptitude Assessment', 'Research Project Walkthrough']
  },

  // 4. ENGINEERING & TECHNOLOGY (Core & Software)
  {
    id: 'engineering_technology',
    name: 'Engineering & Technology (Core & Computer Sciences)',
    tagline: 'Systems Engineering, Manufacturing, Infrastructure & Software Architecture',
    categoryBadge: 'Engineering & Technology',
    iconName: 'Cpu',
    accentColor: 'from-sky-600 to-blue-800',
    description: 'Includes both traditional core engineering (Mechanical, Civil, EEE, ECE, Chemical) and software/IT computer engineering.',
    supportedDegrees: [
      {
        levelId: 'diploma_polytechnic',
        degreeName: 'Diploma in Engineering',
        abbreviation: 'Polytechnic Diploma',
        specialisations: ['Mechanical', 'Civil', 'Electrical & Electronics', 'Electronics & Comm', 'Automobile']
      },
      {
        levelId: 'undergraduate',
        degreeName: 'Bachelor of Technology / Bachelor of Engineering',
        abbreviation: 'B.Tech / B.E',
        specialisations: ['Computer Science & IT', 'Mechanical Engineering', 'Civil Engineering', 'Electronics & Communication', 'Electrical Engineering', 'Robotics & Automation']
      },
      {
        levelId: 'postgraduate',
        degreeName: 'Master of Technology',
        abbreviation: 'M.Tech / M.E',
        specialisations: ['VLSI Design', 'Structural Engineering', 'Thermal Engineering', 'Computer Networks & AI', 'Power Systems']
      }
    ],
    popularTargetRoles: [
      'Site Engineer (Civil Infrastructure)',
      'Design Engineer (Mechanical CAD / SolidWorks)',
      'Embedded & VLSI Hardware Engineer',
      'Electrical Maintenance Engineer',
      'Software Development Engineer (SDE-1)',
      'Full Stack & Cloud Developer'
    ],
    coreCompetencyPillars: [
      { key: 'engineeringFundamentals', label: 'Core Engineering Principles', description: 'Thermodynamics, Strength of Materials, Circuit Theory, Structural Analysis, or Data Structures.' },
      { key: 'problemSolving', label: 'Technical Troubleshooting & Design', description: 'Root cause analysis, schematic reading, fault isolation, and practical system design.' },
      { key: 'projectDelivery', label: 'Implementation & Safety Standards', description: 'Blueprint interpretation, IS/IEEE codes compliance, project milestones, and optimization.' },
      { key: 'communication', label: 'Technical Articulation & Teamwork', description: 'Explaining engineering trade-offs, documentation, and cross-functional coordination.' }
    ],
    commonHiringCompaniesOrSectors: ['Larsen & Toubro (L&T)', 'Tata Motors / Tata Steel', 'Bosch', 'Schneider Electric', 'BHEL / NTPC', 'IT Service MNCs (TCS, Infosys)', 'Product Tech Firms'],
    typicalInterviewFormat: ['Domain Engineering Theory Round', 'CAD / Coding / Blueprint Practical', 'Project Deep-Dive Viva', 'HR & Operational Alignment']
  },

  // 5. HEALTHCARE & MEDICINE
  {
    id: 'healthcare_medicine',
    name: 'Healthcare, Medicine & Dentistry',
    tagline: 'Clinical Diagnosis, Patient Safety & Medical Compassion',
    categoryBadge: 'Medical & Clinical Practice',
    iconName: 'HeartPulse',
    accentColor: 'from-rose-600 to-red-800',
    description: 'Encompasses doctors, dental surgeons, physiotherapists, and alternative clinical medicine practitioners.',
    supportedDegrees: [
      {
        levelId: 'professional_degree',
        degreeName: 'Bachelor of Medicine, Bachelor of Surgery',
        abbreviation: 'MBBS',
        specialisations: ['General Medicine', 'Surgery', 'Pediatrics', 'Obstetrics & Gynaecology']
      },
      {
        levelId: 'professional_degree',
        degreeName: 'Bachelor of Dental Surgery',
        abbreviation: 'BDS',
        specialisations: ['Oral Surgery', 'Orthodontics', 'Periodontics', 'Prosthodontics']
      },
      {
        levelId: 'undergraduate',
        degreeName: 'Bachelor of Physiotherapy',
        abbreviation: 'BPT',
        specialisations: ['Orthopedic Rehabilitation', 'Neurological Rehab', 'Sports Medicine']
      },
      {
        levelId: 'postgraduate',
        degreeName: 'Doctor of Medicine / Master of Surgery',
        abbreviation: 'MD / MS',
        specialisations: ['Internal Medicine', 'General Surgery', 'Anaesthesia', 'Radiology']
      }
    ],
    popularTargetRoles: [
      'Junior Resident Medical Officer (RMO)',
      'General Duty Medical Officer (GDMO)',
      'Associate Dental Surgeon',
      'Clinical Physiotherapist',
      'Emergency Room (ER) Medical Officer',
      'Medical Advisory & Telehealth Consultant'
    ],
    coreCompetencyPillars: [
      { key: 'clinicalDiagnosis', label: 'Clinical Assessment & Diagnosis', description: 'History taking, differential diagnosis, symptom recognition, and diagnostic interpretation (ECG, X-Ray, Blood panels).' },
      { key: 'emergencyProtocols', label: 'Emergency Management & BLS/ACLS', description: 'Handling acute distress, CPR execution, anaphylaxis, shock management, and dosage calculations.' },
      { key: 'medicalEthics', label: 'Medical Ethics & Patient Empathy', description: 'Patient consent, confidentiality, breaking difficult news, and bedside communication.' },
      { key: 'interpersonalCommunication', label: 'Multidisciplinary Team Care', description: 'Clear communication with nurses, surgeons, patient families, and documentation.' }
    ],
    commonHiringCompaniesOrSectors: ['Apollo Hospitals', 'Fortis Healthcare', 'Max Healthcare', 'Manipal Hospitals', 'Government District Hospitals', 'Private Dental & Rehab Clinics'],
    typicalInterviewFormat: ['Clinical Case Scenario & Viva', 'Emergency Room Simulation Questions', 'Medical Ethics & Patient Communication', 'Panel Medical Board Interview']
  },

  // 6. PHARMACY & PHARMACEUTICAL SCIENCES
  {
    id: 'pharmacy',
    name: 'Pharmacy & Pharmaceutical Sciences',
    tagline: 'Drug Formulation, Clinical Pharmacology & Pharmacovigilance',
    categoryBadge: 'Pharma & Drug Sciences',
    iconName: 'Pill',
    accentColor: 'from-teal-600 to-cyan-800',
    description: 'Encompasses drug manufacturing, pharmaceutical analysis, clinical pharmacy, regulatory affairs, and pharmacovigilance.',
    supportedDegrees: [
      {
        levelId: 'diploma_polytechnic',
        degreeName: 'Diploma in Pharmacy',
        abbreviation: 'D.Pharm',
        specialisations: ['Community Pharmacy', 'Hospital Dispensing']
      },
      {
        levelId: 'undergraduate',
        degreeName: 'Bachelor of Pharmacy',
        abbreviation: 'B.Pharm',
        specialisations: ['Pharmaceutics', 'Pharmacology', 'Pharmaceutical Chemistry', 'Pharmacognosy']
      },
      {
        levelId: 'professional_degree',
        degreeName: 'Doctor of Pharmacy',
        abbreviation: 'Pharm.D',
        specialisations: ['Clinical Pharmacy', 'Hospital Patient Monitoring', 'Therapeutic Drug Monitoring']
      },
      {
        levelId: 'postgraduate',
        degreeName: 'Master of Pharmacy',
        abbreviation: 'M.Pharm',
        specialisations: ['Drug Regulatory Affairs (DRA)', 'Quality Assurance (QA/QC)', 'Industrial Pharmacy']
      }
    ],
    popularTargetRoles: [
      'Quality Control (QC) & QA Officer',
      'Pharmacovigilance (PV) Associate',
      'Formulation & Development (F&D) Trainee',
      'Drug Regulatory Affairs Associate',
      'Clinical Research Coordinator (CRC)',
      'Medical Representative / Product Executive'
    ],
    coreCompetencyPillars: [
      { key: 'pharmacologyKnowledge', label: 'Pharmacology & Mechanism of Action', description: 'Drug classifications, pharmacokinetics (ADME), contraindications, and drug-drug interactions.' },
      { key: 'gmpCompliance', label: 'GMP, GLP & Quality Standards', description: 'Knowledge of USFDA, Schedule M, ICH guidelines, sterile manufacturing, and validation.' },
      { key: 'analyticalTesting', label: 'Instrumental Chemistry & Analysis', description: 'HPLC, UV-Vis spectroscopy, dissolution testing, assay determination, and stability studies.' },
      { key: 'regulatoryEthics', label: 'Adverse Event Reporting & Ethics', description: 'Safety reporting, MedDRA coding, case narrative writing, and patient safety vigilance.' }
    ],
    commonHiringCompaniesOrSectors: ['Dr. Reddy’s Laboratories', 'Sun Pharma', 'Cipla', 'Lupin', 'Aurobindo Pharma', 'TCS/Cognizant Life Sciences PV Wings'],
    typicalInterviewFormat: ['Pharmacology & Mechanism Viva', 'Analytical Instrument (HPLC/Dissolution) Round', 'Regulatory Guidelines (ICH/GMP) Q&A', 'HR & Role Fit']
  },

  // 7. NURSING & ALLIED HEALTH SCIENCES
  {
    id: 'nursing_allied',
    name: 'Nursing & Allied Health Sciences',
    tagline: 'Compassionate Care, Critical Triaging & Bedside Excellence',
    categoryBadge: 'Nursing & Patient Care',
    iconName: 'ShieldCheck',
    accentColor: 'from-emerald-600 to-teal-800',
    description: 'Encompasses professional registered nursing, patient monitoring, perioperative care, emergency triaging, and community health.',
    supportedDegrees: [
      {
        levelId: 'diploma_polytechnic',
        degreeName: 'General Nursing and Midwifery',
        abbreviation: 'GNM',
        specialisations: ['General Ward Care', 'Maternal & Child Health']
      },
      {
        levelId: 'undergraduate',
        degreeName: 'Bachelor of Science in Nursing',
        abbreviation: 'B.Sc Nursing',
        specialisations: ['Medical-Surgical Nursing', 'Pediatric Nursing', 'Critical Care & ICU', 'Obstetric Nursing']
      },
      {
        levelId: 'postgraduate',
        degreeName: 'Master of Science in Nursing',
        abbreviation: 'M.Sc Nursing',
        specialisations: ['Cardiothoracic Nursing', 'Community Health Nursing', 'Psychiatric Nursing', 'Nursing Administration']
      }
    ],
    popularTargetRoles: [
      'Staff Nurse (Wards & OPD)',
      'ICU & Critical Care Nurse',
      'Operation Theatre (OT) Nurse',
      'Pediatric & Neonatal Nurse',
      'Emergency Department Triage Nurse',
      'Clinical Nurse Instructor'
    ],
    coreCompetencyPillars: [
      { key: 'bedsideCare', label: 'Clinical Procedures & Nursing Care', description: 'IV cannulation, catheterization, wound dressing, aseptic technique, and medication administration (Six Rights).' },
      { key: 'vitalTriage', label: 'Vitals Monitoring & Early Warning Signs', description: 'Recognizing sepsis, respiratory distress, GCS drop, cardiac arrhythmias, and prompt escalation.' },
      { key: 'infectionControl', label: 'Infection Control & Bio-Medical Waste', description: 'Hand hygiene, PPE protocol, needle-stick injury prevention, and BMW color-coded segregation.' },
      { key: 'patientCommunication', label: 'Patient Advocacy & Calming Presence', description: 'Therapeutic communication, comforting anxious families, shift handovers (SBAR), and documentation.' }
    ],
    commonHiringCompaniesOrSectors: ['Apollo Hospital Networks', 'Fortis Healthcare', 'Medanta', 'Columbia Asia / Manipal', 'Government Medical Colleges', 'International NHS / Middle East Recruitment Agencies'],
    typicalInterviewFormat: ['Bedside Clinical Scenario Round', 'Medication Dosage Calculation Test', 'Infection Control & BMW Viva', 'Stress Handling & Shift Adaptability Interview']
  },

  // 8. EDUCATION & TEACHING
  {
    id: 'education_teaching',
    name: 'Education, Pedagogy & Teaching',
    tagline: 'Instructional Mastery, Inclusive Classrooms & Student Mentorship',
    categoryBadge: 'Education & Academics',
    iconName: 'GraduationCap',
    accentColor: 'from-amber-600 to-orange-700',
    description: 'Encompasses primary, secondary, and higher secondary teachers, academic subject matter experts, and educational curriculum coordinators.',
    supportedDegrees: [
      {
        levelId: 'diploma_polytechnic',
        degreeName: 'Diploma in Elementary Education',
        abbreviation: 'D.El.Ed',
        specialisations: ['Primary Childhood Education', 'Basic Literacy & Numeracy']
      },
      {
        levelId: 'undergraduate',
        degreeName: 'Bachelor of Education',
        abbreviation: 'B.Ed',
        specialisations: ['Mathematics Pedagogy', 'Physical Science', 'Biological Science', 'Social Studies', 'English Pedagogy']
      },
      {
        levelId: 'postgraduate',
        degreeName: 'Master of Education',
        abbreviation: 'M.Ed',
        specialisations: ['Educational Technology', 'Special Education', 'Curriculum Design', 'Educational Psychology']
      }
    ],
    popularTargetRoles: [
      'High School Teacher (TGT - Subject Specific)',
      'Senior Secondary Lecturer (PGT)',
      'Primary School Educator (PRT)',
      'Curriculum Specialist / EdTech SME',
      'Academic Counselor & Student Mentor'
    ],
    coreCompetencyPillars: [
      { key: 'pedagogicalKnowledge', label: 'Lesson Planning & Pedagogy', description: 'Constructivist teaching, Bloom’s Taxonomy, micro-teaching, and activity-based learning.' },
      { key: 'classroomManagement', label: 'Classroom Leadership & Engagement', description: 'Handling mixed-ability classes, addressing student disinterest, maintaining discipline, and positive reinforcement.' },
      { key: 'subjectMastery', label: 'Subject Matter Depth & Simplification', description: 'Breaking complex concepts into accessible metaphors without mathematical or factual dilution.' },
      { key: 'empathyMentorship', label: 'Student Empathy & Inclusive Education', description: 'Recognizing learning difficulties (Dyslexia/ADHD), parent-teacher communication, and student encouragement.' }
    ],
    commonHiringCompaniesOrSectors: ['Kendriya Vidyalayas / Navodaya Schools', 'CBSE / ICSE Private School Chains (DPS, DAV, Ryan)', 'EdTech Platforms', 'Junior Colleges & Intermediate Academies'],
    typicalInterviewFormat: ['15-Minute Live Teaching Demo (Classroom simulation)', 'Subject Concept Viva', 'Pedagogical Dilemma Round', 'Principal & Panel Interview']
  },

  // 9. LAW & LEGAL STUDIES
  {
    id: 'law_legal',
    name: 'Law, Legal Studies & Corporate Compliance',
    tagline: 'Statutory Mastery, Constitutional Advocacy & Contractual Precision',
    categoryBadge: 'Legal & Advocacy',
    iconName: 'Scale',
    accentColor: 'from-slate-700 to-zinc-900',
    description: 'Encompasses corporate contract law, criminal jurisprudence, constitutional litigation, IPR, arbitration, and regulatory compliance.',
    supportedDegrees: [
      {
        levelId: 'undergraduate',
        degreeName: 'Bachelor of Laws (5-Year Integrated / 3-Year)',
        abbreviation: 'LL.B / B.A LL.B',
        specialisations: ['Constitutional Law', 'Corporate & Commercial Law', 'Criminal Jurisprudence', 'Intellectual Property Rights (IPR)', 'Cyber Law']
      },
      {
        levelId: 'postgraduate',
        degreeName: 'Master of Laws',
        abbreviation: 'LL.M',
        specialisations: ['Corporate Restructuring & Mergers', 'International Arbitration', 'Human Rights Law', 'Taxation Law']
      }
    ],
    popularTargetRoles: [
      'Junior Legal Associate (Law Firm)',
      'In-House Corporate Legal Counsel',
      'Litigation Associate (Trial / High Court)',
      'Legal Compliance & Contract Auditor',
      'Legal Researcher & Drafter',
      'Judicial Services Aspirant'
    ],
    coreCompetencyPillars: [
      { key: 'statutoryInterpretation', label: 'Legal Knowledge & Precedent Analysis', description: 'Application of Indian Contract Act, IPC/BNS, CrPC/BNSS, CPC, Companies Act, and landmark Supreme Court rulings.' },
      { key: 'draftingPrecision', label: 'Drafting & Contract Structuring', description: 'Indemnity clauses, limitation of liability, non-compete validity, precision in pleadings, and notices.' },
      { key: 'oralAdvocacy', label: 'Moot Court Advocacy & Argumentation', description: 'Structured arguments under pressure, addressing judge queries, bench composure, and persuasive rhetoric.' },
      { key: 'professionalEthics', label: 'Legal Ethics & Commercial Judgment', description: 'Client confidentiality, conflict of interest, procedural deadlines, and risk mitigation.' }
    ],
    commonHiringCompaniesOrSectors: ['Tier-1 Law Firms (Shardul Amarchand, AZB, Khaitan, Trilegal)', 'Corporate Legal Cells (Reliance, Tata, Infosys Legal)', 'Chambers of Senior Advocates', 'Legal Process Outsourcing (LPO)'],
    typicalInterviewFormat: ['Case Briefing & Statutory Analysis Round', 'Contract Clause Review / Drafting Test', 'Hypothetical Legal Dilemma / Moot Defense', 'Partner & Managing Counsel Fit']
  },

  // 10. AGRICULTURE, HORTICULTURE & FORESTRY
  {
    id: 'agriculture_forestry',
    name: 'Agriculture, Horticulture & Rural Development',
    tagline: 'Crop Science, Sustainable Agronomy & Agri-Business Enterprise',
    categoryBadge: 'Agriculture & Bio-Economy',
    iconName: 'Sprout',
    accentColor: 'from-emerald-700 to-green-900',
    description: 'Encompasses crop production, soil fertility management, seed technology, plant pathology, agricultural banking, and agribusiness supply chains.',
    supportedDegrees: [
      {
        levelId: 'diploma_polytechnic',
        degreeName: 'Diploma in Agriculture',
        abbreviation: 'Diploma (Agri)',
        specialisations: ['Crop Husbandry', 'Organic Farming', 'Agri-Machinery']
      },
      {
        levelId: 'undergraduate',
        degreeName: 'Bachelor of Science in Agriculture (Hons)',
        abbreviation: 'B.Sc Agriculture (Hons)',
        specialisations: ['Agronomy', 'Soil Science & Agri Chemistry', 'Entomology & Pathology', 'Genetics & Plant Breeding', 'Agri-Business Management']
      },
      {
        levelId: 'postgraduate',
        degreeName: 'Master of Science in Agriculture',
        abbreviation: 'M.Sc Agriculture',
        specialisations: ['Precision Agriculture', 'Seed Science', 'Agricultural Economics', 'Horticulture']
      }
    ],
    popularTargetRoles: [
      'Agricultural Field Officer (AFO in Banks / IBPS)',
      'Agribusiness Territory Sales Manager',
      'Agronomist & Crop Advisor',
      'Seed Quality & QC Specialist',
      'Farm Manager & Greenhouse Supervisor',
      'Fertilizer & Plant Protection Executive'
    ],
    coreCompetencyPillars: [
      { key: 'agronomyScience', label: 'Crop Science & Soil Health', description: 'Kharif/Rabi cycle management, soil nutrient profiling (NPK), micro-nutrients, and crop protection.' },
      { key: 'pestDiseaseManagement', label: 'Pest Identification & Integrated Pest Management', description: 'Diagnosing fungal/viral crop diseases, IPM strategy, bio-pesticides, and safe chemical thresholds.' },
      { key: 'ruralCreditEconomics', label: 'Agri-Business & Rural Banking', description: 'Kisan Credit Card (KCC) scheme, crop insurance (PMFBY), post-harvest storage, and supply chain logistics.' },
      { key: 'farmerCommunication', label: 'Field Advisory & Farmer Communication', description: 'Translating lab agronomy to rural farmers with local linguistic clarity, patience, and commercial viability.' }
    ],
    commonHiringCompaniesOrSectors: ['Commercial Banks (SBI, NABARD, HDFC Agri)', 'Seed & Chemical Giants (Bayer CropScience, Syngenta, UPL)', 'ITC Agri-Business Division', 'Godrej Agrovet', 'Government State Agri Departments'],
    typicalInterviewFormat: ['Crop Production & Pathology Viva', 'Farmer Situation Problem-Solving Round', 'Agri-Banking / Credit Evaluation Test', 'Field Sales & Commercial Fit Interview']
  },

  // 11. HOSPITALITY, TOURISM & HOTEL MANAGEMENT
  {
    id: 'hospitality_tourism',
    name: 'Hospitality, Hotel Administration & Culinary Arts',
    tagline: 'Service Excellence, Guest Delight & Front-Office Poise',
    categoryBadge: 'Hospitality & Services',
    iconName: 'Utensils',
    accentColor: 'from-amber-600 to-yellow-800',
    description: 'Encompasses hotel operations, front office, food & beverage (F&B) management, culinary production, housekeeping, and luxury guest relations.',
    supportedDegrees: [
      {
        levelId: 'diploma_polytechnic',
        degreeName: 'Diploma in Hotel Management',
        abbreviation: 'DHM / DHMC',
        specialisations: ['Food & Beverage Service', 'Front Office Operations', 'Food Production (Bakery)']
      },
      {
        levelId: 'undergraduate',
        degreeName: 'Bachelor of Hotel Management & Catering Tech',
        abbreviation: 'BHM / B.Sc Hospitality',
        specialisations: ['Front Office & Concierge', 'Food & Beverage Service', 'Culinary Arts & Kitchen Ops', 'Accommodation Operations']
      },
      {
        levelId: 'postgraduate',
        degreeName: 'Master of Tourism & Travel Management',
        abbreviation: 'MTTM / MHM',
        specialisations: ['Hospitality Asset Management', 'Luxury Brand Management', 'MICE & Event Planning']
      }
    ],
    popularTargetRoles: [
      'Hotel Management Trainee (MT - Luxury Chains)',
      'Front Desk / Guest Relations Executive',
      'Food & Beverage (F&B) Supervisor',
      'Commis Chef / Culinary Trainee',
      'Banquet & Event Operations Coordinator',
      'Cabin Crew / Aviation Hospitality Executive'
    ],
    coreCompetencyPillars: [
      { key: 'guestDelight', label: 'Guest Service & Service Recovery', description: 'Handling high-profile guests, active listening, turning guest complaints into loyalty (Service Recovery Paradox).' },
      { key: 'hotelOperations', label: 'Operational Standards & Property Management', description: 'Opera PMS software, room inventory, night auditing, F&B table covers, and HACCP hygiene standards.' },
      { key: 'professionalGrooming', label: 'Poise, Grooming & Warm Presence', description: 'Flawless formal presentation, clear polite diction, body language, composure during peak banquet rushes.' },
      { key: 'teamCoordination', label: 'Cross-Departmental Synchronization', description: 'Coordination between Front Office, Housekeeping, Engineering, and Kitchen under tight turnarounds.' }
    ],
    commonHiringCompaniesOrSectors: ['The Taj Group (IHCL)', 'The Oberoi Group (OCLD)', 'ITC Hotels', 'Marriott International', 'Hyatt Hotels', 'Premium Airlines (Air India, Emirates, IndiGo)'],
    typicalInterviewFormat: ['Personal Grooming & Introduction Screening', 'Hotel Operations & F&B Technical Viva', 'Live Guest Complaint Roleplay Simulation', 'General Manager Personal Interview']
  },

  // 12. MANAGEMENT & BUSINESS ADMINISTRATION
  {
    id: 'management_business',
    name: 'Management, Business Administration & Marketing',
    tagline: 'Strategic Leadership, Market Execution & Organizational Growth',
    categoryBadge: 'Business & Management',
    iconName: 'Briefcase',
    accentColor: 'from-blue-700 to-indigo-900',
    description: 'Encompasses corporate management, sales & marketing, human resource management, operations, supply chain, and retail business.',
    supportedDegrees: [
      {
        levelId: 'undergraduate',
        degreeName: 'Bachelor of Business Administration',
        abbreviation: 'BBA / BMS',
        specialisations: ['Marketing Management', 'Human Resources (HR)', 'Financial Markets', 'Digital Marketing', 'Operations & Logistics']
      },
      {
        levelId: 'postgraduate',
        degreeName: 'Master of Business Administration',
        abbreviation: 'MBA / PGDM',
        specialisations: ['Strategic Marketing', 'Corporate Finance', 'Human Capital Management', 'Supply Chain & Operations', 'Business Analytics']
      }
    ],
    popularTargetRoles: [
      'Management Trainee (MT - Corporate FMCG/BFSI)',
      'Business Development Associate (B2B/B2C)',
      'HR Generalist / Recruiter',
      'Digital Marketing Specialist',
      'Supply Chain & Operations Analyst',
      'Product Marketing Associate'
    ],
    coreCompetencyPillars: [
      { key: 'strategicThinking', label: 'Business Acumen & Market Strategy', description: 'SWOT analysis, Porter’s Five Forces, 4Ps of marketing, customer acquisition cost (CAC), and profitability.' },
      { key: 'persuasiveCommunication', label: 'Negotiation & Pitch Presentation', description: 'Delivering structured business pitches, client handling, handling objections, and public speaking.' },
      { key: 'operationalPlanning', label: 'Operational Execution & Metrics', description: 'KPI setting, project scheduling, resource allocation, bottleneck identification, and budget monitoring.' },
      { key: 'leadershipTeamwork', label: 'Leadership, Culture & Conflict Resolution', description: 'Team motivation, cross-department collaboration, performance appraisals, and stakeholder alignment.' }
    ],
    commonHiringCompaniesOrSectors: ['FMCG Leaders (HUL, Nestlé, ITC, P&G)', 'Consulting Firms', 'Fintech & Digital Giants', 'Automobile & Retail Conglomerates (Reliance Retail, Tata Consumer)'],
    typicalInterviewFormat: ['Extempore / Group Discussion (GD) Elimination', 'Business Case Study Analysis (Guesstimates & Strategy)', 'Domain Specialization (Marketing/Finance/HR) Viva', 'Director / Vice President Fit Interview']
  },

  // 13. ITI & VOCATIONAL TRADES
  {
    id: 'iti_vocational',
    name: 'ITI, Technical Trades & Vocational Skills',
    tagline: 'Practical Craftsmanship, Workshop Safety & Industrial Operations',
    categoryBadge: 'Trades & Vocational Tech',
    iconName: 'Wrench',
    accentColor: 'from-zinc-700 to-slate-900',
    description: 'Encompasses technical industrial crafts including electrician, fitter, welder, motor mechanic, machinist, and computer operator.',
    supportedDegrees: [
      {
        levelId: 'iti_vocational',
        degreeName: 'Industrial Training Institute Certificate',
        abbreviation: 'ITI Certificate (NCVT/SCVT)',
        specialisations: ['Electrician Trade', 'Fitter Trade', 'Welder Trade', 'Machinist (Turner/CNC)', 'COPA (Computer Operator & Programming Assistant)', 'Mechanic Motor Vehicle (MMV)']
      }
    ],
    popularTargetRoles: [
      'Industrial Plant Technician',
      'Electrical Maintenance Specialist',
      'Assembly Line Fitter',
      'CNC Machine Operator',
      'Railway Apprentice / Locomotive Workshop Technician',
      'HVAC & Facility Maintenance Technician'
    ],
    coreCompetencyPillars: [
      { key: 'tradeTools', label: 'Trade Tools & Measurement Mastery', description: 'Proper usage of Vernier Calipers, Micrometers, Multimeters, Dial Gauges, and power machinery.' },
      { key: 'workshopSafety', label: 'Industrial Safety & Fire Protocols', description: 'PPE adherence, 5S methodology, Lock-Out Tag-Out (LOTO), electrical grounding, and emergency protocols.' },
      { key: 'troubleshooting', label: 'Fault Diagnosis & Mechanical/Electrical Repair', description: 'Identifying short circuits, motor winding issues, alignment discrepancies, and preventive maintenance.' },
      { key: 'disciplineReliability', label: 'Work Ethic, Shift Discipline & Instructions', description: 'Following engineering engineering drawings, reporting anomalies, attendance reliability, and teamwork.' }
    ],
    commonHiringCompaniesOrSectors: ['Indian Railways (RRB ALP & Technicians)', 'Public Sector Undertakings (BHEL, SAIL, NTPC, ONGC)', 'Automobile Manufacturers (Maruti Suzuki, Hero, Hyundai)', 'Manufacturing Plants & Electrical Contracting'],
    typicalInterviewFormat: ['Tool Identification & Measurement Demonstration', 'Trade Theory & Circuit / Blueprint Viva', 'Safety Compliance & Fire Hazard Q&A', 'Physical Stamina & Shift Fitness Verification']
  }
];

// ============================================================================
// 4. HELPER SELECTORS & UTILITIES
// ============================================================================

export function getEducationLevel(id: string | null | undefined): EducationLevel | undefined {
  if (!id) return undefined;
  return EDUCATION_LEVELS.find(lvl => lvl.id === id);
}

export function getAcademicStream(id: string | null | undefined): AcademicStream | undefined {
  if (!id) return undefined;
  return ACADEMIC_STREAMS.find(st => st.id === id);
}

export function getIntermediateGroup(id: string | null | undefined): IntermediateGroup | undefined {
  if (!id) return undefined;
  return INTERMEDIATE_GROUPS.find(grp => grp.id === id);
}

export function getDegreesByStreamAndLevel(streamId: AcademicStreamId, levelId: EducationLevelId) {
  const stream = getAcademicStream(streamId);
  if (!stream) return [];
  return stream.supportedDegrees.filter(d => d.levelId === levelId);
}

export function getAllDegreesForLevel(levelId: EducationLevelId) {
  const result: Array<{ streamId: AcademicStreamId; streamName: string; degreeName: string; abbreviation: string; specialisations: string[] }> = [];
  for (const stream of ACADEMIC_STREAMS) {
    const matched = stream.supportedDegrees.filter(d => d.levelId === levelId);
    for (const deg of matched) {
      result.push({
        streamId: stream.id,
        streamName: stream.name,
        degreeName: deg.degreeName,
        abbreviation: deg.abbreviation,
        specialisations: deg.specialisations
      });
    }
  }
  return result;
}

export function getTargetRolesForStream(streamId: AcademicStreamId): string[] {
  const stream = getAcademicStream(streamId);
  return stream ? stream.popularTargetRoles : [];
}

// ============================================================================
// 5. ADAPTIVE INTERVIEW PREPARATION MODES & HELPERS (Stage 3 Integration)
// ============================================================================

export interface PreparationMode {
  id: string;
  title: string;
  shortDesc: string;
  interviewType: 'technical' | 'hr' | 'behavioral' | 'mixed' | 'system_design';
  categoryPill: string;
  isEntranceExam?: boolean;
  entranceDisclaimer?: string;
}

export function getPreparationModesForProfile(
  educationLevel?: string | null,
  intermediateGroup?: string | null,
  streamId?: string | null,
  degreeCourse?: string | null
): PreparationMode[] {
  const lvl = educationLevel || '';

  // 1. INTERMEDIATE STUDENTS (10+2)
  if (lvl === 'intermediate') {
    const isMpcOrMbipc = intermediateGroup === 'mpc' || intermediateGroup === 'mbipc';
    const isVocational = intermediateGroup === 'vocational_inter';

    const modes: PreparationMode[] = [
      {
        id: 'college_admission_viva',
        title: 'College Admission Viva',
        shortDesc: 'Practice university viva voce, CUET personal interviews, and college admission counseling.',
        interviewType: 'mixed',
        categoryPill: 'Admission Viva'
      },
      {
        id: 'subject_conceptual_viva',
        title: 'Subject Knowledge & Conceptual Viva',
        shortDesc: 'Deep conceptual oral Q&A on 11th & 12th syllabus laws, formulas, mechanisms, and derivations.',
        interviewType: 'technical',
        categoryPill: 'Core Syllabus'
      },
      {
        id: 'communication_spoken_practice',
        title: 'Communication & Spoken English Practice',
        shortDesc: 'Overcoming hesitation, self-introduction, public speaking clarity, and fluent academic articulation.',
        interviewType: 'hr',
        categoryPill: 'Communication'
      },
      {
        id: 'career_exploration_chat',
        title: 'Career Exploration Conversation',
        shortDesc: 'Guided discussion clarifying degree choices, post-12th options, and future career roadmaps.',
        interviewType: 'behavioral',
        categoryPill: 'Career Guidance'
      },
      {
        id: 'entrance_concept_practice',
        title: 'Entrance Exam Concept Practice',
        shortDesc: 'Concept-clarity oral drills for competitive entrance exams (JEE, NEET, CUET, CLAT).',
        interviewType: 'technical',
        categoryPill: 'Competitive Concept',
        isEntranceExam: true,
        entranceDisclaimer: 'Oral conceptual practice to solidify theoretical understanding. Does not replace timed written mock test papers.'
      }
    ];

    if (isMpcOrMbipc || !intermediateGroup) {
      modes.push({
        id: 'nda_ssb_prep',
        title: 'NDA SSB Interview Preparation',
        shortDesc: 'Officer-Like Qualities (OLQ), personal interview, current affairs, and situation reaction tests.',
        interviewType: 'behavioral',
        categoryPill: 'Defense SSB'
      });
    }

    if (isVocational || intermediateGroup === 'cec' || intermediateGroup === 'mec') {
      modes.push({
        id: 'internship_entry_level_readiness',
        title: 'Internship & Entry-Level Readiness',
        shortDesc: 'Foundational practical skills demonstration, office etiquette, and apprentice job interview practice.',
        interviewType: 'mixed',
        categoryPill: 'Vocational & Jobs'
      });
    }

    return modes;
  }

  // 2. DIPLOMA & POLYTECHNIC STUDENTS
  if (lvl === 'diploma_polytechnic') {
    return [
      {
        id: 'diploma_practical_viva',
        title: 'Practical Subject Viva',
        shortDesc: 'Laboratory experiments, workshop machinery, engineering schematics, and hands-on testing viva.',
        interviewType: 'technical',
        categoryPill: 'Lab & Workshop'
      },
      {
        id: 'diploma_technical_fundamentals',
        title: 'Technical Fundamentals',
        shortDesc: 'Core engineering concepts (Applied Mechanics, Strength of Materials, Circuits, Machines).',
        interviewType: 'technical',
        categoryPill: 'Core Engineering'
      },
      {
        id: 'diploma_apprenticeship_prep',
        title: 'Apprenticeship Preparation',
        shortDesc: 'Technical and apprentice selection interviews for PSUs, Railways (RRB), and industrial plants.',
        interviewType: 'mixed',
        categoryPill: 'Apprenticeship'
      },
      {
        id: 'diploma_junior_engineer_sim',
        title: 'Junior Engineer (JE) Role Simulation',
        shortDesc: 'Site supervision, quality checks, machinery troubleshooting, and industrial safety compliance.',
        interviewType: 'technical',
        categoryPill: 'Junior Engineer'
      },
      {
        id: 'diploma_communication_hr',
        title: 'Communication & HR Practice',
        shortDesc: 'Explaining diploma final-year projects, shift flexibility, teamwork, and behavioral answers.',
        interviewType: 'hr',
        categoryPill: 'HR & Soft Skills'
      },
      {
        id: 'diploma_lateral_entry_prep',
        title: 'Higher Education (Lateral Entry) Admission',
        shortDesc: 'Interview and counseling preparation for direct second-year B.Tech / B.E degree admission.',
        interviewType: 'mixed',
        categoryPill: 'Lateral B.Tech'
      }
    ];
  }

  // 3. UNDERGRADUATE STUDENTS (UG)
  if (lvl === 'undergraduate') {
    return [
      {
        id: 'ug_campus_placement',
        title: 'Campus Placement Interview',
        shortDesc: 'Comprehensive technical and behavioral interview simulation modeled after visiting campus recruiters.',
        interviewType: 'mixed',
        categoryPill: 'Campus Drive'
      },
      {
        id: 'ug_subject_viva',
        title: 'Course-Specific Subject Viva',
        shortDesc: 'In-depth academic evaluation across core degree courses, theories, and syllabus problem-solving.',
        interviewType: 'technical',
        categoryPill: 'Degree Subjects'
      },
      {
        id: 'ug_internship_interview',
        title: 'Internship Interview',
        shortDesc: 'Project walkthroughs, problem solving, and skill verification for corporate and industrial internships.',
        interviewType: 'technical',
        categoryPill: 'Internship'
      },
      {
        id: 'ug_hr_communication',
        title: 'HR & Communication Practice',
        shortDesc: 'Behavioral STAR methodology, handling conflict, teamwork, cultural fit, and articulate delivery.',
        interviewType: 'hr',
        categoryPill: 'Behavioral & HR'
      },
      {
        id: 'ug_entry_job_sim',
        title: 'Entry-Level Job Simulation',
        shortDesc: 'Realistic role-specific challenges, bug fixing/accounting/clinical scenarios, and workplace decisions.',
        interviewType: 'mixed',
        categoryPill: 'Job Simulation'
      },
      {
        id: 'ug_higher_ed_prep',
        title: 'Higher Education Admission Preparation',
        shortDesc: 'Personal interview drills for Master’s admissions (MBA CAT/WAT-PI, GATE/M.Tech, MS abroad).',
        interviewType: 'mixed',
        categoryPill: 'Master’s Admission'
      }
    ];
  }

  // 4. POSTGRADUATE STUDENTS (PG)
  if (lvl === 'postgraduate') {
    const isMbaOrMgmt = streamId === 'management_business' || (degreeCourse && degreeCourse.toLowerCase().includes('mba'));
    return [
      {
        id: 'pg_advanced_viva',
        title: 'Advanced Subject Viva',
        shortDesc: 'Rigorous theoretical critique, advanced methodologies, and high-level domain problem solving.',
        interviewType: 'technical',
        categoryPill: 'Advanced Theory'
      },
      {
        id: 'pg_research_project_discussion',
        title: 'Research & Project Discussion',
        shortDesc: 'Master’s thesis defense, experimental methodology, literature gap analysis, and paper defense.',
        interviewType: 'technical',
        categoryPill: 'Thesis & R&D'
      },
      {
        id: 'pg_specialist_role_sim',
        title: 'Specialist Role Simulation',
        shortDesc: 'Domain specialist, quantitative analyst, research engineer, or management consultant scenarios.',
        interviewType: 'mixed',
        categoryPill: 'Specialist Role'
      },
      {
        id: 'pg_corporate_hr',
        title: 'Corporate HR & Leadership Interview',
        shortDesc: 'Cross-functional leadership, change management, business strategy, and stakeholder alignment.',
        interviewType: 'behavioral',
        categoryPill: 'Leadership HR'
      },
      ...(isMbaOrMgmt ? [
        {
          id: 'pg_management_leadership',
          title: 'Management & Case Analysis Interview',
          shortDesc: 'Business case studies, market entry strategy, P&L unit economics, and executive decision-making.',
          interviewType: 'mixed' as const,
          categoryPill: 'Case & Strategy'
        }
      ] : []),
      {
        id: 'pg_research_assistant_prep',
        title: 'Research Assistant / Fellow Interview',
        shortDesc: 'Interviews for university research labs, sponsored R&D fellowships, and PhD admissions.',
        interviewType: 'technical',
        categoryPill: 'Research Fellowship'
      }
    ];
  }

  // 5. PROFESSIONAL DEGREE STUDENTS (Tailored by Discipline)
  if (lvl === 'professional_degree') {
    const degLower = (degreeCourse || '').toLowerCase();
    const strmLower = (streamId || '').toLowerCase();

    // A. Chartered Accountancy / Finance Licensure
    if (degLower.includes('ca') || degLower.includes('cma') || degLower.includes('chartered') || strmLower.includes('commerce')) {
      return [
        {
          id: 'ca_articleship_prep',
          title: 'Accounting, Taxation, Audit & Articleship',
          shortDesc: 'Big 4 & top audit firm articleship interviews, GST/Income Tax laws, Ind AS, and statutory audit.',
          interviewType: 'technical',
          categoryPill: 'Audit & Articleship'
        },
        {
          id: 'ca_financial_reporting_viva',
          title: 'Financial Reporting & Corporate Compliance',
          shortDesc: 'Balance sheet reconciliation, cash flow analysis, IFRS standards, and internal financial controls.',
          interviewType: 'technical',
          categoryPill: 'Statutory Standards'
        },
        {
          id: 'ca_client_communication',
          title: 'Professional Ethics & Advisory Communication',
          shortDesc: 'Presenting audit findings to management, client confidentiality, and ethical dilemmas in taxation.',
          interviewType: 'hr',
          categoryPill: 'Ethics & Advisory'
        }
      ];
    }

    // B. Law & Legal Studies
    if (degLower.includes('ll.b') || degLower.includes('law') || strmLower.includes('law')) {
      return [
        {
          id: 'law_moot_court_viva',
          title: 'Moot Court & Legal Concepts Viva',
          shortDesc: 'Constitutional law, Indian Contract Act Section 10, BNS/IPC jurisprudence, and landmark precedents.',
          interviewType: 'technical',
          categoryPill: 'Jurisprudence Viva'
        },
        {
          id: 'law_firm_interview',
          title: 'Law Firm Associate Interview',
          shortDesc: 'Commercial contracts, corporate compliance, legal research, due diligence, and case briefing.',
          interviewType: 'mixed',
          categoryPill: 'Corporate Law'
        },
        {
          id: 'law_judicial_clerkship',
          title: 'Judicial Clerkship & Litigation Preparation',
          shortDesc: 'Courtroom procedure, oral advocacy, judicial drafting, legal ethics, and cross-examination theory.',
          interviewType: 'behavioral',
          categoryPill: 'Litigation & Court'
        }
      ];
    }

    // C. Healthcare & Medicine (MBBS / BDS)
    if (degLower.includes('mbbs') || degLower.includes('bds') || strmLower.includes('healthcare') || strmLower.includes('medicine')) {
      return [
        {
          id: 'med_clinical_knowledge_viva',
          title: 'Clinical Knowledge & Case Discussion',
          shortDesc: 'Differential diagnosis, ACS/STEMI protocols, pharmacology interactions, and clinical case workups.',
          interviewType: 'technical',
          categoryPill: 'Clinical Viva'
        },
        {
          id: 'med_residency_interview',
          title: 'Junior Doctor / Residency Interview',
          shortDesc: 'Emergency room triage, clinical prioritization, shift handovers, and hospital ward operations.',
          interviewType: 'mixed',
          categoryPill: 'Residency Interview'
        },
        {
          id: 'med_patient_communication',
          title: 'Patient Communication & Medical Ethics',
          shortDesc: 'Delivering difficult prognoses (SPIKES protocol), informed consent, empathy, and ethical dilemmas.',
          interviewType: 'behavioral',
          categoryPill: 'Ethics & Communication'
        }
      ];
    }

    // D. Pharmacy (B.Pharm / M.Pharm / Pharm.D)
    if (degLower.includes('pharm') || strmLower.includes('pharmacy')) {
      return [
        {
          id: 'pharm_concepts_viva',
          title: 'Pharmaceutical Concepts & ADME Viva',
          shortDesc: 'Pharmacokinetics, dosage formulation, pharmacology mechanisms, and bioavailability.',
          interviewType: 'technical',
          categoryPill: 'Pharmacology Viva'
        },
        {
          id: 'pharm_industry_interview',
          title: 'Industry & Hospital Pharmacy Interview',
          shortDesc: 'Pharmacovigilance (ICH guidelines), clinical trials, QA/QC, and hospital dispensary operations.',
          interviewType: 'mixed',
          categoryPill: 'Pharma Industry'
        }
      ];
    }

    // E. Nursing & Allied Health
    if (degLower.includes('nurs') || strmLower.includes('nursing')) {
      return [
        {
          id: 'nurs_fundamentals_viva',
          title: 'Nursing Fundamentals & Clinical Scenarios',
          shortDesc: 'Medication administration (6 Rights), vital sign interpretation, and ICU patient monitoring.',
          interviewType: 'technical',
          categoryPill: 'Clinical Nursing'
        },
        {
          id: 'nurs_hospital_ward_sim',
          title: 'Hospital Ward & Emergency Triage',
          shortDesc: 'Infection control, bio-medical waste segregation, doctor coordination, and emergency response.',
          interviewType: 'mixed',
          categoryPill: 'Hospital Simulation'
        }
      ];
    }

    // F. Architecture & Design
    if (degLower.includes('arch') || strmLower.includes('arch')) {
      return [
        {
          id: 'arch_portfolio_defense',
          title: 'Portfolio, Design & Project Defense',
          shortDesc: 'Spatial planning, sustainable materials, building bye-laws, and design studio critique defense.',
          interviewType: 'technical',
          categoryPill: 'Portfolio Defense'
        },
        {
          id: 'arch_firm_interview',
          title: 'Architectural Firm Associate Interview',
          shortDesc: 'BIM/CAD workflows, site supervision, client briefing, and construction cost estimation.',
          interviewType: 'mixed',
          categoryPill: 'Firm Interview'
        }
      ];
    }

    // Fallback general professional
    return [
      {
        id: 'prof_statutory_viva',
        title: 'Statutory Practice & Subject Viva',
        shortDesc: 'In-depth examination of licensure standards, regulations, and professional code of conduct.',
        interviewType: 'technical',
        categoryPill: 'Professional Viva'
      },
      {
        id: 'prof_client_advisory',
        title: 'Professional Role Simulation',
        shortDesc: 'Handling complex client cases, stakeholder advisory, and executive problem-solving scenarios.',
        interviewType: 'mixed',
        categoryPill: 'Professional Practice'
      }
    ];
  }

  // 6. ITI & VOCATIONAL STUDENTS
  if (lvl === 'iti_vocational') {
    return [
      {
        id: 'iti_trade_viva',
        title: 'Trade Knowledge Viva',
        shortDesc: 'Precision measuring tools (Vernier caliper, micrometer), trade machinery, symbols, and schematics.',
        interviewType: 'technical',
        categoryPill: 'Trade Tools Viva'
      },
      {
        id: 'iti_practical_scenario',
        title: 'Practical Scenario Discussion',
        shortDesc: 'Troubleshooting motor faults, mechanical alignment, welding joints, and electrical circuits.',
        interviewType: 'technical',
        categoryPill: 'Workshop Practical'
      },
      {
        id: 'iti_apprenticeship_interview',
        title: 'Apprenticeship Interview',
        shortDesc: 'Selection interviews for Indian Railways, BHEL, DRDO, State Electricity Boards, and PSUs.',
        interviewType: 'mixed',
        categoryPill: 'PSU Apprenticeship'
      },
      {
        id: 'iti_technician_job_sim',
        title: 'Technician Job Simulation',
        shortDesc: 'Manufacturing plant maintenance, assembly line coordination, and equipment preventive care.',
        interviewType: 'technical',
        categoryPill: 'Industrial Technician'
      },
      {
        id: 'iti_safety_communication',
        title: 'Workplace Safety & Communication',
        shortDesc: '5S methodology, PPE compliance, electrical grounding, fire safety, and shift handover reporting.',
        interviewType: 'hr',
        categoryPill: 'Safety & Reporting'
      },
      {
        id: 'iti_entry_employment',
        title: 'Entry-Level Employment Preparation',
        shortDesc: 'Private fabrication, electrical contracting, workshop operations, and trade interview practice.',
        interviewType: 'mixed',
        categoryPill: 'Trade Employment'
      }
    ];
  }

  // 7. DEFAULT / EXPERIENCED WORKFLOW
  return [
    {
      id: 'general_technical',
      title: 'Technical Competency Interview',
      shortDesc: 'Full stack, systems, problem solving, data structures, and engineering architectures.',
      interviewType: 'technical',
      categoryPill: 'Technical Core'
    },
    {
      id: 'general_behavioral',
      title: 'Behavioral & Leadership Round',
      shortDesc: 'STAR framework evaluation on ownership, project management, and collaboration.',
      interviewType: 'behavioral',
      categoryPill: 'Behavioral'
    },
    {
      id: 'general_system_design',
      title: 'System Design & Architecture',
      shortDesc: 'Scalability, microservices, database schemas, and end-to-end architecture design.',
      interviewType: 'system_design',
      categoryPill: 'Architecture'
    },
    {
      id: 'general_hr',
      title: 'HR & Cultural Alignment',
      shortDesc: 'Values alignment, career aspirations, salary expectations, and company culture.',
      interviewType: 'hr',
      categoryPill: 'HR Screening'
    }
  ];
}

export function getSuggestedSubjectsForProfile(
  educationLevel?: string | null,
  intermediateGroup?: string | null,
  streamId?: string | null,
  degreeCourse?: string | null
): string[] {
  const lvl = educationLevel || '';

  if (lvl === 'intermediate') {
    switch (intermediateGroup) {
      case 'mpc':
        return ['Physics (Mechanics & Waves)', 'Mathematics (Calculus & Vectors)', 'Chemistry (Organic & Physical)', 'Kinematics & Dynamics', 'Integration & Limits', 'Chemical Bonding'];
      case 'bipc':
        return ['Biology (Human Physiology)', 'Genetics & Evolution', 'Plant Physiology & Botany', 'Organic Reaction Mechanisms', 'Thermodynamics & Optics', 'Cell Biology'];
      case 'mec':
        return ['Accountancy & Golden Rules', 'Micro & Macro Economics', 'Commercial Mathematics & Statistics', 'Financial Statements & Ledgers', 'Demand & Elasticity'];
      case 'cec':
        return ['Commerce & Banking', 'Principles of Accountancy', 'Economics (National Income & Budget)', 'Civics (Indian Constitution & Articles)', 'Fundamental Rights'];
      case 'hec':
        return ['History (Indian Freedom Struggle)', 'Civics & Political Systems', 'Development Economics', 'Constitutional Governance', 'Sociology & Public Policy'];
      case 'mbipc':
        return ['Mathematics (Calculus)', 'Biology (Physiology & Genetics)', 'Physics (Mechanics)', 'Chemistry (Organic)'];
      case 'vocational_inter':
        return ['Laboratory Diagnostics & Safety', 'Computer Applications (COPA)', 'Office Bookkeeping & Tax Basics', 'Electrical Circuits & Appliances', 'Agriculture Practices'];
      default:
        return ['Physics', 'Mathematics', 'Chemistry', 'Biology', 'Economics', 'English Communication'];
    }
  }

  if (streamId) {
    const stream = getAcademicStream(streamId);
    if (stream) {
      return stream.coreCompetencyPillars.map(p => p.label);
    }
  }

  return ['Core Subject Theory', 'Problem Solving Logic', 'Practical Application', 'Communication & Articulation'];
}
