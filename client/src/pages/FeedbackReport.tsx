import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Calendar, 
  Lightbulb, 
  Share2, 
  Download, 
  ArrowRight, 
  ChevronRight, 
  BookOpen, 
  MessageSquare, 
  Layers, 
  Check, 
  Sparkles,
  RefreshCw,
  Video,
  Play,
  Film,
  Shield
} from 'lucide-react';
import { useInterview } from '../context/InterviewContext';
import { FeedbackReport as FeedbackReportType } from '../types';

interface FeedbackReportProps {
  report?: FeedbackReportType;
  onStartNew: () => void;
  onNavigate: (route: string) => void;
}

export const FeedbackReportView: React.FC<FeedbackReportProps> = ({ report: propReport, onStartNew, onNavigate }) => {
  const { activeReport, recordedVideoUrl } = useInterview();
  const report = propReport || activeReport;

  if (!report) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Feedback Report Selected</h2>
        <p className="text-sm text-slate-400">Complete an interview session or select a past report from history.</p>
        <button
          onClick={onStartNew}
          className="px-6 py-2.5 rounded-xl font-semibold text-xs gradient-button"
        >
          Start New Mock Interview
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#101728] to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Interview Session Completed & Evaluated</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Performance Evaluation Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Candidate: <strong className="text-white">{report.candidateName}</strong> • Target: <strong className="text-white">{report.company}</strong> ({report.role})
            </p>
          </div>

          {/* Overall Score Badge */}
          <div className="flex items-center gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-violet-600 to-blue-600 flex flex-col items-center justify-center text-white shadow-lg">
              <span className="text-2xl font-black leading-none">{report.overallScore}</span>
              <span className="text-[10px] font-bold text-violet-200">/ 100</span>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Overall Readiness</div>
              <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
                {report.overallScore >= 80 ? 'Highly Competitive' : report.overallScore >= 65 ? 'Placement Ready' : 'Needs Practice'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">STAR Rubric Standards</div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-slate-800/80">
          <button
            onClick={onStartNew}
            className="px-5 py-2.5 rounded-xl font-bold text-xs gradient-button flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Practice Another Session</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center gap-2 border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save / Print PDF Report</span>
          </button>
        </div>
      </div>

      {/* 4 Pillars Score Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Technical Accuracy</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{report.technicalAccuracyScore}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Core CS & problem logic</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Communication Clarity</div>
          <div className="text-2xl font-black text-violet-400 mt-1">{report.communicationScore}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Tone, pacing & conciseness</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">STAR Methodology</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{report.structureStarScore}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Situation, Task, Action, Result</div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Relevance & Depth</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{report.relevanceScore}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Addressed core question</div>
        </div>
      </div>

      {/* Executive Summary */}
      <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>Interviewer Executive Summary</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {report.summary}
        </p>
      </section>

      {/* Recorded Session Video Playback */}
      {recordedVideoUrl && (
        <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-cyan-400" />
                <span>Recorded Mock Interview Session</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review your delivery, camera posture, and speaking pace
              </p>
            </div>
            <a
              href={recordedVideoUrl}
              download={`interviewbro-${report.company.toLowerCase()}-session.webm`}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Recording (.webm)</span>
            </a>
          </div>

          <div className="relative aspect-video max-w-2xl mx-auto rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl">
            <video
              src={recordedVideoUrl}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Recording is held in your browser memory for your review and is not stored remotely without user action.</span>
          </p>
        </section>
      )}

      {/* Strengths & Weaknesses Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Demonstrated Strengths</span>
          </h2>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses / Gaps */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>Areas for Improvement</span>
          </h2>
          <ul className="space-y-2 text-xs text-slate-300">
            {report.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Actionable Suggestions & Missed Concepts */}
      <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-cyan-400" />
          <span>Actionable Coaching Recommendations</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-200">Specific Delivery Adjustments:</div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              {report.actionableImprovements.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-200">Key Concepts to Revise:</div>
            <div className="flex flex-wrap gap-2 pt-1">
              {report.recommendedTopics.map((topic, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-slate-700 text-slate-300 font-medium">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Model Answer Comparisons */}
      {report.exampleImprovedAnswers && report.exampleImprovedAnswers.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>Question-by-Question Model Answer Transformations</span>
          </h2>

          <div className="space-y-4">
            {report.exampleImprovedAnswers.map((ex, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="text-xs font-bold text-white">
                  Q{idx + 1}: {ex.question}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1">Your Delivery Summary:</div>
                    <p className="text-slate-300 italic">{ex.originalSummary}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/30">
                    <div className="text-[11px] font-semibold text-violet-300 mb-1">Model STAR Answer:</div>
                    <p className="text-slate-200 font-medium leading-relaxed">{ex.improvedAnswer}</p>
                    <div className="mt-2 text-[10px] text-violet-400">
                      <strong>Why this works:</strong> {ex.whyBetter}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Personalized Preparation Plan */}
      {report.prepPlan && report.prepPlan.length > 0 && (
        <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Recommended 7-Day Action Plan</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.prepPlan.map((phase, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400">{phase.dayOrPhase}</div>
                <div className="text-xs text-slate-300 font-medium">{phase.focus}</div>
                <ul className="space-y-1 text-[11px] text-slate-400 pt-1">
                  {phase.actionItems.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Transparent Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-500 leading-relaxed text-center">
        <strong>Evaluation Methodology Disclaimer:</strong> AI-generated scores and metrics are automated educational estimates based on structured rubrics and transcripts. They are intended for self-improvement and do not constitute a guarantee of hiring outcomes or formal job offers.
      </div>
    </div>
  );
};
