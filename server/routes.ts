import { Router, Response } from 'express';
import { db } from './db';
import { wsHub } from './ws';
import {
  authenticateUser,
  requireAuth,
  requireRoles,
  requireVoteRight,
  requireActSigningAuthority,
  AuthenticatedRequest,
} from './auth';
import {
  createDigitalActSeal,
  verifyActIntegrity,
  generateVoteHash,
} from './crypto';
import {
  Meeting,
  Motion,
  Commitment,
  QualityFactor,
  ActQualityMapping,
  AccessRequest,
  InstitutionalNotification,
  VoteOption,
  VoteRecord,
  User,
  Estamento,
  CustomRole,
} from './types';

export const router = Router();

// Apply global user authentication parser
router.use(authenticateUser);

/**
 * --------------------------------------------------------------------------------
 * BOOTSTRAP ENDPOINT: Initial Hydration
 * --------------------------------------------------------------------------------
 */
router.get('/bootstrap', (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user?.id || db.getUsers()[0]?.id || 'usr-admin-principal';
  const currentUser = db.getUserById(currentUserId) || db.getUsers()[0];

  res.json({
    currentUser,
    users: db.getUsers(),
    estamentos: db.getEstamentos(),
    customRoles: db.getCustomRoles(),
    meetings: db.getMeetings(),
    motions: db.getMotions(),
    commitments: db.getCommitments(),
    qualityFactors: db.getQualityFactors(),
    qualityMappings: db.getQualityMappings(),
    accessRequests: db.getAccessRequests(),
    notifications: db.getNotifications(),
    digitalSeals: db.getDigitalSeals(),
  });
});

/**
 * --------------------------------------------------------------------------------
 * INSTITUTIONAL SINGLE SIGN-ON (Google Workspace OAuth SSO)
 * --------------------------------------------------------------------------------
 */
router.post('/auth/google-sso', (req: AuthenticatedRequest, res: Response) => {
  const { email, name } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Se requiere correo institucional de Google.' });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = db.getUserByEmail(normalizedEmail);

  if (user) {
    db.logAudit({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'GOOGLE_SSO_LOGIN_SUCCESS',
      resource: '/api/auth/google-sso',
      details: `Inicio de sesión exitoso vía Google Workspace SSO para '${user.name}' (${normalizedEmail})`,
      ipAddress: req.clientIp,
    });

    res.json({
      success: true,
      user,
      isNewUser: false,
      message: `Bienvenido(a), ${user.name}. Sesión autenticada vía Google Workspace SSO.`,
    });
    return;
  }

  const initials = (name || email)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n: string) => n[0].toUpperCase())
    .join('');

  const isAdminEmail = normalizedEmail.includes('autoevaluacion') || normalizedEmail.includes('curriculo');

  const newUser: User = {
    id: `usr-gsuite-${Date.now()}`,
    name: name || 'Docente Comité Curricular',
    email: normalizedEmail,
    role: isAdminEmail ? 'presidente' : 'miembro',
    department: 'Facultad de Ingeniería',
    academicTitle: 'Docente Integrante del Comité',
    avatarInitials: initials || 'GM',
    hasVote: true,
    periodo: '2026 - 2028',
    active: true,
  };

  db.addUser(newUser);

  db.logAudit({
    userId: newUser.id,
    userName: newUser.name,
    userRole: newUser.role,
    action: 'GOOGLE_SSO_AUTOPROVISION',
    resource: '/api/auth/google-sso',
    details: `Aprovisionamiento automático de cuenta institucional vía Google Workspace SSO para '${newUser.name}' (${normalizedEmail})`,
    ipAddress: req.clientIp,
  });

  wsHub.broadcast('user:created', newUser);

  res.status(201).json({
    success: true,
    user: newUser,
    isNewUser: true,
    message: `Cuenta institucional aprovisionada exitosamente para ${newUser.name}.`,
  });
});

/**
 * --------------------------------------------------------------------------------
 * USERS MANAGEMENT (RBAC: Admin / Presidente / Coordinadores)
 * --------------------------------------------------------------------------------
 */
router.get('/users', (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getUsers());
});

