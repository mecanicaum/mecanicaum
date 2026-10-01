import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  Meeting,
  AgendaItem,
  Motion,
  VoteOption,
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
} from '../types';
import { CNA_ABET_TEMPLATE_FACTORS } from '../data/mockData';
import { api, realtime, setApiUserId } from '../services/api';
import { googleSignIn, logoutGoogle, initAuth } from '../services/auth';

interface AppContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;

  // Google Workspace SSO Authentication
  googleUser: { email: string; name: string; photoURL?: string | null } | null;
  signInWithGoogle: () => Promise<User | null>;
  signOutGoogle: () => Promise<void>;

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

  // System
  resetAllData: () => void;
  isLiveSyncConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_ADMIN_USER: User = {
  id: 'usr-admin-principal',
  name: 'Administrador Comité Curricular',
  email: 'autoevaluacionycurriculomecanica@umayor.edu.co',
  role: 'presidente',
  roleLabel: 'Presidente del Comité Curricular',
  faculty: 'Facultad de Ingeniería',
  department: 'Ingeniería Mecánica / Acreditación y Currículo',
  academicTitle: 'Dirección de Autoevaluación & Comité Curricular',
  avatarInitials: 'CC',
  hasVote: true,
  periodo: '2026 - 2028',
  active: true,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_ADMIN_USER);
  const [users, setUsers] = useState<User[]>([DEFAULT_ADMIN_USER]);
  const [estamentos, setEstamentos] = useState<Estamento[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [activeMeetingId, setActiveMeetingId] = useState<string>('');
  const [motions, setMotions] = useState<Motion[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [qualityFactors, setQualityFactors] = useState<QualityFactor[]>([]);
  const [qualityMappings, setQualityMappings] = useState<ActQualityMapping[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [notifications, setNotifications] = useState<InstitutionalNotification[]>([]);
  const [digitalSeals, setDigitalSeals] = useState<DigitalActSeal[]>([]);
  const [isLiveSyncConnected, setIsLiveSyncConnected] = useState<boolean>(false);
  const [googleUser, setGoogleUser] = useState<{ email: string; name: string; photoURL?: string | null } | null>(null);

  // Initial Data Bootstrap from Server
  const loadBootstrapData = useCallback(async () => {
    try {
      const data = await api.bootstrap();
      if (data.users && data.users.length > 0) {
        setUsers(data.users);
        const current = data.users.find((u) => u.id === currentUser.id) || data.currentUser || data.users[0];
        setCurrentUser(current);
        setApiUserId(current.id);
      }
      if (data.estamentos) setEstamentos(data.estamentos);
      if (data.customRoles) setCustomRoles(data.customRoles);
      if (data.meetings) {
        setMeetings(data.meetings);
        if (data.meetings.length > 0 && !activeMeetingId) {
          const inProgress = data.meetings.find((m) => m.status === 'en_curso');
          setActiveMeetingId(inProgress?.id || data.meetings[0].id);
        }
      }
      if (data.motions) setMotions(data.motions);
      if (data.commitments) setCommitments(data.commitments);
      if (data.qualityFactors) setQualityFactors(data.qualityFactors);
      if (data.qualityMappings) setQualityMappings(data.qualityMappings);
      if (data.accessRequests) setAccessRequests(data.accessRequests);
      if (data.notifications) setNotifications(data.notifications);
      if (data.digitalSeals) setDigitalSeals(data.digitalSeals);
    } catch (err) {
      console.error('[AppContext] Error loading bootstrap data from backend:', err);
    }
  }, [currentUser.id, activeMeetingId]);

  // Connect WebSocket and Subscribe to Real-time Events
  useEffect(() => {
    loadBootstrapData();
    realtime.connect();

    const unsubConnection = realtime.on('connection:established', () => {
      setIsLiveSyncConnected(true);
    });

    const unsubUserCreated = realtime.on('user:created', (newUser: User) => {
      setUsers((prev) => (prev.some((u) => u.id === newUser.id) ? prev : [...prev, newUser]));
    });

    const unsubUserUpdated = realtime.on('user:updated', (updUser: User) => {
      setUsers((prev) => prev.map((u) => (u.id === updUser.id ? updUser : u)));
      if (currentUser.id === updUser.id) setCurrentUser(updUser);
    });

    const unsubUserDeleted = realtime.on('user:deleted', ({ id }: { id: string }) => {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    });

    const unsubMeetingCreated = realtime.on('meeting:created', (m: Meeting) => {
      setMeetings((prev) => [m, ...prev.filter((item) => item.id !== m.id)]);
      if (!activeMeetingId) setActiveMeetingId(m.id);
    });

    const unsubMeetingUpdated = realtime.on('meeting:updated', (m: Meeting) => {
      setMeetings((prev) => prev.map((item) => (item.id === m.id ? m : item)));
    });

    const unsubMeetingClosed = realtime.on('meeting:closed', ({ meeting, seal }: { meeting: Meeting; seal: DigitalActSeal }) => {
      setMeetings((prev) => prev.map((item) => (item.id === meeting.id ? meeting : item)));
      if (seal) setDigitalSeals((prev) => [seal, ...prev.filter((s) => s.id !== seal.id)]);
    });

    const unsubMotionCreated = realtime.on('motion:created', (mot: Motion) => {
      setMotions((prev) => [mot, ...prev.filter((m) => m.id !== mot.id)]);
    });

    const unsubVoteCast = realtime.on('motion:vote_cast', ({ motionId, vote }: { motionId: string; vote: any }) => {
      setMotions((prev) =>
        prev.map((m) => {
          if (m.id !== motionId) return m;
          return {
            ...m,
            votes: {
              ...m.votes,
              [vote.userId]: vote,
            },
          };
        })
      );
    });

    const unsubMotionFinalized = realtime.on('motion:finalized', (finalized: Motion) => {
      setMotions((prev) => prev.map((m) => (m.id === finalized.id ? finalized : m)));
    });

    const unsubCommitmentCreated = realtime.on('commitment:created', (com: Commitment) => {
      setCommitments((prev) => [com, ...prev.filter((c) => c.id !== com.id)]);
    });

    const unsubCommitmentEvidence = realtime.on('commitment:evidence_submitted', ({ commitment }: { commitment: Commitment }) => {
      setCommitments((prev) => prev.map((c) => (c.id === commitment.id ? commitment : c)));
    });

    const unsubCommitmentAudited = realtime.on('commitment:audited', (com: Commitment) => {
      setCommitments((prev) => prev.map((c) => (c.id === com.id ? com : c)));
    });

    const unsubCommitmentAlert = realtime.on('commitment:alert_sent', (com: Commitment) => {
      setCommitments((prev) => prev.map((c) => (c.id === com.id ? com : c)));
    });

    const unsubNotification = realtime.on('notification:new', (notif: InstitutionalNotification) => {
      setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
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
  }, [loadBootstrapData]);

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

  // Google Workspace SSO Authentication
  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser({
          email: res.email,
          name: res.name,
          photoURL: res.photoURL,
        });

        const ssoResult = await api.loginGoogleSSO(res.email, res.name);
        if (ssoResult.user) {
          setCurrentUser(ssoResult.user);
          setApiUserId(ssoResult.user.id);
          realtime.identify(ssoResult.user.id);
          setUsers((prev) => {
            const exists = prev.some((u) => u.id === ssoResult.user.id);
            return exists ? prev.map((u) => (u.id === ssoResult.user.id ? ssoResult.user : u)) : [...prev, ssoResult.user];
          });
          return ssoResult.user;
        }
      }
      return null;
    } catch (err) {
      console.error('[AppContext] Error during Google SSO sign-in:', err);
      throw err;
    }
  };

  const signOutGoogle = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    if (users.length > 0) {
      setCurrentUser(users[0]);
      setApiUserId(users[0].id);
      realtime.identify(users[0].id);
    }
  };

  // User Management
  const createUser = async (userData: Omit<User, 'id' | 'avatarInitials'>): Promise<User> => {
    const newUser = await api.createUser(userData);
    setUsers((prev) => [...prev, newUser]);
    return newUser;
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    const updated = await api.updateUser(id, updates);
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
    if (currentUser.id === id) setCurrentUser(updated);
  };

  const deleteUser = async (id: string) => {
    await api.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Estamentos Management
  const createEstamento = async (data: Omit<Estamento, 'id'>): Promise<Estamento> => {
    const created = await api.createEstamento(data);
    setEstamentos((prev) => [...prev, created]);
    return created;
  };

  const updateEstamento = async (id: string, updates: Partial<Estamento>) => {
    const updated = await api.updateEstamento(id, updates);
    setEstamentos((prev) => prev.map((e) => (e.id === id ? updated : e)));
  };

  const deleteEstamento = (id: string) => {
    setEstamentos((prev) => prev.filter((e) => e.id !== id));
  };

  // Custom Roles
  const createCustomRole = async (data: Omit<CustomRole, 'id'>): Promise<CustomRole> => {
    const created = await api.createRole(data);
    setCustomRoles((prev) => [...prev, created]);
    return created;
  };

  const updateCustomRole = (id: string, updates: Partial<CustomRole>) => {
    setCustomRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const deleteCustomRole = (id: string) => {
    setCustomRoles((prev) => prev.filter((r) => r.id !== id));
  };

  // Meetings Management
  const createMeeting = async (newMeeting: Omit<Meeting, 'id' | 'quorumPresentCount' | 'quorumTotalRequired'>): Promise<Meeting> => {
    const created = await api.createMeeting(newMeeting);
    setMeetings((prev) => [created, ...prev]);
    setActiveMeetingId(created.id);
    return created;
  };

  const updateMeeting = async (id: string, updates: Partial<Meeting>) => {
    const updated = await api.updateMeeting(id, updates);
    setMeetings((prev) => prev.map((m) => (m.id === id ? updated : m)));
  };

  const addAgendaItem = async (
    meetingId: string,
    item: Omit<AgendaItem, 'id' | 'agreements' | 'deliberations' | 'driveAttachments'>
  ) => {
    const target = meetings.find((m) => m.id === meetingId);
    if (!target) return;

    const newItem: AgendaItem = {
      ...item,
      id: `item-${Date.now()}`,
      agreements: '',
      deliberations: '',
      driveAttachments: [],
    };

    const updatedAgenda = [...(target.agendaItems || []), newItem];
    await updateMeeting(meetingId, { agendaItems: updatedAgenda });
  };

  const updateAgendaItem = async (meetingId: string, itemId: string, updates: Partial<AgendaItem>) => {
    const target = meetings.find((m) => m.id === meetingId);
    if (!target) return;

    const updatedAgenda = (target.agendaItems || []).map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    await updateMeeting(meetingId, { agendaItems: updatedAgenda });
  };

  const deleteAgendaItem = async (meetingId: string, itemId: string) => {
    const target = meetings.find((m) => m.id === meetingId);
    if (!target) return;

    const updatedAgenda = (target.agendaItems || []).filter((item) => item.id !== itemId);
    await updateMeeting(meetingId, { agendaItems: updatedAgenda });
  };

  const sendCitations = async (meetingId: string, recipientEmails: string[], note?: string) => {
    await api.sendCitations(meetingId, recipientEmails, note);
  };

  const closeMeeting = async (meetingId: string, notes: string) => {
    const res = await api.closeMeeting(meetingId, notes);
    setMeetings((prev) => prev.map((m) => (m.id === meetingId ? res.meeting : m)));
    if (res.seal) setDigitalSeals((prev) => [res.seal, ...prev]);
  };

  // Motions & Real-time Voting
  const createMotion = async (data: {
    meetingId: string;
    agendaItemId?: string;
    title: string;
    description: string;
    majorityRequired: Motion['majorityRequired'];
  }): Promise<Motion> => {
    const created = await api.createMotion(data);
    setMotions((prev) => [created, ...prev]);
    return created;
  };

  const castVote = async (motionId: string, option: VoteOption) => {
    const res = await api.castVote(motionId, option);
    setMotions((prev) => prev.map((m) => (m.id === motionId ? res.motion : m)));
  };

  const finalizeMotion = async (motionId: string) => {
    const finalized = await api.finalizeMotion(motionId);
    setMotions((prev) => prev.map((m) => (m.id === motionId ? finalized : m)));
  };

  // Commitments & Audit
  const createCommitment = async (
    data: Omit<Commitment, 'id' | 'assignedAt' | 'status' | 'evidences' | 'assignedBy'>
  ): Promise<Commitment> => {
    const created = await api.createCommitment(data);
    setCommitments((prev) => [created, ...prev]);
    return created;
  };

  const submitCommitmentEvidence = async (
    commitmentId: string,
    description: string,
    driveUrl: string,
    fileName?: string
  ) => {
    const updated = await api.submitEvidence(commitmentId, { description, driveUrl, fileName });
    setCommitments((prev) => prev.map((c) => (c.id === commitmentId ? updated : c)));
  };

  const auditCommitment = async (commitmentId: string, newStatus: CommitmentStatus, notes: string) => {
    const updated = await api.auditCommitment(commitmentId, newStatus, notes);
    setCommitments((prev) => prev.map((c) => (c.id === commitmentId ? updated : c)));
  };

  const sendCommitmentDeadlineAlert = async (
    commitmentId: string,
    customSubject?: string,
    customBody?: string
  ): Promise<{ success: boolean; message: string }> => {
    const res = await api.sendCommitmentAlert(commitmentId);
    setCommitments((prev) => prev.map((c) => (c.id === commitmentId ? res.commitment : c)));
    return res;
  };

  const sendBatchDeadlineAlerts = async (): Promise<{ sentCount: number; recipients: string[] }> => {
    const res = await api.sendBatchAlerts();
    await loadBootstrapData();
    return res;
  };

  // Access Requests
  const requestActAccess = async (meetingId: string, meetingCode: string, purpose: string) => {
    const created = await api.requestActAccess({ meetingId, meetingCode, purpose });
    setAccessRequests((prev) => [created, ...prev]);
  };

  const resolveAccessRequest = async (requestId: string, status: 'aprobado' | 'rechazado', note?: string) => {
    const updated = await api.resolveAccessRequest(requestId, status, note);
    setAccessRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
  };

  // Quality Framework
  const addQualityFactor = async (factor: Omit<QualityFactor, 'id' | 'features'>): Promise<QualityFactor> => {
    const created = await api.createQualityFactor(factor);
    setQualityFactors((prev) => [...prev, created]);
    return created;
  };

  const addQualityFeature = async (factorId: string, feature: Omit<QualityFeature, 'id' | 'aspects'>) => {
    const target = qualityFactors.find((f) => f.id === factorId);
    if (!target) return;

    const newFeature: QualityFeature = {
      ...feature,
      id: `feat-${Date.now()}`,
      aspects: [],
    };

    const updated = {
      ...target,
      features: [...target.features, newFeature],
    };

    await api.createQualityFactor(updated);
    setQualityFactors((prev) => prev.map((f) => (f.id === factorId ? updated : f)));
  };

  const addQualityAspect = async (factorId: string, featureId: string, aspect: Omit<QualityAspect, 'id'>) => {
    const target = qualityFactors.find((f) => f.id === factorId);
    if (!target) return;

    const newAspect: QualityAspect = {
      ...aspect,
      id: `asp-${Date.now()}`,
    };

    const updatedFeatures = target.features.map((feat) =>
      feat.id === featureId ? { ...feat, aspects: [...feat.aspects, newAspect] } : feat
    );

    const updated = { ...target, features: updatedFeatures };
    await api.createQualityFactor(updated);
    setQualityFactors((prev) => prev.map((f) => (f.id === factorId ? updated : f)));
  };

  const deleteQualityFactor = async (factorId: string) => {
    await api.deleteQualityFactor(factorId);
    setQualityFactors((prev) => prev.filter((f) => f.id !== factorId));
  };

  const clearQualityFactors = async () => {
    await api.resetQualityFactors();
    setQualityFactors([]);
  };

  const loadCnaAbetTemplate = async () => {
    for (const factor of CNA_ABET_TEMPLATE_FACTORS) {
      await api.createQualityFactor(factor);
    }
    setQualityFactors(CNA_ABET_TEMPLATE_FACTORS);
  };

  const createQualityMapping = async (data: Omit<ActQualityMapping, 'id' | 'mappedAt' | 'mappedBy'>) => {
    const created = await api.createQualityMapping(data);
    setQualityMappings((prev) => [created, ...prev]);
  };

  const deleteQualityMapping = async (mappingId: string) => {
    await api.deleteQualityMapping(mappingId);
    setQualityMappings((prev) => prev.filter((m) => m.id !== mappingId));
  };

  // Digital Seals & PKI
  const getActSeal = async (meetingId: string): Promise<DigitalActSeal | undefined> => {
    try {
      const seal = await api.getActSeal(meetingId);
      return seal;
    } catch {
      return digitalSeals.find((s) => s.meetingId === meetingId);
    }
  };

  const verifyActSeal = async (params: {
    sha256Hash?: string;
    signaturePkiToken?: string;
    canonicalPayload?: string;
    sealedAt?: string;
    signerEmail?: string;
  }) => {
    return api.verifyActSeal(params);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    api.markNotificationRead(id).catch(console.error);
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

  const resetAllData = () => {
    loadBootstrapData();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        switchRole,
        googleUser,
        signInWithGoogle,
        signOutGoogle,
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
