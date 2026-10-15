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
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Pause, 
  Play, 
  AlertTriangle,
  Bot,
  Video,
  Shield,
  FileText,
  CornerDownRight,
  Maximize2
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

  const [textAnswer, setTextAnswer] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [consentAcknowledged, setConsentAcknowledged] = useState<boolean>(isRecordingConsented);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Sync candidateAnswer to textAnswer when moving between questions
  useEffect(() => {
    if (currentQuestion?.candidateAnswer) {
      setTextAnswer(currentQuestion.candidateAnswer);
    } else {
      setTextAnswer('');
    }
  }, [currentQuestionIndex, currentQuestion]);

  // Hook up video stream to local HTML video element
  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream, isCameraOn]);

  // Speech Recognition listener
  useEffect(() => {
    const recognition = createSpeechRecognition();
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      tts.stop();
    };
  }, []);

  const handleToggleSpeechRecognition = () => {
    if (!recognitionRef.current?.isSupported) {
      setSpeechError('Speech recognition is not supported in this browser. You can type your answer below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      setIsListening(true);
      recognitionRef.current.start(
        (transcript: string, isFinal: boolean) => {
          setTextAnswer(prev => {
            const trimmed = prev.trim();
            if (isFinal) {
              return trimmed ? `${trimmed} ${transcript}` : transcript;
            }
            return prev; // keep stable until final chunk or update
          });
        },
        (err: string) => {
          setSpeechError(`Microphone notice: ${err}. You can type directly in the answer box.`);
          setIsListening(false);
        }
      );
    }
  };

  const handleSpeakQuestion = () => {
    if (!currentQuestion) return;
    if (isSpeakingQuestion) {
      tts.stop();
      setIsSpeakingQuestion(false);
    } else {
      setIsSpeakingQuestion(true);
      tts.speak(currentQuestion.questionText, () => {
        setIsSpeakingQuestion(false);
      });
    }
  };

  const handleSubmit = async () => {
    if (!textAnswer.trim()) {
      alert('Please enter or speak your answer before submitting.');
      return;
    }
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    await submitAnswer(textAnswer);
  };

  const handleFinishEarly = async () => {
    if (confirm('Are you sure you want to finish the interview and generate your performance report?')) {
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
      }
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
      {/* Privacy & Recording Consent Notice Modal */}
      {!consentAcknowledged && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-violet-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <strong className="text-white">Privacy & Local Processing:</strong> Your camera and microphone are processed strictly in your local browser. No facial emotion or personality score is collected. Would you like to enable local session recording for self-review?
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
                  Follow-Up Question
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

          {/* Interviewer Guidelines Tip */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1.5">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Recommended Strategy:</span>
            </div>
            <p className="leading-relaxed">
              For behavioral questions, use <strong>STAR</strong> (Situation, Task, Action, Result). For technical questions, explain your thought process out loud before reaching the conclusion.
            </p>
          </div>
        </div>

        {/* Right Column: AI Interviewer Question & Candidate Response (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* AI Question Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-[#121929] border border-violet-500/30 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-violet-300 uppercase tracking-wider">
                  AI Interviewer
                </span>
              </div>

              {/* Text-to-speech speaker button */}
              <button
                type="button"
                onClick={handleSpeakQuestion}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  isSpeakingQuestion
                    ? 'bg-violet-600 text-white border-violet-500 animate-pulse'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Read question aloud"
              >
                {isSpeakingQuestion ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeakingQuestion ? 'Stop Audio' : 'Speak Question'}</span>
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

          {/* Response Box */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <span>Your Response</span>
                <span className="text-slate-500 font-normal">(Speak or type)</span>
              </label>

              {/* Voice Input Toggle Button */}
              <button
                type="button"
                onClick={handleToggleSpeechRecognition}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>{isListening ? 'Listening (Click to stop)' : 'Voice Input (STT)'}</span>
              </button>
            </div>

            {speechError && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                {speechError}
              </div>
            )}

            <textarea
              rows={5}
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Structure your answer clearly. Speak aloud with the Voice Input button or type here..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 leading-relaxed font-sans"
            />

            {/* Answer Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isEvaluating || !textAnswer.trim()}
                  onClick={handleSubmit}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs gradient-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isEvaluating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Evaluating Answer...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Answer for Evaluation</span>
                    </>
                  )}
                </button>

                {/* Intelligent Follow-Up probe */}
                {currentQuestion.candidateAnswer && !currentQuestion.isFollowUp && (
                  <button
                    type="button"
                    disabled={isEvaluating}
                    onClick={requestFollowUp}
                    className="px-3.5 py-2.5 rounded-xl font-medium text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
                    title="Ask the AI to challenge your answer with a realistic follow-up question"
                  >
                    <CornerDownRight className="w-3.5 h-3.5 text-amber-400" />
                    <span>Challenge with Follow-Up</span>
                  </button>
                )}
              </div>

              {/* Navigation Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
                  title="Previous Question"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={nextQuestion}
                    className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-semibold flex items-center gap-1"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinishEarly}
                    disabled={isEvaluating}
                    className="px-4 py-2 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                  >
                    Finish Interview
                  </button>
                )}
              </div>
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
