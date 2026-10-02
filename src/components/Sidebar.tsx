import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  CalendarDays, 
  FileEdit, 
  CheckSquare, 
  Award, 
  BarChart3, 
  Lock, 
  ShieldCheck, 
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
      label: 'A. Programación y orden del día',
      sublabel: 'Convocatorias y puntos de agenda',
      icon: CalendarDays,
      roles: ['super_admin', 'presidente', 'miembro', 'seguimiento', 'autoevaluacion'],
    },
    {
      id: 'modulo_b',
      label: 'B. Desarrollo y votación en vivo',
      sublabel: 'Minuta, acuerdos y mociones',
      icon: FileEdit,
      roles: ['super_admin', 'presidente', 'miembro'],
      highlight: true,
    },
    {
      id: 'modulo_c',
      label: 'C. Seguimiento de compromisos',
      sublabel: 'Evidencias y actas previas',
      icon: CheckSquare,
      roles: ['super_admin', 'presidente', 'miembro', 'seguimiento', 'invitado_externo'],
      badgeCount: userPendingCommitments > 0 ? userPendingCommitments : undefined,
    },
    {
      id: 'modulo_d',
      label: 'D. Gestor de autoevaluación',
      sublabel: 'CNA/ABET y mapeo de evidencias',
      icon: Award,
      roles: ['super_admin', 'presidente', 'autoevaluacion', 'seguimiento'],
    },
    {
      id: 'modulo_e',
      label: 'E. Dashboard e indicadores',
      sublabel: 'KPIs, cumplimiento y alertas',
      icon: BarChart3,
      roles: ['super_admin', 'presidente', 'miembro', 'seguimiento', 'autoevaluacion'],
    },
    {
      id: 'modulo_admin',
      label: 'F. Administración del comité',
      sublabel: 'Miembros, roles y estamentos',
      icon: UserCog,
      roles: ['super_admin', 'presidente', 'autoevaluacion', 'seguimiento', 'miembro'],
    },
  ];

  return (
    <aside className="w-64 lg:w-72 shrink-0 border-r border-[#E2E8F0] bg-white flex flex-col justify-between h-[calc(100vh-6rem)] sticky top-24 select-none rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] my-2">
      <div className="p-3.5 space-y-5 overflow-y-auto">
        {/* Active Role Card */}
        <div className={`rounded-xl border p-3.5 shadow-xs ${
          currentUser.role === 'super_admin'
            ? 'border-[#C49E2D]/40 bg-gradient-to-br from-[#006A4E]/10 via-[#C49E2D]/5 to-white'
            : 'border-[#E2E8F0] bg-[#F9F9F9]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5568] font-cinzel">
              Perfil activo
            </span>
            <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase ${
              currentUser.role === 'super_admin'
                ? 'bg-[#006A4E] text-[#C49E2D] border border-[#C49E2D]/40 shadow-xs'
                : 'bg-white text-[#006A4E] border border-[#E2E8F0]'
            }`}>
              {currentUser.role === 'super_admin' ? 'SUPER ADMIN' : currentUser.role.replace('_', ' ')}
            </span>
          </div>
          <div className="mt-2">
            <h4 className="text-xs font-bold text-[#1A1A1A] leading-snug font-serif">
              {currentUser.name}
            </h4>
            <p className="text-[11px] text-[#4A5568] mt-0.5 line-clamp-1">
              {currentUser.roleLabel}
            </p>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-[11px]">
            <span className="text-[#4A5568]">Permisos:</span>
            <span className="font-semibold text-[#006A4E] flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-[#C49E2D]" />
              {currentUser.role === 'super_admin' && 'Control total'}
              {currentUser.role === 'presidente' && 'Presidencia'}
              {currentUser.role === 'miembro' && 'Voz y voto'}
              {currentUser.role === 'seguimiento' && 'Auditoría'}
              {currentUser.role === 'autoevaluacion' && 'Acreditación'}
              {currentUser.role === 'invitado_externo' && 'Solo tareas'}
            </span>
          </div>
        </div>

        {/* Navigation Modules */}
        <div>
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#4A5568] mb-2 font-cinzel">
            Módulos del sistema
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
                    className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-slate-300 cursor-not-allowed bg-slate-50/50 select-none"
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
                  className={`flex w-full items-center justify-between px-3 py-2.5 rounded-md text-xs text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#006A4E] text-white font-semibold shadow-[0_4px_12px_rgba(0,106,78,0.15)]'
                      : 'text-[#1A1A1A] hover:bg-[#006A4E]/10 hover:text-[#006A4E]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#C49E2D]' : 'text-[#006A4E]'}`} />
                    <div className="truncate">
                      <div className="truncate font-medium">{item.label}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-slate-200' : 'text-[#4A5568]'}`}>
                        {item.sublabel}
                      </div>
                    </div>
                  </div>
                  {item.badgeCount !== undefined && (
                    <span
                      className={`ml-2 shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        isActive ? 'bg-[#C49E2D] text-[#006A4E]' : 'bg-[#C49E2D]/20 text-[#006A4E]'
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
      <div className="p-3.5 border-t border-[#E2E8F0] bg-[#F8FAF9] text-[11px] text-[#64748B] space-y-2.5 rounded-b-xl">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#1E293B]">Estado SIG</span>
          <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            En línea (UMAYOR)
          </span>
        </div>
        <button
          onClick={() => logout()}
          className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-md border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs transition-all shadow-xs"
          title="Cerrar sesión institucional y volver al portal de ingreso"
        >
          <LogOut className="h-4 w-4 text-rose-600" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};
