import React from 'react';

interface BrandIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  glow?: boolean;
}

export const BrandIcon: React.FC<BrandIconProps> = ({ 
  size = 'md', 
  className = '', 
  glow = true 
}) => {
  const pixelSize = typeof size === 'number' 
    ? size 
    : size === 'sm' ? 28 
    : size === 'md' ? 38 
    : size === 'lg' ? 48 
    : 64;

  return (
    <div 
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {glow && (
        <div 
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-600/40 via-cyan-500/30 to-violet-500/20 blur-md pointer-events-none transform -scale-95 transition-opacity" 
          aria-hidden="true"
        />
      )}
      
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-md"
        role="img"
        aria-label="InterviewBro AI Logo Icon"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="ib-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B0F19" />
            <stop offset="50%" stopColor="#111827" />
            <stop offset="100%" stopColor="#0D1322" />
          </linearGradient>

          <linearGradient id="ib-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>

          <linearGradient id="ib-violet-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          <linearGradient id="ib-cyan-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          <filter id="ib-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Squircle Background Base */}
        <rect
          x="4"
          y="4"
          width="92"
          height="92"
          rx="24"
          fill="url(#ib-bg-grad)"
          stroke="url(#ib-border-grad)"
          strokeWidth="2.5"
        />

        {/* Subtle Inner Highlight Grid / Ambient Ring */}
        <circle cx="50" cy="50" r="34" stroke="#8B5CF6" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="3 3" />

        {/* Combined Conversation Bubble & Confidence Shield */}
        {/* Outer Shield & Speech Tail Path */}
        <path
          d="M 28 32
             C 28 25 35 20 50 20
             C 65 20 72 25 72 32
             C 72 45 68 62 50 76
             C 32 62 28 45 28 32 Z"
          fill="url(#ib-violet-cyan)"
          fillOpacity="0.2"
          stroke="url(#ib-violet-cyan)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Speech Bubble Tail Anchor pointing to the speaker */}
        <path
          d="M 36 65 L 26 74 L 39 70 Z"
          fill="url(#ib-violet-cyan)"
          stroke="url(#ib-border-grad)"
          strokeWidth="1.5"
        />

        {/* Voice Frequency Waveforms inside Dialogue Shield */}
        <path d="M 37 46 L 37 54" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" />
        <path d="M 43 41 L 43 59" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
        <path d="M 50 36 L 50 64" stroke="#F8FAFC" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 57 41 L 57 59" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
        <path d="M 63 46 L 63 54" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" />

        {/* AI Radiance Spark / Diamond in Top Right */}
        <path
          d="M 70 24 Q 70 30 76 30 Q 70 30 70 36 Q 70 30 64 30 Q 70 30 70 24 Z"
          fill="#22D3EE"
          filter="url(#ib-soft-glow)"
        />
        <circle cx="70" cy="30" r="1.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
