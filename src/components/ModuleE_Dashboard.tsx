import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VirtualMeetingLink } from './VirtualMeetingLink';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Users, 
  Award, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  FileText,
  GraduationCap,
  ArrowRight,
  Layers,
  Sparkles,
  Bell,
  BellRing,
  Check,
  Mail,
  ExternalLink,
  Send,
  ShieldAlert,
  Info,
  CheckSquare
} from 'lucide-react';

export const ModuleE_Dashboard: React.FC = () => {
  const { 
    currentUser,
    meetings, 
    commitments, 
    qualityMappings, 
    users, 
    programs, 
    activeProgramId, 
    setActiveProgramId,
    notifications,
    markNotificationRead,
    sendCommitmentDeadlineAlert
  } = useApp();

  const [dashboardProgramFilter, setDashboardProgramFilter] = useState<string>(activeProgramId || 'all');
  const [notifTab, setNotifTab] = useState<'all' | 'meetings' | 'acts' | 'commitments' | 'unread'>('all');
  const [sentAlertMsg, setSentAlertMsg] = useState<string | null>(null);

  // Handle program switch from dashboard
  const handleProgramFilterChange = (progId: string) => {
    setDashboardProgramFilter(progId);
    setActiveProgramId(progId);
  };

  // Scope data according to selected program filter
  const scopedMeetings = meetings.filter((m) => {
    if (dashboardProgramFilter !== 'all') {
      return m.programId === dashboardProgramFilter;
    }
    return true;
  });

  const scopedCommitments = commitments.filter((c) => {
    if (dashboardProgramFilter !== 'all') {
      return c.programId === dashboardProgramFilter;
    }
    return true;
  });

  const scopedQualityMappings = qualityMappings.filter((qm) => {
    if (dashboardProgramFilter !== 'all') {
      return qm.programId === dashboardProgramFilter;
    }
    return true;
  });

  const selectedProgObj = programs.find((p) => p.id === dashboardProgramFilter);

  // Metrics: Meetings
  const totalMeetings = scopedMeetings.length;
  const executedMeetings = scopedMeetings.filter((m) => m.status === 'cerrada').length;
  const inProgressMeetings = scopedMeetings.filter((m) => m.status === 'en_curso').length;
  const scheduledMeetings = scopedMeetings.filter((m) => m.status === 'programada').length;
  const meetingExecutionRate = totalMeetings > 0 ? Math.round((executedMeetings / totalMeetings) * 100) : 0;

  // Metrics: Commitments
  const totalCommitments = scopedCommitments.length;
  const fulfilledCommitments = scopedCommitments.filter((c) => c.status === 'cumplido').length;
  const inReviewCommitments = scopedCommitments.filter((c) => c.status === 'en_revision').length;
  const pendingCommitments = scopedCommitments.filter((c) => c.status === 'pendiente').length;

  // Overdue calculation
  const today = new Date();
  const overdueCommitments = scopedCommitments.filter((c) => {
    if (c.status === 'cumplido') return false;
    const due = new Date(c.dueDate);
    return due < today || c.status === 'vencido';
  }).length;

  // Due soon (within 7 days and not fulfilled)
  const dueSoonCommitments = scopedCommitments.filter((c) => {
    if (c.status === 'cumplido' || c.status === 'vencido') return false;
    const due = new Date(c.dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const commitmentComplianceRate = totalCommitments > 0 
    ? Math.round((fulfilledCommitments / totalCommitments) * 100) 
    : 0;

  // Performance by Responsible
  const targetUsers = users.filter((u) => {
    if (dashboardProgramFilter !== 'all') {
      return (u.programIds && u.programIds.includes(dashboardProgramFilter)) || u.primaryProgramId === dashboardProgramFilter;
    }
    return true;
  });

  const performanceByUser = targetUsers.map((u) => {
    const userComms = scopedCommitments.filter((c) => c.responsibleId === u.id);
    const completed = userComms.filter((c) => c.status === 'cumplido').length;
    const overdue = userComms.filter((c) => {
      if (c.status === 'cumplido') return false;
      return new Date(c.dueDate) < today || c.status === 'vencido';
    }).length;
    const rate = userComms.length > 0 ? Math.round((completed / userComms.length) * 100) : 0;

    return {
      user: u,
      total: userComms.length,
      completed,
      overdue,
      rate,
    };
  }).filter((item) => item.total > 0);

  // Quality Mappings Distribution by Factor
  const factorDistribution = scopedQualityMappings.reduce((acc, curr) => {
    acc[curr.factorCode] = (acc[curr.factorCode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Multiprogram Comparative Stats (when viewing all programs)
  const programComparisonData = programs.map((prog) => {
    const progMeets = meetings.filter((m) => m.programId === prog.id);
    const progClosedMeets = progMeets.filter((m) => m.status === 'cerrada');
    const progComms = commitments.filter((c) => c.programId === prog.id);
    const progCompletedComms = progComms.filter((c) => c.status === 'cumplido');
    const progOverdueComms = progComms.filter((c) => {
      if (c.status === 'cumplido') return false;
      return new Date(c.dueDate) < today || c.status === 'vencido';
    });
    const progRate = progComms.length > 0 ? Math.round((progCompletedComms.length / progComms.length) * 100) : 0;
    const progMappings = qualityMappings.filter((qm) => qm.programId === prog.id);
    const progMembersCount = users.filter((u) => 
      (u.programIds && u.programIds.includes(prog.id)) || u.primaryProgramId === prog.id
    ).length;

    return {
      prog,
      totalMeetings: progMeets.length,
      closedMeetings: progClosedMeets.length,
      totalCommitments: progComms.length,
      completedCommitments: progCompletedComms.length,
      overdueCommitments: progOverdueComms.length,
      rate: progRate,
      mappingsCount: progMappings.length,
      membersCount: progMembersCount,
    };
  });

  // Derived Notification Lists for Dashboard Panel
  const upcomingMeetingsList = scopedMeetings.filter((m) => m.status === 'programada' || m.status === 'en_curso');
  const publishedActsList = scopedMeetings.filter((m) => m.status === 'cerrada').slice(0, 4);
  const dueAlertsList = scopedCommitments.filter((c) => {
    if (c.status === 'cumplido') return false;
    const due = new Date(c.dueDate);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 7 || c.status === 'vencido';
  });

  return (
    <div className="space-y-6">
      {/* Top Banner with Program Switcher Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-cinzel">
            Módulo E · Analítica y Desempeño
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Indicadores de Desempeño y Estado Multiprograma
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Monitoreo en tiempo real del cumplimiento de compromisos, sesiones de comité ejecutadas y evidencias del proceso de autoevaluación curricular y calidad académica.
          </p>
        </div>

        {/* Global Program Filter in Dashboard */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-xs shrink-0">
          <GraduationCap className="h-4 w-4 text-[#006837]" />
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Programa Curricular
            </span>
            <select
              value={dashboardProgramFilter}
              onChange={(e) => handleProgramFilterChange(e.target.value)}
              className="rounded border-0 bg-transparent py-0 pl-0 pr-6 text-xs font-bold text-[#006837] focus:ring-0 cursor-pointer"
            >
              <option value="all">Consolidado Facultad (Todos)</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Program Scope Indicator Banner */}
      {dashboardProgramFilter !== 'all' && selectedProgObj && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-xl p-3.5 border border-emerald-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-1 rounded bg-[#006837] text-white text-xs font-mono font-bold">
              {selectedProgObj.code}
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Mostrando métricas e indicadores de: {selectedProgObj.name}
              </h4>
              <p className="text-[10px] text-slate-500">
                Nivel: {selectedProgObj.level} · Director: {selectedProgObj.directorName || 'No asignado'} · SNIES: {selectedProgObj.sniesCode || 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleProgramFilterChange('all')}
            className="text-[11px] font-semibold text-[#006837] hover:underline cursor-pointer"
          >
            Ver Consolidado de Toda la Facultad
          </button>
        </div>
      )}

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: % Cumplimiento de Compromisos */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Cumplimiento de compromisos</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
              {commitmentComplianceRate}%
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {fulfilledCommitments} de {totalCommitments}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
              style={{ width: `${commitmentComplianceRate}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Sesiones Ejecutadas */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Sesiones del comité</span>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
              {executedMeetings}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {inProgressMeetings > 0 ? `${inProgressMeetings} en vivo` : `${scheduledMeetings} programadas`}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-blue-600 transition-all duration-500 rounded-full"
              style={{ width: `${meetingExecutionRate}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Compromisos Vencidos / En Riesgo */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Compromisos en riesgo</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tracking-tight text-rose-600">
              {overdueCommitments}
            </span>
            <span className="text-[11px] text-amber-600 font-medium font-mono">
              {dueSoonCommitments} por vencer (&lt; 7d)
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            {overdueCommitments === 0
              ? 'Todos los plazos se encuentran al día.'
              : 'Requieren atención prioritaria.'}
          </p>
        </div>

        {/* KPI 4: Evidencias de Autoevaluación Mapeadas */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Evidencias de Autoevaluación</span>
            <Award className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900">
              {scopedQualityMappings.length}
            </span>
            <span className="text-[11px] text-purple-700 font-medium">
              {Object.keys(factorDistribution).length} factores
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Fragmentos de actas indexados para el proceso de autoevaluación.
          </p>
        </div>
      </div>

      {/* SECTION: CENTRO DE NOTIFICACIONES Y ALERTAS INSTITUCIONALES (PANEL DE CONTROL) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/80 shadow-2xs">
              <BellRing className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Centro de Notificaciones & Alertas del Panel de Control
                <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full font-mono shadow-2xs">
                  {upcomingMeetingsList.length + dueAlertsList.length + publishedActsList.length} Alertas
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Avisos automáticos de próximas sesiones de comité, actas firmadas digitalmente y compromisos en riesgo
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium shrink-0 flex-wrap">
            <button
              onClick={() => setNotifTab('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${notifTab === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Todas
            </button>
            <button
              onClick={() => setNotifTab('meetings')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${notifTab === 'meetings' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Próximas Sesiones ({upcomingMeetingsList.length})
            </button>
            <button
              onClick={() => setNotifTab('commitments')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${notifTab === 'commitments' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Compromisos ({dueAlertsList.length})
            </button>
            <button
              onClick={() => setNotifTab('acts')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${notifTab === 'acts' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Actas Publicadas ({publishedActsList.length})
            </button>
          </div>
        </div>

        {/* Feedback Banner if alert dispatched */}
        {sentAlertMsg && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{sentAlertMsg}</span>
            </div>
            <button onClick={() => setSentAlertMsg(null)} className="text-emerald-600 hover:text-emerald-900 font-bold text-xs">✕</button>
          </div>
        )}

        {/* Notifications Grid / Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* Section 1: Próximas Reuniones */}
          {(notifTab === 'all' || notifTab === 'meetings') && upcomingMeetingsList.map((m) => (
            <div key={`meet-notif-${m.id}`} className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 via-white to-blue-50/20 p-4 space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-md border border-blue-300">
                  <Calendar className="h-3 w-3 text-blue-600" />
                  Próxima Sesión
                </span>
                <span className="font-mono text-[10px] text-slate-500 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">{m.code}</span>
              </div>

              <h4 className="font-bold text-slate-900 leading-snug line-clamp-2 text-xs">{m.title}</h4>

              <div className="text-[11px] text-slate-600 space-y-1.5 bg-white/90 p-2.5 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span><strong>{m.date}</strong> ({m.startTime} - {m.endTime})</span>
                </div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <VirtualMeetingLink locationText={m.locationOrUrl} showButton={true} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-blue-100 text-[10px]">
                <span className="text-slate-500 font-medium">{m.agendaItems.length} puntos en orden del día</span>
                <span className="text-blue-700 font-bold uppercase">{m.type}</span>
              </div>
            </div>
          ))}

          {/* Section 2: Compromisos Próximos a Vencer o Vencidos */}
          {(notifTab === 'all' || notifTab === 'commitments') && dueAlertsList.map((c) => {
            const daysLeft = Math.ceil((new Date(c.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const isOverdue = daysLeft < 0;

            return (
              <div
                key={`com-notif-${c.id}`}
                className={`rounded-2xl border p-4 space-y-2.5 text-xs shadow-2xs ${
                  isOverdue ? 'border-rose-200 bg-gradient-to-br from-rose-50/70 via-white to-rose-50/20' : 'border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${
                    isOverdue ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}>
                    <AlertTriangle className="h-3 w-3" />
                    {isOverdue ? `Vencido hace ${Math.abs(daysLeft)} días` : daysLeft === 0 ? 'Vence Hoy' : `Vence en ${daysLeft} días`}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">{c.meetingCode}</span>
                </div>

                <h4 className="font-bold text-slate-900 leading-snug line-clamp-2 text-xs">{c.title}</h4>

                <div className="text-[11px] text-slate-600 bg-white/90 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                  <p>Responsable: <strong className="text-slate-800">{c.responsibleName}</strong></p>
                  <p>Fecha Límite: <strong className="font-mono text-slate-900">{c.dueDate}</strong></p>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium capitalize">Prioridad: <strong>{c.priority}</strong></span>
                  <button
                    onClick={async () => {
                      const res = await sendCommitmentDeadlineAlert(c.id);
                      setSentAlertMsg(res.message);
                      setTimeout(() => setSentAlertMsg(null), 5000);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-md border border-blue-200 transition-colors"
                  >
                    <Send className="h-2.5 w-2.5" /> Notificar por Correo
                  </button>
                </div>
              </div>
            );
          })}

          {/* Section 3: Actas Recientes Publicadas / Cerradas */}
          {(notifTab === 'all' || notifTab === 'acts') && publishedActsList.map((m) => (
            <div key={`act-notif-${m.id}`} className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/20 p-4 space-y-2.5 text-xs shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-300">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  Acta Oficial Publicada
                </span>
                <span className="font-mono text-[10px] text-slate-500 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">{m.code}</span>
              </div>

              <h4 className="font-bold text-slate-900 leading-snug line-clamp-2 text-xs">{m.title}</h4>

              <div className="text-[11px] text-slate-600 bg-white/90 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                <p>Fecha de Sesión: <strong>{m.date}</strong></p>
                <p className="text-[10px] text-emerald-700 font-semibold">Sellada e inmutable con hash SHA-256 ✓</p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-emerald-100 text-[10px]">
                <span className="text-slate-500 font-medium">Publicada para consulta</span>
                <span className="text-emerald-800 font-bold uppercase">{m.programCode || 'ING-MEC'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION: COMPARATIVO MULTIPROGRAMA DE LA FACULTAD (SIEMPRE DISPONIBLE EN VISTA GLOBAL) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#006837]" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Tablero Comparativo Multiprograma de la Facultad
              </h3>
              <p className="text-[11px] text-slate-500">
                Desempeño y trazabilidad curricular cruzada entre los programas de la Facultad de Ingeniería.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-semibold text-slate-500">
            {programs.length} Programas Parametrizados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Programa Académico</th>
                <th className="py-2.5 px-4">Director(a) / Coordinador(a)</th>
                <th className="py-2.5 px-4 text-center">Miembros</th>
                <th className="py-2.5 px-4 text-center">Sesiones</th>
                <th className="py-2.5 px-4 text-center">Compromisos</th>
                <th className="py-2.5 px-4 text-center">Cumplimiento %</th>
                <th className="py-2.5 px-4 text-center">Mapeo Autoevaluación</th>
                <th className="py-2.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {programComparisonData.map((row) => {
                const isSelected = dashboardProgramFilter === row.prog.id;

                return (
                  <tr key={row.prog.id} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-emerald-50/30' : ''}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded font-mono text-[10px] font-black bg-[#006837] text-white">
                          {row.prog.code}
                        </span>
                        <div>
                          <strong className="text-slate-900 block font-semibold">{row.prog.name}</strong>
                          <span className="text-[10px] text-slate-400 capitalize">Nivel: {row.prog.level}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {row.prog.directorName || 'Por designar'}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                      {row.membersCount}
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                      {row.closedMeetings} / {row.totalMeetings}
                    </td>

                    <td className="py-3 px-4 text-center font-mono">
                      <span className="text-emerald-700 font-semibold">{row.completedCommitments}</span>
                      <span className="text-slate-400"> / {row.totalCommitments}</span>
                      {row.overdueCommitments > 0 && (
                        <span className="text-rose-600 font-bold ml-1">({row.overdueCommitments} ven.)</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              row.rate >= 80
                                ? 'bg-emerald-600'
                                : row.rate >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${row.rate}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-800 text-[11px]">
                          {row.rate}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center font-mono font-bold text-purple-800">
                      {row.mappingsCount}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleProgramFilterChange(row.prog.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#006837] hover:bg-emerald-50 px-2.5 py-1 rounded transition-colors cursor-pointer"
                        title="Ver indicadores específicos de este programa"
                      >
                        Filtrar <ArrowRight className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Middle Section: Commitments Distribution & Quality Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Commitments Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Estado de compromisos
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Total: {totalCommitments}
            </span>
          </div>

          <div className="space-y-3">
            {/* Cumplidos */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Cumplidos y auditados
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {fulfilledCommitments} ({totalCommitments > 0 ? Math.round((fulfilledCommitments / totalCommitments) * 100) : 0}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${totalCommitments > 0 ? (fulfilledCommitments / totalCommitments) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* En Revisión */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  En revisión técnica
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {inReviewCommitments} ({totalCommitments > 0 ? Math.round((inReviewCommitments / totalCommitments) * 100) : 0}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${totalCommitments > 0 ? (inReviewCommitments / totalCommitments) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Pendientes */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Pendientes en plazo
                </span>
                <span className="font-mono font-semibold text-slate-900">
                  {pendingCommitments} ({totalCommitments > 0 ? Math.round((pendingCommitments / totalCommitments) * 100) : 0}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${totalCommitments > 0 ? (pendingCommitments / totalCommitments) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Vencidos */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  Vencidos
                </span>
                <span className="font-mono font-semibold text-rose-600">
                  {overdueCommitments} ({totalCommitments > 0 ? Math.round((overdueCommitments / totalCommitments) * 100) : 0}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${totalCommitments > 0 ? (overdueCommitments / totalCommitments) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quality Factors Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Evidencias por Factor de Autoevaluación
            </h3>
            <span className="text-xs text-purple-700 font-mono font-semibold">
              {scopedQualityMappings.length} Registros
            </span>
          </div>

          <div className="space-y-2.5">
            {Object.keys(factorDistribution).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Aún no hay fragmentos de actas vinculados a factores de autoevaluación.
              </p>
            ) : (
              Object.entries(factorDistribution).map(([factorCode, count]) => {
                const percentage = Math.round((count / scopedQualityMappings.length) * 100);
                return (
                  <div key={factorCode} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-mono font-semibold text-slate-800">
                        Factor {factorCode}
                      </span>
                      <span className="font-mono text-slate-500">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-purple-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Performance Table by Responsible */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Rendimiento por Integrante del Comité
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {performanceByUser.length} Evaluados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/60 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Responsable</th>
                <th className="py-2.5 px-4">Rol en Comité</th>
                <th className="py-2.5 px-4 text-center">Total Asignados</th>
                <th className="py-2.5 px-4 text-center">Cumplidos</th>
                <th className="py-2.5 px-4 text-center">Vencidos</th>
                <th className="py-2.5 px-4 text-right">Efectividad %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {performanceByUser.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    Sin compromisos asignados para los integrantes de este filtro.
                  </td>
                </tr>
              ) : (
                performanceByUser.map((row) => (
                  <tr key={row.user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {row.user.name}
                      {row.user.isExternal && (
                        <span className="ml-1.5 text-[9px] font-mono text-slate-500 bg-slate-100 px-1 py-0.5 rounded">
                          Ext.
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {row.user.roleLabel}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-700">
                      {row.total}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-emerald-700">
                      {row.completed}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-rose-600">
                      {row.overdue}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-mono font-bold ${
                          row.rate >= 80
                            ? 'text-emerald-700'
                            : row.rate >= 50
                            ? 'text-amber-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {row.rate}%
                      </span>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
