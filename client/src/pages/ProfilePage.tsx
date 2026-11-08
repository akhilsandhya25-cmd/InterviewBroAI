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
  Compass,
  Briefcase,
  Layers,
  Award,
  ChevronDown,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ExperienceLevel } from '../types';
import {
  EDUCATION_LEVELS,
  INTERMEDIATE_GROUPS,
  ACADEMIC_STREAMS,
  EducationLevelId,
  AcademicStreamId,
  IntermediateGroupId,
  getEducationLevel,
  getAcademicStream,
  getIntermediateGroup,
  getDegreesByStreamAndLevel,
  getTargetRolesForStream
} from '../data/studentStreams';

interface ProfilePageProps {
  onNavigate?: (route: string) => void;
  isOnboarding?: boolean;
}

// Intermediate preparation goals
const INTERMEDIATE_GOAL_OPTIONS = [
  { id: 'college_admission', label: 'College & University Admission Preparation', desc: 'Personal interviews, university viva voce, and admission screening (CUET, etc.)' },
  { id: 'entrance_exam', label: 'Entrance Examination Preparation (JEE / NEET / CUET / CLAT / NDA)', desc: 'Confidence building for national & state competitive tests and personality boards' },
  { id: 'career_exploration', label: 'Career Stream Exploration & Subject Clarity', desc: 'Discovering post-12th degree pathways and future options' },
  { id: 'communication', label: 'Communication & Spoken English Confidence', desc: 'Overcoming stage fear, articulation, and public speaking confidence' },
  { id: 'subject_knowledge', label: 'Subject Knowledge & Conceptual Viva Preparation', desc: 'Mastering core syllabus concepts through oral Q&A' },
  { id: 'internship', label: 'Early Internship & Apprenticeship Preparation', desc: 'Vocational training, hands-on craft skills, and foundation projects' },
  { id: 'entry_level_employment', label: 'Entry-Level Employment / Government Job Exams', desc: 'Clerical, defense (NDA / Airmen), railway, or private trade entry' }
];

// Higher Education / Degree preparation goals
const HIGHER_ED_GOAL_OPTIONS = [
  { id: 'campus_placement', label: 'Campus Placement & Corporate Job Offer', desc: 'Cracking on-campus recruitment tests and technical rounds' },
  { id: 'internship', label: 'Internship & Industrial Training Selection', desc: 'Landing pre-final year industry internships and stipends' },
  { id: 'off_campus', label: 'Off-Campus Entry-Level Job Hunting', desc: 'Cracking competitive interviews at private and corporate firms' },
  { id: 'higher_education', label: 'Higher Education & Master’s Degree Admissions', desc: 'M.Tech, MS, MBA, M.Sc entrance and university viva' },
  { id: 'government_psu', label: 'Public Sector (PSU) & Government Job Exams', desc: 'Technical exams, viva rounds, and board interviews' },
  { id: 'communication', label: 'Communication, Soft Skills & Behavioral Confidence', desc: 'Polishing HR answers, presentation, and self-introduction' },
  { id: 'subject_mastery', label: 'Core Subject Depth & Technical Problem Solving', desc: 'Deep-dive domain interview preparation' }
];

