import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useTerminal } from '../../context/TerminalContext.js';
import { api } from '../../api/client.js';
import { Module, Skill } from '../../types/index.js';
import { 
  Terminal, Cpu, Code2, Award, BookOpen, Bot, 
  Play, Sparkles, CheckCircle2, ChevronRight, Activity, Wrench, Shield
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { setActiveView, setCurrentLessonId, setCurrentModuleId, logs, addLog, setMentorOpen } = useTerminal();
  const [modules, setModules] = useState<Module[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [modRes, skillRes, sysRes] = await Promise.all([
          api.getModules(),
          api.getSkills(),
          api.getSystemStatus(),
        ]);
        setModules(modRes.modules || []);
        setSkills(skillRes.skills || []);
        setSystemStatus(sysRes);
      } catch (err: any) {
        addLog(`Dashboard load error: ${err.message}`, 'ERROR');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Find the active mission (first available or in-progress lesson)
  const activeModule = modules.find(m => m.status === 'AVAILABLE' || m.status === 'IN_PROGRESS') || modules[0];
  const completedCount = modules.filter(m => m.status === 'COMPLETED').length;
  const totalPercent = modules.length > 0 ? Math.round((completedCount / modules.length) * 100) : 0;

  const masteredSkills = skills.filter(s => s.status === 'MASTERED').length;
  const fragileSkills = skills.filter(s => s.status === 'FRAGILE');

  const handleContinueMission = () => {
    if (activeModule) {
      setCurrentModuleId(activeModule.id);
      setCurrentLessonId(`lesson_${activeModule.code.toLowerCase().replace('mod_', '')}_01`);
      setActiveView('LESSON');
      addLog(`Continuing mission: ${activeModule.title}`, 'COMMAND');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-dev-green font-mono text-sm">
        <span className="inline-block w-2 h-4 bg-dev-green mr-2 animate-blink-slow"></span>
        Booting Developer OS Core Systems...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Boot Header Banner */}
      <div className="bg-dev-surface border border-dev-border rounded-lg p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Cpu className="w-48 h-48 text-dev-green" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-dev-green mb-1">
              <span className="w-2 h-2 rounded-full bg-dev-green animate-pulse"></span>
              <span>ENVIRONMENT BOOT COMPLETE // SYSTEM ID: DEVOS-NODE-01</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold font-mono text-white tracking-tight">
              DEVELOPER OPERATING SYSTEM
            </h1>
            <p className="text-xs text-dev-muted font-mono mt-1 max-w-xl">
              Ambiente de Treinamento e Prática Contínua. O aluno avança demonstrando domínio real de código, arquitetura e debugging.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleContinueMission}
              className="px-5 py-2.5 bg-dev-green text-black font-mono font-bold text-xs rounded hover:bg-dev-greenDim transition-all shadow-glow-green flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>[ CONTINUE MISSION ]</span>
            </button>
            <button
              onClick={() => setMentorOpen(true)}
              className="px-4 py-2.5 bg-dev-surfaceHover border border-dev-cyan/40 text-dev-cyan font-mono font-bold text-xs rounded hover:bg-dev-cyan/10 transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4" />
              <span>MENTOR AI</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 pt-4 border-t border-dev-border/60">
          <div className="flex justify-between items-center text-xs font-mono text-dev-muted mb-1.5">
            <span>CURRICULUM MASTERY PROGRESS ({completedCount}/24 MODULES)</span>
            <span className="text-dev-green font-bold">{totalPercent}% MASTERED</span>
          </div>
          <div className="w-full h-2 bg-dev-bg rounded-full overflow-hidden border border-dev-border">
            <div
              className="h-full bg-gradient-to-r from-dev-cyan to-dev-green transition-all duration-500"
              style={{ width: `${totalPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Systems Diagnostics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-dev-surface border border-dev-border rounded-lg p-4">
          <div className="flex items-center justify-between text-dev-muted text-xs font-mono mb-2">
            <span>AI MENTOR</span>
            <Bot className="w-4 h-4 text-dev-cyan" />
          </div>
          <div className="text-lg font-bold font-mono text-dev-cyan flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-dev-cyan animate-pulse"></span>
            ONLINE / READY
          </div>
          <div className="text-[11px] text-dev-muted font-mono mt-1">
            5 Scaffolding Levels Active
          </div>
        </div>

        <div className="bg-dev-surface border border-dev-border rounded-lg p-4">
          <div className="flex items-center justify-between text-dev-muted text-xs font-mono mb-2">
            <span>CODE LAB SANDBOX</span>
            <Code2 className="w-4 h-4 text-dev-green" />
          </div>
          <div className="text-lg font-bold font-mono text-dev-green flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-dev-green"></span>
            VM SECURE
          </div>
          <div className="text-[11px] text-dev-muted font-mono mt-1">
            CODE | PREVIEW | TERMINAL
          </div>
        </div>

        <div className="bg-dev-surface border border-dev-border rounded-lg p-4">
          <div className="flex items-center justify-between text-dev-muted text-xs font-mono mb-2">
            <span>SKILL RADAR</span>
            <Award className="w-4 h-4 text-dev-amber" />
          </div>
          <div className="text-lg font-bold font-mono text-dev-amber">
            {masteredSkills} / 24 MASTERED
          </div>
          <div className="text-[11px] text-dev-muted font-mono mt-1">
            {fragileSkills.length > 0 ? `${fragileSkills.length} fragile detected` : 'Autonomy stable (100%)'}
          </div>
        </div>

        <div className="bg-dev-surface border border-dev-border rounded-lg p-4">
          <div className="flex items-center justify-between text-dev-muted text-xs font-mono mb-2">
            <span>DEVELOPER CHALLENGE</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold font-mono text-purple-400">
            MOD_23 EXAM
          </div>
          <div className="text-[11px] text-dev-muted font-mono mt-1">
            4 Stages Defense Capstone
          </div>
        </div>
      </div>

      {/* Fragile Skills Alert / Remedial Trigger if any */}
      {fragileSkills.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Wrench className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-mono font-bold text-amber-400">
                [!] REFORÇO ADAPTATIVO REQUERIDO: {fragileSkills.map(s => s.name).join(', ')}
              </div>
              <div className="text-[11px] font-mono text-dev-muted">
                O Mentor detectou dificuldade prática nestas competências. Execute a microaula de reforço para reestabelecer seu score de autonomia.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveView('REMEDIALS')}
            className="px-3 py-1.5 rounded bg-amber-400 text-black font-mono font-bold text-xs shrink-0 hover:bg-amber-500 transition-colors"
          >
            [ REFORÇO ]
          </button>
        </div>
      )}

      {/* Active Mission Card & System Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active Module Details */}
        <div className="lg:col-span-2 bg-dev-surface border border-dev-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-dev-border">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-dev-green" />
              <span className="text-xs font-mono font-bold text-white uppercase">
                MISSÃO ATIVA: {activeModule?.code} // {activeModule?.title}
              </span>
            </div>
            <span className="text-xs font-mono text-dev-cyan font-semibold">
              {activeModule?.status}
            </span>
          </div>

          <p className="text-xs text-zinc-300 font-mono leading-relaxed mb-6">
            {activeModule?.summary}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-dev-border">
            <div className="text-xs font-mono text-dev-muted">
              Método: <span className="text-dev-green">EXPLICAR → MOSTRAR → FAZER JUNTO → FAZER SOZINHO → TESTAR</span>
            </div>
            <button
              onClick={() => {
                setCurrentModuleId(activeModule.id);
                setActiveView('CURRICULUM');
              }}
              className="text-xs font-mono text-dev-cyan hover:underline flex items-center gap-1"
            >
              <span>Ver todos os 24 módulos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Live Terminal Telemetry Stream */}
        <div className="bg-dev-surface border border-dev-border rounded-lg p-4 flex flex-col h-[280px]">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-dev-border text-xs font-mono text-dev-muted">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-dev-green" />
              <span>TERMINAL TELEMETRY</span>
            </div>
            <span className="text-[10px] text-dev-green">LIVE</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 text-[11px] font-mono scrollbar-none pr-1">
            {logs.slice(-8).map((log) => (
              <div key={log.id} className="flex items-start gap-1.5 text-zinc-400 leading-tight">
                <span className="text-dev-muted select-none">[{log.timestamp}]</span>
                <span className={
                  log.type === 'SUCCESS' ? 'text-dev-green' :
                  log.type === 'WARN' ? 'text-dev-amber' :
                  log.type === 'ERROR' ? 'text-rose-400' :
                  log.type === 'COMMAND' ? 'text-dev-cyan font-bold' : 'text-zinc-300'
                }>
                  {log.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