router.post('/users', requireAuth, requireRoles(['presidente', 'seguimiento', 'autoevaluacion']), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as Partial<User>;
  if (!data.name || !data.email) {
    res.status(400).json({ error: 'Faltan campos obligatorios (nombre, correo).' });
    return;
  }

  const initials = data.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');

  const newUser: User = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name: data.name,
    email: data.email,
    role: data.role || 'miembro',
    roleId: data.roleId,
    estamentoId: data.estamentoId,
    estamentoName: data.estamentoName,
    department: data.department || 'Ingeniería Mecánica',
    academicTitle: data.academicTitle || 'Docente / Investigador',
    avatarInitials: initials || 'MI',
    isExternal: data.isExternal || false,
    hasVote: data.hasVote !== undefined ? data.hasVote : true,
    periodo: data.periodo || '2026 - 2028',
    active: true,
  };

  db.addUser(newUser);

  db.logAudit({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'CREATE_USER',
    resource: `/api/users/${newUser.id}`,
    details: `Alta de miembro '${newUser.name}' (${newUser.email}) con rol '${newUser.role}' y voto: ${newUser.hasVote}`,
    ipAddress: req.clientIp,
  });

  wsHub.broadcast('user:created', newUser, req.user!.id);
  res.status(201).json(newUser);
});

router.put('/users/:id', requireAuth, requireRoles(['presidente', 'seguimiento', 'autoevaluacion']), (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateUser(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Usuario no encontrado.' });
    return;
  }

  db.logAudit({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'UPDATE_USER',
    resource: `/api/users/${req.params.id}`,
    details: `Modificación de perfil de miembro '${updated.name}' (${updated.email})`,
    ipAddress: req.clientIp,
  });

  wsHub.broadcast('user:updated', updated, req.user!.id);
  res.json(updated);
});

router.delete('/users/:id', requireAuth, requireRoles(['presidente']), (req: AuthenticatedRequest, res: Response) => {
  const target = db.getUserById(req.params.id);
  if (!target) {
    res.status(404).json({ error: 'Usuario no encontrado.' });
    return;
  }

  if (target.email === 'autoevaluacionycurriculomecanica@umayor.edu.co') {
    res.status(400).json({ error: 'No es posible dar de baja la cuenta principal administradora del sistema.' });
    return;
  }

  db.deleteUser(req.params.id);

  db.logAudit({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'DELETE_USER',
    resource: `/api/users/${req.params.id}`,
    details: `Baja de miembro '${target.name}' (${target.email})`,
    ipAddress: req.clientIp,
  });

  wsHub.broadcast('user:deleted', { id: req.params.id }, req.user!.id);
  res.json({ success: true, message: 'Usuario dado de baja exitosamente.' });
});

/**
 * --------------------------------------------------------------------------------
 * ESTAMENTOS & ROLES
 * --------------------------------------------------------------------------------
 */
router.get('/estamentos', (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getEstamentos());
});

router.post('/estamentos', requireAuth, requireRoles(['presidente', 'seguimiento', 'autoevaluacion']), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as Partial<Estamento>;
  const newEst: Estamento = {
    id: `est-${Date.now()}`,
    name: data.name || 'Nuevo Estamento',
    code: data.code || 'EST',
    description: data.description || '',
    category: data.category || 'docente',
    hasStatutoryVote: data.hasStatutoryVote !== undefined ? data.hasStatutoryVote : true,
    active: true,
  };
  db.addEstamento(newEst);
  wsHub.broadcast('estamento:created', newEst, req.user?.id);
  res.status(201).json(newEst);
});

router.put('/estamentos/:id', requireAuth, requireRoles(['presidente', 'seguimiento', 'autoevaluacion']), (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updateEstamento(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Estamento no encontrado.' });
  wsHub.broadcast('estamento:updated', updated, req.user?.id);
  res.json(updated);
});

router.get('/roles', (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getCustomRoles());
});

router.post('/roles', requireAuth, requireRoles(['presidente', 'seguimiento', 'autoevaluacion']), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as Partial<CustomRole>;
  const newRole: CustomRole = {
    id: `role-${Date.now()}`,
    name: data.name || 'Nuevo Rol Institucional',
    code: data.code || 'ROL',
    description: data.description || '',
    baseRole: data.baseRole || 'miembro',
    canVote: !!data.canVote,
    canSignActs: !!data.canSignActs,
    canAuditCommitments: !!data.canAuditCommitments,
    canMapQuality: !!data.canMapQuality,
    isAdmin: !!data.isAdmin,
    color: data.color || 'slate',
  };
  db.addCustomRole(newRole);
  wsHub.broadcast('role:created', newRole, req.user?.id);
  res.status(201).json(newRole);
});

