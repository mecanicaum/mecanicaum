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
  VoteOption,
  VoteRecord,
  DigitalActSeal,
  AcademicProgram,
} from '../types';

let currentUserId = 'usr-admin-principal';
let currentToken = '';

export function setApiToken(token: string) {
  currentToken = token;
  try {
    if (token) {
      localStorage.setItem('sigc_auth_token', token);
    } else {
      localStorage.removeItem('sigc_auth_token');
    }
  } catch {}
}

export function getApiToken(): string {
  if (!currentToken && typeof window !== 'undefined') {
    try {
      currentToken = localStorage.getItem('sigc_auth_token') || '';
    } catch {}
  }
  return currentToken;
}

export function setApiUserId(id: string) {
  currentUserId = id;
}

export function getApiUserId(): string {
  return currentUserId;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  headers.set('x-user-id', currentUserId);
  const token = getApiToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.message) errorMsg = errJson.message;
      else if (errJson.error) errorMsg = errJson.error;
    } catch {
      // fallback to statusText
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

type EventCallback = (payload: any) => void;

class RealtimeClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnected = false;
  private reconnectTimer: any = null;

  public connect() {
    if (typeof window === 'undefined') return;
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        console.log('[WS] Real-time WebSocket connection established.');
        this.identify(currentUserId);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type) {
            this.dispatch(data.type, data.payload);
            this.dispatch('*', data);
          }
        } catch (err) {
          console.error('[WS] Error parsing message:', err);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[WS] WebSocket encountered an error, reconnecting...', err);
        this.ws?.close();
      };
    } catch (err) {
      console.error('[WS] Failed to initialize WebSocket:', err);
      this.scheduleReconnect();
    }
  }

  public identify(userId: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'presence:identify',
          payload: { userId },
        })
      );
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000);
  }

  public onConnectionChange(callback: (connected: boolean) => void) {
    callback(this.isConnected);
    return this.on('connection:change', callback);
  }

  public on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private dispatch(event: string, payload: any) {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(payload);
        } catch (e) {
          console.error(`[WS] Error in listener for ${event}:`, e);
        }
      });
    }
  }
}

export const realtime = new RealtimeClient();

