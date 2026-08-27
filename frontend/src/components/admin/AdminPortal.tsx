import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { useTerminal } from '../../context/TerminalContext.js';
import { ShieldCheck, Settings, Users, Activity, BarChart2 } from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { addLog } = useTerminal();
  const [settings, setSettings] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const [sRes, stuRes, aRes] = await Promise.all([
        api.getAdminSettings(),
        api.getAdminStudents(),
        api.getAnalytics(),
      ]);
      setSettings(sRes.settings || []);
      setStudents(stuRes.students || []);
      setAnalytics(aRes.metrics || {});
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await api.updateAdminSetting(key, value);
      addLog(`Setting [${key}] updated to ${value}`, 'SUCCESS');
      await loadAdminData();
    } catch (err: any) {
      addLog(`Failed to update setting: ${err.message}`, 'ERROR');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-dev-green font-mono text-sm">
        <span className="inline-block w-2 h-4 bg-dev-green mr-2 animate-blink-slow"></span>
        Carregando console de administração do Developer OS...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dev-surface border border-dev-border rounded-lg p-5">
        <div className="flex items-center gap-2 text-xs font-mono text-dev-green mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>ADMINISTRATION HUB // DEVELOPER OS KERNEL</span>
        </div>
        <h1 className="text-lg font-bold font-mono text-white">
          Painel de Controle e Governança
        </h1>
        <p className="text-xs font-mono text-dev-muted mt-1">
          Configuração de pesos das competências, telemetria de alunos, aprovação de videoaulas e mapa de retenção.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
        <div className="bg-dev-surface border border-dev-border rounded-lg p-4">
          <div className="text-dev-muted">TOTAL DE CADETES</div>
          <div className="text-2xl font-bold text-dev-green mt-1">{analytics?.totalStudents || 1}</div>
        </div>
        <div className="bg-dev-surface border border-dev-border rounded-lg p-4">
          <div className="text-dev-muted">AULAS CONCLUÍDAS</div>
          <div className="text-2xl font-bold text-dev-cyan mt-1">{analytics?.completedLessons || 0}</div>
        </div>
        <div className="bg-dev-surface border border-dev-border rounded-lg p-4">
          <div className="text-dev-muted">MÉDIA DE DICAS / EXERCÍCIO</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{analytics?.averageHintsPerAttempt || 0}</div>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="bg-dev-surface border border-dev-border rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-dev-green font-bold">
          <Settings className="w-4 h-4" />
          <span>PESOS E THRESHOLDS DA ENGINE ADAPTATIVA</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {settings.map((s) => (
            <div key={s.key} className="p-3 bg-dev-bg border border-dev-border rounded space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-dev-cyan font-bold">{s.key}</span>
                <span className="text-dev-muted text-[10px]">{s.updated_at}</span>
              </div>
              <p className="text-[11px] text-dev-muted">{s.description}</p>
              <input
                type="text"
                defaultValue={s.value}
                onBlur={(e) => handleUpdateSetting(s.key, e.target.value)}
                className="w-full px-2.5 py-1.5 bg-dev-surface border border-dev-border rounded text-white text-xs outline-none focus:border-dev-green"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Students Matrix Table */}
      <div className="bg-dev-surface border border-dev-border rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-dev-green font-bold">
          <Users className="w-4 h-4" />
          <span>MATRIZ DE PROGRESSO DOS ALUNOS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="text-dev-muted border-b border-dev-border text-[11px]">
              <tr>
                <th className="pb-2">NOME</th>
                <th className="pb-2">HANDLE</th>
                <th className="pb-2">EMAIL</th>
                <th className="pb-2">AULAS MASTERED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dev-border/50 text-zinc-300">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-dev-surfaceHover">
                  <td className="py-2.5 font-bold text-white">{st.name}</td>
                  <td className="py-2.5 text-dev-cyan">@{st.handle}</td>
                  <td className="py-2.5 text-dev-muted">{st.email}</td>
                  <td className="py-2.5 text-dev-green font-bold">{st.completed_lessons} / 24</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
