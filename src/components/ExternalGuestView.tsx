import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Upload, 
  ExternalLink, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Commitment } from '../types';

export const ExternalGuestView: React.FC = () => {
  const { currentUser, commitments, submitCommitmentEvidence } = useApp();

  const [selectedTask, setSelectedTask] = useState<Commitment | null>(null);
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [evidenceDesc, setEvidenceDesc] = useState('');
  const [evidenceDriveUrl, setEvidenceDriveUrl] = useState('');
  const [evidenceFileName, setEvidenceFileName] = useState('');

  // Strictly filter only tasks assigned to this external user!
  const guestTasks = commitments.filter((c) => c.responsibleId === currentUser.id);

  const handleSubmitEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !evidenceDriveUrl.trim()) return;

    submitCommitmentEvidence(
      selectedTask.id,
      evidenceDesc,
      evidenceDriveUrl,
      evidenceFileName || 'Evidencia_Externa.pdf'
    );

    setEvidenceDesc('');
    setEvidenceDriveUrl('');
    setEvidenceFileName('');
    setShowEvidenceModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner for Restricted Guest Access */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs">
          <h3 className="font-bold text-amber-900">
            Acceso Restringido: Portal para Invitado Externo ({currentUser.name})
          </h3>
          <p className="text-amber-800 mt-0.5 leading-relaxed">
            De conformidad con el esquema RBAC institucional, su perfil como representante externo (sector productivo / egresados) tiene acceso exclusivo para consultar y reportar las asignaciones y tareas específicas registradas a su nombre. Las deliberaciones internas confidenciales y votaciones estatutarias del comité están reservadas para los miembros titulares.
          </p>
        </div>
      </div>

      {/* Guest Assigned Tasks */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Mis Tareas y Compromisos Asignados ({guestTasks.length})
            </h2>
            <p className="text-xs text-slate-500">
              Consulte el estado de sus compromisos y radique los enlaces o archivos de evidencias para su validación.
            </p>
          </div>
        </div>

        {guestTasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No tiene compromisos pendientes asignados a su nombre en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guestTasks.map((task) => {
              const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'cumplido';

              return (
                <div
                  key={task.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-700">
                        {task.meetingCode}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          task.status === 'cumplido'
                            ? 'bg-emerald-100 text-emerald-800'
                            : isOverdue
                            ? 'bg-rose-100 text-rose-800'
                            : task.status === 'en_revision'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {task.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {task.description}
                    </p>

                    <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                      <span>Fecha límite de entrega: </span>
                      <strong className="font-mono text-slate-800">{task.dueDate}</strong>
                    </div>

                    {/* Evidences list */}
                    {task.evidences.length > 0 && (
                      <div className="rounded-lg bg-white border border-slate-200 p-2 space-y-1">
                        <span className="font-bold text-slate-700 text-[10px] uppercase">
                          Evidencias Enviadas ({task.evidences.length}):
                        </span>
                        {task.evidences.map((ev) => (
                          <div key={ev.id} className="flex items-center justify-between text-[11px]">
                            <span className="truncate max-w-[200px] text-slate-700">{ev.fileName}</span>
                            <a
                              href={ev.driveUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-0.5 text-[10px]"
                            >
                              Ver Drive <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}

                    {task.auditNotes && (
                      <div className="rounded-lg bg-purple-50 border border-purple-200 p-2 text-[11px]">
                        <span className="font-bold text-purple-900">Nota del Auditor: </span>
                        <span className="text-purple-950">{task.auditNotes}</span>
                      </div>
                    )}
                  </div>

                  {task.status !== 'cumplido' && (
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setShowEvidenceModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Radicar Evidencias de Cumplimiento
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Subir Evidencias */}
      {showEvidenceModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Radicar Evidencias
              </h3>
              <button
                onClick={() => setShowEvidenceModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitEvidence} className="space-y-3.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-400">Compromiso:</span>
                <p className="font-semibold text-slate-800 mt-0.5">{selectedTask.title}</p>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Nombre descriptivo del archivo
                </label>
                <input
                  type="text"
                  required
                  value={evidenceFileName}
                  onChange={(e) => setEvidenceFileName(e.target.value)}
                  placeholder="Ej. Informe_Tecnico_Concepto_Industrial.pdf"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Enlace de Google Drive / Repositorio Compartido
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
                  Descripción o Justificación de la Entrega
                </label>
                <textarea
                  rows={3}
                  required
                  value={evidenceDesc}
                  onChange={(e) => setEvidenceDesc(e.target.value)}
                  placeholder="Detalles del informe o evidencia presentada..."
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
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
                >
                  Enviar para Auditoría
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
