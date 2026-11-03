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
  glow = false,
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
      <svg
        viewBox="0 0 633 661"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative w-full h-full drop-shadow-sm"
        role="img"
        aria-label="InterviewBro AI Official Logo"
      >
        {/* Navy Suit Jacket Outer Frame */}
        <rect
          x="27.5"
          y="16.5"
          width="578"
          height="628"
          rx="80"
          fill="#0A2540"
          stroke="#1E3A8A"
          strokeWidth="20"
        />

        {/* White Shirt Collar Neck Line */}
        <path
          d="M 197 64 L 429 65 L 388 116 L 239 116 Z"
          fill="#FFFFFF"
        />

        {/* Left Collar Wing */}
        <path
          d="M 183 77 L 278 195 L 236 269 L 155 117 Z"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="4"
        />

        {/* Right Collar Wing */}
        <path
          d="M 442 77 L 471 117 L 392 269 L 350 195 Z"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="4"
        />

        {/* Tie Knot (Tie Red) */}
        <path
          d="M 297 202 L 330 202 L 336 207 L 351 248 L 351 255 L 346 261 L 286 263 L 277 257 L 276 249 L 290 209 Z"
          fill="#DC2626"
        />

        {/* Tie Body & Arrowhead Blade (Tie Red) */}
        <path
          d="M 286 280 L 342 282 L 389 523 L 314 610 L 238 525 Z"
          fill="#DC2626"
        />
      </svg>
    </div>
  );
};
