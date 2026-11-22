import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Upload,
  Clock,
  Briefcase,
  GraduationCap,
  Target,
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import {
  CandidateProfile,
  CurrentStatus,
  EducationLevelType,
  InterviewTypeFocus,
  CompanyTypePreference,
  PreparationTimeline
} from '../../types';

interface CandidateOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateProfile: CandidateProfile;
  onSaveProfile: (profile: CandidateProfile) => Promise<void>;
  onStartFirstInterview: (role: string, type: InterviewTypeFocus) => void;
}

export const CandidateOnboardingModal: React.FC<CandidateOnboardingModalProps> = ({
  isOpen,
  onClose,
  candidateProfile,
  onSaveProfile,
  onStartFirstInterview
}) => {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form state
  const [currentStatus, setCurrentStatus] = useState<CurrentStatus>(candidateProfile.currentStatus || 'Student');
  const [educationLevel, setEducationLevel] = useState<EducationLevelType>(candidateProfile.education[0]?.level || 'undergraduate');
  const [stream, setStream] = useState<string>(candidateProfile.education[0]?.stream || 'Engineering & Technology');
  const [degree, setDegree] = useState<string>(candidateProfile.education[0]?.degree || 'Bachelor of Technology');
  const [institution, setInstitution] = useState<string>(candidateProfile.education[0]?.institution || '');
  
  const [targetRole, setTargetRole] = useState<string>(candidateProfile.careerTarget.primaryTargetRole || 'Software Engineer');
  const [targetIndustry, setTargetIndustry] = useState<string>(candidateProfile.careerTarget.targetIndustry || 'Technology');
  const [interviewTypeFocus, setInterviewTypeFocus] = useState<InterviewTypeFocus>(candidateProfile.careerTarget.interviewTypeFocus || 'Technical');
  const [timeline, setTimeline] = useState<PreparationTimeline>(candidateProfile.careerTarget.timeline || '1 month');

  const [resumeUploaded, setResumeUploaded] = useState<boolean>(false);
  const [resumeFileName, setResumeFileName] = useState<string>('');

  if (!isOpen) return null;

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (step === 3) {
      // Save progressive profile
      setIsSubmitting(true);
      try {
        const updatedProfile: CandidateProfile = {
          ...candidateProfile,
          currentStatus,
          careerTarget: {
            ...candidateProfile.careerTarget,
            primaryTargetRole: targetRole,
            targetRoles: [targetRole],
            targetIndustry,
            interviewTypeFocus,
            timeline
          },
          education: [
            {
              id: candidateProfile.education[0]?.id || `edu-${Date.now()}`,
              userId: candidateProfile.id,
              level: educationLevel,
              degree,
              stream,
              institution,
              yearOfStudy: 'Final Year',
              graduationYear: String(new Date().getFullYear()),
              keySubjects: [],
              isPrimary: true
            }
          ],
          profileCompleted: true,
          updatedAt: new Date().toISOString()
        };

        await onSaveProfile(updatedProfile);
        setStep(4);
      } catch (err) {
        console.error('Onboarding save error:', err);
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 4) {
      // Launch 5-minute warm-up sprint
      onClose();
      onStartFirstInterview(targetRole, interviewTypeFocus);
    }
  };

  const handleResumeSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFileName(file.name);
      setResumeUploaded(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-[#0B0F19] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header Progress */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C5F36B]/10 text-[#C5F36B] border border-[#C5F36B]/20">
                Step {step} of 4
              </span>
              <span className="text-xs text-[#9AA4B2]">Fast Track Onboarding</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {step === 1 && "Academic Background & Status"}
              {step === 2 && "Target Career Role & Focus"}
              {step === 3 && "Resume Intelligence (Optional)"}
              {step === 4 && "Ready for Your 5-Minute Warmup Sprint!"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.04] text-[#9AA4B2] hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* STEP 1: Status & Education */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider mb-2">
                  Current Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Student', 'Fresher', 'Job seeker', 'Working professional'] as CurrentStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setCurrentStatus(st)}
                      className={`p-3 rounded-2xl text-xs font-medium border text-left transition-all cursor-pointer flex items-center justify-between ${
                        currentStatus === st
                          ? 'bg-[#C5F36B]/10 border-[#C5F36B] text-white shadow-sm shadow-[#C5F36B]/10'
                          : 'bg-white/[0.02] border-white/[0.06] text-[#9AA4B2] hover:bg-white/[0.05]'
                      }`}
                    >
                      <span>{st}</span>
                      {currentStatus === st && <CheckCircle2 className="w-3.5 h-3.5 text-[#C5F36B]" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider mb-2">
                  Education Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'undergraduate', label: 'Undergraduate (UG / B.Tech / B.Com / B.Sc)' },
                    { id: 'postgraduate', label: 'Postgraduate (PG / M.Tech / MBA / MCA)' },
                    { id: 'diploma', label: 'Diploma / Polytechnic' },
                    { id: 'professional', label: 'Professional (CA / CS / CMA / Law)' }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setEducationLevel(lvl.id as EducationLevelType)}
                      className={`p-3 rounded-2xl text-xs font-medium border text-left transition-all cursor-pointer flex items-center justify-between ${
                        educationLevel === lvl.id
                          ? 'bg-[#C5F36B]/10 border-[#C5F36B] text-white shadow-sm shadow-[#C5F36B]/10'
                          : 'bg-white/[0.02] border-white/[0.06] text-[#9AA4B2] hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="line-clamp-2">{lvl.label}</span>
                      {educationLevel === lvl.id && <CheckCircle2 className="w-3.5 h-3.5 text-[#C5F36B] shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#9AA4B2] mb-1.5">
                    Degree / Course Title
                  </label>
                  <input
                    type="text"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science, B.Com, BBA"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9AA4B2] mb-1.5">
                    Academic Stream
                  </label>
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B] transition-colors"
                  >
                    <option value="Engineering & Technology">Engineering & Technology</option>
                    <option value="Commerce & Accounting">Commerce & Accounting</option>
                    <option value="Business & Management">Business & Management</option>
                    <option value="Computer Applications (BCA/MCA)">Computer Applications (BCA/MCA)</option>
                    <option value="Pure & Life Sciences">Pure & Life Sciences</option>
                    <option value="Arts, Humanities & Social Sciences">Arts, Humanities & Social Sciences</option>
                    <option value="Healthcare & Nursing">Healthcare & Nursing</option>
                    <option value="Law & Legal Studies">Law & Legal Studies</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9AA4B2] mb-1.5">
                  Institution / College (Optional)
                </label>
                <input
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. University College of Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B] transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Career Target */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider mb-2">
                  Target Job Role (Primary Focus)
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer, Financial Analyst, HR Associate"
                  className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-[#C5F36B] transition-colors"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['Software Engineer', 'Data Analyst', 'Frontend Developer', 'Financial Analyst', 'Product Associate', 'HR Executive'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setTargetRole(r)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        targetRole === r
                          ? 'bg-[#C5F36B]/20 text-[#C5F36B] border-[#C5F36B]/40'
                          : 'bg-white/[0.03] text-[#9AA4B2] border-white/[0.06] hover:text-white'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AA4B2] uppercase tracking-wider mb-2">
                  Interview Type Focus
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Technical', 'HR', 'Domain', 'Group discussion', 'Mixed'] as InterviewTypeFocus[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setInterviewTypeFocus(t)}
                      className={`p-3 rounded-2xl text-xs font-medium border text-center transition-all cursor-pointer ${
                        interviewTypeFocus === t
                          ? 'bg-[#C5F36B]/10 border-[#C5F36B] text-white shadow-sm shadow-[#C5F36B]/10'
                          : 'bg-white/[0.02] border-white/[0.06] text-[#9AA4B2] hover:bg-white/[0.05]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#9AA4B2] mb-1.5">
                    Target Industry
                  </label>
                  <input
                    type="text"
                    value={targetIndustry}
                    onChange={(e) => setTargetIndustry(e.target.value)}
                    placeholder="e.g. Technology, Banking, Healthcare"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#9AA4B2] mb-1.5">
                    Interview Prep Timeline
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value as PreparationTimeline)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0F19] border border-white/[0.08] text-xs text-white focus:outline-none focus:border-[#C5F36B]"
                  >
                    <option value="1 week">1 Week (Urgent Sprint)</option>
                    <option value="1 month">1 Month (Placement Season)</option>
                    <option value="exploring">Exploring / Continuous Practice</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Resume Upload (Optional) */}
          {step === 3 && (
            <div className="space-y-4 text-center">
              <div className="p-8 border-2 border-dashed border-white/[0.12] hover:border-[#C5F36B]/50 rounded-3xl bg-white/[0.01] transition-all">
                <FileText className="w-12 h-12 text-[#C5F36B] mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white">Upload Your Resume to Auto-Fill Profile</h3>
                <p className="text-xs text-[#9AA4B2] mt-1 max-w-sm mx-auto">
                  Our privacy-first ATS scanner extracts your projects, coursework, and skills to personalize questions.
                </p>

                {resumeUploaded ? (
                  <div className="mt-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-2 text-xs text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{resumeFileName} parsed successfully!</span>
                  </div>
                ) : (
                  <label className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.1] transition-all cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choose PDF or DOCX Resume</span>
                    <input type="file" accept=".pdf,.docx,.txt" onChange={handleResumeSimulated} className="hidden" />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-[#9AA4B2] pt-2">
                <span>Don't have a resume ready?</span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="text-[#C5F36B] hover:underline font-semibold cursor-pointer"
                >
                  Skip for now &gt;
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: First 5-Minute Warmup Sprint */}
          {step === 4 && (
            <div className="space-y-4 text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-[#C5F36B]/15 border border-[#C5F36B]/30 text-[#C5F36B] flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">Your Adaptive Profile Is Configured!</h3>
              <p className="text-xs text-[#9AA4B2] max-w-md mx-auto leading-relaxed">
                Take a fast <strong>5-minute warmup mock interview</strong> for <strong>{targetRole}</strong>. 
                Your answers will automatically establish your initial <strong>Communication Baseline</strong> (Confidence, Clarity, STAR Structure).
              </p>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-around text-xs text-[#9AA4B2]">
                <div className="text-center">
                  <div className="font-bold text-white">3 Questions</div>
                  <div className="text-[10px]">Short & Focused</div>
                </div>
                <div className="w-px h-6 bg-white/[0.08]" />
                <div className="text-center">
                  <div className="font-bold text-white">5 Minutes</div>
                  <div className="text-[10px]">Instant Star Feedback</div>
                </div>
                <div className="w-px h-6 bg-white/[0.08]" />
                <div className="text-center">
                  <div className="font-bold text-white">Zero Judgment</div>
                  <div className="text-[10px]">Safe Private Coaching</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-6 border-t border-white/[0.06] flex items-center justify-between bg-white/[0.01]">
          {step > 1 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#9AA4B2] hover:text-white transition-colors cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#d6ff79] text-[#080B11] shadow-lg shadow-[#C5F36B]/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <span>{step === 4 ? 'Launch Warmup Sprint' : (step === 3 ? 'Save & Continue' : 'Next Step')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
