import React from 'react';
import { 
  TrendingUp, 
  Award, 
  Clock, 
  Video, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Flame, 
  Sparkles, 
  Trash2, 
  ExternalLink,
  Target,
  BarChart3,
  Calendar,
  AlertCircle,
  Construction
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import { storage } from '../services/storage';
import { COMPANY_PRESETS } from '../data/presets';
import { InterviewSession, FeedbackReport } from '../types';
import { BrandIcon } from '../components/brand/BrandIcon';
import { CompanyBadge } from '../components/CompanyBadge';

interface DashboardProps {
  onNavigate: (route: string) => void;
  onStartPreset: (presetId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onStartPreset }) => {
  const { user, quota } = useAuth();
  const { loadReport, activeSession } = useInterview();
  const [sessions, setSessions] = React.useState<InterviewSession[]>(() => storage.getSessions(user?.id));
  
  React.useEffect(() => {
    const refresh = () => setSessions(storage.getSessions(user?.id));
    refresh();
    window.addEventListener('interviewbro_storage_synced', refresh);
    return () => window.removeEventListener('interviewbro_storage_synced', refresh);
  }, [user?.id]);

  const reports = storage.getReports(user?.id);
  const resumes = storage.getResumes(user?.id);

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const totalInterviews = completedSessions.length;

  // Gather all valid evaluated reports (from session feedback reports or stored reports)
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

  // Calculate average scores only from real completed evaluation reports
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-blue-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <BrandIcon size="lg" glow={true} className="mt-1 hidden sm:inline-flex" />
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Campus & Placement Readiness Mode</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome back, {user?.full_name || 'Candidate'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                Targeting: {user?.role_target ? (
                  <strong className="text-slate-200">{user.role_target}</strong>
                ) : (
                  <button onClick={() => onNavigate('profile')} className="text-amber-400 hover:text-amber-300 font-semibold underline">
                    Set Target Role →
                  </button>
                )} • Track your performance metrics, identify skill gaps, and practice under realistic conditions.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('setup')}
              className="px-5 py-3 rounded-xl font-bold text-xs gradient-button flex items-center gap-2 shadow-lg"
            >
              <Video className="w-4 h-4" />
              <span>New Mock Interview</span>
            </button>
            <button
              onClick={() => onNavigate('resume')}
              className="px-4 py-3 rounded-xl font-semibold text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Scan Resume</span>
            </button>
          </div>
        </div>

        {/* Notice of Active Development */}
        <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wide">
              <Construction className="w-3 h-3 text-amber-400" />
              <span>In Active Development</span>
            </span>
            <span className="text-[11px] text-slate-300">
              Features, AI follow-up models, and company blueprints are continuously being updated. Your practice data and feedback directly improve the platform.
            </span>
          </div>
        </div>
      </div>

      {/* Onboarding Profile Alert */}
      {(!user?.profile_completed || !user?.role_target) && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white">Action Required: Complete Your Candidate Profile</h3>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                Set your target job role and skills so your AI interviewer can customize realistic interview questions.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5 shadow"
          >
            <span>Complete Profile Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Active Session Alert (if interview in progress) */}
      {activeSession && activeSession.status === 'in_progress' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-500/50 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping shrink-0"></span>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>Active Mock Interview in Progress</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Question {activeSession.currentQuestionIndex + 1} of {activeSession.questions.length}
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-0.5">
                {activeSession.config.companyName} • {activeSession.config.role} ({activeSession.config.interviewType} round)
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('interview')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors flex items-center justify-center gap-1.5 shadow"
          >
            <span>Resume Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completed Interviews */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Total Interviews</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {totalInterviews}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{totalInterviews === 1 ? '1 session recorded' : `${totalInterviews} sessions recorded`}</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Video className="w-5 h-5" />
          </div>
        </div>

        {/* Avg Overall Score */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Average Score</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {hasEvaluatedScores ? (
                <>
                  {avgOverallScore}<span className="text-sm font-semibold text-slate-500">/100</span>
                </>
              ) : (
                <span className="text-slate-400">--<span className="text-sm font-normal text-slate-600">/100</span></span>
              )}
            </div>
            <div className="text-[11px] mt-1 flex items-center gap-1">
              {hasEvaluatedScores ? (
                <span className="text-blue-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>
                    {avgOverallScore! >= 85 ? 'Top 15% Candidate Tier' : avgOverallScore! >= 70 ? 'Proficient Candidate' : 'Developing Candidate'}
                  </span>
                </span>
              ) : (
                <span className="text-slate-500 flex items-center gap-1">
                  <Target className="w-3 h-3 text-slate-500" />
                  <span>No interviews taken yet</span>
                </span>
              )}
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Free Sessions Left */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Interview Allowance</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
              Unlimited
            </div>
            <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <Flame className="w-3 h-3 text-emerald-400" />
              <span>Limits Removed</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* Resume ATS Status */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Resume Status</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {resumes.length > 0 ? `${resumes[0].atsScoreEstimate}%` : 'Pending'}
            </div>
            <div className="text-[11px] text-cyan-400 mt-1 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>{resumes.length > 0 ? 'Analyzed' : 'Upload Resume'}</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Skills & Performance Radar Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Pillars */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-400" />
                <span>Competency Scores by Category</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {hasEvaluatedScores 
                  ? 'Calculated across your evaluated answers' 
                  : 'Complete an interview to generate baseline competency scores'}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 px-2 py-1 rounded bg-slate-800">
              {hasEvaluatedScores ? 'Transparent Rubric' : 'No Interviews Yet'}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300">Technical Accuracy & Problem Solving</span>
                <span className={hasEvaluatedScores ? "text-blue-400 font-bold" : "text-slate-500 font-bold"}>
                  {hasEvaluatedScores ? `${avgTechnicalScore}%` : '--'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    hasEvaluatedScores ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-slate-700'
                  }`}
                  style={{ width: `${hasEvaluatedScores ? avgTechnicalScore : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300">Communication Clarity & Articulation</span>
                <span className={hasEvaluatedScores ? "text-violet-400 font-bold" : "text-slate-500 font-bold"}>
                  {hasEvaluatedScores ? `${avgCommunicationScore}%` : '--'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    hasEvaluatedScores ? 'bg-gradient-to-r from-violet-500 to-purple-500' : 'bg-slate-700'
                  }`}
                  style={{ width: `${hasEvaluatedScores ? avgCommunicationScore : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-300">Answer Structure (STAR Methodology)</span>
                <span className={hasEvaluatedScores ? "text-cyan-400 font-bold" : "text-slate-500 font-bold"}>
                  {hasEvaluatedScores ? `${avgStarScore}%` : '--'}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    hasEvaluatedScores ? 'bg-gradient-to-r from-cyan-500 to-teal-500' : 'bg-slate-700'
                  }`}
                  style={{ width: `${hasEvaluatedScores ? avgStarScore : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Takeaway Box */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              {hasEvaluatedScores ? (
                <>
                  <strong className="text-white">Coach Tip:</strong> Your technical answers are clear! To reach the top tier, explicitly state metrics (e.g. "reduced latency by 30%") and explain trade-offs before concluding.
                </>
              ) : (
                <>
                  <strong className="text-white">Coach Tip:</strong> Ready to practice? Take your first mock interview to establish your baseline competency scores and receive tailored feedback.
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Next Practice Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 mb-2">
              <Target className="w-4 h-4" />
              <span>Recommended Next Step</span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              System Design & Scaling
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Practice handling distributed caching, optimistic locks, and database replication for high-throughput product interviews (Flipkart & Swiggy).
            </p>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-[11px] text-slate-300 mb-4">
              <div className="text-slate-400 font-medium">Session Parameters:</div>
              <div>• 3 System Design Questions</div>
              <div>• 20 Minutes Timed</div>
              <div>• Instant STAR Evaluation</div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('setup')}
            className="w-full py-2.5 rounded-xl font-bold text-xs gradient-button flex items-center justify-center gap-1.5"
          >
            <span>Start Practice Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Launch Company Presets */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Quick-Start Indian Company Blueprints</span>
          </h2>
          <button 
            onClick={() => onNavigate('setup')}
            className="text-xs text-violet-400 hover:text-violet-300 font-medium"
          >
            Customize Parameters →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COMPANY_PRESETS.slice(0, 4).map((preset) => (
            <div
              key={preset.id}
              onClick={() => onStartPreset(preset.id)}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/50 hover:bg-slate-900 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <CompanyBadge name={preset.name} code={preset.code} size="sm" />
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-violet-400 transition-colors">
                  Launch →
                </span>
              </div>
              <div className="font-semibold text-xs text-white truncate">{preset.name.split('(')[0]}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{preset.tagline}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Sessions List */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>Recent Mock Interviews</span>
          </h2>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-slate-400 hover:text-white"
          >
            View All History ({sessions.length})
          </button>
        </div>

        {sessions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
            <Video className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No mock interview sessions recorded yet.</p>
            <button
              onClick={() => onNavigate('setup')}
              className="mt-3 px-4 py-2 rounded-lg text-xs font-semibold gradient-button"
            >
              Start Your First Mock
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {sessions.slice(0, 4).map((session) => (
              <div
                key={session.id}
                onClick={() => handleOpenReport(session.id)}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0 font-bold text-xs">
                    {session.config.companyName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                      {session.title}
                    </h3>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{session.config.role}</span>
                      <span>•</span>
                      <span className="capitalize">{session.config.interviewType}</span>
                      <span>•</span>
                      <span className="capitalize text-slate-500">{new Date(session.startedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  {session.feedbackReport && (
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-emerald-400">
                        {session.feedbackReport.overallScore}/100
                      </div>
                      <div className="text-[10px] text-slate-500">Overall Score</div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenReport(session.id);
                      }}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                    >
                      View Report
                    </button>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      title="Delete Session"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
