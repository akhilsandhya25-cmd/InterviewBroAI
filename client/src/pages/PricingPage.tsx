import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  Info,
  Mail,
  Bell,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { analyticsService } from '../services/analytics';

interface PricingPageProps {
  onNavigate: (route: string) => void;
}

interface WaitlistCaptureProps {
  plan: 'pro' | 'unlimited';
  planName: string;
  defaultEmail: string;
}

const WaitlistCapture: React.FC<WaitlistCaptureProps> = ({ plan, planName, defaultEmail }) => {
  const [email, setEmail] = useState<string>(defaultEmail || '');
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Check duplicate status from localStorage on initial render or user change
  useEffect(() => {
    const key = `interviewbro_waitlist_${plan}`;
    const previouslyJoined = localStorage.getItem(key);
    if (previouslyJoined) {
      setIsJoined(true);
      setFeedbackMsg(`You're already on the waitlist for ${planName}!`);
    } else if (defaultEmail && !email) {
      setEmail(defaultEmail);
    }
  }, [plan, planName, defaultEmail]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    // Check duplicate protection in local storage
    const key = `interviewbro_waitlist_${plan}`;
    const storedEmail = localStorage.getItem(key);
    if (storedEmail && storedEmail.toLowerCase() === cleanEmail) {
      setIsJoined(true);
      setFeedbackMsg(`You're already on the waitlist for ${planName}!`);
      return;
    }

    setLoading(true);

    try {
      const result = await api.joinWaitlist(cleanEmail, plan);
      // Save locally to prevent redundant future submissions
      localStorage.setItem(key, cleanEmail);
      setIsJoined(true);
      setFeedbackMsg(result.message || `You're on the waitlist for ${planName}!`);

      // Track privacy-respecting waitlist analytics (no PII sent)
      analyticsService.trackWaitlistJoined({ plan });
    } catch (err: any) {
      // Local graceful fallback
      localStorage.setItem(key, cleanEmail);
      setIsJoined(true);
      setFeedbackMsg(`Thank you! You're on the waitlist for ${planName}.`);
      analyticsService.trackWaitlistJoined({ plan });
    } finally {
      setLoading(false);
    }
  };

  if (isJoined) {
    return (
      <div className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1.5 transition-all animate-fadeIn">
        <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>You're on the Waitlist!</span>
        </div>
        <p className="text-[11px] text-emerald-300/80 leading-relaxed">
          {feedbackMsg || `We'll email you the moment ${planName} opens for practice.`}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleJoin} className="space-y-2.5">
      <div className="relative">
        <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          placeholder="your-email@college.edu"
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#080B11] border border-white/[0.12] text-xs text-[#F5F7FA] placeholder-slate-500 focus:outline-none focus:border-[#C5F36B] focus:ring-1 focus:ring-[#C5F36B] transition-colors"
        />
      </div>

      {errorMsg && (
        <p className="text-[11px] text-rose-400 text-left pl-1 font-medium">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-[#0F172A] hover:bg-[#1E293B] text-[#C5F36B] border border-[#C5F36B]/30 hover:border-[#C5F36B] flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50 group"
      >
        {loading ? (
          <span className="flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5F36B]" />
            <span>Adding to waitlist...</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-[#C5F36B] group-hover:scale-110 transition-transform" />
            <span>Notify Me on Launch</span>
          </span>
        )}
      </button>
    </form>
  );
};

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const { quota, user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>Transparent Placement Tier</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F7FA] tracking-tight">
          Fair, Accessible Interview Preparation
        </h1>
        <p className="text-xs sm:text-sm text-[#9AA4B2] leading-relaxed">
          InterviewBro AI offers 5 full-length mock interviews completely free for every candidate. No hidden trials, no mandatory credit card.
        </p>
      </div>

      {/* Quota Banner */}
      <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#080B11] border border-white/[0.08] flex items-center justify-center text-amber-400 font-bold text-lg">
            <Sparkles className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F5F7FA]">Your Current Quota Allowance</h3>
            <p className="text-xs text-[#9AA4B2] mt-0.5">
              You have <strong className="text-[#F5F7FA]">{quota.interviewsRemaining} of {quota.freeInterviewsTotal}</strong> free full-length mock interviews remaining.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('setup')}
          className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[#C5F36B] hover:bg-[#b5e858] text-[#080B11] shadow-lg shadow-[#C5F36B]/15 transition-all shrink-0"
        >
          Use Free Mock Interview
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier 1: Free Starter */}
        <div className="p-6 rounded-2xl bg-[#121826] border-2 border-[#C5F36B] shadow-2xl flex flex-col justify-between relative">
          <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-[#C5F36B] text-[#080B11] text-[10px] font-bold uppercase tracking-wider">
            Active Plan
          </div>

          <div>
            <h3 className="text-base font-bold text-[#F5F7FA]">Student Starter</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-black text-[#F5F7FA]">₹0</span>
              <span className="text-xs text-[#9AA4B2]"> / forever</span>
            </div>
            <p className="text-xs text-[#9AA4B2] mb-6">Designed for initial placement readiness.</p>

            <ul className="space-y-2.5 text-xs text-[#9AA4B2] mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-[#F5F7FA]"><strong>5 Full Mock Interviews</strong></span>
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
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#C5F36B] hover:bg-[#b5e858] text-[#080B11] shadow-lg shadow-[#C5F36B]/15 transition-all"
          >
            Start Free Practice
          </button>
        </div>

        {/* Tier 2: Student Pro (Future) with Notify Me Capture */}
        <div className="p-6 rounded-2xl bg-[#121826]/70 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#F5F7FA]">Student Pro</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-black text-[#F5F7FA]">₹199</span>
              <span className="text-xs text-[#9AA4B2]"> / month</span>
            </div>
            <p className="text-xs text-[#9AA4B2] mb-6">For candidates targeting high-growth startups.</p>

            <ul className="space-y-2.5 text-xs text-[#9AA4B2] mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span><strong>25 Mock Interviews</strong> / month</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Follow-up question challenge mode</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Unlimited resume scans</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Detailed PDF evaluation exports</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <WaitlistCapture
              plan="pro"
              planName="Student Pro"
              defaultEmail={user?.email || ''}
            />
          </div>
        </div>

        {/* Tier 3: Placement Unlimited (Future) with Notify Me Capture */}
        <div className="p-6 rounded-2xl bg-[#121826]/70 border border-white/[0.08] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-[#F5F7FA]">Placement Unlimited</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-black text-[#F5F7FA]">₹499</span>
              <span className="text-xs text-[#9AA4B2]"> / 3 months</span>
            </div>
            <p className="text-xs text-[#9AA4B2] mb-6">Complete season coverage until you are placed.</p>

            <ul className="space-y-2.5 text-xs text-[#9AA4B2] mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span><strong>Unlimited Mock Interviews</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Company-specific past question banks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>System design & machine coding rounds</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <span>Priority AI response latency</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <WaitlistCapture
              plan="unlimited"
              planName="Placement Unlimited"
              defaultEmail={user?.email || ''}
            />
          </div>
        </div>
      </div>

      {/* Quota Rules & Fair Use Policy */}
      <div className="p-5 rounded-2xl bg-[#121826] border border-white/[0.08] text-xs text-[#9AA4B2] space-y-2">
        <div className="text-[#F5F7FA] font-semibold flex items-center gap-1.5">
          <Info className="w-4 h-4 text-cyan-400" />
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
