import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';
import api from '../utils/api';

const AI_TIMEOUT_MS = 15000;
const MAX_CHAT_MESSAGES = 30;

const trimChat = (messages) => messages.slice(-MAX_CHAT_MESSAGES);

const resolveChatFailure = (error) => {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'Institutional link severed. Please reconnect to sovereign node.';
  }
  const status = error?.response?.status;
  if (status === 429) return 'AI Analysis Engine is at peak capacity. Delaying response...';
  if (status === 503) return 'Strategic Analysis Hub synchronizing. Features migrating...';
  return 'Strategic link interrupted. Retrying handshake...';
};

export default function VITABot() {
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([
    { role: "bot", text: "Welcome to the Sovereign Hub. I am your VITAM AI Strategic Assistant. How may I direct your institutional operations today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const scrollRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat, loading]);

  useEffect(() => {
    mountedRef.current = true;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      mountedRef.current = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const sendMessage = async () => {
    if (!msg.trim() || loading) return;
    const prompt = msg.trim();
    const userMsg = { role: "user", text: prompt };
    setChat(prev => trimChat([...prev, userMsg]));
    setMsg("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", { prompt }, { timeout: AI_TIMEOUT_MS });
      if (!mountedRef.current) return;
      setChat(prev => trimChat([...prev, { role: "bot", text: data.answer || "Handshake complete. Directives updated." }]));
    } catch (err) {
      if (!mountedRef.current) return;
      setChat(prev => trimChat([...prev, { role: "bot", text: resolveChatFailure(err) }]));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[150] font-['Poppins']">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 50, scale: 0.9, rotate: 5 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="absolute bottom-20 right-0 w-[380px] h-[550px] glass-card bg-[#0f2027]/90 backdrop-blur-3xl border-white/10 shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Premium Neural Header */}
              <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#00c6ff]/10 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#00c6ff]/10 border border-[#00c6ff]/30 flex items-center justify-center text-[#00c6ff] shadow-lg shadow-[#00c6ff]/10 relative overflow-hidden group">
                     <Sparkles size={22} className="relative z-10 group-hover:scale-110 transition-transform" />
                     <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-br from-transparent via-[#00c6ff]/10 to-transparent" 
                     />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-black text-white uppercase tracking-[0.4em] italic">Neural Assistant</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400'}`} />
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 italic">
                        {isOnline ? 'Direct Sovereign Link' : 'Offline Mode Enabled'}
                      </p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Advanced Chat Stream */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {chat.map((c, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: c.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={i} 
                    className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-4 rounded-2xl text-[12px] leading-relaxed shadow-lg ${
                      c.role === 'user' 
                        ? 'bg-gradient-to-br from-[#00c6ff] to-[#0072ff] text-white rounded-br-none italic font-medium' 
                        : 'bg-white/[0.04] text-white/80 border border-white/5 rounded-bl-none'
                    }`}>
                      {c.text}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl rounded-bl-none">
                      <motion.div 
                        animate={{ opacity: [0.4, 1, 0.4] }} 
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="flex gap-2"
                      >
                         <Zap size={14} className="text-[#00c6ff] animate-pulse" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Analyzing Directive...</span>
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>

              {/* Neural Input Field */}
              <div className="p-6 border-t border-white/5 bg-white/[0.02]">
                <div className="grid grid-cols-3 gap-2 mb-4">
                   {['Status', 'Sync', 'Audit'].map(tag => (
                      <button key={tag} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-[#00c6ff] hover:bg-[#00c6ff]/10 hover:border-[#00c6ff]/30 transition-all">
                        {tag}
                      </button>
                   ))}
                </div>
                <div className="relative group">
                  <input
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Enter Command..."
                    className="w-full bg-[#0f2027] border border-white/10 rounded-2xl px-5 py-4 text-[12px] text-white placeholder-white/10 focus:outline-none focus:border-[#00c6ff]/40 transition-all pr-12 shadow-inner"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !msg.trim()}
                    className="absolute right-3 top-3.5 w-8 h-8 rounded-xl bg-[#00c6ff]/10 text-[#00c6ff] flex items-center justify-center hover:bg-[#00c6ff] hover:text-white transition-all disabled:opacity-20"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Holographic Orb Toggle */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-3xl bg-[#0f2027]/80 backdrop-blur-3xl border border-white/10 flex items-center justify-center shadow-2xl relative group overflow-hidden"
        >
          {/* Internal Glow Pulse */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00c6ff]/20 to-[#0072ff]/20 animate-pulse pointer-events-none" />
          
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="text-white" size={24} />
              </motion.div>
            ) : (
              <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} className="relative flex items-center justify-center">
                 <Bot className="text-[#00c6ff] group-hover:scale-110 transition-transform" size={28} />
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0f2027] shadow-[0_0_8px_#10b981]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanning Line Effect */}
          <motion.div 
            animate={{ top: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-[10px] bg-white/5 blur-sm skew-y-12 pointer-events-none"
          />
        </motion.button>
      </div>
    </>
  );
}
