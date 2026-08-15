import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  className = "w-8 h-8", 
  size = 32 
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden shadow-sm transition-transform group-hover:scale-105 ${className}`}
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #60b6c4 0%, #469aa7 100%)',
      }}
    >
      {/* Exact visual reproduction of the Type Shikho brand icon */}
      <svg 
        viewBox="0 0 100 100" 
        className="w-[68%] h-[68%] text-slate-800 dark:text-slate-900"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Upward arrow */}
        <path 
          d="M50 16L32 34M50 16L68 34M50 16V46" 
          stroke="#1e3e45" 
          strokeWidth="7" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Vertical Capsule / Key / Finger Pill */}
        <rect 
          x="35" 
          y="52" 
          width="30" 
          height="34" 
          rx="15" 
          stroke="#1e3e45" 
          strokeWidth="7" 
          fill="none"
        />
      </svg>
    </div>
  );
};
