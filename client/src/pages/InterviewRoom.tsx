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
  UserCheck
} from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import { createSpeechRecognition, tts } from '../services/speech';
import { AudioVisualizer } from '../components/AudioVisualizer';

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
    setConsentToRecord
  } = useInterview();

  // Voice & Transcript State
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [interimText, setInterimText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState<boolean>(true);
  const [detectedVoiceName, setDetectedVoiceName] = useState<string>('');
  
  // Pre-interview check gate
  const [preflightPassed, setPreflightPassed] = useState<boolean>(false);
  const [consentAcknowledged, setConsentAcknowledged] = useState<boolean>(isRecordingConsented);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const preflightVideoRef = useRef<HTMLVideoElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Sync candidateAnswer to spokenTranscript when moving between questions
  useEffect(() => {
    if (currentQuestion?.candidateAnswer) {
      setSpokenTranscript(currentQuestion.candidateAnswer);
      setInterimText('');
    } else {
      setSpokenTranscript('');
      setInterimText('');
    }
    setSpeechError(null);
  }, [currentQuestionIndex, currentQuestion]);

  // Hook up video stream to local HTML video elements
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
    if (preflightVideoRef.current && videoStream) {
      preflightVideoRef.current.srcObject = videoStream;
    }
  }, [videoStream, isCameraOn, preflightPassed]);

  // Initialize Speech Recognition & TTS voices
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
    };
  }, []);

  // Automatically speak the question aloud when question changes (after preflight check is passed)
  useEffect(() => {
    if (!preflightPassed || !currentQuestion || isPaused) return;

    // Small delay so candidate perceives the turn
    const timer = setTimeout(() => {
      speakCurrentQuestion();
    }, 600);

    return () => {
      clearTimeout(timer);
      tts.stop();
    };
  }, [currentQuestionIndex, preflightPassed, isPaused]);

  const speakCurrentQuestion = () => {
    if (!currentQuestion) return;
    
    // Stop candidate mic while interviewer is speaking to prevent echo/overlap
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setIsSpeakingQuestion(true);
    tts.speak(currentQuestion.questionText, {
      rate: 0.96, // natural, articulate interview cadence
      onStart: () => setIsSpeakingQuestion(true),
      onEnd: () => {
        setIsSpeakingQuestion(false);
        // Prompt candidate to speak after question finishes
        if (!currentQuestion.candidateAnswer) {
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

  const startSpeechCapture = () => {
    if (!recognitionRef.current?.isSupported) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    // Stop interviewer speech if candidate interrupts to answer
    if (isSpeakingQuestion) {
      tts.stop();
      setIsSpeakingQuestion(false);
    }

    setSpeechError(null);
    setIsListening(true);

    recognitionRef.current.start(
      (fullText: string, interimChunk: string, isFinal: boolean) => {
        setSpokenTranscript(fullText);
        setInterimText(interimChunk);
        if (isFinal) {
          setInterimText('');
        }
      },
      (errType: string, userMsg: string) => {
        setSpeechError(userMsg);
        if (errType !== 'no-speech') {
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
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setInterimText('');
  };

  const handleClearAndRespeak = () => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    setSpokenTranscript('');
    setInterimText('');
    setSpeechError(null);
    startSpeechCapture();
  };

  const handleSubmit = async () => {
    const combinedAnswer = (spokenTranscript + ' ' + interimText).trim();
    const wordCount = combinedAnswer.split(/\s+/).filter(Boolean).length;

    if (wordCount < 4) {
      setSpeechError('Spoken response is too short. Please speak a complete answer explaining your reasoning before submitting.');
      return;
    }

    stopSpeechCapture();
    tts.stop();
    await submitAnswer(combinedAnswer);
  };

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

  // PRE-FLIGHT CHECK: Mandatory Camera & Microphone check before interview begins
  if (!preflightPassed) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-semibold">
            <Headphones className="w-3.5 h-3.5 text-violet-400" />
            <span>Voice-First Interview Pre-Flight Check</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Camera & Microphone Readiness
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            In InterviewBro AI video interviews, both the AI interviewer questions and your candidate responses are conducted by voice. Please verify your equipment below.
          </p>
        </div>

        {/* Device Check Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Camera Preview */}
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
                  {speechRecognitionSupported ? 'STT Supported' : 'STT Unsupported'}
                </span>
              </div>

              {/* Live Audio Level Meter */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Microphone Input Level:</span>
                  <span className={isMicOn ? 'text-emerald-400' : 'text-slate-500'}>
                    {isMicOn ? 'Listening' : 'Muted'}
                  </span>
                </div>
                <AudioVisualizer stream={videoStream} isActive={isMicOn} />
                <p className="text-[10px] text-slate-500">
                  Speak a few words to confirm the frequency bars respond to your voice.
                </p>
              </div>

              {/* AI Voice Info */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400 text-[11px]">Interviewer Voice:</div>
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
              <strong className="block font-bold">Browser Speech-to-Text Not Supported</strong>
              Your current browser does not support the Web Speech API required for voice-first interviews. Please switch to Google Chrome, Microsoft Edge, or Safari on desktop.
            </div>
          </div>
        )}

        {/* Start Button */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/50 via-slate-900 to-blue-950/50 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-white">Ready for your mock interview?</div>
            <div className="text-xs text-slate-400">
              {activeSession.config.companyName} • {activeSession.config.role} ({activeSession.questions.length} questions)
            </div>
          </div>

          <button
            type="button"
            onClick={() => setPreflightPassed(true)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs gradient-button flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Enter Live Video Room</span>
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const combinedCandidateText = (spokenTranscript + (interimText ? ' ' + interimText : '')).trim();
  const wordCount = combinedCandidateText.split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Privacy & Recording Consent Notice */}
      {!consentAcknowledged && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-violet-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <strong className="text-white">Privacy & Local Processing:</strong> Your webcam and audio are processed locally in your browser. Would you like to enable local session recording for self-review playback?
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
          <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300 font-bold text-xs">
            {activeSession.config.companyName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xs font-bold text-white">
              {activeSession.config.companyName} • {activeSession.config.role}
            </h2>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="capitalize">{activeSession.config.interviewType} Round</span>
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

      {/* Main Split Layout: Left Video/Cam Feed, Right AI Question & Answering */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Candidate Camera & Mic Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Webcam Box */}
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

            {/* Overlaid Badges */}
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

          {/* Audio Waveform Visualizer & Level Indicator */}
          <div className="flex items-center justify-between">
            <AudioVisualizer stream={videoStream} isActive={isMicOn && !isPaused} />
            <span className={`text-[11px] font-medium flex items-center gap-1.5 ${
              isMicOn ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isMicOn && !isPaused ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              {isMicOn ? 'Microphone Active' : 'Microphone Muted'}
            </span>
          </div>

          {/* Voice Interview Rules Tip */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Voice Interview Protocol:</span>
            </div>
            <p className="leading-relaxed">
              Listen to the AI question spoken aloud. When it finishes, speak your response clearly. The system transcribes your words in real time.
            </p>
          </div>
        </div>

        {/* Right Column: AI Spoken Question & Candidate Voice Transcription (7 cols) */}
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
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Context / Hints:</span>
                <span>{currentQuestion.contextOrHints}</span>
              </div>
            )}
          </div>

          {/* Voice Response & Real-Time Transcription Panel */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Candidate Spoken Answer</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Voice Mandatory
                  </span>
                </label>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Answer using your microphone. Speech recognition converts your response in real time.
                </div>
              </div>

              {/* Primary Voice Action Button */}
              <button
                type="button"
                onClick={isListening ? stopSpeechCapture : startSpeechCapture}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                }`}
              >
                <Mic className="w-4 h-4" />
                <span>{isListening ? 'Done Speaking (Pause)' : 'Start Speaking Answer'}</span>
              </button>
            </div>

            {/* Error / Recovery Notification */}
            {speechError && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{speechError}</span>
                </div>
                <button
                  type="button"
                  onClick={startSpeechCapture}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-[11px] font-semibold shrink-0"
                >
                  Try Speaking Again
                </button>
              </div>
            )}

            {/* Real-time Spoken Transcript Display */}
            <div className="relative min-h-[140px] max-h-[220px] p-4 rounded-xl bg-slate-950 border border-slate-800 overflow-y-auto font-sans">
              {combinedCandidateText ? (
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
                      ? 'Listening to your speech... Speak clearly into your microphone.' 
                      : 'Click "Start Speaking Answer" to begin recording your spoken answer.'}
                  </p>
                </div>
              )}
            </div>

            {/* Transcript Footer & Validation */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-3">
                <span className={`text-[11px] font-medium ${
                  wordCount >= 5 ? 'text-emerald-400' : 'text-slate-500'
                }`}>
                  Spoken: <strong>{wordCount} words</strong> (min. 5)
                </span>

                {combinedCandidateText && (
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
                  disabled={isEvaluating || wordCount < 5}
                  onClick={handleSubmit}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs gradient-button flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                  title={wordCount < 5 ? 'Speak an answer of at least 5 words to submit' : 'Submit your spoken answer for evaluation'}
                >
                  {isEvaluating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Evaluating Spoken Answer...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Spoken Answer</span>
                    </>
                  )}
                </button>

                {/* Follow-Up Probe */}
                {currentQuestion.candidateAnswer && !currentQuestion.isFollowUp && (
                  <button
                    type="button"
                    disabled={isEvaluating}
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

          {/* Immediate Evaluation Feedback Box (if question was evaluated) */}
          {currentQuestion.evaluation && (
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 shadow-xl space-y-3 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">AI Evaluation Score</span>
                </div>
                <div className="text-base font-extrabold text-emerald-400">
                  {currentQuestion.evaluation.score}<span className="text-xs text-slate-500">/100</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {currentQuestion.evaluation.feedback}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
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

              {currentQuestion.evaluation.betterAnswerExample && (
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-xs">
                  <span className="font-semibold text-violet-400">Example High-Scoring Answer: </span>
                  <span className="text-slate-300 text-[11px] leading-relaxed">
                    {currentQuestion.evaluation.betterAnswerExample}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
