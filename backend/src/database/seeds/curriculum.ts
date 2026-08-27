export interface ModuleSeed {
  code: string;
  orderIndex: number;
  title: string;
  slug: string;
  summary: string;
  icon: string;
  lessons: {
    code: string;
    orderIndex: number;
    title: string;
    slug: string;
    durationMin: number;
    difficulty: string;
    isCheckpoint: number;
    objective: string;
    prerequisites: string[];
    competences: string[];
    contentMarkdown: string;
    guidedPracticeMarkdown: string;
    expectedOutput: string;
    commentedSolution: string;
    resources: { title: string; url: string }[];
    videoTitle: string;
    exercise?: {
      title: string;
      description: string;
      initialCode: string;
      solutionCode: string;
      testCases: { name: string; input?: string; expected?: string; assertion: string }[];
      difficulty: string;
    };
    quiz?: {
      title: string;
      passingScore: number;
      questions: {
        prompt: string;
        explanation: string;
        difficultyLevel: number;
        answers: { text: string; isCorrect: boolean; explanation: string }[];
      }[];
    };
  }[];
  challenge?: {
    title: string;
    prompt: string;
    starterFiles: Record<string, string>;
    verificationCriteria: string[];
    xpReward: number;
  };
  project?: {
    title: string;
    slug: string;
    tier: number;
    rubric: { criterion: string; weight: number; description: string }[];
    templateRepoUrl: string;
    requiredSkills: string[];
  };
}

