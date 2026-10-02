import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
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
  LogOut
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
    logout
  } = useApp();

  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDbMenu, setShowDbMenu] = useState(false);
  const [showSsoModal, setShowSsoModal] = useState(false);
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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
      {/* Zone 1: Institutional Wordmark & Faculty Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs font-semibold text-sm">
            CC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900">
                SIG-CURRÍCULO
              </span>
              <span className="hidden sm:inline text-xs text-slate-400">·</span>
              <span className="hidden sm:inline text-xs text-slate-600 font-medium">
                Comité Curricular de Ingeniería Mecánica
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate max-w-xs sm:max-w-md">
              Facultad de Ingeniería · Institución Universitaria Mayor de Cartagena · Acreditación CNA / ABET
            </p>
          </div>
        </div>
      </div>

      {/* Zone 2: Realtime & Offline-First Storage Indicator */}
      <div className="hidden lg:flex items-center gap-3 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span className="text-[11px] font-mono text-slate-700">
            Almacenamiento Local Seguro (IndexedDB)
          </span>
        </div>
        <span className="text-slate-300">|</span>
        <span className="text-slate-400">Módulo:</span>
        <span className="capitalize text-slate-900 font-semibold bg-slate-100 px-2.5 py-1 rounded">
          {currentTab.replace('_', ' ')}
        </span>
      </div>

      {/* Zone 3: Interactive Role Switcher, Database Menu, Notifications & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Institutional Single Sign-On Button / Connected Badge */}
        {googleUser ? (
          <div className="flex items-center gap-1.5 bg-blue-50/90 border border-blue-200 px-2.5 py-1 rounded-lg text-xs">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-700 text-[10px] font-bold text-white">
              {googleUser.name.slice(0, 1)}
            </span>
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-bold text-blue-900 block leading-none">SSO Institucional</span>
              <span className="text-[9px] text-blue-700 font-mono block leading-tight truncate max-w-[120px]">
                {googleUser.email}
              </span>
            </div>
            <button
              onClick={signOutGoogle}
              className="text-slate-400 hover:text-slate-700 p-0.5 ml-1 text-xs font-bold"
              title="Cerrar sesión institucional"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSsoModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/80 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100 transition-colors shadow-xs"
            title="Iniciar sesión institucional"
          >
            <UserCheck className="h-3.5 w-3.5 text-blue-700" />
            <span className="hidden sm:inline">Acceso Institucional</span>
            <span className="sm:hidden">SSO</span>
          </button>
        )}

        {/* Database Management Menu (IndexedDB) */}
        <div className="relative">
          <button
            onClick={() => setShowDbMenu(!showDbMenu)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            title="Gestión de almacenamiento IndexedDB y respaldos JSON"
          >
            <Database className="h-3.5 w-3.5 text-slate-600" />
            <span className="hidden md:inline">Base de Datos</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showDbMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-slate-950/5 z-50">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Almacenamiento IndexedDB
                </p>
                <p className="text-xs text-slate-500">
                  Operación local sin claves externas ni dependencias remotas:
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
                    <p className="font-semibold text-slate-800">Exportar Respaldo JSON</p>
                    <p className="text-[10px] text-slate-400">Descarga todas las actas, votos y compromisos</p>
                  </div>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 font-medium"
                >
                  <Upload className="h-3.5 w-3.5 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-slate-800">Importar Respaldo JSON</p>
                    <p className="text-[10px] text-slate-400">Restaura la base de datos desde un archivo</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (confirm('¿Restablecer toda la base de datos a los datos iniciales de acreditación CNA/ABET?')) {
                      resetDatabaseToDefaults();
                      setShowDbMenu(false);
                    }
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-rose-700 hover:bg-rose-50 font-medium"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-rose-600" />
                  <div>
                    <p className="font-semibold">Restablecer Datos Iniciales</p>
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
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-xs hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            title="Cambiar entre los roles RBAC institucionales"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-white">
              {currentUser.avatarInitials}
            </div>
            <div className="hidden md:block">
              <p className="font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
                {currentUser.name.split(' ')[0]} {currentUser.name.split(' ')[1]}
              </p>
              <p className="text-[10px] text-slate-500 capitalize">
                {roleLabelsMap[currentUser.role]?.title}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
          </button>

          {showRoleSelector && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-slate-950/5 z-50">
              <div className="px-2 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {currentUser.role === 'super_admin' ? 'Simular Perfil / Administrador' : 'Perfil Institucional'}
                </p>
                <p className="text-xs text-slate-500">
                  {currentUser.role === 'super_admin'
                    ? 'Seleccione un perfil para validar los permisos y flujos del sistema:'
                    : `${currentUser.name} (${currentUser.email})`}
                </p>
              </div>

              {currentUser.role === 'super_admin' ? (
                <div className="space-y-1">
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
                        className={`flex w-full items-start gap-2.5 rounded-lg p-2 text-left text-xs transition-colors ${
                          isCurrent ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-slate-900 text-xs font-bold text-white mt-0.5">
                          {u.avatarInitials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="truncate text-slate-900 font-medium">
                              {u.name}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] text-emerald-700 font-medium">
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
                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-slate-900">{currentUser.name}</p>
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
                  Cerrar Sesión
                </button>
                <button
                  onClick={() => {
                    setCurrentTab('modulo_admin');
                    setShowRoleSelector(false);
                  }}
                  className="text-[11px] text-blue-700 font-semibold hover:underline flex items-center gap-1 px-1 py-0.5"
                >
                  + Administrar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Header Direct Logout Button */}
        <button
          onClick={() => logout()}
          className="flex h-8 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-colors shadow-xs"
          title="Cerrar sesión institucional y volver al portal de ingreso"
        >
          <LogOut className="h-3.5 w-3.5 text-rose-600" />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Bandeja de notificaciones y citaciones institucionales"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-950/5 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">
                    Citaciones y Notificaciones Oficiales
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
                    No tiene notificaciones pendientes.
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
                  <h3 className="text-sm font-bold text-slate-900">Acceso Institucional</h3>
                  <p className="text-[11px] text-slate-500">Autenticación local para docentes y directivos</p>
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
                Ingreso Rápido con Padrón del Comité:
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
                <span className="bg-white px-2 text-slate-400 font-medium">o ingrese con correo institucional</span>
              </div>
            </div>

            {/* Custom Institutional Email Form */}
            <form onSubmit={handleInstitutionalLogin} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Correo Electrónico Institucional
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
                  Nombre Completo (Opcional)
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
                  {isLoggingIn ? 'Autenticando...' : 'Ingresar al Sistema'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
