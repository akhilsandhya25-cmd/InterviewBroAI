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
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-600/30 via-cyan-500/20 to-blue-500/20 blur-md pointer-events-none transform -scale-95 transition-opacity"
          aria-hidden="true"
        />
      )}
      
      <svg
        viewBox="0 0 633 661"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-md"
        role="img"
        aria-label="InterviewBro AI Official Logo"
      >
        <defs>
          <linearGradient id="ib-tie-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          <linearGradient id="ib-accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={variant === 'monochrome' ? '#FFFFFF' : '#FFFFFF'} />
            <stop offset="50%" stopColor={variant === 'monochrome' ? '#F8FAFC' : '#A78BFA'} />
            <stop offset="100%" stopColor={variant === 'monochrome' ? '#E2E8F0' : '#818CF8'} />
          </linearGradient>

          <linearGradient id="ib-border-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={variant === 'monochrome' ? '#FFFFFF' : '#FFFFFF'} />
            <stop offset="50%" stopColor={variant === 'monochrome' ? '#E2E8F0' : '#06B6D4'} />
            <stop offset="100%" stopColor={variant === 'monochrome' ? '#CBD5E1' : '#8B5CF6'} />
          </linearGradient>
        </defs>

        {/* Outer Rounded Rectangle Frame */}
        <rect
          x="27.5"
          y="16.5"
          width="578"
          height="628"
          rx="80"
          fill="#060911"
          stroke={variant === 'monochrome' ? '#FFFFFF' : 'url(#ib-border-glow)'}
          strokeWidth="25"
        />

        {/* Shirt Inner Collar Cutout / Neck Line */}
        <path
          d="M 197 64 L 429 65 L 388 116 L 239 116 Z"
          fill={variant === 'monochrome' ? '#FFFFFF' : '#F1F5F9'}
        />

        {/* Left Collar Wing */}
        <path
          d="M 183 77 L 278 195 L 236 269 L 155 117 Z"
          fill={variant === 'monochrome' ? '#FFFFFF' : 'url(#ib-tie-grad)'}
        />

        {/* Right Collar Wing */}
        <path
          d="M 442 77 L 471 117 L 392 269 L 350 195 Z"
          fill={variant === 'monochrome' ? '#FFFFFF' : 'url(#ib-tie-grad)'}
        />

        {/* Tie Knot */}
        <path
          d="M 297 202 L 330 202 L 336 207 L 351 248 L 351 255 L 346 261 L 286 263 L 277 257 L 276 249 L 290 209 Z"
          fill={variant === 'monochrome' ? '#FFFFFF' : 'url(#ib-accent-grad)'}
        />

        {/* Tie Body & Arrowhead Blade */}
        <path
          d="M 286 280 L 342 282 L 389 523 L 314 610 L 238 525 Z"
          fill={variant === 'monochrome' ? '#FFFFFF' : 'url(#ib-tie-grad)'}
        />
      </svg>
    </div>
  );
};
