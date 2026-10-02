import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarDays, 
  FileEdit, 
  CheckSquare, 
  Award, 
  BarChart3, 
  Lock, 
  ExternalLink, 
  ShieldCheck, 
  UserCheck,
  UserCog,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { currentUser, commitments, logout } = useApp();

  // Commitments counter for current user or tracking
  const userPendingCommitments = commitments.filter((c) => {
    if (currentUser.role === 'invitado_externo') {
      return c.responsibleId === currentUser.id && c.status !== 'cumplido';
    }
    if (currentUser.role === 'seguimiento') {
      return c.status === 'en_revision' || c.status === 'pendiente';
    }
    return c.responsibleId === currentUser.id && c.status !== 'cumplido';
  }).length;

  const navItems = [
    {
      id: 'modulo_a',
      label: 'A. Programación & Orden del Día',
      sublabel: 'Convocatorias, puntos y citaciones',
      icon: CalendarDays,
      roles: ['super_admin', 'presidente', 'miembro', 'seguimiento', 'autoevaluacion'],
    },
    {
      id: 'modulo_b',
      label: 'B. Desarrollo & Votación en Vivo',
      sublabel: 'Minuta dinámica, acuerdos y mociones',
      icon: FileEdit,
      roles: ['super_admin', 'presidente', 'miembro'],
      highlight: true,
    },
    {
      id: 'modulo_c',
      label: 'C. Seguimiento de Compromisos',
      sublabel: 'Evidencias, auditoría y actas pasadas',
      icon: CheckSquare,
      roles: ['super_admin', 'presidente', 'miembro', 'seguimiento', 'invitado_externo'],
      badgeCount: userPendingCommitments > 0 ? userPendingCommitments : undefined,
    },
    {
      id: 'modulo_d',
      label: 'D. Gestor de Autoevaluación',
      sublabel: 'Nomenclaturas CNA/ABET y mapeo',
      icon: Award,
      roles: ['super_admin', 'presidente', 'autoevaluacion', 'seguimiento'],
    },
    {
      id: 'modulo_e',
      label: 'E. Dashboard & Indicadores',
      sublabel: 'KPIs, cumplimiento y semáforo',
      icon: BarChart3,
      roles: ['super_admin', 'presidente', 'miembro', 'seguimiento', 'autoevaluacion'],
    },
    {
      id: 'modulo_admin',
      label: 'F. Administración del Comité',
      sublabel: 'Miembros, roles y estamentos',
      icon: UserCog,
      roles: ['super_admin', 'presidente', 'autoevaluacion', 'seguimiento', 'miembro'],
    },
  ];

  return (
    <aside className="w-64 lg:w-72 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Active Role Card */}
        <div className={`rounded-xl border p-3.5 shadow-xs ${
          currentUser.role === 'super_admin'
            ? 'border-indigo-300 bg-gradient-to-br from-indigo-50/90 to-purple-50/60'
            : 'border-slate-200 bg-slate-50/70'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Sesión Institucional
            </span>
            <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${
              currentUser.role === 'super_admin'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-200/80 text-slate-700'
            }`}>
              {currentUser.role === 'super_admin' ? 'SUPER ADMIN' : currentUser.role.replace('_', ' ')}
            </span>
          </div>
          <div className="mt-2">
            <h4 className="text-xs font-bold text-slate-900 leading-snug">
              {currentUser.name}
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              {currentUser.roleLabel}
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Permisos RBAC:</span>
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-indigo-600" />
              {currentUser.role === 'super_admin' && 'Super Admin (Control Total)'}
              {currentUser.role === 'presidente' && 'Presidencia & Firma'}
              {currentUser.role === 'miembro' && 'Voz, Voto & Tareas'}
              {currentUser.role === 'seguimiento' && 'Auditoría & Control'}
              {currentUser.role === 'autoevaluacion' && 'Acreditación & Mapeo'}
              {currentUser.role === 'invitado_externo' && 'Solo Tareas Asignadas'}
            </span>
          </div>
        </div>

        {/* Navigation Modules */}
        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Módulos del Sistema
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isAllowed = item.roles.includes(currentUser.role);
              const isActive = currentTab === item.id;
              const Icon = item.icon;

              if (!isAllowed) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 cursor-not-allowed bg-slate-50/40 select-none"
                    title={`Restringido para su rol: ${currentUser.roleLabel}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-slate-300" />
                      <div className="text-left">
                        <div className="font-medium text-slate-300">{item.label}</div>
                      </div>
                    </div>
                    <Lock className="h-3 w-3 text-slate-300" />
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-xs text-left transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <div className="truncate">
                      <div className="truncate">{item.label}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                        {item.sublabel}
                      </div>
                    </div>
                  </div>
                  {item.badgeCount !== undefined && (
                    <span
                      className={`ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        isActive ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer System Info & Logout */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 text-[11px] text-slate-500 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700">Estado del Sistema</span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            En Línea (Local)
          </span>
        </div>
        <button
          onClick={() => logout()}
          className="flex w-full items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs transition-all shadow-xs"
          title="Cerrar sesión institucional y volver al portal de ingreso"
        >
          <LogOut className="h-4 w-4 text-rose-600" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
