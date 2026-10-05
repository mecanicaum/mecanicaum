import React from 'react';
import { useApp } from '../context/AppContext';

interface UmayorLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge' | 'full' | 'card' | 'icon';
  className?: string;
  forceDefault?: boolean;
}

export const UmayorLogo: React.FC<UmayorLogoProps> = ({
  size = 'md',
  variant = 'badge',
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

  const customLogoUrl = brandingConfig?.customLogoUrl;
  const isCustomImage = !forceDefault && brandingConfig?.logoType === 'custom_image' && Boolean(customLogoUrl);

  // Proporciones horizontales estilizadas y perfectamente balanceadas
  const dimensions = {
    sm: { width: 115, height: 32, badgePadding: 'px-2.5 py-1' },
    md: { width: 145, height: 40, badgePadding: 'px-3 py-1.5' },
    lg: { width: 180, height: 50, badgePadding: 'px-4 py-2' },
    xl: { width: 230, height: 64, badgePadding: 'px-5 py-2.5' },
  };

  const dim = dimensions[size];

  // Renderizado del isólogo horizontal
  const renderHorizontalLogo = () => {
    if (isCustomImage && customLogoUrl) {
      return (
        <img
          src={customLogoUrl}
          alt="Logotipo Oficial"
          className="shrink-0 object-contain drop-shadow-xs"
          style={{ width: 'auto', height: dim.height, maxWidth: dim.width * 1.5 }}
        />
      );
    }

    return (
      <svg
        width={dim.width}
        height={dim.height}
        viewBox="0 0 200 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-xs"
        aria-label="Logotipo Oficial UMAYOR Horizontal"
      >
        <defs>
          <linearGradient id="hzLeftStem" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#004D25" />
            <stop offset="100%" stopColor="#005A2B" />
          </linearGradient>
          <linearGradient id="hzRightStem" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#007A38" />
            <stop offset="100%" stopColor="#008A40" />
          </linearGradient>
          <linearGradient id="hzBottomCurve" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#004420" />
            <stop offset="45%" stopColor="#00632E" />
            <stop offset="80%" stopColor="#008A40" />
            <stop offset="100%" stopColor="#009647" />
          </linearGradient>
        </defs>

        {/* Emblema U en el lateral izquierdo */}
        <g id="Emblema-U" transform="translate(-3, 3) scale(0.28)">
          <path d="M 45 35 L 75 35 L 75 48 L 72 48 L 72 105 L 48 105 L 48 48 L 45 48 Z" fill="url(#hzLeftStem)" />
          <rect x="43" y="35" width="34" height="13" rx="1.5" fill="#004620" />
          <path d="M 125 35 L 155 35 L 155 48 L 152 48 L 152 105 L 128 105 L 128 48 L 125 48 Z" fill="url(#hzRightStem)" />
          <rect x="123" y="35" width="34" height="13" rx="1.5" fill="#007134" />
          <path
            d="M 48 100 
               C 48 152, 74 172, 100 172 
               C 126 172, 152 152, 152 100 
               L 128 100 
               C 128 136, 115 149, 100 149 
               C 85 149, 72 136, 72 100 
               Z"
            fill="url(#hzBottomCurve)"
          />
          <path
            d="M 48 100 
               C 48 135, 62 155, 84 167 
               C 71 155, 64 133, 64 100 
               Z"
            fill="#003B1A"
            opacity="0.5"
          />
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

        {/* Tipografía Oficial UMAYOR Horizontal */}
        <text
          x="49"
          y="35"
          fontFamily="'Montserrat', 'Arial Black', sans-serif"
          fontWeight="900"
          fontSize="26"
          letterSpacing="1.5"
        >
          <tspan fill="#006837">U</tspan>
          <tspan fill="#E58A13">MAYOR</tspan>
        </text>

        {/* Línea Tricolor Institucional */}
        <g id="Tricolor-Accent" transform="translate(49, 42)">
          <rect x="0" y="0" width="38" height="3" rx="1.5" fill="#CC0D12" />
          <rect x="42" y="0" width="46" height="3" rx="1.5" fill="#E58A13" />
          <rect x="92" y="0" width="44" height="3" rx="1.5" fill="#006837" />
        </g>
      </svg>
    );
  };

  // Formato Tarjeta Contenida
  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-2xl shadow-xs border border-[#E2E8F0] p-3 sm:p-4 flex items-center justify-center select-none ${className}`}>
        {renderHorizontalLogo()}
      </div>
    );
  }

  // Formato Cápsula / Badge para Barra Superior y Encabezados
  if (variant === 'badge') {
    return (
      <div
        className={`bg-white rounded-xl shadow-xs border border-white/40 ${dim.badgePadding} flex items-center justify-center transition-all hover:shadow-md select-none shrink-0 ${className}`}
        title="Logotipo Oficial UMAYOR"
      >
        {renderHorizontalLogo()}
      </div>
    );
  }

  // Formato Puro Horizontal
  return (
    <div className={`inline-flex items-center justify-center select-none shrink-0 ${className}`}>
      {renderHorizontalLogo()}
    </div>
  );
};
