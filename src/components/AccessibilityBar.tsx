import React, { useState, useEffect } from 'react';
import { Eye, Sparkles } from 'lucide-react';

export const AccessibilityBar: React.FC = () => {
  const [fontScale, setFontScale] = useState<number>(1);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [highlightLinks, setHighlightLinks] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale.toString());
  }, [fontScale]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  useEffect(() => {
    if (highlightLinks) {
      document.documentElement.classList.add('highlight-links');
    } else {
      document.documentElement.classList.remove('highlight-links');
    }
  }, [highlightLinks]);

  const handleIncreaseFont = () => setFontScale((prev) => Math.min(prev + 0.125, 1.375));
  const handleDecreaseFont = () => setFontScale((prev) => Math.max(prev - 0.125, 0.875));
  const handleResetFont = () => setFontScale(1);

  return (
    <div className="accessibility-bar bg-[#006837] text-white text-[11px] font-medium border-b border-[#E59800]/40 px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 z-40 select-none shadow-xs">
      {/* Institutional Slogan in Cursive Script */}
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#E59800] animate-pulse"></span>
        <span className="font-heading font-extrabold text-[#E59800] uppercase tracking-wider text-[10px]">
          UMAYOR
        </span>
        <span className="hidden md:inline text-slate-100 font-medium">
          Institución Universitaria Mayor de Cartagena
        </span>
        <span className="hidden lg:inline text-slate-200 pl-2 border-l border-white/20">
          La calidad, un compromiso <span className="font-script text-[#E59800] text-sm font-bold">permanente</span>
        </span>
      </div>

      {/* WCAG 2.1 AA Accessibility Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="hidden sm:inline text-slate-200 text-[10px] uppercase font-bold tracking-wider mr-1 font-heading">
          Accesibilidad:
        </span>

        {/* Font Scaling Buttons */}
        <div className="flex items-center bg-[#004D25] border border-[#E59800]/40 rounded-md overflow-hidden">
          <button
            onClick={handleDecreaseFont}
            className="px-2 py-0.5 hover:bg-[#E59800] hover:text-[#006837] transition-colors text-white font-bold cursor-pointer"
            title="Reducir tamaño de texto (A-)"
            aria-label="Reducir tamaño de texto"
          >
            A-
          </button>
          <button
            onClick={handleResetFont}
            className={`px-2 py-0.5 border-x border-[#E59800]/40 transition-colors font-mono text-[10px] cursor-pointer ${
              fontScale === 1 ? 'text-[#E59800] font-bold' : 'text-slate-200 hover:text-white'
            }`}
            title="Restablecer tamaño normal de texto (100%)"
          >
            {Math.round(fontScale * 100)}%
          </button>
          <button
            onClick={handleIncreaseFont}
            className="px-2 py-0.5 hover:bg-[#E59800] hover:text-[#006837] transition-colors text-white font-bold cursor-pointer"
            title="Aumentar tamaño de texto (A+)"
            aria-label="Aumentar tamaño de texto"
          >
            A+
          </button>
        </div>

        {/* High Contrast Toggle */}
        <button
          onClick={() => setHighContrast(!highContrast)}
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[10px] font-semibold transition-colors cursor-pointer ${
            highContrast
              ? 'bg-[#E59800] text-[#006837] border-[#E59800] font-bold shadow-xs'
              : 'bg-[#004D25] text-slate-100 border-[#E59800]/40 hover:border-[#E59800] hover:bg-[#E59800] hover:text-[#006837]'
          }`}
          title="Alternar modo de alto contraste para baja visión (WCAG AAA)"
          aria-pressed={highContrast}
        >
          <Eye className="h-3 w-3" />
          <span className="hidden xs:inline">Alto Contraste</span>
        </button>

        {/* Highlight Links Toggle */}
        <button
          onClick={() => setHighlightLinks(!highlightLinks)}
          className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-colors cursor-pointer ${
            highlightLinks
              ? 'bg-[#E59800] text-[#006837] border-[#E59800]'
              : 'bg-[#004D25] text-slate-100 border-[#E59800]/40 hover:border-[#E59800]'
          }`}
          title="Resaltar todos los enlaces y botones interactivos"
          aria-pressed={highlightLinks}
        >
          <Sparkles className="h-3 w-3" />
          <span>Resaltar</span>
        </button>
      </div>
    </div>
  );
};
