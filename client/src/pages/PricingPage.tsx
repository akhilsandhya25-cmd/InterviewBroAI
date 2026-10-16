import React from 'react';
import { 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  ArrowRight,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PricingPageProps {
  onNavigate: (route: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const { quota } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Transparent Placement Tier</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Fair, Accessible Interview Preparation
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          InterviewBro AI offers 5 full-length mock interviews completely free for every candidate. No hidden trials, no mandatory credit card.
        </p>
      </div>

      {/* Quota Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-blue-950/40 border border-violet-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Your Current Quota Allowance</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              You have <strong className="text-white">{quota.interviewsRemaining} of {quota.freeInterviewsTotal}</strong> free full-length mock interviews remaining.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('setup')}
          className="px-5 py-2.5 rounded-xl font-bold text-xs gradient-button shrink-0"
        >
          Use Free Mock Interview
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1: Free Starter */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border-2 border-violet-500 shadow-xl flex flex-col justify-between relative">
          <div className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold uppercase tracking-wider">
            Active Plan
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Student Starter</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-black text-white">₹0</span>
              <span className="text-xs text-slate-500"> / forever</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">Designed for initial placement readiness.</p>

            <ul className="space-y-2.5 text-xs text-slate-300 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>5 Full Mock Interviews</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Webcam & voice recognition</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>STAR methodology feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>PDF & DOCX resume audit</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigate('setup')}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-violet-600 hover:bg-violet-500 text-white transition-colors"
          >
            Start Free Practice
          </button>
        </div>

        {/* Tier 2: Student Pro (Future) */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Student Pro</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-black text-white">₹199</span>
              <span className="text-xs text-slate-500"> / month</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">For candidates targeting high-growth startups.</p>

            <ul className="space-y-2.5 text-xs text-slate-400 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span><strong>25 Mock Interviews</strong> / month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>Follow-up question challenge mode</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>Unlimited resume scans</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>Detailed PDF evaluation exports</span>
              </li>
            </ul>
          </div>

          <button
            disabled
            className="w-full py-2.5 rounded-xl font-semibold text-xs bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed"
          >
            Coming in Placement Season
          </button>
        </div>

        {/* Tier 3: Placement Unlimited (Future) */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Placement Unlimited</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-black text-white">₹499</span>
              <span className="text-xs text-slate-500"> / 3 months</span>
            </div>
            <p className="text-xs text-slate-400 mb-6">Complete season coverage until you are placed.</p>

            <ul className="space-y-2.5 text-xs text-slate-400 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span><strong>Unlimited Mock Interviews</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>Company-specific past question banks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>System design & machine coding rounds</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>Priority AI response latency</span>
              </li>
            </ul>
          </div>

          <button
            disabled
            className="w-full py-2.5 rounded-xl font-semibold text-xs bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed"
          >
            Coming in Placement Season
          </button>
        </div>
      </div>

      {/* Quota Rules & Fair Use Policy */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="text-white font-semibold flex items-center gap-1.5">
          <Info className="w-4 h-4 text-blue-400" />
          <span>Fair Use & Session Policy:</span>
        </div>
        <p className="leading-relaxed">
          1. A free quota credit is deducted when you launch a personalized interview session. <br />
          2. If a session is interrupted by a browser reload or network failure, your answers and question progress are preserved in local storage so you never lose practice progress. <br />
          3. We do not claim unlimited access on third-party AI APIs; quotas ensure high service quality for every candidate.
        </p>
      </div>
    </div>
  );
};
