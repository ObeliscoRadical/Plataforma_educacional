import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useTerminal } from '../../context/TerminalContext.js';
import { Terminal, Shield, KeyRound, User, Mail, X } from 'lucide-react';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const { addLog } = useTerminal();
  const [isLogin, setIsLogin] = useState(true);
  const [emailOrHandle, setEmailOrHandle] = useState('student@devos.academy');
  const [password, setPassword] = useState('student123');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(emailOrHandle, password);
        addLog(`Authentication successful. Welcome, ${emailOrHandle}`, 'SUCCESS');
      } else {
        await register({ email, password, name, handle });
        addLog(`Cadet initialization complete. Welcome aboard @${handle}`, 'SUCCESS');
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication error.');
      addLog(`Auth failed: ${err.message}`, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStudent = () => {
    setEmailOrHandle('student@devos.academy');
    setPassword('student123');
    setIsLogin(true);
  };

  const handleQuickAdmin = () => {
    setEmailOrHandle('admin@devos.academy');
    setPassword('admin123');
    setIsLogin(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-dev-surface border border-dev-border rounded-lg shadow-terminal overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-dev-bg border-b border-dev-border">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-dev-green" />
            <span className="text-xs font-mono font-semibold text-dev-green">
              {isLogin ? 'AUTH // LOGIN_DAEMON' : 'AUTH // NEW_CADET_REGISTER'}
            </span>
          </div>
          <button onClick={onClose} className="text-dev-muted hover:text-dev-text">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              [!] {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isLogin ? (
              <>
                <div>
                  <label className="block text-xs font-mono text-dev-muted mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-dev-cyan" /> Email ou Handle
                  </label>
                  <input
                    type="text"
                    required
                    value={emailOrHandle}
                    onChange={(e) => setEmailOrHandle(e.target.value)}
                    className="w-full px-3 py-2 bg-dev-bg border border-dev-border rounded font-mono text-xs text-dev-text focus:border-dev-green outline-none"
                    placeholder="student@devos.academy ou developer_cadet"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-dev-muted mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-dev-cyan" /> Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-dev-bg border border-dev-border rounded font-mono text-xs text-dev-text focus:border-dev-green outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-mono text-dev-muted mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-dev-cyan" /> Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-dev-bg border border-dev-border rounded font-mono text-xs text-dev-text focus:border-dev-green outline-none"
                    placeholder="Ex: Alan Turing"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-dev-muted mb-1 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-dev-cyan" /> Handle / Nickname CLI
                  </label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3 py-2 bg-dev-bg border border-dev-border rounded font-mono text-xs text-dev-text focus:border-dev-green outline-none"
                    placeholder="ex: cyber_neo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-dev-muted mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-dev-cyan" /> Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-dev-bg border border-dev-border rounded font-mono text-xs text-dev-text focus:border-dev-green outline-none"
                    placeholder="dev@academy.io"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-dev-muted mb-1 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-dev-cyan" /> Senha
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-dev-bg border border-dev-border rounded font-mono text-xs text-dev-text focus:border-dev-green outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-dev-green text-black font-mono font-bold text-xs rounded hover:bg-dev-greenDim transition-colors shadow-glow-green flex items-center justify-center gap-2"
            >
              {loading ? 'PROCESSING AUTHENTICATION...' : isLogin ? '[ EXECUTE LOGIN ]' : '[ INITIALIZE CADET ]'}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-5 pt-4 border-t border-dev-border">
            <div className="text-[11px] font-mono text-dev-muted mb-2 text-center">
              // ATALHOS DE ACESSO RÁPIDO (DEV DEMO)
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickStudent}
                className="px-2.5 py-1.5 rounded bg-dev-bg border border-dev-border hover:border-dev-green text-[11px] font-mono text-dev-text transition-colors"
              >
                Cadet Student
              </button>
              <button
                type="button"
                onClick={handleQuickAdmin}
                className="px-2.5 py-1.5 rounded bg-dev-bg border border-dev-border hover:border-dev-cyan text-[11px] font-mono text-dev-text transition-colors"
              >
                Lead Admin
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-mono text-dev-cyan hover:underline"
            >
              {isLogin ? 'Need a new environment? Register cadet account' : 'Already registered? Login to existing shell'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
