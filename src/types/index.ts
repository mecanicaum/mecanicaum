export type UserRole = 
  | 'super_admin'
  | 'presidente' 
  | 'miembro' 
  | 'seguimiento' 
  | 'autoevaluacion' 
  | 'invitado_externo';

export interface Estamento {
  id: string;
  code: string; // e.g. "DOC", "EST", "EGR", "DIR", "PROD", "ADM"
  name: string; // e.g. "Estamento Profesoral / Docente"
  description: string;
  hasVote: boolean; // ¿Tiene voto reglamentario en el comité?
  color: string; // e.g. "blue", "emerald", "purple", "amber", "slate"
}

export interface CustomRole {
  id: string;
  code: string; // e.g. "PRES_DIR", "REP_DOC", "SEC_TECNICA"
  name: string; // e.g. "Presidente Decano"
  description: string;
  baseCapability: UserRole; // Permiso RBAC base en el sistema
  canVote: boolean;
  canSign: boolean;
  canAudit: boolean;
  canTagQuality: boolean;
}

export type AcademicLevel = 'pregrado' | 'postgrado' | 'tecnologia' | 'maestria' | 'especializacion';

export interface AcademicProgram {
  id: string;
  code: string; // e.g. "ING-MEC", "ING-SIS", "ING-CIV"
  name: string; // e.g. "Ingeniería Mecánica"
  level: AcademicLevel;
  faculty: string; // e.g. "Facultad de Ingeniería"
  sniesCode?: string; // Código SNIES oficial Ministerio de Educación Nacional
  directorName?: string; // Director(a) o Coordinador(a)
  directorEmail?: string;
  active: boolean;
  color?: string; // e.g. "emerald", "blue", "amber", "purple", "indigo", "teal", "rose"
  description?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  customRoleId?: string;
  roleLabel: string;
  estamentoId?: string;
  estamentoName?: string;
  faculty: string;
  department: string;
  academicTitle?: string;
  avatarInitials: string;
  isExternal?: boolean;
  hasVote?: boolean;
  periodo?: string; // e.g. "2026 - 2028"
  active?: boolean;
  password?: string;
  programIds?: string[]; // IDs de programas de la facultad a los que pertenece
  primaryProgramId?: string; // Programa principal de adscripción
}

export type MeetingType = 'ordinaria' | 'extraordinaria';
export type MeetingStatus = 'programada' | 'en_curso' | 'cerrada';

export interface MeetingAttendee {
  userId: string;
  userName: string;
  role: string;
  present: boolean;
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
  programId?: string; // ID del programa de la facultad
  programName?: string;
  programCode?: string;
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
  votes: Record<string, VoteRecord>; // userId -> VoteRecord
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
  programId?: string;
  programName?: string;
}

// Modelado de Nomenclaturas de Calidad CNA / ABET
export interface QualityAspect {
  id: string;
  code: string; // e.g. "12.1"
  name: string;
  description: string;
}

export interface QualityFeature {
  id: string;
  code: string; // e.g. "C12"
  name: string;
  description: string;
  aspects: QualityAspect[];
}

export interface QualityFactor {
  id: string;
  code: string; // e.g. "F3"
  name: string;
  framework: 'CNA' | 'ABET' | 'INSTITUCIONAL';
  description: string;
  features: QualityFeature[];
}

export interface ActQualityMapping {
  id: string;
  meetingId: string;
  meetingCode: string;
  agendaItemId: string;
  agendaItemTitle: string;
  factorCode: string;
  featureCode: string;
  aspectCode: string;
  aspectName: string;
  excerpt: string;
  evidentialContribution: string;
  mappedBy: string;
  mappedAt: string;
  programId?: string;
  programName?: string;
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
  type: 'citacion' | 'moción' | 'compromiso' | 'auditoria' | 'acceso' | 'sistema';
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
  programId?: string;
  programName?: string;
}

export interface UserSettings {
  autoSaveInterval: number;
  emailAlertsEnabled: boolean;
  soundNotificationsEnabled: boolean;
  compactTableMode: boolean;
  activeAcademicPeriod: string;
  institutionName: string;
}

export interface BrandingConfig {
  logoType: 'default' | 'custom_image';
  customLogoUrl?: string; // Base64 data url or image URL
  institutionName: string; // e.g. "INSTITUCIÓN UNIVERSITARIA"
  facultyOrLocationName: string; // e.g. "MAYOR DE CARTAGENA"
  bannerType: 'dynamic' | 'custom_image';
  bannerImageUrl?: string; // Base64 data url or image URL
  bannerSloganPrefix: string; // e.g. "LA CALIDAD, UN C"
  bannerSloganWord: string; // e.g. "OMPR"
  bannerSloganSuffix: string; // e.g. "OMISO"
  bannerScriptWord: string; // e.g. "permanente"
  bannerSubtitle: string; // e.g. "FACULTAD DE INGENIERÍA · CONSEJO CURRICULAR"
  showQualitySeal: boolean;
  accentColor: string; // e.g. "#006837"
  goldColor: string; // e.g. "#E58A13"
  updatedAt: string;
  updatedBy: string;
}



