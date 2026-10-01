import React, { useState } from 'react';
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
  ChevronDown
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
    resetAllData,
    isLiveSyncConnected,
    googleUser,
    signInWithGoogle,
    signOutGoogle
  } = useApp();

  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Error durante el inicio de sesión institucional:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Filter unread notifications relevant to current role or direct email
  const userNotifications = notifications.filter(
    (n) => (n.recipientRoles && n.recipientRoles.includes(currentUser.role)) || n.recipientEmail === currentUser.email
  );
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const roleLabelsMap: Record<UserRole, { title: string; badge: string; border: string }> = {
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
              Facultad de Ingeniería · Universidad Mayor · Acreditación CNA / ABET
            </p>
          </div>
        </div>
      </div>

      {/* Zone 2: Realtime Concurrency Indicator & Navigation Notice */}
      <div className="hidden lg:flex items-center gap-3 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
          <span className={`h-2 w-2 rounded-full ${isLiveSyncConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
          <span className="text-[11px] font-mono text-slate-700">
            {isLiveSyncConnected ? 'Sincronización en Vivo (WebSocket)' : 'Conectando Servidor...'}
          </span>
        </div>
        <span className="text-slate-300">|</span>
        <span className="text-slate-400">Vista:</span>
        <span className="capitalize text-slate-900 font-semibold bg-slate-100 px-2.5 py-1 rounded">
          {currentTab.replace('_', ' ')}
        </span>
      </div>

      {/* Zone 3: Interactive Role Switcher, Notifications & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Google Workspace Single Sign-On Button / Connected Badge */}
        {googleUser ? (
          <div className="flex items-center gap-1.5 bg-blue-50/90 border border-blue-200 px-2.5 py-1 rounded-lg text-xs">
            {googleUser.photoURL ? (
              <img src={googleUser.photoURL} alt="Google Avatar" className="h-5 w-5 rounded-full" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-blue-600"></span>
            )}
            <div className="hidden sm:block text-left">
              <span className="text-[10px] font-bold text-blue-900 block leading-none">Google SSO</span>
              <span className="text-[9px] text-blue-700 font-mono block leading-tight truncate max-w-[110px]">
                {googleUser.email}
              </span>
            </div>
            <button
              onClick={signOutGoogle}
              className="text-slate-400 hover:text-slate-700 p-0.5 ml-1 text-xs font-bold"
              title="Cerrar sesión de Google Workspace"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs hover:border-slate-300 disabled:opacity-50"
            title="Iniciar sesión con cuenta institucional de Google Workspace"
          >
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="hidden sm:inline">{isLoggingIn ? 'Autenticando...' : 'Google SSO'}</span>
            <span className="sm:hidden">SSO</span>
          </button>
        )}

        {/* Institutional Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-xs hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
            title="Cambiar entre los 5 roles RBAC institucionales"
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
                  Simular Rol RBAC Institucional
                </p>
                <p className="text-xs text-slate-500">
                  Seleccione un perfil para validar los permisos y flujos del sistema:
                </p>
              </div>
              <div className="space-y-1">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const config = roleLabelsMap[u.role];
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
                          {u.roleLabel}
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

              <div className="pt-2 mt-1 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    setCurrentTab('modulo_admin');
                    setShowRoleSelector(false);
                  }}
                  className="text-[11px] text-blue-700 font-semibold hover:underline flex items-center gap-1 px-1 py-0.5"
                >
                  + Administrar Miembros, Roles & Estamentos
                </button>
              </div>
            </div>
          )}
        </div>

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

        {/* Reset State Button */}
        <button
          onClick={() => {
            if (confirm('¿Desea restaurar los datos de demostración del comité curricular a su estado inicial?')) {
              resetAllData();
            }
          }}
          className="hidden sm:flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title="Restablecer datos de prueba"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Reiniciar</span>
        </button>
      </div>
    </header>
  );
};
