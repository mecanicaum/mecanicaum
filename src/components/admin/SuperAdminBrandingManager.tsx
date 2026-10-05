import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { UmayorLogo } from '../UmayorLogo';
import { UmayorSloganBanner } from '../UmayorSloganBanner';
import {
  ShieldAlert,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  Save,
  Palette,
  FileCheck,
  ExternalLink,
  Info,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const SuperAdminBrandingManager: React.FC = () => {
  const { currentUser, brandingConfig, updateBrandingConfig, resetBrandingConfig } = useApp();

  const isSuperAdmin = currentUser.role === 'super_admin';

  // Local editable draft state for Logo
  const [logoType, setLogoType] = useState<'default' | 'custom_image'>(brandingConfig.logoType);
  const [customLogoUrl, setCustomLogoUrl] = useState(brandingConfig.customLogoUrl || '');

  // Local editable draft state for Banner
  const [bannerType, setBannerType] = useState<'dynamic' | 'custom_image'>(brandingConfig.bannerType);
  const [bannerImageUrl, setBannerImageUrl] = useState(brandingConfig.bannerImageUrl || '');
  const [bannerSloganPrefix, setBannerSloganPrefix] = useState(brandingConfig.bannerSloganPrefix);
  const [bannerSloganWord, setBannerSloganWord] = useState(brandingConfig.bannerSloganWord);
  const [bannerSloganSuffix, setBannerSloganSuffix] = useState(brandingConfig.bannerSloganSuffix);
  const [bannerScriptWord, setBannerScriptWord] = useState(brandingConfig.bannerScriptWord);
  const [bannerSubtitle, setBannerSubtitle] = useState(brandingConfig.bannerSubtitle);
  const [showQualitySeal, setShowQualitySeal] = useState(brandingConfig.showQualitySeal);

  // UI state
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'logo' | 'banner'>('logo');

  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Logo file upload (PNG, JPG, SVG, WebP)
  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('La imagen del logotipo no debe superar los 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomLogoUrl(dataUrl);
      setLogoType('custom_image');
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle Banner file upload
  const handleBannerFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage('La imagen del banner no debe superar los 4 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setBannerImageUrl(dataUrl);
      setBannerType('custom_image');
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  };

  // Save Logo Settings
  const handleSaveLogo = async () => {
    if (!isSuperAdmin) return;
    setErrorMessage(null);
    try {
      await updateBrandingConfig({
        logoType,
        customLogoUrl: logoType === 'custom_image' ? customLogoUrl : '',
      });
      setSaveStatus('¡Logotipo actualizado exitosamente en toda la plataforma!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar cambios de logotipo.');
    }
  };

  // Save Banner Settings
  const handleSaveBanner = async () => {
    if (!isSuperAdmin) return;
    setErrorMessage(null);
    try {
      await updateBrandingConfig({
        bannerType,
        bannerImageUrl: bannerType === 'custom_image' ? bannerImageUrl : '',
        bannerSloganPrefix: bannerSloganPrefix.trim(),
        bannerSloganWord: bannerSloganWord.trim(),
        bannerSloganSuffix: bannerSloganSuffix.trim(),
        bannerScriptWord: bannerScriptWord.trim(),
        bannerSubtitle: bannerSubtitle.trim(),
        showQualitySeal,
      });
      setSaveStatus('¡Banner de inicio actualizado exitosamente!');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar cambios de banner.');
    }
  };

  // Reset to Defaults
  const handleResetToDefaults = async () => {
    if (!isSuperAdmin) return;
    if (!confirm('¿Confirma que desea restablecer el logotipo y el banner institucional a los valores oficiales de fábrica?')) {
      return;
    }
    try {
      await resetBrandingConfig();
      setLogoType('default');
      setCustomLogoUrl('');
      setBannerType('dynamic');
      setBannerImageUrl('');
      setBannerSloganPrefix('LA CALIDAD, UN C');
      setBannerSloganWord('OMPR');
      setBannerSloganSuffix('OMISO');
      setBannerScriptWord('permanente');
      setBannerSubtitle('FACULTAD DE INGENIERÍA · CONSEJO CURRICULAR DE INGENIERÍA MECÁNICA');
      setShowQualitySeal(true);
      setSaveStatus('Valores restablecidos a los oficiales de la Institución Universitaria Mayor de Cartagena.');
      setTimeout(() => setSaveStatus(null), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al restablecer valores.');
    }
  };

  // SECURITY CHECK: If user is not super_admin, display unauthorized screen
  if (!isSuperAdmin) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 sm:p-12 shadow-sm text-center max-w-3xl mx-auto space-y-6">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-xs">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-rose-700 bg-rose-100 px-3 py-1 rounded-md">
            Módulo Protegido · Solo Super Administrador
          </span>
          <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900 uppercase">
            Acceso Reservado a la Identidad Institucional
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            La modificación del logotipo de la aplicación y del banner de inicio del sistema tiene implicaciones estatutarias en las actas colegiadas y en las evidencias para el CNA / ABET. Solo el titular de la cuenta de <strong>Super Administrador</strong> (<code>autoevaluacionycurriculomecanica@umayor.edu.co</code>) posee los privilegios criptográficos para alterar estos activos.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 max-w-md mx-auto space-y-1.5 text-left">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-500 uppercase text-[10px]">Su perfil activo:</span>
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-300 font-bold uppercase text-[10px] text-slate-800">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
          <p className="font-bold text-slate-900">{currentUser.name}</p>
          <p className="text-slate-500 font-mono text-[11px]">{currentUser.email}</p>
        </div>

        <div className="pt-2 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Lock className="h-3.5 w-3.5" />
          <span>Control de Acceso Basado en Roles (RBAC Ley 527 de 1999)</span>
        </div>
      </div>
    );
  }

  // SUPER ADMIN AUTHORIZED VIEW
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner de Estado Super Admin */}
      <div className="bg-gradient-to-r from-[#006837] via-[#005826] to-[#004D25] text-white p-6 sm:p-7 rounded-2xl shadow-sm border border-[#E59800]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#E59800] text-[#006837] text-xs font-heading font-black uppercase tracking-wider shadow-xs">
            <ShieldCheck className="h-4 w-4" />
            Privilegios Super Administrador Activos
          </div>
          <h2 className="text-xl sm:text-2xl font-heading font-black tracking-tight text-white uppercase">
            Gestión Centralizada de Marca & Banner de Inicio
          </h2>
          <p className="text-xs text-slate-100 max-w-2xl font-sans">
            Módulo exclusivo para cambiar el logotipo que aparece en cabeceras, actas y credenciales, así como el banner de campaña de calidad que visualizan los integrantes al ingresar al sistema.
          </p>
        </div>

        <button
          onClick={handleResetToDefaults}
          className="shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-rose-500/20 text-white hover:text-rose-200 border border-white/20 text-xs font-heading font-bold transition-all cursor-pointer"
          title="Restaurar logotipo y banner oficiales de fábrica"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restablecer a Valores Oficiales
        </button>
      </div>

      {/* Alertas de Éxito / Error */}
      {saveStatus && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs Internos: Logo vs Banner */}
      <div className="flex border-b border-slate-200 gap-3">
        <button
          onClick={() => setActiveSection('logo')}
          className={`pb-3 text-xs sm:text-sm font-heading font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
            activeSection === 'logo'
              ? 'border-[#006837] text-[#006837]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          1. Cambiar Logotipo de la Aplicación
        </button>

        <button
          onClick={() => setActiveSection('banner')}
          className={`pb-3 text-xs sm:text-sm font-heading font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
            activeSection === 'banner'
              ? 'border-[#006837] text-[#006837]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="h-4 w-4" />
          2. Cambiar Banner de Inicio (Login & Portal)
        </button>
      </div>

      {/* SECTION 1: CAMBIAR LOGOTIPO DE LA APLICACIÓN */}
      {activeSection === 'logo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-heading font-black text-slate-900 uppercase">
                Selección de Logotipo
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Elija entre el emblema oficial vectorizado o suba una nueva imagen para la plataforma.
              </p>
            </div>

            {/* Selector: Default vs Custom */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLogoType('default')}
                className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  logoType === 'default'
                    ? 'border-[#006837] bg-[#006837]/5 ring-2 ring-[#006837]/20 font-bold text-[#006837]'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-heading uppercase">Oficial Vectorial</span>
                  {logoType === 'default' && <Check className="h-4 w-4 text-[#006837]" />}
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Escudo original 3D UMAYOR con capiteles y cinta MAYOR dorada.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setLogoType('custom_image')}
                className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  logoType === 'custom_image'
                    ? 'border-[#006837] bg-[#006837]/5 ring-2 ring-[#006837]/20 font-bold text-[#006837]'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-heading uppercase">Subir Imagen Propia</span>
                  {logoType === 'custom_image' && <Check className="h-4 w-4 text-[#006837]" />}
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Cargar archivo PNG, SVG, JPG o indicar enlace web.
                </p>
              </button>
            </div>

            {/* Custom Image Upload Box */}
            {logoType === 'custom_image' && (
              <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-heading font-bold text-slate-700 uppercase mb-1.5">
                    Subir Archivo de Imagen desde su Equipo
                  </label>
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    onChange={handleLogoFileUpload}
                    accept="image/png, image/jpeg, image/svg+xml, image/webp"
                    className="hidden"
                  />
                  <div
                    onClick={() => logoFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#006837] rounded-xl p-5 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition-colors"
                  >
                    <Upload className="h-6 w-6 text-[#006837] mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-800">
                      Haga clic aquí para seleccionar el archivo de imagen
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Formatos soportados: PNG (con transparencia recomendado), SVG, JPG, WebP. Máximo 2MB.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold text-slate-700 uppercase mb-1">
                    O Ingrese URL Directa del Logotipo
                  </label>
                  <input
                    type="url"
                    value={customLogoUrl}
                    onChange={(e) => setCustomLogoUrl(e.target.value)}
                    placeholder="https://ejemplo.umayor.edu.co/assets/logo-nuevo.png"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006837]"
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveLogo}
              className="w-full py-3 px-4 bg-[#006837] hover:bg-[#004D25] text-white text-xs font-heading font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="h-4 w-4 text-[#E59800]" />
              <span>Guardar y Aplicar Logotipo en Toda la Aplicación</span>
            </button>
          </div>

          {/* Real-Time Preview Column */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="text-xs font-heading font-black text-slate-800 uppercase flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#E59800]" />
                Previsualización en Tiempo Real del Logotipo
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Exhibición limpia y proporcionada del logo sin textos añadidos:
              </p>
            </div>

            {/* Simulation 1: Header Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">1. En Barra de Cabecera (Navbar Badge)</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono">Fondo Verde Institucional</span>
              </div>
              <div className="bg-[#006837] p-3 rounded-xl flex items-center justify-between">
                <div className="bg-white rounded-xl px-3 py-1.5 flex items-center justify-center shadow-xs border border-white/40">
                  {logoType === 'custom_image' && customLogoUrl ? (
                    <img src={customLogoUrl} alt="Logo" className="h-8 max-w-[150px] object-contain" />
                  ) : (
                    <UmayorLogo size="md" forceDefault={true} variant="full" />
                  )}
                </div>

                <div className="text-[11px] text-white/80 font-mono hidden sm:block">
                  Formato Horizontal
                </div>
              </div>
            </div>

            {/* Simulation 2: Contained Card (Welcome / Actas) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase">2. Formato Tarjeta Contenida (Portal / Actas)</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono">Fondo Blanco</span>
              </div>
              <div className="p-6 bg-slate-50/70 border border-slate-200 rounded-xl flex items-center justify-center">
                <div className="px-5 py-3 bg-white rounded-2xl shadow-xs border border-slate-200 flex items-center justify-center">
                  {logoType === 'custom_image' && customLogoUrl ? (
                    <img src={customLogoUrl} alt="Logo" className="h-12 max-w-[220px] object-contain drop-shadow-xs" />
                  ) : (
                    <UmayorLogo size="lg" forceDefault={true} variant="full" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CAMBIAR BANNER DE INICIO (PORTAL & BIENVENIDA) */}
      {activeSection === 'banner' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-4xl">
            <div>
              <h3 className="text-sm font-heading font-black text-slate-900 uppercase">
                Configuración del Banner de Inicio
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Personalice el eslogan dinámico institucional o cargue un arte gráfico corporativo para la bienvenida.
              </p>
            </div>

            {/* Banner Mode Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setBannerType('dynamic')}
                className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  bannerType === 'dynamic'
                    ? 'border-[#006837] bg-[#006837]/5 ring-2 ring-[#006837]/20 font-bold text-[#006837]'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-heading uppercase">Banner Dinámico con Eslogan</span>
                  {bannerType === 'dynamic' && <Check className="h-4 w-4 text-[#006837]" />}
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Diseño institucional con ondas verdes y doradas, roseta CNA/ABET y eslogan editable.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBannerType('custom_image')}
                className={`p-3.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  bannerType === 'custom_image'
                    ? 'border-[#006837] bg-[#006837]/5 ring-2 ring-[#006837]/20 font-bold text-[#006837]'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-heading uppercase">Cargar Imagen de Banner</span>
                  {bannerType === 'custom_image' && <Check className="h-4 w-4 text-[#006837]" />}
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  Subir un arte o flyer panorámico diseñado por la Dirección de Comunicaciones.
                </p>
              </button>
            </div>

            {/* Dynamic Slogan Controls */}
            {bannerType === 'dynamic' && (
              <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-heading font-bold text-slate-700 uppercase mb-1">
                      Prefijo del Eslogan
                    </label>
                    <input
                      type="text"
                      value={bannerSloganPrefix}
                      onChange={(e) => setBannerSloganPrefix(e.target.value)}
                      placeholder="LA CALIDAD, UN C"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-heading font-bold text-slate-900 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-heading font-bold text-slate-700 uppercase mb-1">
                      Palabra con Medalla (Centro)
                    </label>
                    <input
                      type="text"
                      value={bannerSloganWord}
                      onChange={(e) => setBannerSloganWord(e.target.value)}
                      placeholder="OMPR"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-heading font-bold text-slate-900 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-heading font-bold text-slate-700 uppercase mb-1">
                      Sufijo del Eslogan
                    </label>
                    <input
                      type="text"
                      value={bannerSloganSuffix}
                      onChange={(e) => setBannerSloganSuffix(e.target.value)}
                      placeholder="OMISO"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-heading font-bold text-slate-900 uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-heading font-bold text-slate-700 uppercase mb-1">
                      Palabra Cursiva en Dorado
                    </label>
                    <input
                      type="text"
                      value={bannerScriptWord}
                      onChange={(e) => setBannerScriptWord(e.target.value)}
                      placeholder="permanente"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-script font-bold text-[#E59800] text-lg lowercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-heading font-bold text-slate-700 uppercase mb-1">
                      Subtítulo o Lema de Facultad
                    </label>
                    <input
                      type="text"
                      value={bannerSubtitle}
                      onChange={(e) => setBannerSubtitle(e.target.value)}
                      placeholder="FACULTAD DE INGENIERÍA · CONSEJO CURRICULAR"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-heading font-bold text-slate-900 uppercase"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800">
                      Roseta de Calidad y Acreditación (Checkmark Dorado)
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Muestra la medalla de verificación en el eslogan para enfatizar los estándares CNA / ABET.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showQualitySeal}
                      onChange={(e) => setShowQualitySeal(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006837]"></div>
                  </label>
                </div>
              </div>
            )}

            {/* Custom Banner Image Controls */}
            {bannerType === 'custom_image' && (
              <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in">
                <div>
                  <label className="block text-[11px] font-heading font-bold text-slate-700 uppercase mb-1.5">
                    Subir Imagen Panorámica para el Banner
                  </label>
                  <input
                    type="file"
                    ref={bannerFileInputRef}
                    onChange={handleBannerFileUpload}
                    accept="image/png, image/jpeg, image/webp"
                    className="hidden"
                  />
                  <div
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#006837] rounded-xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-emerald-50/40 transition-colors"
                  >
                    <Upload className="h-7 w-7 text-[#006837] mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-800">
                      Haga clic para cargar la imagen panorámica de banner
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      Resolución recomendada: 1200x300 px o superior (PNG / JPG / WebP). Máximo 4MB.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold text-slate-700 uppercase mb-1">
                    O Ingrese URL Directa del Banner
                  </label>
                  <input
                    type="url"
                    value={bannerImageUrl}
                    onChange={(e) => setBannerImageUrl(e.target.value)}
                    placeholder="https://ejemplo.umayor.edu.co/assets/banner-campana-2026.jpg"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006837]"
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveBanner}
              className="w-full py-3 px-4 bg-[#006837] hover:bg-[#004D25] text-white text-xs font-heading font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="h-4 w-4 text-[#E59800]" />
              <span>Guardar y Publicar Banner en el Portal de Inicio</span>
            </button>
          </div>

          {/* Real-Time Preview of Banner */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-black text-slate-800 uppercase flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#E59800]" />
                Previsualización en Vivo del Banner de Inicio
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Así se muestra en el Login y en la cabecera del portal
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <UmayorSloganBanner />
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Stamp */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileCheck className="h-4 w-4 text-[#006837]" />
          <span>
            Última modificación registrada: <strong>{new Date(brandingConfig.updatedAt).toLocaleString()}</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Por: {brandingConfig.updatedBy}
        </span>
      </div>
    </div>
  );
};
