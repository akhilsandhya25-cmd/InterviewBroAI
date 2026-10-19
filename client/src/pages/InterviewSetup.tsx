import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Briefcase,
  BookOpen,
  Sliders,
  ArrowRight,
  Check,
  Video,
  Mic,
  Headphones,
  AlertCircle,
  CheckCircle2,
  Volume2,
  Layers,
  Terminal,
  Users,
  UserCheck,
  Cpu,
  Compass,
  Sparkles,
  FileText
} from 'lucide-react';
import { CompanyBadge } from '../components/CompanyBadge';
import {
  COMPANY_PRESETS,
  POPULAR_ROLES,
  EXPERIENCE_LEVELS,
  INTERVIEW_TYPES
} from '../data/presets';
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

interface InterviewSetupProps {
  onStart: () => void;
  onNavigate: (route: string) => void;
}

export const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStart, onNavigate }) => {
  const { user, quota } = useAuth();
  const { startNewSession } = useInterview();

  useEffect(() => {
    tts.warmup();
  }, []);

  // State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('flipkart');
  const [customCompany, setCustomCompany] = useState<string>('');
  const [role, setRole] = useState<string>(() => user?.role_target || 'Full Stack Developer (React + Node)');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(() => user?.experience_level || 'fresher');

  useEffect(() => {
    if (user?.role_target) setRole(user.role_target);
    if (user?.experience_level) setExperienceLevel(user.experience_level);
  }, [user?.role_target, user?.experience_level]);

  const [interviewType, setInterviewType] = useState<InterviewType>('mixed');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [language, setLanguage] = useState<string>('English');
  const [mode, setMode] = useState<InterviewDeliveryMode>('voice_only');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Pre-interview Mic Readiness
  const [voiceCapabilities] = useState<BrowserVoiceCapabilities>(() => getBrowserVoiceCapabilities());
  const [isTestingMic, setIsTestingMic] = useState<boolean>(false);
  const [testAudioLevel, setTestAudioLevel] = useState<number>(0);
  const [testDeviceLabel, setTestDeviceLabel] = useState<string>('');
  const [testMicError, setTestMicError] = useState<MicrophoneErrorInfo | null>(null);
  const [testMicPassed, setTestMicPassed] = useState<boolean>(false);
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
      setTestDeviceLabel(result.deviceLabel || 'Default Microphone');
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

  const selectedPreset = COMPANY_PRESETS.find(p => p.id === selectedPresetId);
  const companyName = customCompany.trim() || selectedPreset?.name || 'Top Tech Employer';
  const companyCategory: CompanyCategory = selectedPreset?.category || 'Product Unicorn';

  const handleStartInterview = async () => {
    stopMicTest();
    const config: InterviewConfig = {
      role,
      experienceLevel,
      interviewType,
      companyName,
      companyCategory,
      difficulty,
      durationMinutes,
      questionCount,
      language,
      mode,
      jobDescription: jobDescription.trim() || undefined,
      resumeText: resumeText.trim() || undefined
    };

    startNewSession(config);
    onStart();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30">
              Interactive Setup
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            Configure Your Mock Interview
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1">
            Tailor questions to your target company, job description, and role.
          </p>
        </div>

        {/* Quota Badge */}
        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121826] border border-white/[0.08] text-xs font-medium text-[#9AA4B2]">
          <Sparkles className="w-4 h-4 text-[#C5F36B]" />
          <span>
            Allowance: <strong className="text-[#C5F36B] font-bold">{quota.interviewsRemaining} of {quota.freeInterviewsTotal} left</strong>
          </span>
        </div>
      </div>

      {/* 1. Target Company Selection */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#C5F36B]" />
            <span>Select Target Employer or Company Pattern</span>
          </label>
          <span className="text-xs text-[#9AA4B2]">Tuned to company-specific interview patterns</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {COMPANY_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id && !customCompany;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setSelectedPresetId(preset.id);
                  setCustomCompany('');
                }}
                className={`p-3.5 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-[#C5F36B]/10 border-[#C5F36B] shadow-sm'
                    : 'bg-[#121826] border-white/[0.08] hover:border-white/[0.16]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CompanyBadge name={preset.name} code={preset.code} companyId={preset.id} size="sm" showCategory={false} />
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#C5F36B]" />}
                </div>
                <div className="font-semibold text-xs text-[#F5F7FA] truncate">{preset.name.split('(')[0]}</div>
                <div className="text-[10px] text-[#9AA4B2] mt-0.5 truncate">{preset.category}</div>
              </button>
            );
          })}
        </div>

        {/* Custom Company Input */}
        <div>
          <input
            type="text"
            placeholder="Or type custom company name (e.g. Cred, Razorpay, Oracle, TCS Ninja)..."
            value={customCompany}
            onChange={(e) => setCustomCompany(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B] transition-colors"
          />
        </div>
      </section>

      {/* 2. Target Job Role */}
      <section className="space-y-4">
        <label className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-[#C5F36B]" />
          <span>Target Job Role</span>
        </label>

        {/* Preset Chips */}
        <div className="flex flex-wrap gap-2">
          {POPULAR_ROLES.map((r) => {
            const isSelected = role === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isSelected
                    ? 'bg-[#C5F36B] border-[#C5F36B] text-[#080B11] font-bold'
                    : 'bg-[#121826] border-white/[0.08] text-[#9AA4B2] hover:text-[#F5F7FA] hover:border-white/[0.16]'
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>

        {/* Custom Role Input */}
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Custom role (e.g. SDE-1 Frontend, Cloud Support Associate, Data Analyst)..."
          className="w-full px-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
        />
      </section>

      {/* 3. Experience Level & Interview Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Experience Level */}
        <section className="space-y-3">
          <label className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Candidate Experience Level</span>
          </label>
          <div className="space-y-2">
            {EXPERIENCE_LEVELS.map((lvl) => {
              const isSelected = experienceLevel === lvl.id;
              return (
                <div
                  key={lvl.id}
                  onClick={() => setExperienceLevel(lvl.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#C5F36B]/10 border-[#C5F36B]'
                      : 'bg-[#121826] border-white/[0.08] hover:border-white/[0.16]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F5F7FA]">{lvl.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#C5F36B]" />}
                  </div>
                  <p className="text-[11px] text-[#9AA4B2] mt-1 leading-snug">{lvl.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interview Round Type */}
        <section className="space-y-3">
          <label className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Interview Round Focus</span>
          </label>
          <div className="space-y-2">
            {INTERVIEW_TYPES.map((type) => {
              const isSelected = interviewType === type.id;
              return (
                <div
                  key={type.id}
                  onClick={() => setInterviewType(type.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#C5F36B]/10 border-[#C5F36B]'
                      : 'bg-[#121826] border-white/[0.08] hover:border-white/[0.16]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {type.id === 'technical' ? (
                        <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                      ) : type.id === 'behavioral' ? (
                        <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : type.id === 'hr' ? (
                        <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : type.id === 'system_design' ? (
                        <Cpu className="w-4 h-4 text-indigo-400 shrink-0" />
                      ) : type.id === 'managerial' ? (
                        <Compass className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <Layers className="w-4 h-4 text-[#C5F36B] shrink-0" />
                      )}
                      <span className="text-xs font-bold text-[#F5F7FA]">{type.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#C5F36B]" />}
                  </div>
                  <p className="text-[11px] text-[#9AA4B2] mt-1 pl-6 leading-snug">{type.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* 4. Interview Delivery Format Selector */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
            <Headphones className="w-4 h-4 text-[#C5F36B]" />
            <span>Select Interview Delivery Format</span>
          </label>
          <span className="text-xs text-[#9AA4B2]">Choose your practice mode</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Voice-Only Mode */}
          <div
            onClick={() => {
              setMode('voice_only');
              setTestMicError(null);
            }}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              mode === 'voice_only'
                ? 'bg-[#C5F36B]/10 border-[#C5F36B]'
                : 'bg-[#121826] border-white/[0.08] hover:border-white/[0.16]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/[0.04] text-[#C5F36B]">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F7FA] flex items-center gap-1.5">
                    <span>Voice-Only Mode</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Top Pick
                    </span>
                  </div>
                  <div className="text-[11px] text-[#9AA4B2]">Spoken dialogue & live waveform</div>
                </div>
              </div>
              {mode === 'voice_only' && <Check className="w-4 h-4 text-[#C5F36B]" />}
            </div>
            <p className="text-[11px] text-[#9AA4B2] leading-relaxed pl-11">
              The AI interviewer speaks every question aloud. You respond verbally via your microphone with real-time speech transcription to simulate phone and tech rounds.
            </p>
          </div>

          {/* Video Mode */}
          <div
            onClick={() => {
              setMode('video');
              setTestMicError(null);
            }}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              mode === 'video'
                ? 'bg-[#C5F36B]/10 border-[#C5F36B]'
                : 'bg-[#121826] border-white/[0.08] hover:border-white/[0.16]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/[0.04] text-cyan-400">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F7FA]">Video Mode</div>
                  <div className="text-[11px] text-[#9AA4B2]">Webcam visual feed + audio</div>
                </div>
              </div>
              {mode === 'video' && <Check className="w-4 h-4 text-[#C5F36B]" />}
            </div>
            <p className="text-[11px] text-[#9AA4B2] leading-relaxed pl-11">
              Full webcam simulation for formal virtual placement rounds. Practice maintaining camera posture and eye contact with optional answer editor refinements.
            </p>
          </div>

          {/* Text-Based Mode */}
          <div
            onClick={() => {
              setMode('text_only');
              stopMicTest();
              setTestMicError(null);
            }}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              mode === 'text_only'
                ? 'bg-[#C5F36B]/10 border-[#C5F36B]'
                : 'bg-[#121826] border-white/[0.08] hover:border-white/[0.16]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/[0.04] text-[#F5F7FA]">
                  <FileText className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#F5F7FA] flex items-center gap-1.5">
                    <span>Text-Based Mode</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                      Mic-Free
                    </span>
                  </div>
                  <div className="text-[11px] text-[#9AA4B2]">Silent practice • No mic needed</div>
                </div>
              </div>
              {mode === 'text_only' && <Check className="w-4 h-4 text-[#C5F36B]" />}
            </div>
            <p className="text-[11px] text-[#9AA4B2] leading-relaxed pl-11">
              Read questions on screen (with optional audio replay) and type your technical answers. Ideal for quiet spaces or when your microphone is unavailable. Full STAR evaluations preserved.
            </p>
          </div>
        </div>

        {/* Microphone Readiness & Diagnostics */}
        {mode !== 'text_only' ? (
          <div className="p-4 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F5F7FA]">
                <Mic className="w-4 h-4 text-[#C5F36B]" />
                <span>Microphone & Audio Readiness Check</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#080B11] text-[#9AA4B2] border border-white/[0.06] font-normal">
                  {voiceCapabilities.browserName} on {voiceCapabilities.osName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isTestingMic ? (
                  <button
                    type="button"
                    onClick={stopMicTest}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 transition-colors"
                  >
                    Stop Test
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startMicTest}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#C5F36B]" />
                    <span>Test Microphone</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Test Display */}
            {isTestingMic && (
              <div className="p-3.5 rounded-xl bg-[#080B11] border border-white/[0.08] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#9AA4B2] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Device: <strong className="text-[#F5F7FA]">{testDeviceLabel}</strong></span>
                  </span>
                  <span className="text-[#C5F36B] font-mono text-[11px] font-semibold">
                    Volume: {testAudioLevel}%
                  </span>
                </div>

                {/* Level Meter Bar */}
                <div className="w-full h-2.5 rounded-full bg-[#121826] border border-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-[#C5F36B] transition-all duration-75 rounded-full"
                    style={{ width: `${Math.max(testAudioLevel, 4)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#9AA4B2]">
                  <span>Speak into your microphone. If the bar moves, your input is working.</span>
                  {testMicPassed && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Input Detected</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Error Banner */}
            {testMicError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
                <div className="flex items-start gap-2.5 text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-bold">{testMicError.title}</strong>
                    <p className="mt-0.5 text-rose-200">{testMicError.message}</p>
                    <p className="mt-1 text-[11px] text-[#9AA4B2]">
                      <strong>Fix:</strong> {testMicError.actionHint}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={startMicTest}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/30 hover:bg-rose-600/40 text-rose-200 border border-rose-500/40 transition-colors"
                  >
                    Retry Microphone Check
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('text_only');
                      setTestMicError(null);
                      stopMicTest();
                    }}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Switch to Text-Based Mode (No Mic Needed)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#9AA4B2] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Text-Based Mode Selected: Microphone and webcam access are completely disabled.</span>
            </div>
            <button
              type="button"
              onClick={() => setMode('voice_only')}
              className="text-xs text-[#C5F36B] hover:underline font-semibold shrink-0"
            >
              Switch back to Voice
            </button>
          </div>
        )}
      </section>

      {/* 5. Session Length & Difficulty */}
      <section className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#C5F36B]" />
            <span>Interview Parameters</span>
          </span>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-[#C5F36B] hover:underline font-medium"
          >
            {showAdvanced ? 'Hide Custom Inputs' : '+ Add Job Description & Resume'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Difficulty */}
          <div>
            <label className="block text-xs text-[#9AA4B2] mb-1.5 font-medium">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 text-[11px] font-semibold rounded-lg capitalize border ${
                    difficulty === d
                      ? 'bg-[#C5F36B] border-[#C5F36B] text-[#080B11] font-bold'
                      : 'bg-[#080B11] border-white/[0.08] text-[#9AA4B2] hover:text-[#F5F7FA]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-xs text-[#9AA4B2] mb-1.5 font-medium">Number of Questions</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[3, 5, 8, 10].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`py-2 text-[11px] font-semibold rounded-lg border ${
                    questionCount === count
                      ? 'bg-[#C5F36B] border-[#C5F36B] text-[#080B11] font-bold'
                      : 'bg-[#080B11] border-white/[0.08] text-[#9AA4B2] hover:text-[#F5F7FA]'
                  }`}
                >
                  {count} Qs
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs text-[#9AA4B2] mb-1.5 font-medium">Estimated Time</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[15, 20, 30].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDurationMinutes(dur)}
                  className={`py-2 text-[11px] font-semibold rounded-lg border ${
                    durationMinutes === dur
                      ? 'bg-[#C5F36B] border-[#C5F36B] text-[#080B11] font-bold'
                      : 'bg-[#080B11] border-white/[0.08] text-[#9AA4B2] hover:text-[#F5F7FA]'
                  }`}
                >
                  {dur} mins
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Collapsible JD and Resume Input */}
        {showAdvanced && (
          <div className="pt-4 border-t border-white/[0.08] space-y-4">
            <div>
              <label className="block text-xs text-[#F5F7FA] mb-1 font-medium">
                Paste Target Job Description (Optional)
              </label>
              <textarea
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste requirements, required skills, or job posting details to generate laser-targeted questions..."
                className="w-full p-3 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#F5F7FA] mb-1 font-medium">
                Paste Resume Project Summary (Optional)
              </label>
              <textarea
                rows={3}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste key projects, technologies used, or achievements from your resume so the AI interviewer can ask you direct project questions..."
                className="w-full p-3 rounded-xl bg-[#080B11] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
              />
            </div>
          </div>
        )}
      </section>

      {/* 6. Launch Action Bar */}
      <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="text-xs text-[#9AA4B2] font-medium">Session Blueprint</div>
          <div className="text-base font-bold text-[#F5F7FA] mt-0.5">
            {companyName} • {role}
          </div>
          <div className="text-xs text-[#9AA4B2] mt-1 flex items-center gap-2">
            <span>{questionCount} Questions</span>
            <span>•</span>
            <span className="capitalize">{interviewType} Round</span>
            <span>•</span>
            <span className="capitalize">{mode === 'text_only' ? 'Text-Based' : mode === 'voice_only' ? 'Voice-Only' : 'Video'} Mode</span>
            <span>•</span>
            <span className="capitalize">{difficulty} Level</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartInterview}
          className="w-full sm:w-auto btn-primary text-sm py-3.5 px-8 shadow-lg shadow-[#C5F36B]/20"
        >
          <span>
            {mode === 'text_only'
              ? 'Enter Text Interview Room'
              : mode === 'voice_only'
              ? 'Enter Voice Interview Room'
              : 'Enter Video Interview Room'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
