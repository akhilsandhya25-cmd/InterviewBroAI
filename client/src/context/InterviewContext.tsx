import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { InterviewConfig, InterviewSession, InterviewQuestion, FeedbackReport, QuestionEvaluation } from '../types';
import { storage } from '../services/storage';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

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

  // Clean up media streams on unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

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
    try {
      // Record session without blocking
      decrementInterviewQuota();

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

      // Generate questions strictly avoiding previously asked questions
      const generatedQuestions = await api.generateQuestions(config, previousQuestions);

      const session: InterviewSession = {
        id: `sess-${Date.now()}`,
        userId: user?.id || 'usr-guest',
        title: `${config.companyName} ${config.role} Mock Interview`,
        config,
        status: 'in_progress',
        questions: generatedQuestions,
        currentQuestionIndex: 0,
        startedAt: new Date().toISOString(),
        elapsedSeconds: 0
      };

      // Request camera/mic stream if available in browser
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const isVoiceOnly = config.mode === 'voice_only';
          const stream = await navigator.mediaDevices.getUserMedia(
            isVoiceOnly
              ? { audio: true, video: false }
              : { video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true }
          );
          setVideoStream(stream);
          setIsCameraOn(!isVoiceOnly);
          setIsMicOn(true);

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
      } catch (mediaErr) {
        console.warn('Camera/mic permission was not granted or device not present. Proceeding with virtual camera preview mode:', mediaErr);
      }

      storage.saveSession(session);
      setActiveSession(session);
      setCurrentQuestionIndex(0);
      setElapsedSeconds(0);
      setIsPaused(false);
      return true;
    } catch (err) {
      console.error('Error starting session:', err);
      alert('Failed to start interview session. Please check your network connection.');
      return false;
    } finally {
      setIsGeneratingQuestions(false);
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

    if (isEvaluating) {
      return { success: false, error: 'An answer evaluation is already in progress. Please wait.' };
    }

    setIsEvaluating(true);
    try {
      const evaluation = await api.evaluateAnswer(currentQ, trimmedAnswer, activeSession.config);
      if (!evaluation) {
        throw new Error('Evaluation service was unable to generate a score. Please retry.');
      }
      
      const updatedQuestions = [...activeSession.questions];
      updatedQuestions[currentQuestionIndex] = {
        ...currentQ,
        candidateAnswer: trimmedAnswer,
        evaluation
      };

      const updatedSession: InterviewSession = {
        ...activeSession,
        questions: updatedQuestions,
        elapsedSeconds
      };

      storage.saveSession(updatedSession, user?.id);
      setActiveSession(updatedSession);
      return { success: true, evaluation };
    } catch (e: any) {
      console.error('Error evaluating answer:', e);
      const errMsg = e.message || 'Evaluation request failed. Please check your connection and try again.';
      return { success: false, error: errMsg };
    } finally {
      setIsEvaluating(false);
    }
  };

  const requestFollowUp = async () => {
    if (!activeSession) return;
    const currentQ = activeSession.questions[currentQuestionIndex];
    if (!currentQ || !currentQ.candidateAnswer) return;

    setIsEvaluating(true);
    try {
      const sessionQuestions = activeSession.questions.map(q => q.questionText);
      const followUp = await api.generateFollowUp(
        currentQ, 
        currentQ.candidateAnswer, 
        activeSession.config,
        sessionQuestions,
        currentQ.evaluation?.score
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
    
    // Stop media recorder if active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.warn('Error stopping recorder:', e);
      }
    }

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
        loadReport
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
