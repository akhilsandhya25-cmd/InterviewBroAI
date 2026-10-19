import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Briefcase, 
  Clock, 
  BookOpen, 
  Sliders, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  HelpCircle, 
  Layers, 
  Check, 
  ChevronRight,
  Flame,
  Globe,
  Video,
  Mic,
  Headphones,
  AlertCircle,
  CheckCircle2,
  Volume2,
  RotateCcw,
  Terminal,
  Users,
  UserCheck,
  Cpu,
  Compass
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
import { BrandIcon } from '../components/brand/BrandIcon';

interface InterviewSetupProps {
  onStart: () => void;
  onNavigate: (route: string) => void;
}

export const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStart, onNavigate }) => {
  const { user, quota } = useAuth();
  const { startNewSession, isGeneratingQuestions } = useInterview();

  // Lazily warm up browser speech synthesis tables while user configures options
  useEffect(() => {
    tts.warmup();
  }, []);

  // Selected state
  const [selectedPresetId, setSelectedPresetId] = useState<string>('flipkart');
  const [customCompany, setCustomCompany] = useState<string>('');
  const [role, setRole] = useState<string>(() => user?.role_target || 'Full Stack Developer (React + Node)');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(() => user?.experience_level || 'fresher');

  useEffect(() => {
    if (user?.role_target) {
      setRole(user.role_target);
    }
    if (user?.experience_level) {
      setExperienceLevel(user.experience_level);
    }
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

  // Pre-interview Microphone Readiness state
  const [voiceCapabilities] = useState<BrowserVoiceCapabilities>(() => getBrowserVoiceCapabilities());
  const [isTestingMic, setIsTestingMic] = useState<boolean>(false);
  const [testAudioLevel, setTestAudioLevel] = useState<number>(0);
  const [testDeviceLabel, setTestDeviceLabel] = useState<string>('');
  const [testMicError, setTestMicError] = useState<MicrophoneErrorInfo | null>(null);
  const [testMicPassed, setTestMicPassed] = useState<boolean>(false);
  const testStreamRef = useRef<MediaStream | null>(null);
  const testMeterRef = useRef<{ stop: () => void } | null>(null);

  // Ensure test tracks are stopped and released if component unmounts
  useEffect(() => {
    return () => {
      if (testMeterRef.current) {
        testMeterRef.current.stop();
      }
      if (testStreamRef.current) {
        releaseMediaStream(testStreamRef.current);
      }
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

    // Instant session startup: synchronous client-side question preparation & immediate route transition (< 0.2s)
    startNewSession(config);
    onStart();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Personalized Setup
            </span>
            <span className="text-xs text-slate-400">Step 1 of 2</span>
          </div>
          <div className="flex items-center gap-3">
            <BrandIcon size="md" glow={true} className="hidden sm:inline-flex" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Configure Your Mock Interview
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Tailor the questions to your exact target company, job description, and role.
              </p>
            </div>
          </div>
        </div>

        {/* Quota Badge */}
        <div className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium">
          <Flame className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            Allowance: <strong className="text-emerald-400">Unlimited</strong> (Limits Removed)
          </span>
        </div>
      </div>

      {/* 1. Target Company Selection */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-violet-400" />
            <span>Select Target Employer or Company Pattern</span>
          </label>
          <span className="text-xs text-slate-400">Tuned to company-specific interview patterns</span>
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
                className={`p-3 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-violet-950/40 border-violet-500/70 shadow-md shadow-violet-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <CompanyBadge name={preset.name} code={preset.code} size="sm" />
                  {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                </div>
                <div className="font-semibold text-xs text-white truncate">{preset.name.split('(')[0]}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">{preset.category}</div>
              </button>
            );
          })}
        </div>

        {/* Custom Company Input */}
        <div className="pt-2">
          <input
            type="text"
            placeholder="Or type any specific company name (e.g. Cred, Razorpay, Oracle, TCS Ninja)..."
            value={customCompany}
            onChange={(e) => setCustomCompany(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      </section>

      {/* 2. Target Job Role */}
      <section className="space-y-4">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-400" />
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
                    ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
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
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </section>

      {/* 3. Experience Level & Interview Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Experience Level */}
        <section className="space-y-3">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
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
                      ? 'bg-cyan-950/30 border-cyan-500/60'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{lvl.label}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">{lvl.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Interview Round Type */}
        <section className="space-y-3">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
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
                      ? 'bg-amber-950/30 border-amber-500/60'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {type.id === 'technical' ? (
                        <Terminal className="w-4 h-4 text-blue-400 shrink-0" />
                      ) : type.id === 'behavioral' ? (
                        <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : type.id === 'hr' ? (
                        <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : type.id === 'system_design' ? (
                        <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
                      ) : type.id === 'managerial' ? (
                        <Compass className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <Layers className="w-4 h-4 text-violet-400 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-white">{type.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 pl-6 leading-snug">{type.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Interview Delivery Format Selector */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Headphones className="w-4 h-4 text-violet-400" />
            <span>Select Interview Delivery Format</span>
          </label>
          <span className="text-xs text-slate-400">Choose your practice mode</span>
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
                ? 'bg-violet-950/40 border-violet-500/80 shadow-lg shadow-violet-500/10'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Voice-Only Mode</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Top Pick
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Spoken dialogue & live waveform</div>
                </div>
              </div>
              {mode === 'voice_only' && <Check className="w-4 h-4 text-violet-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pl-11">
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
                ? 'bg-blue-950/40 border-blue-500/80 shadow-lg shadow-blue-500/10'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Video Mode</div>
                  <div className="text-[11px] text-slate-400">Webcam visual feed + audio</div>
                </div>
              </div>
              {mode === 'video' && <Check className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pl-11">
              Full webcam simulation for formal virtual placement rounds. Practice maintaining camera posture and eye contact with optional answer editor refinements.
            </p>
          </div>

          {/* Text-Based Mode (Silent / Mic-Free Fallback) */}
          <div
            onClick={() => {
              setMode('text_only');
              stopMicTest();
              setTestMicError(null);
            }}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              mode === 'text_only'
                ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Text-Based Mode</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Mic-Free
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Silent practice • No mic required</div>
                </div>
              </div>
              {mode === 'text_only' && <Check className="w-4 h-4 text-emerald-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pl-11">
              Read questions on screen (with optional audio replay) and type your technical answers. Ideal for quiet spaces or when your microphone is unavailable. Full STAR evaluations preserved.
            </p>
          </div>
        </div>

        {/* Interactive Pre-Interview Microphone Readiness & Diagnostics */}
        {mode !== 'text_only' ? (
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-white">
                <Mic className="w-4 h-4 text-violet-400" />
                <span>Microphone & Audio Readiness Check</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-normal">
                  {voiceCapabilities.browserName} on {voiceCapabilities.osName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isTestingMic ? (
                  <button
                    type="button"
                    onClick={stopMicTest}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-colors"
                  >
                    Stop Test
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startMicTest}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors flex items-center gap-1.5 shadow"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Test Microphone</span>
                  </button>
                )}
              </div>
            </div>

            {/* Microsoft Edge on Windows Specific Advice */}
            {voiceCapabilities.browserName === 'Edge' && voiceCapabilities.osName === 'Windows' && (
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-[11px] text-blue-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-white">Edge on Windows Tip:</span> If Edge reports a microphone problem despite site permissions being granted, ensure Windows allows apps to access your microphone via <strong>Windows Settings &gt; Privacy &amp; security &gt; Microphone</strong>.
                </div>
              </div>
            )}

            {/* Firefox Warning */}
            {voiceCapabilities.browserName === 'Firefox' && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold text-white">Firefox Notice:</span> Mozilla Firefox does not support the Web Speech API by default. For the best voice experience, use Google Chrome or Microsoft Edge, or switch to Text-Based Mode below.
                </div>
              </div>
            )}

            {/* Active Test Display */}
            {isTestingMic && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-violet-500/30 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Device: <strong className="text-white">{testDeviceLabel}</strong></span>
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px] font-semibold">
                    Volume: {testAudioLevel}%
                  </span>
                </div>

                {/* Level Meter Bar */}
                <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-violet-500 transition-all duration-75 rounded-full"
                    style={{ width: `${Math.max(testAudioLevel, 4)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Speak into your microphone. If the bar moves, your microphone is ready.</span>
                  {testMicPassed && (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Input Detected</span>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Microphone Error Banner */}
            {testMicError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs space-y-2">
                <div className="flex items-start gap-2.5 text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-bold">{testMicError.title}</strong>
                    <p className="mt-0.5 text-rose-200">{testMicError.message}</p>
                    <p className="mt-1 text-[11px] text-slate-300">
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
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 shadow"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Switch to Text-Based Mode (No Mic Needed)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Text-Based Mode Selected: Microphone and webcam access are completely disabled.</span>
            </div>
            <button
              type="button"
              onClick={() => setMode('voice_only')}
              className="text-xs text-emerald-400 hover:underline font-semibold shrink-0"
            >
              Switch back to Voice
            </button>
          </div>
        )}
      </section>

      {/* 4. Session Length & Difficulty */}
      <section className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-violet-400" />
            <span>Interview Parameters</span>
          </span>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-violet-400 hover:text-violet-300 font-medium"
          >
            {showAdvanced ? 'Hide Custom Inputs' : '+ Add Job Description & Resume'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Difficulty */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['beginner', 'intermediate', 'advanced'] as DifficultyLevel[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 text-[11px] font-semibold rounded-lg capitalize border ${
                    difficulty === d
                      ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Number of Questions</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[3, 5, 8, 10].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`py-2 text-[11px] font-semibold rounded-lg border ${
                    questionCount === count
                      ? 'bg-blue-600/30 border-blue-500 text-blue-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {count} Qs
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Estimated Time</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[15, 20, 30].map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setDurationMinutes(dur)}
                  className={`py-2 text-[11px] font-semibold rounded-lg border ${
                    durationMinutes === dur
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
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
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">
                Paste Target Job Description (Optional)
              </label>
              <textarea
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste requirements, required skills, or job posting details to generate laser-targeted questions..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">
                Paste Resume Project Summary (Optional)
              </label>
              <textarea
                rows={3}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste key projects, technologies used, or achievements from your resume so the AI interviewer can ask you direct project questions..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>
        )}
      </section>

      {/* Start Button & Summary Action */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/50 via-slate-900 to-blue-950/50 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="text-xs text-slate-400 font-medium">Your Session Summary</div>
          <div className="text-base font-bold text-white mt-0.5">
            {companyName} • {role}
          </div>
          <div className="text-xs text-violet-300 mt-1 flex items-center gap-2">
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
          className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm gradient-button flex items-center justify-center gap-2 transition-transform active:scale-[0.98] shadow-lg shadow-violet-900/30"
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
