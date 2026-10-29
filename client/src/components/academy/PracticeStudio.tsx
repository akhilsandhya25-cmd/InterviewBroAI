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
  ArrowRight
} from 'lucide-react';
import { AcademyLesson, PracticeAttempt } from '../../types/academy';
import { createSpeechRecognition, SpeechRecognitionService } from '../../services/speech';
import { storage } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';

interface PracticeStudioProps {
  lesson: AcademyLesson;
  onComplete?: (attempt: PracticeAttempt) => void;
  existingAttempts?: PracticeAttempt[];
  onNavigateToMock?: () => void;
}

export const PracticeStudio: React.FC<PracticeStudioProps> = ({
  lesson,
  onComplete,
  existingAttempts = [],
  onNavigateToMock
}) => {
  const { user } = useAuth();
  const exercise = lesson.exercise;

  const [responseDraft, setResponseDraft] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [micError, setMicError] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [showSampleAnswer, setShowSampleAnswer] = useState<boolean>(false);
  const [selfRating, setSelfRating] = useState<number>(4);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const recognitionRef = useRef<SpeechRecognitionService | null>(null);
  const timerRef = useRef<any>(null);

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
          // Clean unmount
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
              // Append newly dictated text smoothly
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
    }
  };

  const handleClear = () => {
    if (responseDraft && confirm('Clear your current answer draft?')) {
      setResponseDraft('');
      setSaveSuccess(false);
    }
  };

  // Basic word count & metrics
  const trimmed = responseDraft.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const estimatedSpeakMinutes = (wordCount / 140).toFixed(1); // Standard ~130-150 wpm

  // Detect basic filler words (honest client-side heuristic count)
  const fillerRegex = /\b(basically|actually|like|um+|uh+|you know|sort of|kind of)\b/gi;
  const matches = trimmed.match(fillerRegex) || [];
  const fillerCount = matches.length;
  const uniqueFillers = Array.from(new Set(matches.map((m) => m.toLowerCase())));

  const handleSaveAttempt = () => {
    if (!trimmed) return;

    const attempt: PracticeAttempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      lessonId: lesson.id,
      type: exercise.type,
      userResponse: trimmed,
      fillerWordCount: fillerCount,
      durationSeconds: recordingSeconds > 0 ? recordingSeconds : Math.round((wordCount / 140) * 60),
      selfRating,
      createdAt: new Date().toISOString()
    };

    try {
      storage.recordPracticeAttempt(attempt, user?.id);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (e) {
      console.warn('Could not persist practice attempt:', e);
    }

    if (onComplete) {
      onComplete(attempt);
    }
  };

  return (
    <div className="space-y-6">
      {/* Exercise Overview Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#C5F36B]/10 text-[#C5F36B] border border-[#C5F36B]/30 uppercase">
              Practical Exercise
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#F5F7FA] mt-1.5">
              {exercise.title}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#9AA4B2]">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target: ~1-2 min spoken length</span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
          {exercise.instructions}
        </p>

        {/* Prompt Callout */}
        <div className="p-4 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5F36B]">
            Exercise Prompt:
          </div>
          <p className="text-xs sm:text-sm font-semibold text-[#F5F7FA] leading-relaxed">
            {exercise.prompt}
          </p>
        </div>

        {/* Evaluation Rubric */}
        {exercise.evaluationRubric && exercise.evaluationRubric.length > 0 && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9AA4B2]">
              What Interviewers Evaluate in this Answer:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {exercise.evaluationRubric.map((r, idx) => (
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

        {/* Collapsible Starter Template & Model Answer */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {exercise.starterTemplate && (
            <button
              onClick={handleInsertTemplate}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-[#F5F7FA] transition-colors flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-cyan-400" />
              <span>Use Starter Template</span>
            </button>
          )}

          {exercise.sampleAnswer && (
            <button
              onClick={() => setShowSampleAnswer(!showSampleAnswer)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-[#9AA4B2] hover:text-[#F5F7FA] transition-colors flex items-center gap-1.5"
            >
              <span>{showSampleAnswer ? 'Hide Model Answer' : 'View Sample Model Answer'}</span>
              {showSampleAnswer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Model Answer Preview */}
        {showSampleAnswer && exercise.sampleAnswer && (
          <div className="p-4 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 text-xs text-emerald-200 leading-relaxed space-y-1 animate-in fade-in duration-200">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reference Model Answer (Indian Fresher Context):</span>
            </div>
            <p className="whitespace-pre-line text-[11px] sm:text-xs text-slate-200 mt-1">
              {exercise.sampleAnswer}
            </p>
          </div>
        )}
      </div>

      {/* Interactive Practice Workspace */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider">
              Your Practice Answer
            </span>
            {isRecording && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                <span>Recording ({recordingSeconds}s)</span>
              </span>
            )}
          </div>

          {/* Voice Mic Controls */}
          <div className="flex items-center gap-2">
            {speechSupported && (
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
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
                onClick={handleClear}
                className="px-2.5 py-1.5 rounded-xl text-xs text-[#9AA4B2] hover:text-rose-400 hover:bg-white/[0.04] transition-colors"
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
            value={responseDraft}
            onChange={(e) => setResponseDraft(e.target.value)}
            placeholder="Type or click 'Speak Answer' to practice delivering your response out loud..."
            rows={7}
            className="w-full p-4 rounded-2xl bg-[#121826] border border-white/[0.08] text-xs sm:text-sm text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus:outline-none focus:border-[#C5F36B] focus:ring-1 focus:ring-[#C5F36B] transition-all resize-y leading-relaxed"
          />
        </div>

        {/* Real-time Feedback & Word Stats */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#9AA4B2] pt-1">
          <div className="flex items-center gap-4 flex-wrap">
            <span>
              Words: <strong className="text-[#F5F7FA]">{wordCount}</strong>
            </span>
            <span>
              Estimated speech time:{' '}
              <strong className="text-[#F5F7FA]">~{estimatedSpeakMinutes} min</strong>
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
                className={`p-0.5 transition-colors ${
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
              <strong>Coaching Tip:</strong> You used filler words like {uniqueFillers.map(f => `"${f}"`).join(', ')}. Practice replacing these with a 2-second silent pause while collecting your next sentence.
            </span>
          </div>
        )}

        {/* Save & Finish Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
          <div className="text-[11px] text-[#9AA4B2]">
            {saveSuccess ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Practice response saved to your profile!</span>
              </span>
            ) : (
              <span>Your practice responses are stored privately on your device.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSaveAttempt}
              disabled={!trimmed}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#b0df57] disabled:opacity-40 disabled:cursor-not-allowed text-[#080B11] shadow-md shadow-[#C5F36B]/20 transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Practice Attempt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Previous Attempts History for this Lesson */}
      {existingAttempts.length > 0 && (
        <div className="p-5 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5F7FA] uppercase tracking-wider">
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span>Previous Attempts on this Exercise ({existingAttempts.length})</span>
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {existingAttempts.map((att, idx) => (
              <div key={att.id || idx} className="p-3 rounded-xl bg-[#121826] border border-white/[0.04] text-xs">
                <div className="flex items-center justify-between text-[11px] text-[#9AA4B2] mb-1">
                  <span>
                    Attempt #{existingAttempts.length - idx} • {new Date(att.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-1 text-[#C5F36B]">
                    {att.selfRating && <span>{att.selfRating} ★</span>}
                    {att.fillerWordCount !== undefined && (
                      <span className="text-[10px] text-[#9AA4B2] ml-2">
                        {att.fillerWordCount} fillers
                      </span>
                    )}
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

      {/* Bridge to Mock Interview Studio */}
      {onNavigateToMock && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-950/40 to-cyan-950/40 border border-violet-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F5F7FA]">
                Ready to test this with our live AI interviewer?
              </div>
              <div className="text-[11px] text-[#9AA4B2]">
                Take a simulated full mock interview round with real-time scoring and voice simulation.
              </div>
            </div>
          </div>
          <button
            onClick={onNavigateToMock}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/[0.08] hover:bg-white/[0.14] text-[#F5F7FA] border border-white/[0.12] transition-colors flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Launch Mock Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
