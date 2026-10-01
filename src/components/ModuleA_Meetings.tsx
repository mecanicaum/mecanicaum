import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Meeting, MeetingType } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Send, 
  Users, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Play,
  Mail,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  FileDown
} from 'lucide-react';
import { ExportActaPdfModal } from './ExportActaPdfModal';

interface ModuleAProps {
  onGoToLiveMeeting: (meetingId: string) => void;
}

export const ModuleA_Meetings: React.FC<ModuleAProps> = ({ onGoToLiveMeeting }) => {
  const { 
    currentUser, 
    meetings, 
    createMeeting, 
    addAgendaItem, 
    deleteAgendaItem,
    sendCitations,
    motions,
    commitments,
    qualityMappings,
    users 
  } = useApp();

  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');
  const [showNewMeetingModal, setShowNewMeetingModal] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [citationSentSuccess, setCitationSentSuccess] = useState(false);

  // New Meeting Form State
  const [newMeetingCode, setNewMeetingCode] = useState(`ACTA-CC-2026-00${meetings.length + 3}`);
  const [newMeetingType, setNewMeetingType] = useState<MeetingType>('ordinaria');
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingDate, setNewMeetingDate] = useState('2026-10-22');
  const [newMeetingStartTime, setNewMeetingStartTime] = useState('08:00');
  const [newMeetingEndTime, setNewMeetingEndTime] = useState('11:00');
  const [newMeetingModality, setNewMeetingModality] = useState<'presencial' | 'virtual' | 'hibrida'>('hibrida');
  const [newMeetingLocation, setNewMeetingLocation] = useState('Sala de Consejos Bloque 5 / Google Meet institucional');
  const [newMeetingObservations, setNewMeetingObservations] = useState('');

  // Add Item to Agenda State
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemPresenter, setNewItemPresenter] = useState(currentUser.name);
  const [newItemMinutes, setNewItemMinutes] = useState(25);

  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId) || meetings[0];
  const isPresident = currentUser.role === 'presidente';

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingTitle.trim()) return;

    const attendees = users.map((u) => ({
      userId: u.id,
      userName: u.name,
      role: u.roleLabel,
      present: false,
    }));

    const defaultItems = [
      {
        order: 1,
        title: 'Verificación del Quórum e Instalación de la Sesión',
        description: 'Constatación reglamentaria de los miembros acreditados.',
        presenter: currentUser.name,
        estimatedMinutes: 10,
      },
      {
        order: 2,
        title: 'Lectura y Aprobación del Orden del Día',
        description: 'Consideración de los puntos propuestos para la sesión.',
        presenter: currentUser.name,
        estimatedMinutes: 10,
      },
    ];

    const created = await createMeeting({
      code: newMeetingCode,
      type: newMeetingType,
      title: newMeetingTitle,
      date: newMeetingDate,
      startTime: newMeetingStartTime,
      endTime: newMeetingEndTime,
      modality: newMeetingModality,
      locationOrUrl: newMeetingLocation,
      status: 'programada',
      attendees,
      agendaItems: defaultItems.map((it, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        ...it,
        agreements: '',
        deliberations: '',
        driveAttachments: [],
      })),
      generalObservations: newMeetingObservations,
    });

    setShowNewMeetingModal(false);
    setSelectedMeetingId(created.id);
  };

  const handleAddAgendaItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !selectedMeeting) return;

    addAgendaItem(selectedMeeting.id, {
      order: selectedMeeting.agendaItems.length + 1,
      title: newItemTitle,
      description: newItemDescription,
      presenter: newItemPresenter,
      estimatedMinutes: Number(newItemMinutes) || 20,
    });

    setNewItemTitle('');
    setNewItemDescription('');
  };

  const handleSendCitations = () => {
    if (!selectedMeeting) return;
    const recipientEmails = users.map((u) => u.email);
    sendCitations(selectedMeeting.id, recipientEmails, 'Favor confirmar asistencia con 24 horas de antelación.');
    setCitationSentSuccess(true);
    setTimeout(() => {
      setCitationSentSuccess(false);
      setShowCitationModal(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Módulo A · Gestión Institucional
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Programación de Reuniones & Orden del Día
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Convocatoria a comités ordinarios y extraordinarios, estructuración paso a paso de puntos del orden del día y despacho de citaciones oficiales con integración a correo universitario.
          </p>
        </div>

        {isPresident ? (
          <button
            onClick={() => setShowNewMeetingModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nueva Convocatoria
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg shrink-0">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
            <span>Solo el Presidente puede programar comités</span>
          </div>
        )}
      </div>

      {/* Main Grid: Meeting List & Detail/Agenda View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: List of Meetings */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Convocatorias Registradas ({meetings.length})
            </h2>
            <span className="text-[11px] text-slate-400">Año Académico 2026</span>
          </div>

          <div className="space-y-2">
            {meetings.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-400 space-y-2">
                <Calendar className="h-6 w-6 text-slate-400 mx-auto" />
                <p className="font-medium text-slate-600">No hay convocatorias registradas</p>
                <p className="text-[11px] text-slate-400">
                  Comience programando la primera sesión oficial del Comité Curricular.
                </p>
              </div>
            ) : (
              meetings.map((meeting) => {
                const isSelected = meeting.id === selectedMeeting?.id;
                const statusBadges = {
                  programada: 'bg-blue-50 text-blue-700 border-blue-200',
                  en_curso: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse',
                  cerrada: 'bg-slate-100 text-slate-700 border-slate-200',
                };

                return (
                  <div
                    key={meeting.id}
                    onClick={() => setSelectedMeetingId(meeting.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all text-left ${
                      isSelected
                        ? 'border-slate-900 bg-white ring-1 ring-slate-900 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {meeting.code}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${statusBadges[meeting.status]}`}>
                          {meeting.status === 'en_curso' ? 'En Curso' : meeting.status}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {meeting.type}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xs font-semibold text-slate-900 mt-2 line-clamp-2">
                      {meeting.title}
                    </h3>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                        <span>{meeting.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                        <span>{meeting.startTime} - {meeting.endTime}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-1.5 truncate">
                        <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                        <span className="truncate">{meeting.locationOrUrl}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-medium text-slate-700">
                        {meeting.agendaItems.length} puntos en orden del día
                      </span>
                      <span className="flex items-center gap-1 text-slate-700 font-medium">
                        Ver detalles <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Meeting Details & Agenda Editor */}
        {selectedMeeting ? (
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-6">
            {/* Header of Selected Meeting */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {selectedMeeting.code}
                  </span>
                  <span className="text-xs font-semibold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Reunión {selectedMeeting.type}
                  </span>
                  {selectedMeeting.status === 'en_curso' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Sesión Activa
                    </span>
                  )}
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  {selectedMeeting.title}
                </h2>
                <div className="mt-2 flex flex-wrap gap-y-1 gap-x-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" /> {selectedMeeting.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-400" /> {selectedMeeting.startTime} - {selectedMeeting.endTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> {selectedMeeting.locationOrUrl}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowCitationModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  title="Emitir citación oficial por correo electrónico"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  Citación Oficial
                </button>

                {selectedMeeting.status === 'cerrada' && (
                  <button
                    onClick={() => setShowPdfModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
                    title="Exportar Acta Oficial a PDF"
                  >
                    <FileDown className="h-3.5 w-3.5 text-emerald-400" />
                    Exportar Acta PDF
                  </button>
                )}

                {selectedMeeting.status !== 'cerrada' && (
                  <button
                    onClick={() => onGoToLiveMeeting(selectedMeeting.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 transition-colors shadow-xs"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Ir a Sesión en Vivo
                  </button>
                )}
              </div>
            </div>

            {/* Agenda Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  Orden del Día Propuesto ({selectedMeeting.agendaItems.length} puntos)
                </h3>
                <span className="text-[11px] text-slate-500 font-mono">
                  Duración Estimada: {selectedMeeting.agendaItems.reduce((acc, it) => acc + (it.estimatedMinutes || 0), 0)} min
                </span>
              </div>

              <div className="space-y-2">
                {selectedMeeting.agendaItems.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
                    No se han configurado puntos para el orden del día.
                  </div>
                ) : (
                  selectedMeeting.agendaItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 text-xs space-y-1.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-200 text-[10px] font-bold text-slate-700 font-mono">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-semibold text-slate-900 leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-500">
                          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                            {item.estimatedMinutes} min
                          </span>
                          {isPresident && selectedMeeting.status !== 'cerrada' && (
                            <button
                              onClick={() => deleteAgendaItem(selectedMeeting.id, item.id)}
                              className="text-slate-400 hover:text-rose-600 transition-colors"
                              title="Eliminar punto"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/50">
                        <span>Ponente: <strong className="text-slate-700">{item.presenter}</strong></span>
                        {item.agreements && (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Con acuerdos registrados
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Add Agenda Item Form (Available for Presidente) */}
            {isPresident && selectedMeeting.status !== 'cerrada' && (
              <form onSubmit={handleAddAgendaItem} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  + Agregar Punto al Orden del Día
                </h4>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Título del Punto o Asunto a Tratar
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="Ej. Revisión y aprobación de la electiva de Robótica Móvil"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Ponente / Responsable de la Sustentación
                    </label>
                    <select
                      value={newItemPresenter}
                      onChange={(e) => setNewItemPresenter(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.roleLabel})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Tiempo (minutos)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={newItemMinutes}
                      onChange={(e) => setNewItemMinutes(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Descripción o Documentos de Referencia
                  </label>
                  <textarea
                    rows={2}
                    value={newItemDescription}
                    onChange={(e) => setNewItemDescription(e.target.value)}
                    placeholder="Detalles de la sustentación, enlaces a documentos de consulta en Google Drive..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
                  >
                    Guardar Punto
                  </button>
                </div>
              </form>
            )}

            {/* List of Convened Attendees */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-slate-500" />
                Miembros Convocados & Citaciones ({users.length} integrantes)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                    </div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0 ml-2">
                      {u.role.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 mx-auto">
              <Calendar className="h-6 w-6 text-slate-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Sin Convocatoria Seleccionada</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {isPresident
                ? 'Haga clic en "+ Nueva Convocatoria" para programar la próxima reunión del Comité Curricular y estructurar el orden del día.'
                : 'Aún no se han publicado convocatorias para el Comité Curricular.'}
            </p>
            {isPresident && (
              <button
                onClick={() => setShowNewMeetingModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
              >
                <Plus className="h-4 w-4" />
                Programar Primera Convocatoria
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal: Nueva Convocatoria */}
      {showNewMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Programar Nueva Convocatoria
                </h3>
                <p className="text-xs text-slate-500">
                  Comité Curricular · Facultad de Ingeniería Mecánica
                </p>
              </div>
              <button
                onClick={() => setShowNewMeetingModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Código de Convocatoria / Acta
                  </label>
                  <input
                    type="text"
                    required
                    value={newMeetingCode}
                    onChange={(e) => setNewMeetingCode(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Tipo de Sesión
                  </label>
                  <select
                    value={newMeetingType}
                    onChange={(e) => setNewMeetingType(e.target.value as MeetingType)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  >
                    <option value="ordinaria">Sesión Ordinaria</option>
                    <option value="extraordinaria">Sesión Extraordinaria</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Título de la Convocatoria
                </label>
                <input
                  type="text"
                  required
                  value={newMeetingTitle}
                  onChange={(e) => setNewMeetingTitle(e.target.value)}
                  placeholder="Ej. Sesión Ordinaria - Plan de Mejoramiento CNA y Ajuste de Laboratorios"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={newMeetingDate}
                    onChange={(e) => setNewMeetingDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Hora Inicio
                  </label>
                  <input
                    type="time"
                    required
                    value={newMeetingStartTime}
                    onChange={(e) => setNewMeetingStartTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Hora Estimada Fin
                  </label>
                  <input
                    type="time"
                    required
                    value={newMeetingEndTime}
                    onChange={(e) => setNewMeetingEndTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Modalidad
                  </label>
                  <select
                    value={newMeetingModality}
                    onChange={(e) => setNewMeetingModality(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  >
                    <option value="hibrida">Híbrida</option>
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Ubicación Física o Enlace Virtual (Meet/Teams)
                  </label>
                  <input
                    type="text"
                    required
                    value={newMeetingLocation}
                    onChange={(e) => setNewMeetingLocation(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Observaciones Generales / Recomendaciones de Preparación
                </label>
                <textarea
                  rows={2}
                  value={newMeetingObservations}
                  onChange={(e) => setNewMeetingObservations(e.target.value)}
                  placeholder="Instrucciones para los integrantes previo a la deliberación..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewMeetingModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
                >
                  Crear y Convocar Reunión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Citación Oficial por Correo Institucional */}
      {showCitationModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Despacho de Citación Institucional
                  </h3>
                  <p className="text-xs text-slate-500">
                    Integración con Google Workspace & Correo Institucional
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCitationModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {citationSentSuccess ? (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-2">
                <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">
                  Citaciones Despachadas con Éxito
                </h4>
                <p className="text-xs text-emerald-700">
                  Se remitieron los correos formales a los {users.length} miembros e invitados registrados con calendario ICS adjunto.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2.5 font-sans">
                  <div className="flex justify-between border-b border-slate-200/70 pb-2">
                    <span className="text-slate-500 font-medium">De:</span>
                    <span className="font-mono text-slate-800">{currentUser.email}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/70 pb-2">
                    <span className="text-slate-500 font-medium">Para:</span>
                    <span className="text-slate-800 text-right truncate max-w-xs">
                      {users.length} integrantes del Comité Curricular
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200/70 pb-2">
                    <span className="text-slate-500 font-medium">Asunto:</span>
                    <span className="font-semibold text-slate-900">
                      [Comité Curricular] Citación {selectedMeeting.type.toUpperCase()}: {selectedMeeting.code}
                    </span>
                  </div>

                  <div className="pt-2 text-slate-700 space-y-2 text-[11px] leading-relaxed">
                    <p>Estimados integrantes del Comité Curricular de Ingeniería Mecánica,</p>
                    <p>
                      Por medio de la presente, la Presidencia del Comité se permite convocarles formalmente a la sesión{' '}
                      <strong>{selectedMeeting.type}</strong>:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-slate-800">
                      <li><strong>Fecha:</strong> {selectedMeeting.date} ({selectedMeeting.startTime} a {selectedMeeting.endTime})</li>
                      <li><strong>Lugar / Enlace:</strong> {selectedMeeting.locationOrUrl}</li>
                      <li><strong>Puntos del Orden del Día:</strong> {selectedMeeting.agendaItems.length} puntos programados.</li>
                    </ul>
                    <p>Se solicita puntualidad para verificar el quórum reglamentario.</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCitationModal(false)}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={handleSendCitations}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Enviar Citaciones Ahora
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Exportar Acta Oficial a PDF */}
      {showPdfModal && selectedMeeting && (
        <ExportActaPdfModal
          meeting={selectedMeeting}
          motions={motions}
          commitments={commitments}
          qualityMappings={qualityMappings}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
};
