import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  CameraOff, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Clock, 
  Sparkles, 
  Send, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Pause, 
  Play, 
  AlertTriangle,
  UserCheck,
  Video,
  Shield,
  RotateCcw,
  Check,
  AlertCircle,
  Headphones,
  Radio,
  FileText,
  WifiOff,
  Wifi,
  RefreshCw
} from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import { createSpeechRecognition, tts } from '../services/speech';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { VoiceInterviewerOrb, OrbState } from '../components/VoiceInterviewerOrb';
import { BrandIcon } from '../components/brand/BrandIcon';
import { getBrowserVoiceCapabilities } from '../services/microphoneService';

interface InterviewRoomProps {
  onComplete: () => void;
  onExit: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({ onComplete, onExit }) => {
  const {
    activeSession,
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    elapsedSeconds,
    isEvaluating,
    isPaused,
    videoStream,
    mediaError,
    isCameraOn,
    isMicOn,
    toggleCamera,
    toggleMic,
    togglePause,
    submitAnswer,
    requestFollowUp,
    nextQuestion,
    previousQuestion,
    endInterview,
    isRecordingConsented,
    setConsentToRecord,
    releaseMedia,
    switchToTextMode,
    clearMediaError
  } = useInterview();

  const isVoiceOnly = activeSession?.config.mode === 'voice_only';
  const isTextOnly = activeSession?.config.mode === 'text_only';
  const isVideo = activeSession?.config.mode === 'video';

  // Voice & Transcript State
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [candidateTypedText, setCandidateTypedText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState<boolean>(true);
  const [detectedVoiceName, setDetectedVoiceName] = useState<string>('');
  const [isTestingSpeaker, setIsTestingSpeaker] = useState<boolean>(false);

  // Connectivity & Network Status (Lightweight 4G & Mobile Reliability)
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState<boolean>(false);

  // Browser capabilities detection (Safari / Firefox speech recognition check)
  const browserCaps = getBrowserVoiceCapabilities();
  const isUnsupportedBrowserForVoice = 
    !isTextOnly && 
    (browserCaps.browserName === 'Safari' || browserCaps.browserName === 'Firefox' || !browserCaps.hasSpeechRecognition);
  
  // Pre-interview check gate - Instant entry into interview room (streamlined transition)
  const [preflightPassed, setPreflightPassed] = useState<boolean>(true);
  const [consentAcknowledged, setConsentAcknowledged] = useState<boolean>(true);

  const orbState: OrbState = isEvaluating 
    ? 'thinking' 
    : isSpeakingQuestion 
    ? 'speaking' 
    : isListening 
    ? 'listening' 
    : 'idle';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const preflightVideoRef = useRef<HTMLVideoElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const hasTypedManually = useRef<boolean>(false);

  const getDraftKey = (sessionId?: string, qId?: string) =>
    `interviewbro_draft_${sessionId || activeSession?.id}_${qId || currentQuestion?.id}`;

  const saveDraftLocally = (text: string) => {
    if (!activeSession?.id || !currentQuestion?.id || !text || !text.trim()) return;
    try {
      localStorage.setItem(
        getDraftKey(),
        JSON.stringify({
          sessionId: activeSession.id,
          questionId: currentQuestion.id,
          text: text.trim(),
          savedAt: Date.now()
        })
      );
    } catch {
      // LocalStorage quota or access exception
    }
  };

  const clearDraftLocally = () => {
    if (!activeSession?.id || !currentQuestion?.id) return;
    try {
      localStorage.removeItem(getDraftKey());
    } catch {}
  };

  // Sync candidateAnswer to state when moving between questions, restoring local draft if present
  useEffect(() => {
    hasTypedManually.current = false;
    setNetworkError(null);
    setDraftRestored(false);
    const q = activeSession?.questions[currentQuestionIndex];
    if (q?.candidateAnswer) {
      setSpokenTranscript(q.candidateAnswer);
      setCandidateTypedText(q.candidateAnswer);
      setInterimText('');
    } else {
      // Check for locally saved draft from previous connection drops or accidental refresh
      const savedDraftJson = activeSession?.id && q?.id
        ? localStorage.getItem(`interviewbro_draft_${activeSession.id}_${q.id}`)
        : null;
      if (savedDraftJson) {
        try {
          const parsed = JSON.parse(savedDraftJson);
          if (parsed?.text) {
            setSpokenTranscript(parsed.text);
            setCandidateTypedText(parsed.text);
            setDraftRestored(true);
          } else {
            setSpokenTranscript('');
            setCandidateTypedText('');
          }
        } catch {
          setSpokenTranscript('');
          setCandidateTypedText('');
        }
      } else {
        setSpokenTranscript('');
        setCandidateTypedText('');
      }
      setInterimText('');
    }
    setSpeechError(null);
    setSubmissionError(null);
    if (recognitionRef.current?.reset) {
      recognitionRef.current.reset();
    }
  }, [currentQuestionIndex, activeSession?.id]);

  // Auto-save local draft whenever candidate transcript or typed text updates
  useEffect(() => {
    const textToSave = candidateTypedText.trim() || spokenTranscript.trim();
    if (textToSave && !currentQuestion?.candidateAnswer) {
      saveDraftLocally(textToSave);
    }
  }, [spokenTranscript, candidateTypedText, currentQuestion?.id]);

  // Network online/offline event listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkError(null);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setNetworkError('Network connection lost (4G / Wi-Fi disconnected). Your answer draft is saved locally on this device.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Hook up video stream to local HTML video elements (only in video mode)
  useEffect(() => {
    if (isVideo) {
      if (videoRef.current && videoStream) {
        videoRef.current.srcObject = videoStream;
      }
      if (preflightVideoRef.current && videoStream) {
        preflightVideoRef.current.srcObject = videoStream;
      }
    }
  }, [videoStream, isCameraOn, preflightPassed, isVideo]);

  // Initialize Speech Recognition & TTS voices, and ensure hardware tracks are released on unmount
  useEffect(() => {
    tts.warmup();
    const recognition = createSpeechRecognition();
    recognitionRef.current = recognition;
    setSpeechRecognitionSupported(recognition.isSupported);
    setDetectedVoiceName(tts.getSelectedVoiceName());

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      tts.stop();
      releaseMedia();
    };
  }, []);

  const handleExit = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    tts.stop();
    releaseMedia();
    onExit();
  };

