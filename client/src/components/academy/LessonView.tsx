import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  HelpCircle,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle,
  FileEdit,
  Tag,
  Share2,
  ChevronRight
} from 'lucide-react';
import { AcademyLesson, AcademyModule, LessonProgress, PracticeAttempt } from '../../types/academy';
import { QuizEngine } from './QuizEngine';
import { PracticeStudio } from './PracticeStudio';
import { tts } from '../../services/speech';

interface LessonViewProps {
  lesson: AcademyLesson;
  module: AcademyModule;
  progress?: LessonProgress;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onBackToOverview: () => void;
  onMarkComplete: (lessonId: string) => void;
  onQuizCompleted: (score: number, passed: boolean) => void;
  onPracticeCompleted: (attempt: PracticeAttempt) => void;
  practiceAttempts?: PracticeAttempt[];
  onNavigateToMock?: () => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  lesson,
  module,
  progress,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onBackToOverview,
  onMarkComplete,
  onQuizCompleted,
  onPracticeCompleted,
  practiceAttempts = [],
  onNavigateToMock
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'quiz' | 'practice'>('content');
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  // Stop any active TTS audio whenever switching lessons or tabs
  useEffect(() => {
    return () => {
      try {
        tts.stop();
      } catch {
        // Safe stop
      }
    };
  }, [lesson.id, activeTab]);

  const handleSpeakSample = async (text: string, id: string) => {
    if (currentlySpeakingId === id) {
      tts.stop();
      setCurrentlySpeakingId(null);
      return;
    }

    try {
      tts.stop();
      setCurrentlySpeakingId(id);
      await tts.speak(text, {
        onEnd: () => setCurrentlySpeakingId(null),
        onError: () => setCurrentlySpeakingId(null)
      });
    } catch {
      setCurrentlySpeakingId(null);
    }
  };

