import React from 'react';
import { useApp } from '../context/AppContext';
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
  FileText
} from 'lucide-react';

export const ModuleE_Dashboard: React.FC = () => {
  const { meetings, commitments, qualityMappings, users } = useApp();

  // Metrics: Meetings
  const totalMeetings = meetings.length;
  const executedMeetings = meetings.filter((m) => m.status === 'cerrada').length;
  const inProgressMeetings = meetings.filter((m) => m.status === 'en_curso').length;
  const scheduledMeetings = meetings.filter((m) => m.status === 'programada').length;
  const meetingExecutionRate = totalMeetings > 0 ? Math.round((executedMeetings / totalMeetings) * 100) : 0;

  // Metrics: Commitments
  const totalCommitments = commitments.length;
  const fulfilledCommitments = commitments.filter((c) => c.status === 'cumplido').length;
  const inReviewCommitments = commitments.filter((c) => c.status === 'en_revision').length;
  const pendingCommitments = commitments.filter((c) => c.status === 'pendiente').length;

  // Overdue calculation
  const today = new Date();
  const overdueCommitments = commitments.filter((c) => {
    if (c.status === 'cumplido') return false;
    const due = new Date(c.dueDate);
    return due < today || c.status === 'vencido';
  }).length;

  // Due soon (within 7 days and not fulfilled)
  const dueSoonCommitments = commitments.filter((c) => {
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
  const performanceByUser = users.map((u) => {
    const userComms = commitments.filter((c) => c.responsibleId === u.id);
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
  const factorDistribution = qualityMappings.reduce((acc, curr) => {
    acc[curr.factorCode] = (acc[curr.factorCode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Módulo E
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
          Indicadores de desempeño y estado
        </h1>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl">
          Resumen consolidado de comités ejecutados, cumplimiento de compromisos y alertas de seguimiento.
        </p>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: % Cumplimiento de Compromisos */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Cumplimiento global</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
              {commitmentComplianceRate}%
            </span>
            <span className="text-xs text-slate-500">
              {fulfilledCommitments} de {totalCommitments}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {inReviewCommitments} en auditoría
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${commitmentComplianceRate}%` }}
              className="h-full bg-emerald-600 rounded-full"
            />
          </div>
        </div>

        {/* KPI 2: Comités Programados vs Ejecutados */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Comités ejecutados</span>
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
              {executedMeetings}/{totalMeetings}
            </span>
            <span className="text-xs text-slate-500">
              {meetingExecutionRate}%
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {inProgressMeetings} en sesión · {scheduledMeetings} próximos
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${meetingExecutionRate}%` }}
              className="h-full bg-blue-600 rounded-full"
            />
          </div>
        </div>

        {/* KPI 3: Semáforo de Vencidos */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Compromisos críticos</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-rose-600 tabular-nums">
              {overdueCommitments}
            </span>
            <span className="text-xs text-slate-500">vencidos</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-700 font-medium">
            {dueSoonCommitments} próximos a vencer (7 días)
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${totalCommitments > 0 ? (overdueCommitments / totalCommitments) * 100 : 0}%` }}
              className="h-full bg-rose-600 rounded-full"
            />
          </div>
        </div>

        {/* KPI 4: Evidencias Indexadas para Acreditación */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Mapeos de acreditación</span>
            <Award className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-purple-700 tabular-nums">
              {qualityMappings.length}
            </span>
            <span className="text-xs text-slate-500">acuerdos indexados</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            CNA y ABET
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: '85%' }}
              className="h-full bg-purple-600 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Middle Section: Semáforo Institucional & Quality Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Semáforo de Alertas */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Alertas por estado
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {/* Red Alert: Overdue */}
            <div className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/50 flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-950 uppercase text-[11px]">
                    Crítico: {overdueCommitments} vencidos
                  </span>
                </div>
                <p className="text-rose-900 text-[11px] mt-0.5">
                  Tareas con plazo rebasado. Requiere revisión inmediata.
                </p>
              </div>
            </div>

            {/* Amber Alert: Due Soon */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 uppercase text-[11px]">
                    Preventivo: {dueSoonCommitments} próximos
                  </span>
                </div>
                <p className="text-amber-900 text-[11px] mt-0.5">
                  Vencimiento en menos de 7 días. Se han notificado los responsables.
                </p>
              </div>
            </div>

            {/* Green Alert: On track / Fulfilled */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 uppercase text-[11px]">
                    En regla: {fulfilledCommitments + pendingCommitments - overdueCommitments} cumplidos
                  </span>
                </div>
                <p className="text-emerald-900 text-[11px] mt-0.5">
                  Compromisos validados con evidencia documentada.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quality Evidence by Factor */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Evidencias por factor
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {Object.keys(factorDistribution).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Sin mapeos registrados aún
              </p>
            ) : (
              Object.entries(factorDistribution).map(([fCode, count]) => {
                const maxCount = Math.max(...Object.values(factorDistribution));
                const percentage = Math.round((count / maxCount) * 100);

                return (
                  <div key={fCode} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 font-mono">
                        Factor {fCode}
                      </span>
                      <span className="font-mono font-bold text-slate-600">
                        {count} ({Math.round((count / qualityMappings.length) * 100)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="h-full bg-purple-700 rounded-full transition-all"
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
              Rendimiento por responsable
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {performanceByUser.length} evaluados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/60 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Responsable</th>
                <th className="py-2.5 px-4">Rol</th>
                <th className="py-2.5 px-4 text-center">Total</th>
                <th className="py-2.5 px-4 text-center">Cumplidos</th>
                <th className="py-2.5 px-4 text-center">Vencidos</th>
                <th className="py-2.5 px-4 text-right">Efectividad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {performanceByUser.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                    Sin datos de rendimiento aún
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
