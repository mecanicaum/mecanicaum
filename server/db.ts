import fs from 'fs';
import path from 'path';
import {
  User,
  Estamento,
  CustomRole,
  Meeting,
  Motion,
  Commitment,
  QualityFactor,
  ActQualityMapping,
  AccessRequest,
  InstitutionalNotification,
  DigitalActSeal,
  ServerAuditLog,
  AcademicProgram,
} from './types';

interface DatabaseSchema {
  programs: AcademicProgram[];
  users: User[];
  estamentos: Estamento[];
  customRoles: CustomRole[];
  meetings: Meeting[];
  motions: Motion[];
  commitments: Commitment[];
  qualityFactors: QualityFactor[];
  qualityMappings: ActQualityMapping[];
  accessRequests: AccessRequest[];
  notifications: InstitutionalNotification[];
  digitalSeals: DigitalActSeal[];
  auditLogs: ServerAuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'sig_curriculo_db.json');

export const DEFAULT_PROGRAMS: AcademicProgram[] = [
  {
    id: 'prog-mec',
    code: 'ING-MEC',
    name: 'Ingeniería Mecánica',
    level: 'pregrado',
    faculty: 'Facultad de Ingeniería',
    sniesCode: '108420',
    directorName: 'Dirección de Programa de Ingeniería Mecánica',
    directorEmail: 'autoevaluacionycurriculomecanica@umayor.edu.co',
    active: true,
    color: 'emerald',
    description: 'Programa oficial acreditado en alta calidad. Formación en diseño mecánico, termofluidos, manufactura y automatización industrial.',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'prog-sis',
    code: 'ING-SIS',
    name: 'Ingeniería de Sistemas',
    level: 'pregrado',
    faculty: 'Facultad de Ingeniería',
    sniesCode: '109210',
    directorName: 'Dirección de Programa de Ingeniería de Sistemas',
    directorEmail: 'sistemas@umayor.edu.co',
    active: true,
    color: 'blue',
    description: 'Formación en ingeniería de software, arquitectura en la nube, ciberseguridad e inteligencia artificial aplicada.',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'prog-civ',
    code: 'ING-CIV',
    name: 'Ingeniería Civil',
    level: 'pregrado',
    faculty: 'Facultad de Ingeniería',
    sniesCode: '110530',
    directorName: 'Dirección de Programa de Ingeniería Civil',
    directorEmail: 'civil@umayor.edu.co',
    active: true,
    color: 'amber',
    description: 'Especializado en infraestructura sostenible, geotecnia, estructuras sismorresistentes e hidráulica costera.',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'prog-tec-elec',
    code: 'TEC-ELEC',
    name: 'Tecnología en Mantenimiento Electromecánico',
    level: 'tecnologia',
    faculty: 'Facultad de Ingeniería',
    sniesCode: '102140',
    directorName: 'Coordinación Tecnológica',
    directorEmail: 'electromecanica@umayor.edu.co',
    active: true,
    color: 'purple',
    description: 'Programa tecnológico enfocado en mantenimiento predictivo industrial, redes de potencia y plantas de producción.',
    createdAt: '2026-01-15T08:00:00.000Z',
  },
];

const INITIAL_ADMIN_USER: User = {
  id: 'usr-admin-principal',
  name: 'Super Administrador del Comité Curricular',
  email: 'autoevaluacionycurriculomecanica@umayor.edu.co',
  role: 'super_admin',
  department: 'Facultad de Ingeniería · Depto. Ingeniería Mecánica',
  academicTitle: 'Super Administrador / Presidencia Comité Curricular',
  avatarInitials: 'SA',
  hasVote: true,
  periodo: '2026 - 2028',
  active: true,
  password: 'AdminCurriculo2026*',
  programIds: ['prog-mec', 'prog-sis', 'prog-civ', 'prog-tec-elec'],
  primaryProgramId: 'prog-mec',
};

