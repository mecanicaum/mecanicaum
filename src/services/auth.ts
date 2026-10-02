import { User, UserRole } from '../types';

export interface InstitutionalSessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  academicTitle: string;
  avatarInitials: string;
  photoURL?: string | null;
  token: string;
  authenticatedAt: string;
}

const LOCAL_SESSION_KEY = 'sigc_institutional_session_v1';

export interface GoogleAuthResult {
  firebaseUser: any;
  accessToken: string;
  email: string;
  name: string;
  photoURL?: string | null;
}

let cachedSession: InstitutionalSessionUser | null = null;
let authListeners: Array<(user: InstitutionalSessionUser | null) => void> = [];

function loadStoredSession(): InstitutionalSessionUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      cachedSession = parsed;
      return parsed;
    }
  } catch (e) {
    console.warn('[InstitutionalAuth] Error parsing saved session:', e);
  }
  return null;
}

// Subscribe to auth state changes
export const initAuth = (
  onAuthSuccess?: (user: any, token: string) => void,
  onAuthFailure?: () => void
) => {
  const session = loadStoredSession();
  if (session) {
    if (onAuthSuccess) onAuthSuccess(session, session.token);
  } else {
    if (onAuthFailure) onAuthFailure();
  }

  const listener = (currentUser: InstitutionalSessionUser | null) => {
    if (currentUser) {
      if (onAuthSuccess) onAuthSuccess(currentUser, currentUser.token);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  };

  authListeners.push(listener);

  return () => {
    authListeners = authListeners.filter((l) => l !== listener);
  };
};

/**
 * Signs in a user using institutional email or committee member profile without external Firebase keys
 */
export const institutionalSignIn = async (
  email: string,
  name?: string,
  role?: UserRole
): Promise<InstitutionalSessionUser> => {
  const normalizedEmail = email.toLowerCase().trim();
  const isSuperAdminEmail = normalizedEmail === 'autoevaluacionycurriculomecanica@umayor.edu.co';
  
  const displayName = isSuperAdminEmail
    ? (name || 'Super Administrador del Comité Curricular')
    : (name || (normalizedEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())));
  
  const initials = isSuperAdminEmail
    ? 'SA'
    : displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('') || 'DC';

  const assignedRole: UserRole = isSuperAdminEmail
    ? 'super_admin'
    : role ||
      (normalizedEmail.includes('decano') || normalizedEmail.includes('presidente')
        ? 'presidente'
        : normalizedEmail.includes('seguimiento')
        ? 'seguimiento'
        : normalizedEmail.includes('estudiante') || normalizedEmail.includes('alumno')
        ? 'miembro'
        : 'miembro');

  const session: InstitutionalSessionUser = {
    id: isSuperAdminEmail ? 'usr-admin-principal' : `usr-inst-${Date.now()}`,
    name: displayName,
    email: normalizedEmail,
    role: assignedRole,
    department: 'Facultad de Ingeniería · Depto. Ingeniería Mecánica',
    academicTitle: assignedRole === 'super_admin'
      ? 'Super Administrador / Presidencia Comité Curricular'
      : assignedRole === 'presidente'
      ? 'Decano / Presidente de Comité'
      : 'Docente / Integrante del Comité',
    avatarInitials: initials,
    token: `inst-token-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
    authenticatedAt: new Date().toISOString(),
  };

  cachedSession = session;
  try {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('[InstitutionalAuth] Failed to save session:', e);
  }

  authListeners.forEach((l) => l(session));
  return session;
};

/**
 * Backward compatibility with googleSignIn call signature
 */
export const googleSignIn = async (
  providedEmail?: string,
  providedName?: string
): Promise<GoogleAuthResult | null> => {
  const defaultEmail = providedEmail || 'autoevaluacionycurriculomecanica@umayor.edu.co';
  const defaultName = providedName || 'Super Administrador del Comité Curricular';
  
  const session = await institutionalSignIn(defaultEmail, defaultName, 'super_admin');

  return {
    firebaseUser: {
      uid: session.id,
      email: session.email,
      displayName: session.name,
      photoURL: null,
    },
    accessToken: session.token,
    email: session.email,
    name: session.name,
    photoURL: null,
  };
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedSession) return cachedSession.token;
  const session = loadStoredSession();
  return session?.token || null;
};

export const logoutGoogle = async () => {
  cachedSession = null;
  try {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  } catch {}
  authListeners.forEach((l) => l(null));
};

export const logoutInstitutional = logoutGoogle;
