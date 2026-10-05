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
  AcademicProgram,
} from '../types';
import {
  INITIAL_PROGRAMS,
  INITIAL_USERS,
  INITIAL_ESTAMENTOS,
  INITIAL_CUSTOM_ROLES,
  INITIAL_MEETINGS,
  INITIAL_MOTIONS,
  INITIAL_COMMITMENTS,
  INITIAL_QUALITY_MAPPINGS,
  CNA_ABET_TEMPLATE_FACTORS,
} from '../data/mockData';

export interface AuditLogRecord {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  resource: string;
  details: string;
}

const DB_NAME = 'SIG_CURRICULO_INDEXED_DB';
const DB_VERSION = 1;

export interface FullBackupData {
  version: string;
  exportedAt: string;
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
  auditLogs: AuditLogRecord[];
  currentUserId?: string;
  activeMeetingId?: string;
}

class BrowserStorageManager {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isSupported = typeof window !== 'undefined' && 'indexedDB' in window;

  constructor() {
    if (this.isSupported) {
      this.initDb();
    }
  }

  private initDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          const stores = [
            'users',
            'estamentos',
            'customRoles',
            'meetings',
            'motions',
            'commitments',
            'qualityFactors',
            'qualityMappings',
            'accessRequests',
            'notifications',
            'digitalSeals',
            'auditLogs',
            'appState',
          ];

