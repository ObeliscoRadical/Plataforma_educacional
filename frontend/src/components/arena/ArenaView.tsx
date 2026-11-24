import React, { useState, useEffect, useRef } from 'react';
import { useTerminal } from '../../context/TerminalContext.js';
import { api } from '../../api/client.js';
import { 
  Zap, Flame, Trophy, Play, RotateCcw, CheckCircle2, 
  AlertCircle, Timer, Award, Sparkles, ChevronRight, CornerDownLeft
} from 'lucide-react';

interface BlitzDrill {
  id: string;
  title: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  timeLimitSec: number;
  prompt: string;
  starterCode: string;
  testCases: { name: string; assertion: string }[];
  xp: number;
}

const BLITZ_DRILLS: BlitzDrill[] = [
  {
    id: 'drill_1',
    title: 'Inversor de String Relâmpago',
    category: 'ALGORITMOS',
    difficulty: 'EASY',
    timeLimitSec: 45,
    prompt: 'Implemente a função reverseString(str) que recebe uma string e retorna seus caracteres na ordem inversa.',
    starterCode: 'function reverseString(str) {\n  // Retorne a string invertida:\n  return str.split("").reverse().join("");\n}',
    testCases: [
      { name: 'Deve inverter "dev" para "ved"', assertion: 'reverseString("dev") === "ved"' },
      { name: 'Deve inverter "radar" para "radar"', assertion: 'reverseString("radar") === "radar"' }
    ],
    xp: 50
  },
  {
    id: 'drill_2',
    title: 'Filtro de Números Pares',
    category: 'ARRAYS',
    difficulty: 'EASY',
    timeLimitSec: 45,
    prompt: 'Implemente getEvens(numbers) que recebe um array de inteiros e retorna apenas os números pares.',
    starterCode: 'function getEvens(numbers) {\n  // Filtre apenas os pares:\n  return numbers.filter(n => n % 2 === 0);\n}',
    testCases: [
      { name: 'Deve filtrar [1, 2, 3, 4, 5, 6]', assertion: 'JSON.stringify(getEvens([1, 2, 3, 4, 5, 6])) === JSON.stringify([2, 4, 6])' }
    ],
    xp: 60
  },
  {
    id: 'drill_3',
    title: 'Detector de Palíndromo',
    category: 'LÓGICA',
    difficulty: 'MEDIUM',
    timeLimitSec: 60,
    prompt: 'Implemente isPalindrome(str) que retorna true se a palavra for idêntica lida de trás para frente (ignore maiúsculas/minúsculas).',
    starterCode: 'function isPalindrome(str) {\n  const clean = str.toLowerCase();\n  return clean === clean.split("").reverse().join("");\n}',
    testCases: [
      { name: 'Deve validar "arara"', assertion: 'isPalindrome("arara") === true' },
      { name: 'Deve invalidar "codigo"', assertion: 'isPalindrome("codigo") === false' }
    ],
    xp: 75
  },
  {
    id: 'drill_4',
    title: 'Fatorial de Alta Velocidade',
    category: 'MATEMÁTICA & RECURSÃO',
    difficulty: 'MEDIUM',
    timeLimitSec: 60,
    prompt: 'Implemente factorial(n) que calcula o fatorial de um número inteiro não-negativo.',
    starterCode: 'function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}',
    testCases: [
      { name: 'Fatorial de 5 deve ser 120', assertion: 'factorial(5) === 120' },
      { name: 'Fatorial de 0 deve ser 1', assertion: 'factorial(0) === 1' }
    ],
    xp: 80
  }
];

