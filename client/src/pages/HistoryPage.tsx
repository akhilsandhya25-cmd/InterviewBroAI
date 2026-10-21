import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  Search, 
  Video
} from 'lucide-react';
import { storage } from '../services/storage';
import { useInterview } from '../context/InterviewContext';
import { InterviewSession } from '../types';
import { useAuth } from '../context/AuthContext';

interface HistoryPageProps {
  onNavigate: (route: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { loadReport } = useInterview();
  const [sessions, setSessions] = useState<InterviewSession[]>(() => storage.getSessions(user?.id));
  const [search, setSearch] = useState<string>('');

  React.useEffect(() => {
    const refresh = () => setSessions(storage.getSessions(user?.id));
    refresh();
    window.addEventListener('interviewbro_storage_synced', refresh);
    return () => window.removeEventListener('interviewbro_storage_synced', refresh);
  }, [user?.id]);

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.config.companyName.toLowerCase().includes(search.toLowerCase()) ||
    s.config.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this mock interview session and all its associated question transcripts?')) {
      storage.deleteSession(id, user?.id);
      setSessions(storage.getSessions(user?.id));
    }
  };

  const handleOpenReport = (sessionId: string) => {
    loadReport(sessionId);
    onNavigate('reports');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#C5F36B]/15 text-[#C5F36B] border border-[#C5F36B]/30">
              Session Archive
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
            Interview History & Transcripts
          </h1>
          <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1">
            Review past question evaluations, answers, and score improvements over time.
          </p>
        </div>

        <button
          onClick={() => onNavigate('setup')}
          className="btn-primary text-xs py-2.5 px-4 self-start sm:self-auto"
        >
          <Video className="w-3.5 h-3.5" />
          <span>Start New Mock</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#9AA4B2] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by company, role, or keywords..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#121826] border border-white/[0.08] text-xs text-[#F5F7FA] placeholder-[#9AA4B2]/60 focus-visible:outline-none focus-visible:border-[#C5F36B]"
        />
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121826] border border-white/[0.08]">
          <History className="w-10 h-10 text-[#9AA4B2]/60 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-[#F5F7FA] mb-1">No Sessions Match Your Search</h3>
          <p className="text-xs text-[#9AA4B2]">Complete an interview or clear your filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleOpenReport(session.id)}
              className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] hover:border-white/[0.16] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#080B11] border border-white/[0.08] flex items-center justify-center text-[#C5F36B] shrink-0 font-bold text-base">
                  {session.config.companyName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F7FA] group-hover:text-[#C5F36B] transition-colors">
                    {session.title}
                  </h3>
                  <div className="text-xs text-[#9AA4B2] flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-medium text-[#F5F7FA]">{session.config.role}</span>
                    <span>•</span>
                    <span className="capitalize">{session.config.interviewType} Round</span>
                    <span>•</span>
                    <span className="capitalize">{session.config.difficulty}</span>
                    <span>•</span>
                    <span>{new Date(session.startedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[11px] text-[#9AA4B2] mt-1 flex items-center gap-3">
                    <span>{session.questions.length} Questions Answered</span>
                    <span>•</span>
                    <span>{Math.round(session.elapsedSeconds / 60)} mins elapsed</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end md:self-auto">
                {session.feedbackReport && (
                  <div className="text-right">
                    {session.feedbackReport.source === 'fallback' || session.feedbackReport.overallScore == null ? (
                      <>
                        <div className="text-xs font-bold text-amber-400">Not scored</div>
                        <div className="text-[10px] text-[#9AA4B2]">Demo mode</div>
                      </>
                    ) : (
                      <>
                        <div className="text-base font-black text-[#C5F36B]">
                          {session.feedbackReport.overallScore}/100
                        </div>
                        <div className="text-[10px] text-[#9AA4B2]">STAR Score</div>
                      </>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenReport(session.id);
                    }}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    View Report
                  </button>

                  <button
                    onClick={(e) => handleDelete(session.id, e)}
                    className="p-2 rounded-lg text-[#9AA4B2] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Session"
                    aria-label="Delete Session"
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
