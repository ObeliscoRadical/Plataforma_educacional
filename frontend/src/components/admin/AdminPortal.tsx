import React, { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { useTerminal } from '../../context/TerminalContext.js';
import { 
  ShieldCheck, Settings, Users, Activity, BarChart2, DollarSign, 
  CreditCard, CheckCircle2, AlertTriangle, XCircle, Search, 
  Filter, RefreshCw, Sparkles, Clock, Flame, UserCheck, ShieldAlert,
  ArrowUpRight, ChevronRight, UserPlus
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { addLog } = useTerminal();
  const [activeTab, setActiveTab] = useState<'USERS' | 'FINANCE' | 'TELEMETRY' | 'SETTINGS'>('USERS');
  const [metrics, setMetrics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PENDING_PAYMENT' | 'ADMIN'>('ALL');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [mRes, uRes, fRes, sRes] = await Promise.all([
        api.getAdminDashboardMetrics(),
        api.getAdminUsers(),
        api.getAdminActivityFeed(),
        api.getAdminSettings()
      ]);
      setMetrics(mRes.metrics || {});
      setUsers(uRes.users || []);
      setFeed(fRes.feed || []);
      setSettings(sRes.settings || []);
    } catch (err: any) {
      addLog(`Erro ao carregar dados de administração: ${err.message}`, 'ERROR');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const handleUpdateSubscription = async (userId: string, status: 'ACTIVE' | 'PENDING_PAYMENT' | 'CANCELED') => {
    try {
      setActionLoading(userId);
      await api.updateUserSubscription(userId, status);
      addLog(`Status de assinatura do usuário [${userId}] atualizado para ${status}.`, 'SUCCESS');
      await loadAllAdminData();
    } catch (err: any) {
      addLog(`Falha ao alterar assinatura: ${err.message}`, 'ERROR');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    try {
      setActionLoading(userId);
      const newRole = currentRole === 'ADMIN' ? 'STUDENT' : 'ADMIN';
      await api.updateUserRole(userId, newRole);
      addLog(`Cargo do usuário [${userId}] alterado para ${newRole}.`, 'SUCCESS');
      await loadAllAdminData();
    } catch (err: any) {
      addLog(`Falha ao alterar cargo: ${err.message}`, 'ERROR');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetUserProgress = async (userId: string) => {
    if (!confirm('Deseja realmente resetar todo o progresso deste aluno?')) return;
    try {
      setActionLoading(userId);
      await api.resetUserProgress(userId);
      addLog(`Progresso do usuário [${userId}] foi resetado para o início.`, 'WARN');
      await loadAllAdminData();
    } catch (err: any) {
      addLog(`Falha ao resetar: ${err.message}`, 'ERROR');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      await api.updateAdminSetting(key, value);
      addLog(`Configuração [${key}] atualizada para ${value}.`, 'SUCCESS');
      await loadAllAdminData();
    } catch (err: any) {
      addLog(`Falha ao atualizar configuração: ${err.message}`, 'ERROR');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.handle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'ACTIVE') return u.subscription_status === 'ACTIVE' || u.role === 'ADMIN';
    if (statusFilter === 'PENDING_PAYMENT') return u.subscription_status === 'PENDING_PAYMENT' && u.role !== 'ADMIN';
    if (statusFilter === 'ADMIN') return u.role === 'ADMIN';

    return true;
  });

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center p-16 text-dev-green text-sm">
        <span className="inline-block w-2 h-4 bg-dev-green mr-2"></span>
        Conectando ao Kernel de Administração do Developer OS...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-dev-surface border border-dev-border rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-dev-border">
          <div>
            <div className="flex items-center gap-2 text-xs text-dev-green mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>COMMAND & CONTROL CENTER // ADMIN OS v1.0</span>
            </div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Painel Executivo de Governança & Mensalidades</span>
              <span className="text-xs px-2 py-0.5 rounded bg-dev-green/10 text-dev-green border border-dev-green/30 font-bold">
                ROOT PRIVILEGES
              </span>
            </h1>
          </div>

          <button
            onClick={loadAllAdminData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 border border-dev-border text-zinc-300 hover:text-white hover:border-dev-green text-xs transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>ATUALIZAR TELEMETRIA</span>
          </button>
        </div>

        {/* 4 Financial & User KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* MRR Card */}
          <div className="p-4 rounded-lg bg-black/60 border border-dev-green/40 space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>RECEITA RECORRENTE (MRR)</span>
              <DollarSign className="w-4 h-4 text-dev-green" />
            </div>
            <div className="text-2xl font-black text-dev-green">
              R$ {(metrics?.monthlyRecurringRevenue || 0).toFixed(2).replace('.', ',')}
            </div>
            <div className="text-[10px] text-zinc-400">
              R$ 9,90 / assinante ativo
            </div>
          </div>

          {/* Active Subscribers Card */}
          <div className="p-4 rounded-lg bg-black/60 border border-emerald-500/40 space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>ASSINANTES ATIVOS</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {metrics?.activeSubscribers || 0}
            </div>
            <div className="text-[10px] text-zinc-400">
              Taxa de Conversão: <strong className="text-white">{metrics?.platformConversionRate || 100}%</strong>
            </div>
          </div>

          {/* Pending Subscriptions Card */}
          <div className="p-4 rounded-lg bg-black/60 border border-amber-500/40 space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>PAGAMENTO PENDENTE</span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              {metrics?.pendingPayment || 0}
            </div>
            <div className="text-[10px] text-zinc-400">
              Aguardando checkout Stripe
            </div>
          </div>

          {/* Total Cadets / Activity Card */}
          <div className="p-4 rounded-lg bg-black/60 border border-dev-cyan/40 space-y-1">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>TOTAL DE CONTAS</span>
              <Users className="w-4 h-4 text-dev-cyan" />
            </div>
            <div className="text-2xl font-black text-dev-cyan">
              {metrics?.totalUsers || 0}
            </div>
            <div className="text-[10px] text-zinc-400">
              {metrics?.totalLessonsCompleted || 0} missões concluídas
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Subsystem Tabs */}
      <div className="flex items-center gap-1.5 border-b border-dev-border pb-1 overflow-x-auto scrollbar-none text-xs">
        <button
          onClick={() => setActiveTab('USERS')}
          className={`px-4 py-2 rounded-t font-bold transition-all flex items-center gap-2 ${
            activeTab === 'USERS'
              ? 'bg-dev-surface border-t-2 border-dev-green text-white shadow-terminal'
              : 'text-dev-muted hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-dev-green" />
          <span>[ GESTÃO DE ALUNOS & CONTAS ]</span>
        </button>

        <button
          onClick={() => setActiveTab('FINANCE')}
          className={`px-4 py-2 rounded-t font-bold transition-all flex items-center gap-2 ${
            activeTab === 'FINANCE'
              ? 'bg-dev-surface border-t-2 border-emerald-400 text-white shadow-terminal'
              : 'text-dev-muted hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4 text-emerald-400" />
          <span>[ MENSALIDADES & FINANCEIRO ]</span>
        </button>

        <button
          onClick={() => setActiveTab('TELEMETRY')}
          className={`px-4 py-2 rounded-t font-bold transition-all flex items-center gap-2 ${
            activeTab === 'TELEMETRY'
              ? 'bg-dev-surface border-t-2 border-dev-cyan text-white shadow-terminal'
              : 'text-dev-muted hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4 text-dev-cyan" />
          <span>[ FREQUÊNCIA & ENGAJAMENTO ]</span>
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-4 py-2 rounded-t font-bold transition-all flex items-center gap-2 ${
            activeTab === 'SETTINGS'
              ? 'bg-dev-surface border-t-2 border-amber-400 text-white shadow-terminal'
              : 'text-dev-muted hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4 text-amber-400" />
          <span>[ CONFIGURAÇÕES DA ENGINE ]</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS & ACCOUNTS MANAGEMENT                                        */}
      {/* ========================================================================= */}
      {activeTab === 'USERS' && (
        <div className="bg-dev-surface border border-dev-border rounded-xl p-5 space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-dev-border">
            <div className="flex items-center bg-black border border-dev-border rounded px-3 py-1.5 text-xs text-zinc-300 focus-within:border-dev-green w-full sm:w-80">
              <Search className="w-3.5 h-3.5 text-dev-green mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, @handle ou email..."
                className="bg-transparent border-none outline-none w-full text-xs text-white placeholder-zinc-500"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1" />
              {(['ALL', 'ACTIVE', 'PENDING_PAYMENT', 'ADMIN'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    statusFilter === filter
                      ? 'bg-dev-green text-dev-bg'
                      : 'bg-black border border-dev-border text-zinc-400 hover:text-white'
                  }`}
                >
                  {filter === 'ALL' ? 'TODOS' : filter === 'ACTIVE' ? 'PRO ATIVOS' : filter === 'PENDING_PAYMENT' ? 'PENDENTES' : 'ADMINS'}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-zinc-400 border-b border-dev-border text-[11px] bg-black/40">
                <tr>
                  <th className="p-3">ALUNO / IDENTIFICAÇÃO</th>
                  <th className="p-3">STATUS ASSINATURA</th>
                  <th className="p-3">PROGRESSO & FREQUÊNCIA</th>
                  <th className="p-3">CADASTRO / ÚLTIMO ACESSO</th>
                  <th className="p-3 text-right">AÇÕES DO ADMINISTRADOR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dev-border/50 text-zinc-300">
                {filteredUsers.map((u) => {
                  const isActive = u.subscription_status === 'ACTIVE' || u.role === 'ADMIN';
                  const isPending = u.subscription_status === 'PENDING_PAYMENT' && u.role !== 'ADMIN';
                  const isCanceled = u.subscription_status === 'CANCELED';
                  const isUserActionLoading = actionLoading === u.id;

                  return (
                    <tr key={u.id} className="hover:bg-dev-surfaceHover transition-colors">
                      {/* Name & Handle */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.handle || u.id)}`}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full border border-dev-green shrink-0 bg-black"
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {u.role === 'ADMIN' && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-dev-cyan/20 text-dev-cyan font-bold border border-dev-cyan/40">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-dev-cyan">@{u.handle}</div>
                            <div className="text-[10px] text-zinc-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Subscription Status Badge */}
                      <td className="p-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> PRO ATIVO (R$ 9,90)
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold">
                            <AlertTriangle className="w-3.5 h-3.5" /> PENDENTE CHECKOUT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-rose-500/15 text-rose-400 border border-rose-500/40 font-bold">
                            <XCircle className="w-3.5 h-3.5" /> CANCELADO / INATIVO
                          </span>
                        )}
                      </td>

                      {/* Progress & Frequency */}
                      <td className="p-3 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Missões: <strong className="text-white">{u.completed_lessons} / 60</strong></span>
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <Flame className="w-3 h-3" /> {u.streak_days || 1}d streak
                          </span>
                        </div>
                        <div className="w-36 h-1.5 bg-black rounded-full overflow-hidden border border-dev-border">
                          <div
                            className="h-full bg-dev-green"
                            style={{ width: `${Math.min(100, Math.round((u.completed_lessons / 60) * 100))}%` }}
                          ></div>
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {u.total_time_spent_min || 45} min dedicados • Média: {u.avg_score || 85}%
                        </div>
                      </td>

                      {/* Registration & Last Access */}
                      <td className="p-3 text-[11px] space-y-0.5 text-zinc-400">
                        <div>Criado: <span className="text-zinc-300">{u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : 'Hoje'}</span></div>
                        <div>Último: <span className="text-dev-cyan">{u.last_login_at ? new Date(u.last_login_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Recente'}</span></div>
                        <div className="text-[10px] text-zinc-500">{u.login_count || 1} sessões</div>
                      </td>

                      {/* Admin Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Pro Subscription */}
                          {!isActive ? (
                            <button
                              onClick={() => handleUpdateSubscription(u.id, 'ACTIVE')}
                              disabled={isUserActionLoading}
                              title="Aprovar / Ativar Assinatura Manualmente"
                              className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 text-[10px] font-bold transition-colors"
                            >
                              ✓ ATIVAR PRO
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateSubscription(u.id, 'PENDING_PAYMENT')}
                              disabled={isUserActionLoading}
                              title="Suspender / Bloquear Acesso"
                              className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 text-[10px] font-bold transition-colors"
                            >
                              ⏸️ SUSPENDER
                            </button>
                          )}

                          {/* Toggle Admin Role */}
                          <button
                            onClick={() => handleToggleRole(u.id, u.role)}
                            disabled={isUserActionLoading}
                            title={u.role === 'ADMIN' ? 'Remover Admin' : 'Promover a Admin'}
                            className="px-2 py-1 rounded bg-dev-cyan/15 text-dev-cyan border border-dev-cyan/30 hover:bg-dev-cyan/30 text-[10px] font-bold transition-colors"
                          >
                            {u.role === 'ADMIN' ? 'USER' : '👑 ADMIN'}
                          </button>

                          {/* Reset Progress */}
                          <button
                            onClick={() => handleResetUserProgress(u.id)}
                            disabled={isUserActionLoading}
                            title="Resetar Progresso do Aluno"
                            className="px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white text-[10px] font-bold transition-colors"
                          >
                            🔄 RESET
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FINANCE & REVENUE DRILLDOWN                                        */}
      {/* ========================================================================= */}
      {activeTab === 'FINANCE' && (
        <div className="space-y-4">
          <div className="bg-dev-surface border border-dev-border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dev-border">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Extrato Consolidado de Mensalidades (Stripe Gateway)</h3>
                  <p className="text-xs text-zinc-400">Plano Oficial: Cadete Pro (R$ 9,90 / mês)</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-zinc-400">RECEITA ATUAL ESTIMADA</div>
                <div className="text-xl font-bold text-emerald-400">
                  R$ {(metrics?.monthlyRecurringRevenue || 0).toFixed(2).replace('.', ',')} / mês
                </div>
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-2">
              {users.map((u, idx) => (
                <div key={u.id} className="p-3 bg-black/60 border border-dev-border rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{u.name}</span>
                        <span className="text-[10px] text-dev-cyan">(@{u.handle})</span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {u.subscription_status === 'ACTIVE' || u.role === 'ADMIN' ? 'Assinatura Mensal Ativa via Stripe' : 'Aguardando Pagamento no Checkout'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-white text-sm">R$ 9,90</div>
                    <div className={`text-[10px] font-bold ${
                      u.subscription_status === 'ACTIVE' || u.role === 'ADMIN' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {u.subscription_status === 'ACTIVE' || u.role === 'ADMIN' ? '✓ PAGO / EM DIA' : 'PENDENTE'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TELEMETRY & ACTIVITY STREAM                                        */}
      {/* ========================================================================= */}
      {activeTab === 'TELEMETRY' && (
        <div className="bg-dev-surface border border-dev-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dev-border">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-dev-cyan" />
              <div>
                <h3 className="text-sm font-bold text-white">Feed de Telemetria e Frequência dos Alunos</h3>
                <p className="text-xs text-zinc-400">Eventos em tempo real de acessos, exercícios e pagamentos</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {feed.map((ev: any, idx: number) => (
              <div key={idx} className="p-3 bg-black/60 border border-dev-border rounded-lg flex items-start justify-between text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-dev-green mt-1.5 animate-ping shrink-0"></div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>{ev.user_name || 'Cadet User'}</span>
                      <span className="text-dev-cyan text-[11px]">(@{ev.user_handle || 'cadet'})</span>
                    </div>
                    <p className="text-zinc-300 text-[11px] mt-0.5">
                      {ev.event_type === 'LESSON_COMPLETED' && '🎯 Concluiu com sucesso a missão com nota 100%'}
                      {ev.event_type === 'SUBSCRIPTION_ACTIVE' && '💳 Assinatura confirmada no Stripe (R$ 9,90/mês)'}
                      {ev.event_type === 'ARENA_BLITZ_PASSED' && '⚡ Venceu o desafio blitz da Arena Speed Coding'}
                      {ev.event_type === 'SANDBOX_RUN' && '🖥️ Executou código no sandbox com testes aprovados'}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] text-zinc-500 shrink-0">
                  {new Date(ev.timestamp).toLocaleTimeString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SYSTEM SETTINGS                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-dev-surface border border-dev-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold pb-2 border-b border-dev-border">
            <Settings className="w-4 h-4" />
            <span>PESOS DAS COMPETÊNCIAS E REGRAS DE GOVERNANÇA</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {settings.map((s) => (
              <div key={s.key} className="p-3.5 bg-black/60 border border-dev-border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-dev-cyan font-bold">{s.key}</span>
                  <span className="text-zinc-500 text-[10px]">{s.updated_at}</span>
                </div>
                <p className="text-[11px] text-zinc-400">{s.description}</p>
                <input
                  type="text"
                  defaultValue={s.value}
                  onBlur={(e) => handleUpdateSetting(s.key, e.target.value)}
                  className="w-full px-3 py-2 bg-dev-surface border border-dev-border rounded text-white text-xs outline-none focus:border-dev-green"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