/**
 * --------------------------------------------------------------------------------
 * MEETINGS & AGENDAS (MÓDULO A & B)
 * --------------------------------------------------------------------------------
 */
router.get('/meetings', (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getMeetings());
});

router.post('/meetings', requireAuth, requireRoles(['presidente']), (req: AuthenticatedRequest, res: Response) => {
  const body = req.body as Partial<Meeting>;
  if (!body.title || !body.date) {
    res.status(400).json({ error: 'Se requiere título y fecha de la sesión.' });
    return;
  }

  const year = body.date ? body.date.slice(0, 4) : new Date().getFullYear().toString();
  const count = db.getMeetings().length + 1;
  const seq = count.toString().padStart(3, '0');
  const code = body.type === 'extraordinaria' ? `ACTA-EXT-${year}-${seq}` : `ACTA-ORD-${year}-${seq}`;

  const defaultAttendees = (body.attendees && body.attendees.length > 0)
    ? body.attendees
    : db.getUsers().map((u) => ({
        userId: u.id,
        userName: u.name,
        role: u.role,
        present: u.id === req.user!.id,
      }));

  const quorumTotal = defaultAttendees.length || 1;
  const quorumPresent = defaultAttendees.filter((a) => a.present).length;

  const newMeeting: Meeting = {
    id: `meet-${Date.now()}`,
    code: body.code || code,
    type: body.type || 'ordinaria',
    title: body.title,
    date: body.date,
    startTime: body.startTime || '09:00',
    endTime: body.endTime || '11:00',
    modality: body.modality || 'hibrida',
    locationOrUrl: body.locationOrUrl || 'Sala de Juntas de Facultad / Enlace Google Meet',
    status: body.status || 'programada',
    attendees: defaultAttendees,
    agendaItems: body.agendaItems || [],
    quorumPresentCount: quorumPresent,
    quorumTotalRequired: quorumTotal,
    generalObservations: body.generalObservations || '',
  };

  db.addMeeting(newMeeting);

  db.logAudit({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'CREATE_MEETING',
    resource: `/api/meetings/${newMeeting.id}`,
    details: `Convocatoria de sesión ${newMeeting.code}: '${newMeeting.title}'`,
    ipAddress: req.clientIp,
  });

  wsHub.broadcast('meeting:created', newMeeting, req.user!.id);
  res.status(201).json(newMeeting);
});

router.put('/meetings/:id', requireAuth, requireRoles(['presidente']), (req: AuthenticatedRequest, res: Response) => {
  const existing = db.getMeetingById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Reunión no encontrada.' });

  if (existing.status === 'cerrada') {
    res.status(403).json({
      error: 'MEETING_CLOSED_IMMUTABLE',
      message: 'El acta se encuentra formalmente cerrada y sellada criptográficamente. Es inmutable.',
    });
    return;
  }

  const updated = db.updateMeeting(req.params.id, req.body);
  wsHub.broadcast('meeting:updated', updated, req.user!.id);
  res.json(updated);
});

// Citations dispatch
router.post('/meetings/:id/citations', requireAuth, requireRoles(['presidente']), (req: AuthenticatedRequest, res: Response) => {
  const meeting = db.getMeetingById(req.params.id);
  if (!meeting) return res.status(404).json({ error: 'Reunión no encontrada.' });

  const { recipientEmails, note } = req.body;

  const notif: InstitutionalNotification = {
    id: `notif-${Date.now()}`,
    title: `Convocatoria Oficial: Sesión ${meeting.code}`,
    message: `Ha sido formalmente convocado a la sesión '${meeting.title}' el día ${meeting.date} a las ${meeting.startTime}. ${note ? `Nota: ${note}` : ''}`,
    date: new Date().toISOString().slice(0, 10),
    read: false,
    recipientRoles: ['miembro', 'presidente', 'seguimiento', 'autoevaluacion', 'invitado_externo'],
    meetingCode: meeting.code,
    type: 'citacion',
  };

  db.addNotification(notif);
  wsHub.broadcast('notification:new', notif);

  res.json({
    success: true,
    message: `Citaciones y notificaciones despachadas exitosamente a ${(recipientEmails || []).length} destinatarios.`,
  });
});

