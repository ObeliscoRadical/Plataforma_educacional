import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { 
  Terminal, Shield, KeyRound, User, Mail, Sparkles, 
  CheckCircle2, Lock, Cpu, Video, Bot, Zap, ArrowRight, ShieldCheck
} from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [emailOrHandle, setEmailOrHandle] = useState('student@devos.academy');
  const [password, setPassword] = useState('student123');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'LOGIN') {
        await login(emailOrHandle, password);
      } else {
        if (registerPassword !== confirmPassword) {
          setError('As senhas não coincidem. Verifique a confirmação.');
          setLoading(false);
          return;
        }
        if (registerPassword.length < 6) {
          setError('A senha deve conter no mínimo 6 caracteres.');
          setLoading(false);
          return;
        }

        const cleanHandle = handle.replace(/^@/, '').trim().toLowerCase();
        await register({ email, password: registerPassword, name, handle: cleanHandle });
      }
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação. Verifique os dados inseridos.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStudent = () => {
    setEmailOrHandle('student@devos.academy');
    setPassword('student123');
    setActiveTab('LOGIN');
  };

  const handleQuickAdmin = () => {
    setEmailOrHandle('admin@devos.academy');
    setPassword('admin123');
    setActiveTab('LOGIN');
  };

  return (
    <div className="min-h-screen bg-dev-bg text-dev-text flex flex-col justify-between selection:bg-dev-green selection:text-dev-bg relative overflow-hidden">
      {/* Background Cybernetic Grid FX */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none"></div>

      {/* Top Brand Bar */}
      <header className="px-6 py-4 border-b border-dev-border/70 flex items-center justify-between bg-dev-bg/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-dev-green/15 border border-dev-green/40 flex items-center justify-center text-dev-green">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-wider flex items-center gap-2">
              <span>DEVELOPER OS</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-dev-green/20 text-dev-green border border-dev-green/40 font-bold">
                v1.0-PRO
              </span>
            </div>
            <div className="text-[10px] text-zinc-400">
              Formação Integral de Software Engineer com Inteligência Artificial
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-dev-green animate-pulse"></span>
          <span className="hidden sm:inline">KERNEL ONLINE</span>
        </div>
      </header>

      {/* Main Authentication Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 z-10">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Platform Value Proposition */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-dev-cyan/10 text-dev-cyan border border-dev-cyan/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>DO ZERO AO TECH LEAD</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                Aprenda a Programar no Ambiente dos Engenheiros de Verdade.
              </h1>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sala de aula interativa com professor virtual, mentor IA com voz 24/7, raio-x de execução passo a passo e desafios reais de pair debugging.
              </p>
            </div>

            {/* Feature Highlights List */}
            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2.5 p-2 rounded bg-dev-surface border border-dev-border/60">
                <Video className="w-4 h-4 text-dev-green shrink-0" />
                <span><strong>Sala de Aula com Professor Marcus</strong> e áudio neural em português.</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded bg-dev-surface border border-dev-border/60">
                <Bot className="w-4 h-4 text-dev-cyan shrink-0" />
                <span><strong>Mentor IA Socrático</strong> com entrada de voz pelo microfone.</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded bg-dev-surface border border-dev-border/60">
                <Cpu className="w-4 h-4 text-amber-400 shrink-0" />
                <span><strong>Raio-X do Código</strong> (Live Stepper) com inspeção de memória.</span>
              </div>
              <div className="flex items-center gap-2.5 p-2 rounded bg-dev-surface border border-dev-border/60">
                <Zap className="w-4 h-4 text-rose-400 shrink-0" />
                <span><strong>Arena Blitz de Speed Coding</strong> e 60+ missões atômicas.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card (Login & Register Tabs) */}
          <div className="lg:col-span-6 bg-dev-surface border-2 border-dev-border rounded-2xl shadow-terminal overflow-hidden">
            {/* Tab Bar */}
            <div className="grid grid-cols-2 bg-zinc-950 p-1.5 border-b border-dev-border">
              <button
                type="button"
                onClick={() => { setActiveTab('LOGIN'); setError(''); }}
                className={`py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'LOGIN'
                    ? 'bg-dev-green text-dev-bg font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>[ ENTRAR / LOGIN ]</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('REGISTER'); setError(''); }}
                className={`py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'REGISTER'
                    ? 'bg-dev-cyan text-dev-bg font-black'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>[ CRIAR CONTA ]</span>
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 sm:p-8 space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs flex items-start gap-2">
                  <span className="font-bold shrink-0">[!]</span>
                  <span>{error}</span>
                </div>
              )}

              {activeTab === 'REGISTER' && (
                <div className="p-3 rounded-lg bg-dev-cyan/10 border border-dev-cyan/30 text-dev-cyan text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>Cadastre-se para liberar o plano Cadete Pro (R$ 9,90/mês).</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                {activeTab === 'LOGIN' ? (
                  <>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-dev-cyan" /> Email ou @handle
                      </label>
                      <input
                        type="text"
                        required
                        value={emailOrHandle}
                        onChange={(e) => setEmailOrHandle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-black border border-dev-border rounded-lg text-xs text-white focus:border-dev-green focus:ring-1 focus:ring-dev-green outline-none"
                        placeholder="student@devos.academy ou developer_cadet"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-dev-cyan" /> Senha de Acesso
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-black border border-dev-border rounded-lg text-xs text-white focus:border-dev-green focus:ring-1 focus:ring-dev-green outline-none"
                        placeholder="••••••••"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-dev-cyan" /> Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-black border border-dev-border rounded-lg text-xs text-white focus:border-dev-cyan outline-none"
                        placeholder="Ex: Alan Turing"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-dev-cyan" /> @handle do Aluno (Sem espaços)
                      </label>
                      <input
                        type="text"
                        required
                        value={handle}
                        onChange={(e) => {
                          setHandle(e.target.value.toLowerCase().replace(/\s+/g, ''));
                          setError('');
                        }}
                        className="w-full px-3.5 py-2.5 bg-black border border-dev-border rounded-lg text-xs text-white focus:border-dev-cyan outline-none"
                        placeholder="ex: cyber_neo"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-dev-cyan" /> Seu Email
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-black border border-dev-border rounded-lg text-xs text-white focus:border-dev-cyan outline-none"
                        placeholder="aluno@developer.io"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-dev-cyan" /> Criar Senha
                        </label>
                        <input
                          type="password"
                          required
                          value={registerPassword}
                          onChange={(e) => setRegisterPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-black border border-dev-border rounded-lg text-xs text-white focus:border-dev-cyan outline-none"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-dev-cyan" /> Confirmar
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-3 py-2 bg-black border border-dev-border rounded-lg text-xs text-white focus:border-dev-cyan outline-none"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full mt-2 py-3 px-4 font-bold text-xs rounded-lg transition-all shadow-terminal flex items-center justify-center gap-2 ${
                    activeTab === 'LOGIN'
                      ? 'bg-dev-green text-dev-bg hover:bg-dev-greenDim'
                      : 'bg-dev-cyan text-dev-bg hover:bg-cyan-300'
                  }`}
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                      <span>PROCESSANDO AUTENTICAÇÃO...</span>
                    </>
                  ) : activeTab === 'LOGIN' ? (
                    <>
                      <span>[ ENTRAR NO DASHBOARD ]</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>[ CRIAR CONTA & LIBERAR PLANO ]</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Logins Bar */}
              <div className="pt-4 border-t border-dev-border">
                <div className="text-[10px] text-zinc-500 mb-2 text-center">
                  // ACESSO RÁPIDO PARA TESTES E DEMONSTRAÇÃO
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleQuickStudent}
                    className="px-2.5 py-1.5 rounded-lg bg-black border border-dev-border hover:border-dev-green text-[11px] text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Cadet Student (Demo)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickAdmin}
                    className="px-2.5 py-1.5 rounded-lg bg-black border border-dev-border hover:border-dev-cyan text-[11px] text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1"
                  >
                    <ShieldCheck className="w-3 h-3 text-dev-cyan" />
                    <span>Lead Admin (Master)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer Bar */}
      <footer className="px-6 py-3 border-t border-dev-border/70 text-[11px] text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2 bg-dev-bg/80 z-10">
        <div>Developer OS © 2026 — Plataforma de Mentoria Prática com IA</div>
        <div className="flex items-center gap-4 text-[10px]">
          <span>Plano Cadete Pro: R$ 9,90/mês</span>
          <span>•</span>
          <span>Stripe 256-bit SSL</span>
        </div>
      </footer>
    </div>
  );
};
