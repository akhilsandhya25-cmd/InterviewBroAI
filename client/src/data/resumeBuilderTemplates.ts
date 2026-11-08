/**
 * InterviewBro AI — Stage 6: Universal Resume Builder Data & Templates
 * client/src/data/resumeBuilderTemplates.ts
 * 
 * Provides stream-specific resume configurations, guided section metadata,
 * honest student placeholders, and profile-aware draft generation.
 */

import { ResumeType, ResumeBuilderData, UserProfile } from '../types';

export interface ResumeTypeConfig {
  id: ResumeType;
  title: string;
  badge: string;
  subtitle: string;
  description: string;
  targetAudience: string;
  guidanceTip: string;
  hasWorkExperienceByDefault: boolean;
  defaultSections: string[];
  suggestedSubjects: string[];
  suggestedSkills: string[];
  defaultObjective: string;
  exampleProject: {
    title: string;
    toolsOrTech: string;
    description: string;
    outcomeMetric: string;
  };
}

export const RESUME_TYPE_CONFIGS: Record<ResumeType, ResumeTypeConfig> = {
  student_intermediate: {
    id: 'student_intermediate',
    title: 'Simple Student Resume',
    badge: '10+2 / Junior College',
    subtitle: 'MPC, BiPC, MEC, CEC, HEC & Vocational Students',
    description: 'Designed for junior college and high school students with zero work experience. Highlights 10th and 12th academic coursework, science fair models, school competitions, and extracurricular leadership.',
    targetAudience: 'Intermediate (11th & 12th Grade) Students applying for College Admissions or Entry Internships',
    guidanceTip: 'Intermediate student profiles should NEVER invent corporate work experience. Focus proudly on your academic board foundation, school science models, and extracurricular teamwork.',
    hasWorkExperienceByDefault: false,
    defaultSections: ['contact', 'objective', 'education', 'subjects', 'projects', 'skills', 'achievements', 'extracurricular'],
    suggestedSubjects: [
      'Mathematics',
      'Physics',
      'Chemistry',
      'Biology / Botany / Zoology',
      'Economics',
      'Commerce & Accountancy',
      'Civics & Governance',
      'Computer Literacy'
    ],
    suggestedSkills: [
      'Problem Solving',
      'Scientific Documentation',
      'Analytical Thinking',
      'MS Office (Word, Excel, PowerPoint)',
      'Spoken English & Communication',
      'Teamwork & Collaboration'
    ],
    defaultObjective: 'Dedicated Intermediate student with a strong foundation in core academic subjects, seeking admission to an undergraduate degree program. Eager to contribute disciplined analytical problem-solving and active participation in university student activities.',
    exampleProject: {
      title: 'Science Fair Working Model / Academic Exhibition Project',
      toolsOrTech: 'Physical apparatus, laboratory charts, presentation slides',
      description: 'Researched and demonstrated a practical scientific or commerce concept for an annual junior college exhibition, presenting the working principles to external faculty judges.',
      outcomeMetric: ''
    }
  },

  diploma_polytechnic: {
    id: 'diploma_polytechnic',
    title: 'Applied Engineering & Polytechnic CV',
    badge: 'Polytechnic Diploma',
    subtitle: 'Mechanical, Civil, Electrical, Electronics & Computer Diploma',
    description: 'Tailored for polytechnic diploma candidates. Emphasizes hands-on workshop machinery, laboratory experiment execution, blueprint reading, and final year capstone project fabrication.',
    targetAudience: 'Polytechnic Engineering Students targeting NATS/NEAPS Apprenticeships or B.Tech Lateral Entry',
    guidanceTip: 'Highlight the physical machinery you personally operated and your direct troubleshooting contribution to your final capstone project.',
    hasWorkExperienceByDefault: false,
    defaultSections: ['contact', 'objective', 'education', 'subjects', 'projects', 'skills', 'experience', 'certifications'],
    suggestedSubjects: [
      'Applied Mechanics',
      'Workshop Technology',
      'Engineering Drawing & Blueprints',
      'Electrical Machines & Circuits',
      'Thermal & Fluid Engineering',
      'Strength of Materials',
      'AutoCAD & CAD/CAM'
    ],
    suggestedSkills: [
      'Workshop Safety (5S)',
      'Blueprint & Schematic Literacy',
      'Machinery Operation (Lathe, Milling, Drill)',
      'Precision Measurement (Vernier, Micrometer)',
      'Circuit Soldering & Wiring',
      'Equipment Preventive Maintenance',
      'AutoCAD'
    ],
    defaultObjective: 'Disciplined Diploma in Engineering graduate with extensive hands-on workshop, laboratory testing, and machine operation experience, seeking a technician apprenticeship or entry-level industrial engineering role.',
    exampleProject: {
      title: 'Diploma Final Year Capstone Project',
      toolsOrTech: 'CAD schematic, workshop fabrication machinery, electronic controller',
      description: 'Designed and fabricated an applied engineering mechanism addressing an industrial workflow challenge, executing component assembly and safety testing.',
      outcomeMetric: ''
    }
  },

  undergraduate: {
    id: 'undergraduate',
    title: 'Undergraduate Degree Resume',
    badge: 'Bachelor Degrees',
    subtitle: 'B.Tech, B.Com, B.Sc, B.A, BBA & Campus Placement Candidates',
    description: 'Standard professional resume for degree students and freshers. Balances academic achievements, coursework, capstone projects, internships, and technical/domain skills for campus placements.',
    targetAudience: 'College Final-Year Students and Fresh Graduates Across All Streams',
    guidanceTip: 'Quantify your project outcomes with concrete numbers (e.g. latency reduced, transaction sample size, users served, audit variance analyzed).',
    hasWorkExperienceByDefault: true,
    defaultSections: ['contact', 'objective', 'education', 'projects', 'skills', 'experience', 'certifications', 'achievements'],
    suggestedSubjects: [
      'Data Structures & Algorithms',
      'Database Management Systems',
      'Financial Accounting & Auditing',
      'Corporate Law & Governance',
      'Research Methodology',
      'Macroeconomics',
      'Operating Systems'
    ],
    suggestedSkills: [
      'JavaScript / TypeScript',
      'Python',
      'SQL / PostgreSQL',
      'Financial Modeling (Excel)',
      'Git Version Control',
      'Data Analysis',
      'Problem Solving'
    ],
    defaultObjective: 'Detail-oriented final-year undergraduate candidate with strong analytical fundamentals and hands-on project implementations, seeking an entry-level analyst or associate role to deliver measurable business impact.',
    exampleProject: {
      title: 'Undergraduate Capstone Application / Research Project',
      toolsOrTech: 'Modern domain tech stack / analytical spreadsheet model',
      description: 'Designed and developed an end-to-end solution addressing workflow bottlenecks, resolving critical edge cases and data validation constraints.',
      outcomeMetric: ''
    }
  },

  postgraduate: {
    id: 'postgraduate',
    title: 'Postgraduate & Academic CV',
    badge: 'Masters & MBA',
    subtitle: 'M.Tech, MBA, M.Sc, M.Com, M.A & Specialist Roles',
    description: 'Advanced curriculum vitae structure designed for masters and management trainees. Showcases dissertation research, thesis defense, case framework methodology (MECE), and leadership initiatives.',
    targetAudience: 'Postgraduate Candidates Targeting Specialist, Consulting, or Research Roles',
    guidanceTip: 'Lead project and research results with executive headlines, emphasizing business ROI, empirical validity, and stakeholder alignment.',
    hasWorkExperienceByDefault: true,
    defaultSections: ['contact', 'objective', 'education', 'projects', 'skills', 'experience', 'achievements', 'certifications'],
    suggestedSubjects: [
      'Strategic Management',
      'Quantitative & Empirical Research',
      'Econometric Modeling',
      'Advanced Distributed Systems',
      'Corporate Finance & Valuation',
      'Operations & Supply Chain Optimization'
    ],
    suggestedSkills: [
      'MECE Case Structuring',
      'Empirical Statistical Analysis',
      'Stakeholder Management',
      'Financial & Sensitivity Modeling',
      'Executive Top-Down Presentation',
      'Process Optimization'
    ],
    defaultObjective: 'Strategic and results-driven Postgraduate candidate with expertise in empirical research modeling and structured business problem breakdown, seeking a management trainee or specialist associate position.',
    exampleProject: {
      title: 'Master Dissertation / Corporate Strategy Consulting Project',
      toolsOrTech: 'Statistical regression modeling / MECE strategic framework',
      description: 'Formulated and tested data-driven hypotheses across a multi-variable dataset, identifying key operational bottlenecks and delivering prioritized recommendations.',
      outcomeMetric: ''
    }
  },

  professional: {
    id: 'professional',
    title: 'Professional Degree CV',
    badge: 'Clinical, Law & CA',
    subtitle: 'CA/CMA/CS, MBBS, BDS, Nursing, Pharmacy & Law',
    description: 'Specialized professional structure for clinical medical rotations (SOAP), statutory legal drafting and moot court advocacy (IRAC), or Big 4 CA articleship compliance.',
    targetAudience: 'Students and Trainees in Healthcare, Law, and Chartered Accountancy',
    guidanceTip: 'Detail your practical training postings (e.g. CA articleship client types, hospital ward clinical rotations, court chamber case notes) accurately.',
    hasWorkExperienceByDefault: true,
    defaultSections: ['contact', 'objective', 'education', 'experience', 'projects', 'skills', 'certifications', 'achievements'],
    suggestedSubjects: [
      'Clinical Medicine & Ward Procedures',
      'Pharmacology & Patient Safety',
      'Constitutional & Procedural Law',
      'Statutory Auditing (SA Standards)',
      'Direct & Indirect Taxation (GST)',
      'Legal Drafting & Pleading'
    ],
    suggestedSkills: [
      'SOAP Clinical Case Presentation',
      'Patient Triage & Vital Signs Monitoring',
      'IRAC Legal Argumentation',
      'Statutory Audit Vouching & Verification',
      'GST Reconciliation & Filing',
      'Legal Research (SCC Online, Manupatra)'
    ],
    defaultObjective: 'Committed professional qualification candidate with verified practical training experience, rigorous ethical standards, and meticulous adherence to regulatory and clinical protocols.',
    exampleProject: {
      title: 'Practical Articleship / Clinical Rotation / Moot Court Memorial',
      toolsOrTech: 'Professional compliance standards (SA / Ind AS / SOAP / IRAC)',
      description: 'Conducted rigorous compliance verification and case analysis under senior supervisors, preparing detailed audit workpapers or clinical documentation.',
      outcomeMetric: ''
    }
  },

  iti_trade: {
    id: 'iti_trade',
    title: 'Trade & Technical Apprenticeship Resume',
    badge: 'ITI & Trade Apprentice',
    subtitle: 'Electrician, Fitter, Machinist, Welder & Motor Mechanic',
    description: 'Practical, concise resume format highlighting National Trade Certificate (NTC) training, workshop practical skills, machine tools operated, and strict workplace PPE safety compliance.',
    targetAudience: 'ITI Students Targeting Railway, PSU, and Industrial Technician Apprenticeships',
    guidanceTip: 'Detail your genuine workshop trade execution and machine tools operated within verified dimensional tolerances.',
    hasWorkExperienceByDefault: false,
    defaultSections: ['contact', 'objective', 'education', 'skills', 'projects', 'certifications', 'experience'],
    suggestedSubjects: [
      'Trade Theory (Electrician / Fitter)',
      'Workshop Calculation & Science',
      'Engineering Drawing for Trades',
      'Employability Skills',
      'Workshop Practical & Trade Theory',
      'Industrial Safety & PPE'
    ],
    suggestedSkills: [
      'Workshop Safety (5S)',
      'Precision Measurement (Vernier Caliper, Micrometer)',
      'Lathe & Drilling Machine Operation',
      'Electrical Conduit & Panel Wiring',
      'Component Fitting & Filing',
      'PPE Compliance & First Aid'
    ],
    defaultObjective: 'Disciplined and safety-conscious ITI technician with hands-on workshop practical training and precision tool operation, seeking an industrial or public sector apprenticeship.',
    exampleProject: {
      title: 'Workshop Trade Practical Workpiece / Wiring Demonstration',
      toolsOrTech: 'Lathe machine, surface plate, height gauge, multimeter, hand tools',
      description: 'Fabricated a precision metal fitting job piece / executed distribution panel conduit wiring according to engineering technical drawing specifications.',
      outcomeMetric: ''
    }
  },

  corporate_experienced: {
    id: 'corporate_experienced',
    title: 'Modern Corporate & Tech Resume',
    badge: 'Corporate & Experienced',
    subtitle: 'Software Engineers, Tech Leads, Analysts & Product Managers',
    description: 'High-impact technical resume highlighting professional experience, quantifiable business metrics, system architecture decisions, and core competencies.',
    targetAudience: 'Experienced Software Engineers, Technical Leads, and Corporate Professionals',
    guidanceTip: 'Structure bullet points using the Action + Context + Quantifiable Metric format (e.g. "Reduced API latency by 32% by implementing Redis caching").',
    hasWorkExperienceByDefault: true,
    defaultSections: ['contact', 'objective', 'experience', 'projects', 'skills', 'education', 'certifications'],
    suggestedSubjects: [
      'Distributed Systems Architecture',
      'Database Optimization & Indexing',
      'Cloud Infrastructure (AWS/GCP)',
      'Microservices Design Patterns',
      'CI/CD & DevOps Automation',
      'Agile Software Engineering'
    ],
    suggestedSkills: [
      'TypeScript / JavaScript',
      'React / Next.js',
      'Node.js / Express',
      'PostgreSQL / Redis',
      'System Design',
      'Docker & Kubernetes',
      'AWS Cloud Services'
    ],
    defaultObjective: 'Results-driven software engineer with proven experience in architecting scalable distributed web services, optimizing database performance, and driving robust code delivery in high-growth environments.',
    exampleProject: {
      title: 'High-Scale Distributed Service / System Architecture Overhaul',
      toolsOrTech: 'TypeScript, Node.js, PostgreSQL, Redis, Docker, AWS',
      description: 'Architected and deployed a resilient microservices backend with horizontal read replicas, distributed in-memory caching, and comprehensive unit/integration test coverage.',
      outcomeMetric: ''
    }
  }
};

