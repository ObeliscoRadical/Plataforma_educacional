import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useTerminal, ActiveView } from '../../context/TerminalContext.js';
import { 
  Terminal, Cpu, BookOpen, Code2, Award, 
  FolderGit2, Sparkles, Video, ShieldCheck, 
  LogOut, LogIn, Wifi, WifiOff, Bot, Wrench, Zap, CreditCard, CheckCircle2
} from 'lucide-react';

export const TerminalHeader: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { user, logout, setPaywallOpen } = useAuth();
  const { activeView, setActiveView, breadcrumb, isOnline, mentorOpen, setMentorOpen, addLog } = useTerminal();
  const [commandInput, setCommandInput] = useState('');

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (!cmd) return;

    addLog(`developer@academy:~$ ${commandInput}`, 'COMMAND');
    setCommandInput('');

    if (cmd === 'boot' || cmd === 'dashboard') setActiveView('DASHBOARD');
    else if (cmd === 'curriculum' || cmd === 'ls curriculum' || cmd === 'tree') setActiveView('CURRICULUM');
    else if (cmd === 'codelab' || cmd === 'lab' || cmd === 'code') setActiveView('CODELAB');
    else if (cmd === 'arena' || cmd === 'blitz' || cmd === 'speed') setActiveView('ARENA');
    else if (cmd === 'skills' || cmd === 'radar') setActiveView('SKILLS');
    else if (cmd === 'projects') setActiveView('PROJECTS');
    else if (cmd === 'remedials' || cmd === 'fix') setActiveView('REMEDIALS');
    else if (cmd === 'exam' || cmd === 'challenge') setActiveView('EXAM');
    else if (cmd === 'studio' || cmd === 'video') setActiveView('VIDEO_STUDIO');
    else if (cmd === 'admin') setActiveView('ADMIN');
    else if (cmd === 'mentor') setMentorOpen(!mentorOpen);
    else if (cmd === 'pay' || cmd === 'checkout' || cmd === 'plan' || cmd === 'stripe') setPaywallOpen(true);
    else if (cmd === 'help') {
      addLog('Available commands: dashboard, curriculum, codelab, arena, skills, projects, remedials, exam, studio, admin, mentor, pay, clear', 'INFO');
    } else {
      addLog(`zsh: command not found: ${cmd}. Type 'help' for available subsystem targets.`, 'WARN');
    }
  };

  const navItems: { view: ActiveView; label: string; icon: React.FC<any>; role?: string }[] = [
    { view: 'DASHBOARD', label: 'BOOT', icon: Cpu },
    { view: 'CURRICULUM', label: 'CURRICULUM', icon: BookOpen },
    { view: 'CODELAB', label: 'CODE LAB', icon: Code2 },
    { view: 'ARENA', label: 'ARENA BLITZ', icon: Zap },
    { view: 'SKILLS', label: 'SKILLS', icon: Award },
    { view: 'PROJECTS', label: 'PROJECTS', icon: FolderGit2 },
    { view: 'REMEDIALS', label: 'REMEDIALS', icon: Wrench },
    { view: 'EXAM', label: 'CHALLENGE', icon: Sparkles },
    { view: 'VIDEO_STUDIO', label: 'STUDIO', icon: Video, role: 'ADMIN' },
    { view: 'ADMIN', label: 'ADMIN OS', icon: ShieldCheck, role: 'ADMIN' },
  ];

  const isSubscribed = user?.role === 'ADMIN' || user?.subscription_status === 'ACTIVE';

  return (
    <header className="sticky top-0 z-40 bg-dev-surface/90 backdrop-blur-md border-b border-dev-border">
      {/* Top Shell Controls Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-dev-bg/80 border-b border-dev-border/50 text-xs">
        <div className="flex items-center gap-3">
          {/* macOS window controls */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-sm"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-sm"></span>
          </div>
          <span className="text-dev-muted font-medium hidden sm:inline">
            developer@academy:~
          </span>
          <span className="text-dev-green font-semibold bg-dev-green/10 px-2 py-0.5 rounded border border-dev-green/20">
            {breadcrumb}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Online/PWA status */}
          <div className="flex items-center gap-1 text-[11px]">
            {isOnline ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <Wifi className="w-3 h-3" />
                <span className="hidden md:inline">NET ONLINE</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <WifiOff className="w-3 h-3" />
                <span className="hidden md:inline">PWA OFFLINE</span>
              </span>
            )}
          </div>

          {/* Subscription Status Button */}
          {isSubscribed ? (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>PRO R$ 9,90</span>
            </div>
          ) : (
            <button
              onClick={() => setPaywallOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold hover:bg-amber-500/30 transition-all animate-pulse"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>ASSINAR R$ 9,90</span>
            </button>
          )}

          {/* AI Mentor Trigger Button */}
          <button
            onClick={() => setMentorOpen(!mentorOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all ${
              mentorOpen 
                ? 'bg-dev-cyan text-dev-bg' 
                : 'bg-dev-cyan/10 text-dev-cyan border border-dev-cyan/30 hover:bg-dev-cyan/20'
            }`}
          >
            <Bot className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">● MENTOR AI</span>
          </button>

          {/* User Profile / Auth */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-dev-border">
              <img src={user.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=dev'} alt="Avatar" className="w-5 h-5 rounded-full border border-dev-green" />
              <span className="text-dev-text hidden lg:inline font-medium">@{user.handle}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-dev-border text-dev-cyan font-bold">{user.role}</span>
              <button 
                onClick={logout} 
                title="Logout"
                className="text-dev-muted hover:text-rose-400 p-1 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-dev-green text-dev-bg font-semibold text-xs hover:bg-dev-greenDim transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>[ AUTH BOOT ]</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Subsystem Bar & CLI Input */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 py-2 gap-2">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1">
          {navItems.map((item) => {
            if (item.role === 'ADMIN' && (!user || user.role !== 'ADMIN')) return null;
            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setActiveView(item.view)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-dev-green text-dev-bg font-bold'
                    : 'text-dev-muted hover:text-dev-text hover:bg-dev-surfaceHover'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Interactive Shell Command Input */}
        <form onSubmit={handleCommand} className="flex items-center bg-dev-bg border border-dev-border rounded px-2.5 py-1 text-xs text-dev-text focus-within:border-dev-green transition-colors min-w-[240px]">
          <Terminal className="w-3.5 h-3.5 text-dev-green mr-1.5 shrink-0" />
          <span className="text-dev-green mr-1">$</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="cmd: open lesson 00.01 | codelab | arena | pay..."
            className="bg-transparent border-none outline-none w-full text-dev-text placeholder-dev-muted/60 text-xs"
          />
        </form>
      </div>
    </header>
  );
};
