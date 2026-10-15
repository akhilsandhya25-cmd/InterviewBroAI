import React from 'react';
import { BrandIcon } from './BrandIcon';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
  onClick
}) => {
  const iconSize = size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg';

  const titleSize = size === 'sm' 
    ? 'text-base' 
    : size === 'md' 
    ? 'text-lg' 
    : 'text-2xl';

  const badgeSize = size === 'sm'
    ? 'text-[9px] px-1 py-0.2'
    : size === 'md'
    ? 'text-[10px] px-1.5 py-0.5'
    : 'text-xs px-2 py-0.5';

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      <BrandIcon size={iconSize} glow={true} className={onClick ? 'group-hover:scale-105 transition-transform duration-200' : ''} />
      
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-extrabold tracking-tight text-white ${titleSize} ${onClick ? 'group-hover:text-slate-100' : ''} transition-colors`}>
            Interview<span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Bro</span>
          </span>
          <span className={`font-bold uppercase tracking-wider bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md backdrop-blur-sm ${badgeSize}`}>
            AI
          </span>
        </div>
        
        {showTagline && (
          <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium mt-1">
            Practice Smarter • Get Hired
          </p>
        )}
      </div>
    </div>
  );
};
