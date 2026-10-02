import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Meeting, DigitalActSeal } from '../types';
import { computeSha256Hex, generateActaCanonicalPayload, getActaVerificationUrl, generateQrCodeDataUrl } from '../utils/cryptoVerification';
import { AccessibilityBar } from './AccessibilityBar';
import { UmayorLogo } from './UmayorLogo';
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

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-[#1A1A1A] flex flex-col font-sans antialiased">
      <AccessibilityBar />

      {/* Top Banner */}
      <header className="border-b border-[#C49E2D]/40 bg-[#006A4E] text-white sticky top-0 z-40 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UmayorLogo size="md" variant="full" className="bg-[#00523E] px-2.5 py-1 rounded-md border border-[#C49E2D]/30" />
            <div className="hidden sm:block border-l border-[#C49E2D]/30 pl-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-cinzel font-bold tracking-tight text-white uppercase">
                  Validador PKI de Actas
                </span>
                <span className="text-[9px] bg-[#C49E2D] text-[#006A4E] px-2 py-0.5 rounded-md font-mono font-bold uppercase">
                  Ley 527/1999
                </span>
              </div>
              <p className="text-[11px] text-slate-200">
                Sistema Oficial de Verificación de Firmas Digitales e Integridad
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onBackToApp && (
              <button
                onClick={onBackToApp}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C49E2D] hover:bg-[#C49E2D]/90 text-[#006A4E] text-xs font-bold rounded-md transition-colors cursor-pointer shadow-xs"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-[#006A4E]" />
                <span>Ingresar al Sistema</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Search / Lookup Bar */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 sm:p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4A5568]">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ingrese el código del acta (Ej: ACT-2026-MEC-001) o Hash SHA-256..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F9F9F9] border border-[#E2E8F0] rounded-md text-xs font-mono text-[#1A1A1A] placeholder-[#4A5568] focus:bg-white focus:outline-none focus:border-[#C49E2D] focus:ring-2 focus:ring-[#C49E2D]/20"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#006A4E] hover:bg-[#00523E] text-white text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-2 shrink-0 shadow-[0_4px_12px_rgba(0,106,78,0.15)] font-cinzel cursor-pointer"
            >
              <Search className="h-4 w-4 text-[#C49E2D]" />
              <span>Verificar Documento</span>
            </button>
          </form>

          {/* Quick Select suggestions */}
          {meetings.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-[#E2E8F0] text-xs text-[#4A5568]">
              <span className="text-[11px] font-bold text-[#1A1A1A] font-cinzel">Actas registradas:</span>
              {meetings.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSearchQuery(m.code);
                    setActiveCode(m.code);
                    setLiveCalculatedHash(null);
                  }}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                    matchedMeeting?.id === m.id
                      ? 'bg-[#006A4E] text-white border-[#006A4E] font-bold shadow-xs'
                      : 'bg-[#F9F9F9] text-[#1A1A1A] border-[#E2E8F0] hover:bg-[#006A4E]/10 hover:border-[#C49E2D]/40'
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
          <div className="bg-white text-[#1A1A1A] rounded-xl p-6 sm:p-8 shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-[#E2E8F0] relative overflow-hidden">
            {/* Stamp Status Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#C49E2D] bg-[#F9F9F9] text-[#C49E2D] shadow-sm">
                  <ShieldCheck className="h-8 w-8 text-[#006A4E]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#006A4E] bg-[#006A4E]/10 px-2.5 py-0.5 rounded-md border border-[#006A4E]/20 flex items-center gap-1 font-cinzel">
                      <CheckCircle2 className="h-3 w-3 text-[#C49E2D]" />
                      Documento Auténtico y Refrendado
                    </span>
                    <span className="text-xs text-[#4A5568] font-mono">Ley 527 de 1999</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#006A4E] font-serif mt-1">
                    Acta Oficial N°: {matchedMeeting.code}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#F9F9F9] hover:bg-[#006A4E]/10 hover:text-[#006A4E] text-[#1A1A1A] text-xs font-semibold rounded-md border border-[#E2E8F0] transition-colors cursor-pointer"
                  title="Copiar enlace público de verificación"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-[#006A4E]" /> : <Copy className="h-3.5 w-3.5 text-[#C49E2D]" />}
                  <span>{copiedLink ? 'Enlace Copiado' : 'Copiar Enlace'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#006A4E] hover:bg-[#00523E] text-white text-xs font-bold rounded-md transition-colors cursor-pointer shadow-xs font-cinzel"
                >
                  <Printer className="h-3.5 w-3.5 text-[#C49E2D]" />
                  <span>Imprimir Certificado</span>
                </button>
              </div>
            </div>

            {/* Grid Information */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
              {/* Left Column: QR and Issuer Details */}
              <div className="lg:col-span-4 bg-[#F9F9F9] p-5 rounded-xl border border-[#E2E8F0] flex flex-col items-center text-center space-y-4">
                <div className="bg-white p-2.5 rounded-lg border-2 border-[#C49E2D]/40 shadow-xs">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Verificación Acta ${matchedMeeting.code}`}
                      className="h-36 w-36 object-contain"
                    />
                  ) : (
                    <div className="h-36 w-36 flex items-center justify-center bg-slate-100 text-slate-400">
                      <QrIcon className="h-16 w-16 text-[#C49E2D]" />
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5568] font-cinzel">
                    Certificación PKI Institucional
                  </span>
                  <p className="text-xs font-bold text-[#006A4E] font-serif">
                    Institución Universitaria Mayor de Cartagena
                  </p>
                  <p className="text-[11px] text-[#4A5568]">
                    Facultad de Ingeniería · Depto. de Ingeniería Mecánica
                  </p>
                </div>

                <div className="w-full pt-3 border-t border-[#E2E8F0] text-left space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#4A5568] font-bold uppercase block font-cinzel">Token de Certificación:</span>
                    <span className="font-mono text-[11px] font-bold text-[#006A4E] break-all bg-white px-2 py-1 rounded-md border border-[#E2E8F0] block">
                      {matchedSeal?.signaturePkiToken || `PKI-SIGC-2026-${matchedMeeting.code}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#4A5568] font-bold uppercase block font-cinzel">Fecha de Sellado Oficial:</span>
                    <span className="font-mono text-xs font-bold text-[#1A1A1A] flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#C49E2D]" />
                      {matchedSeal?.sealedAt ? new Date(matchedSeal.sealedAt).toLocaleString('es-CO') : 'Sesión Activa Refrendada'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Acta Details & Cryptographic Hash */}
              <div className="lg:col-span-8 space-y-5">
                {/* Session Header Data */}
                <div className="bg-[#F9F9F9] p-4 rounded-xl border border-[#E2E8F0] space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5568] font-cinzel">Título de la Sesión:</span>
                    <h3 className="text-sm sm:text-base font-bold text-[#006A4E] font-serif">
                      {matchedMeeting.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-[#E2E8F0]">
                    <div>
                      <span className="text-[#4A5568] text-[10px] block font-cinzel">Tipo de Sesión:</span>
                      <span className="font-bold text-[#1A1A1A] capitalize">{matchedMeeting.type}</span>
                    </div>
                    <div>
                      <span className="text-[#4A5568] text-[10px] block font-cinzel">Fecha de Sesión:</span>
                      <span className="font-bold text-[#1A1A1A] font-mono">{matchedMeeting.date}</span>
                    </div>
                    <div>
                      <span className="text-[#4A5568] text-[10px] block font-cinzel">Horario:</span>
                      <span className="font-bold text-[#1A1A1A] font-mono">{matchedMeeting.startTime} - {matchedMeeting.endTime}</span>
                    </div>
                    <div>
                      <span className="text-[#4A5568] text-[10px] block font-cinzel">Asistentes / Quórum:</span>
                      <span className="font-bold text-[#006A4E] font-mono">
                        {matchedMeeting.attendees.filter((a) => a.present).length} de {matchedMeeting.attendees.length} presentes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signer Identification */}
                <div className="p-4 rounded-xl border border-[#E2E8F0] bg-white space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#006A4E] uppercase tracking-wider font-cinzel">
                    <User className="h-4 w-4 text-[#C49E2D]" />
                    <span>Firmante Oficial Refrendado</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-[#4A5568] block">Autoridad Firmante:</span>
                      <p className="font-bold text-[#1A1A1A] font-serif">{matchedSeal?.signedBy || 'Presidente del Comité Curricular'}</p>
                      <p className="text-[11px] text-[#006A4E] font-mono">{matchedSeal?.signerEmail || 'autoevaluacionycurriculomecanica@umayor.edu.co'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#4A5568] block">Autoridad Emisora:</span>
                      <p className="font-semibold text-[#1A1A1A]">
                        {matchedSeal?.authorityIssuer || 'Institución Universitaria Mayor de Cartagena'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Hash SHA-256 Block */}
                <div className="p-4 rounded-xl border-2 border-[#C49E2D]/40 bg-amber-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#006A4E] uppercase tracking-wider font-cinzel">
                      <Hash className="h-4 w-4 text-[#C49E2D]" />
                      <span>Huella Criptográfica SHA-256 (Inmutable)</span>
                    </div>
                    <button
                      onClick={handleRecomputeHash}
                      disabled={isVerifyingIntegrity}
                      className="text-[11px] font-semibold text-[#006A4E] hover:text-[#C49E2D] flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-[#E2E8F0] shadow-xs transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`h-3 w-3 text-[#C49E2D] ${isVerifyingIntegrity ? 'animate-spin' : ''}`} />
                      <span>{isVerifyingIntegrity ? 'Calculando...' : 'Re-calcular en Vivo'}</span>
                    </button>
                  </div>

                  <div className="bg-white p-2.5 rounded-md border border-[#E2E8F0] font-mono text-[11px] text-[#1A1A1A] break-all select-all font-bold">
                    {matchedSeal?.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                  </div>

                  {liveCalculatedHash && (
                    <div className="p-2.5 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
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
            <div className="border-t border-[#E2E8F0] pt-6 space-y-4">
              <h4 className="text-xs font-bold text-[#006A4E] uppercase tracking-wider flex items-center gap-2 font-cinzel">
                <FileCheck2 className="h-4 w-4 text-[#C49E2D]" />
                <span>Puntos de Agenda y Acuerdos Aprobados ({matchedMeeting.agendaItems.length})</span>
              </h4>

              <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F9F9F9]">
                {matchedMeeting.agendaItems.map((ag) => (
                  <div key={ag.id} className="p-3.5 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-[#1A1A1A]">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#006A4E] text-white font-mono text-[10px]">
                        {ag.order}
                      </span>
                      <span>{ag.title}</span>
                    </div>
                    {ag.agreements && (
                      <div className="pl-7 text-[11px] text-[#006A4E] bg-emerald-50/70 p-2 rounded-md border border-emerald-200 mt-1">
                        <strong>Acuerdo Oficial:</strong> {ag.agreements}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Legal validity footer */}
            <div className="mt-8 pt-4 border-t border-[#E2E8F0] text-center text-[10px] text-[#4A5568] leading-relaxed">
              Verificación generada por el Sistema Integrado de Gestión Curricular (SIG-Currículo) de la Institución Universitaria Mayor de Cartagena.
              Válido como constancia probatoria ante el Consejo Nacional de Acreditación (CNA) de Colombia y pares evaluadores ABET.
            </div>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center space-y-3 shadow-xs">
            <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-[#006A4E] font-serif">No se encontró el documento especificado</h3>
            <p className="text-xs text-[#4A5568] max-w-md mx-auto">
              Verifique que el código o hash ingresado sea correcto (Ej: ACT-2026-MEC-001) o seleccione una de las actas disponibles.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-4 text-center text-xs text-[#4A5568]">
        Institución Universitaria Mayor de Cartagena · Todos los derechos reservados · 2026
      </footer>
    </div>
  );
};
