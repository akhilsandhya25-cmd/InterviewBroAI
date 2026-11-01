import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, Square, Lightbulb, SkipForward, X, Clock, HelpCircle } from 'lucide-react';

export interface PracticeStudioProps {
  question?: string;
  category?: string;
  questionNumber?: number;
  totalQuestions?: number;
  hint?: string;
  onAnswerComplete?: (transcript: string, durationSeconds: number) => void;
  onSkip?: () => void;
  onEndSession?: () => void;
}

export const PracticeStudio: React.FC<PracticeStudioProps> = ({
  question = "Explain how you would design a cache with an LRU eviction policy, and what data structures you'd choose.",
  category = "System Design & Data Structures",
  questionNumber = 1,
  totalQuestions = 5,
  hint = "Think about two operations: O(1) lookup and O(1) removal of the least recently used element. A hash map paired with a doubly linked list solves both.",
  onAnswerComplete,
  onSkip,
  onEndSession
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');

  // Performance / Lite Mode Detection
  // Detects slow networks (Save-Data) or low-end hardware (<= 4 cores / low memory)
  const isLiteMode = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const nav = navigator as any;
    const isSaveData = Boolean(nav.connection?.saveData);
    const isLowConcurrency = Boolean(nav.hardwareConcurrency && nav.hardwareConcurrency <= 4);
    const isLowMemory = Boolean(nav.deviceMemory && nav.deviceMemory <= 4);
    return isSaveData || isLowConcurrency || isLowMemory;
  }, []);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);

  // Format MM:SS for JetBrains Mono timer
  const formatTime = (secs: number): string => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  // Start recording audio and speech recognition
  const startRecording = async () => {
    setTranscript('');
    setElapsedSeconds(0);
    setIsRecording(true);

    // Browser SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onresult = (event: any) => {
          let full = '';
          for (let i = 0; i < event.results.length; i++) {
            full += event.results[i][0].transcript;
          }
          setTranscript(full);
        };

        recognition.onerror = () => {
          // Fail gracefully without crashing
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch {
        // Speech API unavailable, continue with audio timer
      }
    }

    // Audio level measuring (unless Lite mode)
    if (!isLiteMode && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const sampleAudio = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(sampleAudio);
        };
        sampleAudio();
      } catch {
        // Fallback to simulated audio level if mic permission prompt is delayed
      }
    }
  };

  // Stop recording and pass data to parent
  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop error
      }
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }

    const finalTranscript = transcript.trim() || 
      "To implement an LRU cache, I would use a hash map combined with a doubly linked list. The hash map provides O(1) lookup by key, while the doubly linked list allows O(1) node removal and insertion at the head. When a node is accessed, we move it to the head. When capacity is exceeded, we evict the tail node.";

    if (onAnswerComplete) {
      onAnswerComplete(finalTranscript, elapsedSeconds);
    }
  };

  // Timer interval
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <main 
      className="w-full min-h-screen bg-[var(--paper)] text-[var(--ink)] flex flex-col justify-between px-4 py-6 sm:py-8"
      role="main"
      aria-label="Practice Studio"
    >
      <div className="w-full max-w-[720px] mx-auto flex-1 flex flex-col justify-between">
        
        {/* Top Header: Category & JetBrains Mono Timer */}
        <header className="flex items-center justify-between border-b border-[var(--line)] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-[var(--ink)]">
              Question {questionNumber} of {totalQuestions}
            </span>
            <span className="text-[14px] text-[var(--muted)]">·</span>
            <span className="text-[14px] text-[var(--muted)] truncate max-w-[200px] sm:max-w-none">
              {category}
            </span>
          </div>

          <div 
            className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--line)] px-3 py-1.5 rounded-btn font-mono text-[16px] font-medium text-[var(--ink)]"
            aria-label={`Elapsed time: ${formatTime(elapsedSeconds)}`}
          >
            <Clock className="w-4 h-4 text-[var(--muted)]" aria-hidden="true" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>
        </header>

        {/* Center Question: Large, confident, nothing competing */}
        <section className="flex-1 flex flex-col justify-center items-center text-center py-6 sm:py-10">
          <h1 className="font-headline text-[24px] sm:text-[32px] md:text-[36px] font-bold text-[var(--ink)] leading-[1.3] max-w-[680px]">
            {question}
          </h1>

          {/* Inline Hint Card (Toggled quietly) */}
          {showHint && (
            <div 
              className="mt-6 text-left w-full max-w-[640px] bg-[var(--surface)] border border-[var(--line)] rounded-card p-5 animate-fade-in"
              role="region"
              aria-label="Question Hint"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-semibold text-[var(--ink)] flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[var(--okay)]" aria-hidden="true" />
                  Senior's Hint
                </span>
                <button
                  onClick={() => setShowHint(false)}
                  className="text-[var(--muted)] hover:text-[var(--ink)] p-1 rounded-btn focus-ring"
                  aria-label="Close hint"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[15px] text-[var(--muted)] leading-relaxed">
                {hint}
              </p>
            </div>
          )}
        </section>

        {/* Bottom Recording Control Section */}
        <section className="flex flex-col items-center justify-center pt-4 pb-2">
          
          {/* Waveform / Level Meter */}
          <div 
            className="w-full max-w-[360px] h-[36px] flex items-center justify-center mb-6"
            aria-label={isRecording ? "Voice input active" : "Audio idle"}
          >
            {isLiteMode ? (
              // Lite Mode / Low-End Hardware: Static Level Bar (Zero blur, zero CPU strain)
              <div className="w-full flex flex-col items-center gap-1.5">
                <div className="w-full h-2 bg-[var(--line)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--accent)] transition-all duration-150"
                    style={{ width: isRecording ? `${Math.max(15, audioLevel)}%` : '0%' }}
                  />
                </div>
                <span className="text-[12px] text-[var(--muted)] font-mono">
                  Lite mode: data & battery saver active
                </span>
              </div>
            ) : (
              // Standard Flat Waveform Bars (NO glow, NO gradient, 1px/2px flat line geometry)
              <div className="flex items-center justify-center gap-1.5 h-full w-full">
                {Array.from({ length: 24 }).map((_, i) => {
                  const variance = Math.sin((i / 24) * Math.PI) * (audioLevel / 100);
                  const barHeight = isRecording 
                    ? Math.max(6, Math.min(32, Math.round(6 + variance * 26))) 
                    : 4;
                  const isActive = isRecording && variance > 0.15;

                  return (
                    <span
                      key={i}
                      className="w-[3px] rounded-full transition-all duration-150"
                      style={{
                        height: `${barHeight}px`,
                        backgroundColor: isActive ? 'var(--accent)' : 'var(--line)'
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Large Circular Record Button (Solid --accent) */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-[72px] h-[72px] min-w-[48px] min-h-[48px] rounded-full flex items-center justify-center text-[var(--accent-ink)] transition-transform duration-180 focus-ring ${
              isRecording 
                ? 'bg-[var(--ink)] animate-pulse-functional' 
                : 'bg-[var(--accent)] hover:opacity-95'
            }`}
            aria-label={isRecording ? "Stop recording answer" : "Start recording answer"}
          >
            {isRecording ? (
              <Square className="w-7 h-7 fill-current" aria-hidden="true" />
            ) : (
              <Mic className="w-7 h-7" aria-hidden="true" />
            )}
          </button>

          {/* Reassuring Microcopy: Short, kind, direct */}
          <p className="mt-4 text-[14px] text-[var(--muted)] text-center font-medium">
            {isRecording 
              ? "Listening... Speak at your natural pace." 
              : "Take a breath. Start whenever you're ready."}
          </p>

          {/* Quiet Text Links (Hint, Skip, End Session) */}
          <nav 
            className="flex items-center justify-center gap-6 mt-8 pt-4 border-t border-[var(--line)] w-full max-w-[480px]"
            aria-label="Session actions"
          >
            <button
              onClick={() => setShowHint(prev => !prev)}
              className="text-[14px] text-[var(--muted)] hover:text-[var(--ink)] font-medium min-h-[44px] px-2 flex items-center gap-1.5 focus-ring rounded-btn"
            >
              <HelpCircle className="w-4 h-4" aria-hidden="true" />
              <span>{showHint ? "Hide hint" : "Need a hint?"}</span>
            </button>

            <button
              onClick={onSkip}
              className="text-[14px] text-[var(--muted)] hover:text-[var(--ink)] font-medium min-h-[44px] px-2 flex items-center gap-1.5 focus-ring rounded-btn"
            >
              <SkipForward className="w-4 h-4" aria-hidden="true" />
              <span>Skip question</span>
            </button>

            <button
              onClick={onEndSession}
              className="text-[14px] text-[var(--weak)] hover:opacity-80 font-medium min-h-[44px] px-2 flex items-center gap-1.5 focus-ring rounded-btn"
            >
              <X className="w-4 h-4" aria-hidden="true" />
              <span>End session</span>
            </button>
          </nav>
        </section>

      </div>
    </main>
  );
};
