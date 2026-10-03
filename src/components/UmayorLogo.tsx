import React from 'react';
import { useApp } from '../context/AppContext';

interface UmayorLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge' | 'full' | 'card' | 'icon';
  layout?: 'horizontal' | 'vertical';
  showSubtext?: boolean;
  className?: string;
  forceDefault?: boolean; // When true, forces the official vector logo (used in Brand Assets showcase)
}

export const UmayorLogo: React.FC<UmayorLogoProps> = ({
  size = 'md',
  variant = 'badge',
  layout = 'horizontal',
  showSubtext = true,
  className = '',
  forceDefault = false,
}) => {
  let brandingConfig: any = null;
  try {
    const app = useApp();
    brandingConfig = app.brandingConfig;
  } catch {
    // Graceful fallback if rendered outside provider
  }

  const institutionName = brandingConfig?.institutionName || 'INSTITUCIÓN UNIVERSITARIA';
  const facultyName = brandingConfig?.facultyOrLocationName || 'MAYOR DE CARTAGENA';
  const customLogoUrl = brandingConfig?.customLogoUrl;
  const isCustomImage = !forceDefault && brandingConfig?.logoType === 'custom_image' && Boolean(customLogoUrl);

  const dimensions = {
    sm: { iconWidth: 36, iconHeight: 36, title: 'text-[11px]', sub: 'text-[10px]', gap: 'gap-2', badgePadding: 'px-2 py-1' },
    md: { iconWidth: 46, iconHeight: 46, title: 'text-xs', sub: 'text-[11px]', gap: 'gap-2.5', badgePadding: 'px-2.5 py-1.5' },
    lg: { iconWidth: 64, iconHeight: 64, title: 'text-sm', sub: 'text-xs', gap: 'gap-3', badgePadding: 'px-3.5 py-2' },
    xl: { iconWidth: 96, iconHeight: 96, title: 'text-base', sub: 'text-sm', gap: 'gap-4', badgePadding: 'px-5 py-3' },
  };

  const dim = dimensions[size];

  // Pure SVG Emblem or Custom Uploaded Logo
  const renderEmblem = () => {
    if (isCustomImage && customLogoUrl) {
      return (
        <img
          src={customLogoUrl}
          alt={institutionName}
          className="shrink-0 object-contain drop-shadow-xs rounded-sm"
          style={{ width: dim.iconWidth, height: dim.iconHeight }}
        />
      );
    }

    return (
      <svg
        width={dim.iconWidth}
        height={dim.iconHeight}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-xs"
        aria-label="Escudo Oficial UMAYOR"
      >
        <defs>
          {/* Left Pillar Deep Forest Green */}
          <linearGradient id="leftStemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#004D25" />
            <stop offset="100%" stopColor="#005A2B" />
          </linearGradient>

          {/* Right Pillar Emerald Green */}
          <linearGradient id="rightStemGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#007A38" />
            <stop offset="100%" stopColor="#008A40" />
          </linearGradient>

          {/* Bottom Curve Gradient */}
          <linearGradient id="bottomCurveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#004420" />
            <stop offset="45%" stopColor="#00632E" />
            <stop offset="80%" stopColor="#008A40" />
            <stop offset="100%" stopColor="#009647" />
          </linearGradient>
        </defs>

        {/* Main U Geometry */}
        <g id="Emblem-U">
          {/* Left Vertical Column */}
          <path d="M 45 35 L 75 35 L 75 48 L 72 48 L 72 105 L 48 105 L 48 48 L 45 48 Z" fill="url(#leftStemGrad)" />
          <rect x="43" y="35" width="34" height="13" rx="1.5" fill="#004620" />

          {/* Right Vertical Column */}
          <path d="M 125 35 L 155 35 L 155 48 L 152 48 L 152 105 L 128 105 L 128 48 L 125 48 Z" fill="url(#rightStemGrad)" />
          <rect x="123" y="35" width="34" height="13" rx="1.5" fill="#007134" />

          {/* Horseshoe Bottom Curve */}
          <path
            d="M 48 100 
               C 48 152, 74 172, 100 172 
               C 126 172, 152 152, 152 100 
               L 128 100 
               C 128 136, 115 149, 100 149 
               C 85 149, 72 136, 72 100 
               Z"
            fill="url(#bottomCurveGrad)"
          />

          {/* Left Inner Shadow */}
          <path
            d="M 48 100 
               C 48 135, 62 155, 84 167 
               C 71 155, 64 133, 64 100 
               Z"
            fill="#003B1A"
            opacity="0.5"
          />

          {/* MAYOR Centerpiece Banner Plate */}
          <g id="Mayor-Plate">
            <path
              d="M 40 76 Q 100 72 160 76 L 160 114 Q 100 122 40 114 Z"
              fill="#FFFFFF"
              stroke="#FFFFFF"
              strokeWidth="2"
            />

            <text
              x="100"
              y="104"
              textAnchor="middle"
              fill="#E58A13"
              fontFamily="'Montserrat', 'Arial Black', sans-serif"
              fontWeight="900"
              fontSize="31"
              letterSpacing="1.2"
            >
              MAYOR
            </text>

            <path
              d="M 45 109 Q 100 120 155 109"
              stroke="#D32F2F"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />

            <path
              d="M 47 115 Q 100 126 153 115"
              stroke="#008037"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </g>
      </svg>
    );
  };

  // Exact Square Card View
  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 sm:p-8 flex flex-col items-center text-center select-none ${className}`}>
        {renderEmblem()}
        {showSubtext && (
          <div className="mt-4 flex flex-col items-center">
            <span className="font-heading font-black text-[#2D3748] tracking-tight uppercase leading-tight text-sm sm:text-base">
              {institutionName}
            </span>
            <span className="font-heading font-black text-[#2D3748] tracking-wider uppercase leading-tight text-base sm:text-lg mt-0.5">
              {facultyName}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Vertical Layout (centered emblem on top, text below)
  if (layout === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center select-none ${className}`}>
        {renderEmblem()}
        {showSubtext && (
          <div className="mt-2 flex flex-col items-center">
            <span className={`font-heading font-black text-[#2D3748] tracking-tight uppercase leading-tight ${dim.title}`}>
              {institutionName}
            </span>
            <span className={`font-heading font-black text-[#2D3748] tracking-wider uppercase leading-tight ${dim.sub}`}>
              {facultyName}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Badge Container for Dark Headers (High-contrast crisp white capsule)
  if (variant === 'badge') {
    return (
      <div
        className={`bg-white rounded-lg shadow-sm border border-amber-300/60 ${dim.badgePadding} flex items-center ${dim.gap} transition-all hover:shadow-md select-none shrink-0 ${className}`}
        title={`${institutionName} - ${facultyName}`}
      >
        {renderEmblem()}
        {showSubtext && (
          <div className="flex flex-col text-left justify-center min-w-0">
            <span className={`font-heading font-black tracking-tight leading-tight text-[#006837] ${dim.title} uppercase truncate`}>
              {institutionName}
            </span>
            <span className={`font-heading font-black tracking-wider leading-tight text-[#2D3748] ${dim.sub} uppercase truncate`}>
              {facultyName}
            </span>
          </div>
        )}
      </div>
    );
  }

  // Bare Full-Color Logo (for light backgrounds without extra padding)
  return (
    <div className={`flex items-center ${dim.gap} select-none ${className}`}>
      {renderEmblem()}
      {showSubtext && (
        <div className="flex flex-col text-left justify-center min-w-0">
          <span className={`font-heading font-black tracking-tight leading-tight text-[#006837] ${dim.title} uppercase`}>
            {institutionName}
          </span>
          <span className={`font-heading font-black tracking-wider leading-tight text-[#2D3748] ${dim.sub} uppercase`}>
            {facultyName}
          </span>
        </div>
      )}
    </div>
  );
};
