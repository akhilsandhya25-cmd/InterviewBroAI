import React, { useState } from 'react';
import {
  Video,
  FileText,
  Award,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Code2,
  Target,
  HelpCircle,
  Mic,
  Camera,
  Layers,
  Briefcase
} from 'lucide-react';
import { COMPANY_PRESETS } from '../data/presets';
import { BrandIcon } from '../components/brand/BrandIcon';
import { CompanyBadge } from '../components/CompanyBadge';

interface LandingPageProps {
  onStartPracticing: () => void;
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartPracticing, onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is InterviewBro AI free for college students and freshers?",
      a: "Yes. Every student receives 5 full-length, AI-evaluated mock interview sessions complete with speech recognition, dynamic follow-up questions, and comprehensive STAR feedback reports. No credit card is required."
    },
    {
      q: "Does InterviewBro AI scan my facial expressions or eye contact?",
      a: "No. We focus strictly on the substantive qualities engineering hiring managers evaluate: technical correctness, system architecture choices, trade-offs, structured communication (STAR format), and clarity."
    },
    {
      q: "Are the interview tracks aligned with real placement drives?",
      a: "Yes. Pre-configured tracks are modeled after actual campus recruitment patterns for Indian IT services (TCS NQT, Infosys DSE, Wipro Turbo) as well as tier-1 product companies (Flipkart, Amazon India, Swiggy)."
    },
    {
      q: "How does the Resume ATS Analyzer work?",
      a: "Upload your resume in PDF, DOCX, or TXT format. The analyzer extracts your technical skills, flags missing keywords for your target role, and generates tailored interview questions specific to your listed projects."
    },
    {
      q: "Where is my microphone and video data processed?",
      a: "All audio and video streams run locally in your web browser. Audio recordings are never hoarded or sold, and you have complete control to review or delete your session history at any time."
    }
  ];

  return (
    <div className="min-h-screen bg-[#080B11] text-[#F5F7FA] flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-white/[0.08] overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[320px] bg-[#C5F36B]/[0.03] blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Readiness Mode Micro-Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121826] border border-white/[0.1] text-xs font-semibold text-[#F5F7FA] mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C5F36B]" />
            <span>Built for Campus Placements & Off-Campus Hiring</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F5F7FA] mb-5 leading-[1.12]">
            Practice Smarter. <br />
            Interview Better.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#9AA4B2] font-normal leading-relaxed mb-8">
            The voice-first AI interview platform designed for Indian college students and fresh graduates. Practice role-specific rounds with adaptive follow-ups and objective STAR rubric evaluations.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-10">
            <button
              onClick={onStartPracticing}
              className="w-full sm:w-auto btn-primary text-sm py-3 px-6 shadow-lg shadow-[#C5F36B]/15"
            >
              <span>Start Free Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('resume')}
              className="w-full sm:w-auto btn-secondary text-sm py-3 px-6"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Analyze Resume ATS</span>
            </button>
          </div>

          {/* Key Assurance Points */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-[#9AA4B2]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C5F36B]" />
              <span>5 Free Full Sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C5F36B]" />
              <span>In-Browser Speech & Video</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C5F36B]" />
              <span>STAR Rubric Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#C5F36B]" />
              <span>No Credit Card Required</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Product Preview */}
      <section className="py-16 bg-[#0B0F19] border-b border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="p-1 rounded-3xl bg-gradient-to-b from-white/[0.12] to-transparent">
            <div className="rounded-[22px] bg-[#121826] p-6 sm:p-8 border border-white/[0.08]">
              {/* Preview Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F5F7FA]">
                    Live Mock Interview Simulation
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/[0.06] text-[#C5F36B] border border-white/[0.08]">
                    Flipkart SDE-1 Round
                  </span>
                </div>
                <div className="text-xs text-[#9AA4B2] flex items-center gap-3">
                  <span>Question <strong className="text-[#F5F7FA]">2 of 4</strong></span>
                  <span className="px-2 py-1 rounded bg-[#080B11] text-[#F5F7FA] font-mono border border-white/[0.06]">12:45 remaining</span>
                </div>
              </div>

              {/* Preview Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
                {/* AI Question & Speech Transcript */}
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 rounded-xl bg-[#0B0F19] border border-white/[0.08]">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#C5F36B] mb-2">
                      <BrandIcon size={18} glow={false} />
                      <span>AI Interviewer Question</span>
                    </div>
                    <p className="text-sm font-medium text-[#F5F7FA] leading-relaxed">
                      "In your resume, you highlighted a distributed e-commerce backend built with Node.js and MongoDB. How did you handle concurrent inventory deductions during flash sales to prevent overselling?"
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#080B11]/80 border border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs text-[#9AA4B2] mb-2">
                      <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                        <Mic className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        Live Candidate Speech
                      </span>
                      <span className="text-[10px] text-[#9AA4B2]">Web Speech STT</span>
                    </div>
                    <p className="text-xs text-[#F5F7FA]/90 italic leading-relaxed">
                      "We used atomic conditional operations in MongoDB with $inc and $gte guards. At scale, we placed Redis queues in front and applied distributed locks using Redlock to serialize inventory decrements..."
                    </p>
                  </div>
                </div>

                {/* Local Camera Mirror Preview */}
                <div className="relative rounded-xl bg-[#080B11] border border-white/[0.08] flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-[#121826] border border-white/[0.1] flex items-center justify-center text-[#F5F7FA] mb-3">
                    <Camera className="w-7 h-7 text-[#C5F36B]" />
                  </div>
                  <p className="text-xs font-semibold text-[#F5F7FA]">Local Camera Mirror</p>
                  <p className="text-[11px] text-[#9AA4B2] mt-0.5">Private client-side stream</p>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                      Camera Active
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 text-[10px] font-semibold">
                      Mic Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works (3 Clear Steps) */}
      <section id="how-it-works" className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] mb-3">
            How InterviewBro AI Works
          </h2>
          <p className="text-xs sm:text-sm text-[#9AA4B2]">
            A structured three-step preparation routine designed to build authentic technical fluency and eliminate placement anxiety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#080B11] border border-white/[0.1] flex items-center justify-center text-[#C5F36B] font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-[#F5F7FA] mb-2">Configure Your Target</h3>
              <p className="text-xs text-[#9AA4B2] leading-relaxed">
                Choose your target company track (TCS, Infosys, Amazon, Flipkart, Startups), select your role specialization, and paste a job description or your resume.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#080B11] border border-white/[0.1] flex items-center justify-center text-[#C5F36B] font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-[#F5F7FA] mb-2">Practice In Real Time</h3>
              <p className="text-xs text-[#9AA4B2] leading-relaxed">
                Answer realistic questions under timed conditions. Speak naturally via your microphone or type your responses. The AI interviewer adapts with technical follow-up questions.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#121826] border border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#080B11] border border-white/[0.1] flex items-center justify-center text-[#C5F36B] font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-[#F5F7FA] mb-2">Review STAR Feedback</h3>
              <p className="text-xs text-[#9AA4B2] leading-relaxed">
                Receive an immediate evaluation report grading technical correctness, communication structure, and depth, complete with suggested model answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Company Placement Tracks */}
      <section id="company-tracks" className="py-16 bg-[#0B0F19] border-y border-white/[0.08]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-[#C5F36B] uppercase tracking-wider">
                Recruitment Blueprints
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] mt-1">
                Engineered for Real Hiring Patterns
              </h2>
            </div>
            <p className="text-xs text-[#9AA4B2] max-w-sm">
              Questions calibrated to real candidate interview rounds across services, product companies, and fast-growing startups.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMPANY_PRESETS.slice(0, 8).map((preset) => (
              <div
                key={preset.id}
                onClick={onStartPracticing}
                className="p-4 rounded-xl bg-[#121826] border border-white/[0.08] hover:border-[#C5F36B]/40 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <CompanyBadge name={preset.name} code={preset.code} companyId={preset.id} size="sm" showCategory={false} />
                  <span className="text-[10px] uppercase font-bold text-[#9AA4B2]">
                    {preset.category}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-[#F5F7FA] group-hover:text-[#C5F36B] transition-colors">
                  {preset.name}
                </h3>
                <p className="text-[11px] text-[#9AA4B2] mt-1 line-clamp-2">
                  {preset.tagline}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Frequently Asked Questions */}
      <section id="faq" className="py-20 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#9AA4B2]">
            Straightforward answers about our practice tools, evaluation rubrics, and privacy architecture.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-[#121826] border border-white/[0.08] overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left text-xs sm:text-sm font-semibold text-[#F5F7FA] flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-[#9AA4B2] shrink-0 transition-transform duration-150 ${openFaq === idx ? 'rotate-90' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-5 sm:px-5 text-xs text-[#9AA4B2] leading-relaxed border-t border-white/[0.04] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. Bottom CTA Strip */}
      <section className="py-16 bg-[#0B0F19] border-t border-white/[0.08]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#F5F7FA]">
            Ready to Ace Your Next Technical Interview?
          </h2>
          <p className="text-xs sm:text-sm text-[#9AA4B2] max-w-lg mx-auto">
            Take your first full-length mock session in under two minutes. No credit card required.
          </p>
          <div>
            <button
              onClick={onStartPracticing}
              className="btn-primary text-sm py-3 px-8 shadow-lg shadow-[#C5F36B]/20"
            >
              <span>Start Free Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-10 border-t border-white/[0.08] bg-[#080B11] text-xs text-[#9AA4B2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#F5F7FA]">INTERVIEW BRO AI</span>
            <span>• Practice Smarter • Get Hired</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('privacy-center')} className="hover:text-[#F5F7FA] transition-colors">
              Privacy Center
            </button>
            <button onClick={() => onNavigate('legal:terms')} className="hover:text-[#F5F7FA] transition-colors">
              Terms of Service
            </button>
            <button onClick={() => onNavigate('legal:privacy')} className="hover:text-[#F5F7FA] transition-colors">
              DPDP Compliance
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