  const isCompleted = Boolean(progress?.isCompleted);
  const quizPassed = Boolean(progress?.quizPassed);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBackToOverview}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9AA4B2] hover:text-[#F5F7FA] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to All Academy Modules</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-[#0B0F19] text-[#9AA4B2] hover:text-[#F5F7FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>
          <span className="text-[11px] text-[#9AA4B2] px-1 font-medium">
            Lesson {lesson.number} of 8
          </span>
          <button
            onClick={onNext}
            disabled={!hasNext}
            className="px-3 py-1.5 rounded-xl border border-white/[0.08] bg-[#0B0F19] text-[#9AA4B2] hover:text-[#F5F7FA] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Lesson Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#C5F36B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/[0.06] text-[#C5F36B] border border-[#C5F36B]/30">
            {module.category}
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-white/[0.04] text-[#9AA4B2] border border-white/[0.06] flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{lesson.estimatedMinutes} mins read & practice</span>
          </span>
          {isCompleted && (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Completed</span>
            </span>
          )}
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#F5F7FA] tracking-tight">
            {lesson.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1.5 font-medium">
            {lesson.subtitle}
          </p>
        </div>

        {/* Learning Objective Box */}
        <div className="p-4 rounded-2xl bg-[#121826] border border-white/[0.06] flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#C5F36B]/15 text-[#C5F36B] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5F36B]">
              Learning Objective:
            </div>
            <p className="text-xs sm:text-sm text-[#F5F7FA] font-medium mt-0.5 leading-relaxed">
              {lesson.objective}
            </p>
          </div>
        </div>

        {/* Tags */}
        {lesson.tags && lesson.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {lesson.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-lg text-[10px] bg-white/[0.03] text-[#9AA4B2] border border-white/[0.04]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Mode / Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0B0F19] border border-white/[0.08] shadow-sm">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'content'
              ? 'bg-[#121826] text-[#F5F7FA] shadow-md border border-white/[0.08]'
              : 'text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Lesson & Examples</span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'quiz'
              ? 'bg-[#121826] text-[#F5F7FA] shadow-md border border-white/[0.08]'
              : 'text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Interactive Quiz</span>
          {quizPassed && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('practice')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'practice'
              ? 'bg-[#121826] text-[#F5F7FA] shadow-md border border-white/[0.08]'
              : 'text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-white/[0.03]'
          }`}
        >
          <FileEdit className="w-4 h-4 text-[#C5F36B]" />
          <span>Hands-on Practice</span>
          {practiceAttempts.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-white/[0.08] text-[#C5F36B]">
              {practiceAttempts.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LESSON EXPLANATIONS & GOOD/BAD EXAMPLES */}
      {/* ========================================================================= */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Detailed Content Sections */}
          <div className="space-y-6">
            {lesson.sections.map((sec, idx) => (
              <div
                key={sec.id || idx}
                className="p-6 sm:p-8 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-lg space-y-4"
              >
                <h3 className="text-base sm:text-lg font-bold text-[#F5F7FA]">
                  {sec.title}
                </h3>

                <div className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed whitespace-pre-line space-y-2">
                  {sec.content}
                </div>

                {/* Key Takeaways */}
                {sec.keyTakeaways && sec.keyTakeaways.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 mt-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5F36B]">
                      Key Takeaways:
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {sec.keyTakeaways.map((point, kIdx) => (
                        <li key={kIdx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#C5F36B] shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Checklist */}
                {sec.checklist && sec.checklist.length > 0 && (
                  <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                      Placement Readiness Checklist:
                    </div>
                    <div className="space-y-1.5 text-xs text-cyan-100">
                      {sec.checklist.map((item, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Good vs Bad Examples Section */}
          {lesson.examples && lesson.examples.length > 0 && (
            <div className="space-y-4">
              <div className="px-1">
                <h3 className="text-base font-bold text-[#F5F7FA] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C5F36B]" />
                  <span>Real Placement Round Comparisons: Good vs. Bad</span>
                </h3>
                <p className="text-xs text-[#9AA4B2] mt-0.5">
                  Analyze actual answer examples from Indian campus drives to understand what interviewers notice.
                </p>
              </div>

              {lesson.examples.map((ex) => {
                const badSpeechId = `${ex.id}_bad`;
                const goodSpeechId = `${ex.id}_good`;

                return (
                  <div
                    key={ex.id}
                    className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] space-y-4 shadow-xl"
                  >
                    <div className="p-3.5 rounded-2xl bg-[#121826] border border-white/[0.06] text-xs font-semibold text-[#F5F7FA]">
                      {ex.scenario}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* BAD EXAMPLE CARD */}
                      <div className="p-4 rounded-2xl bg-rose-500/[0.04] border border-rose-500/20 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-300 uppercase">
                              Weak / Risky Answer
                            </span>
                            {ex.badExample.spokenAudioText && (
                              <button
                                onClick={() =>
                                  handleSpeakSample(
                                    ex.badExample.spokenAudioText || ex.badExample.text,
                                    badSpeechId
                                  )
                                }
                                className="p-1 rounded-lg hover:bg-white/[0.06] text-rose-300 transition-colors"
                                title="Listen to spoken audio"
                              >
                                {currentlySpeakingId === badSpeechId ? (
                                  <VolumeX className="w-4 h-4" />
                                ) : (
                                  <Volume2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-rose-100 italic leading-relaxed">
                            "{ex.badExample.text}"
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.02] border border-rose-500/15 text-[11px] text-[#9AA4B2] leading-relaxed">
                          <span className="font-semibold text-rose-300">Why this hurts: </span>
                          {ex.badExample.analysis}
                        </div>
                      </div>

                      {/* GOOD EXAMPLE CARD */}
                      <div className="p-4 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 flex flex-col justify-between space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 uppercase">
                              Winning Response
                            </span>
                            {ex.goodExample.spokenAudioText && (
                              <button
                                onClick={() =>
                                  handleSpeakSample(
                                    ex.goodExample.spokenAudioText || ex.goodExample.text,
                                    goodSpeechId
                                  )
                                }
                                className="p-1 rounded-lg hover:bg-white/[0.06] text-emerald-300 transition-colors"
                                title="Listen to spoken audio"
                              >
                                {currentlySpeakingId === goodSpeechId ? (
                                  <VolumeX className="w-4 h-4" />
                                ) : (
                                  <Volume2 className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-emerald-100 leading-relaxed font-medium">
                            "{ex.goodExample.text}"
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-white/[0.02] border border-emerald-500/15 text-[11px] text-[#9AA4B2] leading-relaxed">
                          <span className="font-semibold text-emerald-300">Why this works: </span>
                          {ex.goodExample.analysis}
                        </div>
                      </div>
                    </div>

                    {/* Pro Tip */}
                    {ex.proTip && (
                      <div className="p-3.5 rounded-2xl bg-[#C5F36B]/5 border border-[#C5F36B]/20 text-xs text-[#F5F7FA] flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#C5F36B] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-[#C5F36B]">Placement Pro Tip: </span>
                          <span className="text-slate-300">{ex.proTip}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Footer for Content Tab */}
          <div className="p-6 rounded-3xl bg-[#0B0F19] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-[#F5F7FA]">
                Ready to test what you learned?
              </div>
              <div className="text-[11px] text-[#9AA4B2]">
                Take the quick 4-question quiz or practice drafting your personalized response.
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('quiz')}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold bg-[#C5F36B] hover:bg-[#b0df57] text-[#080B11] shadow-md shadow-[#C5F36B]/20 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Take the Quiz</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onMarkComplete(lesson.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                  isCompleted
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-white/[0.06] hover:bg-white/[0.1] text-[#F5F7FA]'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isCompleted ? 'Completed' : 'Mark as Read'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INTERACTIVE QUIZ */}
      {/* ========================================================================= */}
      {activeTab === 'quiz' && (
        <QuizEngine
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          questions={lesson.quiz}
          bestScore={progress?.bestQuizScore || 0}
          initialPassed={Boolean(progress?.quizPassed)}
          onComplete={onQuizCompleted}
          onNextAction={() => setActiveTab('practice')}
        />
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HANDS-ON PRACTICE STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'practice' && (
        <PracticeStudio
          lesson={lesson}
          existingAttempts={practiceAttempts}
          onComplete={onPracticeCompleted}
          onNavigateToMock={onNavigateToMock}
        />
      )}
    </div>
  );
};
