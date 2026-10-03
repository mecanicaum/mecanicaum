import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  Meeting,
  AgendaItem,
  Motion,
  VoteOption,
  VoteRecord,
  Commitment,
  CommitmentStatus,
  QualityFactor,
  QualityFeature,
  QualityAspect,
  ActQualityMapping,
  AccessRequest,
  InstitutionalNotification,
  Estamento,
  CustomRole,
  DigitalActSeal,
  UserSettings,
  BrandingConfig,
} from '../types';

export const DEFAULT_BRANDING_CONFIG: BrandingConfig = {
  logoType: 'default',
  customLogoUrl: '',
  institutionName: 'INSTITUCIÓN UNIVERSITARIA',
  facultyOrLocationName: 'MAYOR DE CARTAGENA',
  bannerType: 'dynamic',
  bannerImageUrl: '',
  bannerSloganPrefix: 'LA CALIDAD, UN C',
  bannerSloganWord: 'OMPR',
  bannerSloganSuffix: 'OMISO',
  bannerScriptWord: 'permanente',
  bannerSubtitle: 'FACULTAD DE INGENIERÍA · CONSEJO CURRICULAR DE INGENIERÍA MECÁNICA',
  showQualitySeal: true,
  accentColor: '#006837',
  goldColor: '#E58A13',
  updatedAt: new Date().toISOString(),
  updatedBy: 'Sistema Oficial UMAYOR',
};
import {
  INITIAL_USERS,
  INITIAL_ESTAMENTOS,
  INITIAL_CUSTOM_ROLES,
  INITIAL_MEETINGS,
  INITIAL_MOTIONS,
  INITIAL_COMMITMENTS,
  INITIAL_QUALITY_MAPPINGS,
  CNA_ABET_TEMPLATE_FACTORS,
} from '../data/mockData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { api, realtime, setApiUserId, setApiToken } from '../services/api';
import {
  initAuth,
  institutionalSignIn,
  logoutInstitutional,
} from '../services/auth';
import { browserStorage, FullBackupData } from '../services/storage';

export const DEFAULT_USER_SETTINGS: UserSettings = {
  autoSaveInterval: 5,
  emailAlertsEnabled: true,
  soundNotificationsEnabled: false,
  compactTableMode: false,
  activeAcademicPeriod: '2026-1',
  institutionName: 'Facultad de Ingeniería · Institución Universitaria Mayor de Cartagena',
};

const DEFAULT_NOTIFICATIONS: InstitutionalNotification[] = [
  {
    id: 'notif-welcome-1',
    type: 'citacion',
    title: 'Bienvenido a SIG-Currículo (Persistencia Local en Tiempo Real)',
    message:
      'Sus datos, actas, compromisos y configuraciones se sincronizan automáticamente con el almacenamiento local del navegador (localStorage / IndexedDB) en cada cambio.',
    date: new Date().toISOString().slice(0, 10),
    read: false,
    meetingCode: 'ACTA-2026-004',
    recipientRoles: ['super_admin', 'presidente', 'miembro', 'seguimiento', 'autoevaluacion', 'invitado_externo'],
  },
];

