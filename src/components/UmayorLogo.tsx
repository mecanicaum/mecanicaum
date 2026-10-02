import React from 'react';

interface UmayorLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon' | 'dark';
  className?: string;
}

export const UmayorLogo: React.FC<UmayorLogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
}) => {
  const sizes = {
    sm: { icon: 'h-8 w-8', text: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 'h-10 w-10', text: 'text-base', sub: 'text-[10px]' },
    lg: { icon: 'h-14 w-14', text: 'text-xl', sub: 'text-xs' },
  };

  const { icon, text, sub } = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon Emblem: Green 'U' with Gold Accents */}
      <div className={`relative ${icon} shrink-0 flex items-center justify-center rounded-lg bg-[#006A4E] border border-[#C49E2D]/40 shadow-sm overflow-hidden`}>
        {/* Subtle decorative gold inner border */}
        <div className="absolute inset-0.5 border border-[#C49E2D]/30 rounded-md pointer-events-none"></div>
        
        {/* Heraldic Capital 'U' in White & Gold */}
        <span className="font-cinzel font-bold text-white tracking-tighter text-center leading-none text-xl drop-shadow-xs">
          U
        </span>
        <span className="absolute bottom-1 text-[8px] font-bold tracking-widest text-[#C49E2D] uppercase font-cinzel">
          MAYOR
        </span>
      </div>

      {variant === 'full' && (
        <div className="flex flex-col text-left">
          <div className="flex items-baseline gap-1">
            <span className={`font-cinzel font-black tracking-tight text-[#006A4E] ${text} dark:text-white`}>
              U
            </span>
            <span className={`font-cinzel font-bold tracking-wider text-[#C49E2D] ${text}`}>
              MAYOR
            </span>
          </div>
          <span className={`font-serif italic text-[#C49E2D] font-medium leading-none ${sub}`}>
            Institución Universitaria
          </span>
        </div>
      )}
    </div>
  );
};
