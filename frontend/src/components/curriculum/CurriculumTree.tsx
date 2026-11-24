import React, { useState, useEffect } from 'react';
import { useTerminal } from '../../context/TerminalContext.js';
import { api } from '../../api/client.js';
import { Module } from '../../types/index.js';
import { 
  Folder, FolderOpen, FileCode, CheckCircle2, 
  Lock, Play, ChevronRight, Terminal, Search, Flame,
  Cpu, Code2, Layout, Database, Sparkles, Layers, ShieldCheck, Bug
} from 'lucide-react';

const STAGES = [
  { id: 'ALL', label: 'TODOS OS ESTÁGIOS', icon: Layers, count: '24 Módulos' },
  { id: 'STAGE_0', label: 'ESTÁGIO 0: O DESPERTAR DA MÁQUINA', icon: Cpu, codes: ['MOD_00', 'MOD_01', 'MOD_02', 'MOD_03'], subtitle: 'Bits, Memória RAM, Hardware & Terminal Unix' },
  { id: 'STAGE_1', label: 'ESTÁGIO 1: O ARTESÃO DO CÓDIGO', icon: Code2, codes: ['MOD_04', 'MOD_05', 'MOD_06', 'MOD_07'], subtitle: 'JavaScript Puro, Estruturas de Dados, Algoritmos & Async' },
  { id: 'STAGE_2', label: 'ESTÁGIO 2: O CONSTRUTOR DE INTERFACES', icon: Layout, codes: ['MOD_08', 'MOD_09'], subtitle: 'DOM Vivo, CSS Moderno, React, Next.js & UI Reativa' },
  { id: 'STAGE_3', label: 'ESTÁGIO 3: O ENGENHEIRO DE SISTEMAS', icon: Database, codes: ['MOD_10', 'MOD_11', 'MOD_12', 'MOD_13', 'MOD_14'], subtitle: 'Node.js, APIs RESTful, SQL Relacional & Autenticação JWT' },
  { id: 'STAGE_4', label: 'ESTÁGIO 4: O ARQUITETO FULL-STACK & AI', icon: Sparkles, codes: ['MOD_15', 'MOD_16', 'MOD_17', 'MOD_18', 'MOD_19', 'MOD_20', 'MOD_21', 'MOD_22', 'MOD_23'], subtitle: 'PWA, WebSockets, Testes, CI/CD, Nuvem & Agentes LLM' },
];