const DEFAULT_ESTAMENTOS: Estamento[] = [
  {
    id: 'est-doc-1',
    name: 'Estamento Profesoral / Docente',
    code: 'DOC',
    description: 'Profesores de planta y de cátedra del programa de Ingeniería Mecánica.',
    category: 'docente',
    hasStatutoryVote: true,
    active: true,
  },
  {
    id: 'est-est-1',
    name: 'Estamento Estudiantil',
    code: 'EST',
    description: 'Representantes electos por el estudiantado de pregrado.',
    category: 'estudiantil',
    hasStatutoryVote: true,
    active: true,
  },
  {
    id: 'est-egr-1',
    name: 'Estamento de Egresados',
    code: 'EGR',
    description: 'Representante de los graduados en el medio profesional e industrial.',
    category: 'egresado',
    hasStatutoryVote: true,
    active: true,
  },
  {
    id: 'est-dir-1',
    name: 'Directivo / Decanatura y Dirección',
    code: 'DIR',
    description: 'Decanatura de Facultad y Dirección de Programa Académico.',
    category: 'directivo',
    hasStatutoryVote: true,
    active: true,
  },
  {
    id: 'est-ext-1',
    name: 'Sector Productivo / Externo',
    code: 'EXT',
    description: 'Representantes de gremios, empresas aliadas y Consejo Asesor Industrial.',
    category: 'externo',
    hasStatutoryVote: false,
    active: true,
  },
];

