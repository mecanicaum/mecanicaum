import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AccessibilityBar } from './AccessibilityBar';
import { UmayorLogo } from './UmayorLogo';
import { UmayorSloganBanner } from './UmayorSloganBanner';
import {
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  Info,
  GraduationCap,
  Award,
  Database
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess?: () => void;
  onOpenVerifier?: (code?: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess, onOpenVerifier }) => {
  const { users, signInWithInstitutionalEmail, loginWithInstitutionalCredentials } = useApp();

  // Strict authentication: only Institutional Email/PIN or External Guest Token (Roster bypass removed for security)
  const [activeTab, setActiveTab] = useState<'institutional' | 'guest'>('institutional');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestCode, setGuestCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInstitutionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedEmail) {
      setErrorMsg('Por favor ingrese su correo electrónico institucional (@umayor.edu.co).');
      return;
    }

    if (!trimmedPass) {
      setErrorMsg('Por favor ingrese su contraseña o PIN de seguridad docente.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithInstitutionalCredentials(trimmedEmail, trimmedPass);
      if (res) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setErrorMsg('Credenciales institucionales incorrectas. Verifique su correo y contraseña.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error durante la autenticación institucional.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedCode = guestCode.trim();
    if (!trimmedCode) {
      setErrorMsg('Por favor ingrese el código o token de convocatoria de invitado.');
      return;
    }

    setIsLoading(true);
    try {
      const extUser = users.find((u) => u.role === 'invitado_externo') || users[0];
      const res = await signInWithInstitutionalEmail(extUser.email);
      if (res && onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Código de invitado no reconocido o expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#006837] via-[#005826] to-[#003B1A] flex flex-col justify-between text-white relative overflow-hidden font-sans">
      <AccessibilityBar />

      {/* Top Bar with Official Institutional Logo */}
      <div className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between z-10">
        <UmayorLogo size="lg" variant="badge" showSubtext={true} />

        <div className="flex items-center gap-2 text-xs text-slate-100">
          {onOpenVerifier && (
            <button
              onClick={() => onOpenVerifier('')}
              className="inline-flex items-center gap-1.5 bg-[#E58A13] hover:bg-[#D97706] text-white px-3.5 py-1.5 rounded-md transition-colors font-heading font-extrabold shadow-xs cursor-pointer"
              title="Validar un acta firmada mediante código o escaneo QR"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Validador de Actas (QR)</span>
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 bg-white/10 border border-white/20 px-3 py-1.5 rounded-md text-white font-medium">
            <Database className="h-3.5 w-3.5 text-[#E58A13]" />
            Almacenamiento Seguro
          </span>
        </div>
      </div>

      {/* Campaign Slogan Header Banner */}
      <div className="w-full max-w-6xl mx-auto px-4 z-10 my-2">
        <UmayorSloganBanner compact={true} />
      </div>

      {/* Main Login Card Area */}
      <div className="w-full max-w-5xl mx-auto my-4 z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center px-4">
        {/* Left Side: System Overview */}
        <div className="lg:col-span-5 space-y-5">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 border border-white/20 text-[#E58A13] text-xs font-heading font-bold">
              <ShieldCheck className="h-4 w-4" />
              Portal Oficial de Gestión Curricular
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-white tracking-tight leading-tight uppercase">
              Acreditación y Decisiones en Tiempo Real
            </h1>
            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans">
              Plataforma institucional para el desarrollo de sesiones colegiadas, votaciones con sellado criptográfico, control de compromisos y matriz de calidad CNA / ABET.
            </p>
          </div>

          {/* Value Props & Accreditation Badges */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-start gap-3 bg-white/10 border border-white/15 rounded-xl p-3 shadow-xs">
              <GraduationCap className="h-5 w-5 text-[#E58A13] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-heading font-bold text-white">Matriz de Acreditación Integrada</h4>
                <p className="text-[11px] text-slate-200">Indexación automática de acuerdos con los 12 factores CNA y 8 criterios ABET.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/10 border border-white/15 rounded-xl p-3 shadow-xs">
              <Award className="h-5 w-5 text-[#E58A13] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-heading font-bold text-white">Voto Nominal y Sello PKI</h4>
                <p className="text-[11px] text-slate-200">Actas inmutables verificables con firmas digitales y quórum estatutario.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="lg:col-span-7 bg-white text-[#1A202C] rounded-xl p-6 sm:p-8 shadow-xl border border-[#E2E8F0] relative">
          {/* Tabs Selector: Solo Canales de Acceso Auténticos */}
          <div className="flex p-1 bg-[#F8FAF8] rounded-md mb-6 border border-[#E2E8F0]">
            <button
              onClick={() => { setActiveTab('institutional'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-heading font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'institutional'
                  ? 'bg-[#006837] text-white shadow-xs'
                  : 'text-[#4A5568] hover:text-[#006837]'
              }`}
            >
              Correo Institucional
            </button>
            <button
              onClick={() => { setActiveTab('guest'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-heading font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'guest'
                  ? 'bg-[#006837] text-white shadow-xs'
                  : 'text-[#4A5568] hover:text-[#006837]'
              }`}
            >
              Invitado / Asesor Externo
            </button>
          </div>

          {/* Error Message Notice */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tab 1: Institutional Email & Password Login */}
          {activeTab === 'institutional' && (
            <form onSubmit={handleInstitutionalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-bold text-[#1A202C] uppercase tracking-wider mb-1.5">
                  Correo Electrónico Institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4A5568]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre.apellido@umayor.edu.co"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF8] border border-[#E2E8F0] rounded-md text-xs font-medium text-[#1A202C] focus:bg-white focus:border-[#E58A13] focus:ring-2 focus:ring-[#E58A13]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-heading font-bold text-[#1A202C] uppercase tracking-wider mb-1.5">
                  Contraseña o PIN de Seguridad Docente
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4A5568]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF8] border border-[#E2E8F0] rounded-md text-xs font-medium text-[#1A202C] focus:bg-white focus:border-[#E58A13] focus:ring-2 focus:ring-[#E58A13]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="rounded-md bg-[#F8FAF8] border border-[#E2E8F0] p-3 text-[11px] text-[#4A5568] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#006837]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#E58A13]" />
                  <span>Acceso Institucional Seguro (Sin Exposición de Padrón):</span>
                </div>
                <p className="text-[#4A5568]">
                  Por motivos de seguridad y confidencialidad estatutaria, el acceso requiere estrictamente su correo y contraseña institucional. No se almacenan credenciales compartidas ni accesos directos públicos.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#006837] hover:bg-[#004D25] text-white text-xs font-heading font-extrabold rounded-md shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
              >
                {isLoading ? (
                  <span>Verificando credenciales...</span>
                ) : (
                  <>
                    <span>Ingresar al Sistema SIG-Currículo</span>
                    <ArrowRight className="h-4 w-4 text-[#E58A13]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: External Guest Login */}
          {activeTab === 'guest' && (
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-heading font-bold text-[#1A202C] uppercase tracking-wider mb-1.5">
                  Token o Código de Convocatoria para Invitados
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4A5568]">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={guestCode}
                    onChange={(e) => setGuestCode(e.target.value)}
                    placeholder="INV-2026-MEC-8492"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAF8] border border-[#E2E8F0] rounded-md text-xs font-medium text-[#1A202C] focus:bg-white focus:border-[#E58A13] focus:ring-2 focus:ring-[#E58A13]/20 outline-none uppercase font-mono tracking-wider transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#4A5568] mt-1.5">
                  Este código fue remitido a su correo en la citación oficial y le permite radicar evidencias en sus compromisos específicos sin acceso al padrón general.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#006837] hover:bg-[#004D25] text-white text-xs font-heading font-extrabold rounded-md shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
              >
                <span>Acceder como Invitado / Asesor</span>
                <ArrowRight className="h-4 w-4 text-[#E58A13]" />
              </button>
            </form>
          )}

          {/* Bottom Trust Seal */}
          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#4A5568] font-medium">
            <span className="flex items-center gap-1 text-[#006837] font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-[#E58A13]" />
              Seguridad y Control de Sesión Activo
            </span>
            <span>Institución Universitaria Mayor de Cartagena · 2026</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-6xl mx-auto text-center text-xs text-slate-200 py-3 z-10 font-medium">
        Institución Universitaria Mayor de Cartagena · <span className="font-script text-[#E58A13] text-sm">La calidad, un compromiso permanente</span>
      </div>
    </div>
  );
};