export const CurriculumTree: React.FC = () => {
  const { setActiveView, setCurrentLessonId, setCurrentModuleId, addLog } = useTerminal();
  const [modules, setModules] = useState<Module[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({ mod_mod_00: true });
  const [selectedModuleDetails, setSelectedModuleDetails] = useState<any>(null);
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchModules() {
      try {
        const res = await api.getModules();
        setModules(res.modules || []);
        if (res.modules && res.modules.length > 0) {
          const firstMod = await api.getModuleDetails(res.modules[0].id);
          setSelectedModuleDetails(firstMod.module);
        }
      } catch (err: any) {
        addLog(`Error loading curriculum: ${err.message}`, 'ERROR');
      } finally {
        setLoading(false);
      }
    }
    fetchModules();
  }, []);

  const toggleExpand = async (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    try {
      const res = await api.getModuleDetails(moduleId);
      setSelectedModuleDetails(res.module);
    } catch {
      // ignore
    }
  };

  const handleOpenLesson = (lessonId: string, moduleId: string) => {
    setCurrentLessonId(lessonId);
    setCurrentModuleId(moduleId);
    setActiveView('LESSON');
    addLog(`Navigating to lesson ${lessonId}`, 'COMMAND');
  };

  const currentStageObj = STAGES.find(s => s.id === selectedStage);

  const filteredModules = modules.filter(m => {
    const matchesSearch = 
      m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.code.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchFilter.toLowerCase());
    
    if (!matchesSearch) return false;
    if (selectedStage === 'ALL') return true;

    return currentStageObj?.codes?.includes(m.code);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-dev-green text-sm">
        <span className="inline-block w-2 h-4 bg-dev-green mr-2"></span>
        Mounting curriculum filesystem ~/curriculum...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Directory Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-dev-surface border border-dev-border rounded-lg">
        <div>
          <div className="flex items-center gap-2 text-xs text-dev-green mb-1">
            <Terminal className="w-4 h-4" />
            <span>TOPOLOGIA CURRICULAR: 5 ESTÁGIOS // 60+ MISSÕES ATÔMICAS</span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>A Jornada do Cadete ao Tech Lead</span>
            <span className="text-xs px-2 py-0.5 rounded bg-dev-cyan/10 text-dev-cyan border border-dev-cyan/20">
              ESCOLA DE ENGENHARIA
            </span>
          </h2>
        </div>

        {/* Search / Filter CLI input */}
        <div className="flex items-center bg-dev-bg border border-dev-border rounded px-3 py-1.5 text-xs text-dev-text focus-within:border-dev-green transition-colors w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-dev-muted mr-2 shrink-0" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filtrar por nome ou código..."
            className="bg-transparent border-none outline-none w-full text-dev-text placeholder-dev-muted/60 text-xs"
          />
        </div>
      </div>

      {/* Career Stage Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          const isSelected = selectedStage === stage.id;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-dev-green bg-dev-green/10 text-dev-green font-bold'
                  : 'border-dev-border bg-dev-surface hover:bg-dev-surfaceHover text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-dev-green' : 'text-dev-cyan'}`} />
                <span className="text-[10px] uppercase font-bold tracking-tight truncate">
                  {stage.id === 'ALL' ? 'Todos' : stage.id.replace('_', ' ')}
                </span>
              </div>
              <div className="text-[10px] text-dev-muted truncate">
                {stage.id === 'ALL' ? '24 Módulos' : stage.subtitle?.split(',')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* 2-Column Layout: Left Directory Tree, Right Module Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Tree List (7 cols) */}
        <div className="lg:col-span-7 space-y-2.5">
          {filteredModules.map((mod) => {
            const isExpanded = !!expandedModules[mod.id];
            const isCompleted = mod.status === 'COMPLETED';
            const isLocked = mod.status === 'LOCKED';
            const isActive = mod.status === 'AVAILABLE' || mod.status === 'IN_PROGRESS';

            return (
              <div
                key={mod.id}
                className={`border rounded-lg transition-all overflow-hidden ${
                  isActive
                    ? 'border-dev-green/40 bg-dev-surface'
                    : isCompleted
                    ? 'border-dev-border/80 bg-dev-surface/60'
                    : 'border-dev-border/40 bg-dev-bg/40 opacity-70'
                }`}
              >
                {/* Module Tree Item Header */}
                <div
                  onClick={() => !isLocked && toggleExpand(mod.id)}
                  className={`flex items-center justify-between p-3 cursor-pointer select-none hover:bg-dev-surfaceHover transition-colors ${
                    isLocked ? 'cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isLocked ? (
                      <Lock className="w-4 h-4 text-dev-muted" />
                    ) : isExpanded ? (
                      <FolderOpen className="w-4 h-4 text-dev-green" />
                    ) : (
                      <Folder className="w-4 h-4 text-dev-cyan" />
                    )}

                    <span className=" text-xs font-bold text-dev-cyan">
                      [{mod.code}]
                    </span>

                    <span className=" text-xs text-white font-medium">
                      {mod.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        [✓] COMPLETED
                      </span>
                    ) : isActive ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-dev-green/10 text-dev-green border border-dev-green/20 font-bold">
                        [&gt;] ACTIVE
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold">
                        [LOCKED]
                      </span>
                    )}

                    {!isLocked && (
                      <ChevronRight
                        className={`w-3.5 h-3.5 text-dev-muted transition-transform ${
                          isExpanded ? 'rotate-90 text-dev-green' : ''
                        }`}
                      />
                    )}
                  </div>
                </div>

                {/* Sub-tree Lessons List */}
                {isExpanded && selectedModuleDetails && selectedModuleDetails.id === mod.id && (
                  <div className="px-4 pb-3 pt-1 border-t border-dev-border/50 bg-dev-bg/80 space-y-1.5">
                    {selectedModuleDetails.lessons && selectedModuleDetails.lessons.length > 0 ? (
                      selectedModuleDetails.lessons.map((lesson: any) => {
                        const lessonCompleted = lesson.progress_status === 'COMPLETED';
                        const lessonLocked = lesson.progress_status === 'LOCKED';

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => !lessonLocked && handleOpenLesson(lesson.id, mod.id)}
                            className={`flex items-center justify-between p-2 rounded text-xs transition-colors ${
                              lessonLocked
                                ? 'text-dev-muted cursor-not-allowed opacity-50'
                                : 'text-zinc-200 hover:bg-dev-surface cursor-pointer hover:text-dev-green'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <FileCode className="w-3.5 h-3.5 text-dev-muted" />
                              <span className="text-dev-cyan font-bold">{lesson.code}</span>
                              <span>{lesson.title}</span>
                              {lesson.is_checkpoint === 1 && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                  CHECKPOINT
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-dev-muted">
                                {lesson.duration_min} min
                              </span>
                              {lessonCompleted ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-dev-green" />
                              ) : (
                                <Play className="w-3 h-3 text-dev-cyan" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-xs text-dev-muted py-1">
                        Aulas em carregamento...
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Module Inspector HUD (5 cols) */}
        <div className="lg:col-span-5">
          {selectedModuleDetails ? (
            <div className="sticky top-24 bg-dev-surface border border-dev-border rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-dev-border">
                <div className="flex items-center gap-2">
                  <span className=" text-xs font-bold text-dev-green">
                    INSPECTOR: {selectedModuleDetails.code}
                  </span>
                </div>
                <span className="text-xs text-dev-cyan font-bold">
                  {selectedModuleDetails.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white mb-1">
                  {selectedModuleDetails.title}
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {selectedModuleDetails.summary}
                </p>
              </div>

              {/* Module Challenge / Project Info */}
              {selectedModuleDetails.project && (
                <div className="p-3 rounded bg-dev-bg border border-dev-border text-xs">
                  <div className="text-dev-cyan font-bold mb-1 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-dev-amber" />
                    PROJETO DO MÓDULO: {selectedModuleDetails.project.title}
                  </div>
                  <div className="text-dev-muted text-[11px]">
                    Tier {selectedModuleDetails.project.tier} • Requer submissão e code review do Mentor.
                  </div>
                </div>
              )}

              {/* Quick Launch First Lesson */}
              {selectedModuleDetails.lessons && selectedModuleDetails.lessons.length > 0 && (
                <button
                  onClick={() => handleOpenLesson(selectedModuleDetails.lessons[0].id, selectedModuleDetails.id)}
                  className="w-full py-2.5 px-4 bg-dev-green text-dev-bg font-bold text-xs rounded hover:bg-dev-greenDim transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>[ ABRIR AULA {selectedModuleDetails.lessons[0].code} ]</span>
                </button>
              )}
            </div>
          ) : (
            <div className="bg-dev-surface border border-dev-border rounded-lg p-6 text-center text-xs text-dev-muted">
              Selecione um módulo para inspecionar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
