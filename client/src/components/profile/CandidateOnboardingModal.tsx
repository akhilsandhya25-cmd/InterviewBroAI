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
} from '../../types';

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
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus>(candidateProfile.currentStatus || 'Student');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0B0F19] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C5F36B]/15 border border-[#C5F36B]/30 flex items-center justify-center text-[#C5F36B]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">4 Quick Questions to Personalize Your AI Mock</h2>
              <p className="text-[11px] text-[#9AA4B2]">Takes 15 seconds • You can start mock interviews immediately</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.04] text-[#9AA4B2] hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The 4 Questions */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Question 1: I am a */}
          <div>
            <label className="block text-xs font-semibold text-white mb-2">
              1. I am a:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Student', 'Fresher', 'Job seeker', 'Working professional'] as CurrentStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setCurrentStatus(st)}
                  className={`p-2.5 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer flex items-center justify-between ${
                    currentStatus === st
                      ? 'bg-[#C5F36B]/15 border-[#C5F36B] text-white font-bold'
                      : 'bg-white/[0.02] border-white/[0.06] text-[#9AA4B2] hover:bg-white/[0.05]'
                  }`}
                >
                  <span>{st}</span>
                  {currentStatus === st && <CheckCircle2 className="w-3.5 h-3.5 text-[#C5F36B]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Education Level */}
          <div>
            <label className="block text-xs font-semibold text-white mb-2">
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
                  className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all cursor-pointer ${
                    educationLevel === lvl.id
                      ? 'bg-[#C5F36B]/15 border-[#C5F36B] text-white font-bold'
                      : 'bg-white/[0.02] border-white/[0.06] text-[#9AA4B2] hover:bg-white/[0.05]'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Stream or Degree */}
          <div>
            <label className="block text-xs font-semibold text-white mb-1.5">
              3. Stream or Degree:
            </label>
            <input
              type="text"
              value={degreeStream}
              onChange={(e) => setDegreeStream(e.target.value)}
              placeholder="e.g. B.Com, B.Tech CSE, MBA, BCA, B.Sc"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['B.Tech CSE', 'B.Com', 'BCA', 'BBA', 'MBA', 'B.Sc Physics', 'Mechanical Engg'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setDegreeStream(chip)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                    degreeStream === chip
                      ? 'bg-[#C5F36B]/20 text-[#C5F36B] border-[#C5F36B]/40 font-bold'
                      : 'bg-white/[0.02] text-[#9AA4B2] border-white/[0.06] hover:text-white'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Question 4: Target Role */}
          <div>
            <label className="block text-xs font-semibold text-white mb-1.5">
              4. Target Role:
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Software Engineer, Financial Analyst, HR Associate"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['Software Engineer', 'Data Analyst', 'Frontend Dev', 'Financial Analyst', 'HR Executive', 'Management Trainee'].map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setTargetRole(role)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                    targetRole === role
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

        {/* Footer */}
        <div className="p-5 border-t border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#9AA4B2] hover:text-white transition-colors cursor-pointer"
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
