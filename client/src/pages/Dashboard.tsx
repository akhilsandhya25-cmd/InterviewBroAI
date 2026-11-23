import React, { useState, useEffect } from 'react';
import {
  Video,
  FileText,
  Award,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Trash2,
  BarChart3,
  AlertTriangle,
  Target,
  Clock,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import { storage } from '../services/storage';
import { COMPANY_PRESETS } from '../data/presets';
import { InterviewSession, FeedbackReport } from '../types';
import { CompanyBadge } from '../components/CompanyBadge';

interface DashboardProps {
  onNavigate: (route: string) => void;
  onStartPreset: (presetId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onStartPreset }) => {
  const { user, candidateProfile, quota } = useAuth();
  const { loadReport, activeSession } = useInterview();
  const [sessions, setSessions] = useState<InterviewSession[]>(() => storage.getSessions(user?.id));

  useEffect(() => {
    const refresh = () => setSessions(storage.getSessions(user?.id));
    refresh();
    window.addEventListener('interviewbro_storage_synced', refresh);
    return () => window.removeEventListener('interviewbro_storage_synced', refresh);
  }, [user?.id]);

  const reports = storage.getReports(user?.id);
  const resumes = storage.getResumes(user?.id);

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalInterviews = completedSessions.length;

  // Gather genuine evaluated reports
  const reportMap = new Map<string, FeedbackReport>();
  reports.forEach(r => {
    if (r && typeof r.overallScore === 'number') {
      reportMap.set(r.sessionId || r.id, r);
    }
  });
  completedSessions.forEach(s => {
    if (s.feedbackReport && typeof s.feedbackReport.overallScore === 'number') {
      reportMap.set(s.id, s.feedbackReport);
    }
  });
  const validReports = Array.from(reportMap.values());
  const hasEvaluatedScores = validReports.length > 0;

  const avgOverallScore = hasEvaluatedScores
    ? Math.round(validReports.reduce((acc, r) => acc + (r.overallScore || 0), 0) / validReports.length)
    : null;

  const avgTechnicalScore = hasEvaluatedScores
    ? Math.round(validReports.reduce((acc, r) => acc + (r.technicalAccuracyScore || 0), 0) / validReports.length)
    : null;

  const avgCommunicationScore = hasEvaluatedScores
    ? Math.round(validReports.reduce((acc, r) => acc + (r.communicationScore || 0), 0) / validReports.length)
    : null;

  const avgStarScore = hasEvaluatedScores
    ? Math.round(validReports.reduce((acc, r) => acc + (r.structureStarScore || 0), 0) / validReports.length)
    : null;

  const effectiveRole = candidateProfile?.targetRole || user?.role_target;
  const effectiveStream = candidateProfile?.degreeStream || user?.degree_stream;
  const effectiveStatus = candidateProfile?.currentStatus || user?.current_status || 'Fresher';
  const isProfileComplete = Boolean(
    (candidateProfile?.targetRole && candidateProfile?.degreeStream) ||
    candidateProfile?.profileCompleted ||
    user?.profile_completed ||
    user?.role_target
  );

  const displayName =
    candidateProfile?.fullName ||
    user?.full_name ||
    user?.name ||
    (user?.email ? user.email.split('@')[0] : 'Candidate');

  const modeLabel = effectiveStream
    ? `${effectiveStream} • ${effectiveStatus} Track`
    : 'Campus & Placement Readiness Track';

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this interview session and its feedback report?')) {
      storage.deleteSession(id, user?.id);
      setSessions(storage.getSessions(user?.id));
    }
  };

  const handleOpenReport = (sessionId: string) => {
    loadReport(sessionId);
    onNavigate('reports');
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-24 overflow-x-hidden transition-colors">
      {/* 1. Personalized Welcome Card */}
      <div className="w-full max-w-full p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 relative z-10 w-full min-w-0">
          <div className="min-w-0 flex-1 w-full max-w-full">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-[#080B11] border border-slate-200 dark:border-white/[0.08] text-xs font-semibold text-slate-800 dark:text-[#F5F7FA] mb-2 sm:mb-2.5 max-w-full truncate">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-[#C5F36B] shrink-0" />
              <span className="truncate">{modeLabel}</span>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-[#F5F7FA] tracking-tight truncate">
              Welcome back, {displayName}!
            </h1>

            <div className="text-xs sm:text-sm text-slate-600 dark:text-[#9AA4B2] mt-2 flex flex-wrap items-center gap-1.5 max-w-full">
              <span className="font-semibold text-slate-800 dark:text-slate-200 shrink-0">Targeting:</span>
              {effectiveRole ? (
                <span className="inline-block max-w-full break-words px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-[#C5F36B] font-bold text-xs sm:text-sm border border-blue-200 dark:border-blue-900/50">
                  {effectiveRole}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate('profile')}
                  className="text-blue-600 dark:text-[#C5F36B] hover:underline font-bold inline-flex items-center gap-1 touch-manipulation"
                >
                  <span>Set Target Role</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-[#9AA4B2] mt-1.5">
              Practice under realistic hiring conditions, identify weaknesses, and sharpen answers with instant AI feedback.
            </p>
          </div>

          {/* Action CTAs (Mobile: Full-Width Stacked, Desktop: Inline Flex) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
            <button
              type="button"
              onClick={() => onNavigate('setup')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[46px] touch-manipulation text-center"
            >
              <Video className="w-4 h-4 shrink-0" />
              <span>New Mock Interview</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('resume')}
              className="w-full sm:w-auto px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-[#0B0F19] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-slate-800 dark:text-[#F5F7FA] border border-slate-300 dark:border-white/[0.12] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[46px] touch-manipulation text-center"
            >
              <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>Scan Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Onboarding Action Required Banner (Only shown if target role/stream missing) */}
      {!isProfileComplete && (
        <div className="w-full max-w-full p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F5F7FA] truncate">
                Action Required: Complete Your Candidate Profile
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-[#9AA4B2] mt-0.5">
                Add your target job role and degree so your AI interviewer can customize realistic questions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('profile')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0 min-h-[42px] touch-manipulation cursor-pointer"
          >
            <span>Complete Profile Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Active Session Recovery Banner */}
      {activeSession && activeSession.status === 'in_progress' && (
        <div className="w-full max-w-full p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121826] border border-amber-500/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-[#F5F7FA] flex items-center gap-2 flex-wrap">
                <span>Active Mock Interview in Progress</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-semibold shrink-0">
                  Question {activeSession.currentQuestionIndex + 1} of {activeSession.questions.length}
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-[#9AA4B2] mt-0.5 truncate">
                {activeSession.config.companyName} • {activeSession.config.role}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('interview')}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shrink-0 min-h-[42px] touch-manipulation cursor-pointer"
          >
            <span>Resume Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. 4-Column Metrics Grid (Mobile 2x2, Desktop 4x1) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-full">
        {/* Total Interviews */}
        <div className="min-w-0 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-[#9AA4B2] truncate">Total Sessions</div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 dark:bg-white/[0.04] border border-blue-100 dark:border-white/[0.08] flex items-center justify-center shrink-0">
              <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-[#C5F36B]" />
            </div>
          </div>
          <div className="mt-2 min-w-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-[#F5F7FA]">
              {totalInterviews}
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold truncate">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span className="truncate">{totalInterviews === 1 ? '1 session' : `${totalInterviews} sessions`}</span>
            </div>
          </div>
        </div>

        {/* Avg Overall Score */}
        <div className="min-w-0 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-[#9AA4B2] truncate">Average Score</div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-indigo-50 dark:bg-white/[0.04] border border-indigo-100 dark:border-white/[0.08] flex items-center justify-center shrink-0">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
          <div className="mt-2 min-w-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-[#F5F7FA]">
              {hasEvaluatedScores ? (
                <>
                  {avgOverallScore}<span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-[#9AA4B2]">/100</span>
                </>
              ) : (
                <span className="text-slate-400 dark:text-[#9AA4B2]">--<span className="text-xs sm:text-sm font-normal text-slate-400/60">/100</span></span>
              )}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-[#9AA4B2] mt-1 font-medium truncate">
              {hasEvaluatedScores ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold truncate">
                  <TrendingUp className="w-3 h-3 shrink-0" />
                  <span className="truncate">{avgOverallScore! >= 75 ? 'Strong Track' : 'Developing'}</span>
                </span>
              ) : (
                <span className="truncate">No interviews yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Practice Allowance */}
        <div className="min-w-0 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-[#9AA4B2] truncate">Practice Plan</div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-white/[0.04] border border-emerald-100 dark:border-white/[0.08] flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-[#C5F36B]" />
            </div>
          </div>
          <div className="mt-2 min-w-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-600 dark:text-[#C5F36B]">
              Unlimited
            </div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1 font-semibold truncate">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span className="truncate">Free AI Mock Access</span>
            </div>
          </div>
        </div>

        {/* Resume ATS Status */}
        <div className="min-w-0 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-[#9AA4B2] truncate">Resume Status</div>
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-cyan-50 dark:bg-white/[0.04] border border-cyan-100 dark:border-white/[0.08] flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <div className="mt-2 min-w-0">
            <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-[#F5F7FA]">
              {candidateProfile?.resumeFileName
                ? 'Attached'
                : resumes.length > 0
                  ? ((resumes[0].source === 'fallback' || resumes[0].atsScoreEstimate == null) ? 'Not scored' : `${resumes[0].atsScoreEstimate}%`)
                  : 'Pending'}
            </div>
            <div className="text-[10px] sm:text-[11px] text-cyan-600 dark:text-cyan-400 mt-1 flex items-center gap-1 font-semibold truncate">
              <FileText className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {candidateProfile?.resumeFileName
                  ? candidateProfile.resumeFileName
                  : resumes.length > 0 ? 'Analyzed' : 'Upload Resume'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Competency Category Progress & Next Step */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full">
        {/* Performance Pillars */}
        <div className="lg:col-span-2 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 sm:space-y-5 overflow-hidden">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F5F7FA] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-[#C5F36B] shrink-0" />
                <span>Competency Scores by Category</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-[#9AA4B2] mt-0.5">
                {hasEvaluatedScores
                  ? 'Calculated across your evaluated answers'
                  : 'Complete an interview to generate baseline competency scores'}
              </p>
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-[#9AA4B2] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#080B11] border border-slate-200 dark:border-white/[0.06] shrink-0">
              {hasEvaluatedScores ? 'Transparent Rubric' : 'No Data Yet'}
            </span>
          </div>

          <div className="space-y-3.5 sm:space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-800 dark:text-[#F5F7FA]">Technical Accuracy & Problem Solving</span>
                <span className={hasEvaluatedScores ? "text-blue-600 dark:text-[#C5F36B] font-bold" : "text-slate-500 dark:text-[#9AA4B2]"}>
                  {hasEvaluatedScores ? `${avgTechnicalScore}%` : '--'}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#080B11] h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-transparent">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    hasEvaluatedScores ? 'bg-blue-600 dark:bg-[#C5F36B]' : 'bg-slate-300 dark:bg-slate-800'
                  }`}
                  style={{ width: `${hasEvaluatedScores ? avgTechnicalScore : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-800 dark:text-[#F5F7FA]">Communication Clarity & Articulation</span>
                <span className={hasEvaluatedScores ? "text-cyan-600 dark:text-cyan-400 font-bold" : "text-slate-500 dark:text-[#9AA4B2]"}>
                  {hasEvaluatedScores ? `${avgCommunicationScore}%` : '--'}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#080B11] h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-transparent">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    hasEvaluatedScores ? 'bg-cyan-500 dark:bg-cyan-400' : 'bg-slate-300 dark:bg-slate-800'
                  }`}
                  style={{ width: `${hasEvaluatedScores ? avgCommunicationScore : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-800 dark:text-[#F5F7FA]">Answer Structure (STAR Methodology)</span>
                <span className={hasEvaluatedScores ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-500 dark:text-[#9AA4B2]"}>
                  {hasEvaluatedScores ? `${avgStarScore}%` : '--'}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-[#080B11] h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-transparent">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    hasEvaluatedScores ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-300 dark:bg-slate-800'
                  }`}
                  style={{ width: `${hasEvaluatedScores ? avgStarScore : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Track */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] shadow-sm flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08] mb-3 sm:mb-4">
              <span className="text-xs font-bold text-slate-900 dark:text-[#F5F7FA] uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600 dark:text-[#C5F36B] shrink-0" /> Next Step
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-white/[0.06] text-blue-700 dark:text-[#C5F36B] border border-blue-200 dark:border-white/[0.08] max-w-[140px] truncate">
                {effectiveRole || 'Placement Prep'}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F5F7FA]">
              {effectiveRole ? `${effectiveRole} Mock Practice` : 'Core Behavioral & Technical Round'}
            </h3>
            <p className="text-xs text-slate-600 dark:text-[#9AA4B2] mt-1.5 leading-relaxed">
              Tailored for {effectiveStream || 'your background'}. Practice real interview questions with instant AI coaching, STAR evaluation, and model answers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('setup')}
            className="w-full mt-5 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] touch-manipulation"
          >
            <span>Launch Practice Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6. Company Presets Grid */}
      <div className="space-y-3 sm:space-y-4 w-full max-w-full">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F5F7FA]">Company Recruitment Blueprints</h2>
            <p className="text-xs text-slate-600 dark:text-[#9AA4B2]">One-click mock interviews configured for specific hiring formats.</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('setup')}
            className="text-xs font-bold text-blue-600 dark:text-[#C5F36B] hover:underline flex items-center gap-1 cursor-pointer py-1 touch-manipulation"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 w-full max-w-full">
          {COMPANY_PRESETS.slice(0, 6).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onStartPreset(preset.id)}
              className="p-3 sm:p-3.5 rounded-xl min-h-[85px] bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] hover:border-blue-500 dark:hover:border-[#C5F36B]/50 shadow-sm hover:shadow transition-all text-left group flex flex-col justify-between cursor-pointer touch-manipulation overflow-hidden"
            >
              <div className="min-w-0">
                <CompanyBadge name={preset.name} code={preset.code} companyId={preset.id} size="sm" showCategory={false} />
                <div className="font-bold text-xs text-slate-900 dark:text-[#F5F7FA] group-hover:text-blue-600 dark:group-hover:text-[#C5F36B] transition-colors mt-2 truncate">
                  {preset.name}
                </div>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-[#9AA4B2] mt-2 block font-medium">
                {preset.interviewStructure?.length || 3} rounds
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Recent Session History List */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#121826] border border-slate-200 dark:border-white/[0.08] shadow-sm space-y-4 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F5F7FA]">Recent Interview Sessions</h2>
          {sessions.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="text-xs font-bold text-blue-600 dark:text-[#C5F36B] hover:underline cursor-pointer py-1 touch-manipulation"
            >
              View Full History →
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="py-8 sm:py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#080B11] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-slate-400 dark:text-[#9AA4B2] mx-auto">
              <Video className="w-6 h-6 text-slate-500 dark:text-[#9AA4B2]" />
            </div>
            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F5F7FA]">No interview sessions recorded yet</p>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-[#9AA4B2] max-w-sm mx-auto">
                Start your first mock session to unlock personalized feedback, STAR scores, and model answers.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('setup')}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm inline-flex items-center gap-1.5 mt-2 min-h-[42px] touch-manipulation cursor-pointer"
            >
              <span>Start First Mock Interview</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                onClick={() => handleOpenReport(session.id)}
                className="p-3 sm:p-3.5 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/[0.06] hover:border-blue-400 dark:hover:border-white/[0.15] flex items-center justify-between gap-3 cursor-pointer transition-colors min-h-[52px] touch-manipulation overflow-hidden"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 dark:bg-[#121826] border border-blue-100 dark:border-white/[0.08] flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-blue-600 dark:text-[#C5F36B]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-[#F5F7FA] truncate">
                      {session.config.companyName} • {session.config.role}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-[#9AA4B2] flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                      <span className="capitalize">{session.config.difficulty}</span>
                      <span>•</span>
                      <span>{session.questions.length} questions</span>
                      <span>•</span>
                      <span>{new Date(session.startedAt || session.completedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {session.feedbackReport ? (
                    <span className="px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 dark:bg-[#C5F36B]/15 text-blue-700 dark:text-[#C5F36B] border border-blue-200 dark:border-[#C5F36B]/30">
                      {session.feedbackReport.overallScore}/100
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-500 dark:text-[#9AA4B2] bg-slate-200/60 dark:bg-white/[0.04]">
                      Incomplete
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="Delete session"
                    aria-label="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
