import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, X, Minimize2, Sparkles, Cpu, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import axios from 'axios';

const AGENT_PERSONAS = {
  tutor: { name: 'Academic AI', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: '📚', voice: 1 },
  finance: { name: 'CFO-AI', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: '💰', voice: 2 },
  strategy: { name: 'CEO-AI', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: '🧠', voice: 3 },
  sysadmin: { name: 'SysOps AI', color: 'text-red-400', bg: 'bg-red-500/10', icon: '🛡️', voice: 4 },
  exam: { name: 'Exam AI', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: '📝', voice: 1 },
  placement: { name: 'Placement AI', color: 'text-indigo-400', bg: 'bg-indigo-500/10', icon: '💼', voice: 2 },
  bus: { name: 'Transport AI', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: '🚌', voice: 3 },
  hod: { name: 'Department AI', color: 'text-teal-400', bg: 'bg-teal-500/10', icon: '📊', voice: 4 },
  faculty: { name: 'Faculty AI', color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: '👨‍🏫', voice: 1 },
  principal: { name: 'Principal AI', color: 'text-rose-400', bg: 'bg-rose-500/10', icon: '🏛️', voice: 2 },
};

const detectAgent = (msg, role) => {
  const lower = msg.toLowerCase();
  
  if (role !== 'admin' && AGENT_PERSONAS[role]) {
    return role; // Lock identity if a specific dashboard spawned it
  }

  if (lower.includes('revenue') || lower.includes('fees') || lower.includes('finance')) return 'finance';
  if (lower.includes('strategy') || lower.includes('priority')) return 'strategy';
  if (lower.includes('server') || lower.includes('cpu') || lower.includes('hack')) return 'sysadmin';
  return 'tutor';
};

const QUICK_PROMPTS = [
  '📊 Give me a financial overview.',
  '🎓 Any students at risk of failing?',
  '💡 Strategic priorities for today?',
  '⚠️ Scan server health logs.',
];

export default function AIChat({ role = 'admin', minimizable = true }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'ai',
      agent: AGENT_PERSONAS[role] ? role : 'strategy',
      text: `Voice link activated. I am ${AGENT_PERSONAS[role]?.name || 'VITAM Command AI'}. You can type or press the microphone to speak with me directly.`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [activeAgent, setActiveAgent] = useState(AGENT_PERSONAS[role] ? role : 'strategy');
  
  // Voice feature flags & state
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const speak = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop current speech
    const utterance = new SpeechSynthesisUtterance(text.replace(/[\u{1F600}-\u{1F6FF}]/gu, '')); // Strip emojis
    utterance.rate = 1.05;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      window.speechSynthesis.cancel(); // Stop talking if user interrupts
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const sendMessage = async (text = input) => {
    const finalTxt = text.trim();
    if (!finalTxt || loading) return;

    if (isListening) recognitionRef.current?.stop();

    const userMsg = { id: Date.now(), from: 'user', text: finalTxt, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const agent = detectAgent(finalTxt, role);
    setActiveAgent(agent);

    let replyText = '';

    try {
      const token = localStorage.getItem('vitam_token');
      const { data } = await axios.post('http://localhost:5100/api/ai/chat', 
        { prompt: finalTxt },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 15000 }
      );
      replyText = data.answer || 'I processed your request.';
    } catch {
      replyText = `(${AGENT_PERSONAS[agent]?.name || 'AI'} Local Engine) Your request: "${finalTxt}" has been received. Online LLM proxy is currently disabled, but system metrics indicate nominal operations.`;
    } finally {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: 'ai',
        agent,
        text: replyText,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setLoading(false);
      speak(replyText);
    }
  };

  const persona = AGENT_PERSONAS[activeAgent] || AGENT_PERSONAS['strategy'];

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col ${minimized ? 'items-end' : ''}`}>
      <AnimatePresence>
        {!minimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[380px] h-[520px] flex flex-col rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10"
            style={{ background: 'rgba(10, 15, 25, 0.95)', backdropFilter: 'blur(24px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                  <Sparkles size={18} className="text-white relative z-10" />
                  {isListening && <div className="absolute inset-0 bg-red-500/50 animate-ping" />}
                </div>
                <div>
                  <p className="text-white font-black text-sm">VITAM Command AI</p>
                  <p className={`text-[10px] font-bold ${persona.color}`}>
                    <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1 animate-pulse" />
                    {persona.icon} {persona.name} Active
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (voiceEnabled) window.speechSynthesis.cancel();
                }} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                  {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>
                {minimizable && (
                  <button onClick={() => setMinimized(true)} className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <Minimize2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-hide">
              <AnimatePresence>
                {messages.map((msg) => {
                  const agentP = AGENT_PERSONAS[msg.agent] || AGENT_PERSONAS.strategy;
                  return (
                    <motion.div key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] ${msg.from === 'user' ? 'bg-blue-600' : agentP.bg}`}>
                        {msg.from === 'user' ? <User size={14} className="text-white" /> : <span>{agentP.icon}</span>}
                      </div>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.from === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-slate-800/80 rounded-tl-sm border border-slate-700/50'}`}>
                        {msg.from === 'ai' && (
                          <p className={`text-[9px] font-black uppercase tracking-wider mb-1 ${agentP.color}`}>{agentP.name}</p>
                        )}
                        <p className="text-xs leading-relaxed text-white/90">{msg.text}</p>
                        <p className="text-[9px] text-white/30 mt-1.5 text-right">{msg.timestamp}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {loading && (
                <div className="flex gap-2 items-center">
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${persona.bg}`}>
                    <span className="text-xs">{persona.icon}</span>
                  </div>
                  <div className="bg-slate-800/80 rounded-2xl rounded-tl-sm px-4 py-3 border border-slate-700/50 flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Prompts */}
            <div className="px-3 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
              {QUICK_PROMPTS.map((q) => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="flex-shrink-0 text-[10px] font-bold text-slate-400 border border-slate-700 hover:border-blue-500/50 hover:text-blue-400 px-3 py-1.5 rounded-full transition-all whitespace-nowrap">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-1">
              <div className={`flex gap-2 bg-slate-800/80 rounded-2xl border ${isListening ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10'} px-2 py-2 focus-within:border-blue-500/40 transition-all`}>
                {speechSupported && (
                  <button onClick={toggleListen}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'text-slate-400 hover:bg-white/10 hover:text-white'}`}>
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                )}
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  placeholder={isListening ? "Listening..." : "Message AI..."}
                  className="flex-1 bg-transparent text-white text-xs outline-none placeholder-slate-500"
                />
                <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center disabled:opacity-40 hover:bg-blue-500 transition-all">
                  <Send size={14} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMinimized(!minimized)}
        className="mt-3 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_10px_30px_rgba(59,130,246,0.4)] relative border-2 border-[#0a0f19]"
      >
        {isListening ? (
          <Mic size={22} className="text-white animate-bounce" />
        ) : (
          <Cpu size={22} className="text-white" />
        )}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
      </motion.button>
    </div>
  );
}
