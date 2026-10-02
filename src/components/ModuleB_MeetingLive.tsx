import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VoteOption, Motion } from '../types';
import { 
  FileEdit, 
  Vote, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Plus, 
  FolderPlus, 
  Lock, 
  ShieldCheck, 
  ExternalLink,
  Users,
  Check,
  AlertTriangle,
  FileCheck2,
  Clock,
  Sparkles,
  Link as LinkIcon,
  FileDown
} from 'lucide-react';
import { ExportActaPdfModal } from './ExportActaPdfModal';

export const ModuleB_MeetingLive: React.FC = () => {
  const { 
    currentUser, 
    meetings, 
    activeMeetingId, 
    setActiveMeetingId,
    updateAgendaItem, 
    closeMeeting,
    motions, 
    createMotion, 
    castVote, 
    finalizeMotion,
    commitments,
    qualityMappings,
    createCommitment,
    users
  } = useApp();

  const meeting = meetings.find((m) => m.id === activeMeetingId) || meetings.find((m) => m.status === 'en_curso') || meetings[0];
  const [activeTabPointId, setActiveTabPointId] = useState<string>(meeting?.agendaItems[0]?.id || '');
  const [showNewMotionModal, setShowNewMotionModal] = useState(false);
  const [showNewCommitmentModal, setShowNewCommitmentModal] = useState(false);
  const [showCloseActaModal, setShowCloseActaModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [closeNotes, setCloseNotes] = useState('');

  // Active Agenda Item being edited
  const currentItem = meeting?.agendaItems.find((it) => it.id === activeTabPointId) || meeting?.agendaItems[0];

  // Drive Attachment Form State
  const [newDriveName, setNewDriveName] = useState('');
  const [newDriveUrl, setNewDriveUrl] = useState('');
  const [newDriveType, setNewDriveType] = useState<'drive_doc' | 'drive_sheet' | 'drive_slide' | 'drive_folder'>('drive_doc');
  const [showDriveForm, setShowDriveForm] = useState(false);

  // New Motion Form State
  const [motionTitle, setMotionTitle] = useState('');
  const [motionDesc, setMotionDesc] = useState('');
  const [motionMajority, setMotionMajority] = useState<Motion['majorityRequired']>('simple');

  // New Commitment Direct from Act Form State
  const [comTitle, setComTitle] = useState('');
  const [comDesc, setComDesc] = useState('');
  const [comResponsibleId, setComResponsibleId] = useState(users[1]?.id || '');
  const [comDueDate, setComDueDate] = useState('2026-10-25');
  const [comPriority, setComPriority] = useState<'alta' | 'media' | 'baja'>('alta');

  const isPresident = currentUser.role === 'super_admin' || currentUser.role === 'presidente';
  const isMemberOrPresident = currentUser.role === 'super_admin' || currentUser.role === 'presidente' || currentUser.role === 'miembro';

  // Motions for this meeting
  const meetingMotions = motions.filter((mot) => mot.meetingId === meeting?.id);

  if (!meeting) {
    return (
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Módulo B · Minuta Dinámica en Vivo
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Desarrollo de la Reunión & Votación en Vivo
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Redacción de intervenciones, acuerdos resolutivos, anexos en Google Drive y votación de mociones nominales.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-xs">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mx-auto">
            <FileEdit className="h-6 w-6 text-slate-600" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              No hay sesiones del comité convocadas
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              El Presidente del Comité puede programar la primera convocatoria ordinaria o extraordinaria en el <strong>Módulo A (Programación & Orden del Día)</strong> para dar inicio a la redacción y votación en vivo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateCurrentItem = (field: 'agreements' | 'deliberations', value: string) => {
    if (!currentItem) return;
    updateAgendaItem(meeting.id, currentItem.id, { [field]: value });
  };

  const handleAddDriveAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !newDriveName.trim() || !newDriveUrl.trim()) return;

    const updatedAttachments = [
      ...(currentItem.driveAttachments || []),
      {
        name: newDriveName,
        url: newDriveUrl,
        type: newDriveType,
      },
    ];

    updateAgendaItem(meeting.id, currentItem.id, {
      driveAttachments: updatedAttachments,
    });

    setNewDriveName('');
    setNewDriveUrl('');
    setShowDriveForm(false);
  };

  const handleCreateMotionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motionTitle.trim()) return;

    createMotion({
      meetingId: meeting.id,
      agendaItemId: currentItem?.id,
      title: motionTitle,
      description: motionDesc,
      majorityRequired: motionMajority,
    });

    setMotionTitle('');
    setMotionDesc('');
    setShowNewMotionModal(false);
  };

  const handleCreateCommitmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comTitle.trim()) return;

    const respUser = users.find((u) => u.id === comResponsibleId);

    createCommitment({
      meetingId: meeting.id,
      meetingCode: meeting.code,
      agendaItemId: currentItem?.id,
      title: comTitle,
      description: comDesc,
      responsibleId: comResponsibleId,
      responsibleName: respUser ? respUser.name : 'Responsable Asignado',
      responsibleEmail: respUser ? respUser.email : 'responsable@umayor.edu.co',
      isExternalResponsible: respUser?.isExternal || false,
      dueDate: comDueDate,
      priority: comPriority,
    });

    setComTitle('');
    setComDesc('');
    setShowNewCommitmentModal(false);
  };

  const handleConfirmCloseActa = () => {
    closeMeeting(meeting.id, closeNotes);
    setShowCloseActaModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Quorum and Meeting Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Módulo B · Minuta Dinámica en Vivo
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
              {meeting.code}
            </span>
            {meeting.status === 'en_curso' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-ping"></span>
                Sesión en Desarrollo
              </span>
            ) : (
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full capitalize">
                Estado: {meeting.status}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {meeting.title}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>{meeting.date} ({meeting.startTime} - {meeting.endTime})</span>
            <span>·</span>
            <span className="truncate max-w-sm">{meeting.locationOrUrl}</span>
            <span>·</span>
            <span className="font-medium text-slate-700">
              Quórum Verificado: {meeting.attendees.filter(a => a.present).length} / {meeting.attendees.length} miembros presentes
            </span>
          </div>
        </div>

        {/* Meeting Switcher & Finalize Action */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            value={meeting.id}
            onChange={(e) => setActiveMeetingId(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
          >
            {meetings.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} - {m.status}
              </option>
            ))}
          </select>

          {isPresident && meeting.status !== 'cerrada' && (
            <button
              onClick={() => setShowCloseActaModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <FileCheck2 className="h-4 w-4" />
              Cerrar y Firmar Acta
            </button>
          )}

          {meeting.status === 'cerrada' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Acta Cerrada
              </div>
              <button
                onClick={() => setShowPdfModal(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
                title="Generar documento oficial en PDF con firmas y votaciones"
              >
                <FileDown className="h-4 w-4 text-emerald-400" />
                Exportar Acta PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Split: Agenda Points Navigation & Minute Drafting */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Agenda Navigator */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Puntos del Orden del Día ({meeting.agendaItems.length})
            </h2>
            <span className="text-[10px] text-slate-400">Paso a paso</span>
          </div>

          <div className="space-y-1.5">
            {meeting.agendaItems.map((item, idx) => {
              const isSelected = item.id === (currentItem?.id || meeting.agendaItems[0]?.id);
              const hasNotes = !!item.agreements || !!item.deliberations;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTabPointId(item.id)}
                  className={`w-full text-left rounded-xl p-3 border transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-white ring-1 ring-slate-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded text-[10px] font-bold font-mono ${
                        isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-slate-900 line-clamp-1 leading-snug">
                        {item.title}
                      </h4>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                        <span className="truncate">{item.presenter}</span>
                        {hasNotes ? (
                          <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                            <Check className="h-3 w-3" /> Redactado
                          </span>
                        ) : (
                          <span className="text-slate-400">Pendiente</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Commitments Creation from Act */}
          {meeting.status !== 'cerrada' && (
            <div className="pt-2">
              <button
                onClick={() => setShowNewCommitmentModal(true)}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 p-2.5 text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Asignar Compromiso de este Punto
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Minute Editor for Current Agenda Item */}
        <div className="lg:col-span-8 space-y-6">
          {currentItem ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
              {/* Header of Active Item */}
              <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    Punto {meeting.agendaItems.findIndex((it) => it.id === currentItem.id) + 1} de {meeting.agendaItems.length}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {currentItem.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Ponente designado: <strong className="text-slate-700">{currentItem.presenter}</strong> · Tiempo estimado: {currentItem.estimatedMinutes} min
                  </p>
                </div>

                {isPresident && meeting.status !== 'cerrada' && (
                  <button
                    onClick={() => setShowNewMotionModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 transition-colors shadow-xs shrink-0"
                  >
                    <Vote className="h-3.5 w-3.5" />
                    Formular Moción
                  </button>
                )}
              </div>

              {/* Textarea: Deliberations & Discussion */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileEdit className="h-3.5 w-3.5 text-slate-500" />
                    Deliberaciones e Intervenciones Principales
                  </label>
                  {!isPresident && meeting.status !== 'cerrada' && (
                    <span className="text-[10px] text-slate-400">Modo lectura (redacta el Presidente)</span>
                  )}
                </div>
                <textarea
                  rows={4}
                  disabled={!isPresident || meeting.status === 'cerrada'}
                  value={currentItem.deliberations || ''}
                  onChange={(e) => handleUpdateCurrentItem('deliberations', e.target.value)}
                  placeholder={
                    isPresident
                      ? 'Consigne aquí las intervenciones relevantes de los miembros, sustentos conceptuales y posturas debatidas...'
                      : 'Sin deliberaciones registradas todavía.'
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-600"
                />
              </div>

              {/* Textarea: Formal Agreements & Resolutions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Acuerdos y Decisiones Aprobadas
                  </label>
                  <span className="text-[10px] text-slate-400">Texto vinculante del acta oficial</span>
                </div>
                <textarea
                  rows={3}
                  disabled={!isPresident || meeting.status === 'cerrada'}
                  value={currentItem.agreements || ''}
                  onChange={(e) => handleUpdateCurrentItem('agreements', e.target.value)}
                  placeholder={
                    isPresident
                      ? 'Redacte el texto exacto del acuerdo, modificaciones aprobadas o resoluciones adoptadas...'
                      : 'Sin acuerdos registrados aún.'
                  }
                  className="w-full rounded-lg border border-emerald-200/80 bg-emerald-50/20 p-3 text-xs leading-relaxed text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 disabled:bg-slate-50"
                />
              </div>

              {/* Google Drive Attachments Section */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <LinkIcon className="h-3.5 w-3.5 text-blue-600" />
                    Documentos & Evidencias en Google Drive ({currentItem.driveAttachments?.length || 0})
                  </h4>
                  {isPresident && meeting.status !== 'cerrada' && (
                    <button
                      onClick={() => setShowDriveForm(!showDriveForm)}
                      className="text-xs text-blue-600 font-medium hover:text-blue-800 transition-colors flex items-center gap-1"
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                      {showDriveForm ? 'Cancelar' : '+ Vincular Enlace Drive'}
                    </button>
                  )}
                </div>

                {/* Form to attach a Google Drive link */}
                {showDriveForm && (
                  <form onSubmit={handleAddDriveAttachment} className="rounded-xl border border-blue-200 bg-blue-50/40 p-3 space-y-2.5 text-xs">
                    <p className="text-[11px] font-semibold text-blue-900">
                      Vincular Presentación, Carpeta o Documento de Google Workspace
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        value={newDriveName}
                        onChange={(e) => setNewDriveName(e.target.value)}
                        placeholder="Nombre descriptivo (ej. Microcurrículo_2026.docx)"
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs"
                      />
                      <select
                        value={newDriveType}
                        onChange={(e) => setNewDriveType(e.target.value as any)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs"
                      >
                        <option value="drive_doc">Documento (Google Docs / Word)</option>
                        <option value="drive_sheet">Hoja de Cálculo (Google Sheets / Excel)</option>
                        <option value="drive_slide">Presentación (Google Slides / PPTX)</option>
                        <option value="drive_folder">Carpeta Compartida de Evidencias</option>
                      </select>
                    </div>
                    <input
                      type="url"
                      required
                      value={newDriveUrl}
                      onChange={(e) => setNewDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="rounded-lg bg-blue-700 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-800"
                      >
                        Guardar Adjunto
                      </button>
                    </div>
                  </form>
                )}

                {/* List of Attachments */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(!currentItem.driveAttachments || currentItem.driveAttachments.length === 0) ? (
                    <p className="text-xs text-slate-400 italic py-1">
                      No hay archivos de Google Drive adjuntos a este punto.
                    </p>
                  ) : (
                    currentItem.driveAttachments.map((att, i) => (
                      <a
                        key={i}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs hover:border-slate-300 hover:bg-slate-100 transition-colors group"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[10px] font-bold text-blue-700 uppercase bg-blue-100 px-1.5 py-0.5 rounded">
                            {att.type.replace('drive_', '')}
                          </span>
                          <span className="font-medium text-slate-800 truncate">
                            {att.name}
                          </span>
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-400">
              Seleccione un punto del orden del día para redactar la minuta.
            </div>
          )}

          {/* Real-Time Motions & Voting System Module */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Vote className="h-4 w-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Módulo de Mociones & Votación en Tiempo Real ({meetingMotions.length})
                </h3>
              </div>
              {isPresident && meeting.status !== 'cerrada' && (
                <button
                  onClick={() => setShowNewMotionModal(true)}
                  className="inline-flex items-center gap-1 text-xs text-amber-700 font-semibold hover:text-amber-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Nueva Moción de Votación
                </button>
              )}
            </div>

            {meetingMotions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No hay mociones registradas para esta sesión del comité.
              </div>
            ) : (
              <div className="space-y-4">
                {meetingMotions.map((motion) => {
                  const userVote = motion.votes[currentUser.id];
                  const hasVoted = !!userVote;
                  const canVote = isMemberOrPresident && motion.status === 'abierta';
                  const totalVotes = Object.keys(motion.votes).length;
                  const res = motion.result || { aFavor: 0, enContra: 0, abstencion: 0, approved: false };

                  return (
                    <div
                      key={motion.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {motion.title}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                motion.status === 'abierta'
                                  ? 'bg-amber-100 text-amber-800 animate-pulse'
                                  : motion.status === 'aprobada'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {motion.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Formulada por {motion.proposedBy} · Mayoría exigida:{' '}
                            <strong className="capitalize">{motion.majorityRequired.replace(/_/g, ' ')}</strong>
                          </p>
                        </div>

                        {isPresident && motion.status === 'abierta' && (
                          <button
                            onClick={() => finalizeMotion(motion.id)}
                            className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shrink-0"
                          >
                            Cerrar y Computar Votación
                          </button>
                        )}
                      </div>

                      <p className="text-slate-700 leading-relaxed text-xs">
                        {motion.description}
                      </p>

                      {/* Vote Cast Actions for Committee Member */}
                      {motion.status === 'abierta' && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-amber-950">
                              Su Voto Personal:
                            </span>
                            {hasVoted ? (
                              <span className="font-semibold text-emerald-800 flex items-center gap-1">
                                <Check className="h-3 w-3" /> Voto Registrado ({userVote.option.replace('_', ' ')})
                              </span>
                            ) : (
                              <span className="text-amber-800 italic">Votación en curso</span>
                            )}
                          </div>

                          {canVote ? (
                            <div className="grid grid-cols-3 gap-2 pt-1">
                              <button
                                onClick={() => castVote(motion.id, 'a_favor')}
                                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 font-semibold transition-all ${
                                  userVote?.option === 'a_favor'
                                    ? 'bg-emerald-700 text-white shadow-xs'
                                    : 'border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50'
                                }`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                A Favor
                              </button>
                              <button
                                onClick={() => castVote(motion.id, 'en_contra')}
                                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 font-semibold transition-all ${
                                  userVote?.option === 'en_contra'
                                    ? 'bg-rose-700 text-white shadow-xs'
                                    : 'border border-rose-300 bg-white text-rose-800 hover:bg-rose-50'
                                }`}
                              >
                                <XCircle className="h-4 w-4" />
                                En Contra
                              </button>
                              <button
                                onClick={() => castVote(motion.id, 'abstencion')}
                                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 font-semibold transition-all ${
                                  userVote?.option === 'abstencion'
                                    ? 'bg-slate-700 text-white shadow-xs'
                                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                                }`}
                              >
                                <MinusCircle className="h-4 w-4" />
                                Abstención
                              </button>
                            </div>
                          ) : (
                            <div className="text-[11px] text-slate-500 italic">
                              Su rol actual ({currentUser.roleLabel}) no tiene facultad de voto nominal en este comité.
                            </div>
                          )}
                        </div>
                      )}

                      {/* Live Tally and Quorum Bar */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] font-medium text-slate-600">
                          <span>
                            Cómputo en Vivo ({totalVotes} votos emitidos de 4 miembros habilitados)
                          </span>
                          <span className="font-mono font-bold">
                            Quórum: {Math.min(Math.round((totalVotes / 4) * 100), 100)}%
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden flex">
                          <div
                            style={{ width: `${totalVotes > 0 ? (res.aFavor / totalVotes) * 100 : 0}%` }}
                            className="bg-emerald-600 transition-all duration-300"
                            title={`A Favor: ${res.aFavor}`}
                          />
                          <div
                            style={{ width: `${totalVotes > 0 ? (res.enContra / totalVotes) * 100 : 0}%` }}
                            className="bg-rose-500 transition-all duration-300"
                            title={`En Contra: ${res.enContra}`}
                          />
                          <div
                            style={{ width: `${totalVotes > 0 ? (res.abstencion / totalVotes) * 100 : 0}%` }}
                            className="bg-slate-400 transition-all duration-300"
                            title={`Abstención: ${res.abstencion}`}
                          />
                        </div>

                        {/* Numerical Breakdown */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <div className="flex items-center gap-3">
                            <span className="text-emerald-700 font-semibold">
                              ✓ A Favor: {res.aFavor}
                            </span>
                            <span className="text-rose-700 font-semibold">
                              ✕ En Contra: {res.enContra}
                            </span>
                            <span className="text-slate-600 font-semibold">
                              ― Abstención: {res.abstencion}
                            </span>
                          </div>

                          {motion.status !== 'abierta' && (
                            <span
                              className={`font-bold ${
                                res.approved ? 'text-emerald-700' : 'text-rose-700'
                              }`}
                            >
                              Dictamen Oficial: {res.approved ? 'MOCIÓN APROBADA' : 'MOCIÓN RECHAZADA'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Individual Member Votes Registry */}
                      <div className="pt-2 border-t border-slate-200/50">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Registro Nominal de Votantes:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.values(motion.votes).map((v) => (
                            <span
                              key={v.userId}
                              className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200"
                            >
                              <span>{v.userName.split(' ')[0]} {v.userName.split(' ')[1]}</span>
                              <strong
                                className={`uppercase text-[9px] ${
                                  v.option === 'a_favor'
                                    ? 'text-emerald-700'
                                    : v.option === 'en_contra'
                                    ? 'text-rose-700'
                                    : 'text-slate-500'
                                }`}
                              >
                                ({v.option.replace('_', ' ')})
                              </strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Formular Nueva Moción */}
      {showNewMotionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Formular Moción de Votación
              </h3>
              <button
                onClick={() => setShowNewMotionModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMotionSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Punto Vinculado del Orden del Día
                </label>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-800">
                  {currentItem?.title || 'Punto General'}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Título de la Moción
                </label>
                <input
                  type="text"
                  required
                  value={motionTitle}
                  onChange={(e) => setMotionTitle(e.target.value)}
                  placeholder="Ej. Aprobación de la modificación del requisito de grado en bilingüismo"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Tipo de Mayoría Requerida según Estatuto
                </label>
                <select
                  value={motionMajority}
                  onChange={(e) => setMotionMajority(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                >
                  <option value="simple">Mayoría Simple (Mitad más uno de los votos emitidos)</option>
                  <option value="cualificada_dos_tercios">Mayoría Cualificada (2/3 de los votos emitidos)</option>
                  <option value="unanime">Unanimidad (100% de votos favorables)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Texto Resolutivo / Descripción de la Decisión
                </label>
                <textarea
                  rows={3}
                  required
                  value={motionDesc}
                  onChange={(e) => setMotionDesc(e.target.value)}
                  placeholder="Escriba los términos precisos que se someten a la decisión del comité..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewMotionModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 shadow-xs"
                >
                  Abrir Votación Inmediata
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Asignar Compromiso Directo */}
      {showNewCommitmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Asignar Compromiso de la Sesión
              </h3>
              <button
                onClick={() => setShowNewCommitmentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCommitmentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Título del Compromiso / Tarea
                </label>
                <input
                  type="text"
                  required
                  value={comTitle}
                  onChange={(e) => setComTitle(e.target.value)}
                  placeholder="Ej. Redactar borrador del syllabus con bibliografía en inglés"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Responsable Asignado
                  </label>
                  <select
                    value={comResponsibleId}
                    onChange={(e) => setComResponsibleId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.roleLabel})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Fecha Límite de Entrega
                  </label>
                  <input
                    type="date"
                    required
                    value={comDueDate}
                    onChange={(e) => setComDueDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Prioridad Institucional
                </label>
                <select
                  value={comPriority}
                  onChange={(e) => setComPriority(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                >
                  <option value="alta">Alta (Crítica para Acreditación)</option>
                  <option value="media">Media (Gestión Ordinaria)</option>
                  <option value="baja">Baja (Informativa)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Descripción Detallada de la Evidencia Esperada
                </label>
                <textarea
                  rows={2}
                  required
                  value={comDesc}
                  onChange={(e) => setComDesc(e.target.value)}
                  placeholder="Detallar entregables, formatos o requerimientos de calidad..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewCommitmentModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
                >
                  Asignar y Notificar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Cierre Oficial de Acta */}
      {showCloseActaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Cierre y Firma Oficial del Acta {meeting.code}
                </h3>
                <p className="text-xs text-slate-500">
                  Facultad exclusiva de la Presidencia del Comité
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Al formalizar el cierre de esta sesión:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Se congelará la edición de deliberaciones y acuerdos del orden del día.</li>
                <li>Se registrará su firma digital institucional con token de trazabilidad.</li>
                <li>
                  <strong>El acta pasará automáticamente al estado "Cerrada/Finalizada"</strong>, permitiendo al Gestor de Autoevaluación iniciar el mapeo con los factores e indicadores de acreditación CNA/ABET.
                </li>
              </ul>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Observaciones Finales de Cierre (Opcional):
                </label>
                <textarea
                  rows={2}
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  placeholder="Constancia de cierre, hora formal de culminación de la sesión..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCloseActaModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Volver a la Sesión
              </button>
              <button
                onClick={handleConfirmCloseActa}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 shadow-xs flex items-center gap-1.5"
              >
                <ShieldCheck className="h-4 w-4" />
                Proceder con el Cierre y Firma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Exportar Acta Oficial a PDF */}
      {showPdfModal && (
        <ExportActaPdfModal
          meeting={meeting}
          motions={motions}
          commitments={commitments}
          qualityMappings={qualityMappings}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
};