const DEFAULT_CUSTOM_ROLES: CustomRole[] = [
  {
    id: 'role-pres-1',
    name: 'Presidente / Director de Comité',
    code: 'PRESIDENTE',
    description: 'Dirige sesiones, convoca orden del día, formula mociones y refrenda actas con firma digital.',
    baseRole: 'presidente',
    canVote: true,
    canSignActs: true,
    canAuditCommitments: true,
    canMapQuality: true,
    isAdmin: true,
    color: 'slate',
  },
  {
    id: 'role-miem-1',
    name: 'Miembro Principal del Comité',
    code: 'VOCAL_DOCENTE',
    description: 'Participa con voz y voto estatutario en debates, aprobación de acuerdos y votaciones nominales.',
    baseRole: 'miembro',
    canVote: true,
    canSignActs: false,
    canAuditCommitments: false,
    canMapQuality: false,
    isAdmin: false,
    color: 'emerald',
  },
  {
    id: 'role-seg-1',
    name: 'Encargado de Seguimiento y Control',
    code: 'AUDITOR_SEGUIMIENTO',
    description: 'Monitorea el cumplimiento de compromisos, audita evidencias en Google Drive y remite alertas de vencimiento.',
    baseRole: 'seguimiento',
    canVote: false,
    canSignActs: false,
    canAuditCommitments: true,
    canMapQuality: false,
    isAdmin: true,
    color: 'blue',
  },
  {
    id: 'role-auto-1',
    name: 'Gestor de Autoevaluación & Calidad',
    code: 'GESTOR_CALIDAD',
    description: 'Indexa acuerdos de actas en factores, características y aspectos para el proceso de autoevaluación curricular y calidad institucional.',
    baseRole: 'autoevaluacion',
    canVote: false,
    canSignActs: false,
    canAuditCommitments: false,
    canMapQuality: true,
    isAdmin: true,
    color: 'purple',
  },
  {
    id: 'role-inv-1',
    name: 'Invitado Externo / Sector Productivo',
    code: 'INVITADO_EXT',
    description: 'Participa con voz consultiva en temas curriculares específicos y radica evidencias de compromisos externos.',
    baseRole: 'invitado_externo',
    canVote: false,
    canSignActs: false,
    canAuditCommitments: false,
    canMapQuality: false,
    isAdmin: false,
    color: 'amber',
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private getInitialData(): DatabaseSchema {
    return {
      programs: DEFAULT_PROGRAMS,
      users: [INITIAL_ADMIN_USER],
      estamentos: DEFAULT_ESTAMENTOS,
      customRoles: DEFAULT_CUSTOM_ROLES,
      meetings: [],
      motions: [],
      commitments: [],
      qualityFactors: [],
      qualityMappings: [],
      accessRequests: [],
      notifications: [
        {
          id: 'notif-init-1',
          title: 'Sistema SIG-Currículo Inicializado',
          message: 'Base de datos del servidor y servicios de autenticación y PKI activos.',
          date: new Date().toISOString().slice(0, 10),
          read: false,
          recipientRoles: ['presidente', 'seguimiento', 'autoevaluacion'],
          type: 'sistema',
        },
      ],
      digitalSeals: [],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: 'system',
          userName: 'Sistema Backend Express',
          userRole: 'sistema',
          action: 'INIT_SERVER_DATABASE',
          resource: 'system',
          details: 'Inicialización de almacén de datos persistente en servidor.',
        },
      ],
    };
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Merge with initial data structure in case new tables were added
        const initial = this.getInitialData();
        return {
          programs: parsed.programs && parsed.programs.length > 0 ? parsed.programs : initial.programs,
          users: parsed.users || initial.users,
          estamentos: parsed.estamentos || initial.estamentos,
          customRoles: parsed.customRoles || initial.customRoles,
          meetings: parsed.meetings || initial.meetings,
          motions: parsed.motions || initial.motions,
          commitments: parsed.commitments || initial.commitments,
          qualityFactors: parsed.qualityFactors || initial.qualityFactors,
          qualityMappings: parsed.qualityMappings || initial.qualityMappings,
          accessRequests: parsed.accessRequests || initial.accessRequests,
          notifications: parsed.notifications || initial.notifications,
          digitalSeals: parsed.digitalSeals || initial.digitalSeals,
          auditLogs: parsed.auditLogs || initial.auditLogs,
        };
      }
    } catch (err) {
      console.error('[DB] Error loading database file, reinitializing default store:', err);
    }

    const defaultData = this.getInitialData();
    this.saveDatabase(defaultData);
    return defaultData;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    try {
      this.ensureDataDir();
      const payload = JSON.stringify(dataToSave || this.data, null, 2);
      fs.writeFileSync(DB_FILE, payload, 'utf-8');
    } catch (err) {
      console.error('[DB] Error persisting database to disk:', err);
    }
  }

  // Audit Logger
  public logAudit(log: Omit<ServerAuditLog, 'id' | 'timestamp'>) {
    const entry: ServerAuditLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(entry);
    // Keep max 1000 logs in storage
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 1000);
    }
    this.saveDatabase();
    return entry;
  }

  // Generic Getters
  public getAll(): DatabaseSchema {
    return this.data;
  }

  // Academic Programs
  public getPrograms(): AcademicProgram[] {
    return this.data.programs || [];
  }

  public getProgramById(id: string): AcademicProgram | undefined {
    return (this.data.programs || []).find((p) => p.id === id);
  }

  public addProgram(program: AcademicProgram): AcademicProgram {
    if (!this.data.programs) this.data.programs = [];
    this.data.programs.push(program);
    this.saveDatabase();
    return program;
  }

  public updateProgram(id: string, updates: Partial<AcademicProgram>): AcademicProgram | null {
    if (!this.data.programs) this.data.programs = [];
    const idx = this.data.programs.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.programs[idx] = { ...this.data.programs[idx], ...updates };
    this.saveDatabase();
    return this.data.programs[idx];
  }

  public deleteProgram(id: string): boolean {
    if (!this.data.programs) return false;
    const initialLen = this.data.programs.length;
    this.data.programs = this.data.programs.filter((p) => p.id !== id);
    if (this.data.programs.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public addUser(user: User): User {
    this.data.users.push(user);
    this.saveDatabase();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.saveDatabase();
    return this.data.users[idx];
  }

  public deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== id);
    if (this.data.users.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // Estamentos
  public getEstamentos(): Estamento[] {
    return this.data.estamentos;
  }

  public addEstamento(est: Estamento): Estamento {
    this.data.estamentos.push(est);
    this.saveDatabase();
    return est;
  }

  public updateEstamento(id: string, updates: Partial<Estamento>): Estamento | null {
    const idx = this.data.estamentos.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    this.data.estamentos[idx] = { ...this.data.estamentos[idx], ...updates };
    this.saveDatabase();
    return this.data.estamentos[idx];
  }

  public deleteEstamento(id: string): boolean {
    const initLen = this.data.estamentos.length;
    this.data.estamentos = this.data.estamentos.filter((e) => e.id !== id);
    if (this.data.estamentos.length !== initLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // Custom Roles
  public getCustomRoles(): CustomRole[] {
    return this.data.customRoles;
  }

  public addCustomRole(role: CustomRole): CustomRole {
    this.data.customRoles.push(role);
    this.saveDatabase();
    return role;
  }

  public updateCustomRole(id: string, updates: Partial<CustomRole>): CustomRole | null {
    const idx = this.data.customRoles.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.data.customRoles[idx] = { ...this.data.customRoles[idx], ...updates };
    this.saveDatabase();
    return this.data.customRoles[idx];
  }

  public deleteCustomRole(id: string): boolean {
    const initLen = this.data.customRoles.length;
    this.data.customRoles = this.data.customRoles.filter((r) => r.id !== id);
    if (this.data.customRoles.length !== initLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // Meetings
  public getMeetings(): Meeting[] {
    return this.data.meetings;
  }

  public getMeetingById(id: string): Meeting | undefined {
    return this.data.meetings.find((m) => m.id === id);
  }

  public addMeeting(meeting: Meeting): Meeting {
    this.data.meetings.unshift(meeting);
    this.saveDatabase();
    return meeting;
  }

  public updateMeeting(id: string, updates: Partial<Meeting>): Meeting | null {
    const idx = this.data.meetings.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.data.meetings[idx] = { ...this.data.meetings[idx], ...updates };
    this.saveDatabase();
    return this.data.meetings[idx];
  }

  // Motions
  public getMotions(): Motion[] {
    return this.data.motions;
  }

  public getMotionById(id: string): Motion | undefined {
    return this.data.motions.find((m) => m.id === id);
  }

  public addMotion(motion: Motion): Motion {
    this.data.motions.unshift(motion);
    this.saveDatabase();
    return motion;
  }

  public updateMotion(id: string, updates: Partial<Motion>): Motion | null {
    const idx = this.data.motions.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.data.motions[idx] = { ...this.data.motions[idx], ...updates };
    this.saveDatabase();
    return this.data.motions[idx];
  }

  // Commitments
  public getCommitments(): Commitment[] {
    return this.data.commitments;
  }

  public getCommitmentById(id: string): Commitment | undefined {
    return this.data.commitments.find((c) => c.id === id);
  }

  public addCommitment(commitment: Commitment): Commitment {
    this.data.commitments.unshift(commitment);
    this.saveDatabase();
    return commitment;
  }

  public updateCommitment(id: string, updates: Partial<Commitment>): Commitment | null {
    const idx = this.data.commitments.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.data.commitments[idx] = { ...this.data.commitments[idx], ...updates };
    this.saveDatabase();
    return this.data.commitments[idx];
  }

  // Quality Factors
  public getQualityFactors(): QualityFactor[] {
    return this.data.qualityFactors;
  }

  public setQualityFactors(factors: QualityFactor[]): QualityFactor[] {
    this.data.qualityFactors = factors;
    this.saveDatabase();
    return factors;
  }

  public addQualityFactor(factor: QualityFactor): QualityFactor {
    this.data.qualityFactors.push(factor);
    this.saveDatabase();
    return factor;
  }

  public deleteQualityFactor(id: string): boolean {
    const initLen = this.data.qualityFactors.length;
    this.data.qualityFactors = this.data.qualityFactors.filter((f) => f.id !== id);
    if (this.data.qualityFactors.length !== initLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // Quality Mappings
  public getQualityMappings(): ActQualityMapping[] {
    return this.data.qualityMappings;
  }

  public addQualityMapping(mapping: ActQualityMapping): ActQualityMapping {
    this.data.qualityMappings.unshift(mapping);
    this.saveDatabase();
    return mapping;
  }

  public deleteQualityMapping(id: string): boolean {
    const initLen = this.data.qualityMappings.length;
    this.data.qualityMappings = this.data.qualityMappings.filter((m) => m.id !== id);
    if (this.data.qualityMappings.length !== initLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // Access Requests
  public getAccessRequests(): AccessRequest[] {
    return this.data.accessRequests;
  }

  public addAccessRequest(req: AccessRequest): AccessRequest {
    this.data.accessRequests.unshift(req);
    this.saveDatabase();
    return req;
  }

  public updateAccessRequest(id: string, updates: Partial<AccessRequest>): AccessRequest | null {
    const idx = this.data.accessRequests.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    this.data.accessRequests[idx] = { ...this.data.accessRequests[idx], ...updates };
    this.saveDatabase();
    return this.data.accessRequests[idx];
  }

  // Notifications
  public getNotifications(): InstitutionalNotification[] {
    return this.data.notifications;
  }

  public addNotification(notif: InstitutionalNotification): InstitutionalNotification {
    this.data.notifications.unshift(notif);
    this.saveDatabase();
    return notif;
  }

  public markNotificationRead(id: string): boolean {
    const idx = this.data.notifications.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    this.data.notifications[idx].read = true;
    this.saveDatabase();
    return true;
  }

  // Digital Seals
  public getDigitalSeals(): DigitalActSeal[] {
    return this.data.digitalSeals;
  }

  public getDigitalSealByMeetingId(meetingId: string): DigitalActSeal | undefined {
    return this.data.digitalSeals.find((s) => s.meetingId === meetingId);
  }

  public getDigitalSealByHash(hash: string): DigitalActSeal | undefined {
    return this.data.digitalSeals.find((s) => s.sha256Hash.toLowerCase() === hash.toLowerCase());
  }

  public addDigitalSeal(seal: DigitalActSeal): DigitalActSeal {
    this.data.digitalSeals.unshift(seal);
    this.saveDatabase();
    return seal;
  }
}

export const db = new Database();
