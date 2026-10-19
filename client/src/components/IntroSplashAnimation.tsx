import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05070D] transition-all duration-500 cursor-pointer select-none ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="Startup Intro Animation"
    >
      <style>{`
        @keyframes frameDraw {
          0% {
            stroke-dasharray: 2400;
            stroke-dashoffset: 2400;
            opacity: 0.3;
          }
          100% {
            stroke-dasharray: 2400;
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
        @keyframes neckDrop {
          0% {
            transform: translateY(-25px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes leftWingUnfold {
          0% {
            transform: translate(-30px, -20px) rotate(-6deg);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes rightWingUnfold {
          0% {
            transform: translate(30px, -20px) rotate(6deg);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes knotPopIn {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          65% {
            transform: scale(1.15);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes tieCascadeDown {
          0% {
            transform: translateY(-35px) scaleY(0.7);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scaleY(1);
            opacity: 1;
          }
        }
        @keyframes shineSweep {
          0% {
            transform: translateX(-150%) skewX(-25deg);
            opacity: 0;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translateX(250%) skewX(-25deg);
            opacity: 0;
          }
        }
        .anim-frame {
          animation: frameDraw 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-neck {
          animation: neckDrop 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both;
        }
        .anim-wing-left {
          transform-origin: 184px 77px;
          animation: leftWingUnfold 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both;
        }
        .anim-wing-right {
          transform-origin: 442px 77px;
          animation: rightWingUnfold 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both;
        }
        .anim-knot {
          transform-origin: 313.5px 232.5px;
          animation: knotPopIn 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.55s both;
        }
        .anim-tie-body {
          transform-origin: 313.5px 280px;
          animation: tieCascadeDown 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.65s both;
        }
        .anim-shine {
          animation: shineSweep 1.6s ease-in-out 1.1s infinite;
        }
      `}</style>

      {/* Ambient Atmospheric Radial Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-violet-600/25 via-indigo-600/15 to-cyan-500/20 rounded-full blur-[110px] pointer-events-none animate-pulse duration-2000" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md mx-auto">
        
        {/* Animated Badge / Logo Container */}
        <div className="relative mb-6 group">
          {/* Outer Pulsing Glow Aura */}
          <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-violet-600/40 via-cyan-400/35 to-blue-500/30 blur-2xl opacity-80 animate-pulse" />

          {/* Official Logo Display Container */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] bg-[#04060B] border border-white/20 p-2.5 shadow-[0_0_35px_rgba(255,255,255,0.15)] flex items-center justify-center overflow-hidden transform hover:scale-105 transition-transform duration-300">
            {/* Shimmer Light Reflection Sweep Across Logo */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent anim-shine" />
            </div>

            {/* SVG Vector Collar & Tie Symbol */}
            <svg
              viewBox="0 0 633 661"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_0_16px_rgba(255,255,255,0.45)]"
            >
              <defs>
                <linearGradient id="splash-tie-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="60%" stopColor="#F8FAFC" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>

                <linearGradient id="splash-knot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#F1F5F9" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>

                <linearGradient id="splash-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="50%" stopColor="#F1F5F9" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
              </defs>

              {/* 1. Outer Rounded Rectangle Frame with Drawing Animation */}
              <rect
                x="27.5"
                y="16.5"
                width="578"
                height="628"
                rx="80"
                fill="#04060B"
                stroke="url(#splash-border-grad)"
                strokeWidth="25"
                className="anim-frame"
              />

              {/* 2. Shirt Inner Collar Neck Band */}
              <path
                d="M 197 64 L 429 65 L 388 116 L 239 116 Z"
                fill="#FFFFFF"
                className="anim-neck"
              />

              {/* 3. Left Collar Wing */}
              <path
                d="M 183 77 L 278 195 L 236 269 L 155 117 Z"
                fill="url(#splash-tie-grad)"
                className="anim-wing-left"
              />

              {/* 4. Right Collar Wing */}
              <path
                d="M 442 77 L 471 117 L 392 269 L 350 195 Z"
                fill="url(#splash-tie-grad)"
                className="anim-wing-right"
              />

              {/* 5. Tie Knot */}
              <path
                d="M 297 202 L 330 202 L 336 207 L 351 248 L 351 255 L 346 261 L 286 263 L 277 257 L 276 249 L 290 209 Z"
                fill="url(#splash-knot-grad)"
                className="anim-knot"
              />

              {/* 6. Tie Body & Arrowhead Blade */}
              <path
                d="M 286 280 L 342 282 L 389 523 L 314 610 L 238 525 Z"
                fill="url(#splash-tie-grad)"
                className="anim-tie-body"
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
