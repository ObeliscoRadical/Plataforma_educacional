import React, { useState, useEffect, useRef } from 'react';
import { useTerminal } from '../../context/TerminalContext.js';
import { api } from '../../api/client.js';
import { LessonDetail } from '../../types/index.js';
import { 
  Terminal, Play, Pause, RotateCcw, CheckCircle2, Code2, Bot, 
  HelpCircle, Video, ArrowRight, BookOpen, Volume2, VolumeX,
  FastForward, Maximize2, Sparkles, Layers, Mic, UserCheck,
  Check, ArrowUpRight, Monitor, Presentation, Lightbulb, PlayCircle,
  CornerDownLeft, Copy, AlertCircle, Bug, Wrench, ShieldCheck,
  RefreshCw, Award, ArrowDown, SkipForward, SkipBack, Eye, Layout
} from 'lucide-react';

export const LessonView: React.FC = () => {
  const { currentLessonId, setActiveView, setMentorOpen, addLog } = useTerminal();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoWatchedLocal, setVideoWatchedLocal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<'CONTENT' | 'VIDEO' | 'STEPPER' | 'DOM_PREVIEW' | 'DEBUG' | 'PRACTICE' | 'QUIZ'>('VIDEO');

  // Interactive Classroom State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [typedCodeLength, setTypedCodeLength] = useState(0);
  const [activeDiagram, setActiveDiagram] = useState<'MEMORY' | 'ARRAY_PIPELINE' | 'HTTP_RESTAURANT'>('MEMORY');
  
  // Student Hands-on Live Lab State (Mãos Dadas com o Mentor)
  const [studentCode, setStudentCode] = useState('');
  const [executingStudentCode, setExecutingStudentCode] = useState(false);
  const [studentExecResult, setStudentExecResult] = useState<any>(null);

  // 'Conserte o Bug do Estagiário' (Pair Debugging State)
  const [internCode, setInternCode] = useState('');
  const [internDebugSuccess, setInternDebugSuccess] = useState(false);
  const [internDebugLogs, setInternDebugLogs] = useState<string[]>([]);
  const [debuggingInProgress, setDebuggingInProgress] = useState(false);

  // Live Execution Stepper (Raio-X do Código Passo a Passo)
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [isAutoStepping, setIsAutoStepping] = useState(false);

  // Live DOM Sandbox State
  const [domHtml, setDomHtml] = useState('<div class="card">\n  <h2>🚀 Componente Vivo</h2>\n  <p>Edite o código ao lado e veja a interface atualizar no mesmo instante!</p>\n  <button onclick="alert(\'Olá do Developer OS!\')">Clique Aqui</button>\n</div>\n\n<style>\n  body { font-family: sans-serif; background: #0c0d12; color: #fff; padding: 20px; }\n  .card { background: #161822; border: 1px solid #00FF66; padding: 20px; border-radius: 8px; box-shadow: 0 0 15px rgba(0,255,102,0.15); }\n  h2 { color: #00FF66; margin-top: 0; }\n  button { background: #00FF66; color: #000; font-weight: bold; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }\n  button:hover { background: #00cc52; }\n</style>');

  const playbackIntervalRef = useRef<any>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    async function loadLesson() {
      if (!currentLessonId) return;
      try {
        setLoading(true);
        const res = await api.getLessonDetails(currentLessonId);
        setLesson(res.lesson);
        setVideoWatchedLocal(res.lesson.progress?.video_watched === 1);
        const initial = res.lesson.exercise?.initial_code || `// Escreva sua solução aqui acompanhando o Professor:\nfunction solution() {\n  return true;\n}`;
        setStudentCode(initial);

        // Intern bug default snippet tailored for the lesson
        const buggyInitial = `// Código do Estagiário (Com Bug de Execução)\nfunction processData(items) {\n  // BUG: O estagiário esqueceu de tratar itens nulos e errou a condição!\n  let total = 0;\n  for (let i = 0; i <= items.length; i++) {\n    total += items[i].value;\n  }\n  return total;\n}`;
        setInternCode(buggyInitial);
        setInternDebugLogs([
          '[FATAL RUNTIME ERROR] TypeError: Cannot read properties of undefined (reading "value")',
          '  at processData (intern_code.js:6:23)',
          '  at Object.<anonymous> (test_runner.js:12:5)',
          '  STATUS: ✗ FALHA EM PRODUÇÃO // Conserte o loop e adicione validação'
        ]);

        await api.startLesson(currentLessonId);
        addLog(`Lesson started: ${res.lesson.code} - ${res.lesson.title}`, 'INFO');
      } catch (err: any) {
        addLog(`Failed to load lesson: ${err.message}`, 'ERROR');
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [currentLessonId]);

  // Stepper Data definition for the code simulation
  const stepperSteps = [
    {
      line: 2,
      codeLine: 'function calculateTotal(items) {',
      explanation: 'Entrada na função. O ponteiro de instrução da CPU aloca o quadro de pilha (Stack Frame) para calculateTotal.',
      scopeVariables: { items: '[ { id: 1, val: 10 }, { id: 2, val: 25 }, { id: 3, val: 40 } ]', total: 'undefined', i: 'undefined' }
    },
    {
      line: 3,
      codeLine: '  let total = 0;',
      explanation: 'Declaração e inicialização da variável acumuladora na memória Stack com valor zero (0).',
      scopeVariables: { total: '0 [Number]', items: 'Array(3)', i: 'undefined' }
    },
    {
      line: 4,
      codeLine: '  for (let i = 0; i < items.length; i++) { // Iteração 1',
      explanation: 'Inicialização da variável de controle do loop: i = 0. Avaliação da condição: 0 < 3 (Verdadeiro).',
      scopeVariables: { i: '0 [Number]', total: '0 [Number]', 'items[0]': '{ val: 10 }' }
    },
    {
      line: 5,
      codeLine: '    total += items[i].val; // Somando items[0]',
      explanation: 'A CPU busca items[0].val (10) no Heap e soma ao total acumulado (0 + 10 = 10).',
      scopeVariables: { total: '10 [Number]', i: '0', 'items[0].val': '10' }
    },
    {
      line: 4,
      codeLine: '  for (let i = 0; i < items.length; i++) { // Iteração 2',
      explanation: 'Incremento de loop: i passa a ser 1. Avaliação da condição: 1 < 3 (Verdadeiro).',
      scopeVariables: { i: '1 [Number]', total: '10 [Number]', 'items[1]': '{ val: 25 }' }
    },
    {
      line: 5,
      codeLine: '    total += items[i].val; // Somando items[1]',
      explanation: 'A CPU busca items[1].val (25) no Heap e soma ao total (10 + 25 = 35).',
      scopeVariables: { total: '35 [Number]', i: '1', 'items[1].val': '25' }
    },
    {
      line: 4,
      codeLine: '  for (let i = 0; i < items.length; i++) { // Iteração 3',
      explanation: 'Incremento de loop: i passa a ser 2. Avaliação da condição: 2 < 3 (Verdadeiro).',
      scopeVariables: { i: '2 [Number]', total: '35 [Number]', 'items[2]': '{ val: 40 }' }
    },
    {
      line: 5,
      codeLine: '    total += items[i].val; // Somando items[2]',
      explanation: 'A CPU busca items[2].val (40) no Heap e soma ao total (35 + 40 = 75).',
      scopeVariables: { total: '75 [Number]', i: '2', 'items[2].val': '40' }
    },
    {
      line: 4,
      codeLine: '  for (let i = 0; i < items.length; i++) { // Fim do Loop',
      explanation: 'Incremento: i passa a 3. Avaliação da condição: 3 < 3 (Falso). O loop é finalizado.',
      scopeVariables: { i: '3 [Number]', total: '75 [Number]', status: 'Loop Concluído' }
    },
    {
      line: 7,
      codeLine: '  return total;',
      explanation: 'Retorno final do valor computado 75 para quem chamou a função. O Stack Frame é desalocado.',
      scopeVariables: { RETORNO_FINAL: '75 [Number]', status: '✓ Execução Concluída com Sucesso' }
    }
  ];

  // Auto-stepping timer
  useEffect(() => {
    let interval: any;
    if (isAutoStepping) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev >= stepperSteps.length - 1) {
            setIsAutoStepping(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isAutoStepping, stepperSteps.length]);

  const rawCodeSnippet = lesson?.exercise?.initial_code || `// Aula: ${lesson?.title || 'Arquitetura'}\nfunction executeSolution(input) {\n  // 1. Validação defensiva de dados\n  if (!input) throw new Error("Entrada inválida");\n  \n  // 2. Processamento e regras de negócio\n  const result = input.trim().toLowerCase();\n  console.log("[LOG] Processado com sucesso:", result);\n  \n  return { success: true, data: result };\n}`;

  const scenes = [
    {
      scene: 1,
      title: '1. O PROBLEMA NO QUADRO (Conceito e Modelos Mentais)',
      professorAction: 'Explicando no quadro os modelos visuais e a lógica central',
      professorStatus: 'EXPLICANDO',
      narration: `Olá! Bem-vindo à aula de ${lesson?.title || 'Engenharia de Software'}. Olhe agora para os diagramas no quadro: vamos entender exatamente como a memória e os dados fluem na máquina antes de digitar o código.`,
      boardNotes: [
        { label: 'OBJETIVO DA AULA', text: lesson?.content?.objective || 'Dominar os fundamentos e implementar a solução no Code Lab.' },
        { label: 'INVARIANTE', text: 'Código limpo, tipado e com tratamento de edge cases.' },
        { label: 'REGRA DE OURO', text: 'Entenda a arquitetura antes de escrever a primeira linha de código.' }
      ]
    },
    {
      scene: 2,
      title: '2. PROFESSOR AO VIVO (Codificando Passo a Passo)',
      professorAction: 'Digitando ao vivo no editor e explicando cada instrução',
      professorStatus: 'DIGITANDO',
      narration: `Observe agora no meu editor de código. Vou digitar a implementação passo a passo. Repare na validação inicial e em como a saída estruturada garante previsibilidade para o restante do sistema.`,
      codeToType: rawCodeSnippet,
      executionLogs: [
        '[DEBUG] Compilando módulo com TypeScript Strict...',
        '[KERNEL] Executando função de teste com payload de entrada...',
        '[STDOUT] Processado com sucesso: OK',
        '[TEST RUNNER] ✓ 3 de 3 casos de teste aprovados (Latência: 12ms)'
      ]
    },
    {
      scene: 3,
      title: '3. MÃOS DADAS COM O MENTOR (Digite e Teste ao Vivo)',
      professorAction: 'Acompanhando o aluno digitando no terminal ao vivo',
      professorStatus: 'LABORATÓRIO',
      narration: `Agora é a sua vez de digitar e experimentar! Escreva ou ajuste o código no seu editor preto abaixo e aperte Executar. O sistema vai validar instantaneamente seu código junto comigo!`,
      instructions: 'Escreva a implementação no editor de laboratório e clique no botão verde [ EXECUTAR MEU CÓDIGO ] ou aperte Enter.'
    },
    {
      scene: 4,
      title: '4. MISSÃO & PASSAGEM DE BASTÃO (Prática no Code Lab)',
      professorAction: 'Orientando os critérios de aprovação no laboratório',
      professorStatus: 'CONCLUINDO',
      narration: `Muito bem! Você acompanhou a teoria e experimentou a codificação ao vivo. Agora a responsabilidade é sua: avance para o Code Lab oficial e finalize todos os critérios de aprovação!`,
      summaryPoints: [
        'Revise a especificação do exercício no Code Lab.',
        'Execute os testes clicando em [ RUN TESTS ].',
        'Se tiver dúvidas no raciocínio, acione o Mentor IA no scaffolding L1 ou L2.'
      ]
    }
  ];

  const totalDuration = 180; // 3 minutes standard lecture
  const sceneDuration = Math.floor(totalDuration / scenes.length);

  const stopAllAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const playSceneVoice = async (sceneIndex: number, customText?: string) => {
    if (isMuted) return;
    stopAllAudio();

    const textToSpeak = customText || scenes[sceneIndex]?.narration || '';
    if (!textToSpeak) return;

    try {
      const synthRes = await api.synthesizeSpeech(textToSpeak);
      if (synthRes.success && synthRes.audioUrl) {
        const audio = new Audio(synthRes.audioUrl);
        audio.playbackRate = playbackSpeed;
        activeAudioRef.current = audio;
        audio.play().catch(() => {});
        return;
      }
    } catch {
      // fallback
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'pt-BR';
      utterance.rate = playbackSpeed;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Video Timer & Typing Effect Loop
  useEffect(() => {
    if (isPlaying) {
      playbackIntervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          const next = prev + 1 * playbackSpeed;
          if (next >= totalDuration) {
            setIsPlaying(false);
            stopAllAudio();
            handleMarkVideoWatched();
            return totalDuration;
          }
          return next;
        });
      }, 1000);
    } else {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      stopAllAudio();
    }

    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
      stopAllAudio();
    };
  }, [isPlaying, playbackSpeed, totalDuration]);

  // Live Typewriter Effect during Scene 2
  useEffect(() => {
    if (activeSceneIndex === 1 && isPlaying) {
      const codeLen = rawCodeSnippet.length;
      const interval = setInterval(() => {
        setTypedCodeLength((prev) => {
          if (prev >= codeLen) return codeLen;
          return prev + 4;
        });
      }, 50);
      return () => clearInterval(interval);
    } else if (activeSceneIndex === 1 && !isPlaying) {
      // pause typing
    } else {
      setTypedCodeLength(0);
    }
  }, [activeSceneIndex, isPlaying, rawCodeSnippet]);

  // Sync active scene
  useEffect(() => {
    const calculatedScene = Math.min(
      scenes.length - 1,
      Math.floor(currentTime / sceneDuration)
    );
    if (calculatedScene !== activeSceneIndex) {
      setActiveSceneIndex(calculatedScene);
      if (isPlaying && !isMuted) {
        playSceneVoice(calculatedScene);
      }
    }
  }, [currentTime, sceneDuration, scenes.length, isPlaying, isMuted, playbackSpeed, activeSceneIndex]);

  const handleTogglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      addLog(`Interactive classroom lecture started: ${lesson?.title}`, 'INFO');
      playSceneVoice(activeSceneIndex);
    } else {
      setIsPlaying(false);
      stopAllAudio();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    const newScene = Math.min(scenes.length - 1, Math.floor(newTime / sceneDuration));
    setActiveSceneIndex(newScene);
  };

  const handleJumpToScene = (idx: number) => {
    const newTime = idx * sceneDuration;
    setCurrentTime(newTime);
    setActiveSceneIndex(idx);
    if (!isPlaying) {
      setIsPlaying(true);
    }
    playSceneVoice(idx);
  };

  const handleRunStudentLiveCode = async () => {
    if (!studentCode.trim() || executingStudentCode) return;
    try {
      setExecutingStudentCode(true);
      addLog('Executing student hands-on code in classroom sandbox...', 'INFO');

      const testCases = lesson?.exercise?.testCases || [
        { name: 'Deve retornar resultado válido', assertion: 'typeof result !== "undefined"' }
      ];

      const res = await api.runSandbox(studentCode, testCases);
      setStudentExecResult(res);

      if (res.success) {
        addLog('Parabéns! Código executado com sucesso no laboratório ao vivo!', 'SUCCESS');
        handleMarkVideoWatched();
        playSceneVoice(activeSceneIndex, 'Sensacional! Seu código passou em todas as verificações do laboratório. Excelente trabalho!');
      } else {
        addLog('O código apresentou erros na execução. Revise a saída do terminal.', 'WARN');
        playSceneVoice(activeSceneIndex, 'Quase lá! Dê uma olhada nos erros apontados no terminal para ajustar sua lógica.');
      }
    } catch (err: any) {
      addLog(`Erro de execução: ${err.message}`, 'ERROR');
    } finally {
      setExecutingStudentCode(false);
    }
  };

  const handleDebugInternCode = async () => {
    try {
      setDebuggingInProgress(true);
      addLog('Depurando código do estagiário...', 'COMMAND');

      const hasFixedLoop = !internCode.includes('i <= items.length') && internCode.includes('i < items.length');
      const hasDefensiveCheck = internCode.includes('items[i]') || internCode.includes('if');

      if (hasFixedLoop && hasDefensiveCheck) {
        setInternDebugSuccess(true);
        setInternDebugLogs([
          '[DEBUGGER] Compilando patch de correção do estagiário...',
          '[TEST RUNNER] ✓ Array index out-of-bounds error EVITADO',
          '[TEST RUNNER] ✓ Cálculo de somatório executado com precisão',
          '[STATUS] ✓ 100% DOS TESTES APROVADOS! BUG RESOLVIDO (+100 XP)'
        ]);
        addLog('Parabéns! Você consertou o bug do estagiário com sucesso!', 'SUCCESS');
        playSceneVoice(activeSceneIndex, 'Excelente depuração! Você encontrou o bug do estagiário na linha do loop e corrigiu o limite do array com precisão profissional!');
      } else {
        setInternDebugSuccess(false);
        setInternDebugLogs([
          '[DEBUGGER FAIL] O código ainda contém o erro de índice no loop!',
          'DICA DO PROFESSOR: Em JavaScript, índices de array vão de 0 até length - 1. Mude "i <= items.length" para "i < items.length".'
        ]);
        addLog('O bug ainda persiste. Siga a dica do Professor Marcus.', 'WARN');
        playSceneVoice(activeSceneIndex, 'O bug ainda está ativo. Lembre-se: em arrays, o último índice é tamanho menos um. Mude o menor ou igual para apenas menor que.');
      }
    } finally {
      setDebuggingInProgress(false);
    }
  };

  const handleCopyProfessorCode = () => {
    setStudentCode(rawCodeSnippet);
    addLog('Código de demonstração do Professor copiado para o seu editor.', 'INFO');
  };

  const handleMarkVideoWatched = async () => {
    if (!currentLessonId) return;
    try {
      await api.markVideoWatched(currentLessonId);
      setVideoWatchedLocal(true);
      addLog('Video watched confirmed. Practical Code Lab required for lesson mastery.', 'SUCCESS');
    } catch (err: any) {
      addLog(`Error marking video: ${err.message}`, 'ERROR');
    }
  };

  const handleQuizSubmit = async () => {
    if (!lesson || !lesson.quiz) return;
    try {
      const res = await api.submitQuiz(lesson.id, lesson.quiz.id, quizAnswers);
      setQuizResult(res);
      if (res.passed) {
        addLog(`Quiz passed with score ${res.score}%!`, 'SUCCESS');
      } else {
        addLog(`Quiz score ${res.score}%. Review requested.`, 'WARN');
      }
    } catch (err: any) {
      addLog(`Quiz submission error: ${err.message}`, 'ERROR');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading || !lesson) {
    return (
      <div className="flex items-center justify-center p-12 text-dev-green font-mono text-sm">
        <span className="inline-block w-2 h-4 bg-dev-green mr-2 animate-blink-slow"></span>
        Carregando sala de aula e lição...
      </div>
    );
  }

  const currentScene = scenes[activeSceneIndex] || scenes[0];
  const currentStepperStep = stepperSteps[activeStepIndex] || stepperSteps[0];

  return (
    <div className="space-y-6">
      {/* Lesson Shell Title Bar */}
      <div className="bg-dev-surface border border-dev-border rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-dev-border">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-dev-cyan/10 text-dev-cyan border border-dev-cyan/20 font-bold">
              {lesson.module_code}
            </span>
            <span className="text-dev-muted font-bold">/</span>
            <span className="text-dev-green font-bold">{lesson.code}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-dev-muted">
              Dificuldade: <span className="text-dev-cyan font-semibold">{lesson.difficulty}</span>
            </span>
            <button
              onClick={() => setActiveView('CODELAB')}
              className="px-3.5 py-1.5 rounded bg-dev-green text-black font-mono font-bold text-xs hover:bg-dev-greenDim transition-colors shadow-glow-green flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>[ ABRIR CODE LAB ]</span>
            </button>
          </div>
        </div>

        <h1 className="text-lg md:text-xl font-bold font-mono text-white mb-2 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-dev-cyan" />
          <span>{lesson.title}</span>
        </h1>

        {lesson.content?.objective && (
          <div className="text-xs font-mono text-dev-muted bg-dev-bg/60 p-2.5 rounded border border-dev-border/60">
            <strong className="text-dev-green">OBJETIVO PEDAGÓGICO:</strong> {lesson.content.objective}
          </div>
        )}
      </div>

      {/* Pedagogical Step Tabs */}
      <div className="flex border-b border-dev-border gap-2 overflow-x-auto scrollbar-none pb-1 font-mono text-xs">
        <button
          onClick={() => setSelectedTab('VIDEO')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            selectedTab === 'VIDEO'
              ? 'border-dev-green text-dev-green font-bold bg-dev-green/5'
              : 'border-transparent text-dev-muted hover:text-dev-text'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-dev-cyan" />
          <span>SALA DE AULA INTERATIVA</span>
        </button>

        <button
          onClick={() => setSelectedTab('STEPPER')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            selectedTab === 'STEPPER'
              ? 'border-dev-cyan text-dev-cyan font-bold bg-dev-cyan/5'
              : 'border-transparent text-dev-muted hover:text-dev-text'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-dev-cyan" />
          <span>RAIO-X DO CÓDIGO (STEPPER)</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-dev-cyan/20 text-dev-cyan font-bold ml-1">
            PASSO A PASSO
          </span>
        </button>

        <button
          onClick={() => setSelectedTab('DOM_PREVIEW')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            selectedTab === 'DOM_PREVIEW'
              ? 'border-amber-400 text-amber-400 font-bold bg-amber-400/5'
              : 'border-transparent text-dev-muted hover:text-dev-text'
          }`}
        >
          <Layout className="w-3.5 h-3.5 text-amber-400" />
          <span>LIVE DOM SANDBOX</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold ml-1">
            UI VIVA
          </span>
        </button>

        <button
          onClick={() => setSelectedTab('DEBUG')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            selectedTab === 'DEBUG'
              ? 'border-dev-green text-dev-green font-bold bg-dev-green/5'
              : 'border-transparent text-dev-muted hover:text-dev-text'
          }`}
        >
          <Bug className="w-3.5 h-3.5 text-rose-400" />
          <span>BUG DO ESTAGIÁRIO</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold ml-1">
            PAIR DEBUG
          </span>
        </button>

        <button
          onClick={() => setSelectedTab('CONTENT')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            selectedTab === 'CONTENT'
              ? 'border-dev-green text-dev-green font-bold bg-dev-green/5'
              : 'border-transparent text-dev-muted hover:text-dev-text'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>APOSTILA & CONTEÚDO</span>
        </button>

        <button
          onClick={() => setSelectedTab('PRACTICE')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
            selectedTab === 'PRACTICE'
              ? 'border-dev-green text-dev-green font-bold bg-dev-green/5'
              : 'border-transparent text-dev-muted hover:text-dev-text'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>PRÁTICA GUIADA</span>
        </button>

        {lesson.quiz && (
          <button
            onClick={() => setSelectedTab('QUIZ')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors ${
              selectedTab === 'QUIZ'
                ? 'border-dev-green text-dev-green font-bold bg-dev-green/5'
                : 'border-transparent text-dev-muted hover:text-dev-text'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>CHECKPOINT QUIZ</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. INTERACTIVE CLASSROOM & HANDS-ON LAB                                  */}
      {/* ========================================================================= */}
      {selectedTab === 'VIDEO' && (
        <div className="space-y-4 font-mono">
          {/* Main Classroom Screen Container */}
          <div className="bg-[#0b0c10] border border-dev-border rounded-lg overflow-hidden shadow-terminal flex flex-col">
            {/* Top Classroom Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-black/75 border-b border-dev-border/70 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${isPlaying ? 'bg-dev-green animate-ping' : 'bg-amber-400'}`}></span>
                  <span className="text-dev-green font-bold uppercase">SALA DE AULA & LABORATÓRIO AO VIVO</span>
                </div>
                <span className="text-dev-muted">|</span>
                <span className="text-zinc-300 font-semibold">{currentScene.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-dev-green/10 border border-dev-green/30 text-dev-green text-[10px] font-bold">
                  VOZ NEURAL ATIVA
                </span>
              </div>
            </div>

            {/* CLASSROOM STAGE (PROFESSOR + QUADRO DIDÁTICO / LABORATÓRIO) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px] bg-[#07080b]">
              {/* Left Column: Interactive Whiteboard & Student Hands-On Terminal Editor (8 cols) */}
              <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-dev-border p-4 flex flex-col justify-between relative bg-black/40 space-y-4">
                {/* Scene 1: O PROBLEMA NO QUADRO NEGRO & MODELOS MENTAIS */}
                {activeSceneIndex === 0 && (
                  <div className="space-y-4 animate-fade-in flex-1">
                    <div className="flex items-center justify-between pb-2 border-b border-dev-border/60">
                      <span className="text-xs font-bold text-dev-green flex items-center gap-1.5">
                        <Presentation className="w-4 h-4 text-dev-cyan" />
                        QUADRO DIDÁTICO // SIMULADORES E MODELOS MENTAIS
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setActiveDiagram('MEMORY')}
                          className={`px-2 py-0.5 rounded text-[10px] ${activeDiagram === 'MEMORY' ? 'bg-dev-cyan text-black font-bold' : 'bg-zinc-800 text-zinc-400'}`}
                        >
                          MEMÓRIA RAM
                        </button>
                        <button
                          onClick={() => setActiveDiagram('ARRAY_PIPELINE')}
                          className={`px-2 py-0.5 rounded text-[10px] ${activeDiagram === 'ARRAY_PIPELINE' ? 'bg-dev-cyan text-black font-bold' : 'bg-zinc-800 text-zinc-400'}`}
                        >
                          ESTEIRA DE ARRAYS
                        </button>
                        <button
                          onClick={() => setActiveDiagram('HTTP_RESTAURANT')}
                          className={`px-2 py-0.5 rounded text-[10px] ${activeDiagram === 'HTTP_RESTAURANT' ? 'bg-dev-cyan text-black font-bold' : 'bg-zinc-800 text-zinc-400'}`}
                        >
                          RESTAURANTE HTTP
                        </button>
                      </div>
                    </div>

                    {/* Interactive Diagram: SIMULADOR DE MEMÓRIA */}
                    {activeDiagram === 'MEMORY' && (
                      <div className="p-4 rounded-lg bg-black/90 border border-dev-cyan/40 space-y-3">
                        <div className="flex items-center justify-between text-[11px] text-dev-cyan font-bold border-b border-zinc-800 pb-1.5">
                          <span>MODELO FÍSICO: PILHA (STACK) VS MONTE (HEAP)</span>
                          <span className="text-[10px] text-dev-muted">0x7FFE... ALOCAÇÃO DINÂMICA</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {/* Stack Box */}
                          <div className="p-3 rounded bg-zinc-900 border border-dev-green/40 space-y-2">
                            <div className="text-[10px] font-bold text-dev-green uppercase">// CALL STACK (Primitivos)</div>
                            <div className="p-1.5 rounded bg-black/60 border border-zinc-800 text-[11px] flex justify-between">
                              <span className="text-zinc-400">let x (0x01):</span>
                              <span className="text-dev-green font-bold">42 [Number]</span>
                            </div>
                            <div className="p-1.5 rounded bg-black/60 border border-zinc-800 text-[11px] flex justify-between">
                              <span className="text-zinc-400">ptr user:</span>
                              <span className="text-dev-cyan font-bold">➔ @Heap_0x8F</span>
                            </div>
                          </div>

                          {/* Heap Box */}
                          <div className="p-3 rounded bg-zinc-900 border border-dev-cyan/40 space-y-2">
                            <div className="text-[10px] font-bold text-dev-cyan uppercase">// HEAP (Objetos Complexos)</div>
                            <div className="p-1.5 rounded bg-black/60 border border-zinc-800 text-[11px]">
                              <div className="text-dev-cyan font-bold">@Heap_0x8F:</div>
                              <div className="text-[10px] text-zinc-300 font-mono">{'{ name: "Marcus", role: "Dev" }'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Interactive Diagram: ESTEIRA DE ARRAYS */}
                    {activeDiagram === 'ARRAY_PIPELINE' && (
                      <div className="p-4 rounded-lg bg-black/90 border border-amber-400/40 space-y-3 text-center">
                        <div className="text-[11px] font-bold text-amber-400">// A ESTEIRA ROLANTE DE ARRAYS (MAP / FILTER)</div>
                        <div className="flex items-center justify-center gap-2 text-xs flex-wrap">
                          <span className="px-2.5 py-1.5 rounded bg-zinc-800 border border-dev-border">
                            [ 10, 25, 4, 80 ]
                          </span>
                          <ArrowRight className="w-4 h-4 text-amber-400 animate-pulse" />
                          <span className="px-2.5 py-1.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                            .filter(n &gt; 10) ➔ [ 25, 80 ]
                          </span>
                          <ArrowRight className="w-4 h-4 text-dev-green animate-pulse" />
                          <span className="px-2.5 py-1.5 rounded bg-dev-green/20 text-dev-green border border-dev-green font-bold">
                            .map(n * 2) ➔ [ 50, 160 ]
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Interactive Diagram: RESTAURANTE HTTP */}
                    {activeDiagram === 'HTTP_RESTAURANT' && (
                      <div className="p-4 rounded-lg bg-black/90 border border-dev-green/40 space-y-3 text-center">
                        <div className="text-[11px] font-bold text-dev-green">// A METÁFORA DO RESTAURANTE HTTP</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="p-2.5 rounded bg-zinc-900 border border-dev-border">
                            <div className="text-[10px] text-dev-muted font-bold">1. CLIENTE (Navegador)</div>
                            <div className="text-dev-cyan mt-1 font-bold">Faz o Pedido</div>
                          </div>
                          <div className="p-2.5 rounded bg-zinc-900 border border-dev-cyan">
                            <div className="text-[10px] text-dev-muted font-bold">2. GARÇOM (HTTP Request)</div>
                            <div className="text-dev-green mt-1 font-bold">GET /api/v1/data</div>
                          </div>
                          <div className="p-2.5 rounded bg-zinc-900 border border-dev-border">
                            <div className="text-[10px] text-dev-muted font-bold">3. COZINHA (Server & DB)</div>
                            <div className="text-amber-400 mt-1 font-bold">200 OK {'{ payload }'}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-2.5">
                      {currentScene.boardNotes?.map((note, idx) => (
                        <div key={idx} className="p-2.5 rounded bg-dev-surface/90 border border-dev-border">
                          <div className="text-[10px] text-dev-cyan font-bold tracking-wider mb-0.5 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-amber-400" />
                            {note.label}
                          </div>
                          <div className="text-xs text-zinc-100 font-sans font-medium">
                            {note.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scene 2: PROFESSOR DIGITANDO AO VIVO */}
                {activeSceneIndex === 1 && (
                  <div className="space-y-3 animate-fade-in flex-1">
                    <div className="flex items-center justify-between pb-2 border-b border-dev-border/60">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-dev-green animate-ping"></span>
                        <span className="text-xs font-bold text-dev-green flex items-center gap-1">
                          <Code2 className="w-4 h-4 text-dev-cyan" />
                          PROFESSOR CODIFICANDO AO VIVO NA SUA FRENTE
                        </span>
                      </div>
                      <span className="text-[10px] text-dev-muted">ETAPA 2/4</span>
                    </div>

                    <div className="p-3 rounded-lg bg-black/90 border border-dev-green/40 shadow-terminal overflow-hidden text-xs">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-[10px] text-dev-muted">
                        <span>solution.ts — Demonstração do Professor</span>
                        <span className="text-dev-cyan font-bold">Digitando...</span>
                      </div>
                      <pre className="text-dev-green font-mono whitespace-pre-wrap leading-relaxed min-h-[140px]">
                        {rawCodeSnippet.slice(0, typedCodeLength > 0 ? typedCodeLength : rawCodeSnippet.length)}
                        {isPlaying && <span className="inline-block w-2 h-4 bg-dev-green ml-0.5 animate-pulse"></span>}
                      </pre>
                    </div>

                    <div className="p-3 rounded-lg bg-[#050608] border border-dev-border text-[11px] font-mono space-y-1">
                      <div className="text-dev-muted font-bold text-[10px]">// TERMINAL DE EXECUÇÃO EM TEMPO REAL</div>
                      {currentScene.executionLogs?.map((log, idx) => (
                        <div key={idx} className={log.includes('✓') ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scene 3 & 4: MÃOS DADAS COM O MENTOR (LABORATÓRIO AO VIVO) */}
                {(activeSceneIndex === 2 || activeSceneIndex === 3) && (
                  <div className="space-y-3 animate-fade-in flex-1">
                    <div className="flex items-center justify-between pb-2 border-b border-dev-border/60">
                      <span className="text-xs font-bold text-dev-cyan flex items-center gap-1.5">
                        <Terminal className="w-4 h-4 text-dev-green" />
                        SEU CAMPO DE EXPERIMENTAÇÃO // DIGITE E TESTE AO VIVO
                      </span>
                      <button
                        onClick={handleCopyProfessorCode}
                        className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] flex items-center gap-1 border border-dev-border"
                        title="Copiar o exemplo digitado pelo Professor"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copiar do Professor</span>
                      </button>
                    </div>

                    {/* Student Live Interactive Editor */}
                    <div className="space-y-2">
                      <div className="relative">
                        <textarea
                          value={studentCode}
                          onChange={(e) => setStudentCode(e.target.value)}
                          onKeyDown={(e) => {
                            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                              e.preventDefault();
                              handleRunStudentLiveCode();
                            }
                          }}
                          placeholder="// Digite seu código aqui para testar junto com o Professor..."
                          rows={7}
                          className="w-full p-3 rounded-lg bg-black border border-dev-cyan/50 text-xs font-mono text-dev-green focus:border-dev-green focus:ring-1 focus:ring-dev-green outline-none resize-none leading-relaxed shadow-terminal selection:bg-dev-green/30"
                        />
                      </div>

                      {/* Interactive Execution Trigger Bar */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-dev-muted flex items-center gap-1">
                          <CornerDownLeft className="w-3 h-3" /> Pressione <strong>⌘+Enter</strong> ou clique ao lado para testar
                        </span>

                        <button
                          onClick={handleRunStudentLiveCode}
                          disabled={executingStudentCode || !studentCode.trim()}
                          className="px-4 py-2 rounded bg-dev-green text-black font-bold text-xs hover:bg-dev-greenDim transition-all shadow-glow-green flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          {executingStudentCode ? (
                            <>
                              <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                              <span>EXECUTANDO NO SANDBOX...</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>[ EXECUTAR MEU CÓDIGO ]</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Live Sandbox Execution Output Pane */}
                    {studentExecResult && (
                      <div className={`p-3 rounded-lg border text-xs font-mono transition-all ${
                        studentExecResult.success
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
                      }`}>
                        <div className="flex items-center justify-between font-bold pb-1.5 mb-1.5 border-b border-current/20 text-[11px]">
                          <span className="flex items-center gap-1">
                            {studentExecResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                            {studentExecResult.success ? 'PARABÉNS! TODOS OS TESTES PASSARAM' : 'ATENÇÃO: FALHA NOS TESTES'}
                          </span>
                          <span>Latência: {studentExecResult.durationMs || 15}ms</span>
                        </div>

                        {studentExecResult.output && (
                          <div className="text-[11px] opacity-90 whitespace-pre-wrap">
                            {studentExecResult.output}
                          </div>
                        )}

                        {studentExecResult.testResults && (
                          <div className="mt-2 space-y-1">
                            {studentExecResult.testResults.map((tr: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between text-[10px]">
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
                )}
              </div>

              {/* Right Column: PROFESSOR VIRTUAL (Avatar, Status e Narração do Mentor) (4 cols) */}
              <div className="lg:col-span-4 p-4 flex flex-col justify-between bg-dev-surface/40 space-y-4">
                {/* Professor Virtual Camera Feed Box */}
                <div className="p-4 rounded-lg bg-dev-bg border border-dev-cyan/40 shadow-terminal space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5 text-dev-cyan font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>PROF. MARCUS // LEAD ARCHITECT</span>
                    </div>
                    <span className="text-dev-muted">1080p CAM</span>
                  </div>

                  {/* Animated Teacher Avatar Graphic */}
                  <div className="h-32 rounded bg-gradient-to-b from-zinc-900 to-black border border-dev-border flex flex-col items-center justify-center relative select-none">
                    <div className="relative">
                      <div className={`w-16 h-16 rounded-full bg-dev-cyan/20 border-2 ${isPlaying ? 'border-dev-green animate-pulse' : 'border-dev-cyan'} flex items-center justify-center text-dev-cyan transition-all`}>
                        <Bot className="w-9 h-9" />
                      </div>
                      {isPlaying && (
                        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded bg-dev-green text-black text-[9px] font-bold flex items-center gap-1">
                          <Mic className="w-2.5 h-2.5" /> FALANDO
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] font-bold text-white mt-2 flex items-center gap-1.5">
                      <span>Status:</span>
                      <span className="text-dev-cyan">{currentScene.professorStatus}</span>
                    </div>
                  </div>

                  {/* Teacher Narration Subtitles */}
                  <div className="p-2.5 rounded bg-black/60 border border-zinc-800 text-[11px] text-zinc-200 leading-relaxed max-h-32 overflow-y-auto">
                    <span className="text-dev-green font-bold mr-1">"</span>
                    {currentScene.narration}
                    <span className="text-dev-green font-bold ml-1">"</span>
                  </div>
                </div>

                {/* Big Center Play / Pause Trigger */}
                <div className="text-center">
                  <button
                    onClick={handleTogglePlay}
                    className="w-full py-3 rounded-lg bg-dev-green text-black font-bold text-xs hover:bg-dev-greenDim transition-all flex items-center justify-center gap-2 shadow-glow-green cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 fill-current" />
                        <span>[ PAUSAR AULA ]</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>[ REPRODUZIR VIDEOAULA INTERATIVA ]</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Controls Bar (Timeline, Velocidade, Capítulos) */}
            <div className="bg-black/90 border-t border-dev-border px-4 py-3 space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-dev-muted w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={totalDuration}
                  step="0.5"
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-dev-green"
                />
                <span className="text-[11px] font-mono text-dev-muted w-10">
                  {formatTime(totalDuration)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTogglePlay}
                    className="p-1.5 rounded bg-dev-green text-black hover:bg-dev-greenDim transition-colors font-bold flex items-center gap-1"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentTime(0);
                      setActiveSceneIndex(0);
                    }}
                    className="text-dev-muted hover:text-white p-1"
                    title="Reiniciar Aula"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setIsMuted(!isMuted);
                      if (!isMuted) stopAllAudio();
                    }}
                    className="text-dev-muted hover:text-white p-1"
                    title={isMuted ? 'Ativar Voz' : 'Mutar Voz'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-dev-green" />}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[1.0, 1.25, 1.5, 2.0].map((s) => (
                      <button
                        key={s}
                        onClick={() => setPlaybackSpeed(s)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          playbackSpeed === s ? 'bg-dev-cyan text-black' : 'text-dev-muted hover:text-white bg-zinc-800'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>

                  <span className="text-[11px] text-dev-cyan font-bold hidden sm:inline">
                    DIDÁTICA: ESCOLA PRO
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters Grid: 4 Etapas da Aula Escolar */}
          <div className="space-y-2">
            <div className="text-xs font-mono text-dev-green font-bold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-dev-cyan" />
              <span>ETAPAS DIDÁTICAS DA AULA (CLIQUE PARA SALTAR)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
              {scenes.map((s, idx) => {
                const isCurrent = activeSceneIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleJumpToScene(idx)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isCurrent
                        ? 'border-dev-green bg-dev-green/10 text-dev-green font-bold shadow-glow-green'
                        : 'border-dev-border bg-dev-bg hover:bg-dev-surface text-zinc-300'
                    }`}
                  >
                    <div className="text-[10px] text-dev-cyan font-bold">PASSO 0{idx + 1}</div>
                    <div className="text-[11px] mt-0.5 leading-snug">{s.title}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RAIO-X DO CÓDIGO (LIVE EXECUTION STEPPER & TIME-TRAVEL DEBUGGER)       */}
      {/* ========================================================================= */}
      {selectedTab === 'STEPPER' && (
        <div className="bg-dev-surface border border-dev-cyan/40 rounded-lg p-6 space-y-6 font-mono">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-dev-border">
            <div className="flex items-center gap-2 text-dev-cyan font-bold text-sm">
              <Eye className="w-5 h-5" />
              <span>RAIO-X DO CÓDIGO // TIME-TRAVEL EXECUTION STEPPER</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">
                Passo <strong>{activeStepIndex + 1}</strong> de <strong>{stepperSteps.length}</strong>
              </span>
            </div>
          </div>

          {/* Stepper Control Panel */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-black/90 border border-dev-border">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                disabled={activeStepIndex === 0}
                className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-bold flex items-center gap-1 text-zinc-200"
              >
                <SkipBack className="w-3.5 h-3.5" /> Anterior
              </button>

              <button
                onClick={() => setActiveStepIndex((prev) => Math.min(stepperSteps.length - 1, prev + 1))}
                disabled={activeStepIndex === stepperSteps.length - 1}
                className="px-3 py-1.5 rounded bg-dev-cyan text-black hover:bg-dev-cyanDim disabled:opacity-40 text-xs font-bold flex items-center gap-1 shadow-glow-cyan"
              >
                Próximo Passo <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsAutoStepping(!isAutoStepping)}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 ${
                  isAutoStepping ? 'bg-amber-400 text-black animate-pulse' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                }`}
              >
                {isAutoStepping ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoStepping ? 'Pausar Auto' : 'Auto Play'}</span>
              </button>

              <button
                onClick={() => setActiveStepIndex(0)}
                className="p-1.5 text-dev-muted hover:text-white"
                title="Reiniciar Stepper"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-[10px] text-dev-green font-bold hidden sm:inline">
              [ STACK & HEAP TIME-TRAVEL ATIVO ]
            </span>
          </div>

          {/* Stepper Grid: Left Code Highlighted, Right Scope Variables */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Code Highlight Box (7 cols) */}
            <div className="lg:col-span-7 p-4 rounded-lg bg-black border border-dev-cyan/30 space-y-1 text-xs">
              <div className="text-[10px] text-dev-muted font-bold pb-2 mb-2 border-b border-zinc-800">
                // EXECUÇÃO PASSO A PASSO DA INSTRUÇÃO
              </div>
              <div className="space-y-1">
                {[
                  '1: function calculateTotal(items) {',
                  '2:   let total = 0;',
                  '3:   for (let i = 0; i < items.length; i++) {',
                  '4:     total += items[i].val;',
                  '5:   }',
                  '6:   return total;',
                  '7: }'
                ].map((l, idx) => {
                  const isCurrent = (idx + 1) === currentStepperStep.line;
                  return (
                    <div
                      key={idx}
                      className={`p-1.5 rounded font-mono transition-all ${
                        isCurrent
                          ? 'bg-dev-cyan/20 border-l-4 border-dev-cyan text-white font-bold pl-3 shadow-glow-cyan'
                          : 'text-zinc-400 pl-3'
                      }`}
                    >
                      {l}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scope Variables Inspector (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              {/* Variable Scope Table */}
              <div className="p-4 rounded-lg bg-zinc-900 border border-dev-green/40 space-y-3">
                <div className="text-[11px] font-bold text-dev-green flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <span>PAINEL DE VARIÁVEIS VIVAS (ESCOPO)</span>
                  <span className="text-[9px] text-dev-muted">STACK MEMORY</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  {Object.entries(currentStepperStep.scopeVariables).map(([k, v], idx) => (
                    <div key={idx} className="p-2 rounded bg-black/60 border border-zinc-800 flex justify-between items-center">
                      <span className="text-dev-cyan font-bold">{k}:</span>
                      <span className="text-zinc-100 font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step Pedagogical Explanation */}
              <div className="p-3.5 rounded-lg bg-dev-bg border border-dev-border text-xs text-zinc-300 space-y-1">
                <div className="text-[10px] text-amber-400 font-bold">// O QUE ESTÁ ACONTECENDO NA MÁQUINA:</div>
                <div className="leading-relaxed">{currentStepperStep.explanation}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LIVE DOM & COMPONENT SANDBOX (UI VIVA EM TEMPO REAL)                   */}
      {/* ========================================================================= */}
      {selectedTab === 'DOM_PREVIEW' && (
        <div className="bg-dev-surface border border-amber-400/40 rounded-lg p-6 space-y-4 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-dev-border">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Layout className="w-5 h-5" />
              <span>LIVE DOM & COMPONENT SANDBOX // RENDERIZAÇÃO INSTANTÂNEA</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
              HOT RELOAD ATIVO
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* HTML / CSS Live Code Editor (6 cols) */}
            <div className="lg:col-span-6 space-y-2">
              <div className="text-xs text-dev-muted font-bold">// EDITOR DE COMPONENTE HTML & CSS</div>
              <textarea
                value={domHtml}
                onChange={(e) => setDomHtml(e.target.value)}
                rows={14}
                className="w-full p-3 rounded-lg bg-black border border-zinc-700 text-xs font-mono text-dev-green focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Live Rendered DOM Frame (6 cols) */}
            <div className="lg:col-span-6 space-y-2">
              <div className="text-xs text-dev-muted font-bold">// RESULTADO VISUAL EM TEMPO REAL</div>
              <div className="w-full h-[270px] rounded-lg border border-amber-400/40 overflow-hidden bg-white shadow-terminal">
                <iframe
                  title="Live DOM Sandbox"
                  srcDoc={domHtml}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. 'CONSERTE O BUG DO ESTAGIÁRIO' (PAIR DEBUGGING CHALLENGE)              */}
      {/* ========================================================================= */}
      {selectedTab === 'DEBUG' && (
        <div className="bg-dev-surface border border-rose-500/40 rounded-lg p-6 space-y-6 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-dev-border">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Bug className="w-5 h-5" />
              <span>DESAFIO DE DEBBUGGING // O ESTAGIÁRIO DEIXOU UM BUG EM PRODUÇÃO!</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" /> +100 XP REWARD
            </span>
          </div>

          <div className="p-3.5 rounded bg-dev-bg border border-dev-border text-xs text-zinc-300 leading-relaxed">
            <strong className="text-white">CENÁRIO:</strong> Um estagiário júnior enviou este código para produção e o servidor caiu com um erro de runtime. Sua missão de engenheiro é identificar a linha defeituosa, corrigir a lógica no editor abaixo e aplicar o patch.
          </div>

          {/* Terminal Traceback of the Error */}
          <div className="p-4 rounded-lg bg-black border border-rose-500/50 space-y-1.5 text-xs">
            <div className="text-rose-400 font-bold text-[11px] mb-1">// STACK TRACE DA FALHA EM PRODUÇÃO</div>
            {internDebugLogs.map((log, idx) => (
              <div key={idx} className={log.includes('✓') ? 'text-emerald-400 font-bold' : 'text-rose-300'}>
                {log}
              </div>
            ))}
          </div>

          {/* Buggy Code Editor to Fix */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-dev-muted">
              <span>intern_code.js — Corrija o código diretamente aqui:</span>
              <button
                onClick={() => {
                  setInternCode(`// Código do Estagiário (Com Bug de Execução)\nfunction processData(items) {\n  let total = 0;\n  for (let i = 0; i <= items.length; i++) {\n    total += items[i].value;\n  }\n  return total;\n}`);
                }}
                className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Resetar Código
              </button>
            </div>

            <textarea
              value={internCode}
              onChange={(e) => setInternCode(e.target.value)}
              rows={8}
              className="w-full p-3 rounded-lg bg-black border border-zinc-700 text-xs font-mono text-dev-green focus:border-rose-400 focus:ring-1 focus:ring-rose-400 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Debug Action Button */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleDebugInternCode}
              disabled={debuggingInProgress}
              className={`px-6 py-2.5 rounded font-bold text-xs transition-all shadow-terminal flex items-center gap-2 ${
                internDebugSuccess
                  ? 'bg-emerald-500 text-black hover:bg-emerald-400'
                  : 'bg-rose-500 text-white hover:bg-rose-600'
              }`}
            >
              {internDebugSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>[ BUG CORRIGIDO COM SUCESSO! ]</span>
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4" />
                  <span>[ DEPURAR & APLICAR FIX ]</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. APOSTILA / CONTEÚDO ESCRITO                                            */}
      {/* ========================================================================= */}
      {selectedTab === 'CONTENT' && (
        <div className="bg-dev-surface border border-dev-border rounded-lg p-6 space-y-6">
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {lesson.content?.competences && lesson.content.competences.map((c, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-dev-cyan/10 text-dev-cyan border border-dev-cyan/20">
                COMPETÊNCIA: {c}
              </span>
            ))}
          </div>

          <div className="prose prose-invert max-w-none text-xs font-mono text-zinc-300 leading-relaxed space-y-4">
            <div className="whitespace-pre-wrap font-mono">
              {lesson.content?.content_markdown}
            </div>
          </div>

          <div className="pt-4 border-t border-dev-border flex justify-between items-center">
            <button
              onClick={() => setMentorOpen(true)}
              className="text-xs font-mono text-dev-cyan hover:underline flex items-center gap-1"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Dúvida conceitual? Chamar Mentor IA</span>
            </button>

            <button
              onClick={() => setSelectedTab('VIDEO')}
              className="px-4 py-2 bg-dev-green text-black font-mono font-bold text-xs rounded hover:bg-dev-greenDim transition-colors flex items-center gap-1.5"
            >
              <span>Ir para a Sala de Aula Interativa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PRÁTICA GUIADA                                                         */}
      {/* ========================================================================= */}
      {selectedTab === 'PRACTICE' && (
        <div className="bg-dev-surface border border-dev-border rounded-lg p-6 space-y-4">
          <div className="text-xs font-mono text-dev-green font-bold uppercase">
            // FAZER JUNTO: PRÁTICA GUIADA E INVARIANTES
          </div>
          <div className="p-4 rounded bg-dev-bg border border-dev-border text-xs font-mono text-zinc-300 whitespace-pre-wrap">
            {lesson.content?.guided_practice_markdown || 'Nenhuma prática guiada registrada para esta aula.'}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setActiveView('CODELAB')}
              className="px-4 py-2 bg-dev-green text-black font-mono font-bold text-xs rounded hover:bg-dev-greenDim transition-colors shadow-glow-green flex items-center gap-2"
            >
              <Code2 className="w-4 h-4" />
              <span>[ IR PARA O LABORATÓRIO DE CÓDIGO ]</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CHECKPOINT QUIZ                                                        */}
      {/* ========================================================================= */}
      {selectedTab === 'QUIZ' && lesson.quiz && (
        <div className="bg-dev-surface border border-dev-border rounded-lg p-6 space-y-6">
          <div className="text-xs font-mono text-dev-green font-bold">
            CHECKPOINT QUIZ: {lesson.quiz.title} (Mínimo para aprovação: {lesson.quiz.passing_score}%)
          </div>

          {quizResult && (
            <div className={`p-4 rounded border text-xs font-mono ${
              quizResult.passed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {quizResult.message}
            </div>
          )}

          <div className="space-y-6">
            {lesson.quiz.questions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded bg-dev-bg border border-dev-border space-y-3">
                <div className="text-xs font-mono font-semibold text-white">
                  {idx + 1}. {q.prompt}
                </div>

                <div className="space-y-2">
                  {q.answers.map((ans) => (
                    <label
                      key={ans.id}
                      className={`flex items-start gap-2.5 p-2.5 rounded border text-xs font-mono cursor-pointer transition-colors ${
                        quizAnswers[q.id] === ans.id
                          ? 'border-dev-green bg-dev-green/10 text-white'
                          : 'border-dev-border hover:bg-dev-surface text-zinc-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        checked={quizAnswers[q.id] === ans.id}
                        onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: ans.id }))}
                        className="mt-0.5 text-dev-green focus:ring-0"
                      />
                      <span>{ans.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleQuizSubmit}
            className="w-full py-2.5 px-4 bg-dev-green text-black font-mono font-bold text-xs rounded hover:bg-dev-greenDim transition-colors shadow-glow-green"
          >
            [ SUBMETER RESPOSTAS DO QUIZ ]
          </button>
        </div>
      )}
    </div>
  );
};
