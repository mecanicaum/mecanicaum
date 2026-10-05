import { UserRole } from '../types';

export interface GlobalRoleMapping {
  role: UserRole;
  roleLabel: string;
  customRoleId: string;
}

export function mapProgramRoleToGlobalUserRole(programRole: string): GlobalRoleMapping {
  switch (programRole?.toLowerCase()) {
    case 'presidente':
      return {
        role: 'presidente',
        roleLabel: 'Presidente del Comité Curricular',
        customRoleId: 'rol-pres',
      };
    case 'secretario':
      return {
        role: 'presidente',
        roleLabel: 'Secretario Técnico del Comité',
        customRoleId: 'rol-seg',
      };
    case 'vocal':
      return {
        role: 'miembro',
        roleLabel: 'Vocal de Comité Curricular',
        customRoleId: 'rol-miem',
      };
    case 'seguimiento':
      return {
        role: 'seguimiento',
        roleLabel: 'Encargado de Seguimiento y Control',
        customRoleId: 'rol-seg',
      };
    case 'autoevaluacion':
      return {
        role: 'autoevaluacion',
        roleLabel: 'Gestor de Autoevaluación y Calidad',
        customRoleId: 'rol-auto',
      };
    case 'miembro':
    default:
      return {
        role: 'miembro',
        roleLabel: 'Miembro Representante con Voto',
        customRoleId: 'rol-miem',
      };
  }
}
