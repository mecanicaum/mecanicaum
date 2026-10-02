import { 
  User, 
  Meeting, 
  Motion, 
  Commitment, 
  QualityFactor, 
  ActQualityMapping, 
  AccessRequest, 
  InstitutionalNotification,
  Estamento,
  CustomRole
} from '../types';

// ESTAMENTOS ESTATUTARIOS INSTITUCIONALES (Cuerpos de Representación Universitaria)
export const INITIAL_ESTAMENTOS: Estamento[] = [
  {
    id: 'est-dir',
    code: 'DIR',
    name: 'Estamento Directivo / Decanatura',
    description: 'Dirección de programa, decanatura y presidencia del comité curricular.',
    hasVote: true,
    color: 'emerald',
  },
  {
    id: 'est-doc',
    code: 'DOC',
    name: 'Estamento Profesoral / Docente',
    description: 'Cuerpo docente del programa y coordinadores de áreas curriculares.',
    hasVote: true,
    color: 'blue',
  },
  {
    id: 'est-est',
    code: 'EST',
    name: 'Estamento Estudiantil',
    description: 'Representación democrática de los estudiantes matriculados en el programa.',
    hasVote: true,
    color: 'amber',
  },
  {
    id: 'est-egr',
    code: 'EGR',
    name: 'Estamento de Egresados / Graduados',
    description: 'Profesionales graduados que aportan visión de la inserción laboral y el medio.',
    hasVote: true,
    color: 'purple',
  },
  {
    id: 'est-prod',
    code: 'PROD',
    name: 'Sector Productivo / Externo',
    description: 'Representantes empresariales, gremios industriales y empleadores de ingeniería.',
    hasVote: false,
    color: 'slate',
  },
  {
    id: 'est-adm',
    code: 'ADM',
    name: 'Secretaría Técnica / Calidad',
    description: 'Apoyo técnico, seguimiento de compromisos y oficina de autoevaluación.',
    hasVote: false,
    color: 'teal',
  },
];

// ROLES INSTITUCIONALES CONFIGURABLES (Creados y administrados por el Super Administrador)
export const INITIAL_CUSTOM_ROLES: CustomRole[] = [
  {
    id: 'rol-superadmin',
    code: 'SUPER_ADMIN',
    name: 'Super Administrador del Sistema',
    description: 'Gestor supremo del sistema: crea y parametriza los roles dentro del comité, estamentos, integrantes, firmas y flujos de acreditación.',
    baseCapability: 'super_admin',
    canVote: true,
    canSign: true,
    canAudit: true,
    canTagQuality: true,
  },
  {
    id: 'rol-pres',
    code: 'PRES',
    name: 'Presidente del Comité Curricular',
    description: 'Preside sesiones, convoca, redacta acuerdos, propone mociones y firma digitalmente las actas.',
    baseCapability: 'presidente',
    canVote: true,
    canSign: true,
    canAudit: false,
    canTagQuality: true,
  },
  {
    id: 'rol-miem',
    code: 'MIEM_VOTO',
    name: 'Miembro Representante con Voz y Voto',
    description: 'Participa en deliberaciones, emite voto nominal en tiempo real y ejecuta compromisos asignados.',
    baseCapability: 'miembro',
    canVote: true,
    canSign: false,
    canAudit: false,
    canTagQuality: false,
  },
  {
    id: 'rol-seg',
    code: 'SEC_SEG',
    name: 'Encargado de Seguimiento y Control',
    description: 'Audita y valida evidencias de cumplimiento, verifica estados y custodia compromisos.',
    baseCapability: 'seguimiento',
    canVote: false,
    canSign: false,
    canAudit: true,
    canTagQuality: false,
  },
  {
    id: 'rol-auto',
    code: 'GESTOR_CALIDAD',
    name: 'Gestor de Autoevaluación y Acreditación',
    description: 'Gestiona nomenclaturas de calidad CNA/ABET, mapea fragmentos de actas cerradas y audita evidencias.',
    baseCapability: 'autoevaluacion',
    canVote: false,
    canSign: false,
    canAudit: false,
    canTagQuality: true,
  },
  {
    id: 'rol-inv',
    code: 'INV_EXTERNO',
    name: 'Invitado Externo / Asesor',
    description: 'Acceso restringido únicamente a consultar y radicar evidencias de sus compromisos directos.',
    baseCapability: 'invitado_externo',
    canVote: false,
    canSign: false,
    canAudit: false,
    canTagQuality: false,
  },
];

