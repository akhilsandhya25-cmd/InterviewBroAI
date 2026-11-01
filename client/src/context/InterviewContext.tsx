import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { InterviewConfig, InterviewSession, InterviewQuestion, FeedbackReport, QuestionEvaluation } from '../types';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';
import { releaseMediaStream, parseMicrophoneError, MicrophoneErrorInfo } from '../services/microphoneService';
import { analyticsService } from '../services/analytics';

interface InterviewContextType {
  activeSession: InterviewSession | null;
  currentQuestion: InterviewQuestion | null;
  currentQuestionIndex: number;
  totalQuestions: number;
  elapsedSeconds: number;
  isEvaluating: boolean;
  isGeneratingQuestions: boolean;
  isPaused: boolean;
  isSpeechActive: boolean;
  currentTranscript: string;
  isRecordingConsented: boolean;
  videoStream: MediaStream | null;
  mediaError: MicrophoneErrorInfo | null;
  isCameraOn: boolean;
  isMicOn: boolean;
  recordedBlobs: Blob[];
  recordedVideoUrl: string | null;
  activeReport: FeedbackReport | null;
  startNewSession: (config: InterviewConfig) => Promise<boolean>;
  submitAnswer: (answerText: string) => Promise<{ success: boolean; error?: string; evaluation?: QuestionEvaluation }>;
  requestFollowUp: () => Promise<void>;
  nextQuestion: () => void;
  previousQuestion: () => void;
  togglePause: () => void;
  endInterview: () => Promise<FeedbackReport | null>;
  setConsentToRecord: (consent: boolean) => void;
  toggleCamera: () => Promise<void>;
  toggleMic: () => void;
  setTranscript: (text: string) => void;
  setIsSpeechActive: (active: boolean) => void;
  loadReport: (reportId: string) => void;
  releaseMedia: () => void;
  switchToTextMode: () => void;
  clearMediaError: () => void;
}

const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

