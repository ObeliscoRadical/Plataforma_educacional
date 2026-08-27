import React, { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, CheckCircle2, ChevronRight } from 'lucide-react';

export const BootScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [bootStep, setBootStep] = useState(0);

  const steps = [
    'BIOS / KERNEL BOOT: Initializing Developer OS Architecture...',
    'VIRTUAL MEMORY: 64MB Cache Allocated, WAL Mode Activated.',
    'SUBSYSTEM: AI Mentor Daemon [ONLINE] (Gemini Cognitive Engine ready).',
    'SUBSYSTEM: Code Lab Execution Sandbox [ONLINE] (Isolated VM Engine).',
    'CURRICULUM TREE: 24 Modular Nodes Mounted at ~/curriculum.',
    'SKILL RADAR: 5-Dimensional Adaptive Matrix Initialized.',
    'ENVIRONMENT STATUS: 100% OPERATIONAL. WELCOME, DEVELOPER.'
  ];

  useEffect(() => {
    if (bootStep < steps.length) {
      const timer = setTimeout(() => {
        setBootStep((prev) => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [bootStep]);

  return (
    <div className="fixed inset-0 z-50 bg-dev-bg flex flex-col items-center justify-center p-6 text-dev-text font-mono select-none">
      <div className="w-full max-w-2xl bg-dev-surface border border-dev-border rounded-lg p-6 shadow-terminal">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-dev-border">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-dev-green animate-pulse" />
            <span className="text-sm font-bold text-dev-green tracking-wider">DEVELOPER OS // FIRST BOOT SEQUENCE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>
        </div>

        {/* Boot Steps Log */}
        <div className="space-y-2 text-xs font-mono mb-6 min-h-[180px]">
          {steps.slice(0, bootStep).map((msg, i) => (
            <div key={i} className="flex items-start gap-2 text-dev-text animate-fade-in">
              <span className="text-dev-cyan font-bold">{`[0${i + 1}.00]`}</span>
              <span className={i === steps.length - 1 ? 'text-dev-green font-bold' : 'text-zinc-300'}>
                {msg}
              </span>
              {i < steps.length - 1 && <CheckCircle2 className="w-3.5 h-3.5 text-dev-green shrink-0 ml-auto" />}
            </div>
          ))}
          {bootStep < steps.length && (
            <div className="flex items-center gap-2 text-dev-muted">
              <span className="inline-block w-2 h-4 bg-dev-green animate-blink-slow"></span>
              <span>Loading subsystem...</span>
            </div>
          )}
        </div>

        {/* Action Button once ready */}
        {bootStep >= steps.length ? (
          <button
            onClick={onComplete}
            className="w-full py-3 px-4 bg-dev-green text-black font-bold text-xs rounded hover:bg-dev-greenDim transition-all shadow-glow-green flex items-center justify-center gap-2"
          >
            <span>[ ENTER TRAINING ENVIRONMENT ]</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="text-center text-xs text-dev-muted font-mono animate-pulse">
            Calibrating system parameters...
          </div>
        )}
      </div>
    </div>
  );
};
