import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  ArrowRight, 
  RotateCcw, 
  Target, 
  MessageSquare,
  BookOpen,
  Sparkles
} from 'lucide-react';

export interface PillarScore {
  name: 'Content' | 'Structure' | 'Delivery' | 'Confidence';
  score: number; // 0 - 100
  reason: string;
}

export interface TranscriptAnnotation {
  id: string;
  type: 'filler' | 'vague' | 'strong';
  text: string;
  marginNote: string;
}

export interface TeacherFeedbackProps {
  question?: string;
  durationSeconds?: number;
  pillars?: PillarScore[];
  oneThingToFix?: string;
  onRetry?: () => void;
  onNextQuestion?: () => void;
}

export const TeacherFeedback: React.FC<TeacherFeedbackProps> = ({
  question = "Explain how you would design a cache with an LRU eviction policy, and what data structures you'd choose.",
  durationSeconds = 88,
  pillars = [
    {
      name: 'Content',
      score: 84,
      reason: "Solid explanation of hash map + doubly linked list, but you forgot to state the time complexity explicitly."
    },
    {
      name: 'Structure',
      score: 78,
      reason: "Clean approach: stated the two structures upfront, then walked through get() and put() operations."
    },
    {
      name: 'Delivery',
      score: 62,
      reason: "You used 'basically' 4 times in 90 seconds. Pause instead of filling dead air."
    },
    {
      name: 'Confidence',
      score: 72,
      reason: "Steady tone, but your voice pitched up at the end of statements like you were asking permission."
    }
  ],
  oneThingToFix = "State your two core operations (get and put) and their O(1) requirement in your very first sentence before diving into data structures.",
  onRetry,
  onNextQuestion
}) => {
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>('a1');

  // Pre-annotated transcript segments for the teacher marking view
  const annotations: TranscriptAnnotation[] = [
    {
      id: 'a1',
      type: 'strong',
      text: "I would use a hash map paired with a doubly linked list",
      marginNote: "Crisp architectural choice stated right away. Interviewers look for this."
    },
    {
      id: 'a2',
      type: 'filler',
      text: "like, basically",
      marginNote: "Cut this filler phrase. A 1-second silence sounds far more confident."
    },
    {
      id: 'a3',
      type: 'strong',
      text: "The doubly linked list allows O(1) removal of the tail node when capacity is full",
      marginNote: "Excellent technical precision on eviction mechanics."
    },
    {
      id: 'a4',
      type: 'vague',
      text: "it's super fast and efficient",
      marginNote: "Avoid vague adjectives. Say 'O(1) average time complexity for both get and put'."
    }
  ];

  // Helper for status styling complying strictly with WCAG AA (Never color alone)
  const getStatusBadge = (score: number) => {
    if (score >= 75) {
      return {
        label: 'Good',
        icon: <CheckCircle2 className="w-4 h-4 text-[var(--good)]" aria-hidden="true" />,
        colorClass: 'bg-[var(--good)]',
        textClass: 'text-[var(--good)]'
      };
    }
    if (score >= 50) {
      return {
        label: 'Okay',
        icon: <AlertCircle className="w-4 h-4 text-[var(--okay)]" aria-hidden="true" />,
        colorClass: 'bg-[var(--okay)]',
        textClass: 'text-[var(--okay)]'
      };
    }
    return {
      label: 'Needs work',
      icon: <AlertTriangle className="w-4 h-4 text-[var(--weak)]" aria-hidden="true" />,
      colorClass: 'bg-[var(--weak)]',
      textClass: 'text-[var(--weak)]'
    };
  };

  return (
    <main 
      className="w-full min-h-screen bg-[var(--paper)] text-[var(--ink)] px-4 py-8 sm:py-12"
      role="main"
      aria-label="Teacher Feedback and Answer Evaluation"
    >
      <div className="w-full max-w-[720px] mx-auto flex flex-col gap-8">
        
        {/* Header: Teacher Tone */}
        <header className="border-b border-[var(--line)] pb-5">
          <span className="text-[14px] font-semibold text-[var(--muted)] uppercase tracking-wider">
            Evaluation & Marked Script
          </span>
          <h1 className="font-headline text-[28px] sm:text-[34px] font-bold text-[var(--ink)] leading-tight mt-1">
            Teacher's Notes on Your Answer
          </h1>
          <p className="text-[14px] text-[var(--muted)] mt-1.5 font-mono">
            Answer run time: {durationSeconds} seconds · ~140 wpm
          </p>
        </header>

        {/* Section 1: Four Horizontal Pillar Bars */}
        <section 
          className="bg-[var(--surface)] border border-[var(--line)] rounded-card p-5 sm:p-6 flex flex-col gap-5"
          aria-label="Pillar Score Evaluation"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-[18px] font-bold text-[var(--ink)]">
              Core Pillars
            </h2>
            <span className="text-[13px] text-[var(--muted)]">
              Scored on university & placement rubric
            </span>
          </div>

          <div className="flex flex-col gap-5 divide-y divide-[var(--line)]">
            {pillars.map((pillar) => {
              const status = getStatusBadge(pillar.score);
              return (
                <div key={pillar.name} className="pt-4 first:pt-0 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[15px]">
                    <div className="flex items-center gap-2">
                      {status.icon}
                      <span className="font-bold text-[var(--ink)]">{pillar.name}</span>
                      <span className={`text-[12px] font-medium px-2 py-0.5 rounded-md border border-[var(--line)] bg-[var(--paper)] ${status.textClass}`}>
                        {status.label}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[16px] text-[var(--ink)]">
                      {pillar.score}/100
                    </span>
                  </div>

                  {/* Horizontal Bar (100% Flat, 1px border, NO glow) */}
                  <div className="w-full h-2.5 bg-[var(--line)] rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${status.colorClass} transition-all duration-200`}
                      style={{ width: `${pillar.score}%` }}
                      role="progressbar"
                      aria-valuenow={pillar.score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>

                  {/* One-line senior reason */}
                  <p className="text-[14px] text-[var(--muted)] leading-normal mt-0.5">
                    {pillar.reason}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 2: Marked Transcript (Teacher Red/Green Margin Pen) */}
        <section 
          className="bg-[var(--surface)] border border-[var(--line)] rounded-card p-5 sm:p-6 flex flex-col gap-4"
          aria-label="Marked Transcript with Margin Notes"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="text-[18px] font-bold text-[var(--ink)] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[var(--accent)]" aria-hidden="true" />
              Marked Transcript
            </h2>
            <span className="text-[13px] text-[var(--muted)]">
              Tap any highlight to read the teacher's margin note
            </span>
          </div>

          {/* Transcript Body with Inline Highlights */}
          <div className="p-4 bg-[var(--paper)] border border-[var(--line)] rounded-btn text-[16px] leading-[1.8] text-[var(--ink)]">
            <span>"To implement an LRU cache, </span>

            <button
              onClick={() => setSelectedAnnotationId('a1')}
              className={`inline-block px-1.5 py-0.5 rounded font-medium border text-left transition-colors ${
                selectedAnnotationId === 'a1'
                  ? 'bg-[var(--good-bg)] border-[var(--good)] text-[var(--good)]'
                  : 'bg-[var(--good-bg)] border-[var(--good-line)] text-[var(--good)] hover:border-[var(--good)]'
              }`}
              aria-label="Strong phrase annotation: I would use a hash map paired with a doubly linked list"
            >
              I would use a hash map paired with a doubly linked list
            </button>

            <span>. The hash map handles lookups, while </span>

            <button
              onClick={() => setSelectedAnnotationId('a2')}
              className={`inline-block px-1.5 py-0.5 rounded font-medium border text-left transition-colors ${
                selectedAnnotationId === 'a2'
                  ? 'bg-[var(--okay-bg)] border-[var(--okay)] text-[var(--okay)]'
                  : 'bg-[var(--okay-bg)] border-[var(--okay-line)] text-[var(--okay)] hover:border-[var(--okay)]'
              }`}
              aria-label="Filler word annotation: like, basically"
            >
              like, basically
            </button>

            <span> the linked list tracks the order of usage. </span>

            <button
              onClick={() => setSelectedAnnotationId('a3')}
              className={`inline-block px-1.5 py-0.5 rounded font-medium border text-left transition-colors ${
                selectedAnnotationId === 'a3'
                  ? 'bg-[var(--good-bg)] border-[var(--good)] text-[var(--good)]'
                  : 'bg-[var(--good-bg)] border-[var(--good-line)] text-[var(--good)] hover:border-[var(--good)]'
              }`}
              aria-label="Strong phrase annotation: The doubly linked list allows O(1) removal of the tail node when capacity is full"
            >
              The doubly linked list allows O(1) removal of the tail node when capacity is full
            </button>

            <span>, and that's why </span>

            <button
              onClick={() => setSelectedAnnotationId('a4')}
              className={`inline-block px-1.5 py-0.5 rounded font-medium border text-left transition-colors ${
                selectedAnnotationId === 'a4'
                  ? 'bg-[var(--weak-bg)] border-[var(--weak)] text-[var(--weak)]'
                  : 'bg-[var(--weak-bg)] border-[var(--weak-line)] text-[var(--weak)] hover:border-[var(--weak)]'
              }`}
              aria-label="Vague claim annotation: it's super fast and efficient"
            >
              it's super fast and efficient
            </button>

            <span>."</span>
          </div>

          {/* Margin Note Box */}
          {selectedAnnotationId && (() => {
            const active = annotations.find(a => a.id === selectedAnnotationId);
            if (!active) return null;
            const isGood = active.type === 'strong';
            const isFiller = active.type === 'filler';

            return (
              <div 
                className={`p-4 rounded-btn border text-[14px] flex items-start gap-3 animate-fade-in ${
                  isGood 
                    ? 'bg-[var(--good-bg)] border-[var(--good-line)] text-[var(--good)]' 
                    : isFiller
                      ? 'bg-[var(--okay-bg)] border-[var(--okay-line)] text-[var(--okay)]'
                      : 'bg-[var(--weak-bg)] border-[var(--weak-line)] text-[var(--weak)]'
                }`}
                role="note"
                aria-label="Margin Note"
              >
                <div className="font-bold flex-shrink-0 mt-0.5">
                  {isGood ? "Teacher's praise:" : isFiller ? "Filler critique:" : "Precision fix:"}
                </div>
                <div className="flex-1 text-[var(--ink)]">
                  <span className="font-semibold block mb-0.5">"{active.text}"</span>
                  <span className="text-[var(--muted)]">{active.marginNote}</span>
                </div>
              </div>
            );
          })()}

          {/* Highlight Key */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-[13px] text-[var(--muted)]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--good)]" aria-hidden="true" />
              Strong technical phrase
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--okay)]" aria-hidden="true" />
              Filler word to cut
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--weak)]" aria-hidden="true" />
              Vague claim to quantify
            </span>
          </div>
        </section>

        {/* Section 3: Finish With a Single Card: "Fix this one thing next time" */}
        <section 
          className="bg-[var(--surface)] border-2 border-[var(--accent)] rounded-card p-5 sm:p-6 flex flex-col gap-3"
          aria-label="High Priority Advice"
        >
          <div className="flex items-center gap-2 text-[var(--accent)]">
            <Target className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
            <h2 className="text-[17px] font-bold text-[var(--ink)]">
              Fix this one thing next time
            </h2>
          </div>

          <p className="text-[15px] sm:text-[16px] text-[var(--ink)] leading-relaxed font-medium">
            "{oneThingToFix}"
          </p>

          <p className="text-[13px] text-[var(--muted)]">
            Senior tip: Interviewers decide in the first 30 seconds if you know your stuff. Nailing the opening sentence sets the entire tone.
          </p>
        </section>

        {/* Footer Actions: Primary and Secondary Buttons */}
        <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[var(--line)]">
          <button
            onClick={onRetry}
            className="btn-secondary w-full sm:w-auto min-w-[200px] justify-center focus-ring"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Practice this again</span>
          </button>

          <button
            onClick={onNextQuestion}
            className="btn-primary w-full sm:w-auto min-w-[200px] justify-center focus-ring"
          >
            <span>Next question</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </footer>

      </div>
    </main>
  );
};
