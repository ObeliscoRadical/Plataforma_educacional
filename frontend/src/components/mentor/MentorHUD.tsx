import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { useTerminal } from '../../context/TerminalContext.js';
import { api } from '../../api/client.js';
import { MentorFeedback } from '../../types/index.js';
import { 
  Bot, X, Send, Sparkles, AlertTriangle, 
  HelpCircle, Code2, ShieldAlert, Volume2, VolumeX, RotateCcw,
  Mic, MicOff, Radio
} from 'lucide-react';

export const MentorHUD: React.FC = () => {
  const { user } = useAuth();
  const { currentLessonId, mentorOpen, setMentorOpen, addLog } = useTerminal();
  const [messages, setMessages] = useState<MentorFeedback[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (mentorOpen) {
      loadHistory();
    } else {
      stopCurrentAudio();
      stopVoiceRecognition();
    }
  }, [mentorOpen, currentLessonId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const stopCurrentAudio = () => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMessageId(null);
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const startVoiceRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addLog('Reconhecimento de voz não suportado neste navegador. Digite sua mensagem no campo.', 'WARN');
      return;
    }

    try {
      stopCurrentAudio();
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        addLog('Microfone ativado. Fale sua pergunta para o Mentor IA...', 'INFO');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputMessage(transcript);
          addLog(`Voz reconhecida: "${transcript}"`, 'INFO');
          // Automatically submit message after voice input
          setTimeout(() => {
            handleSendMessageText(transcript);
          }, 300);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        addLog(`Erro no microfone: ${event.error}`, 'WARN');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      addLog(`Falha ao iniciar microfone: ${err.message}`, 'ERROR');
    }
  };

  const cleanTextForSpeech = (rawText: string): string => {
    return rawText
      .replace(/```[\s\S]*?```/g, ' [Trecho de código demonstrado na tela] ')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/#+\s*/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();
  };

  const narrateText = async (text: string, msgId?: string) => {
    if (!voiceEnabled) return;
    stopCurrentAudio();

    const clean = cleanTextForSpeech(text);
    if (!clean) return;

    if (msgId) setSpeakingMessageId(msgId);

    try {
      const synthRes = await api.synthesizeSpeech(clean);
      if (synthRes.success && synthRes.audioUrl) {
        const audio = new Audio(synthRes.audioUrl);
        activeAudioRef.current = audio;
        audio.onended = () => setSpeakingMessageId(null);
        audio.onerror = () => setSpeakingMessageId(null);
        await audio.play();
        return;
      }
    } catch {
      // fallback
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'pt-BR';
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await api.getMentorHistory(currentLessonId || undefined);
      setMessages(res.messages || []);
    } catch {
      // ignore
    }
  };

  const handleSendMessageText = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setInputMessage('');
    setLoading(true);
    stopCurrentAudio();

    const tempUserMsg: MentorFeedback = {
      id: Math.random().toString(),
      sessionId: 'session',
      message: textToSend,
      sender: 'USER',
      hintLevel,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await api.chatMentor({
        message: textToSend,
        lessonId: currentLessonId || undefined,
        hintLevel
      });

      setMessages(prev => [...prev, res]);
      addLog(`Mentor reply (Level ${hintLevel}) received.`, 'INFO');

      if (voiceEnabled && res.message) {
        narrateText(res.message, res.id);
      }
    } catch (err: any) {
      addLog(`Mentor communication error: ${err.message}`, 'ERROR');
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          sessionId: 'session',
          message: `[SISTEMA] Falha de comunicação com o Mentor (${err.message}).`,
          sender: 'MENTOR_AI',
          hintLevel,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessageText(inputMessage);
  };

  if (!mentorOpen) return null;

  const hintLevelDescriptions = [
    { level: 1, title: 'Pergunta Socrática', penalty: '0% Autonomia', desc: 'Induz reflexão sem entregar o caminho.' },
    { level: 2, title: 'Pista Conceitual', penalty: '-5% Autonomia', desc: 'Explica o conceito ou estrutura.' },
    { level: 3, title: 'Indicação do Problema', penalty: '-10% Autonomia', desc: 'Aponta o ponto exato da dificuldade.' },
    { level: 4, title: 'Passo a Passo Detalhado', penalty: '-15% Autonomia', desc: 'Guia linha a linha sem código final.' },
    { level: 5, title: 'Solução Comentada', penalty: '-25% Autonomia', desc: 'Código de referência integral com comentários.' }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-lg bg-dev-surface border border-dev-cyan/40 rounded-lg shadow-terminal overflow-hidden flex flex-col h-[580px]">
      {/* Mentor Shell Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-dev-bg border-b border-dev-border">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-dev-cyan animate-pulse" />
          <span className="text-xs font-bold text-dev-cyan">
            MENTOR_AI // PROCESS DAEMON
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold">
            ONLINE
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Auto-Narration Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              if (!next) stopCurrentAudio();
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
              voiceEnabled ? 'bg-dev-green/20 text-dev-green border border-dev-green/40' : 'bg-zinc-800 text-dev-muted border border-dev-border'
            }`}
            title={voiceEnabled ? 'Narração por voz ATIVA' : 'Narração por voz MUTADA'}
          >
            {voiceEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
            <span>{voiceEnabled ? 'VOZ ON' : 'VOZ OFF'}</span>
          </button>

          <button 
            onClick={() => {
              stopCurrentAudio();
              stopVoiceRecognition();
              setMentorOpen(false);
            }} 
            className="text-dev-muted hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scaffolding Level Selector (1-5) */}
      <div className="px-3 py-2 bg-dev-surfaceHover border-b border-dev-border">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-dev-muted">SCAFFOLDING LEVEL:</span>
          <span className="text-dev-cyan font-bold">{hintLevelDescriptions[hintLevel - 1].title}</span>
          <span className="text-amber-400 font-bold">{hintLevelDescriptions[hintLevel - 1].penalty}</span>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setHintLevel(lvl)}
              className={`py-1 rounded text-center text-xs font-bold transition-all ${
                hintLevel === lvl
                  ? 'bg-dev-cyan text-dev-bg'
                  : 'bg-dev-bg border border-dev-border text-dev-muted hover:text-white'
              }`}
            >
              L{lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-dev-bg/90">
        {messages.length === 0 ? (
          <div className="p-4 rounded bg-dev-surface border border-dev-border text-zinc-400 text-center space-y-2">
            <Bot className="w-8 h-8 text-dev-cyan mx-auto animate-bounce" />
            <div className="font-bold text-white">Mentor IA Pronto // Voz Bidirecional Ativa</div>
            <div className="text-[11px] text-dev-muted leading-relaxed">
              Você pode digitar ou **clicar no microfone [ 🎙️ ] abaixo para falar** diretamente em português com o Professor Marcus!
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            const isSpeakingThis = speakingMessageId === m.id;
            return (
              <div
                key={i}
                className={`flex flex-col ${m.sender === 'USER' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-lg leading-relaxed relative ${
                    m.sender === 'USER'
                      ? 'bg-dev-green/10 border border-dev-green/30 text-white'
                      : 'bg-dev-surface border border-dev-cyan/30 text-zinc-200 shadow-terminal'
                  }`}
                >
                  <div className="text-[10px] font-bold mb-1 flex items-center justify-between gap-2">
                    {m.sender === 'USER' ? (
                      <span className="text-dev-green">CADET @{user?.handle || 'dev'}</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-dev-cyan">MENTOR_AI &gt; (Scaffolding L{m.hintLevel || 1})</span>
                        {isSpeakingThis && (
                          <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold bg-emerald-500/20 px-1.5 py-0.2 rounded animate-pulse">
                            <Volume2 className="w-2.5 h-2.5" /> Narrando...
                          </span>
                        )}
                      </div>
                    )}

                    {m.sender !== 'USER' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (isSpeakingThis) {
                            stopCurrentAudio();
                          } else {
                            narrateText(m.message, m.id);
                          }
                        }}
                        className="text-dev-muted hover:text-dev-cyan p-0.5 rounded transition-colors"
                        title={isSpeakingThis ? 'Pausar Áudio' : 'Ouvir Narração'}
                      >
                        {isSpeakingThis ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>

                  <div className="whitespace-pre-wrap">{m.message}</div>

                  {m.suggestedCode && (
                    <div className="mt-2 p-2 rounded bg-black/80 border border-dev-border text-[11px] text-dev-green overflow-x-auto">
                      <pre>{m.suggestedCode}</pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        {loading && (
          <div className="flex items-center gap-2 text-dev-cyan text-xs animate-pulse">
            <Bot className="w-4 h-4" />
            <span>formulando orientação pedagógica e gerando síntese de voz...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Voice Recognition Banner if Active */}
      {isListening && (
        <div className="px-3 py-1.5 bg-rose-500/20 border-t border-rose-500/40 text-rose-300 text-[11px] flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-rose-400 animate-spin" />
            <span className="font-bold">Ouvindo sua voz... Fale sua pergunta agora!</span>
          </div>
          <button
            type="button"
            onClick={stopVoiceRecognition}
            className="text-white hover:text-rose-200 text-[10px] underline"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Message Input Bar with Microphone & Send */}
      <form onSubmit={handleSendMessage} className="p-2.5 bg-dev-surface border-t border-dev-border flex items-center gap-2">
        {/* Microphone Voice Button */}
        <button
          type="button"
          onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
          className={`p-2 rounded font-bold transition-all flex items-center justify-center ${
            isListening
              ? 'bg-rose-500 text-white animate-bounce'
              : 'bg-dev-bg border border-dev-border hover:border-dev-green text-dev-green'
          }`}
          title={isListening ? 'Parar Microfone' : 'Falar por Voz com o Professor'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Digite ou clique no 🎙️ para falar...`}
          className="flex-1 px-3 py-2 bg-dev-bg border border-dev-border rounded text-xs text-dev-text focus:border-dev-cyan outline-none"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="p-2 rounded bg-dev-cyan text-dev-bg font-bold hover:bg-dev-cyanDim transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