          stores.forEach((storeName) => {
            if (!db.objectStoreNames.contains(storeName)) {
              db.createObjectStore(storeName, { keyPath: 'id' });
            }
          });
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('[IndexedDB] Error opening database, falling back to LocalStorage:', request.error);
          reject(request.error);
        };
      } catch (err) {
        console.warn('[IndexedDB] Initialization exception, fallback active:', err);
        reject(err);
      }
    });

    return this.dbPromise;
  }

  // Generic IndexedDB Put All
  private async putAll<T extends { id: string }>(storeName: string, items: T[]): Promise<void> {
    if (!this.isSupported) {
      this.saveToLocalStorage(storeName, items);
      return;
    }

    try {
      const db = await this.initDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.clear();
        items.forEach((item) => store.put(item));
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      this.saveToLocalStorage(storeName, items);
    }
  }

  // Generic IndexedDB Get All
  private async getAll<T>(storeName: string): Promise<T[]> {
    if (!this.isSupported) {
      return this.getFromLocalStorage<T>(storeName);
    }

    try {
      const db = await this.initDb();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return this.getFromLocalStorage<T>(storeName);
    }
  }

  // LocalStorage Fallbacks
  private saveToLocalStorage(key: string, data: any): void {
    try {
      localStorage.setItem(`sigc_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn(`[LocalStorage] Failed to save key: sigc_${key}`, e);
    }
  }

  private getFromLocalStorage<T>(key: string): T[] {
    try {
      const item = localStorage.getItem(`sigc_${key}`);
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  }

  // Save Single App State Key
  async saveAppState(key: string, value: any): Promise<void> {
    try {
      localStorage.setItem(`sigc_state_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn(`[LocalStorage] Failed to save state key: ${key}`, e);
    }
  }

  getAppState<T>(key: string, defaultValue: T): T {
    try {
      const val = localStorage.getItem(`sigc_state_${key}`);
      return val ? JSON.parse(val) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Loads initial database state from IndexedDB or bootstraps with institutional defaults
   */
  async loadOrCreateInitialData(): Promise<{
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
    auditLogs: AuditLogRecord[];
    currentUserId: string;
    activeMeetingId: string;
  }> {
    let users = await this.getAll<User>('users');
    let estamentos = await this.getAll<Estamento>('estamentos');
    let customRoles = await this.getAll<CustomRole>('customRoles');
    let meetings = await this.getAll<Meeting>('meetings');
    let motions = await this.getAll<Motion>('motions');
    let commitments = await this.getAll<Commitment>('commitments');
    let qualityFactors = await this.getAll<QualityFactor>('qualityFactors');
    let qualityMappings = await this.getAll<ActQualityMapping>('qualityMappings');
    let accessRequests = await this.getAll<AccessRequest>('accessRequests');
    let notifications = await this.getAll<InstitutionalNotification>('notifications');
    let digitalSeals = await this.getAll<DigitalActSeal>('digitalSeals');
    let auditLogs = await this.getAll<AuditLogRecord>('auditLogs');

    const isFirstRun = users.length === 0 && meetings.length === 0;

    if (isFirstRun) {
      // Seed with rich institutional dataset
      users = [...INITIAL_USERS];
      estamentos = [...INITIAL_ESTAMENTOS];
      customRoles = [...INITIAL_CUSTOM_ROLES];
      meetings = [...INITIAL_MEETINGS];
      motions = [...INITIAL_MOTIONS];
      commitments = [...INITIAL_COMMITMENTS];
      qualityFactors = [...CNA_ABET_TEMPLATE_FACTORS];
      qualityMappings = [...INITIAL_QUALITY_MAPPINGS];
      accessRequests = [];
      notifications = [
        {
          id: 'notif-welcome-1',
          type: 'citacion',
          title: 'Bienvenido al Sistema SIG-Currículo (Modo Autónomo Local)',
          message:
            'La aplicación está operando con almacenamiento seguro en el navegador (IndexedDB) sin requerir claves API ni servicios externos.',
          date: new Date().toISOString().slice(0, 10),
          read: false,
          meetingCode: 'ACTA-2026-004',
          recipientRoles: ['presidente', 'miembro', 'seguimiento', 'autoevaluacion', 'invitado_externo'],
        },
      ];
      digitalSeals = [];
      auditLogs = [
        {
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          userId: users[0]?.id || 'usr-admin-principal',
          userName: users[0]?.name || 'Administrador',
          userRole: users[0]?.role || 'presidente',
          action: 'INDEXED_DB_BOOTSTRAP',
          resource: 'BrowserStorage',
          details: 'Inicialización de esquema relacional en almacenamiento seguro de navegador (IndexedDB).',
        },
      ];

      // Persist seeds
      await this.saveAllData({
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
        auditLogs,
      });
    }

    const currentUserId = this.getAppState<string>('currentUserId', users[0]?.id || 'usr-admin-principal');
    const activeMeetingId = this.getAppState<string>('activeMeetingId', meetings[0]?.id || 'meet-2026-004');

    return {
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
      auditLogs,
      currentUserId,
      activeMeetingId,
    };
  }

  /**
   * Persists all data models into IndexedDB and LocalStorage in parallel
   */
  async saveAllData(data: {
    users?: User[];
    estamentos?: Estamento[];
    customRoles?: CustomRole[];
    meetings?: Meeting[];
    motions?: Motion[];
    commitments?: Commitment[];
    qualityFactors?: QualityFactor[];
    qualityMappings?: ActQualityMapping[];
    accessRequests?: AccessRequest[];
    notifications?: InstitutionalNotification[];
    digitalSeals?: DigitalActSeal[];
    auditLogs?: AuditLogRecord[];
  }): Promise<void> {
    const promises: Promise<void>[] = [];

    if (data.users) promises.push(this.putAll('users', data.users));
    if (data.estamentos) promises.push(this.putAll('estamentos', data.estamentos));
    if (data.customRoles) promises.push(this.putAll('customRoles', data.customRoles));
    if (data.meetings) promises.push(this.putAll('meetings', data.meetings));
    if (data.motions) promises.push(this.putAll('motions', data.motions));
    if (data.commitments) promises.push(this.putAll('commitments', data.commitments));
    if (data.qualityFactors) promises.push(this.putAll('qualityFactors', data.qualityFactors));
    if (data.qualityMappings) promises.push(this.putAll('qualityMappings', data.qualityMappings));
    if (data.accessRequests) promises.push(this.putAll('accessRequests', data.accessRequests));
    if (data.notifications) promises.push(this.putAll('notifications', data.notifications));
    if (data.digitalSeals) promises.push(this.putAll('digitalSeals', data.digitalSeals));
    if (data.auditLogs) promises.push(this.putAll('auditLogs', data.auditLogs));

    await Promise.all(promises);
  }

  /**
   * Exports the entire database to a downloadable JSON backup file
   */
  async exportBackupJson(): Promise<FullBackupData> {
    const users = await this.getAll<User>('users');
    const estamentos = await this.getAll<Estamento>('estamentos');
    const customRoles = await this.getAll<CustomRole>('customRoles');
    const meetings = await this.getAll<Meeting>('meetings');
    const motions = await this.getAll<Motion>('motions');
    const commitments = await this.getAll<Commitment>('commitments');
    const qualityFactors = await this.getAll<QualityFactor>('qualityFactors');
    const qualityMappings = await this.getAll<ActQualityMapping>('qualityMappings');
    const accessRequests = await this.getAll<AccessRequest>('accessRequests');
    const notifications = await this.getAll<InstitutionalNotification>('notifications');
    const digitalSeals = await this.getAll<DigitalActSeal>('digitalSeals');
    const programs = await this.getAll<AcademicProgram>('programs');

    return {
      version: '2.4.0-indexeddb',
      exportedAt: new Date().toISOString(),
      programs: programs.length > 0 ? programs : INITIAL_PROGRAMS,
      users: users.map((u) => {
        const { password, ...safeUser } = u as any;
        return safeUser as User;
      }),
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
      currentUserId: this.getAppState<string>('currentUserId', users[0]?.id),
      activeMeetingId: this.getAppState<string>('activeMeetingId', meetings[0]?.id),
    };
  }

  /**
   * Restores the complete database state from a validated backup file
   */
  async importBackupJson(backup: FullBackupData): Promise<void> {
    if (!backup.users || !backup.meetings) {
      throw new Error('El archivo de respaldo no contiene la estructura requerida del sistema SIG-Currículo.');
    }

    if (backup.programs && backup.programs.length > 0) {
      await this.putAll('programs', backup.programs);
    }

    await this.saveAllData({
      users: backup.users,
      estamentos: backup.estamentos || [],
      customRoles: backup.customRoles || [],
      meetings: backup.meetings || [],
      motions: backup.motions || [],
      commitments: backup.commitments || [],
      qualityFactors: backup.qualityFactors || [],
      qualityMappings: backup.qualityMappings || [],
      accessRequests: backup.accessRequests || [],
      notifications: backup.notifications || [],
      digitalSeals: backup.digitalSeals || [],
      auditLogs: backup.auditLogs || [],
    });

    if (backup.currentUserId) this.saveAppState('currentUserId', backup.currentUserId);
    if (backup.activeMeetingId) this.saveAppState('activeMeetingId', backup.activeMeetingId);
  }

  /**
   * Resets local storage to clean factory institutional defaults
   */
  async resetToDefaults(): Promise<void> {
    if (this.isSupported) {
      try {
        const db = await this.initDb();
        const stores = [
          'users',
          'estamentos',
          'customRoles',
          'meetings',
          'motions',
          'commitments',
          'qualityFactors',
          'qualityMappings',
          'accessRequests',
          'notifications',
          'digitalSeals',
          'auditLogs',
        ];
        const tx = db.transaction(stores, 'readwrite');
        stores.forEach((store) => tx.objectStore(store).clear());
        await new Promise((resolve) => {
          tx.oncomplete = () => resolve(true);
        });
      } catch (e) {
        console.warn('[IndexedDB] Reset error:', e);
      }
    }

    // Clear local storage keys
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('sigc_')) {
        localStorage.removeItem(k);
      }
    });

    await this.loadOrCreateInitialData();
  }
}

export const browserStorage = new BrowserStorageManager();
