import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Mail,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Target,
  Award,
  Wrench,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
  Clock,
  TrendingUp,
  BookOpen,
  Trash2,
  Download,
  RefreshCw,
  Plus,
  Sliders,
  ChevronRight,
  Activity,
  Layers,
  Star,
  Zap,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import {
  CandidateProfile,
  CandidateEducation,
  CandidateSkill,
  CandidateExperience,
  CandidateResume,
  CurrentStatus,
  EducationLevelType,
  InterviewTypeFocus,
  CompanyTypePreference,
  PreparationTimeline,
  SkillCategory,
  SkillProficiency,
  ExperienceCategory
} from '../types';
import { buildGeminiProfileContext } from '../services/geminiProfileContext';
import { CandidateOnboardingModal } from '../components/profile/CandidateOnboardingModal';

interface ProfilePageProps {
  onNavigate: (route: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, candidateProfile, updateCandidateProfile } = useAuth();

  // Active editable profile state
  const [profile, setProfile] = useState<CandidateProfile>(() => {
    return candidateProfile || storage.getCandidateProfile(user?.id);
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'identity' | 'education' | 'target' | 'skills_exp' | 'resume' | 'communication' | 'preferences'>('overview');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);

  // Sync when candidateProfile context updates
  useEffect(() => {
    if (candidateProfile) {
      setProfile(candidateProfile);
    }
  }, [candidateProfile]);

  // Compute completeness score dynamically
  const completeness = useMemo(() => {
    let score = 0;
    const missing: string[] = [];

    // Identity (20%)
    if (profile.fullName && profile.fullName.trim().length > 1) score += 10;
    else missing.push('Full Name');

    if (profile.cityState && profile.cityState.trim().length > 1) score += 5;
    else missing.push('Location / City');

    if (profile.currentStatus) score += 5;

    // Education (20%)
    const primaryEdu = profile.education[0];
    if (primaryEdu?.degree && primaryEdu.degree.trim().length > 1) score += 10;
    else missing.push('Degree / Course');

    if (primaryEdu?.stream) score += 5;
    if (primaryEdu?.institution && primaryEdu.institution.trim().length > 1) score += 5;
    else missing.push('Institution / College');

    // Career Target (25%)
    if (profile.careerTarget.primaryTargetRole && profile.careerTarget.primaryTargetRole.trim().length > 1) score += 15;
    else missing.push('Primary Target Role');

    if (profile.careerTarget.targetIndustry) score += 5;
    if (profile.careerTarget.interviewTypeFocus) score += 5;

    // Skills & Experience (20%)
    if (profile.skills.length >= 3) score += 10;
    else missing.push('At least 3 core skills');

    if (profile.experience.length >= 1) score += 10;
    else missing.push('At least 1 project or experience');

    // Communication & Preferences (15%)
    if (profile.communicationBaseline?.evaluatedFromSessionsCount > 0) score += 10;
    else missing.push('First mock interview baseline');

    if (profile.preferences?.difficulty) score += 5;

    return {
      percentage: Math.min(100, score),
      missing
    };
  }, [profile]);

  // Unified context for Gemini & Academy
  const geminiContext = useMemo(() => buildGeminiProfileContext(profile), [profile]);

  // Save handler
  const handleSave = async (updated: CandidateProfile = profile) => {
    setIsSaving(true);
    try {
      const finalProfile: CandidateProfile = {
        ...updated,
        profileCompleted: completeness.percentage >= 60,
        updatedAt: new Date().toISOString()
      };
      await updateCandidateProfile(finalProfile);
      setProfile(finalProfile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Skill Management
  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>('Technical');
  const [newSkillRating, setNewSkillRating] = useState<SkillProficiency>('Intermediate');

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const skill: CandidateSkill = {
      id: `sk-${Date.now()}`,
      userId: profile.id,
      name: newSkillName.trim(),
      category: newSkillCategory,
      selfRating: newSkillRating,
      verified: false
    };

    const updated = {
      ...profile,
      skills: [...profile.skills.filter(s => s.name.toLowerCase() !== newSkillName.trim().toLowerCase()), skill]
    };
    setProfile(updated);
    setNewSkillName('');
    handleSave(updated);
  };

  const handleRemoveSkill = (name: string) => {
    const updated = {
      ...profile,
      skills: profile.skills.filter(s => s.name !== name)
    };
    setProfile(updated);
    handleSave(updated);
  };

  // Project / Experience Management
  const [expTitle, setExpTitle] = useState<string>('');
  const [expCategory, setExpCategory] = useState<ExperienceCategory>('project');
  const [expOrg, setExpOrg] = useState<string>('');
  const [expDesc, setExpDesc] = useState<string>('');
  const [expTools, setExpTools] = useState<string>('');

  const handleAddExperience = () => {
    if (!expTitle.trim()) return;
    const exp: CandidateExperience = {
      id: `exp-${Date.now()}`,
      userId: profile.id,
      category: expCategory,
      title: expTitle.trim(),
      organization: expOrg.trim(),
      description: expDesc.trim(),
      techTools: expTools ? expTools.split(',').map(t => t.trim()).filter(Boolean) : [],
      isCurrent: false
    };

    const updated = {
      ...profile,
      experience: [exp, ...profile.experience]
    };
    setProfile(updated);
    setExpTitle('');
    setExpOrg('');
    setExpDesc('');
    setExpTools('');
    handleSave(updated);
  };

  const handleRemoveExperience = (id: string) => {
    const updated = {
      ...profile,
      experience: profile.experience.filter(e => e.id !== id)
    };
    setProfile(updated);
    handleSave(updated);
  };

  // Export JSON Data
  const handleExportData = () => {
    const data = storage.exportAllCandidateData(profile.id);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interviewbro-candidate-profile-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Delete All Data (Right-to-Erasure)
  const handleDeleteAllData = async () => {
    try {
      storage.clearAllCandidateData?.(profile.id);
      localStorage.removeItem(`interviewbro_candidate_profile_${profile.id}`);
      window.location.reload();
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-[#F5F7FA] pb-24">
      {/* Onboarding Modal */}
      <CandidateOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        candidateProfile={profile}
        onSaveProfile={handleSave}
        onStartFirstInterview={(role, type) => {
          onNavigate('setup');
        }}
      />

      {/* Top Banner */}
      <div className="border-b border-white/[0.06] bg-[#0B0F19]/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C5F36B]/15 border border-[#C5F36B]/30 flex items-center justify-center text-[#C5F36B] font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white">
                  {profile.fullName || 'Candidate Profile'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.08] text-[#9AA4B2] border border-white/[0.08]">
                  {profile.currentStatus}
                </span>
              </div>
              <p className="text-xs text-[#9AA4B2]">
                {profile.careerTarget.primaryTargetRole} • {profile.education[0]?.degree || 'Undergraduate'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 flex items-center gap-1.5 animate-fade-in font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile saved</span>
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsOnboardingOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5F36B]" />
              <span>Fast Onboarding</span>
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave()}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#d6ff79] text-[#080B11] shadow-lg shadow-[#C5F36B]/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Completeness Meter */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">Profile Readiness:</span>
              <span className="text-[#C5F36B] font-bold">{completeness.percentage}% Complete</span>
              {completeness.missing.length > 0 && (
                <span className="text-[#9AA4B2] hidden md:inline text-[11px]">
                  — Next: add {completeness.missing[0]} to unlock tailored interview questions
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#9AA4B2]">Every field tunes Gemini AI prompts</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-[#C5F36B] to-cyan-400 transition-all duration-500"
              style={{ width: `${completeness.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none border-b border-white/[0.06]">
          {[
            { id: 'overview', label: 'Dashboard & Readiness', icon: TrendingUp },
            { id: 'identity', label: 'A. Identity & Status', icon: User },
            { id: 'education', label: 'B. Education', icon: GraduationCap },
            { id: 'target', label: 'C. Career Target', icon: Target },
            { id: 'skills_exp', label: 'D. Skills & Experience', icon: Award },
            { id: 'resume', label: 'E. Resume Intelligence', icon: FileText },
            { id: 'communication', label: 'F. Communication Baseline', icon: Activity },
            { id: 'preferences', label: 'G. Preferences', icon: Sliders }
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#C5F36B] text-[#080B11] shadow-md shadow-[#C5F36B]/20 font-bold'
                    : 'bg-white/[0.02] text-[#9AA4B2] hover:bg-white/[0.06] hover:text-white border border-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#080B11]' : 'text-[#9AA4B2]'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB: OVERVIEW & READINESS */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Quick Readiness Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-white/[0.08] relative overflow-hidden">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9AA4B2]">Overall Readiness</div>
                <div className="text-2xl font-black text-white mt-1">{profile.readinessScores.overall}%</div>
                <div className="text-[11px] text-[#C5F36B] mt-1 font-medium">Placement Benchmark</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-white/[0.08]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9AA4B2]">Technical Pillar</div>
                <div className="text-2xl font-black text-cyan-400 mt-1">{profile.readinessScores.technical}%</div>
                <div className="text-[11px] text-[#9AA4B2] mt-1">Domain mastery</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-white/[0.08]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9AA4B2]">Communication</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">{profile.readinessScores.communication}%</div>
                <div className="text-[11px] text-[#9AA4B2] mt-1">Delivery & STAR</div>
              </div>
              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-white/[0.08]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9AA4B2]">Resume Match</div>
                <div className="text-2xl font-black text-purple-400 mt-1">{profile.readinessScores.resume}%</div>
                <div className="text-[11px] text-[#9AA4B2] mt-1">ATS calibration</div>
              </div>
            </div>

            {/* AI Context Preview & Recommended Academy Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Context Summary */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#C5F36B]" />
                    <h3 className="text-sm font-bold text-white">Active Gemini Interviewer Directives</h3>
                  </div>
                  <span className="text-[10px] text-[#C5F36B] font-mono">Stream-Agnostic Engine</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] font-mono text-xs text-[#9AA4B2] whitespace-pre-wrap leading-relaxed">
                  {geminiContext.promptContextBlock}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[10px] font-bold text-white uppercase tracking-wider">Tone & Scaffolding</div>
                    <div className="text-xs text-[#9AA4B2] mt-1">{geminiContext.communicationToneDirective}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                    <div className="text-[10px] font-bold text-white uppercase tracking-wider">Prep Cadence ({profile.careerTarget.timeline})</div>
                    <div className="text-xs text-[#9AA4B2] mt-1">{geminiContext.prepStrategyDirective}</div>
                  </div>
                </div>
              </div>

              {/* Recommended Academy Lessons */}
              <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-[#C5F36B]" />
                    <h3 className="text-sm font-bold text-white">Personalized Academy Recommendations</h3>
                  </div>
                  <p className="text-xs text-[#9AA4B2] mb-4">
                    Based on your candidate stream and weak areas, these modules yield maximum score improvements:
                  </p>
                  <div className="space-y-2.5">
                    {geminiContext.academyLessonRecommendations.map((rec) => (
                      <div key={rec.id} className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                        <div className="text-xs font-bold text-white">{rec.title}</div>
                        <div className="text-[11px] text-[#9AA4B2] mt-0.5">{rec.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate('academy')}
                  className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.08] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Go to Interview Academy</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0B0F19] to-[#121826] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white">Launch Personalized Mock Interview</h4>
                <p className="text-xs text-[#9AA4B2] mt-0.5">
                  Using your configured role: <strong>{profile.careerTarget.primaryTargetRole}</strong> ({profile.education[0]?.stream})
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('setup')}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#d6ff79] text-[#080B11] shadow-lg shadow-[#C5F36B]/20 flex items-center gap-2 cursor-pointer transition-all shrink-0"
              >
                <span>Start Practice Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB: IDENTITY & STATUS */}
        {activeTab === 'identity' && (
          <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-6 animate-fade-in max-w-3xl">
            <div>
              <h2 className="text-base font-bold text-white">Section A: Identity & Status</h2>
              <p className="text-xs text-[#9AA4B2] mt-1">
                Basic contact information and professional status. Authentication credentials remain secured.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">
                  Account Email <span className="text-[10px] text-[#9AA4B2]">(Read-only)</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-[#9AA4B2] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">City / State</label>
                <input
                  type="text"
                  value={profile.cityState || ''}
                  onChange={(e) => setProfile({ ...profile, cityState: e.target.value })}
                  placeholder="e.g. Hyderabad, Telangana"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Preferred Interview Language</label>
                <select
                  value={profile.preferredInterviewLanguage}
                  onChange={(e) => setProfile({ ...profile, preferredInterviewLanguage: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Hinglish">Hinglish (English + Hindi Mix)</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Kannada">Kannada</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9AA4B2] mb-2">Current Career Status</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Student', 'Fresher', 'Job seeker', 'Working professional'] as CurrentStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setProfile({ ...profile, currentStatus: st })}
                    className={`p-3 rounded-2xl text-xs font-medium border text-center transition-all cursor-pointer ${
                      profile.currentStatus === st
                        ? 'bg-[#C5F36B]/15 border-[#C5F36B] text-white font-bold'
                        : 'bg-white/[0.02] border-white/[0.06] text-[#9AA4B2] hover:bg-white/[0.05]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: EDUCATION */}
        {activeTab === 'education' && (
          <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-6 animate-fade-in max-w-3xl">
            <div>
              <h2 className="text-base font-bold text-white">Section B: Education (Stream-Agnostic)</h2>
              <p className="text-xs text-[#9AA4B2] mt-1">
                Tailors academic domain questions for technical, commerce, business, science, arts, diploma, or professional qualifications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Education Level</label>
                <select
                  value={profile.education[0]?.level || 'undergraduate'}
                  onChange={(e) => {
                    const updatedEdu = [...profile.education];
                    if (updatedEdu[0]) updatedEdu[0].level = e.target.value as EducationLevelType;
                    setProfile({ ...profile, education: updatedEdu });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                >
                  <option value="undergraduate">Undergraduate (UG / B.Tech / B.Com / B.Sc / BBA)</option>
                  <option value="postgraduate">Postgraduate (PG / M.Tech / MBA / MCA / M.Sc)</option>
                  <option value="diploma">Diploma / Polytechnic</option>
                  <option value="professional">Professional Qualification (CA / CS / CMA / Law)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Academic Stream</label>
                <select
                  value={profile.education[0]?.stream || 'Engineering & Technology'}
                  onChange={(e) => {
                    const updatedEdu = [...profile.education];
                    if (updatedEdu[0]) updatedEdu[0].stream = e.target.value;
                    setProfile({ ...profile, education: updatedEdu });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                >
                  <option value="Engineering & Technology">Engineering & Technology</option>
                  <option value="Commerce & Accounting">Commerce & Accounting</option>
                  <option value="Business & Management">Business & Management</option>
                  <option value="Computer Applications (BCA/MCA)">Computer Applications (BCA/MCA)</option>
                  <option value="Pure & Life Sciences">Pure & Life Sciences</option>
                  <option value="Arts, Humanities & Social Sciences">Arts, Humanities & Social Sciences</option>
                  <option value="Healthcare & Nursing">Healthcare & Nursing</option>
                  <option value="Law & Legal Studies">Law & Legal Studies</option>
                  <option value="Design & Architecture">Design & Architecture</option>
                  <option value="Other Professional Stream">Other Professional Stream</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Degree / Course Name</label>
                <input
                  type="text"
                  value={profile.education[0]?.degree || ''}
                  onChange={(e) => {
                    const updatedEdu = [...profile.education];
                    if (updatedEdu[0]) updatedEdu[0].degree = e.target.value;
                    setProfile({ ...profile, education: updatedEdu });
                  }}
                  placeholder="e.g. B.Tech Computer Science, B.Com General, BBA"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Specialization / Major</label>
                <input
                  type="text"
                  value={profile.education[0]?.specialization || ''}
                  onChange={(e) => {
                    const updatedEdu = [...profile.education];
                    if (updatedEdu[0]) updatedEdu[0].specialization = e.target.value;
                    setProfile({ ...profile, education: updatedEdu });
                  }}
                  placeholder="e.g. Artificial Intelligence, Finance, Marketing"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Institution / College</label>
                <input
                  type="text"
                  value={profile.education[0]?.institution || ''}
                  onChange={(e) => {
                    const updatedEdu = [...profile.education];
                    if (updatedEdu[0]) updatedEdu[0].institution = e.target.value;
                    setProfile({ ...profile, education: updatedEdu });
                  }}
                  placeholder="College or University name"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Year of Study or Graduation</label>
                <input
                  type="text"
                  value={profile.education[0]?.yearOfStudy || ''}
                  onChange={(e) => {
                    const updatedEdu = [...profile.education];
                    if (updatedEdu[0]) updatedEdu[0].yearOfStudy = e.target.value;
                    setProfile({ ...profile, education: updatedEdu });
                  }}
                  placeholder="e.g. 3rd Year, Final Year, or 2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Optional CGPA / Percentage</label>
                <input
                  type="text"
                  value={profile.education[0]?.scoreCgpaPercentage || ''}
                  onChange={(e) => {
                    const updatedEdu = [...profile.education];
                    if (updatedEdu[0]) updatedEdu[0].scoreCgpaPercentage = e.target.value;
                    setProfile({ ...profile, education: updatedEdu });
                  }}
                  placeholder="e.g. 8.4 CGPA or 82%"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: CAREER TARGET */}
        {activeTab === 'target' && (
          <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-6 animate-fade-in max-w-3xl">
            <div>
              <h2 className="text-base font-bold text-white">Section C: Career Target (Most Important)</h2>
              <p className="text-xs text-[#9AA4B2] mt-1">
                Directs AI question generation, company calibration, and rubrics.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Primary Target Role</label>
              <input
                type="text"
                value={profile.careerTarget.primaryTargetRole}
                onChange={(e) => {
                  const val = e.target.value;
                  setProfile({
                    ...profile,
                    careerTarget: {
                      ...profile.careerTarget,
                      primaryTargetRole: val,
                      targetRoles: [val, ...profile.careerTarget.targetRoles.filter(r => r !== val)]
                    }
                  });
                }}
                placeholder="e.g. Full Stack Developer, Data Analyst, Financial Analyst"
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#C5F36B]"
              />
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {['Software Engineer', 'Data Analyst', 'Frontend Developer', 'Backend Developer', 'Financial Analyst', 'Management Trainee', 'HR Executive'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setProfile({
                        ...profile,
                        careerTarget: { ...profile.careerTarget, primaryTargetRole: r }
                      });
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                      profile.careerTarget.primaryTargetRole === r
                        ? 'bg-[#C5F36B]/20 text-[#C5F36B] border-[#C5F36B]/40 font-bold'
                        : 'bg-white/[0.02] text-[#9AA4B2] border-white/[0.06] hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Target Industry</label>
                <input
                  type="text"
                  value={profile.careerTarget.targetIndustry}
                  onChange={(e) => {
                    setProfile({
                      ...profile,
                      careerTarget: { ...profile.careerTarget, targetIndustry: e.target.value }
                    });
                  }}
                  placeholder="e.g. Technology, FinTech, E-Commerce, Consulting"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Preparation Timeline</label>
                <select
                  value={profile.careerTarget.timeline}
                  onChange={(e) => {
                    setProfile({
                      ...profile,
                      careerTarget: { ...profile.careerTarget, timeline: e.target.value as PreparationTimeline }
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                >
                  <option value="1 week">1 Week (Urgent Sprint Mode)</option>
                  <option value="1 month">1 Month (Placement Season Readiness)</option>
                  <option value="exploring">Exploring / Continuous Improvement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Company Type Preference</label>
                <select
                  value={profile.careerTarget.companyTypePreference}
                  onChange={(e) => {
                    setProfile({
                      ...profile,
                      careerTarget: { ...profile.careerTarget, companyTypePreference: e.target.value as CompanyTypePreference }
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                >
                  <option value="Startup">High-Growth Startup</option>
                  <option value="MNC">Global MNC / Enterprise</option>
                  <option value="PSU-Government">PSU / Government Trainee</option>
                  <option value="Not sure">Not sure / Open to all</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Interview Round Focus</label>
                <select
                  value={profile.careerTarget.interviewTypeFocus}
                  onChange={(e) => {
                    setProfile({
                      ...profile,
                      careerTarget: { ...profile.careerTarget, interviewTypeFocus: e.target.value as InterviewTypeFocus }
                    });
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                >
                  <option value="Technical">Technical & Coding / Architecture</option>
                  <option value="HR">HR & Cultural Fit / Situational</option>
                  <option value="Domain">Core Domain & Coursework Viva</option>
                  <option value="Group discussion">Group Discussion / Case Analysis</option>
                  <option value="Mixed">Mixed Comprehensive Mock</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SKILLS & EXPERIENCE */}
        {activeTab === 'skills_exp' && (
          <div className="space-y-6 animate-fade-in max-w-4xl">
            {/* Skills Card */}
            <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Skills Matrix with Self-Ratings</h3>
                  <p className="text-xs text-[#9AA4B2] mt-0.5">
                    Click any level tag to calibrate your comfort rating (Beginner, Intermediate, Advanced, Expert).
                  </p>
                </div>
                <span className="text-xs text-[#C5F36B] font-bold">{profile.skills.length} Skills</span>
              </div>

              {/* Add Skill Row */}
              <div className="flex flex-wrap sm:flex-nowrap gap-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Add skill (e.g. React, Financial Modeling, SQL, Python)"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                  className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-xs text-white"
                >
                  <option value="Technical">Technical</option>
                  <option value="Domain">Domain</option>
                  <option value="Communication">Communication</option>
                  <option value="Analytical">Analytical</option>
                  <option value="Management">Management</option>
                </select>
                <select
                  value={newSkillRating}
                  onChange={(e) => setNewSkillRating(e.target.value as SkillProficiency)}
                  className="px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-xs text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#d6ff79] text-[#080B11] shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Skill Badges List */}
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white group"
                  >
                    <span>{skill.name}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const ratings: SkillProficiency[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
                        const nextIdx = (ratings.indexOf(skill.selfRating) + 1) % ratings.length;
                        const nextRating = ratings[nextIdx];
                        const updatedSkills = profile.skills.map(s => s.name === skill.name ? { ...s, selfRating: nextRating } : s);
                        setProfile({ ...profile, skills: updatedSkills });
                        handleSave({ ...profile, skills: updatedSkills });
                      }}
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/[0.08] text-[#C5F36B] hover:bg-white/[0.14] cursor-pointer"
                    >
                      {skill.selfRating}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.name)}
                      className="text-[#9AA4B2] hover:text-rose-400 cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience & Projects Card */}
            <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Experience, Projects & Leadership</h3>
                  <p className="text-xs text-[#9AA4B2] mt-0.5">
                    Add academic capstone projects, internships, club leadership, or certifications.
                  </p>
                </div>
                <span className="text-xs text-[#C5F36B] font-bold">{profile.experience.length} Entries</span>
              </div>

              {/* Add Entry Form */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      type="text"
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      placeholder="Title (e.g. Distributed Cache Implementation, Tally GST Audit)"
                      className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white"
                    />
                  </div>
                  <div>
                    <select
                      value={expCategory}
                      onChange={(e) => setExpCategory(e.target.value as ExperienceCategory)}
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-xs text-white"
                    >
                      <option value="project">Academic / Personal Project</option>
                      <option value="internship">Internship</option>
                      <option value="work_experience">Work Experience</option>
                      <option value="leadership">College / Club Leadership</option>
                      <option value="certification">Certification</option>
                      <option value="achievement">Achievement / Hackathon</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={expOrg}
                    onChange={(e) => setExpOrg(e.target.value)}
                    placeholder="Organization / College / Issuing Body"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white"
                  />
                  <input
                    type="text"
                    value={expTools}
                    onChange={(e) => setExpTools(e.target.value)}
                    placeholder="Tools / Tech (comma separated: Python, Docker, Excel)"
                    className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white"
                  />
                </div>

                <textarea
                  rows={2}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="Key contributions and measurable results (e.g. Architected REST API serving 500 requests/sec)"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white resize-none"
                />

                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.08] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Portfolio</span>
                </button>
              </div>

              {/* Entries List */}
              <div className="space-y-3">
                {profile.experience.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#C5F36B]/10 text-[#C5F36B]">
                          {item.category.replace('_', ' ')}
                        </span>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        {item.organization && <span className="text-xs text-[#9AA4B2]">• {item.organization}</span>}
                      </div>
                      {item.description && <p className="text-xs text-[#9AA4B2] mt-1.5 leading-relaxed">{item.description}</p>}
                      {item.techTools && item.techTools.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.techTools.map(t => (
                            <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.05] text-[#9AA4B2]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(item.id)}
                      className="p-1.5 text-[#9AA4B2] hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: RESUME INTELLIGENCE */}
        {activeTab === 'resume' && (
          <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-6 animate-fade-in max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">Section E: Resume Intelligence</h2>
                <p className="text-xs text-[#9AA4B2] mt-1">
                  Upload multiple resume versions calibrated to your target roles.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('resume')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#C5F36B] text-[#080B11] hover:bg-[#d6ff79] cursor-pointer flex items-center gap-1.5"
              >
                <span>Open Full ATS Scanner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center space-y-3">
              <FileText className="w-10 h-10 text-[#C5F36B] mx-auto" />
              <h3 className="text-sm font-bold text-white">Resume Calibration Engine</h3>
              <p className="text-xs text-[#9AA4B2] max-w-md mx-auto">
                Scan your resume against your target role (<strong>{profile.careerTarget.primaryTargetRole}</strong>) to identify missing keywords and receive customized interview questions.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('resume')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.08] transition-colors cursor-pointer"
              >
                Analyze / Upload Resume
              </button>
            </div>
          </div>
        )}

        {/* TAB: COMMUNICATION BASELINE */}
        {activeTab === 'communication' && (
          <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-6 animate-fade-in max-w-3xl">
            <div>
              <h2 className="text-base font-bold text-white">Section F: Communication Baseline</h2>
              <p className="text-xs text-[#9AA4B2] mt-1">
                Auto-generated metrics derived from your completed speech and typing practice sessions.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                <div className="text-[10px] font-bold text-[#9AA4B2] uppercase">Confidence</div>
                <div className="text-xl font-black text-white mt-1">{profile.communicationBaseline.confidence}%</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                <div className="text-[10px] font-bold text-[#9AA4B2] uppercase">Clarity</div>
                <div className="text-xl font-black text-cyan-400 mt-1">{profile.communicationBaseline.clarity}%</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                <div className="text-[10px] font-bold text-[#9AA4B2] uppercase">Pace</div>
                <div className="text-xl font-black text-[#C5F36B] mt-1 capitalize">{profile.communicationBaseline.pace}</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center">
                <div className="text-[10px] font-bold text-[#9AA4B2] uppercase">STAR Structure</div>
                <div className="text-xl font-black text-emerald-400 mt-1">{profile.communicationBaseline.answerStructureStar}%</div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Candidate Self-Reported Comfort</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.selfReportedComfort?.nervous || false}
                    onChange={(e) => {
                      const updated = {
                        ...profile,
                        selfReportedComfort: { ...profile.selfReportedComfort, nervous: e.target.checked }
                      };
                      setProfile(updated);
                      handleSave(updated);
                    }}
                    className="w-4 h-4 rounded text-[#C5F36B] focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">Experience Interview Nervousness</div>
                    <div className="text-[11px] text-[#9AA4B2]">AI will open with gentle warmups and supportive follow-up scaffolding.</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.selfReportedComfort?.freezesOnTechnical || false}
                    onChange={(e) => {
                      const updated = {
                        ...profile,
                        selfReportedComfort: { ...profile.selfReportedComfort, freezesOnTechnical: e.target.checked }
                      };
                      setProfile(updated);
                      handleSave(updated);
                    }}
                    className="w-4 h-4 rounded text-[#C5F36B] focus:ring-0"
                  />
                  <div>
                    <div className="text-xs font-semibold text-white">Tendency to Freeze on Unexpected Questions</div>
                    <div className="text-[11px] text-[#9AA4B2]">Interviewer will offer hints and breakdown techniques instead of abrupt penalties.</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PREFERENCES & STATUTORY DATA RIGHTS */}
        {activeTab === 'preferences' && (
          <div className="space-y-6 animate-fade-in max-w-3xl">
            {/* Preferences */}
            <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-5">
              <h2 className="text-base font-bold text-white">Section G: Practice Preferences</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Delivery Mode</label>
                  <select
                    value={profile.preferences.deliveryMode}
                    onChange={(e) => {
                      const updated = {
                        ...profile,
                        preferences: { ...profile.preferences, deliveryMode: e.target.value as any }
                      };
                      setProfile(updated);
                      handleSave(updated);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-xs text-white"
                  >
                    <option value="voice">Interactive Voice Interview</option>
                    <option value="text">Text-Only Mode</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#9AA4B2] mb-1.5">Default Difficulty</label>
                  <select
                    value={profile.preferences.difficulty}
                    onChange={(e) => {
                      const updated = {
                        ...profile,
                        preferences: { ...profile.preferences, difficulty: e.target.value as any }
                      };
                      setProfile(updated);
                      handleSave(updated);
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-xs text-white"
                  >
                    <option value="beginner">Beginner (Foundational)</option>
                    <option value="intermediate">Intermediate (Standard Campus Bar)</option>
                    <option value="advanced">Advanced (Product & Tough Questions)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data Portability & Statutory Rights (DPDP Act 2023) */}
            <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#C5F36B]" />
                <h3 className="text-sm font-bold text-white">Candidate Data Portability & Rights</h3>
              </div>
              <p className="text-xs text-[#9AA4B2] leading-relaxed">
                You retain complete ownership over all your academic, professional, and practice records. You can download a portable JSON copy or permanently purge your records.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportData}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.1] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export All My Data (JSON)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirmOpen(true)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All My Data</span>
                </button>
              </div>

              {deleteConfirmOpen && (
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3 mt-4">
                  <div className="text-xs font-bold text-rose-300">Are you sure you want to delete all candidate data?</div>
                  <p className="text-[11px] text-rose-300/80">
                    This will permanently erase your profile, education, skills, session history, and evaluation scores from both local cache and cloud database tables.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDeleteAllData}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
                    >
                      Yes, Permanently Erase
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmOpen(false)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.08] text-[#9AA4B2] hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