// Close and Sign Meeting (Refrendación Digital PKI)
router.post('/meetings/:id/close', requireAuth, requireActSigningAuthority, (req: AuthenticatedRequest, res: Response) => {
  const meeting = db.getMeetingById(req.params.id);
  if (!meeting) return res.status(404).json({ error: 'Reunión no encontrada.' });

  if (meeting.status === 'cerrada') {
    res.status(400).json({ error: 'El acta ya se encuentra cerrada y refrendada digitalmente.' });
    return;
  }

  const nowIso = new Date().toISOString();
  const { notes } = req.body;

  // 1. Close all associated open motions
  const motions = db.getMotions();
  motions.forEach((m) => {
    if (m.meetingId === meeting.id && m.status === 'abierta') {
      db.updateMotion(m.id, { status: 'cerrada' });
    }
  });

  // 2. Perform Cryptographic Seal of the Act
  const seal = createDigitalActSeal(meeting, motions, db.getCommitments(), req.user!);
  db.addDigitalSeal(seal);

  // 3. Mark meeting as formally closed and digitally signed
  const updatedMeeting = db.updateMeeting(meeting.id, {
    status: 'cerrada',
    closedAt: nowIso,
    signedByPresident: true,
    presidentSignatureDate: nowIso,
    generalObservations: notes || meeting.generalObservations,
    cryptographicSealId: seal.id,
  });

  db.logAudit({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'CLOSE_AND_SEAL_ACT_PKI',
    resource: `/api/meetings/${meeting.id}/close`,
    details: `Cierre formal y firma digital PKI de acta ${meeting.code}. Hash SHA-256: ${seal.sha256Hash}`,
    payloadHash: seal.sha256Hash,
    ipAddress: req.clientIp,
  });

  // 4. Issue institutional notification
  const notif: InstitutionalNotification = {
    id: `notif-${Date.now()}`,
    title: `Acta ${meeting.code} Cerrada y Firmada Digitalmente`,
    message: `La Presidencia ha formalizado el cierre del acta con sello de tiempo SHA-256 y token ${seal.signaturePkiToken.slice(0, 20)}...`,
    date: nowIso.slice(0, 10),
    read: false,
    recipientRoles: ['miembro', 'presidente', 'seguimiento', 'autoevaluacion', 'invitado_externo'],
    meetingCode: meeting.code,
    type: 'sistema',
  };
  db.addNotification(notif);

  wsHub.broadcast('meeting:closed', { meeting: updatedMeeting, seal });
  wsHub.broadcast('notification:new', notif);

  res.json({
    success: true,
    meeting: updatedMeeting,
    seal,
    message: 'Acta formalmente cerrada y sellada criptográficamente con validez jurídica.',
  });
});

/**
 * --------------------------------------------------------------------------------
 * MOTIONS & REAL-TIME NOMINAL VOTING (MÓDULO B)
 * --------------------------------------------------------------------------------
 */
router.get('/motions', (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getMotions());
});

router.post('/motions', requireAuth, requireRoles(['presidente', 'miembro']), (req: AuthenticatedRequest, res: Response) => {
  const { meetingId, agendaItemId, title, description, majorityRequired } = req.body;
  if (!meetingId || !title) {
    res.status(400).json({ error: 'Faltan parámetros de la moción (meetingId, title).' });
    return;
  }

  const meeting = db.getMeetingById(meetingId);
  if (!meeting) return res.status(404).json({ error: 'Reunión no encontrada.' });
  if (meeting.status === 'cerrada') {
    res.status(403).json({ error: 'No es posible formular mociones en un acta cerrada.' });
    return;
  }

  const newMotion: Motion = {
    id: `mot-${Date.now()}`,
    meetingId,
    agendaItemId,
    title,
    description: description || '',
    proposedBy: req.user!.name,
    proposedAt: new Date().toISOString(),
    status: 'abierta',
    majorityRequired: majorityRequired || 'simple',
    votes: {},
  };

  db.addMotion(newMotion);

  db.logAudit({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'CREATE_MOTION',
    resource: `/api/motions/${newMotion.id}`,
    details: `Formulación de moción estatutaria '${newMotion.title}' en acta ${meeting.code}`,
    ipAddress: req.clientIp,
  });

  wsHub.broadcast('motion:created', newMotion, req.user!.id);
  res.status(201).json(newMotion);
});

