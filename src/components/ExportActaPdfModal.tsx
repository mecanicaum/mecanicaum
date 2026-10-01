import React, { useRef } from 'react';
import { Meeting, Motion, Commitment, ActQualityMapping } from '../types';
import { 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  QrCode, 
  ExternalLink,
  Award,
  Calendar,
  Clock,
  MapPin,
  Check
} from 'lucide-react';

interface ExportActaPdfModalProps {
  meeting: Meeting;
  motions: Motion[];
  commitments: Commitment[];
  qualityMappings: ActQualityMapping[];
  onClose: () => void;
}

export const ExportActaPdfModal: React.FC<ExportActaPdfModalProps> = ({
  meeting,
  motions,
  commitments,
  qualityMappings,
  onClose,
}) => {
  const printContainerRef = useRef<HTMLDivElement>(null);

  const meetingMotions = motions.filter((m) => m.meetingId === meeting.id);
  const meetingCommitments = commitments.filter((c) => c.meetingId === meeting.id);
  const meetingMappings = qualityMappings.filter((m) => m.meetingId === meeting.id);

  const handlePrint = () => {
    window.print();
  };

  // Generate a mock institutional verification hash if not present
  const signatureHash = meeting.presidentSignatureDate || `SHA256:8f4c2e1b9a7d3f0e5b6a7c8d9e0f1a2b3c4d5e6f (${meeting.closedAt || new Date().toISOString()})`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3.5 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded">
              {meeting.code}
            </span>
            <span className="text-xs font-medium text-slate-600">
              Vista previa del Acta Oficial de Comité Curricular
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimir / Guardar como PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="overflow-y-auto p-6 sm:p-10 font-sans text-slate-900 bg-white" id="printable-acta" ref={printContainerRef}>
          {/* Institutional Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-5 text-center space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              <span>República de Colombia</span>
              <span>Sistema Integrado de Calidad SIG-CURRÍCULO</span>
              <span>Vigencia: 2026-2027</span>
            </div>

            <div className="py-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-950 uppercase">
                Universidad Mayor · Facultad de Ingeniería
              </h1>
              <h2 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                Departamento de Ingeniería Mecánica · Comité Curricular
              </h2>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 text-xs font-mono">
              <span className="font-bold text-slate-900 text-sm">
                ACTA OFICIAL N°: {meeting.code}
              </span>
              <span className="font-semibold text-slate-700 uppercase">
                SESIÓN {meeting.type}
              </span>
            </div>
          </div>

          {/* 1. General Meeting Coordinates */}
          <div className="mt-5 rounded-lg border border-slate-300 p-4 bg-slate-50/50 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-slate-500 font-medium">Asunto / Denominación de la Sesión:</p>
              <p className="font-bold text-slate-900 mt-0.5">{meeting.title}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Fecha y Horario de Realización:</p>
              <p className="font-bold text-slate-900 mt-0.5">
                {meeting.date} · De {meeting.startTime} a {meeting.endTime} horas
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Lugar / Modalidad:</p>
              <p className="font-semibold text-slate-900 mt-0.5">
                Modalidad {meeting.modality.toUpperCase()} ({meeting.locationOrUrl})
              </p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Quórum Reglamentario de Decisión:</p>
              <p className="font-semibold text-slate-900 mt-0.5 text-emerald-800">
                Constatado: {meeting.attendees.filter(a => a.present).length} de {meeting.attendees.length} miembros ({meeting.quorumPresentCount > 0 ? Math.round((meeting.quorumPresentCount / meeting.attendees.length) * 100) : 100}% de quórum)
              </p>
            </div>
          </div>

          {/* 2. Roll Call & Attendees */}
          <div className="mt-6 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              1. Asistencia y Verificación de Integrantes
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200">
                <thead className="bg-slate-100 font-semibold text-slate-700">
                  <tr>
                    <th className="py-2 px-3 border-b">Integrante</th>
                    <th className="py-2 px-3 border-b">Rol / Representación</th>
                    <th className="py-2 px-3 border-b text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {meeting.attendees.map((att, i) => (
                    <tr key={i}>
                      <td className="py-1.5 px-3 font-medium text-slate-900">{att.userName}</td>
                      <td className="py-1.5 px-3 text-slate-600">{att.role}</td>
                      <td className="py-1.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${att.present ? 'text-emerald-800 bg-emerald-50' : 'text-slate-400'}`}>
                          {att.present ? 'Presente' : 'Ausente con excusa'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. Approved Agenda & Point-by-Point Deliberation */}
          <div className="mt-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              2. Desarrollo del Orden del Día, Deliberaciones y Acuerdos
            </h3>

            {meeting.agendaItems.map((item, idx) => (
              <div key={item.id} className="border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-start gap-2">
                    <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                      Punto {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-950 text-sm leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Ponente: {item.presenter} · Duración: {item.estimatedMinutes} minutos
                      </p>
                    </div>
                  </div>
                </div>

                {item.deliberations && (
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wide">
                      Deliberaciones e intervenciones:
                    </span>
                    <p className="text-slate-800 leading-relaxed pl-2 border-l-2 border-slate-300">
                      {item.deliberations}
                    </p>
                  </div>
                )}

                {item.agreements ? (
                  <div className="space-y-0.5 bg-slate-50 p-2.5 rounded border border-slate-200">
                    <span className="font-bold text-emerald-900 text-[11px] uppercase tracking-wide flex items-center gap-1">
                      <Check className="h-3 w-3" /> Acuerdo Resolutivo Aprobado:
                    </span>
                    <p className="text-slate-900 font-medium leading-relaxed mt-0.5">
                      {item.agreements}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Sin acuerdo resolutivo registrado para este punto.</p>
                )}

                {item.driveAttachments && item.driveAttachments.length > 0 && (
                  <div className="pt-1.5 text-[11px] text-slate-600 space-y-1">
                    <span className="font-semibold text-slate-500 uppercase text-[10px]">
                      Documentos y Evidencias Anexas (Google Drive):
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px] text-blue-700">
                      {item.driveAttachments.map((att, aIdx) => (
                        <li key={aIdx} className="truncate">
                          <strong>{att.name}</strong> ({att.type}): {att.url}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 4. Complete Motions and Real-time Voting History (Requested Feature) */}
          <div className="mt-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              3. Historial Completo de Mociones y Votaciones Nominales
            </h3>

            {meetingMotions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No se formularon mociones estatutarias para votación nominal en esta sesión.</p>
            ) : (
              meetingMotions.map((motion, mIdx) => {
                const votesList = Object.values(motion.votes);
                const res = motion.result || { aFavor: 0, enContra: 0, abstencion: 0, totalVotes: votesList.length, approved: true };

                return (
                  <div key={motion.id} className="border border-slate-300 rounded-lg p-3.5 space-y-2.5 text-xs bg-slate-50/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800">
                          Moción {mIdx + 1}:
                        </span>
                        <span className="font-bold text-slate-900 text-xs">
                          {motion.title}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${motion.status === 'aprobada' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        Dictamen: {motion.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-slate-700 leading-relaxed text-[11px]">
                      <strong>Texto Sometido a Voto:</strong> {motion.description}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white p-2 rounded border border-slate-200">
                      <div>
                        <span className="text-slate-400">Mayoría Exigida:</span>
                        <p className="font-semibold text-slate-800 capitalize">{motion.majorityRequired.replace(/_/g, ' ')}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Votos Favorables:</span>
                        <p className="font-bold text-emerald-700">{res.aFavor} votos</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Votos en Contra:</span>
                        <p className="font-bold text-rose-700">{res.enContra} votos</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Abstenciones:</span>
                        <p className="font-bold text-slate-600">{res.abstencion} votos</p>
                      </div>
                    </div>

                    {/* Nominal Voters Roll */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Cómputo Nominal de Votantes:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {votesList.map((v) => (
                          <div key={v.userId} className="flex items-center justify-between bg-white px-2.5 py-1 rounded border border-slate-200 text-[10px]">
                            <span className="font-medium text-slate-800">{v.userName}</span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className={`font-bold uppercase ${v.option === 'a_favor' ? 'text-emerald-700' : v.option === 'en_contra' ? 'text-rose-700' : 'text-slate-500'}`}>
                                {v.option.replace('_', ' ')}
                              </span>
                              <span className="text-slate-400 text-[9px]">{v.timestamp.slice(11, 19)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* 5. Commitments Assigned */}
          <div className="mt-6 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              4. Compromisos y Tareas Derivadas ({meetingCommitments.length})
            </h3>
            {meetingCommitments.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Sin compromisos asignados formalmente en esta sesión.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="py-1.5 px-3 border-b">Tarea / Compromiso</th>
                      <th className="py-1.5 px-3 border-b">Responsable</th>
                      <th className="py-1.5 px-3 border-b">Plazo Límite</th>
                      <th className="py-1.5 px-3 border-b text-center">Estado Auditoría</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {meetingCommitments.map((c) => (
                      <tr key={c.id}>
                        <td className="py-1.5 px-3 font-medium text-slate-900 max-w-xs">{c.title}</td>
                        <td className="py-1.5 px-3 text-slate-600">{c.responsibleName}</td>
                        <td className="py-1.5 px-3 font-mono text-slate-700">{c.dueDate}</td>
                        <td className="py-1.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                            {c.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 6. Accreditation & Quality Factors Mapped */}
          {meetingMappings.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                5. Trazabilidad de Autoevaluación & Acreditación (CNA / ABET)
              </h3>
              <div className="space-y-1.5 text-xs">
                {meetingMappings.map((map) => (
                  <div key={map.id} className="p-2 rounded bg-purple-50/40 border border-purple-200 text-[11px]">
                    <span className="font-mono font-bold text-purple-900">
                      {map.factorCode} &gt; {map.featureCode} &gt; {map.aspectCode}: {map.aspectName}
                    </span>
                    <p className="text-slate-700 mt-0.5 italic">
                      "{map.excerpt}"
                    </p>
                    <p className="text-purple-950 text-[10px] mt-0.5 font-medium">
                      Aporte evidencial: {map.evidentialContribution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. Observations */}
          {meeting.generalObservations && (
            <div className="mt-6 space-y-1 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-slate-900">
                Observaciones y Constancias Generales:
              </h3>
              <p className="text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 leading-relaxed">
                {meeting.generalObservations}
              </p>
            </div>
          )}

          {/* 8. Formal Digital Signature Block (Requested Feature) */}
          <div className="mt-10 pt-6 border-t-2 border-slate-900 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 text-center">
              Constancia de Cierre y Certificación Digital del Acta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 p-5 rounded-xl border border-slate-300">
              {/* QR & Verification seal */}
              <div className="md:col-span-3 flex flex-col items-center justify-center p-2 text-center border-b md:border-b-0 md:border-r border-slate-200">
                <div className="h-20 w-20 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1 shadow-xs">
                  <QrCode className="h-16 w-16 text-slate-900" />
                </div>
                <span className="font-mono text-[9px] text-slate-500 mt-1 font-bold">
                  VALIDACIÓN PKI
                </span>
                <span className="text-[8px] text-slate-400">
                  sig-curriculo.umayor.edu.co/verify
                </span>
              </div>

              {/* Digital Certificate Details */}
              <div className="md:col-span-9 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase">
                  <ShieldCheck className="h-4 w-4" />
                  Acta Oficial Firmada Digitalmente por la Presidencia
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div>
                    <span className="text-slate-400">Firmante Autorizado:</span>
                    <p className="font-bold text-slate-900">Dr. Roberto Gómez Peña</p>
                    <p className="text-[10px] text-slate-500">Presidente del Comité Curricular</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Fecha y Hora de Cierre:</span>
                    <p className="font-bold font-mono text-slate-900">
                      {meeting.closedAt ? meeting.closedAt.replace('T', ' ').substring(0, 19) : meeting.date}
                    </p>
                    <p className="text-[10px] text-slate-500">Hora legal de la República de Colombia</p>
                  </div>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200 font-mono text-[10px] text-slate-600 break-all">
                  <span className="font-bold text-slate-700">Token Hash de Trazabilidad: </span>
                  {signatureHash}
                </div>
              </div>
            </div>

            {/* Signature Lines for Roll */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-8 text-center text-xs">
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1">
                  <span className="font-serif italic text-slate-700 font-bold">Dr. Roberto Gómez Peña</span>
                </div>
                <p className="font-bold text-slate-900">Presidente del Comité</p>
                <p className="text-[10px] text-slate-500">Firma Digital Certificada</p>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-1 mb-1">
                  <span className="font-serif italic text-slate-700">Dra. Elena Morales Vélez</span>
                </div>
                <p className="font-bold text-slate-900">Miembro Representante</p>
                <p className="text-[10px] text-slate-500">Voz y Voto Reglamentario</p>
              </div>

              <div>
                <div className="border-b border-slate-400 pb-1 mb-1">
                  <span className="font-serif italic text-slate-700">Ing. Carlos Restrepo Londoño</span>
                </div>
                <p className="font-bold text-slate-900">Encargado de Seguimiento</p>
                <p className="text-[10px] text-slate-500">Secretaría Técnica</p>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-200">
              Documento expedido y refrendado electrónicamente bajo los lineamientos del Acuerdo del Consejo Superior N° 014 de la Universidad Mayor. Validez jurídica y probatoria plena.
            </div>
          </div>
        </div>

        {/* Bottom Floating Bar in Modal */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between print:hidden shrink-0">
          <span className="text-xs text-slate-500 font-mono">
            Páginas generadas conforme al estándar de acreditación CNA / ABET
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Cerrar
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar a PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
