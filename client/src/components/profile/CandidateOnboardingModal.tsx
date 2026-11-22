import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  X
} from 'lucide-react';
import {
  CandidateProfile,
  CurrentStatus,
  EducationLevelType
} from '../../types/candidateProfile';

interface CandidateOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateProfile: CandidateProfile;
  onSaveProfile: (profile: CandidateProfile) => Promise<void>;
  onStartFirstInterview: (role: string) => void;
}

export const CandidateOnboardingModal: React.FC<CandidateOnboardingModalProps> = ({
  isOpen,
  onClose,
  candidateProfile,
  onSaveProfile,
  onStartFirstInterview
}) => {
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus>(candidateProfile.currentStatus || 'Fresher');
  const [educationLevel, setEducationLevel] = useState<EducationLevelType>(candidateProfile.educationLevel || 'UG');
  const [degreeStream, setDegreeStream] = useState<string>(candidateProfile.degreeStream || 'B.Tech Computer Science');
  const [targetRole, setTargetRole] = useState<string>(candidateProfile.targetRole || 'Software Engineer');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      const updated: CandidateProfile = {
        ...candidateProfile,
        currentStatus,
        educationLevel,
        degreeStream: degreeStream.trim() || 'General Degree',
        targetRole: targetRole.trim() || 'Software Engineer',
        profileCompleted: true,
        updatedAt: new Date().toISOString()
      };
      await onSaveProfile(updated);
      onClose();
      onStartFirstInterview(targetRole.trim() || 'Software Engineer');
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 dark:text-[#F5F7FA]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C5F36B]/20 border border-emerald-500/30 dark:border-[#C5F36B]/30 flex items-center justify-center text-emerald-800 dark:text-[#C5F36B]">
              <Sparkles className="w-4 h-4 text-emerald-700 dark:text-[#C5F36B]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">4 Quick Questions to Personalize Your AI Mock</h2>
              <p className="text-[11px] text-slate-600 dark:text-[#9AA4B2] font-medium">Takes 15 seconds • You can start mock interviews immediately</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] text-slate-600 hover:text-slate-900 dark:text-[#9AA4B2] dark:hover:text-white dark:hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The 4 Questions */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Question 1: I am a */}
          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-white mb-2">
              1. I am a:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Student', 'Fresher', 'Job seeker', 'Working professional'] as CurrentStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCurrentStatus(st)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition-all cursor-pointer flex items-center justify-between ${
                    currentStatus === st
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-200 font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-[#9AA4B2] hover:bg-slate-200 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <span>{st}</span>
                  {currentStatus === st && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Education Level */}
          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-white mb-2">
              2. Education Level:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Diploma', label: 'Diploma' },
                { id: 'UG', label: 'UG / Degree' },
                { id: 'PG', label: 'PG / Masters' },
                { id: 'Professional', label: 'Professional' }
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setEducationLevel(lvl.id as EducationLevelType)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                    educationLevel === lvl.id
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-600 dark:border-blue-500 text-blue-900 dark:text-blue-200 font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-[#9AA4B2] hover:bg-slate-200 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Stream or Degree */}
          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-white mb-1.5">
              3. Stream or Degree:
            </label>
            <input
              type="text"
              value={degreeStream}
              onChange={(e) => setDegreeStream(e.target.value)}
              placeholder="e.g. B.Com, B.Tech CSE, MBA, BCA, B.Sc"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border-2 border-slate-200 dark:border-white/[0.08] text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['B.Tech CSE', 'B.Com', 'BCA', 'BBA', 'MBA', 'B.Sc Physics', 'Mechanical Engg'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setDegreeStream(chip)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer font-bold ${
                    degreeStream === chip
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-white/[0.02] text-slate-700 dark:text-[#9AA4B2] border-slate-200 dark:border-white/[0.06] hover:bg-slate-200 dark:hover:text-white'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Question 4: Target Role */}
          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-white mb-1.5">
              4. Target Role:
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Software Engineer, Financial Analyst, HR Associate"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/[0.03] border-2 border-slate-200 dark:border-white/[0.08] text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['Software Engineer', 'Data Analyst', 'Frontend Dev', 'Financial Analyst', 'HR Executive', 'Management Trainee'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setTargetRole(role)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer font-bold ${
                    targetRole === role
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

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between bg-slate-50 dark:bg-white/[0.01]">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-slate-600 hover:text-slate-900 dark:text-[#9AA4B2] dark:hover:text-white font-semibold transition-colors cursor-pointer"
          >
            Skip for now &gt;
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleFinish}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#d6ff79] text-[#080B11] shadow-lg shadow-[#C5F36B]/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>{isSaving ? 'Saving...' : 'Start Practicing Now'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CandidateOnboardingModal;
