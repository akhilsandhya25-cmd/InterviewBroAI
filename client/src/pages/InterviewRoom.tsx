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
  Bot,
  Video,
  Shield,
  RotateCcw,
  Check,
  AlertCircle,
  Headphones,
  Radio,
  FileText
} from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import { createSpeechRecognition, tts } from '../services/speech';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { VoiceInterviewerOrb, OrbState } from '../components/VoiceInterviewerOrb';
import { BrandIcon } from '../components/brand/BrandIcon';

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
  
  // Pre-interview check gate
  const [preflightPassed, setPreflightPassed] = useState<boolean>(isTextOnly);
  const [consentAcknowledged, setConsentAcknowledged] = useState<boolean>(isRecordingConsented || isTextOnly);

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
  const evaluationSectionRef = useRef<HTMLDivElement | null>(null);
  const hasTypedManually = useRef<boolean>(false);

  // Sync candidateAnswer to state when moving between questions
  useEffect(() => {
    hasTypedManually.current = false;
    const q = activeSession?.questions[currentQuestionIndex];
    if (q?.candidateAnswer) {
      setSpokenTranscript(q.candidateAnswer);
      setCandidateTypedText(q.candidateAnswer);
      setInterimText('');
    } else {
      setSpokenTranscript('');
      setCandidateTypedText('');
      setInterimText('');
    }
    setSpeechError(null);
    setSubmissionError(null);
    if (recognitionRef.current?.reset) {
      recognitionRef.current.reset();
    }
  }, [currentQuestionIndex, activeSession?.id]);

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

    // Small natural delay so candidate perceives conversational turn
    const timer = setTimeout(() => {
      speakCurrentQuestion();
    }, 600);

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
    tts.speak('Audio check. The AI interviewer voice is working properly.', {
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

    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const res = await submitAnswer(effectiveCandidateAnswer);
      if (!res.success) {
        setSubmissionError(res.error || 'Evaluation failed. Please try submitting again.');
      } else {
        setSubmissionError(null);
      }
    } catch (e: any) {
      setSubmissionError(e.message || 'An unexpected error occurred during submission.');
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

  // Smooth scroll to evaluation feedback when available
  useEffect(() => {
    if (currentQuestion?.evaluation && evaluationSectionRef.current) {
      evaluationSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentQuestion?.evaluation]);

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
        <h2 className="text-xl font-bold text-white">No Active Session Found</h2>
        <p className="text-sm text-slate-400">Please configure your interview parameters first.</p>
        <button
          onClick={onExit}
          className="px-6 py-2.5 rounded-xl font-semibold text-xs gradient-button"
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
        <div className="max-w-2xl mx-auto px-4 py-12 space-y-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Text-Based Mode Ready</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Distraction-Free Interview Practice
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            You are ready to begin. The AI will present questions on screen, and you will type your answers. Full AI STAR evaluations and scoring are enabled.
          </p>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-md mx-auto space-y-3 text-left">
            <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800 pb-2.5">
              <span>Target Role:</span>
              <strong className="text-white">{activeSession.config.role}</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800 pb-2.5">
              <span>Company:</span>
              <strong className="text-white">{activeSession.config.companyName}</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800 pb-2.5">
              <span>Questions:</span>
              <strong className="text-white">{activeSession.questions.length}</strong>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Microphone & Camera:</span>
              <span className="text-emerald-400 font-semibold">Bypassed (Not Required)</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleExit}
              className="px-5 py-3 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Back to Setup
            </button>
            <button
              type="button"
              onClick={() => setPreflightPassed(true)}
              className="px-8 py-3.5 rounded-xl font-bold text-xs gradient-button inline-flex items-center gap-2 shadow-lg"
            >
              <span>Enter Text Interview Room</span>
              <Check className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
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
              ? 'In this dedicated voice mode, all questions are spoken aloud and you answer verbally via microphone. Please verify your microphone and speakers below.'
              : 'In InterviewBro AI video interviews, verify your camera stream and microphone input before entering the live session.'}
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
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Browser Speech Recognition Not Supported</strong>
              Your current browser does not support the Web Speech API required for speech recognition. You can switch to Text-Based Mode to complete your interview.
            </div>
          </div>
        )}

        {/* Start Button & Escape Hatch */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/50 via-slate-900 to-blue-950/50 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-white">
              {isVoiceOnly ? 'Ready for your voice interview?' : 'Ready for your video interview?'}
            </div>
            <div className="text-xs text-slate-400">
              {activeSession.config.companyName} • {activeSession.config.role} ({activeSession.questions.length} questions)
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPreflightPassed(true)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs gradient-button flex items-center justify-center gap-2 shadow-lg"
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
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
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

      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-3">
          <BrandIcon size="sm" glow={false} />
          <div>
            <h2 className="text-xs font-bold text-white">
              {activeSession.config.companyName} • {activeSession.config.role}
            </h2>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="capitalize">{activeSession.config.interviewType} Round</span>
              <span>•</span>
              <span className="capitalize">{isTextOnly ? 'Text-Based' : isVoiceOnly ? 'Voice-Only' : 'Video'} Mode</span>
              <span>•</span>
              <span className="capitalize">{activeSession.config.difficulty}</span>
              {currentQuestion.isFollowUp && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[10px]">
                  Follow-Up Challenge
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Question Progress & Timer */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs font-mono">
            <Clock className={`w-3.5 h-3.5 ${isPaused ? 'text-amber-400' : 'text-blue-400 animate-pulse'}`} />
            <span className="text-white font-bold">{formatTimer(elapsedSeconds)}</span>
          </div>

          <div className="text-xs text-slate-400">
            Question <strong className="text-white">{currentQuestionIndex + 1}</strong> of <strong>{totalQuestions}</strong>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {!isTextOnly && (
            <button
              type="button"
              onClick={switchToTextMode}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Switch to typing mode without losing interview progress"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Switch to Text</span>
            </button>
          )}

          <button
            onClick={togglePause}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isPaused 
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' 
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title={isPaused ? 'Resume Interview' : 'Pause Interview'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={handleFinishEarly}
            disabled={isEvaluating}
            className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            End & Generate Report
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Interaction Column, Right AI Question & Response Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {isTextOnly ? (
            /* Dedicated Text-Based Interface Hub */
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#101728] to-slate-950 border border-emerald-500/30 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-2 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span>Text-Based Interview Hub</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                  Mic-Free Mode
                </span>
              </div>

              {/* Central AI Evaluator Orb */}
              <div className="py-4 flex flex-col items-center justify-center space-y-4">
                <VoiceInterviewerOrb
                  state={orbState}
                  size="xl"
                  interviewerName="AI Principal Interviewer"
                  company={activeSession.config.companyName}
                />

                <div className="w-full max-w-xs space-y-1 text-center">
                  <div className="text-xs font-semibold text-white">
                    {activeSession.config.companyName} • {activeSession.config.role}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Type your answer in the response editor and submit when ready.
                  </div>
                </div>
              </div>

              {/* Spoken Question Audio Player */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Volume2 className="w-4 h-4 text-violet-400" />
                  <span>Interviewer Speech:</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleQuestionAudio}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600/30 hover:bg-violet-600/40 text-violet-200 border border-violet-500/40 transition-colors"
                >
                  {isSpeakingQuestion ? 'Stop Audio' : 'Play Question Aloud'}
                </button>
              </div>

              {/* Tips Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="text-white font-semibold flex items-center gap-1.5">
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
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#101728] to-slate-950 border border-violet-500/30 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-300 flex items-center gap-2 uppercase tracking-wider">
                  <Radio className="w-4 h-4 text-violet-400 animate-pulse" />
                  <span>Voice Interview Channel</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  isSpeakingQuestion 
                    ? 'bg-violet-500/20 text-violet-300 border-violet-500/40 animate-pulse'
                    : isListening 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {isSpeakingQuestion ? 'Interviewer Speaking' : isListening ? 'Listening to You' : 'Mic Ready'}
                </span>
              </div>

              {/* Central Voice Interviewer Orb */}
              <div className="py-4 flex flex-col items-center justify-center space-y-4">
                <VoiceInterviewerOrb
                  state={orbState}
                  size="xl"
                  interviewerName="AI Principal Interviewer"
                  company={activeSession.config.companyName}
                />

                <div className="w-full max-w-xs space-y-1 text-center">
                  <AudioVisualizer stream={videoStream} isActive={isMicOn && !isPaused && isListening} />
                  <div className="text-[11px] text-slate-400 pt-1">
                    {isSpeakingQuestion 
                      ? 'Listen to the question... (Mic muted during interviewer speech)' 
                      : isListening 
                      ? 'Listening to your microphone — speak your answer clearly' 
                      : 'Microphone on standby'}
                  </div>
                </div>
              </div>

              {/* Voice Actions Toolbar */}
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={isListening ? stopSpeechCapture : startSpeechCapture}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-md ${
                    isListening
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isListening ? 'Done Speaking (Pause Mic)' : 'Start Speaking Answer'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-colors ${
                    isMicOn ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
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
                  <span>Voice-Only Mode Rules</span>
                </div>
                <p className="leading-relaxed">
                  The AI evaluates your verbal explanation, technical terminology, and reasoning.
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
                    interviewerName="AI Interviewer"
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
          <div className={`p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#121929] border shadow-lg space-y-3 transition-colors ${
            isSpeakingQuestion ? 'border-violet-500/80 ring-2 ring-violet-500/20' : 'border-violet-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">
                  AI Interviewer {isSpeakingQuestion && '(Speaking...)'}
                </span>
              </div>

              {/* Replay Question Button */}
              <button
                type="button"
                onClick={handleToggleQuestionAudio}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSpeakingQuestion
                    ? 'bg-rose-600/30 text-rose-300 border-rose-500/50'
                    : 'bg-violet-600 hover:bg-violet-500 text-white border-violet-500 shadow'
                }`}
                title="Replay spoken question"
              >
                {isSpeakingQuestion ? <VolumeX className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>{isSpeakingQuestion ? 'Stop Audio' : 'Replay Question'}</span>
              </button>
            </div>

            <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
              {currentQuestion.questionText}
            </p>

            {currentQuestion.contextOrHints && (
              <div className="pt-2 text-xs text-slate-400 flex items-start gap-1.5 border-t border-slate-800/60">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Context / Key Competencies:</span>
                <span>{currentQuestion.contextOrHints}</span>
              </div>
            )}
          </div>

          {/* Response Panel */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Candidate Response</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    isTextOnly
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : isVoiceOnly
                      ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}>
                    {isTextOnly ? 'Text Mode (Typing Only)' : isVoiceOnly ? 'Voice Mandatory' : 'Voice / Text Hybrid'}
                  </span>
                </label>
                <div className="text-[11px] text-slate-400 mt-0.5">
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
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
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
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-3">
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isEvaluating || isSubmitting}
                  onClick={handleSubmit}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs gradient-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-transform active:scale-[0.98]"
                  title="Submit your answer for evaluation (Ctrl+Enter)"
                >
                  {isEvaluating || isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{isVoiceOnly ? 'Evaluating Spoken Answer...' : 'Evaluating Answer...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isVoiceOnly ? 'Submit Spoken Answer' : 'Submit Answer'}</span>
                      <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono bg-black/30 border border-white/20 rounded text-slate-200 ml-1">
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
                    className="px-3.5 py-2.5 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
                    title="Challenge this answer with a realistic follow-up question"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Challenge with Follow-Up</span>
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
                className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white text-xs flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishEarly}
                  disabled={isEvaluating}
                  className="px-4 py-1.5 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  Finish Interview
                </button>
              )}
            </div>
          </div>

          {/* Evaluation Feedback Panel */}
          {currentQuestion.evaluation && (
            <div 
              ref={evaluationSectionRef}
              className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-xl space-y-4 transition-all"
            >
              {currentQuestion.evaluation.status === 'unavailable' ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <AlertCircle className="w-4 h-4" />
                    <span>AI Evaluation Unavailable (Local / Unconfigured Mode)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentQuestion.evaluation.unavailableReason || currentQuestion.evaluation.feedback}
                  </p>
                  <p className="text-[11px] text-slate-400 italic">
                    Your transcribed response has been safely recorded into the session history. InterviewBro AI will not fabricate an arbitrary score.
                  </p>
                </div>
              ) : (
                <>
                  {/* Scorecard Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Evaluation Scorecard</span>
                    </div>
                    <div className="text-xl font-black text-emerald-400">
                      {currentQuestion.evaluation.score}<span className="text-xs text-slate-500">/100</span>
                    </div>
                  </div>

                  {/* 5-Pillar Rubric Breakdown Grid */}
                  {currentQuestion.evaluation.rubricBreakdown && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        5-Pillar Structured Evaluation Rubric:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {/* Pillar 1: Technical Depth & Accuracy */}
                        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-blue-300">Technical Depth & Accuracy</span>
                            <span className="font-bold text-blue-400">
                              {currentQuestion.evaluation.rubricBreakdown.technicalCorrectness.score}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {currentQuestion.evaluation.rubricBreakdown.technicalCorrectness.reasoning}
                          </p>
                          {currentQuestion.evaluation.rubricBreakdown.technicalCorrectness.evidenceQuote && (
                            <div className="text-[10px] text-slate-500 italic">
                              Quote: &ldquo;{currentQuestion.evaluation.rubricBreakdown.technicalCorrectness.evidenceQuote}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Pillar 2: Question Relevance */}
                        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-emerald-300">Question Relevance</span>
                            <span className="font-bold text-emerald-400">
                              {currentQuestion.evaluation.rubricBreakdown.relevance.score}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {currentQuestion.evaluation.rubricBreakdown.relevance.reasoning}
                          </p>
                          {currentQuestion.evaluation.rubricBreakdown.relevance.evidenceQuote && (
                            <div className="text-[10px] text-slate-500 italic">
                              Quote: &ldquo;{currentQuestion.evaluation.rubricBreakdown.relevance.evidenceQuote}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Pillar 3: Problem Solving & Reasoning */}
                        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-violet-300">Problem-Solving & Reasoning</span>
                            <span className="font-bold text-violet-400">
                              {currentQuestion.evaluation.rubricBreakdown.problemSolvingReasoning.score}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {currentQuestion.evaluation.rubricBreakdown.problemSolvingReasoning.reasoning}
                          </p>
                          {currentQuestion.evaluation.rubricBreakdown.problemSolvingReasoning.evidenceQuote && (
                            <div className="text-[10px] text-slate-500 italic">
                              Quote: &ldquo;{currentQuestion.evaluation.rubricBreakdown.problemSolvingReasoning.evidenceQuote}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Pillar 4: Completeness & Examples */}
                        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-amber-300">Completeness & Examples</span>
                            <span className="font-bold text-amber-400">
                              {currentQuestion.evaluation.rubricBreakdown.completenessAndExamples.score}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {currentQuestion.evaluation.rubricBreakdown.completenessAndExamples.reasoning}
                          </p>
                          {currentQuestion.evaluation.rubricBreakdown.completenessAndExamples.evidenceQuote && (
                            <div className="text-[10px] text-slate-500 italic">
                              Quote: &ldquo;{currentQuestion.evaluation.rubricBreakdown.completenessAndExamples.evidenceQuote}&rdquo;
                            </div>
                          )}
                        </div>

                        {/* Pillar 5: Communication Clarity */}
                        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 md:col-span-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-cyan-300">Communication Clarity</span>
                            <span className="font-bold text-cyan-400">
                              {currentQuestion.evaluation.rubricBreakdown.communicationClarity.score}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug">
                            {currentQuestion.evaluation.rubricBreakdown.communicationClarity.reasoning}
                          </p>
                          {currentQuestion.evaluation.rubricBreakdown.communicationClarity.evidenceQuote && (
                            <div className="text-[10px] text-slate-500 italic">
                              Quote: &ldquo;{currentQuestion.evaluation.rubricBreakdown.communicationClarity.evidenceQuote}&rdquo;
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Verified Technical Facts vs Questionable Claims */}
                  {((currentQuestion.evaluation.verifiedClaims && currentQuestion.evaluation.verifiedClaims.length > 0) ||
                    (currentQuestion.evaluation.unverifiedOrQuestionableClaims && currentQuestion.evaluation.unverifiedOrQuestionableClaims.length > 0)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {currentQuestion.evaluation.verifiedClaims && currentQuestion.evaluation.verifiedClaims.length > 0 && (
                        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs">
                          <div className="font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            <span>Verified Technical Points:</span>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                            {currentQuestion.evaluation.verifiedClaims.map((claim, idx) => (
                              <li key={idx}>{claim}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {currentQuestion.evaluation.unverifiedOrQuestionableClaims && currentQuestion.evaluation.unverifiedOrQuestionableClaims.length > 0 && (
                        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs">
                          <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Unverified / Questionable Claims:</span>
                          </div>
                          <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
                            {currentQuestion.evaluation.unverifiedOrQuestionableClaims.map((claim, idx) => (
                              <li key={idx}>{claim}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Constructive Feedback */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentQuestion.evaluation.feedback}
                  </p>

                  {/* Strengths & Points to Improve */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="font-semibold text-emerald-400 mb-1">Key Strengths:</div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {currentQuestion.evaluation.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="font-semibold text-amber-400 mb-1">Points to Improve:</div>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {currentQuestion.evaluation.missedPoints.map((m, idx) => (
                          <li key={idx}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Better Answer Example */}
                  {currentQuestion.evaluation.betterAnswerExample && (
                    <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs">
                      <span className="font-semibold text-violet-400">Example High-Scoring Response: </span>
                      <p className="text-slate-300 text-[11px] leading-relaxed mt-1">
                        {currentQuestion.evaluation.betterAnswerExample}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
