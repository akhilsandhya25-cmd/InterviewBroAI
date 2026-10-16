import React from 'react';

interface CompanyBadgeProps {
  name: string;
  code?: string;
  category?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const CompanyBadge: React.FC<CompanyBadgeProps> = ({
  name,
  code,
  size = 'md',
  className = ''
}) => {
  const getMonogram = () => {
    if (code && code.trim().length > 0) return code.trim();
    const clean = name.replace(/\([^)]*\)/g, '').trim();
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return clean.slice(0, 3).toUpperCase();
  };

  const monogram = getMonogram();

  const sizeClasses = {
    xs: 'w-6 h-6 text-[9px] rounded-md',
    sm: 'w-7 h-7 text-[10px] rounded-lg',
    md: 'w-9 h-9 text-xs rounded-xl',
    lg: 'w-12 h-12 text-sm rounded-2xl'
  };

  return (
    <div
      className={`inline-flex items-center justify-center font-mono font-bold tracking-wider bg-slate-900 border border-slate-700/80 text-slate-100 shadow-sm shrink-0 select-none ${sizeClasses[size]} ${className}`}
      title={name}
      aria-label={name}
    >
      <span>{monogram}</span>
    </div>
  );
};
