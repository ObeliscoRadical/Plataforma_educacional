# 🚀 DEVELOPER OS — Sistema de Formação Integral de Software Engineer

> **A plataforma de mentoria prática com Inteligência Artificial, sala de aula interativa, live execution stepper e gamificação do zero ao Tech Lead.**

---

## 🌟 Recursos Principais

- **🎓 Sala de Aula Virtual com Professor**: Videoaula com áudio neural em português, quadro didático de arquitetura e digitação de código ao vivo na tela.
- **💻 Laboratório de Mãos Dadas com o Mentor**: Editor de código integrado dentro da aula com execução instantânea no sandbox (`⌘+Enter`) e feedback falado em tempo real.
- **🔍 Raio-X do Código (Live Stepper)**: Visualizador de execução linha a linha com painel de variáveis vivas na memória Stack e Heap.
- **🐛 Conserte o Bug do Estagiário**: Desafios reais de pair debugging com stack traces de produção e recompensas de XP.
- **🎙️ Mentor IA com Entrada e Saída de Voz**: Converse por voz em português com o Professor Marcus para tirar dúvidas conceituais e obter pistas socráticas (Scaffolding L1 a L5).
- **🌳 Árvore de Habilidades RPG**: Skill tree visual interativa dividida em 5 Estágios de Mestria (60+ missões atômicas).
- **⚡ Arena de Speed Coding**: Desafios blitz de 60 segundos com multiplicadores de combo streak e ranking de pontuação.
- **🖥️ Live DOM & Component Sandbox**: Renderização em tempo real de interfaces HTML/CSS com Hot Reload.

---

## 🛠️ Stack Tecnológica

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Web Speech API, Progressive Web App (PWA).
- **Backend**: Node.js, Express, WebSocket (`ws`), SQLite3 (WAL Mode), Google Gemini 3.6 Flash, Free Neural TTS (`edge-tts`).
- **DevOps**: Docker, Nixpacks, Railway ready.

---

## 🚀 Como Rodar Localmente

### 1. Clonar e Instalar Dependências
```bash
git clone https://github.com/SEU_USUARIO/developer-os.git
cd developer-os

# Instalar dependências do Backend e Frontend
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` dentro da pasta `backend/`:
```env
PORT=4050
NODE_ENV=development
JWT_SECRET=devos-super-secret-key
DATABASE_PATH=./data/developer_os.sqlite
GEMINI_API_KEY=SUA_CHAVE_GEMINI_AQUI
GEMINI_MODEL=gemini-3.6-flash
```

### 3. Popular o Banco de Dados e Iniciar
```bash
# Na pasta raiz:
npm run seed
npm run dev
```
Acesse no seu navegador:
- **Frontend**: `http://localhost:5173/`
- **Backend**: `http://localhost:4050/`

---

## 🚂 Como Publicar na Railway (Passo a Passo)

1. Crie um novo repositório no seu **GitHub** (ex: `developer-os`).
2. Envie o código para o GitHub:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/developer-os.git
   git branch -M main
   git push -u origin main
   ```
3. Acesse [Railway.app](https://railway.app) e faça login com seu GitHub.
4. Clique em **`+ New Project`** ➔ **`Deploy from GitHub repo`** ➔ Selecione `developer-os`.
5. Em **Variables** (Variáveis de Ambiente), adicione:
   - `GEMINI_API_KEY`: sua chave da API do Google Gemini.
   - `JWT_SECRET`: uma chave secreta qualquer (ex: `devos-prod-key-12345`).
   - `NODE_ENV`: `production`
6. O Railway irá compilar o frontend, gerar o banco SQLite e colocar a plataforma no ar automaticamente! 🎉
