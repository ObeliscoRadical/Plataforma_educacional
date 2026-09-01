# 🎓 PLATAFORMA EDUCACIONAL (Developer OS)

> **Sistema Completo de Formação de Software Engineer com Inteligência Artificial, Sala de Aula Interativa, Mentor IA com Voz, Painel de Governança, Stripe (R$ 9,90/mês) e Banco de Dados MongoDB + SQLite.**

---

## 🌟 Recursos da Plataforma

- **🔐 Tela Inicial de Login & Cadastro**: Primeira tela do sistema ao abrir a URL com validação e segurança JWT.
- **💳 Paywall & Assinatura Stripe (R$ 9,90/mês)**: Ativação instantânea e integração com cartão/Pix via Stripe Checkout.
- **👑 Painel de Administração & Governança (Admin Hub)**:
  - Controle de mensalidades, faturamento MRR e extrato financeiro.
  - Gestão de alunos: aprovação manual de assinaturas, suspensão e reset de progresso.
  - Telemetria em tempo real de acessos, streak de dias e frequência de estudo.
- **🎓 Sala de Aula Virtual Interativa**: Professor Marcus com áudio neural em português e digitação na tela.
- **🎙️ Mentor IA 24/7 com Entrada e Saída de Voz**: Suporte a microfone e respostas faladas instantâneas.
- **🔍 Raio-X do Código (Live Stepper)**: Visualizador de memória Stack e Heap passo a passo.
- **🐛 Conserte o Bug do Estagiário**: Desafios de pair debugging com stack traces reais.
- **⚡ Arena Blitz de Speed Coding**: Desafios de 60 segundos com multiplicadores de combo streak.
- **🍃 Suporte Nativo a MongoDB**: Conexão com MongoDB no Railway ou MongoDB Atlas (`MONGODB_URI`).

---

## 🚂 Como Publicar na Railway + MongoDB (Passo a Passo)

### 1. Criar o Repositório no GitHub
1. Acesse o [GitHub.com/new](https://github.com/new) e crie um novo repositório com o nome:
   👉 **`Plataforma_educacional`**
2. No seu computador/terminal, envie o código:
   ```bash
   cd "/Users/diegooliveira/.gemini/antigravity/scratch/developer-os"

   # Adicione o link do seu repositório:
   git remote add origin https://github.com/SEU_USUARIO/Plataforma_educacional.git
   git branch -M main
   git push -u origin main
   ```

---

### 2. Criar o Projeto na Railway
1. Acesse **[railway.app](https://railway.app)** e faça login com seu GitHub.
2. Clique em **`+ New Project`** ➔ Selecione **`Deploy from GitHub repo`**.
3. Escolha o repositório **`Plataforma_educacional`**.

---

### 3. Adicionar o Banco de Dados MongoDB na Railway (1 Clique)
1. No painel do seu projeto na Railway, clique em **`+ Create`** ➔ **`Database`** ➔ Selecione **`Add MongoDB`**.
2. A Railway criará automaticamente um cluster MongoDB dedicado e injetará a variável de ambiente **`MONGO_URI` / `MONGODB_URI`** no seu serviço web!

---

### 4. Configurar as Variáveis de Ambiente no Serviço Web
Na aba **Variables** do seu serviço web na Railway, adicione:

| Variável | Valor Recomendado | Descrição |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Modo de execução em produção |
| `JWT_SECRET` | `plataforma-edu-secret-key-2026-prod` | Chave de segurança dos tokens JWT |
| `GEMINI_API_KEY` | *(Sua chave da API do Google Gemini)* | Inteligência Artificial do Mentor |
| `STRIPE_SECRET_KEY` | *(Sua chave do Stripe `sk_live_...` ou `sk_test_...`)* | Gateway de pagamento R$ 9,90/mês |
| `STRIPE_WEBHOOK_SECRET` | *(Chave do webhook do Stripe)* | Confirmação automática de pagamentos |

---

### 5. Gerar Domínio Público
Na aba **Settings** do serviço na Railway:
- Clique em **`Generate Domain`** para receber seu link oficial com HTTPS (ex: `https://plataforma-educacional-production.up.railway.app`).

---

## 💻 Como Rodar Localmente

```bash
# 1. Instalar dependências
npm install
npm run build

# 2. Iniciar servidor de desenvolvimento
npm run dev
```
- **Frontend**: `http://localhost:5173/`
- **Backend API**: `http://localhost:4050/`
