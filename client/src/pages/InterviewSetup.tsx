import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Mic,
  FileText,
  Terminal,
  Users,
  GraduationCap,
  ArrowRight,
  Check,
  AlertCircle,
  CheckCircle2,
  Volume2,
  Briefcase,
  Building2,
  Sliders,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';
import { getCompanyTrack } from '../data/companyTracks';
import {
  InterviewConfig,
  ExperienceLevel,
  InterviewType,
  CompanyCategory,
  DifficultyLevel,
  InterviewDeliveryMode
} from '../types';
import { useInterview } from '../context/InterviewContext';
import { useAuth } from '../context/AuthContext';
import {
  testMicrophoneAccess,
  createAudioMeter,
  releaseMediaStream,
  getBrowserVoiceCapabilities,
  MicrophoneErrorInfo,
  BrowserVoiceCapabilities
} from '../services/microphoneService';
import { tts } from '../services/speech';
import { analyticsService } from '../services/analytics';

interface InterviewSetupProps {
  onStart: () => void;
  onNavigate: (route: string) => void;
}

const POPULAR_ROLE_SUGGESTIONS = [
  'Software Engineer',
  'Frontend Developer (React)',
  'Backend Developer (Python/Node)',
  'Data Analyst',
  'Financial Analyst',
  'Business Analyst',
  'Marketing Specialist',
  'HR Executive',
  'Academic Viva / Project'
];

const POPULAR_COMPANY_SUGGESTIONS = [
  'Google',
  'Amazon',
  'TCS / Infosys',
  'Tech Startup',
  'Deloitte / Consulting',
  'University Examination Board'
];

type RoundFocusKey = 'mixed' | 'technical' | 'hr' | 'academic';

interface RoundFocusOption {
  id: RoundFocusKey;
  label: string;
  badge: string;
  desc: string;
  icon: React.ReactNode;
}

const ROUND_OPTIONS: RoundFocusOption[] = [
  {
    id: 'mixed',
    label: 'All-Round Comprehensive',
    badge: 'Recommended',
    desc: 'Balanced mix of technical knowledge, situational judgment, and communication',
    icon: <Sparkles className="w-4 h-4 text-[#C5F36B] dark:text-[#C5F36B]" />
  },
  {
    id: 'technical',
    label: 'Technical & Domain Deep-Dive',
    badge: 'Core Skills',
    desc: 'Domain problem solving, system architecture, core concepts & real-world tasks',
    icon: <Terminal className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
  },
  {
    id: 'hr',
    label: 'HR & Behavioral',
    badge: 'STAR Method',
    desc: 'Situational experiences, teamwork, cultural fit, strengths and career vision',
    icon: <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
  },
  {
    id: 'academic',
    label: 'Academic Viva & Projects',
    badge: 'College / Degree',
    desc: 'Degree syllabus topics, final-year project defense, and theoretical fundamentals',
    icon: <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
  }
];

