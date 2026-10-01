import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QualityFactor, QualityFeature, QualityAspect, ActQualityMapping } from '../types';
import { 
  Award, 
  FolderCheck, 
  Plus, 
  Search, 
  Tag, 
  FileText, 
  Trash2, 
  ExternalLink, 
  Printer, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  ChevronRight,
  Filter,
  Check,
  FileDown,
  Sparkles
} from 'lucide-react';
import { ExportActaPdfModal } from './ExportActaPdfModal';

export const ModuleD_SelfEvaluation: React.FC = () => {
  const { 
    currentUser, 
    meetings, 
    motions,
    commitments,
    qualityFactors, 
    addQualityFactor,
    addQualityFeature,
    addQualityAspect,
    deleteQualityFactor,
    clearQualityFactors,
    loadCnaAbetTemplate,
    qualityMappings, 
    createQualityMapping, 
    deleteQualityMapping 
  } = useApp();

  // Active view: 'inbox' (Actas cerradas y etiquetador) | 'nomenclatures' (Estructura jerárquica) | 'matrix' (Matriz de Búsqueda y Acreditación)
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'nomenclatures' | 'matrix'>('inbox');

  // Closed meetings only
  const closedMeetings = meetings.filter((m) => m.status === 'cerrada');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(closedMeetings[0]?.id || '');
  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId) || closedMeetings[0];

  const [showPdfModal, setShowPdfModal] = useState(false);

  // Mapping Modal State
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [selectedAgendaItemId, setSelectedAgendaItemId] = useState<string>('');
  const [selectedFactorId, setSelectedFactorId] = useState<string>(qualityFactors[0]?.id || '');
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('');
  const [selectedAspectId, setSelectedAspectId] = useState<string>('');
  const [mappingExcerpt, setMappingExcerpt] = useState('');
  const [mappingRationale, setMappingRationale] = useState('');

  // CRUD for Nomenclatures State
  const [showNewFactorModal, setShowNewFactorModal] = useState(false);
  const [showNewFeatureModal, setShowNewFeatureModal] = useState(false);
  const [showNewAspectModal, setShowNewAspectModal] = useState(false);

  // New Factor Form
  const [newFactorCode, setNewFactorCode] = useState('');
  const [newFactorName, setNewFactorName] = useState('');
  const [newFactorFramework, setNewFactorFramework] = useState<'CNA' | 'ABET' | 'INSTITUCIONAL'>('CNA');
  const [newFactorDesc, setNewFactorDesc] = useState('');

  // New Feature Form
  const [targetFactorIdForFeature, setTargetFactorIdForFeature] = useState(qualityFactors[0]?.id || '');
  const [newFeatureCode, setNewFeatureCode] = useState('');
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');

  // New Aspect Form
  const [targetFactorIdForAspect, setTargetFactorIdForAspect] = useState(qualityFactors[0]?.id || '');
  const [targetFeatureIdForAspect, setTargetFeatureIdForAspect] = useState('');
  const [newAspectCode, setNewAspectCode] = useState('');
  const [newAspectName, setNewAspectName] = useState('');
  const [newAspectDesc, setNewAspectDesc] = useState('');

  // Matrix Filter State
  const [matrixFactorFilter, setMatrixFactorFilter] = useState('all');
  const [matrixSearchQuery, setMatrixSearchQuery] = useState('');

  const isEvaluator = currentUser.role === 'autoevaluacion' || currentUser.role === 'presidente';

  // Derived features and aspects for select dropdowns
  const activeFactorObj = qualityFactors.find((f) => f.id === selectedFactorId) || qualityFactors[0];
  const activeFeatures = activeFactorObj?.features || [];
  const activeFeatureObj = activeFeatures.find((ft) => ft.id === selectedFeatureId) || activeFeatures[0];
  const activeAspects = activeFeatureObj?.aspects || [];

  // Mappings for the selected meeting
  const meetingMappings = qualityMappings.filter((m) => m.meetingId === selectedMeeting?.id);

  // Filtered matrix for audit search
  const filteredMatrix = qualityMappings.filter((map) => {
    if (matrixFactorFilter !== 'all' && map.factorCode !== matrixFactorFilter) return false;
    if (matrixSearchQuery.trim()) {
      const q = matrixSearchQuery.toLowerCase();
      const matchText = map.excerpt.toLowerCase().includes(q);
      const matchJust = map.evidentialContribution.toLowerCase().includes(q);
      const matchActa = map.meetingCode.toLowerCase().includes(q);
      const matchAspect = map.aspectName.toLowerCase().includes(q);
      if (!matchText && !matchJust && !matchActa && !matchAspect) return false;
    }
    return true;
  });

  const handleOpenTagModal = (itemId: string, itemTitle: string, initialText: string) => {
    setSelectedAgendaItemId(itemId);
    setMappingExcerpt(initialText || itemTitle);
    setSelectedFactorId(qualityFactors[0]?.id || '');
    if (qualityFactors[0]?.features[0]) {
      setSelectedFeatureId(qualityFactors[0].features[0].id);
      if (qualityFactors[0].features[0].aspects[0]) {
        setSelectedAspectId(qualityFactors[0].features[0].aspects[0].id);
      }
    }
    setMappingRationale('Aporta evidencia cuantitativa y deliberativa para el informe de renovación de acreditación institucional.');
    setShowMappingModal(true);
  };

  const handleCreateMappingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting || !selectedAgendaItemId) return;

    const currentItem = selectedMeeting.agendaItems.find((it) => it.id === selectedAgendaItemId);
    const factor = qualityFactors.find((f) => f.id === selectedFactorId);
    const feature = factor?.features.find((ft) => ft.id === selectedFeatureId);
    const aspect = feature?.aspects.find((asp) => asp.id === selectedAspectId);

    if (!factor || !feature || !aspect) return;

    createQualityMapping({
      meetingId: selectedMeeting.id,
      meetingCode: selectedMeeting.code,
      agendaItemId: selectedAgendaItemId,
      agendaItemTitle: currentItem?.title || 'Punto de Acta',
      factorCode: factor.code,
      featureCode: feature.code,
      aspectCode: aspect.code,
      aspectName: aspect.name,
      excerpt: mappingExcerpt,
      evidentialContribution: mappingRationale,
    });

    setShowMappingModal(false);
  };

  const handleCreateFactor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactorCode.trim() || !newFactorName.trim()) return;

    addQualityFactor({
      code: newFactorCode,
      name: newFactorName,
      framework: newFactorFramework,
      description: newFactorDesc,
    });

    setNewFactorCode('');
    setNewFactorName('');
    setNewFactorDesc('');
    setShowNewFactorModal(false);
  };

  const handleCreateFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFactorIdForFeature || !newFeatureCode.trim() || !newFeatureName.trim()) return;

    addQualityFeature(targetFactorIdForFeature, {
      code: newFeatureCode,
      name: newFeatureName,
      description: newFeatureDesc,
    });

    setNewFeatureCode('');
    setNewFeatureName('');
    setNewFeatureDesc('');
    setShowNewFeatureModal(false);
  };

  const handleCreateAspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFactorIdForAspect || !targetFeatureIdForAspect || !newAspectCode.trim() || !newAspectName.trim()) return;

    addQualityAspect(targetFactorIdForAspect, targetFeatureIdForAspect, {
      code: newAspectCode,
      name: newAspectName,
      description: newAspectDesc,
    });

    setNewAspectCode('');
    setNewAspectName('');
    setNewAspectDesc('');
    setShowNewAspectModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Módulo D · Aseguramiento de la Calidad
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
            Gestor de Autoevaluación & Acreditación de Calidad
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl">
            Bandeja de actas finalizadas, administración de la estructura jerárquica (Factor &gt; Característica &gt; Aspecto), etiquetado de acuerdos y matriz de auditoría para pares CNA / ABET.
          </p>
        </div>

        {/* Subtab Segmented Control */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSubTab('inbox')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeSubTab === 'inbox'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bandeja de Actas Cerradas ({closedMeetings.length})
          </button>
          <button
            onClick={() => setActiveSubTab('nomenclatures')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeSubTab === 'nomenclatures'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gestor de Nomenclaturas
          </button>
          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeSubTab === 'matrix'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Matriz de Auditoría ({qualityMappings.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: INBOX DE ACTAS CERRADAS & ETIQUETADO */}
      {activeSubTab === 'inbox' && (
        <div className="space-y-6">
          {closedMeetings.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3">
              <FolderCheck className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800">
                No hay actas en estado "Cerrada/Finalizada"
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                El Presidente del Comité debe formalizar el cierre y firma del acta en el Módulo B para que esté disponible en esta bandeja de autoevaluación.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Closed Acts List */}
              <div className="lg:col-span-4 space-y-2.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                  Actas Finalizadas Listas para Indexar
                </h2>
                {closedMeetings.map((m) => {
                  const isSelected = selectedMeeting?.id === m.id;
                  const countMaps = qualityMappings.filter((qm) => qm.meetingId === m.id).length;

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMeetingId(m.id)}
                      className={`cursor-pointer rounded-xl border p-4 text-xs transition-all text-left bg-white ${
                        isSelected
                          ? 'border-slate-900 ring-1 ring-slate-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900">{m.code}</span>
                        <span className="font-mono text-[10px] text-slate-400">{m.date}</span>
                      </div>
                      <h4 className="font-semibold text-slate-900 mt-1 line-clamp-2 leading-snug">
                        {m.title}
                      </h4>
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-purple-700 font-semibold flex items-center gap-1">
                          <Tag className="h-3 w-3" /> {countMaps} mapeos a calidad
                        </span>
                        <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                          <CheckCircle2 className="h-3 w-3" /> Firmada
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tagging Tool & Agenda Items of Closed Act */}
              {selectedMeeting && (
                <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
                  <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-slate-900">
                          {selectedMeeting.code}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Acta Cerrada y Aprobada
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {selectedMeeting.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Firma Digital: {selectedMeeting.presidentSignatureDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2.5 py-1.5 rounded-lg border border-purple-200">
                        {meetingMappings.length} evidencias indexadas
                      </span>
                      <button
                        onClick={() => setShowPdfModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors shadow-xs"
                        title="Ver y exportar acta formal con firma digital y votaciones"
                      >
                        <FileDown className="h-4 w-4 text-emerald-400" />
                        Exportar Acta PDF
                      </button>
                    </div>
                  </div>

                  {/* Agenda Items with Tagging Buttons */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Puntos del Acta Disponibles para Etiquetado de Calidad
                    </h4>

                    {selectedMeeting.agendaItems.map((item, idx) => {
                      const itemMaps = qualityMappings.filter(
                        (qm) => qm.meetingId === selectedMeeting.id && qm.agendaItemId === item.id
                      );

                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-xs space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-200 text-[10px] font-bold font-mono text-slate-700">
                                {idx + 1}
                              </span>
                              <div>
                                <h5 className="font-bold text-slate-900 leading-snug">
                                  {item.title}
                                </h5>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Sustentado por: {item.presenter}
                                </p>
                              </div>
                            </div>

                            {isEvaluator && (
                              <button
                                onClick={() => handleOpenTagModal(item.id, item.title, item.agreements || item.deliberations)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-purple-700 px-2.5 py-1 text-xs font-semibold text-white hover:bg-purple-800 transition-colors shadow-xs shrink-0"
                              >
                                <Tag className="h-3.5 w-3.5" />
                                Etiquetar Aspecto de Calidad
                              </button>
                            )}
                          </div>

                          {/* Agreements text */}
                          {item.agreements && (
                            <div className="rounded-lg bg-white p-2.5 border border-slate-200 text-[11px]">
                              <span className="font-bold text-emerald-800">Acuerdo Registrado:</span>
                              <p className="text-slate-700 mt-0.5 leading-relaxed">{item.agreements}</p>
                            </div>
                          )}

                          {/* Existing Mappings for this Item */}
                          {itemMaps.length > 0 && (
                            <div className="pt-2 border-t border-slate-200 space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900">
                                Nomenclaturas Vinculadas ({itemMaps.length}):
                              </span>
                              <div className="space-y-1.5">
                                {itemMaps.map((map) => (
                                  <div
                                    key={map.id}
                                    className="flex items-start justify-between gap-2 rounded-lg bg-purple-50/70 border border-purple-200 p-2 text-[11px]"
                                  >
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-bold text-purple-900">
                                          {map.factorCode} &gt; {map.featureCode} &gt; {map.aspectCode}
                                        </span>
                                        <span className="text-purple-800 font-semibold truncate max-w-sm">
                                          ({map.aspectName})
                                        </span>
                                      </div>
                                      <p className="text-slate-600 text-[10px] mt-0.5">
                                        <strong>Justificación CNA:</strong> {map.evidentialContribution}
                                      </p>
                                    </div>

                                    {isEvaluator && (
                                      <button
                                        onClick={() => deleteQualityMapping(map.id)}
                                        className="text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                                        title="Eliminar mapeo"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: GESTOR DE NOMENCLATURAS (FACTOR > CARACTERÍSTICA > ASPECTO) */}
      {activeSubTab === 'nomenclatures' && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Estructura de Nomenclaturas de Autoevaluación
              </h3>
              <p className="text-xs text-slate-500">
                Jerarquía estricta de 3 niveles: Factor &gt; Característica &gt; Aspecto para acreditación CNA y ABET.
              </p>
            </div>

            {isEvaluator && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowNewFactorModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  + Nuevo Factor
                </button>
                <button
                  onClick={() => setShowNewFeatureModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  + Característica
                </button>
                <button
                  onClick={() => setShowNewAspectModal(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  + Aspecto
                </button>
                {qualityFactors.length === 0 ? (
                  <button
                    onClick={loadCnaAbetTemplate}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-800 hover:bg-purple-100"
                    title="Cargar estructura de referencia CNA y ABET"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    Cargar Plantilla CNA / ABET
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm('¿Confirma blanquear y vaciar todas las nomenclaturas de autoevaluación?')) {
                        clearQualityFactors();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
                    title="Vaciar catálogo de factores y aspectos"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Blanquear Nomenclaturas
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tree View of Factors */}
          <div className="space-y-4">
            {qualityFactors.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 mx-auto">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  Catálogo de Nomenclaturas Vacío
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  No hay nomenclaturas de calidad configuradas. Como Gestor de Autoevaluación, puede crear la estructura jerárquica de su programa (<strong>Factor &gt; Característica &gt; Aspecto</strong>) o cargar la plantilla estándar de referencia CNA / ABET.
                </p>
                {isEvaluator && (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setShowNewFactorModal(true)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 shadow-xs"
                    >
                      <Plus className="h-4 w-4" />
                      Crear Primer Factor
                    </button>
                    <button
                      onClick={loadCnaAbetTemplate}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                      Cargar Plantilla CNA / ABET
                    </button>
                  </div>
                )}
              </div>
            ) : (
              qualityFactors.map((factor) => (
                <div key={factor.id} className="rounded-xl border border-slate-200 overflow-hidden">
                  {/* Level 1: Factor Header */}
                  <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold bg-slate-800 px-2 py-0.5 rounded">
                        {factor.code}
                      </span>
                      <h4 className="text-sm font-bold">{factor.name}</h4>
                      <span className="text-[10px] uppercase font-bold text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                        Marco: {factor.framework}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono">
                        {factor.features.length} características
                      </span>
                      {isEvaluator && (
                        <button
                          onClick={() => {
                            if (confirm(`¿Confirma eliminar el factor ${factor.code}?`)) {
                              deleteQualityFactor(factor.id);
                            }
                          }}
                          className="text-slate-400 hover:text-rose-400 p-1 rounded"
                          title="Eliminar factor"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/50 space-y-3">
                    <p className="text-xs text-slate-600 italic">
                      {factor.description}
                    </p>

                    {/* Level 2: Features */}
                    <div className="space-y-3 pl-3 border-l-2 border-slate-200">
                      {factor.features.map((feature) => (
                        <div key={feature.id} className="bg-white rounded-lg border border-slate-200 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                {feature.code}
                              </span>
                              <h5 className="text-xs font-bold text-slate-900">{feature.name}</h5>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {feature.aspects.length} aspectos a evaluar
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">{feature.description}</p>

                          {/* Level 3: Aspects */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                            {feature.aspects.map((aspect) => (
                              <div
                                key={aspect.id}
                                className="rounded border border-slate-200 bg-slate-50 p-2 text-xs space-y-1"
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                    Aspecto {aspect.code}
                                  </span>
                                  <span className="font-semibold text-slate-900 truncate">
                                    {aspect.name}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 line-clamp-2">
                                  {aspect.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: MATRIZ DE AUDITORÍA Y BÚSQUEDA AVANZADA */}
      {activeSubTab === 'matrix' && (
        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-slate-600">Filtrar por Factor:</label>
              <select
                value={matrixFactorFilter}
                onChange={(e) => setMatrixFactorFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-semibold"
              >
                <option value="all">Todos los Factores de Acreditación</option>
                {qualityFactors.map((f) => (
                  <option key={f.id} value={f.code}>
                    {f.code} - {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative min-w-[260px]">
              <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={matrixSearchQuery}
                onChange={(e) => setMatrixSearchQuery(e.target.value)}
                placeholder="Buscar por aspecto, acta o justificación..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Audit Matrix Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Matriz de Trazabilidad: Actas del Comité Curricular vs. Acreditación de Calidad
                </h3>
                <p className="text-[11px] text-slate-500">
                  {filteredMatrix.length} evidencias indexadas para presentación ante el Consejo Nacional de Acreditación (CNA) y pares evaluadores ABET.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimir Ficha
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-100/70 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Acta / Sesión</th>
                    <th className="py-2.5 px-4">Nomenclatura (Factor &gt; Aspecto)</th>
                    <th className="py-2.5 px-4">Fragmento / Acuerdo del Comité</th>
                    <th className="py-2.5 px-4">Contribución Evidencial CNA/ABET</th>
                    <th className="py-2.5 px-4">Indexado Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMatrix.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                        No se encontraron registros de auditoría que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredMatrix.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {item.meetingCode}
                          <span className="block text-[10px] font-sans font-normal text-slate-500 line-clamp-1 max-w-[150px]">
                            {item.agendaItemTitle}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                            {item.factorCode} · {item.aspectCode}
                          </span>
                          <span className="block text-[11px] font-medium text-slate-800 mt-1 line-clamp-2">
                            {item.aspectName}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs text-slate-700 leading-relaxed text-[11px]">
                          "{item.excerpt}"
                        </td>
                        <td className="py-3 px-4 max-w-xs text-slate-600 leading-relaxed text-[11px]">
                          {item.evidentialContribution}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap text-slate-500 text-[10px]">
                          {item.mappedBy}
                          <span className="block font-mono text-slate-400">{item.mappedAt.slice(0, 10)}</span>
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

      {/* Modal: Etiquetar Aspecto de Calidad */}
      {showMappingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-purple-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Etiquetar Fragmento de Acta con Nomenclatura Oficial
                </h3>
              </div>
              <button
                onClick={() => setShowMappingModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMappingSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Select Factor */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Factor de Calidad
                  </label>
                  <select
                    value={selectedFactorId}
                    onChange={(e) => {
                      const fId = e.target.value;
                      setSelectedFactorId(fId);
                      const fObj = qualityFactors.find((f) => f.id === fId);
                      if (fObj?.features[0]) {
                        setSelectedFeatureId(fObj.features[0].id);
                        if (fObj.features[0].aspects[0]) {
                          setSelectedAspectId(fObj.features[0].aspects[0].id);
                        }
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900"
                  >
                    {qualityFactors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.code} - {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Feature */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Característica
                  </label>
                  <select
                    value={selectedFeatureId}
                    onChange={(e) => {
                      const ftId = e.target.value;
                      setSelectedFeatureId(ftId);
                      const ftObj = activeFeatures.find((ft) => ft.id === ftId);
                      if (ftObj?.aspects[0]) {
                        setSelectedAspectId(ftObj.aspects[0].id);
                      }
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  >
                    {activeFeatures.map((ft) => (
                      <option key={ft.id} value={ft.id}>
                        {ft.code} - {ft.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Select Aspect */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Aspecto Específico
                  </label>
                  <select
                    value={selectedAspectId}
                    onChange={(e) => setSelectedAspectId(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                  >
                    {activeAspects.map((asp) => (
                      <option key={asp.id} value={asp.id}>
                        {asp.code} - {asp.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Fragmento o Acuerdo Específico a Vincular
                </label>
                <textarea
                  rows={2}
                  required
                  value={mappingExcerpt}
                  onChange={(e) => setMappingExcerpt(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Contribución Evidencial para la Acreditación (Justificación)
                </label>
                <textarea
                  rows={3}
                  required
                  value={mappingRationale}
                  onChange={(e) => setMappingRationale(e.target.value)}
                  placeholder="Explique cómo esta decisión respalda el cumplimiento del indicador de calidad ante los evaluadores..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMappingModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-purple-700 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-800 shadow-xs"
                >
                  Confirmar Indexación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Factor */}
      {showNewFactorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Crear Factor de Calidad</h3>
              <button onClick={() => setShowNewFactorModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateFactor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Código (ej. F8)</label>
                  <input
                    type="text"
                    required
                    value={newFactorCode}
                    onChange={(e) => setNewFactorCode(e.target.value)}
                    className="w-full rounded border border-slate-200 p-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Marco</label>
                  <select
                    value={newFactorFramework}
                    onChange={(e) => setNewFactorFramework(e.target.value as any)}
                    className="w-full rounded border border-slate-200 p-1.5"
                  >
                    <option value="CNA">CNA</option>
                    <option value="ABET">ABET</option>
                    <option value="INSTITUCIONAL">Institucional</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Nombre del Factor</label>
                <input
                  type="text"
                  required
                  value={newFactorName}
                  onChange={(e) => setNewFactorName(e.target.value)}
                  placeholder="Ej. Bienestar Institucional y Permanencia"
                  className="w-full rounded border border-slate-200 p-1.5"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={newFactorDesc}
                  onChange={(e) => setNewFactorDesc(e.target.value)}
                  className="w-full rounded border border-slate-200 p-1.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowNewFactorModal(false)} className="rounded border px-3 py-1.5">Cancelar</button>
                <button type="submit" className="rounded bg-slate-900 text-white font-semibold px-4 py-1.5">Guardar Factor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nueva Característica */}
      {showNewFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Agregar Característica</h3>
              <button onClick={() => setShowNewFeatureModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateFeature} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Factor Asociado</label>
                <select
                  value={targetFactorIdForFeature}
                  onChange={(e) => setTargetFactorIdForFeature(e.target.value)}
                  className="w-full rounded border border-slate-200 p-1.5"
                >
                  {qualityFactors.map((f) => (
                    <option key={f.id} value={f.id}>{f.code} - {f.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Código (ej. C15)</label>
                  <input
                    type="text"
                    required
                    value={newFeatureCode}
                    onChange={(e) => setNewFeatureCode(e.target.value)}
                    className="w-full rounded border border-slate-200 p-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    className="w-full rounded border border-slate-200 p-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={newFeatureDesc}
                  onChange={(e) => setNewFeatureDesc(e.target.value)}
                  className="w-full rounded border border-slate-200 p-1.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowNewFeatureModal(false)} className="rounded border px-3 py-1.5">Cancelar</button>
                <button type="submit" className="rounded bg-slate-900 text-white font-semibold px-4 py-1.5">Guardar Característica</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo Aspecto */}
      {showNewAspectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Agregar Aspecto Específico</h3>
              <button onClick={() => setShowNewAspectModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateAspect} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Factor</label>
                  <select
                    value={targetFactorIdForAspect}
                    onChange={(e) => {
                      setTargetFactorIdForAspect(e.target.value);
                      const f = qualityFactors.find(fa => fa.id === e.target.value);
                      if (f?.features[0]) setTargetFeatureIdForAspect(f.features[0].id);
                    }}
                    className="w-full rounded border border-slate-200 p-1.5"
                  >
                    {qualityFactors.map((f) => (
                      <option key={f.id} value={f.id}>{f.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Característica</label>
                  <select
                    value={targetFeatureIdForAspect}
                    onChange={(e) => setTargetFeatureIdForAspect(e.target.value)}
                    className="w-full rounded border border-slate-200 p-1.5"
                  >
                    {qualityFactors.find(f => f.id === targetFactorIdForAspect)?.features.map((ft) => (
                      <option key={ft.id} value={ft.id}>{ft.code} - {ft.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Código (ej. 15.2)</label>
                  <input
                    type="text"
                    required
                    value={newAspectCode}
                    onChange={(e) => setNewAspectCode(e.target.value)}
                    className="w-full rounded border border-slate-200 p-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={newAspectName}
                    onChange={(e) => setNewAspectName(e.target.value)}
                    className="w-full rounded border border-slate-200 p-1.5"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Descripción / Evidencia esperada</label>
                <textarea
                  rows={2}
                  value={newAspectDesc}
                  onChange={(e) => setNewAspectDesc(e.target.value)}
                  className="w-full rounded border border-slate-200 p-1.5"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button type="button" onClick={() => setShowNewAspectModal(false)} className="rounded border px-3 py-1.5">Cancelar</button>
                <button type="submit" className="rounded bg-slate-900 text-white font-semibold px-4 py-1.5">Guardar Aspecto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Exportar Acta Oficial a PDF */}
      {showPdfModal && selectedMeeting && (
        <ExportActaPdfModal
          meeting={selectedMeeting}
          motions={motions}
          commitments={commitments}
          qualityMappings={qualityMappings}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </div>
  );
};