/**
 * Maps candidate profile attributes to the recommended ResumeType
 */
export function getRecommendedResumeType(userProfile?: UserProfile | null): ResumeType {
  if (!userProfile) return 'undergraduate';

  const eduLevel = (userProfile.educationLevel || '').toLowerCase();
  const stream = (userProfile.academicStream || '').toLowerCase();
  const role = (userProfile.role_target || '').toLowerCase();

  // 1. Intermediate / 10+2
  if (eduLevel === 'intermediate' || userProfile.intermediateGroup) {
    return 'student_intermediate';
  }

  // 2. Diploma & Polytechnic
  if (eduLevel === 'diploma_polytechnic') {
    return 'diploma_polytechnic';
  }

  // 3. ITI & Vocational
  if (eduLevel === 'iti_vocational' || stream === 'vocational_trades' || /\biti\b/i.test(stream) || stream.includes('trade')) {
    return 'iti_trade';
  }

  // 4. Professional Degrees (Clinical, Law, CA)
  if (
    eduLevel === 'professional_degree' ||
    stream.includes('healthcare') ||
    stream.includes('nursing') ||
    stream.includes('pharmacy') ||
    stream.includes('law')
  ) {
    return 'professional';
  }

  // 5. Postgraduate & Masters
  if (eduLevel === 'postgraduate') {
    return 'postgraduate';
  }

  // 6. Senior Corporate / Tech
  if (role.includes('architect') || role.includes('lead') || role.includes('senior') || (userProfile.experience_level && String(userProfile.experience_level).includes('experienced'))) {
    return 'corporate_experienced';
  }

  // 7. Default Undergraduate
  return 'undergraduate';
}