export const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStart, onNavigate }) => {
  const { user, quota, candidateProfile } = useAuth();
  const { startNewSession } = useInterview();

  useEffect(() => {
    tts.warmup();
  }, []);

  // Target Role & Company
  const rawDefaultRole = candidateProfile?.targetRole || user?.target_role || user?.role_target;
  const defaultRole = (rawDefaultRole && !/mpc|entrance\s*examination|jee\s*\/\s*neet/i.test(rawDefaultRole))
    ? rawDefaultRole
    : 'Software Engineer';
  const [role, setRole] = useState<string>(defaultRole);
  const [company, setCompany] = useState<string>('Google');

  // Round Focus & Format
  const [roundFocus, setRoundFocus] = useState<RoundFocusKey>('mixed');
  const [mode, setMode] = useState<InterviewDeliveryMode>('voice_only');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    () => user?.experience_level || (candidateProfile?.currentStatus === 'Student' ? 'student' : 'fresher')
  );

  // Settings
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [language, setLanguage] = useState<string>(candidateProfile?.preferredLanguage || 'English');

  // Optional Context
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>(() => {
    try {
      return sessionStorage.getItem('interviewbro_active_resume_text') || candidateProfile?.resumeText || '';
    } catch {
      return candidateProfile?.resumeText || '';
    }
  });

  // State & Loading
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [showQuotaModal, setShowQuotaModal] = useState<boolean>(false);

  // Pre-interview Microphone Test
  const [voiceCapabilities] = useState<BrowserVoiceCapabilities>(() => getBrowserVoiceCapabilities());
  const [isTestingMic, setIsTestingMic] = useState<boolean>(false);
  const [testAudioLevel, setTestAudioLevel] = useState<number>(0);
  const [testMicPassed, setTestMicPassed] = useState<boolean>(false);
  const [testMicError, setTestMicError] = useState<MicrophoneErrorInfo | null>(null);
  const testStreamRef = useRef<MediaStream | null>(null);
  const testMeterRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    return () => {
      if (testMeterRef.current) testMeterRef.current.stop();
      if (testStreamRef.current) releaseMediaStream(testStreamRef.current);
    };
  }, []);

  const stopMicTest = () => {
    if (testMeterRef.current) {
      testMeterRef.current.stop();
      testMeterRef.current = null;
    }
    if (testStreamRef.current) {
      releaseMediaStream(testStreamRef.current);
      testStreamRef.current = null;
    }
    setIsTestingMic(false);
    setTestAudioLevel(0);
  };

  const startMicTest = async () => {
    stopMicTest();
    setTestMicError(null);
    setTestMicPassed(false);
    setIsTestingMic(true);

    const result = await testMicrophoneAccess();
    if (result.success && result.stream) {
      testStreamRef.current = result.stream;
      setTestMicPassed(true);
      const meter = createAudioMeter(result.stream, (volume) => {
        setTestAudioLevel(volume);
      });
      testMeterRef.current = meter;
    } else {
      setIsTestingMic(false);
      setTestMicError(result.error || null);
    }
  };

  // Matched company track if available
  const matchedTrack = getCompanyTrack(company.trim());
  const companyCategory: CompanyCategory = (matchedTrack?.category as CompanyCategory) || 'Product Unicorn';

  const handleStartInterview = async () => {
    stopMicTest();
    setStartError(null);

    const isAcademic = roundFocus === 'academic';
    const effectiveInterviewType: InterviewType =
      roundFocus === 'academic' ? 'technical' : (roundFocus === 'hr' ? 'hr' : (roundFocus === 'technical' ? 'technical' : 'mixed'));

    const effectiveRole = role.trim() || 'Software Engineer';
    const effectiveCompany = company.trim() || 'Top Tech Employer';

    const config: InterviewConfig = {
      role: effectiveRole,
      experienceLevel,
      interviewType: effectiveInterviewType,
      companyName: effectiveCompany,
      companyCategory: isAcademic ? 'Academic Preparation' : companyCategory,
      difficulty,
      durationMinutes,
      questionCount,
      language,
      mode,
      jobDescription: jobDescription.trim() || undefined,
      resumeText: resumeText.trim() || candidateProfile?.resumeText || (user as any)?.resume_text || undefined,
      resumeFileName: candidateProfile?.resumeFileName || (user as any)?.resume_file_name || undefined,
      companyTrack: isAcademic ? undefined : (matchedTrack || undefined),

      // Profile context & stream metadata
      isAcademic,
      educationLevel: candidateProfile?.educationLevel || (user as any)?.education_level || 'UG',
      academicStream: candidateProfile?.degreeStream || (user as any)?.degree_stream || undefined,
      degreeCourse: candidateProfile?.degreeStream || (user as any)?.degree_stream || effectiveRole,
      candidateProfile: candidateProfile || undefined
    };

    setIsStartingSession(true);
    try {
      await startNewSession(config);
      try {
        sessionStorage.removeItem('interviewbro_active_resume_text');
      } catch {
        // Ignore storage errors
      }
      onStart();
    } catch (err: any) {
      if (err.code === 'QUOTA_EXCEEDED' || err.status === 402) {
        analyticsService.trackQuotaHit({ context: 'setup_api_rejected' });
        setShowQuotaModal(true);
      } else if (err.code === 'RATE_LIMIT_EXCEEDED' || err.status === 429) {
        setStartError(err.message || 'Rate limit reached. Please wait a moment before trying again.');
      } else if (err.code === 'UNAUTHORIZED' || err.status === 401) {
        setStartError('Please sign in to start your AI mock interview session.');
      } else {
        setStartError(err.message || 'Failed to start interview session. Please check your network connection.');
      }
    } finally {
      setIsStartingSession(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6">
      {/* Header (Fully visible & responsive in both light & dark themes) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-slate-200 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#C5F36B]/20 text-emerald-800 dark:text-[#C5F36B] border border-emerald-500/30 dark:border-[#C5F36B]/30 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-700 dark:text-[#C5F36B]" />
              <span>AI Interview Studio</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-[#F5F7FA] tracking-tight">
            Configure Your Mock Interview
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-[#9AA4B2] mt-0.5 font-medium">
            Select your target role and company. Practice begins in seconds.
          </p>
        </div>

        <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-700 dark:text-[#9AA4B2]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Allowance: <strong className="text-emerald-700 dark:text-[#C5F36B] font-extrabold">Unlimited Practice</strong>
          </span>
        </div>
      </div>

      {/* CARD 1: ROLE & COMPANY (Primary Target) */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 sm:space-y-5">
        {/* Target Role */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#9AA4B2] flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-[#C5F36B]" />
              <span>1. Target Job Role or Domain</span>
            </label>
            {candidateProfile?.degreeStream && (
              <span className="text-[11px] text-slate-600 dark:text-[#9AA4B2]">
                Aligned with <strong className="text-slate-900 dark:text-white font-semibold">{candidateProfile.degreeStream}</strong>
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {POPULAR_ROLE_SUGGESTIONS.map((r) => {
              const isSelected = role.toLowerCase() === r.toLowerCase();
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`px-3 py-1.5 min-h-[34px] rounded-xl text-xs font-semibold border transition-all touch-manipulation flex items-center ${
                    isSelected
                      ? 'bg-[#C5F36B] border-[#C5F36B] text-[#080B11] font-bold shadow-md shadow-[#C5F36B]/20'
                      : 'bg-slate-100 dark:bg-[#121826] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-[#9AA4B2] hover:bg-slate-200 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Or type custom role (e.g. Flutter Developer, Cloud Engineer, Tax Associate)..."
            className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] text-base sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#9AA4B2]/50 focus:outline-none focus:border-[#C5F36B] transition-colors touch-manipulation"
          />
        </div>

        {/* Target Company or Exam Board */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center justify-between flex-wrap gap-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#9AA4B2] flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>2. Target Company or Pattern</span>
            </label>
            <span className="text-[11px] text-slate-500 dark:text-[#9AA4B2]">Adapts question difficulty & style</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {POPULAR_COMPANY_SUGGESTIONS.map((c) => {
              const isSelected = company.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCompany(c)}
                  className={`px-3 py-1.5 min-h-[34px] rounded-xl text-xs font-semibold border transition-all touch-manipulation flex items-center ${
                    isSelected
                      ? 'bg-[#C5F36B] border-[#C5F36B] text-[#080B11] font-bold shadow-md shadow-[#C5F36B]/20'
                      : 'bg-slate-100 dark:bg-[#121826] border-slate-200 dark:border-white/[0.06] text-slate-700 dark:text-[#9AA4B2] hover:bg-slate-200 dark:hover:bg-white/[0.05] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>

          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Or enter specific employer (e.g. Microsoft, Flipkart, Swiggy, TCS Ninja, AIIMS)..."
            className="w-full px-3.5 py-2.5 min-h-[44px] rounded-xl bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] text-base sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#9AA4B2]/50 focus:outline-none focus:border-[#C5F36B] transition-colors touch-manipulation"
          />
        </div>
      </div>

      {/* CARD 2: ROUND FOCUS & DELIVERY MODE */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 sm:space-y-5">
        {/* Round Focus Options */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#9AA4B2] flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>3. Interview Round Focus</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ROUND_OPTIONS.map((opt) => {
              const isSelected = roundFocus === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setRoundFocus(opt.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-500/10 dark:bg-[#C5F36B]/10 border-emerald-500 dark:border-[#C5F36B] shadow-sm ring-1 ring-emerald-500 dark:ring-[#C5F36B]'
                      : 'bg-slate-50 dark:bg-[#121826] border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.15]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {opt.icon}
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{opt.label}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-emerald-600 dark:bg-[#C5F36B] text-white dark:text-[#080B11]'
                          : 'bg-slate-200 dark:bg-white/[0.05] text-slate-700 dark:text-[#9AA4B2]'
                      }`}>
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-[#9AA4B2] leading-snug">{opt.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="mt-2 pt-2 border-t border-emerald-500/20 dark:border-[#C5F36B]/20 flex items-center justify-end gap-1 text-[11px] text-emerald-700 dark:text-[#C5F36B] font-bold">
                      <Check className="w-3 h-3" />
                      <span>Active Selection</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Practice Mode (Voice vs Text) */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#9AA4B2] flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              <span>4. Practice Delivery Format</span>
            </label>
            <span className="text-[11px] text-slate-500 dark:text-[#9AA4B2]">Interactive verbal or silent keyboard</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Interactive Voice Mode */}
            <div
              onClick={() => {
                setMode('voice_only');
                setTestMicError(null);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                mode === 'voice_only'
                  ? 'bg-emerald-500/10 dark:bg-[#C5F36B]/10 border-emerald-500 dark:border-[#C5F36B] ring-1 ring-emerald-500 dark:ring-[#C5F36B]'
                  : 'bg-slate-50 dark:bg-[#121826] border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.15]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                    <Mic className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Interactive Voice</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold">
                        Popular
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#9AA4B2]">Spoken Q&A with live transcription</div>
                  </div>
                </div>
                {mode === 'voice_only' && <Check className="w-4 h-4 text-emerald-600 dark:text-[#C5F36B]" />}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-[#9AA4B2] mt-2 leading-relaxed">
                Interviewer reads questions aloud. You speak naturally to simulate realistic verbal interviews.
              </p>

              {/* Inline Quick Mic Test */}
              {mode === 'voice_only' && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between gap-2">
                  {isTestingMic ? (
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-black/40 overflow-hidden border border-slate-300 dark:border-white/[0.06]">
                        <div
                          className="h-full bg-emerald-500 dark:bg-[#C5F36B] transition-all duration-75"
                          style={{ width: `${Math.max(testAudioLevel, 8)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-[#C5F36B] font-bold">{testAudioLevel}%</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          stopMicTest();
                        }}
                        className="text-[10px] text-rose-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded bg-rose-500/15 hover:bg-rose-500/25"
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-[10px] text-slate-600 dark:text-[#9AA4B2] flex items-center gap-1">
                        {testMicPassed ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Mic Verified
                          </span>
                        ) : (
                          'Microphone ready'
                        )}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          startMicTest();
                        }}
                        className="text-[10px] font-bold text-slate-700 dark:text-white px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-white/[0.06] hover:bg-slate-300 dark:hover:bg-white/[0.12] flex items-center gap-1 transition-colors"
                      >
                        <Volume2 className="w-3 h-3 text-emerald-600 dark:text-[#C5F36B]" />
                        <span>Quick Mic Test</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Text Mode */}
            <div
              onClick={() => {
                setMode('text_only');
                stopMicTest();
                setTestMicError(null);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                mode === 'text_only'
                  ? 'bg-emerald-500/10 dark:bg-[#C5F36B]/10 border-emerald-500 dark:border-[#C5F36B] ring-1 ring-emerald-500 dark:ring-[#C5F36B]'
                  : 'bg-slate-50 dark:bg-[#121826] border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.15]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>Text-Based Mode</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 font-bold">
                        Silent
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-[#9AA4B2]">No mic required • Type answers</div>
                  </div>
                </div>
                {mode === 'text_only' && <Check className="w-4 h-4 text-emerald-600 dark:text-[#C5F36B]" />}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-[#9AA4B2] mt-2 leading-relaxed">
                Read questions on-screen and type answers. Ideal for libraries, quiet rooms, or non-mic devices.
              </p>
            </div>
          </div>

          {testMicError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{testMicError.message || 'Microphone access denied.'}</span>
              </div>
              <button
                type="button"
                onClick={() => setMode('text_only')}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
              >
                Use Text Mode Instead
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CARD 3: QUICK PARAMETERS & OPTIONAL RESUME/JD */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 sm:space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-[#9AA4B2] flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-[#C5F36B]" />
            <span>5. Session Parameters</span>
          </label>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-blue-600 dark:text-[#C5F36B] hover:underline font-bold flex items-center gap-1 py-1 touch-manipulation"
          >
            <span>{showAdvanced ? 'Hide Custom Inputs' : '+ Add Job Description or Resume'}</span>
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Difficulty */}
          <div>
            <label className="block text-[11px] text-slate-600 dark:text-[#9AA4B2] mb-1 font-semibold">Difficulty</label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#121826] border border-slate-200 dark:border-white/[0.06]">
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 sm:py-1.5 text-xs sm:text-[11px] font-bold rounded-lg capitalize transition-all touch-manipulation min-h-[36px] flex items-center justify-center ${
                    difficulty === d
                      ? 'bg-[#C5F36B] text-[#080B11] shadow-sm'
                      : 'text-slate-600 dark:text-[#9AA4B2] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-[11px] text-slate-600 dark:text-[#9AA4B2] mb-1 font-semibold">Questions</label>
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#121826] border border-slate-200 dark:border-white/[0.06]">
              {[
                { count: 3, label: '3 Qs (10m)' },
                { count: 5, label: '5 Qs (20m)' },
                { count: 8, label: '8 Qs (30m)' }
              ].map(({ count, label }) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => {
                    setQuestionCount(count);
                    setDurationMinutes(count === 3 ? 10 : count === 5 ? 20 : 30);
                  }}
                  className={`py-2 sm:py-1.5 text-xs sm:text-[11px] font-bold rounded-lg transition-all touch-manipulation min-h-[36px] flex items-center justify-center ${
                    questionCount === count
                      ? 'bg-[#C5F36B] text-[#080B11] shadow-sm'
                      : 'text-slate-600 dark:text-[#9AA4B2] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-[11px] text-slate-600 dark:text-[#9AA4B2] mb-1 font-semibold">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 min-h-[44px] rounded-xl bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-white/[0.06] text-base sm:text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#C5F36B] font-medium touch-manipulation"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Hinglish">Hinglish</option>
              <option value="Telugu">Telugu</option>
              <option value="Tamil">Tamil</option>
            </select>
          </div>
        </div>

        {/* Collapsible JD and Resume Context */}
        {showAdvanced && (
          <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-white mb-1">
                Target Job Description (Optional)
              </label>
              <textarea
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the key responsibilities or skills from a job posting to generate exact interview questions..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] text-base sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#9AA4B2]/50 focus:outline-none focus:border-[#C5F36B] touch-manipulation"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800 dark:text-white">
                  Resume Summary / Key Projects (Optional)
                </label>
                {resumeText && (
                  <button
                    type="button"
                    onClick={() => setResumeText('')}
                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-bold py-1 touch-manipulation"
                  >
                    Clear
                  </button>
                )}
              </div>
              <textarea
                rows={3}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your key projects, tech stack, or achievements so the AI can ask you direct resume questions..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] text-base sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#9AA4B2]/50 focus:outline-none focus:border-[#C5F36B] touch-manipulation"
              />
            </div>
          </div>
        )}

        {/* Sync Indicator */}
        <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-600 dark:text-[#9AA4B2] font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            Candidate profile & skills automatically personalized for this interview.
          </span>
        </div>
      </div>

      {/* Error Banner */}
      {startError && (
        <div role="alert" className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-medium">{startError}</span>
          </div>
          <button
            type="button"
            onClick={() => setStartError(null)}
            className="text-[11px] underline text-rose-700 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-200 font-bold py-1 touch-manipulation"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* LAUNCH ACTION BAR (Sticky & full-width on mobile) */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xl">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-[#9AA4B2] font-bold">
            Session Configuration
          </div>
          <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-0.5 truncate">
            {company} • {role}
          </div>
          <div className="text-xs text-slate-600 dark:text-[#9AA4B2] mt-0.5 flex flex-wrap items-center gap-1.5 sm:gap-2 font-medium">
            <span className="capitalize">{roundFocus} Round</span>
            <span>•</span>
            <span>{mode === 'voice_only' ? 'Voice Mode' : 'Text Mode'}</span>
            <span>•</span>
            <span>{questionCount} Questions</span>
            <span>•</span>
            <span className="capitalize">{difficulty}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={isStartingSession}
          onClick={handleStartInterview}
          className="w-full sm:w-auto px-8 py-3.5 min-h-[48px] rounded-xl sm:rounded-2xl bg-[#C5F36B] hover:bg-[#b5e65b] text-[#080B11] font-extrabold text-sm sm:text-base shadow-lg shadow-[#C5F36B]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer touch-manipulation"
        >
          {isStartingSession ? (
            <>
              <div className="w-4 h-4 border-2 border-[#080B11] border-t-transparent rounded-full animate-spin" />
              <span>Preparing AI Interviewer...</span>
            </>
          ) : (
            <>
              <span>Start Mock Interview</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Quota Modal */}
      {showQuotaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.12] space-y-4 text-left shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-[#C5F36B]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Free Practice Limit Reached</h3>
                <p className="text-xs text-slate-500 dark:text-[#9AA4B2]">Upgrade for unlimited practice sessions</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-[#9AA4B2] leading-relaxed">
              You have completed all 5 of your free mock interview sessions. Upgrade to unlimited practice to continue interview preparation without limits.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowQuotaModal(false);
                  onNavigate('pricing');
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#C5F36B] text-[#080B11] font-bold text-xs flex items-center justify-center gap-2"
              >
                <span>Upgrade Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowQuotaModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-700 dark:text-[#9AA4B2] hover:text-slate-900 dark:hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSetup;
