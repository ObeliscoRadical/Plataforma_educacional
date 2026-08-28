import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useTerminal } from '../../context/TerminalContext.js';
import { Terminal, Shield, KeyRound, User, Mail, X, Sparkles, CheckCircle2, Lock } from 'lucide-react';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const { addLog } = useTerminal();
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (activeTab === 'LOGIN') {
        await login(emailOrHandle, password);
        addLog(`Autenticação efetuada com sucesso: ${emailOrHandle}`, 'SUCCESS');
        onClose();
      } else {
        if (registerPassword !== confirmPassword) {
          setError('As senhas não coincidem. Verifique a confirmação de senha.');
          setLoading(false);
          return;
        }
        if (registerPassword.length < 6) {
          setError('A senha deve ter pelo menos 6 caracteres.');
          setLoading(false);
          return;
        }

        const cleanHandle = handle.replace(/^@/, '').trim().toLowerCase();
        await register({ email, password: registerPassword, name, handle: cleanHandle });
        addLog(`Nova conta de Cadete criada: @${cleanHandle}! Redirecionando para ativação do plano...`, 'SUCCESS');
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Falha na autenticação.');
      addLog(`Erro de Auth: ${err.message}`, 'ERROR');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-dev-surface border border-dev-border rounded-xl shadow-terminal overflow-hidden">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-dev-bg border-b border-dev-border">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-dev-green" />
            <span className="text-xs font-mono font-bold text-white">
              DEVELOPER OS // TERMINAL ACCESS
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="text-zinc-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="grid grid-cols-2 bg-zinc-950 p-1 border-b border-dev-border">
          <button
            type="button"
            onClick={() => { setActiveTab('LOGIN'); setError(''); }}
            className={`py-2 text-xs font-mono font-bold rounded transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'LOGIN'
                ? 'bg-dev-green text-black shadow-glow-green'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>[ ENTRAR / LOGIN ]</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('REGISTER'); setError(''); }}
            className={`py-2 text-xs font-mono font-bold rounded transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'REGISTER'
                ? 'bg-dev-cyan text-black shadow-glow-cyan'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>[ CRIAR CONTA ]</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/40 text-rose-400 text-xs font-mono flex items-start gap-2">
              <span className="font-bold shrink-0">[!]</span>
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'REGISTER' && (
            <div className="mb-4 p-2.5 rounded-lg bg-dev-cyan/10 border border-dev-cyan/30 text-dev-cyan text-[11px] font-mono flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Crie sua conta para liberar a formação completa (R$ 9,90/mês).</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 font-mono">
            {activeTab === 'LOGIN' ? (
              <>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-dev-cyan" /> Email ou @handle
                  </label>
                  <input
                    type="text"
                    required
                    value={emailOrHandle}
                    onChange={(e) => setEmailOrHandle(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-dev-border rounded text-xs text-white focus:border-dev-green focus:ring-1 focus:ring-dev-green outline-none"
                    placeholder="student@devos.academy ou developer_cadet"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-dev-cyan" /> Senha de Acesso
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-dev-border rounded text-xs text-white focus:border-dev-green focus:ring-1 focus:ring-dev-green outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-dev-cyan" /> Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-dev-border rounded text-xs text-white focus:border-dev-cyan focus:ring-1 focus:ring-dev-cyan outline-none"
                    placeholder="Ex: Alan Turing"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-dev-cyan" /> @handle do Aluno (Sem espaços)
                  </label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-dev-border rounded text-xs text-white focus:border-dev-cyan focus:ring-1 focus:ring-dev-cyan outline-none"
                    placeholder="ex: cyber_neo"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-dev-cyan" /> Seu Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-black border border-dev-border rounded text-xs text-white focus:border-dev-cyan focus:ring-1 focus:ring-dev-cyan outline-none"
                    placeholder="aluno@developer.io"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-zinc-300 mb-1 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-dev-cyan" /> Criar Senha
                    </label>
                    <input
                      type="password"
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-dev-border rounded text-xs text-white focus:border-dev-cyan outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-300 mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-dev-cyan" /> Confirmar
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-black border border-dev-border rounded text-xs text-white focus:border-dev-cyan outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-2.5 px-4 font-mono font-bold text-xs rounded transition-all shadow-terminal flex items-center justify-center gap-2 ${
                activeTab === 'LOGIN'
                  ? 'bg-dev-green text-black hover:bg-dev-greenDim shadow-glow-green'
                  : 'bg-dev-cyan text-black hover:bg-cyan-300 shadow-glow-cyan'
              }`}
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>AUTENTICANDO TERMINAL...</span>
                </>
              ) : activeTab === 'LOGIN' ? (
                <span>[ ENTRAR NO SISTEMA ]</span>
              ) : (
                <span>[ CRIAR CONTA E IR PARA PAGAMENTO ]</span>
              )}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-5 pt-4 border-t border-dev-border">
            <div className="text-[10px] font-mono text-zinc-400 mb-2 text-center">
              // ACESSO RÁPIDO PARA TESTES
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickStudent}
                className="px-2.5 py-1.5 rounded bg-black border border-dev-border hover:border-dev-green text-[11px] font-mono text-zinc-300 hover:text-white transition-colors"
              >
                Cadet Student (Demo)
              </button>
              <button
                type="button"
                onClick={handleQuickAdmin}
                className="px-2.5 py-1.5 rounded bg-black border border-dev-border hover:border-dev-cyan text-[11px] font-mono text-zinc-300 hover:text-white transition-colors"
              >
                Lead Admin (Master)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
