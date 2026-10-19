import React from 'react';
import {
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  RefreshCw,
  Download,
  MessageSquare,
  Lightbulb,
  Check,
  Calendar,
  Film,
  Shield,
  FileText
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
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#121826] border border-white/[0.08] flex items-center justify-center text-[#9AA4B2] mx-auto">
          <Award className="w-6 h-6 text-[#9AA4B2]" />
        </div>
        <h2 className="text-xl font-bold text-[#F5F7FA]">No Evaluation Report Available</h2>
        <p className="text-xs text-[#9AA4B2] max-w-sm mx-auto">
          Complete a full mock interview session to unlock your structured STAR rubric evaluation.
        </p>
        <button
          onClick={onStartNew}
          className="btn-primary text-xs py-2.5 px-5 mt-2"
        >
          Start Practice Session
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#121826] border border-white/[0.08] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Interview Session Completed & Evaluated</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
              Performance Evaluation Report
            </h1>
            <p className="text-xs sm:text-sm text-[#9AA4B2] mt-1">
              Candidate: <strong className="text-[#F5F7FA]">{report.candidateName}</strong> • Target: <strong className="text-[#F5F7FA]">{report.company}</strong> ({report.role})
            </p>
          </div>

          {/* Overall Score Badge */}
          <div className="flex items-center gap-4 bg-[#080B11] p-4 rounded-xl border border-white/[0.08] shrink-0">
            <div className="w-16 h-16 rounded-xl bg-[#C5F36B] flex flex-col items-center justify-center text-[#080B11] shadow-md">
              <span className="text-2xl font-black leading-none">{report.overallScore}</span>
              <span className="text-[10px] font-bold text-[#080B11]/70">/ 100</span>
            </div>
            <div>
              <div className="text-xs font-bold text-[#F5F7FA]">Overall Readiness</div>
              <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
                {report.overallScore >= 80
                  ? 'Exceptional Progress • Placement Ready'
                  : report.overallScore >= 65
                    ? 'Solid Foundation • Ready to Polish'
                    : 'Developing Track • High Growth'}
              </div>
              <div className="text-[10px] text-[#9AA4B2] mt-0.5">AI Interviewer Evaluation</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-white/[0.08]">
          <button
            onClick={onStartNew}
            className="btn-primary text-xs py-2 px-4 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Practice Another Session</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn-secondary text-xs py-2 px-4"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save / Print PDF Report</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Pillars Score Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#121826] border border-white/[0.08]">
          <div className="text-xs text-[#9AA4B2] font-medium">Technical Accuracy</div>
          <div className="text-2xl font-black text-[#C5F36B] mt-1">{report.technicalAccuracyScore}%</div>
          <div className="text-[11px] text-[#9AA4B2] font-medium mt-1">
            {report.technicalAccuracyScore >= 80 ? 'Strong conceptual grasp' : 'Solid technical ideas'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121826] border border-white/[0.08]">
          <div className="text-xs text-[#9AA4B2] font-medium">Communication Clarity</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{report.communicationScore}%</div>
          <div className="text-[11px] text-[#9AA4B2] font-medium mt-1">
            {report.communicationScore >= 80 ? 'Clear, composed articulation' : 'Natural delivery style'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121826] border border-white/[0.08]">
          <div className="text-xs text-[#9AA4B2] font-medium">STAR Methodology</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">{report.structureStarScore}%</div>
          <div className="text-[11px] text-[#9AA4B2] font-medium mt-1">
            {report.structureStarScore >= 80 ? 'Well-structured narrative' : 'Good story elements'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#121826] border border-white/[0.08]">
          <div className="text-xs text-[#9AA4B2] font-medium">Relevance & Depth</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{report.relevanceScore}%</div>
          <div className="text-[11px] text-[#9AA4B2] font-medium mt-1">
            {report.relevanceScore >= 80 ? 'Direct and insightful' : 'Addressed the core question'}
          </div>
        </div>
      </div>

      {/* 3. Verbal Mentor Debrief & Summary */}
      <section className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#C5F36B]" />
            <span>Interviewer Debrief & Verbal Feedback</span>
          </h2>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[#9AA4B2] border border-white/[0.06] font-medium">
            Objective Coaching
          </span>
        </div>
        <div className="p-4 sm:p-5 rounded-xl bg-[#080B11] border-l-4 border-l-[#C5F36B] border-t border-r border-b border-white/[0.06]">
          <p className="text-xs sm:text-sm text-[#F5F7FA] leading-relaxed italic">
            "{report.summary}"
          </p>
        </div>
      </section>

      {/* 4. Recorded Video Playback (if saved locally) */}
      {recordedVideoUrl && (
        <section className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                <Film className="w-4 h-4 text-cyan-400" />
                <span>Recorded Mock Interview Session</span>
              </h2>
              <p className="text-xs text-[#9AA4B2] mt-0.5">
                Review your delivery, camera posture, and speaking pace
              </p>
            </div>
            <a
              href={recordedVideoUrl}
              download={`interviewbro-${report.company.toLowerCase()}-session.webm`}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Recording (.webm)</span>
            </a>
          </div>

          <div className="relative aspect-video max-w-2xl mx-auto rounded-2xl bg-black border border-white/[0.08] overflow-hidden shadow-xl">
            <video
              src={recordedVideoUrl}
              controls
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-[11px] text-[#9AA4B2] text-center flex items-center justify-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#9AA4B2] shrink-0" />
            <span>Recording is stored locally in your browser memory and is never transmitted to remote servers.</span>
          </p>
        </section>
      )}

      {/* 5. Strengths & Growth Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-3">
          <div>
            <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>What You Did Really Well</span>
            </h2>
            <p className="text-[11px] text-[#9AA4B2] mt-0.5">
              Standout competencies demonstrated during your session
            </p>
          </div>
          <ul className="space-y-2 text-xs text-[#F5F7FA] pt-1">
            {report.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Opportunities */}
        <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-3">
          <div>
            <h2 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Opportunities to Polish & Elevate</span>
            </h2>
            <p className="text-[11px] text-[#9AA4B2] mt-0.5">
              High-impact refinements to elevate your response to top percentile
            </p>
          </div>
          <ul className="space-y-2 text-xs text-[#F5F7FA] pt-1">
            {report.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 6. Actionable Suggestions & Key Topics */}
      <section className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-4">
        <div>
          <h2 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-[#C5F36B]" />
            <span>Actionable Coaching Tips & Next Steps</span>
          </h2>
          <p className="text-xs text-[#9AA4B2] mt-0.5">
            Practical habits you can practice right away for immediate impact
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#080B11] border border-white/[0.06] space-y-2.5">
            <div className="text-xs font-bold text-[#F5F7FA]">Actionable Delivery Habits:</div>
            <ul className="space-y-2 text-xs text-[#9AA4B2]">
              {report.actionableImprovements.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#C5F36B] font-bold">•</span>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#080B11] border border-white/[0.06] space-y-2.5">
            <div className="text-xs font-bold text-[#F5F7FA]">Key Topics to Review for Next Time:</div>
            <div className="flex flex-wrap gap-2 pt-1">
              {report.recommendedTopics.map((topic, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-[#121826] border border-white/[0.08] text-[#F5F7FA] font-medium">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Question-by-Question Model Comparisons */}
      {report.exampleImprovedAnswers && report.exampleImprovedAnswers.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C5F36B]" />
              <span>Question-by-Question Coaching & Model Answers</span>
            </h2>
            <p className="text-xs text-[#9AA4B2] mt-0.5">
              Compare your answer with a structured STAR model response
            </p>
          </div>

          <div className="space-y-4">
            {report.exampleImprovedAnswers.map((ex, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-3">
                <div className="text-xs font-bold text-[#F5F7FA]">
                  Q{idx + 1}: {ex.question}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#080B11] border border-white/[0.06]">
                    <div className="text-[11px] font-semibold text-[#9AA4B2] mb-1">What You Shared:</div>
                    <p className="text-[#9AA4B2] italic leading-relaxed">{ex.originalSummary}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#080B11] border border-[#C5F36B]/30">
                    <div className="text-[11px] font-semibold text-[#C5F36B] mb-1">Coaching Model (STAR Framework):</div>
                    <p className="text-[#F5F7FA] font-medium leading-relaxed">{ex.improvedAnswer}</p>
                    <div className="mt-2 text-[10px] text-cyan-400">
                      <strong>Why this elevates your response:</strong> {ex.whyBetter}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. 7-Day Growth Plan */}
      {report.prepPlan && report.prepPlan.length > 0 && (
        <section className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C5F36B]" />
              <span>Your 7-Day Placement Growth Plan</span>
            </h2>
            <p className="text-xs text-[#9AA4B2] mt-0.5">
              Take small, steady steps each day to build confidence and polish your technical communication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {report.prepPlan.map((phase, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#080B11] border border-white/[0.06] space-y-2">
                <div className="text-xs font-bold text-[#C5F36B]">{phase.dayOrPhase}</div>
                <div className="text-xs text-[#F5F7FA] font-medium">{phase.focus}</div>
                <ul className="space-y-1 text-[11px] text-[#9AA4B2] pt-1">
                  {phase.actionItems.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#C5F36B]">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
