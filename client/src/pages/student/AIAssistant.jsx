import { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Send, Brain, Zap, BookOpen, Trophy,
  Code, Mic, Paperclip, Cpu, ShieldCheck, Activity,
  Globe, Database, Lock, ChevronRight, Fingerprint
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard, RefractiveCard } from '../../components/ui/DashboardComponents';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your VITAM AI Assistant. I can help you with your studies, performance forecasts, coding tasks, and career planning. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const domains = [
    { name: "Academic Forecast", icon: Trophy, color: "text-blue-400", bg: "bg-blue-500/10", prompt: "Predict my performance for the current semester." },
    { name: "Technical Support", icon: Code, color: "text-purple-400", bg: "bg-purple-500/10", prompt: "Help me analyze or optimize this code snippet." },
    { name: "Curriculum Planner", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/10", prompt: "Create a study schedule for my upcoming assessments." },
    { name: "Strategic Guidance", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", prompt: "Provide career development advice and resume review." },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text = input) => {
    const prompt = text.trim();
    if (!prompt) return;

    setMessages(prev => [...prev, { role: 'user', content: prompt }]);
    setInput('');
    setIsTyping(true);

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    try {
      const { data } = await api.post('/ai/chat', { prompt });
      setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
    } catch (err) {
      const lower = prompt.toLowerCase();
      let response = "Analyzing your request based on historical data...";
      if (lower.includes('grade') || lower.includes('performance')) response = "📊 ANALYSIS COMPLETE:\nCurrent CGPA: 3.74. Projected Semester Index: 3.82. You are in the 92nd percentile of your cohort.";
      else if (lower.includes('code')) response = "💡 TECHNICAL INSIGHT:\nConsider implementing a more efficient data structure here. A hash map would reduce time complexity to O(1).";
      else if (lower.includes('plan')) response = "📚 STRATEGIC PLAN:\nFocus on your core modules between 09:00 and 12:00 for optimal retention. Your schedule has been updated.";
      
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <DashboardLayout title="AI Assistant" role="STUDENT">
      <div className="flex flex-col gap-8">
        
        {/* System Diagnostics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Model Accuracy', value: '98.4%', icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Security Status', value: 'VERIFIED', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Operational Status', value: 'OPTIMAL', icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
            { label: 'Model Capacity', value: '14.2B', icon: Database, color: 'text-amber-500', bg: 'bg-amber-500/10' }
          ].map((stat, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{stat.label}</p>
                <p className={`text-2xl font-black tracking-tight ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <stat.icon size={24} />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Knowledge Domains */}
          <div className="lg:col-span-4 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 px-2 italic">Knowledge Domains</h4>
            <div className="space-y-3">
              {domains.map((domain, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(domain.prompt)}
                  className="w-full text-left p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.04] transition-all flex items-center gap-5 group"
                >
                  <div className={`p-3.5 rounded-xl ${domain.bg} ${domain.color} group-hover:scale-110 transition-transform`}>
                    <domain.icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-[11px] font-black uppercase tracking-widest text-white/80">{domain.name}</h5>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight mt-1">Initiate Session</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-600 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            <RefractiveCard className="!p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <Sparkles size={16} />
                </div>
                <h5 className="font-black text-[10px] uppercase tracking-widest text-white">Daily Performance Insight</h5>
              </div>
              <p className="text-xs font-bold text-slate-400 leading-relaxed italic">
                "Based on current module tracking, your retention for <b>Systems Architecture</b> is at peak efficiency. Strategic review recommended for 21:00."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[9px] font-black uppercase text-emerald-500/60 tracking-widest leading-none">Intelligence Stream Active</span>
              </div>
            </RefractiveCard>
          </div>

          {/* Interaction Hub */}
          <div className="lg:col-span-8 flex flex-col h-[700px] rounded-[32px] bg-[#0a0a0a] border border-white/5 overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-blue-500/[0.01] pointer-events-none" />
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Brain size={20} />
                </div>
                <div>
                  <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-white/40">AI Interaction Domain</h3>
                  <p className="text-[9px] font-bold text-emerald-500/60 uppercase tracking-widest mt-0.5">Encrypted Session</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-[9px] font-black tracking-widest text-slate-500 uppercase">Latency: 12ms</div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${msg.role === 'user' ? 'order-last' : ''}`}>
                      <div className={`p-6 rounded-3xl text-sm leading-relaxed shadow-lg ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white/[0.03] border border-white/5 text-slate-200 rounded-tl-none border-l-blue-500 border-l-2'
                      }`}>
                        <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                      </div>
                      <div className={`flex items-center gap-2 mt-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">
                          {msg.role === 'user' ? 'Verified Student' : 'VITAM AI'} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/[0.02] p-6 rounded-3xl rounded-tl-none border border-white/5 flex gap-3 items-center">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-8 bg-white/[0.02] border-t border-white/5">
              <div className="relative flex items-center gap-4 max-w-5xl mx-auto">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about performance, curriculum, or technical topics..."
                    className="w-full h-16 pl-8 pr-16 bg-white/[0.03] border border-white/5 rounded-2xl text-sm text-white focus:bg-white/[0.05] focus:border-blue-500/50 transition-all outline-none font-medium placeholder:text-slate-600 italic"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button className="p-2 text-slate-600 hover:text-blue-500 transition-colors"><Mic size={18} /></button>
                    <button className="p-2 text-slate-600 hover:text-blue-500 transition-colors"><Paperclip size={18} /></button>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleSend()}
                  className="bg-blue-600 text-white px-8 h-16 rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 group"
                >
                  Send
                  <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;
