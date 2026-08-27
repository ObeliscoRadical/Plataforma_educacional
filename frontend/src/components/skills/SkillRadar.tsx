import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { Skill } from '../../types/index.js';
import { 
  Award, ShieldAlert, CheckCircle2, AlertTriangle, Layers, 
  Cpu, Code2, Server, Sparkles, Layout, Lock, Zap, ArrowRight,
  TrendingUp, ShieldCheck
} from 'lucide-react';

export const SkillRadar: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [weights, setWeights] = useState<any>(null);
  const [selectedViewMode, setSelectedViewMode] = useState<'TREE' | 'MATRIX'>('TREE');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSkills() {
      try {
        setLoading(true);
        const res = await api.getSkills();
        setSkills(res.skills || []);
        setWeights(res.weights || {});
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadSkills();
  }, []);

  const categories = ['ALL', 'FUNDAMENTALS', 'FRONTEND', 'BACKEND', 'ARCHITECTURE', 'DEVOPS', 'AI_ENGINEERING'];

  const filteredSkills = selectedCategory === 'ALL'
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  const masteredCount = skills.filter(s => s.status === 'MASTERED').length;
  const fragileCount = skills.filter(s => s.status === 'FRAGILE').length;
  const assistedCount = skills.filter(s => s.status === 'ASSISTED').length;

  const rpgTreeNodes = [
    {
      tier: 'NÍVEL 01: O NÚCLEO',
      icon: Cpu,
      title: 'Fundamentos Físicos & Binário',
      skills: [
        { code: 'SKILL_BITS', name: 'Arquitetura de CPU & Bits', status: 'MASTERED', progress: 100 },
        { code: 'SKILL_MEM', name: 'Pilha (Stack) vs Monte (Heap)', status: 'MASTERED', progress: 95 },
        { code: 'SKILL_UNIX', name: 'Terminal Unix & Pipes', status: 'MASTERED', progress: 90 },
      ]
    },
    {
      tier: 'NÍVEL 02: O ARTESÃO',
      icon: Code2,
      title: 'Lógica Algorítmica & JS Puro',
      skills: [
        { code: 'SKILL_JS_TYPES', name: 'Tipos & Imutabilidade', status: 'MASTERED', progress: 88 },
        { code: 'SKILL_ARRAYS', name: 'Pipelines Funcionais (Map/Filter)', status: 'ASSISTED', progress: 75 },
        { code: 'SKILL_ASYNC', name: 'Promises, Async/Await & Event Loop', status: 'ASSISTED', progress: 70 },
      ]
    },
    {
      tier: 'NÍVEL 03: O CONSTRUTOR',
      icon: Layout,
      title: 'Interface Reativa & DOM',
      skills: [
        { code: 'SKILL_DOM', name: 'Árvore do DOM & Renderização', status: 'IN_PROGRESS', progress: 50 },
        { code: 'SKILL_REACT', name: 'Componentes Reativos & Estado', status: 'IN_PROGRESS', progress: 45 },
        { code: 'SKILL_NEXT', name: 'Server Components & SSR', status: 'LOCKED', progress: 0 },
      ]
    },
    {
      tier: 'NÍVEL 04: O ENGENHEIRO',
      icon: Server,
      title: 'Sistemas Distribuídos & Bancos',
      skills: [
        { code: 'SKILL_HTTP', name: 'Protocolo HTTP & REST APIs', status: 'LOCKED', progress: 0 },
        { code: 'SKILL_SQL', name: 'Bancos Relacionais & Modelagem', status: 'LOCKED', progress: 0 },
        { code: 'SKILL_AUTH', name: 'Criptografia & Tokens JWT', status: 'LOCKED', progress: 0 },
      ]
    },
    {
      tier: 'NÍVEL 05: O ARQUITETO',
      icon: Sparkles,
      title: 'Cloud, PWA & Agentes Autônomos',
      skills: [
        { code: 'SKILL_PWA', name: 'Service Workers & Offline Cache', status: 'LOCKED', progress: 0 },
        { code: 'SKILL_SOCKET', name: 'WebSockets Bidirecionais', status: 'LOCKED', progress: 0 },
        { code: 'SKILL_AI', name: 'Agentes de IA & Engenharia de Prompt', status: 'LOCKED', progress: 0 },
      ]
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-dev-green font-mono text-sm">
        <span className="inline-block w-2 h-4 bg-dev-green mr-2 animate-blink-slow"></span>
        Carregando árvore de habilidades RPG...
      </div>
    );
  }

  return (
    <div className="space-y-6 font-mono">
      {/* Top Skills Overview Header */}
      <div className="bg-dev-surface border border-dev-border rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-dev-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-dev-green mb-1">
              <Award className="w-4 h-4" />
              <span>SKILL TREE RPG // 5-DIMENSIONAL MASTERY ENGINE</span>
            </div>
            <h1 className="text-lg font-bold font-mono text-white flex items-center gap-2">
              <span>Árvore de Habilidades & Radar de Maestria</span>
              <span className="text-xs px-2 py-0.5 rounded bg-dev-cyan/10 text-dev-cyan border border-dev-cyan/20">
                NÍVEL 02 // CADET LEAD
              </span>
            </h1>
          </div>

          {/* View Switcher: RPG Tree vs Matrix Grid */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-zinc-900 rounded p-0.5 border border-dev-border text-xs">
              <button
                onClick={() => setSelectedViewMode('TREE')}
                className={`px-3 py-1 rounded transition-colors ${selectedViewMode === 'TREE' ? 'bg-dev-green text-black font-bold shadow-glow-green' : 'text-dev-muted hover:text-white'}`}
              >
                ÁRVORE RPG
              </button>
              <button
                onClick={() => setSelectedViewMode('MATRIX')}
                className={`px-3 py-1 rounded transition-colors ${selectedViewMode === 'MATRIX' ? 'bg-dev-cyan text-black font-bold shadow-glow-cyan' : 'text-dev-muted hover:text-white'}`}
              >
                MATRIZ DETALHADA
              </button>
            </div>
          </div>
        </div>

        {/* 5-Dimensional Radar Weights Metrics */}
        <div className="p-3 rounded bg-dev-bg border border-dev-border text-xs font-mono text-zinc-300 grid grid-cols-2 sm:grid-cols-5 gap-2">
          <div>Conhecimento: <strong className="text-dev-green">{Math.round((weights?.knowledge || 0.15) * 100)}%</strong></div>
          <div>Implementação: <strong className="text-dev-green">{Math.round((weights?.implementation || 0.30) * 100)}%</strong></div>
          <div>Resolução Problemas: <strong className="text-dev-green">{Math.round((weights?.problemSolving || 0.25) * 100)}%</strong></div>
          <div>Debugging: <strong className="text-dev-green">{Math.round((weights?.debugging || 0.20) * 100)}%</strong></div>
          <div>Autonomia: <strong className="text-dev-green">{Math.round((weights?.autonomy || 0.10) * 100)}%</strong></div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RPG SKILL TREE CONSTELLATION VIEW                                         */}
      {/* ========================================================================= */}
      {selectedViewMode === 'TREE' && (
        <div className="space-y-6">
          <div className="relative border-l-2 border-dev-green/40 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-8">
            {rpgTreeNodes.map((tier, tIdx) => {
              const TierIcon = tier.icon;
              return (
                <div key={tIdx} className="relative group">
                  {/* Node Anchor Circle */}
                  <div className="absolute -left-[35px] sm:-left-[43px] top-1 w-8 h-8 rounded-full bg-dev-bg border-2 border-dev-green flex items-center justify-center text-dev-green shadow-glow-green">
                    <TierIcon className="w-4 h-4" />
                  </div>

                  <div className="bg-dev-surface border border-dev-border rounded-lg p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-dev-border/70">
                      <div>
                        <div className="text-[10px] text-dev-cyan font-bold tracking-wider">{tier.tier}</div>
                        <div className="text-sm font-bold text-white">{tier.title}</div>
                      </div>
                      <span className="text-xs text-dev-muted font-bold">
                        {tier.skills.filter(s => s.status === 'MASTERED').length} / {tier.skills.length} DOMINADOS
                      </span>
                    </div>

                    {/* Skill Pills Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {tier.skills.map((s, sIdx) => {
                        const isMastered = s.status === 'MASTERED';
                        const isAssisted = s.status === 'ASSISTED';
                        const isInProgress = s.status === 'IN_PROGRESS';
                        const isLocked = s.status === 'LOCKED';

                        return (
                          <div
                            key={sIdx}
                            className={`p-3 rounded-lg border text-xs space-y-2 transition-all ${
                              isMastered
                                ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-300 shadow-terminal'
                                : isAssisted
                                ? 'bg-dev-cyan/10 border-dev-cyan/40 text-dev-cyan'
                                : isInProgress
                                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                                : 'bg-black/40 border-zinc-800 text-zinc-500 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold">[{s.code}]</span>
                              {isMastered ? (
                                <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                                  <CheckCircle2 className="w-3 h-3" /> DOMINADO
                                </span>
                              ) : isLocked ? (
                                <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-500 font-bold">
                                  <Lock className="w-3 h-3" /> BLOQUEADO
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                                  <Zap className="w-3 h-3" /> EM PROGRESSO
                                </span>
                              )}
                            </div>

                            <div className="font-bold text-white text-[11px]">{s.name}</div>

                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-zinc-800">
                              <div
                                className={`h-full ${isMastered ? 'bg-emerald-400' : isAssisted ? 'bg-dev-cyan' : 'bg-amber-400'}`}
                                style={{ width: `${s.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED MATRIX VIEW                                                      */}
      {/* ========================================================================= */}
      {selectedViewMode === 'MATRIX' && (
        <div className="space-y-4">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1 font-mono text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-dev-green text-black font-bold shadow-glow-green'
                    : 'bg-dev-surface border border-dev-border text-dev-muted hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkills.map((skill) => {
              const score = Math.round(skill.composite_score || 0);
              const isMastered = skill.status === 'MASTERED';
              const isFragile = skill.status === 'FRAGILE';
              const isAssisted = skill.status === 'ASSISTED';

              return (
                <div
                  key={skill.skill_id}
                  className={`bg-dev-surface border rounded-lg p-4 space-y-3 transition-all ${
                    isMastered ? 'border-emerald-500/40' : isFragile ? 'border-amber-500/40 bg-amber-500/5' : 'border-dev-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-dev-cyan">
                      [{skill.code}]
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isMastered ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                      isFragile ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      isAssisted ? 'bg-dev-cyan/20 text-dev-cyan border border-dev-cyan/40' :
                      'bg-zinc-800 text-zinc-400'
                    }`}>
                      {skill.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-mono font-bold text-white mb-1">
                      {skill.name}
                    </h3>
                    <p className="text-[11px] font-mono text-dev-muted line-clamp-2">
                      {skill.description}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-dev-border/60 text-[10px] font-mono">
                    <div className="flex justify-between text-zinc-400">
                      <span>Score Composto:</span>
                      <span className="font-bold text-white">{score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-dev-bg rounded-full overflow-hidden border border-dev-border">
                      <div
                        className={`h-full ${isMastered ? 'bg-emerald-400' : isFragile ? 'bg-amber-400' : 'bg-dev-cyan'}`}
                        style={{ width: `${score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