// BASE DE DATOS DE USUARIOS BLANQUEADA:
// Super Administrador oficial asignado a autoevaluacionycurriculomecanica@umayor.edu.co
export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-principal',
    name: 'Super Administrador del Comité Curricular',
    email: 'autoevaluacionycurriculomecanica@umayor.edu.co',
    role: 'super_admin',
    customRoleId: 'rol-superadmin',
    roleLabel: 'Super Administrador del Sistema',
    estamentoId: 'est-dir',
    estamentoName: 'Estamento Directivo / Decanatura',
    faculty: 'Facultad de Ingeniería',
    department: 'Departamento de Ingeniería Mecánica',
    academicTitle: 'Super Administrador / Presidencia Comité Curricular',
    avatarInitials: 'SA',
    hasVote: true,
    periodo: '2026 - 2028',
    active: true,
  },
];

// Plantilla opcional de acreditación CNA y ABET
export const CNA_ABET_TEMPLATE_FACTORS: QualityFactor[] = [
  {
    id: 'fact-1',
    code: 'F1',
    name: 'Misión, Visión y Proyecto Institucional',
    framework: 'CNA',
    description: 'Coherencia y pertinencia del programa académico con el Proyecto Educativo del Programa (PEP) y el contexto regional.',
    features: [
      {
        id: 'feat-1-1',
        code: 'C1',
        name: 'Misión y Proyecto Institucional del Programa',
        description: 'Apropiación de los propósitos de formación y congruencia con las tendencias de la disciplina.',
        aspects: [
          {
            id: 'asp-1-1-1',
            code: '1.1',
            name: 'Alineación de objetivos de aprendizaje con el PEP',
            description: 'Evidencias de revisión periódica del perfil de egreso en relación con las demandas tecnológicas actuales.',
          },
          {
            id: 'asp-1-1-2',
            code: '1.2',
            name: 'Participación de la comunidad académica en la planeación curricular',
            description: 'Consultas a docentes, estudiantes y egresados sobre la pertinencia del plan de estudios.',
          },
        ],
      },
    ],
  },
  {
    id: 'fact-3',
    code: 'F3',
    name: 'Profesores y Desarrollo Curricular',
    framework: 'CNA',
    description: 'Cualificación, escalafón, asignación de labor académica y evaluación de la docencia.',
    features: [
      {
        id: 'feat-3-1',
        code: 'C8',
        name: 'Planta Docente y Dedicación',
        description: 'Idoneidad de los docentes para responder a las exigencias curriculares.',
        aspects: [
          {
            id: 'asp-3-1-1',
            code: '8.1',
            name: 'Asignación de carga docente por microcurrículos',
            description: 'Distribución equilibrada según perfil disciplinar y formación posgradual de los profesores.',
          },
        ],
      },
    ],
  },
  {
    id: 'fact-4',
    code: 'F4',
    name: 'Procesos Académicos y Flexibilidad Curricular',
    framework: 'CNA',
    description: 'Estructura del plan de estudios, microcurrículos, créditos académicos y resultados de aprendizaje (RA).',
    features: [
      {
        id: 'feat-4-1',
        code: 'C12',
        name: 'Estructura y Pertinencia Curricular',
        description: 'Articulación de los núcleos fundamentales, áreas profesionales y electivas.',
        aspects: [
          {
            id: 'asp-4-1-1',
            code: '12.1',
            name: 'Actualización de microcurrículos y prerrequisitos de asignaturas',
            description: 'Revisión y aprobación de modificaciones en contenidos programáticos y bibliografía.',
          },
        ],
      },
    ],
  },
];

// DATOS OPERATIVOS BLANQUEADOS
export const INITIAL_MEETINGS: Meeting[] = [];
export const INITIAL_MOTIONS: Motion[] = [];
export const INITIAL_COMMITMENTS: Commitment[] = [];
export const INITIAL_QUALITY_MAPPINGS: ActQualityMapping[] = [];
export const INITIAL_ACCESS_REQUESTS: AccessRequest[] = [];
export const INITIAL_NOTIFICATIONS: InstitutionalNotification[] = [];
export const INITIAL_QUALITY_FACTORS: QualityFactor[] = [];