// Real-time Nominal Vote Casting (Validado en Servidor con Hash Criptográfico)
router.post('/motions/:id/vote', requireAuth, requireVoteRight, (req: AuthenticatedRequest, res: Response) => {
  const motion = db.getMotionById(req.params.id);
  if (!motion) return res.status(404).json({ error: 'Moción no encontrada.' });

  if (motion.status !== 'abierta') {
    res.status(403).json({
      error: 'MOTION_NOT_OPEN',
      message: `La votación de esta moción se encuentra en estado '${motion.status}' y no admite votos adicionales.`,
    });
    return;
  }

  const { option } = req.body as { option: VoteOption };
  if (!['a_favor', 'en_contra', 'abstencion'].includes(option)) {
    res.status(400).json({ error: 'Opción de voto no válida (a_favor, en_contra, abstencion).' });
    return;
  }

  const timestamp = new Date().toISOString();
  const voteHash = generateVoteHash({
    userId: req.user!.id,
    userName: req.user!.name,
    motionId: motion.id,
    option,
    timestamp,
  });

  const voteRecord: VoteRecord = {
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    option,
    timestamp,
    voteHash,
  };

  const updatedVotes = {
    ...motion.votes,
    [req.user!.id]: voteRecord,
  };

  const updatedMotion = db.updateMotion(motion.id, { votes: updatedVotes });

  db.logAudit({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'CAST_NOMINAL_VOTE',
    resource: `/api/motions/${motion.id}/vote`,
    details: `Voto '${option}' emitido por '${req.user!.name}' (${req.user!.role}). Hash: ${voteHash.slice(0, 16)}`,
    payloadHash: voteHash,
    ipAddress: req.clientIp,
  });

  // Real-time WebSocket broadcast to ALL connected clients
  wsHub.broadcast('motion:vote_cast', {
    motionId: motion.id,
    vote: voteRecord,
    totalVotesCount: Object.keys(updatedVotes).length,
  }, req.user!.id);

  res.json({
    success: true,
    vote: voteRecord,
    motion: updatedMotion,
  });
});

// Finalize Motion and Compute Majority
router.post('/motions/:id/finalize', requireAuth, requireRoles(['presidente']), (req: AuthenticatedRequest, res: Response) => {
  const motion = db.getMotionById(req.params.id);
  if (!motion) return res.status(404).json({ error: 'Moción no encontrada.' });

  const meeting = db.getMeetingById(motion.meetingId);
  const totalEligible = meeting ? (meeting.attendees?.filter((a) => a.present).length || 1) : 1;

  const votesArr = Object.values(motion.votes || {});
  const aFavor = votesArr.filter((v) => v.option === 'a_favor').length;
  const enContra = votesArr.filter((v) => v.option === 'en_contra').length;
  const abstencion = votesArr.filter((v) => v.option === 'abstencion').length;
  const totalVotes = votesArr.length;

  let approved = false;
  if (motion.majorityRequired === 'unanime') {
    approved = aFavor > 0 && enContra === 0 && abstencion === 0 && totalVotes >= totalEligible;
  } else if (motion.majorityRequired === 'cualificada_dos_tercios') {
    approved = totalVotes > 0 && aFavor / totalVotes >= 2 / 3;
  } else {
    // simple majority
    approved = aFavor > enContra;
  }

  const result = {
    aFavor,
    enContra,
    abstencion,
    totalVotes,
    quorumPercentage: Math.round((totalVotes / (totalEligible || 1)) * 100),
    approved,
  };

  const status = approved ? 'aprobada' : 'rechazada';
  const updatedMotion = db.updateMotion(motion.id, {
    status,
    result,
  });

  db.logAudit({
    userId: req.user!.id,
    userName: req.user!.name,
    userRole: req.user!.role,
    action: 'FINALIZE_MOTION',
    resource: `/api/motions/${motion.id}/finalize`,
    details: `Declaratoria de moción '${motion.title}': ${status.toUpperCase()} (${aFavor} a favor, ${enContra} en contra, ${abstencion} abst.)`,
    ipAddress: req.clientIp,
  });

  wsHub.broadcast('motion:finalized', updatedMotion, req.user!.id);
  res.json(updatedMotion);
});

/**
 * --------------------------------------------------------------------------------
 * COMMITMENTS & AUDIT (MÓDULO C)
 * --------------------------------------------------------------------------------
 */
router.get('/commitments', (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getCommitments());
});

