import React from 'react';

interface BrandIconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  glow?: boolean;
  variant?: 'monochrome' | 'gradient';
}

export const BrandIcon: React.FC<BrandIconProps> = ({ 
  size = 'md', 
  className = '', 
  glow = true,
  variant = 'gradient'
}) => {
  const pixelSize = typeof size === 'number' 
    ? size 
    : size === 'xs' ? 22
    : size === 'sm' ? 32 
    : size === 'md' ? 42 
    : size === 'lg' ? 56 
    : 80;

  return (
    <div 
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {glow && (
        <div 
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-600/35 via-cyan-500/25 to-blue-500/20 blur-md pointer-events-none transform -scale-95 transition-opacity" 
          aria-hidden="true"
        />
      )}
      
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-md"
        role="img"
        aria-label="InterviewBro AI Official Logo"
      >
        <defs>
          <linearGradient id="ib-tie-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          <linearGradient id="ib-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>

          <linearGradient id="ib-border-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={variant === 'monochrome' ? '#FFFFFF' : '#8B5CF6'} />
            <stop offset="50%" stopColor={variant === 'monochrome' ? '#E2E8F0' : '#06B6D4'} />
            <stop offset="100%" stopColor={variant === 'monochrome' ? '#CBD5E1' : '#3B82F6'} />
          </linearGradient>

          <filter id="tie-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Rounded Square Badge (Matching Official Logo Frame) */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="20"
          fill="#080C15"
          stroke="url(#ib-border-glow)"
          strokeWidth="4"
        />

        {/* Shirt Inner Collar Cutout / Neck Line */}
        <path
          d="M 33 24 L 67 24 L 59 34 L 41 34 Z"
          fill="none"
          stroke={variant === 'monochrome' ? '#FFFFFF' : '#CBD5E1'}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Left Collar Wing */}
        <path
          d="M 31 24 L 44 45 L 36 43 L 26 27 Z"
          fill={variant === 'monochrome' ? '#FFFFFF' : 'url(#ib-tie-grad)'}
          stroke={variant === 'monochrome' ? '#FFFFFF' : '#94A3B8'}
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Right Collar Wing */}
        <path
          d="M 69 24 L 56 45 L 64 43 L 74 27 Z"
          fill={variant === 'monochrome' ? '#FFFFFF' : 'url(#ib-tie-grad)'}
          stroke={variant === 'monochrome' ? '#FFFFFF' : '#94A3B8'}
          strokeWidth="1"
          strokeLinejoin="round"
        />

        {/* Tie Knot (Centered between collar tips) */}
        <path
          d="M 45 37 L 55 37 L 57 44 L 43 44 Z"
          fill={variant === 'monochrome' ? '#FFFFFF' : 'url(#ib-accent-grad)'}
          stroke={variant === 'monochrome' ? '#FFFFFF' : '#A78BFA'}
          strokeWidth="1.2"
          strokeLinejoin="round"
          rx="1"
        />

        {/* Tie Body & Arrowhead Blade */}
        <path
          d="M 44.5 45 L 55.5 45 L 58.5 70 L 50 82 L 41.5 70 Z"
          fill={variant === 'monochrome' ? '#FFFFFF' : 'url(#ib-tie-grad)'}
          stroke={variant === 'monochrome' ? '#FFFFFF' : '#CBD5E1'}
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