/**
 * Generates an honest, profile-aware starter draft for the Resume Builder
 * ensuring zero fabricated claims or fake experience.
 */
export function getDefaultResumeDraft(userProfile?: UserProfile | null): ResumeBuilderData {
  const resumeType = getRecommendedResumeType(userProfile);
  const config = RESUME_TYPE_CONFIGS[resumeType];
  const uid = userProfile?.id || 'usr-candidate';

  const fullName = userProfile?.full_name || 'Candidate Name';
  const email = userProfile?.email || 'student.name@example.com';
  const phone = '+91 98765 43210';
  const location = 'Hyderabad, India';

  // Build honest starter education entries
  const education: ResumeBuilderData['education'] = [];
  const eduLevel = userProfile?.educationLevel || '';
  const interGroup = (userProfile?.intermediateGroup || 'MPC').toUpperCase();
  const collegeName = userProfile?.college || 'Junior / Degree College';
  const currentYear = userProfile?.yearOfStudy ? `Year ${userProfile.yearOfStudy}` : '2024';

  if (resumeType === 'student_intermediate') {
    education.push({
      id: 'edu-1',
      institution: collegeName,
      degreeOrGroup: `Intermediate (+2) - ${interGroup} Group`,
      boardOrUniversity: 'State Board of Intermediate Education',
      yearOfCompletion: currentYear,
      scoreOrGrade: ''
    });
    education.push({
      id: 'edu-2',
      institution: 'High School',
      degreeOrGroup: 'Secondary School Certificate (Class 10)',
      boardOrUniversity: 'State Board / CBSE',
      yearOfCompletion: '2022',
      scoreOrGrade: ''
    });
  } else if (resumeType === 'diploma_polytechnic') {
    education.push({
      id: 'edu-1',
      institution: collegeName,
      degreeOrGroup: 'Diploma in Mechanical / Electrical Engineering',
      boardOrUniversity: 'State Board of Technical Education',
      yearOfCompletion: currentYear,
      scoreOrGrade: ''
    });
    education.push({
      id: 'edu-2',
      institution: 'High School',
      degreeOrGroup: 'Class 10 (SSC)',
      boardOrUniversity: 'State Board / CBSE',
      yearOfCompletion: '2021',
      scoreOrGrade: ''
    });
  } else if (resumeType === 'iti_trade') {
    education.push({
      id: 'edu-1',
      institution: collegeName,
      degreeOrGroup: 'National Trade Certificate (NTC) - Electrician / Fitter',
      boardOrUniversity: 'National Council for Vocational Training (NCVT)',
      yearOfCompletion: currentYear,
      scoreOrGrade: ''
    });
    education.push({
      id: 'edu-2',
      institution: 'High School',
      degreeOrGroup: 'Class 10 (SSC)',
      boardOrUniversity: 'State Board',
      yearOfCompletion: '2022',
      scoreOrGrade: ''
    });
  } else {
    education.push({
      id: 'edu-1',
      institution: collegeName,
      degreeOrGroup: userProfile?.degreeCourse ? `${userProfile.degreeCourse} ${userProfile.specialisation ? `in ${userProfile.specialisation}` : ''}` : 'Bachelor of Technology in Computer Science',
      boardOrUniversity: 'University Affiliated',
      yearOfCompletion: currentYear,
      scoreOrGrade: ''
    });
    education.push({
      id: 'edu-2',
      institution: 'Junior College',
      degreeOrGroup: `Intermediate - ${interGroup}`,
      boardOrUniversity: 'State Board',
      yearOfCompletion: '2021',
      scoreOrGrade: ''
    });
  }

  // Hidden sections by default for fresh students (ensuring honesty!)
  const hiddenSections: string[] = [];
  if (!config.hasWorkExperienceByDefault) {
    hiddenSections.push('experience');
  }

  return {
    id: `draft-${Date.now()}`,
    userId: uid,
    resumeType,
    templateStyle: 'classic',
    fullName,
    email,
    phone,
    location,
    linkedinOrPortfolio: '',
    githubUrl: '',
    summaryOrObjective: config.defaultObjective,
    education,
    subjects: [...config.suggestedSubjects.slice(0, 5)],
    skills: [...config.suggestedSkills.slice(0, 6)],
    projects: [
      {
        id: 'proj-1',
        title: config.exampleProject.title,
        toolsOrTech: config.exampleProject.toolsOrTech,
        description: config.exampleProject.description,
        outcomeMetric: ''
      }
    ],
    experience: [],
    certifications: [],
    achievements: [],
    extracurricular: [],
    hiddenSections,
    updatedAt: new Date().toISOString()
  };
}