  // Automatically speak the question aloud when question changes (only in voice/video modes, not text_only)
  useEffect(() => {
    if (!preflightPassed || !currentQuestion || isPaused || isTextOnly) return;

    // Fast conversational turn: speak question promptly without unnecessary lag
    const timer = setTimeout(() => {
      speakCurrentQuestion();
    }, 350);

    return () => {
      clearTimeout(timer);
      tts.stop();
    };
  }, [currentQuestionIndex, preflightPassed, isPaused, isTextOnly]);

  const speakCurrentQuestion = () => {
    if (!currentQuestion) return;
    
    // Stop candidate mic while interviewer is speaking to prevent acoustic feedback / overlap
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsSpeakingQuestion(true);
    tts.speak(currentQuestion.questionText, {
      rate: 0.96, // natural conversational cadence
      onStart: () => setIsSpeakingQuestion(true),
      onEnd: () => {
        setIsSpeakingQuestion(false);
        // Prompt candidate to speak after question finishes (only in voice or video mode)
        if (!currentQuestion.candidateAnswer && !isTextOnly) {
          startSpeechCapture();
        }
      },
      onError: () => setIsSpeakingQuestion(false)
    });
  };

  const handleToggleQuestionAudio = () => {
    if (isSpeakingQuestion) {
      tts.stop();
      setIsSpeakingQuestion(false);
    } else {
      speakCurrentQuestion();
    }
  };

  const testSpeaker = () => {
    if (isTestingSpeaker) return;
    setIsTestingSpeaker(true);
    tts.speak('Audio check. The interviewer audio is working properly.', {
      rate: 1.0,
      onEnd: () => setIsTestingSpeaker(false),
      onError: () => setIsTestingSpeaker(false)
    });
  };

  const startSpeechCapture = () => {
    if (!recognitionRef.current?.isSupported) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    // Stop interviewer speech if candidate begins speaking
    if (isSpeakingQuestion) {
      tts.stop();
      setIsSpeakingQuestion(false);
    }

    setSpeechError(null);
    setIsListening(true);

    recognitionRef.current.start(
      (fullText: string, interimChunk: string, isFinal: boolean) => {
        if (fullText) {
          setSubmissionError(null);
        }
        setSpokenTranscript(fullText);
        // In video mode, update typed text as well unless candidate has manually edited it
        if (!isVoiceOnly && !hasTypedManually.current) {
          setCandidateTypedText(fullText);
        }
        setInterimText(interimChunk);
        if (isFinal) {
          setInterimText('');
        }
      },
      (errType: string, userMsg: string) => {
        setSpeechError(userMsg);
        if (errType !== 'no-speech' && errType !== 'aborted') {
          setIsListening(false);
        }
      },
      (status: string) => {
        if (status === 'stopped') {
          setIsListening(false);
        }
      }
    );
  };

  const stopSpeechCapture = () => {
    if (recognitionRef.current) {
      const latest = recognitionRef.current.getLatestTranscript?.() || '';
      recognitionRef.current.stop();
      if (latest) {
        setSpokenTranscript(latest);
        if (!isVoiceOnly && !hasTypedManually.current) {
          setCandidateTypedText(latest);
        }
      }
    }
    setIsListening(false);
    setInterimText('');
  };

  const handleClearAndRespeak = () => {
    hasTypedManually.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setSpokenTranscript('');
    setCandidateTypedText('');
    setInterimText('');
    setSpeechError(null);
    setSubmissionError(null);
    startSpeechCapture();
  };

  // Compute effective answer based on mode
  const effectiveAnswer = (
    isTextOnly
      ? candidateTypedText
      : isVoiceOnly 
      ? (spokenTranscript + (interimText ? ' ' + interimText : '')) 
      : (candidateTypedText || spokenTranscript + (interimText ? ' ' + interimText : ''))
  ).trim();

  const wordCount = effectiveAnswer.split(/\s+/).filter(Boolean).length;

