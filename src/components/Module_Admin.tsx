import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Estamento, CustomRole, UserRole } from '../types';
import { 
  Users, 
  Shield, 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  XCircle, 
  Mail, 
  UserCheck, 
  Vote, 
  FileCheck2, 
  Search,
  Filter,
  Check,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const Module_Admin: React.FC = () => {
  const { 
    users, 
    createUser, 
    updateUser, 
    deleteUser, 
    switchUser,
    estamentos, 
    createEstamento, 
    updateEstamento, 
    deleteEstamento, 
    customRoles, 
    createCustomRole, 
    updateCustomRole, 
    deleteCustomRole 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'members' | 'roles' | 'estamentos'>('members');

  // Search & Filter
  const [memberSearch, setMemberSearch] = useState('');
  const [estamentoFilter, setEstamentoFilter] = useState('all');

  // Member Modal State
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRoleId, setMemberRoleId] = useState(customRoles[0]?.id || 'rol-miem');
  const [memberEstamentoId, setMemberEstamentoId] = useState(estamentos[0]?.id || 'est-doc');
  const [memberFaculty, setMemberFaculty] = useState('Facultad de Ingeniería');
  const [memberDepartment, setMemberDepartment] = useState('Departamento de Ingeniería Mecánica');
  const [memberHasVote, setMemberHasVote] = useState(true);
  const [memberPeriodo, setMemberPeriodo] = useState('2026 - 2028');
  const [memberIsExternal, setMemberIsExternal] = useState(false);

  // Role Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [roleBaseCap, setRoleBaseCap] = useState<UserRole>('miembro');
  const [roleCanVote, setRoleCanVote] = useState(true);
  const [roleCanSign, setRoleCanSign] = useState(false);
  const [roleCanAudit, setRoleCanAudit] = useState(false);
  const [roleCanTagQuality, setRoleCanTagQuality] = useState(false);

  // Estamento Modal State
  const [showEstamentoModal, setShowEstamentoModal] = useState(false);
  const [editingEstamentoId, setEditingEstamentoId] = useState<string | null>(null);
  const [estName, setEstName] = useState('');
  const [estCode, setEstCode] = useState('');
  const [estDesc, setEstDesc] = useState('');
  const [estHasVote, setEstHasVote] = useState(true);
  const [estColor, setEstColor] = useState('blue');

  // Open Member Modal
  const openNewMemberModal = () => {
    setEditingUserId(null);
    setMemberName('');
    setMemberEmail('');
    setMemberRoleId(customRoles[1]?.id || customRoles[0]?.id || '');
    setMemberEstamentoId(estamentos[1]?.id || estamentos[0]?.id || '');
    setMemberFaculty('Facultad de Ingeniería');
    setMemberDepartment('Departamento de Ingeniería Mecánica');
    setMemberHasVote(true);
    setMemberPeriodo('2026 - 2028');
    setMemberIsExternal(false);
    setShowMemberModal(true);
  };

  const openEditMemberModal = (u: User) => {
    setEditingUserId(u.id);
    setMemberName(u.name);
    setMemberEmail(u.email);
    setMemberRoleId(u.customRoleId || customRoles.find(r => r.baseCapability === u.role)?.id || '');
    setMemberEstamentoId(u.estamentoId || estamentos[0]?.id || '');
    setMemberFaculty(u.faculty);
    setMemberDepartment(u.department);
    setMemberHasVote(u.hasVote !== false);
    setMemberPeriodo(u.periodo || '2026 - 2028');
    setMemberIsExternal(u.isExternal || false);
    setShowMemberModal(true);
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) return;

    const selectedRole = customRoles.find((r) => r.id === memberRoleId);
    const selectedEst = estamentos.find((e) => e.id === memberEstamentoId);

    const baseRole: UserRole = selectedRole ? selectedRole.baseCapability : 'miembro';
    const roleLabel = selectedRole ? selectedRole.name : 'Miembro del Comité';
    const estNameStr = selectedEst ? selectedEst.name : 'Comité Curricular';

    if (editingUserId) {
      updateUser(editingUserId, {
        name: memberName,
        email: memberEmail,
        role: baseRole,
        customRoleId: memberRoleId,
        roleLabel,
        estamentoId: memberEstamentoId,
        estamentoName: estNameStr,
        faculty: memberFaculty,
        department: memberDepartment,
        hasVote: memberHasVote,
        periodo: memberPeriodo,
        isExternal: memberIsExternal,
      });
    } else {
      createUser({
        name: memberName,
        email: memberEmail,
        role: baseRole,
        customRoleId: memberRoleId,
        roleLabel,
        estamentoId: memberEstamentoId,
        estamentoName: estNameStr,
        faculty: memberFaculty,
        department: memberDepartment,
        hasVote: memberHasVote,
        periodo: memberPeriodo,
        isExternal: memberIsExternal,
      });
    }

    setShowMemberModal(false);
  };

  // Open Role Modal
  const openNewRoleModal = () => {
    setEditingRoleId(null);
    setRoleName('');
    setRoleCode('');
    setRoleDesc('');
    setRoleBaseCap('miembro');
    setRoleCanVote(true);
    setRoleCanSign(false);
    setRoleCanAudit(false);
    setRoleCanTagQuality(false);
    setShowRoleModal(true);
  };

  const openEditRoleModal = (r: CustomRole) => {
    setEditingRoleId(r.id);
    setRoleName(r.name);
    setRoleCode(r.code);
    setRoleDesc(r.description);
    setRoleBaseCap(r.baseCapability);
    setRoleCanVote(r.canVote);
    setRoleCanSign(r.canSign);
    setRoleCanAudit(r.canAudit);
    setRoleCanTagQuality(r.canTagQuality);
    setShowRoleModal(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim() || !roleCode.trim()) return;

    if (editingRoleId) {
      updateCustomRole(editingRoleId, {
        name: roleName,
        code: roleCode.toUpperCase(),
        description: roleDesc,
        baseCapability: roleBaseCap,
        canVote: roleCanVote,
        canSign: roleCanSign,
        canAudit: roleCanAudit,
        canTagQuality: roleCanTagQuality,
      });
    } else {
      createCustomRole({
        name: roleName,
        code: roleCode.toUpperCase(),
        description: roleDesc,
        baseCapability: roleBaseCap,
        canVote: roleCanVote,
        canSign: roleCanSign,
        canAudit: roleCanAudit,
        canTagQuality: roleCanTagQuality,
      });
    }

    setShowRoleModal(false);
  };

  // Open Estamento Modal
  const openNewEstamentoModal = () => {
    setEditingEstamentoId(null);
    setEstName('');
    setEstCode('');
    setEstDesc('');
    setEstHasVote(true);
    setEstColor('blue');
    setShowEstamentoModal(true);
  };

  const openEditEstamentoModal = (est: Estamento) => {
    setEditingEstamentoId(est.id);
    setEstName(est.name);
    setEstCode(est.code);
    setEstDesc(est.description);
    setEstHasVote(est.hasVote);
    setEstColor(est.color);
    setShowEstamentoModal(true);
  };

  const handleSaveEstamento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!estName.trim() || !estCode.trim()) return;

    if (editingEstamentoId) {
      updateEstamento(editingEstamentoId, {
        name: estName,
        code: estCode.toUpperCase(),
        description: estDesc,
        hasVote: estHasVote,
        color: estColor,
      });
    } else {
      createEstamento({
        name: estName,
        code: estCode.toUpperCase(),
        description: estDesc,
        hasVote: estHasVote,
        color: estColor,
      });
    }

    setShowEstamentoModal(false);
  };

  const filteredUsers = users.filter((u) => {
    if (estamentoFilter !== 'all' && u.estamentoId !== estamentoFilter) return false;
    if (memberSearch.trim()) {
      const q = memberSearch.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchRole = u.roleLabel.toLowerCase().includes(q);
      const matchEst = (u.estamentoName || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchRole && !matchEst) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Módulo de Administración Institucional
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Configuración de Miembros, Roles & Estamentos
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Alta y gobernanza de los integrantes del Comité Curricular, definición de roles institucionales con permisos RBAC y parametrización de los estamentos de representación universitaria.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'members'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Miembros ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'roles'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            Roles ({customRoles.length})
          </button>
          <button
            onClick={() => setActiveTab('estamentos')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'estamentos'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Estamentos ({estamentos.length})
          </button>
        </div>
      </div>

      {/* TAB 1: GESTIÓN DE MIEMBROS */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Action and Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={openNewMemberModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Registrar Nuevo Miembro
              </button>

              <select
                value={estamentoFilter}
                onChange={(e) => setEstamentoFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
              >
                <option value="all">Todos los Estamentos</option>
                {estamentos.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Buscar por nombre, correo o rol..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-100/70 font-semibold text-slate-700">
                  <tr>
                    <th className="py-3 px-4">Nombre y Correo Institucional</th>
                    <th className="py-3 px-4">Rol del Comité</th>
                    <th className="py-3 px-4">Estamento que Representa</th>
                    <th className="py-3 px-4 text-center">Derecho a Voto</th>
                    <th className="py-3 px-4">Período Estatutario</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                        No se encontraron integrantes que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white font-mono">
                              {u.avatarInitials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono truncate">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{u.roleLabel}</span>
                          <span className="block text-[10px] text-slate-400 uppercase font-mono">
                            Base: {u.role}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 border border-slate-200">
                            <Building2 className="h-3 w-3 text-slate-500" />
                            {u.estamentoName || 'Sin estamento asignado'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          {u.hasVote !== false && u.role !== 'invitado_externo' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Voz y Voto
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              <Vote className="h-3 w-3 text-slate-400" /> Solo Voz
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          {u.periodo || '2026 - 2028'}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => switchUser(u.id)}
                              className="text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded"
                              title="Asumir este perfil"
                            >
                              Simular
                            </button>
                            <button
                              onClick={() => openEditMemberModal(u)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                              title="Editar miembro"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            {users.length > 1 && (
                              <button
                                onClick={() => {
                                  if (confirm(`¿Confirma eliminar al miembro ${u.name}?`)) {
                                    deleteUser(u.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                                title="Eliminar miembro"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GESTIÓN DE ROLES DEL COMITÉ */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/60 p-4 rounded-xl border border-indigo-200 shadow-xs">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider mb-1">
                <Shield className="h-3 w-3" />
                Facultad Exclusiva del Super Administrador
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Roles Estatutarios del Comité Curricular ({customRoles.length})
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Los roles dentro del comité son creados y configurados por el Super Administrador (<span className="font-mono text-indigo-700">autoevaluacionycurriculomecanica@umayor.edu.co</span>), definiendo voz, voto nominal, firma de actas y auditoría.
              </p>
            </div>
            <button
              onClick={openNewRoleModal}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Crear Nuevo Rol
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customRoles.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {r.code}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      Permiso: {r.baseCapability}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{r.name}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                    {r.description}
                  </p>

                  {/* Capabilities Badges */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 text-[10px]">
                    <span className={`px-2 py-0.5 rounded font-semibold ${r.canVote ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                      {r.canVote ? '✓ Voto Nominal' : '― Sin Voto'}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-semibold ${r.canSign ? 'bg-purple-50 text-purple-800 border border-purple-200' : 'bg-slate-100 text-slate-400'}`}>
                      {r.canSign ? '✓ Firma Digital' : '― Sin Firma'}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-semibold ${r.canAudit ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                      {r.canAudit ? '✓ Auditoría' : '― Sin Auditoría'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[10px]">
                    {users.filter(u => u.customRoleId === r.id || u.role === r.baseCapability).length} miembros asignados
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditRoleModal(r)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                      title="Editar rol"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    {customRoles.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Confirma eliminar el rol ${r.name}?`)) {
                            deleteCustomRole(r.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                        title="Eliminar rol"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GESTIÓN DE ESTAMENTOS DE REPRESENTACIÓN */}
      {activeTab === 'estamentos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Estamentos Universitarios de Representación ({estamentos.length})
              </h3>
              <p className="text-[11px] text-slate-500">
                Cuerpos colegiados estatutarios representados en el Comité Curricular (Docentes, Estudiantes, Egresados, etc.)
              </p>
            </div>
            <button
              onClick={openNewEstamentoModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Crear Nuevo Estamento
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {estamentos.map((est) => (
              <div
                key={est.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {est.code}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${est.hasVote ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                      {est.hasVote ? 'Con Voto Reglamentario' : 'Voz Consultiva'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-slate-600" />
                    {est.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-3">
                    {est.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium text-[11px]">
                    {users.filter(u => u.estamentoId === est.id).length} miembros activos
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditEstamentoModal(est)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                      title="Editar estamento"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    {estamentos.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Confirma eliminar el estamento ${est.name}?`)) {
                            deleteEstamento(est.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                        title="Eliminar estamento"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Miembro */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingUserId ? 'Editar Miembro del Comité' : 'Registrar Nuevo Integrante del Comité'}
              </h3>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Nombre Completo con Títulos Académicos
                </label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Ej. Dr. Mario Alberto Torres Cadena"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Correo Electrónico Institucional
                </label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="mario.torres@umayor.edu.co"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Rol Institucional
                  </label>
                  <select
                    value={memberRoleId}
                    onChange={(e) => setMemberRoleId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-medium"
                  >
                    {customRoles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Estamento que Representa
                  </label>
                  <select
                    value={memberEstamentoId}
                    onChange={(e) => setMemberEstamentoId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-medium"
                  >
                    {estamentos.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Facultad
                  </label>
                  <input
                    type="text"
                    value={memberFaculty}
                    onChange={(e) => setMemberFaculty(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Departamento o Área
                  </label>
                  <input
                    type="text"
                    value={memberDepartment}
                    onChange={(e) => setMemberDepartment(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Período Estatutario
                  </label>
                  <input
                    type="text"
                    value={memberPeriodo}
                    onChange={(e) => setMemberPeriodo(e.target.value)}
                    placeholder="2026 - 2028"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={memberHasVote}
                      onChange={(e) => setMemberHasVote(e.target.checked)}
                      className="rounded text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-[11px] font-medium text-slate-800">
                      Tiene Derecho a Voto Nominal
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
                >
                  {editingUserId ? 'Guardar Cambios' : 'Registrar Miembro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Rol */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingRoleId ? 'Editar Rol' : 'Crear Nuevo Rol del Comité'}
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Denominación del Rol
                  </label>
                  <input
                    type="text"
                    required
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="Ej. Representante Docente Principal"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    required
                    value={roleCode}
                    onChange={(e) => setRoleCode(e.target.value)}
                    placeholder="REP_DOC"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono uppercase text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Permiso RBAC Base en el Sistema
                </label>
                <select
                  value={roleBaseCap}
                  onChange={(e) => setRoleBaseCap(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-semibold"
                >
                  <option value="presidente">Presidente (Control Total, Minuta & Firma)</option>
                  <option value="miembro">Miembro (Deliberación & Voto Nominal)</option>
                  <option value="seguimiento">Encargado de Seguimiento (Auditoría)</option>
                  <option value="autoevaluacion">Gestor de Autoevaluación (Calidad CNA/ABET)</option>
                  <option value="invitado_externo">Invitado Externo (Acceso Restringido a Tareas)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Descripción Estatutaria
                </label>
                <textarea
                  rows={2}
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  placeholder="Funciones y alcance de este rol según el reglamento del comité..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <span className="font-bold text-slate-700 text-[10px] uppercase">
                  Prerrogativas Específicas:
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleCanVote}
                      onChange={(e) => setRoleCanVote(e.target.checked)}
                      className="rounded text-slate-900"
                    />
                    <span>Voto Nominal en Mociones</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleCanSign}
                      onChange={(e) => setRoleCanSign(e.target.checked)}
                      className="rounded text-slate-900"
                    />
                    <span>Firma Digital de Actas</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleCanAudit}
                      onChange={(e) => setRoleCanAudit(e.target.checked)}
                      className="rounded text-slate-900"
                    />
                    <span>Auditoría de Compromisos</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roleCanTagQuality}
                      onChange={(e) => setRoleCanTagQuality(e.target.checked)}
                      className="rounded text-slate-900"
                    />
                    <span>Indexación Calidad CNA/ABET</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
                >
                  Guardar Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Crear / Editar Estamento */}
      {showEstamentoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingEstamentoId ? 'Editar Estamento' : 'Registrar Estamento de Representación'}
              </h3>
              <button
                onClick={() => setShowEstamentoModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEstamento} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Nombre del Estamento
                  </label>
                  <input
                    type="text"
                    required
                    value={estName}
                    onChange={(e) => setEstName(e.target.value)}
                    placeholder="Ej. Estamento Profesoral / Docente"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Sigla / Código
                  </label>
                  <input
                    type="text"
                    required
                    value={estCode}
                    onChange={(e) => setEstCode(e.target.value)}
                    placeholder="DOC"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono uppercase text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Descripción y Naturaleza de la Representación
                </label>
                <textarea
                  rows={3}
                  value={estDesc}
                  onChange={(e) => setEstDesc(e.target.value)}
                  placeholder="Detalles sobre el colectivo o estamento que representa en las sesiones..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-800">
                  ¿Tiene Voto Reglamentario en el Comité?
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={estHasVote}
                    onChange={(e) => setEstHasVote(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    {estHasVote ? 'Sí (Con Voto)' : 'No (Solo Voz)'}
                  </span>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEstamentoModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
                >
                  Guardar Estamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
