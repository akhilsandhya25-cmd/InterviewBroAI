import React, { useState, useMemo } from 'react';
import {
  User,
  GraduationCap,
  Target,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Shield,
  Trash2,
  Download,
  Plus,
  FileText,
  Upload,
  RefreshCw,
  TrendingUp,
  BookOpen,
  Mic,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import {
  CandidateProfile,
  CurrentStatus,
  EducationLevelType,
  InterviewDeliveryMode
} from '../types';
import { CandidateOnboardingModal } from '../components/profile/CandidateOnboardingModal';

interface ProfilePageProps {
  onNavigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, candidateProfile, updateCandidateProfile } = useAuth();

  const [profile, setProfile] = useState<CandidateProfile>(() => {
    return candidateProfile || storage.getCandidateProfile(user?.id);
  });

  const [newSkill, setNewSkill] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);

  // Soft completeness calculation (gentle nudge, never forces)
  const completeness = useMemo(() => {
    let score = 40; // Base for signing up
    const missing: string[] = [];

    if (profile.currentStatus) score += 15;
    if (profile.degreeStream && profile.degreeStream.trim().length > 1) score += 15;
    else missing.push('degree/stream');

    if (profile.targetRole && profile.targetRole.trim().length > 1) score += 15;
    else missing.push('target role');

    if (profile.skills && profile.skills.length >= 2) score += 10;
    else missing.push('skills');

    if (profile.resumeFileName || profile.resumeText) score += 5;
    else missing.push('resume upload');

    return {
      percentage: Math.min(100, score),
      missing
    };
  }, [profile]);

  const handleSave = async (updated: CandidateProfile = profile) => {
    setIsSaving(true);
    try {
      await updateCandidateProfile(updated);
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const clean = newSkill.trim();
    if (!profile.skills.includes(clean)) {
      const updated = {
        ...profile,
        skills: [...profile.skills, clean]
      };
      setProfile(updated);
      setNewSkill('');
      handleSave(updated);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = {
      ...profile,
      skills: profile.skills.filter(s => s !== skillToRemove)
    };
    setProfile(updated);
    handleSave(updated);
  };

  const handleResumeSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const updated = {
        ...profile,
        resumeFileName: file.name
      };
      setProfile(updated);
      handleSave(updated);
    }
  };

  const handleExportData = () => {
    const data = storage.exportAllCandidateData(profile.id);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interviewbro-profile-${profile.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAll = () => {
    storage.clearAllCandidateData(profile.id);
    localStorage.removeItem(`interviewbro_candidate_profile_${profile.id}`);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-[#F5F7FA] pb-20">
      {/* 4-Question Quick Setup Modal */}
      <CandidateOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        candidateProfile={profile}
        onSaveProfile={handleSave}
        onStartFirstInterview={() => onNavigate('setup')}
      />

      {/* Top Bar with Gentle Completeness Nudge */}
      <div className="border-b border-white/[0.06] bg-[#0B0F19]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C5F36B]/15 border border-[#C5F36B]/30 flex items-center justify-center text-[#C5F36B] font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">{profile.fullName || 'Candidate Profile'}</h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-[#9AA4B2]">
                  {profile.currentStatus}
                </span>
              </div>
              <p className="text-xs text-[#9AA4B2]">
                {profile.degreeStream} • Targeting {profile.targetRole}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved</span>
              </span>
            )}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#d6ff79] text-[#080B11] shadow-lg shadow-[#C5F36B]/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('setup')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.1] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Practice Mock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Gentle Completeness Nudge Bar (Never Blocks) */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-white">Profile Readiness:</span>
              <span className="text-[#C5F36B] font-bold text-xs">{completeness.percentage}%</span>
              {completeness.missing.length > 0 && (
                <span className="text-[11px] text-[#9AA4B2] hidden sm:inline">
                  (Tip: add your {completeness.missing[0]} for even sharper questions)
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="text-[11px] text-[#C5F36B] hover:underline font-semibold cursor-pointer"
            >
              Quick 15s Setup
            </button>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#C5F36B] transition-all duration-500"
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">

        {/* CARD 1: THE 4 CORE QUESTIONS (Signup / Primary Setup) */}
        <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#C5F36B]/15 text-[#C5F36B] flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Core Interview Profile (4 Questions)</h2>
                <p className="text-xs text-[#9AA4B2]">Directly tunes your AI mock interview questions and evaluation standard.</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#C5F36B]/10 text-[#C5F36B]">
              Active Directives
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. I am a */}
            <div>
              <label className="block text-xs font-semibold text-white mb-2">1. I am a:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['Student', 'Fresher', 'Job seeker', 'Working professional'] as CurrentStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      const updated = { ...profile, currentStatus: st };
                      setProfile(updated);
                      handleSave(updated);
                    }}
                    className={`p-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer flex items-center justify-between ${
                      profile.currentStatus === st
                        ? 'bg-[#C5F36B]/15 border-[#C5F36B] text-white font-bold'
                        : 'bg-white/[0.02] border-white/[0.06] text-[#9AA4B2] hover:bg-white/[0.05]'
                    }`}
                  >
                    <span>{st}</span>
                    {profile.currentStatus === st && <CheckCircle2 className="w-3.5 h-3.5 text-[#C5F36B]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Education Level */}
            <div>
              <label className="block text-xs font-semibold text-white mb-2">2. Education Level:</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'Diploma', label: 'Diploma' },
                  { id: 'UG', label: 'Undergraduate (UG)' },
                  { id: 'PG', label: 'Postgraduate (PG)' },
                  { id: 'Professional', label: 'Professional' }
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => {
                      const updated = { ...profile, educationLevel: lvl.id as EducationLevelType };
                      setProfile(updated);
                      handleSave(updated);
                    }}
                    className={`p-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer flex items-center justify-between ${
                      profile.educationLevel === lvl.id
                        ? 'bg-[#C5F36B]/15 border-[#C5F36B] text-white font-bold'
                        : 'bg-white/[0.02] border-white/[0.06] text-[#9AA4B2] hover:bg-white/[0.05]'
                    }`}
                  >
                    <span>{lvl.label}</span>
                    {profile.educationLevel === lvl.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#C5F36B]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Stream or Degree */}
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">3. Stream or Degree:</label>
              <input
                type="text"
                value={profile.degreeStream}
                onChange={(e) => setProfile({ ...profile, degreeStream: e.target.value })}
                onBlur={() => handleSave()}
                placeholder="e.g. B.Tech Computer Science, B.Com, MBA, BCA"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['B.Tech CSE', 'B.Com', 'BCA', 'BBA', 'MBA', 'B.Sc Physics', 'Mechanical'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => {
                      const updated = { ...profile, degreeStream: chip };
                      setProfile(updated);
                      handleSave(updated);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                      profile.degreeStream === chip
                        ? 'bg-[#C5F36B]/20 text-[#C5F36B] border-[#C5F36B]/40 font-bold'
                        : 'bg-white/[0.02] text-[#9AA4B2] border-white/[0.06] hover:text-white'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Target Role */}
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5">4. Target Role:</label>
              <input
                type="text"
                value={profile.targetRole}
                onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                onBlur={() => handleSave()}
                placeholder="e.g. Software Engineer, Financial Analyst, HR Associate"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {['Software Engineer', 'Data Analyst', 'Frontend Dev', 'Financial Analyst', 'HR Executive'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      const updated = { ...profile, targetRole: role };
                      setProfile(updated);
                      handleSave(updated);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                      profile.targetRole === role
                        ? 'bg-[#C5F36B]/20 text-[#C5F36B] border-[#C5F36B]/40 font-bold'
                        : 'bg-white/[0.02] text-[#9AA4B2] border-white/[0.06] hover:text-white'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: OPTIONAL ENHANCEMENTS (Resume, Skills, Preferences) */}
        <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-400/15 text-cyan-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Optional Details (Skip or Fill Anytime)</h2>
                <p className="text-xs text-[#9AA4B2]">Drop a resume to auto-fill, add skill tags, or customize language.</p>
              </div>
            </div>
            <span className="text-[10px] text-[#9AA4B2] border border-white/[0.08] px-2 py-0.5 rounded">
              100% Optional
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Resume Drop Box */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-[#C5F36B] shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-white">Resume Calibration</h3>
                  <p className="text-[11px] text-[#9AA4B2] mt-0.5">
                    {profile.resumeFileName
                      ? `Active file: ${profile.resumeFileName}`
                      : 'Upload PDF to personalize questions with your actual projects.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.08] transition-all cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[#C5F36B]" />
                  <span>{profile.resumeFileName ? 'Replace Resume' : 'Drop Resume PDF'}</span>
                  <input type="file" accept=".pdf,.docx,.txt" onChange={handleResumeSimulated} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('resume')}
                  className="text-xs text-[#9AA4B2] hover:text-[#C5F36B] transition-colors"
                >
                  Full Scanner &gt;
                </button>
              </div>
            </div>

            {/* Skills Tags Manager */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white">Skills Matrix</h3>
                <span className="text-[10px] text-[#9AA4B2]">{profile.skills.length} skills listed</span>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add skill (e.g. React, SQL, Excel, Tax)"
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#C5F36B] text-[#080B11] hover:bg-[#d6ff79] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[11px] text-white"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-[#9AA4B2] hover:text-rose-400 ml-0.5 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Optional Fields (College, City, Preferences) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-medium text-[#9AA4B2] mb-1">College / Institution</label>
              <input
                type="text"
                value={profile.college || ''}
                onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                onBlur={() => handleSave()}
                placeholder="College name"
                className="w-full px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#9AA4B2] mb-1">City / Location</label>
              <input
                type="text"
                value={profile.city || ''}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                onBlur={() => handleSave()}
                placeholder="e.g. Hyderabad"
                className="w-full px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#9AA4B2] mb-1">Interview Language</label>
              <select
                value={profile.preferredLanguage}
                onChange={(e) => {
                  const updated = { ...profile, preferredLanguage: e.target.value };
                  setProfile(updated);
                  handleSave(updated);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl bg-[#0B0F19] border border-white/[0.06] text-xs text-white"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
                <option value="Telugu">Telugu</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#9AA4B2] mb-1">Practice Mode</label>
              <select
                value={profile.interviewMode}
                onChange={(e) => {
                  const updated: CandidateProfile = { ...profile, interviewMode: e.target.value as any };
                  setProfile(updated);
                  handleSave(updated);
                }}
                className="w-full px-2.5 py-1.5 rounded-xl bg-[#0B0F19] border border-white/[0.06] text-xs text-white"
              >
                <option value="voice">Interactive Voice</option>
                <option value="text">Text Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* CARD 3: AUTO-GENERATED PRACTICE INSIGHTS (Read-Only) */}
        <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-400/15 text-emerald-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Auto-Generated Performance Insights</h2>
                <p className="text-xs text-[#9AA4B2]">Derived automatically from your mock interviews. You never have to type these.</p>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider bg-emerald-400/10 px-2 py-0.5 rounded">
              Auto-Calculated
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <div className="text-[10px] font-bold text-[#9AA4B2] uppercase">Readiness Score</div>
              <div className="text-xl font-black text-white mt-0.5">{profile.readinessScore}%</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <div className="text-[10px] font-bold text-[#9AA4B2] uppercase">Technical</div>
              <div className="text-xl font-black text-cyan-400 mt-0.5">{profile.readinessBreakdown?.technical || 70}%</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <div className="text-[10px] font-bold text-[#9AA4B2] uppercase">Communication</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{profile.readinessBreakdown?.communication || 70}%</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
              <div className="text-[10px] font-bold text-[#9AA4B2] uppercase">HR & Behavioral</div>
              <div className="text-xl font-black text-[#C5F36B] mt-0.5">{profile.readinessBreakdown?.hr || 70}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-xs font-bold text-white mb-1">Identified Strengths</div>
              <div className="text-[11px] text-[#9AA4B2] leading-relaxed">
                {profile.strengths?.length > 0 ? profile.strengths.join(' • ') : 'Complete your first practice session to log your key strengths.'}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              <div className="text-xs font-bold text-white mb-1">Growth & Improvement Areas</div>
              <div className="text-[11px] text-[#9AA4B2] leading-relaxed">
                {profile.weakAreas?.length > 0 ? profile.weakAreas.join(' • ') : 'Complete your first practice session to detect areas to polish.'}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: CANDIDATE DATA PRIVACY & EXPORT */}
        <div className="p-5 rounded-3xl bg-white/[0.01] border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9AA4B2]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#C5F36B]" />
            <span>DPDP Act 2023 Compliant: You own all your interview data.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportData}
              className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Data</span>
            </button>
          </div>
        </div>

        {deleteConfirmOpen && (
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between gap-4">
            <span className="text-xs text-rose-300">Permanently delete your profile and practice history?</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDeleteAll}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-rose-600 text-white cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-3 py-1 rounded-xl text-xs bg-white/[0.06] text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
