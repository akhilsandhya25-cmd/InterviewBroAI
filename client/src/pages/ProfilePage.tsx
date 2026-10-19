import React, { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Save,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Video
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ExperienceLevel } from '../types';

interface ProfilePageProps {
  onNavigate?: (route: string) => void;
  isOnboarding?: boolean;
}

const POPULAR_ROLE_SUGGESTIONS = [
  'Full Stack Developer',
  'Frontend Engineer (React)',
  'Backend Engineer (Node/Java)',
  'SDE-1',
  'Data Analyst / Scientist',
  'DevOps / Cloud Engineer',
  'Mobile App Developer (Flutter/React Native)'
];

const POPULAR_SKILL_SUGGESTIONS = [
  'React',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'Java',
  'SQL',
  'Data Structures & Algorithms',
  'System Design',
  'Docker',
  'Git',
  'REST APIs'
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, isOnboarding }) => {
  const { user, updateProfile, quota } = useAuth();

  const isProfileComplete = Boolean(
    user?.profile_completed ||
    (user?.role_target && user.role_target.trim().length > 0 && user?.skills && user.skills.length > 0)
  );
  const isOnboardingMode = isOnboarding ?? !isProfileComplete;

  const [fullName, setFullName] = useState<string>(user?.full_name || '');
  const [roleTarget, setRoleTarget] = useState<string>(user?.role_target || '');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(user?.experience_level || 'fresher');
  const [college, setCollege] = useState<string>(user?.college || '');
  const [graduationYear, setGraduationYear] = useState<string>(user?.graduation_year || '');
  const [careerGoals, setCareerGoals] = useState<string>(user?.career_goals || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || []);
  const [newSkill, setNewSkill] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setRoleTarget(user.role_target || '');
      setExperienceLevel(user.experience_level || 'fresher');
      setCollege(user.college || '');
      setGraduationYear(user.graduation_year || '');
      setCareerGoals(user.career_goals || '');
      setSkills(user.skills || []);
    }
  }, [user]);

  // Genuine completion percentage based on actual fields
  const fields = [
    Boolean(fullName.trim()),
    Boolean(roleTarget.trim()),
    Boolean(experienceLevel),
    Boolean(college.trim()),
    Boolean(graduationYear.trim()),
    skills.length > 0
  ];
  const completionPercentage = Math.round((fields.filter(Boolean).length / fields.length) * 100);

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

  const handleSelectSuggestedRole = (r: string) => {
    setRoleTarget(r);
    setErrorMsg('');
  };

  const handleAddSuggestedSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
      setErrorMsg('');
    }
  };

  const handleSave = async (andStartPractice = false) => {
    if (!roleTarget.trim()) {
      setErrorMsg('Please specify your primary target job role before saving.');
      return;
    }
    if (skills.length === 0) {
      setErrorMsg('Please add at least one technical skill or tool so questions can be tailored to you.');
      return;
    }

    setErrorMsg('');
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName.trim() || user?.full_name || 'Candidate',
        role_target: roleTarget.trim(),
        experience_level: experienceLevel,
        college: college.trim(),
        graduation_year: graduationYear.trim(),
        career_goals: careerGoals.trim(),
        skills,
        profile_completed: true
      });
      setSaveSuccess(true);

      if (andStartPractice || isOnboardingMode) {
        setTimeout(() => {
          setSaveSuccess(false);
          if (onNavigate) {
            onNavigate('setup');
          }
        }, 1000);
      } else {
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Onboarding Mode Top Alert Banner */}
      {isOnboardingMode && (
        <div className="p-6 rounded-2xl bg-[#121826] border border-[#C5F36B]/40 shadow-sm relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#C5F36B]/15 border border-[#C5F36B]/30 flex items-center justify-center text-[#C5F36B] shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30 mb-2">
                Step 1: Set Up Your Candidate Profile
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#F5F7FA] tracking-tight">
                Welcome to InterviewBro AI, {user?.full_name || 'Candidate'}!
              </h2>
              <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1.5 max-w-2xl leading-relaxed">
                Before practicing, please fill in your target job role, experience level, and key skills below. InterviewBro AI will use this to generate realistic mock interview questions matching your background.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Standard Header */}
      {!isOnboardingMode && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30">
                Candidate Profile
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
              Placement & Career Profile
            </h1>
            <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1">
              This information personalizes your AI interviewer questions and resume evaluation.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Completion Pill */}
            <div className="px-3.5 py-2 rounded-xl bg-[#121826] border border-white/[0.08] text-xs font-medium text-[#9AA4B2]">
              Profile: <strong className="text-[#C5F36B]">{completionPercentage}% complete</strong>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            {isOnboardingMode
              ? 'Profile saved! Redirecting to Interview Setup Studio...'
              : 'Profile changes updated successfully!'}
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
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

          {/* Email Address */}
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

          {/* Target Role */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
              Primary Target Job Role <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={roleTarget}
              onChange={(e) => setRoleTarget(e.target.value)}
              placeholder="e.g. SDE-1, Full Stack Developer, Frontend Engineer, Data Analyst..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
            />

            {/* Quick Suggestions for Roles */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-[#9AA4B2] font-medium mr-1">Quick Suggestions:</span>
              {POPULAR_ROLE_SUGGESTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleSelectSuggestedRole(r)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    roleTarget === r
                      ? 'bg-[#C5F36B] border-[#C5F36B] text-[#080B11] font-bold'
                      : 'bg-[#080B11] hover:bg-white/[0.04] border-white/[0.08] text-[#9AA4B2] hover:text-[#F5F7FA]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
              Experience Level <span className="text-rose-400">*</span>
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] focus-visible:outline-none focus-visible:border-[#C5F36B]"
            >
              <option value="student">College Student (Pre-final / Final Year)</option>
              <option value="fresher">Fresh Graduate (0-1 yrs)</option>
              <option value="junior">Junior Engineer (1-3 yrs)</option>
              <option value="mid">Mid-Level Engineer (3-5 yrs)</option>
              <option value="senior">Senior Engineer (5+ yrs)</option>
            </select>
          </div>

          {/* College / Institution */}
          <div>
            <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
              College / University / Institute
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. IIT Bombay, NIT Trichy, Anna University, VIT..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
            />
          </div>

          {/* Graduation Year */}
          <div>
            <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
              Graduation Year
            </label>
            <input
              type="text"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              placeholder="e.g. 2024, 2025, 2026..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
            />
          </div>
        </div>

        {/* Skills Tag Input */}
        <div>
          <label className="block text-xs font-semibold text-[#F5F7FA] mb-2">
            Key Technical Skills & Tools <span className="text-rose-400">*</span>
          </label>

          {/* Selected Skills */}
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
                    aria-label={`Remove skill ${skill}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#080B11] border border-white/[0.06] text-xs text-[#9AA4B2] italic mb-3">
              No skills added yet. Select from common skills below or type custom skills and click Add.
            </div>
          )}

          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. Docker, Python, PostgreSQL, AWS)..."
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

          {/* Common Skill Suggestions */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#9AA4B2] font-medium mr-1">Popular Skills:</span>
            {POPULAR_SKILL_SUGGESTIONS.map((skill) => {
              const alreadySelected = skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleAddSuggestedSkill(skill)}
                  disabled={alreadySelected}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    alreadySelected
                      ? 'bg-white/[0.02] border-white/[0.04] text-[#9AA4B2]/40 cursor-default'
                      : 'bg-[#080B11] hover:bg-white/[0.04] border-white/[0.08] text-[#9AA4B2] hover:text-[#F5F7FA]'
                  }`}
                >
                  {alreadySelected ? `✓ ${skill}` : `+ ${skill}`}
                </button>
              );
            })}
          </div>
        </div>

        {/* Career Goals */}
        <div>
          <label className="block text-xs font-semibold text-[#F5F7FA] mb-1.5">
            Career Goals & Target Employers (Optional)
          </label>
          <textarea
            rows={3}
            value={careerGoals}
            onChange={(e) => setCareerGoals(e.target.value)}
            placeholder="e.g. Crack SDE-1 placement at Flipkart, Swiggy, or Google within the next 3 months, mastering system design and data structures..."
            className="w-full p-3.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B] leading-relaxed"
          />
        </div>

        {/* Save & Action Buttons */}
        <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#9AA4B2]">
            {isOnboardingMode ? (
              <span className="text-amber-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Complete required fields (*) to unlock mock interview practice</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Candidate profile is configured for AI interview simulations</span>
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
                  <span>Saving Profile...</span>
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
