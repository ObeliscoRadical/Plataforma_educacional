import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useTerminal } from '../../context/TerminalContext.js';
import { api } from '../../api/client.js';
import { 
  ShieldCheck, CheckCircle2, Zap, Sparkles, CreditCard, 
  Lock, ArrowRight, Video, Bot, Award, Cpu, Code2
} from 'lucide-react';

export const PaywallModal: React.FC = () => {
  const { user, paywallOpen, setPaywallOpen, activateSubscription } = useAuth();
  const { addLog } = useTerminal();
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [loadingInstant, setLoadingInstant] = useState(false);
  const [successCelebration, setSuccessCelebration] = useState(false);

  if (!paywallOpen) return null;

  const handleStripeCheckout = async () => {
    try {
      setLoadingStripe(true);
      addLog('Iniciando sessão segura de checkout do Stripe (R$ 9,90)...', 'INFO');
      const currentUrl = window.location.origin + window.location.pathname;
      const res = await api.createCheckoutSession(currentUrl);

      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      addLog(`Erro no Stripe Checkout: ${err.message}`, 'ERROR');
    } finally {
      setLoadingStripe(false);
    }
  };

  const handleInstantActivation = async () => {
    try {
      setLoadingInstant(true);
      addLog('Ativando plano Cadete Pro em modo imediato...', 'INFO');
      const res = await api.mockActivateSubscription();

      if (res.success && res.user) {
        setSuccessCelebration(true);
        activateSubscription(res.user);
        addLog('ASSINATURA ATIVADA COM SUCESSO! Acesso completo liberado.', 'SUCCESS');

        // Neural spoken audio praise
        if ('speechSynthesis' in window) {
          const u = new SpeechSynthesisUtterance('Parabéns! Sua assinatura do Developer OS está ativa. Bem-vindo à formação!');
          u.lang = 'pt-BR';
          window.speechSynthesis.speak(u);
        }

        setTimeout(() => {
          setPaywallOpen(false);
          setSuccessCelebration(false);
        }, 2000);
      }
    } catch (err: any) {
      addLog(`Falha na ativação: ${err.message}`, 'ERROR');
    } finally {
      setLoadingInstant(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="w-full max-w-xl bg-dev-surface border-2 border-dev-green rounded-xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-dev-bg border-b border-dev-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-dev-green" />
            <span className="text-xs font-bold text-white tracking-wider">
              DEVELOPER OS // CADET PRO GATEWAY
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-dev-green/20 text-dev-green border border-dev-green/40 font-bold">
            STRIPE SECURE 256-BIT
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Plan Hero Banner */}
          <div className="text-center space-y-2 pb-4 border-b border-dev-border">
            <div className="inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-dev-cyan/15 text-dev-cyan border border-dev-cyan/30 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PLANO CADETE PRO // ACESSO VITALÍCIO MENSAL</span>
            </div>

            <h2 className="text-2xl font-black text-white">
              Libere Toda a Formação de Software Engineer
            </h2>

            <div className="flex items-baseline justify-center gap-1 pt-1">
              <span className="text-sm text-zinc-400">Apenas</span>
              <span className="text-4xl font-black text-dev-green drop-shadow-[0_0_12px_rgba(34,197,94,0.4)]">
                R$ 9,90
              </span>
              <span className="text-xs text-zinc-400">/ mês</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Sem fidelidade. Cancele quando quiser diretamente no terminal.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-black/50 border border-dev-border flex items-start gap-2.5">
              <Video className="w-4 h-4 text-dev-green shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Sala de Aula com Professor</strong>
                <span className="text-[11px] text-zinc-400">Aulas narradas com síntese neural e digitação ao vivo.</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/50 border border-dev-border flex items-start gap-2.5">
              <Bot className="w-4 h-4 text-dev-cyan shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Mentor IA com Voz 24/7</strong>
                <span className="text-[11px] text-zinc-400">Fale por microfone e tire dúvidas a qualquer momento.</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/50 border border-dev-border flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Raio-X Stepper & Sandboxes</strong>
                <span className="text-[11px] text-zinc-400">Inspecione memória Stack/Heap e DOM em tempo real.</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-black/50 border border-dev-border flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Arena Blitz & 60+ Missões</strong>
                <span className="text-[11px] text-zinc-400">Desafios de 60 segundos e carreira do zero ao Tech Lead.</span>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {successCelebration && (
            <div className="p-4 rounded-lg bg-emerald-950/80 border border-emerald-400 text-emerald-300 text-xs text-center space-y-1 animate-bounce">
              <div className="font-bold flex items-center justify-center gap-1.5 text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>PAGAMENTO CONFIRMADO COM SUCESSO!</span>
              </div>
              <p className="text-[11px]">Inicializando ambiente de desenvolvimento do Cadete...</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleStripeCheckout}
              disabled={loadingStripe || loadingInstant}
              className="w-full py-3 px-4 bg-dev-green text-dev-bg font-bold text-xs rounded-lg hover:bg-dev-greenDim transition-all flex items-center justify-center gap-2"
            >
              {loadingStripe ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>CONECTANDO AO STRIPE...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>[ ASSINAR POR R$ 9,90 NO STRIPE (CARTÃO / PIX) ]</span>
                </>
              )}
            </button>

            <button
              onClick={handleInstantActivation}
              disabled={loadingStripe || loadingInstant}
              className="w-full py-2.5 px-4 bg-zinc-900 border border-dev-cyan text-dev-cyan hover:bg-dev-cyan/10 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-terminal"
            >
              {loadingInstant ? (
                <>
                  <span className="w-3 h-3 border-2 border-dev-cyan border-t-transparent rounded-full animate-spin"></span>
                  <span>ATIVANDO PLANO NOVO...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-dev-cyan" />
                  <span>[ TESTAR ATIVAÇÃO INSTANTÂNEA (SANDBOX) ]</span>
                </>
              )}
            </button>
          </div>

          <div className="text-[10px] text-zinc-500 text-center">
            🔒 Checkout protegido com criptografia bancária. Usuário ativo: <strong className="text-zinc-400">@{user?.handle || 'cadet'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
