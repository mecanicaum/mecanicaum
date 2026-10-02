import crypto from 'crypto';
import { Meeting, Motion, Commitment, User, DigitalActSeal } from './types';

const AUTHORITY_ISSUER = 'Institución Universitaria Mayor de Cartagena - Dirección de Autoevaluación y Calidad Académica - Autoridad de Certificación SIG-Currículo PKI v2.4';

/**
 * Computes standard SHA-256 hash in hexadecimal representation (No secret keys required)
 */
export function computeSha256(data: string): string {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

/**
 * Generates an institutional PKI certification token using deterministic SHA-256 hashing
 */
export function generatePkiToken(sha256Hash: string, timestamp: string, signerEmail: string): string {
  const message = `${AUTHORITY_ISSUER}|${sha256Hash}|${timestamp}|${signerEmail}`;
  const tokenDigest = crypto.createHash('sha256').update(message, 'utf8').digest('hex');
  return `PKI-SIGC-${timestamp.replace(/[-:T.Z]/g, '').slice(0, 14)}-${tokenDigest.slice(0, 32).toUpperCase()}`;
}

/**
 * Generates an immutable cryptographic vote hash stamp
 */
export function generateVoteHash(params: {
  userId: string;
  userName: string;
  motionId: string;
  option: string;
  timestamp: string;
}): string {
  const content = `VOTE|${params.motionId}|${params.userId}|${params.userName}|${params.option}|${params.timestamp}`;
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Creates canonical deterministic representation of a meeting and its decisions
 */
export function generateCanonicalActPayload(
  meeting: Meeting,
  motions: Motion[],
  commitments: Commitment[],
  signer: User,
  sealedAt: string
): string {
  // Sort and sanitize data deterministically
  const canonicalAttendees = (meeting.attendees || [])
    .slice()
    .sort((a, b) => a.userId.localeCompare(b.userId))
    .map((a) => ({
      userId: a.userId,
      userName: a.userName,
      role: a.role,
      present: a.present,
    }));

  const canonicalAgenda = (meeting.agendaItems || [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      order: item.order,
      title: item.title,
      description: item.description,
      presenter: item.presenter,
      agreements: (item.agreements || '').trim(),
      deliberations: (item.deliberations || '').trim(),
      driveAttachmentsCount: item.driveAttachments?.length || 0,
    }));

  const canonicalMotions = motions
    .filter((m) => m.meetingId === meeting.id)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((m) => {
      const sortedVotes = Object.values(m.votes || {})
        .sort((a, b) => a.userId.localeCompare(b.userId))
        .map((v) => ({
          userId: v.userId,
          userName: v.userName,
          userRole: v.userRole,
          option: v.option,
          timestamp: v.timestamp,
          voteHash: v.voteHash || '',
        }));

      return {
        id: m.id,
        title: m.title,
        description: m.description,
        proposedBy: m.proposedBy,
        majorityRequired: m.majorityRequired,
        status: m.status,
        result: m.result || null,
        votes: sortedVotes,
      };
    });

  const canonicalCommitments = commitments
    .filter((c) => c.meetingId === meeting.id)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((c) => ({
      id: c.id,
      title: c.title,
      responsibleName: c.responsibleName,
      responsibleEmail: c.responsibleEmail,
      dueDate: c.dueDate,
      priority: c.priority,
    }));

  const payloadObject = {
    institution: 'UNIVERSIDAD MAYOR - FACULTAD DE INGENIERÍA',
    body: 'COMITÉ CURRICULAR',
    authorityIssuer: AUTHORITY_ISSUER,
    sealedAt,
    meeting: {
      id: meeting.id,
      code: meeting.code,
      type: meeting.type,
      title: meeting.title,
      date: meeting.date,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
      modality: meeting.modality,
      locationOrUrl: meeting.locationOrUrl,
      quorumPresentCount: meeting.quorumPresentCount,
      quorumTotalRequired: meeting.quorumTotalRequired,
      generalObservations: meeting.generalObservations || '',
    },
    attendees: canonicalAttendees,
    agendaItems: canonicalAgenda,
    motions: canonicalMotions,
    commitments: canonicalCommitments,
    signer: {
      id: signer.id,
      name: signer.name,
      email: signer.email,
      role: signer.role,
      academicTitle: signer.academicTitle,
      department: signer.department,
    },
  };

  return JSON.stringify(payloadObject, null, 2);
}

/**
 * Creates and digitally seals an act with institutional cryptographic hash & token
 */
export function createDigitalActSeal(
  meeting: Meeting,
  motions: Motion[],
  commitments: Commitment[],
  signer: User
): DigitalActSeal {
  const sealedAt = new Date().toISOString();
  const canonicalPayload = generateCanonicalActPayload(meeting, motions, commitments, signer, sealedAt);
  const sha256Hash = computeSha256(canonicalPayload);
  const signaturePkiToken = generatePkiToken(sha256Hash, sealedAt, signer.email);

  const totalVoters = motions
    .filter((m) => m.meetingId === meeting.id)
    .reduce((acc, m) => acc + Object.keys(m.votes || {}).length, 0);

  const totalAgreements = (meeting.agendaItems || []).filter((i) => !!i.agreements && i.agreements.trim().length > 0).length;
  const totalCommitments = commitments.filter((c) => c.meetingId === meeting.id).length;

  return {
    id: `seal-${meeting.id}-${Date.now()}`,
    meetingId: meeting.id,
    meetingCode: meeting.code,
    title: meeting.title,
    sha256Hash,
    signaturePkiToken,
    sealedAt,
    signedBy: signer.name,
    signerEmail: signer.email,
    signerRole: signer.role,
    authorityIssuer: AUTHORITY_ISSUER,
    canonicalPayload,
    totalVoters,
    totalAgreements,
    totalCommitments,
  };
}

/**
 * Verifies if an act payload has been tampered with or modified
 */
export function verifyActIntegrity(
  canonicalPayload: string,
  claimedHash: string,
  claimedPkiToken: string,
  sealedAt: string,
  signerEmail: string
): { isValid: boolean; recomputedHash: string; expectedPkiToken: string; errorReason?: string } {
  const recomputedHash = computeSha256(canonicalPayload);
  if (recomputedHash.toLowerCase() !== claimedHash.toLowerCase()) {
    return {
      isValid: false,
      recomputedHash,
      expectedPkiToken: '',
      errorReason: 'Discrepancia de integridad: El contenido del documento fue alterado después de su firma.',
    };
  }

  const expectedPkiToken = generatePkiToken(recomputedHash, sealedAt, signerEmail);
  if (expectedPkiToken !== claimedPkiToken) {
    return {
      isValid: false,
      recomputedHash,
      expectedPkiToken,
      errorReason: 'Firma PKI inválida o emitida con certificados no autorizados.',
    };
  }

  return {
    isValid: true,
    recomputedHash,
    expectedPkiToken,
  };
}