export const api = {
  // Bootstrap
  bootstrap: () => request<{
    currentUser: User;
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
  }>('/bootstrap'),

  // Google Workspace SSO Authentication
  loginGoogleSSO: (email: string, name: string) =>
    request<{ success: boolean; user: User; isNewUser: boolean; message: string }>('/auth/google-sso', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    }),

  // Institutional Credentials Login
  loginWithCredentials: (email: string, password: string) =>
    request<{ success: boolean; user: User; token: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // Users
  getUsers: () => request<User[]>('/users'),
  createUser: (data: Partial<User>) => request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: Partial<User>) => request<User>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id: string) => request<{ success: boolean; message: string }>(`/users/${id}`, { method: 'DELETE' }),

  // Academic Programs (Multiprograma)
  getPrograms: () => request<AcademicProgram[]>('/programs'),
  createProgram: (data: Partial<AcademicProgram>) => request<AcademicProgram>('/programs', { method: 'POST', body: JSON.stringify(data) }),
  updateProgram: (id: string, data: Partial<AcademicProgram>) => request<AcademicProgram>(`/programs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProgram: (id: string) => request<{ success: boolean; message: string }>(`/programs/${id}`, { method: 'DELETE' }),

  // Estamentos & Roles
  getEstamentos: () => request<Estamento[]>('/estamentos'),
  createEstamento: (data: Partial<Estamento>) => request<Estamento>('/estamentos', { method: 'POST', body: JSON.stringify(data) }),
  updateEstamento: (id: string, data: Partial<Estamento>) => request<Estamento>(`/estamentos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEstamento: (id: string) => request<{ success: boolean }>(`/estamentos/${id}`, { method: 'DELETE' }),
  getRoles: () => request<CustomRole[]>('/roles'),
  createRole: (data: Partial<CustomRole>) => request<CustomRole>('/roles', { method: 'POST', body: JSON.stringify(data) }),

  // Meetings
  getMeetings: () => request<Meeting[]>('/meetings'),
  createMeeting: (data: Partial<Meeting>) => request<Meeting>('/meetings', { method: 'POST', body: JSON.stringify(data) }),
  updateMeeting: (id: string, data: Partial<Meeting>) => request<Meeting>(`/meetings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  addAgendaItem: (meetingId: string, item: any) => request<Meeting>(`/meetings/${meetingId}/agenda`, { method: 'POST', body: JSON.stringify(item) }),
  updateAgendaItem: (meetingId: string, itemId: string, item: any) => request<Meeting>(`/meetings/${meetingId}/agenda/${itemId}`, { method: 'PUT', body: JSON.stringify(item) }),
  deleteAgendaItem: (meetingId: string, itemId: string) => request<Meeting>(`/meetings/${meetingId}/agenda/${itemId}`, { method: 'DELETE' }),
  closeMeeting: (id: string, notes: string) => request<{ success: boolean; meeting: Meeting; seal: DigitalActSeal; message: string }>(`/meetings/${id}/close`, { method: 'POST', body: JSON.stringify({ notes }) }),
  sendCitations: (id: string, recipientEmails: string[], note?: string) => request<{ success: boolean; message: string }>(`/meetings/${id}/citations`, { method: 'POST', body: JSON.stringify({ recipientEmails, note }) }),

  // Motions & Real-time Voting
  getMotions: () => request<Motion[]>('/motions'),
  createMotion: (data: { meetingId: string; agendaItemId?: string; title: string; description: string; majorityRequired: Motion['majorityRequired'] }) => request<Motion>('/motions', { method: 'POST', body: JSON.stringify(data) }),
  castVote: (motionId: string, option: VoteOption) => request<{ success: boolean; vote: VoteRecord; motion: Motion }>(`/motions/${motionId}/vote`, { method: 'POST', body: JSON.stringify({ option }) }),
  finalizeMotion: (motionId: string) => request<Motion>(`/motions/${motionId}/finalize`, { method: 'POST' }),

  // Commitments
  getCommitments: () => request<Commitment[]>('/commitments'),
  createCommitment: (data: Partial<Commitment>) => request<Commitment>('/commitments', { method: 'POST', body: JSON.stringify(data) }),
  submitEvidence: (id: string, data: { description: string; driveUrl: string; fileName?: string }) => request<Commitment>(`/commitments/${id}/evidence`, { method: 'POST', body: JSON.stringify(data) }),
  auditCommitment: (id: string, newStatus: string, notes: string) => request<Commitment>(`/commitments/${id}/audit`, { method: 'POST', body: JSON.stringify({ newStatus, notes }) }),
  sendCommitmentAlert: (id: string) => request<{ success: boolean; commitment: Commitment; message: string }>(`/commitments/${id}/alert`, { method: 'POST' }),
  sendBatchAlerts: () => request<{ success: boolean; sentCount: number; recipients: string[] }>('/commitments/batch-alerts', { method: 'POST' }),

  // Quality Framework
  getQualityFactors: () => request<QualityFactor[]>('/quality-factors'),
  createQualityFactor: (data: Partial<QualityFactor>) => request<QualityFactor>('/quality-factors', { method: 'POST', body: JSON.stringify(data) }),
  deleteQualityFactor: (id: string) => request<{ success: boolean }>(`/quality-factors/${id}`, { method: 'DELETE' }),
  resetQualityFactors: () => request<{ success: boolean; message: string }>('/quality-factors/reset', { method: 'POST' }),

  // Quality Mappings
  getQualityMappings: () => request<ActQualityMapping[]>('/quality-mappings'),
  createQualityMapping: (data: Partial<ActQualityMapping>) => request<ActQualityMapping>('/quality-mappings', { method: 'POST', body: JSON.stringify(data) }),
  deleteQualityMapping: (id: string) => request<{ success: boolean }>(`/quality-mappings/${id}`, { method: 'DELETE' }),

  // Digital Seals & Verification
  getActSeal: (meetingId: string) => request<DigitalActSeal>(`/acts/${meetingId}/seal`),
  verifyActSeal: (params: { sha256Hash?: string; signaturePkiToken?: string; canonicalPayload?: string; sealedAt?: string; signerEmail?: string }) => request<{
    foundInRegistry: boolean;
    seal?: DigitalActSeal;
    verification: { isValid: boolean; recomputedHash: string; expectedPkiToken: string; errorReason?: string };
  }>('/acts/verify-seal', { method: 'POST', body: JSON.stringify(params) }),

  // Access Requests & Notifications
  getAccessRequests: () => request<AccessRequest[]>('/access-requests'),
  requestActAccess: (data: { meetingId: string; meetingCode: string; purpose: string }) => request<AccessRequest>('/access-requests', { method: 'POST', body: JSON.stringify(data) }),
  resolveAccessRequest: (id: string, status: string, note?: string) => request<AccessRequest>(`/access-requests/${id}/resolve`, { method: 'POST', body: JSON.stringify({ status, note }) }),
  getNotifications: () => request<InstitutionalNotification[]>('/notifications'),
  markNotificationRead: (id: string) => request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),
};
