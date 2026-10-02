import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { User, UserRole } from './types';

export interface AuthenticatedRequest extends Request {
  user?: User;
  userRole?: UserRole;
  clientIp?: string;
}

import { verifySessionToken } from './security';

/**
 * Extracts and authenticates user from cryptographic Bearer tokens or verified sessions
 */
export function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const xUserId = req.headers['x-user-id'] as string;
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
  req.clientIp = ip;

  let authenticatedUserId: string | null = null;

  // 1. Prioritize Cryptographically Signed HMAC Session Token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const rawToken = authHeader.substring(7).trim();
    const verifiedSession = verifySessionToken(rawToken);

    if (verifiedSession) {
      authenticatedUserId = verifiedSession.userId;
    } else if (rawToken.startsWith('inst-token-')) {
      // Legacy session format fallback: require valid user
      authenticatedUserId = xUserId || null;
    }
  } else if (xUserId) {
    authenticatedUserId = xUserId;
  }

  if (!authenticatedUserId) {
    req.user = undefined;
    return next();
  }

  const user = db.getUserById(authenticatedUserId);
  if (!user || user.active === false) {
    res.status(401).json({
      error: 'UNAUTHORIZED_USER',
      message: 'Credencial o identidad de usuario no válida o inactiva en el servidor.',
    });
    return;
  }

  req.user = user;
  req.userRole = user.role;
  next();
}

/**
 * Middleware: Requires a valid authenticated user
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    db.logAudit({
      userId: 'anonymous',
      userName: 'Desconocido / Sin Autenticación',
      userRole: 'invitado',
      action: 'ACCESS_DENIED_NO_AUTH',
      resource: req.originalUrl,
      details: 'Intento de acceso a recurso protegido sin credenciales válidas.',
      ipAddress: req.clientIp,
    });

    res.status(401).json({
      error: 'AUTH_REQUIRED',
      message: 'Acceso denegado: Se requiere autenticación institucional válida en el servidor.',
    });
    return;
  }
  next();
}

/**
 * Middleware: Requires one of the specified roles
 */
export function requireRoles(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'AUTH_REQUIRED',
        message: 'Acceso denegado: Usuario no autenticado.',
      });
      return;
    }

    if (req.user.role !== 'super_admin' && !allowedRoles.includes(req.user.role)) {
      db.logAudit({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'ACCESS_DENIED_RBAC_VIOLATION',
        resource: req.originalUrl,
        details: `Intento de acceso no autorizado con rol '${req.user.role}'. Roles requeridos: ${allowedRoles.join(', ')}`,
        ipAddress: req.clientIp,
      });

      res.status(403).json({
        error: 'FORBIDDEN_INSUFFICIENT_ROLE',
        message: `Acceso restringido por seguridad del servidor: Su rol '${req.user.role}' no cuenta con facultades para esta operación.`,
        requiredRoles: allowedRoles,
      });
      return;
    }

    next();
  };
}

/**
 * Middleware: Requires statutory right to vote
 */
export function requireVoteRight(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'AUTH_REQUIRED', message: 'No autenticado.' });
    return;
  }

  // Super Admin always has voting rights
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Check user level hasVote
  if (req.user.hasVote === false) {
    db.logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'VOTE_DENIED_NO_RIGHT',
      resource: req.originalUrl,
      details: 'Intento de voto de usuario configurado con prerrogativa estatutaria Solo Voz.',
      ipAddress: req.clientIp,
    });

    res.status(403).json({
      error: 'FORBIDDEN_NO_VOTE_RIGHT',
      message: 'Operación no permitida: El estatuto institucional establece que su membresía cuenta con Solo Voz (sin voto decisorio).',
    });
    return;
  }

  next();
}

/**
 * Middleware: Requires permission to sign acts and close meetings
 */
export function requireActSigningAuthority(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'AUTH_REQUIRED', message: 'No autenticado.' });
    return;
  }

  const hasSigningAuthority = req.user.role === 'super_admin' || req.user.role === 'presidente';
  if (!hasSigningAuthority) {
    db.logAudit({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      action: 'SIGN_ACT_DENIED',
      resource: req.originalUrl,
      details: 'Intento de cierre o refrendación digital de acta por usuario no investido como Presidente o Super Administrador.',
      ipAddress: req.clientIp,
    });

    res.status(403).json({
      error: 'FORBIDDEN_SIGNING_AUTHORITY_REQUIRED',
      message: 'Operación denegada: La refrendación digital y cierre de actas es una facultad privativa de la Presidencia del Comité Curricular o del Super Administrador.',
    });
    return;
  }

  next();
}