export const ArenaView: React.FC = () => {
  const { addLog } = useTerminal();
  const [activeDrillIndex, setActiveDrillIndex] = useState<number>(0);
  const [code, setCode] = useState<string>(BLITZ_DRILLS[0].starterCode);
  const [timeLeft, setTimeLeft] = useState<number>(BLITZ_DRILLS[0].timeLimitSec);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [combo, setCombo] = useState<number>(1);
  const [totalScore, setTotalScore] = useState<number>(350);
  const [drillSuccess, setDrillSuccess] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);
  const [execResult, setExecResult] = useState<any>(null);

  const activeDrill = BLITZ_DRILLS[activeDrillIndex] || BLITZ_DRILLS[0];
  const timerRef = useRef<any>(null);

  useEffect(() => {
    setCode(activeDrill.starterCode);
    setTimeLeft(activeDrill.timeLimitSec);
    setIsRunning(false);
    setDrillSuccess(false);
    setExecResult(null);
  }, [activeDrillIndex]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            addLog(`Tempo esgotado no desafio ${activeDrill.title}!`, 'WARN');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft]);

  const handleStartDrill = () => {
    setIsRunning(true);
    setDrillSuccess(false);
    setExecResult(null);
    addLog(`Desafio Blitz iniciado: ${activeDrill.title} (${timeLeft}s)`, 'INFO');
  };

  const handleRunAndValidate = async () => {
    if (executing || !code.trim()) return;
    try {
      setExecuting(true);
      const res = await api.runSandbox(code, activeDrill.testCases);
      setExecResult(res);

      if (res.success) {
        setDrillSuccess(true);
        setIsRunning(false);
        const earnedXP = activeDrill.xp * combo;
        setTotalScore(prev => prev + earnedXP);
        setCombo(prev => Math.min(5, prev + 1));
        addLog(`VITÓRIA NA ARENA! +${earnedXP} XP (${combo}x COMBO)!`, 'SUCCESS');

        // Voice speech praise
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance(`Sensacional! Desafio blitz concluído com sucesso. Mais ${earnedXP} pontos de experiência para o seu perfil!`);
          u.lang = 'pt-BR';
          window.speechSynthesis.speak(u);
        }
      } else {
        setCombo(1);
        addLog('Falha nos testes do blitz. Ajuste o código e execute novamente!', 'WARN');
      }
    } catch (err: any) {
      addLog(`Erro de sandbox: ${err.message}`, 'ERROR');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Arena Header Bar */}
      <div className="bg-dev-surface border border-dev-border rounded-lg p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-dev-border">
          <div>
            <div className="flex items-center gap-2 text-xs text-dev-green mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>ARENA DE SPEED CODING // DOPAMINA DIÁRIA</span>
            </div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Desafios Relâmpago de 60 Segundos</span>
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                BLITZ MODE
              </span>
            </h1>
          </div>

          {/* Stats Bar (Score & Streak) */}
          <div className="flex items-center gap-3">
            <div className="p-2 px-3 rounded bg-dev-bg border border-dev-border text-xs flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>SCORE: <strong className="text-white">{totalScore} XP</strong></span>
            </div>
            <div className={`p-2 px-3 rounded text-xs flex items-center gap-2 border ${
              combo > 1 ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold animate-pulse' : 'bg-dev-bg border-dev-border text-dev-muted'
            }`}>
              <Flame className="w-4 h-4 text-rose-400" />
              <span>{combo}x COMBO</span>
            </div>
          </div>
        </div>

        {/* Drill Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {BLITZ_DRILLS.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => setActiveDrillIndex(idx)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                activeDrillIndex === idx
                  ? 'border-dev-green bg-dev-green/10 text-dev-green font-bold'
                  : 'border-dev-border bg-dev-bg hover:bg-dev-surface text-zinc-400'
              }`}
            >
              <div className="text-[10px] text-amber-400 font-bold">DRILL #{idx + 1}</div>
              <div className="text-[11px] text-white truncate">{d.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Blitz Arena Stage */}
      <div className="bg-[#08090d] border border-dev-border rounded-lg p-5 space-y-4 shadow-terminal">
        {/* Stage Top Bar: Timer & Prompt */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-dev-border">
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{activeDrill.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-dev-cyan/20 text-dev-cyan font-bold">
                {activeDrill.category}
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-1">{activeDrill.prompt}</p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-bold ${
              timeLeft <= 10 && isRunning
                ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-ping'
                : 'bg-black border-dev-border text-dev-green'
            }`}>
              <Timer className="w-4 h-4" />
              <span>{timeLeft}s</span>
            </div>

            {!isRunning && !drillSuccess && (
              <button
                onClick={handleStartDrill}
                className="px-4 py-1.5 rounded bg-dev-green text-dev-bg font-bold text-xs hover:bg-dev-greenDim transition-all flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>INICIAR CRONÔMETRO</span>
              </button>
            )}
          </div>
        </div>

        {/* Code Editor */}
        <div className="space-y-2">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={9}
            className="w-full p-4 rounded-lg bg-black border border-dev-cyan/50 text-xs text-dev-green focus:border-dev-green focus:ring-1 focus:ring-dev-green outline-none resize-none leading-relaxed shadow-terminal"
          />
        </div>

        {/* Action Trigger */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-dev-muted flex items-center gap-1">
            <CornerDownLeft className="w-3.5 h-3.5" /> Clique para validar e acumular XP
          </span>

          <button
            onClick={handleRunAndValidate}
            disabled={executing || !code.trim()}
            className={`px-6 py-2.5 rounded font-bold text-xs transition-all shadow-terminal flex items-center gap-2 ${
              drillSuccess
                ? 'bg-emerald-500 text-dev-bg hover:bg-emerald-400'
                : 'bg-dev-green text-dev-bg hover:bg-dev-greenDim'
            }`}
          >
            {executing ? (
              <>
                <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                <span>AVALIANDO ALGORITMO...</span>
              </>
            ) : drillSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>[ DESAFIO VENCIDO! +{activeDrill.xp * combo} XP ]</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>[ VALIDAR & GANHAR XP ]</span>
              </>
            )}
          </button>
        </div>

        {/* Live Execution Feedback Pane */}
        {execResult && (
          <div className={`p-3.5 rounded-lg border text-xs ${
            execResult.success
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}>
            <div className="flex items-center justify-between font-bold pb-1 mb-1 border-b border-current/20">
              <span className="flex items-center gap-1">
                {execResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                {execResult.success ? 'PARABÉNS! TODOS OS CASOS DE TESTE PASSARAM' : 'ATENÇÃO: FALHA NOS TESTES'}
              </span>
              <span>Latência: {execResult.durationMs || 10}ms</span>
            </div>

            {execResult.testResults && (
              <div className="mt-1 space-y-1">
                {execResult.testResults.map((tr: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span>{tr.name}</span>
                    <span className={tr.passed ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {tr.passed ? '✓ PASS' : '✗ FAIL'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