router.post('/commitments', requireAuth, requireRoles(['presidente', 'seguimiento', 'miembro']), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as Partial<Commitment>;
  if (!data.title || !data.responsibleId || !data.dueDate) {
    res.status(400).json({ error: 'Faltan campos obligatorios (title, responsibleId, dueDate).' });
    return;
  }

  const newCommitment: Commitment = {
    id: `com-${Date.now()}`,
    meetingId: data.meetingId || '',
    meetingCode: data.meetingCode || 'ACTA-PENDIENTE',
    agendaItemId: data.agendaItemId,
    title: data.title,
    description: data.description || '',
    responsibleId: data.responsibleId,
    responsibleName: data.responsibleName || 'Responsable Asignado',
    responsibleEmail: data.responsibleEmail || 'comite@umayor.edu.co',
    isExternalResponsible: !!data.isExternalResponsible,
    assignedBy: req.user!.name,
    assignedAt: new Date().toISOString().slice(0, 10),
    dueDate: data.dueDate,
    priority: data.priority || 'media',
    status: 'pendiente',
    evidences: [],
  };

  db.addCommitment(newCommitment);

  // Issue notification
  const notif: InstitutionalNotification = {
    id: `notif-${Date.now()}`,
    title: `Nuevo Compromiso Asignado: ${newCommitment.title}`,
    message: `Se le ha asignado la tarea '${newCommitment.title}' con fecha límite el ${newCommitment.dueDate}.`,
    date: new Date().toISOString().slice(0, 10),
    read: false,
    recipientEmail: newCommitment.responsibleEmail,
    recipientRoles: ['miembro', 'invitado_externo', 'seguimiento'],
    type: 'compromiso',
  };
  db.addNotification(notif);

  wsHub.broadcast('commitment:created', newCommitment, req.user!.id);
  wsHub.broadcast('notification:new', notif);

  res.status(201).json(newCommitment);
});

// Evidence Submission
router.post('/commitments/:id/evidence', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const com = db.getCommitmentById(req.params.id);
  if (!com) return res.status(404).json({ error: 'Compromiso no encontrado.' });

  const { description, driveUrl, fileName } = req.body;
  if (!driveUrl) return res.status(400).json({ error: 'Se requiere URL válida de Google Drive.' });

  const newEvidence = {
    id: `ev-${Date.now()}`,
    submittedAt: new Date().toISOString().slice(0, 10),
    submittedBy: req.user!.name,
    description: description || 'Evidencia cargada para validación y auditoría técnica.',
    driveUrl,
    fileName: fileName || 'Evidencia_Cumplimiento.pdf',
  };

  const updatedEvidences = [...(com.evidences || []), newEvidence];
  const updatedCom = db.updateCommitment(com.id, {
    evidences: updatedEvidences,
    status: 'en_revision',
  });

  const notif: InstitutionalNotification = {
    id: `notif-${Date.now()}`,
    title: `Evidencia Radicada: ${com.title}`,
    message: `${req.user!.name} ha cargado soportes para el compromiso '${com.title}' de acta ${com.meetingCode}. Pendiente auditoría.`,
    date: new Date().toISOString().slice(0, 10),
    read: false,
    recipientRoles: ['seguimiento', 'presidente'],
    type: 'compromiso',
  };
  db.addNotification(notif);

  wsHub.broadcast('commitment:evidence_submitted', { commitment: updatedCom, evidence: newEvidence }, req.user!.id);
  wsHub.broadcast('notification:new', notif);

  res.json(updatedCom);
});

// Audit Validation (Encargado de Seguimiento / Presidente)
router.post('/commitments/:id/audit', requireAuth, requireRoles(['seguimiento', 'presidente']), (req: AuthenticatedRequest, res: Response) => {
  const com = db.getCommitmentById(req.params.id);
  if (!com) return res.status(404).json({ error: 'Compromiso no encontrado.' });

  const { newStatus, notes } = req.body;
  const now = new Date().toISOString().slice(0, 10);

  const updatedCom = db.updateCommitment(com.id, {
    status: newStatus,
    auditedBy: req.user!.name,
    auditNotes: notes,
    auditedAt: now,
  });

  const notif: InstitutionalNotification = {
    id: `notif-${Date.now()}`,
    title: `Compromiso Auditado: Estado ${newStatus.toUpperCase()}`,
    message: `El Encargado de Seguimiento ha auditado el compromiso '${com.title}'. Dictamen: ${notes || 'Conforme.'}`,
    date: now,
    read: false,
    recipientEmail: com.responsibleEmail,
    recipientRoles: ['miembro', 'invitado_externo', 'presidente'],
    type: 'auditoria',
  };
  db.addNotification(notif);

  wsHub.broadcast('commitment:audited', updatedCom, req.user!.id);
  wsHub.broadcast('notification:new', notif);

  res.json(updatedCom);
});

