import React from 'react';
import { UmayorLogo } from './UmayorLogo';
import { useApp } from '../context/AppContext';

interface UmayorSloganBannerProps {
  className?: string;
  compact?: boolean;
}

export const UmayorSloganBanner: React.FC<UmayorSloganBannerProps> = ({
  className = '',
  compact = false,
}) => {
  let brandingConfig: any = null;
  try {
    const app = useApp();
    brandingConfig = app.brandingConfig;
  } catch {
    // Graceful fallback
  }

  const isCustomBanner = brandingConfig?.bannerType === 'custom_image' && Boolean(brandingConfig?.bannerImageUrl);

  // If Super Admin uploaded a custom banner image
  if (isCustomBanner && brandingConfig?.bannerImageUrl) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-white border border-[#E2E8F0] shadow-sm select-none ${className}`}>
        <img
          src={brandingConfig.bannerImageUrl}
          alt="Banner Institucional"
          className="w-full h-auto max-h-56 sm:max-h-72 object-cover object-center"
        />
        {brandingConfig.bannerSubtitle && (
          <div className="bg-[#006837] text-white px-4 py-2 text-center text-xs font-heading font-extrabold tracking-wider uppercase">
            {brandingConfig.bannerSubtitle}
          </div>
        )}
      </div>
    );
  }

  const prefix = brandingConfig?.bannerSloganPrefix || 'LA CALIDAD, UN C';
  const word = brandingConfig?.bannerSloganWord || 'OMPR';
  const suffix = brandingConfig?.bannerSloganSuffix || 'OMISO';
  const scriptWord = brandingConfig?.bannerScriptWord || 'permanente';
  const subtitle = brandingConfig?.bannerSubtitle || 'FACULTAD DE INGENIERÍA · CONSEJO CURRICULAR';
  const showSeal = brandingConfig?.showQualitySeal ?? true;

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#F8FAF8] border border-[#E2E8F0] shadow-sm p-4 sm:p-6 lg:p-8 select-none ${className}`}>
      {/* Background Sweeping Green & Gold Waves */}
      <svg
        className="absolute top-0 left-0 w-48 sm:w-64 h-auto pointer-events-none opacity-90"
        viewBox="0 0 300 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-20 -20 C100 -20 180 30 220 120 L-20 120 Z"
          fill="#006837"
        />
        <path
          d="M-20 -20 C110 -10 190 20 240 120 L220 120 C180 30 100 -20 -20 -20 Z"
          fill="#E59800"
        />
      </svg>

      <svg
        className="absolute bottom-0 right-0 w-64 sm:w-96 h-auto pointer-events-none opacity-90"
        viewBox="0 0 400 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M420 140 C280 140 180 90 120 -20 L420 -20 Z"
          fill="#006837"
        />
        <path
          d="M420 140 C270 130 170 80 100 -20 L120 -20 C180 90 280 140 420 140 Z"
          fill="#E59800"
        />
      </svg>

      {/* Giant U Watermark Faint Outline */}
      <div className="absolute right-4 bottom-0 opacity-10 pointer-events-none text-[#006837] font-heading font-black text-9xl">
        U
      </div>

      {/* Main Grid Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
        {/* Left: Official UMAYOR Emblem & Divider */}
        <div className="flex items-center gap-4 shrink-0">
          <UmayorLogo size={compact ? 'md' : 'lg'} variant="full" />
          <div className="hidden sm:block h-16 w-px bg-[#006837]/30"></div>
        </div>

        {/* Center/Right: Campaign Slogan */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1">
            <span className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-[#006837] tracking-tight uppercase leading-none">
              {prefix}
            </span>

            {/* Rosette Medal Checkmark for the "O" */}
            <span className="inline-flex items-center justify-center relative mx-0.5">
              <span className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-[#006837] tracking-tight uppercase leading-none">
                {word}
              </span>
              {showSeal ? (
                <span className="relative inline-flex items-center justify-center w-7 sm:w-9 h-7 sm:h-9 mx-0.5 bg-gradient-to-br from-[#F2A900] to-[#E59800] rounded-full border-2 border-white shadow-md text-white font-bold text-xs sm:text-sm">
                  ✓
                  {/* Ribbon Tails */}
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                    <span className="w-1.5 h-3 bg-[#006837] rotate-12 rounded-b-xs"></span>
                    <span className="w-1.5 h-3 bg-[#006837] -rotate-12 rounded-b-xs"></span>
                  </span>
                </span>
              ) : null}
            </span>

            {/* Suffix */}
            <span className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-[#006837] tracking-tight uppercase leading-none">
              {suffix}
            </span>
          </div>

          {/* Cursive Script Word */}
          <div className="font-script text-3xl sm:text-4xl lg:text-5xl text-[#E59800] font-bold leading-none -mt-1 sm:-mt-2 lowercase drop-shadow-2xs">
            {scriptWord}
          </div>

          {subtitle && (
            <div className="mt-2 text-[10px] sm:text-xs font-heading font-bold text-[#2D3748] uppercase tracking-wider">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
