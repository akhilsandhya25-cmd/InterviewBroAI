import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Mic,
  Camera
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
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* 1. Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200 bg-gradient-to-b from-blue-50/40 via-white to-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Readiness Mode Micro-Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700 mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Built for Campus Placements & Off-Campus Hiring</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-950 mb-5 leading-[1.12]">
            Practice Smarter. <br />
            <span className="text-blue-700">Interview Better.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8">
            The voice-first AI interview platform designed for Indian college students and fresh graduates. Practice role-specific rounds with adaptive follow-ups and objective STAR rubric evaluations.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto mb-10">
            <button
              onClick={onStartPracticing}
              className="w-full sm:w-auto btn-primary text-sm py-3 px-6 shadow-lg shadow-red-500/20"
            >
              <span>Start Free Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('resume')}
              className="w-full sm:w-auto btn-secondary text-sm py-3 px-6 text-slate-800 hover:text-blue-700"
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Analyze Resume ATS</span>
            </button>
          </div>

          {/* Key Assurance Points */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>5 Free Full Sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>In-Browser Speech & Video</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>STAR Rubric Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>No Credit Card Required</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Product Preview */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-md">
            {/* Preview Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Live Mock Interview Simulation
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Flipkart SDE-1 Round
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-3">
                <span>Question <strong className="text-slate-900">2 of 4</strong></span>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-800 font-mono border border-slate-200">12:45 remaining</span>
              </div>
            </div>

            {/* Preview Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
              {/* AI Question & Speech Transcript */}
              <div className="md:col-span-2 space-y-4">
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-2">
                    <BrandIcon size={18} glow={false} />
                    <span>AI Interviewer Question</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 leading-relaxed">
                    "In your resume, you highlighted a distributed e-commerce backend built with Node.js and MongoDB. How did you handle concurrent inventory deductions during flash sales to prevent overselling?"
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                      <Mic className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                      Live Candidate Speech
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Web Speech STT</span>
                  </div>
                  <p className="text-xs text-slate-700 italic leading-relaxed">
                    "We used atomic conditional operations in MongoDB with $inc and $gte guards. At scale, we placed Redis queues in front and applied distributed locks using Redlock to serialize inventory decrements..."
                  </p>
                </div>
              </div>

              {/* Local Camera Mirror Preview */}
              <div className="relative rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-blue-600 mb-3 shadow-xs">
                  <Camera className="w-7 h-7 text-blue-600" />
                </div>
                <p className="text-xs font-semibold text-slate-900">Local Camera Mirror</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Private client-side stream</p>

                <div className="mt-4 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                    Camera Active
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-semibold">
                    Mic Connected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works (3 Clear Steps) */}
      <section id="how-it-works" className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Clear 3-Step Methodology
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1 mb-3">
            How InterviewBro AI Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A structured preparation routine designed to build authentic technical fluency and eliminate placement anxiety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Configure Your Target</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose your target company track (TCS, Infosys, Amazon, Flipkart, Startups), select your role specialization, and paste a job description or your resume.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Practice In Real Time</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Answer realistic questions under timed conditions. Speak naturally via your microphone or type your responses. The AI interviewer adapts with technical follow-up questions.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Review STAR Feedback</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive an immediate evaluation report grading technical correctness, communication structure, and depth, complete with suggested model answers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Company Placement Tracks */}
      <section id="company-tracks" className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Recruitment Blueprints
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-1">
                Engineered for Real Hiring Patterns
              </h2>
            </div>
            <p className="text-xs text-slate-600 max-w-sm">
              Questions calibrated to real candidate interview rounds across services, product companies, and fast-growing startups.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COMPANY_PRESETS.slice(0, 8).map((preset) => (
              <div
                key={preset.id}
                onClick={onStartPracticing}
                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <CompanyBadge name={preset.name} code={preset.code} companyId={preset.id} size="sm" showCategory={false} />
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {preset.category}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {preset.name}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
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
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Straightforward answers about our practice tools, evaluation rubrics, and privacy architecture.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left text-xs sm:text-sm font-semibold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-150 ${openFaq === idx ? 'rotate-90' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-5 sm:px-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. Bottom CTA Strip */}
      <section className="py-16 bg-[#0A2540] text-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ready to Ace Your Next Technical Interview?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
            Take your first full-length mock session in under two minutes. No credit card required.
          </p>
          <div>
            <button
              onClick={onStartPracticing}
              className="btn-primary text-sm py-3 px-8 bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-xl shadow-red-950/40"
            >
              <span>Start Free Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="py-10 border-t border-slate-200 bg-white text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">INTERVIEW <span className="text-[#DC2626]">BRO</span> AI</span>
            <span>• Practice Smarter • Get Hired</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('privacy-center')} className="hover:text-blue-600 transition-colors">
              Privacy Center
            </button>
            <button onClick={() => onNavigate('legal:terms')} className="hover:text-blue-600 transition-colors">
              Terms of Service
            </button>
            <button onClick={() => onNavigate('legal:privacy')} className="hover:text-blue-600 transition-colors">
              DPDP Compliance
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
