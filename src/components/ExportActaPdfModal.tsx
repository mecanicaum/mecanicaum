import React, { useRef, useState, useEffect } from 'react';
import { Meeting, Motion, Commitment, ActQualityMapping, DigitalActSeal } from '../types';
import { useApp } from '../context/AppContext';
import { getActaVerificationUrl, generateQrCodeDataUrl } from '../utils/cryptoVerification';
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
  Check,
  Search,
  Lock
} from 'lucide-react';

interface ExportActaPdfModalProps {
  meeting: Meeting;
  motions: Motion[];
  commitments: Commitment[];
  qualityMappings: ActQualityMapping[];
  onClose: () => void;
  onOpenVerifier?: (code: string) => void;
}

export const ExportActaPdfModal: React.FC<ExportActaPdfModalProps> = ({
  meeting,
  motions,
  commitments,
  qualityMappings,
  onClose,
  onOpenVerifier,
}) => {
  const { getActSeal, verifyActSeal, currentUser } = useApp();
  const printContainerRef = useRef<HTMLDivElement>(null);
  const [seal, setSeal] = useState<DigitalActSeal | null>(null);
  const [loadingSeal, setLoadingSeal] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [verifyResult, setVerifyResult] = useState<{
    isValid: boolean;
    recomputedHash?: string;
    expectedPkiToken?: string;
    errorReason?: string;
  } | null>(null);

  const verificationUrl = getActaVerificationUrl(meeting.code);

  const meetingMotions = motions.filter((m) => m.meetingId === meeting.id);
  const meetingCommitments = commitments.filter((c) => c.meetingId === meeting.id);
  const meetingMappings = qualityMappings.filter((m) => m.meetingId === meeting.id);

  useEffect(() => {
    let isMounted = true;

    // Generate real scannable QR code
    generateQrCodeDataUrl(verificationUrl).then((url) => {
      if (isMounted) setQrDataUrl(url);
    });

    getActSeal(meeting.id)
      .then((res) => {
        if (isMounted) {
          setSeal(res || null);
          setLoadingSeal(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingSeal(false);
      });

    return () => {
      isMounted = false;
    };
  }, [meeting.id, meeting.code, getActSeal, verificationUrl]);

  const handlePrint = () => {
    window.print();
  };

  const handleVerifyServerIntegrity = async () => {
    if (!seal) return;
    setVerifying(true);
    try {
      const res = await verifyActSeal({
        sha256Hash: seal.sha256Hash,
        signaturePkiToken: seal.signaturePkiToken,
        canonicalPayload: seal.canonicalPayload,
        sealedAt: seal.sealedAt,
        signerEmail: seal.signerEmail,
      });
      setVerifyResult(res.verification);
    } catch (err: any) {
      setVerifyResult({
        isValid: false,
        errorReason: err.message || 'Error de conexión con el servidor de certificación.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const sha256Display = seal?.sha256Hash || 'GENERANDO-SELLO-CRIPTOGRAFICO-SHA256...';
  const pkiTokenDisplay = seal?.signaturePkiToken || 'PKI-SIGC-EN-ESPERA-DE-FIRMA-PRESIDENCIAL';
  const sealedAtDisplay = seal?.sealedAt ? seal.sealedAt.replace('T', ' ').substring(0, 19) : (meeting.closedAt || meeting.date);
  const signerNameDisplay = seal?.signedBy || currentUser.name;
  const signerRoleDisplay = seal?.signerRole || 'Presidente del Comité Curricular';

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
              Vista previa del Acta Oficial refrendada con Criptografía SHA-256
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onOpenVerifier) {
                  onOpenVerifier(meeting.code);
                } else {
                  window.open(verificationUrl, '_blank');
                }
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100 transition-colors shadow-xs"
              title="Abrir el portal oficial de validación de firmas PKI"
            >
              <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
              <span>Verificador Público</span>
            </button>

            <button
              onClick={handleVerifyServerIntegrity}
              disabled={verifying || !seal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs disabled:opacity-50"
              title="Auditar firma digital y hash SHA-256 en el servidor institucional"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>{verifying ? 'Verificando...' : 'Auditar Integridad'}</span>
            </button>

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

        {/* Verification Alert Banner if checked */}
        {verifyResult && (
          <div className={`px-6 py-2.5 text-xs border-b flex items-center justify-between print:hidden ${
            verifyResult.isValid
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              {verifyResult.isValid ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-600" />
              )}
              <span>
                <strong>{verifyResult.isValid ? 'Integridad Verificada con Éxito:' : 'Fallo de Integridad:'}</strong>{' '}
                {verifyResult.isValid
                  ? `El hash SHA-256 del servidor coincide bit a bit. El acta no ha sufrido alteraciones.`
                  : verifyResult.errorReason}
              </span>
            </div>
            <button onClick={() => setVerifyResult(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
          </div>
        )}

        {/* Scrollable Printable Document Body */}
        <div className="overflow-y-auto p-6 sm:p-10 font-sans text-slate-900 bg-white" id="printable-acta" ref={printContainerRef}>
          {/* Institutional Letterhead Header */}
          <div className="border-b-2 border-slate-900 pb-5 text-center space-y-1">
            <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-widest font-mono">
              <span>República de Colombia</span>
              <span>Sistema Integrado de Calidad SIG-CURRÍCULO</span>
              <span>Vigencia: 2026-2028</span>
            </div>

            <div className="py-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-950 uppercase">
                Institución Universitaria Mayor de Cartagena · Facultad de Ingeniería
              </h1>
              <h2 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wide">
                {meeting.programName ? `Programa de ${meeting.programName}` : 'Departamento de Ingeniería Mecánica'} {meeting.programCode ? `(${meeting.programCode})` : ''} · Comité Curricular
              </h2>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 text-xs font-mono">
              <span className="font-bold text-slate-900 text-sm">
                ACTA OFICIAL N°: {meeting.code}
              </span>
              <span className="text-slate-600">
                SESIÓN {meeting.type.toUpperCase()} · ESTADO: {meeting.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* 1. General Meeting Data */}
          <div className="mt-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              1. Datos Generales de la Sesión
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Fecha de Realización:</span>
                <strong className="font-semibold text-slate-900">{meeting.date}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Horario de Sesión:</span>
                <strong className="font-semibold text-slate-900">{meeting.startTime} - {meeting.endTime}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Modalidad:</span>
                <strong className="font-semibold text-slate-900 capitalize">{meeting.modality}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Lugar / Enlace:</span>
                <strong className="font-semibold text-slate-900 truncate block">{meeting.locationOrUrl}</strong>
              </div>
            </div>
          </div>

          {/* 2. Quorum and Attendance */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                2. Verificación de Quórum Estatutario y Asistencia
              </h3>
              <span className="text-[11px] font-mono text-slate-600 font-semibold">
                Quórum Verificado: {meeting.attendees.filter((a) => a.present).length} de {meeting.attendees.length} miembros presentes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {meeting.attendees.map((att, idx) => (
                <div
                  key={att.userId || idx}
                  className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-slate-50/70"
                >
                  <div>
                    <span className="font-bold text-slate-900">{att.userName}</span>
                    <span className="text-[10px] text-slate-500 block capitalize">{att.role}</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      att.present
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {att.present ? 'Presente (Con Quórum)' : 'Ausente con Excusa'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Orden del Día y Acuerdos */}
          <div className="mt-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              3. Desarrollo del Orden del Día, Deliberaciones y Acuerdos
            </h3>

            {meeting.agendaItems.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No se registraron puntos en el orden del día.</p>
            ) : (
              <div className="space-y-4">
                {meeting.agendaItems.map((item, idx) => (
                  <div key={item.id || idx} className="rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs bg-slate-50/50">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-900 text-white font-bold text-[10px]">
                          {item.order || idx + 1}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      </div>
                      <span className="text-[11px] text-slate-500 shrink-0">
                        Ponente: {item.presenter} ({item.estimatedMinutes || 20} min)
                      </span>
                    </div>

                    <p className="text-slate-600 text-xs">{item.description}</p>

                    {item.deliberations && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider block">
                          Resumen de Deliberaciones y Sustentación:
                        </span>
                        <p className="text-slate-800 leading-relaxed">{item.deliberations}</p>
                      </div>
                    )}

                    {item.agreements && (
                      <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-200 space-y-1">
                        <span className="font-bold text-[11px] text-emerald-900 uppercase tracking-wider block">
                          Acuerdo Aprobado por el Comité:
                        </span>
                        <p className="text-emerald-950 font-medium leading-relaxed">{item.agreements}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Votaciones Estatutarias */}
          {meetingMotions.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                4. Registro Oficial de Votaciones Nominales
              </h3>

              <div className="space-y-3">
                {meetingMotions.map((mot) => {
                  const votes = Object.values(mot.votes || {});
                  const aFavor = votes.filter((v) => v.option === 'a_favor').length;
                  const enContra = votes.filter((v) => v.option === 'en_contra').length;
                  const abst = votes.filter((v) => v.option === 'abstencion').length;

                  return (
                    <div key={mot.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">{mot.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          mot.status === 'aprobada' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {mot.status} (Mayoría {mot.majorityRequired})
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{mot.description}</p>
                      <div className="flex items-center gap-4 text-[11px] font-mono text-slate-700 bg-white p-2 rounded border border-slate-200">
                        <span>A Favor: <strong>{aFavor}</strong></span>
                        <span>En Contra: <strong>{enContra}</strong></span>
                        <span>Abstenciones: <strong>{abst}</strong></span>
                        <span>Total Votos: <strong>{votes.length}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Compromisos Derivados */}
          {meetingCommitments.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                5. Compromisos y Tareas Asignadas
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="p-2 border-b">Tarea / Compromiso</th>
                      <th className="p-2 border-b">Responsable</th>
                      <th className="p-2 border-b">Fecha Límite</th>
                      <th className="p-2 border-b">Prioridad</th>
                      <th className="p-2 border-b">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {meetingCommitments.map((com) => (
                      <tr key={com.id}>
                        <td className="p-2 font-medium text-slate-900">{com.title}</td>
                        <td className="p-2 text-slate-700">{com.responsibleName}</td>
                        <td className="p-2 font-mono text-slate-600">{com.dueDate}</td>
                        <td className="p-2 capitalize">{com.priority}</td>
                        <td className="p-2 font-bold uppercase text-[10px]">{com.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. Formal Digital Signature & Cryptographic Seal Block */}
          <div className="mt-10 pt-6 border-t-2 border-slate-900 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 text-center">
              Constancia de Cierre y Certificación Digital del Acta (Validez Jurídica y Probatoria)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-50 p-5 rounded-xl border border-slate-300">
              {/* QR & Verification seal */}
              <div className="md:col-span-3 flex flex-col items-center justify-center p-2 text-center border-b md:border-b-0 md:border-r border-slate-200">
                <div className="h-24 w-24 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1.5 shadow-xs overflow-hidden">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Verificación Acta ${meeting.code}`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <QrCode className="h-16 w-16 text-slate-900" />
                  )}
                </div>
                <span className="font-mono text-[9px] text-slate-500 mt-1.5 font-bold uppercase tracking-wider">
                  VALIDACIÓN PKI SHA-256
                </span>
                <a
                  href={verificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] text-blue-700 hover:text-blue-900 hover:underline break-all font-mono max-w-[170px] text-center mt-0.5 leading-tight"
                  title="Haga clic para validar en línea o escanee el código QR"
                >
                  {verificationUrl}
                </a>
              </div>

              {/* Digital Certificate Details */}
              <div className="md:col-span-9 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs uppercase">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Acta Refrendada Criptográficamente por la Presidencia del Comité
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                  <div>
                    <span className="text-slate-400">Firmante y Autoridad Emisora:</span>
                    <p className="font-bold text-slate-900">{signerNameDisplay}</p>
                    <p className="text-[10px] text-slate-500">{signerRoleDisplay} · Institución Universitaria Mayor de Cartagena</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Estampa Temporal del Servidor (UTC):</span>
                    <p className="font-bold font-mono text-slate-900">{sealedAtDisplay}</p>
                    <p className="text-[10px] text-slate-500">Sello de Tiempo Certificado PKI</p>
                  </div>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200 font-mono text-[10px] text-slate-700 space-y-1">
                  <div>
                    <strong className="text-slate-900">Hash Criptográfico SHA-256:</strong>
                    <div className="break-all text-slate-800 select-all font-bold">{sha256Display}</div>
                  </div>
                  <div className="pt-1 border-t border-slate-100 text-[9px] text-slate-500">
                    <strong>Token de Certificación PKI:</strong> {pkiTokenDisplay}
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Lines for Roll */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-8 text-center text-xs">
              {meeting.attendees.slice(0, 3).map((att) => (
                <div key={att.userId}>
                  <div className="border-b border-slate-400 pb-1 mb-1">
                    <span className="font-serif italic text-slate-700 font-bold">{att.userName}</span>
                  </div>
                  <p className="font-bold text-slate-900 capitalize">{att.role}</p>
                  <p className="text-[10px] text-slate-500">Firma Registrada en Plataforma</p>
                </div>
              ))}
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-200 leading-relaxed">
              Documento expedido y refrendado electrónicamente bajo el Acuerdo del Consejo Superior de la Institución Universitaria Mayor de Cartagena. Cumple con la Ley 527 de 1999 sobre firmas digitales y validez probatoria plena ante el Consejo Nacional de Acreditación (CNA) y pares evaluadores ABET.
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
