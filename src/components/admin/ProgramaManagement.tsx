import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AcademicProgram, AcademicLevel, ProgramStatus, CommitteeConfig, User } from '../../types';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Archive, 
  ArchiveRestore, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Settings, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  Star, 
  Layers, 
  ArrowRight, 
  Calendar, 
  FileText, 
  Check, 
  X, 
  Lock, 
  Sparkles,
  Info,
  BookOpen
} from 'lucide-react';

export const ProgramaManagement: React.FC = () => {
  const { 
    currentUser,
    programs, 
    createProgram, 
    updateProgram, 
    deleteProgram,
    users,
    updateUser,
    meetings,
    commitments,
    activeProgramId,
    setActiveProgramId,
    estamentos
  } = useApp();

  const isSuperAdmin = currentUser.role === 'super_admin';
  const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'presidente';

  // Filters and Views
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProgramStatus>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | AcademicLevel>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal: Create / Edit Program
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [progCode, setProgCode] = useState('');
  const [progName, setProgName] = useState('');
  const [progLevel, setProgLevel] = useState<AcademicLevel>('pregrado');
  const [progFaculty, setProgFaculty] = useState('Facultad de Ingeniería');
  const [progSnies, setProgSnies] = useState('');
  const [progResolucion, setProgResolucion] = useState('');
  const [progVigencia, setProgVigencia] = useState('7 años');
  const [progDirectorName, setProgDirectorName] = useState('');
  const [progDirectorEmail, setProgDirectorEmail] = useState('');
  const [progColor, setProgColor] = useState('emerald');
  const [progDescription, setProgDescription] = useState('');
  const [progStatus, setProgStatus] = useState<ProgramStatus>('activo');

  // Modal: Committee Configuration for Program
  const [showCommitteeModal, setShowCommitteeModal] = useState(false);
  const [targetProgramForCommittee, setTargetProgramForCommittee] = useState<AcademicProgram | null>(null);
  const [committeeQuorum, setCommitteeQuorum] = useState<number>(5);
  const [committeePeriodicity, setCommitteePeriodicity] = useState<'quincenal' | 'mensual' | 'bimestral'>('mensual');
  const [committeeTargetSessions, setCommitteeTargetSessions] = useState<number>(8);
  const [committeePresidentId, setCommitteePresidentId] = useState<string>('');
  const [committeeSecretaryId, setCommitteeSecretaryId] = useState<string>('');

  // Modal: Archive Program
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [targetProgramToArchive, setTargetProgramToArchive] = useState<AcademicProgram | null>(null);
  const [archiveReason, setArchiveReason] = useState('');

  // Helper for program badge classes
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

  // Stats calculation
  const totalPrograms = programs.length;
  const activeProgramsCount = programs.filter(p => p.status === 'activo' || (p.active && !p.status)).length;
  const archivedProgramsCount = programs.filter(p => p.status === 'archivado' || (!p.active && !p.status)).length;
  const underReviewCount = programs.filter(p => p.status === 'en_revision').length;

  // Filtered programs list
  const filteredPrograms = programs.filter((p) => {
    const currentStatus = p.status || (p.active ? 'activo' : 'archivado');
    if (statusFilter !== 'all' && currentStatus !== statusFilter) return false;
    if (levelFilter !== 'all' && p.level !== levelFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCode = p.code.toLowerCase().includes(q);
      const matchSnies = (p.sniesCode || '').toLowerCase().includes(q);
      const matchDir = (p.directorName || '').toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchSnies && !matchDir) return false;
    }
    return true;
  });

  // Open Create Modal
  const openNewProgramModal = () => {
    setEditingProgramId(null);
    setProgCode('');
    setProgName('');
    setProgLevel('pregrado');
    setProgFaculty('Facultad de Ingeniería');
    setProgSnies('');
    setProgResolucion('');
    setProgVigencia('7 años');
    setProgDirectorName('');
    setProgDirectorEmail('');
    setProgColor('emerald');
    setProgDescription('');
    setProgStatus('activo');
    setShowProgramModal(true);
  };

  // Open Edit Modal
  const openEditProgramModal = (prog: AcademicProgram) => {
    setEditingProgramId(prog.id);
    setProgCode(prog.code);
    setProgName(prog.name);
    setProgLevel(prog.level);
    setProgFaculty(prog.faculty || 'Facultad de Ingeniería');
    setProgSnies(prog.sniesCode || '');
    setProgResolucion(prog.registroCalificadoResolucion || '');
    setProgVigencia(prog.registroCalificadoVigencia || '7 años');
    setProgDirectorName(prog.directorName || '');
    setProgDirectorEmail(prog.directorEmail || '');
    setProgColor(prog.color || 'emerald');
    setProgDescription(prog.description || '');
    setProgStatus(prog.status || (prog.active ? 'activo' : 'archivado'));
    setShowProgramModal(true);
  };

  // Save Program (Create or Edit)
  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progName.trim() || !progCode.trim()) return;

    const isActive = progStatus === 'activo';

    if (editingProgramId) {
      await updateProgram(editingProgramId, {
        name: progName.trim(),
        code: progCode.trim().toUpperCase(),
        level: progLevel,
        faculty: progFaculty.trim(),
        sniesCode: progSnies.trim(),
        registroCalificadoResolucion: progResolucion.trim(),
        registroCalificadoVigencia: progVigencia.trim(),
        directorName: progDirectorName.trim(),
        directorEmail: progDirectorEmail.trim(),
        color: progColor,
        description: progDescription.trim(),
        active: isActive,
        status: progStatus,
        updatedAt: new Date().toISOString(),
      });
    } else {
      await createProgram({
        name: progName.trim(),
        code: progCode.trim().toUpperCase(),
        level: progLevel,
        faculty: progFaculty.trim(),
        sniesCode: progSnies.trim(),
        registroCalificadoResolucion: progResolucion.trim(),
        registroCalificadoVigencia: progVigencia.trim(),
        directorName: progDirectorName.trim(),
        directorEmail: progDirectorEmail.trim(),
        color: progColor,
        description: progDescription.trim(),
        active: isActive,
        status: progStatus,
        committeeConfig: {
          minimumQuorum: 5,
          meetingPeriodicity: 'mensual',
          targetSessionsPerSemester: 8,
        }
      });
    }

    setShowProgramModal(false);
  };

  // Open Committee Config Modal
  const openCommitteeConfigModal = (prog: AcademicProgram) => {
    setTargetProgramForCommittee(prog);
    setCommitteeQuorum(prog.committeeConfig?.minimumQuorum || 5);
    setCommitteePeriodicity(prog.committeeConfig?.meetingPeriodicity || 'mensual');
    setCommitteeTargetSessions(prog.committeeConfig?.targetSessionsPerSemester || 8);
    setCommitteePresidentId(prog.committeeConfig?.designatedPresidentId || '');
    setCommitteeSecretaryId(prog.committeeConfig?.designatedSecretaryId || '');
    setShowCommitteeModal(true);
  };

  // Save Committee Configuration
  const handleSaveCommitteeConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProgramForCommittee) return;

    await updateProgram(targetProgramForCommittee.id, {
      committeeConfig: {
        minimumQuorum: Number(committeeQuorum) || 5,
        meetingPeriodicity: committeePeriodicity,
        targetSessionsPerSemester: Number(committeeTargetSessions) || 8,
        designatedPresidentId: committeePresidentId || undefined,
        designatedSecretaryId: committeeSecretaryId || undefined,
      },
      updatedAt: new Date().toISOString(),
    });

    setShowCommitteeModal(false);
  };

  // Toggle user membership in this program's committee
  const handleToggleUserCommitteeMembership = async (user: User, progId: string) => {
    const currentProgs = user.programIds || (user.primaryProgramId ? [user.primaryProgramId] : ['prog-mec']);
    let updatedProgs: string[];

    if (currentProgs.includes(progId)) {
      if (currentProgs.length === 1) {
        alert('El miembro no puede quedar sin ningún programa curricular asignado.');
        return;
      }
      updatedProgs = currentProgs.filter(id => id !== progId);
      const newPrimary = user.primaryProgramId === progId ? updatedProgs[0] : user.primaryProgramId;
      await updateUser(user.id, { programIds: updatedProgs, primaryProgramId: newPrimary });
    } else {
      updatedProgs = [...currentProgs, progId];
      await updateUser(user.id, { programIds: updatedProgs });
    }
  };

  // Open Archive Modal
  const openArchiveModal = (prog: AcademicProgram) => {
    setTargetProgramToArchive(prog);
    setArchiveReason('');
    setShowArchiveModal(true);
  };

  // Execute Archive / Unarchive
  const handleConfirmArchive = async () => {
    if (!targetProgramToArchive) return;

    const isArchivedCurrently = targetProgramToArchive.status === 'archivado';
    const nextStatus: ProgramStatus = isArchivedCurrently ? 'activo' : 'archivado';

    await updateProgram(targetProgramToArchive.id, {
      status: nextStatus,
      active: nextStatus === 'activo',
      archivedAt: nextStatus === 'archivado' ? new Date().toISOString() : undefined,
      archivedBy: nextStatus === 'archivado' ? currentUser.name : undefined,
      archiveReason: nextStatus === 'archivado' ? (archiveReason.trim() || 'Archivado por reestructuración académica.') : undefined,
      updatedAt: new Date().toISOString(),
    });

    setShowArchiveModal(false);
  };

  // Delete Program
  const handleDeleteProgram = async (id: string, name: string) => {
    if (programs.length <= 1) {
      alert('No es posible eliminar el único programa académico del sistema.');
      return;
    }
    if (confirm(`¿Confirma que desea eliminar definitivamente el programa "${name}"? Se desvinculará de las actas y compromisos.`)) {
      await deleteProgram(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Super Admin Exclusive */}
      <div className="bg-gradient-to-r from-[#006837] via-[#004D25] to-[#002B15] rounded-2xl p-5 text-white shadow-lg border border-[#E59800]/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <GraduationCap className="h-44 w-44 text-[#E58A13]" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 bg-[#E58A13] text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs font-cinzel">
                <Lock className="h-3 w-3" />
                Exclusivo Super Administrador
              </span>
              <span className="text-[11px] text-emerald-200 font-mono">
                SIG-CURRÍCULO · Facultad de Ingeniería
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white font-serif">
              Gestión Integral de Programas & Comités Curriculares
            </h2>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Cree, configure, audite y archive los programas académicos de la facultad. Defina los reglamentos de quórum, periodicidad y la composición de los comités curriculares asociados.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={openNewProgramModal}
              className="inline-flex items-center gap-2 bg-[#E58A13] hover:bg-[#D07B0E] text-slate-950 px-4 py-2.5 rounded-xl text-xs font-heading font-black uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Nuevo Programa Académico
            </button>
          )}
        </div>

        {/* Global Statistics Strip */}
        <div className="mt-5 pt-4 border-t border-emerald-700/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
            <span className="text-[10px] text-emerald-200 block uppercase font-mono">Total Programas</span>
            <span className="text-xl font-black font-mono text-white">{totalPrograms}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
            <span className="text-[10px] text-emerald-200 block uppercase font-mono">Programas Activos</span>
            <span className="text-xl font-black font-mono text-emerald-300">{activeProgramsCount}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
            <span className="text-[10px] text-emerald-200 block uppercase font-mono">En Revisión / Calidad</span>
            <span className="text-xl font-black font-mono text-blue-300">{underReviewCount}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs border border-white/10">
            <span className="text-[10px] text-emerald-200 block uppercase font-mono">Programas Archivados</span>
            <span className="text-xl font-black font-mono text-amber-300">{archivedProgramsCount}</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Status Filter, Level Filter & View Switcher */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Segmented Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['all', 'activo', 'en_revision', 'archivado'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer capitalize ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'all' ? 'Todos' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Level Filter Dropdown */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 font-medium cursor-pointer"
          >
            <option value="all">Todos los Niveles</option>
            <option value="pregrado">Pregrado</option>
            <option value="tecnologia">Tecnología</option>
            <option value="especializacion">Especialización</option>
            <option value="maestria">Maestría</option>
            <option value="postgrado">Otro Posgrado</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar programa por código, nombre, director o SNIES..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#006837]"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vista de Tarjetas Detalladas"
            >
              <Layers className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vista de Tabla Comparativa"
            >
              <FileText className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredPrograms.length === 0 ? (
            <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400 space-y-2">
              <GraduationCap className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-600 text-sm">No se encontraron programas académicos</p>
              <p className="text-slate-400">Ajuste los filtros o registre un nuevo programa curricular.</p>
            </div>
          ) : (
            filteredPrograms.map((prog) => {
              const currentStatus = prog.status || (prog.active ? 'activo' : 'archivado');
              const isActiveFilter = activeProgramId === prog.id;

              // Compute stats and members for this program
              const committeeMembers = users.filter((u) => 
                (u.programIds && u.programIds.includes(prog.id)) || u.primaryProgramId === prog.id
              );
              const programMeetings = meetings.filter((m) => m.programId === prog.id);
              const programCommitments = commitments.filter((c) => c.programId === prog.id);
              const completedComms = programCommitments.filter((c) => c.status === 'cumplido');
              const complianceRate = programCommitments.length > 0 
                ? Math.round((completedComms.length / programCommitments.length) * 100) 
                : 0;

              return (
                <div
                  key={prog.id}
                  className={`rounded-2xl border bg-white shadow-xs transition-all flex flex-col justify-between overflow-hidden ${
                    currentStatus === 'archivado'
                      ? 'border-slate-300 opacity-80 bg-slate-50/50'
                      : isActiveFilter
                      ? 'border-[#006837] ring-2 ring-[#006837]/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border shrink-0 ${getProgramBadgeClasses(prog.color)}`}>
                          {prog.code}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-slate-900 leading-snug truncate">
                            {prog.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                            <span className="capitalize font-semibold text-slate-700">{prog.level}</span>
                            <span>·</span>
                            <span>{prog.faculty || 'Facultad de Ingeniería'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Pill */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        currentStatus === 'activo'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : currentStatus === 'en_revision'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-900 border border-amber-200'
                      }`}>
                        {currentStatus === 'activo' && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
                        {currentStatus === 'en_revision' && <Clock className="h-3 w-3 text-blue-600" />}
                        {currentStatus === 'archivado' && <Archive className="h-3 w-3 text-amber-700" />}
                        {currentStatus === 'activo' ? 'Activo' : currentStatus === 'en_revision' ? 'En Revisión' : 'Archivado'}
                      </span>
                    </div>

                    {/* Official Registration & Ministry Info */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/80 p-3 rounded-xl border border-slate-150 text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">SNIES MEN:</span>
                        <strong className="font-mono font-bold text-slate-800">{prog.sniesCode || 'En trámite'}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Registro Calificado:</span>
                        <strong className="text-slate-800 truncate block" title={prog.registroCalificadoResolucion || 'Resolución Vigente'}>
                          {prog.registroCalificadoResolucion || 'Resolución MEN'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Vigencia:</span>
                        <strong className="text-slate-800">{prog.registroCalificadoVigencia || '7 años'}</strong>
                      </div>
                    </div>

                    {/* Director & Description */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400 text-[11px]">Dirección / Coordinación:</span>
                        <strong className="text-slate-800 font-semibold">{prog.directorName || 'No asignado'}</strong>
                      </div>
                      {prog.directorEmail && (
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400 text-[11px]">Correo Institucional:</span>
                          <span className="font-mono text-[11px] text-[#006837]">{prog.directorEmail}</span>
                        </div>
                      )}
                      {prog.description && (
                        <p className="text-[11px] text-slate-600 pt-1 line-clamp-2 leading-relaxed">
                          {prog.description}
                        </p>
                      )}
                    </div>

                    {/* Committee Configuration Box */}
                    <div className="p-3 bg-emerald-50/40 border border-emerald-200/80 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#006837] uppercase">
                          <Users className="h-4 w-4" />
                          <span>Comité Curricular Asociado</span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                          Quórum Mínimo: {prog.committeeConfig?.minimumQuorum || 5}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                        <span>
                          Periodicidad: <strong className="capitalize text-slate-900">{prog.committeeConfig?.meetingPeriodicity || 'Mensual'}</strong>
                        </span>
                        <span>·</span>
                        <span>
                          Meta semestral: <strong className="text-slate-900">{prog.committeeConfig?.targetSessionsPerSemester || 8} sesiones</strong>
                        </span>
                      </div>

                      {/* Committee Members Avatars Preview */}
                      <div className="pt-1.5 border-t border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center -space-x-1.5 overflow-hidden">
                          {committeeMembers.slice(0, 5).map((m) => (
                            <div
                              key={m.id}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#006837] text-[10px] font-bold text-white font-mono ring-2 ring-white shadow-2xs"
                              title={`${m.name} (${m.roleLabel})`}
                            >
                              {m.avatarInitials}
                            </div>
                          ))}
                          {committeeMembers.length > 5 && (
                            <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 font-mono ring-2 ring-white">
                              +{committeeMembers.length - 5}
                            </div>
                          )}
                        </div>

                        <span className="text-[11px] font-bold text-[#006837]">
                          {committeeMembers.length} Miembros Acreditados
                        </span>
                      </div>
                    </div>

                    {/* Operational Metrics Strip */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-150">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Sesiones Realizadas</span>
                        <strong className="font-mono text-slate-800">{programMeetings.length} actas</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Compromisos</span>
                        <strong className="font-mono text-slate-800">{programCommitments.length} tareas</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Cumplimiento</span>
                        <strong className="font-mono text-emerald-700">{complianceRate}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveProgramId(prog.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isActiveFilter
                          ? 'bg-[#006837] text-white shadow-2xs font-bold'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                      title="Establecer como filtro activo para todo el sistema de actas y autoevaluación"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                      {isActiveFilter ? 'Filtro Activo Global' : 'Filtrar Sistema'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Configure Committee Button */}
                      <button
                        onClick={() => openCommitteeConfigModal(prog)}
                        className="inline-flex items-center gap-1 bg-white hover:bg-emerald-50 text-[#006837] border border-emerald-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        title="Configurar los integrantes y quórum del comité curricular"
                      >
                        <Settings className="h-3.5 w-3.5" />
                        Comité
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => openEditProgramModal(prog)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                            title="Editar programa académico"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => openArchiveModal(prog)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200 ${
                              currentStatus === 'archivado'
                                ? 'text-emerald-700 hover:bg-emerald-50'
                                : 'text-amber-700 hover:bg-amber-50'
                            }`}
                            title={currentStatus === 'archivado' ? 'Desarchivar programa' : 'Archivar programa'}
                          >
                            {currentStatus === 'archivado' ? (
                              <ArchiveRestore className="h-4 w-4" />
                            ) : (
                              <Archive className="h-4 w-4" />
                            )}
                          </button>

                          {isSuperAdmin && (
                            <button
                              onClick={() => handleDeleteProgram(prog.id, prog.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                              title="Eliminar programa definitivamente"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW MODE 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Código & Programa</th>
                  <th className="py-3 px-4">Nivel & SNIES</th>
                  <th className="py-3 px-4">Dirección</th>
                  <th className="py-3 px-4 text-center">Miembros Comité</th>
                  <th className="py-3 px-4 text-center">Quórum</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPrograms.map((prog) => {
                  const currentStatus = prog.status || (prog.active ? 'activo' : 'archivado');
                  const committeeMembers = users.filter((u) => 
                    (u.programIds && u.programIds.includes(prog.id)) || u.primaryProgramId === prog.id
                  );

                  return (
                    <tr key={prog.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded font-mono font-black text-[10px] border ${getProgramBadgeClasses(prog.color)}`}>
                            {prog.code}
                          </span>
                          <div>
                            <strong className="font-bold text-slate-900 block">{prog.name}</strong>
                            <span className="text-[10px] text-slate-400">{prog.faculty}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="capitalize font-semibold text-slate-800 block">{prog.level}</span>
                        <span className="text-[10px] font-mono text-slate-500">SNIES: {prog.sniesCode || 'N/A'}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-medium block">{prog.directorName || 'No asignado'}</span>
                        <span className="text-[10px] font-mono text-slate-400">{prog.directorEmail}</span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-[#006837]">
                        {committeeMembers.length}
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-slate-700">
                        {prog.committeeConfig?.minimumQuorum || 5}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          currentStatus === 'activo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : currentStatus === 'en_revision'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}>
                          {currentStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openCommitteeConfigModal(prog)}
                            className="p-1.5 text-slate-600 hover:text-[#006837] hover:bg-emerald-50 rounded cursor-pointer"
                            title="Configurar comité"
                          >
                            <Settings className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openEditProgramModal(prog)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded cursor-pointer"
                            title="Editar programa"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openArchiveModal(prog)}
                            className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded cursor-pointer"
                            title="Archivar"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CREAR / EDITAR PROGRAMA ACADÉMICO */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#006837]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
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

            <form onSubmit={handleSaveProgram} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Nombre Oficial del Programa *
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
                    Código Sigla *
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
                    Nivel de Formación *
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Resolución Registro Calificado
                  </label>
                  <input
                    type="text"
                    value={progResolucion}
                    onChange={(e) => setProgResolucion(e.target.value)}
                    placeholder="Ej. Res. MEN N° 012845"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Vigencia del Registro
                  </label>
                  <input
                    type="text"
                    value={progVigencia}
                    onChange={(e) => setProgVigencia(e.target.value)}
                    placeholder="Ej. 7 años (Hasta 2031)"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>
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
                    Correo Institucional
                  </label>
                  <input
                    type="email"
                    value={progDirectorEmail}
                    onChange={(e) => setProgDirectorEmail(e.target.value)}
                    placeholder="director.programa@umayor.edu.co"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Estado Operativo del Programa
                  </label>
                  <select
                    value={progStatus}
                    onChange={(e) => setProgStatus(e.target.value as ProgramStatus)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-semibold"
                  >
                    <option value="activo">Activo (Comité Operativo)</option>
                    <option value="en_revision">En Revisión Curricular / Autoevaluación</option>
                    <option value="archivado">Archivado / Pausado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Color Distintivo
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[
                      { id: 'emerald', bg: 'bg-emerald-600' },
                      { id: 'blue', bg: 'bg-blue-600' },
                      { id: 'amber', bg: 'bg-amber-600' },
                      { id: 'purple', bg: 'bg-purple-600' },
                      { id: 'indigo', bg: 'bg-indigo-600' },
                      { id: 'teal', bg: 'bg-teal-600' },
                      { id: 'rose', bg: 'bg-rose-600' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setProgColor(c.id)}
                        className={`h-6 w-6 rounded-full ${c.bg} flex items-center justify-center transition-transform cursor-pointer ${
                          progColor === c.id ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {progColor === c.id && <Check className="h-3 w-3 text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Descripción y Alcance Curricular
                </label>
                <textarea
                  rows={2}
                  value={progDescription}
                  onChange={(e) => setProgDescription(e.target.value)}
                  placeholder="Propósitos de formación, competencias del PEP o perfil de egreso..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
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

      {/* MODAL 2: CONFIGURACIÓN DEL COMITÉ CURRICULAR ASOCIADO */}
      {showCommitteeModal && targetProgramForCommittee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#006837]" />
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-serif">
                    Configuración del Comité Curricular · {targetProgramForCommittee.name}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Código: <strong className="font-mono">{targetProgramForCommittee.code}</strong> · Definición de quórum estatutario y miembros asociados.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCommitteeModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCommitteeConfig} className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1">
              {/* Quorum and Periodicity Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Quórum Mínimo Requerido
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    required
                    value={committeeQuorum}
                    onChange={(e) => setCommitteeQuorum(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Integrantes presentes</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Periodicidad Ordinaria
                  </label>
                  <select
                    value={committeePeriodicity}
                    onChange={(e) => setCommitteePeriodicity(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-semibold"
                  >
                    <option value="quincenal">Quincenal</option>
                    <option value="mensual">Mensual</option>
                    <option value="bimestral">Bimestral</option>
                  </select>
                  <span className="text-[10px] text-slate-400">Frecuencia de sesiones</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">
                    Meta Sesiones / Semestre
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={40}
                    required
                    value={committeeTargetSessions}
                    onChange={(e) => setCommitteeTargetSessions(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Objetivo semestral</span>
                </div>
              </div>

              {/* Members of this Committee Roster */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-[#006837]" />
                    <span>Miembros Integrantes de este Comité Curricular</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-500">
                    {users.filter(u => u.programIds?.includes(targetProgramForCommittee.id) || u.primaryProgramId === targetProgramForCommittee.id).length} de {users.length} miembros adscritos
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Marque o desmarque los integrantes de la facultad que pertenecen de forma simultánea al comité curricular de este programa:
                </p>

                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-60 overflow-y-auto bg-white">
                  {users.map((u) => {
                    const isMember = (u.programIds && u.programIds.includes(targetProgramForCommittee.id)) || u.primaryProgramId === targetProgramForCommittee.id;
                    const isPrimary = u.primaryProgramId === targetProgramForCommittee.id;

                    return (
                      <div
                        key={u.id}
                        className={`p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors ${
                          isMember ? 'bg-emerald-50/20' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={Boolean(isMember)}
                            onChange={() => handleToggleUserCommitteeMembership(u, targetProgramForCommittee.id)}
                            className="rounded text-[#006837] focus:ring-[#006837] cursor-pointer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 truncate text-xs">{u.name}</span>
                              {isPrimary && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-semibold font-mono">
                                  <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /> Principal
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span>{u.roleLabel}</span>
                              <span>·</span>
                              <span className="font-semibold text-slate-600">{u.estamentoName || 'Comité'}</span>
                              <span>·</span>
                              <span>{u.hasVote ? 'Con Voto' : 'Solo Voz'}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleUserCommitteeMembership(u, targetProgramForCommittee.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                            isMember
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          }`}
                        >
                          {isMember ? 'Desvincular' : 'Vincular'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCommitteeModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#006837] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004D25] shadow-xs cursor-pointer"
                >
                  Guardar Parámetros del Comité
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ARCHIVAR / DESARCHIVAR PROGRAMA ACADÉMICO */}
      {showArchiveModal && targetProgramToArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                <Archive className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-serif">
                  {targetProgramToArchive.status === 'archivado' ? 'Desarchivar Programa' : 'Archivar Programa Académico'}
                </h3>
                <p className="text-xs text-slate-500">
                  {targetProgramToArchive.name} ({targetProgramToArchive.code})
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {targetProgramToArchive.status === 'archivado'
                ? 'El programa volverá a estar disponible en el selector global para convocar nuevas sesiones y radicar compromisos.'
                : 'Al archivar este programa, se mantendrán todas sus actas previas, firmas criptográficas y evidencias históricas, pero se pausará la convocatoria de nuevas sesiones ordinarias.'}
            </p>

            {targetProgramToArchive.status !== 'archivado' && (
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Motivo o Justificación del Archivo *
                </label>
                <textarea
                  rows={2}
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  placeholder="Ej. Cierre de última cohorte, transición a nuevo registro calificado..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowArchiveModal(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                className={`rounded-lg px-4 py-2 text-xs font-semibold text-white shadow-xs cursor-pointer ${
                  targetProgramToArchive.status === 'archivado'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {targetProgramToArchive.status === 'archivado' ? 'Confirmar Desarchivo' : 'Confirmar Archivo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