  const handleSubmit = async () => {
    if (isEvaluating || isSubmitting) return;

    // 1. Immediately halt recording and TTS to freeze audio states
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    tts.stop();

    // 2. Resolve latest transcript from service or React state
    const serviceTranscript = recognitionRef.current?.getLatestTranscript?.() || '';
    const resolvedSpoken = (
      serviceTranscript ||
      spokenTranscript ||
      interimText ||
      ''
    ).trim();

    if (resolvedSpoken && resolvedSpoken !== spokenTranscript) {
      setSpokenTranscript(resolvedSpoken);
    }
    setInterimText('');

    const effectiveCandidateAnswer = (
      isTextOnly
        ? candidateTypedText.trim()
        : isVoiceOnly
        ? resolvedSpoken
        : (candidateTypedText.trim() || resolvedSpoken)
    ).trim();

    // 3. Validation: if empty, show helpful message and do not submit
    if (!effectiveCandidateAnswer) {
      setSubmissionError(
        isTextOnly
          ? 'Please enter your answer in the response box before submitting.'
          : isVoiceOnly
          ? 'No spoken answer was detected. Please click "Start Speaking Answer", speak clearly into your microphone, and then click submit.'
          : 'Please provide or speak an answer before submitting.'
      );
      return;
    }

    // Immediately save local draft to protect candidate against network loss
    saveDraftLocally(effectiveCandidateAnswer);
    setSubmissionError(null);

    // If device reports offline before submitting, notify immediately without losing draft
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setNetworkError('No internet connection. Your answer is safely saved locally. Tap "Retry Submission" when your 4G / Wi-Fi connection returns.');
      return;
    }

    setIsSubmitting(true);
    setNetworkError(null);

