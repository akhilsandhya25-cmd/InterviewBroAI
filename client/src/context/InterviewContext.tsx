import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  InterviewConfig,
  InterviewSession,
  InterviewQuestion,
  FeedbackReport,
  QuestionEvaluation,
  AdaptiveDecisionInfo,
  InterviewBlueprint,
  InterviewSessionMemory
} from '../types';
import { storage } from '../services/storage';
import { api, isSubstantiveAnswer } from '../services/api';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';
import { releaseMediaStream, parseMicrophoneError, MicrophoneErrorInfo } from '../services/microphoneService';
import { analyticsService } from '../services/analytics';
import { checkInterviewEligibility } from '../services/interviewEligibility';

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
  latestAdaptiveDecision: AdaptiveDecisionInfo | null;
  startNewSession: (config: InterviewConfig) => Promise<boolean>;
  submitAnswer: (answerText: string, answerSource?: 'spoken' | 'typed') => Promise<{ success: boolean; error?: string; evaluation?: QuestionEvaluation; adaptiveDecision?: AdaptiveDecisionInfo }>;
  requestFollowUp: () => Promise<void>;
  replaceUpcomingQuestion: (targetIndex: number, newQuestion: InterviewQuestion) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  togglePause: () => void;
  endInterview: (pendingAnswer?: string, activeQuestionId?: string, answerSource?: 'spoken' | 'typed') => Promise<FeedbackReport | null>;
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
  const [latestAdaptiveDecision, setLatestAdaptiveDecision] = useState<AdaptiveDecisionInfo | null>(null);

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
    // Enforce interview eligibility (B.Tech & recognised degree students only)
    const eligibility = checkInterviewEligibility(config.isAcademic ? config : (user || config));
    if (!eligibility.isEligible) {
      const err: any = new Error(eligibility.reason);
      err.code = 'INELIGIBLE_STUDENT_CATEGORY';
      throw err;
    }

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

      const blueprint = api.getInterviewBlueprint(config);
      const sessionMemory: InterviewSessionMemory = {
        blueprint,
        previousQuestions: [],
        topicsExplored: [blueprint.competencies[0]?.name || 'Introduction'],
        demonstratedCompetencies: [],
        knowledgeGaps: [],
        decisionsHistory: [],
        currentDifficulty: config.difficulty || 'intermediate',
        currentCompetency: blueprint.competencies[0]?.name || 'Introduction'
      };

      const session: InterviewSession = {
        id: `sess-${Date.now()}`,
        userId: user?.id || 'usr-guest',
        title: `${config.companyName} ${config.role} Mock Interview`,
        config,
        status: 'in_progress',
        questions: aiQuestions && aiQuestions.length > 0 ? aiQuestions : api.getInstantInitialQuestions(config, previousQuestions),
        currentQuestionIndex: 0,
        blueprint,
        sessionMemory,
        startedAt: new Date().toISOString(),
        elapsedSeconds: 0
      };

      storage.saveSession(session);
      setActiveSession(session);
      setLatestAdaptiveDecision(null);
      setCurrentQuestionIndex(0);
      setElapsedSeconds(0);
      setIsPaused(false);

      // Track interview started
      analyticsService.trackInterviewStarted({
        category: config.interviewType,
        difficulty: config.difficulty,
        questionCount: session.questions.length
      });

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

  const submitAnswer = async (answerText: string, answerSource?: 'spoken' | 'typed'): Promise<{ success: boolean; error?: string; evaluation?: any; adaptiveDecision?: AdaptiveDecisionInfo }> => {
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

    const resolvedSource = answerSource || (activeSession.config.mode === 'text_only' ? 'typed' : undefined);

    // 1. Immediately record candidate's answer into session
    const updatedQuestions = [...activeSession.questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQ,
      candidateAnswer: trimmedAnswer,
      answerSource: resolvedSource
    };

    let updatedSession: InterviewSession = {
      ...activeSession,
      questions: updatedQuestions,
      elapsedSeconds
    };

    let adaptiveDecision: AdaptiveDecisionInfo | undefined;

    // 2. Dynamic Adaptive Question Progression:
    // If not the last question, generate the next question adaptively based on this response
    if (currentQuestionIndex < activeSession.questions.length - 1) {
      try {
        const mem: InterviewSessionMemory = activeSession.sessionMemory || {
          blueprint: activeSession.blueprint || api.getInterviewBlueprint(activeSession.config),
          previousQuestions: activeSession.questions.map(q => q.questionText),
          topicsExplored: [activeSession.config.role || 'Introduction'],
          demonstratedCompetencies: [],
          knowledgeGaps: [],
          decisionsHistory: [],
          currentDifficulty: activeSession.config.difficulty || 'intermediate'
        };

        const adaptiveResult = await api.getNextAdaptiveQuestion(
          activeSession.config,
          currentQ,
          trimmedAnswer,
          mem
        );

        if (adaptiveResult && adaptiveResult.nextQuestion) {
          adaptiveDecision = adaptiveResult.nextQuestion.adaptiveDecision || {
            decision: adaptiveResult.decision,
            reason: adaptiveResult.decisionReason
          };

          const nextQuestionObj: InterviewQuestion = {
            ...adaptiveResult.nextQuestion,
            orderIndex: currentQuestionIndex + 1
          };

          updatedQuestions[currentQuestionIndex + 1] = nextQuestionObj;
          updatedQuestions[currentQuestionIndex] = {
            ...updatedQuestions[currentQuestionIndex],
            adaptiveDecision
          };

          updatedSession = {
            ...updatedSession,
            questions: updatedQuestions,
            sessionMemory: adaptiveResult.updatedMemory
          };

          setLatestAdaptiveDecision(adaptiveDecision);
        }
      } catch (adaptErr) {
        console.warn('[Adaptive Engine] Context update notice:', adaptErr);
      }
    }

    storage.saveSession(updatedSession, user?.id);
    setActiveSession(updatedSession);

    // 3. Perform background evaluation asynchronously so rich rubric metrics are saved for final report synthesis
    const targetQuestionId = currentQ.id; // Capture stable question ID
    api.evaluateAnswer(currentQ, trimmedAnswer, activeSession.config)
      .then((evaluation) => {
        if (evaluation) {
          let updatedWithEval: InterviewSession | null = null;
          setActiveSession(prev => {
            if (!prev) return prev;
            const targetIdx = prev.questions.findIndex(q => q.id === targetQuestionId);
            if (targetIdx === -1) return prev; // Missing question safety

            const fresh = [...prev.questions];
            fresh[targetIdx] = {
              ...fresh[targetIdx],
              candidateAnswer: fresh[targetIdx].candidateAnswer || trimmedAnswer,
              answerSource: fresh[targetIdx].answerSource || resolvedSource,
              evaluation
            };
            updatedWithEval = { ...prev, questions: fresh };
            return updatedWithEval;
          });

          // Controlled external persistence outside React state updater (FIX 5)
          if (updatedWithEval) {
            storage.saveSession(updatedWithEval, user?.id);
          }
        }
      })
      .catch((err) => {
        console.warn('[Background Eval] Non-blocking evaluation note:', err.message || err);
      });

    return { success: true, adaptiveDecision };
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

  const replaceUpcomingQuestion = (targetIndex: number, newQuestion: InterviewQuestion) => {
    if (!activeSession) return;
    if (targetIndex < 0 || targetIndex >= activeSession.questions.length) return;
    const updatedQuestions = [...activeSession.questions];
    updatedQuestions[targetIndex] = {
      ...newQuestion,
      orderIndex: targetIndex
    };
    const updatedSession = {
      ...activeSession,
      questions: updatedQuestions
    };
    storage.saveSession(updatedSession, user?.id);
    setActiveSession(updatedSession);
  };

  const nextQuestion = () => {
    if (!activeSession) return;
    if (currentQuestionIndex < activeSession.questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      setCurrentTranscript('');
      const updated = { ...activeSession, currentQuestionIndex: nextIdx };
      storage.saveSession(updated, user?.id);
      setActiveSession(updated);
    }
  };

  const previousQuestion = () => {
    if (!activeSession) return;
    if (currentQuestionIndex > 0) {
      const prevIdx = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIdx);
      setCurrentTranscript('');
      const updated = { ...activeSession, currentQuestionIndex: prevIdx };
      storage.saveSession(updated, user?.id);
      setActiveSession(updated);
    }
  };

  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  const endInterview = async (
    pendingAnswer?: string,
    activeQuestionId?: string,
    answerSource?: 'spoken' | 'typed'
  ): Promise<FeedbackReport | null> => {
    let session = activeSession ? (storage.getSessionById(activeSession.id, user?.id) || activeSession) : null;
    if (!session) return null;
    
    // Stop and release all microphone and camera media tracks
    releaseMedia();

    const questionsToEvaluate = [...session.questions];

    // 1. Commit pending answer to the target active question using its stable ID (Correction 1)
    if (pendingAnswer && pendingAnswer.trim()) {
      const targetId = activeQuestionId || session.questions[currentQuestionIndex]?.id;
      const targetIdx = targetId
        ? questionsToEvaluate.findIndex(q => q.id === targetId)
        : currentQuestionIndex;

      if (targetIdx !== -1 && questionsToEvaluate[targetIdx] && !questionsToEvaluate[targetIdx].candidateAnswer) {
        questionsToEvaluate[targetIdx] = {
          ...questionsToEvaluate[targetIdx],
          candidateAnswer: pendingAnswer.trim(),
          answerSource: answerSource || (session.config.mode === 'text_only' ? 'typed' : undefined)
        };
      }
    }

    // 2. Fallback draft recovery: scan localStorage for any saved drafts for questions lacking candidateAnswer
    questionsToEvaluate.forEach((q, idx) => {
      if (!q.candidateAnswer || !isSubstantiveAnswer(q.candidateAnswer)) {
        try {
          const draftKey = `interviewbro_draft_${session!.id}_${q.id}`;
          const draftStr = localStorage.getItem(draftKey);
          if (draftStr) {
            const parsed = JSON.parse(draftStr);
            if (parsed?.text && isSubstantiveAnswer(parsed.text)) {
              questionsToEvaluate[idx] = {
                ...q,
                candidateAnswer: parsed.text.trim(),
                answerSource: parsed.answerSource || (session!.config.mode === 'text_only' ? 'typed' : undefined)
              };
            }
          }
        } catch {}
      }
    });

    session = {
      ...session,
      questions: questionsToEvaluate
    };
    storage.saveSession(session, user?.id);
    setActiveSession(session);

    setIsEvaluating(true);
    try {
      const report = await api.generateFinalReport(
        session.questions,
        session.config,
        user?.full_name || 'Candidate'
      );
      report.sessionId = session.id;

      const completedSession: InterviewSession = {
        ...session,
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
        category: session.config.interviewType,
        questionCount: session.questions.length,
        durationSeconds: elapsedSeconds,
        source: report.source || 'ai'
      });

      // Quota is atomically incremented on session start by serverless /api/ai/questions
      // Sync cloud state on completion to maintain PostgreSQL profile consistency
      if (user?.id) {
        storage.syncWithCloud(user.id);
      }

      // Trigger celebratory confetti only if candidate actually answered questions and scored > 0
      if (report && typeof report.overallScore === 'number' && report.overallScore > 0) {
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // Safe check
        }
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
        latestAdaptiveDecision,
        startNewSession,
        submitAnswer,
        requestFollowUp,
        replaceUpcomingQuestion,
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
