import React, { useState, useEffect } from 'react';
import { Construction, Sparkles, X, ChevronRight, Info, Wrench, ShieldAlert } from 'lucide-react';

interface DevelopmentNoticeBannerProps {
  onLearnMore?: () => void;
}

export const DevelopmentNoticeBanner: React.FC<DevelopmentNoticeBannerProps> = ({ onLearnMore }) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('interviewbro_dev_notice_minimized') === 'true';
    } catch {
      return false;
    }
  });

  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('interviewbro_dev_notice_minimized', 'true');
    } catch (e) {
      console.warn('Could not save notice dismissal state:', e);
    }
  };

  const handleRestore = () => {
    setIsDismissed(false);
    try {
      sessionStorage.removeItem('interviewbro_dev_notice_minimized');
    } catch (e) {
      console.warn('Could not restore notice state:', e);
    }
  };

  if (isDismissed) {
    return (
      <div className="bg-[#0b101c] border-b border-amber-500/20 py-1 px-3 text-[11px] text-slate-300 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="font-semibold text-amber-300 flex items-center gap-1">
            <Construction className="w-3 h-3 text-amber-400" />
            <span>Active Development Preview</span>
          </span>
          <span className="text-slate-400 hidden sm:inline">• Platform features are actively being built and refined</span>
        </div>
        <button
          type="button"
          onClick={handleRestore}
          className="text-[10px] text-amber-300 hover:text-white underline underline-offset-2 transition-colors font-medium cursor-pointer"
        >
          View Full Notice
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative z-50 bg-gradient-to-r from-amber-950/40 via-[#0e1424] to-amber-950/40 border-b border-amber-500/30 px-3 sm:px-4 py-2 text-xs text-slate-200 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Main Notice Information */}
          <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase tracking-wider shrink-0 shadow-sm">
              <Construction className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>In Active Development</span>
            </div>

            <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
              <strong className="text-white">Notice:</strong> InterviewBro AI is an educational project currently under active development. Mock interview simulations, voice synthesis, question generation, and ATS scoring algorithms are continuously evolving.
            </p>

            <button
              type="button"
              onClick={() => setShowDetailsModal(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2 transition-colors shrink-0 cursor-pointer ml-1"
            >
              <span>Development Status & Roadmap</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-amber-200 hover:bg-amber-500/20 transition-colors shrink-0"
            title="Minimize development notice"
            aria-label="Minimize development notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Development Status Modal */}
      {showDetailsModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowDetailsModal(false)}
        >
          <div 
            className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-[#0c111e] border border-amber-500/40 shadow-2xl space-y-5 text-slate-100 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Construction className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Platform Development Status</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                      Beta Preview
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    What we're actively building and refining in InterviewBro AI
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Breakdown Items */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>AI Mock Interview & Follow-Up Probes</span>
                  <span className="text-[10px] text-emerald-400 font-mono ml-auto">Active</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Powered by Google Gemini 2.5 Flash with intelligent follow-up generation based on candidate keywords. Models and prompts are actively tuned for authentic conversational tone.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Voice Simulation & Speech-To-Text</span>
                  <span className="text-[10px] text-amber-400 font-mono ml-auto">In Refinement</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Browser-native Web Speech API and ElevenLabs integration are being optimized for low latency, smooth pronunciation of engineering acronyms, and noise handling.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Company Blueprints & Rubrics</span>
                  <span className="text-[10px] text-cyan-400 font-mono ml-auto">Expanding</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Continually expanding question banks across Indian tech campus tracks (TCS, Infosys, Wipro), high-scale product startups (Flipkart, Swiggy, Zomato), and global MNCs.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Candidate Privacy & Data Isolation</span>
                  <span className="text-[10px] text-emerald-400 font-mono ml-auto">Verified</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Strict user row isolation, volatile RAM-only resume parsing, client-side webcam mirrors, zero advertising tracking, and one-click data export and account erasure.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs text-slate-400">
              <span className="text-[11px]">Encountered an issue or have feedback?</span>
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  if (onLearnMore) onLearnMore();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
              >
                Close & Continue
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
