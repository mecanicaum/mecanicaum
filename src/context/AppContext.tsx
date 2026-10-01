import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Meeting,
  AgendaItem,
  Motion,
  VoteOption,
  Commitment,
  CommitmentStatus,
  CommitmentEvidence,
  QualityFactor,
  QualityFeature,
  QualityAspect,
  ActQualityMapping,
  AccessRequest,
  InstitutionalNotification,
  Estamento,
  CustomRole,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ESTAMENTOS,
  INITIAL_CUSTOM_ROLES,
  INITIAL_MEETINGS,
  INITIAL_MOTIONS,
  INITIAL_COMMITMENTS,
  INITIAL_QUALITY_FACTORS,
  INITIAL_QUALITY_MAPPINGS,
  INITIAL_ACCESS_REQUESTS,
  INITIAL_NOTIFICATIONS,
  CNA_ABET_TEMPLATE_FACTORS,
} from '../data/mockData';

interface AppContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;

  // Committee Members Administration
  createUser: (userData: Omit<User, 'id' | 'avatarInitials'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Estamentos Administration
  estamentos: Estamento[];
  createEstamento: (data: Omit<Estamento, 'id'>) => Estamento;
  updateEstamento: (id: string, updates: Partial<Estamento>) => void;
  deleteEstamento: (id: string) => void;

  // Roles Administration
  customRoles: CustomRole[];
  createCustomRole: (data: Omit<CustomRole, 'id'>) => CustomRole;
  updateCustomRole: (id: string, updates: Partial<CustomRole>) => void;
  deleteCustomRole: (id: string) => void;
  
  // Meetings & Agenda
  meetings: Meeting[];
  activeMeetingId: string;
  setActiveMeetingId: (id: string) => void;
  createMeeting: (newMeeting: Omit<Meeting, 'id' | 'quorumPresentCount' | 'quorumTotalRequired'>) => Meeting;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  addAgendaItem: (meetingId: string, item: Omit<AgendaItem, 'id' | 'agreements' | 'deliberations' | 'driveAttachments'>) => void;
  updateAgendaItem: (meetingId: string, itemId: string, updates: Partial<AgendaItem>) => void;
  deleteAgendaItem: (meetingId: string, itemId: string) => void;
  sendCitations: (meetingId: string, recipientEmails: string[], note?: string) => void;
  closeMeeting: (meetingId: string, notes: string) => void;

  // Motions & Real-time Voting
  motions: Motion[];
  createMotion: (data: { meetingId: string; agendaItemId?: string; title: string; description: string; majorityRequired: Motion['majorityRequired'] }) => Motion;
  castVote: (motionId: string, option: VoteOption) => void;
  finalizeMotion: (motionId: string) => void;

  // Commitments & Audit
  commitments: Commitment[];
  createCommitment: (data: Omit<Commitment, 'id' | 'assignedAt' | 'status' | 'evidences' | 'assignedBy'>) => Commitment;
  submitCommitmentEvidence: (commitmentId: string, description: string, driveUrl: string, fileName?: string) => void;
  auditCommitment: (commitmentId: string, newStatus: CommitmentStatus, notes: string) => void;

  // Access Requests for Historical Acts
  accessRequests: AccessRequest[];
  requestActAccess: (meetingId: string, meetingCode: string, purpose: string) => void;
  resolveAccessRequest: (requestId: string, status: 'aprobado' | 'rechazado', note?: string) => void;

  // Self-Evaluation & Accreditation Quality Matrix
  qualityFactors: QualityFactor[];
  addQualityFactor: (factor: Omit<QualityFactor, 'id' | 'features'>) => QualityFactor;
  addQualityFeature: (factorId: string, feature: Omit<QualityFeature, 'id' | 'aspects'>) => void;
  addQualityAspect: (factorId: string, featureId: string, aspect: Omit<QualityAspect, 'id'>) => void;
  deleteQualityFactor: (factorId: string) => void;
  clearQualityFactors: () => void;
  loadCnaAbetTemplate: () => void;
  qualityMappings: ActQualityMapping[];
  createQualityMapping: (data: Omit<ActQualityMapping, 'id' | 'mappedAt' | 'mappedBy'>) => void;
  deleteQualityMapping: (mappingId: string) => void;

  // Notifications
  notifications: InstitutionalNotification[];
  markNotificationRead: (id: string) => void;
  addNotification: (notif: Omit<InstitutionalNotification, 'id' | 'date' | 'read'>) => void;

  // System
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER_ID: 'sig_curriculo_user_id_v5',
  USERS: 'sig_curriculo_users_v5',
  ESTAMENTOS: 'sig_curriculo_estamentos_v5',
  CUSTOM_ROLES: 'sig_curriculo_custom_roles_v5',
  MEETINGS: 'sig_curriculo_meetings_clean_v5',
  MOTIONS: 'sig_curriculo_motions_clean_v5',
  COMMITMENTS: 'sig_curriculo_commitments_clean_v5',
  QUALITY_FACTORS: 'sig_curriculo_factors_clean_v6',
  MAPPINGS: 'sig_curriculo_mappings_clean_v5',
  ACCESS_REQ: 'sig_curriculo_access_req_clean_v5',
  NOTIFICATIONS: 'sig_curriculo_notifications_clean_v5',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USERS);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [estamentos, setEstamentos] = useState<Estamento[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ESTAMENTOS);
    return saved ? JSON.parse(saved) : INITIAL_ESTAMENTOS;
  });

  const [customRoles, setCustomRoles] = useState<CustomRole[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROLES);
    return saved ? JSON.parse(saved) : INITIAL_CUSTOM_ROLES;
  });
  
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.USER_ID) || (INITIAL_USERS[0]?.id || 'usr-admin-principal');
  });

  const currentUser = users.find((u) => u.id === currentUserId) || users[0] || INITIAL_USERS[0];

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MEETINGS);
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [activeMeetingId, setActiveMeetingId] = useState<string>('');

  const [motions, setMotions] = useState<Motion[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MOTIONS);
    return saved ? JSON.parse(saved) : INITIAL_MOTIONS;
  });

  const [commitments, setCommitments] = useState<Commitment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMMITMENTS);
    return saved ? JSON.parse(saved) : INITIAL_COMMITMENTS;
  });

  const [qualityFactors, setQualityFactors] = useState<QualityFactor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.QUALITY_FACTORS);
    return saved ? JSON.parse(saved) : INITIAL_QUALITY_FACTORS;
  });

  const [qualityMappings, setQualityMappings] = useState<ActQualityMapping[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MAPPINGS);
    return saved ? JSON.parse(saved) : INITIAL_QUALITY_MAPPINGS;
  });

  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCESS_REQ);
    return saved ? JSON.parse(saved) : INITIAL_ACCESS_REQUESTS;
  });

  const [notifications, setNotifications] = useState<InstitutionalNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // LocalStorage synchronizers
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER_ID, currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ESTAMENTOS, JSON.stringify(estamentos));
  }, [estamentos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ROLES, JSON.stringify(customRoles));
  }, [customRoles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOTIONS, JSON.stringify(motions));
  }, [motions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMMITMENTS, JSON.stringify(commitments));
  }, [commitments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUALITY_FACTORS, JSON.stringify(qualityFactors));
  }, [qualityFactors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MAPPINGS, JSON.stringify(qualityMappings));
  }, [qualityMappings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_REQ, JSON.stringify(accessRequests));
  }, [accessRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
    }
  };

  const switchRole = (role: UserRole) => {
    const target = users.find((u) => u.role === role);
    if (target) {
      setCurrentUserId(target.id);
    }
  };

  // Miembros del Comité CRUD
  const createUser = (userData: Omit<User, 'id' | 'avatarInitials'>): User => {
    const parts = userData.name.trim().split(' ');
    const initials = parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : userData.name.substring(0, 2).toUpperCase();

    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      avatarInitials: initials,
      active: true,
    };

    setUsers((prev) => [...prev, newUser]);
    addNotification({
      title: 'Nuevo Miembro Registrado',
      message: `Se ha registrado a ${newUser.name} como ${newUser.roleLabel} representando al ${newUser.estamentoName || 'Comité'}.`,
      recipientRoles: ['presidente', 'seguimiento', 'autoevaluacion'],
      type: 'auditoria',
    });
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== id) return u;
        let initials = u.avatarInitials;
        if (updates.name) {
          const parts = updates.name.trim().split(' ');
          initials = parts.length > 1
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
            : updates.name.substring(0, 2).toUpperCase();
        }
        return { ...u, ...updates, avatarInitials: initials };
      })
    );
  };

  const deleteUser = (id: string) => {
    if (users.length <= 1) {
      alert('No se puede eliminar el único usuario administrador del sistema.');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (currentUserId === id) {
      const remaining = users.filter((u) => u.id !== id);
      if (remaining[0]) setCurrentUserId(remaining[0].id);
    }
  };

  // Estamentos CRUD
  const createEstamento = (data: Omit<Estamento, 'id'>): Estamento => {
    const newEst: Estamento = {
      ...data,
      id: `est-${Date.now()}`,
    };
    setEstamentos((prev) => [...prev, newEst]);
    return newEst;
  };

  const updateEstamento = (id: string, updates: Partial<Estamento>) => {
    setEstamentos((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteEstamento = (id: string) => {
    setEstamentos((prev) => prev.filter((e) => e.id !== id));
  };

  // Custom Roles CRUD
  const createCustomRole = (data: Omit<CustomRole, 'id'>): CustomRole => {
    const newRole: CustomRole = {
      ...data,
      id: `rol-${Date.now()}`,
    };
    setCustomRoles((prev) => [...prev, newRole]);
    return newRole;
  };

  const updateCustomRole = (id: string, updates: Partial<CustomRole>) => {
    setCustomRoles((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const deleteCustomRole = (id: string) => {
    setCustomRoles((prev) => prev.filter((r) => r.id !== id));
  };

  const addNotification = (notif: Omit<InstitutionalNotification, 'id' | 'date' | 'read'>) => {
    const newNotif: InstitutionalNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Meetings CRUD
  const createMeeting = (newMeetingData: Omit<Meeting, 'id' | 'quorumPresentCount' | 'quorumTotalRequired'>): Meeting => {
    const newMeeting: Meeting = {
      ...newMeetingData,
      id: `meet-${Date.now()}`,
      quorumPresentCount: 0,
      quorumTotalRequired: Math.ceil((newMeetingData.attendees.length || 1) / 2),
    };
    setMeetings((prev) => [newMeeting, ...prev]);
    addNotification({
      title: `Nueva Convocatoria: ${newMeeting.code}`,
      message: `Se ha programado la reunión ${newMeeting.type.toUpperCase()}: ${newMeeting.title} para el ${newMeeting.date} a las ${newMeeting.startTime}.`,
      recipientRoles: ['presidente', 'miembro', 'seguimiento', 'autoevaluacion', 'invitado_externo'],
      meetingCode: newMeeting.code,
      type: 'citacion',
    });
    return newMeeting;
  };

  const updateMeeting = (id: string, updates: Partial<Meeting>) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  };

  const addAgendaItem = (
    meetingId: string,
    item: Omit<AgendaItem, 'id' | 'agreements' | 'deliberations' | 'driveAttachments'>
  ) => {
    const newItem: AgendaItem = {
      ...item,
      id: `item-${Date.now()}`,
      agreements: '',
      deliberations: '',
      driveAttachments: [],
    };
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          agendaItems: [...m.agendaItems, newItem],
        };
      })
    );
  };

  const updateAgendaItem = (meetingId: string, itemId: string, updates: Partial<AgendaItem>) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          agendaItems: m.agendaItems.map((it) =>
            it.id === itemId ? { ...it, ...updates } : it
          ),
        };
      })
    );
  };

  const deleteAgendaItem = (meetingId: string, itemId: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          agendaItems: m.agendaItems.filter((it) => it.id !== itemId),
        };
      })
    );
  };

  const sendCitations = (meetingId: string, recipientEmails: string[], note?: string) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting) return;
    addNotification({
      title: `Citación Enviada: ${meeting.code}`,
      message: `Se enviaron ${recipientEmails.length} citaciones institucionales vía Google Workspace. ${note || ''}`,
      recipientRoles: ['presidente', 'miembro', 'seguimiento', 'autoevaluacion', 'invitado_externo'],
      meetingCode: meeting.code,
      type: 'citacion',
    });
  };

  const closeMeeting = (meetingId: string, notes: string) => {
    const now = new Date();
    const signature = `${now.toISOString().substring(0, 10)} ${now.toLocaleTimeString()} (${currentUser.name} - Certificado Digital PKI #${meetingId.slice(-4).toUpperCase()})`;
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          status: 'cerrada',
          closedAt: now.toISOString(),
          signedByPresident: true,
          presidentSignatureDate: signature,
          generalObservations: notes || m.generalObservations,
        };
      })
    );

    addNotification({
      title: `Acta Cerrada y Firmada Oficialmente`,
      message: `El acta ${meetings.find(m => m.id === meetingId)?.code} ha sido cerrada y firmada por el Presidente. Queda disponible para mapeo de autoevaluación.`,
      recipientRoles: ['autoevaluacion', 'presidente', 'miembro', 'seguimiento'],
      type: 'auditoria',
    });
  };

  // Motions & Real-time Voting
  const calculateMotionResult = (motion: Motion) => {
    const votesArr = Object.values(motion.votes);
    let aFavor = 0;
    let enContra = 0;
    let abstencion = 0;

    votesArr.forEach((v) => {
      if (v.option === 'a_favor') aFavor++;
      else if (v.option === 'en_contra') enContra++;
      else if (v.option === 'abstencion') abstencion++;
    });

    const totalVotes = votesArr.length;
    const votingMembersCount = users.filter((u) => u.hasVote !== false && u.role !== 'invitado_externo').length || 1;
    const votingQuorum = Math.round((totalVotes / votingMembersCount) * 100);

    let approved = false;
    if (motion.majorityRequired === 'simple') {
      approved = aFavor > enContra;
    } else if (motion.majorityRequired === 'cualificada_dos_tercios') {
      approved = aFavor >= Math.ceil((totalVotes * 2) / 3);
    } else if (motion.majorityRequired === 'unanime') {
      approved = aFavor === totalVotes && totalVotes > 0;
    }

    return {
      aFavor,
      enContra,
      abstencion,
      totalVotes,
      quorumPercentage: Math.min(votingQuorum, 100),
      approved,
    };
  };

  const createMotion = (data: {
    meetingId: string;
    agendaItemId?: string;
    title: string;
    description: string;
    majorityRequired: Motion['majorityRequired'];
  }): Motion => {
    const newMotion: Motion = {
      id: `mot-${Date.now()}`,
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

    addNotification({
      title: 'Nueva Moción para Votación',
      message: `${currentUser.name} ha formulado la moción: "${data.title}". Los miembros autorizados pueden emitir su voto.`,
      recipientRoles: ['miembro', 'presidente'],
      type: 'moción',
    });

    return newMotion;
  };

  const castVote = (motionId: string, option: VoteOption) => {
    setMotions((prev) =>
      prev.map((mot) => {
        if (mot.id !== motionId) return mot;
        const newVotes = {
          ...mot.votes,
          [currentUser.id]: {
            userId: currentUser.id,
            userName: currentUser.name,
            userRole: currentUser.role,
            option,
            timestamp: new Date().toISOString(),
          },
        };
        const updatedMot: Motion = {
          ...mot,
          votes: newVotes,
        };
        updatedMot.result = calculateMotionResult(updatedMot);
        return updatedMot;
      })
    );
  };

  const finalizeMotion = (motionId: string) => {
    setMotions((prev) =>
      prev.map((mot) => {
        if (mot.id !== motionId) return mot;
        const result = calculateMotionResult(mot);
        const finalStatus = result.approved ? 'aprobada' : 'rechazada';
        return {
          ...mot,
          status: finalStatus,
          result,
        };
      })
    );
  };

  // Commitments
  const createCommitment = (
    data: Omit<Commitment, 'id' | 'assignedAt' | 'status' | 'evidences' | 'assignedBy'>
  ): Commitment => {
    const newCommitment: Commitment = {
      ...data,
      id: `com-${Date.now()}`,
      assignedBy: currentUser.name,
      assignedAt: new Date().toISOString().substring(0, 10),
      status: 'pendiente',
      evidences: [],
    };
    setCommitments((prev) => [newCommitment, ...prev]);

    addNotification({
      title: `Nuevo Compromiso Asignado: ${newCommitment.title}`,
      message: `Se ha asignado a ${newCommitment.responsibleName} con fecha límite ${newCommitment.dueDate}.`,
      recipientRoles: ['seguimiento', 'miembro', 'invitado_externo'],
      recipientEmail: newCommitment.responsibleEmail,
      type: 'compromiso',
    });

    return newCommitment;
  };

  const submitCommitmentEvidence = (
    commitmentId: string,
    description: string,
    driveUrl: string,
    fileName?: string
  ) => {
    const newEvidence: CommitmentEvidence = {
      id: `ev-${Date.now()}`,
      submittedAt: new Date().toISOString().substring(0, 10),
      submittedBy: currentUser.name,
      description,
      driveUrl,
      fileName: fileName || 'Evidencia_Documento_Adjunto.pdf',
    };

    setCommitments((prev) =>
      prev.map((com) => {
        if (com.id !== commitmentId) return com;
        return {
          ...com,
          status: 'en_revision',
          evidences: [...com.evidences, newEvidence],
        };
      })
    );

    addNotification({
      title: `Evidencia de Compromiso Enviada`,
      message: `${currentUser.name} ha radicado evidencias para el compromiso "${commitments.find(c => c.id === commitmentId)?.title}". Requiere validación del Encargado de Seguimiento.`,
      recipientRoles: ['seguimiento'],
      type: 'compromiso',
    });
  };

  const auditCommitment = (
    commitmentId: string,
    newStatus: CommitmentStatus,
    notes: string
  ) => {
    const now = new Date().toISOString().substring(0, 10);
    setCommitments((prev) =>
      prev.map((com) => {
        if (com.id !== commitmentId) return com;
        return {
          ...com,
          status: newStatus,
          auditedBy: currentUser.name,
          auditNotes: notes,
          auditedAt: now,
        };
      })
    );

    addNotification({
      title: `Compromiso Auditado: Estado ${newStatus.toUpperCase()}`,
      message: `El Encargado de Seguimiento ha validado el compromiso. Observación: ${notes}`,
      recipientRoles: ['presidente', 'miembro', 'invitado_externo'],
      type: 'auditoria',
    });
  };

  // Access Requests
  const requestActAccess = (meetingId: string, meetingCode: string, purpose: string) => {
    const newReq: AccessRequest = {
      id: `req-${Date.now()}`,
      meetingId,
      meetingCode,
      requestedBy: currentUser.name,
      userRole: currentUser.role,
      purpose,
      requestedAt: new Date().toISOString(),
      status: 'pendiente',
    };
    setAccessRequests((prev) => [newReq, ...prev]);

    addNotification({
      title: `Solicitud de Acceso a Acta Histórica`,
      message: `${currentUser.name} solicita consultar el acta ${meetingCode}. Motivo: ${purpose}`,
      recipientRoles: ['presidente', 'seguimiento'],
      type: 'acceso',
    });
  };

  const resolveAccessRequest = (
    requestId: string,
    status: 'aprobado' | 'rechazado',
    note?: string
  ) => {
    setAccessRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;
        return {
          ...req,
          status,
          resolvedBy: currentUser.name,
          resolvedAt: new Date().toISOString(),
          resolutionNote: note || (status === 'aprobado' ? 'Solicitud autorizada por la Presidencia.' : 'Denegada.'),
        };
      })
    );

    addNotification({
      title: `Solicitud de Acceso ${status.toUpperCase()}`,
      message: `Su solicitud de acceso al acta ha sido ${status}. Nota: ${note || 'Sin nota adicional.'}`,
      recipientRoles: ['miembro'],
      type: 'acceso',
    });
  };

  // Quality Framework
  const addQualityFactor = (factor: Omit<QualityFactor, 'id' | 'features'>): QualityFactor => {
    const newFactor: QualityFactor = {
      ...factor,
      id: `fact-${Date.now()}`,
      features: [],
    };
    setQualityFactors((prev) => [...prev, newFactor]);
    return newFactor;
  };

  const addQualityFeature = (factorId: string, feature: Omit<QualityFeature, 'id' | 'aspects'>) => {
    const newFeature: QualityFeature = {
      ...feature,
      id: `feat-${Date.now()}`,
      aspects: [],
    };
    setQualityFactors((prev) =>
      prev.map((f) => (f.id === factorId ? { ...f, features: [...f.features, newFeature] } : f))
    );
  };

  const addQualityAspect = (factorId: string, featureId: string, aspect: Omit<QualityAspect, 'id'>) => {
    const newAspect: QualityAspect = {
      ...aspect,
      id: `asp-${Date.now()}`,
    };
    setQualityFactors((prev) =>
      prev.map((f) => {
        if (f.id !== factorId) return f;
        return {
          ...f,
          features: f.features.map((feat) =>
            feat.id === featureId
              ? { ...feat, aspects: [...feat.aspects, newAspect] }
              : feat
          ),
        };
      })
    );
  };

  const deleteQualityFactor = (factorId: string) => {
    setQualityFactors((prev) => prev.filter((f) => f.id !== factorId));
  };

  const clearQualityFactors = () => {
    setQualityFactors([]);
  };

  const loadCnaAbetTemplate = () => {
    setQualityFactors(CNA_ABET_TEMPLATE_FACTORS);
  };

  const createQualityMapping = (data: Omit<ActQualityMapping, 'id' | 'mappedAt' | 'mappedBy'>) => {
    const newMapping: ActQualityMapping = {
      ...data,
      id: `map-${Date.now()}`,
      mappedBy: currentUser.name,
      mappedAt: new Date().toISOString(),
    };
    setQualityMappings((prev) => [newMapping, ...prev]);

    addNotification({
      title: `Acta Indexada en Acreditación`,
      message: `Se vinculó el acuerdo del acta ${data.meetingCode} al Aspecto ${data.aspectCode} (${data.factorCode}).`,
      recipientRoles: ['autoevaluacion', 'presidente'],
      type: 'auditoria',
    });
  };

  const deleteQualityMapping = (mappingId: string) => {
    setQualityMappings((prev) => prev.filter((m) => m.id !== mappingId));
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setEstamentos(INITIAL_ESTAMENTOS);
    setCustomRoles(INITIAL_CUSTOM_ROLES);
    setMeetings([]);
    setMotions([]);
    setCommitments([]);
    setQualityFactors(INITIAL_QUALITY_FACTORS);
    setQualityMappings([]);
    setAccessRequests([]);
    setNotifications([]);
    setCurrentUserId(INITIAL_USERS[0]?.id || 'usr-admin-principal');
    setActiveMeetingId('');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        switchRole,
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
        notifications,
        markNotificationRead,
        addNotification,
        resetAllData,
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