const GENERAL_ROLE_SUGGESTIONS = [
  'Full Stack Developer',
  'Frontend Engineer (React)',
  'Backend Engineer (Node/Java)',
  'Data Analyst / Scientist',
  'Junior Site / Plant Engineer',
  'Operations & Management Trainee',
  'Research & Project Associate'
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, isOnboarding }) => {
  const { user, updateProfile } = useAuth();

  const isProfileComplete = Boolean(
    user?.profile_completed ||
    (user?.role_target && user.role_target.trim().length > 0 && user?.skills && user.skills.length > 0) ||
    (user?.educationLevel && (user?.intermediateGroup || user?.academicStream))
  );
  const isOnboardingMode = isOnboarding ?? !isProfileComplete;

  // Personal Info
  const [fullName, setFullName] = useState<string>(user?.full_name || '');
  const [college, setCollege] = useState<string>(user?.college || '');
  const [graduationYear, setGraduationYear] = useState<string>(user?.graduation_year || '');
  const [careerGoals, setCareerGoals] = useState<string>(user?.career_goals || '');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(user?.experience_level || 'fresher');

  // Academic Profile State
  const [educationLevel, setEducationLevel] = useState<string>(() => {
    return (user?.educationLevel || user?.education_level || '') as string;
  });
  const [intermediateGroup, setIntermediateGroup] = useState<string>(() => {
    return (user?.intermediateGroup || user?.intermediate_group || '') as string;
  });
  const [academicStream, setAcademicStream] = useState<string>(() => {
    return (user?.academicStream || user?.academic_stream || '') as string;
  });
  const [degreeCourse, setDegreeCourse] = useState<string>(() => {
    return (user?.degreeCourse || user?.degree_course || '') as string;
  });
  const [customDegreeCourse, setCustomDegreeCourse] = useState<string>('');
  const [isCustomDegree, setIsCustomDegree] = useState<boolean>(false);

  const [specialisation, setSpecialisation] = useState<string>(() => {
    return user?.specialisation || '';
  });
  const [customSpecialisation, setCustomSpecialisation] = useState<string>('');
  const [isCustomSpecialisation, setIsCustomSpecialisation] = useState<boolean>(false);

  const [yearOfStudy, setYearOfStudy] = useState<string>(() => {
    return (user?.yearOfStudy || user?.year_of_study || '') as string;
  });

  const [careerGoal, setCareerGoal] = useState<string>(() => {
    return (user?.careerGoal || '') as string;
  });

  // Target Focus / Role
  const [roleTarget, setRoleTarget] = useState<string>(user?.role_target || '');
  // Intermediate custom target (e.g. "IIT JEE Main", "NEET", "CUET B.Com")
  const [targetFocus, setTargetFocus] = useState<string>(() => {
    if (user?.educationLevel === 'intermediate') {
      return user?.role_target || '';
    }
    return '';
  });

  // Skills / Subjects
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [newSkill, setNewSkill] = useState<string>('');

  // UI status
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Hydrate from user object
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setCollege(user.college || '');
      setGraduationYear(user.graduation_year || '');
      setCareerGoals(user.career_goals || '');
      setExperienceLevel(user.experience_level || 'fresher');
      setSkills(user.skills || []);

      const edLvl = (user.educationLevel || user.education_level || '') as string;
      setEducationLevel(edLvl);

      const intGrp = (user.intermediateGroup || user.intermediate_group || '') as string;
      setIntermediateGroup(intGrp);

      const acStrm = (user.academicStream || user.academic_stream || '') as string;
      setAcademicStream(acStrm);

      const deg = (user.degreeCourse || user.degree_course || '') as string;
      setDegreeCourse(deg);

      setSpecialisation(user.specialisation || '');
      setYearOfStudy((user.yearOfStudy || user.year_of_study || '') as string);
      setCareerGoal(user.careerGoal || '');

      if (edLvl === 'intermediate') {
        setTargetFocus(user.role_target || '');
      } else {
        setRoleTarget(user.role_target || '');
      }
    }
  }, [user]);

  // Handle Education Level change
  const handleEducationLevelChange = (newLevel: string) => {
    setEducationLevel(newLevel);
    setErrorMsg('');

    if (newLevel === 'intermediate') {
      if (!intermediateGroup) setIntermediateGroup('mpc');
      if (!academicStream) setAcademicStream('science');
      if (!yearOfStudy) setYearOfStudy('Class 12 / Senior Intermediate (2nd Year)');
      if (!careerGoal) setCareerGoal('entrance_exam');
      setExperienceLevel('student');
    } else if (newLevel && newLevel !== 'general') {
      if (!academicStream) {
        if (newLevel === 'diploma_polytechnic' || newLevel === 'iti_vocational') {
          setAcademicStream(newLevel === 'iti_vocational' ? 'iti_vocational' : 'engineering_technology');
        } else {
          setAcademicStream('engineering_technology');
        }
      }
      setIntermediateGroup('');
    } else {
      // General / Experienced
      setIntermediateGroup('');
      setAcademicStream('');
      setDegreeCourse('');
      setSpecialisation('');
    }
  };

  // Intermediate group change
  const handleIntermediateGroupChange = (grpId: string) => {
    setIntermediateGroup(grpId);
    setErrorMsg('');

    // Pre-seed subjects if skills is currently empty
    const grp = getIntermediateGroup(grpId);
    if (grp && skills.length === 0) {
      setSkills(grp.subjects);
    }
  };

  // Academic stream change
  const handleStreamChange = (streamId: string) => {
    setAcademicStream(streamId);
    setDegreeCourse('');
    setCustomDegreeCourse('');
    setIsCustomDegree(false);
    setSpecialisation('');
    setCustomSpecialisation('');
    setIsCustomSpecialisation(false);
    setErrorMsg('');
  };

  // Available degrees for current stream + level
  const availableDegrees = useMemo(() => {
    if (!academicStream || !educationLevel || educationLevel === 'intermediate') return [];
    const stream = getAcademicStream(academicStream);
    if (!stream) return [];

    const matched = getDegreesByStreamAndLevel(academicStream as AcademicStreamId, educationLevel as EducationLevelId);
    if (matched.length > 0) return matched;

    // Fallback to all stream degrees if level-specific is flexible
    return stream.supportedDegrees;
  }, [academicStream, educationLevel]);

  // Available specialisations for selected degree
  const availableSpecialisations = useMemo(() => {
    if (!degreeCourse || isCustomDegree) return [];
    const deg = availableDegrees.find(d => d.degreeName === degreeCourse || d.abbreviation === degreeCourse);
    return deg ? deg.specialisations : [];
  }, [degreeCourse, isCustomDegree, availableDegrees]);

  // Dynamic Year of Study Options based on Education Level
  const yearOptions = useMemo(() => {
    switch (educationLevel) {
      case 'intermediate':
        return [
          'Class 11 / Junior Intermediate (1st Year)',
          'Class 12 / Senior Intermediate (2nd Year)',
          'Class 12 Completed / Entrance Repeater (Dropper)'
        ];
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
          'Graduated / Fresher Job Seeker'
        ];
      case 'postgraduate':
        return [
          '1st Year Master’s',
          '2nd Year Master’s (Final Year)',
          'Postgraduate Completed'
        ];
      case 'professional_degree':
        return [
          '1st Year Professional',
          '2nd Year Professional',
          '3rd Year Professional',
          '4th Year Professional',
          '5th Year / Clinical Intern / Articleship',
          'Degree Completed / Licensure Holder'
        ];
      case 'iti_vocational':
        return [
          '1st Year Craft Trainee',
          '2nd Year Craft Trainee (Final Year)',
          'Trade Certified / Apprenticeship Seeking'
        ];
      default:
        return [
          'Student (Current)',
          'Final Year Student',
          'Fresh Graduate (0-1 yrs)',
          'Working Professional (1+ yrs)'
        ];
    }
  }, [educationLevel]);

  // Suggested Target Roles or Exams
  const suggestedRolesOrExams = useMemo(() => {
    if (educationLevel === 'intermediate') {
      const grp = getIntermediateGroup(intermediateGroup);
      return grp ? grp.entranceExams : ['JEE Main', 'NEET-UG', 'CUET', 'CLAT', 'NDA SSB'];
    }
    if (academicStream) {
      return getTargetRolesForStream(academicStream as AcademicStreamId);
    }
    return GENERAL_ROLE_SUGGESTIONS;
  }, [educationLevel, intermediateGroup, academicStream]);

  // Genuine completion percentage tailored to category
  const completionPercentage = useMemo(() => {
    if (educationLevel === 'intermediate') {
      const checks = [
        Boolean(fullName.trim()),
        Boolean(intermediateGroup),
        Boolean(yearOfStudy),
        Boolean(careerGoal),
        Boolean(targetFocus.trim() || careerGoals.trim()),
        skills.length > 0
      ];
      return Math.round((checks.filter(Boolean).length / checks.length) * 100);
    }
    if (educationLevel && educationLevel !== 'general') {
      const effectiveDeg = isCustomDegree ? customDegreeCourse : degreeCourse;
      const checks = [
        Boolean(fullName.trim()),
        Boolean(educationLevel),
        Boolean(academicStream),
        Boolean(effectiveDeg.trim()),
        Boolean(roleTarget.trim()),
        skills.length > 0
      ];
      return Math.round((checks.filter(Boolean).length / checks.length) * 100);
    }
    // General
    const checks = [
      Boolean(fullName.trim()),
      Boolean(roleTarget.trim()),
      Boolean(college.trim()),
      Boolean(graduationYear.trim()),
      skills.length > 0
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [
    fullName,
    educationLevel,
    intermediateGroup,
    yearOfStudy,
    careerGoal,
    targetFocus,
    careerGoals,
    skills,
    academicStream,
    isCustomDegree,
    customDegreeCourse,
    degreeCourse,
    roleTarget,
    college,
    graduationYear
  ]);

  // Skill Add / Remove
  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill('');
      setErrorMsg('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddQuickTag = (tag: string) => {
    if (!skills.includes(tag)) {
      setSkills([...skills, tag]);
      setErrorMsg('');
    }
  };

  // Save handler
  const handleSave = async (andStartPractice = false) => {
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const isIntermediate = educationLevel === 'intermediate';
    const effectiveDegree = isCustomDegree ? customDegreeCourse.trim() : degreeCourse.trim();
    const effectiveSpecialisation = isCustomSpecialisation ? customSpecialisation.trim() : specialisation.trim();

    // Determine effective roleTarget for downstream compatibility
    let effectiveRoleTarget = '';
    if (isIntermediate) {
      const grp = getIntermediateGroup(intermediateGroup);
      const grpCode = grp ? grp.code : 'Intermediate';
      const goalObj = INTERMEDIATE_GOAL_OPTIONS.find(g => g.id === careerGoal);
      const goalTitle = targetFocus.trim() || (goalObj ? goalObj.label : 'College Admission');
      effectiveRoleTarget = `${grpCode} Student • ${goalTitle}`;
    } else {
      effectiveRoleTarget = roleTarget.trim();
    }

    if (!isIntermediate && !effectiveRoleTarget) {
      setErrorMsg('Please specify your primary target job role or focus area.');
      return;
    }

    if (skills.length === 0) {
      setErrorMsg(
        isIntermediate
          ? 'Please add at least one subject or topic of study (e.g. Physics, Calculus, Economics).'
          : 'Please add at least one skill, tool, or subject area.'
      );
      return;
    }

    setErrorMsg('');
    setSaving(true);

    try {
      await updateProfile({
        full_name: fullName.trim() || user?.full_name || 'Candidate',
        role_target: effectiveRoleTarget,
        experience_level: isIntermediate ? 'student' : experienceLevel,
        college: college.trim(),
        graduation_year: graduationYear.trim(),
        career_goals: careerGoals.trim(),
        skills,
        profile_completed: true,

        // Academic Profile Fields (Stage 2)
        educationLevel,
        academicStream: isIntermediate ? (getIntermediateGroup(intermediateGroup)?.subjects.includes('Biology') ? 'healthcare_medicine' : 'science') : academicStream,
        degreeCourse: isIntermediate ? `${getIntermediateGroup(intermediateGroup)?.code || 'Intermediate'} (10+2)` : effectiveDegree,
        specialisation: effectiveSpecialisation,
        intermediateGroup: isIntermediate ? intermediateGroup : undefined,
        yearOfStudy,
        careerGoal,
        careerInterests: skills,

        // Database / snake_case compatibility aliases
        education_level: educationLevel,
        academic_stream: isIntermediate ? 'science' : academicStream,
        degree_course: isIntermediate ? `${getIntermediateGroup(intermediateGroup)?.code || 'Intermediate'} (10+2)` : effectiveDegree,
        intermediate_group: isIntermediate ? intermediateGroup : undefined,
        year_of_study: yearOfStudy,
        career_interests: skills
      });

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
      setErrorMsg(e.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedIntermediateGroupObj = getIntermediateGroup(intermediateGroup);
  const selectedStreamObj = getAcademicStream(academicStream);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Onboarding Mode Top Alert Banner */}
      {isOnboardingMode && (
        <div className="p-6 rounded-2xl bg-[#121826] border border-[#C5F36B]/40 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#C5F36B]/15 border border-[#C5F36B]/30 flex items-center justify-center text-[#C5F36B] shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30 mb-2">
                Step 1: Universal Student Onboarding
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#F5F7FA] tracking-tight">
                Welcome to InterviewBro AI, {user?.full_name || 'Candidate'}!
              </h2>
              <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1.5 max-w-2xl leading-relaxed">
                Tell us your academic background, degree, or stream. Whether you are in Intermediate preparing for college admissions, a polytechnic technician, an ITI trade apprentice, or a university graduate, our AI will calibrate its interview simulations specifically to your field.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Standard Header */}
      {!isOnboardingMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30">
                Academic & Career Profile
              </span>
              {educationLevel && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/[0.05] text-[#F5F7FA] border border-white/[0.08]">
                  {getEducationLevel(educationLevel)?.shortName || educationLevel}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
              Student & Placement Profile
            </h1>
            <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1">
              Personalizes your mock interview questions, admission viva, and communication drills.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="px-3.5 py-2 rounded-xl bg-[#121826] border border-white/[0.08] text-xs font-medium text-[#9AA4B2]">
              Profile: <strong className="text-[#C5F36B]">{completionPercentage}% complete</strong>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {isOnboardingMode
              ? 'Academic profile saved! Redirecting to Interview Setup Studio...'
              : 'Academic profile updated successfully!'}
          </span>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 3. Main Profile Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-8">
        
        {/* Section A: Personal & Basic Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <Briefcase className="w-4 h-4 text-[#C5F36B]" />
            <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider">
              1. Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ananya Rao"
                className="w-full px-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || 'candidate@interviewbro.ai'}
                className="w-full px-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.04] text-xs text-[#9AA4B2] cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Section B: Education Level Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#C5F36B]" />
              <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider">
                2. Academic Level & Qualification
              </h3>
            </div>
            <span className="text-[11px] text-[#9AA4B2]">Select your current stage</span>
          </div>

          {/* Education Level Selector Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {EDUCATION_LEVELS.map((lvl) => {
              const isSelected = educationLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => handleEducationLevelChange(lvl.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'bg-[#C5F36B]/10 border-[#C5F36B] shadow-sm'
                      : 'bg-[#080B11] hover:bg-white/[0.02] border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[#F5F7FA]">
                      {lvl.shortName}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-[#C5F36B] text-[#080B11] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#9AA4B2] mt-1 line-clamp-2 leading-relaxed">
                    {lvl.description}
                  </p>
                </button>
              );
            })}

            {/* General / Working Professional Option */}
            <button
              type="button"
              onClick={() => handleEducationLevelChange('general')}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                educationLevel === 'general'
                  ? 'bg-[#C5F36B]/10 border-[#C5F36B] shadow-sm'
                  : 'bg-[#080B11] hover:bg-white/[0.02] border-white/[0.08]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-[#F5F7FA]">
                  Experienced / Job Seeker
                </span>
                {educationLevel === 'general' && (
                  <span className="w-4 h-4 rounded-full bg-[#C5F36B] text-[#080B11] flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#9AA4B2] mt-1 line-clamp-2 leading-relaxed">
                Standard corporate job hunting, tech roles, and experienced industry interviews.
              </p>
            </button>
          </div>
        </div>

        {/* Section C-1: INTERMEDIATE SPECIFIC EXPERIENCE */}
        {educationLevel === 'intermediate' && (
          <div className="space-y-6 p-5 sm:p-6 rounded-2xl bg-[#080B11] border border-[#C5F36B]/30 relative">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
              <Compass className="w-4 h-4 text-[#C5F36B]" />
              <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider">
                3. Intermediate (10+2) Stream & Preparation Pathway
              </h3>
            </div>

            {/* 7 Intermediate Groups */}
            <div>
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-2">
                Select Your Intermediate Group <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {INTERMEDIATE_GROUPS.map((grp) => {
                  const isGrpSelected = intermediateGroup === grp.id;
                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => handleIntermediateGroupChange(grp.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isGrpSelected
                          ? 'bg-[#C5F36B] border-[#C5F36B] text-[#080B11] font-extrabold shadow-sm'
                          : 'bg-[#121826] hover:bg-white/[0.04] border-white/[0.08] text-[#F5F7FA]'
                      }`}
                    >
                      <div className="text-sm font-black">{grp.code}</div>
                      <div className={`text-[10px] mt-0.5 truncate ${isGrpSelected ? 'text-black/80 font-medium' : 'text-[#9AA4B2]'}`}>
                        {grp.id === 'vocational_inter' ? 'Vocational' : grp.subjects.slice(0, 2).join(', ')}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Group Informative Preview */}
              {selectedIntermediateGroupObj && (
                <div className="mt-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs">
                  <div className="font-bold text-[#C5F36B]">{selectedIntermediateGroupObj.name}</div>
                  <div className="text-[#9AA4B2] text-[11px] mt-1">{selectedIntermediateGroupObj.description}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-[#F5F7FA]">Key Subjects:</span>
                    {selectedIntermediateGroupObj.subjects.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-white/[0.05] text-[10px] text-[#F5F7FA] border border-white/[0.06]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Intermediate Year & Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                  Current Year of Study <span className="text-rose-400">*</span>
                </label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                  Primary Preparation Goal <span className="text-rose-400">*</span>
                </label>
                <select
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                >
                  {INTERMEDIATE_GOAL_OPTIONS.map((g) => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target College, Degree, or Entrance Exam */}
            <div>
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                Target College, Degree, or Entrance Exam <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={targetFocus}
                onChange={(e) => setTargetFocus(e.target.value)}
                placeholder="e.g. IIT Bombay (JEE Advanced), NEET-UG, CUET (B.Com Hons), CLAT Law, NDA SSB..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
              />

              {/* Quick suggestions based on selected group */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#9AA4B2] font-medium mr-1">Common Targets for {selectedIntermediateGroupObj?.code || 'Group'}:</span>
                {suggestedRolesOrExams.map((exam) => (
                  <button
                    key={exam}
                    type="button"
                    onClick={() => setTargetFocus(exam)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      targetFocus === exam
                        ? 'bg-[#C5F36B] border-[#C5F36B] text-[#080B11] font-bold'
                        : 'bg-[#121826] hover:bg-white/[0.04] border-white/[0.08] text-[#9AA4B2] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {exam}
                  </button>
                ))}
              </div>
            </div>

            {/* Junior College Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                  Junior College / High School / Board
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Sri Chaitanya, Narayana, DPS, KV, State Board..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                  Class 12 Completion Year
                </label>
                <input
                  type="text"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder="e.g. 2025, 2026, 2027..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section C-2: HIGHER EDUCATION / VOCATIONAL STREAM & DEGREE */}
        {educationLevel && educationLevel !== 'intermediate' && educationLevel !== 'general' && (
          <div className="space-y-6 p-5 sm:p-6 rounded-2xl bg-[#080B11] border border-white/[0.08]">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
              <Layers className="w-4 h-4 text-[#C5F36B]" />
              <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider">
                3. Stream, Degree & Specialisation
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Academic Stream Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                  Academic & Professional Stream <span className="text-rose-400">*</span>
                </label>
                <select
                  value={academicStream}
                  onChange={(e) => handleStreamChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                >
                  <option value="">Select Academic Stream...</option>
                  {ACADEMIC_STREAMS.map((strm) => (
                    <option key={strm.id} value={strm.id}>
                      {strm.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Degree / Course Dropdown with Custom Option */}
              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                  Degree / Program / Trade <span className="text-rose-400">*</span>
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
                    <option value="">Select Degree / Course...</option>
                    {availableDegrees.map((deg) => (
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
                      placeholder="Type your degree (e.g. B.Sc Forensic Science)..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomDegree(false);
                        setCustomDegreeCourse('');
                      }}
                      className="px-3 py-1 rounded-xl bg-white/[0.05] text-[#9AA4B2] hover:text-[#F5F7FA] text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Specialisation Dropdown with Custom Option */}
              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                  Specialisation / Branch / Major
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
                    {availableSpecialisations.map((spec) => (
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
                      placeholder="Type specialisation (e.g. Artificial Intelligence, Taxation)..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomSpecialisation(false);
                        setCustomSpecialisation('');
                      }}
                      className="px-3 py-1 rounded-xl bg-white/[0.05] text-[#9AA4B2] hover:text-[#F5F7FA] text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Year of Study */}
              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                  Current Year of Study <span className="text-rose-400">*</span>
                </label>
                <select
                  value={yearOfStudy}
                  onChange={(e) => setYearOfStudy(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                >
                  <option value="">Select Year of Study...</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Higher Ed Goal */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                  Primary Preparation Goal <span className="text-rose-400">*</span>
                </label>
                <select
                  value={careerGoal}
                  onChange={(e) => setCareerGoal(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                >
                  <option value="">Select Preparation Goal...</option>
                  {HIGHER_ED_GOAL_OPTIONS.map((g) => (
                    <option key={g.id} value={g.id}>{g.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Target Job Role */}
            <div>
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                Primary Target Job Role / Placement Focus <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={roleTarget}
                onChange={(e) => setRoleTarget(e.target.value)}
                placeholder="e.g. SDE-1, Clinical Assistant, Junior Associate, Site Engineer, Plant Technician..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
              />

              {/* Dynamic Suggestions for Stream */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#9AA4B2] font-medium mr-1">
                  Popular Roles in {selectedStreamObj?.name || 'this Stream'}:
                </span>
                {suggestedRolesOrExams.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleTarget(r)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      roleTarget === r
                        ? 'bg-[#C5F36B] border-[#C5F36B] text-[#080B11] font-bold'
                        : 'bg-[#121826] hover:bg-white/[0.04] border-white/[0.08] text-[#9AA4B2] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* College & Grad Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                  College / University / Training Institute
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. IIT, NIT, Government Medical College, NLU, ITI Institute..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                  Graduation / Completion Year
                </label>
                <input
                  type="text"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder="e.g. 2025, 2026, 2027..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section C-3: GENERAL / EXPERIENCED FLOW */}
        {(educationLevel === 'general' || !educationLevel) && (
          <div className="space-y-6 p-5 sm:p-6 rounded-2xl bg-[#080B11] border border-white/[0.08]">
            <div className="flex items-center gap-2 pb-2 border-b border-white/[0.08]">
              <Briefcase className="w-4 h-4 text-[#C5F36B]" />
              <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider">
                3. Target Job Role & Experience Level
              </h3>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                Primary Target Job Role <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={roleTarget}
                onChange={(e) => setRoleTarget(e.target.value)}
                placeholder="e.g. Full Stack Developer, Data Analyst, Cloud Engineer, Product Manager..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
              />

              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#9AA4B2] font-medium mr-1">Quick Suggestions:</span>
                {GENERAL_ROLE_SUGGESTIONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleTarget(r)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      roleTarget === r
                        ? 'bg-[#C5F36B] border-[#C5F36B] text-[#080B11] font-bold'
                        : 'bg-[#121826] hover:bg-white/[0.04] border-white/[0.08] text-[#9AA4B2] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                  Experience Level
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
                >
                  <option value="student">Student / Intern</option>
                  <option value="fresher">Fresher (0-1 yrs)</option>
                  <option value="junior">Junior (1-3 yrs)</option>
                  <option value="mid">Mid-Level (3-5 yrs)</option>
                  <option value="senior">Senior (5+ yrs)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                  College / Institute
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. University / Institution..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
                  Graduation Year
                </label>
                <input
                  type="text"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                  placeholder="e.g. 2024, 2025..."
                  className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section D: Subjects, Skills & Topics Tag Input */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <BookOpen className="w-4 h-4 text-[#C5F36B]" />
            <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider">
              {educationLevel === 'intermediate'
                ? '4. Key Subjects & Topics of Interest'
                : '4. Key Skills, Tools & Subjects'} <span className="text-rose-400">*</span>
            </h3>
          </div>

          <p className="text-xs text-[#9AA4B2]">
            {educationLevel === 'intermediate'
              ? 'Add your 11th/12th subjects (e.g. Physics, Calculus, Botany, Accountancy) so oral questions match your current syllabus.'
              : 'Add technical tools, domain subjects, or methodologies (e.g. React, SQL, Pharmacology, GST, Vernier Caliper, CAD).'}
          </p>

          {/* Selected Tag Pills */}
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-[#C5F36B]/15 border border-[#C5F36B]/30 text-[#C5F36B] font-semibold"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-rose-400 transition-colors"
                    aria-label={`Remove ${skill}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#080B11] border border-white/[0.06] text-xs text-[#9AA4B2] italic mb-3">
              No subjects or skills added yet. Use the quick tags below or type your own.
            </div>
          )}

          {/* Form to add custom skill/subject */}
          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder={
                educationLevel === 'intermediate'
                  ? 'Add subject / topic (e.g. Calculus, Organic Chemistry, Indian Economy)...'
                  : 'Add skill / subject (e.g. Python, Financial Accounting, Pharmacokinetics)...'
              }
              className="flex-1 px-4 py-2 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
            />
            <button
              type="submit"
              className="btn-secondary text-xs py-2 px-3.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>

          {/* Quick Tag Recommendations */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#9AA4B2] font-medium mr-1">Quick Suggestions:</span>
            {educationLevel === 'intermediate' && selectedIntermediateGroupObj ? (
              selectedIntermediateGroupObj.subjects.map((sub) => {
                const selected = skills.includes(sub);
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => handleAddQuickTag(sub)}
                    disabled={selected}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      selected
                        ? 'bg-white/[0.02] border-white/[0.04] text-[#9AA4B2]/40 cursor-default'
                        : 'bg-[#080B11] hover:bg-white/[0.04] border-white/[0.08] text-[#9AA4B2] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {selected ? `✓ ${sub}` : `+ ${sub}`}
                  </button>
                );
              })
            ) : academicStream && selectedStreamObj ? (
              selectedStreamObj.coreCompetencyPillars.map((p) => {
                const selected = skills.includes(p.label);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => handleAddQuickTag(p.label)}
                    disabled={selected}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      selected
                        ? 'bg-white/[0.02] border-white/[0.04] text-[#9AA4B2]/40 cursor-default'
                        : 'bg-[#080B11] hover:bg-white/[0.04] border-white/[0.08] text-[#9AA4B2] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {selected ? `✓ ${p.label}` : `+ ${p.label}`}
                  </button>
                );
              })
            ) : (
              ['React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'Git', 'Data Structures'].map((s) => {
                const selected = skills.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleAddQuickTag(s)}
                    disabled={selected}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      selected
                        ? 'bg-white/[0.02] border-white/[0.04] text-[#9AA4B2]/40 cursor-default'
                        : 'bg-[#080B11] hover:bg-white/[0.04] border-white/[0.08] text-[#9AA4B2] hover:text-[#F5F7FA]'
                    }`}
                  >
                    {selected ? `✓ ${s}` : `+ ${s}`}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Section E: Future Aspirations / Notes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
            <Award className="w-4 h-4 text-[#C5F36B]" />
            <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wider">
              5. Career Aspirations & Target Goals (Optional)
            </h3>
          </div>

          <textarea
            rows={3}
            value={careerGoals}
            onChange={(e) => setCareerGoals(e.target.value)}
            placeholder={
              educationLevel === 'intermediate'
                ? 'e.g. Secure a top seat in IIT/NIT through JEE Advanced, or explore biotechnology research...'
                : 'e.g. Crack campus placement at an MNC, publish a research paper, or transition into cloud architecture...'
            }
            className="w-full p-3.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B] leading-relaxed"
          />
        </div>

        {/* Save & Action Bar */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#9AA4B2]">
            {isOnboardingMode ? (
              <span className="text-amber-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Save your academic profile to unlock personalized mock interviews</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Academic profile configured for AI simulations</span>
              </span>
            )}
          </p>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(isOnboardingMode)}
              className="w-full sm:w-auto btn-primary text-xs py-2.5 px-5 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Academic Profile...</span>
                </>
              ) : isOnboardingMode ? (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile & Start Practicing →</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Academic Profile</span>
                </>
              )}
            </button>

            {!isOnboardingMode && onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('setup')}
                className="w-full sm:w-auto btn-secondary text-xs py-2.5 px-4"
              >
                <Video className="w-3.5 h-3.5 text-[#C5F36B]" />
                <span>Start Mock</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
