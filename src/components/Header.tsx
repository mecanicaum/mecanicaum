import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { UmayorLogo } from './UmayorLogo';
import { 
  Bell, 
  ShieldCheck, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Vote, 
  X,
  ChevronDown,
  Database,
  Download,
  Upload,
  UserCheck,
  Building2,
  Lock,
  LogOut,
  QrCode,
  GraduationCap,
  Check
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    currentUser, 
    users, 
    switchUser, 
    notifications, 
    markNotificationRead,
    resetDatabaseToDefaults,
    exportDatabaseBackup,
    importDatabaseBackup,
    isLiveSyncConnected,
    googleUser,
    signInWithInstitutionalEmail,
    signOutGoogle,
    logout,
    programs,
    activeProgramId,
    activeProgram,
    setActiveProgramId
  } = useApp();

  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDbMenu, setShowDbMenu] = useState(false);
  const [showSsoModal, setShowSsoModal] = useState(false);
  const [showProgramSelector, setShowProgramSelector] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<UserRole>('miembro');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInstitutionalLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customEmail) return;

    setIsLoggingIn(true);
    try {
      await signInWithInstitutionalEmail(customEmail, customName || undefined, customRole);
      setShowSsoModal(false);
      setCustomEmail('');
      setCustomName('');
    } catch (err: any) {
      alert(`Error al iniciar sesión: ${err.message || err}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        await importDatabaseBackup(text);
        alert('¡Base de datos importada exitosamente desde el respaldo!');
        setShowDbMenu(false);
      } catch (err) {
        // error already alerted in context
      }
    };
    reader.readAsText(file);
  };

  // Filter unread notifications relevant to current role or direct email
  const userNotifications = notifications.filter(
    (n) => (n.recipientRoles && n.recipientRoles.includes(currentUser.role)) || n.recipientEmail === currentUser.email
  );
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const roleLabelsMap: Record<UserRole, { title: string; badge: string; border: string }> = {
    super_admin: {
      title: 'Super Administrador',
      badge: 'bg-indigo-50 text-indigo-900 border-indigo-300 font-bold',
      border: 'border-indigo-600',
    },
    presidente: {
      title: 'Presidente del Comité',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      border: 'border-emerald-500',
    },
    miembro: {
      title: 'Miembro con Voto',
      badge: 'bg-blue-50 text-blue-800 border-blue-200',
      border: 'border-blue-500',
    },
    seguimiento: {
      title: 'Encargado de Seguimiento',
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      border: 'border-amber-500',
    },
    autoevaluacion: {
      title: 'Gestor de Autoevaluación',
      badge: 'bg-purple-50 text-purple-800 border-purple-200',
      border: 'border-purple-500',
    },
    invitado_externo: {
      title: 'Invitado Externo',
      badge: 'bg-slate-100 text-slate-700 border-slate-300',
      border: 'border-slate-400',
    },
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#E59800]/40 bg-[#006837] text-white px-4 sm:px-6 shadow-[0_4px_12px_rgba(0,104,55,0.15)]">
      {/* Zone 1: Institutional Logo, Global Program Selector & Accreditation */}
      <div className="flex items-center gap-3">
        <UmayorLogo size="md" variant="badge" />

        {/* Global Academic Program Selector (Multiprograma) */}
        <div className="relative">
          <button
            onClick={() => setShowProgramSelector(!showProgramSelector)}
            className="flex items-center gap-2 bg-[#004D25] hover:bg-[#003B1A] border border-[#E59800]/50 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-heading transition-all shadow-xs cursor-pointer text-left"
            title="Seleccionar Programa Académico de la Facultad"
          >
            <GraduationCap className="h-4 w-4 text-[#E59800] shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] text-[#E59800] font-black uppercase tracking-wider leading-none">
                Programa Curricular
              </span>
              <span className="text-[11px] font-bold text-white leading-tight truncate max-w-[120px] sm:max-w-[190px]">
                {activeProgramId === 'all'
                  ? 'Todos los Programas'
                  : activeProgram?.name || 'Ingeniería Mecánica'}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-300 ml-0.5" />
          </button>

          {showProgramSelector && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProgramSelector(false)} />
              <div className="absolute left-0 mt-2 w-80 rounded-xl bg-white text-slate-800 shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in">
                <div className="p-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-heading font-black text-[#006837] uppercase">
                    <GraduationCap className="h-4 w-4 text-[#E58A13]" />
                    <span>Facultad de Ingeniería</span>
                  </div>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md uppercase">
                    Multiprograma
                  </span>
                </div>

                <div className="py-1 max-h-72 overflow-y-auto space-y-1">
                  {/* Option: Todos los programas */}
                  <button
                    onClick={() => {
                      setActiveProgramId('all');
                      setShowProgramSelector(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      activeProgramId === 'all'
                        ? 'bg-[#006837]/10 text-[#006837] font-black border border-[#006837]/30'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="block font-bold">Todos los Programas</span>
                      <span className="text-[10px] text-slate-500 font-normal">Vista consolidada de toda la Facultad</span>
                    </div>
                    {activeProgramId === 'all' && <Check className="h-4 w-4 text-[#006837]" />}
                  </button>

                  {/* List of programs */}
                  {programs.map((prog) => {
                    const isUserMember = currentUser.programIds?.includes(prog.id);
                    const isSelected = activeProgramId === prog.id;
                    return (
                      <button
                        key={prog.id}
                        onClick={() => {
                          setActiveProgramId(prog.id);
                          setShowProgramSelector(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#006837] text-white font-black shadow-xs'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {prog.code}
                            </span>
                            <span className="font-bold truncate">{prog.name}</span>
                          </div>
                          <div className={`text-[10px] mt-0.5 flex items-center gap-2 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                            {prog.sniesCode && <span>SNIES: {prog.sniesCode}</span>}
                            {isUserMember && (
                              <span className={`font-semibold ${isSelected ? 'text-amber-300' : 'text-emerald-700'}`}>
                                • Eres miembro
                              </span>
                            )}
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-[#E58A13] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="hidden xl:block border-l border-white/20 pl-3">
          <span className="text-[10px] bg-[#E59800] text-[#006837] px-2 py-0.5 rounded-md font-heading font-extrabold uppercase tracking-wider block w-fit shadow-xs">
            Proceso de Autoevaluación
          </span>
        </div>
      </div>

      {/* Zone 2: Context */}
      <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-100">
        <span className="text-[#E59800] font-heading font-bold uppercase tracking-wider text-[10px]">Módulo:</span>
        <span className="capitalize text-white font-semibold bg-[#004D25] px-2.5 py-1 rounded-md border border-[#E59800]/30 shadow-2xs">
          {currentTab.replace('_', ' ')}
        </span>
      </div>

      {/* Zone 3: Interactive Role Switcher, Database Menu, Notifications & Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Institutional Single Sign-On Button / Connected Badge */}
        {googleUser ? (
          <div className="flex items-center gap-1.5 bg-[#004D25] border border-[#E59800]/40 px-2.5 py-1 rounded-md text-xs text-white">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E59800] text-[10px] font-bold text-[#006837]">
              {googleUser.name.slice(0, 1)}
            </span>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-bold text-[#E59800] block leading-none">SSO Activo</span>
              <span className="text-[9px] text-slate-200 font-mono block leading-tight truncate max-w-[120px]">
                {googleUser.email}
              </span>
            </div>
            <button
              onClick={signOutGoogle}
              className="text-slate-300 hover:text-white p-0.5 ml-1 text-xs font-bold cursor-pointer"
              title="Cerrar sesión institucional"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSsoModal(true)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#E59800]/50 bg-[#004D25] px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#E59800] hover:text-[#006837] transition-colors cursor-pointer"
            title="Iniciar sesión institucional"
          >
            <UserCheck className="h-3.5 w-3.5 text-[#E59800]" />
            <span className="hidden sm:inline">Acceso institucional</span>
            <span className="sm:hidden">SSO</span>
          </button>
        )}

        {/* Database Management Menu (IndexedDB) */}
        <div className="relative">
          <button
            onClick={() => setShowDbMenu(!showDbMenu)}
            className="flex h-8 items-center gap-1.5 rounded-md border border-[#E59800]/40 bg-[#004D25] px-2.5 text-xs font-medium text-white hover:bg-[#004D25]/80 transition-colors cursor-pointer"
            title="Gestión de respaldos y almacenamiento local"
          >
            <Database className="h-3.5 w-3.5 text-[#E59800]" />
            <span className="hidden md:inline">Base de datos</span>
            <ChevronDown className="h-3 w-3 text-slate-200" />
          </button>

          {showDbMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-slate-950/5 z-50">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Almacenamiento local
                </p>
                <p className="text-xs text-slate-500">
                  Copias y restauración de datos del sistema.
                </p>
              </div>

              <div className="space-y-1">
                <button
                  onClick={async () => {
                    await exportDatabaseBackup();
                    setShowDbMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <Download className="h-3.5 w-3.5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-slate-800">Exportar respaldo JSON</p>
                    <p className="text-[10px] text-slate-400">Descarga actas, votos y compromisos</p>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <Upload className="h-3.5 w-3.5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-800">Importar respaldo JSON</p>
                    <p className="text-[10px] text-slate-400">Restaura la base de datos desde un archivo</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setCurrentTab('verificador');
                    setShowDbMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-blue-800 hover:bg-blue-50 font-medium border-t border-slate-100 mt-1 pt-2"
                >
                  <QrCode className="h-3.5 w-3.5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Validador Oficial de Actas</p>
                    <p className="text-[10px] text-blue-500">Comprobación de firmas PKI y QR</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (confirm('¿Restablecer toda la base de datos a los datos iniciales del proceso de autoevaluación y calidad?')) {
                      resetDatabaseToDefaults();
                      setShowDbMenu(false);
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-rose-700 hover:bg-rose-50 font-medium"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-rose-600" />
                  <div>
                    <p className="font-semibold">Restablecer datos</p>
                    <p className="text-[10px] text-rose-400">Reinicia todas las tablas a valores por defecto</p>
                  </div>
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".json"
                className="hidden"
              />
            </div>
          )}
        </div>

        {/* Institutional Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="flex items-center gap-2 rounded-md border border-[#E59800]/40 bg-[#004D25] px-2.5 py-1 text-left text-xs text-white hover:bg-[#004D25]/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#E59800] cursor-pointer"
            title="Cambiar entre los roles RBAC institucionales"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#E59800] text-[10px] font-bold text-[#006837] shadow-xs">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden md:block">
              <p className="font-semibold text-white leading-tight truncate max-w-[130px]">
                {currentUser.name.split(' ')[0]} {currentUser.name.split(' ')[1]}
              </p>
              <p className="text-[10px] text-[#E59800] font-bold capitalize">
                {roleLabelsMap[currentUser.role]?.title}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-200 ml-0.5" />
          </button>

          {showRoleSelector && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[#E2E8F0] bg-white p-2 shadow-[0_4px_12px_rgba(15,44,89,0.15)] ring-1 ring-slate-950/5 z-50 text-[#1E293B]">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-heading">
                  {currentUser.role === 'super_admin' ? 'Simular perfil' : 'Perfil institucional'}
                </p>
                <p className="text-xs text-slate-500">
                  {currentUser.role === 'super_admin'
                    ? 'Seleccione un perfil para validar permisos del sistema:'
                    : `${currentUser.name} (${currentUser.email})`}
                </p>
              </div>

              {currentUser.role === 'super_admin' ? (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {users.map((u) => {
                    const isCurrent = u.id === currentUser.id;
                    const config = roleLabelsMap[u.role] || roleLabelsMap.miembro;
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowRoleSelector(false);
                        }}
                        className={`flex w-full items-start gap-2.5 rounded-md p-2 text-left text-xs transition-colors ${
                          isCurrent ? 'bg-[#0F2C59]/10 font-semibold border border-[#0F2C59]/20' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#0F2C59] text-xs font-bold text-white mt-0.5">
                          {u.avatarInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="truncate text-[#1E293B] font-medium">
                              {u.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] text-[#0088CC] font-bold">
                                Activo
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {u.roleLabel || u.academicTitle}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                            <span>{config.title}</span>
                            <span>·</span>
                            <span className="font-mono text-[9px]">{u.email}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-md text-xs space-y-1 border border-slate-100">
                  <p className="font-bold text-[#0F2C59] font-heading">{currentUser.name}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{currentUser.email}</p>
                  <p className="text-slate-600 text-[11px]">{currentUser.academicTitle || currentUser.roleLabel}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleLabelsMap[currentUser.role]?.badge}`}>
                    {roleLabelsMap[currentUser.role]?.title}
                  </span>
                </div>
              )}

              <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    logout();
                    setShowRoleSelector(false);
                  }}
                  className="text-[11px] text-rose-700 font-bold hover:underline flex items-center gap-1 px-1 py-0.5"
                >
                  <LogOut className="h-3 w-3" />
                  Cerrar sesión
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('modulo_admin');
                    setShowRoleSelector(false);
                  }}
                  className="text-[11px] text-[#0088CC] font-semibold hover:underline flex items-center gap-1 px-1 py-0.5"
                >
                  Configuración
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Header Direct Logout Button */}
        <button
          onClick={() => logout()}
          className="flex h-8 items-center gap-1.5 rounded-md border border-rose-400/40 bg-rose-500/20 px-2.5 text-xs font-semibold text-rose-200 hover:bg-rose-500/30 hover:text-white transition-colors"
          title="Cerrar sesión institucional y volver al portal de ingreso"
        >
          <LogOut className="h-3.5 w-3.5 text-rose-300" />
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
            title="Bandeja de notificaciones"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FFB800] text-[9px] font-bold text-[#0F2C59] shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-950/5 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">
                    Notificaciones
                  </span>
                  {unreadCount > 0 && (
                    <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-800">
                      {unreadCount} nuevas
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
                {userNotifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No hay notificaciones.
                  </div>
                ) : (
                  userNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`p-3 text-xs transition-colors rounded-lg cursor-pointer ${
                        notif.read ? 'bg-white opacity-70' : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                          {notif.type === 'citacion' && <Clock className="h-3.5 w-3.5 text-blue-600" />}
                          {notif.type === 'moción' && <Vote className="h-3.5 w-3.5 text-amber-600" />}
                          {notif.type === 'compromiso' && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                          {notif.type === 'auditoria' && <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />}
                          {notif.type === 'acceso' && <FileText className="h-3.5 w-3.5 text-slate-600" />}
                          <span>{notif.title}</span>
                        </div>
                        <span className="shrink-0 text-[10px] font-mono text-slate-400">
                          {notif.date.slice(5)}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">
                        {notif.message}
                      </p>
                      {notif.meetingCode && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="font-mono text-[9px] text-slate-500 bg-slate-200/70 px-1.5 py-0.5 rounded">
                            {notif.meetingCode}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Institutional SSO Login Modal */}
      {showSsoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Acceso institucional</h3>
                  <p className="text-[11px] text-slate-500">Ingreso seguro para docentes y directivos</p>
                </div>
              </div>
              <button
                onClick={() => setShowSsoModal(false)}
                className="text-slate-400 hover:text-slate-600 rounded-lg p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Profile Selection */}
            <div className="mt-4">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Acceso rápido
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {users.slice(0, 5).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      signInWithInstitutionalEmail(u.email, u.name, u.role);
                      setShowSsoModal(false);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-left transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-white">
                        {u.avatarInitials}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">{u.name}</span>
                        <span className="text-[10px] text-slate-500">{u.email}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded capitalize">
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-400 font-medium">o use su correo institucional</span>
              </div>
            </div>

            {/* Custom Institutional Email Form */}
            <form onSubmit={handleInstitutionalLogin} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Correo institucional
                </label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@umayor.edu.co"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Nombre (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Dr(a). Nombre y Apellidos"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSsoModal(false)}
                  className="w-1/3 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn || !customEmail}
                  className="w-2/3 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50 shadow-xs"
                >
                  {isLoggingIn ? 'Autenticando...' : 'Ingresar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
