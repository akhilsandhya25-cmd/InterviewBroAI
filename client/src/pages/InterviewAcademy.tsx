import React, { useState, useEffect, useMemo } from 'react';
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
  Shield,
  Wrench,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';
import { ACADEMY_MODULES, TOTAL_ACADEMY_LESSONS, ACADEMY_PATHWAYS, getRecommendedPathway } from '../data/academyCurriculum';
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
  CheckCircle2,
  GraduationCap,
  Wrench,
  BookOpen,
  Award,
  HelpCircle,
  Shield
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

  // Academic pathway selector & personalized recommendation
  const recommendedPathway = useMemo(() => getRecommendedPathway(user), [user]);
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>('all');

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

  // Flatten all lessons into an indexed array for easy navigation
  const allLessons: { lesson: AcademyLesson; module: AcademyModule }[] = useMemo(() => {
    const list: { lesson: AcademyLesson; module: AcademyModule }[] = [];
    ACADEMY_MODULES.forEach((mod) => {
      mod.lessons.forEach((les) => {
        list.push({ lesson: les, module: mod });
      });
    });
    return list;
  }, []);

  // Filter lessons based on selected pathway
  const displayedLessons = useMemo(() => {
    if (selectedPathwayId === 'all') {
      return allLessons;
    }
    const pathway = ACADEMY_PATHWAYS.find((p) => p.id === selectedPathwayId);
    if (!pathway) return allLessons;
    return allLessons.filter(
      (item) => pathway.moduleIds.includes(item.module.id) || item.module.pathwayId === pathway.id
    );
  }, [selectedPathwayId, allLessons]);

  const completedCount = (progress.completedLessonIds || []).length;
  const overallPercent = Math.min(100, Math.round((completedCount / TOTAL_ACADEMY_LESSONS) * 100));

  // Find next uncompleted lesson: prioritize student's recommended pathway, then global
  const recommendedModuleIds = recommendedPathway.moduleIds || [];
  const nextRecommendedUncompleted = allLessons.find(
    (item) =>
      recommendedModuleIds.includes(item.module.id) &&
      !progress.completedLessonIds.includes(item.lesson.id)
  );
  const nextGlobalUncompleted = allLessons.find(
    (item) => !progress.completedLessonIds.includes(item.lesson.id)
  );
  const targetContinueLesson = nextRecommendedUncompleted || nextGlobalUncompleted || allLessons[0];

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
              <span>Interview Academy • Universal Preparation for Every Stream</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#F5F7FA] tracking-tight">
              Master Admissions, Vivas & Job Interviews
            </h1>

            <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
              Designed for all academic levels: Intermediate (MPC, BiPC, MEC, CEC, HEC), Diploma, Polytechnic, Undergraduate, Postgraduate, Professional degrees (Medicine, Law, CA), and ITI trades. Learn how to articulate subject knowledge, defend lab experiments, master STAR answers, and conquer interview anxiety.
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
              <span>{ACADEMY_MODULES.length} Comprehensive Modules</span>
            </div>

            <button
              onClick={() => setActiveLessonId(targetContinueLesson.lesson.id)}
              className="w-full px-4 py-2.5 rounded-xl font-bold text-xs bg-[#C5F36B] hover:bg-[#b0df57] text-[#080B11] shadow-lg shadow-[#C5F36B]/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
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
                You can browse lessons and quizzes freely across all academic pathways. Create a free account to permanently sync your progress and practice transcripts.
              </div>
            </div>
          </div>
          {onOpenAuth && (
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
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
              Practice your responses to viva and interview questions with speech or typing. Receive instant rubric scoring, filler word analytics, and model answers tailored to your academic stream.
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
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2 px-1">
          <div>
            <h2 className="text-lg font-bold text-[#F5F7FA]">
              Step-by-Step Curriculum
            </h2>
            <p className="text-xs text-[#9AA4B2]">
              Explore universal foundation lessons or select your stream-specific learning pathway.
            </p>
          </div>
          <span className="text-xs text-[#9AA4B2] font-semibold bg-white/[0.04] px-3 py-1 rounded-full border border-white/[0.06]">
            {displayedLessons.length} of {TOTAL_ACADEMY_LESSONS} Lessons Showing
          </span>
        </div>

        {/* Personalized Pathway Recommendation Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/20 via-[#121826] to-emerald-950/20 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                  Recommended For Your Profile
                </span>
                <span className="text-xs font-bold text-[#F5F7FA]">
                  {recommendedPathway.title}
                </span>
                <span className="text-[10px] text-cyan-400 font-medium">
                  ({recommendedPathway.badge})
                </span>
              </div>
              <p className="text-xs text-[#9AA4B2] mt-1 line-clamp-2 leading-relaxed">
                {recommendedPathway.description}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedPathwayId(recommendedPathway.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
              selectedPathwayId === recommendedPathway.id
                ? 'bg-cyan-500 text-[#080B11] shadow-lg shadow-cyan-500/20'
                : 'bg-white/[0.08] text-[#F5F7FA] hover:bg-white/[0.14] border border-white/[0.08]'
            }`}
          >
            <span>{selectedPathwayId === recommendedPathway.id ? 'Viewing Pathway' : 'Focus Pathway'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Multi-Stream Pathway Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          <button
            onClick={() => setSelectedPathwayId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedPathwayId === 'all'
                ? 'bg-[#C5F36B] text-[#080B11] shadow-md shadow-[#C5F36B]/20'
                : 'bg-[#121826] text-[#9AA4B2] hover:text-[#F5F7FA] border border-white/[0.06]'
            }`}
          >
            All Lessons ({TOTAL_ACADEMY_LESSONS})
          </button>
          {ACADEMY_PATHWAYS.map((p) => {
            const isSelected = selectedPathwayId === p.id;
            const isRec = recommendedPathway.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPathwayId(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#C5F36B] text-[#080B11] shadow-md shadow-[#C5F36B]/20'
                    : isRec
                    ? 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/40'
                    : 'bg-[#121826] text-[#9AA4B2] hover:text-[#F5F7FA] border border-white/[0.06]'
                }`}
              >
                <span>{p.title}</span>
                {p.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    isSelected ? 'bg-black/20 text-[#080B11]' : 'bg-white/[0.06] text-[#9AA4B2]'
                  }`}>
                    {p.badge}
                  </span>
                )}
                {isRec && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedLessons.map(({ lesson, module }) => {
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
                {/* Header: Lesson # + Category Badge + Target Audience */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="w-7 h-7 rounded-lg bg-white/[0.06] text-[#F5F7FA] text-xs font-bold flex items-center justify-center border border-white/[0.08]">
                        {lesson.number}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9AA4B2] bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.04]">
                        {module.category === 'Trade & Vocational' ? 'ITI & Technical Trades' : module.category}
                      </span>
                      {module.targetAudience && (
                        <span className="text-[10px] font-medium text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                          {module.targetAudience}
                        </span>
                      )}
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
                        {lesson.quiz?.length || 4} Quiz Questions • Practice Lab
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
            Ready to test your introduction, technical knowledge, and poise? Step into our AI Mock Interview Room to simulate real rounds for college admissions, ITI trades, lab vivas, campus drives, and professional roles with instant voice feedback.
          </p>
        </div>

        <button
          onClick={() => onNavigate('setup')}
          className="w-full md:w-auto px-6 py-3 rounded-xl font-bold text-xs bg-[#C5F36B] hover:bg-[#b0df57] text-[#080B11] shadow-lg shadow-[#C5F36B]/20 transition-all flex items-center justify-center gap-2 shrink-0 group cursor-pointer"
        >
          <Video className="w-4 h-4" />
          <span>Launch AI Mock Interview</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