export const curriculumSeedData: ModuleSeed[] = [
  {
    code: 'MOD_00',
    orderIndex: 0,
    title: 'Como um Software Funciona',
    slug: 'como-um-software-funciona',
    summary: 'A anatomia oculta da computação: hardware, SO, processos, memória RAM vs Disco, rede HTTP e como código vira instrução executada.',
    icon: 'Cpu',
    lessons: [
      {
        code: '00.01',
        orderIndex: 1,
        title: 'Da Eletricidade ao Software: A Pilha Computacional',
        slug: 'da-eletricidade-ao-software',
        durationMin: 15,
        difficulty: 'INTRO',
        isCheckpoint: 0,
        objective: 'Compreender como a CPU lê instruções binárias, como a memória armazena estados e a função do Sistema Operacional.',
        prerequisites: ['Nenhum pré-requisito técnico.'],
        competences: ['SOFT_ARCH'],
        contentMarkdown: `# Como um Software Realmente Funciona

Um computador não é uma máquina mágica: é um manipulador ultra-rápido de circuitos lógicos que operam em dois estados (0 e 1).

### 1. A Hierarquia de Memória
- **Registradores da CPU**: Memória ultrarrápida dentro do processador (latência de ~1 ciclo de clock).
- **Cache (L1, L2, L3)**: Armazenamento intermediário na CPU para dados frequentes.
- **RAM (Random Access Memory)**: Espaço volátil onde seu programa em execução reside.
- **Armazenamento Não-Volátil (SSD/NVMe)**: Onde seus arquivos e código-fonte ficam salvos quando a máquina é desligada.

### 2. O Ciclo de Vida de um Processo
Quando você digita \`node app.js\` no terminal:
1. O Sistema Operacional cria um **Processo** isolado com espaço de memória virtual próprio.
2. O arquivo é lido do disco para a memória RAM.
3. O interpretador/compilador traduz o código em instruções de máquina.
4. A CPU executa o ciclo **Fetch-Decode-Execute**.`,
        guidedPracticeMarkdown: `### Prática Guiada: Inspecionando Processos
Abra seu terminal e execute:
\`\`\`bash
top -o cpu
\`\`\`
Observe como o PID (Process Identifier), o consumo de memória (%MEM) e CPU (%CPU) são gerenciados pelo kernel.`,
        expectedOutput: 'Compreensão clara da transição disco -> RAM -> CPU -> instrução.',
        commentedSolution: '// O conceito chave é que todo software precisa ser alocado em memória RAM antes de ser executado pela CPU.',
        resources: [{ title: 'How Computers Work - Nand to Tetris', url: 'https://www.nand2tetris.org/' }],
        videoTitle: 'A Anatomia Oculta de um Computador',
        exercise: {
          title: 'Simulador de Alocação de Memória',
          description: 'Escreva uma função `simulateProcessAllocation(processName, memoryBytes)` que retorne um objeto descritivo de alocação com status "ALLOCATED" se memoryBytes > 0, ou lance erro "INVALID_MEM".',
          initialCode: `function simulateProcessAllocation(processName, memoryBytes) {
  // Implemente a verificação de memória e retorno do processo
  
}`,
          solutionCode: `function simulateProcessAllocation(processName, memoryBytes) {
  if (!memoryBytes || memoryBytes <= 0) {
    throw new Error("INVALID_MEM");
  }
  return {
    pid: Math.floor(Math.random() * 9000) + 1000,
    name: processName,
    allocatedBytes: memoryBytes,
    status: "ALLOCATED",
    timestamp: Date.now()
  };
}`,
          testCases: [
            { name: 'Deve alocar processo válido', assertion: 'const res = simulateProcessAllocation("node", 1024); return res.status === "ALLOCATED" && res.allocatedBytes === 1024 && typeof res.pid === "number";' },
            { name: 'Deve lançar erro para memória <= 0', assertion: 'try { simulateProcessAllocation("bad", 0); return false; } catch (e) { return e.message === "INVALID_MEM"; }' }
          ],
          difficulty: 'EASY'
        },
        quiz: {
          title: 'Quiz de Fundamentos de Computação',
          passingScore: 80,
          questions: [
            {
              prompt: 'Qual componente é responsável por manter o código em execução ativo e volátil?',
              explanation: 'A memória RAM (Random Access Memory) armazena os dados e instruções dos processos em execução.',
              difficultyLevel: 1,
              answers: [
                { text: 'Memória RAM', isCorrect: true, explanation: 'Correto! A RAM é a memória principal de trabalho volátil.' },
                { text: 'SSD NVMe', isCorrect: false, explanation: 'O SSD é armazenamento não volátil (persistência).' },
                { text: 'Placa de Rede', isCorrect: false, explanation: 'Responsável pela comunicação de pacotes.' }
              ]
            }
          ]
        }
      }
    ],
    challenge: {
      title: 'Desafio do Ciclo Fetch-Decode-Execute',
      prompt: 'Implemente uma mini máquina virtual em JavaScript capaz de interpretar 3 opcodes simples: PUSH, ADD e POP.',
      starterFiles: {
        'vm.js': `class MiniVM {\n  constructor() {\n    this.stack = [];\n  }\n  run(instructions) {\n    // TODO: implement\n  }\n}`
      },
      verificationCriteria: ['Executar instrução PUSH', 'Executar instrução ADD somando os dois valores do topo', 'Retornar resultado final via POP'],
      xpReward: 120
    }
  },
  {
    code: 'MOD_01',
    orderIndex: 1,
    title: 'Ambiente de Dev & Terminal Moderno',
    slug: 'ambiente-de-dev',
    summary: 'Transformando sua máquina num laboratório profissional: Zsh/Bash, CLI Unix, pipes, variáveis de ambiente, SSH e automações de shell.',
    icon: 'Terminal',
    lessons: [
      {
        code: '01.01',
        orderIndex: 1,
        title: 'O Terminal como Interface Primária de Poder',
        slug: 'o-terminal-como-interface-primaria',
        durationMin: 20,
        difficulty: 'EASY',
        isCheckpoint: 0,
        objective: 'Dominar comandos fundamentais de navegação, manipulação de arquivos, streams (stdin, stdout, stderr) e pipes Unix.',
        prerequisites: ['MOD_00'],
        competences: ['DEV_ENV'],
        contentMarkdown: `# O Terminal Unix: A Ferramenta do Desenvolvedor

Interfaces gráficas são feitas para consumo. O terminal é feito para **criação e automação**.

### Comandos Essenciais
- \`pwd\` (Print Working Directory): Onde você está no filesystem.
- \`ls -la\`: Lista arquivos com permissões, proprietário e arquivos ocultos.
- \`cd \`: Navegação entre nós da árvore de diretórios.
- \`mkdir -p path/to/dir\`: Criação recursiva de pastas.
- \`cat\`, \`grep\`, \`head\`, \`tail -f\`: Manipulação e visualização de streams.

### Pipes (\`|\`) e Redirecionamentos (\`>\`, \`>>\`)
A filosofia Unix prega: *"Escreva programas que façam uma coisa bem feita e que trabalhem juntos através de texto."*
\`\`\`bash
# Filtrar logs de erro e contar ocorrências
cat app.log | grep "ERROR" | wc -l
\`\`\``,
        guidedPracticeMarkdown: `Execute no seu terminal os comandos para criar uma pasta chamada \`lab-dev\`, criar um arquivo \`config.env\` e filtrar suas linhas com \`grep\`.`,
        expectedOutput: 'Criação e manipulação de arquivos via linha de comando.',
        commentedSolution: '// Comandos Unix são o alicerce de qualquer engenheiro de software moderno.',
        resources: [{ title: 'The Linux Command Line', url: 'https://linuxcommand.org/' }],
        videoTitle: 'Dominando o Shell Unix e Fluxos de Dados',
        exercise: {
          title: 'Parser de Argumentos de Linha de Comando (CLI)',
          description: 'Crie uma função `parseCliArgs(argsArray)` que receba uma lista de argumentos como `["--port", "3000", "--host", "localhost", "--verbose"]` e retorne um objeto mapeado `{ port: "3000", host: "localhost", verbose: true }`.',
          initialCode: `function parseCliArgs(argsArray) {
  // Implemente o parser de flags e valores
  
}`,
          solutionCode: `function parseCliArgs(argsArray) {
  const result = {};
  for (let i = 0; i < argsArray.length; i++) {
    const item = argsArray[i];
    if (item.startsWith('--')) {
      const key = item.replace(/^--/, '');
      const nextItem = argsArray[i + 1];
      if (nextItem && !nextItem.startsWith('--')) {
        result[key] = nextItem;
        i++;
      } else {
        result[key] = true;
      }
    }
  }
  return result;
}`,
          testCases: [
            { name: 'Deve parsear flags com valores', assertion: 'const parsed = parseCliArgs(["--port", "8080", "--host", "0.0.0.0"]); return parsed.port === "8080" && parsed.host === "0.0.0.0";' },
            { name: 'Deve parsear flags booleanas sem valor', assertion: 'const parsed = parseCliArgs(["--debug", "--port", "4000"]); return parsed.debug === true && parsed.port === "4000";' }
          ],
          difficulty: 'MEDIUM'
        }
      }
    ]
  },
  {
    code: 'MOD_02',
    orderIndex: 2,
    title: 'HTML Semântico & Arquitetura do DOM',
    slug: 'html-semantico',
    summary: 'A espinha dorsal da web: hierarquia semântica, acessibilidade (a11y/ARIA), SEO técnico, forms modernos e parsing do DOM pelo browser.',
    icon: 'Layout',
    lessons: [
      {
        code: '02.01',
        orderIndex: 1,
        title: 'Semântica Pura vs Div Soup',
        slug: 'semantica-pura-vs-div-soup',
        durationMin: 20,
        difficulty: 'EASY',
        isCheckpoint: 0,
        objective: 'Construir documentos HTML que transmitem significado às tecnologias assistivas, spiders de busca e árvore de renderização.',
        prerequisites: ['MOD_01'],
        competences: ['HTML_SEM'],
        contentMarkdown: `# Semântica: O Esqueleto da Web

Usar \`<div>\` para tudo ("div soup") destrói a acessibilidade e prejudica o SEO.

### Tags Estruturais
- \`<header>\`, \`<nav>\`, \`<main>\`, \`<section>\`, \`<article>\`, \`<aside>\`, \`<footer>\`
- Formulários acessíveis: \`<label for="email">\`, \`<input id="email" type="email" required>\`, \`<fieldset>\`, \`<legend>\`.

### Acessibilidade (a11y)
Tecnologias assistivas (como leitores de tela) constroem a **Accessibility Tree** a partir da semântica do HTML.`,
        guidedPracticeMarkdown: 'Crie uma estrutura semântica de uma página de dashboard com header, navigation bar, main com 2 seções e footer.',
        expectedOutput: 'Documento semanticamente perfeito sem divs genéricas desnecessárias.',
        commentedSolution: '// O HTML semântico garante que seu site funcione para todos os usuários e robôs de busca.',
        resources: [{ title: 'MDN Semantic HTML', url: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html' }],
        videoTitle: 'Construindo Interfaces Semânticas e Acessíveis',
        exercise: {
          title: 'Validador de Estrutura Semântica',
          description: 'Crie uma função `validateSemanticStructure(htmlString)` que verifique se o HTML contém `<main>`, pelo menos um `<header>` e não possui tags sem fechamento básico.',
          initialCode: `function validateSemanticStructure(htmlString) {
  // Verifique se tem <main> e <header>
  
}`,
          solutionCode: `function validateSemanticStructure(htmlString) {
  const hasMain = /<main[\\s>]/i.test(htmlString) && /<\\/main>/i.test(htmlString);
  const hasHeader = /<header[\\s>]/i.test(htmlString) && /<\\/header>/i.test(htmlString);
  return {
    isValid: hasMain && hasHeader,
    hasMain,
    hasHeader
  };
}`,
          testCases: [
            { name: 'Deve aprovar HTML válido com header e main', assertion: 'const res = validateSemanticStructure("<header><h1>DevOS</h1></header><main><p>Content</p></main>"); return res.isValid === true && res.hasMain && res.hasHeader;' },
            { name: 'Deve reprovar HTML sem main', assertion: 'const res = validateSemanticStructure("<header><h1>DevOS</h1></header><div>content</div>"); return res.isValid === false && !res.hasMain;' }
          ],
          difficulty: 'EASY'
        }
      }
    ],
    project: {
      title: 'Portal de Documentação Técnica Semântico',
      slug: 'portal-documentacao-semantico',
      tier: 1,
      rubric: [
        { criterion: 'Uso de tags semânticas estruturais completas', weight: 40, description: 'header, nav, main, article, section, footer.' },
        { criterion: 'Formulários com labels e validação nativa', weight: 30, description: 'Campos tipados, aria-labels quando aplicável.' },
        { criterion: 'Acessibilidade de navegação por teclado', weight: 30, description: 'Tabindex adequado e foco visível.' }
      ],
      templateRepoUrl: 'https://github.com/developer-os/template-semantic-doc',
      requiredSkills: ['HTML_SEM']
    }
  },
  {
    code: 'MOD_03',
    orderIndex: 3,
    title: 'CSS/Interfaces & Design Systems',
    slug: 'css-interfaces',
    summary: 'Box model, Flexbox, CSS Grid, custom properties, Dark Mode, Tailwind CSS e a estética Developer OS de alto contraste.',
    icon: 'Palette',
    lessons: [
      {
        code: '03.01',
        orderIndex: 1,
        title: 'O Motor de Layout CSS: Flexbox & Grid Profissional',
        slug: 'flexbox-grid-profissional',
        durationMin: 25,
        difficulty: 'MEDIUM',
        isCheckpoint: 0,
        objective: 'Criar layouts responsivos complexos combinando CSS Grid para macroestruturas e Flexbox para microcomponentes.',
        prerequisites: ['MOD_02'],
        competences: ['CSS_UI'],
        contentMarkdown: `# Layouts Modernos com Flexbox e Grid

O CSS moderno superou a necessidade de hacks e tabelas.

### Flexbox (Unidimensional)
Ideal para alinhar itens em linha ou coluna:
- \`display: flex\`
- \`justify-content: space-between | center | flex-start\`
- \`align-items: center\`
- \`gap: 1rem\`

### CSS Grid (Bidimensional)
Ideal para estrutura completa de página:
\`\`\`css
.dashboard-grid {
  display: grid;
  grid-template-columns: 260px 1fr 320px;
  grid-template-rows: 64px 1fr;
  gap: 1.5rem;
}
\`\`\``,
        guidedPracticeMarkdown: 'Estruture um layout 3 colunas estilo terminal com sidebar de navegação, painel central de código e painel lateral de output.',
        expectedOutput: 'Layout responsivo que colapsa suavemente em telas menores.',
        commentedSolution: '// O CSS Grid define a carcaça da página e o Flexbox organiza os elementos internos.',
        resources: [{ title: 'CSS Grid Garden', url: 'https://cssgridgarden.com/' }],
        videoTitle: 'Arquitetando Interfaces de Alta Fidelidade',
        exercise: {
          title: 'Gerador de Estilos Responsivos Dinâmicos',
          description: 'Crie uma função `generateGridLayout(columns, gapPx)` que retorne o objeto de estilos inline com display, gridTemplateColumns e gap.',
          initialCode: `function generateGridLayout(columns, gapPx) {
  // Retorne o objeto de estilo CSS
  
}`,
          solutionCode: `function generateGridLayout(columns, gapPx) {
  return {
    display: "grid",
    gridTemplateColumns: typeof columns === "number" ? \`repeat(\${columns}, 1fr)\` : columns,
    gap: \`\${gapPx}px\`
  };
}`,
          testCases: [
            { name: 'Deve gerar grid com 3 colunas', assertion: 'const style = generateGridLayout(3, 16); return style.display === "grid" && style.gridTemplateColumns === "repeat(3, 1fr)" && style.gap === "16px";' }
          ],
          difficulty: 'EASY'
        }
      }
    ]
  },
  {
    code: 'MOD_04',
    orderIndex: 4,
    title: 'Lógica de Programação & Algoritmos',
    slug: 'logica-de-programacao',
    summary: 'Pensamento algorítmico rigoroso: condicionais, laços, estruturas de dados elementares, recursão e análise de complexidade.',
    icon: 'Binary',
    lessons: [
      {
        code: '04.01',
        orderIndex: 1,
        title: 'Pensamento Algorítmico e Resolução de Problemas',
        slug: 'pensamento-algoritmico',
        durationMin: 25,
        difficulty: 'MEDIUM',
        isCheckpoint: 0,
        objective: 'Decompor problemas complexos em etapas atômicas, determinísticas e tratadas contra edge cases.',
        prerequisites: ['MOD_00'],
        competences: ['PROG_LOGIC'],
        contentMarkdown: `# Lógica de Programação e Algoritmos

Programar não é saber sintaxe de cor: é ter a capacidade de modelar transformações de dados passo a passo.

### Pilares Algorítmicos:
1. **Sequência**: Ordem de execução causal.
2. **Seleção (Condicional)**: Tomada de decisão baseada em predicados booleanos.
3. **Repetição (Iteração)**: Processamento de coleções ou repetição com critério de parada.
4. **Estrutura de Dados**: Organização espacial dos dados na memória (vetores, pilhas, mapas).`,
        guidedPracticeMarkdown: 'Implemente uma busca binária que encontra o índice de um elemento em uma lista ordenada com complexidade O(log n).',
        expectedOutput: 'Algoritmo de busca binária eficiente.',
        commentedSolution: '// A busca binária divide o espaço de busca pela metade a cada iteração.',
        resources: [{ title: 'Visualizing Algorithms', url: 'https://visualgo.net/' }],
        videoTitle: 'Decomposição Algorítmica e Estruturas de Dados',
        exercise: {
          title: 'Algoritmo de Busca Binária',
          description: 'Implemente `binarySearch(arr, target)` que encontre o índice do item em um array ordenado em O(log n), ou retorne -1 caso não exista.',
          initialCode: `function binarySearch(arr, target) {
  // Implemente a busca binária
  
}`,
          solutionCode: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return -1;
}`,
          testCases: [
            { name: 'Deve encontrar elemento no meio', assertion: 'return binarySearch([10, 20, 30, 40, 50], 30) === 2;' },
            { name: 'Deve encontrar primeiro elemento', assertion: 'return binarySearch([1, 3, 5, 7, 9], 1) === 0;' },
            { name: 'Deve retornar -1 se não encontrar', assertion: 'return binarySearch([2, 4, 6, 8], 5) === -1;' }
          ],
          difficulty: 'MEDIUM'
        }
      }
    ]
  },
  {
    code: 'MOD_05',
    orderIndex: 5,
    title: 'JavaScript Moderno & Assincronismo',
    slug: 'javascript-moderno',
    summary: 'O motor V8 em profundidade: ES6+, closures, protótipos, Promises, async/await, Event Loop e manipulação do DOM.',
    icon: 'Code',
    lessons: [
      {
        code: '05.01',
        orderIndex: 1,
        title: 'Event Loop, Call Stack & Microtasks',
        slug: 'event-loop-e-assincronismo',
        durationMin: 30,
        difficulty: 'MEDIUM',
        isCheckpoint: 0,
        objective: 'Compreender como o JavaScript lida com operações não-bloqueantes em uma única thread principal.',
        prerequisites: ['MOD_04'],
        competences: ['JS_CORE'],
        contentMarkdown: `# O Motor JavaScript e o Event Loop

JavaScript é single-threaded e não bloqueante.

### Componentes de Execução:
- **Call Stack**: Pilha de chamadas de funções síncronas.
- **Web APIs / Node C++ APIs**: Onde timers, requisições de rede e I/O de disco rodam em background.
- **Callback Queue (Macrotasks)**: \`setTimeout\`, \`setInterval\`, I/O.
- **Microtask Queue**: \`Promise.then\`, \`queueMicrotask\`, \`process.nextTick\` (tem prioridade máxima após cada tick da stack).`,
        guidedPracticeMarkdown: 'Escreva um fluxo com setTimeout, Promise.resolve e console.log síncrono para prever e comprovar a ordem de execução no terminal.',
        expectedOutput: 'Compreensão exata da ordem de execução de microtasks vs macrotasks.',
        commentedSolution: '// As microtasks (Promises) sempre são esvaziadas antes do próximo macrotask.',
        resources: [{ title: 'JavaScript Event Loop Visualized', url: 'https://www.youtube.com/watch?v=8aGhZQkoFbQ' }],
        videoTitle: 'Desmistificando o Event Loop do JavaScript',
        exercise: {
          title: 'Implementando um Retry com Exponential Backoff',
          description: 'Crie uma função `async retryOperation(fn, maxRetries = 3, delayMs = 100)` que execute a função assíncrona `fn`. Se ela falhar, espere com backoff exponencial e tente novamente até `maxRetries`. Se todas falharem, lance o último erro.',
          initialCode: `async function retryOperation(fn, maxRetries = 3, delayMs = 100) {
  // Implemente o retry assíncrono
  
}`,
          solutionCode: `async function retryOperation(fn, maxRetries = 3, delayMs = 100) {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= maxRetries) throw err;
      const wait = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, wait));
    }
  }
}`,
          testCases: [
            { name: 'Deve retornar sucesso na primeira tentativa', assertion: 'let calls = 0; const res = await retryOperation(async () => { calls++; return "ok"; }); return res === "ok" && calls === 1;' },
            { name: 'Deve tentar novamente e suceder na 2a tentativa', assertion: 'let calls = 0; const res = await retryOperation(async () => { calls++; if (calls === 1) throw new Error("fail"); return "healed"; }, 3, 10); return res === "healed" && calls === 2;' }
          ],
          difficulty: 'HARD'
        }
      }
    ]
  },
  {
    code: 'MOD_06',
    orderIndex: 6,
    title: 'Git & GitHub Profissional',
    slug: 'git-github-profissional',
    summary: 'Controle de versão em times de alta performance: branches, merges, rebase interativo, squash, cherry-pick, PRs e Conventional Commits.',
    icon: 'GitBranch',
    lessons: [
      {
        code: '06.01',
        orderIndex: 1,
        title: 'A Grafo-Estrutura do Git e Rebase Interativo',
        slug: 'estrutura-git-rebase',
        durationMin: 25,
        difficulty: 'MEDIUM',
        isCheckpoint: 0,
        objective: 'Compreender commits como snapshots em um DAG (Directed Acyclic Graph) e manter um histórico limpo e linear.',
        prerequisites: ['MOD_01'],
        competences: ['GIT_VCS'],
        contentMarkdown: `# Git Profissional: Além do git add e git push

Git não armazena diffs: armazena **snapshots** (árvores de objetos SHA-1 imutáveis).

### Comandos de Poder:
- \`git rebase -i HEAD~N\`: Reorganiza, agrupa (squash) e limpa mensagens de commit.
- \`git cherry-pick <commit-hash>\`: Aplica um commit específico em outra branch.
- \`git stash push -m "wip" / git stash pop\`: Salva temporariamente trabalho incompleto.
- **Conventional Commits**: \`feat(auth): add jwt refresh token\`, \`fix(db): handle unique constraint error\`.`,
        guidedPracticeMarkdown: 'Simule a criação de uma branch feature, 3 commits atômicos e a unificação em um commit limpo via rebase.',
        expectedOutput: 'Histórico de commits claro, descritivo e auditável.',
        commentedSolution: '// Commits limpos e atômicos tornam o git bisect e revisões de código infinitamente mais fáceis.',
        resources: [{ title: 'Conventional Commits Spec', url: 'https://www.conventionalcommits.org/' }],
        videoTitle: 'Fluxos de Git em Equipes de Engenharia de Elite',
        exercise: {
          title: 'Validador de Conventional Commits',
          description: 'Crie uma função `validateCommitMessage(msg)` que valide se a mensagem segue o padrão `<type>(<scope>): <subject>` onde type é um de: feat, fix, docs, style, refactor, test, chore.',
          initialCode: `function validateCommitMessage(msg) {
  // Retorne { valid: boolean, type?: string, scope?: string, subject?: string }
  
}`,
          solutionCode: `function validateCommitMessage(msg) {
  const regex = /^(feat|fix|docs|style|refactor|test|chore)(\\([a-z0-9_-]+\\))?:\\s(.+)$/i;
  const match = msg.trim().match(regex);
  if (!match) return { valid: false };
  return {
    valid: true,
    type: match[1].toLowerCase(),
    scope: match[2] ? match[2].replace(/[()]/g, '') : undefined,
    subject: match[3]
  };
}`,
          testCases: [
            { name: 'Deve validar commit com scope', assertion: 'const res = validateCommitMessage("feat(auth): add jwt token support"); return res.valid === true && res.type === "feat" && res.scope === "auth";' },
            { name: 'Deve rejeitar commit fora do padrão', assertion: 'const res = validateCommitMessage("fixed some bugs and stuff"); return res.valid === false;' }
          ],
          difficulty: 'MEDIUM'
        }
      }
    ]
  },
  {
    code: 'MOD_07',
    orderIndex: 7,
    title: 'TypeScript & Type Safety',
    slug: 'typescript-type-safety',
    summary: 'Construindo código robusto em escala: tipos primitivos, union/intersection types, generics, type guards, utility types e strict mode.',
    icon: 'FileCode2',
    lessons: [
      {
        code: '07.01',
        orderIndex: 1,
        title: 'Generics Avançados e Narrowing de Tipos',
        slug: 'generics-e-narrowing',
        durationMin: 30,
        difficulty: 'MEDIUM',
        isCheckpoint: 0,
        objective: 'Criar abstrações flexíveis e com tipagem estrita sem recorrer a `any`.',
        prerequisites: ['MOD_05'],
        competences: ['TS_TYPES'],
        contentMarkdown: `# TypeScript: Eliminando Erros em Tempo de Compilação

TypeScript transforma o JavaScript de linguagem fracamente tipada em uma linguagem com garantia formal de tipos.

### Conceitos Críticos:
- **Generics**: Funções e classes que operam sobre tipos parametrizados (\`<T>\`).
- **Discriminated Unions**: Padrão chave para modelar estados seguros (\`type State = { status: 'loading' } | { status: 'success', data: T }\`).
- **Utility Types**: \`Partial<T>\`, \`Required<T>\`, \`Omit<T, K>\`, \`Pick<T, K>\`, \`Record<K, V>\`.`,
        guidedPracticeMarkdown: 'Crie uma interface genérica de ApiResponse<T> com discriminated unions para estados de loading, success e error.',
        expectedOutput: 'Contrato de tipagem estrito que impede acesso a dados inexistentes em estados de erro.',
        commentedSolution: '// O discriminated union obriga o desenvolvedor a verificar a propriedade de discriminação antes de acessar o payload.',
        resources: [{ title: 'TypeScript Deep Dive', url: 'https://basarat.gitbook.io/typescript' }],
        videoTitle: 'Type Safety e Modelagem de Domínio com TypeScript',
        exercise: {
          title: 'Implementando um Result Pattern Seguro',
          description: 'Crie duas funções factory em JS/TS: `createOk(value)` que retorne `{ isOk: true, isErr: false, value }` e `createErr(error)` que retorne `{ isOk: false, isErr: true, error }`. Crie também `unwrapResult(res)` que retorne `value` se isOk ou lance `error` se isErr.',
          initialCode: `function createOk(value) {
  // Implemente Ok
}
function createErr(error) {
  // Implemente Err
}
function unwrapResult(res) {
  // Implemente unwrap
}`,
          solutionCode: `function createOk(value) {
  return { isOk: true, isErr: false, value };
}
function createErr(error) {
  return { isOk: false, isErr: true, error };
}
function unwrapResult(res) {
  if (res.isOk) return res.value;
  throw typeof res.error === "string" ? new Error(res.error) : res.error;
}`,
          testCases: [
            { name: 'Deve desembrulhar resultado Ok', assertion: 'const ok = createOk({ user: "alex" }); return unwrapResult(ok).user === "alex";' },
            { name: 'Deve lançar erro ao desembrulhar Err', assertion: 'const err = createErr("DB_TIMEOUT"); try { unwrapResult(err); return false; } catch (e) { return e.message === "DB_TIMEOUT"; }' }
          ],
          difficulty: 'MEDIUM'
        }
      }
    ]
  },
  {
    code: 'MOD_08',
    orderIndex: 8,
    title: 'React & Component-Driven UI',
    slug: 'react-component-driven-ui',
    summary: 'A biblioteca do ecossistema moderno: JSX, Virtual DOM, Hooks profundos (useState, useEffect, useMemo, useCallback, useRef), Custom Hooks e State Management.',
    icon: 'Layers',
    lessons: [
      {
        code: '08.01',
        orderIndex: 1,
        title: 'Arquitetura de Estado e Render Cycles no React',
        slug: 'render-cycles-e-hooks',
        durationMin: 30,
        difficulty: 'MEDIUM',
        isCheckpoint: 0,
        objective: 'Compreender quando e por que componentes re-renderizam e como desacoplar lógica de negócio em custom hooks.',
        prerequisites: ['MOD_07'],
        competences: ['REACT_UI'],
        contentMarkdown: `# O Ciclo de Reconciliação do React

O React usa um algoritmo de reconciliação (Fiber) para atualizar o DOM real de forma eficiente.

### Regras Imutáveis:
1. **Estado é Imutável**: Nunca faça \`state.push(item)\`, sempre gere nova referência \`setState([...state, item])\`.
2. **Hooks só no Top-Level**: Nunca chame hooks dentro de loops ou condições.
3. **Efeitos com Dependências Claras**: O array de dependências do \`useEffect\` deve conter todos os valores do escopo do componente usados no efeito.`,
        guidedPracticeMarkdown: 'Construa um custom hook useLocalStorage para persistir e sincronizar estados com o storage do navegador.',
        expectedOutput: 'Hook reutilizável com tipagem e sincronização limpa.',
        commentedSolution: '// Custom hooks encapsulam lógica com estado sem duplicar código de renderização.',
        resources: [{ title: 'React Official Documentation', url: 'https://react.dev/' }],
        videoTitle: 'Hooks Profundos e Arquitetura de Componentes',
        exercise: {
          title: 'Simulador de Reducer com Ações',
          description: 'Implemente uma função `createStore(reducer, initialState)` que retorne `{ getState(), dispatch(action), subscribe(listener) }` demonstrando o padrão unidirecional do React / Redux.',
          initialCode: `function createStore(reducer, initialState) {
  // Implemente o padrão store
  
}`,
          solutionCode: `function createStore(reducer, initialState) {
  let state = initialState;
  const listeners = [];
  return {
    getState: () => state,
    dispatch: (action) => {
      state = reducer(state, action);
      listeners.forEach(fn => fn(state));
    },
    subscribe: (listener) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      };
    }
  };
}`,
          testCases: [
            { name: 'Deve inicializar e despachar ação', assertion: 'const counterReducer = (s, a) => a.type === "INC" ? { count: s.count + 1 } : s; const store = createStore(counterReducer, { count: 0 }); store.dispatch({ type: "INC" }); return store.getState().count === 1;' }
          ],
          difficulty: 'HARD'
        }
      }
    ]
  },
  {
    code: 'MOD_09',
    orderIndex: 9,
    title: 'Next.js & Server Components',
    slug: 'nextjs-server-components',
    summary: 'O framework de produção full-stack: App Router, React Server Components (RSC), Server Actions, Streaming SSR, layout caching e rotas dinâmicas.',
    icon: 'Globe',
    lessons: [
      {
        code: '09.01',
        orderIndex: 1,
        title: 'App Router e a Fronteira Servidor/Cliente',
        slug: 'app-router-e-rsc',
        durationMin: 30,
        difficulty: 'MEDIUM',
        isCheckpoint: 0,
        objective: 'Diferenciar Server Components (executados exclusivamente no Node/Edge) de Client Components (\'use client\').',
        prerequisites: ['MOD_08'],
        competences: ['NEXT_SSR'],
        contentMarkdown: `# Next.js App Router & Server Components

A web moderna transfere carga de computação e busca de dados para o servidor.

### Server Components vs Client Components
- **Server Components (Padrão)**: Acessam banco de dados diretamente, mantêm chaves secretas no servidor, reduzem o bundle JavaScript entregue ao cliente a 0 bytes.
- **Client Components (\`'use client'\`)**: Utilizados para interatividade, listeners de evento (\`onClick\`), hooks de estado (\`useState\`) e APIs de browser.`,
        guidedPracticeMarkdown: 'Crie uma rota dinâmica /modules/[id] com layout persistente e carregamento assíncrono com suspense boundary.',
        expectedOutput: 'Página renderizada no servidor com streaming de partes lentas.',
        commentedSolution: '// RSCs permitem buscar dados no servidor com latência zero para o banco sem expor credenciais.',
        resources: [{ title: 'Next.js App Router Docs', url: 'https://nextjs.org/docs' }],
        videoTitle: 'A Revolução dos React Server Components',
        exercise: {
          title: 'Parser de Rotas Dinâmicas do Next.js',
          description: 'Crie uma função `matchDynamicRoute(pattern, actualPath)` que case rotas como `/modules/[id]/lessons/[lessonId]` com caminhos como `/modules/mod_05/lessons/05.02` e retorne os parâmetros `{ id: "mod_05", lessonId: "05.02" }` ou null se não casar.',
          initialCode: `function matchDynamicRoute(pattern, actualPath) {
  // Implemente o extrator de rotas dinâmicas
  
}`,
          solutionCode: `function matchDynamicRoute(pattern, actualPath) {
  const pParts = pattern.split('/').filter(Boolean);
  const aParts = actualPath.split('/').filter(Boolean);
  if (pParts.length !== aParts.length) return null;
  const params = {};
  for (let i = 0; i < pParts.length; i++) {
    const p = pParts[i];
    const a = aParts[i];
    if (p.startsWith('[') && p.endsWith(']')) {
      const key = p.slice(1, -1);
      params[key] = a;
    } else if (p !== a) {
      return null;
    }
  }
  return params;
}`,
          testCases: [
            { name: 'Deve extrair múltiplos parâmetros', assertion: 'const res = matchDynamicRoute("/courses/[courseId]/modules/[modId]", "/courses/fullstack/modules/mod_09"); return res && res.courseId === "fullstack" && res.modId === "mod_09";' },
            { name: 'Deve retornar null para rotas incompatíveis', assertion: 'return matchDynamicRoute("/users/[id]", "/courses/123") === null;' }
          ],
          difficulty: 'MEDIUM'
        }
      }
    ]
  },
  {
    code: 'MOD_10',
    orderIndex: 10,
    title: 'APIs RESTful & Protocolo HTTP',
    slug: 'apis-e-http',
    summary: 'Comunicação cliente-servidor: Verbos HTTP (GET, POST, PUT, PATCH, DELETE), Status Codes, Headers, CORS, Rate Limiting e Design de APIs.',
    icon: 'Network',
    lessons: [
      {
        code: '10.01',
        orderIndex: 1,
        title: 'Arquitetura HTTP e Contratos RESTful',
        slug: 'arquitetura-http-e-rest',
        durationMin: 25,
        difficulty: 'MEDIUM',
        isCheckpoint: 0,
        objective: 'Desenhar endpoints idempotentes, semânticos e seguros usando o protocolo HTTP.',
        prerequisites: ['MOD_05'],
        competences: ['API_HTTP'],
        contentMarkdown: `# O Protocolo HTTP/1.1, HTTP/2 e REST

A comunicação na web é governada por mensagens de requisição e resposta estruturadas.

### Verbos e Idempotência:
- **GET**: Leitura de recurso. Seguro e idempotente.
- **POST**: Criação de recurso subordinado. Não idempotente.
- **PUT**: Substituição integral do recurso. Idempotente.
- **PATCH**: Atualização parcial de campos.
- **DELETE**: Remoção de recurso. Idempotente.

### Famílias de Status Code:
- **2xx**: Sucesso (\`200 OK\`, \`201 Created\`, \`204 No Content\`)
- **4xx**: Erro do Cliente (\`400 Bad Request\`, \`401 Unauthorized\`, \`403 Forbidden\`, \`404 Not Found\`, \`422 Unprocessable\`)
- **5xx**: Erro do Servidor (\`500 Internal Server Error\`, \`502 Bad Gateway\`, \`503 Service Unavailable\`)`,
        guidedPracticeMarkdown: 'Escreva um roteador Express com endpoints CRUD para gerenciamento de exercícios com validação de payload.',
        expectedOutput: 'API RESTful completa com códigos de status precisos.',
        commentedSolution: '// O design semântico de APIs reduz ambiguidade e facilita a integração de clientes.',
        resources: [{ title: 'RESTful API Guidelines', url: 'https://github.com/zalando/restful-api-guidelines' }],
        videoTitle: 'Design de APIs Robustas e Protocolo HTTP',
        exercise: {
          title: 'Middleware de Validação de Esquema de API',
          description: 'Crie uma função `validateSchema(schema, body)` que receba um objeto de regras como `{ email: { type: "string", required: true }, age: { type: "number" } }` e retorne `{ valid: boolean, errors: string[] }`.',
          initialCode: `function validateSchema(schema, body) {
  // Implemente a validação
  
}`,
          solutionCode: `function validateSchema(schema, body) {
  const errors = [];
  for (const [key, rule] of Object.entries(schema)) {
    const val = body[key];
    if (rule.required && (val === undefined || val === null || val === '')) {
      errors.push(\`Field \${key} is required\`);
      continue;
    }
    if (val !== undefined && val !== null && rule.type && typeof val !== rule.type) {
      errors.push(\`Field \${key} must be a \${rule.type}\`);
    }
  }
  return {
    valid: errors.length === 0,
    errors
  };
}`,
          testCases: [
            { name: 'Deve aprovar payload válido', assertion: 'const res = validateSchema({ name: { type: "string", required: true }, age: { type: "number" } }, { name: "Diego", age: 30 }); return res.valid === true;' },
            { name: 'Deve reprovar campo obrigatório faltante', assertion: 'const res = validateSchema({ name: { type: "string", required: true } }, {}); return res.valid === false && res.errors.length === 1;' }
          ],
          difficulty: 'MEDIUM'
        }
      }
    ]
  },
  {
    code: 'MOD_11',
    orderIndex: 11,
    title: 'Banco de Dados Relacional & SQL',
    slug: 'banco-de-dados-sql',
    summary: 'Persistência estruturada: Modelagem relacional, chaves primárias/estrangeiras, índices B-Tree, queries SQL avançadas, transações ACID e WAL mode.',
    icon: 'Database',
    lessons: [
      {
        code: '11.01',
        orderIndex: 1,
        title: 'Modelagem Relacional, Índices e Transações ACID',
        slug: 'modelagem-indices-acid',
        durationMin: 30,
        difficulty: 'MEDIUM',
        isCheckpoint: 0,
        objective: 'Modelar esquemas relacionais normalizados, criar índices para performance e executar transações atômicas seguras.',
        prerequisites: ['MOD_10'],
        competences: ['DB_DATA'],
        contentMarkdown: `# Bancos de Dados Relacionais e SQL

A garantia de integridade dos dados é o coração de qualquer aplicação comercial.

### As Propriedades ACID:
- **Atomicidade**: Todas as operações de uma transação acontecem com sucesso ou nenhuma é gravada (Rollback).
- **Consistência**: O banco transita de um estado válido para outro de acordo com as regras (constraints).
- **Isolamento**: Transações simultâneas não interferem umas nas outras.
- **Durabilidade**: Uma vez confirmada (commit), a gravação resiste a falhas e quedas de energia.`,
        guidedPracticeMarkdown: 'Escreva queries SQL com JOINs complexos, agregações GROUP BY e índices explicados via EXPLAIN QUERY PLAN.',
        expectedOutput: 'Consultas performáticas sem full table scans.',
        commentedSolution: '// Índices B-Tree transformam buscas O(n) em O(log n), fundamentais para tabelas com milhares de registros.',
        resources: [{ title: 'Use The Index, Luke!', url: 'https://use-the-index-luke.com/' }],
        videoTitle: 'Engenharia de Bancos de Dados e Otimização SQL',
        exercise: {
          title: 'Mini Query Builder SQL',
          description: 'Crie uma função `buildSelectQuery(table, { where, limit, offset, orderBy })` que gere a string SQL parametrizada e o array de parâmetros seguros.',
          initialCode: `function buildSelectQuery(table, options = {}) {
  // Gere { sql: string, params: any[] }
  
}`,
          solutionCode: `function buildSelectQuery(table, options = {}) {
  let sql = \`SELECT * FROM \${table}\`;
  const params = [];
  if (options.where && Object.keys(options.where).length > 0) {
    const clauses = [];
    for (const [k, v] of Object.entries(options.where)) {
      clauses.push(\`\${k} = ?\`);
      params.push(v);
    }
    sql += \` WHERE \${clauses.join(' AND ')}\`;
  }
  if (options.orderBy) {
    sql += \` ORDER BY \${options.orderBy}\`;
  }
  if (options.limit) {
    sql += \` LIMIT ?\`;
    params.push(options.limit);
  }
  if (options.offset) {
    sql += \` OFFSET ?\`;
    params.push(options.offset);
  }
  return { sql, params };
}`,
          testCases: [
            { name: 'Deve gerar query com WHERE e LIMIT parametrizados', assertion: 'const q = buildSelectQuery("users", { where: { role: "ADMIN" }, limit: 10 }); return q.sql === "SELECT * FROM users WHERE role = ? LIMIT ?" && q.params[0] === "ADMIN" && q.params[1] === 10;' }
          ],
          difficulty: 'MEDIUM'
        }
      }
    ]
  },
  {
    code: 'MOD_12',
    orderIndex: 12,
    title: 'Autenticação, JWT & Autorização RBAC',
    slug: 'autenticacao-e-usuarios',
    summary: 'Segurança de identidade: Hashes com Bcrypt, Tokens JWT assinados, Refresh Tokens, Cookies HttpOnly, Sessões e Controle de Acesso Baseado em Papéis.',
    icon: 'ShieldCheck',
    lessons: [
      {
        code: '12.01',
        orderIndex: 1,
        title: 'Arquitetura de Autenticação Segura e RBAC',
        slug: 'jwt-bcrypt-e-rbac',
        durationMin: 30,
        difficulty: 'HARD',
        isCheckpoint: 0,
        objective: 'Implementar autenticação stateless com tokens criptografados e proteção de rotas por perfis (STUDENT, ADMIN, MENTOR).',
        prerequisites: ['MOD_11'],
        competences: ['AUTH_SEC'],
        contentMarkdown: `# Autenticação e Autorização em Nível de Produção

Senhas nunca são armazenadas em texto plano.

### Ciclo Criptográfico de Senha:
1. Ao cadastrar: \`password\` + \`salt\` -> \`bcrypt.hash(password, 10)\` -> salvo no banco.
2. Ao autenticar: \`bcrypt.compare(candidate, hash)\`.
3. Ao logar: Gera JWT assinado com chave secreta contendo claims (\`sub\`, \`role\`, \`exp\`).
4. Em cada requisição: Middleware extrai \`Bearer <token>\`, verifica assinatura e injeta \`req.user\`.`,
        guidedPracticeMarkdown: 'Implemente um middleware de autorização requireRole("ADMIN") que bloqueie acessos não autorizados com status 403.',
        expectedOutput: 'Controle de acesso rigoroso por perfil.',
        commentedSolution: '// O token JWT stateless permite escalabilidade horizontal mantendo a verificação criptográfica imediata.',
        resources: [{ title: 'OWASP Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html' }],
        videoTitle: 'Protegendo Aplicações com JWT e RBAC',
        exercise: {
          title: 'Middleware de Permissões RBAC',
          description: 'Crie uma função `createRbacGuard(allowedRoles)` que retorne uma função `(userRole) => boolean` validando se o usuário possui a permissão requerida.',
          initialCode: `function createRbacGuard(allowedRoles) {
  // Retorne a função guard
  
}`,
          solutionCode: `function createRbacGuard(allowedRoles) {
  const rolesSet = new Set(Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]);
  return (userRole) => {
    if (!userRole) return false;
    return rolesSet.has(userRole) || rolesSet.has('*');
  };
}`,
          testCases: [
            { name: 'Deve permitir role presente na lista', assertion: 'const guard = createRbacGuard(["ADMIN", "MENTOR"]); return guard("ADMIN") === true && guard("STUDENT") === false;' }
          ],
          difficulty: 'EASY'
        }
      }
    ]
  },
  {
    code: 'MOD_13',
    orderIndex: 13,
    title: 'Arquitetura Full-Stack Desacoplada',
    slug: 'arquitetura-full-stack',
    summary: 'Design de sistemas escaláveis: Clean Architecture, Camadas (Controller, Service, Repository), Contratos de API tipados e Separação de Responsabilidades.',
    icon: 'Boxes',
    lessons: [
      {
        code: '13.01',
        orderIndex: 1,
        title: 'Princípios de Separação de Camadas e Inversão de Controle',
        slug: 'separacao-de-camadas',
        durationMin: 30,
        difficulty: 'HARD',
        isCheckpoint: 0,
        objective: 'Estruturar backends desacoplados onde a regra de negócio não depende do framework HTTP nem do banco de dados.',
        prerequisites: ['MOD_12'],
        competences: ['FULLSTACK_ARCH'],
        contentMarkdown: `# Clean Architecture e Separação de Responsabilidades

Regras de negócio nunca devem ficar espalhadas dentro de controllers do Express ou rotas de API.

### Camadas Padrão:
- **Controllers**: Recebem requisição HTTP, extraem dados, chamam o serviço e formatam a resposta.
- **Services / Use Cases**: Executam a lógica de negócio pura, validações de regra e orquestração.
- **Repositories / Data Access**: Apenas executam queries SQL ou persistência de dados.`,
        guidedPracticeMarkdown: 'Refatore um endpoint monolítico separando em UserDTO, UserService e UserRepository.',
        expectedOutput: 'Código testável, modular e de fácil manutenção.',
        commentedSolution: '// O desacoplamento facilita a escrita de testes unitários sem precisar subir bancos de dados ou servidores HTTP.',
        resources: [{ title: 'Clean Architecture by Robert C. Martin', url: 'https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html' }],
        videoTitle: 'Arquitetando Aplicações Full-Stack Escaláveis',
        exercise: {
          title: 'Implementando um Injetor de Dependências Simples',
          description: 'Crie uma classe `Container` com métodos `register(name, factory)` e `resolve(name)` que gerencie e resolva instâncias de serviços sob demanda.',
          initialCode: `class Container {
  constructor() {
    // Inicialize o registro
  }
  register(name, factory) {
    // Registre factory
  }
  resolve(name) {
    // Resolva instância
  }
}`,
          solutionCode: `class Container {
  constructor() {
    this.services = new Map();
    this.singletons = new Map();
  }
  register(name, factory, isSingleton = true) {
    this.services.set(name, { factory, isSingleton });
  }
  resolve(name) {
    const definition = this.services.get(name);
    if (!definition) throw new Error(\`Service \${name} not found\`);
    if (definition.isSingleton) {
      if (!this.singletons.has(name)) {
        this.singletons.set(name, definition.factory(this));
      }
      return this.singletons.get(name);
    }
    return definition.factory(this);
  }
}`,
          testCases: [
            { name: 'Deve registrar e resolver dependências', assertion: 'const c = new Container(); c.register("config", () => ({ port: 4000 })); c.register("server", (c) => ({ url: "localhost:" + c.resolve("config").port })); return c.resolve("server").url === "localhost:4000";' }
          ],
          difficulty: 'HARD'
        }
      }
    ]
  },
  {
    code: 'MOD_14',
    orderIndex: 14,
    title: 'Arquivos, Uploads & Integrações',
    slug: 'arquivos-e-integracoes',
    summary: 'Manipulação de arquivos em larga escala: Streams de I/O, multipart/form-data, upload para Object Storage (S3/GCS/R2), Webhooks e filas assíncronas.',
    icon: 'CloudUpload',
    lessons: [
      {
        code: '14.01',
        orderIndex: 1,
        title: 'Streams de Arquivos e Armazenamento em Nuvem',
        slug: 'streams-e-object-storage',
        durationMin: 25,
        difficulty: 'MEDIUM',
        isCheckpoint: 0,
        objective: 'Processar uploads pesados sem estourar a memória RAM do servidor usando streams.',
        prerequisites: ['MOD_13'],
        competences: ['FILES_INTEGRATION'],
        contentMarkdown: `# Processamento de Arquivos com Streams

Carregar um arquivo de 2GB inteiro na memória RAM de um servidor derruba o processo com \`JavaScript heap out of memory\`.

### O Poder dos Streams:
- **Readable Streams**: Fontes de dados lidas em chunks (pedaços de 64KB).
- **Writable Streams**: Destinos de dados que recebem chunks.
- **Transform Streams**: Modificam os chunks em trânsito (ex: compressão gzip, criptografia).
- \`pipeline(readableStream, transformStream, writableStream)\`.`,
        guidedPracticeMarkdown: 'Crie uma pipeline de stream que leia um arquivo texto, converta para maiúsculas e grave no destino.',
        expectedOutput: 'Processamento eficiente com consumo constante de RAM desprezível.',
        commentedSolution: '// Streams permitem lidar com dados infinitos ou gigabytes de informação com poucos megabytes de memória.',
        resources: [{ title: 'Node.js Stream Documentation', url: 'https://nodejs.org/api/stream.html' }],
        videoTitle: 'Streams e Upload Escalável de Arquivos',
        exercise: {
          title: 'Calculador de Chunks de Upload',
          description: 'Crie uma função `calculateUploadChunks(fileSizeBytes, chunkSize = 5 * 1024 * 1024)` que retorne a lista de partes com `{ partNumber, startByte, endByte, size }`.',
          initialCode: `function calculateUploadChunks(fileSizeBytes, chunkSize = 5242880) {
  // Calcule os chunks
  
}`,
          solutionCode: `function calculateUploadChunks(fileSizeBytes, chunkSize = 5242880) {
  const chunks = [];
  let start = 0;
  let partNumber = 1;
  while (start < fileSizeBytes) {
    const end = Math.min(start + chunkSize, fileSizeBytes);
    chunks.push({
      partNumber,
      startByte: start,
      endByte: end,
      size: end - start
    });
    start = end;
    partNumber++;
  }
  return chunks;
}`,
          testCases: [
            { name: 'Deve dividir arquivo de 12MB em 3 chunks de 5MB, 5MB e 2MB', assertion: 'const chunks = calculateUploadChunks(12 * 1024 * 1024, 5 * 1024 * 1024); return chunks.length === 3 && chunks[0].size === 5242880 && chunks[2].size === 2097152;' }
          ],
          difficulty: 'MEDIUM'
        }
      }
    ]
  },
  {
    code: 'MOD_15',
    orderIndex: 15,
    title: 'IA para Developers & LLM Integration',
    slug: 'ia-para-developers',
    summary: 'Engenharia de IA em produção: Gemini API, System Prompts avançados, Structured Outputs (JSON Schema), Embeddings vetoriais, RAG e Function Calling.',
    icon: 'Bot',
    lessons: [
      {
        code: '15.01',
        orderIndex: 1,
        title: 'Engenharia de Prompts e Structured Outputs com Gemini',
        slug: 'gemini-api-structured-outputs',
        durationMin: 30,
        difficulty: 'HARD',
        isCheckpoint: 0,
        objective: 'Integrar modelos de linguagem aos fluxos de backend garantindo respostas determinísticas e tipadas em JSON Schema.',
        prerequisites: ['MOD_13'],
        competences: ['AI_DEV'],
        contentMarkdown: `# Integração de IA e LLMs para Engenheiros

LLMs não são chatbots soltos: são **motores semânticos e de raciocínio** que funcionam como microsserviços cognitivos.

### Pilares de Integração:
1. **System Prompt**: Define o papel, restrições inquebráveis e critérios de avaliação do modelo.
2. **Few-Shot Examples**: Fornecer exemplos explícitos de input e output esperado reduz alucinações a zero.
3. **Structured Outputs**: Forçar o modelo a responder estritamente dentro de um JSON Schema validado pelo backend.
4. **Scaffolding Progressivo**: Ensinar o aluno sem entregar respostas prontas.`,
        guidedPracticeMarkdown: 'Implemente uma chamada à API do Gemini com structured output schema para avaliar a complexidade assintótica de um código.',
        expectedOutput: 'Retorno estrito em JSON contendo timeComplexity, spaceComplexity e rationale.',
        commentedSolution: '// O schema JSON garantido permite plugar o retorno da IA diretamente no banco de dados da aplicação.',
        resources: [{ title: 'Google Gemini API Docs', url: 'https://ai.google.dev/docs' }],
        videoTitle: 'Construindo Aplicações Inteligentes com a Gemini API',
        exercise: {
          title: 'Formatador de Prompt com Contexto Dinâmico do Aluno',
          description: 'Crie uma função `buildMentorPrompt(studentState, userMessage)` que injete o nível do aluno, competências frágeis e o histórico de erros no template do System Prompt.',
          initialCode: `function buildMentorPrompt(studentState, userMessage) {
  // Gere o prompt contextualizado
  
}`,
          solutionCode: `function buildMentorPrompt(studentState, userMessage) {
  const fragileSkills = (studentState.fragileSkills || []).join(', ') || 'None';
  const hintLevel = studentState.hintLevel || 1;
  return {
    systemInstruction: \`You are DEVELOPER_OS_AI_MENTOR. Current student level: \${studentState.level}. Fragile skills: \${fragileSkills}. Current scaffolding level: \${hintLevel}/5 (1=Reflective question, 2=Conceptual clue, 3=Area pointer, 4=Detailed guide, 5=Commented solution). Do not give answers directly unless hintLevel is 5.\`,
    userPrompt: userMessage
  };
}`,
          testCases: [
            { name: 'Deve gerar prompt com instruções de scaffolding', assertion: 'const p = buildMentorPrompt({ level: "INTERMEDIATE", fragileSkills: ["CSS_UI"], hintLevel: 2 }, "Como centralizo uma div?"); return p.systemInstruction.includes("Current scaffolding level: 2/5") && p.systemInstruction.includes("CSS_UI");' }
          ],
          difficulty: 'MEDIUM'
        }
      }
    ]
  },
  {
    code: 'MOD_16',
    orderIndex: 16,
    title: 'Progressive Web Apps (PWA) & Offline',
    slug: 'pwa-offline',
    summary: 'Transformando web em aplicação nativa: Web App Manifest, Service Workers (Lifecycle, Fetch intercept), Estratégias de Cache (Cache First, Network First, Stale While Revalidate) e IndexedDB.',
    icon: 'Smartphone',
    lessons: [
      {
        code: '16.01',
        orderIndex: 1,
        title: 'Service Workers e Estratégias de Cache Resilientes',
        slug: 'service-workers-e-cache',
        durationMin: 30,
        difficulty: 'HARD',
        isCheckpoint: 0,
        objective: 'Instalar Service Workers, interceptar eventos de rede e fornecer funcionamento completo offline.',
        prerequisites: ['MOD_08'],
        competences: ['PWA_OFFLINE'],
        contentMarkdown: `# Progressive Web Apps (PWA) e Operação Offline

PWAs unem o alcance universal da web à experiência de aplicativos instaláveis de alta performance.

### Estratégias de Cache do Service Worker:
- **Cache First**: Busca primeiro no cache local do Service Worker; só vai à rede se faltar (ideal para assets estáticos e fontes).
- **Network First**: Tenta a rede; se falhar ou offline, usa a cópia do cache (ideal para dados dinâmicos recentes).
- **Stale While Revalidate**: Retorna imediatamente a cópia em cache (latência zero) e atualiza o cache em background com a resposta da rede.`,
        guidedPracticeMarkdown: 'Registre um Service Worker com evento fetch interceptando requisições e aplicando Stale-While-Revalidate.',
        expectedOutput: 'Aplicação que carrega instantaneamente mesmo em modo avião.',
        commentedSolution: '// O Service Worker atua como um proxy reverso programável no dispositivo do usuário.',
        resources: [{ title: 'Google Web.dev PWA Guide', url: 'https://web.dev/progressive-web-apps/' }],
        videoTitle: 'Construindo Progressive Web Apps de Alto Desempenho',
        exercise: {
          title: 'Simulador de Roteador de Estratégia de Cache',
          description: 'Crie uma função `selectCacheStrategy(url)` que retorne "CACHE_FIRST" para arquivos estáticos (.js, .css, .woff2, .png), "NETWORK_FIRST" para `/api/` e "STALE_WHILE_REVALIDATE" para páginas HTML.',
          initialCode: `function selectCacheStrategy(url) {
  // Retorne a estratégia correta
  
}`,
          solutionCode: `function selectCacheStrategy(url) {
  if (/\\.(js|css|woff2|png|svg|jpg)$/i.test(url)) return 'CACHE_FIRST';
  if (url.includes('/api/')) return 'NETWORK_FIRST';
  return 'STALE_WHILE_REVALIDATE';
}`,
          testCases: [
            { name: 'Deve identificar assets estáticos como CACHE_FIRST', assertion: 'return selectCacheStrategy("/assets/app.123.js") === "CACHE_FIRST";' },
            { name: 'Deve identificar endpoints de API como NETWORK_FIRST', assertion: 'return selectCacheStrategy("https://api.devos.academy/api/progress") === "NETWORK_FIRST";' }
          ],
          difficulty: 'EASY'
        }
      }
    ],
    project: {
      title: 'Developer OS Mobile & Desktop PWA Hub',
      slug: 'developer-os-pwa-hub',
      tier: 2,
      rubric: [
        { criterion: 'Manifest com suporte a standalone e maskable icons', weight: 30, description: 'Instalável na Home do Android/iOS/Desktop.' },
        { criterion: 'Service worker com fallback offline para aulas e code lab', weight: 40, description: 'Navegação offline perfeita em lições cacheadas.' },
        { criterion: 'Sincronização de progresso e attempts ao recuperar conexão', weight: 30, description: 'Fila de eventos locais enviada com sucesso.' }
      ],
      templateRepoUrl: 'https://github.com/developer-os/template-pwa-hub',
      requiredSkills: ['PWA_OFFLINE']
    }
  },
  {
    code: 'MOD_17',
    orderIndex: 17,
    title: 'Debugging Profissional & Tracing',
    slug: 'debugging-profissional',
    summary: 'A arte do diagnóstico cirúrgico: Chrome DevTools, Memory Leaks, Heap Snapshots, Call Stacks, Source Maps, Profiling de Performance e Análise de Causa Raiz.',
    icon: 'Bug',
    lessons: [
      {
        code: '17.01',
        orderIndex: 1,
        title: 'Diagnóstico Sistemático de Bugs e Memory Leaks',
        slug: 'diagnostico-sistematico-bugs',
        durationMin: 25,
        difficulty: 'MEDIUM',
        isCheckpoint: 0,
        objective: 'Localizar causas raízes de erros assíncronos e vazamentos de memória usando tracing estruturado.',
        prerequisites: ['MOD_05'],
        competences: ['DEBUGGING_PRO'],
        contentMarkdown: `# Debugging Profissional: Ciência vs Adivinhação

Desenvolvedores amadores tentam alterar código aleatoriamente até "funcionar". Engenheiros seniores usam o **Método Científico de Debugging**:

1. **Reproduzir** o defeito consistentemente com teste mínimo.
2. **Formular hipóteses** baseadas na pilha de execução (Stack Trace).
3. **Isolar variáveis** usando breakpoints condicionais ou tracing.
4. **Validar a causa raiz** e aplicar a correção sem efeitos colaterais.
5. **Escrever teste de regressão** para garantir que o bug nunca volte.`,
        guidedPracticeMarkdown: 'Inspecione um vazamento de memória gerado por event listeners não removidos em componentes desmontados.',
        expectedOutput: 'Identificação e resolução do leak comprovada no profilador de heap.',
        commentedSolution: '// Todo event listener registrado em window ou socket deve ser limpo na desmontagem do componente.',
        resources: [{ title: 'Chrome DevTools Memory Profiling', url: 'https://developer.chrome.com/docs/devtools/memory-problems' }],
        videoTitle: 'Metodologias Avançadas de Debugging',
        exercise: {
          title: 'Parser de Stack Trace de Erro',
          description: 'Crie uma função `parseErrorStackTrace(errorStack)` que extraia o nome do erro, a mensagem e uma lista de frames com `{ functionName, file, line, column }`.',
          initialCode: `function parseErrorStackTrace(errorStack) {
  // Implemente o parser de stack
  
}`,
          solutionCode: `function parseErrorStackTrace(errorStack) {
  const lines = errorStack.trim().split('\\n');
  const header = lines[0] || '';
  const [errorName, ...msgParts] = header.split(': ');
  const message = msgParts.join(': ');
  const frames = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(/^at\\s+(?:([^\\s(]+)\\s+\\((.+):(\\d+):(\\d+)\\)|(.+):(\\d+):(\\d+))$/);
    if (match) {
      if (match[1]) {
        frames.push({
          functionName: match[1],
          file: match[2],
          line: parseInt(match[3], 10),
          column: parseInt(match[4], 10)
        });
      } else {
        frames.push({
          functionName: '<anonymous>',
          file: match[5],
          line: parseInt(match[6], 10),
          column: parseInt(match[7], 10)
        });
      }
    }
  }
  return { errorName, message, frames };
}`,
          testCases: [
            { name: 'Deve parsear frame com nome de função', assertion: 'const stack = "TypeError: Cannot read property of undefined\\n    at calculateScore (/app/service.js:42:15)"; const parsed = parseErrorStackTrace(stack); return parsed.errorName === "TypeError" && parsed.frames[0].functionName === "calculateScore" && parsed.frames[0].line === 42;' }
          ],
          difficulty: 'MEDIUM'
        }
      }
    ]
  },
  {
    code: 'MOD_18',
    orderIndex: 18,
    title: 'Testes Automatizados & TDD',
    slug: 'testes-automatizados',
    summary: 'A pirâmide de testes na prática: Testes Unitários (Vitest/Jest), Testes de Integração (Supertest), Mocks controlados, TDD e Cobertura de Código.',
    icon: 'CheckCircle2',
    lessons: [
      {
        code: '18.01',
        orderIndex: 1,
        title: 'Pirâmide de Testes e TDD Prático',
        slug: 'piramide-testes-tdd',
        durationMin: 30,
        difficulty: 'MEDIUM',
        isCheckpoint: 0,
        objective: 'Escrever suítes de testes determinísticas e confiáveis guiando o design de software com TDD.',
        prerequisites: ['MOD_13'],
        competences: ['TESTING_QA'],
        contentMarkdown: `# Testes de Software Profissionais

Código sem teste é código que você tem medo de alterar.

### A Pirâmide de Testes:
1. **Testes Unitários (Base)**: Rápidos (milissegundos), isolados, testam lógica pura sem I/O real.
2. **Testes de Integração (Meio)**: Testam comunicação entre banco de dados, serviços e rotas de API.
3. **Testes End-to-End / E2E (Topo)**: Validam jornadas completas de usuário através do navegador.`,
        guidedPracticeMarkdown: 'Escreva um ciclo Red-Green-Refactor para implementar um motor de cálculo de proficiência de skills.',
        expectedOutput: 'Suíte de testes automatizados com cobertura > 90%.',
        commentedSolution: '// O TDD força o código a nascer desacoplado e fácil de testar desde a primeira linha.',
        resources: [{ title: 'Vitest Testing Framework', url: 'https://vitest.dev/' }],
        videoTitle: 'Construindo Software com Testes e TDD',
        exercise: {
          title: 'Implementando um Mini Test Runner (describe, it, expect)',
          description: 'Crie uma função `runMiniTest(testName, testFn)` que execute a função de teste e retorne `{ name: testName, status: "PASSED" | "FAILED", error?: string, durationMs: number }`.',
          initialCode: `async function runMiniTest(testName, testFn) {
  // Execute o teste e capture o status
  
}`,
          solutionCode: `async function runMiniTest(testName, testFn) {
  const start = Date.now();
  try {
    await testFn();
    return {
      name: testName,
      status: "PASSED",
      durationMs: Date.now() - start
    };
  } catch (err) {
    return {
      name: testName,
      status: "FAILED",
      error: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - start
    };
  }
}`,
          testCases: [
            { name: 'Deve retornar PASSED para teste sem erros', assertion: 'const res = await runMiniTest("soma", () => { if (1 + 1 !== 2) throw new Error("bad"); }); return res.status === "PASSED";' },
            { name: 'Deve retornar FAILED para teste com assertion com erro', assertion: 'const res = await runMiniTest("falha", () => { throw new Error("AssertionFailed"); }); return res.status === "FAILED" && res.error === "AssertionFailed";' }
          ],
          difficulty: 'MEDIUM'
        }
      }
    ]
  },
  {
    code: 'MOD_19',
    orderIndex: 19,
    title: 'Segurança de Software & OWASP',
    slug: 'seguranca-de-software',
    summary: 'Blindagem em camadas: OWASP Top 10, sanitização de inputs, prevenção de XSS, CSRF, SQL Injection, Helmet, Rate Limiting e gerenciamento de segredos.',
    icon: 'Lock',
    lessons: [
      {
        code: '19.01',
        orderIndex: 1,
        title: 'OWASP Top 10 e Sanitização Defensiva',
        slug: 'owasp-top-10-e-sanitizacao',
        durationMin: 30,
        difficulty: 'HARD',
        isCheckpoint: 0,
        objective: 'Identificar e mitigar vulnerabilidades críticas de segurança em aplicações web full-stack.',
        prerequisites: ['MOD_12'],
        competences: ['SECURITY_HARD'],
        contentMarkdown: `# Segurança e Programação Defensiva

Todo input vindo do cliente é potencialmente hostil.

### As Vulnerabilidades Mais Críticas:
- **SQL Injection**: Uso de strings concatenadas em queries. *Prevenção: Queries parametrizadas obrigatórias.*
- **Cross-Site Scripting (XSS)**: Injeção de scripts no DOM de outros usuários. *Prevenção: Escape de HTML, Content Security Policy (CSP).*
- **Broken Access Control (IDOR)**: Acesso a dados de outro usuário alterando IDs na URL. *Prevenção: Validação de ownership no backend.*`,
        guidedPracticeMarkdown: 'Audite um endpoint vulnerável a SQL Injection e refatore para prepared statements com sanitização.',
        expectedOutput: 'Código 100% imune a injeção SQL e manipulação de parâmetros.',
        commentedSolution: '// Queries parametrizadas separam a estrutura do comando dos dados, tornando injeção impossível.',
        resources: [{ title: 'OWASP Top 10 Project', url: 'https://owasp.org/www-project-top-ten/' }],
        videoTitle: 'Blindagem de Aplicações e OWASP Top 10',
        exercise: {
          title: 'Sanitizador de Inputs Contra XSS',
          description: 'Crie uma função `sanitizeHtmlInput(inputStr)` que escape os caracteres perigosos `<`, `>`, `&`, `"`, `\'` em suas entidades HTML correspondentes.',
          initialCode: `function sanitizeHtmlInput(inputStr) {
  // Implemente o escape seguro
  
}`,
          solutionCode: `function sanitizeHtmlInput(inputStr) {
  if (typeof inputStr !== 'string') return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return inputStr.replace(/[&<>"']/g, (m) => map[m]);
}`,
          testCases: [
            { name: 'Deve escapar script tag perigosa', assertion: 'const res = sanitizeHtmlInput("<script>alert(1)</script>"); return res === "&lt;script&gt;alert(1)&lt;/script&gt;";' },
            { name: 'Deve escapar aspas e ampersands', assertion: 'const res = sanitizeHtmlInput(\'"name" & "value"\'); return res === "&quot;name&quot; &amp; &quot;value&quot;";' }
          ],
          difficulty: 'EASY'
        }
      }
    ]
  },
  {
    code: 'MOD_20',
    orderIndex: 20,
    title: 'Deploy, Nuvem & Produção',
    slug: 'deploy-e-producao',
    summary: 'Colocando software no mundo: Docker, Containers, CI/CD com GitHub Actions, Vercel, Railway, variáveis de ambiente seguras e monitoramento de uptime.',
    icon: 'Server',
    lessons: [
      {
        code: '20.01',
        orderIndex: 1,
        title: 'Containerização com Docker e Pipelines de CI/CD',
        slug: 'docker-e-cicd',
        durationMin: 30,
        difficulty: 'MEDIUM',
        isCheckpoint: 0,
        objective: 'Empacotar aplicações em containers Docker reproduzíveis e automatizar testes e deploys contínuos.',
        prerequisites: ['MOD_01'],
        competences: ['DEPLOY_CLOUD'],
        contentMarkdown: `# Deploys Modernos e Infraestrutura como Código

"Na minha máquina funciona" não é desculpa aceitável na engenharia de software moderna.

### Docker e Contêineres:
- **Dockerfile**: Receita com camadas imutáveis (\`FROM node:22-alpine\`, \`COPY\`, \`RUN npm ci\`, \`CMD\`).
- **Multi-stage Builds**: Separa ambiente de compilação do container enxuto de produção final.
- **CI/CD**: Automação que roda linter, testes e build a cada push e só autoriza o deploy se tudo passar.`,
        guidedPracticeMarkdown: 'Escreva um Dockerfile multi-stage para uma aplicação Node/TypeScript que resulte em imagem ultraleve.',
        expectedOutput: 'Imagem Docker enxuta e segura.',
        commentedSolution: '// O multi-stage build descarta dependências de desenvolvimento e ferramentas de compilação da imagem final.',
        resources: [{ title: 'Docker Best Practices for Node.js', url: 'https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md' }],
        videoTitle: 'Containerização e Automação de CI/CD',
        exercise: {
          title: 'Validador de Dockerfile Multi-Stage',
          description: 'Crie uma função `validateDockerfile(dockerfileContent)` que verifique se o arquivo possui pelo menos 2 estágios (`FROM ... AS ...`), copia arquivos com `COPY --from=` e define um `USER node` ou usuário não-root por segurança.',
          initialCode: `function validateDockerfile(dockerfileContent) {
  // Valide as boas práticas do Dockerfile
  
}`,
          solutionCode: `function validateDockerfile(dockerfileContent) {
  const fromMatches = dockerfileContent.match(/^FROM\\s+.+\\s+AS\\s+\\w+/gmi) || [];
  const hasMultiStage = fromMatches.length >= 1 && (dockerfileContent.match(/^FROM\\s+/gmi) || []).length >= 2;
  const hasCopyFrom = /COPY\\s+--from=/i.test(dockerfileContent);
  const hasNonRootUser = /USER\\s+(?!root\\b)\\w+/i.test(dockerfileContent);
  
  return {
    isCompliant: hasMultiStage && hasCopyFrom && hasNonRootUser,
    hasMultiStage,
    hasCopyFrom,
    hasNonRootUser
  };
}`,
          testCases: [
            { name: 'Deve aprovar Dockerfile multi-stage seguro', assertion: 'const df = "FROM node:22 AS builder\\nWORKDIR /app\\nRUN npm run build\\nFROM node:22-alpine\\nCOPY --from=builder /app/dist ./dist\\nUSER node\\nCMD [\\"node\\", \\"dist/index.js\\"]"; const res = validateDockerfile(df); return res.isCompliant === true;' }
          ],
          difficulty: 'MEDIUM'
        }
      }
    ]
  },
  {
    code: 'MOD_21',
    orderIndex: 21,
    title: 'Manutenção de Software & Refatoração',
    slug: 'manutencao-de-software',
    summary: 'Sustentabilidade de código: Princípios SOLID, Code Smells, Métricas de Complexidade Ciclomática, Débito Técnico e Estratégias de Migração Segura.',
    icon: 'Wrench',
    lessons: [
      {
        code: '21.01',
        orderIndex: 1,
        title: 'Princípios SOLID e Eliminação de Code Smells',
        slug: 'solid-e-refatoracao',
        durationMin: 30,
        difficulty: 'HARD',
        isCheckpoint: 0,
        objective: 'Refatorar código legado aplicando os princípios SOLID para aumentar coesão e reduzir acoplamento.',
        prerequisites: ['MOD_13'],
        competences: ['SOFTWARE_MAINT'],
        contentMarkdown: `# Manutenção de Software e SOLID

90% do tempo de um engenheiro de software é gasto lendo e mantendo código existente, não escrevendo código do zero.

### Os Princípios SOLID:
- **S (Single Responsibility)**: Uma classe/módulo deve ter um único motivo para mudar.
- **O (Open/Closed)**: Aberto para extensão, fechado para modificação.
- **L (Liskov Substitution)**: Subclasses devem poder substituir suas classes base sem quebrar o sistema.
- **I (Interface Segregation)**: Muitas interfaces específicas são melhores que uma interface gorda.
- **D (Dependency Inversion)**: Dependa de abstrações, não de implementações concretas.`,
        guidedPracticeMarkdown: 'Identifique violações de Single Responsibility em uma classe God Object e fatie em serviços especializados.',
        expectedOutput: 'Classes pequenas, coesas e com responsabilidades delimitadas.',
        commentedSolution: '// Aplicar SOLID previne o apodrecimento arquitetural do software ao longo dos anos.',
        resources: [{ title: 'Refactoring Guru', url: 'https://refactoring.guru/' }],
        videoTitle: 'Engenharia de Refatoração e SOLID na Prática',
        exercise: {
          title: 'Calculador de Complexidade Ciclomática',
          description: 'Crie uma função `calculateComplexity(codeString)` que calcule a complexidade ciclomática aproximada contando pontos de decisão: `if`, `else if`, `for`, `while`, `case`, `&&`, `||`, `? :`. Base inicial = 1.',
          initialCode: `function calculateComplexity(codeString) {
  // Calcule a complexidade
  
}`,
          solutionCode: `function calculateComplexity(codeString) {
  let complexity = 1;
  const keywords = [/\\bif\\b/g, /\\bfor\\b/g, /\\bwhile\\b/g, /\\bcase\\b/g, /\\bcatch\\b/g];
  const operators = [/&&/g, /\\|\\|/g, /\\?\\s*[^:]+:/g];
  
  for (const regex of keywords) {
    const matches = codeString.match(regex);
    if (matches) complexity += matches.length;
  }
  for (const regex of operators) {
    const matches = codeString.match(regex);
    if (matches) complexity += matches.length;
  }
  return complexity;
}`,
          testCases: [
            { name: 'Deve calcular complexidade básica', assertion: 'const code = "function test(x, y) { if (x > 0 && y > 0) { return true; } else if (x < 0) { return false; } return null; }"; return calculateComplexity(code) === 4;' }
          ],
          difficulty: 'MEDIUM'
        }
      }
    ]
  },
  {
    code: 'MOD_22',
    orderIndex: 22,
    title: 'Developer com IA & Fluxos Autônomos',
    slug: 'developer-com-ia',
    summary: 'A nova era da engenharia: Pair programming com IA, agentes autônomos, geração de testes guiada, revisão automática de PRs e raciocínio ampliado.',
    icon: 'Sparkles',
    lessons: [
      {
        code: '22.01',
        orderIndex: 1,
        title: 'Fluxos de Alta Produtividade com Agentes e Copilotos',
        slug: 'fluxos-com-agentes',
        durationMin: 30,
        difficulty: 'ADVANCED',
        isCheckpoint: 0,
        objective: 'Orquestrar agentes de IA para acelerar o desenvolvimento, validação de regras de negócio e refatoração assistida.',
        prerequisites: ['MOD_15'],
        competences: ['AI_WORKFLOWS'],
        contentMarkdown: `# O Desenvolvedor Aumentado por IA

A IA não substitui o engenheiro de software: o engenheiro que domina a IA substitui o engenheiro que apenas escreve código mecânico.

### Habilidades Críticas do Desenvolvedor com IA:
1. **Especificação Rigorosa**: Capacidade de descrever arquitetura, contratos e invariantes sem ambiguidades.
2. **Revisão Crítica**: Auditar código gerado por IA com olhar clínico para edge cases, segurança e performance.
3. **Loop de Feedback Autônomo**: Criar suítes de testes que alimentam o agente para auto-correção iterativa.`,
        guidedPracticeMarkdown: 'Construa um fluxo de desenvolvimento em que a IA gera uma suíte de testes de estresse para um componente crítico.',
        expectedOutput: 'Fluxo produtivo 10x mais rápido mantendo 100% de precisão técnica.',
        commentedSolution: '// O desenvolvedor atua como arquiteto e auditor supremo do sistema.',
        resources: [{ title: 'Building Effective Agents', url: 'https://www.anthropic.com/research/building-effective-agents' }],
        videoTitle: 'Orquestração de Agentes e Engenharia Aumentada',
        exercise: {
          title: 'Implementando um Loop de Auto-Reflexão de Agente',
          description: 'Crie uma função `async runAgentEvaluationLoop(task, evaluatorFn, maxIterations = 3)` que execute uma iteração gerando uma solução, passe pelo evaluatorFn e, se falhar, use o feedback de erro para re-tentar até que passe ou esgote as iterações.',
          initialCode: `async function runAgentEvaluationLoop(task, evaluatorFn, maxIterations = 3) {
  // Implemente o loop avaliativo
  
}`,
          solutionCode: `async function runAgentEvaluationLoop(task, evaluatorFn, maxIterations = 3) {
  let solution = task.initialProposal || "attempt_1";
  let history = [];
  
  for (let i = 1; i <= maxIterations; i++) {
    const evalResult = await evaluatorFn(solution);
    if (evalResult.passed) {
      return { success: true, iterations: i, solution, history };
    }
    history.push({ iteration: i, solution, feedback: evalResult.feedback });
    solution = \`\${solution}_refined_with_\${evalResult.feedback}\`;
  }
  return { success: false, iterations: maxIterations, solution, history };
}`,
          testCases: [
            { name: 'Deve alcançar sucesso com refinamento', assertion: 'let count = 0; const res = await runAgentEvaluationLoop({ initialProposal: "v1" }, async (sol) => { count++; return { passed: count === 2, feedback: "needs_types" }; }); return res.success === true && res.iterations === 2;' }
          ],
          difficulty: 'HARD'
        }
      }
    ]
  },
  {
    code: 'MOD_23',
    orderIndex: 23,
    title: 'Developer Challenge — Exame Final de Mestria',
    slug: 'developer-challenge',
    summary: 'A prova definitiva do Developer OS: 4 etapas rigorosas para demonstrar autonomia total na construção, diagnóstico e defesa técnica de software de ponta a ponta.',
    icon: 'Award',
    lessons: [
      {
        code: '23.01',
        orderIndex: 1,
        title: 'O Exame Final: Conhecimento, Debugging, Feature Surpresa & Defesa',
        slug: 'exame-final-de-mestria',
        durationMin: 60,
        difficulty: 'ADVANCED',
        isCheckpoint: 1,
        objective: 'Concluir com sucesso as 4 etapas do exame prático e defender suas decisões arquiteturais perante o Mentor IA.',
        prerequisites: ['MOD_00', 'MOD_01', 'MOD_02', 'MOD_03', 'MOD_04', 'MOD_05', 'MOD_06', 'MOD_07', 'MOD_08', 'MOD_09', 'MOD_10', 'MOD_11', 'MOD_12', 'MOD_13', 'MOD_14', 'MOD_15', 'MOD_16', 'MOD_17', 'MOD_18', 'MOD_19', 'MOD_20', 'MOD_21', 'MOD_22'],
        competences: ['CAPSTONE_EXAM'],
        contentMarkdown: `# Developer Challenge: A Prova Final de Autonomia

Você chegou ao momento culminante do Developer OS. Aqui não há tutoriais, nem respostas prontas.

### As 4 Etapas do Exame Final:
1. **Etapa 1: Conhecimento Teórico-Prático Adaptativo** (10 questões de alta profundidade).
2. **Etapa 2: Debugging de Sistema em Produção** (Diagnosticar e consertar um bug crítico em código legado com time limit).
3. **Etapa 3: Feature Surpresa** (Implementar uma funcionalidade complexa não prevista na especificação original mantendo type safety e testes).
4. **Etapa 4: Defesa Técnica com o Mentor IA** (O Mentor questionará suas decisões de arquitetura, trade-offs e complexidade algorítmica).`,
        guidedPracticeMarkdown: 'Inicie a simulação do exame pelo HUD do Developer OS.',
        expectedOutput: 'Aprovação nas 4 etapas com pontuação >= 75% e status MASTERED.',
        commentedSolution: '// O verdadeiro desenvolvedor se comprova pela capacidade de raciocinar sob pressão e defender suas soluções.',
        resources: [{ title: 'Developer OS Graduation Guidelines', url: '#' }],
        videoTitle: 'Instruções Oficiais para o Developer Challenge',
        exercise: {
          title: 'Etapa 3: Implementação da Feature Surpresa de Rate Limiting com Sliding Window',
          description: 'Implemente a classe `SlidingWindowRateLimiter(maxRequests, windowMs)` com método `isAllowed(userId, timestamp)` que permita no máximo `maxRequests` no intervalo de `windowMs` milissegundos utilizando o algoritmo de janela deslizante.',
          initialCode: `class SlidingWindowRateLimiter {
  constructor(maxRequests, windowMs) {
    // Inicialize o rate limiter
  }
  isAllowed(userId, timestamp = Date.now()) {
    // Retorne true se permitido ou false se estourou
  }
}`,
          solutionCode: `class SlidingWindowRateLimiter {
  constructor(maxRequests, windowMs) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.userRequests = new Map();
  }
  isAllowed(userId, timestamp = Date.now()) {
    if (!this.userRequests.has(userId)) {
      this.userRequests.set(userId, []);
    }
    const timestamps = this.userRequests.get(userId);
    const windowStart = timestamp - this.windowMs;
    
    // Filtra requisições fora da janela
    while (timestamps.length > 0 && timestamps[0] <= windowStart) {
      timestamps.shift();
    }
    
    if (timestamps.length < this.maxRequests) {
      timestamps.push(timestamp);
      return true;
    }
    return false;
  }
}`,
          testCases: [
            { name: 'Deve permitir requisições dentro do limite', assertion: 'const limiter = new SlidingWindowRateLimiter(3, 1000); return limiter.isAllowed("user1", 100) && limiter.isAllowed("user1", 200) && limiter.isAllowed("user1", 300);' },
            { name: 'Deve bloquear 4a requisição na mesma janela de tempo', assertion: 'const limiter = new SlidingWindowRateLimiter(3, 1000); limiter.isAllowed("user1", 100); limiter.isAllowed("user1", 200); limiter.isAllowed("user1", 300); return limiter.isAllowed("user1", 400) === false;' },
            { name: 'Deve liberar após expiração da janela', assertion: 'const limiter = new SlidingWindowRateLimiter(2, 500); limiter.isAllowed("u", 100); limiter.isAllowed("u", 200); return limiter.isAllowed("u", 800) === true;' }
          ],
          difficulty: 'ADVANCED'
        }
      }
    ]
  }
];
