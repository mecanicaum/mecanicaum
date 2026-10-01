-- ==============================================================================
-- SISTEMA INTEGRAL DE GESTIÓN DE ACTAS Y CALIDAD ACADÉMICA (SIG-CURRÍCULO)
-- ESQUEMA RELACIONAL DE BASE DE DATOS (PostgreSQL / SQLite / Cloud SQL DDL)
-- Vigencia: 2026-2028 · Facultad de Ingeniería · Universidad Mayor
-- ==============================================================================

-- 1. TABLA DE ESTAMENTOS INSTITUCIONALES
CREATE TABLE IF NOT EXISTS estamentos (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(32) NOT NULL CHECK (category IN ('docente', 'estudiantil', 'egresado', 'directivo', 'externo')),
    has_statutory_vote BOOLEAN NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE ROLES Y PRIVILEGIOS RBAC
CREATE TABLE IF NOT EXISTS custom_roles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(64) NOT NULL UNIQUE,
    description TEXT,
    base_role VARCHAR(32) NOT NULL CHECK (base_role IN ('presidente', 'miembro', 'seguimiento', 'autoevaluacion', 'invitado_externo')),
    can_vote BOOLEAN NOT NULL DEFAULT FALSE,
    can_sign_acts BOOLEAN NOT NULL DEFAULT FALSE,
    can_audit_commitments BOOLEAN NOT NULL DEFAULT FALSE,
    can_map_quality BOOLEAN NOT NULL DEFAULT FALSE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    color VARCHAR(32) DEFAULT 'slate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE USUARIOS / INTEGRANTES DEL COMITÉ (Users)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    google_sso_sub VARCHAR(128) UNIQUE,
    role VARCHAR(32) NOT NULL CHECK (role IN ('presidente', 'miembro', 'seguimiento', 'autoevaluacion', 'invitado_externo')),
    role_id VARCHAR(64) REFERENCES custom_roles(id) ON DELETE SET NULL,
    role_label VARCHAR(150),
    estamento_id VARCHAR(64) REFERENCES estamentos(id) ON DELETE SET NULL,
    estamento_name VARCHAR(150),
    faculty VARCHAR(200) DEFAULT 'Facultad de Ingeniería',
    department VARCHAR(200) NOT NULL DEFAULT 'Ingeniería Mecánica',
    academic_title VARCHAR(200),
    avatar_initials VARCHAR(8) NOT NULL,
    is_external BOOLEAN NOT NULL DEFAULT FALSE,
    has_vote BOOLEAN NOT NULL DEFAULT TRUE,
    periodo VARCHAR(64) DEFAULT '2026 - 2028',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA DE SESIONES Y REUNIONES (Meetings)
CREATE TABLE IF NOT EXISTS meetings (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(64) NOT NULL UNIQUE,
    type VARCHAR(32) NOT NULL CHECK (type IN ('ordinaria', 'extraordinaria')),
    title VARCHAR(300) NOT NULL,
    date DATE NOT NULL,
    start_time VARCHAR(16) NOT NULL DEFAULT '09:00',
    end_time VARCHAR(16) NOT NULL DEFAULT '11:00',
    modality VARCHAR(32) NOT NULL CHECK (modality IN ('presencial', 'virtual', 'hibrida')),
    location_or_url TEXT NOT NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN ('programada', 'en_curso', 'cerrada')) DEFAULT 'programada',
    quorum_present_count INTEGER NOT NULL DEFAULT 0,
    quorum_total_required INTEGER NOT NULL DEFAULT 0,
    general_observations TEXT,
    closed_at TIMESTAMP WITH TIME ZONE,
    signed_by_president BOOLEAN NOT NULL DEFAULT FALSE,
    president_signature_date TIMESTAMP WITH TIME ZONE,
    cryptographic_seal_id VARCHAR(128),
    created_by VARCHAR(64) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA DE ASISTENCIA Y QUÓRUM DE SESIÓN (MeetingAttendees)
CREATE TABLE IF NOT EXISTS meeting_attendees (
    id VARCHAR(64) PRIMARY KEY,
    meeting_id VARCHAR(64) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(64) NOT NULL,
    present BOOLEAN NOT NULL DEFAULT FALSE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_meeting_user UNIQUE (meeting_id, user_id)
);

-- 6. TABLA DE PUNTOS DEL ORDEN DEL DÍA (AgendaItems)
CREATE TABLE IF NOT EXISTS agenda_items (
    id VARCHAR(64) PRIMARY KEY,
    meeting_id VARCHAR(64) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    presenter VARCHAR(200) NOT NULL,
    estimated_minutes INTEGER NOT NULL DEFAULT 20,
    deliberations TEXT,
    agreements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA DE ANEXOS DOCUMENTALES DE GOOGLE DRIVE (AgendaAttachments)
CREATE TABLE IF NOT EXISTS agenda_attachments (
    id VARCHAR(64) PRIMARY KEY,
    agenda_item_id VARCHAR(64) NOT NULL REFERENCES agenda_items(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    drive_url TEXT NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('drive_doc', 'drive_sheet', 'drive_slide', 'drive_folder')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. TABLA DE MOCIONES ESTATUTARIAS DE VOTACIÓN (Motions)
CREATE TABLE IF NOT EXISTS motions (
    id VARCHAR(64) PRIMARY KEY,
    meeting_id VARCHAR(64) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    agenda_item_id VARCHAR(64) REFERENCES agenda_items(id) ON DELETE SET NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    proposed_by VARCHAR(200) NOT NULL,
    proposed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(32) NOT NULL CHECK (status IN ('abierta', 'aprobada', 'rechazada', 'cerrada')) DEFAULT 'abierta',
    majority_required VARCHAR(32) NOT NULL CHECK (majority_required IN ('simple', 'cualificada_dos_tercios', 'unanime')) DEFAULT 'simple',
    result_a_favor INTEGER DEFAULT 0,
    result_en_contra INTEGER DEFAULT 0,
    result_abstencion INTEGER DEFAULT 0,
    result_total_votes INTEGER DEFAULT 0,
    result_quorum_percentage INTEGER DEFAULT 0,
    result_approved BOOLEAN DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABLA DE VOTOS NOMINALES EN TIEMPO REAL (Votes)
CREATE TABLE IF NOT EXISTS votes (
    id VARCHAR(64) PRIMARY KEY,
    motion_id VARCHAR(64) NOT NULL REFERENCES motions(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_name VARCHAR(200) NOT NULL,
    user_role VARCHAR(64) NOT NULL,
    vote_option VARCHAR(32) NOT NULL CHECK (vote_option IN ('a_favor', 'en_contra', 'abstencion')),
    vote_hash VARCHAR(128) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_motion_user_vote UNIQUE (motion_id, user_id)
);

-- 10. TABLA DE COMPROMISOS Y TAREAS ACADÉMICAS (Commitments)
CREATE TABLE IF NOT EXISTS commitments (
    id VARCHAR(64) PRIMARY KEY,
    meeting_id VARCHAR(64) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    meeting_code VARCHAR(64) NOT NULL,
    agenda_item_id VARCHAR(64) REFERENCES agenda_items(id) ON DELETE SET NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    responsible_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    responsible_name VARCHAR(200) NOT NULL,
    responsible_email VARCHAR(200) NOT NULL,
    is_external_responsible BOOLEAN NOT NULL DEFAULT FALSE,
    assigned_by VARCHAR(200) NOT NULL,
    assigned_at DATE NOT NULL,
    due_date DATE NOT NULL,
    priority VARCHAR(16) NOT NULL CHECK (priority IN ('alta', 'media', 'baja')) DEFAULT 'media',
    status VARCHAR(32) NOT NULL CHECK (status IN ('pendiente', 'en_revision', 'cumplido', 'vencido')) DEFAULT 'pendiente',
    audited_by VARCHAR(200),
    audit_notes TEXT,
    audited_at DATE,
    last_reminder_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. TABLA DE EVIDENCIAS DE COMPROMISOS EN GOOGLE DRIVE (CommitmentEvidences)
CREATE TABLE IF NOT EXISTS commitment_evidences (
    id VARCHAR(64) PRIMARY KEY,
    commitment_id VARCHAR(64) NOT NULL REFERENCES commitments(id) ON DELETE CASCADE,
    submitted_by VARCHAR(200) NOT NULL,
    submitted_at DATE NOT NULL,
    description TEXT NOT NULL,
    drive_url TEXT NOT NULL,
    file_name VARCHAR(255) DEFAULT 'Evidencia_Cumplimiento.pdf',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. TABLA DE FACTORES DE CALIDAD CNA / ABET (QualityFactors)
CREATE TABLE IF NOT EXISTS quality_factors (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(32) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    framework VARCHAR(32) NOT NULL CHECK (framework IN ('CNA', 'ABET', 'Institucional', 'INSTITUCIONAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. TABLA DE CARACTERÍSTICAS DE CALIDAD (QualityFeatures)
CREATE TABLE IF NOT EXISTS quality_features (
    id VARCHAR(64) PRIMARY KEY,
    factor_id VARCHAR(64) NOT NULL REFERENCES quality_factors(id) ON DELETE CASCADE,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_factor_feature_code UNIQUE (factor_id, code)
);

-- 14. TABLA DE ASPECTOS EVALUABLES DE CALIDAD (QualityAspects)
CREATE TABLE IF NOT EXISTS quality_aspects (
    id VARCHAR(64) PRIMARY KEY,
    feature_id VARCHAR(64) NOT NULL REFERENCES quality_features(id) ON DELETE CASCADE,
    code VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_feature_aspect_code UNIQUE (feature_id, code)
);

-- 15. TABLA DE MATRIZ DE TRAZABILIDAD Y MAPEOS DE ACTAS (QualityMappings)
CREATE TABLE IF NOT EXISTS quality_mappings (
    id VARCHAR(64) PRIMARY KEY,
    meeting_id VARCHAR(64) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    meeting_code VARCHAR(64) NOT NULL,
    agenda_item_id VARCHAR(64) REFERENCES agenda_items(id) ON DELETE SET NULL,
    agenda_item_title VARCHAR(300),
    aspect_id VARCHAR(64) REFERENCES quality_aspects(id) ON DELETE SET NULL,
    aspect_code VARCHAR(32) NOT NULL,
    aspect_name VARCHAR(255) NOT NULL,
    factor_code VARCHAR(32) NOT NULL,
    feature_code VARCHAR(32) NOT NULL,
    excerpt TEXT,
    evidential_contribution TEXT NOT NULL,
    mapped_by VARCHAR(200) NOT NULL,
    mapped_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. TABLA DE SELLOS CRIPTOGRÁFICOS Y FIRMA DIGITAL PKI (DigitalActSeals)
CREATE TABLE IF NOT EXISTS digital_act_seals (
    id VARCHAR(128) PRIMARY KEY,
    meeting_id VARCHAR(64) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    meeting_code VARCHAR(64) NOT NULL,
    title VARCHAR(300) NOT NULL,
    sha256_hash VARCHAR(128) NOT NULL UNIQUE,
    signature_pki_token VARCHAR(255) NOT NULL,
    sealed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    signed_by VARCHAR(200) NOT NULL,
    signer_email VARCHAR(200) NOT NULL,
    signer_role VARCHAR(64) NOT NULL,
    authority_issuer VARCHAR(300) NOT NULL,
    canonical_payload TEXT NOT NULL,
    total_voters INTEGER NOT NULL DEFAULT 0,
    total_agreements INTEGER NOT NULL DEFAULT 0,
    total_commitments INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. TABLA DE SOLICITUDES DE ACCESO A ACTAS HISTÓRICAS (AccessRequests)
CREATE TABLE IF NOT EXISTS access_requests (
    id VARCHAR(64) PRIMARY KEY,
    meeting_id VARCHAR(64) NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    meeting_code VARCHAR(64) NOT NULL,
    requested_by VARCHAR(200) NOT NULL,
    user_role VARCHAR(64) NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(32) NOT NULL CHECK (status IN ('pendiente', 'aprobado', 'rechazado')) DEFAULT 'pendiente',
    resolved_by VARCHAR(200),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_note TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. TABLA DE LIBRO DE AUDITORÍA DEL SERVIDOR (ServerAuditLogs)
CREATE TABLE IF NOT EXISTS server_audit_logs (
    id VARCHAR(128) PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(200) NOT NULL,
    user_role VARCHAR(64) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(64),
    payload_hash VARCHAR(128)
);

-- ÍNDICES DE ALTO RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_agenda_items_meeting ON agenda_items(meeting_id);
CREATE INDEX IF NOT EXISTS idx_motions_meeting ON motions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_votes_motion ON votes(motion_id);
CREATE INDEX IF NOT EXISTS idx_commitments_responsible ON commitments(responsible_id);
CREATE INDEX IF NOT EXISTS idx_commitments_due_date ON commitments(due_date);
CREATE INDEX IF NOT EXISTS idx_quality_mappings_aspect ON quality_mappings(aspect_code);
CREATE INDEX IF NOT EXISTS idx_digital_seals_hash ON digital_act_seals(sha256_hash);
