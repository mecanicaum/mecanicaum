import React, { useState } from 'react';
import { User, AcademicProgram } from '../../types';
import { mapProgramRoleToGlobalUserRole } from '../../utils/roleUtils';
import { 
  Users, 
  ShieldCheck, 
  GraduationCap, 
  Search, 
  Filter, 
  CheckCircle2, 
  Check, 
  UserCheck, 
  Crown, 
  FileText, 
  Clock, 
  Award, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface ProgramPermissionsMatrixProps {
  users: User[];
  programs: AcademicProgram[];
  updateUser: (id: string, updates: Partial<User>) => void;
  currentUser: User;
}

export const ProgramPermissionsMatrix: React.FC<ProgramPermissionsMatrixProps> = ({
  users,
  programs,
  updateUser,
  currentUser,
}) => {
  const [searchTerm, setSearchSearchTerm] = useState('');
  const [estamentoFilter, setEstamentoFilter] = useState('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Available specific roles for assignment
  const ROLE_OPTIONS = [
    { value: 'presidente', label: 'Presidente', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold', icon: Crown },
    { value: 'secretario', label: 'Secretario', badge: 'bg-blue-100 text-blue-900 border-blue-300 font-bold', icon: FileText },
    { value: 'vocal', label: 'Vocal', badge: 'bg-purple-100 text-purple-900 border-purple-300 font-semibold', icon: UserCheck },
    { value: 'seguimiento', label: 'Seguimiento', badge: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold', icon: Clock },
    { value: 'autoevaluacion', label: 'Autoevaluación', badge: 'bg-indigo-100 text-indigo-900 border-indigo-300 font-semibold', icon: Award },
    { value: 'miembro', label: 'Miembro', badge: 'bg-slate-100 text-slate-800 border-slate-300 font-medium', icon: Users },
    { value: 'ninguno', label: '— Sin Asignación —', badge: 'bg-slate-50 text-slate-400 border-slate-200 italic', icon: null },
  ];

  // Filter users based on search term
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (estamentoFilter !== 'all') {
      return matchesSearch && u.estamentoId === estamentoFilter;
    }
    return matchesSearch;
  });

  const handleRoleChange = (targetUser: User, programId: string, newRole: string) => {
    const currentRoles = { ...(targetUser.programRoles || {}) };
    
    if (newRole === 'ninguno') {
      delete currentRoles[programId];
    } else {
      currentRoles[programId] = newRole;
    }

    // Compute updated programIds
    const updatedProgramIds = Array.from(
      new Set([...Object.keys(currentRoles)])
    );

    // Determine primary program and sync global role
    const primaryProg = targetUser.primaryProgramId && updatedProgramIds.includes(targetUser.primaryProgramId)
      ? targetUser.primaryProgramId
      : (updatedProgramIds[0] || 'prog-mec');

    const primaryRoleVal = currentRoles[primaryProg] || 'miembro';
    const globalSync = mapProgramRoleToGlobalUserRole(primaryRoleVal);

    updateUser(targetUser.id, {
      programRoles: currentRoles,
      programIds: updatedProgramIds,
      programas_asignados: updatedProgramIds,
      primaryProgramId: primaryProg,
      role: globalSync.role,
      roleLabel: globalSync.roleLabel,
      customRoleId: globalSync.customRoleId,
    });

    const progObj = programs.find((p) => p.id === programId);
    const roleLabel = ROLE_OPTIONS.find((r) => r.value === newRole)?.label || newRole;
    setSuccessToast(`Rol '${roleLabel}' sincronizado para ${targetUser.name} en ${progObj?.code || 'Programa'}`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const getRoleObj = (roleVal: string) => {
    return ROLE_OPTIONS.find((r) => r.value === roleVal) || ROLE_OPTIONS[5];
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#006837] via-[#00522b] to-[#003B1A] text-white rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 text-[#E59800] border border-white/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#E59800]">
                  Gobernanza Multiprograma
                </span>
                <span className="text-[10px] bg-white/20 text-white font-mono px-2 py-0.5 rounded font-bold">
                  {programs.length} Programas Activos
                </span>
              </div>
              <h2 className="text-base font-bold text-white mt-0.5">
                Matriz de Permisos y Roles por Programa Académico
              </h2>
            </div>
          </div>

          <span className="text-xs bg-[#E59800] text-[#006837] px-3 py-1 rounded-lg font-bold shadow-2xs self-start sm:self-auto">
            Super Administrador Exclusivo
          </span>
        </div>

        <p className="text-xs text-emerald-100/90 leading-relaxed max-w-3xl">
          Asigna roles estatutarios específicos (Presidente, Secretario Técnico, Vocal, Encargado de Seguimiento, Gestor de Autoevaluación o Miembro) a cada integrante del comité curricular según cada programa académico de la Facultad.
        </p>
      </div>

      {/* Toast Feedback */}
      {successToast && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-950 font-black">
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar integrante por nombre o correo..."
            value={searchTerm}
            onChange={(e) => setSearchSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#006837] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-600 w-full sm:w-auto justify-end">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span>Integrantes registrados:</span>
          <strong className="font-mono text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded">{filteredUsers.length}</strong>
        </div>
      </div>

      {/* Main Interactive Permissions Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="p-3.5 pl-4 sticky left-0 bg-slate-50 z-10 w-64 shadow-2xs">
                  Integrante / Usuario
                </th>
                <th className="p-3.5 w-36">
                  Estamento / Perfil Base
                </th>
                {programs.map((prog) => (
                  <th key={prog.id} className="p-3.5 text-center min-w-[170px] border-l border-slate-200/60 bg-emerald-50/40">
                    <div className="inline-flex flex-col items-center">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#006837] text-white">
                        {prog.code}
                      </span>
                      <span className="text-[11px] font-bold text-slate-900 truncate max-w-[150px] mt-0.5">
                        {prog.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-sans">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={2 + programs.length} className="p-8 text-center text-slate-400 italic">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* User Info Column */}
                    <td className="p-3.5 pl-4 sticky left-0 bg-white z-10 font-medium text-slate-900 border-r border-slate-100 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[#006837] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {u.avatarInitials || u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-[170px]">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate max-w-[170px]">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Estamento Column */}
                    <td className="p-3.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {u.estamentoName || u.roleLabel || u.role}
                      </span>
                    </td>

                    {/* Program Columns Matrix Selectors */}
                    {programs.map((prog) => {
                      const currentRoleVal = u.programRoles?.[prog.id] || (
                        u.primaryProgramId === prog.id || u.programIds?.includes(prog.id)
                          ? (u.role === 'presidente' ? 'presidente' : u.role === 'seguimiento' ? 'seguimiento' : u.role === 'autoevaluacion' ? 'autoevaluacion' : 'miembro')
                          : 'ninguno'
                      );

                      const currentRoleObj = getRoleObj(currentRoleVal);

                      return (
                        <td key={`${u.id}-${prog.id}`} className="p-2.5 text-center border-l border-slate-100">
                          <div className="flex flex-col items-center gap-1">
                            <select
                              value={currentRoleVal}
                              onChange={(e) => handleRoleChange(u, prog.id, e.target.value)}
                              className={`w-full text-[11px] font-semibold rounded-lg p-1.5 border transition-all cursor-pointer text-center ${currentRoleObj.badge}`}
                            >
                              <option value="presidente">👑 Presidente</option>
                              <option value="secretario">📝 Secretario Técnico</option>
                              <option value="vocal">🏛️ Vocal de Comité</option>
                              <option value="seguimiento">⏱️ Seguimiento</option>
                              <option value="autoevaluacion">🏅 Autoevaluación</option>
                              <option value="miembro">👥 Miembro con Voto</option>
                              <option value="ninguno">— Sin Asignación —</option>
                            </select>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