// Deadline Alert Dispatch
router.post('/commitments/:id/alert', requireAuth, requireRoles(['seguimiento', 'presidente']), (req: AuthenticatedRequest, res: Response) => {
  const com = db.getCommitmentById(req.params.id);
  if (!com) return res.status(404).json({ error: 'Compromiso no encontrado.' });

  const nowIso = new Date().toISOString();
  const updatedCom = db.updateCommitment(com.id, {
    lastReminderSentAt: nowIso,
    reminderCount: (com.reminderCount || 0) + 1,
  });

  const notif: InstitutionalNotification = {
    id: `notif-${Date.now()}`,
    title: `Alerta Preventiva Despachada: ${com.title}`,
    message: `Se remitió notificación formal a ${com.responsibleName} (${com.responsibleEmail}) por vencimiento próximo el ${com.dueDate}.`,
    date: nowIso.slice(0, 10),
    read: false,
    recipientEmail: com.responsibleEmail,
    recipientRoles: ['seguimiento', 'presidente', 'miembro'],
    meetingCode: com.meetingCode,
    type: 'compromiso',
  };
  db.addNotification(notif);

  wsHub.broadcast('commitment:alert_sent', updatedCom, req.user!.id);
  wsHub.broadcast('notification:new', notif);

  res.json({
    success: true,
    commitment: updatedCom,
    message: `Notificación formal por correo despachada exitosamente a ${com.responsibleEmail}.`,
  });
});

// Batch Deadline Alerts Dispatch
router.post('/commitments/batch-alerts', requireAuth, requireRoles(['seguimiento', 'presidente']), (req: AuthenticatedRequest, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueSoonList = db.getCommitments().filter((c) => {
    if (c.status === 'cumplido') return false;
    const due = new Date(c.dueDate);
    due.setHours(0, 0, 0, 0);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 7;
  });

  const nowIso = new Date().toISOString();
  const recipients: string[] = [];

  dueSoonList.forEach((c) => {
    if (!recipients.includes(c.responsibleEmail)) recipients.push(c.responsibleEmail);
    db.updateCommitment(c.id, {
      lastReminderSentAt: nowIso,
      reminderCount: (c.reminderCount || 0) + 1,
    });
  });

  if (dueSoonList.length > 0) {
    const notif: InstitutionalNotification = {
      id: `notif-${Date.now()}`,
      title: `Lote de ${dueSoonList.length} Alertas Preventivas Despachadas`,
      message: `Se enviaron correos automáticos de aviso de vencimiento a ${recipients.length} responsables institucionales.`,
      date: nowIso.slice(0, 10),
      read: false,
      recipientRoles: ['seguimiento', 'presidente'],
      type: 'compromiso',
    };
    db.addNotification(notif);
    wsHub.broadcast('notification:new', notif);
  }

  res.json({
    success: true,
    sentCount: dueSoonList.length,
    recipients,
  });
});

/**
 * --------------------------------------------------------------------------------
 * QUALITY NOMENCLATURES & MAPPINGS (MÓDULO D)
 * --------------------------------------------------------------------------------
 */
router.get('/quality-factors', (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getQualityFactors());
});

router.post('/quality-factors', requireAuth, requireRoles(['autoevaluacion', 'presidente']), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as Partial<QualityFactor>;
  const newFactor: QualityFactor = {
    id: `fact-${Date.now()}`,
    code: data.code || 'FACTOR',
    name: data.name || 'Nuevo Factor',
    description: data.description || '',
    framework: data.framework || 'CNA',
    features: data.features || [],
  };
  db.addQualityFactor(newFactor);
  wsHub.broadcast('quality:factor_created', newFactor, req.user!.id);
  res.status(201).json(newFactor);
});

router.delete('/quality-factors/:id', requireAuth, requireRoles(['autoevaluacion', 'presidente']), (req: AuthenticatedRequest, res: Response) => {
  db.deleteQualityFactor(req.params.id);
  wsHub.broadcast('quality:factor_deleted', { id: req.params.id }, req.user!.id);
  res.json({ success: true });
});

router.post('/quality-factors/reset', requireAuth, requireRoles(['autoevaluacion', 'presidente']), (req: AuthenticatedRequest, res: Response) => {
  db.setQualityFactors([]);
  wsHub.broadcast('quality:factors_reset', {}, req.user!.id);
  res.json({ success: true, message: 'Catálogo de nomenclaturas vaciado.' });
});

