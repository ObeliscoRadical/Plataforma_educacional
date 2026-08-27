import React, { useState, useEffect } from 'react';
import { useTerminal } from '../../context/TerminalContext.js';
import { api } from '../../api/client.js';
import { LessonDetail } from '../../types/index.js';
import { 
  Terminal, Play, RotateCcw, CheckCircle2, 
  XCircle, Bot, Code2, Eye, Sparkles, Check
} from 'lucide-react';

export const CodeLab: React.FC = () => {
  const { currentLessonId, setMentorOpen, addLog } = useTerminal();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [code, setCode] = useState<string>('// Carregando exercício do laboratório...');
  const [logs, setLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'TESTS' | 'PREVIEW'>('TESTS');

  useEffect(() => {
    async function loadExercise() {
      if (!currentLessonId) return;
      try {
        const res = await api.getLessonDetails(currentLessonId);
        setLesson(res.lesson);
        if (res.lesson.exercise) {
          setCode(res.lesson.exercise.initial_code || '// Implemente sua solução aqui');
          setTestResults(res.lesson.exercise.testCases.map((tc: any) => ({ name: tc.name, pending: true })));
        } else {
          setCode('// Demonstração livre no terminal sandbox\nfunction helloWorld() {\n  console.log("Developer OS Kernel ready.");\n  return true;\n}\nhelloWorld();');
        }
      } catch (err: any) {
        addLog(`CodeLab load error: ${err.message}`, 'ERROR');
      }
    }
    loadExercise();
  }, [currentLessonId]);

  const handleRunTests = async () => {
    setIsRunning(true);
    setSubmissionFeedback(null);
    addLog(`Running sandbox execution suite...`, 'COMMAND');

    try {
      const testCases = lesson?.exercise?.testCases || [];
      const res = await api.runSandbox(code, testCases);
      setLogs(res.logs || [res.output]);
      setTestResults(res.testResults || []);

      if (res.success) {
        addLog(`Sandbox execution: 100% tests passed!`, 'SUCCESS');
      } else {
        addLog(`Sandbox execution: ${res.passedCount}/${res.totalCount} tests passed.`, 'WARN');
      }
      setActiveTab('TESTS');
    } catch (err: any) {
      setLogs([`Runtime error: ${err.message}`]);
      addLog(`Execution error: ${err.message}`, 'ERROR');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitSolution = async () => {
    if (!lesson || !lesson.exercise) return;
    setIsSubmitting(true);

    try {
      const res = await api.submitExercise(lesson.id, {
        exerciseId: lesson.exercise.id,
        code,
        testCases: lesson.exercise.testCases,
        hintsUsed: 0,
        maxHintLevel: 1
      });

      setSubmissionFeedback(res);
      setTestResults(res.execution.testResults || []);
      setLogs(res.execution.logs || []);

      if (res.progress.lessonCompleted) {
        addLog(`Lesson ${lesson.code} fully MASTERED and COMPLETED!`, 'SUCCESS');
      } else if (res.execution.success) {
        addLog(`Exercise passed. Complete quiz to finalize mastery.`, 'INFO');
      } else {
        addLog(`Submission failed test cases. Mentor guidance suggested.`, 'WARN');
      }
    } catch (err: any) {
      addLog(`Submission failed: ${err.message}`, 'ERROR');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetCode = () => {
    if (lesson?.exercise) {
      setCode(lesson.exercise.initial_code);
      setTestResults(lesson.exercise.testCases.map((tc: any) => ({ name: tc.name, pending: true })));
      setSubmissionFeedback(null);
      addLog('Editor code reset to initial template.', 'INFO');
    }
  };

  return (
    <div className="space-y-4">
      {/* CodeLab Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-dev-surface border border-dev-border rounded-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-dev-green mb-1">
            <Code2 className="w-4 h-4" />
            <span>CODE LAB // INTERACTIVE SANDBOX</span>
          </div>
          <h2 className="text-sm font-bold font-mono text-white">
            {lesson?.exercise?.title || lesson?.title || 'Laboratório de Código'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCode}
            className="p-2 rounded bg-dev-bg border border-dev-border text-dev-muted hover:text-white transition-colors"
            title="Resetar Código"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setMentorOpen(true)}
            className="px-3 py-1.5 rounded bg-dev-cyan/10 border border-dev-cyan/30 text-dev-cyan font-mono font-semibold text-xs hover:bg-dev-cyan/20 transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>PEDIR DICA</span>
          </button>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-4 py-1.5 rounded bg-dev-surfaceHover border border-dev-green/40 text-dev-green font-mono font-bold text-xs hover:bg-dev-green/10 transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isRunning ? 'EXECUTING...' : '[ RUN TESTS ]'}</span>
          </button>

          <button
            onClick={handleSubmitSolution}
            disabled={isSubmitting}
            className="px-4 py-1.5 rounded bg-dev-green text-black font-mono font-bold text-xs hover:bg-dev-greenDim transition-colors shadow-glow-green flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>{isSubmitting ? 'EVALUATING...' : '[ SUBMIT SOLUTION ]'}</span>
          </button>
        </div>
      </div>

      {/* Submission Feedback Banner */}
      {submissionFeedback && (
        <div className={`p-4 rounded-lg border text-xs font-mono flex items-center justify-between ${
          submissionFeedback.execution?.success
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <div>
            <strong>{submissionFeedback.execution?.success ? '✓ AVALIAÇÃO CONCLUÍDA: ' : '[×] REVISÃO NECESSÁRIA: '}</strong>
            {submissionFeedback.progress?.message}
          </div>
          {submissionFeedback.progress?.lessonCompleted && (
            <span className="px-2.5 py-1 rounded bg-dev-green text-black font-bold uppercase text-[10px]">
              MASTERED
            </span>
          )}
        </div>
      )}

      {/* Main Split: Top (Editor | Preview) & Bottom (Terminal Output) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Panel 1: Code Editor (7 cols) */}
        <div className="lg:col-span-7 bg-dev-surface border border-dev-border rounded-lg overflow-hidden flex flex-col h-[480px]">
          <div className="flex items-center justify-between px-4 py-2 bg-dev-bg border-b border-dev-border text-xs font-mono text-dev-muted">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-dev-green"></span>
              <span className="text-dev-text font-bold">solution.js</span>
            </div>
            <span>JavaScript (ES2022)</span>
          </div>

          <div className="flex-1 relative font-mono text-xs p-4 bg-[#0c0d14] overflow-auto">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent text-dev-text font-mono text-xs resize-none outline-none leading-relaxed selection:bg-dev-green selection:text-black"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Panel 2: Live HTML/DOM Preview or Exercise Brief (5 cols) */}
        <div className="lg:col-span-5 bg-dev-surface border border-dev-border rounded-lg overflow-hidden flex flex-col h-[480px]">
          <div className="flex items-center justify-between px-4 py-2 bg-dev-bg border-b border-dev-border text-xs font-mono text-dev-muted">
            <div className="flex items-center gap-2">
              <Eye className="w-3.5 h-3.5 text-dev-cyan" />
              <span className="text-dev-cyan font-bold">SPEC & REQUISITOS</span>
            </div>
            <span>TIER 1 LAB</span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-mono text-zinc-300">
            <div>
              <div className="text-dev-green font-bold mb-1">// ENUNCIADO DO DESAFIO</div>
              <p className="leading-relaxed">
                {lesson?.exercise?.description || 'Implemente os requisitos técnicos descritos na lição.'}
              </p>
            </div>

            {/* Test Cases Checklist */}
            {testResults.length > 0 && (
              <div>
                <div className="text-dev-cyan font-bold mb-2">// CRITÉRIOS DE TESTE</div>
                <div className="space-y-1.5">
                  {testResults.map((tc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-dev-bg border border-dev-border text-[11px]">
                      <div className="flex items-center gap-2">
                        {tc.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-dev-green shrink-0" />
                        ) : tc.pending ? (
                          <span className="w-3.5 h-3.5 rounded-full border border-dev-muted inline-block shrink-0"></span>
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        )}
                        <span className={tc.passed ? 'text-white' : 'text-zinc-400'}>{tc.name}</span>
                      </div>
                      {tc.durationMs !== undefined && (
                        <span className="text-dev-muted text-[10px]">{tc.durationMs}ms</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Panel 3: Terminal Console Output Bar */}
      <div className="bg-dev-surface border border-dev-border rounded-lg overflow-hidden flex flex-col h-[200px]">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-dev-bg border-b border-dev-border text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-dev-green" />
              <span className="text-dev-green font-bold">TERMINAL OUTPUT</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('TESTS')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  activeTab === 'TESTS' ? 'bg-dev-green/10 text-dev-green border border-dev-green/30' : 'text-dev-muted hover:text-dev-text'
                }`}
              >
                TESTS ({testResults.filter(t => t.passed).length}/{testResults.length})
              </button>
              <button
                onClick={() => setActiveTab('CONSOLE')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  activeTab === 'CONSOLE' ? 'bg-dev-green/10 text-dev-green border border-dev-green/30' : 'text-dev-muted hover:text-dev-text'
                }`}
              >
                STDOUT LOGS
              </button>
            </div>
          </div>

          <span className="text-[10px] text-dev-muted">ISOLATED VM SANDBOX</span>
        </div>

        {/* Console Log Area */}
        <div className="flex-1 p-3 bg-dev-bg font-mono text-xs text-zinc-300 overflow-y-auto space-y-1">
          {activeTab === 'TESTS' ? (
            testResults.length === 0 ? (
              <div className="text-dev-muted">Nenhum teste executado ainda. Clique em [ RUN TESTS ].</div>
            ) : (
              testResults.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {t.passed ? (
                    <span className="text-dev-green font-bold">[✓ PASS]</span>
                  ) : t.pending ? (
                    <span className="text-dev-muted font-bold">[· WAIT]</span>
                  ) : (
                    <span className="text-rose-400 font-bold">[× FAIL]</span>
                  )}
                  <span>{t.name}</span>
                  {t.error && <span className="text-rose-400">({t.error})</span>}
                </div>
              ))
            )
          ) : (
            logs.length === 0 ? (
              <div className="text-dev-muted">Console vazio. Saídas de console.log aparecerão aqui.</div>
            ) : (
              logs.map((line, i) => (
                <div key={i} className="text-zinc-300">
                  {line}
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
