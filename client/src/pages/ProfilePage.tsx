import React, { useState, useEffect } from 'react';
import {
  User,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  Sparkles,
  Upload,
  ArrowRight,
  RefreshCw,
  Award,
  Layers,
  FileText,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  CandidateProfile,
  CurrentStatus,
  EducationLevelType,
  InterviewDeliveryMode
} from '../types/candidateProfile';
import { storage } from '../services/storage';
import { CandidateOnboardingModal } from '../components/profile/CandidateOnboardingModal';

interface ProfilePageProps {
  onNavigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, candidateProfile, updateCandidateProfile } = useAuth();

  const [profile, setProfile] = useState<CandidateProfile>(() => {
    const p = candidateProfile || storage.getCandidateProfile(user?.id);
    const isMpcStream = /^mpc(\s*student)?$/i.test(String(p?.degreeStream || '').trim());
    const isMpcTarget = /mpc\s*student|entrance\s*examination|jee\s*\/\s*neet/i.test(p?.targetRole || '');
    if (isMpcStream || isMpcTarget) {
      return {
        ...p,
        degreeStream: isMpcStream ? 'B.Tech Computer Science' : p.degreeStream,
        targetRole: isMpcTarget ? 'Software Engineer' : p.targetRole,
        educationLevel: p.educationLevel === 'intermediate' as any ? 'UG' : p.educationLevel
      };
    }
    return p;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (candidateProfile) {
      const isMpcStream = /^mpc(\s*student)?$/i.test(String(candidateProfile?.degreeStream || '').trim());
      const isMpcTarget = /mpc\s*student|entrance\s*examination|jee\s*\/\s*neet/i.test(candidateProfile?.targetRole || '');
      if (isMpcStream || isMpcTarget) {
        setProfile({
          ...candidateProfile,
          degreeStream: isMpcStream ? 'B.Tech Computer Science' : candidateProfile.degreeStream,
          targetRole: isMpcTarget ? 'Software Engineer' : candidateProfile.targetRole,
          educationLevel: candidateProfile.educationLevel === 'intermediate' as any ? 'UG' : candidateProfile.educationLevel
        });
      } else {
        setProfile(candidateProfile);
      }
    }
  }, [candidateProfile]);

  // Compute profile completeness %
  const calculateCompleteness = () => {
    let score = 0;
    const missing: string[] = [];

    if (profile.currentStatus) score += 25;
    else missing.push('Status');

    if (profile.educationLevel) score += 25;
    else missing.push('Education');

    if (profile.degreeStream && profile.degreeStream.trim().length > 0) score += 25;
    else missing.push('Degree / Stream');

    if (profile.targetRole && profile.targetRole.trim().length > 0) score += 25;
    else missing.push('Target Role');

    let bonus = 0;
    if (profile.skills && profile.skills.length > 0) bonus += 5;
    if (profile.resumeFileName || profile.resumeText) bonus += 5;
    if (profile.college) bonus += 3;
    if (profile.city) bonus += 2;

    const total = Math.min(100, Math.round((score * 0.85) + bonus));
    return { percentage: total, missing };
  };

  const completeness = calculateCompleteness();

  const handleSave = async (updatedProfile?: CandidateProfile) => {
    const toSave = updatedProfile || profile;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await updateCandidateProfile(toSave);
      setProfile(toSave);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save candidate profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    if (profile.skills.includes(trimmed)) {
      setNewSkill('');
      return;
    }
    const updated = { ...profile, skills: [...profile.skills, trimmed] };
    setProfile(updated);
    setNewSkill('');
    handleSave(updated);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = { ...profile, skills: profile.skills.filter(s => s !== skillToRemove) };
    setProfile(updated);
    handleSave(updated);
  };

  const handleResumeSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = (event.target?.result as string) || '';
      const updated = {
        ...profile,
        resumeFileName: fileName,
        resumeText: text.slice(0, 4000)
      };
      setProfile(updated);
      handleSave(updated);
    };
    reader.readAsText(file.slice(0, 10000));
  };

  const handleExportData = () => {
    const allData = storage.exportAllCandidateData(profile.id);
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interviewbro_candidate_profile_${profile.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAll = () => {
    storage.clearAllCandidateData(profile.id);
    localStorage.removeItem(`interviewbro_candidate_profile_${profile.id}`);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080B11] text-slate-900 dark:text-[#F5F7FA] pb-20 transition-colors">
      {/* 4-Question Quick Setup Modal */}
      <CandidateOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        candidateProfile={profile}
        onSaveProfile={handleSave}
        onStartFirstInterview={() => onNavigate('setup')}
      />

      {/* Top Bar with Gentle Completeness Nudge (Mobile-Optimized & Sticky) */}
      <div className="border-b border-slate-200 dark:border-white/[0.06] bg-white/95 dark:bg-[#0B0F19]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#C5F36B]/20 border border-emerald-500/30 dark:border-[#C5F36B]/30 flex items-center justify-center text-emerald-800 dark:text-[#C5F36B] font-bold shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 dark:text-[#C5F36B]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {profile.fullName || user?.name || (user?.email ? user.email.split('@')[0] : '') || 'Candidate Profile'}
                </h1>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-[#9AA4B2] shrink-0">
                  {profile.currentStatus}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-[#9AA4B2] font-medium truncate">
                {profile.degreeStream} • Targeting {profile.targetRole}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
            {saveSuccess && (
              <span className="col-span-2 sm:col-auto text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Saved</span>
              </span>
            )}
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave()}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#d6ff79] text-[#080B11] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px] touch-manipulation"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('setup')}
              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[42px] touch-manipulation"
            >
              <span>Practice Mock</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Gentle Completeness Nudge Bar */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-2.5 sm:pb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[11px] font-semibold text-slate-800 dark:text-white">Profile Readiness:</span>
              <span className="text-emerald-700 dark:text-[#C5F36B] font-extrabold text-xs">{completeness.percentage}%</span>
              {completeness.missing.length > 0 && (
                <span className="text-[11px] text-slate-600 dark:text-[#9AA4B2] hidden md:inline font-medium">
                  (Tip: add your {completeness.missing[0]} for even sharper questions)
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="text-[11px] text-blue-600 dark:text-[#C5F36B] hover:underline font-bold cursor-pointer touch-manipulation py-0.5"
            >
              Quick 15s Setup
            </button>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#C5F36B] transition-all duration-500"
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Container (Mobile-First Spacing) */}
      <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6 space-y-4 sm:space-y-6">

        {/* CARD 1: THE 4 CORE QUESTIONS (Signup / Primary Setup) */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 sm:space-y-5">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#C5F36B]/20 text-emerald-800 dark:text-[#C5F36B] flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Core Interview Profile (4 Questions)</h2>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-[#9AA4B2] font-medium">Directly tunes your AI mock interview questions and evaluation standard.</p>
              </div>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 dark:bg-[#C5F36B]/10 text-emerald-700 dark:text-[#C5F36B] shrink-0">
              Active Directives
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* 1. I am a */}
            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-white mb-1.5 sm:mb-2">1. I am a:</label>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                {(['Student', 'Fresher', 'Job seeker', 'Working professional'] as CurrentStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      const updated = { ...profile, currentStatus: st };
                      setProfile(updated);
                      handleSave(updated);
                    }}
                    className={`p-2 sm:p-2.5 min-h-[42px] rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer flex items-center justify-between touch-manipulation ${
                      profile.currentStatus === st
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-200 font-bold shadow-sm'
                        : 'bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-[#9AA4B2] hover:bg-slate-200 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="leading-tight">{st}</span>
                    {profile.currentStatus === st && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Education Level */}
            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-white mb-1.5 sm:mb-2">2. Education Level:</label>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
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
                    className={`p-2 sm:p-2.5 min-h-[42px] rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer flex items-center justify-between touch-manipulation ${
                      profile.educationLevel === lvl.id
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-200 font-bold shadow-sm'
                        : 'bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-[#9AA4B2] hover:bg-slate-200 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="leading-tight">{lvl.label}</span>
                    {profile.educationLevel === lvl.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Stream or Degree */}
            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-white mb-1.5">3. Stream or Degree:</label>
              <input
                type="text"
                value={profile.degreeStream}
                onChange={(e) => setProfile({ ...profile, degreeStream: e.target.value })}
                onBlur={() => handleSave()}
                placeholder="e.g. B.Tech Computer Science, B.Com, MBA, BCA"
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white dark:bg-white/[0.03] border-2 border-slate-200 dark:border-white/[0.08] text-base sm:text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 touch-manipulation"
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
                    className={`text-[11px] sm:text-[10px] px-2.5 py-1 min-h-[30px] rounded-lg border transition-colors cursor-pointer font-bold touch-manipulation flex items-center ${
                      profile.degreeStream === chip
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-white/[0.02] text-slate-700 dark:text-[#9AA4B2] border-slate-200 dark:border-white/[0.06] hover:bg-slate-200 dark:hover:text-white'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Target Role */}
            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-white mb-1.5">4. Target Role:</label>
              <input
                type="text"
                value={profile.targetRole}
                onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                onBlur={() => handleSave()}
                placeholder="e.g. Software Engineer, Financial Analyst, HR Associate"
                className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-white dark:bg-white/[0.03] border-2 border-slate-200 dark:border-white/[0.08] text-base sm:text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 touch-manipulation"
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
                    className={`text-[11px] sm:text-[10px] px-2.5 py-1 min-h-[30px] rounded-lg border transition-colors cursor-pointer font-bold touch-manipulation flex items-center ${
                      profile.targetRole === role
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-white/[0.02] text-slate-700 dark:text-[#9AA4B2] border-slate-200 dark:border-white/[0.06] hover:bg-slate-200 dark:hover:text-white'
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
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 sm:space-y-5">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Optional Details (Skip or Fill Anytime)</h2>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-[#9AA4B2] font-medium">Drop a resume to auto-fill, add skill tags, or customize language.</p>
              </div>
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-600 dark:text-[#9AA4B2] border border-slate-200 dark:border-white/[0.08] px-2 py-0.5 rounded font-semibold shrink-0">
              100% Optional
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* Resume Drop Box */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-2.5 sm:gap-3">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-[#C5F36B] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Resume Calibration</h3>
                  <p className="text-[11px] text-slate-600 dark:text-[#9AA4B2] mt-0.5 font-medium break-all sm:break-normal">
                    {profile.resumeFileName
                      ? `Active file: ${profile.resumeFileName}`
                      : 'Upload PDF to personalize questions with your actual projects.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <label className="flex-1 sm:flex-initial px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-900 dark:text-white border border-slate-300 dark:border-white/[0.08] transition-all cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation">
                  <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-[#C5F36B]" />
                  <span>{profile.resumeFileName ? 'Replace Resume' : 'Drop Resume PDF'}</span>
                  <input type="file" accept=".pdf,.docx,.txt" onChange={handleResumeSimulated} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => onNavigate('resume')}
                  className="text-xs text-blue-600 dark:text-[#C5F36B] hover:underline font-bold transition-colors py-2 px-2 touch-manipulation"
                >
                  Full Scanner &gt;
                </button>
              </div>
            </div>

            {/* Skills Tags Manager */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">Skills Matrix</h3>
                <span className="text-[10px] text-slate-600 dark:text-[#9AA4B2] font-semibold">{profile.skills.length} skills listed</span>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add skill (e.g. React, SQL, Excel, Tax)"
                  className="flex-1 px-3 py-2 min-h-[42px] rounded-xl bg-white dark:bg-white/[0.03] border border-slate-300 dark:border-white/[0.08] text-base sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 font-medium touch-manipulation"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="w-10 h-10 min-w-[40px] rounded-xl text-xs font-bold bg-[#C5F36B] text-[#080B11] hover:bg-[#d6ff79] cursor-pointer flex items-center justify-center touch-manipulation"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 px-2.5 py-1 min-h-[30px] rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-300 dark:border-white/[0.08] text-xs font-medium text-slate-800 dark:text-white"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer font-bold p-1 touch-manipulation"
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Optional Fields (College, City, Preferences) */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-[#9AA4B2] mb-1">College / Institution</label>
              <input
                type="text"
                value={profile.college || ''}
                onChange={(e) => setProfile({ ...profile, college: e.target.value })}
                onBlur={() => handleSave()}
                placeholder="College name"
                className="w-full px-3 py-2 min-h-[42px] rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-300 dark:border-white/[0.06] text-base sm:text-xs text-slate-900 dark:text-white font-medium touch-manipulation"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-[#9AA4B2] mb-1">City / Location</label>
              <input
                type="text"
                value={profile.city || ''}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                onBlur={() => handleSave()}
                placeholder="e.g. Hyderabad"
                className="w-full px-3 py-2 min-h-[42px] rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-300 dark:border-white/[0.06] text-base sm:text-xs text-slate-900 dark:text-white font-medium touch-manipulation"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-[#9AA4B2] mb-1">Interview Language</label>
              <select
                value={profile.preferredLanguage}
                onChange={(e) => {
                  const updated = { ...profile, preferredLanguage: e.target.value };
                  setProfile(updated);
                  handleSave(updated);
                }}
                className="w-full px-3 py-2 min-h-[42px] rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-white/[0.06] text-base sm:text-xs text-slate-900 dark:text-white font-medium touch-manipulation"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Hinglish">Hinglish</option>
                <option value="Telugu">Telugu</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-[#9AA4B2] mb-1">Practice Mode</label>
              <select
                value={profile.interviewMode}
                onChange={(e) => {
                  const updated: CandidateProfile = { ...profile, interviewMode: e.target.value as any };
                  setProfile(updated);
                  handleSave(updated);
                }}
                className="w-full px-3 py-2 min-h-[42px] rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-300 dark:border-white/[0.06] text-base sm:text-xs text-slate-900 dark:text-white font-medium touch-manipulation"
              >
                <option value="voice">Interactive Voice</option>
                <option value="text">Text Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* CARD 3: AUTO-GENERATED PRACTICE INSIGHTS (Read-Only) */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-3 sm:space-y-4">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">Auto-Generated Performance Insights</h2>
                <p className="text-[11px] sm:text-xs text-slate-600 dark:text-[#9AA4B2] font-medium">Derived automatically from your mock interviews. You never have to type these.</p>
              </div>
            </div>
            <span className="text-[9px] sm:text-[10px] text-slate-600 dark:text-[#9AA4B2] border border-slate-200 dark:border-white/[0.08] px-2 py-0.5 rounded font-semibold shrink-0">
              Auto Calculated
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="text-[10px] font-bold text-slate-600 dark:text-[#9AA4B2] uppercase">Readiness Score</div>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">{profile.readinessScore}%</div>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="text-[10px] font-bold text-slate-600 dark:text-[#9AA4B2] uppercase">Technical</div>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">{profile.readinessBreakdown?.technical || 70}%</div>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="text-[10px] font-bold text-slate-600 dark:text-[#9AA4B2] uppercase">Communication</div>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">{profile.readinessBreakdown?.communication || 70}%</div>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="text-[10px] font-bold text-slate-600 dark:text-[#9AA4B2] uppercase">HR & Behavioral</div>
              <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">{profile.readinessBreakdown?.hr || 70}%</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">Identified Strengths</div>
              <div className="text-[11px] text-slate-600 dark:text-[#9AA4B2] leading-relaxed font-medium">
                {profile.strengths?.length > 0 ? profile.strengths.join(' • ') : 'Foundational domain knowledge'}
              </div>
            </div>
            <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06]">
              <div className="text-xs font-bold text-slate-900 dark:text-white mb-1">Growth & Improvement Areas</div>
              <div className="text-[11px] text-slate-600 dark:text-[#9AA4B2] leading-relaxed font-medium">
                {profile.weakAreas?.length > 0 ? profile.weakAreas.join(' • ') : 'Complete your first practice session to detect areas to polish.'}
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: CANDIDATE DATA PRIVACY & EXPORT */}
        <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-white/[0.01] border border-slate-200 dark:border-white/[0.06] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 text-xs text-slate-600 dark:text-[#9AA4B2] font-medium">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-[#C5F36B] shrink-0" />
            <span className="leading-snug">DPDP Act 2023 Compliant: You own all your interview data.</span>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleExportData}
              className="px-3 py-2 min-h-[38px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-900 dark:text-white border border-slate-200 dark:border-transparent transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-semibold touch-manipulation"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="px-3 py-2 min-h-[38px] rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-semibold touch-manipulation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete My Data</span>
            </button>
          </div>
        </div>

        {deleteConfirmOpen && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <span className="text-xs text-rose-700 dark:text-rose-300 font-medium">Permanently delete your profile and practice history?</span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleDeleteAll}
                className="flex-1 sm:flex-initial px-3.5 py-2 min-h-[38px] rounded-xl text-xs font-bold bg-rose-600 text-white cursor-pointer touch-manipulation flex items-center justify-center"
              >
                Yes, Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="flex-1 sm:flex-initial px-3.5 py-2 min-h-[38px] rounded-xl text-xs bg-slate-200 dark:bg-white/[0.06] text-slate-800 dark:text-white cursor-pointer font-medium touch-manipulation flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProfilePage;
