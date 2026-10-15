import React, { useState } from 'react';
import { 
  User, 
  GraduationCap, 
  Briefcase, 
  Check, 
  Plus, 
  X, 
  Flame, 
  Save, 
  Sparkles,
  Calendar,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ExperienceLevel } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, quota } = useAuth();

  const [fullName, setFullName] = useState<string>(user?.full_name || '');
  const [roleTarget, setRoleTarget] = useState<string>(user?.role_target || 'Full Stack Developer');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(user?.experience_level || 'fresher');
  const [college, setCollege] = useState<string>(user?.college || '');
  const [graduationYear, setGraduationYear] = useState<string>(user?.graduation_year || '2025');
  const [careerGoals, setCareerGoals] = useState<string>(user?.career_goals || '');
  const [skills, setSkills] = useState<string[]>(user?.skills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL']);
  const [newSkill, setNewSkill] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  React.useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setRoleTarget(user.role_target || 'Full Stack Developer');
      setExperienceLevel(user.experience_level || 'fresher');
      setCollege(user.college || '');
      setGraduationYear(user.graduation_year || '2025');
      setCareerGoals(user.career_goals || '');
      setSkills(user.skills || ['React', 'TypeScript', 'Node.js', 'PostgreSQL']);
    }
  }, [user]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: fullName,
        role_target: roleTarget,
        experience_level: experienceLevel,
        college,
        graduation_year: graduationYear,
        career_goals: careerGoals,
        skills
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Candidate Profile
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Placement & Career Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            This information personalizes your AI interviewer questions and resume evaluation.
          </p>
        </div>

        {/* Free Quota Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium self-start sm:self-auto">
          <Flame className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            Quota: <strong className="text-emerald-400">Unlimited</strong> Practice Sessions
          </span>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Profile changes updated successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Email (Read Only) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || 'candidate@interviewbro.ai'}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 cursor-not-allowed"
            />
          </div>

          {/* Target Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Primary Target Job Role
            </label>
            <input
              type="text"
              value={roleTarget}
              onChange={(e) => setRoleTarget(e.target.value)}
              placeholder="e.g. SDE-1, Full Stack Developer, DevOps Engineer"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-violet-500"
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              College / University / Institute
            </label>
            <input
              type="text"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              placeholder="e.g. IIT Bombay, NIT Trichy, Anna University, VIT"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* Graduation Year */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Graduation Year
            </label>
            <input
              type="text"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              placeholder="e.g. 2024, 2025, 2026"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
            />
          </div>
        </div>

        {/* Skills Tag Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Key Technical Skills & Tools
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-violet-600/20 border border-violet-500/30 text-violet-200 font-medium"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="hover:text-rose-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddSkill} className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. Docker, Python, System Design, MongoDB)..."
              className="flex-1 px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Career Goals */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Career Goals & Target Employers
          </label>
          <textarea
            rows={3}
            value={careerGoals}
            onChange={(e) => setCareerGoals(e.target.value)}
            placeholder="e.g. Crack SDE-1 placement at Flipkart or Swiggy within the next 3 months, mastering system design and data structures..."
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 leading-relaxed"
          />
        </div>

        {/* Save Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-3 rounded-xl font-bold text-xs gradient-button flex items-center gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};
