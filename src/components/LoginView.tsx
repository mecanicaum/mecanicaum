import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
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

    if (!email.trim()) {
      setErrorMsg('Por favor ingrese su correo electrónico institucional.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Por favor ingrese su contraseña o PIN institucional de acceso.');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithInstitutionalCredentials(email.trim(), password.trim());
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al autenticar credenciales institucionales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickRosterLogin = (userId: string) => {
    setErrorMsg(null);
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setEmail(targetUser.email);
      setPassword('');
      setActiveTab('institutional');
      setInfoMsg(`Ha seleccionado a ${targetUser.name}. Ingrese su contraseña o PIN para acceder.`);
    }
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanCode = guestCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Por favor ingrese el código o token de citación como invitado.');
      return;
    }

    if (!cleanCode.startsWith('INV-')) {
      setErrorMsg('Formato no reconocido. Los códigos oficiales inician con "INV-" (Ej: INV-2026-MEC-8492).');
      return;
    }

    setIsLoading(true);
    try {
      const guestUser = users.find((u) => u.role === 'invitado_externo') || {
        id: `usr-invitado-${Date.now()}`,
        name: `Invitado Sector Productivo (${cleanCode})`,
        email: `invitado.${cleanCode.toLowerCase().replace(/[^a-z0-9]/g, '')}@empresa-aliada.com`,
        role: 'invitado_externo' as UserRole,
        department: 'Consejo Asesor / Sector Productivo',
        academicTitle: 'Representante Externo',
        avatarInitials: 'IE',
        hasVote: false,
        periodo: '2026 - 2028',
        active: true,
      };

      await signInWithInstitutionalEmail(
        guestUser.email,
        guestUser.name,
        'invitado_externo'
      );
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Código de invitado inválido o expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleBadges: Record<UserRole, { label: string; color: string }> = {
    super_admin: { label: 'Super Administrador', color: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold' },
    presidente: { label: 'Presidente Decano', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    miembro: { label: 'Miembro con Voto', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    seguimiento: { label: 'Sec. Seguimiento', color: 'bg-amber-100 text-amber-800 border-amber-300' },
    autoevaluacion: { label: 'Gestor Calidad', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    invitado_externo: { label: 'Invitado Externo', color: 'bg-slate-100 text-slate-700 border-slate-300' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 flex flex-col justify-between text-slate-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Ambient Lights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar with Institutional Identity */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-900 font-black text-lg shadow-lg">
            CC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white">
                SIG-CURRÍCULO
              </span>
              <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-mono font-medium">
                v2.4 Autoevaluación
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Comité Curricular de Ingeniería Mecánica · Institución Universitaria Mayor de Cartagena
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          {onOpenVerifier && (
            <button
              onClick={() => onOpenVerifier('')}
              className="inline-flex items-center gap-1.5 bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-700/60 px-3 py-1.5 rounded-lg transition-colors font-medium shadow-xs"
              title="Validar un acta firmada mediante código o escaneo QR"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Validador de Actas (QR)</span>
            </button>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            Almacenamiento Seguro
          </span>
        </div>
      </div>

      {/* Main Login Card Area */}
      <div className="w-full max-w-4xl mx-auto my-8 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: System Credentials & Institutional Overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4" />
              Portal Oficial de Gestión Curricular
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Acreditación y Decisiones en Tiempo Real
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Plataforma institucional para el desarrollo de sesiones colegiadas, votaciones con sellado criptográfico, control de compromisos y matriz de calidad CNA / ABET.
            </p>
          </div>

          {/* Value Props & Accreditation Badges */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 bg-slate-800/60 border border-slate-700/80 rounded-xl p-3">
              <GraduationCap className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-100">Matriz de Acreditación Integrada</h4>
                <p className="text-[11px] text-slate-400">Indexación automática de acuerdos con los 12 factores CNA y 8 criterios ABET.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-slate-800/60 border border-slate-700/80 rounded-xl p-3">
              <Award className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-100">Voto Nominal y Sello PKI</h4>
                <p className="text-[11px] text-slate-400">Actas inmutables verificables con firmas digitales y quórum estatutario.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="lg:col-span-7 bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 relative">
          {/* Tabs Selector */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              onClick={() => { setActiveTab('institutional'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'institutional'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Correo Institucional
            </button>
            <button
              onClick={() => { setActiveTab('roster'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'roster'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Padrón de Miembros
            </button>
            <button
              onClick={() => { setActiveTab('guest'); setErrorMsg(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'guest'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Invitado Externo
            </button>
          </div>

          {/* Error Message Notice */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <Info className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Info Notice */}
          {infoMsg && (
            <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Tab 1: Institutional Email & PIN Login */}
          {activeTab === 'institutional' && (
            <form onSubmit={handleInstitutionalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico Institucional
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@umayor.edu.co"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                  />
                </div>
                {/* Autocomplete domain shortcuts */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setEmail('autoevaluacionycurriculomecanica@umayor.edu.co')}
                    className="text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold px-2.5 py-1 rounded-md border border-indigo-200 transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="h-3 w-3 text-indigo-700" />
                    <span>Super Administrador: autoevaluacionycurriculomecanica@umayor.edu.co</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contraseña o PIN de Seguridad Docente
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>Recordar sesión institucional</span>
                </label>
                <span className="text-[11px] text-slate-400">Autenticación local</span>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                  <span>Autenticación Institucional Segura:</span>
                </div>
                <p className="text-slate-500">
                  Ingrese con sus credenciales oficiales de la Institución Universitaria Mayor de Cartagena. En caso de olvido o bloqueo temporal por intentos fallidos, comuníquese con la Presidencia del Comité Curricular o la Dirección de Autoevaluación y Calidad.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-slate-900 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Verificando credenciales...</span>
                ) : (
                  <>
                    <span>Ingresar al Sistema SIG-Currículo</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Roster / Member Quick Selection */}
          {activeTab === 'roster' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 font-medium">
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
                      className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white font-bold text-xs group-hover:bg-blue-700 transition-colors">
                          {u.avatarInitials}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono truncate">{u.email}</p>
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Token o Código de Convocatoria para Invitados
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={guestCode}
                    onChange={(e) => setGuestCode(e.target.value)}
                    placeholder="INV-2026-MEC-8492"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none uppercase font-mono tracking-wider transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Este código fue enviado a su correo de citación y le permite radicar evidencias en sus compromisos específicos.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Acceder como Invitado / Asesor</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Bottom Trust Seal */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-slate-600 font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Seguridad Institucional Activa
            </span>
            <span>Institución Universitaria Mayor de Cartagena · 2026</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full max-w-6xl mx-auto text-center text-xs text-slate-500 z-10">
        Sistema Integrado de Gestión Curricular, Actas Oficiales y Acreditación Académica CNA/ABET.
      </div>
    </div>
  );
};