router.get('/quality-mappings', (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getQualityMappings());
});

router.post('/quality-mappings', requireAuth, requireRoles(['autoevaluacion', 'presidente']), (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;
  const newMapping: ActQualityMapping = {
    ...data,
    id: `map-${Date.now()}`,
    mappedBy: req.user!.name,
    mappedAt: new Date().toISOString(),
  };
  db.addQualityMapping(newMapping);
  wsHub.broadcast('quality:mapping_created', newMapping, req.user!.id);
  res.status(201).json(newMapping);
});

router.delete('/quality-mappings/:id', requireAuth, requireRoles(['autoevaluacion', 'presidente']), (req: AuthenticatedRequest, res: Response) => {
  db.deleteQualityMapping(req.params.id);
  wsHub.broadcast('quality:mapping_deleted', { id: req.params.id }, req.user!.id);
  res.json({ success: true });
});

/**
 * --------------------------------------------------------------------------------
 * DIGITAL ACTS VERIFICATION (Validez Jurídica & Probatoria)
 * --------------------------------------------------------------------------------
 */
router.get('/acts/:meetingId/seal', (req: AuthenticatedRequest, res: Response) => {
  const seal = db.getDigitalSealByMeetingId(req.params.meetingId);
  if (!seal) {
    res.status(404).json({ error: 'El acta no cuenta con un sello criptográfico registrado o aún no ha sido cerrada.' });
    return;
  }
  res.json(seal);
});

// Public Verification Endpoint
router.post('/acts/verify-seal', (req: AuthenticatedRequest, res: Response) => {
  const { sha256Hash, signaturePkiToken, canonicalPayload, sealedAt, signerEmail } = req.body;

  if (sha256Hash) {
    const seal = db.getDigitalSealByHash(sha256Hash);
    if (seal) {
      const verification = verifyActIntegrity(
        seal.canonicalPayload,
        seal.sha256Hash,
        seal.signaturePkiToken,
        seal.sealedAt,
        seal.signerEmail
      );
      res.json({
        foundInRegistry: true,
        seal,
        verification,
      });
      return;
    }
  }

  if (canonicalPayload && sha256Hash && signaturePkiToken && sealedAt && signerEmail) {
    const verification = verifyActIntegrity(
      canonicalPayload,
      sha256Hash,
      signaturePkiToken,
      sealedAt,
      signerEmail
    );
    res.json({
      foundInRegistry: false,
      verification,
    });
    return;
  }

  res.status(400).json({ error: 'Parámetros insuficientes para la validación criptográfica.' });
});

/**
 * --------------------------------------------------------------------------------
 * ACCESS REQUESTS & NOTIFICATIONS
 * --------------------------------------------------------------------------------
 */
router.get('/access-requests', (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getAccessRequests());
});

router.post('/access-requests', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { meetingId, meetingCode, purpose } = req.body;
  const newReq: AccessRequest = {
    id: `req-${Date.now()}`,
    meetingId,
    meetingCode,
    requestedBy: req.user!.name,
    userRole: req.user!.role,
    purpose,
    requestedAt: new Date().toISOString(),
    status: 'pendiente',
  };
  db.addAccessRequest(newReq);
  wsHub.broadcast('access_request:new', newReq, req.user!.id);
  res.status(201).json(newReq);
});

router.post('/access-requests/:id/resolve', requireAuth, requireRoles(['presidente', 'seguimiento']), (req: AuthenticatedRequest, res: Response) => {
  const { status, note } = req.body;
  const updated = db.updateAccessRequest(req.params.id, {
    status,
    resolvedBy: req.user!.name,
    resolvedAt: new Date().toISOString(),
    resolutionNote: note || (status === 'aprobado' ? 'Solicitud autorizada por la Presidencia.' : 'Denegada.'),
  });
  if (!updated) return res.status(404).json({ error: 'Solicitud no encontrada.' });
  wsHub.broadcast('access_request:resolved', updated, req.user!.id);
  res.json(updated);
});

router.get('/notifications', (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getNotifications());
});

router.put('/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

router.get('/audit-logs', requireAuth, requireRoles(['presidente', 'seguimiento', 'autoevaluacion']), (req: AuthenticatedRequest, res: Response) => {
  res.json(db.getAll().auditLogs);
});