export const InterviewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, decrementInterviewQuota } = useAuth();
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSpeechActive, setIsSpeechActive] = useState<boolean>(false);
  const [currentTranscript, setCurrentTranscript] = useState<string>('');
  const [isRecordingConsented, setIsRecordingConsented] = useState<boolean>(false);
  
  // Media states
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<MicrophoneErrorInfo | null>(null);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [recordedBlobs, setRecordedBlobs] = useState<Blob[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Active Report state
  const [activeReport, setActiveReport] = useState<FeedbackReport | null>(null);

  // Timer loop
  useEffect(() => {
    let interval: any = null;
    if (activeSession && activeSession.status === 'in_progress' && !isPaused) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession, isPaused]);

  // Clean up media streams on unmount and beforeunload
  const releaseMedia = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping media recorder during release:', e);
      }
    }
    if (videoStream) {
      releaseMediaStream(videoStream);
      setVideoStream(null);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (videoStream) {
        releaseMediaStream(videoStream);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (videoStream) {
        releaseMediaStream(videoStream);
      }
    };
  }, [videoStream]);

  const clearMediaError = () => {
    setMediaError(null);
  };

  const switchToTextMode = () => {
    releaseMedia();
    setMediaError(null);
    if (activeSession) {
      const updatedSession: InterviewSession = {
        ...activeSession,
        config: {
          ...activeSession.config,
          mode: 'text_only'
        }
      };
      storage.saveSession(updatedSession, user?.id);
      setActiveSession(updatedSession);
    }
  };

  const toggleCamera = async () => {
    if (videoStream) {
      const videoTrack = videoStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setVideoStream(stream);
        setIsCameraOn(true);
      } catch (err) {
        const parsed = parseMicrophoneError(err);
        setMediaError(parsed);
        console.warn('Could not access webcam:', err);
      }
    }
  };

  const toggleMic = () => {
    if (videoStream) {
      const audioTrack = videoStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const startNewSession = async (config: InterviewConfig): Promise<boolean> => {
    setIsGeneratingQuestions(true);
    setMediaError(null);
    try {
      // Collect previously asked questions to enforce non-repetition across sessions
      const pastSessions = storage.getSessions(user?.id);
      const previousQuestions: string[] = [];
      pastSessions.forEach(s => {
        if (s.questions) {
          s.questions.forEach(q => {
            if (q.questionText && !previousQuestions.includes(q.questionText)) {
              previousQuestions.push(q.questionText);
            }
          });
        }
      });

      // Call serverless endpoint to consume quota atomically & generate questions
      const aiQuestions = await api.generateQuestions(config, previousQuestions);

      const session: InterviewSession = {
        id: `sess-${Date.now()}`,
        userId: user?.id || 'usr-guest',
        title: `${config.companyName} ${config.role} Mock Interview`,
        config,
        status: 'in_progress',
        questions: aiQuestions && aiQuestions.length > 0 ? aiQuestions : api.getInstantInitialQuestions(config, previousQuestions),
        currentQuestionIndex: 0,
        startedAt: new Date().toISOString(),
        elapsedSeconds: 0
      };

      storage.saveSession(session);
      setActiveSession(session);
      setCurrentQuestionIndex(0);
      setElapsedSeconds(0);
      setIsPaused(false);

      // Track interview started
      analyticsService.trackInterviewStarted({
        category: config.interviewType,
        difficulty: config.difficulty,
        questionCount: session.questions.length
      });

      if (session.questions.some(q => q.source === 'fallback')) {
        analyticsService.trackFallbackModeShown({ context: 'interview_session' });
      }

      // Initialize media hardware concurrently in the background without blocking the room entry
      if (config.mode === 'text_only') {
        releaseMedia();
      } else {
        (async () => {
          try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              const isVoiceOnly = config.mode === 'voice_only';
              const stream = await navigator.mediaDevices.getUserMedia(
                isVoiceOnly
                  ? {
                      audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                      },
                      video: false
                    }
                  : { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true }
              );
              setVideoStream(stream);
              setIsCameraOn(!isVoiceOnly);
              setIsMicOn(true);
              setMediaError(null);

              // If consented to local recording, initialize MediaRecorder
              if (isRecordingConsented && (window as any).MediaRecorder) {
                try {
                  const recorder = new MediaRecorder(stream);
                  const chunks: Blob[] = [];
                  recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunks.push(e.data);
                  };
                  recorder.onstop = () => {
                    setRecordedBlobs(chunks);
                    if (chunks.length > 0) {
                      try {
                        const videoBlob = new Blob(chunks, { type: 'video/webm' });
                        const url = URL.createObjectURL(videoBlob);
                        setRecordedVideoUrl(url);
                      } catch (e) {
                        console.warn('Could not generate object URL for video:', e);
                      }
                    }
                  };
                  recorder.start(1000);
                  mediaRecorderRef.current = recorder;
                } catch (recErr) {
                  console.warn('MediaRecorder init notice:', recErr);
                }
              }
            }
          } catch (mediaErr: any) {
            const parsed = parseMicrophoneError(mediaErr);
            setMediaError(parsed);
            console.warn('Camera/mic access encountered an issue:', parsed.title, mediaErr);
          }
        })();
      }

      return true;
    } catch (err: any) {
      console.error('Error starting session:', err);
      if (err?.code === 'QUOTA_EXCEEDED' || err?.status === 402 || String(err?.message || '').includes('QUOTA')) {
        analyticsService.trackQuotaHit({ context: 'start_session_api' });
      }
      return false;
    }
  };

  const submitAnswer = async (answerText: string): Promise<{ success: boolean; error?: string; evaluation?: any }> => {
    if (!activeSession) {
      return { success: false, error: 'No active interview session found.' };
    }
    const currentQ = activeSession.questions[currentQuestionIndex];
    if (!currentQ) {
      return { success: false, error: 'Current question is unavailable.' };
    }

    const trimmedAnswer = (answerText || '').trim();
    if (!trimmedAnswer) {
      return { success: false, error: 'Please provide an answer before submitting.' };
    }

    // 1. Immediately record candidate's answer into session
    const updatedQuestions = [...activeSession.questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQ,
      candidateAnswer: trimmedAnswer
    };

    const updatedSession: InterviewSession = {
      ...activeSession,
      questions: updatedQuestions,
      elapsedSeconds
    };

    storage.saveSession(updatedSession, user?.id);
    setActiveSession(updatedSession);

    // 2. Perform background evaluation asynchronously so rich rubric metrics are saved for final report synthesis
    api.evaluateAnswer(currentQ, trimmedAnswer, activeSession.config)
      .then((evaluation) => {
        if (evaluation) {
          const fresh = [...(activeSession?.questions || updatedQuestions)];
          if (fresh[currentQuestionIndex]) {
            fresh[currentQuestionIndex] = {
              ...fresh[currentQuestionIndex],
              evaluation
            };
            const withEval = { ...updatedSession, questions: fresh };
            storage.saveSession(withEval, user?.id);
            setActiveSession(withEval);
          }
        }
      })
      .catch((err) => {
        console.warn('[Background Eval] Non-blocking evaluation note:', err.message || err);
      });

    return { success: true };
  };

  const requestFollowUp = async () => {
    if (!activeSession) return;
    const currentQ = activeSession.questions[currentQuestionIndex];
    if (!currentQ || !currentQ.candidateAnswer) return;

    setIsEvaluating(true);
    try {
      const sessionQuestions = activeSession.questions.map(q => q.questionText);
      const conversationHistory = activeSession.questions
        .filter(q => q.candidateAnswer && q.candidateAnswer.trim().length > 0)
        .map(q => ({
          questionText: q.questionText,
          candidateAnswer: q.candidateAnswer!,
          category: q.category,
          score: q.evaluation?.score ?? undefined
        }));

      const followUp = await api.generateFollowUp(
        currentQ, 
        currentQ.candidateAnswer, 
        activeSession.config,
        sessionQuestions,
        (currentQ.evaluation?.score != null ? currentQ.evaluation.score : undefined),
        conversationHistory
      );
      if (followUp) {
        const updatedQuestions = [...activeSession.questions];
        // Insert follow up right after current question
        updatedQuestions.splice(currentQuestionIndex + 1, 0, followUp);
        
        // Re-index questions
        updatedQuestions.forEach((q, idx) => {
          q.orderIndex = idx;
        });

        const updatedSession = {
          ...activeSession,
          questions: updatedQuestions
        };
        storage.saveSession(updatedSession);
        setActiveSession(updatedSession);
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } catch (e) {
      console.error('Error requesting follow-up:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (!activeSession) return;
    if (currentQuestionIndex < activeSession.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentTranscript('');
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setCurrentTranscript('');
    }
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const endInterview = async (): Promise<FeedbackReport | null> => {
    if (!activeSession) return null;
    
    // Stop and release all microphone and camera media tracks
    releaseMedia();

    setIsEvaluating(true);
    try {
      const report = await api.generateFinalReport(
        activeSession.questions,
        activeSession.config,
        user?.full_name || 'Candidate'
      );
      report.sessionId = activeSession.id;

      const completedSession: InterviewSession = {
        ...activeSession,
        status: 'completed',
        completedAt: new Date().toISOString(),
        elapsedSeconds,
        feedbackReport: report
      };

      storage.saveSession(completedSession, user?.id);
      storage.saveReport(report, user?.id);
      setActiveSession(completedSession);
      setActiveReport(report);

      // Track interview completion
      analyticsService.trackInterviewCompleted({
        category: activeSession.config.interviewType,
        questionCount: activeSession.questions.length,
        durationSeconds: elapsedSeconds,
        source: report.source || 'ai'
      });

      // Quota is atomically incremented on session start by serverless /api/ai/questions
      // Sync cloud state on completion to maintain PostgreSQL profile consistency
      if (user?.id) {
        storage.syncWithCloud(user.id);
      }

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe check
      }

      return report;
    } catch (e) {
      console.error('Error ending interview and generating report:', e);
      return null;
    } finally {
      setIsEvaluating(false);
    }
  };

  const loadReport = (reportId: string) => {
    const reports = storage.getReports(user?.id);
    const found = reports.find(r => r.id === reportId || r.sessionId === reportId);
    if (found) {
      setActiveReport(found);
    }
  };

  const currentQuestion = activeSession?.questions[currentQuestionIndex] || null;
  const totalQuestions = activeSession?.questions.length || 0;

  return (
    <InterviewContext.Provider
      value={{
        activeSession,
        currentQuestion,
        currentQuestionIndex,
        totalQuestions,
        elapsedSeconds,
        isEvaluating,
        isGeneratingQuestions,
        isPaused,
        isSpeechActive,
        currentTranscript,
        isRecordingConsented,
        videoStream,
        mediaError,
        isCameraOn,
        isMicOn,
        recordedBlobs,
        recordedVideoUrl,
        activeReport,
        startNewSession,
        submitAnswer,
        requestFollowUp,
        nextQuestion,
        previousQuestion,
        togglePause,
        endInterview,
        setConsentToRecord: setIsRecordingConsented,
        toggleCamera,
        toggleMic,
        setTranscript: setCurrentTranscript,
        setIsSpeechActive,
        loadReport,
        releaseMedia,
        switchToTextMode,
        clearMediaError
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
};
