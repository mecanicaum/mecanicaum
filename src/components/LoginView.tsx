import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { AccessibilityBar } from './AccessibilityBar';
import { UmayorLogo } from './UmayorLogo';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  UserCheck,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  Sparkles,
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

  const [activeTab, setActiveTab] = useState<'institutional' | 'roster' | 'guest'>('institutional');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestCode, setGuestCode] = useState('');
  const [rememberSession, setRememberSession] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  const handleInstitutionalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!email) {
      setErrorMsg('Ingrese su correo electrónico institucional.');
      return;
    }

    if (!password) {
      setErrorMsg('Ingrese su contraseña o PIN de seguridad docente.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithInstitutionalCredentials(email, password);
      if (res) {
        if (onLoginSuccess) onLoginSuccess();
      } else {
        setErrorMsg('Credenciales inválidas. Compruebe el correo y contraseña.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error durante la autenticación institucional.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRosterLogin = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setErrorMsg(null);
    setInfoMsg(null);
    setIsLoading(true);

    try {
      const res = await signInWithInstitutionalEmail(user.email);
      if (res && onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión con este perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    if (!guestCode.trim()) {
      setErrorMsg('Ingrese el código de acceso o token de citación.');
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
      setErrorMsg(err.message || 'Código de invitado no reconocido.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleBadges: Record<string, { label: string; color: string }> = {
    super_admin: { label: 'Super Admin', color: 'bg-[#006A4E] text-[#C49E2D] border-[#C49E2D]/40' },
    presidente: { label: 'Presidente Decano', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    miembro: { label: 'Miembro con Voto', color: 'bg-amber-50 text-[#C49E2D] border-[#C49E2D]/40' },
    seguimiento: { label: 'Sec. Seguimiento', color: 'bg-teal-100 text-teal-900 border-teal-300' },
    autoevaluacion: { label: 'Gestor Calidad', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    invitado_externo: { label: 'Invitado Externo', color: 'bg-slate-100 text-slate-800 border-slate-300' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#006A4E] via-[#005835] to-[#00382B] flex flex-col justify-between text-white relative overflow-hidden font-sans">
      <AccessibilityBar />

      {/* Top Bar with Official Institutional Logo */}
      <div className="w-full max-w-6xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <UmayorLogo size="lg" variant="full" className="bg-[#00523E] px-3 py-1.5 rounded-lg border border-[#C49E2D]/40 shadow-sm" />
          <div className="hidden md:block border-l border-[#C49E2D]/30 pl-3">
            <span className="text-xs bg-[#C49E2D] text-[#006A4E] px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider block w-fit">
              UMAYOR
            </span>
            <p className="text-[11px] text-slate-200 font-medium mt-0.5">
              Facultad de Ingeniería · Comité Curricular
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-200">
          {onOpenVerifier && (
            <button
              onClick={() => onOpenVerifier('')}
              className="inline-flex items-center gap-1.5 bg-[#C49E2D] hover:bg-[#C49E2D]/90 text-[#006A4E] px-3.5 py-1.5 rounded-md transition-colors font-bold shadow-xs cursor-pointer"
              title="Validar un acta firmada mediante código o escaneo QR"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-[#006A4E]" />
              <span>Validador de Actas (QR)</span>
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 bg-white/10 border border-white/20 px-3 py-1.5 rounded-md text-white">
            <Database className="h-3.5 w-3.5 text-[#C49E2D]" />
            Almacenamiento Seguro
          </span>
        </div>
      </div>

      {/* Main Login Card Area */}
      <div className="w-full max-w-4xl mx-auto my-6 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center px-4">
        {/* Left Side: System Credentials & Institutional Overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 border border-white/20 text-[#C49E2D] text-xs font-bold font-cinzel">
              <ShieldCheck className="h-4 w-4" />
              Portal Oficial de Gestión Curricular
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight leading-tight">
              Acreditación y Decisiones en Tiempo Real
            </h1>
            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              Plataforma institucional para el desarrollo de sesiones colegiadas, votaciones con sellado criptográfico, control de compromisos y matriz de calidad CNA / ABET.
            </p>
            <p className="lema-institucional text-xs pt-1">
              "Educación con Sentido Humano y Excelencia Académica"
            </p>
          </div>

          {/* Value Props & Accreditation Badges */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 bg-white/10 border border-white/15 rounded-xl p-3 shadow-xs">
              <GraduationCap className="h-5 w-5 text-[#C49E2D] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-serif font-bold text-white">Matriz de Acreditación Integrada</h4>
                <p className="text-[11px] text-slate-300">Indexación automática de acuerdos con los 12 factores CNA y 8 criterios ABET.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/10 border border-white/15 rounded-xl p-3 shadow-xs">
              <Award className="h-5 w-5 text-[#C49E2D] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-serif font-bold text-white">Voto Nominal y Sello PKI</h4>
                <p className="text-[11px] text-slate-300">Actas inmutables verificables con firmas digitales y quórum estatutario.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="lg:col-span-7 bg-white text-[#1A1A1A] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-[#E2E8F0] relative">
          {/* Tabs Selector */}
          <div className="flex p-1 bg-[#F9F9F9] rounded-md mb-6 border border-[#E2E8F0]">
            <button
              onClick={() => { setActiveTab('institutional'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'institutional'
                  ? 'bg-[#006A4E] text-white shadow-xs'
                  : 'text-[#4A5568] hover:text-[#006A4E]'
              }`}
            >
              Correo Institucional
            </button>
            <button
              onClick={() => { setActiveTab('roster'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-[#006A4E] text-white shadow-xs'
                  : 'text-[#4A5568] hover:text-[#006A4E]'
              }`}
            >
              Padrón de Miembros
            </button>
            <button
              onClick={() => { setActiveTab('guest'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                activeTab === 'guest'
                  ? 'bg-[#006A4E] text-white shadow-xs'
                  : 'text-[#4A5568] hover:text-[#006A4E]'
              }`}
            >
              Invitado Externo
            </button>
          </div>

          {/* Error Message Notice */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Info Notice */}
          {infoMsg && (
            <div className="mb-4 p-3 rounded-md bg-[#006A4E]/10 border border-[#006A4E]/30 text-[#006A4E] text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#C49E2D]" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Tab 1: Institutional Email & PIN Login */}
          {activeTab === 'institutional' && (
            <form onSubmit={handleInstitutionalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5 font-cinzel">
                  Correo Electrónico Institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4A5568]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@umayor.edu.co"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9F9F9] border border-[#E2E8F0] rounded-md text-xs font-medium text-[#1A1A1A] focus:bg-white focus:border-[#C49E2D] focus:ring-2 focus:ring-[#C49E2D]/20 outline-none transition-all"
                  />
                </div>
                {/* Autocomplete domain shortcuts */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setEmail('autoevaluacionycurriculomecanica@umayor.edu.co')}
                    className="text-[10px] bg-[#006A4E]/10 hover:bg-[#006A4E]/20 text-[#006A4E] font-bold px-2.5 py-1 rounded-md border border-[#006A4E]/20 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="h-3 w-3 text-[#C49E2D]" />
                    <span>Super Administrador: autoevaluacionycurriculomecanica@umayor.edu.co</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5 font-cinzel">
                  Contraseña o PIN de Seguridad Docente
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4A5568]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9F9F9] border border-[#E2E8F0] rounded-md text-xs font-medium text-[#1A1A1A] focus:bg-white focus:border-[#C49E2D] focus:ring-2 focus:ring-[#C49E2D]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#4A5568]">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="rounded-md text-[#006A4E] focus:ring-[#C49E2D] h-4 w-4"
                  />
                  <span>Recordar sesión institucional</span>
                </label>
                <span className="text-[11px] text-[#4A5568]">Autenticación local</span>
              </div>

              <div className="rounded-md bg-[#F9F9F9] border border-[#E2E8F0] p-3 text-[11px] text-[#4A5568] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#006A4E]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#C49E2D]" />
                  <span>Autenticación Institucional Segura:</span>
                </div>
                <p className="text-[#4A5568]">
                  Ingrese con sus credenciales oficiales de la Institución Universitaria Mayor de Cartagena. En caso de requerir asistencia, comuníquese con la Dirección de Autoevaluación y Calidad.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-[#006A4E] hover:bg-[#00523E] text-white text-xs font-bold rounded-md shadow-[0_4px_12px_rgba(0,106,78,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-cinzel cursor-pointer"
              >
                {isLoading ? (
                  <span>Verificando credenciales...</span>
                ) : (
                  <>
                    <span>Ingresar al Sistema SIG-Currículo</span>
                    <ArrowRight className="h-4 w-4 text-[#C49E2D]" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Roster / Member Quick Selection */}
          {activeTab === 'roster' && (
            <div className="space-y-3">
              <p className="text-xs text-[#4A5568] font-medium">
                Seleccione un integrante del padrón oficial para completar su correo y validar su contraseña o PIN:
              </p>
              <div className="grid grid-cols-1 gap-2 max-h-72 overflow-y-auto pr-1">
                {users.map((u) => {
                  const badge = roleBadges[u.role] || roleBadges.miembro;
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleQuickRosterLogin(u.id)}
                      disabled={isLoading}
                      className="flex items-center justify-between p-2.5 rounded-md border border-[#E2E8F0] bg-[#F9F9F9] hover:bg-[#006A4E]/10 hover:border-[#C49E2D]/50 text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#006A4E] text-white font-bold text-xs group-hover:bg-[#C49E2D] group-hover:text-[#006A4E] transition-colors">
                          {u.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1A1A1A] truncate font-serif">{u.name}</p>
                          <p className="text-[11px] text-[#4A5568] font-mono truncate">{u.email}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${badge.color}`}>
                        {badge.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: External Guest Login */}
          {activeTab === 'guest' && (
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5 font-cinzel">
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
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F9F9F9] border border-[#E2E8F0] rounded-md text-xs font-medium text-[#1A1A1A] focus:bg-white focus:border-[#C49E2D] focus:ring-2 focus:ring-[#C49E2D]/20 outline-none uppercase font-mono tracking-wider transition-all"
                  />
                </div>
                <p className="text-[11px] text-[#4A5568] mt-1.5">
                  Este código fue enviado a su correo de citación y le permite radicar evidencias en sus compromisos específicos.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#006A4E] hover:bg-[#00523E] text-white text-xs font-bold rounded-md shadow-[0_4px_12px_rgba(0,106,78,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 font-cinzel cursor-pointer"
              >
                <span>Acceder como Invitado / Asesor</span>
                <ArrowRight className="h-4 w-4 text-[#C49E2D]" />
              </button>
            </form>
          )}

          {/* Bottom Trust Seal */}
          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#4A5568] font-medium">
            <span className="flex items-center gap-1 text-[#006A4E] font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-[#C49E2D]" />
              Seguridad Institucional Activa
            </span>
            <span>Institución Universitaria Mayor de Cartagena · 2026</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-6xl mx-auto text-center text-xs text-slate-300 py-3 z-10">
        Sistema Integrado de Gestión Curricular, Actas Oficiales y Acreditación Académica CNA/ABET.
      </div>
    </div>
  );
};
