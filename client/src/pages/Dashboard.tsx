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
  Calendar,
  AlertTriangle,
  Target,
  Clock
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
  const { user, quota } = useAuth();
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-7">
      {/* 1. Personalized Welcome Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#121826] border border-white/[0.08] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#080B11] border border-white/[0.08] text-xs font-semibold text-[#F5F7FA] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#C5F36B]" />
              <span>Campus & Placement Readiness Mode</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
              Welcome back, {user?.full_name || 'Candidate'}!
            </h1>

            <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1.5 max-w-xl">
              Targeting:{' '}
              {user?.role_target ? (
                <strong className="text-[#F5F7FA] font-semibold">{user.role_target}</strong>
              ) : (
                <button
                  onClick={() => onNavigate('profile')}
                  className="text-[#C5F36B] hover:underline font-semibold"
                >
                  Set Target Role →
                </button>
              )}
              {' '}• Track your metrics, identify skill gaps, and practice under realistic conditions.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => onNavigate('setup')}
              className="btn-primary text-xs py-2.5 px-4 shadow-md shadow-[#C5F36B]/15"
            >
              <Video className="w-4 h-4" />
              <span>New Mock Interview</span>
            </button>

            <button
              onClick={() => onNavigate('resume')}
              className="btn-secondary text-xs py-2.5 px-4"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Scan Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Onboarding Action Required Banner */}
      {(!user?.profile_completed || !user?.role_target) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-[#F5F7FA]">Action Required: Complete Your Candidate Profile</h3>
              <p className="text-[11px] sm:text-xs text-[#9AA4B2] mt-0.5">
                Add your target job role and skills so your AI interviewer can customize realistic interview questions.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Complete Profile Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Active Session Recovery Banner */}
      {activeSession && activeSession.status === 'in_progress' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121826] border border-amber-500/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#F5F7FA] flex items-center gap-2">
                <span>Active Mock Interview in Progress</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                  Question {activeSession.currentQuestionIndex + 1} of {activeSession.questions.length}
                </span>
              </div>
              <div className="text-xs text-[#9AA4B2] mt-0.5">
                {activeSession.config.companyName} • {activeSession.config.role}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('interview')}
            className="btn-primary text-xs py-2 px-4 shrink-0"
          >
            <span>Resume Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. Restrained 4-Column Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Interviews */}
        <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-[#9AA4B2]">Total Interviews</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] mt-1">
              {totalInterviews}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{totalInterviews === 1 ? '1 session recorded' : `${totalInterviews} sessions recorded`}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#F5F7FA]">
            <Video className="w-5 h-5 text-[#C5F36B]" />
          </div>
        </div>

        {/* Avg Overall Score */}
        <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-[#9AA4B2]">Average Score</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] mt-1">
              {hasEvaluatedScores ? (
                <>
                  {avgOverallScore}<span className="text-sm font-semibold text-[#9AA4B2]">/100</span>
                </>
              ) : (
                <span className="text-[#9AA4B2]">--<span className="text-sm font-normal text-[#9AA4B2]/60">/100</span></span>
              )}
            </div>
            <div className="text-[11px] text-[#9AA4B2] mt-1 flex items-center gap-1">
              {hasEvaluatedScores ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{avgOverallScore! >= 75 ? 'Strong Placement Track' : 'Developing Track'}</span>
                </span>
              ) : (
                <span>No interviews taken yet</span>
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#F5F7FA]">
            <Award className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Practice Allowance */}
        <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-[#9AA4B2]">Practice Allowance</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#C5F36B] mt-1">
              {quota.interviewsRemaining} of {quota.freeInterviewsTotal}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Free Starter Allowance</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#F5F7FA]">
            <Clock className="w-5 h-5 text-[#C5F36B]" />
          </div>
        </div>

        {/* Resume ATS Status */}
        <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-[#9AA4B2]">Resume Status</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] mt-1">
              {resumes.length > 0 ? ((resumes[0].source === 'fallback' || resumes[0].atsScoreEstimate == null) ? 'Not scored' : `${resumes[0].atsScoreEstimate}%`) : 'Pending'}
            </div>
            <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>{resumes.length > 0 ? ((resumes[0].source === 'fallback' || resumes[0].atsScoreEstimate == null) ? 'Demo Analyzed' : 'Analyzed') : 'Upload Resume'}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#F5F7FA]">
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
      </div>

      {/* 5. Competency Category Progress & Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Pillars */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#C5F36B]" />
                <span>Competency Scores by Category</span>
              </h2>
              <p className="text-xs text-[#9AA4B2] mt-0.5">
                {hasEvaluatedScores
                  ? 'Calculated across your evaluated answers'
                  : 'Complete an interview to generate baseline competency scores'}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#9AA4B2] px-2.5 py-1 rounded bg-[#080B11] border border-white/[0.06]">
              {hasEvaluatedScores ? 'Transparent Rubric' : 'No Data Yet'}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-[#F5F7FA]">Technical Accuracy & Problem Solving</span>
                <span className={hasEvaluatedScores ? "text-[#C5F36B] font-bold" : "text-[#9AA4B2] font-semibold"}>
                  {hasEvaluatedScores ? `${avgTechnicalScore}%` : '--'}
                </span>
              </div>
              <div className="w-full bg-[#080B11] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    hasEvaluatedScores ? 'bg-[#C5F36B]' : 'bg-slate-800'
                  }`}
                  style={{ width: `${hasEvaluatedScores ? avgTechnicalScore : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-[#F5F7FA]">Communication Clarity & Articulation</span>
                <span className={hasEvaluatedScores ? "text-cyan-400 font-bold" : "text-[#9AA4B2] font-semibold"}>
                  {hasEvaluatedScores ? `${avgCommunicationScore}%` : '--'}
                </span>
              </div>
              <div className="w-full bg-[#080B11] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    hasEvaluatedScores ? 'bg-cyan-400' : 'bg-slate-800'
                  }`}
                  style={{ width: `${hasEvaluatedScores ? avgCommunicationScore : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-[#F5F7FA]">Answer Structure (STAR Methodology)</span>
                <span className={hasEvaluatedScores ? "text-indigo-400 font-bold" : "text-[#9AA4B2] font-semibold"}>
                  {hasEvaluatedScores ? `${avgStarScore}%` : '--'}
                </span>
              </div>
              <div className="w-full bg-[#080B11] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    hasEvaluatedScores ? 'bg-indigo-400' : 'bg-slate-800'
                  }`}
                  style={{ width: `${hasEvaluatedScores ? avgStarScore : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Track */}
        <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <span className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#C5F36B]" /> Recommended Next Step
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/[0.06] text-[#C5F36B] border border-white/[0.08]">
                Placement Focus
              </span>
            </div>

            <h3 className="text-base font-bold text-[#F5F7FA]">
              System Design & Scaling
            </h3>
            <p className="text-xs text-[#9AA4B2] mt-1.5 leading-relaxed">
              Targeted for SDE-1 / Fresher interview rounds. Practice answering questions on microservices, caching, and rate limiting with voice follow-ups.
            </p>
          </div>

          <button
            onClick={() => onNavigate('setup')}
            className="w-full mt-6 btn-primary text-xs py-2.5"
          >
            <span>Launch Practice Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6. Compact Company Presets Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#F5F7FA]">Company Recruitment Blueprints</h2>
            <p className="text-xs text-[#9AA4B2]">One-click mock interviews configured for specific hiring formats.</p>
          </div>
          <button
            onClick={() => onNavigate('setup')}
            className="text-xs font-semibold text-[#C5F36B] hover:underline flex items-center gap-1"
          >
            <span>View All Tracks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {COMPANY_PRESETS.slice(0, 6).map((preset) => (
            <button
              key={preset.id}
              onClick={() => onStartPreset(preset.id)}
              className="p-3.5 rounded-xl bg-[#121826] border border-white/[0.08] hover:border-[#C5F36B]/40 transition-all text-left group flex flex-col justify-between"
            >
              <div>
                <CompanyBadge name={preset.name} code={preset.code} companyId={preset.id} size="sm" showCategory={false} />
                <div className="font-bold text-xs text-[#F5F7FA] group-hover:text-[#C5F36B] transition-colors mt-2 truncate">
                  {preset.name}
                </div>
              </div>
              <span className="text-[10px] text-[#9AA4B2] mt-2 block">
                {preset.interviewStructure?.length || 3} rounds
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 7. Recent Session History List */}
      <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#F5F7FA]">Recent Interview Sessions</h2>
          {sessions.length > 0 && (
            <button
              onClick={() => onNavigate('history')}
              className="text-xs font-semibold text-[#C5F36B] hover:underline"
            >
              View Full History →
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#080B11] border border-white/[0.08] flex items-center justify-center text-[#9AA4B2] mx-auto">
              <Video className="w-6 h-6 text-[#9AA4B2]" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-[#F5F7FA]">No interview sessions recorded yet</p>
              <p className="text-[11px] text-[#9AA4B2] max-w-sm mx-auto">
                Start your first mock session to unlock personalized feedback, STAR scores, and model answers.
              </p>
            </div>
            <button
              onClick={() => onNavigate('setup')}
              className="btn-primary text-xs py-2 px-4 mt-2"
            >
              Start First Mock Interview
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sessions.slice(0, 5).map((session) => (
              <div
                key={session.id}
                onClick={() => handleOpenReport(session.id)}
                className="p-3.5 rounded-xl bg-[#0B0F19] border border-white/[0.06] hover:border-white/[0.12] flex items-center justify-between gap-4 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-[#121826] border border-white/[0.08] flex items-center justify-center shrink-0">
                    <Video className="w-4 h-4 text-[#C5F36B]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#F5F7FA] truncate">
                      {session.config.companyName} • {session.config.role}
                    </div>
                    <div className="text-[10px] text-[#9AA4B2] flex items-center gap-2 mt-0.5">
                      <span className="capitalize">{session.config.difficulty}</span>
                      <span>•</span>
                      <span>{session.questions.length} questions</span>
                      <span>•</span>
                      <span>{new Date(session.startedAt || session.completedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {session.feedbackReport ? (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30">
                      {session.feedbackReport.overallScore}/100
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium text-[#9AA4B2] bg-white/[0.04]">
                      Incomplete
                    </span>
                  )}

                  <button
                    onClick={(e) => handleDeleteSession(session.id, e)}
                    className="p-1.5 text-[#9AA4B2] hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors"
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
