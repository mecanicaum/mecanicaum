import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Estamento, CustomRole, UserRole, AcademicProgram, AcademicLevel } from '../types';
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
  Vote, 
  Search,
  Filter,
  Check,
  Lock,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckSquare,
  Star,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SuperAdminBrandingManager } from './admin/SuperAdminBrandingManager';
import { ProgramaManagement } from './admin/ProgramaManagement';

export const Module_Admin: React.FC = () => {
  const { 
    currentUser,
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
    deleteCustomRole,
    programs,
    createProgram,
    updateProgram,
    deleteProgram,
    activeProgramId,
    setActiveProgramId,
    meetings,
    commitments
  } = useApp();

  const [activeTab, setActiveTab] = useState<'members' | 'programs' | 'roles' | 'estamentos' | 'brand_customization'>('members');

  // Search & Filter for Members
  const [memberSearch, setMemberSearch] = useState('');
  const [estamentoFilter, setEstamentoFilter] = useState('all');
  const [programFilter, setProgramFilter] = useState('all');

  // Search for Programs
  const [programSearch, setProgramSearch] = useState('');

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
  const [memberPassword, setMemberPassword] = useState('');
  // Multiprogram member association state
  const [memberProgramIds, setMemberProgramIds] = useState<string[]>([]);
  const [memberPrimaryProgramId, setMemberPrimaryProgramId] = useState<string>('');

  // Program Modal State
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [progCode, setProgCode] = useState('');
  const [progName, setProgName] = useState('');
  const [progLevel, setProgLevel] = useState<AcademicLevel>('pregrado');
  const [progFaculty, setProgFaculty] = useState('Facultad de Ingeniería');
  const [progSnies, setProgSnies] = useState('');
  const [progDirectorName, setProgDirectorName] = useState('');
  const [progDirectorEmail, setProgDirectorEmail] = useState('');
  const [progColor, setProgColor] = useState('emerald');
  const [progDescription, setProgDescription] = useState('');
  const [progActive, setProgActive] = useState(true);

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

  const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'presidente';

  // Helper for program badge color classes
  const getProgramBadgeClasses = (color?: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'amber':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'purple':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'teal':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'rose':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'emerald':
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

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
    setMemberPassword('Umayor2026!');
    // Default to active program or first program
    const defaultProg = activeProgramId !== 'all' ? activeProgramId : (programs[0]?.id || 'prog-mec');
    setMemberProgramIds([defaultProg]);
    setMemberPrimaryProgramId(defaultProg);
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
    setMemberPassword(u.password || '');
    const userProgs = u.programIds && u.programIds.length > 0 
      ? u.programIds 
      : [u.primaryProgramId || programs[0]?.id || 'prog-mec'];
    setMemberProgramIds(userProgs);
    setMemberPrimaryProgramId(u.primaryProgramId || userProgs[0] || 'prog-mec');
    setShowMemberModal(true);
  };

  const handleToggleMemberProgram = (progId: string) => {
    if (memberProgramIds.includes(progId)) {
      if (memberProgramIds.length === 1) {
        alert('El miembro debe estar asociado al menos a un programa curricular.');
        return;
      }
      const updated = memberProgramIds.filter((id) => id !== progId);
      setMemberProgramIds(updated);
      if (memberPrimaryProgramId === progId) {
        setMemberPrimaryProgramId(updated[0] || '');
      }
    } else {
      const updated = [...memberProgramIds, progId];
      setMemberProgramIds(updated);
      if (!memberPrimaryProgramId) {
        setMemberPrimaryProgramId(progId);
      }
    }
  };

  const handleSelectAllProgramsForMember = () => {
    const allIds = programs.map((p) => p.id);
    setMemberProgramIds(allIds);
    if (!memberPrimaryProgramId && allIds.length > 0) {
      setMemberPrimaryProgramId(allIds[0]);
    }
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) return;

    if (memberProgramIds.length === 0) {
      alert('Debe asociar al miembro al menos a un programa curricular de la facultad.');
      return;
    }

    const selectedRole = customRoles.find((r) => r.id === memberRoleId);
    const selectedEst = estamentos.find((e) => e.id === memberEstamentoId);

    const baseRole: UserRole = selectedRole ? selectedRole.baseCapability : 'miembro';
    const roleLabel = selectedRole ? selectedRole.name : 'Miembro del Comité';
    const estNameStr = selectedEst ? selectedEst.name : 'Comité Curricular';

    const finalPrimaryProg = memberPrimaryProgramId && memberProgramIds.includes(memberPrimaryProgramId)
      ? memberPrimaryProgramId
      : memberProgramIds[0];

    if (editingUserId) {
      updateUser(editingUserId, {
        name: memberName.trim(),
        email: memberEmail.trim(),
        role: baseRole,
        customRoleId: memberRoleId,
        roleLabel,
        estamentoId: memberEstamentoId,
        estamentoName: estNameStr,
        faculty: memberFaculty.trim(),
        department: memberDepartment.trim(),
        hasVote: memberHasVote,
        periodo: memberPeriodo.trim(),
        isExternal: memberIsExternal,
        password: memberPassword.trim() || undefined,
        programIds: memberProgramIds,
        primaryProgramId: finalPrimaryProg,
      });
    } else {
      createUser({
        name: memberName.trim(),
        email: memberEmail.trim(),
        role: baseRole,
        customRoleId: memberRoleId,
        roleLabel,
        estamentoId: memberEstamentoId,
        estamentoName: estNameStr,
        faculty: memberFaculty.trim(),
        department: memberDepartment.trim(),
        hasVote: memberHasVote,
        periodo: memberPeriodo.trim(),
        isExternal: memberIsExternal,
        password: memberPassword.trim() || 'Umayor2026!',
        programIds: memberProgramIds,
        primaryProgramId: finalPrimaryProg,
      });
    }

    setShowMemberModal(false);
  };

  // Open Program Modal
  const openNewProgramModal = () => {
    setEditingProgramId(null);
    setProgCode('');
    setProgName('');
    setProgLevel('pregrado');
    setProgFaculty('Facultad de Ingeniería');
    setProgSnies('');
    setProgDirectorName('');
    setProgDirectorEmail('');
    setProgColor('emerald');
    setProgDescription('');
    setProgActive(true);
    setShowProgramModal(true);
  };

  const openEditProgramModal = (prog: AcademicProgram) => {
    setEditingProgramId(prog.id);
    setProgCode(prog.code);
    setProgName(prog.name);
    setProgLevel(prog.level);
    setProgFaculty(prog.faculty || 'Facultad de Ingeniería');
    setProgSnies(prog.sniesCode || '');
    setProgDirectorName(prog.directorName || '');
    setProgDirectorEmail(prog.directorEmail || '');
    setProgColor(prog.color || 'emerald');
    setProgDescription(prog.description || '');
    setProgActive(prog.active !== false);
    setShowProgramModal(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progName.trim() || !progCode.trim()) return;

    if (editingProgramId) {
      await updateProgram(editingProgramId, {
        name: progName.trim(),
        code: progCode.trim().toUpperCase(),
        level: progLevel,
        faculty: progFaculty.trim(),
        sniesCode: progSnies.trim(),
        directorName: progDirectorName.trim(),
        directorEmail: progDirectorEmail.trim(),
        color: progColor,
        description: progDescription.trim(),
        active: progActive,
      });
    } else {
      await createProgram({
        name: progName.trim(),
        code: progCode.trim().toUpperCase(),
        level: progLevel,
        faculty: progFaculty.trim(),
        sniesCode: progSnies.trim(),
        directorName: progDirectorName.trim(),
        directorEmail: progDirectorEmail.trim(),
        color: progColor,
        description: progDescription.trim(),
        active: progActive,
      });
    }

    setShowProgramModal(false);
  };

  const handleToggleProgramActive = async (prog: AcademicProgram) => {
    await updateProgram(prog.id, { active: !prog.active });
  };

  const handleDeleteProgramConfirm = async (id: string, name: string) => {
    if (programs.length <= 1) {
      alert('No es posible eliminar el único programa académico configurado en el sistema.');
      return;
    }
    if (confirm(`¿Está seguro de eliminar el programa académico "${name}"? Esta acción desvinculará sus registros del comité.`)) {
      await deleteProgram(id);
    }
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

  // Filtered Users for Member Management
  const filteredUsers = users.filter((u) => {
    if (estamentoFilter !== 'all' && u.estamentoId !== estamentoFilter) return false;
    if (programFilter !== 'all') {
      const userProgs = u.programIds && u.programIds.length > 0 
        ? u.programIds 
        : (u.primaryProgramId ? [u.primaryProgramId] : ['prog-mec']);
      if (!userProgs.includes(programFilter)) return false;
    }
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

  // Filtered Programs for Program Management
  const filteredPrograms = programs.filter((p) => {
    if (programSearch.trim()) {
      const q = programSearch.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.directorName || '').toLowerCase().includes(q) ||
        (p.sniesCode || '').includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-cinzel">
            Módulo de Administración Institucional
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Gobernanza Multiprograma, Miembros & Estamentos
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Parametrización exclusiva de programas académicos de la facultad, asociación simultánea de miembros a comités curriculares y roles estatutarios con voto reglamentario.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'members'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            Miembros ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('programs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'programs'
                ? 'bg-[#006837] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Módulo exclusivo de administración para crear y gestionar los programas de la facultad"
          >
            <GraduationCap className={`h-3.5 w-3.5 ${activeTab === 'programs' ? 'text-[#E58A13]' : 'text-slate-500'}`} />
            <span>Programas ({programs.length})</span>
            <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-md uppercase">
              Admin
            </span>
          </button>

          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'estamentos'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            Estamentos ({estamentos.length})
          </button>

          <button
            onClick={() => setActiveTab('brand_customization')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'brand_customization'
                ? 'bg-[#E59800] text-[#006837] shadow-xs font-black'
                : 'text-slate-700 hover:text-slate-900'
            }`}
            title="Módulo de Personalización del Logotipo y Banner (Exclusivo Super Administrador)"
          >
            <Lock className={`h-3.5 w-3.5 ${activeTab === 'brand_customization' ? 'text-[#006837]' : 'text-amber-600'}`} />
            <span>Cambiar Logo & Banner</span>
            <span className="text-[9px] bg-slate-900 text-[#E59800] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
              Super Admin
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: GESTIÓN DE MIEMBROS (CON ASOCIACIÓN MULTIPROGRAMA) */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Action and Filter Bar */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={openNewMemberModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#006837] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#004D25] transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-[#E58A13]" />
                Registrar Nuevo Miembro
              </button>

              {/* Program filter */}
              <select
                value={programFilter}
                onChange={(e) => setProgramFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
                title="Filtrar integrantes por programa curricular"
              >
                <option value="all">Todos los Programas de Facultad</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))}
              </select>

              {/* Estamento filter */}
              <select
                value={estamentoFilter}
                onChange={(e) => setEstamentoFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
              >
                <option value="all">Todos los Estamentos</option>
                {estamentos.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.name} ({est.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative min-w-[240px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Buscar por nombre, correo o rol..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006837]"
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
                    <th className="py-3 px-4">Programas Asociados (Multiprograma)</th>
                    <th className="py-3 px-4">Rol del Comité</th>
                    <th className="py-3 px-4">Estamento que Representa</th>
                    <th className="py-3 px-4 text-center">Derecho a Voto</th>
                    <th className="py-3 px-4">Período</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-xs text-slate-400">
                        No se encontraron integrantes que coincidan con los criterios de búsqueda o filtro de programa.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const userProgs = u.programIds && u.programIds.length > 0 
                        ? u.programIds 
                        : (u.primaryProgramId ? [u.primaryProgramId] : ['prog-mec']);
                      
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#006837] text-xs font-bold text-white font-mono shadow-2xs">
                                {u.avatarInitials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate">{u.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono truncate">{u.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Multiprogram Badges */}
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap items-center gap-1 max-w-[240px]">
                              {userProgs.map((pid) => {
                                const progObj = programs.find((p) => p.id === pid);
                                const isPrimary = u.primaryProgramId === pid;
                                return (
                                  <span
                                    key={pid}
                                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${getProgramBadgeClasses(progObj?.color)}`}
                                    title={`${progObj?.name || pid}${isPrimary ? ' · Programa Principal' : ''}`}
                                  >
                                    {isPrimary && <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500 shrink-0" />}
                                    {progObj?.code || pid}
                                  </span>
                                );
                              })}
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
                              {u.estamentoName || 'Sin estamento'}
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
                                className="text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded cursor-pointer"
                                title="Asumir este perfil en sesión"
                              >
                                Simular
                              </button>
                              <button
                                onClick={() => openEditMemberModal(u)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
                                title="Editar miembro y programas"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              {u.role !== 'super_admin' && (
                                <button
                                  onClick={() => {
                                    if (confirm(`¿Eliminar al miembro ${u.name}?`)) {
                                      deleteUser(u.id);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                                  title="Dar de baja"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MÓDULO EXCLUSIVO DEL ADMINISTRADOR PARA CREAR Y GESTIONAR PROGRAMAS DE LA FACULTAD */}
      {activeTab === 'programs' && (
        <ProgramaManagement />
      )}

      {/* TAB 3: GESTIÓN DE ROLES ESTATUTARIOS */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Catálogo de Roles Institucionales</h3>
              <p className="text-xs text-slate-500">
                Roles asignables a miembros de comités curriculares en la facultad.
              </p>
            </div>
            <button
              onClick={openNewRoleModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Crear Nuevo Rol
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customRoles.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-600 uppercase bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {r.code}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">
                      Base: {r.baseCapability}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-2">{r.name}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {r.description}
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Voto Nominal:</span>
                      <strong className={r.canVote ? 'text-emerald-700' : 'text-slate-400'}>
                        {r.canVote ? 'Habilitado' : 'Sin voto'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Firma de Actas:</span>
                      <strong className={r.canSign ? 'text-emerald-700' : 'text-slate-400'}>
                        {r.canSign ? 'Autorizado' : 'No'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Auditoría de Compromisos:</span>
                      <strong className={r.canAudit ? 'text-emerald-700' : 'text-slate-400'}>
                        {r.canAudit ? 'Autorizado' : 'No'}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-1.5">
                  <button
                    onClick={() => openEditRoleModal(r)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
                    title="Editar rol"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  {r.id !== 'rol-superadmin' && r.id !== 'rol-pres' && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar rol ${r.name}?`)) {
                          deleteCustomRole(r.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                      title="Eliminar rol"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GESTIÓN DE ESTAMENTOS ESTATUTARIOS */}
      {activeTab === 'estamentos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Estamentos de Representación Universitaria</h3>
              <p className="text-xs text-slate-500">
                Cuerpos colegiados representados en los comités curriculares de la facultad.
              </p>
            </div>
            <button
              onClick={openNewEstamentoModal}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Nuevo Estamento
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {estamentos.map((est) => (
              <div key={est.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {est.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      est.hasVote ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {est.hasVote ? 'Voz y Voto' : 'Solo Voz'}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-2">{est.name}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {est.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-1.5">
                  <button
                    onClick={() => openEditEstamentoModal(est)}
                    className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100 cursor-pointer"
                    title="Editar estamento"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar estamento ${est.name}?`)) {
                        deleteEstamento(est.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                    title="Eliminar estamento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PERSONALIZACIÓN DEL LOGOTIPO Y BANNER (SOLO SUPER ADMINISTRADOR) */}
      {activeTab === 'brand_customization' && <SuperAdminBrandingManager />}

      {/* MODAL 1: REGISTRAR / EDITAR MIEMBRO CON ASOCIACIÓN MULTIPROGRAMA */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingUserId ? 'Editar Integrante del Comité' : 'Registrar Nuevo Integrante'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Asigne los roles, estamento y programas de la facultad a los que pertenece.
                </p>
              </div>
              <button
                onClick={() => setShowMemberModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Nombre Completo con Títulos Académicos *
                </label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Ej. Dr. Mario Alberto Torres Cadena"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006837]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Correo Electrónico Institucional *
                </label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  placeholder="mario.torres@umayor.edu.co"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006837]"
                />
              </div>

              {/* ASOCIACIÓN A MÚLTIPLES PROGRAMAS DE LA FACULTAD (REQUERIMIENTO MULTIPROGRAMA) */}
              <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-4 w-4 text-[#006837]" />
                    <label className="text-[11px] font-bold text-[#006837] uppercase tracking-wide">
                      Asociación a Programas de la Facultad (Multiprograma) *
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllProgramsForMember}
                      className="text-[10px] text-[#006837] hover:underline font-semibold cursor-pointer"
                    >
                      Seleccionar Todos
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-600">
                  Seleccione uno o más programas curriculares en los que este miembro participa simultáneamente:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {programs.map((prog) => {
                    const isChecked = memberProgramIds.includes(prog.id);
                    const isPrimary = memberPrimaryProgramId === prog.id;

                    return (
                      <div
                        key={prog.id}
                        onClick={() => handleToggleMemberProgram(prog.id)}
                        className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-white border-[#006837] shadow-2xs'
                            : 'bg-white/60 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by div
                          className="mt-0.5 rounded text-[#006837] focus:ring-[#006837]"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] text-slate-900 truncate">
                              {prog.code}
                            </span>
                            {isChecked && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMemberPrimaryProgramId(prog.id);
                                }}
                                className={`text-[9px] px-1 py-0.2 rounded font-bold cursor-pointer transition-colors ${
                                  isPrimary
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'text-slate-400 hover:text-slate-700'
                                }`}
                                title="Fijar como programa principal de adscripción"
                              >
                                {isPrimary ? '★ Principal' : 'Hacer Principal'}
                              </button>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 truncate">{prog.name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {memberProgramIds.length > 0 && (
                  <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-600 border-t border-emerald-100">
                    <span>
                      Asociado a: <strong>{memberProgramIds.length} programa(s)</strong>
                    </span>
                    <span>
                      Principal:{' '}
                      <strong className="text-[#006837]">
                        {programs.find((p) => p.id === memberPrimaryProgramId)?.name || 'Sin fijar'}
                      </strong>
                    </span>
                  </div>
                )}
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

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Contraseña o PIN Institucional de Acceso
                </label>
                <input
                  type="text"
                  value={memberPassword}
                  onChange={(e) => setMemberPassword(e.target.value)}
                  placeholder="Ej. ClaveSegura2026* o PIN numérico"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006837]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Esta credencial se utiliza para el acceso institucional del miembro al sistema.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#006837] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004D25] shadow-xs cursor-pointer"
                >
                  {editingUserId ? 'Guardar Cambios' : 'Registrar Miembro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREAR / EDITAR PROGRAMA ACADÉMICO (EXCLUSIVO DEL ADMINISTRADOR) */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#006837]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingProgramId ? 'Editar Programa Académico' : 'Crear Nuevo Programa Académico'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Parametrización oficial para comités curriculares y autoevaluación.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProgramModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-3.5 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Nombre del Programa Académico *
                  </label>
                  <input
                    type="text"
                    required
                    value={progName}
                    onChange={(e) => setProgName(e.target.value)}
                    placeholder="Ej. Ingeniería Mecánica"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006837]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Sigla / Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={progCode}
                    onChange={(e) => setProgCode(e.target.value)}
                    placeholder="ING-MEC"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#006837]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Nivel Académico *
                  </label>
                  <select
                    value={progLevel}
                    onChange={(e) => setProgLevel(e.target.value as AcademicLevel)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-medium"
                  >
                    <option value="pregrado">Pregrado Profesional</option>
                    <option value="tecnologia">Tecnología</option>
                    <option value="especializacion">Especialización</option>
                    <option value="maestria">Maestría</option>
                    <option value="postgrado">Otro Posgrado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Código SNIES (MEN)
                  </label>
                  <input
                    type="text"
                    value={progSnies}
                    onChange={(e) => setProgSnies(e.target.value)}
                    placeholder="Ej. 108420"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Facultad Adscrita
                </label>
                <input
                  type="text"
                  value={progFaculty}
                  onChange={(e) => setProgFaculty(e.target.value)}
                  placeholder="Facultad de Ingeniería"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Director(a) o Coordinador(a)
                  </label>
                  <input
                    type="text"
                    value={progDirectorName}
                    onChange={(e) => setProgDirectorName(e.target.value)}
                    placeholder="Ej. Ing. Carlos Mario Gómez"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Correo del Director / Programa
                  </label>
                  <input
                    type="email"
                    value={progDirectorEmail}
                    onChange={(e) => setProgDirectorEmail(e.target.value)}
                    placeholder="director.mecanica@umayor.edu.co"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Color Distintivo del Programa
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'emerald', label: 'Esmeralda', bg: 'bg-emerald-600' },
                    { id: 'blue', label: 'Azul', bg: 'bg-blue-600' },
                    { id: 'amber', label: 'Ámbar', bg: 'bg-amber-600' },
                    { id: 'purple', label: 'Púrpura', bg: 'bg-purple-600' },
                    { id: 'indigo', label: 'Índigo', bg: 'bg-indigo-600' },
                    { id: 'teal', label: 'Turquesa', bg: 'bg-teal-600' },
                    { id: 'rose', label: 'Rosa', bg: 'bg-rose-600' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setProgColor(c.id)}
                      className={`h-7 w-7 rounded-full ${c.bg} flex items-center justify-center transition-transform cursor-pointer ${
                        progColor === c.id ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      title={c.label}
                    >
                      {progColor === c.id && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Descripción / Alcance Curricular
                </label>
                <textarea
                  rows={2}
                  value={progDescription}
                  onChange={(e) => setProgDescription(e.target.value)}
                  placeholder="Detalles del perfil, acreditación o propósitos de formación del programa..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-800">
                  ¿Programa Activo en el Sistema?
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={progActive}
                    onChange={(e) => setProgActive(e.target.checked)}
                    className="rounded text-[#006837] focus:ring-[#006837]"
                  />
                  <span className="text-xs font-bold text-slate-900">
                    {progActive ? 'Sí (Activo)' : 'No (Pausado)'}
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProgramModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#006837] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004D25] shadow-xs cursor-pointer"
                >
                  {editingProgramId ? 'Guardar Cambios' : 'Crear Programa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREAR / EDITAR ROL ESTATUTARIO */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingRoleId ? 'Editar Rol Estatutario' : 'Crear Nuevo Rol Institucional'}
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Nombre del Rol
                  </label>
                  <input
                    type="text"
                    required
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="Ej. Gestor de Autoevaluación"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Código Sigla
                  </label>
                  <input
                    type="text"
                    required
                    value={roleCode}
                    onChange={(e) => setRoleCode(e.target.value)}
                    placeholder="GEST_AUTO"
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
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-medium"
                >
                  <option value="presidente">Presidente (Convocatoria y Firma)</option>
                  <option value="miembro">Miembro del Comité (Voz y Voto)</option>
                  <option value="seguimiento">Seguimiento (Auditoría de Compromisos)</option>
                  <option value="autoevaluacion">Autoevaluación (Mapeo de Calidad)</option>
                  <option value="invitado_externo">Invitado Externo (Solo Consulta y Radicación)</option>
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
                  placeholder="Responsabilidades y atribuciones en el comité..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={roleCanVote}
                    onChange={(e) => setRoleCanVote(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <span className="text-[11px] font-medium text-slate-800">
                    Voto Nominal en Plenaria
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={roleCanSign}
                    onChange={(e) => setRoleCanSign(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <span className="text-[11px] font-medium text-slate-800">
                    Firma Digital de Actas
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={roleCanAudit}
                    onChange={(e) => setRoleCanAudit(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <span className="text-[11px] font-medium text-slate-800">
                    Auditar Compromisos
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={roleCanTagQuality}
                    onChange={(e) => setRoleCanTagQuality(e.target.checked)}
                    className="rounded text-slate-900"
                  />
                  <span className="text-[11px] font-medium text-slate-800">
                    Mapeo de Calidad
                  </span>
                </label>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs cursor-pointer"
                >
                  Guardar Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: CREAR / EDITAR ESTAMENTO */}
      {showEstamentoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingEstamentoId ? 'Editar Estamento' : 'Nuevo Estamento Universitario'}
              </h3>
              <button
                onClick={() => setShowEstamentoModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
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
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs cursor-pointer"
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
