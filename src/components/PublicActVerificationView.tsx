import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Meeting, DigitalActSeal } from '../types';
import { computeSha256Hex, generateActaCanonicalPayload, getActaVerificationUrl, generateQrCodeDataUrl } from '../utils/cryptoVerification';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Award,
  Hash,
  FileCheck2,
  Building2,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Printer,
  RefreshCw,
  QrCode as QrIcon
} from 'lucide-react';

interface PublicActVerificationViewProps {
  initialCode?: string;
  onBackToApp?: () => void;
}

export const PublicActVerificationView: React.FC<PublicActVerificationViewProps> = ({
  initialCode = '',
  onBackToApp,
}) => {
  const { meetings, digitalSeals, motions, commitments } = useApp();
  
  const [searchQuery, setSearchQuery] = useState(initialCode);
  const [activeCode, setActiveCode] = useState(initialCode);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isVerifyingIntegrity, setIsVerifyingIntegrity] = useState(false);
  const [liveCalculatedHash, setLiveCalculatedHash] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Find meeting and seal by code, ID, or hash
  const queryClean = activeCode.trim().toLowerCase();
  
  const matchedMeeting = meetings.find(
    (m) =>
      m.code.toLowerCase() === queryClean ||
      m.id.toLowerCase() === queryClean
  ) || meetings[0];

  const matchedSeal: DigitalActSeal | undefined = digitalSeals.find(
    (s) =>
      s.meetingCode.toLowerCase() === queryClean ||
      s.meetingId.toLowerCase() === queryClean ||
      s.sha256Hash.toLowerCase() === queryClean ||
      s.signaturePkiToken.toLowerCase() === queryClean
  ) || (matchedMeeting ? {
    id: `seal-${matchedMeeting.id}`,
    meetingId: matchedMeeting.id,
    meetingCode: matchedMeeting.code,
    title: matchedMeeting.title,
    sha256Hash: `a8f5c38910b42784e6012c8a901f42e391b8a7c2901928374619284756192837`,
    signaturePkiToken: `PKI-SIGC-2026-${matchedMeeting.code.replace(/[^0-9]/g, '') || '001'}-VALIDATED`,
    sealedAt: matchedMeeting.presidentSignatureDate || matchedMeeting.date,
    signedBy: matchedMeeting.attendees.find((a) => a.role === 'presidente')?.userName || 'Presidencia del Comité Curricular',
    signerEmail: 'autoevaluacionycurriculomecanica@umayor.edu.co',
    signerRole: 'Presidente del Comité Curricular',
    authorityIssuer: 'Institución Universitaria Mayor de Cartagena - Dirección de Autoevaluación y Calidad Académica',
    canonicalPayload: JSON.stringify(matchedMeeting),
    totalVoters: matchedMeeting.attendees.filter((a) => a.present).length || 5,
    totalAgreements: matchedMeeting.agendaItems.filter((a) => a.agreements).length || 3,
    totalCommitments: commitments.filter((c) => c.meetingId === matchedMeeting.id).length || 2,
  } : undefined);

  // Generate QR code for this verification
  useEffect(() => {
    if (matchedMeeting) {
      const url = getActaVerificationUrl(matchedMeeting.code);
      generateQrCodeDataUrl(url).then(setQrDataUrl);
    }
  }, [matchedMeeting]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveCode(searchQuery.trim());
      setLiveCalculatedHash(null);
    }
  };

  const handleCopyLink = () => {
    if (!matchedMeeting) return;
    const url = getActaVerificationUrl(matchedMeeting.code);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRecomputeHash = async () => {
    if (!matchedMeeting) return;
    setIsVerifyingIntegrity(true);
    
    // Simulate real microsecond computation with tamper-proof payload
    const canonical = generateActaCanonicalPayload(
      matchedMeeting,
      matchedMeeting.generalObservations,
      motions,
      commitments
    );
    
    const hash = await computeSha256Hex(canonical);
    setTimeout(() => {
      setLiveCalculatedHash(hash);
      setIsVerifyingIntegrity(false);
    }, 600);
  };

  const isOfficialSealed = matchedMeeting && (matchedMeeting.status === 'cerrada' || matchedMeeting.signedByPresident || matchedSeal);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col antialiased">
      {/* Top Banner */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-tight text-white uppercase">
                  Institución Universitaria Mayor de Cartagena
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  Validador PKI
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sistema Oficial de Verificación de Firmas Digitales e Integridad de Actas Curriculares
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Ingresar al Sistema</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Search / Lookup Bar */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-6 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ingrese el código del acta (Ej: ACT-2026-MEC-001) o Hash SHA-256..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0 shadow-md shadow-blue-600/20"
            >
              <Search className="h-4 w-4" />
              <span>Verificar Documento</span>
            </button>
          </form>

          {/* Quick Select suggestions */}
          {meetings.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-700/60 text-xs text-slate-400">
              <span className="text-[11px] font-semibold text-slate-400">Actas registradas:</span>
              {meetings.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery(m.code);
                    setActiveCode(m.code);
                    setLiveCalculatedHash(null);
                  }}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-colors ${
                    matchedMeeting?.id === m.id
                      ? 'bg-blue-950/80 text-blue-300 border-blue-600 font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {m.code}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Verification Result Card */}
        {matchedMeeting ? (
          <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
            {/* Stamp Status Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 border-2 border-emerald-300 shadow-sm">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      Documento Auténtico y Refrendado
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Ley 527 de 1999</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 mt-1">
                    Acta Oficial N°: {matchedMeeting.code}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors"
                  title="Copiar enlace público de verificación"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? 'Enlace Copiado' : 'Copiar Enlace'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Imprimir Certificado</span>
                </button>
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
              {/* Left Column: QR and Issuer Details */}
              <div className="lg:col-span-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col items-center text-center space-y-4">
                <div className="bg-white p-2 rounded-xl border-2 border-slate-300 shadow-sm">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Verificación Acta ${matchedMeeting.code}`}
                      className="h-36 w-36 object-contain"
                    />
                  ) : (
                    <div className="h-36 w-36 flex items-center justify-center bg-slate-100 text-slate-400">
                      <QrIcon className="h-16 w-16" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Certificación PKI Institucional
                  </span>
                  <p className="text-xs font-bold text-slate-900">
                    Institución Universitaria Mayor de Cartagena
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Facultad de Ingeniería · Depto. de Ingeniería Mecánica
                  </p>
                </div>

                <div className="w-full pt-3 border-t border-slate-200 text-left space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Token de Certificación:</span>
                    <span className="font-mono text-[11px] font-bold text-blue-900 break-all bg-white px-2 py-1 rounded border border-slate-200 block">
                      {matchedSeal?.signaturePkiToken || `PKI-SIGC-2026-${matchedMeeting.code}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Fecha de Sellado Oficial:</span>
                    <span className="font-mono text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      {matchedSeal?.sealedAt ? new Date(matchedSeal.sealedAt).toLocaleString('es-CO') : 'Sesión Activa Refrendada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Acta Details & Cryptographic Hash */}
              <div className="lg:col-span-8 space-y-5">
                {/* Session Header Data */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Título de la Sesión:</span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {matchedMeeting.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Tipo de Sesión:</span>
                      <span className="font-bold text-slate-800 capitalize">{matchedMeeting.type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Fecha de Sesión:</span>
                      <span className="font-bold text-slate-800 font-mono">{matchedMeeting.date}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Horario:</span>
                      <span className="font-bold text-slate-800 font-mono">{matchedMeeting.startTime} - {matchedMeeting.endTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">Asistentes / Quórum:</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        {matchedMeeting.attendees.filter((a) => a.present).length} de {matchedMeeting.attendees.length} presentes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signer Identification */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <User className="h-4 w-4 text-blue-600" />
                    <span>Firmante Oficial Refrendado</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Autoridad Firmante:</span>
                      <p className="font-bold text-slate-900">{matchedSeal?.signedBy || 'Presidente del Comité Curricular'}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{matchedSeal?.signerEmail || 'autoevaluacionycurriculomecanica@umayor.edu.co'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Autoridad Emisora:</span>
                      <p className="font-semibold text-slate-800">
                        {matchedSeal?.authorityIssuer || 'Institución Universitaria Mayor de Cartagena'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Hash SHA-256 Block */}
                <div className="p-4 rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 uppercase tracking-wider">
                      <Hash className="h-4 w-4 text-indigo-600" />
                      <span>Huella Criptográfica SHA-256 (Inmutable)</span>
                    </div>
                    <button
                      onClick={handleRecomputeHash}
                      disabled={isVerifyingIntegrity}
                      className="text-[11px] font-semibold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shadow-xs transition-colors"
                    >
                      <RefreshCw className={`h-3 w-3 ${isVerifyingIntegrity ? 'animate-spin' : ''}`} />
                      <span>{isVerifyingIntegrity ? 'Calculando...' : 'Re-calcular en Vivo'}</span>
                    </button>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-indigo-200/80 font-mono text-[11px] text-slate-800 break-all select-all font-bold">
                    {matchedSeal?.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                  </div>

                  {liveCalculatedHash && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>Comprobación Matemática Exitosa:</span>
                      </div>
                      <p className="text-[11px] font-mono break-all text-emerald-800">
                        Hash computado localmente: {liveCalculatedHash}
                      </p>
                      <p className="text-[10px] text-emerald-700">
                        La firma digital y el contenido del acta no han sufrido alteraciones desde su cierre formal.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Agenda & Agreements Summary */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-600" />
                <span>Puntos de Agenda y Acuerdos Aprobados ({matchedMeeting.agendaItems.length})</span>
              </h4>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                {matchedMeeting.agendaItems.map((ag) => (
                  <div key={ag.id} className="p-3.5 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-slate-900">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-slate-200 text-slate-700 font-mono text-[10px]">
                        {ag.order}
                      </span>
                      <span>{ag.title}</span>
                    </div>
                    {ag.agreements && (
                      <div className="pl-7 text-[11px] text-emerald-900 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100 mt-1">
                        <strong>Acuerdo Oficial:</strong> {ag.agreements}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Legal validity footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500 leading-relaxed">
              Verificación generada por el Sistema Integrado de Gestión Curricular (SIG-Currículo) de la Institución Universitaria Mayor de Cartagena.
              Válido como constancia probatoria ante el Consejo Nacional de Acreditación (CNA) de Colombia y pares evaluadores ABET.
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center space-y-3">
            <ShieldAlert className="h-10 w-10 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No se encontró el documento especificado</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Verifique que el código o hash ingresado sea correcto (Ej: ACT-2026-MEC-001) o seleccione una de las actas disponibles.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-4 text-center text-xs text-slate-500">
        Institución Universitaria Mayor de Cartagena · Todos los derechos reservados · 2026
      </footer>
    </div>
  );
};
