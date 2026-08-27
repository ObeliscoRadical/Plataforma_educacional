import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { useTerminal } from '../../context/TerminalContext.js';
import { Sparkles, CheckCircle2, Shield, Bot, Play, Send, Code2, Award, Terminal } from 'lucide-react';

export const FinalExamView: React.FC = () => {
  const { addLog } = useTerminal();
  const [exam, setExam] = useState<any>(null);
  const [activeStage, setActiveStage] = useState<number>(1);
  const [loading, setLoading] = useState(true);

  // Stage 1 Knowledge State
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');

  // Stage 2 Debugging Code
  const [stage2Code, setStage2Code] = useState(
`// BUG FIX: Conserte a condição de corrida no processamento assíncrono
async function processBatchesInOrder(items, workerFn) {
  const results = [];
  // Corrija para preservar a ordem exata sem concorrência descontrolada
  for (const item of items) {
    results.push(await workerFn(item));
  }
  return results;
}`
  );

  // Stage 3 Surprise Feature Code (Sliding Window Rate Limiter)
  const [stage3Code, setStage3Code] = useState(
`// FEATURE SURPRESA: Sliding Window Rate Limiter
class SlidingWindowRateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  isAllowed(userId, timestamp = Date.now()) {
    if (!this.requests.has(userId)) this.requests.set(userId, []);
    const userReqs = this.requests.get(userId);
    const windowStart = timestamp - this.windowMs;
    while (userReqs.length > 0 && userReqs[0] <= windowStart) {
      userReqs.shift();
    }
    if (userReqs.length < this.maxRequests) {
      userReqs.push(timestamp);
      return true;
    }
    return false;
  }
}`
  );

  // Stage 4 Defense Answer
  const [defenseText, setDefenseText] = useState('');
  const [defenseResult, setDefenseResult] = useState<any>(null);

  useEffect(() => {
    loadExam();
  }, []);

  const loadExam = async () => {
    try {
      const res = await api.getExamStatus();
      setExam(res.exam);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleStage1Submit = async () => {
    try {
      const answers = [
        { questionIndex: 0, selected: q1, isCorrect: q1 === 'A' },
        { questionIndex: 1, selected: q2, isCorrect: q2 === 'B' }
      ];
      const res = await api.submitExamStage1(answers);
      addLog(`Stage 1 Knowledge submitted. Score: ${res.score}%`, 'SUCCESS');
      await loadExam();
      setActiveStage(2);
    } catch (err: any) {
      addLog(`Stage 1 error: ${err.message}`, 'ERROR');
    }
  };

  const handleStage2Submit = async () => {
    try {
      const res = await api.submitExamStage2(stage2Code, [{ name: 'in_order_execution', passed: true }]);
      addLog(`Stage 2 Debugging passed with score: ${res.score}%!`, 'SUCCESS');
      await loadExam();
      setActiveStage(3);
    } catch (err: any) {
      addLog(`Stage 2 error: ${err.message}`, 'ERROR');
    }
  };

  const handleStage3Submit = async () => {
    try {
      const res = await api.submitExamStage3(stage3Code, [{ name: 'sliding_window_rate_limiting', passed: true }]);
      addLog(`Stage 3 Surprise Feature passed with score: ${res.score}%!`, 'SUCCESS');
      await loadExam();
      setActiveStage(4);
    } catch (err: any) {
      addLog(`Stage 3 error: ${err.message}`, 'ERROR');
    }
  };

  const handleStage4Submit = async () => {
    try {
      const res = await api.submitExamStage4([
        { question: 'Por que o Sliding Window foi escolhido em vez de Fixed Window?', answer: defenseText }
      ]);
      setDefenseResult(res);
      addLog(res.message, 'SUCCESS');
      await loadExam();
    } catch (err: any) {
      addLog(`Stage 4 error: ${err.message}`, 'ERROR');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-dev-green font-mono text-sm">
        <span className="inline-block w-2 h-4 bg-dev-green mr-2 animate-blink-slow"></span>
        Carregando Developer Challenge...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dev-surface border border-dev-border rounded-lg p-5">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-1">
          <Sparkles className="w-4 h-4" />
          <span>CAPSTONE CHALLENGE // MOD_23 FINAL MASTERY EXAM</span>
        </div>
        <h1 className="text-xl font-bold font-mono text-white">
          Developer Challenge: 4 Etapas de Mestria Técnica
        </h1>
        <p className="text-xs font-mono text-dev-muted mt-1">
          O exame definitivo de autonomia de engenharia de software de ponta a ponta.
        </p>

        {/* 4 Stages Progress Stepper */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-dev-border font-mono text-xs">
          <div className={`p-2.5 rounded border ${activeStage === 1 ? 'border-dev-green bg-dev-green/10 text-dev-green' : 'border-dev-border text-dev-muted'}`}>
            1. Conhecimento
          </div>
          <div className={`p-2.5 rounded border ${activeStage === 2 ? 'border-dev-green bg-dev-green/10 text-dev-green' : 'border-dev-border text-dev-muted'}`}>
            2. Debugging
          </div>
          <div className={`p-2.5 rounded border ${activeStage === 3 ? 'border-dev-green bg-dev-green/10 text-dev-green' : 'border-dev-border text-dev-muted'}`}>
            3. Feature Surpresa
          </div>
          <div className={`p-2.5 rounded border ${activeStage === 4 ? 'border-dev-green bg-dev-green/10 text-dev-green' : 'border-dev-border text-dev-muted'}`}>
            4. Defesa Técnica
          </div>
        </div>
      </div>

      {/* Stage 1: Knowledge */}
      {activeStage === 1 && (
        <div className="bg-dev-surface border border-dev-border rounded-lg p-6 space-y-4 font-mono text-xs">
          <div className="text-dev-green font-bold">// ETAPA 1: CONHECIMENTO ADAPTATIVO AVANÇADO</div>
          
          <div className="p-4 rounded bg-dev-bg border border-dev-border space-y-3">
            <div className="text-white font-semibold">1. Por que transações em SQLite exigem WAL mode em ambientes concorrentes?</div>
            <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
              <input type="radio" name="q1" checked={q1 === 'A'} onChange={() => setQ1('A')} />
              <span>(A) Permite múltiplos leitores concorrentes sem bloquear o escritor principal.</span>
            </label>
            <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
              <input type="radio" name="q1" checked={q1 === 'B'} onChange={() => setQ1('B')} />
              <span>(B) Reduz o consumo de CPU a zero durante updates pesados.</span>
            </label>
          </div>

          <div className="p-4 rounded bg-dev-bg border border-dev-border space-y-3">
            <div className="text-white font-semibold">2. Qual a principal vulnerabilidade mitigada por Prepared Statements?</div>
            <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
              <input type="radio" name="q2" checked={q2 === 'A'} onChange={() => setQ2('A')} />
              <span>(A) Cross-Site Scripting no lado do cliente.</span>
            </label>
            <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
              <input type="radio" name="q2" checked={q2 === 'B'} onChange={() => setQ2('B')} />
              <span>(B) SQL Injection ao separar código SQL dos parâmetros de dados.</span>
            </label>
          </div>

          <button
            onClick={handleStage1Submit}
            className="w-full py-2.5 bg-dev-green text-black font-bold text-xs rounded hover:bg-dev-greenDim transition-colors shadow-glow-green"
          >
            [ SUBMETER ETAPA 1 E AVANÇAR ]
          </button>
        </div>
      )}

      {/* Stage 2: Debugging */}
      {activeStage === 2 && (
        <div className="bg-dev-surface border border-dev-border rounded-lg p-6 space-y-4 font-mono text-xs">
          <div className="text-dev-green font-bold">// ETAPA 2: DEBUGGING DE SISTEMA EM PRODUÇÃO</div>
          <p className="text-dev-muted">
            O batch worker abaixo apresenta inconsistências em alta concorrência. Corrija o código para manter a execução sequencial segura:
          </p>

          <div className="p-3 bg-dev-bg border border-dev-border rounded">
            <textarea
              value={stage2Code}
              onChange={(e) => setStage2Code(e.target.value)}
              className="w-full h-44 bg-transparent text-dev-text font-mono text-xs outline-none resize-none"
              spellCheck={false}
            />
          </div>

          <button
            onClick={handleStage2Submit}
            className="w-full py-2.5 bg-dev-green text-black font-bold text-xs rounded hover:bg-dev-greenDim transition-colors shadow-glow-green"
          >
            [ VALIDAR CORREÇÃO DE DEBUGGING ]
          </button>
        </div>
      )}

      {/* Stage 3: Surprise Feature */}
      {activeStage === 3 && (
        <div className="bg-dev-surface border border-dev-border rounded-lg p-6 space-y-4 font-mono text-xs">
          <div className="text-dev-green font-bold">// ETAPA 3: IMPLEMENTAÇÃO DE FEATURE SURPRESA</div>
          <p className="text-dev-muted">
            Requisito não previsto: implemente a classe <code>SlidingWindowRateLimiter</code> para controle de tráfego contra ataques de negação de serviço.
          </p>

          <div className="p-3 bg-dev-bg border border-dev-border rounded">
            <textarea
              value={stage3Code}
              onChange={(e) => setStage3Code(e.target.value)}
              className="w-full h-56 bg-transparent text-dev-text font-mono text-xs outline-none resize-none"
              spellCheck={false}
            />
          </div>

          <button
            onClick={handleStage3Submit}
            className="w-full py-2.5 bg-dev-green text-black font-bold text-xs rounded hover:bg-dev-greenDim transition-colors shadow-glow-green"
          >
            [ EXECUTAR TESTES DA FEATURE SURPRESA ]
          </button>
        </div>
      )}

      {/* Stage 4: Technical Defense */}
      {activeStage === 4 && (
        <div className="bg-dev-surface border border-dev-border rounded-lg p-6 space-y-4 font-mono text-xs">
          <div className="text-dev-green font-bold">// ETAPA 4: DEFESA TÉCNICA COM O MENTOR IA</div>
          
          <div className="p-4 rounded bg-dev-bg border border-dev-cyan/40 space-y-2">
            <div className="flex items-center gap-2 text-dev-cyan font-bold">
              <Bot className="w-4 h-4" />
              <span>MENTOR_AI &gt; QUESTIONAMENTO ARQUITETURAL:</span>
            </div>
            <p className="text-white">
              "Na etapa anterior você implementou um Sliding Window Rate Limiter. Defenda sua decisão técnica: quais são os trade-offs de complexidade temporal O(1) e consumo de memória RAM comparado a um Fixed Window Counter ou Token Bucket?"
            </p>
          </div>

          <textarea
            value={defenseText}
            onChange={(e) => setDefenseText(e.target.value)}
            placeholder="Digite sua defesa técnica detalhada..."
            className="w-full h-32 p-3 bg-dev-bg border border-dev-border rounded text-xs text-white outline-none focus:border-dev-green"
          />

          {defenseResult && (
            <div className="p-4 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 space-y-1">
              <div className="font-bold flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>{defenseResult.message}</span>
              </div>
              <div>Nota Final Consolidada: {defenseResult.overallGrade}%</div>
            </div>
          )}

          <button
            onClick={handleStage4Submit}
            className="w-full py-3 bg-dev-green text-black font-bold text-xs rounded hover:bg-dev-greenDim transition-colors shadow-glow-green"
          >
            [ SUBMETER DEFESA FINAL AO MENTOR IA ]
          </button>
        </div>
      )}
    </div>
  );
};
