import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  Video,
  Play,
  RotateCcw,
  Compass,
  DoorOpen,
  Users,
  Target,
  Activity,
  ShieldAlert,
  HelpCircle,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { ACADEMY_MODULES, TOTAL_ACADEMY_LESSONS } from '../data/academyCurriculum';
import { AcademyLesson, AcademyModule, UserAcademyProgress, PracticeAttempt } from '../types/academy';
import { LessonView } from '../components/academy/LessonView';

interface InterviewAcademyProps {
  onNavigate: (route: string) => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
}

// Icon dictionary mapped to module.iconName
const MODULE_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Compass,
  DoorOpen,
  Sparkles,
  Users,
  Target,
  Activity,
  ShieldAlert,
  CheckCircle2
};

export const InterviewAcademy: React.FC<InterviewAcademyProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();

  // Progress state isolated by authenticated user or guest fallback
  const [progress, setProgress] = useState<UserAcademyProgress>(() =>
    storage.getAcademyProgress(user?.id)
  );

  // Active lesson state (null = show all modules/lessons overview)
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeInitialTab, setActiveInitialTab] = useState<'content' | 'quiz' | 'practice'>('content');

  // Refresh progress when user changes or when academy updates are broadcast
  useEffect(() => {
    const refresh = () => {
      setProgress(storage.getAcademyProgress(user?.id));
    };
    refresh();

    window.addEventListener('interviewbro_academy_synced', refresh);
    window.addEventListener('interviewbro_storage_synced', refresh);
    return () => {
      window.removeEventListener('interviewbro_academy_synced', refresh);
      window.removeEventListener('interviewbro_storage_synced', refresh);
    };
  }, [user?.id]);

  // Flatten all 8 lessons into an indexed array for easy navigation
  const allLessons: { lesson: AcademyLesson; module: AcademyModule }[] = [];
  ACADEMY_MODULES.forEach((mod) => {
    mod.lessons.forEach((les) => {
      allLessons.push({ lesson: les, module: mod });
    });
  });

  const completedCount = (progress.completedLessonIds || []).length;
  const overallPercent = Math.min(100, Math.round((completedCount / TOTAL_ACADEMY_LESSONS) * 100));

  // Find next uncompleted lesson to recommend
  const nextUncompleted = allLessons.find(
    (item) => !progress.completedLessonIds.includes(item.lesson.id)
  );
  const targetContinueLesson = nextUncompleted || allLessons[0];

  // If a lesson is currently active, render LessonView
  if (activeLessonId) {
    const activeItem = allLessons.find((item) => item.lesson.id === activeLessonId);
    if (activeItem) {
      const activeIndex = allLessons.findIndex((item) => item.lesson.id === activeLessonId);
      const hasPrev = activeIndex > 0;
      const hasNext = activeIndex < allLessons.length - 1;

      const handlePrev = () => {
        if (hasPrev) {
          setActiveLessonId(allLessons[activeIndex - 1].lesson.id);
        }
      };

      const handleNext = () => {
        if (hasNext) {
          setActiveLessonId(allLessons[activeIndex + 1].lesson.id);
        }
      };

      const handleMarkComplete = (lessonId: string) => {
        const updated = storage.markLessonComplete(lessonId, user?.id);
        setProgress(updated);
      };

      const handleQuizCompleted = (_score: number, _passed: boolean) => {
        setProgress(storage.getAcademyProgress(user?.id));
      };

      const handlePracticeCompleted = (_attempt: PracticeAttempt) => {
        setProgress(storage.getAcademyProgress(user?.id));
      };

      const lessonProgress = progress.lessonProgress[activeLessonId];
      const practiceAttempts = progress.practiceAttempts[activeLessonId] || [];

      return (
        <div className="p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
          <LessonView
            lesson={activeItem.lesson}
            module={activeItem.module}
            progress={lessonProgress}
            initialTab={activeInitialTab}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={handlePrev}
            onNext={handleNext}
            onBackToOverview={() => { setActiveLessonId(null); setActiveInitialTab('content'); }}
            onMarkComplete={handleMarkComplete}
            onQuizCompleted={handleQuizCompleted}
            onPracticeCompleted={handlePracticeCompleted}
            practiceAttempts={practiceAttempts}
            onNavigateToMock={() => onNavigate('setup')}
          />
        </div>
      );
    }
  }

  // ==========================================
  // MASTER ACADEMY OVERVIEW DASHBOARD
  // ==========================================
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 pb-16">
      {/* 1. HERO & WELCOME BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0B0F19] border border-white/[0.08] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C5F36B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5F36B]/10 text-[#C5F36B] border border-[#C5F36B]/25 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Interview Academy • Zero to Placement Ready</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#F5F7FA] tracking-tight">
              Master Corporate Interviews From Scratch
            </h1>

            <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
              Designed specifically for Indian college students, engineering freshers, and campus placement candidates. Learn how to greet recruiters, structure answers using the STAR method, conquer interview anxiety, and leave a memorable impression—even if you've never attended an interview before.
            </p>
          </div>

          {/* Primary CTA: Continue Learning Card */}
          <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] shrink-0 lg:w-80 space-y-4 shadow-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-[#9AA4B2] text-[10px]">
                Your Progress
              </span>
              <span className="font-bold text-[#C5F36B]">
                {overallPercent}% Completed
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#C5F36B] to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${overallPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#9AA4B2]">
              <span>{completedCount} of {TOTAL_ACADEMY_LESSONS} Lessons Finished</span>
              <span>8 Comprehensive Modules</span>
            </div>

            <button
              onClick={() => setActiveLessonId(targetContinueLesson.lesson.id)}
              className="w-full px-4 py-2.5 rounded-xl font-bold text-xs bg-[#C5F36B] hover:bg-[#b0df57] text-[#080B11] shadow-lg shadow-[#C5F36B]/20 transition-all flex items-center justify-center gap-2 group"
            >
              <span>{completedCount === 0 ? 'Start Lesson 1' : 'Continue Learning'}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. GUEST PREVIEW NOTICE (If not logged in) */}
      {!isAuthenticated && (
        <div className="p-4 sm:p-5 rounded-2xl bg-violet-950/20 border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F5F7FA]">
                Guest Preview Mode Active
              </div>
              <div className="text-[11px] text-[#9AA4B2]">
                You can browse lessons and quizzes freely. Create a free account to permanently sync your progress and practice transcripts across devices.
              </div>
            </div>
          </div>
          {onOpenAuth && (
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-colors whitespace-nowrap shrink-0"
            >
              Create Free Account
            </button>
          )}
        </div>
      )}

      {/* 2b. AI PRACTICE COACH QUICK LAUNCH CARD */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#121826] via-[#161F33] to-[#121826] border border-[#C5F36B]/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#C5F36B]/15 border border-[#C5F36B]/30 text-[#C5F36B] flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#C5F36B]/15 text-[#C5F36B] uppercase tracking-wider">
                Interactive AI Coach
              </span>
              <span className="text-xs font-bold text-[#F5F7FA]">AI Interview Practice Coach</span>
            </div>
            <p className="text-xs text-[#9AA4B2] leading-relaxed max-w-2xl">
              Practice your responses to Indian placement interview questions with speech or typing. Receive instant bar-raiser rubric scoring, concrete evidence checks, filler word analytics, and stronger tailored answers.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setActiveInitialTab('practice');
            setActiveLessonId('lesson-3');
          }}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-[#C5F36B] hover:bg-[#b0df57] text-[#080B11] shadow-lg shadow-[#C5F36B]/20 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch AI Practice Coach</span>
        </button>
      </div>

      {/* 3. CURRICULUM MODULES & LESSONS GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 px-1">
          <div>
            <h2 className="text-lg font-bold text-[#F5F7FA]">
              Step-by-Step Curriculum
            </h2>
            <p className="text-xs text-[#9AA4B2]">
              Work through the 8 foundational topics in sequence or jump into any specific area of hesitation.
            </p>
          </div>
          <span className="text-xs text-[#9AA4B2] font-semibold bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
            8 Modules • Self-Paced
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allLessons.map(({ lesson, module }) => {
            const Icon = MODULE_ICONS[module.iconName] || BookOpen;
            const isLessonDone = progress.completedLessonIds.includes(lesson.id);
            const lessonProgress = progress.lessonProgress[lesson.id];
            const quizScore = lessonProgress?.bestQuizScore;
            const isQuizPassed = lessonProgress?.quizPassed;

            return (
              <div
                key={lesson.id}
                data-lesson-id={lesson.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveLessonId(lesson.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveLessonId(lesson.id);
                  }
                }}
                className={`p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group ${
                  isLessonDone
                    ? 'bg-[#0B0F19] border-emerald-500/30 hover:border-emerald-500/60 shadow-lg'
                    : 'bg-[#0B0F19] border-white/[0.08] hover:border-white/[0.18] hover:bg-[#0c111e] shadow-md'
                }`}
              >
                {/* Header: Lesson # + Category Badge */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-white/[0.06] text-[#F5F7FA] text-xs font-bold flex items-center justify-center border border-white/[0.08]">
                        {lesson.number}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9AA4B2] bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.04]">
                        {module.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#9AA4B2] flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{lesson.estimatedMinutes}m</span>
                      </span>

                      {isLessonDone ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Done</span>
                        </span>
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-white/20" />
                      )}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="text-base font-bold text-[#F5F7FA] group-hover:text-[#C5F36B] transition-colors flex items-center gap-2">
                      <Icon className="w-4 h-4 text-[#C5F36B] shrink-0" />
                      <span>{lesson.title}</span>
                    </h3>
                    <p className="text-xs text-[#9AA4B2] mt-1 line-clamp-2 leading-relaxed">
                      {lesson.subtitle}
                    </p>
                  </div>
                </div>

                {/* Footer: Tags & Action */}
                <div className="pt-3 border-t border-white/[0.04] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {isQuizPassed && typeof quizScore === 'number' ? (
                      <span className="text-[11px] font-semibold text-emerald-400">
                        Quiz: {quizScore}%
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#9AA4B2]/70">
                        4 Quiz Questions • Practice Lab
                      </span>
                    )}
                  </div>

                  <span className="font-bold text-xs text-[#C5F36B] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>{isLessonDone ? 'Review Lesson' : 'Start Lesson'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. BRIDGE TO MOCK INTERVIEWS */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/20 via-[#0B0F19] to-cyan-950/20 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            Next Level Practice
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-[#F5F7FA]">
            Put Your Academy Knowledge into Live Simulation
          </h3>
          <p className="text-xs text-[#9AA4B2] max-w-xl leading-relaxed">
            Ready to test your introduction, STAR answers, and poise? Step into our AI Mock Interview Room to simulate real rounds for TCS, Infosys, Amazon, startups, and product roles with instant voice feedback.
          </p>
        </div>

        <button
          onClick={() => onNavigate('setup')}
          className="w-full md:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-[#C5F36B] hover:bg-[#b0df57] text-[#080B11] shadow-lg shadow-[#C5F36B]/20 transition-all flex items-center justify-center gap-2 shrink-0 group"
        >
          <Video className="w-4 h-4" />
          <span>Launch AI Mock Interview</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
