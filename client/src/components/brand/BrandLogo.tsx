import React from 'react';
import { BrandIcon } from './BrandIcon';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'stacked';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
  useOfficialImage?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  layout = 'horizontal',
  showTagline = true,
  className = '',
  onClick,
  useOfficialImage = false
}) => {
  const iconSize = size === 'sm' ? 'sm' : size === 'md' ? 'md' : size === 'lg' ? 'lg' : 'xl';

  const titleSize = size === 'sm' 
    ? 'text-sm sm:text-base' 
    : size === 'md' 
    ? 'text-base sm:text-lg' 
    : size === 'lg'
    ? 'text-xl sm:text-2xl'
    : 'text-2xl sm:text-3xl';

  const badgeSize = size === 'sm'
    ? 'text-[9px] px-1 py-0.2'
    : size === 'md'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-0.5';

  if (useOfficialImage) {
    return (
      <div 
        onClick={onClick}
        className={`inline-flex flex-col items-center justify-center select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      >
        <img 
          src="/interviewbro-logo.png" 
          alt="InterviewBro AI Official Logo"
          className={`object-contain rounded-2xl drop-shadow-lg transition-transform duration-200 ${
            size === 'sm' ? 'h-10' : size === 'md' ? 'h-14' : size === 'lg' ? 'h-20' : 'h-32'
          } ${onClick ? 'group-hover:scale-105' : ''}`}
        />
      </div>
    );
  }

  if (layout === 'stacked') {
    return (
      <div 
        onClick={onClick}
        className={`inline-flex flex-col items-center justify-center text-center select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      >
        <BrandIcon size={iconSize} glow={true} className={onClick ? 'group-hover:scale-105 transition-transform duration-200' : ''} />
        
        <div className="mt-3 flex flex-col items-center">
          <span className={`font-black tracking-tight uppercase text-[#0A2540] dark:text-white ${titleSize} transition-colors`}>
            INTERVIEW <span className="text-[#DC2626]">BRO</span> AI
          </span>
          {showTagline && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider uppercase font-semibold mt-1">
              Practice Smarter • Get Hired
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <BrandIcon size={iconSize} glow={false} className={onClick ? 'group-hover:scale-105 transition-transform duration-200' : ''} />
      
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black tracking-tight text-[#0A2540] dark:text-white uppercase ${titleSize} transition-colors`}>
            INTERVIEW<span className="text-[#DC2626] ml-1">BRO</span>
          </span>
          <span className={`font-extrabold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md shadow-sm ${badgeSize}`}>
            AI
          </span>
        </div>
        
        {showTagline && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider uppercase font-medium mt-1">
            Practice Smarter • Get Hired
          </p>
        )}
      </div>
    </div>
  );
};