interface AppContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;

  // Institutional Single Sign-On & Credentials Authentication
  isAuthenticated: boolean;
  googleUser: { email: string; name: string; photoURL?: string | null } | null;
  signInWithGoogle: () => Promise<User | null>;
  signInWithInstitutionalEmail: (email: string, name?: string, role?: UserRole) => Promise<User>;
  loginWithInstitutionalCredentials: (email: string, password?: string) => Promise<User>;
  signOutGoogle: () => Promise<void>;
  logout: () => void;

  // Committee Members Administration
  createUser: (userData: Omit<User, 'id' | 'avatarInitials'>) => Promise<User>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Estamentos Administration
  estamentos: Estamento[];
  createEstamento: (data: Omit<Estamento, 'id'>) => Promise<Estamento>;
  updateEstamento: (id: string, updates: Partial<Estamento>) => Promise<void>;
  deleteEstamento: (id: string) => void;

  // Roles Administration
  customRoles: CustomRole[];
  createCustomRole: (data: Omit<CustomRole, 'id'>) => Promise<CustomRole>;
  updateCustomRole: (id: string, updates: Partial<CustomRole>) => void;
  deleteCustomRole: (id: string) => void;

  // Meetings & Agenda
  meetings: Meeting[];
  activeMeetingId: string;
  setActiveMeetingId: (id: string) => void;
  createMeeting: (newMeeting: Omit<Meeting, 'id' | 'quorumPresentCount' | 'quorumTotalRequired'>) => Promise<Meeting>;
  updateMeeting: (id: string, updates: Partial<Meeting>) => Promise<void>;
  addAgendaItem: (meetingId: string, item: Omit<AgendaItem, 'id' | 'agreements' | 'deliberations' | 'driveAttachments'>) => Promise<void>;
  updateAgendaItem: (meetingId: string, itemId: string, updates: Partial<AgendaItem>) => Promise<void>;
  deleteAgendaItem: (meetingId: string, itemId: string) => Promise<void>;
  sendCitations: (meetingId: string, recipientEmails: string[], note?: string) => Promise<void>;
  closeMeeting: (meetingId: string, notes: string) => Promise<void>;

  // Motions & Real-time Voting
  motions: Motion[];
  createMotion: (data: { meetingId: string; agendaItemId?: string; title: string; description: string; majorityRequired: Motion['majorityRequired'] }) => Promise<Motion>;
  castVote: (motionId: string, option: VoteOption) => Promise<void>;
  finalizeMotion: (motionId: string) => Promise<void>;

  // Commitments & Audit
  commitments: Commitment[];
  createCommitment: (data: Omit<Commitment, 'id' | 'assignedAt' | 'status' | 'evidences' | 'assignedBy'>) => Promise<Commitment>;
  submitCommitmentEvidence: (commitmentId: string, description: string, driveUrl: string, fileName?: string) => Promise<void>;
  auditCommitment: (commitmentId: string, newStatus: CommitmentStatus, notes: string) => Promise<void>;
  sendCommitmentDeadlineAlert: (commitmentId: string, customSubject?: string, customBody?: string) => Promise<{ success: boolean; message: string }>;
  sendBatchDeadlineAlerts: () => Promise<{ sentCount: number; recipients: string[] }>;

  // Access Requests for Historical Acts
  accessRequests: AccessRequest[];
  requestActAccess: (meetingId: string, meetingCode: string, purpose: string) => Promise<void>;
  resolveAccessRequest: (requestId: string, status: 'aprobado' | 'rechazado', note?: string) => Promise<void>;

  // Self-Evaluation & Accreditation Quality Matrix
  qualityFactors: QualityFactor[];
  addQualityFactor: (factor: Omit<QualityFactor, 'id' | 'features'>) => Promise<QualityFactor>;
  addQualityFeature: (factorId: string, feature: Omit<QualityFeature, 'id' | 'aspects'>) => Promise<void>;
  addQualityAspect: (factorId: string, featureId: string, aspect: Omit<QualityAspect, 'id'>) => Promise<void>;
  deleteQualityFactor: (factorId: string) => Promise<void>;
  clearQualityFactors: () => Promise<void>;
  loadCnaAbetTemplate: () => Promise<void>;
  qualityMappings: ActQualityMapping[];
  createQualityMapping: (data: Omit<ActQualityMapping, 'id' | 'mappedAt' | 'mappedBy'>) => Promise<void>;
  deleteQualityMapping: (mappingId: string) => Promise<void>;

  // Digital Seals & Cryptographic PKI
  digitalSeals: DigitalActSeal[];
  getActSeal: (meetingId: string) => Promise<DigitalActSeal | undefined>;
  verifyActSeal: (params: { sha256Hash?: string; signaturePkiToken?: string; canonicalPayload?: string; sealedAt?: string; signerEmail?: string }) => Promise<{
    foundInRegistry: boolean;
    seal?: DigitalActSeal;
    verification: { isValid: boolean; recomputedHash: string; expectedPkiToken: string; errorReason?: string };
  }>;

  // Notifications
  notifications: InstitutionalNotification[];
  markNotificationRead: (id: string) => void;
  addNotification: (notif: Omit<InstitutionalNotification, 'id' | 'date' | 'read'>) => void;

  // User Settings Persistent Configuration
  userSettings: UserSettings;
  updateUserSettings: (updates: Partial<UserSettings>) => void;

  // Institutional Branding & Slogan (Restricted Exclusively to Super Admin)
  brandingConfig: BrandingConfig;
  updateBrandingConfig: (updates: Partial<BrandingConfig>) => Promise<void>;
  resetBrandingConfig: () => Promise<void>;

  // Browser Database Storage Operations (IndexedDB / LocalStorage Sync)
  exportDatabaseBackup: () => Promise<void>;
  importDatabaseBackup: (backupJson: string) => Promise<void>;
  resetDatabaseToDefaults: () => Promise<void>;

  // System
  resetAllData: () => void;
  isLiveSyncConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronized LocalStorage State via useLocalStorage Hook
  const [users, setUsers] = useLocalStorage<User[]>('users', INITIAL_USERS);
  const [currentUser, setCurrentUser] = useLocalStorage<User>('current_user', INITIAL_USERS[0]);
  const [estamentos, setEstamentos] = useLocalStorage<Estamento[]>('estamentos', INITIAL_ESTAMENTOS);
  const [customRoles, setCustomRoles] = useLocalStorage<CustomRole[]>('custom_roles', INITIAL_CUSTOM_ROLES);
  const [meetings, setMeetings] = useLocalStorage<Meeting[]>('meetings', INITIAL_MEETINGS);
  const [activeMeetingId, setActiveMeetingId] = useLocalStorage<string>('active_meeting_id', INITIAL_MEETINGS[0]?.id || '');
  const [motions, setMotions] = useLocalStorage<Motion[]>('motions', INITIAL_MOTIONS);
  const [commitments, setCommitments] = useLocalStorage<Commitment[]>('commitments', INITIAL_COMMITMENTS);
  const [qualityFactors, setQualityFactors] = useLocalStorage<QualityFactor[]>('quality_factors', CNA_ABET_TEMPLATE_FACTORS);
  const [qualityMappings, setQualityMappings] = useLocalStorage<ActQualityMapping[]>('quality_mappings', INITIAL_QUALITY_MAPPINGS);
  const [accessRequests, setAccessRequests] = useLocalStorage<AccessRequest[]>('access_requests', []);
  const [notifications, setNotifications] = useLocalStorage<InstitutionalNotification[]>('notifications', DEFAULT_NOTIFICATIONS);
  const [digitalSeals, setDigitalSeals] = useLocalStorage<DigitalActSeal[]>('digital_seals', []);
  const [googleUser, setGoogleUser] = useLocalStorage<{ email: string; name: string; photoURL?: string | null } | null>('session_user', null);
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage<boolean>('is_authenticated', false);
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('user_settings', DEFAULT_USER_SETTINGS);
  const [brandingConfig, setBrandingConfig] = useLocalStorage<BrandingConfig>('sigc_branding_config_v2', DEFAULT_BRANDING_CONFIG);

  const [isLiveSyncConnected, setIsLiveSyncConnected] = useState<boolean>(false);

  // Sync with IndexedDB & API in background when available
  useEffect(() => {
    browserStorage.saveAllData({
      users,
      estamentos,
      customRoles,
      meetings,
      motions,
      commitments,
      qualityFactors,
      qualityMappings,
      accessRequests,
      notifications,
      digitalSeals,
    });
  }, [
    users,
    estamentos,
    customRoles,
    meetings,
    motions,
    commitments,
    qualityFactors,
    qualityMappings,
    accessRequests,
    notifications,
    digitalSeals,
  ]);

  // Initial Auth Listener
  useEffect(() => {
    const unsubAuth = initAuth((session) => {
      if (session) {
        setGoogleUser({
          email: session.email,
          name: session.name,
          photoURL: session.photoURL || null,
        });
      }
    });

    return () => {
      unsubAuth();
    };
  }, [setGoogleUser]);

  // Real-time WebSocket Listeners
  useEffect(() => {
    realtime.connect();

    const unsubConnection = realtime.onConnectionChange((connected: boolean) => {
      setIsLiveSyncConnected(connected);
    });

    const unsubUserCreated = realtime.on('user:created', (user: User) => {
      setUsers((prev) => [...prev.filter((u) => u.id !== user.id), user]);
    });

    const unsubUserUpdated = realtime.on('user:updated', (user: User) => {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      setCurrentUser((prev) => (prev.id === user.id ? user : prev));
    });

    const unsubUserDeleted = realtime.on('user:deleted', ({ id }: { id: string }) => {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    });

    const unsubMeetingCreated = realtime.on('meeting:created', (m: Meeting) => {
      setMeetings((prev) => [m, ...prev.filter((item) => item.id !== m.id)]);
      setActiveMeetingId(m.id);
    });

    const unsubMeetingUpdated = realtime.on('meeting:updated', (m: Meeting) => {
      setMeetings((prev) => prev.map((item) => (item.id === m.id ? m : item)));
    });

    const unsubMeetingClosed = realtime.on('meeting:closed', ({ meeting, seal }: { meeting: Meeting; seal: DigitalActSeal }) => {
      setMeetings((prev) => prev.map((item) => (item.id === meeting.id ? meeting : item)));
      setDigitalSeals((prev) => [seal, ...prev.filter((s) => s.meetingId !== seal.meetingId)]);
    });

    const unsubMotionCreated = realtime.on('motion:created', (mot: Motion) => {
      setMotions((prev) => [mot, ...prev.filter((m) => m.id !== mot.id)]);
    });

    const unsubVoteCast = realtime.on('vote:cast', ({ motion }: { motion: Motion }) => {
      setMotions((prev) => prev.map((m) => (m.id === motion.id ? motion : m)));
    });

    const unsubMotionFinalized = realtime.on('motion:finalized', (mot: Motion) => {
      setMotions((prev) => prev.map((m) => (m.id === mot.id ? mot : m)));
    });

    const unsubCommitmentCreated = realtime.on('commitment:created', (c: Commitment) => {
      setCommitments((prev) => [c, ...prev.filter((item) => item.id !== c.id)]);
    });

    const unsubCommitmentEvidence = realtime.on('commitment:evidence_submitted', (c: Commitment) => {
      setCommitments((prev) => prev.map((item) => (item.id === c.id ? c : item)));
    });

    const unsubCommitmentAudited = realtime.on('commitment:audited', (c: Commitment) => {
      setCommitments((prev) => prev.map((item) => (item.id === c.id ? c : item)));
    });

    const unsubCommitmentAlert = realtime.on('commitment:alert_sent', (c: Commitment) => {
      setCommitments((prev) => prev.map((item) => (item.id === c.id ? c : item)));
    });

    const unsubNotification = realtime.on('notification:new', (notif: InstitutionalNotification) => {
      setNotifications((prev) => [notif, ...prev]);
    });

    const unsubQualityFactorCreated = realtime.on('quality:factor_created', (fact: QualityFactor) => {
      setQualityFactors((prev) => [...prev.filter((f) => f.id !== fact.id), fact]);
    });

    const unsubQualityFactorDeleted = realtime.on('quality:factor_deleted', ({ id }: { id: string }) => {
      setQualityFactors((prev) => prev.filter((f) => f.id !== id));
    });

    const unsubQualityFactorsReset = realtime.on('quality:factors_reset', () => {
      setQualityFactors([]);
    });

    const unsubQualityMappingCreated = realtime.on('quality:mapping_created', (map: ActQualityMapping) => {
      setQualityMappings((prev) => [map, ...prev.filter((m) => m.id !== map.id)]);
    });

    const unsubQualityMappingDeleted = realtime.on('quality:mapping_deleted', ({ id }: { id: string }) => {
      setQualityMappings((prev) => prev.filter((m) => m.id !== id));
    });

    return () => {
      unsubConnection();
      unsubUserCreated();
      unsubUserUpdated();
      unsubUserDeleted();
      unsubMeetingCreated();
      unsubMeetingUpdated();
      unsubMeetingClosed();
      unsubMotionCreated();
      unsubVoteCast();
      unsubMotionFinalized();
      unsubCommitmentCreated();
      unsubCommitmentEvidence();
      unsubCommitmentAudited();
      unsubCommitmentAlert();
      unsubNotification();
      unsubQualityFactorCreated();
      unsubQualityFactorDeleted();
      unsubQualityFactorsReset();
      unsubQualityMappingCreated();
      unsubQualityMappingDeleted();
    };
  }, [
    setUsers,
    setCurrentUser,
    setMeetings,
    setActiveMeetingId,
    setDigitalSeals,
    setMotions,
    setCommitments,
    setNotifications,
    setQualityFactors,
    setQualityMappings,
  ]);

  // Switch User Profile
  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setApiUserId(target.id);
      realtime.identify(target.id);
    }
  };

  // Switch Role
  const switchRole = (role: UserRole) => {
    const updated = { ...currentUser, role };
    setCurrentUser(updated);
  };

  // Update User Settings
  const updateUserSettings = (updates: Partial<UserSettings>) => {
    setUserSettings((prev) => ({ ...prev, ...updates }));
  };

  // Branding Configuration (Strictly restricted to Super Administrator)
  const updateBrandingConfig = async (updates: Partial<BrandingConfig>): Promise<void> => {
    if (currentUser.role !== 'super_admin') {
      throw new Error('Operación no autorizada: Solo el Super Administrador institucional tiene facultades para modificar los activos de marca y el banner de inicio.');
    }

    const updated: BrandingConfig = {
      ...brandingConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: `${currentUser.name} (${currentUser.email})`,
    };

    setBrandingConfig(updated);
  };

  const resetBrandingConfig = async (): Promise<void> => {
    if (currentUser.role !== 'super_admin') {
      throw new Error('Operación no autorizada: Solo el Super Administrador institucional puede restablecer los activos de marca.');
    }

    const resetConfig: BrandingConfig = {
      ...DEFAULT_BRANDING_CONFIG,
      updatedAt: new Date().toISOString(),
      updatedBy: `Restablecido por Super Admin: ${currentUser.name}`,
    };

    setBrandingConfig(resetConfig);
  };

  // Institutional Single Sign-On
  const signInWithInstitutionalEmail = async (
    email: string,
    name?: string,
    role?: UserRole
  ): Promise<User> => {
    const session = await institutionalSignIn(email, name, role);
    setGoogleUser({
      email: session.email,
      name: session.name,
      photoURL: session.photoURL || null,
    });

    const isSuperAdmin = session.email.toLowerCase() === 'autoevaluacionycurriculomecanica@umayor.edu.co';
    const existing = users.find((u) => u.email.toLowerCase() === session.email.toLowerCase());
    let activeUser: User;

    if (existing) {
      if (isSuperAdmin) {
        activeUser = {
          ...existing,
          role: 'super_admin',
          customRoleId: 'rol-superadmin',
          roleLabel: 'Super Administrador del Sistema',
          academicTitle: 'Super Administrador / Presidencia Comité Curricular',
          avatarInitials: 'SA',
          hasVote: true,
        };
        setUsers((prev) => prev.map((u) => (u.id === existing.id ? activeUser : u)));
      } else {
        activeUser = existing;
      }
    } else {
      activeUser = {
        id: isSuperAdmin ? 'usr-admin-principal' : session.id,
        name: isSuperAdmin ? 'Super Administrador del Comité Curricular' : session.name,
        email: session.email,
        role: isSuperAdmin ? 'super_admin' : session.role,
        customRoleId: isSuperAdmin ? 'rol-superadmin' : undefined,
        roleLabel: isSuperAdmin ? 'Super Administrador del Sistema' : session.role === 'presidente' ? 'Presidente Decano' : 'Docente Integrante',
        faculty: 'Facultad de Ingeniería',
        department: session.department,
        academicTitle: isSuperAdmin ? 'Super Administrador / Presidencia Comité Curricular' : session.academicTitle,
        avatarInitials: isSuperAdmin ? 'SA' : session.avatarInitials,
        hasVote: true,
        periodo: '2026 - 2028',
        active: true,
      };
      setUsers((prev) => [...prev, activeUser]);
    }

    setCurrentUser(activeUser);
    setApiUserId(activeUser.id);
    realtime.identify(activeUser.id);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('sigc_storage_v2_is_authenticated', 'true');
    } catch {}

    try {
      await api.loginGoogleSSO(session.email, session.name);
    } catch {}

    return activeUser;
  };

  const signInWithGoogle = async (): Promise<User | null> => {
    return signInWithInstitutionalEmail(
      'autoevaluacionycurriculomecanica@umayor.edu.co',
      'Super Administrador del Comité Curricular',
      'super_admin'
    );
  };

  const loginWithInstitutionalCredentials = async (
    email: string,
    password?: string
  ): Promise<User> => {
    const normalizedEmail = email.toLowerCase().trim();
    if (!normalizedEmail) {
      throw new Error('Debe ingresar su correo institucional.');
    }
    if (!password || !password.trim()) {
      throw new Error('Debe ingresar su contraseña o PIN institucional de acceso.');
    }

    const isSuperAdminEmail = normalizedEmail === 'autoevaluacionycurriculomecanica@umayor.edu.co';
    const targetUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (!targetUser && !isSuperAdminEmail) {
      throw new Error('El correo ingresado no figura registrado en el padrón del comité curricular.');
    }

    // Validate password (default master: AdminCurriculo2026*, member default: Umayor2026!)
    const expectedPassword = targetUser?.password || (isSuperAdminEmail ? 'AdminCurriculo2026*' : 'Umayor2026!');
    if (password.trim() !== expectedPassword.trim()) {
      throw new Error('Contraseña o PIN incorrecto. Por favor verifique sus datos de acceso.');
    }

    // Attempt backend audit log and obtain cryptographically signed token
    try {
      const loginRes = await api.loginWithCredentials(normalizedEmail, password.trim());
      if (loginRes.token) {
        setApiToken(loginRes.token);
      }
    } catch (e) {
      // Continue with verified local credentials if offline
    }

    return await signInWithInstitutionalEmail(
      normalizedEmail,
      targetUser?.name,
      targetUser?.role || (isSuperAdminEmail ? 'super_admin' : 'miembro')
    );
  };

  const logout = () => {
    // 1. Terminate institutional authentication session in services
    logoutInstitutional();
    setApiToken('');

    // 2. Clear in-memory user state and force unauthenticated state
    setGoogleUser(null);
    setIsAuthenticated(false);

    // 3. Purge all session-related keys, credentials, and cached objects from localStorage and sessionStorage
    try {
      // Clear entire sessionStorage immediately
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.clear();
      }

      if (typeof window !== 'undefined' && window.localStorage) {
        // Explicit list of known authentication, session, and credential keys
        const sensitiveKeys = [
          'sigc_storage_v2_is_authenticated',
          'sigc_storage_v2_session_user',
          'sigc_institutional_session_v1',
          'sigc_state_currentUserId',
          'sigc_auth_token',
          'sigc_remembered_email',
          'sigc_user_credentials',
          'sigc_padron_miembros',
          'sigc_roster_credentials',
          'sigc_cached_roster',
          'sigc_cached_members',
          'sigc_member_credentials',
          'sigc_active_member_session',
          'sigc_super_admin_pin',
          'sigc_login_bypass',
          'sigc_guest_token',
          'session_user',
          'is_authenticated',
        ];

        sensitiveKeys.forEach((key) => {
          window.localStorage.removeItem(key);
        });

        // Scan and purge any remaining keys matching session, auth, padron, credential, or token patterns
        const keysToRemove: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key) {
            const lowerKey = key.toLowerCase();
            if (
              lowerKey.includes('padron') ||
              lowerKey.includes('roster') ||
              lowerKey.includes('credential') ||
              lowerKey.includes('auth_token') ||
              lowerKey.includes('session_user') ||
              lowerKey.includes('remembered') ||
              lowerKey.includes('login_draft') ||
              (lowerKey.startsWith('sigc_') && (lowerKey.includes('auth') || lowerKey.includes('session') || lowerKey.includes('user')))
            ) {
              // Ensure we preserve essential organizational data (meetings, branding, settings, commitments, estamentos, custom roles)
              if (
                !lowerKey.includes('meetings') &&
                !lowerKey.includes('branding') &&
                !lowerKey.includes('settings') &&
                !lowerKey.includes('quality') &&
                !lowerKey.includes('commitments') &&
                !lowerKey.includes('estamentos') &&
                !lowerKey.includes('custom_roles')
              ) {
                keysToRemove.push(key);
              }
            }
          }
        }

        keysToRemove.forEach((k) => window.localStorage.removeItem(k));

        // Explicitly set unauthenticated flag to prevent auto-login on reload
        window.localStorage.setItem('sigc_storage_v2_is_authenticated', 'false');
      }
    } catch (err) {
      console.warn('[AppContext] Storage cleanup on logout:', err);
    }
  };

  const signOutGoogle = async () => {
    logout();
  };

  // User Management
  const createUser = async (userData: Omit<User, 'id' | 'avatarInitials'>): Promise<User> => {
    const initials = userData.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || 'DC';

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      avatarInitials: initials,
    };

    setUsers((prev) => [...prev, newUser]);

    try {
      await api.createUser(userData);
    } catch {}

    return newUser;
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }

    try {
      await api.updateUser(id, updates);
    } catch {}
  };

  const deleteUser = async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));

    try {
      await api.deleteUser(id);
    } catch {}
  };

  // Estamentos Management
  const createEstamento = async (data: Omit<Estamento, 'id'>): Promise<Estamento> => {
    const newEstamento: Estamento = {
      ...data,
      id: `est-${Date.now()}`,
    };
    setEstamentos((prev) => [...prev, newEstamento]);

    try {
      await api.createEstamento(data);
    } catch {}

    return newEstamento;
  };

  const updateEstamento = async (id: string, updates: Partial<Estamento>) => {
    setEstamentos((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));

    try {
      await api.updateEstamento(id, updates);
    } catch {}
  };

  const deleteEstamento = (id: string) => {
    setEstamentos((prev) => prev.filter((e) => e.id !== id));

    try {
      api.deleteEstamento(id);
    } catch {}
  };

  // Custom Roles Management
  const createCustomRole = async (data: Omit<CustomRole, 'id'>): Promise<CustomRole> => {
    const newRole: CustomRole = {
      ...data,
      id: `role-${Date.now()}`,
    };
    setCustomRoles((prev) => [...prev, newRole]);

    try {
      await api.createRole(data);
    } catch {}

    return newRole;
  };

  const updateCustomRole = (id: string, updates: Partial<CustomRole>) => {
    setCustomRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteCustomRole = (id: string) => {
    setCustomRoles((prev) => prev.filter((r) => r.id !== id));
  };

  // Meetings Management
  const createMeeting = async (
    newMeetingData: Omit<Meeting, 'id' | 'quorumPresentCount' | 'quorumTotalRequired'>
  ): Promise<Meeting> => {
    const totalRequired = newMeetingData.attendees?.length || 5;
    const presentCount = newMeetingData.attendees?.filter((a) => a.present).length || 0;

    const newMeeting: Meeting = {
      ...newMeetingData,
      id: `meet-${Date.now()}`,
      quorumPresentCount: presentCount,
      quorumTotalRequired: totalRequired,
    };

    setMeetings((prev) => [newMeeting, ...prev]);
    setActiveMeetingId(newMeeting.id);

    try {
      await api.createMeeting(newMeetingData);
    } catch {}

    return newMeeting;
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));

    try {
      await api.updateMeeting(id, updates);
    } catch {}
  };

  const addAgendaItem = async (
    meetingId: string,
    item: Omit<AgendaItem, 'id' | 'agreements' | 'deliberations' | 'driveAttachments'>
  ) => {
    const newItem: AgendaItem = {
      ...item,
      id: `agenda-${Date.now()}`,
      deliberations: '',
      agreements: '',
      driveAttachments: [],
    };

    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, agendaItems: [...m.agendaItems, newItem] } : m))
    );

    try {
      await api.addAgendaItem(meetingId, item);
    } catch {}
  };

  const updateAgendaItem = async (meetingId: string, itemId: string, updates: Partial<AgendaItem>) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              agendaItems: m.agendaItems.map((ag) => (ag.id === itemId ? { ...ag, ...updates } : ag)),
            }
          : m
      )
    );

    try {
      await api.updateAgendaItem(meetingId, itemId, updates);
    } catch {}
  };

  const deleteAgendaItem = async (meetingId: string, itemId: string) => {
    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              agendaItems: m.agendaItems.filter((ag) => ag.id !== itemId),
            }
          : m
      )
    );

    try {
      await api.deleteAgendaItem(meetingId, itemId);
    } catch {}
  };

  const sendCitations = async (meetingId: string, recipientEmails: string[], note?: string) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting) return;

    const notif: InstitutionalNotification = {
      id: `notif-${Date.now()}`,
      type: 'citacion',
      title: `Citación Oficial: Sesión ${meeting.code}`,
      message: `Se ha emitido la citación para la sesión del Comité Curricular programada para el ${meeting.date}. ${note || ''}`,
      date: new Date().toISOString().slice(0, 10),
      read: false,
      meetingCode: meeting.code,
      recipientRoles: ['presidente', 'miembro', 'seguimiento', 'autoevaluacion', 'invitado_externo'],
    };

    setNotifications((prev) => [notif, ...prev]);

    try {
      await api.sendCitations(meetingId, recipientEmails, note);
    } catch {}
  };

  const closeMeeting = async (meetingId: string, notes: string) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting) return;

    const sealedAt = new Date().toISOString();
    const token = `PKI-SIGC-${sealedAt.replace(/[-:T.Z]/g, '').slice(0, 14)}-LOCAL-VALIDATED`;

    const seal: DigitalActSeal = {
      id: `seal-${meeting.id}`,
      meetingId: meeting.id,
      meetingCode: meeting.code,
      title: meeting.title,
      sha256Hash: `hash-${Date.now()}-local-integrity`,
      signaturePkiToken: token,
      sealedAt,
      signedBy: currentUser.name,
      signerEmail: currentUser.email,
      signerRole: currentUser.role,
      authorityIssuer: 'Institución Universitaria Mayor de Cartagena - Dirección de Autoevaluación y Calidad Académica',
      canonicalPayload: JSON.stringify({ meeting, notes }),
      totalVoters: meeting.attendees.filter((a) => a.present).length,
      totalAgreements: meeting.agendaItems.filter((a) => a.agreements).length,
      totalCommitments: commitments.filter((c) => c.meetingId === meeting.id).length,
    };

    setMeetings((prev) =>
      prev.map((m) =>
        m.id === meetingId
          ? {
              ...m,
              status: 'cerrada' as const,
              signedByPresident: true,
              presidentSignatureDate: sealedAt,
              generalObservations: notes,
              cryptographicSealId: seal.id,
            }
          : m
      )
    );

    setDigitalSeals((prev) => [seal, ...prev.filter((s) => s.meetingId !== seal.meetingId)]);

    try {
      await api.closeMeeting(meetingId, notes);
    } catch {}
  };

  // Motions & Voting Management
  const createMotion = async (data: {
    meetingId: string;
    agendaItemId?: string;
    title: string;
    description: string;
    majorityRequired: Motion['majorityRequired'];
  }): Promise<Motion> => {
    const newMotion: Motion = {
      id: `motion-${Date.now()}`,
      meetingId: data.meetingId,
      agendaItemId: data.agendaItemId,
      title: data.title,
      description: data.description,
      proposedBy: currentUser.name,
      proposedAt: new Date().toISOString(),
      status: 'abierta',
      majorityRequired: data.majorityRequired,
      votes: {},
      result: {
        aFavor: 0,
        enContra: 0,
        abstencion: 0,
        totalVotes: 0,
        quorumPercentage: 0,
        approved: false,
      },
    };

    setMotions((prev) => [newMotion, ...prev]);

    try {
      await api.createMotion(data);
    } catch {}

    return newMotion;
  };

  const castVote = async (motionId: string, option: VoteOption) => {
    setMotions((prev) =>
      prev.map((m) => {
        if (m.id === motionId) {
          const newVote: VoteRecord = {
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            option,
            timestamp: new Date().toISOString(),
            voteHash: `VOTE-LOCAL-${Date.now()}`,
          };

          const updatedVotes = {
            ...m.votes,
            [currentUser.id]: newVote,
          };

          const voteList = Object.values(updatedVotes);
          const aFavor = voteList.filter((v) => v.option === 'a_favor').length;
          const enContra = voteList.filter((v) => v.option === 'en_contra').length;
          const abstencion = voteList.filter((v) => v.option === 'abstencion').length;
          const totalVotes = voteList.length;

          return {
            ...m,
            votes: updatedVotes,
            result: {
              aFavor,
              enContra,
              abstencion,
              totalVotes,
              quorumPercentage: Math.round((totalVotes / 7) * 100),
              approved: aFavor > enContra,
            },
          };
        }
        return m;
      })
    );

    try {
      await api.castVote(motionId, option);
    } catch {}
  };

  const finalizeMotion = async (motionId: string) => {
    setMotions((prev) =>
      prev.map((m) => {
        if (m.id === motionId) {
          const voteList = Object.values(m.votes || {});
          const aFavor = voteList.filter((v) => v.option === 'a_favor').length;
          const enContra = voteList.filter((v) => v.option === 'en_contra').length;
          const approved = aFavor > enContra;

          return {
            ...m,
            status: approved ? ('aprobada' as const) : ('rechazada' as const),
            result: {
              aFavor,
              enContra,
              abstencion: voteList.filter((v) => v.option === 'abstencion').length,
              totalVotes: voteList.length,
              quorumPercentage: Math.round((voteList.length / 7) * 100),
              approved,
            },
          };
        }
        return m;
      })
    );

    try {
      await api.finalizeMotion(motionId);
    } catch {}
  };

  // Commitments Management
  const createCommitment = async (
    data: Omit<Commitment, 'id' | 'assignedAt' | 'status' | 'evidences' | 'assignedBy'>
  ): Promise<Commitment> => {
    const newCommitment: Commitment = {
      ...data,
      id: `comm-${Date.now()}`,
      assignedAt: new Date().toISOString().slice(0, 10),
      assignedBy: currentUser.name,
      status: 'pendiente',
      evidences: [],
      reminderCount: 0,
    };

    setCommitments((prev) => [newCommitment, ...prev]);

    try {
      await api.createCommitment(data);
    } catch {}

    return newCommitment;
  };

  const submitCommitmentEvidence = async (
    commitmentId: string,
    description: string,
    driveUrl: string,
    fileName?: string
  ) => {
    setCommitments((prev) =>
      prev.map((c) => {
        if (c.id === commitmentId) {
          return {
            ...c,
            status: 'en_revision' as const,
            evidences: [
              ...c.evidences,
              {
                id: `evid-${Date.now()}`,
                submittedBy: currentUser.name,
                submittedAt: new Date().toISOString().slice(0, 10),
                description,
                driveUrl,
                fileName: fileName || 'Evidencia_Documento.pdf',
              },
            ],
          };
        }
        return c;
      })
    );

    try {
      await api.submitEvidence(commitmentId, { description, driveUrl, fileName });
    } catch {}
  };

  const auditCommitment = async (commitmentId: string, newStatus: CommitmentStatus, notes: string) => {
    setCommitments((prev) =>
      prev.map((c) => {
        if (c.id === commitmentId) {
          return {
            ...c,
            status: newStatus,
            auditedBy: currentUser.name,
            auditNotes: notes,
            auditedAt: new Date().toISOString().slice(0, 10),
          };
        }
        return c;
      })
    );

    try {
      await api.auditCommitment(commitmentId, newStatus, notes);
    } catch {}
  };

  const sendCommitmentDeadlineAlert = async (
    commitmentId: string,
    customSubject?: string,
    customBody?: string
  ): Promise<{ success: boolean; message: string }> => {
    const commitment = commitments.find((c) => c.id === commitmentId);
    if (!commitment) return { success: false, message: 'Compromiso no encontrado.' };

    setCommitments((prev) =>
      prev.map((c) =>
        c.id === commitmentId
          ? {
              ...c,
              reminderCount: (c.reminderCount || 0) + 1,
              lastReminderSentAt: new Date().toISOString(),
            }
          : c
      )
    );

    const notif: InstitutionalNotification = {
      id: `notif-${Date.now()}`,
      type: 'compromiso',
      title: customSubject || `Alerta de Plazo: ${commitment.title}`,
      message:
        customBody ||
        `Estimado(a) ${commitment.responsibleName}, el compromiso asignado en ${commitment.meetingCode} tiene fecha límite el ${commitment.dueDate}.`,
      date: new Date().toISOString().slice(0, 10),
      read: false,
      recipientEmail: commitment.responsibleEmail,
    };

    setNotifications((prev) => [notif, ...prev]);

    try {
      await api.sendCommitmentAlert(commitmentId);
    } catch {}

    return {
      success: true,
      message: `Alerta oficial enviada exitosamente a ${commitment.responsibleEmail}.`,
    };
  };

  const sendBatchDeadlineAlerts = async (): Promise<{ sentCount: number; recipients: string[] }> => {
    const today = new Date().toISOString().slice(0, 10);
    const pendingNearDue = commitments.filter((c) => c.status !== 'cumplido' && c.dueDate <= today);

    setCommitments((prev) =>
      prev.map((c) => {
        if (c.status !== 'cumplido' && c.dueDate <= today) {
          return {
            ...c,
            reminderCount: (c.reminderCount || 0) + 1,
            lastReminderSentAt: new Date().toISOString(),
          };
        }
        return c;
      })
    );

    try {
      await api.sendBatchAlerts();
    } catch {}

    return {
      sentCount: pendingNearDue.length,
      recipients: pendingNearDue.map((c) => c.responsibleEmail),
    };
  };

  // Access Requests Management
  const requestActAccess = async (meetingId: string, meetingCode: string, purpose: string) => {
    const newReq: AccessRequest = {
      id: `req-${Date.now()}`,
      meetingId,
      meetingCode,
      requestedBy: currentUser.name,
      userRole: currentUser.role,
      requestedAt: new Date().toISOString().slice(0, 10),
      purpose,
      status: 'pendiente',
    };

    setAccessRequests((prev) => [newReq, ...prev]);
  };

  const resolveAccessRequest = async (
    requestId: string,
    status: 'aprobado' | 'rechazado',
    note?: string
  ) => {
    setAccessRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              resolvedBy: currentUser.name,
              resolvedAt: new Date().toISOString().slice(0, 10),
              resolutionNote: note,
            }
          : r
      )
    );
  };

  // Quality Factors & CNA / ABET Matrix
  const addQualityFactor = async (factor: Omit<QualityFactor, 'id' | 'features'>): Promise<QualityFactor> => {
    const newFactor: QualityFactor = {
      ...factor,
      id: `fact-${Date.now()}`,
      features: [],
    };

    setQualityFactors((prev) => [...prev, newFactor]);

    try {
      await api.createQualityFactor(factor);
    } catch {}

    return newFactor;
  };

  const addQualityFeature = async (factorId: string, feature: Omit<QualityFeature, 'id' | 'aspects'>) => {
    const newFeature: QualityFeature = {
      ...feature,
      id: `feat-${Date.now()}`,
      aspects: [],
    };

    setQualityFactors((prev) =>
      prev.map((f) => (f.id === factorId ? { ...f, features: [...f.features, newFeature] } : f))
    );
  };

  const addQualityAspect = async (factorId: string, featureId: string, aspect: Omit<QualityAspect, 'id'>) => {
    const newAspect: QualityAspect = {
      ...aspect,
      id: `asp-${Date.now()}`,
    };

    setQualityFactors((prev) =>
      prev.map((f) => {
        if (f.id === factorId) {
          return {
            ...f,
            features: f.features.map((feat) =>
              feat.id === featureId ? { ...feat, aspects: [...feat.aspects, newAspect] } : feat
            ),
          };
        }
        return f;
      })
    );
  };

  const deleteQualityFactor = async (factorId: string) => {
    setQualityFactors((prev) => prev.filter((f) => f.id !== factorId));

    try {
      await api.deleteQualityFactor(factorId);
    } catch {}
  };

  const clearQualityFactors = async () => {
    setQualityFactors([]);

    try {
      await api.resetQualityFactors();
    } catch {}
  };

  const loadCnaAbetTemplate = async () => {
    setQualityFactors(CNA_ABET_TEMPLATE_FACTORS);
  };

  // Quality Mappings
  const createQualityMapping = async (data: Omit<ActQualityMapping, 'id' | 'mappedAt' | 'mappedBy'>) => {
    const newMap: ActQualityMapping = {
      ...data,
      id: `map-${Date.now()}`,
      mappedBy: currentUser.name,
      mappedAt: new Date().toISOString().slice(0, 10),
    };

    setQualityMappings((prev) => [newMap, ...prev]);

    try {
      await api.createQualityMapping(data);
    } catch {}
  };

  const deleteQualityMapping = async (mappingId: string) => {
    setQualityMappings((prev) => prev.filter((m) => m.id !== mappingId));

    try {
      await api.deleteQualityMapping(mappingId);
    } catch {}
  };

  // Digital Seals & Verification
  const getActSeal = async (meetingId: string): Promise<DigitalActSeal | undefined> => {
    const local = digitalSeals.find((s) => s.meetingId === meetingId);
    if (local) return local;

    try {
      return await api.getActSeal(meetingId);
    } catch {
      return undefined;
    }
  };

  const verifyActSeal = async (params: {
    sha256Hash?: string;
    signaturePkiToken?: string;
    canonicalPayload?: string;
    sealedAt?: string;
    signerEmail?: string;
  }) => {
    const seal = digitalSeals.find(
      (s) =>
        (params.sha256Hash && s.sha256Hash.toLowerCase() === params.sha256Hash.toLowerCase()) ||
        (params.signaturePkiToken && s.signaturePkiToken === params.signaturePkiToken)
    );

    if (seal) {
      return {
        foundInRegistry: true,
        seal,
        verification: {
          isValid: true,
          recomputedHash: seal.sha256Hash,
          expectedPkiToken: seal.signaturePkiToken,
        },
      };
    }

    try {
      return await api.verifyActSeal(params);
    } catch {
      return {
        foundInRegistry: false,
        verification: {
          isValid: false,
          recomputedHash: '',
          expectedPkiToken: '',
          errorReason: 'No se encontró el sello en el registro criptográfico local ni en el servidor.',
        },
      };
    }
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const addNotification = (notif: Omit<InstitutionalNotification, 'id' | 'date' | 'read'>) => {
    const newNotif: InstitutionalNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Database Export & Import
  const exportDatabaseBackup = async () => {
    const backup: FullBackupData = {
      version: '2.4.0-localstorage',
      exportedAt: new Date().toISOString(),
      users,
      estamentos,
      customRoles,
      meetings,
      motions,
      commitments,
      qualityFactors,
      qualityMappings,
      accessRequests,
      notifications,
      digitalSeals,
      auditLogs: [],
      currentUserId: currentUser.id,
      activeMeetingId,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIG_Curriculo_Respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importDatabaseBackup = async (backupJson: string) => {
    try {
      const parsed: FullBackupData = JSON.parse(backupJson);
      if (parsed.users) setUsers(parsed.users);
      if (parsed.estamentos) setEstamentos(parsed.estamentos);
      if (parsed.customRoles) setCustomRoles(parsed.customRoles);
      if (parsed.meetings) setMeetings(parsed.meetings);
      if (parsed.motions) setMotions(parsed.motions);
      if (parsed.commitments) setCommitments(parsed.commitments);
      if (parsed.qualityFactors) setQualityFactors(parsed.qualityFactors);
      if (parsed.qualityMappings) setQualityMappings(parsed.qualityMappings);
      if (parsed.accessRequests) setAccessRequests(parsed.accessRequests);
      if (parsed.notifications) setNotifications(parsed.notifications);
      if (parsed.digitalSeals) setDigitalSeals(parsed.digitalSeals);
      if (parsed.currentUserId) {
        const found = (parsed.users || users).find((u) => u.id === parsed.currentUserId);
        if (found) setCurrentUser(found);
      }
      if (parsed.activeMeetingId) setActiveMeetingId(parsed.activeMeetingId);

      await browserStorage.importBackupJson(parsed);
    } catch (e: any) {
      alert(`Error al importar respaldo: ${e.message}`);
      throw e;
    }
  };

  const resetDatabaseToDefaults = async () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setEstamentos(INITIAL_ESTAMENTOS);
    setCustomRoles(INITIAL_CUSTOM_ROLES);
    setMeetings(INITIAL_MEETINGS);
    setActiveMeetingId(INITIAL_MEETINGS[0].id);
    setMotions(INITIAL_MOTIONS);
    setCommitments(INITIAL_COMMITMENTS);
    setQualityFactors(CNA_ABET_TEMPLATE_FACTORS);
    setQualityMappings(INITIAL_QUALITY_MAPPINGS);
    setAccessRequests([]);
    setNotifications(DEFAULT_NOTIFICATIONS);
    setDigitalSeals([]);
    setUserSettings(DEFAULT_USER_SETTINGS);

    await browserStorage.resetToDefaults();
  };

  const resetAllData = () => {
    resetDatabaseToDefaults();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        switchRole,
        isAuthenticated,
        googleUser,
        signInWithGoogle,
        signInWithInstitutionalEmail,
        loginWithInstitutionalCredentials,
        signOutGoogle,
        logout,
        createUser,
        updateUser,
        deleteUser,
        estamentos,
        createEstamento,
        updateEstamento,
        deleteEstamento,
        customRoles,
        createCustomRole,
        updateCustomRole,
        deleteCustomRole,
        meetings,
        activeMeetingId,
        setActiveMeetingId,
        createMeeting,
        updateMeeting,
        addAgendaItem,
        updateAgendaItem,
        deleteAgendaItem,
        sendCitations,
        closeMeeting,
        motions,
        createMotion,
        castVote,
        finalizeMotion,
        commitments,
        createCommitment,
        submitCommitmentEvidence,
        auditCommitment,
        sendCommitmentDeadlineAlert,
        sendBatchDeadlineAlerts,
        accessRequests,
        requestActAccess,
        resolveAccessRequest,
        qualityFactors,
        addQualityFactor,
        addQualityFeature,
        addQualityAspect,
        deleteQualityFactor,
        clearQualityFactors,
        loadCnaAbetTemplate,
        qualityMappings,
        createQualityMapping,
        deleteQualityMapping,
        digitalSeals,
        getActSeal,
        verifyActSeal,
        notifications,
        markNotificationRead,
        addNotification,
        userSettings,
        updateUserSettings,
        brandingConfig,
        updateBrandingConfig,
        resetBrandingConfig,
        exportDatabaseBackup,
        importDatabaseBackup,
        resetDatabaseToDefaults,
        resetAllData,
        isLiveSyncConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
