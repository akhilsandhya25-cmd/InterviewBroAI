import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

interface IntroSplashAnimationProps {
  onComplete: () => void;
  minDurationMs?: number;
}

export const IntroSplashAnimation: React.FC<IntroSplashAnimationProps> = ({
  onComplete,
  minDurationMs = 1200
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Initializing Interview Studio...');
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  // Check prefers-reduced-motion or previously seen in session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const alreadySeen = sessionStorage.getItem('ib_intro_seen');
      if (prefersReduced || alreadySeen) {
        onComplete();
        return;
      }
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(1, elapsed / minDurationMs);

      setProgress(Math.round(ratio * 100));

      if (ratio < 0.35) {
        setStatusText('Calibrating AI Reasoning Engine...');
      } else if (ratio < 0.70) {
        setStatusText('Preparing Neural Audio Synthesizer...');
      } else if (ratio < 0.95) {
        setStatusText('Loading Technical Placement Tracks...');
      } else {
        setStatusText('Ready. Entering Studio...');
      }

      if (ratio >= 1) {
        clearInterval(interval);
        setIsFadingOut(true);
        sessionStorage.setItem('ib_intro_seen', 'true');
        setTimeout(() => {
          onComplete();
        }, 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [minDurationMs, onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ib_intro_seen', 'true');
    }
    setTimeout(() => {
      onComplete();
    }, 150);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080B11] transition-all duration-300 select-none ${
        isFadingOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
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
            transform: translateY(-20px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes leftWingUnfold {
          0% {
            transform: translate(-20px, -15px) rotate(-5deg);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes rightWingUnfold {
          0% {
            transform: translate(20px, -15px) rotate(5deg);
            opacity: 0;
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes knotPopIn {
          0% {
            transform: scale(0.4);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes tieCascadeDown {
          0% {
            transform: translateY(-25px) scaleY(0.8);
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
            opacity: 0.4;
          }
          100% {
            transform: translateX(250%) skewX(-25deg);
            opacity: 0;
          }
        }
        .anim-frame {
          animation: frameDraw 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .anim-neck {
          animation: neckDrop 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both;
        }
        .anim-wing-left {
          transform-origin: 184px 77px;
          animation: leftWingUnfold 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }
        .anim-wing-right {
          transform-origin: 442px 77px;
          animation: rightWingUnfold 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
        }
        .anim-knot {
          transform-origin: 313.5px 232.5px;
          animation: knotPopIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.35s both;
        }
        .anim-tie-body {
          transform-origin: 313.5px 280px;
          animation: tieCascadeDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both;
        }
        .anim-shine {
          animation: shineSweep 1.4s ease-in-out 0.6s infinite;
        }
      `}</style>

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-md mx-auto">

        {/* Animated Badge Container */}
        <div className="relative mb-6">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-[#0B0F19] border border-white/[0.1] p-2.5 shadow-2xl flex items-center justify-center overflow-hidden">
            {/* Shimmer Sweep */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
              <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent anim-shine" />
            </div>

            {/* SVG Vector Collar & Tie Symbol */}
            <svg
              viewBox="0 0 633 661"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]"
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

              {/* 1. Outer Frame */}
              <rect
                x="27.5"
                y="16.5"
                width="578"
                height="628"
                rx="80"
                fill="#0B0F19"
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

              {/* 6. Tie Body */}
              <path
                d="M 286 280 L 342 282 L 389 523 L 314 610 L 238 525 Z"
                fill="url(#splash-tie-grad)"
                className="anim-tie-body"
              />
            </svg>
          </div>
        </div>

        {/* Wordmark Title */}
        <div className="space-y-1 mb-5">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-[#F5F7FA]">
            INTERVIEW<span className="text-[#C5F36B] ml-1">BRO</span> AI
          </h1>
          <p className="text-[11px] font-medium tracking-wider uppercase text-[#9AA4B2]">
            Practice Smarter • Get Hired
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-56 sm:w-64 bg-[#121826] rounded-full h-1 overflow-hidden border border-white/[0.08] mb-3">
          <div
            className="h-full bg-[#C5F36B] rounded-full transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Status Caption */}
        <div className="text-xs text-[#9AA4B2] font-mono">
          <span>{statusText}</span>
        </div>
      </div>

      {/* Accessible Skip Button */}
      <button
        onClick={handleSkip}
        type="button"
        className="absolute bottom-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#9AA4B2] hover:text-[#F5F7FA] hover:bg-white/[0.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5F36B]"
        aria-label="Skip introductory animation"
      >
        <span>Skip intro</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