    try {
      const res = await submitAnswer(effectiveCandidateAnswer);
      if (!res.success) {
        setSubmissionError(res.error || 'Failed to record answer. Please try submitting again.');
      } else {
        setSubmissionError(null);
        setNetworkError(null);
        clearDraftLocally();
        setDraftRestored(false);
        setCandidateTypedText('');
        setSpokenTranscript('');
        setInterimText('');

        if (currentQuestionIndex < totalQuestions - 1) {
          // Seamlessly advance to the next interview question
          nextQuestion();
        } else {
          // Final question answered: finish interview and synthesize comprehensive final report
          stopSpeechCapture();
          tts.stop();
          const report = await endInterview();
          if (report) {
            onComplete();
          }
        }
      }
    } catch (e: any) {
      setNetworkError('Your answer is safely saved on this device. Please continue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRef = useRef(handleSubmit);
  handleSubmitRef.current = handleSubmit;

  // Support Ctrl+Enter / Cmd+Enter keyboard shortcut for answer submission
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSubmitRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);



  const handleFinishEarly = async () => {
    if (confirm('Finish this interview and generate your performance report?')) {
      stopSpeechCapture();
      tts.stop();
      const report = await endInterview();
      if (report) {
        onComplete();
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!activeSession || !currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-[#F5F7FA]">No Active Session Found</h2>
        <p className="text-sm text-[#9AA4B2]">Please configure your interview parameters first.</p>
        <button
          onClick={onExit}
          className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[#C5F36B] hover:bg-[#b5e858] text-[#080B11] shadow-lg shadow-[#C5F36B]/10 transition-all"
        >
          Go to Interview Setup
        </button>
      </div>
    );
  }

  // PRE-FLIGHT CHECK GATE
  if (!preflightPassed) {
    if (isTextOnly) {
      return (
        <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-12 space-y-4 sm:space-y-6 text-center w-full max-w-full overflow-x-hidden">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Text-Based Mode Ready</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA]">
            Distraction-Free Interview Practice
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA4B2] max-w-lg mx-auto">
            You are ready to begin. The interviewer will present questions on screen, and you can formulate and submit your responses. Structured STAR evaluation and objective competency scoring are active.
          </p>

          <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] max-w-md mx-auto space-y-3 text-left">
            <div className="flex items-center justify-between text-xs text-[#9AA4B2] border-b border-white/[0.08] pb-2.5">
              <span>Target Role:</span>
              <strong className="text-[#F5F7FA]">{activeSession.config.role}</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-[#9AA4B2] border-b border-white/[0.08] pb-2.5">
              <span>Company:</span>
              <strong className="text-[#F5F7FA]">{activeSession.config.companyName}</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-[#9AA4B2] border-b border-white/[0.08] pb-2.5">
              <span>Questions:</span>
              <strong className="text-[#F5F7FA]">{activeSession.questions.length}</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-[#9AA4B2]">
              <span>Microphone & Camera:</span>
              <span className="text-emerald-400 font-semibold">Bypassed (Not Required)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleExit}
              className="w-full sm:w-auto px-5 py-3 rounded-xl font-semibold text-xs bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 transition-colors"
            >
              Back to Setup
            </button>
            <button
              type="button"
              onClick={() => setPreflightPassed(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs bg-[#C5F36B] hover:bg-[#b5e858] text-[#080B11] inline-flex items-center justify-center gap-2 shadow-lg shadow-[#C5F36B]/15 transition-all"
            >
              <span>Enter Text Interview Room</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 sm:py-8 space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-semibold">
            {isVoiceOnly ? <Mic className="w-3.5 h-3.5 text-violet-400" /> : <Headphones className="w-3.5 h-3.5 text-violet-400" />}
            <span>{isVoiceOnly ? 'Dedicated Voice-Only Pre-Flight Readiness' : 'Video Interview Pre-Flight Readiness'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {isVoiceOnly ? 'Audio & Microphone Readiness' : 'Camera & Microphone Readiness'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            {isVoiceOnly 
              ? 'In this dedicated voice mode, all questions are spoken aloud and you respond verbally via your microphone. Please verify your audio settings below.'
              : 'Verify your camera stream and microphone input below before entering your live mock interview session.'}
          </p>
        </div>

        {/* Actionable Hardware Error Banner if getUserMedia failed */}
        {mediaError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs space-y-3">
            <div className="flex items-start gap-2.5 text-rose-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
              <div className="space-y-1">
                <strong className="block text-white font-bold text-sm">{mediaError.title}</strong>
                <p className="text-rose-200 leading-relaxed">{mediaError.message}</p>
                <p className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <strong className="text-amber-300">Suggested Action:</strong> {mediaError.actionHint}
                </p>
              </div>
            </div>

            <div className="pt-1 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  switchToTextMode();
                  setPreflightPassed(true);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
              >
                <FileText className="w-4 h-4" />
                <span>Switch to Text-Based Mode (No Mic Needed)</span>
              </button>
            </div>
          </div>
        )}

        {/* Device Check Grid */}
        <div className={`grid grid-cols-1 ${isVoiceOnly ? 'max-w-xl mx-auto' : 'md:grid-cols-2'} gap-6`}>
          {/* Camera Preview (Video Mode Only) */}
          {!isVoiceOnly && (
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-violet-400" />
                  <span>Webcam Check</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isCameraOn ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {isCameraOn ? 'Camera Active' : 'Camera Off'}
                </span>
              </div>

              <div className="relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                {videoStream && isCameraOn ? (
                  <video
                    ref={preflightVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                ) : (
                  <div className="text-center p-4">
                    <CameraOff className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Webcam stream inactive</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={toggleCamera}
                className="w-full py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                {isCameraOn ? 'Disable Camera' : 'Enable Camera'}
              </button>
            </div>
          )}

          {/* Microphone & Voice Engine Check */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Mic className="w-4 h-4 text-cyan-400" />
                  <span>Microphone & Voice Engine</span>
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  speechRecognitionSupported ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {speechRecognitionSupported ? 'STT Active' : 'STT Unsupported'}
                </span>
              </div>

              {/* Live Audio Level Meter */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Microphone Input Level:</span>
                  <span className={isMicOn && videoStream ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                    {isMicOn && videoStream ? 'Listening to voice' : 'No Active Mic Stream'}
                  </span>
                </div>
                <AudioVisualizer stream={videoStream} isActive={isMicOn} />
                <p className="text-[10px] text-slate-500">
                  Speak a few words to confirm the frequency bars respond to your voice.
                </p>
              </div>

              {/* AI Voice Info & Speaker Test */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Interviewer Voice:</span>
                  <button
                    type="button"
                    onClick={testSpeaker}
                    disabled={isTestingSpeaker}
                    className="text-[11px] text-violet-400 hover:text-violet-300 font-semibold flex items-center gap-1"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>{isTestingSpeaker ? 'Testing...' : 'Test Speaker Audio'}</span>
                  </button>
                </div>
                <div className="font-semibold text-violet-300 truncate">
                  {detectedVoiceName || 'Browser Natural Speech Synthesis'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleMic}
              className="w-full py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              {isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            </button>
          </div>
        </div>

        {!speechRecognitionSupported && (
          <div className="p-3.5 sm:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300 font-bold">Browser Speech Recognition Not Supported</strong>
                <p className="text-[11px] text-amber-200/80 mt-0.5">
                  Your current browser does not support continuous speech recognition. Please <strong>use Chrome or type your answer</strong> by switching to Text-Based Mode.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                switchToTextMode();
                setPreflightPassed(true);
              }}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Switch to Text Mode</span>
            </button>
          </div>
        )}

        {/* Start Button & Escape Hatch */}
        <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-[#F5F7FA]">
              {isVoiceOnly ? 'Ready for your voice interview?' : 'Ready for your video interview?'}
            </div>
            <div className="text-xs text-[#9AA4B2] mt-0.5">
              {activeSession.config.companyName} • {activeSession.config.role} ({activeSession.questions.length} questions)
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPreflightPassed(true)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs bg-[#C5F36B] hover:bg-[#b5e858] text-[#080B11] flex items-center justify-center gap-2 shadow-lg shadow-[#C5F36B]/15 transition-all"
          >
            <span>{isVoiceOnly ? 'Enter Dedicated Voice Room' : 'Enter Live Video Room'}</span>
            <Check className="w-4 h-4" />
          </button>
        </div>

        {/* Graceful Fallback Link */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => {
              switchToTextMode();
              setPreflightPassed(true);
            }}
            className="text-xs text-slate-400 hover:text-white underline font-medium transition-colors"
          >
            Microphone unavailable or in a noisy space? Switch to Text-Based Mode
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-3 sm:py-4 space-y-3 sm:space-y-4 w-full max-w-full overflow-x-hidden">
      {/* Unsupported Browser Notice (Safari / Firefox) with Smooth Text Mode Fallback */}
      {isUnsupportedBrowserForVoice && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-sm">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">
                Voice recognition is not fully supported in {browserCaps.browserName || 'this browser'}.
              </span>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                For the best voice experience, please <strong>use Google Chrome</strong> (on Android or desktop), or type your answers directly using Text Mode.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={switchToTextMode}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center justify-center gap-1.5 shadow transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Switch to Text Mode</span>
          </button>
        </div>
      )}

      {/* Network Drop & Local Draft Friendly Retry Banner */}
      {(networkError || !isOnline) && (
        <div className="p-3 sm:p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-md">
          <div className="flex items-start gap-2.5">
            <WifiOff className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-rose-300">
                  {!isOnline ? 'Network Connection Lost (Offline)' : 'Network Connection Dropped'}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Draft Saved Locally
                </span>
              </div>
              <p className="text-[11px] text-rose-200/80 mt-0.5">
                Your transcript draft has been saved safely on your phone. When your 4G / Wi-Fi signal reconnects, tap Retry to evaluate without losing your response.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              disabled={isSubmitting || isEvaluating}
              onClick={handleSubmit}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-[#C5F36B] hover:bg-[#b5e858] text-[#080B11] font-bold text-xs flex items-center justify-center gap-1.5 shadow transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
              <span>Retry Submission</span>
            </button>
          </div>
        </div>
      )}

      {/* Restored Draft Alert Banner */}
      {draftRestored && (
        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span>Restored your saved answer draft from this device.</span>
          </div>
          <button
            type="button"
            onClick={() => setDraftRestored(false)}
            className="text-[10px] text-emerald-400/80 hover:text-emerald-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Demo Mode / AI Unavailable Banner */}
      {(currentQuestion?.source === 'fallback' || activeSession.questions.some(q => q.source === 'fallback')) && (
        <div className="p-3 sm:p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs text-amber-300">
            <span className="font-bold text-amber-200">Demo mode: AI scoring unavailable. This is not a real evaluation.</span>
            <span className="block text-[11px] text-amber-300/80 mt-0.5">
              Live AI evaluation is offline. Question prompts and heuristic feedback are active for practice, but numeric scores are disabled to prevent fabricated metrics.
            </span>
          </div>
        </div>
      )}
      {/* Privacy & Recording Consent Notice */}
      {!consentAcknowledged && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-violet-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <strong className="text-white">Privacy & Local Processing:</strong> Your audio is processed locally in your browser. Would you like to enable local session recording for self-review playback?
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setConsentToRecord(true);
                setConsentAcknowledged(true);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
            >
              Consent & Enable
            </button>
            <button
              onClick={() => {
                setConsentToRecord(false);
                setConsentAcknowledged(true);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Practice Without Recording
            </button>
          </div>
        </div>
      )}

      {/* Actionable Hardware Error Banner if getUserMedia failed in active room */}
      {mediaError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs space-y-3">
          <div className="flex items-start gap-2.5 text-rose-300">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <div className="space-y-1">
              <strong className="block text-white font-bold text-sm">{mediaError.title}</strong>
              <p className="text-rose-200 leading-relaxed">{mediaError.message}</p>
              <p className="text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <strong className="text-amber-300">Suggested Action:</strong> {mediaError.actionHint}
              </p>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                switchToTextMode();
                clearMediaError();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-900/30"
            >
              <FileText className="w-4 h-4" />
              <span>Switch to Text-Based Mode (No Mic Needed)</span>
            </button>
            <button
              type="button"
              onClick={() => setPreflightPassed(false)}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Open Equipment Troubleshooter
            </button>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl bg-[#121826] border border-white/[0.08] shadow-md w-full">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <BrandIcon size="sm" glow={false} />
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-[#F5F7FA] truncate">
              {activeSession.config.companyName} • {activeSession.config.role}
            </h2>
            <div className="text-[10px] sm:text-[11px] text-[#9AA4B2] flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="capitalize">{activeSession.config.interviewType} Round</span>
              <span>•</span>
              <span className="capitalize">{isTextOnly ? 'Text' : isVoiceOnly ? 'Voice' : 'Video'}</span>
              <span>•</span>
              <span className="capitalize">{activeSession.config.difficulty}</span>
              {currentQuestion.isFollowUp && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold text-[9px] sm:text-[10px]">
                  Follow-Up
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Question Progress & Timer */}
        <div className="flex items-center justify-between sm:justify-center gap-2.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
          <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#080B11] border border-white/[0.08] flex items-center gap-1.5 sm:gap-2 text-xs font-mono">
            <Clock className={`w-3.5 h-3.5 ${isPaused ? 'text-amber-400' : 'text-[#C5F36B] animate-pulse'}`} />
            <span className="text-[#F5F7FA] font-bold">{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="text-[11px] sm:text-xs text-[#9AA4B2]">
            Q <strong className="text-[#F5F7FA]">{currentQuestionIndex + 1}</strong> of <strong>{totalQuestions}</strong>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
          {!isTextOnly && (
            <button
              type="button"
              onClick={() => setPreflightPassed(false)}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Test microphone input level and sound"
            >
              <Headphones className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Audio Check</span>
            </button>
          )}

          {!isTextOnly && (
            <button
              type="button"
              onClick={switchToTextMode}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Switch to typing mode without losing interview progress"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Text Mode</span>
            </button>
          )}

          <button
            onClick={togglePause}
            className={`p-1.5 sm:p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isPaused 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                : 'bg-white/[0.06] hover:bg-white/[0.1] border-white/[0.08] text-slate-300 hover:text-white'
            }`}
            title={isPaused ? 'Resume Interview' : 'Pause Interview'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={handleFinishEarly}
            disabled={isEvaluating}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <span className="inline sm:hidden">End</span>
            <span className="hidden sm:inline">End & Report</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Interaction Column, Right AI Question & Response Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {isTextOnly ? (
            /* Dedicated Text-Based Interface Hub */
            <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-2 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Text-Based Interview Hub</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  Mic-Free Mode
                </span>
              </div>

              {/* Central AI Evaluator Orb */}
              <div className="py-4 flex flex-col items-center justify-center space-y-4">
                <VoiceInterviewerOrb
                  state={orbState}
                  size="xl"
                  interviewerName="Lead Technical Interviewer"
                  company={activeSession.config.companyName}
                />

                <div className="w-full max-w-xs space-y-1 text-center">
                  <div className="text-xs font-semibold text-[#F5F7FA]">
                    {activeSession.config.companyName} • {activeSession.config.role}
                  </div>
                  <div className="text-[11px] text-[#9AA4B2]">
                    Type your answer in the response editor and submit when ready.
                  </div>
                </div>
              </div>

              {/* Spoken Question Audio Player */}
              <div className="p-3.5 rounded-xl bg-[#080B11] border border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-[#9AA4B2]">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <span>Interviewer Speech:</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleQuestionAudio}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border border-white/[0.08] transition-colors"
                >
                  {isSpeakingQuestion ? 'Stop Audio' : 'Play Question Aloud'}
                </button>
              </div>

              {/* Tips Banner */}
              <div className="p-3.5 rounded-xl bg-[#080B11] border border-white/[0.08] text-[11px] text-[#9AA4B2] space-y-1">
                <div className="text-[#F5F7FA] font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Typing Answer Tips</span>
                </div>
                <p className="leading-relaxed">
                  Be clear and structured. Explain your architectural choices, trade-offs, and metrics. Press <strong>Ctrl+Enter</strong> to submit immediately.
                </p>
              </div>
            </div>
          ) : isVoiceOnly ? (
            /* Dedicated Voice-Only Interface Hub */
            <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#F5F7FA] flex items-center gap-2 uppercase tracking-wider">
                  <Radio className="w-4 h-4 text-[#C5F36B] animate-pulse" />
                  <span>Voice Interview Channel</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isSpeakingQuestion 
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                    : isListening 
                    ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse'
                    : 'bg-white/[0.06] text-slate-400 border-white/[0.08]'
                }`}>
                  {isSpeakingQuestion ? 'Interviewer Speaking' : isListening ? 'Listening to You' : 'Mic Ready'}
                </span>
              </div>

              {/* Central Voice Interviewer Orb */}
              <div className="py-4 flex flex-col items-center justify-center space-y-4">
                <VoiceInterviewerOrb
                  state={orbState}
                  size="xl"
                  interviewerName="Lead Technical Interviewer"
                  company={activeSession.config.companyName}
                />

                <div className="w-full max-w-xs space-y-1 text-center">
                  <AudioVisualizer stream={videoStream} isActive={isMicOn && !isPaused && isListening} />
                  <div className="text-[11px] text-[#9AA4B2] pt-1">
                    {isSpeakingQuestion 
                      ? 'Listen to the question... (Microphone pauses while interviewer speaks)' 
                      : isListening 
                      ? 'Listening to your response — speak clearly' 
                      : 'Microphone on standby'}
                  </div>
                </div>
              </div>

              {/* Voice Actions Toolbar */}
              <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={isListening ? stopSpeechCapture : startSpeechCapture}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      : 'bg-[#C5F36B] hover:bg-[#b5e858] text-[#080B11] shadow-lg shadow-[#C5F36B]/15'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isListening ? 'Done Speaking (Pause Mic)' : 'Start Speaking Answer'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
                    isMicOn ? 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border-white/[0.08]' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                  title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Voice Mode Rules Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-2">
                <div className="text-white font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>Voice Interview Guidelines</span>
                </div>
                <p className="leading-relaxed">
                  Your response is evaluated on technical correctness, structured reasoning, and communication clarity.
                </p>
                <div className="pt-1 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={switchToTextMode}
                    className="text-[11px] text-violet-400 hover:text-violet-300 underline font-medium transition-colors"
                  >
                    Microphone issue or noisy room? Switch to Text-Based Mode
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Video Mode Webcam Box with AI Interviewer Overlay */
            <>
              <div className="relative aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl flex flex-col items-center justify-center">
                {videoStream && isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover -scale-x-100"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                      <CameraOff className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-300">Camera is turned off</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Click below to toggle camera access</p>
                    </div>
                  </div>
                )}

                {/* Overlaid Candidate Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-medium border border-white/10 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                    {isPaused ? 'Paused' : 'Live Interview'}
                  </span>
                  {isRecordingConsented && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/80 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1">
                      REC
                    </span>
                  )}
                </div>

                {/* AI Interviewer Picture-in-Picture Avatar */}
                <div className="absolute top-3 right-3 p-2 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 shadow-2xl flex flex-col items-center">
                  <VoiceInterviewerOrb
                    state={orbState}
                    size="sm"
                    interviewerName="Lead Interviewer"
                    company={activeSession.config.companyName}
                  />
                </div>

                {/* Floating AV Controls */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10">
                  <button
                    type="button"
                    onClick={toggleCamera}
                    className={`p-2 rounded-full transition-colors ${
                      isCameraOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                    title={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
                  >
                    {isCameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleMic}
                    className={`p-2 rounded-full transition-colors ${
                      isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                    title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Audio Waveform Visualizer */}
              <div className="flex items-center justify-between">
                <AudioVisualizer stream={videoStream} isActive={isMicOn && !isPaused} />
                <span className={`text-[11px] font-medium flex items-center gap-1.5 ${
                  isMicOn ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isMicOn && !isPaused ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                  {isMicOn ? 'Microphone Active' : 'Microphone Muted'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Right Column: AI Question & Response Interface (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* AI Question Box */}
          <div className={`p-5 sm:p-6 rounded-2xl bg-[#121826] border shadow-xl space-y-3 transition-colors ${
            isSpeakingQuestion ? 'border-[#C5F36B]/60 ring-2 ring-[#C5F36B]/20' : 'border-white/[0.12]'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-[#C5F36B]">
                  <UserCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider">
                  Lead Interviewer {isSpeakingQuestion && '(Speaking...)'}
                </span>
              </div>

              {/* Replay Question Button */}
              <button
                type="button"
                onClick={handleToggleQuestionAudio}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSpeakingQuestion
                    ? 'bg-rose-600/20 text-rose-300 border-rose-500/40'
                    : 'bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 border-white/[0.08]'
                }`}
                title="Replay spoken question"
              >
                {isSpeakingQuestion ? <VolumeX className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>{isSpeakingQuestion ? 'Stop Audio' : 'Replay Question'}</span>
              </button>
            </div>

            {currentQuestion.isFollowUp && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold text-[10px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Follow-Up Deep Dive</span>
                </span>
                {currentQuestion.followUpReason && (
                  <span className="text-[11px] text-[#9AA4B2] italic">
                    Reason: {currentQuestion.followUpReason}
                  </span>
                )}
              </div>
            )}

            <p className="text-lg sm:text-xl font-bold text-[#F5F7FA] leading-relaxed">
              {currentQuestion.questionText}
            </p>

            {currentQuestion.contextOrHints && (
              <div className="pt-2 text-xs text-[#9AA4B2] flex items-start gap-1.5 border-t border-white/[0.06]">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Context / Key Competencies:</span>
                <span>{currentQuestion.contextOrHints}</span>
              </div>
            )}
          </div>

          {/* Response Panel */}
          <div className="p-3.5 sm:p-5 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-3 sm:space-y-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <label className="text-xs font-bold text-[#F5F7FA] flex items-center gap-2">
                  <span>Candidate Response</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    isTextOnly
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : isVoiceOnly
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-white/[0.06] text-slate-300 border-white/[0.08]'
                  }`}>
                    {isTextOnly ? 'Text Mode (Typing Only)' : isVoiceOnly ? 'Voice Mandatory' : 'Voice / Text Hybrid'}
                  </span>
                </label>
                <div className="text-[11px] text-[#9AA4B2] mt-0.5">
                  {isTextOnly 
                    ? 'Type your structured response. Press Ctrl+Enter when ready to submit.'
                    : isVoiceOnly 
                    ? 'Speak your answer verbally. Speech recognition transcribes your words in real time.'
                    : 'Speak your answer using the microphone or edit directly in the response box.'}
                </div>
              </div>

              {/* Dictation Toggle Button (Only in voice/video modes) */}
              {!isTextOnly && (
                <button
                  type="button"
                  onClick={isListening ? stopSpeechCapture : startSpeechCapture}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isListening ? 'Done Speaking' : 'Start Speaking'}</span>
                </button>
              )}
            </div>

            {/* Speech Recognition Error Notification with Text Mode Fallback */}
            {speechError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{speechError}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={startSpeechCapture}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-semibold"
                  >
                    Try Mic Again
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      switchToTextMode();
                      setSpeechError(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow"
                  >
                    <FileText className="w-3 h-3" />
                    <span>Switch to Text Mode</span>
                  </button>
                </div>
              </div>
            )}

            {/* Answer Display: Text-Only Editor vs Voice-Only Transcript vs Video Editable Textarea */}
            {isTextOnly ? (
              /* Text-Based Mode: Direct Rich Typing Editor */
              <div className="space-y-2">
                <textarea
                  rows={6}
                  value={candidateTypedText}
                  onChange={(e) => setCandidateTypedText(e.target.value)}
                  placeholder="Type your technical response here (Ctrl+Enter to submit)..."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl+Enter</kbd> to submit</span>
                  <span>{candidateTypedText.length} characters • {wordCount} words</span>
                </div>
              </div>
            ) : isVoiceOnly ? (
              /* Voice-Only Mode: Live Spoken Transcript (Typing disabled) */
              <div className="space-y-1.5">
                <div className="relative min-h-[140px] max-h-[220px] p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-y-auto font-sans">
                  {effectiveAnswer ? (
                    <div className="text-sm text-slate-100 leading-relaxed">
                      <span>{spokenTranscript}</span>
                      {interimText && (
                        <span className="text-violet-400 italic"> {interimText}</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center py-6 text-slate-500 space-y-2">
                      <Mic className={`w-8 h-8 ${isListening ? 'text-violet-400 animate-pulse' : 'text-slate-600'}`} />
                      <p className="text-xs">
                        {isListening 
                          ? 'Listening to your microphone... Speak clearly.' 
                          : 'Click "Start Speaking" or use microphone to dictate your verbal answer.'}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Microphone voice transcription active</span>
                  <button
                    type="button"
                    onClick={switchToTextMode}
                    className="text-violet-400 hover:text-violet-300 underline font-medium transition-colors"
                  >
                    Microphone trouble? Switch to Text-Based Mode
                  </button>
                </div>
              </div>
            ) : (
              /* Video Mode: Editable Textarea (Speech + Text Fallback) */
              <div className="space-y-1">
                <textarea
                  rows={5}
                  value={candidateTypedText || spokenTranscript}
                  onChange={(e) => {
                    hasTypedManually.current = true;
                    setCandidateTypedText(e.target.value);
                  }}
                  placeholder="Speak via microphone or type your technical answer here..."
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 leading-relaxed"
                />
                {interimText && (
                  <div className="text-xs text-violet-400 italic px-2">
                    Transcribing: {interimText}...
                  </div>
                )}
              </div>
            )}

            {/* Inline Submission Error Banner */}
            {submissionError && (
              <div 
                role="alert"
                aria-live="assertive"
                className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between gap-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span className="font-semibold">{submissionError}</span>
                </div>
                {effectiveAnswer && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-2.5 py-1 rounded-lg bg-rose-500/25 hover:bg-rose-500/35 text-white text-[11px] font-semibold shrink-0 transition-colors"
                  >
                    Retry Submit
                  </button>
                )}
              </div>
            )}

            {/* Actions & Submit Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <span className={`text-[11px] font-medium ${
                  wordCount > 0 ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  Answer: <strong>{wordCount} {wordCount === 1 ? 'word' : 'words'}</strong>
                </span>

                {effectiveAnswer && (
                  <button
                    type="button"
                    onClick={handleClearAndRespeak}
                    className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear & Re-speak</span>
                  </button>
                )}
              </div>

              {/* Submit & Follow-Up Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  disabled={isEvaluating || isSubmitting}
                  onClick={handleSubmit}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#C5F36B] hover:bg-[#b5e858] text-[#080B11] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#C5F36B]/15 transition-transform active:scale-[0.98]"
                  title="Submit your answer for evaluation (Ctrl+Enter)"
                >
                  {isEvaluating || isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#080B11] border-t-transparent rounded-full animate-spin"></div>
                      <span>{isVoiceOnly ? 'Reviewing Spoken Response...' : 'Reviewing Response...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isVoiceOnly ? 'Submit Spoken Answer' : 'Submit Answer'}</span>
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-black/20 border border-black/20 rounded text-[#080B11] font-bold ml-1">
                        Ctrl+↵
                      </kbd>
                    </>
                  )}
                </button>

                {/* Follow-Up Probe */}
                {currentQuestion.candidateAnswer && !currentQuestion.isFollowUp && (
                  <button
                    type="button"
                    disabled={isEvaluating || isSubmitting}
                    onClick={requestFollowUp}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl font-medium text-xs bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-[#F5F7FA] transition-colors flex items-center justify-center gap-1.5"
                    title="Explore deeper with a realistic follow-up question"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Explore Follow-Up Question</span>
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={previousQuestion}
                disabled={currentQuestionIndex === 0}
                className="px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white text-xs flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="px-4 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white text-xs font-semibold flex items-center gap-1"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishEarly}
                  disabled={isEvaluating}
                  className="px-4 py-1.5 rounded-lg font-bold text-xs bg-[#C5F36B] hover:bg-[#b5e858] text-[#080B11] transition-colors shadow-md shadow-[#C5F36B]/10"
                >
                  Finish Interview
                </button>
              )}
            </div>
          </div>

          {/* Answer Recorded Confirmation Banner (No intermediate report; full report given on completion) */}
          {currentQuestion.candidateAnswer && (
            <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Response recorded for Question {currentQuestionIndex + 1} of {totalQuestions}. Performance scores and full debrief will be provided in your <strong>Final Performance Report</strong> at the end of the session.
                </span>
              </div>
              {currentQuestionIndex < totalQuestions - 1 && (
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/[0.08] hover:bg-white/[0.14] text-white flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
