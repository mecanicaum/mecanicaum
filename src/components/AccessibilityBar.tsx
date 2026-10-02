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
    <div className="accessibility-bar bg-[#006A4E] text-white text-[11px] font-medium border-b border-[#C49E2D]/30 px-3 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 z-40 select-none shadow-xs">
      {/* Institutional Motto in Gold Cursive & Identity */}
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#C49E2D] animate-pulse"></span>
        <span className="font-cinzel font-bold text-[#C49E2D] uppercase tracking-wider text-[10px]">
          UMAYOR
        </span>
        <span className="hidden md:inline text-slate-200">
          Institución Universitaria Mayor de Cartagena
        </span>
        <span className="hidden lg:inline text-[#C49E2D] lema-institucional pl-2 border-l border-[#C49E2D]/40">
          "Educación con Sentido Humano y Excelencia Académica"
        </span>
      </div>

      {/* WCAG 2.1 AA Accessibility Tools */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="hidden sm:inline text-slate-200 text-[10px] uppercase font-bold tracking-wider mr-1">
          Accesibilidad:
        </span>

        {/* Font Scaling Buttons */}
        <div className="flex items-center bg-[#00523E] border border-[#C49E2D]/40 rounded-md overflow-hidden">
          <button
            onClick={handleDecreaseFont}
            className="px-2 py-0.5 hover:bg-[#C49E2D] hover:text-[#006A4E] transition-colors text-white font-bold cursor-pointer"
            title="Reducir tamaño de texto (A-)"
            aria-label="Reducir tamaño de texto"
          >
            A-
          </button>
          <button
            onClick={handleResetFont}
            className={`px-2 py-0.5 border-x border-[#C49E2D]/40 transition-colors font-mono text-[10px] cursor-pointer ${
              fontScale === 1 ? 'text-[#C49E2D] font-bold' : 'text-slate-200 hover:text-white'
            }`}
            title="Restablecer tamaño normal de texto (100%)"
          >
            {Math.round(fontScale * 100)}%
          </button>
          <button
            onClick={handleIncreaseFont}
            className="px-2 py-0.5 hover:bg-[#C49E2D] hover:text-[#006A4E] transition-colors text-white font-bold cursor-pointer"
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
              ? 'bg-[#C49E2D] text-[#006A4E] border-[#C49E2D] font-bold shadow-xs'
              : 'bg-[#00523E] text-slate-100 border-[#C49E2D]/40 hover:border-[#C49E2D] hover:bg-[#C49E2D] hover:text-[#006A4E]'
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
              ? 'bg-[#C49E2D] text-[#006A4E] border-[#C49E2D]'
              : 'bg-[#00523E] text-slate-100 border-[#C49E2D]/40 hover:border-[#C49E2D]'
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
