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
  Star,
  Users,
  Compass,
  Zap,
  Mic,
  Camera,
  Layers,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { COMPANY_PRESETS } from '../data/presets';
import { BrandIcon } from '../components/brand/BrandIcon';
import { BrandLogo } from '../components/brand/BrandLogo';
import { CompanyBadge } from '../components/CompanyBadge';

interface LandingPageProps {
  onStartPracticing: () => void;
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartPracticing, onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is InterviewBro AI completely free for college students?",
      a: "Yes! Every new user receives a free allowance of 5 full-length, AI-evaluated mock interview sessions with video, speech recognition, and comprehensive feedback reports. No credit card is required to begin practicing."
    },
    {
      q: "Does InterviewBro AI grade my facial expressions or eye contact?",
      a: "No. Unlike tools that make scientifically unproven claims about detecting emotion or honesty through webcams, InterviewBro AI focuses strictly on what matters to hiring managers: answer quality, technical accuracy, relevance, structure (STAR format), and communication clarity."
    },
    {
      q: "Are the interview tracks tailored to Indian tech companies?",
      a: "Yes. We offer pre-configured interview blueprints for Indian IT giants (TCS NQT, Infosys DSE/SP, Wipro Elite/Turbo), high-growth product unicorns (Flipkart, Swiggy, Zomato), and global MNCs/FAANG (Amazon India, Google/Microsoft)."
    },
    {
      q: "How does the Resume ATS Analyzer work?",
      a: "Upload your PDF or DOCX resume. Our parser securely extracts text, identifies your technical skill stack, highlights skill gaps based on your target role, and generates tailored interview questions specific to your actual listed projects."
    },
    {
      q: "Are my video and audio recordings kept private?",
      a: "Absolutely. Webcam and microphone streams are processed locally in your browser. Video recordings are only saved locally with your explicit consent, and you have complete control to review or delete your sessions at any time."
    }
  ];

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col selection:bg-purple-500/30">
      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden border-b border-slate-800/80">
        {/* Subtle background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-violet-600/15 via-blue-600/15 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          {/* Brand Emblem & Placement Badge */}
          <div className="flex flex-col items-center justify-center mb-8">
            <BrandIcon size="xl" glow={true} className="mb-5 animate-pulse" />
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-violet-500/30 text-xs font-semibold text-violet-300 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Built for Indian College Placements & Global Tech Interviews</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
            Practice Smarter. <br />
            Interview Better. <br />
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Get Hired.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-400 font-normal leading-relaxed mb-10">
            A realistic AI mock interview platform featuring interactive video rooms, intelligent follow-up questions, resume project interrogations, and actionable STAR feedback reports.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-12">
            <button
              onClick={onStartPracticing}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm gradient-button flex items-center justify-center gap-2"
            >
              <span>Start Practicing Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('resume')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Analyze Resume</span>
            </button>
          </div>

          {/* Trust points */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>5 Free Full Sessions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Browser-Native Video & Speech</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>STAR Rubric Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Credit Card Required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Mock Interview Preview Card */}
      <section className="py-16 bg-[#0a0e18] border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="p-1 rounded-2xl bg-gradient-to-r from-blue-500/30 via-violet-500/30 to-cyan-500/30 shadow-2xl">
            <div className="rounded-[15px] bg-[#0c121e] p-6 sm:p-8 border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Live Video Room Preview
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Flipkart SDE-1 Track
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-4">
                  <span>Question <strong>2 of 3</strong></span>
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono">14:22 remaining</span>
                </div>
              </div>

              {/* Simulated Room Interior */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                {/* Left: AI Question & Transcript */}
                <div className="md:col-span-2 space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="flex items-center gap-2 text-xs font-semibold text-violet-400 mb-2">
                      <BrandIcon size={18} glow={false} />
                      <span>AI Interviewer Question</span>
                    </div>
                    <p className="text-sm font-medium text-slate-100 leading-relaxed">
                      "In your resume, you listed an e-commerce project with Node.js and MongoDB. How did you handle concurrent inventory deductions during flash sales to prevent overselling?"
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1.5 text-cyan-400 font-medium">
                        <Mic className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                        Candidate Speech Transcript
                      </span>
                      <span className="text-[11px] text-slate-500">Live Web Speech STT</span>
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      "We implemented atomic conditional updates in MongoDB with $inc and $gte check. For high concurrency, we queued requests with Redis and applied distributed locks with Redlock..."
                    </p>
                  </div>
                </div>

                {/* Right: Camera Feed preview */}
                <div className="relative rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center text-white mb-3 shadow-lg">
                    <Camera className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-medium text-slate-200">Local Camera Stream</p>
                  <p className="text-[11px] text-slate-500 mt-1">Browser MediaRecorder Native API</p>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium">
                      Webcam Active
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-medium">
                      Mic Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How InterviewBro AI Works */}
      <section id="how-it-works" className="py-20 md:py-28 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            How InterviewBro AI Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            A structured three-step preparation cycle designed to build authentic confidence and eliminate placement anxiety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-violet-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-lg mb-4">
              1
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Configure Your Target</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Select your dream company (TCS, Infosys, Flipkart, Amazon, Startups), target role, experience level, and upload your resume or job description for personalized questions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg mb-4">
              2
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Realistic Video Interview</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Answer one question at a time under timed conditions. Speak naturally via Web Speech or type responses. The AI interviewer adapts and generates intelligent follow-ups.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg mb-4">
              3
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">STAR Feedback & Plan</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Get an instant report grading Technical Accuracy, Communication, and STAR structure, plus example model answers and a personalized 7-day preparation roadmap.
            </p>
          </div>
        </div>
      </section>

      {/* Tailored Company Tracks */}
      <section id="company-tracks" className="py-20 bg-[#090d16] border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400 mb-3">
              <Target className="w-3.5 h-3.5" />
              <span>Role & Company Specific</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
              Targeted for Indian Tech Hiring
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Practice questions tuned to the specific interview styles, rounds, and expectations of top hiring employers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMPANY_PRESETS.slice(0, 6).map((preset) => (
              <div 
                key={preset.id}
                onClick={onStartPracticing}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-4">
                  <CompanyBadge name={preset.name} code={preset.code} size="md" />
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {preset.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors mb-1">
                  {preset.name}
                </h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-1">{preset.tagline}</p>

                <div className="space-y-1.5 pt-3 border-t border-slate-800/80">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">Key Focus:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {preset.focusAreas.slice(0, 3).map((f, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Audiences: Students vs Freshers vs Experienced */}
      <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Designed for Every Stage of Your Career
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Whether cracking your first campus placement or switching into product engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">College Students</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Prepare for on-campus mass drives (TCS NQT, Infosys, Wipro).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Gain confidence answering under a real interview timer.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Practice explaining academic and capstone projects clearly.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Fresh Graduates (0-1 yrs)</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Stand out in competitive off-campus recruitment pools.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Audit your resume against ATS standards and job descriptions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Learn how to structure answers using the STAR method.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Junior & Switch Seekers</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Transition from service IT to high-paying tier-1 product startups.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Practice deep system design, scalability, and distributed caching.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Defend architectural trade-offs under probing follow-up questions.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Transparent Pricing Section */}
      <section id="pricing" className="py-20 bg-[#0a0e17] border-t border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Start completely free. No credit card required. Upgrade only if you need unlimited mock simulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier Card */}
            <div className="p-8 rounded-2xl bg-slate-900/80 border-2 border-violet-500/50 shadow-xl flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-8 px-3 py-1 rounded-full bg-violet-600 text-white text-[11px] font-bold uppercase tracking-wider">
                Current Free Tier
              </div>

              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Starter Practice</h3>
                  <span className="text-3xl font-extrabold text-white">₹0</span>
                </div>
                <p className="text-xs text-slate-400 mb-6">Free forever for placement preparation.</p>

                <ul className="space-y-3 text-xs text-slate-300 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span><strong>5 Full-Length Mock Interviews</strong> included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Local video room with camera & mic support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Real-time speech-to-text transcript</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Comprehensive STAR evaluation & model answers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Resume ATS scan & tailored questions</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onStartPracticing}
                className="w-full py-3 rounded-xl font-semibold text-xs gradient-button"
              >
                Start Practicing Free (5 Left)
              </button>
            </div>

            {/* Placement Pro Card (Future Plan Preview) */}
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-xl font-bold text-white">Placement Unlimited</h3>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-white">₹499</span>
                    <span className="text-xs text-slate-500"> / month</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mb-6">For aggressive interview prep during placement season.</p>

                <ul className="space-y-3 text-xs text-slate-400 mb-8">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    <span>Unlimited mock interview sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    <span>Advanced follow-up questions & stress interviews</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    <span>Unlimited PDF & DOCX resume analyses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    <span>Company-specific questions from past hiring drives</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-violet-400" />
                    <span>Downloadable PDF feedback reports</span>
                  </li>
                </ul>
              </div>

              <button
                disabled
                className="w-full py-3 rounded-xl font-semibold text-xs bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700/50"
              >
                Coming Soon for Placement Season
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">Frequently Asked Questions</h2>
          <p className="text-xs sm:text-sm text-slate-400">Everything you need to know about preparing with InterviewBro AI.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index}
                className="rounded-xl bg-slate-900/60 border border-slate-800/80 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-sm font-semibold text-slate-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90 text-violet-400' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#06080e] py-14 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand & Purpose */}
            <div className="space-y-3 md:col-span-1">
              <BrandLogo size="sm" showTagline={false} />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                India's student-first AI mock interview & career readiness simulator. Practice realistic technical & behavioral interviews with honest, actionable feedback.
              </p>
              <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>DPDP Act 2023 Baseline</span>
              </div>
            </div>

            {/* Platform & Practice */}
            <div className="space-y-2.5">
              <div className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
                Practice Studio
              </div>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button onClick={() => onNavigate('setup')} className="hover:text-white transition-colors">
                    Mock Interview Studio
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('resume')} className="hover:text-white transition-colors">
                    Resume ATS Scanner
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors">
                    Plans & Quotas
                  </button>
                </li>
                <li>
                  <button onClick={onStartPracticing} className="hover:text-white transition-colors text-violet-400">
                    Start Free Mock Session
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal & Compliance (All 8 Policies) */}
            <div className="space-y-2.5">
              <div className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
                Trust & Governance
              </div>
              <ul className="space-y-1.5 text-slate-400">
                <li>
                  <button onClick={() => onNavigate('legal:terms')} className="hover:text-white transition-colors text-left">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('legal:privacy')} className="hover:text-white transition-colors text-left">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('legal:ai-disclaimer')} className="hover:text-white transition-colors text-left">
                    AI & Scoring Disclaimer
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('legal:voice-video')} className="hover:text-white transition-colors text-left">
                    Voice & Video Processing
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('legal:retention')} className="hover:text-white transition-colors text-left">
                    Data Retention & Erasure
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('legal:cookies')} className="hover:text-white transition-colors text-left">
                    Cookie & Storage Notice
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('legal:pricing')} className="hover:text-white transition-colors text-left">
                    Pricing, Usage & Refunds
                  </button>
                </li>
              </ul>
            </div>

            {/* Candidate Privacy Controls */}
            <div className="space-y-2.5">
              <div className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">
                Privacy & Rights
              </div>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <button 
                    onClick={() => onNavigate('privacy-center')} 
                    className="hover:text-white text-violet-300 transition-colors flex items-center gap-1.5 font-semibold text-left"
                  >
                    <span>Candidate Privacy Center</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('privacy-center')} className="hover:text-white transition-colors text-left">
                    Export Data (.JSON)
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('privacy-center')} className="hover:text-rose-400 transition-colors text-left">
                    Request Account Erasure
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigate('legal:contact')} className="hover:text-white transition-colors text-left">
                    Grievance Officer Contact
                  </button>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} InterviewBro AI. Educational mock simulation tool for career placement practice.
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button onClick={() => onNavigate('legal:ai-disclaimer')} className="hover:text-white transition-colors">
                No Guaranteed Hiring
              </button>
              <span>•</span>
              <button onClick={() => onNavigate('legal:voice-video')} className="hover:text-white transition-colors">
                Client-Side Video
              </button>
              <span>•</span>
              <button onClick={() => onNavigate('privacy-center')} className="hover:text-white transition-colors">
                Privacy Controls
              </button>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
