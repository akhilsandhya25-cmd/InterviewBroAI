import React, { useState } from 'react';
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
      <div className="bg-amber-50/80 border-b border-amber-200 py-1 px-3 text-[11px] text-amber-900 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span className="font-semibold text-amber-900 flex items-center gap-1">
            <Construction className="w-3 h-3 text-amber-600" />
            <span>Active Development Preview</span>
          </span>
          <span className="text-amber-700 hidden sm:inline">• Platform features are actively being built and refined</span>
        </div>
        <button
          type="button"
          onClick={handleRestore}
          className="text-[10px] text-amber-800 hover:text-amber-950 underline underline-offset-2 transition-colors font-medium cursor-pointer"
        >
          View Full Notice
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="relative z-50 bg-amber-50 border-b border-amber-200 px-3 sm:px-4 py-2 text-xs text-amber-950 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Main Notice Information */}
          <div className="flex items-center gap-2.5 flex-wrap flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[10px] uppercase tracking-wider shrink-0 shadow-xs">
              <Construction className="w-3.5 h-3.5 text-amber-700" />
              <span>In Active Development</span>
            </div>

            <p className="text-amber-900 text-[11px] sm:text-xs leading-relaxed">
              <strong className="text-amber-950">Notice:</strong> InterviewBro AI is an educational project currently under active development. Mock interview simulations, voice synthesis, question generation, and ATS scoring algorithms are continuously evolving.
            </p>

            <button
              type="button"
              onClick={() => setShowDetailsModal(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-2 transition-colors shrink-0 cursor-pointer ml-1"
            >
              <span>Development Status & Roadmap</span>
              <ChevronRight className="w-3 h-3 text-blue-700" />
            </button>
          </div>

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-lg text-amber-700 hover:text-amber-950 hover:bg-amber-100 transition-colors shrink-0"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowDetailsModal(false)}
        >
          <div 
            className="w-full max-w-lg p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-5 text-slate-900 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <Construction className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                    <span>Platform Development Status</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 font-bold uppercase">
                      Beta Preview
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    What we're actively building and refining in InterviewBro AI
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status Breakdown Items */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>AI Mock Interview & Follow-Up Probes</span>
                  <span className="text-[10px] text-emerald-600 font-semibold ml-auto">Active</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Powered by Google Gemini 2.5 Flash with intelligent follow-up generation based on candidate keywords. Models and prompts are actively tuned for authentic conversational tone.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-blue-600" />
                  <span>Voice Simulation & Speech-To-Text</span>
                  <span className="text-[10px] text-amber-700 font-semibold ml-auto">In Refinement</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Browser-native Web Speech API and ElevenLabs integration are being optimized for low latency, smooth pronunciation of engineering acronyms, and noise handling.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-blue-600" />
                  <span>Company Blueprints & Rubrics</span>
                  <span className="text-[10px] text-blue-700 font-semibold ml-auto">Expanding</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Continually expanding question banks across Indian tech campus tracks (TCS, Infosys, Wipro), high-scale product startups (Flipkart, Swiggy, Zomato), and global MNCs.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Candidate Privacy & Data Isolation</span>
                  <span className="text-[10px] text-emerald-600 font-semibold ml-auto">Verified</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Strict user row isolation, volatile RAM-only resume parsing, client-side webcam mirrors, zero advertising tracking, and one-click data export and account erasure.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
              <span className="text-[11px]">Encountered an issue or have feedback?</span>
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  if (onLearnMore) onLearnMore();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors"
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
