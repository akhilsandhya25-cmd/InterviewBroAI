import React, { useState } from 'react';
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
  Headphones
} from 'lucide-react';
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

interface InterviewSetupProps {
  onStart: () => void;
  onNavigate: (route: string) => void;
}

export const InterviewSetup: React.FC<InterviewSetupProps> = ({ onStart, onNavigate }) => {
  const { quota } = useAuth();
  const { startNewSession, isGeneratingQuestions } = useInterview();

  // Selected state
  const [selectedPresetId, setSelectedPresetId] = useState<string>('flipkart');
  const [customCompany, setCustomCompany] = useState<string>('');
  const [role, setRole] = useState<string>('Full Stack Developer (React + Node)');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('fresher');
  const [interviewType, setInterviewType] = useState<InterviewType>('mixed');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [language, setLanguage] = useState<string>('English');
  const [mode, setMode] = useState<InterviewDeliveryMode>('voice_only');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const selectedPreset = COMPANY_PRESETS.find(p => p.id === selectedPresetId);
  const companyName = customCompany.trim() || selectedPreset?.name || 'Top Tech Employer';
  const companyCategory: CompanyCategory = selectedPreset?.category || 'Product Unicorn';

  const handleStartInterview = async () => {
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

    const success = await startNewSession(config);
    if (success) {
      onStart();
    }
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Configure Your Mock Interview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tailor the questions to your exact target company, job description, and role.
          </p>
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
                  <span className="text-xl">{preset.logo}</span>
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
                      <span>{type.icon}</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Voice-Only Mode */}
          <div
            onClick={() => setMode('voice_only')}
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
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <span>Dedicated Voice-Only Interview</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Recommended
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">Voice-driven dialogue with real-time waveform</div>
                </div>
              </div>
              {mode === 'voice_only' && <Check className="w-4 h-4 text-violet-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pl-11">
              The AI interviewer speaks every question aloud. Answer verbally using your microphone with real-time speech transcription. Typed answers are disabled to simulate realistic phone screens and technical voice rounds.
            </p>
          </div>

          {/* Video Mode */}
          <div
            onClick={() => setMode('video')}
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
                  <div className="text-xs font-bold text-white">Video Interview Mode</div>
                  <div className="text-[11px] text-slate-400">Webcam visual feed + audio with response editor</div>
                </div>
              </div>
              {mode === 'video' && <Check className="w-4 h-4 text-blue-400" />}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pl-11">
              Full webcam simulation for formal virtual placement rounds. Practice maintaining camera posture and eye contact while answering questions by voice or refining your answer in the response editor.
            </p>
          </div>
        </div>
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
            <span className="capitalize">{mode === 'voice_only' ? 'Voice-Only' : 'Video'} Mode</span>
            <span>•</span>
            <span className="capitalize">{difficulty} Level</span>
          </div>
        </div>

        <button
          type="button"
          disabled={isGeneratingQuestions}
          onClick={handleStartInterview}
          className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm gradient-button flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGeneratingQuestions ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Generating Tailored Interview...</span>
            </>
          ) : (
            <>
              <span>{mode === 'voice_only' ? 'Enter Voice Interview Room' : 'Enter Video Interview Room'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
