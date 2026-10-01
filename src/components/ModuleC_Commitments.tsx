import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Commitment, CommitmentStatus } from '../types';
import { 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Upload, 
  ExternalLink, 
  ShieldCheck, 
  Filter, 
  Search, 
  FileText, 
  Send, 
  Check, 
  X,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';

export const ModuleC_Commitments: React.FC = () => {
  const { 
    currentUser, 
    commitments, 
    submitCommitmentEvidence, 
    auditCommitment, 
    meetings,
    accessRequests,
    requestActAccess,
    resolveAccessRequest
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<'all' | CommitmentStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(commitments[0] || null);

  // Evidence submission state
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [evidenceDriveUrl, setEvidenceDriveUrl] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');

  // Audit state (Encargado de Seguimiento)
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditTargetStatus, setAuditTargetStatus] = useState<CommitmentStatus>('cumplido');
  const [auditNotes, setAuditNotes] = useState('');

  // Access Request Form State
  const [showAccessRequestModal, setShowAccessRequestModal] = useState(false);
  const [reqMeetingId, setReqMeetingId] = useState(meetings[0]?.id || '');
  const [reqPurpose, setReqPurpose] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  const isTracker = currentUser.role === 'seguimiento';
  const isPresident = currentUser.role === 'presidente';
  const isExternal = currentUser.role === 'invitado_externo';

  // Filtered commitments
  const filteredCommitments = commitments.filter((c) => {
    // If external guest, only see tasks assigned to them!
    if (isExternal && c.responsibleId !== currentUser.id) {
      return false;
    }

    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchResp = c.responsibleName.toLowerCase().includes(q);
      const matchActa = c.meetingCode.toLowerCase().includes(q);
      if (!matchTitle && !matchResp && !matchActa) return false;
    }
    return true;
  });

  const getStatusBadge = (status: CommitmentStatus, dueDate: string) => {
    const isOverdue = status !== 'cumplido' && new Date(dueDate) < new Date();
    const finalStatus: CommitmentStatus = isOverdue ? 'vencido' : status;

    const styles: Record<CommitmentStatus, string> = {
      pendiente: 'bg-amber-50 text-amber-800 border-amber-200',
      en_revision: 'bg-blue-50 text-blue-800 border-blue-200',
      cumplido: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      vencido: 'bg-rose-50 text-rose-800 border-rose-200',
    };

    const labels: Record<CommitmentStatus, string> = {
      pendiente: 'Pendiente',
      en_revision: 'En Revisión',
      cumplido: 'Cumplido',
      vencido: 'Vencido',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${styles[finalStatus]}`}>
        {finalStatus === 'cumplido' && <CheckCircle className="h-3 w-3" />}
        {finalStatus === 'vencido' && <AlertTriangle className="h-3 w-3" />}
        {finalStatus === 'en_revision' && <Clock className="h-3 w-3" />}
        {finalStatus === 'pendiente' && <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>}
        {labels[finalStatus]}
      </span>
    );
  };

  const handleSubmitEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommitment || !evidenceDriveUrl.trim()) return;

    submitCommitmentEvidence(
      selectedCommitment.id,
      evidenceDesc,
      evidenceDriveUrl,
      evidenceFileName || 'Evidencia_Cumplimiento.pdf'
    );

    setEvidenceDesc('');
    setEvidenceDriveUrl('');
    setEvidenceFileName('');
    setShowEvidenceModal(false);
  };

  const handleAuditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommitment) return;

    auditCommitment(selectedCommitment.id, auditTargetStatus, auditNotes);
    setAuditNotes('');
    setShowAuditModal(false);
  };

  const handleRequestAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMeet = meetings.find((m) => m.id === reqMeetingId);
    if (!targetMeet || !reqPurpose.trim()) return;

    requestActAccess(targetMeet.id, targetMeet.code, reqPurpose);
    setRequestSuccess(true);
    setTimeout(() => {
      setRequestSuccess(false);
      setShowAccessRequestModal(false);
      setReqPurpose('');
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Módulo C · Seguimiento & Control
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Gestión de Compromisos & Solicitudes de Actas
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Control de tareas derivadas de los comités, radicación de evidencias en Google Drive y auditoría formal del Encargado de Seguimiento.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isExternal && (
            <button
              onClick={() => setShowAccessRequestModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
            >
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              Solicitar Acceso a Acta Histórica
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        {/* Status Segmented Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'pendiente', 'en_revision', 'cumplido', 'vencido'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap capitalize ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? 'Todos' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por tarea, acta o responsable..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Grid: Commitments List & Detail / Audit View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Commitments Table / Cards */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Compromisos ({filteredCommitments.length})
            </h2>
            <span className="text-[11px] text-slate-400">
              {isExternal ? 'Mostrando únicamente tareas a su nombre' : 'Vista global del comité'}
            </span>
          </div>

          {filteredCommitments.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
              No se encontraron compromisos con los filtros seleccionados.
            </div>
          ) : (
            filteredCommitments.map((com) => {
              const isSelected = selectedCommitment?.id === com.id;
              const isAssignedToCurrentUser = com.responsibleId === currentUser.id;

              return (
                <div
                  key={com.id}
                  onClick={() => setSelectedCommitment(com)}
                  className={`rounded-xl border p-4 transition-all text-left cursor-pointer bg-white ${
                    isSelected
                      ? 'border-slate-900 ring-1 ring-slate-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-700">
                          {com.meetingCode}
                        </span>
                        <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          Prioridad {com.priority}
                        </span>
                        {isAssignedToCurrentUser && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            Asignado a Usted
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">
                        {com.title}
                      </h3>
                    </div>

                    <div className="shrink-0">
                      {getStatusBadge(com.status, com.dueDate)}
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {com.description}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                    <div>
                      Responsable: <strong className="text-slate-800">{com.responsibleName}</strong>
                      {com.isExternalResponsible && (
                        <span className="ml-1 text-[9px] text-slate-500 font-mono">(Externo)</span>
                      )}
                    </div>
                    <div className="text-right">
                      Fecha Límite: <strong className="font-mono text-slate-800">{com.dueDate}</strong>
                    </div>
                  </div>

                  {com.evidences.length > 0 && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-blue-700 bg-blue-50/60 p-1.5 rounded">
                      <CheckCircle className="h-3 w-3 shrink-0" />
                      <span>{com.evidences.length} evidencia(s) cargada(s) para revisión</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Selected Commitment Detail & Action Drawer */}
        {selectedCommitment ? (
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">
                  {selectedCommitment.meetingCode}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5 leading-snug">
                  {selectedCommitment.title}
                </h3>
              </div>
              <div>{getStatusBadge(selectedCommitment.status, selectedCommitment.dueDate)}</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium">Descripción y Alcance:</span>
                <p className="text-slate-700 mt-0.5 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {selectedCommitment.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-400">Responsable:</span>
                  <p className="font-semibold text-slate-800 mt-0.5 truncate">{selectedCommitment.responsibleName}</p>
                  <p className="text-slate-400 text-[10px] font-mono truncate">{selectedCommitment.responsibleEmail}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-400">Fecha Límite:</span>
                  <p className="font-bold text-slate-800 mt-0.5 font-mono">{selectedCommitment.dueDate}</p>
                  <p className="text-slate-400 text-[10px]">Asignado por: {selectedCommitment.assignedBy}</p>
                </div>
              </div>

              {/* Evidences List */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-700">
                    Evidencias Radicadas ({selectedCommitment.evidences.length})
                  </h4>
                  {(selectedCommitment.responsibleId === currentUser.id || isPresident) && (
                    <button
                      onClick={() => setShowEvidenceModal(true)}
                      className="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1"
                    >
                      <Upload className="h-3 w-3" />
                      Subir Evidencia
                    </button>
                  )}
                </div>

                {selectedCommitment.evidences.length === 0 ? (
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-400 text-[11px] text-center border border-dashed border-slate-200">
                    Aún no se han radicado evidencias de cumplimiento.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCommitment.evidences.map((ev) => (
                      <div key={ev.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-800">{ev.fileName}</span>
                          <span className="font-mono text-[10px] text-slate-400">{ev.submittedAt}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{ev.description}</p>
                        <a
                          href={ev.driveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> Abrir en Google Drive
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Audit Section (Audited by Encargado de Seguimiento) */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                    Dictamen de Auditoría
                  </h4>
                  {isTracker && (
                    <button
                      onClick={() => setShowAuditModal(true)}
                      className="text-xs rounded bg-purple-700 px-2 py-0.5 font-semibold text-white hover:bg-purple-800"
                    >
                      Auditar Entrega
                    </button>
                  )}
                </div>

                {selectedCommitment.auditNotes ? (
                  <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-2.5 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-purple-900 font-semibold">
                      <span>Auditado por: {selectedCommitment.auditedBy}</span>
                      <span className="font-mono text-[10px] text-purple-700">{selectedCommitment.auditedAt}</span>
                    </div>
                    <p className="text-purple-950 leading-relaxed">{selectedCommitment.auditNotes}</p>
                  </div>
                ) : (
                  <p className="text-slate-400 text-[11px] italic">
                    Sin observaciones de auditoría aún. El Encargado de Seguimiento validará los archivos una vez remitidos.
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-5 bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center space-y-2">
            <CheckSquare className="h-6 w-6 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Sin Compromiso Seleccionado</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
              Los compromisos y tareas se derivan de los puntos tratados durante el desarrollo de la reunión en el Módulo B.
            </p>
          </div>
        )}
      </div>

      {/* Historical Acts Access Requests Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-slate-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Solicitudes de Acceso a Actas Históricas ({accessRequests.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Trazabilidad de solicitudes de consulta para miembros
          </span>
        </div>

        <div className="space-y-2">
          {accessRequests.map((req) => {
            const canResolve = isPresident || isTracker;

            return (
              <div
                key={req.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900">{req.meetingCode}</span>
                    <span className="text-slate-400">·</span>
                    <span className="font-medium text-slate-700">Solicitado por: {req.requestedBy}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({req.requestedAt.slice(0, 10)})</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    <strong>Motivo académico:</strong> {req.purpose}
                  </p>
                  {req.resolutionNote && (
                    <p className="text-[11px] text-slate-500 italic">
                      Resolución ({req.resolvedBy}): {req.resolutionNote}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      req.status === 'aprobado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'rechazado'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {req.status}
                  </span>

                  {req.status === 'pendiente' && canResolve && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => resolveAccessRequest(req.id, 'aprobado', 'Acceso autorizado formalmente.')}
                        className="rounded p-1 text-emerald-700 hover:bg-emerald-100"
                        title="Aprobar solicitud de acceso"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => resolveAccessRequest(req.id, 'rechazado', 'No justificado.')}
                        className="rounded p-1 text-rose-700 hover:bg-rose-100"
                        title="Rechazar solicitud"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Subir Evidencias */}
      {showEvidenceModal && selectedCommitment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Radicar Evidencia de Cumplimiento
              </h3>
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEvidence} className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400">Compromiso:</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedCommitment.title}</p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Nombre del Documento / Archivo
                </label>
                <input
                  type="text"
                  required
                  value={evidenceFileName}
                  onChange={(e) => setEvidenceFileName(e.target.value)}
                  placeholder="Ej. Constancia_Licenciamiento_ANSYS_2026.pdf"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Enlace de Google Drive / Repositorio Institucional
                </label>
                <input
                  type="url"
                  required
                  value={evidenceDriveUrl}
                  onChange={(e) => setEvidenceDriveUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Descripción o Notas de la Entrega
                </label>
                <textarea
                  rows={3}
                  required
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  placeholder="Describa el contenido de la evidencia, personas involucradas y resultados alcanzados..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEvidenceModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 shadow-xs"
                >
                  Radicar para Auditoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Auditar Compromiso (Encargado de Seguimiento) */}
      {showAuditModal && selectedCommitment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Auditar y Validar Compromiso
                </h3>
              </div>
              <button
                onClick={() => setShowAuditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAuditSubmit} className="space-y-3.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <p className="font-semibold text-slate-800">{selectedCommitment.title}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Responsable: {selectedCommitment.responsibleName} ({selectedCommitment.evidences.length} evidencias cargadas)
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Nuevo Estado tras Auditoría
                </label>
                <select
                  value={auditTargetStatus}
                  onChange={(e) => setAuditTargetStatus(e.target.value as CommitmentStatus)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-semibold"
                >
                  <option value="cumplido">Cumplido (Aprobado Formalmente)</option>
                  <option value="en_revision">En Revisión (Requiere Ajustes o Complementos)</option>
                  <option value="pendiente">Pendiente (No se ha entregado conforme)</option>
                  <option value="vencido">Vencido (Plazo expirado sin cumplimiento)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Observaciones Técnicas de Auditoría
                </label>
                <textarea
                  rows={3}
                  required
                  value={auditNotes}
                  onChange={(e) => setAuditNotes(e.target.value)}
                  placeholder="Justifique el dictamen, señale la conformidad técnica de los soportes..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAuditModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-700 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-800 shadow-xs"
                >
                  Confirmar Dictamen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Solicitar Acceso a Acta Histórica */}
      {showAccessRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Solicitud Formal de Acceso a Acta Histórica
              </h3>
              <button
                onClick={() => setShowAccessRequestModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {requestSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">Solicitud Radicada</h4>
                <p className="text-xs text-emerald-700">
                  La Presidencia del Comité evaluará su justificación y recibirá la notificación correspondiente.
                </p>
              </div>
            ) : (
              <form onSubmit={handleRequestAccessSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Acta a Consultar
                  </label>
                  <select
                    value={reqMeetingId}
                    onChange={(e) => setReqMeetingId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-mono"
                  >
                    {meetings.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.code} - {m.title} ({m.date})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Propósito Académico / Justificación del Acceso
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reqPurpose}
                    onChange={(e) => setReqPurpose(e.target.value)}
                    placeholder="Especifique la necesidad académica, revisión de antecedentes o preparación de informes de área..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAccessRequestModal(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
                  >
                    Radicar Solicitud
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
