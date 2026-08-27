export interface SkillSeed {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  icon: string;
}

export const skillsSeedData: SkillSeed[] = [
  {
    id: 'skill_soft_arch',
    code: 'SOFT_ARCH',
    name: 'Fundamentos e Arquitetura de Software',
    category: 'FUNDAMENTALS',
    description: 'Entendimento de hardware, SO, processos, memória, HTTP e fluxo de requisições.',
    icon: 'Cpu'
  },
  {
    id: 'skill_dev_env',
    code: 'DEV_ENV',
    name: 'Ambiente de Desenvolvimento Unix & CLI',
    category: 'DEVOPS',
    description: 'Domínio de terminal, shells, scripts, variáveis de ambiente e editor moderno.',
    icon: 'Terminal'
  },
  {
    id: 'skill_html_sem',
    code: 'HTML_SEM',
    name: 'HTML Semântico & Acessibilidade',
    category: 'FRONTEND',
    description: 'Estruturação semântica, formulários acessíveis, SEO técnico e DOM.',
    icon: 'Layout'
  },
  {
    id: 'skill_css_ui',
    code: 'CSS_UI',
    name: 'CSS Moderno, Layouts & Design Systems',
    category: 'FRONTEND',
    description: 'Flexbox, Grid, Variáveis CSS, Tailwind, Glassmorphism e responsividade.',
    icon: 'Palette'
  },
  {
    id: 'skill_prog_logic',
    code: 'PROG_LOGIC',
    name: 'Lógica Algorítmica e Estruturas de Dados',
    category: 'FUNDAMENTALS',
    description: 'Condicionais, loops, arrays, pilhas, filas, recursão e complexidade básica.',
    icon: 'Binary'
  },
  {
    id: 'skill_js_core',
    code: 'JS_CORE',
    name: 'JavaScript Moderno (ES6+) & Assincronismo',
    category: 'FRONTEND',
    description: 'Closures, Promises, async/await, Event Loop, prototype e manipulação do DOM.',
    icon: 'Code'
  },
  {
    id: 'skill_git_vcs',
    code: 'GIT_VCS',
    name: 'Git & Controle de Versão Profissional',
    category: 'DEVOPS',
    description: 'Branches, merges, rebase interativo, pull requests, conventional commits.',
    icon: 'GitBranch'
  },
  {
    id: 'skill_ts_types',
    code: 'TS_TYPES',
    name: 'TypeScript & Type Safety',
    category: 'FRONTEND',
    description: 'Tipagem estática, generics, utility types, interfaces, guards e strict mode.',
    icon: 'FileCode2'
  },
  {
    id: 'skill_react_ui',
    code: 'REACT_UI',
    name: 'React & Component-Driven Architecture',
    category: 'FRONTEND',
    description: 'Hooks (useState, useEffect, useMemo, custom hooks), context, lifecycle e state.',
    icon: 'Layers'
  },
  {
    id: 'skill_next_ssr',
    code: 'NEXT_SSR',
    name: 'Next.js, Server Components & App Router',
    category: 'FRONTEND',
    description: 'SSR, SSG, Server Actions, rotas dinâmicas, layout nested e cache.',
    icon: 'Globe'
  },
  {
    id: 'skill_api_http',
    code: 'API_HTTP',
    name: 'APIs RESTful & Protocolo HTTP',
    category: 'BACKEND',
    description: 'Verbos HTTP, headers, status codes, payload JSON, CORS e design de rotas.',
    icon: 'Network'
  },
  {
    id: 'skill_db_data',
    code: 'DB_DATA',
    name: 'Banco de Dados Relacional & Modelagem',
    category: 'BACKEND',
    description: 'SQL, chaves primárias/estrangeiras, índices, transações ACID, normalização.',
    icon: 'Database'
  },
  {
    id: 'skill_auth_sec',
    code: 'AUTH_SEC',
    name: 'Autenticação, JWT & Autorização RBAC',
    category: 'BACKEND',
    description: 'Bcrypt, tokens JWT, refresh tokens, cookies seguros, sessões e permissões.',
    icon: 'ShieldCheck'
  },
  {
    id: 'skill_fullstack_arch',
    code: 'FULLSTACK_ARCH',
    name: 'Arquitetura Full-Stack Desacoplada',
    category: 'ARCHITECTURE',
    description: 'Clean architecture, camadas de serviço/repositório, contratos de API.',
    icon: 'Boxes'
  },
  {
    id: 'skill_files_integrations',
    code: 'FILES_INTEGRATION',
    name: 'Upload de Arquivos & Integração com Serviços',
    category: 'BACKEND',
    description: 'Streams, armazenamento em bucket/S3, webhooks e APIs de terceiros.',
    icon: 'CloudUpload'
  },
  {
    id: 'skill_ai_dev',
    code: 'AI_DEV',
    name: 'Engenharia de IA & LLM Integration',
    category: 'AI_ENGINEERING',
    description: 'Gemini API, embeddings, structured outputs, prompt engineering e agentes.',
    icon: 'Bot'
  },
  {
    id: 'skill_pwa_offline',
    code: 'PWA_OFFLINE',
    name: 'Progressive Web Apps & Estratégias Offline',
    category: 'FRONTEND',
    description: 'Service Workers, Cache API, Web Manifest, sincronização e instalação.',
    icon: 'Smartphone'
  },
  {
    id: 'skill_debugging_pro',
    code: 'DEBUGGING_PRO',
    name: 'Debugging Sistemático & Tracing',
    category: 'FUNDAMENTALS',
    description: 'Breakpoints, heap snapshots, call stacks, profiling e análise de causa raiz.',
    icon: 'Bug'
  },
  {
    id: 'skill_testing_qa',
    code: 'TESTING_QA',
    name: 'Testes Automatizados (Unit, Integration, E2E)',
    category: 'DEVOPS',
    description: 'Vitest, Jest, Supertest, TDD, mocks controlados e cobertura de código.',
    icon: 'CheckCircle2'
  },
  {
    id: 'skill_security_hard',
    code: 'SECURITY_HARD',
    name: 'Segurança de Software & OWASP Top 10',
    category: 'ARCHITECTURE',
    description: 'Prevenção de XSS, CSRF, SQL Injection, sanitização e rate limiting.',
    icon: 'Lock'
  },
  {
    id: 'skill_deploy_cloud',
    code: 'DEPLOY_CLOUD',
    name: 'Deploy Contínuo, CI/CD & Nuvem',
    category: 'DEVOPS',
    description: 'Docker, GitHub Actions, Vercel/Railway, monitoramento e logs de produção.',
    icon: 'Server'
  },
  {
    id: 'skill_software_maint',
    code: 'SOFTWARE_MAINT',
    name: 'Manutenção, Refatoração & Resiliência',
    category: 'ARCHITECTURE',
    description: 'Code smells, princípios SOLID, DRY, débito técnico e migrações seguras.',
    icon: 'Wrench'
  },
  {
    id: 'skill_ai_workflows',
    code: 'AI_WORKFLOWS',
    name: 'Fluxos Avançados de Developer com IA',
    category: 'AI_ENGINEERING',
    description: 'Pair programming autônomo, geração de testes com IA e copiloto cognitivo.',
    icon: 'Sparkles'
  },
  {
    id: 'skill_capstone_exam',
    code: 'CAPSTONE_EXAM',
    name: 'Developer Mastery & Technical Defense',
    category: 'ARCHITECTURE',
    description: 'Capacidade de construir, defender e sustentar sistemas complexos de ponta a ponta.',
    icon: 'Award'
  }
];
