/**
 * InterviewBro AI — Adaptive Student & Placement Profile System
 * client/src/pages/ProfilePage.tsx
 * 
 * Production-grade adaptive profile system calibrated for:
 * 1. Undergraduate students
 * 2. Postgraduate students
 * 3. Diploma / Polytechnic students
 * 4. Professional qualification students (CA, CS, CMA, CFA, LLB, B.Arch)
 * 5. Freshers & Experienced job seekers / working professionals
 * 
 * Supports dynamic stream taxonomies, skill proficiencies, career aspirations,
 * conditional project/experience portfolios, and non-destructive legacy intermediate preservation.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  X,
  Save,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Video,
  GraduationCap,
  BookOpen,
  Briefcase,
  Layers,
  Award,
  Check,
  MapPin,
  Phone,
  Mail,
  Building2,
  Calendar,
  FolderGit2,
  Trash2,
  ExternalLink,
  ChevronDown,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ExperienceLevel, UserProfile } from '../types';
import {
  EDUCATION_LEVELS,
  ACADEMIC_STREAMS,
  EducationLevelId,
  AcademicStreamId,
  getEducationLevel,
  getAcademicStream,
  getDegreesByStreamAndLevel,
  getTargetRolesForStream
} from '../data/studentStreams';

interface ProfilePageProps {
  onNavigate?: (route: string) => void;
  isOnboarding?: boolean;
}

// Skill proficiency levels
type SkillProficiency = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

// Supported Qualification cards in current release
interface QualificationCardOption {
  id: string;
  title: string;
  badge: string;
  description: string;
  exampleDegrees: string;
  icon: React.ComponentType<{ className?: string }>;
}

const QUALIFICATION_OPTIONS: QualificationCardOption[] = [
  {
    id: 'diploma_polytechnic',
    title: 'Diploma / Polytechnic',
    badge: 'Applied Technical',
    description: 'Post-10th or lateral engineering diploma preparing for direct junior engineering or 2nd-year B.Tech lateral entry.',
    exampleDegrees: 'Polytechnic Diploma, Diploma in Engg, D.Pharm',
    icon: Layers
  },
  {
    id: 'undergraduate',
    title: 'Undergraduate Degree',
    badge: 'Bachelor’s Degrees',
    description: 'Foundational university degree preparing for campus placements, corporate recruitment, and software engineering roles.',
    exampleDegrees: 'B.Tech, B.E., BCA, B.Sc, B.Com, BBA, B.A.',
    icon: GraduationCap
  },
  {
    id: 'postgraduate',
    title: 'Postgraduate Degree',
    badge: 'Master’s Degrees',
    description: 'Advanced degree emphasizing software systems, AI, research, data science, strategic management, or domain mastery.',
    exampleDegrees: 'M.Tech, MCA, M.Sc, MBA, M.Com, M.A.',
    icon: Award
  },
  {
    id: 'professional_degree',
    title: 'Professional Qualification',
    badge: 'Chartered & Licensures',
    description: 'Statutory qualifications and chartered bodies requiring formal stages, articleship, or legal/architectural licensures.',
    exampleDegrees: 'CA, CS, CMA, CFA, ACCA, LLB / Advocate, B.Arch',
    icon: Briefcase
  },
  {
    id: 'general',
    title: 'Job Seeker / Working Professional',
    badge: 'Industry & Corporate',
    description: 'Fresh graduates, experienced tech professionals, and lateral career switchers targeting corporate roles.',
    exampleDegrees: 'Entry-Level Fresher to Senior Specialist (1-10+ yrs)',
    icon: Sparkles
  }
];

// Career Fields for Section E
const CAREER_FIELDS = [
  { id: 'software_engineering', label: 'Software Engineering & Full Stack' },
  { id: 'ai_data_science', label: 'AI, Machine Learning & Data Science' },
  { id: 'cloud_devops', label: 'Cloud Architecture, DevOps & Cybersecurity' },
  { id: 'accounting_taxation', label: 'Accounting, Auditing & Taxation (GST / Income Tax)' },
  { id: 'banking_finance', label: 'Banking, Investment, Equity Research & Fintech' },
  { id: 'business_management', label: 'Business Management, Strategy & Operations Trainee' },
  { id: 'product_management', label: 'Product Management & Agile Delivery' },
  { id: 'marketing_growth', label: 'Digital Marketing, Brand Strategy & Growth' },
  { id: 'human_resources', label: 'Human Resources & Talent Acquisition' },
  { id: 'healthcare_pharma', label: 'Healthcare, Clinical Practice & Pharmaceuticals' },
  { id: 'legal_compliance', label: 'Legal Practice, Corporate Governance & Compliance' },
  { id: 'core_engineering', label: 'Mechanical, Civil, Electrical & VLSI Engineering' },
  { id: 'government_psu', label: 'Public Sector (PSU), Railways & Government Examinations' },
  { id: 'entrepreneurship', label: 'Startup Founder & Venture Building' },
  { id: 'other', label: 'Other Domain / Interdisciplinary' }
];

// Higher Education / Degree preparation goals
const PREPARATION_GOAL_OPTIONS = [
  { id: 'campus_placement', label: 'Campus Placement & Corporate Job Offer', desc: 'Cracking on-campus recruitment tests, coding rounds, and panel interviews' },
  { id: 'off_campus', label: 'Off-Campus Entry-Level Job Hunting', desc: 'Landing competitive fresher roles at tech product firms and MNCs' },
  { id: 'internship', label: 'Internship & Industrial Training Selection', desc: 'Landing pre-final year industry internships and corporate stipends' },
  { id: 'lateral_entry', label: 'Lateral Entry / Transition (e.g. Diploma to B.Tech)', desc: 'Transitioning from diploma to university engineering or switching tech stacks' },
  { id: 'higher_education', label: 'Higher Education Admissions (M.Tech, MS, MBA, GATE, CAT)', desc: 'Cracking entrance screening, university viva, and academic interviews' },
  { id: 'experienced_switch', label: 'Lateral Career Switch / Promotion to Senior Role', desc: 'Senior system design, architecture trade-offs, and behavioral leadership' },
  { id: 'communication', label: 'Soft Skills, HR Behavioral Answers & Self-Introduction', desc: 'Polishing stage presence, clarity of speech, and articulation' },
  { id: 'subject_mastery', label: 'Core Technical Depth & Domain Problem Solving', desc: 'Deep-dive domain interview drills' }
];

const DEFAULT_TECH_PILLS = [
  'React',
  'TypeScript',
  'Node.js',
  'Python',
  'SQL',
  'Git',
  'Data Structures & Algorithms',
  'Java',
  'System Design',
  'AWS'
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, isOnboarding }) => {
  const { user, updateProfile } = useAuth();

  // Legacy Intermediate Detection (Preserved safely without auto-conversion)
  const isExistingIntermediate = Boolean(
    user?.educationLevel === 'intermediate' ||
    (user as any)?.education_level === 'intermediate' ||
    Boolean((user as any)?.intermediateGroup) ||
    Boolean((user as any)?.intermediate_group)
  );

  const [hasDismissedLegacyNotice, setHasDismissedLegacyNotice] = useState<boolean>(false);

  // Profile completeness check
  const isProfileComplete = Boolean(
    user?.profile_completed ||
    (user?.role_target && user.role_target.trim().length > 0 && user?.skills && user.skills.length > 0) ||
    (user?.educationLevel && (user?.academicStream || user?.educationLevel === 'general'))
  );
  const isOnboardingMode = isOnboarding ?? !isProfileComplete;

  // --------------------------------------------------------------------------
  // A. Basic Information
  // --------------------------------------------------------------------------
  const [fullName, setFullName] = useState<string>(user?.full_name || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [location, setLocation] = useState<string>(user?.location || '');

  // --------------------------------------------------------------------------
  // B. Qualification & Education State
  // --------------------------------------------------------------------------
  const [educationLevel, setEducationLevel] = useState<string>(() => {
    const raw = (user?.educationLevel || (user as any)?.education_level || '') as string;
    // If user has a legacy intermediate record, preserve it in state rather than silently converting!
    if (raw === 'intermediate') return 'intermediate';
    return raw || 'undergraduate';
  });

  // Academic Stream
  const [academicStream, setAcademicStream] = useState<string>(() => {
    return (user?.academicStream || (user as any)?.academic_stream || 'engineering_technology') as string;
  });

  // Degree Course
  const [degreeCourse, setDegreeCourse] = useState<string>(() => {
    return (user?.degreeCourse || (user as any)?.degree_course || '') as string;
  });
  const [customDegreeCourse, setCustomDegreeCourse] = useState<string>('');
  const [isCustomDegree, setIsCustomDegree] = useState<boolean>(false);

  // Specialisation
  const [specialisation, setSpecialisation] = useState<string>(() => {
    return user?.specialisation || '';
  });
  const [customSpecialisation, setCustomSpecialisation] = useState<string>('');
  const [isCustomSpecialisation, setIsCustomSpecialisation] = useState<boolean>(false);

  // College / Institution / Training Firm
  const [college, setCollege] = useState<string>(user?.college || '');

  // Year of study / Current Stage
  const [yearOfStudy, setYearOfStudy] = useState<string>(() => {
    return (user?.yearOfStudy || (user as any)?.year_of_study || '') as string;
  });

  // Graduation / Completion Year
  const [graduationYear, setGraduationYear] = useState<string>(user?.graduation_year || '');

  // Academic / Licensure Status
  const [academicStatus, setAcademicStatus] = useState<string>(user?.academicStatus || 'Pursuing Full-Time');
  const [professionalStage, setProfessionalStage] = useState<string>(user?.professionalStage || 'Intermediate / Executive');
  const [previousQualification, setPreviousQualification] = useState<string>(user?.previousQualification || '');

  // Experienced / Job Seeker specific fields
  const [employmentStatus, setEmploymentStatus] = useState<string>(user?.employmentStatus || 'Actively Interviewing / Immediate Joiner');
  const [totalExperienceYears, setTotalExperienceYears] = useState<string>(user?.totalExperienceYears || '1-3 years');
  const [previousJobRole, setPreviousJobRole] = useState<string>(user?.previousJobRole || '');
  const [currentIndustry, setCurrentIndustry] = useState<string>(user?.currentIndustry || 'IT Services & Software');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(user?.experience_level || 'fresher');

  // --------------------------------------------------------------------------
  // C. Skills & Proficiencies
  // --------------------------------------------------------------------------
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [skillProficiencies, setSkillProficiencies] = useState<Record<string, SkillProficiency>>(() => {
    return user?.skillProficiencies || {};
  });
  const [newSkill, setNewSkill] = useState<string>('');
  const [newSkillProficiency, setNewSkillProficiency] = useState<SkillProficiency>('Intermediate');

  // --------------------------------------------------------------------------
  // D. Career Aspirations
  // --------------------------------------------------------------------------
  const [preferredCareerField, setPreferredCareerField] = useState<string>(user?.preferredCareerField || 'software_engineering');
  const [roleTarget, setRoleTarget] = useState<string>(user?.role_target || '');
  const [careerGoal, setCareerGoal] = useState<string>(() => {
    return (user?.careerGoal || 'campus_placement') as string;
  });
  const [preferredIndustry, setPreferredIndustry] = useState<string>(user?.preferredIndustry || '');
  const [preferredCompanies, setPreferredCompanies] = useState<string>(user?.preferredCompanies || '');
  const [preferredJobType, setPreferredJobType] = useState<string>(user?.preferredJobType || 'Full-Time');
  const [careerGoals, setCareerGoals] = useState<string>(user?.career_goals || '');

  // --------------------------------------------------------------------------
  // E. Experience & Projects (Conditional & Optional)
  // --------------------------------------------------------------------------
  const [projects, setProjects] = useState<Array<{ id: string; title: string; description: string; techStack?: string; link?: string; }>>(() => {
    if (user?.projects && Array.isArray(user.projects)) {
      return user.projects.map((p, idx) => ({
        id: p.id || `proj-${idx}-${Date.now()}`,
        title: p.title,
        description: p.description,
        techStack: p.techStack,
        link: p.link
      }));
    }
    return [];
  });
  const [isAddingProject, setIsAddingProject] = useState<boolean>(false);
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [projectTech, setProjectTech] = useState<string>('');
  const [projectDesc, setProjectDesc] = useState<string>('');
  const [projectLink, setProjectLink] = useState<string>('');

  const [certifications, setCertifications] = useState<string[]>(user?.certifications || []);
  const [newCert, setNewCert] = useState<string>('');

  // UI state
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // --------------------------------------------------------------------------
  // Hydrate from user object on mount / auth change
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhone(user.phone || '');
      setLocation(user.location || '');
      setCollege(user.college || '');
      setGraduationYear(user.graduation_year || '');
      setCareerGoals(user.career_goals || '');
      setExperienceLevel(user.experience_level || 'fresher');
      setSkills(user.skills || []);

      const rawEd = (user.educationLevel || (user as any).education_level || '') as string;
      if (rawEd === 'intermediate') {
        setEducationLevel('intermediate');
      } else if (rawEd) {
        setEducationLevel(rawEd);
      }

      const rawStrm = (user.academicStream || (user as any).academic_stream || '') as string;
      if (rawStrm) setAcademicStream(rawStrm);

      const deg = (user.degreeCourse || (user as any).degree_course || '') as string;
      setDegreeCourse(deg);

      setSpecialisation(user.specialisation || '');
      setYearOfStudy((user.yearOfStudy || (user as any).year_of_study || '') as string);
      setCareerGoal(user.careerGoal || 'campus_placement');
      setRoleTarget(user.role_target || '');

      if (user.preferredCareerField) setPreferredCareerField(user.preferredCareerField);
      if (user.preferredIndustry) setPreferredIndustry(user.preferredIndustry);
      if (user.preferredCompanies) setPreferredCompanies(user.preferredCompanies);
      if (user.preferredJobType) setPreferredJobType(user.preferredJobType);
      if (user.academicStatus) setAcademicStatus(user.academicStatus);
      if (user.professionalStage) setProfessionalStage(user.professionalStage);
      if (user.previousQualification) setPreviousQualification(user.previousQualification);
      if (user.employmentStatus) setEmploymentStatus(user.employmentStatus);
      if (user.totalExperienceYears) setTotalExperienceYears(user.totalExperienceYears);
      if (user.previousJobRole) setPreviousJobRole(user.previousJobRole);
      if (user.currentIndustry) setCurrentIndustry(user.currentIndustry);
      if (user.projects && Array.isArray(user.projects)) {
        setProjects(user.projects.map((p, idx) => ({
          id: p.id || `proj-${idx}-${Date.now()}`,
          title: p.title,
          description: p.description,
          techStack: p.techStack,
          link: p.link
        })));
      }
      if (user.certifications && Array.isArray(user.certifications)) setCertifications(user.certifications);
      if (user.skillProficiencies) setSkillProficiencies(user.skillProficiencies);
    }
  }, [user]);

  // Handle Qualification selection change
  const handleQualificationChange = (newLevel: string) => {
    setEducationLevel(newLevel);
    setHasDismissedLegacyNotice(true);
    setErrorMsg('');

    if (newLevel === 'diploma_polytechnic') {
      if (!academicStream || academicStream === 'general') setAcademicStream('engineering_technology');
      if (!degreeCourse) setDegreeCourse('Diploma in Engineering');
      if (!yearOfStudy) setYearOfStudy('3rd Year (Final Year Diploma)');
      setExperienceLevel('student');
    } else if (newLevel === 'undergraduate') {
      if (!academicStream) setAcademicStream('engineering_technology');
      if (!degreeCourse) setDegreeCourse('Bachelor of Technology / Bachelor of Engineering');
      if (!yearOfStudy) setYearOfStudy('4th Year / Final Year');
      setExperienceLevel('student');
    } else if (newLevel === 'postgraduate') {
      if (!academicStream) setAcademicStream('engineering_technology');
      if (!degreeCourse) setDegreeCourse('Master of Technology / Master of Engineering');
      if (!yearOfStudy) setYearOfStudy('2nd Year Master’s (Final Year)');
      setExperienceLevel('fresher');
    } else if (newLevel === 'professional_degree') {
      if (!academicStream) setAcademicStream('commerce');
      if (!degreeCourse) setDegreeCourse('Chartered Accountancy (CA - ICAI)');
      if (!professionalStage) setProfessionalStage('Intermediate / Executive (Group 1 / 2)');
      setExperienceLevel('student');
    } else if (newLevel === 'general') {
      setExperienceLevel('fresher');
    }
  };

  // Available degrees for current stream + qualification level
  const availableDegrees = useMemo(() => {
    if (!academicStream || !educationLevel || educationLevel === 'intermediate') return [];
    const stream = getAcademicStream(academicStream);
    if (!stream) return [];

    const matched = getDegreesByStreamAndLevel(academicStream as AcademicStreamId, educationLevel as EducationLevelId);
    if (matched.length > 0) return matched;

    return stream.supportedDegrees;
  }, [academicStream, educationLevel]);

  // Available specialisations for selected degree
  const availableSpecialisations = useMemo(() => {
    if (!degreeCourse || isCustomDegree) return [];
    const deg = availableDegrees.find(d => d.degreeName === degreeCourse || d.abbreviation === degreeCourse);
    return deg ? deg.specialisations : [];
  }, [degreeCourse, isCustomDegree, availableDegrees]);

  // Dynamic Year / Stage Options
  const yearOptions = useMemo(() => {
    switch (educationLevel) {
      case 'diploma_polytechnic':
        return [
          '1st Year Diploma',
          '2nd Year Diploma',
          '3rd Year (Final Year Diploma)',
          'Diploma Completed / Direct Lateral B.Tech Aspirant',
          'Passed Out / Job Seeking Technician'
        ];
      case 'undergraduate':
        return [
          '1st Year / Fresher',
          '2nd Year / Sophomore',
          '3rd Year / Pre-Final Year',
          '4th Year / Final Year',
          '5th Year (Dual Degree / Integrated B.Tech+M.Tech)',
          'Graduated / Fresher Job Seeker'
        ];
      case 'postgraduate':
        return [
          '1st Year Master’s',
          '2nd Year Master’s (Final Year)',
          'Postgraduate Completed / Ph.D Scholar'
        ];
      case 'professional_degree':
        return [
          'Foundation / Entry Level',
          'Intermediate / Executive Stage',
          'Active Articleship / Industrial Trainee',
          'Final Stage / Appearing for Board Exams',
          'Qualified / Licensed Professional Member'
        ];
      default:
        return [
          'Student / Trainee',
          'Fresh Graduate (0-1 yrs)',
          'Working Professional (1-3 yrs)',
          'Mid-Level Professional (3-5 yrs)',
          'Senior Specialist (5+ yrs)'
        ];
    }
  }, [educationLevel]);

  // Suggested Target Roles based on Stream or Career Field
  const suggestedRoles = useMemo(() => {
    if (academicStream) {
      const streamRoles = getTargetRolesForStream(academicStream as AcademicStreamId);
      if (streamRoles && streamRoles.length > 0) return streamRoles;
    }
    return [
      'Full Stack Developer',
      'Software Development Engineer (SDE-1)',
      'Frontend Engineer (React)',
      'Backend Engineer (Node/Java)',
      'Data Analyst / Machine Learning Engineer',
      'Tax & Financial Associate',
      'Business Operations Associate'
    ];
  }, [academicStream]);

  // Adaptive Dynamic Completion Meter
  const { completionPercentage, completionHint } = useMemo(() => {
    let requiredChecks: boolean[] = [];
    let optionalChecks: boolean[] = [];
    let missingPrompt = '';

    const hasName = Boolean(fullName.trim());
    const hasRole = Boolean(roleTarget.trim());
    const hasSkills = skills.length >= 1;

    if (educationLevel === 'diploma_polytechnic') {
      const hasBranch = Boolean(specialisation.trim() || degreeCourse.trim());
      const hasCollege = Boolean(college.trim());
      const hasYear = Boolean(yearOfStudy.trim());

      requiredChecks = [hasName, Boolean(educationLevel), hasBranch, hasCollege, hasYear, hasRole, hasSkills];
      optionalChecks = [Boolean(phone.trim() || location.trim()), Boolean(graduationYear.trim()), Boolean(careerGoal.trim()), projects.length > 0];

      if (!hasName) missingPrompt = 'Enter your full name';
      else if (!hasCollege) missingPrompt = 'Add your polytechnic institution';
      else if (!hasRole) missingPrompt = 'Specify your target job role';
      else if (!hasSkills) missingPrompt = 'Add at least one technical skill or tool';
      else if (projects.length === 0) missingPrompt = 'Add a workshop project or capstone to reach 100%';
      else missingPrompt = 'Profile fully complete!';
    } else if (educationLevel === 'undergraduate') {
      const hasStream = Boolean(academicStream);
      const hasDegree = Boolean((isCustomDegree ? customDegreeCourse : degreeCourse).trim());
      const hasSpec = Boolean((isCustomSpecialisation ? customSpecialisation : specialisation).trim());
      const hasCollege = Boolean(college.trim());
      const hasYear = Boolean(yearOfStudy.trim());

      requiredChecks = [hasName, hasStream, hasDegree, hasSpec, hasCollege, hasYear, hasRole, hasSkills];
      optionalChecks = [Boolean(phone.trim() || location.trim()), Boolean(graduationYear.trim()), Boolean(careerGoal.trim()), projects.length > 0, certifications.length > 0];

      if (!hasName) missingPrompt = 'Enter your full name';
      else if (!hasDegree) missingPrompt = 'Select your undergraduate degree';
      else if (!hasCollege) missingPrompt = 'Add your college or university name';
      else if (!hasRole) missingPrompt = 'Specify your target job role (e.g. SDE-1)';
      else if (!hasSkills) missingPrompt = 'Add your primary technical skills';
      else if (projects.length === 0) missingPrompt = 'Add a project or internship to reach 100%';
      else missingPrompt = 'Profile 100% complete for AI interviews!';
    } else if (educationLevel === 'postgraduate') {
      const hasDegree = Boolean((isCustomDegree ? customDegreeCourse : degreeCourse).trim());
      const hasCollege = Boolean(college.trim());
      const hasYear = Boolean(yearOfStudy.trim());

      requiredChecks = [hasName, Boolean(academicStream), hasDegree, hasCollege, hasYear, hasRole, hasSkills];
      optionalChecks = [Boolean(phone.trim() || location.trim()), Boolean(previousQualification.trim()), Boolean(graduationYear.trim()), projects.length > 0];

      if (!hasName) missingPrompt = 'Enter your full name';
      else if (!hasDegree) missingPrompt = 'Select your postgraduate program';
      else if (!hasCollege) missingPrompt = 'Add your university or department';
      else if (!hasRole) missingPrompt = 'Specify your target role';
      else if (!hasSkills) missingPrompt = 'Add your core specialized skills';
      else if (projects.length === 0) missingPrompt = 'Add your thesis or research project';
      else missingPrompt = 'Postgraduate profile ready!';
    } else if (educationLevel === 'professional_degree') {
      const hasDegree = Boolean((isCustomDegree ? customDegreeCourse : degreeCourse).trim());
      const hasStage = Boolean(professionalStage.trim());

      requiredChecks = [hasName, hasDegree, hasStage, hasRole, hasSkills];
      optionalChecks = [Boolean(college.trim()), Boolean(specialisation.trim()), Boolean(graduationYear.trim()), Boolean(careerGoal.trim()), projects.length > 0];

      if (!hasName) missingPrompt = 'Enter your full name';
      else if (!hasDegree) missingPrompt = 'Select your professional qualification (e.g. CA, CS)';
      else if (!hasRole) missingPrompt = 'Specify your target professional role';
      else if (!hasSkills) missingPrompt = 'Add your domain subjects (e.g. Audit, GST, Corporate Law)';
      else missingPrompt = 'Professional profile configured!';
    } else if (educationLevel === 'general') {
      const hasEmp = Boolean(employmentStatus.trim());
      const hasExp = Boolean(totalExperienceYears.trim());

      requiredChecks = [hasName, hasEmp, hasExp, hasRole, hasSkills];
      optionalChecks = [Boolean(phone.trim() || location.trim()), Boolean(currentIndustry.trim()), Boolean(previousJobRole.trim()), Boolean(careerGoals.trim()), projects.length > 0];

      if (!hasName) missingPrompt = 'Enter your full name';
      else if (!hasRole) missingPrompt = 'Specify your target job role';
      else if (!hasSkills) missingPrompt = 'Add your core industry skills';
      else if (projects.length === 0) missingPrompt = 'Add previous work highlights or key projects';
      else missingPrompt = 'Career profile complete!';
    } else {
      // Legacy intermediate record
      requiredChecks = [hasName, Boolean(college.trim()), hasRole, hasSkills];
      optionalChecks = [Boolean(careerGoals.trim())];
      missingPrompt = 'Historical record preserved. Select an active qualification above to update.';
    }

    const requiredScore = (requiredChecks.filter(Boolean).length / Math.max(1, requiredChecks.length)) * 75;
    const optionalScore = (optionalChecks.filter(Boolean).length / Math.max(1, optionalChecks.length)) * 25;
    const percentage = Math.min(100, Math.round(requiredScore + optionalScore));

    return { completionPercentage: percentage, completionHint: missingPrompt };
  }, [
    fullName,
    educationLevel,
    academicStream,
    isCustomDegree,
    customDegreeCourse,
    degreeCourse,
    isCustomSpecialisation,
    customSpecialisation,
    specialisation,
    college,
    yearOfStudy,
    roleTarget,
    skills,
    phone,
    location,
    graduationYear,
    careerGoal,
    projects,
    certifications,
    previousQualification,
    professionalStage,
    employmentStatus,
    totalExperienceYears,
    currentIndustry,
    previousJobRole,
    careerGoals
  ]);

  // Skill Add / Remove / Proficiency
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillProficiencies({
        ...skillProficiencies,
        [trimmed]: newSkillProficiency
      });
      setNewSkill('');
      setErrorMsg('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
    const copy = { ...skillProficiencies };
    delete copy[skillToRemove];
    setSkillProficiencies(copy);
  };

  const handleAddQuickSkill = (skillName: string) => {
    if (!skills.includes(skillName)) {
      setSkills([...skills, skillName]);
      setSkillProficiencies({
        ...skillProficiencies,
        [skillName]: 'Intermediate'
      });
      setErrorMsg('');
    }
  };

  const handleCycleProficiency = (skillName: string) => {
    const levels: SkillProficiency[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const current = skillProficiencies[skillName] || 'Intermediate';
    const nextIdx = (levels.indexOf(current) + 1) % levels.length;
    setSkillProficiencies({
      ...skillProficiencies,
      [skillName]: levels[nextIdx]
    });
  };

  // Project Add / Remove
  const handleAddProject = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!projectTitle.trim()) {
      setErrorMsg('Please enter a project title.');
      return;
    }
    const newProj = {
      id: `proj-${Date.now()}`,
      title: projectTitle.trim(),
      description: projectDesc.trim(),
      techStack: projectTech.trim(),
      link: projectLink.trim()
    };
    setProjects([...projects, newProj]);
    setProjectTitle('');
    setProjectTech('');
    setProjectDesc('');
    setProjectLink('');
    setIsAddingProject(false);
    setErrorMsg('');
  };

  const handleRemoveProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  // Certification Add / Remove
  const handleAddCert = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newCert.trim();
    if (trimmed && !certifications.includes(trimmed)) {
      setCertifications([...certifications, trimmed]);
      setNewCert('');
    }
  };

  const handleRemoveCert = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert));
  };

  // Save handler
  const handleSave = async (andStartPractice = false) => {
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const effectiveRoleTarget = roleTarget.trim();
    if (!effectiveRoleTarget) {
      setErrorMsg('Please specify your primary target job role (e.g. SDE-1, Full Stack Developer, Financial Analyst).');
      return;
    }

    if (skills.length === 0) {
      setErrorMsg('Please add at least one skill or topic of domain study.');
      return;
    }

    const effectiveDegree = isCustomDegree ? customDegreeCourse.trim() : degreeCourse.trim();
    const effectiveSpecialisation = isCustomSpecialisation ? customSpecialisation.trim() : specialisation.trim();

    setErrorMsg('');
    setSaving(true);

    try {
      // Build safe update object preserving any historical fields if unchanged
      const profileUpdates: Partial<UserProfile> = {
        full_name: fullName.trim() || user?.full_name || 'Candidate',
        role_target: effectiveRoleTarget,
        experience_level: experienceLevel,
        college: college.trim(),
        graduation_year: graduationYear.trim(),
        career_goals: careerGoals.trim(),
        skills,
        profile_completed: true,

        // Basic Info additions
        phone: phone.trim(),
        location: location.trim(),

        // Academic details
        educationLevel,
        academicStream: educationLevel === 'general' ? undefined : academicStream,
        degreeCourse: effectiveDegree,
        specialisation: effectiveSpecialisation,
        yearOfStudy,
        careerGoal,
        careerInterests: skills,
        academicStatus,
        professionalStage,
        previousQualification,

        // Experienced additions
        employmentStatus,
        totalExperienceYears,
        previousJobRole: previousJobRole.trim(),
        currentIndustry,

        // Portfolio & Aspirations
        preferredCareerField,
        preferredIndustry: preferredIndustry.trim(),
        preferredCompanies: preferredCompanies.trim(),
        preferredJobType,
        projects,
        certifications,
        skillProficiencies,

        // Database / snake_case aliases
        education_level: educationLevel,
        academic_stream: educationLevel === 'general' ? undefined : academicStream,
        degree_course: effectiveDegree,
        year_of_study: yearOfStudy,
        career_interests: skills
      };

      // If user had legacy intermediate and did NOT click a new qualification, keep their intermediate group!
      if (educationLevel === 'intermediate') {
        profileUpdates.intermediateGroup = (user as any)?.intermediateGroup || (user as any)?.intermediate_group;
        profileUpdates.intermediate_group = profileUpdates.intermediateGroup;
      }

      await updateProfile(profileUpdates);
      setSaveSuccess(true);

      if (andStartPractice || isOnboardingMode) {
        setTimeout(() => {
          setSaveSuccess(false);
          if (onNavigate) {
            onNavigate('setup');
          }
        }, 1200);
      } else {
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to update profile. Please check your network connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedStreamObj = getAcademicStream(academicStream);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Onboarding Top Alert Banner */}
      {isOnboardingMode && (
        <div className="p-6 rounded-2xl bg-[#121826] border border-[#C5F36B]/40 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#C5F36B]/15 border border-[#C5F36B]/30 flex items-center justify-center text-[#C5F36B] shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30 mb-2">
                Step 1: Student & Placement Profile
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#F5F7FA] tracking-tight">
                Welcome to InterviewBro AI, {user?.full_name || 'Candidate'}!
              </h2>
              <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1.5 max-w-2xl leading-relaxed">
                Configure your academic degree, specialization, skills, and target job role. Our AI calibrates its technical coding drills, behavioral HR scenarios, and placement viva specifically to your exact profile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Standard Header & Profile Completion Bar */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#121826] border border-white/[0.08] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30">
                Candidate Dashboard
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.05] text-[#F5F7FA] border border-white/[0.08]">
                {educationLevel === 'intermediate'
                  ? 'Legacy Intermediate (10+2)'
                  : (QUALIFICATION_OPTIONS.find(q => q.id === educationLevel)?.title || 'Undergraduate')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
              Student & Placement Profile
            </h1>
            <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1">
              Adaptive career intelligence calibrating AI mock questions, ATS diagnostics, and academy recommendations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(false)}
              className="btn-primary text-xs py-2.5 px-4 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile</span>
                </>
              )}
            </button>

            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('setup')}
                className="btn-secondary text-xs py-2.5 px-4"
              >
                <Video className="w-3.5 h-3.5 text-[#C5F36B]" />
                <span>Start Mock</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Completion Meter */}
        <div className="pt-3 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F5F7FA]">Profile Strength:</span>
              <span className={`font-mono font-bold ${completionPercentage >= 80 ? 'text-[#C5F36B]' : 'text-amber-400'}`}>
                {completionPercentage}% complete
              </span>
            </div>
            <span className="text-[11px] text-[#9AA4B2]">
              {completionHint}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C5F36B] to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Floating Alerts */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Profile saved successfully! Your AI mock interview settings have been calibrated.</span>
        </div>
      )}

      {/* Legacy Intermediate Alert (Preserved Safely) */}
      {isExistingIntermediate && !hasDismissedLegacyNotice && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Legacy Intermediate (10+2) Record Preserved</span>
            </div>
            <button
              type="button"
              onClick={() => setHasDismissedLegacyNotice(true)}
              className="text-amber-400/60 hover:text-amber-300 text-xs"
              aria-label="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-amber-200/90 leading-relaxed">
            Your account currently contains historical Intermediate (10+2) details. In this release, AI Mock Interviews and placement simulations are calibrated exclusively for higher education (Diploma, Undergraduate, Postgraduate, Professional qualifications, and Experienced job seekers).
          </p>
          <p className="text-amber-200/80 leading-relaxed">
            <strong>Your historical data is safely preserved</strong> and will not be overwritten. Whenever you are ready, choose an active qualification from the cards below to update your profile.
          </p>
        </div>
      )}

      {/* 3. Main Adaptive Profile Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-10">

        {/* ================================================================== */}
        {/* SECTION A: BASIC INFORMATION                                       */}
        {/* ================================================================== */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <Building2 className="w-4 h-4 text-[#C5F36B]" />
            <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider">
              1. Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-[#9AA4B2]">Authenticated</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={user?.email || 'candidate@interviewbro.ai'}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.04] text-xs text-[#9AA4B2] cursor-not-allowed"
                />
                <Mail className="w-3.5 h-3.5 text-[#9AA4B2] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5 flex items-center justify-between">
                <span>Phone Number</span>
                <span className="text-[10px] text-[#9AA4B2]">Optional</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
                />
                <Phone className="w-3.5 h-3.5 text-[#9AA4B2] absolute left-3 top-3" />
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5 flex items-center justify-between">
                <span>Current Location</span>
                <span className="text-[10px] text-[#9AA4B2]">Optional</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru / Hyderabad / Remote"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
                />
                <MapPin className="w-3.5 h-3.5 text-[#9AA4B2] absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* SECTION B: QUALIFICATION SELECTOR (ADAPTIVE)                        */}
        {/* ================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#C5F36B]" />
              <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider">
                2. Academic Level & Qualification
              </h3>
            </div>
            <span className="text-[11px] text-[#9AA4B2]">Select your primary qualification</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {QUALIFICATION_OPTIONS.map((opt) => {
              const isSelected = educationLevel === opt.id;
              const IconComp = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleQualificationChange(opt.id)}
                  className={`p-4 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-[#C5F36B]/10 border-[#C5F36B] shadow-sm'
                      : 'bg-[#080B11] hover:bg-white/[0.02] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#C5F36B] text-[#080B11]' : 'bg-white/[0.05] text-[#9AA4B2]'}`}>
                        <IconComp className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-[#F5F7FA]">
                        {opt.title}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#C5F36B] text-[#080B11] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <span className="inline-block px-2 py-0.5 mt-2.5 rounded text-[10px] font-bold bg-white/[0.04] text-[#C5F36B] border border-white/[0.06]">
                    {opt.badge}
                  </span>

                  <p className="text-[11px] text-[#9AA4B2] mt-1.5 line-clamp-2 leading-relaxed">
                    {opt.description}
                  </p>
                  <p className="text-[10px] text-[#9AA4B2]/70 mt-1 truncate">
                    {opt.exampleDegrees}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================== */}
        {/* SECTION C: ADAPTIVE EDUCATION & ACADEMIC DETAILS                   */}
        {/* ================================================================== */}
        <div className="space-y-6 p-5 sm:p-6 rounded-2xl bg-[#080B11] border border-white/[0.08]">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
            <Layers className="w-4 h-4 text-[#C5F36B]" />
            <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider">
              {educationLevel === 'general'
                ? '3. Professional Background & Work Experience'
                : '3. Degree, Stream & Academic Specialisation'}
            </h3>
          </div>

          {/* C-1: DIPLOMA / POLYTECHNIC FIELDS */}
          {educationLevel === 'diploma_polytechnic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Diploma Program / Course <span className="text-rose-400">*</span>
                  </label>
                  {!isCustomDegree ? (
                    <select
                      value={degreeCourse}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomDegree(true);
                          setDegreeCourse('');
                        } else {
                          setDegreeCourse(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                    >
                      <option value="Diploma in Engineering">Diploma in Engineering (Polytechnic)</option>
                      <option value="Diploma in Computer Engineering">Diploma in Computer Engineering</option>
                      <option value="Diploma in Electronics & Communication">Diploma in Electronics & Communication</option>
                      <option value="Diploma in Mechanical Engineering">Diploma in Mechanical Engineering</option>
                      <option value="Diploma in Electrical & Electronics">Diploma in Electrical & Electronics</option>
                      <option value="Diploma in Civil Engineering">Diploma in Civil Engineering</option>
                      <option value="Diploma in Pharmacy">Diploma in Pharmacy (D.Pharm)</option>
                      <option value="Diploma in Commercial Practice">Diploma in Commercial Practice</option>
                      <option value="__custom__">✏️ Other / Custom Diploma Name...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customDegreeCourse}
                        onChange={(e) => setCustomDegreeCourse(e.target.value)}
                        placeholder="Type diploma name..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                      />
                      <button
                        type="button"
                        onClick={() => { setIsCustomDegree(false); setCustomDegreeCourse(''); }}
                        className="px-3 py-1 rounded-xl bg-white/[0.05] text-[#9AA4B2] hover:text-[#F5F7FA] text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Branch / Specialization <span className="text-rose-400">*</span>
                  </label>
                  {!isCustomSpecialisation ? (
                    <select
                      value={specialisation}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomSpecialisation(true);
                          setSpecialisation('');
                        } else {
                          setSpecialisation(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                    >
                      <option value="">Select Branch...</option>
                      <option value="Computer Engineering & IT">Computer Engineering & IT</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Electrical Engineering">Electrical Engineering</option>
                      <option value="Civil Engineering">Civil Engineering</option>
                      <option value="Automobile Engineering">Automobile Engineering</option>
                      <option value="__custom__">✏️ Other / Custom Branch...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSpecialisation}
                        onChange={(e) => setCustomSpecialisation(e.target.value)}
                        placeholder="Type branch name..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                      />
                      <button
                        type="button"
                        onClick={() => { setIsCustomSpecialisation(false); setCustomSpecialisation(''); }}
                        className="px-3 py-1 rounded-xl bg-white/[0.05] text-[#9AA4B2] hover:text-[#F5F7FA] text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Polytechnic College / Institute <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Government Polytechnic"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Current Year / Stage <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  >
                    <option value="">Select Year...</option>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Completion Year
                  </label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g. 2025"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* C-2: UNDERGRADUATE FIELDS */}
          {educationLevel === 'undergraduate' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Academic & Professional Stream <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={academicStream}
                    onChange={(e) => {
                      setAcademicStream(e.target.value);
                      setDegreeCourse('');
                      setSpecialisation('');
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  >
                    <option value="">Select Stream...</option>
                    {ACADEMIC_STREAMS.map(strm => (
                      <option key={strm.id} value={strm.id}>{strm.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Undergraduate Degree / Program <span className="text-rose-400">*</span>
                  </label>
                  {!isCustomDegree ? (
                    <select
                      value={degreeCourse}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomDegree(true);
                          setDegreeCourse('');
                        } else {
                          setDegreeCourse(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                    >
                      <option value="">Select Degree...</option>
                      {availableDegrees.map(deg => (
                        <option key={deg.degreeName} value={deg.degreeName}>
                          {deg.degreeName} {deg.abbreviation ? `(${deg.abbreviation})` : ''}
                        </option>
                      ))}
                      <option value="__custom__">✏️ Other / Custom Degree Name...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customDegreeCourse}
                        onChange={(e) => setCustomDegreeCourse(e.target.value)}
                        placeholder="Type degree name (e.g. B.Tech Artificial Intelligence)..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                      />
                      <button
                        type="button"
                        onClick={() => { setIsCustomDegree(false); setCustomDegreeCourse(''); }}
                        className="px-3 py-1 rounded-xl bg-white/[0.05] text-[#9AA4B2] hover:text-[#F5F7FA] text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Specialisation / Branch / Major <span className="text-rose-400">*</span>
                  </label>
                  {!isCustomSpecialisation ? (
                    <select
                      value={specialisation}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomSpecialisation(true);
                          setSpecialisation('');
                        } else {
                          setSpecialisation(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                    >
                      <option value="">Select Specialisation...</option>
                      {availableSpecialisations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                      <option value="__custom__">✏️ Other / Custom Specialisation...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customSpecialisation}
                        onChange={(e) => setCustomSpecialisation(e.target.value)}
                        placeholder="Type specialisation (e.g. Data Analytics, Cloud Computing)..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                      />
                      <button
                        type="button"
                        onClick={() => { setIsCustomSpecialisation(false); setCustomSpecialisation(''); }}
                        className="px-3 py-1 rounded-xl bg-white/[0.05] text-[#9AA4B2] hover:text-[#F5F7FA] text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    College / University / Institute <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. IIT, NIT, BITS, State University..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Current Year of Study <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  >
                    <option value="">Select Year...</option>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Academic Status
                  </label>
                  <select
                    value={academicStatus}
                    onChange={(e) => setAcademicStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  >
                    <option value="Pursuing Full-Time">Pursuing Full-Time</option>
                    <option value="Final Semester / Appearing for Exams">Final Semester / Appearing for Exams</option>
                    <option value="Graduated / Degree Awarded">Graduated / Degree Awarded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Graduation Year
                  </label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g. 2025"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* C-3: POSTGRADUATE FIELDS */}
          {educationLevel === 'postgraduate' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Academic Stream <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={academicStream}
                    onChange={(e) => {
                      setAcademicStream(e.target.value);
                      setDegreeCourse('');
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  >
                    <option value="">Select Stream...</option>
                    {ACADEMIC_STREAMS.map(strm => (
                      <option key={strm.id} value={strm.id}>{strm.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Postgraduate Degree / Program <span className="text-rose-400">*</span>
                  </label>
                  {!isCustomDegree ? (
                    <select
                      value={degreeCourse}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomDegree(true);
                          setDegreeCourse('');
                        } else {
                          setDegreeCourse(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                    >
                      <option value="">Select Master’s Degree...</option>
                      {availableDegrees.map(deg => (
                        <option key={deg.degreeName} value={deg.degreeName}>
                          {deg.degreeName} {deg.abbreviation ? `(${deg.abbreviation})` : ''}
                        </option>
                      ))}
                      <option value="__custom__">✏️ Other / Custom PG Degree...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customDegreeCourse}
                        onChange={(e) => setCustomDegreeCourse(e.target.value)}
                        placeholder="Type PG degree..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                      />
                      <button
                        type="button"
                        onClick={() => { setIsCustomDegree(false); setCustomDegreeCourse(''); }}
                        className="px-3 py-1 rounded-xl bg-white/[0.05] text-[#9AA4B2] hover:text-[#F5F7FA] text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Specialisation / Research Domain <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={specialisation}
                    onChange={(e) => setSpecialisation(e.target.value)}
                    placeholder="e.g. Artificial Intelligence, VLSI, Distributed Systems, Finance..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    University / Department / Institute <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. IISc, IIT Bombay, University Department..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5 flex items-center justify-between">
                    <span>Prior UG Degree</span>
                    <span className="text-[10px] text-[#9AA4B2]">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={previousQualification}
                    onChange={(e) => setPreviousQualification(e.target.value)}
                    placeholder="e.g. B.Tech CSE, BCA, B.Sc"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Current Stage <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  >
                    <option value="">Select Stage...</option>
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Completion Year
                  </label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g. 2025"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* C-4: PROFESSIONAL QUALIFICATION FIELDS (CA, CS, CMA, CFA, LLB) */}
          {educationLevel === 'professional_degree' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Professional Qualification <span className="text-rose-400">*</span>
                  </label>
                  {!isCustomDegree ? (
                    <select
                      value={degreeCourse}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomDegree(true);
                          setDegreeCourse('');
                        } else {
                          setDegreeCourse(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                    >
                      <option value="">Select Qualification...</option>
                      <option value="Chartered Accountancy (CA - ICAI)">Chartered Accountancy (CA - ICAI)</option>
                      <option value="Company Secretary (CS - ICSI)">Company Secretary (CS - ICSI)</option>
                      <option value="Cost & Management Accountant (CMA - ICMAI)">Cost & Management Accountant (CMA - ICMAI)</option>
                      <option value="Chartered Financial Analyst (CFA)">Chartered Financial Analyst (CFA)</option>
                      <option value="ACCA (Association of Chartered Certified Accountants)">ACCA (Global Chartered Accountancy)</option>
                      <option value="Bachelor of Laws (LL.B / Bar Council)">Bachelor of Laws (LL.B / Bar Council)</option>
                      <option value="Bachelor of Architecture (B.Arch - COA)">Bachelor of Architecture (B.Arch - COA)</option>
                      <option value="__custom__">✏️ Other Professional Qualification...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customDegreeCourse}
                        onChange={(e) => setCustomDegreeCourse(e.target.value)}
                        placeholder="Type qualification name..."
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                      />
                      <button
                        type="button"
                        onClick={() => { setIsCustomDegree(false); setCustomDegreeCourse(''); }}
                        className="px-3 py-1 rounded-xl bg-white/[0.05] text-[#9AA4B2] hover:text-[#F5F7FA] text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Current Stage / Examination Level <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={professionalStage}
                    onChange={(e) => setProfessionalStage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  >
                    <option value="Foundation / Entry Level">Foundation / Entry Level</option>
                    <option value="Intermediate / Executive (Group 1 / 2)">Intermediate / Executive (Group 1 / 2)</option>
                    <option value="Articleship / Industrial Trainee (Active)">Articleship / Industrial Trainee (Active)</option>
                    <option value="Final Stage / Appearing for Board Exams">Final Stage / Appearing for Board Exams</option>
                    <option value="Qualified / Statutory Licensure Member">Qualified / Statutory Licensure Member</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Specialization / Practice Area
                  </label>
                  <input
                    type="text"
                    value={specialisation}
                    onChange={(e) => setSpecialisation(e.target.value)}
                    placeholder="e.g. Statutory Audit, Direct Tax, Corporate Law..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5 flex items-center justify-between">
                    <span>Articleship / Training Firm</span>
                    <span className="text-[10px] text-[#9AA4B2]">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Big 4 / Mid-sized Firm / Corporate"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Expected / Completion Year
                  </label>
                  <input
                    type="text"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    placeholder="e.g. 2025"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* C-5: JOB SEEKER & WORKING PROFESSIONAL FIELDS */}
          {educationLevel === 'general' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Current Employment Status <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={employmentStatus}
                    onChange={(e) => setEmploymentStatus(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  >
                    <option value="Actively Interviewing / Immediate Joiner">Actively Interviewing / Immediate Joiner</option>
                    <option value="Employed & Serving Notice Period">Employed & Serving Notice Period</option>
                    <option value="Employed & Exploring Opportunities">Employed & Exploring Opportunities</option>
                    <option value="Fresher Looking for First Break">Fresher Looking for First Break</option>
                    <option value="Freelancer / Contractor">Freelancer / Contractor</option>
                    <option value="Career Break / Transitioning">Career Break / Transitioning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Total Work Experience <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={totalExperienceYears}
                    onChange={(e) => {
                      setTotalExperienceYears(e.target.value);
                      if (e.target.value.includes('Fresher')) setExperienceLevel('fresher');
                      else if (e.target.value.includes('1-3')) setExperienceLevel('junior');
                      else if (e.target.value.includes('3-5')) setExperienceLevel('mid');
                      else setExperienceLevel('senior');
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  >
                    <option value="Fresher (0-1 years)">Fresher (0-1 years)</option>
                    <option value="Junior (1-3 years)">Junior (1-3 years)</option>
                    <option value="Mid-Level (3-5 years)">Mid-Level (3-5 years)</option>
                    <option value="Senior (5-8 years)">Senior (5-8 years)</option>
                    <option value="Lead / Staff (8+ years)">Lead / Staff (8+ years)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                    Current or Target Industry
                  </label>
                  <select
                    value={currentIndustry}
                    onChange={(e) => setCurrentIndustry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  >
                    <option value="IT Services & Software">IT Services & Software</option>
                    <option value="Product Tech & SaaS">Product Tech & SaaS</option>
                    <option value="Banking & Financial Services (BFSI)">Banking & Financial Services (BFSI)</option>
                    <option value="Fintech & Payments">Fintech & Payments</option>
                    <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                    <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                    <option value="Consulting & Strategy">Consulting & Strategy</option>
                    <option value="Other Industry">Other Industry</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5 flex items-center justify-between">
                    <span>Current or Most Recent Job Role</span>
                    <span className="text-[10px] text-[#9AA4B2]">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={previousJobRole}
                    onChange={(e) => setPreviousJobRole(e.target.value)}
                    placeholder="e.g. Associate Software Engineer / Frontend Developer"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5 flex items-center justify-between">
                    <span>Highest Completed Qualification</span>
                    <span className="text-[10px] text-[#9AA4B2]">Optional</span>
                  </label>
                  <input
                    type="text"
                    value={degreeCourse}
                    onChange={(e) => setDegreeCourse(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science / MCA / MBA"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* C-6: LEGACY INTERMEDIATE VIEW (READ-ONLY PRESERVATION) */}
          {educationLevel === 'intermediate' && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-[#9AA4B2] space-y-2">
              <div className="font-bold text-[#F5F7FA]">Current Qualification: Intermediate (10+2)</div>
              <p>
                Your historical intermediate profile is preserved. Intermediate mock interviews are currently paused in this release. Select one of the active qualification cards above to upgrade your interview calibration.
              </p>
            </div>
          )}
        </div>

        {/* ================================================================== */}
        {/* SECTION D: SKILLS & KNOWLEDGE                                      */}
        {/* ================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C5F36B]" />
              <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider">
                4. Skills & Knowledge <span className="text-rose-400">*</span>
              </h3>
            </div>
            <span className="text-[11px] text-[#9AA4B2]">Click proficiency badge on any pill to cycle level</span>
          </div>

          <p className="text-xs text-[#9AA4B2]">
            Add technical stacks, analytical skills, frameworks, or domain topics. The AI will formulate coding scenarios and technical viva questions directly aligned with your selected tools.
          </p>

          {/* Tag Pills with Proficiency Badges */}
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2.5 mb-3">
              {skills.map((skill) => {
                const prof = skillProficiencies[skill] || 'Intermediate';
                const profColor =
                  prof === 'Expert' ? 'text-amber-400 border-amber-400/40 bg-amber-400/10' :
                  prof === 'Advanced' ? 'text-emerald-400 border-emerald-400/40 bg-emerald-400/10' :
                  prof === 'Intermediate' ? 'text-sky-400 border-sky-400/40 bg-sky-400/10' :
                  'text-purple-400 border-purple-400/40 bg-purple-400/10';

                return (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs bg-[#080B11] border border-white/[0.08] text-[#F5F7FA] font-medium group"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleCycleProficiency(skill)}
                      title="Click to toggle proficiency"
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${profColor}`}
                    >
                      {prof}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[#9AA4B2] hover:text-rose-400 transition-colors ml-0.5"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#080B11] border border-white/[0.06] text-xs text-[#9AA4B2] italic mb-3">
              No skills added yet. Use the input below or select from quick suggestions.
            </div>
          )}

          {/* Form to add custom skill with proficiency */}
          <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill or tech stack (e.g. React, Python, SQL, Financial Modeling, GST)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
            />
            <div className="flex gap-2">
              <select
                value={newSkillProficiency}
                onChange={(e) => setNewSkillProficiency(e.target.value as SkillProficiency)}
                className="px-3 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
              <button
                type="submit"
                className="btn-secondary text-xs py-2.5 px-4"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill</span>
              </button>
            </div>
          </form>

          {/* Adaptive Quick Tag Recommendations */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#9AA4B2] font-medium mr-1">Suggestions:</span>
            {(selectedStreamObj ? selectedStreamObj.coreCompetencyPillars.map(p => p.label) : DEFAULT_TECH_PILLS).map((s) => {
              const isAdded = skills.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddQuickSkill(s)}
                  disabled={isAdded}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    isAdded
                      ? 'bg-white/[0.02] border-white/[0.04] text-[#9AA4B2]/40 cursor-default'
                      : 'bg-[#080B11] hover:bg-white/[0.04] border-white/[0.08] text-[#9AA4B2] hover:text-[#F5F7FA]'
                  }`}
                >
                  {isAdded ? `✓ ${s}` : `+ ${s}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================================== */}
        {/* SECTION E: CAREER ASPIRATIONS                                      */}
        {/* ================================================================== */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <Award className="w-4 h-4 text-[#C5F36B]" />
            <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider">
              5. Career Aspirations & Target Roles
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                Preferred Career Field <span className="text-rose-400">*</span>
              </label>
              <select
                value={preferredCareerField}
                onChange={(e) => setPreferredCareerField(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
              >
                {CAREER_FIELDS.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                Primary Target Job Role <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={roleTarget}
                onChange={(e) => setRoleTarget(e.target.value)}
                placeholder="e.g. SDE-1, Full Stack Developer, Data Analyst, Financial Analyst..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
              />

              <div className="mt-2 flex flex-wrap items-center gap-1">
                <span className="text-[10px] text-[#9AA4B2] mr-1">Popular:</span>
                {suggestedRoles.slice(0, 4).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleTarget(r)}
                    className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-[#9AA4B2] hover:text-[#C5F36B] hover:bg-white/[0.08] transition-all"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                Primary Preparation Goal
              </label>
              <select
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
              >
                {PREPARATION_GOAL_OPTIONS.map(g => (
                  <option key={g.id} value={g.id}>{g.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5 flex items-center justify-between">
                <span>Preferred Companies</span>
                <span className="text-[10px] text-[#9AA4B2]">Optional</span>
              </label>
              <input
                type="text"
                value={preferredCompanies}
                onChange={(e) => setPreferredCompanies(e.target.value)}
                placeholder="e.g. Google, Microsoft, TCS, Startups..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                Preferred Job Type
              </label>
              <select
                value={preferredJobType}
                onChange={(e) => setPreferredJobType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-Site">On-Site</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5 flex items-center justify-between">
              <span>Career Vision & Target Notes</span>
              <span className="text-[10px] text-[#9AA4B2]">Optional</span>
            </label>
            <textarea
              rows={2}
              value={careerGoals}
              onChange={(e) => setCareerGoals(e.target.value)}
              placeholder="e.g. Crack campus placements at a top product tech MNC, master System Design, or secure an SDE internship..."
              className="w-full p-3.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B] leading-relaxed"
            />
          </div>
        </div>

        {/* ================================================================== */}
        {/* SECTION F: EXPERIENCE & PROJECTS (CONDITIONAL & OPTIONAL)          */}
        {/* ================================================================== */}
        <div className="space-y-5 p-5 sm:p-6 rounded-2xl bg-[#080B11] border border-white/[0.08]">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-[#C5F36B]" />
              <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider">
                6. Projects & Experience Portfolio
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-[#C5F36B]">
              Optional Enhancement
            </span>
          </div>

          <p className="text-xs text-[#9AA4B2]">
            Adding projects or certifications provides the AI evaluator with real-world artifacts to probe during technical deep-dive rounds. You can skip this and add details later.
          </p>

          {/* Projects List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F5F7FA]">Key Projects ({projects.length})</span>
              {!isAddingProject && (
                <button
                  type="button"
                  onClick={() => setIsAddingProject(true)}
                  className="text-xs text-[#C5F36B] hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              )}
            </div>

            {/* Existing Project Cards */}
            {projects.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-4 rounded-xl bg-[#121826] border border-white/[0.06] space-y-2 relative">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-[#F5F7FA]">{proj.title}</div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(proj.id)}
                        className="text-[#9AA4B2] hover:text-rose-400 transition-colors"
                        aria-label="Remove project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {proj.techStack && (
                      <div className="text-[11px] text-[#C5F36B] font-mono">{proj.techStack}</div>
                    )}
                    {proj.description && (
                      <p className="text-[11px] text-[#9AA4B2] line-clamp-2 leading-relaxed">
                        {proj.description}
                      </p>
                    )}
                    {proj.link && (
                      <a
                        href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-sky-400 hover:underline pt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate max-w-[200px]">{proj.link}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add Project Form Modal / Inline */}
            {isAddingProject && (
              <div className="p-4 rounded-xl bg-[#121826] border border-[#C5F36B]/30 space-y-3">
                <div className="font-bold text-xs text-[#C5F36B]">New Project Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Project Title (e.g. Distributed Task Queue)*"
                    className="px-3.5 py-2 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                  <input
                    type="text"
                    value={projectTech}
                    onChange={(e) => setProjectTech(e.target.value)}
                    placeholder="Tech Stack (e.g. React, Node.js, Redis, Docker)"
                    className="px-3.5 py-2 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                </div>
                <textarea
                  rows={2}
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="Key problem solved, system architecture, or outcome..."
                  className="w-full p-3 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                />
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={projectLink}
                    onChange={(e) => setProjectLink(e.target.value)}
                    placeholder="GitHub Repo / Demo Link (optional)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                  />
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    Save Project
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingProject(false)}
                    className="text-xs text-[#9AA4B2] hover:text-[#F5F7FA] px-3 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Certifications Tag Bar */}
          <div className="pt-3 border-t border-white/[0.06] space-y-2">
            <span className="text-xs font-bold text-[#F5F7FA]">Certifications & Accreditations</span>
            {certifications.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {certifications.map(c => (
                  <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-white/[0.04] text-[#F5F7FA] border border-white/[0.06]">
                    <Star className="w-3 h-3 text-[#C5F36B]" />
                    <span>{c}</span>
                    <button type="button" onClick={() => handleRemoveCert(c)} className="text-[#9AA4B2] hover:text-rose-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <form onSubmit={handleAddCert} className="flex gap-2">
              <input
                type="text"
                value={newCert}
                onChange={(e) => setNewCert(e.target.value)}
                placeholder="e.g. AWS Certified Cloud Practitioner / HackerRank 5-Star / NISM..."
                className="flex-1 px-4 py-2 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
              />
              <button type="submit" className="btn-secondary text-xs py-2 px-3.5">
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>
        </div>

        {/* ================================================================== */}
        {/* SAVE & SUBMIT ACTION BAR                                           */}
        {/* ================================================================== */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#9AA4B2]">
            {isOnboardingMode ? (
              <span className="text-amber-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Save profile to unlock personalized mock interviews & ATS reports</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Profile calibrated for authentic technical & HR simulations</span>
              </span>
            )}
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(isOnboardingMode)}
              className="w-full sm:w-auto btn-primary text-xs py-3 px-6 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Adaptive Profile...</span>
                </>
              ) : isOnboardingMode ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile & Start Practicing →</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>

            {!isOnboardingMode && onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('setup')}
                className="w-full sm:w-auto btn-secondary text-xs py-3 px-5"
              >
                <Video className="w-3.5 h-3.5 text-[#C5F36B]" />
                <span>Go to Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
