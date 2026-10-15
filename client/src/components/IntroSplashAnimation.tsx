import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Cpu, Volume2 } from 'lucide-react';

interface IntroSplashAnimationProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export const IntroSplashAnimation: React.FC<IntroSplashAnimationProps> = ({ 
  onComplete,
  minDurationMs = 2100 
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Initializing InterviewBro AI Engine...');
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(1, elapsed / minDurationMs);
      
      setProgress(Math.round(ratio * 100));

      if (ratio < 0.35) {
        setStatusText('Calibrating Google Gemini Reasoning...');
      } else if (ratio < 0.70) {
        setStatusText('Synthesizing Neural Interviewer Audio...');
      } else if (ratio < 0.95) {
        setStatusText('Configuring Placement Blueprint & Tracks...');
      } else {
        setStatusText('Ready. Entering Interview Studio...');
      }

      if (ratio >= 1) {
        clearInterval(interval);
        setIsFadingOut(true);
        setTimeout(() => {
          onComplete();
        }, 500); // 500ms smooth fade transition
      }
    }, 40);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 250);
  };

  return (
    <div 
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06080F] transition-all duration-500 cursor-pointer select-none ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="Startup Intro Animation"
    >
      {/* Ambient Atmospheric Radial Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/15 to-cyan-500/15 rounded-full blur-[100px] pointer-events-none animate-pulse duration-2000" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md mx-auto">
        
        {/* Animated Badge / Logo Container */}
        <div className="relative mb-6 group">
          {/* Outer Pulsing Glow Ring */}
          <div className="absolute -inset-3 rounded-3xl bg-gradient-to-tr from-violet-600/40 via-cyan-400/30 to-blue-500/20 blur-xl opacity-75 animate-pulse" />

          {/* Official Logo Display */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-[#090D17] border-2 border-white/80 p-2 shadow-2xl flex items-center justify-center overflow-hidden transform hover:scale-105 transition-transform duration-300">
            {/* SVG Vector Collar & Tie Symbol */}
            <svg
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
            >
              <defs>
                <linearGradient id="intro-tie-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="60%" stopColor="#F1F5F9" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>

                <linearGradient id="intro-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="50%" stopColor="#818CF8" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
              </defs>

              {/* Shirt Inner Collar Cutout */}
              <path
                d="M 33 24 L 67 24 L 59 34 L 41 34 Z"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinejoin="round"
                className="animate-pulse"
              />

              {/* Left Collar Wing */}
              <path
                d="M 31 24 L 44 45 L 36 43 L 26 27 Z"
                fill="url(#intro-tie-grad)"
                stroke="#94A3B8"
                strokeWidth="1"
                strokeLinejoin="round"
              />

              {/* Right Collar Wing */}
              <path
                d="M 69 24 L 56 45 L 64 43 L 74 27 Z"
                fill="url(#intro-tie-grad)"
                stroke="#94A3B8"
                strokeWidth="1"
                strokeLinejoin="round"
              />

              {/* Tie Knot */}
              <path
                d="M 45 37 L 55 37 L 57 44 L 43 44 Z"
                fill="url(#intro-accent-grad)"
                stroke="#A78BFA"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />

              {/* Tie Body & Arrowhead Blade */}
              <path
                d="M 44.5 45 L 55.5 45 L 58.5 70 L 50 82 L 41.5 70 Z"
                fill="url(#intro-tie-grad)"
                stroke="#CBD5E1"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Wordmark Title */}
        <div className="space-y-1.5 mb-6">
          <h1 className="text-2xl sm:text-3xl font-black tracking-[0.2em] uppercase text-white drop-shadow-md">
            INTERVIEW <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">BRO</span> AI
          </h1>
          <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-slate-400">
            Practice Smarter • Get Hired
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-64 sm:w-72 bg-slate-900/90 rounded-full h-1.5 overflow-hidden p-0.5 border border-slate-800 shadow-inner mb-3">
          <div 
            className="h-full bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-100 ease-out shadow-[0_0_10px_rgba(6,182,212,0.6)]"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Real-time Status Caption */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{statusText}</span>
        </div>
      </div>

      {/* Skip Button Bottom Hint */}
      <div className="absolute bottom-6 right-6 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
        <span>Click anywhere or skip</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};
