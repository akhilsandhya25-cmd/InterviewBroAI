import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  FileText,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  Clock,
  History,
  Star,
  ArrowRight,
  TrendingUp,
  Split,
  BookOpen,
  Send,
  Loader2,
  Check,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  AcademyLesson,
  PracticeAttempt,
  CoachFeedback,
  CoachRubricPillar
} from '../../types/academy';
import { ALL_ACADEMY_LESSONS } from '../../data/academyCurriculum';
import { createSpeechRecognition, SpeechRecognitionService } from '../../services/speech';
import { storage } from '../../services/storage';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface PracticeStudioProps {
  lesson: AcademyLesson;
  onComplete?: (attempt: PracticeAttempt) => void;
  existingAttempts?: PracticeAttempt[];
  onNavigateToMock?: () => void;
  allLessons?: AcademyLesson[];
}

export const PracticeStudio: React.FC<PracticeStudioProps> = ({
  lesson: initialLesson,
  onComplete,
  existingAttempts: initialAttempts = [],
  onNavigateToMock,
  allLessons = ALL_ACADEMY_LESSONS
}) => {
  const { user } = useAuth();

  // Active question / lesson selector state
  const [selectedLessonId, setSelectedLessonId] = useState<string>(initialLesson.id);
  const currentLesson = allLessons.find((l) => l.id === selectedLessonId) || initialLesson;
  const exercise = currentLesson.exercise;

  // Answer draft & speech states
  const [responseDraft, setResponseDraft] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [showSampleAnswer, setShowSampleAnswer] = useState<boolean>(false);
  const [selfRating, setSelfRating] = useState<number>(4);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // AI Practice Coach States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [coachFeedback, setCoachFeedback] = useState<CoachFeedback | null>(null);
  const [coachError, setCoachError] = useState<string | null>(null);
  const [copiedModel, setCopiedModel] = useState<boolean>(false);

  // Revision & Comparison States
  const [isRevisionMode, setIsRevisionMode] = useState<boolean>(false);
  const [originalAnswer, setOriginalAnswer] = useState<string>('');
  const [originalFeedback, setOriginalFeedback] = useState<CoachFeedback | null>(null);
  const [comparisonView, setComparisonView] = useState<'side-by-side' | 'tabs'>('tabs');
  const [activeCompareTab, setActiveCompareTab] = useState<'original' | 'revised'>('revised');

  const recognitionRef = useRef<SpeechRecognitionService | null>(null);
  const timerRef = useRef<any>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  // Fetch past attempts for the currently selected question
  const [currentAttempts, setCurrentAttempts] = useState<PracticeAttempt[]>(() => {
    const progress = storage.getAcademyProgress(user?.id);
    return progress.practiceAttempts[currentLesson.id] || initialAttempts;
  });

  // Keep attempts updated when selected lesson changes
  useEffect(() => {
    const progress = storage.getAcademyProgress(user?.id);
    const attempts = progress.practiceAttempts[currentLesson.id] || [];
    setCurrentAttempts(attempts);

    // If an attempt exists with feedback, show it
    const latestWithFeedback = [...attempts].reverse().find((a) => a.feedback);
    if (latestWithFeedback && !coachFeedback) {
      setCoachFeedback(latestWithFeedback.feedback || null);
      if (latestWithFeedback.originalResponse) {
        setOriginalAnswer(latestWithFeedback.originalResponse);
        setOriginalFeedback(latestWithFeedback.originalFeedback || null);
        setIsRevisionMode(true);
      }
    }
  }, [selectedLessonId, user?.id]);

  // Initialize Speech Recognition Service
  useEffect(() => {
    try {
      const rec = createSpeechRecognition();
      recognitionRef.current = rec;
      setSpeechSupported(rec.isSupported);
    } catch (e) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Safe stop
        }
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer while recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartRecording = () => {
    setMicError(null);
    if (!recognitionRef.current || !recognitionRef.current.isSupported) {
      setMicError('Speech recognition is not supported in this browser. Please use Chrome or type your answer directly in the box below.');
      return;
    }

    try {
      setIsRecording(true);
      setRecordingSeconds(0);

      recognitionRef.current.start(
        (fullTranscript, _interimChunk, _isFinal) => {
          if (fullTranscript) {
            setResponseDraft((prev) => {
              const trimmedPrev = prev.trim();
              if (!trimmedPrev) return fullTranscript;
              if (trimmedPrev.endsWith(fullTranscript) || fullTranscript.startsWith(trimmedPrev)) {
                return fullTranscript;
              }
              return `${trimmedPrev} ${fullTranscript}`;
            });
          }
        },
        (errorType, message) => {
          console.warn('[PracticeStudio] Speech recognition notice:', errorType, message);
          if (errorType === 'not-allowed' || errorType === 'permission-denied') {
            setMicError('Microphone permission was denied. Please allow microphone access in your browser bar.');
          } else if (errorType === 'not-supported') {
            setMicError('Speech recognition is not supported in this browser. Please type your response.');
          } else {
            setMicError(message || 'Microphone error occurred. You can continue typing your answer.');
          }
          setIsRecording(false);
        },
        (status) => {
          if (status === 'stopped') {
            setIsRecording(false);
          }
        }
      );
    } catch (err: any) {
      console.warn('Speech recognition start failed:', err);
      setMicError('Could not start microphone listener. You can type your answer directly.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Safe stop
      }
    }
    setIsRecording(false);
  };

  const handleInsertTemplate = () => {
    if (exercise.starterTemplate) {
      setResponseDraft((prev) => (prev ? `${prev}\n\n${exercise.starterTemplate}` : exercise.starterTemplate || ''));
      if (editorRef.current) {
        editorRef.current.focus();
      }
    }
  };

  const handleClear = () => {
    if (responseDraft && confirm('Clear your current answer draft?')) {
      setResponseDraft('');
      setSaveSuccess(false);
      setCoachError(null);
    }
  };

  // Word count & metrics
  const trimmed = responseDraft.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const estimatedSpeakMinutes = (wordCount / 140).toFixed(1);

  // Detect basic filler words
  const fillerRegex = /\b(basically|actually|like|um+|uh+|you know|sort of|kind of|i mean)\b/gi;
  const matches = trimmed.match(fillerRegex) || [];
  const fillerCount = matches.length;
  const uniqueFillers = Array.from(new Set(matches.map((m) => m.toLowerCase())));

  // Submit Answer to AI Practice Coach
  const handleRequestAiFeedback = async () => {
    if (!trimmed) {
      setCoachError('Please write or speak your answer first before requesting AI feedback.');
      return;
    }

    if (wordCount < 10) {
      setCoachError('Please provide a slightly more complete answer (at least 2-3 sentences) so the AI Coach can give meaningful feedback.');
      return;
    }

    setIsAnalyzing(true);
    setCoachError(null);

    try {
      const questionPayload = {
        title: exercise.title,
        prompt: exercise.prompt,
        objective: currentLesson.objective,
        category: currentLesson.moduleId,
        sampleAnswer: exercise.sampleAnswer
      };

      const optionsPayload = {
        experienceLevel: 'Fresher / College Student',
        targetRole: 'Software Engineer / Graduate Placement Candidate',
        isRevision: isRevisionMode,
        previousAnswer: isRevisionMode ? originalAnswer : undefined,
        previousScore: isRevisionMode && originalFeedback ? originalFeedback.overallScore : undefined
      };

      const result = await api.getPracticeCoachFeedback(questionPayload, trimmed, optionsPayload);

      if (result.success && result.feedback) {
        const fb = result.feedback;
        setCoachFeedback(fb);

        // Record attempt in storage
        const attempt: PracticeAttempt = {
          id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          lessonId: currentLesson.id,
          questionId: exercise.id,
          questionTitle: exercise.title,
          questionPrompt: exercise.prompt,
          assessmentObjective: currentLesson.objective,
          type: exercise.type,
          userResponse: trimmed,
          originalResponse: isRevisionMode ? originalAnswer : trimmed,
          revisedResponse: isRevisionMode ? trimmed : undefined,
          isRevision: isRevisionMode,
          feedback: fb,
          originalFeedback: isRevisionMode && originalFeedback ? originalFeedback : fb,
          fillerWordCount: fillerCount,
          durationSeconds: recordingSeconds > 0 ? recordingSeconds : Math.round((wordCount / 140) * 60),
          selfRating,
          createdAt: new Date().toISOString()
        };

        try {
          storage.recordPracticeAttempt(attempt, user?.id);
          const updated = storage.getAcademyProgress(user?.id).practiceAttempts[currentLesson.id] || [];
          setCurrentAttempts(updated);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 4000);
        } catch (e) {
          console.warn('Could not persist practice attempt with feedback:', e);
        }

        if (onComplete) {
          onComplete(attempt);
        }
      } else {
        const errorMsg = result.error || 'Failed to analyze answer.';
        if (result.status === 429) {
          setCoachError('Rate limit exceeded: You have submitted multiple answers recently. Please wait a minute before requesting feedback again.');
        } else if (result.status === 503) {
          setCoachError('AI Coaching service is currently offline (API key not configured). Your practice answer has still been preserved safely.');
        } else {
          setCoachError(errorMsg);
        }
      }
    } catch (err: any) {
      setCoachError(err.message || 'An unexpected error occurred while communicating with the AI Coach.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Start Revision Mode
  const handleStartRevision = () => {
    if (!originalAnswer) {
      setOriginalAnswer(trimmed);
      setOriginalFeedback(coachFeedback);
    }
    setIsRevisionMode(true);
    setCoachError(null);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Save manual attempt without AI
  const handleSaveAttemptOnly = () => {
    if (!trimmed) return;

    const attempt: PracticeAttempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      lessonId: currentLesson.id,
      questionId: exercise.id,
      questionTitle: exercise.title,
      questionPrompt: exercise.prompt,
      assessmentObjective: currentLesson.objective,
      type: exercise.type,
      userResponse: trimmed,
      originalResponse: isRevisionMode ? originalAnswer : trimmed,
      revisedResponse: isRevisionMode ? trimmed : undefined,
      isRevision: isRevisionMode,
      feedback: coachFeedback || undefined,
      fillerWordCount: fillerCount,
      durationSeconds: recordingSeconds > 0 ? recordingSeconds : Math.round((wordCount / 140) * 60),
      selfRating,
      createdAt: new Date().toISOString()
    };

    try {
      storage.recordPracticeAttempt(attempt, user?.id);
      const updated = storage.getAcademyProgress(user?.id).practiceAttempts[currentLesson.id] || [];
      setCurrentAttempts(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.warn('Could not persist practice attempt:', e);
    }

    if (onComplete) {
      onComplete(attempt);
    }
  };

  // Copy stronger model answer to draft
  const handleUseModelAnswer = (modelText: string) => {
    setResponseDraft(modelText);
    setCopiedModel(true);
    setTimeout(() => setCopiedModel(false), 3000);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Score badge helper
  const getScoreBadge = (score: number) => {
    if (score >= 85) {
      return {
        label: 'Placement Ready',
        color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        ring: 'text-emerald-400'
      };
    }
    if (score >= 70) {
      return {
        label: 'Solid Foundation',
        color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        ring: 'text-cyan-400'
      };
    }
    if (score >= 50) {
      return {
        label: 'Good Effort, Needs Polish',
        color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        ring: 'text-amber-400'
      };
    }
    return {
      label: 'Needs Structured Practice',
      color: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      ring: 'text-rose-400'
    };
  };

  return (
    <div className="space-y-6">
      {/* 1. Question Selector & Curriculum Context */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#C5F36B]/10 text-[#C5F36B] border border-[#C5F36B]/30 uppercase tracking-wider">
                AI Practice Coach
              </span>
              <span className="text-xs text-[#9AA4B2]">
                Lesson {currentLesson.number} of {allLessons.length}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#F5F7FA]">
              {exercise.title}
            </h3>
          </div>

          {/* Quick Question Picker Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="question-select" className="text-[11px] text-[#9AA4B2] hidden md:inline">
              Practice Question:
            </label>
            <select
              id="question-select"
              value={selectedLessonId}
              onChange={(e) => {
                setSelectedLessonId(e.target.value);
                setCoachFeedback(null);
                setCoachError(null);
                setIsRevisionMode(false);
              }}
              className="bg-[#121826] border border-white/[0.1] text-xs text-[#F5F7FA] rounded-xl px-3 py-2 focus:outline-none focus:border-[#C5F36B] transition-colors cursor-pointer"
            >
              {allLessons.map((l) => (
                <option key={l.id} value={l.id}>
                  Lesson {l.number}: {l.exercise.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* What the Interviewer Wants to Assess */}
        <div className="p-4 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#C5F36B]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>What Interviewers Assess in this Question:</span>
          </div>
          <p className="text-xs sm:text-sm text-[#F5F7FA] leading-relaxed">
            {exercise.prompt}
          </p>
          <div className="text-[11px] text-[#9AA4B2] leading-relaxed pt-1 border-t border-white/[0.04]">
            <strong>Core Objective:</strong> {currentLesson.objective}
          </div>
        </div>

        {/* Evaluation Rubric Criteria */}
        {exercise.evaluationRubric && exercise.evaluationRubric.length > 0 && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9AA4B2] flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>Assessment Rubric & Target Benchmarks:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {exercise.evaluationRubric.map((r: any, idx: number) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="font-semibold text-[#F5F7FA] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C5F36B] shrink-0" />
                    <span>{r.criterion}</span>
                  </div>
                  <div className="text-[11px] text-[#9AA4B2] mt-0.5 pl-5">
                    {r.idealTarget}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Starter Template & Sample Model Answer Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {exercise.starterTemplate && (
            <button
              onClick={handleInsertTemplate}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-[#F5F7FA] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Use Starter Template</span>
            </button>
          )}

          {exercise.sampleAnswer && (
            <button
              onClick={() => setShowSampleAnswer(!showSampleAnswer)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-[#9AA4B2] hover:text-[#F5F7FA] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{showSampleAnswer ? 'Hide Sample Answer' : 'View Sample Model Answer'}</span>
              {showSampleAnswer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Model Answer Preview */}
        {showSampleAnswer && exercise.sampleAnswer && (
          <div className="p-4 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed space-y-2 animate-in fade-in duration-200">
            <div className="font-bold text-emerald-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Reference Model Answer (Indian Fresher / Campus Context):</span>
              </span>
              <button
                onClick={() => handleUseModelAnswer(exercise.sampleAnswer || '')}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 transition-colors flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedModel ? 'Copied into Draft!' : 'Insert into Editor'}</span>
              </button>
            </div>
            <p className="whitespace-pre-line text-[11px] sm:text-xs text-slate-200">
              {exercise.sampleAnswer}
            </p>
          </div>
        )}
      </div>

      {/* 2. Interactive Answer Editor Workspace */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#C5F36B]" />
              <span>{isRevisionMode ? 'Revised Practice Answer' : 'Your Practice Answer'}</span>
            </span>

            {isRevisionMode && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                Revision Mode (Attempt #2)
              </span>
            )}

            {isRecording && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Recording ({recordingSeconds}s)</span>
              </span>
            )}
          </div>

          {/* Voice Mic & Clear Controls */}
          <div className="flex items-center gap-2">
            {speechSupported && (
              <button
                type="button"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-md shadow-rose-500/30'
                    : 'bg-white/[0.06] hover:bg-white/[0.1] text-[#F5F7FA]'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-[#C5F36B]" />}
                <span>{isRecording ? 'Stop Mic' : 'Speak Answer'}</span>
              </button>
            )}

            {responseDraft && (
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1.5 rounded-xl text-xs text-[#9AA4B2] hover:text-rose-400 hover:bg-white/[0.04] transition-colors cursor-pointer"
                title="Clear Draft"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mic Error Notice */}
        {micError && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{micError}</span>
          </div>
        )}

        {/* Text Area */}
        <div className="relative">
          <textarea
            ref={editorRef}
            value={responseDraft}
            onChange={(e) => setResponseDraft(e.target.value)}
            placeholder="Type your response or click 'Speak Answer' to speak it out loud. Ground your answer in your real projects, coursework, and personal drive..."
            rows={7}
            className="w-full p-4 rounded-2xl bg-[#121826] border border-white/[0.08] text-xs sm:text-sm text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus:outline-none focus:border-[#C5F36B] focus:ring-1 focus:ring-[#C5F36B] transition-all resize-y leading-relaxed"
          />
        </div>

        {/* Word Count, Speaking Time, and Filler Detection */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#9AA4B2] pt-1">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              Words: <strong className="text-[#F5F7FA]">{wordCount}</strong>
            </span>
            <span>
              Spoken duration: <strong className="text-[#F5F7FA]">~{estimatedSpeakMinutes} min</strong>
            </span>
            {fillerCount > 0 && (
              <span className="text-amber-300 font-semibold flex items-center gap-1">
                <span>{fillerCount} filler word{fillerCount > 1 ? 's' : ''} detected</span>
                <span className="text-[10px] text-[#9AA4B2]">({uniqueFillers.join(', ')})</span>
              </span>
            )}
          </div>

          {/* Self-Rating Stars */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-[#9AA4B2] mr-1">Self-Rating:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setSelfRating(star)}
                className={`p-0.5 transition-colors cursor-pointer ${
                  star <= selfRating ? 'text-[#C5F36B]' : 'text-slate-700'
                }`}
                title={`${star} Star`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
              </button>
            ))}
          </div>
        </div>

        {/* Coaching Tip for Fillers */}
        {fillerCount > 2 && (
          <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 text-[11px] text-amber-200 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Coaching Note:</strong> You used filler words ({uniqueFillers.map((f) => `"${f}"`).join(', ')}). In campus interviews, replace these with a calm 1-second pause to organize your thoughts before speaking.
            </span>
          </div>
        )}

        {/* Error Banner */}
        {coachError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{coachError}</span>
            </div>
            <button
              onClick={() => setCoachError(null)}
              className="text-rose-400 hover:text-rose-200 text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Primary CTA Row: AI Coach Analysis & Save */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
          <div className="text-[11px] text-[#9AA4B2]">
            {saveSuccess ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Practice response saved to your profile!</span>
              </span>
            ) : (
              <span>Your practice responses are saved privately for your user account.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveAttemptOnly}
              disabled={!trimmed || isAnalyzing}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-[#F5F7FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Save Practice Attempt
            </button>

            <button
              type="button"
              onClick={handleRequestAiFeedback}
              disabled={!trimmed || isAnalyzing}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#b0df57] disabled:opacity-40 disabled:cursor-not-allowed text-[#080B11] shadow-lg shadow-[#C5F36B]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating with AI Coach...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isRevisionMode ? 'Re-Evaluate Revision' : 'Get AI Coach Feedback'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. AI Coach Feedback Results Card */}
      {coachFeedback && (
        <div className="p-5 sm:p-7 rounded-3xl bg-[#0B0F19] border border-[#C5F36B]/30 shadow-2xl space-y-6 animate-in fade-in duration-300">
          {/* Header Score & Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30 uppercase tracking-wider">
                  AI Practice Evaluation
                </span>
                <span className="text-[11px] text-[#9AA4B2]">
                  {new Date(coachFeedback.evaluatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-[#F5F7FA] mt-1.5">
                Practice Coach Assessment
              </h4>
            </div>

            {/* Overall Score Pill */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black text-[#F5F7FA] tracking-tight">
                  {coachFeedback.overallScore}<span className="text-sm text-[#9AA4B2] font-normal">/100</span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${getScoreBadge(coachFeedback.overallScore).color}`}>
                  {getScoreBadge(coachFeedback.overallScore).label}
                </div>
              </div>
            </div>
          </div>

          {/* Coach Verbal Summary */}
          <div className="p-4 rounded-2xl bg-[#121826] border border-white/[0.08] text-xs sm:text-sm text-[#F5F7FA] leading-relaxed space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5F36B] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coach Executive Summary:</span>
            </div>
            <p className="text-slate-200">
              {coachFeedback.summary}
            </p>
          </div>

          {/* 4 Rubric Pillars Breakdown */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-[#9AA4B2]">
              Scoring Rubric Breakdown:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(coachFeedback.rubricBreakdown).map(([key, pillar]: [string, CoachRubricPillar]) => (
                <div key={key} className="p-4 rounded-2xl bg-[#121826] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#F5F7FA]">
                      {pillar.name}
                    </span>
                    <span className="text-xs font-black text-[#C5F36B]">
                      {pillar.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#C5F36B] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pillar.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#9AA4B2] leading-relaxed">
                    {pillar.reasoning}
                  </p>
                  {pillar.suggestions && (
                    <div className="text-[11px] text-amber-200/90 pt-1 border-t border-white/[0.04] flex items-start gap-1">
                      <span className="font-bold text-amber-400">Tip:</span>
                      <span>{pillar.suggestions}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Areas to Improve Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-2xl bg-emerald-500/[0.05] border border-emerald-500/20 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>What Worked Well:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {coachFeedback.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="p-4 rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                <span>Areas to Polish:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {coachFeedback.areasForImprovement.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Next Steps */}
          {coachFeedback.actionableNextSteps && coachFeedback.actionableNextSteps.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Actionable Revision Checklist:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                {coachFeedback.actionableNextSteps.map((step, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] text-[#F5F7FA]">
                    <span className="font-bold text-cyan-300 mr-1.5">#{idx + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tailored Stronger Model Answer */}
          {coachFeedback.strongerModelAnswer && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121826] to-[#182030] border border-white/[0.1] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="text-xs font-bold text-[#F5F7FA] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5F36B]" />
                  <span>Stronger Example Answer (Tailored to Your Level):</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUseModelAnswer(coachFeedback.strongerModelAnswer)}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-[#C5F36B]/15 hover:bg-[#C5F36B]/25 text-[#C5F36B] border border-[#C5F36B]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedModel ? 'Inserted into Editor!' : 'Study & Try this Structure'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-line leading-relaxed font-sans bg-black/20 p-3.5 rounded-xl border border-white/[0.04]">
                {coachFeedback.strongerModelAnswer}
              </p>
            </div>
          )}

          {/* Action Row: Revise Answer & Try Again */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.08]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartRevision}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.14] text-[#F5F7FA] border border-white/[0.12] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#C5F36B]" />
                <span>Revise Answer & Try Again</span>
              </button>
            </div>

            {/* Disclaimer */}
            <div className="text-[11px] text-[#9AA4B2] italic text-center sm:text-right">
              {coachFeedback.disclaimer}
            </div>
          </div>
        </div>
      )}

      {/* 4. Compare Original and Revised Answers (When in Revision Mode) */}
      {isRevisionMode && originalAnswer && (
        <div className="p-5 sm:p-7 rounded-3xl bg-[#0B0F19] border border-violet-500/30 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Split className="w-4 h-4 text-violet-400" />
              <h5 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider">
                Compare Original vs. Revised Answer
              </h5>
            </div>

            {/* View toggle (Tabs vs Side-by-Side) */}
            <div className="flex items-center gap-1.5 bg-[#121826] p-1 rounded-xl border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setActiveCompareTab('original')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  activeCompareTab === 'original'
                    ? 'bg-white/[0.1] text-white'
                    : 'text-[#9AA4B2] hover:text-white'
                }`}
              >
                Original Answer {originalFeedback && `(${originalFeedback.overallScore}%)`}
              </button>
              <button
                type="button"
                onClick={() => setActiveCompareTab('revised')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  activeCompareTab === 'revised'
                    ? 'bg-[#C5F36B] text-[#080B11]'
                    : 'text-[#9AA4B2] hover:text-white'
                }`}
              >
                Revised Answer {coachFeedback && `(${coachFeedback.overallScore}%)`}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Card */}
            <div className={`p-4 rounded-2xl bg-[#121826] border border-white/[0.06] space-y-2 ${activeCompareTab === 'original' ? 'ring-1 ring-white/20' : ''}`}>
              <div className="flex items-center justify-between text-xs font-bold text-[#9AA4B2]">
                <span>Original Attempt:</span>
                {originalFeedback && (
                  <span className="text-slate-300">{originalFeedback.overallScore}/100</span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-black/20 p-3 rounded-xl border border-white/[0.02]">
                {originalAnswer}
              </p>
            </div>

            {/* Revised Card */}
            <div className={`p-4 rounded-2xl bg-[#121826] border border-[#C5F36B]/20 space-y-2 ${activeCompareTab === 'revised' ? 'ring-1 ring-[#C5F36B]/40' : ''}`}>
              <div className="flex items-center justify-between text-xs font-bold text-[#C5F36B]">
                <span>Revised Attempt:</span>
                {coachFeedback && originalFeedback && (
                  <span className="flex items-center gap-1 font-bold">
                    <span>{coachFeedback.overallScore}/100</span>
                    {coachFeedback.overallScore > originalFeedback.overallScore && (
                      <span className="text-emerald-400 text-[11px]">
                        (+{coachFeedback.overallScore - originalFeedback.overallScore} pts! 🚀)
                      </span>
                    )}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-100 leading-relaxed whitespace-pre-line bg-black/20 p-3 rounded-xl border border-white/[0.02]">
                {responseDraft || originalAnswer}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Previous Practice Attempts History Accordion */}
      {currentAttempts.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#F5F7FA] uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Previous Practice Attempts ({currentAttempts.length})</span>
            </span>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {currentAttempts.map((att, idx) => (
              <div key={att.id || idx} className="p-3.5 rounded-xl bg-[#121826] border border-white/[0.04] text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-[#9AA4B2]">
                  <span>
                    Attempt #{currentAttempts.length - idx} • {new Date(att.createdAt).toLocaleDateString()} at{' '}
                    {new Date(att.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div className="flex items-center gap-2">
                    {att.feedback && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#C5F36B]/15 text-[#C5F36B]">
                        Score: {att.feedback.overallScore}/100
                      </span>
                    )}
                    {att.selfRating && <span className="text-[#C5F36B]">{att.selfRating} ★</span>}
                  </div>
                </div>
                <p className="text-[#F5F7FA]/90 text-[11px] line-clamp-2 leading-relaxed">
                  "{att.userResponse}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Bridge to Full Mock Interview Studio */}
      {onNavigateToMock && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 to-cyan-950/40 border border-violet-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F5F7FA]">
                Ready for a live full-length mock round?
              </div>
              <div className="text-[11px] text-[#9AA4B2]">
                Test your prepared answers against adaptive voice follow-ups in the AI Interview Room.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onNavigateToMock}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.14] text-[#F5F7FA] border border-white/[0.12] transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <span>Launch Mock Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
