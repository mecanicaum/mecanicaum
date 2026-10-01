export type UserRole = 'presidente' | 'miembro' | 'seguimiento' | 'autoevaluacion' | 'invitado_externo';

export interface Estamento {
  id: string;
  name: string;
  code: string;
  description: string;
  category: 'docente' | 'estudiantil' | 'egresado' | 'directivo' | 'externo';
  hasStatutoryVote: boolean;
  active: boolean;
}

export interface CustomRole {
  id: string;
  name: string;
  code: string;
  description: string;
  baseRole: UserRole;
  canVote: boolean;
  canSignActs: boolean;
  canAuditCommitments: boolean;
  canMapQuality: boolean;
  isAdmin: boolean;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleId?: string;
  estamentoId?: string;
  estamentoName?: string;
  department: string;
  academicTitle: string;
  avatarInitials: string;
  isExternal?: boolean;
  hasVote?: boolean;
  periodo?: string;
  active?: boolean;
}

export type MeetingType = 'ordinaria' | 'extraordinaria';
export type MeetingStatus = 'programada' | 'en_curso' | 'cerrada';

export interface MeetingAttendee {
  userId: string;
  userName: string;
  role: string;
  present: boolean;
}

export interface AgendaItem {
  id: string;
  order: number;
  title: string;
  description: string;
  presenter: string;
  estimatedMinutes: number;
  agreements: string;
  deliberations: string;
  driveAttachments: {
    name: string;
    url: string;
    type: 'drive_doc' | 'drive_sheet' | 'drive_slide' | 'drive_folder';
  }[];
}

export interface Meeting {
  id: string;
  code: string;
  type: MeetingType;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  modality: 'presencial' | 'virtual' | 'hibrida';
  locationOrUrl: string;
  status: MeetingStatus;
  attendees: MeetingAttendee[];
  agendaItems: AgendaItem[];
  quorumPresentCount: number;
  quorumTotalRequired: number;
  generalObservations?: string;
  closedAt?: string;
  signedByPresident?: boolean;
  presidentSignatureDate?: string;
  cryptographicSealId?: string;
}

export type VoteOption = 'a_favor' | 'en_contra' | 'abstencion';

export interface VoteRecord {
  userId: string;
  userName: string;
  userRole: UserRole;
  option: VoteOption;
  timestamp: string;
  voteHash?: string;
}

export interface Motion {
  id: string;
  meetingId: string;
  agendaItemId?: string;
  title: string;
  description: string;
  proposedBy: string;
  proposedAt: string;
  status: 'abierta' | 'aprobada' | 'rechazada' | 'cerrada';
  majorityRequired: 'simple' | 'cualificada_dos_tercios' | 'unanime';
  votes: Record<string, VoteRecord>;
  result?: {
    aFavor: number;
    enContra: number;
    abstencion: number;
    totalVotes: number;
    quorumPercentage: number;
    approved: boolean;
  };
}

export type CommitmentStatus = 'pendiente' | 'en_revision' | 'cumplido' | 'vencido';

export interface CommitmentEvidence {
  id: string;
  submittedAt: string;
  submittedBy: string;
  description: string;
  driveUrl: string;
  fileName?: string;
}

export interface Commitment {
  id: string;
  meetingId: string;
  meetingCode: string;
  agendaItemId?: string;
  title: string;
  description: string;
  responsibleId: string;
  responsibleName: string;
  responsibleEmail: string;
  isExternalResponsible?: boolean;
  assignedBy: string;
  assignedAt: string;
  dueDate: string;
  priority: 'alta' | 'media' | 'baja';
  status: CommitmentStatus;
  evidences: CommitmentEvidence[];
  auditedBy?: string;
  auditNotes?: string;
  auditedAt?: string;
  lastReminderSentAt?: string;
  reminderCount?: number;
}

export interface QualityAspect {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface QualityFeature {
  id: string;
  code: string;
  name: string;
  description: string;
  aspects: QualityAspect[];
}

export interface QualityFactor {
  id: string;
  code: string;
  name: string;
  description: string;
  framework: 'CNA' | 'ABET' | 'Institucional';
  features: QualityFeature[];
}

export interface ActQualityMapping {
  id: string;
  meetingId: string;
  meetingCode: string;
  agendaItemId: string;
  aspectId: string;
  aspectCode: string;
  aspectName: string;
  factorCode: string;
  featureCode: string;
  evidentialContribution: string;
  mappedBy: string;
  mappedAt: string;
}

export interface AccessRequest {
  id: string;
  meetingId: string;
  meetingCode: string;
  requestedBy: string;
  userRole: UserRole;
  purpose: string;
  requestedAt: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface InstitutionalNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  recipientRoles?: UserRole[];
  recipientEmail?: string;
  meetingCode?: string;
  type: 'citacion' | 'compromiso' | 'auditoria' | 'acceso' | 'sistema';
}

export interface DigitalActSeal {
  id: string;
  meetingId: string;
  meetingCode: string;
  title: string;
  sha256Hash: string;
  signaturePkiToken: string;
  sealedAt: string;
  signedBy: string;
  signerEmail: string;
  signerRole: string;
  authorityIssuer: string;
  canonicalPayload: string;
  totalVoters: number;
  totalAgreements: number;
  totalCommitments: number;
}

export interface ServerAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  details: string;
  ipAddress?: string;
  payloadHash?: string;
}
