import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bot,
  Cpu,
  MessageSquare,
  Mic,
  MicOff,
  Minimize2,
  Send,
  User,
  Volume2,
  VolumeX
} from 'lucide-react';
import api from '../utils/api';

const MAX_MESSAGES = 40;
const AI_TIMEOUT_MS = 15000;

const trimMessages = (messages) => messages.slice(-MAX_MESSAGES);

const AGENT_PERSONAS = {
  tutor: { name: 'Academic AI', tone: 'text-blue-200 border-blue-500/20 bg-blue-500/10' },
  finance: { name: 'Finance AI', tone: 'text-emerald-200 border-emerald-500/20 bg-emerald-500/10' },
  strategy: { name: 'Strategy AI', tone: 'text-violet-200 border-violet-500/20 bg-violet-500/10' },
  sysadmin: { name: 'SysOps AI', tone: 'text-rose-200 border-rose-500/20 bg-rose-500/10' },
  exam: { name: 'Exam AI', tone: 'text-amber-100 border-amber-500/20 bg-amber-500/10' },
  placement: { name: 'Placement AI', tone: 'text-indigo-200 border-indigo-500/20 bg-indigo-500/10' },
  bus: { name: 'Transit AI', tone: 'text-orange-100 border-orange-500/20 bg-orange-500/10' },
  hod: { name: 'Department AI', tone: 'text-teal-100 border-teal-500/20 bg-teal-500/10' },
  faculty: { name: 'Faculty AI', tone: 'text-cyan-100 border-cyan-500/20 bg-cyan-500/10' },
  principal: { name: 'Principal AI', tone: 'text-pink-100 border-pink-500/20 bg-pink-500/10' }
};

const QUICK_PROMPTS = [
  'Show me today’s important insights.',
  'Summarize risks I should review.',
  'What should I focus on next?',
  'Give me a short operational status.'
];

const detectAgent = (message, role) => {
  const lower = message.toLowerCase();

  if (role !== 'admin' && AGENT_PERSONAS[role]) {
    return role;
  }

  if (lower.includes('fee') || lower.includes('finance') || lower.includes('budget')) {
    return 'finance';
  }
  if (lower.includes('server') || lower.includes('security') || lower.includes('cpu')) {
    return 'sysadmin';
  }
  if (lower.includes('placement') || lower.includes('career')) {
    return 'placement';
  }
  if (lower.includes('exam') || lower.includes('result')) {
    return 'exam';
  }
  return 'strategy';
};

const resolveAiFailureMessage = (agent, prompt, error) => {
  const persona = AGENT_PERSONAS[agent]?.name || 'AI';

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return `${persona}: You appear to be offline. Reconnect and retry when the network is available.`;
  }

  const status = error?.response?.status;
  const code = error?.response?.data?.code;

  if (status === 429) {
    return `${persona}: The AI lane is rate limited right now. Please wait a moment and try again.`;
  }
  if (status === 400 || code === 'INVALID_PROMPT') {
    return `${persona}: Please send a slightly fuller prompt so I can answer more accurately.`;
  }
  if (status === 413 || code === 'PROMPT_TOO_LARGE') {
    return `${persona}: That request is too large. Shorten it and try again.`;
  }
  if (status === 503 || code === 'AI_UNAVAILABLE') {
    return `${persona}: The AI service is warming up or temporarily unavailable. The rest of the platform is still stable while you retry.`;
  }
  if (error?.code === 'ECONNABORTED' || /timeout/i.test(error?.message || '')) {
    return `${persona}: The response timed out. Try a shorter message or retry in a moment.`;
  }

  return `${persona}: I received "${prompt}", but the online model is unavailable right now. Please retry shortly.`;
};

