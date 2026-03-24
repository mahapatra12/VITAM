import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Bot, User, Sparkles } from 'lucide-react';
import api from '../utils/api';

export default function VITABot() {
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([
    { role: "bot", text: "Hello! I am VITABot, your institutional AI assistant. How can I help you today?" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const sendMessage = async () => {
    if (!msg.trim() || loading) return;

    const userMsg = { role: "user", text: msg };
    setChat(prev => [...prev, userMsg]);
    setMsg("");
    setLoading(true);

    try {
      const { data } = await api.post("/ai/chat", { prompt: msg });
      setChat(prev => [...prev, { role: "bot", text: data.answer || "I processed your request, but the response was empty." }]);
    } catch (err) {
      setChat(prev => [...prev, { role: "bot", text: "Connection to Neural Hub interrupted. Please check your network." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-2xl z-50 border border-white/20"
      >
        {isOpen ? <X className="text-white" /> : <Bot className="text-white" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0a0a] animate-pulse" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 h-[450px] bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 p-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Sparkles size={16} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-widest">VITABot AI</h3>
                <p className="text-[10px] text-emerald-400 font-bold">Neural Engine Active</p>
              </div>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide"
            >
              {chat.map((c, i) => (
                <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] ${
                    c.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-white/5 text-slate-200 border border-white/10 rounded-bl-none'
                  }`}>
                    {c.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-75" />
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-white/[0.02]">
              <div className="relative">
                <input
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask VITAM AI..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-[11px] text-white focus:outline-none focus:border-blue-500/50 transition-all pr-10"
                />
                <button
                  onClick={sendMessage}
                  className="absolute right-2 top-1.5 p-1.5 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
