import React, { useState } from 'react';
import { UmayorLogo } from '../UmayorLogo';
import { UmayorSloganBanner } from '../UmayorSloganBanner';
import {
  Download,
  Copy,
  Check,
  Eye,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Info,
  Palette,
  FileCode,
  Layers,
  Printer,
  Compass,
  CheckCircle2,
  XCircle,
  ExternalLink
} from 'lucide-react';

export const BrandAssetsManager: React.FC = () => {
  const [selectedBg, setSelectedBg] = useState<'white' | 'green' | 'dark' | 'checker'>('white');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeSubSection, setActiveSubSection] = useState<'showcase' | 'guidelines' | 'palette'>('showcase');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const officialColors = [
    {
      name: 'Verde Esmeralda Institucional',
      usage: 'Pilar principal de la "U", cabecera y botones prioritarios',
      hex: '#006837',
      pantone: 'Pantone 348 C',
      rgb: '0, 104, 55',
      cmyk: '93, 10, 96, 40',
      sampleClass: 'bg-[#006837]',
      isDark: true,
    },
    {
      name: 'Verde Bosque de Profundidad',
      usage: 'Pilar izquierdo de la "U", sombras 3D y estados hover',
      hex: '#004D25',
      pantone: 'Pantone 350 C',
      rgb: '0, 77, 37',
      cmyk: '90, 30, 95, 60',
      sampleClass: 'bg-[#004D25]',
      isDark: true,
    },
    {
      name: 'Dorado Ámbar UMAYOR',
      usage: 'Tipografía MAYOR, palabra "permanente", botones secundarios y rosetas',
      hex: '#E58A13',
      pantone: 'Pantone 137 C',
      rgb: '229, 138, 19',
      cmyk: '0, 48, 100, 0',
      sampleClass: 'bg-[#E58A13]',
      isDark: false,
    },
    {
      name: 'Rojo Acento Dinámico',
      usage: 'Cinta curva superior bajo MAYOR',
      hex: '#D32F2F',
      pantone: 'Pantone 186 C',
      rgb: '211, 47, 47',
      cmyk: '0, 95, 90, 10',
      sampleClass: 'bg-[#D32F2F]',
      isDark: true,
    },
    {
      name: 'Gris Grafito Titular',
      usage: 'Tipografía institucional y textos de alta jerarquía',
      hex: '#2D3748',
      pantone: 'Pantone Cool Gray 11 C',
      rgb: '45, 55, 72',
      cmyk: '70, 55, 45, 40',
      sampleClass: 'bg-[#2D3748]',
      isDark: true,
    },
    {
      name: 'Blanco Base Inmaculado',
      usage: 'Placa de contraste, fondos de actas y tarjetas',
      hex: '#FFFFFF',
      pantone: 'Opaque White',
      rgb: '255, 255, 255',
      cmyk: '0, 0, 0, 0',
      sampleClass: 'bg-white border border-slate-300',
      isDark: false,
    },
  ];

  const svgDirectDownloadUrl = '/umayor-logo.svg';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Module Header */}
      <div className="bg-gradient-to-r from-[#006837] via-[#005826] to-[#004D25] text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#E59800]/40 relative overflow-hidden">
        {/* Decorative corner waves */}
        <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 pointer-events-none flex items-center justify-end pr-6">
          <span className="font-heading font-black text-9xl text-white">U</span>
        </div>

        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 border border-white/20 text-[#E59800] text-xs font-heading font-extrabold uppercase tracking-wider">
            <Palette className="h-3.5 w-3.5" />
            Manual de Identidad Visual · Portal Administrativo
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white uppercase">
            Activos de Marca & Guía de Uso Institucional
          </h2>
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans">
            Repositorio oficial del escudo, tipografía, paleta cromática y estándares gráficos de la Institución Universitaria Mayor de Cartagena para su correcta aplicación en actas oficiales, certificados digitales y módulos del sistema.
          </p>
        </div>

        {/* Sub Navigation */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/15 relative z-10">
          <button
            onClick={() => setActiveSubSection('showcase')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
              activeSubSection === 'showcase'
                ? 'bg-[#E59800] text-[#006837] shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            1. Formatos del Logotipo
          </button>
          <button
            onClick={() => setActiveSubSection('guidelines')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
              activeSubSection === 'guidelines'
                ? 'bg-[#E59800] text-[#006837] shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            2. Guía de Uso & Restricciones
          </button>
          <button
            onClick={() => setActiveSubSection('palette')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
              activeSubSection === 'palette'
                ? 'bg-[#E59800] text-[#006837] shadow-sm'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            3. Paleta Cromática & Códigos
          </button>
        </div>
      </div>

      {/* SECTION 1: FORMATOS DEL LOGOTIPO */}
      {activeSubSection === 'showcase' && (
        <div className="space-y-6">
          {/* Background Tester Controller */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-[#006837]" />
              <span className="text-xs font-heading font-bold text-[#1A202C]">
                Visualizador con Fondo Interactivo:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedBg('white')}
                className={`px-3 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                  selectedBg === 'white'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Blanco Oficial
              </button>
              <button
                onClick={() => setSelectedBg('green')}
                className={`px-3 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                  selectedBg === 'green'
                    ? 'bg-[#006837] text-white border-[#006837] shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Verde UMAYOR
              </button>
              <button
                onClick={() => setSelectedBg('dark')}
                className={`px-3 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                  selectedBg === 'dark'
                    ? 'bg-slate-950 text-white border-slate-950 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Gris Carbón
              </button>
              <button
                onClick={() => setSelectedBg('checker')}
                className={`px-3 py-1 text-xs rounded-md font-semibold border transition-all cursor-pointer ${
                  selectedBg === 'checker'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Transparencia
              </button>
            </div>
          </div>

          {/* Grid of Logo Formats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Format 1: Formato Vertical Oficial (Card 1:1) */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-[#E2E8F0] bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-heading font-extrabold text-[#1A202C] uppercase">
                    1. Formato Vertical Oficial
                  </h4>
                  <p className="text-[11px] text-[#4A5568]">Emblema centrado sobre bloque tipográfico</p>
                </div>
                <span className="text-[10px] font-bold bg-[#006837]/10 text-[#006837] px-2 py-0.5 rounded-md font-mono">
                  Principal
                </span>
              </div>

              {/* Preview Canvas */}
              <div
                className={`p-8 flex items-center justify-center min-h-[240px] transition-colors ${
                  selectedBg === 'white'
                    ? 'bg-white'
                    : selectedBg === 'green'
                    ? 'bg-[#006837]'
                    : selectedBg === 'dark'
                    ? 'bg-slate-900'
                    : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-100'
                }`}
              >
                <div className={selectedBg !== 'white' ? 'bg-white p-4 rounded-xl shadow-md border border-amber-300/40' : ''}>
                  <UmayorLogo size="lg" layout="vertical" variant="full" />
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-3 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-mono">Aspecto 1:1 · Vectorial</span>
                <a
                  href={svgDirectDownloadUrl}
                  download="umayor-logo-vertical.svg"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006837] hover:bg-[#005826] text-white rounded-md font-heading font-bold text-xs transition-colors shadow-2xs"
                >
                  <Download className="h-3 w-3 text-[#E59800]" />
                  Descargar SVG
                </a>
              </div>
            </div>

            {/* Format 2: Formato Horizontal (Badge de Navegación) */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-[#E2E8F0] bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-heading font-extrabold text-[#1A202C] uppercase">
                    2. Formato Horizontal (Badge)
                  </h4>
                  <p className="text-[11px] text-[#4A5568]">Emblema a la izquierda con lectura continua</p>
                </div>
                <span className="text-[10px] font-bold bg-[#E59800]/20 text-[#D97706] px-2 py-0.5 rounded-md font-mono">
                  Navbar / UI
                </span>
              </div>

              {/* Preview Canvas */}
              <div
                className={`p-8 flex items-center justify-center min-h-[240px] transition-colors ${
                  selectedBg === 'white'
                    ? 'bg-white'
                    : selectedBg === 'green'
                    ? 'bg-[#006837]'
                    : selectedBg === 'dark'
                    ? 'bg-slate-900'
                    : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-100'
                }`}
              >
                <UmayorLogo size="md" variant="badge" />
              </div>

              {/* Action Footer */}
              <div className="p-3 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <button
                  onClick={() =>
                    copyToClipboard(
                      '<UmayorLogo size="md" variant="badge" />',
                      'code-badge'
                    )
                  }
                  className="inline-flex items-center gap-1 text-slate-700 hover:text-[#006837] font-semibold text-[11px]"
                >
                  {copiedCode === 'code-badge' ? (
                    <Check className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <Copy className="h-3 w-3 text-[#E59800]" />
                  )}
                  <span>{copiedCode === 'code-badge' ? 'Código Copiado' : 'Copiar JSX'}</span>
                </button>
                <a
                  href={svgDirectDownloadUrl}
                  download="umayor-logo-badge.svg"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006837] hover:bg-[#005826] text-white rounded-md font-heading font-bold text-xs transition-colors shadow-2xs"
                >
                  <Download className="h-3 w-3 text-[#E59800]" />
                  Descargar SVG
                </a>
              </div>
            </div>

            {/* Format 3: Isotipo / Escudo Aislado (Icon Only) */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-[#E2E8F0] bg-slate-50/70 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-heading font-extrabold text-[#1A202C] uppercase">
                    3. Isotipo / Escudo Aislado
                  </h4>
                  <p className="text-[11px] text-[#4A5568]">La 'U' con cinta MAYOR sin tipografía</p>
                </div>
                <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md font-mono">
                  Favicon / Sello
                </span>
              </div>

              {/* Preview Canvas */}
              <div
                className={`p-8 flex items-center justify-center min-h-[240px] transition-colors ${
                  selectedBg === 'white'
                    ? 'bg-white'
                    : selectedBg === 'green'
                    ? 'bg-[#006837]'
                    : selectedBg === 'dark'
                    ? 'bg-slate-900'
                    : 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:12px_12px] bg-slate-100'
                }`}
              >
                <div className={selectedBg !== 'white' ? 'bg-white p-3 rounded-2xl shadow-md border border-amber-300/40' : ''}>
                  <UmayorLogo size="xl" showSubtext={false} variant="full" />
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-3 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                <a
                  href="/favicon.svg"
                  download="umayor-isotipo.svg"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006837] hover:bg-[#005826] text-white rounded-md font-heading font-bold text-xs transition-colors shadow-2xs ml-auto"
                >
                  <Download className="h-3 w-3 text-[#E59800]" />
                  Descargar Favicon
                </a>
              </div>
            </div>
          </div>

          {/* Format 4: Banner Institucional de la Campaña de Calidad */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-xs font-heading font-extrabold text-[#1A202C] uppercase">
                  4. Banner de Campaña Institucional: "La Calidad, Un Compromiso permanente"
                </h4>
                <p className="text-xs text-[#4A5568]">
                  Arte corporativo con roseta dorada de verificación y ondas fluidas en verde y dorado
                </p>
              </div>
              <span className="text-[10px] font-bold bg-[#E59800]/20 text-[#D97706] px-2.5 py-1 rounded-md uppercase font-heading">
                CNA / ABET / Acreditación
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <UmayorSloganBanner />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: GUÍA DE USO & RESTRICCIONES */}
      {activeSubSection === 'guidelines' && (
        <div className="space-y-6">
          {/* Rules Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Correct Usage Guidelines */}
            <div className="bg-emerald-50/60 rounded-2xl border border-emerald-200 p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2.5 text-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <h3 className="text-sm font-heading font-black uppercase">
                  Usos Correctos y Recomendados
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-emerald-950 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Cápsula Blanca en Fondos Oscuros:</strong> En barras o superficies de color verde o negro, envolver el logotipo en la placa blanca institucional con borde dorado para garantizar el 100% de contraste.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Área de Reserva Mínima:</strong> Mantener un espacio libre alrededor de todo el imagotipo igual a la altura de la cinta "MAYOR" (mínimo 15px de margen).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Escalado Proporcional:</strong> Redimensionar siempre manteniendo el bloqueo de proporción 1:1, sin estirar ni condensar horizontal o verticalmente.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Acreditación Oficial:</strong> Aplicar el formato vertical en portadas de actas de acreditación CNA y autoevaluación ABET.</span>
                </li>
              </ul>
            </div>

            {/* Incorrect Usage Restrictions */}
            <div className="bg-rose-50/60 rounded-2xl border border-rose-200 p-6 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2.5 text-rose-900">
                <XCircle className="h-5 w-5 text-rose-600 shrink-0" />
                <h3 className="text-sm font-heading font-black uppercase">
                  Restricciones & Usos Incorrectos
                </h3>
              </div>
              <ul className="space-y-2.5 text-xs text-rose-950 font-medium leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>No colocar verde sobre verde sin cápsula:</strong> Nunca situar el logotipo original directamente sobre un fondo verde institucional `#006837`, ya que la "U" desaparece por falta de contraste.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>No alterar los colores del gradiente:</strong> No sustituir el dorado ámbar de "MAYOR" ni el arco rojo por tonalidades fluorescentes, azules o moradas.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>No alterar la tipografía oficial:</strong> El texto "INSTITUCIÓN UNIVERSITARIA MAYOR DE CARTAGENA" no debe cambiarse por fuentes cursivas, góticas o condensadas ajenas al manual.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-600 font-bold">✕</span>
                  <span><strong>No recortar el símbolo:</strong> No separar la palabra "MAYOR" del cuerpo de la "U" para usarla como icono independiente.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-heading font-extrabold text-[#1A202C] uppercase tracking-wider flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#006837]" />
              Especificaciones Técnicas & Dimensiones Mínimas
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Medios Digitales (Pantalla)</span>
                <p className="font-heading font-bold text-[#006837] text-sm">32 px de alto</p>
                <p className="text-[11px] text-slate-600">Tamaño mínimo para garantizar la legibilidad de la palabra MAYOR y el arco tricolor.</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Impresión en Papel / Actas</span>
                <p className="font-heading font-bold text-[#006837] text-sm">18 mm de ancho</p>
                <p className="text-[11px] text-slate-600">Resolución mínima requerida: 300 DPI vectorizado para documentos oficiales.</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Área de Seguridad (Clearspace)</span>
                <p className="font-heading font-bold text-[#006837] text-sm">1X (Altura cinta MAYOR)</p>
                <p className="text-[11px] text-slate-600">Ningún texto, borde o elemento gráfico debe invadir esta zona perimetral.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PALETA CROMÁTICA & CÓDIGOS */}
      {activeSubSection === 'palette' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {officialColors.map((color, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
                <div className={`h-24 ${color.sampleClass} flex items-end justify-between p-3`}>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${color.isDark ? 'bg-white/20 text-white' : 'bg-slate-900/20 text-slate-900'}`}>
                    {color.pantone}
                  </span>
                  <button
                    onClick={() => copyToClipboard(color.hex, `color-${idx}`)}
                    className={`p-1.5 rounded-md transition-colors ${color.isDark ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-slate-900/10 text-slate-900 hover:bg-slate-900/20'}`}
                    title="Copiar código HEX"
                  >
                    {copiedCode === `color-${idx}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <div className="p-4 space-y-2">
                  <h4 className="text-xs font-heading font-extrabold text-[#1A202C]">
                    {color.name}
                  </h4>
                  <p className="text-[11px] text-[#4A5568] leading-tight line-clamp-2">
                    {color.usage}
                  </p>
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-600">
                    <div>HEX: <strong className="text-slate-900">{color.hex}</strong></div>
                    <div>RGB: <strong className="text-slate-900">{color.rgb}</strong></div>
                    <div className="col-span-2">CMYK: <strong className="text-slate-900">{color.cmyk}</strong></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Implementation Snippet */}
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-2">
                <FileCode className="h-4 w-4 text-[#E59800]" />
                Variables CSS / Tailwind Config (Tokens de Marca)
              </span>
              <button
                onClick={() =>
                  copyToClipboard(
                    `:root {\n  --color-umayor-green: #006837;\n  --color-umayor-green-dark: #004D25;\n  --color-umayor-gold: #E58A13;\n  --color-umayor-red: #D32F2F;\n  --color-umayor-text: #2D3748;\n}`,
                    'css-tokens'
                  )
                }
                className="text-slate-300 hover:text-white flex items-center gap-1 text-[11px] bg-white/10 px-2.5 py-1 rounded-md"
              >
                {copiedCode === 'css-tokens' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode === 'css-tokens' ? 'Copiado' : 'Copiar CSS'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 p-4 rounded-xl text-emerald-400 overflow-x-auto text-[11px] leading-relaxed">
{`:root {
  --color-umayor-green: #006837;       /* Verde Esmeralda Institucional */
  --color-umayor-green-dark: #004D25;  /* Verde Bosque de Profundidad */
  --color-umayor-gold: #E58A13;        /* Dorado Ámbar MAYOR */
  --color-umayor-red: #D32F2F;         /* Rojo Acento Curva */
  --color-umayor-text: #2D3748;        /* Gris Grafito Titular */
}`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
