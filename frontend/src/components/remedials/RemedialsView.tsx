import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { useTerminal } from '../../context/TerminalContext.js';
import { RemedialLesson } from '../../types/index.js';
import { Wrench, CheckCircle2, Play, Code2, AlertTriangle } from 'lucide-react';

export const RemedialsView: React.FC = () => {
  const { addLog } = useTerminal();
  const [remedials, setRemedials] = useState<RemedialLesson[]>([]);
  const [activeRemedial, setActiveRemedial] = useState<RemedialLesson | null>(null);
  const [microCode, setMicroCode] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRemedials();
  }, []);

  const loadRemedials = async () => {
    try {
      const res = await api.getRemedials();
      setRemedials(res.remedials || []);
      if (res.remedials && res.remedials.length > 0) {
        setActiveRemedial(res.remedials[0]);
        setMicroCode(res.remedials[0].microExercise?.initialCode || '');
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRemedial = (rem: RemedialLesson) => {
    setActiveRemedial(rem);
    setMicroCode(rem.microExercise?.initialCode || '');
    setTestResult(null);
  };

  const handleRunMicroTest = async () => {
    if (!activeRemedial) return;
    try {
      const testCases = activeRemedial.microExercise?.testCases || [];
      const res = await api.runSandbox(microCode, testCases);
      setTestResult(res);

      if (res.success) {
        await api.completeRemedial(activeRemedial.id);
        addLog(`Remedial for ${activeRemedial.skill_code} COMPLETED! Proficiency restored.`, 'SUCCESS');
        await loadRemedials();
      }
    } catch (err: any) {
      addLog(`Micro test error: ${err.message}`, 'ERROR');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-dev-green font-mono text-sm">
        <span className="inline-block w-2 h-4 bg-dev-green mr-2 animate-blink-slow"></span>
        Inspecionando fila de reforços adaptativos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Remedials Header */}
      <div className="bg-dev-surface border border-dev-border rounded-lg p-5">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
          <Wrench className="w-4 h-4" />
          <span>ADAPTIVE LEARNING ENGINE // REMEDIAL MICRO-LESSONS</span>
        </div>
        <h1 className="text-lg font-bold font-mono text-white">
          Microaulas de Recuperação & Reforço
        </h1>
        <p className="text-xs font-mono text-dev-muted mt-1">
          Geradas automaticamente pelo Mentor IA quando uma competência entra em estado FRAGILE para restaurar seu domínio.
        </p>
      </div>

      {remedials.length === 0 ? (
        <div className="bg-dev-surface border border-dev-border rounded-lg p-8 text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-dev-green mx-auto" />
          <div className="text-sm font-mono font-bold text-white">Nenhum Reforço Pendente!</div>
          <div className="text-xs font-mono text-dev-muted">
            Todas as suas competências operam em nível seguro (ASSISTED / MASTERED).
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Remedial Queue (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            {remedials.map((rem) => {
              const isSelected = activeRemedial?.id === rem.id;
              const isDone = rem.status === 'COMPLETED';

              return (
                <div
                  key={rem.id}
                  onClick={() => handleSelectRemedial(rem)}
                  className={`p-3 rounded-lg border cursor-pointer font-mono text-xs transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-amber-500/10'
                      : isDone
                      ? 'border-dev-border/50 bg-dev-surface/40 opacity-70'
                      : 'border-dev-border bg-dev-surface hover:bg-dev-surfaceHover'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-dev-cyan font-bold">[{rem.skill_code}]</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {rem.status}
                    </span>
                  </div>
                  <div className="text-white font-medium">{rem.title}</div>
                  <div className="text-[11px] text-dev-muted mt-1">{rem.reason}</div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Remedial Content & Micro Exercise (7 cols) */}
          <div className="lg:col-span-7 bg-dev-surface border border-dev-border rounded-lg p-5 space-y-4">
            {activeRemedial && (
              <>
                <div className="pb-3 border-b border-dev-border">
                  <h3 className="text-sm font-bold font-mono text-white mb-1">
                    {activeRemedial.title}
                  </h3>
                  <div className="text-xs font-mono text-zinc-300 whitespace-pre-wrap bg-dev-bg p-3 rounded border border-dev-border">
                    {activeRemedial.content_markdown}
                  </div>
                </div>

                {/* Micro Exercise */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="text-dev-green font-bold flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>MICRO EXERCÍCIO DE RECUPERAÇÃO:</span>
                  </div>
                  <p className="text-dev-muted text-[11px]">
                    {activeRemedial.microExercise?.description}
                  </p>

                  <div className="p-3 bg-dev-bg border border-dev-border rounded overflow-hidden">
                    <textarea
                      value={microCode}
                      onChange={(e) => setMicroCode(e.target.value)}
                      className="w-full h-36 bg-transparent text-dev-text font-mono text-xs outline-none resize-none leading-relaxed"
                      spellCheck={false}
                    />
                  </div>

                  {testResult && (
                    <div className={`p-3 rounded text-xs font-mono ${
                      testResult.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {testResult.success ? '✓ Micro-exercício validado! Competência restaurada para status seguro.' : '× Testes falharam. Ajuste a solução defensiva.'}
                    </div>
                  )}

                  <button
                    onClick={handleRunMicroTest}
                    className="w-full py-2.5 bg-amber-400 text-black font-mono font-bold text-xs rounded hover:bg-amber-500 transition-colors shadow-glow-amber flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>[ EXECUTAR VALIDAÇÃO DE RECUPERAÇÃO ]</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
