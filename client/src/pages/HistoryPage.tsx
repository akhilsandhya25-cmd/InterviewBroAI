import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  ArrowRight, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Search, 
  Video,
  Award
} from 'lucide-react';
import { storage } from '../services/storage';
import { useInterview } from '../context/InterviewContext';
import { InterviewSession } from '../types';

interface HistoryPageProps {
  onNavigate: (route: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const { loadReport } = useInterview();
  const [sessions, setSessions] = useState<InterviewSession[]>(() => storage.getSessions());
  const [search, setSearch] = useState<string>('');

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.config.companyName.toLowerCase().includes(search.toLowerCase()) ||
    s.config.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this mock interview session and all its associated question transcripts?')) {
      storage.deleteSession(id);
      setSessions(storage.getSessions());
    }
  };

  const handleOpenReport = (sessionId: string) => {
    loadReport(sessionId);
    onNavigate('reports');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Session Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Interview History & Transcripts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review past question evaluations, answers, and score improvements over time.
          </p>
        </div>

        <button
          onClick={() => onNavigate('setup')}
          className="px-5 py-2.5 rounded-xl font-bold text-xs gradient-button flex items-center gap-2 self-start sm:self-auto"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Start New Mock</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by company, role, or keywords..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
        />
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <History className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white mb-1">No Sessions Match Your Search</h3>
          <p className="text-xs text-slate-400">Complete an interview or clear your filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleOpenReport(session.id)}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0 font-bold text-base">
                  {session.config.companyName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                    {session.title}
                  </h3>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-medium text-slate-300">{session.config.role}</span>
                    <span>•</span>
                    <span className="capitalize">{session.config.interviewType} Round</span>
                    <span>•</span>
                    <span className="capitalize">{session.config.difficulty}</span>
                    <span>•</span>
                    <span className="text-slate-500">{new Date(session.startedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3">
                    <span>{session.questions.length} Questions Answered</span>
                    <span>•</span>
                    <span>{Math.round(session.elapsedSeconds / 60)} mins elapsed</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-auto">
                {session.feedbackReport && (
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-400">
                      {session.feedbackReport.overallScore}/100
                    </div>
                    <div className="text-[10px] text-slate-400">STAR Score</div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenReport(session.id);
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                  >
                    View Report
                  </button>

                  <button
                    onClick={(e) => handleDelete(session.id, e)}
                    className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