export default function AIChat({ role = 'admin', minimizable = true }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'ai',
      agent: AGENT_PERSONAS[role] ? role : 'strategy',
      text: `I am ${AGENT_PERSONAS[role]?.name || 'VITAM AI'}. Ask for summaries, operational insights, or next-step guidance at any time.`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [activeAgent, setActiveAgent] = useState(AGENT_PERSONAS[role] ? role : 'strategy');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    mountedRef.current = true;

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          transcript += event.results[index][0].transcript;
        }
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      mountedRef.current = false;
      recognitionRef.current?.stop?.();
      window.speechSynthesis?.cancel?.();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const speak = (text) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.02;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListen = () => {
    if (!recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      window.speechSynthesis?.cancel?.();
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async (text = input) => {
    const finalText = text.trim();
    if (!finalText || loading) {
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop?.();
    }

    const userMessage = {
      id: Date.now(),
      from: 'user',
      text: finalText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((previous) => trimMessages([...previous, userMessage]));
    setInput('');
    setLoading(true);

    const agent = detectAgent(finalText, role);
    setActiveAgent(agent);

    let replyText = '';
    let canCommitResult = false;

    try {
      const { data } = await api.post('/ai/chat', { prompt: finalText }, { timeout: AI_TIMEOUT_MS });
      replyText = data.answer || 'I processed your request.';
    } catch (error) {
      replyText = resolveAiFailureMessage(agent, finalText, error);
    } finally {
      canCommitResult = mountedRef.current;
    }

    if (!canCommitResult) {
      return;
    }

    setMessages((previous) =>
      trimMessages([
        ...previous,
        {
          id: Date.now() + 1,
          from: 'ai',
          agent,
          text: replyText,
          timestamp: new Date().toLocaleTimeString()
        }
      ])
    );
    setLoading(false);
    speak(replyText);
  };

  const persona = AGENT_PERSONAS[activeAgent] || AGENT_PERSONAS.strategy;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {!minimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            className="premium-card flex h-[min(72vh,40rem)] w-[min(calc(100vw-1.5rem),26rem)] flex-col overflow-hidden"
          >
            <div className="border-b border-white/10 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-200">
                    <Bot size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">
                      VITAM AI Assistant
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`status-pill ${persona.tone}`}>
                        {persona.name}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceEnabled((current) => !current);
                      if (voiceEnabled) {
                        window.speechSynthesis?.cancel?.();
                      }
                    }}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-400 transition-all hover:text-white"
                  >
                    {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  </button>

                  {minimizable ? (
                    <button
                      type="button"
                      onClick={() => setMinimized(true)}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-400 transition-all hover:text-white"
                    >
                      <Minimize2 size={15} />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="border-b border-white/5 px-4 py-3">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendMessage(prompt)}
                    disabled={loading}
                    className="status-pill whitespace-nowrap disabled:opacity-40"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const messagePersona = AGENT_PERSONAS[message.agent] || AGENT_PERSONAS.strategy;
                  const isUser = message.from === 'user';

                  return (
                    <div key={message.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser ? (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-blue-200">
                          <Bot size={15} />
                        </div>
                      ) : null}

                      <div className={`max-w-[82%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                        {!isUser ? (
                          <span className={`mb-1 text-[10px] font-extrabold uppercase tracking-[0.22em] ${messagePersona.tone.split(' ')[0]}`}>
                            {messagePersona.name}
                          </span>
                        ) : null}

                        <div className={`rounded-[1.4rem] px-4 py-3 text-sm leading-6 ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-tr-md'
                            : 'border border-white/10 bg-slate-950/75 text-slate-100 rounded-tl-md'
                        }`}>
                          {message.text}
                        </div>

                        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                          {message.timestamp}
                        </span>
                      </div>

                      {isUser ? (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
                          <User size={15} />
                        </div>
                      ) : null}
                    </div>
                  );
                })}

                {loading ? (
                  <div className="flex gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-blue-200">
                      <Bot size={15} />
                    </div>
                    <div className="surface-card flex items-center gap-1.5 px-4 py-3">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.15s' }} />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: '0.3s' }} />
                    </div>
                  </div>
                ) : null}
                <div ref={bottomRef} />
              </div>
            </div>

            <div className="border-t border-white/10 p-4">
              <div className={`flex items-center gap-2 rounded-[1.4rem] border px-2 py-2 transition-all ${isListening ? 'border-rose-500/40 bg-rose-500/8' : 'border-white/10 bg-slate-950/75'}`}>
                {speechSupported ? (
                  <button
                    type="button"
                    onClick={toggleListen}
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all ${isListening ? 'bg-rose-500/15 text-rose-300' : 'text-slate-400 hover:bg-white/6 hover:text-white'}`}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                ) : null}

                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      sendMessage();
                    }
                  }}
                  placeholder={isListening ? 'Listening...' : 'Ask for insights, summaries, or next steps...'}
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />

                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white transition-all hover:bg-blue-500 disabled:opacity-40"
                >
                  <Send size={15} />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  {isOnline ? 'AI link healthy' : 'Reconnect to use AI'}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  <MessageSquare size={12} />
                  {messages.length} messages
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMinimized((current) => !current)}
        className="mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white shadow-[0_14px_34px_rgba(59,130,246,0.35)]"
      >
        {isListening ? <Mic size={20} /> : minimized ? <MessageSquare size={20} /> : <Cpu size={20} />}
      </motion.button>
    </div>
  );
}
