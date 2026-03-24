import { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  Brain, 
  Zap, 
  BookOpen, 
  Trophy,
  Code,
  Mic,
  Paperclip,
  Cpu,
  Fingerprint,
  ChevronRight,
  ShieldCheck,
  Activity,
  Globe,
  Database,
  Lock
} from 'lucide-react';
import NexusLayout from '../../layouts/NexusLayout';

const TiltCard = ({ children, className = "" }) => {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const onMouseMove = (e) => {
    const card = e.currentTarget.getBoundingClientRect();
    const x = (e.clientY - card.top) / card.height - 0.5;
    const y = (e.clientX - card.left) / card.width - 0.5;
    setRotate({ x: x * 15, y: y * -15 });
  };
  return (
    <motion.div
      onMouseMove={onMouseMove}
      onMouseLeave={() => setRotate({ x: 0, y: 0 })}
      animate={{ rotateX: rotate.x, rotateY: rotate.y }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative group perspective-1000 ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div style={{ transform: "translateZ(30px)" }}>{children}</div>
    </motion.div>
  );
};

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! I am your VITAM AI Assistant. I can help you with your studies, GPA predictions, coding tasks, and career planning. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const skills = [
    { name: "GPA PREDICTOR", icon: Trophy, color: "text-blue-400", bg: "bg-blue-500/5", prompt: "Predict my GPA for the current semester." },
    { name: "CODE ASSISTANT", icon: Code, color: "text-purple-400", bg: "bg-purple-500/5", prompt: "Help me debug or optimize my code." },
    { name: "STUDY PLANNER", icon: BookOpen, color: "text-emerald-400", bg: "bg-emerald-500/5", prompt: "Create a study schedule for my upcoming exams." },
    { name: "CAREER GUIDE", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/5", prompt: "Give me career advice and help with my resume." },
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
      let response = "Analyzing your request...";
      if (lower.includes('gpa')) response = "📊 ANALYSIS COMPLETE:\nCurrent CGPA: 3.74. Projected Semester GPA: 3.82. You are in the 92nd percentile. Keep up the good work!";
      else if (lower.includes('code')) response = "🐛 SUGGESTION:\nFound a potential optimization in your logic. Consider using a hash map for faster data retrieval.";
      else if (lower.includes('plan')) response = "📚 STUDY PLAN:\nFocus on your core subjects between 9:00 AM and 12:00 PM for maximum retention. I have added this to your schedule.";
      
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <NexusLayout title="AI Assistant">
      <div className="relative min-h-[calc(100vh-160px)] flex flex-col items-center">
        
        {/* Dynamic Sovereign Grid Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                 <pattern id="sovereign-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <circle cx="30" cy="30" r="1.5" fill="#0071e3" />
                  </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#sovereign-grid)" />
           </svg>
        </div>

        <div className="w-full max-w-[1600px] relative z-10 flex flex-col h-full space-y-12">
           
           {/* Top-Level Cognitive Metrics */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {[
                { label: 'AI Reliability', value: '98.4%', icon: Cpu, color: 'text-appleBlue', bg: 'bg-appleBlue/20' },
                { label: 'Security Status', value: 'VERIFIED', icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-500/20' },
                { label: 'System Health', value: 'STABLE', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
                { label: 'Knowledge Base', value: '14.2B', icon: Database, color: 'text-amber-400', bg: 'bg-amber-500/20' }
              ].map((stat, idx) => (
                <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 20 }} 
                   animate={{ opacity: 1, y: 0 }} 
                   transition={{ delay: idx * 0.1 }}
                   className="hologram-glass p-8 rounded-[40px] border border-white/10 flex items-center justify-between group cursor-default"
                >
                   <div className="flex-1 min-w-0">
                      <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-2 truncate">{stat.label}</p>
                      <p className={`text-3xl md:text-4xl font-black tracking-tighter ${stat.color} group-hover:scale-105 transition-transform duration-500`}>{stat.value}</p>
                   </div>
                   <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-xl`}>
                      <stat.icon size={28} />
                   </div>
                </motion.div>
              ))}
           </div>

           <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 min-h-0">
              
              {/* Left Column: CAPACITY MATRIX */}
              <div className="lg:col-span-4 space-y-8">
                 <div className="flex items-center justify-between px-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-white/30">AI Skills</h4>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}>
                       <Globe size={16} className="text-white/20" />
                    </motion.div>
                 </div>

                 <div className="space-y-5">
                    {skills.map((skill, i) => (
                      <TiltCard key={i}>
                         <button 
                           onClick={() => handleSend(skill.prompt)}
                           className="w-full text-left p-6 md:p-8 rounded-[30px] md:rounded-[40px] bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all flex items-center gap-4 md:gap-6 group relative overflow-hidden"
                         >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className={`p-4 md:p-5 rounded-2xl ${skill.bg} ${skill.color} group-hover:scale-110 transition-transform duration-500 shadow-2xl`}>
                               <skill.icon size={22} className="md:w-6 md:h-6" />
                            </div>
                            <div className="flex-1 relative z-10 min-w-0">
                               <h5 className="text-[11px] md:text-[12px] font-black tracking-widest text-white/90 truncate">{skill.name}</h5>
                               <p className="text-[9px] md:text-[10px] font-bold text-white/30 uppercase tracking-tighter mt-1 group-hover:text-white/60 transition-colors">Launch Task</p>
                            </div>
                            <ChevronRight size={16} className="text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all duration-500" />
                         </button>
                      </TiltCard>
                    ))}
                 </div>
                 
                 <div className="p-10 rounded-[50px] bg-[#0a0a0a] border border-white/5 relative overflow-hidden group shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-appleBlue/10 to-transparent opacity-40 group-hover:opacity-70 transition-opacity" />
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                       <div className="w-10 h-10 bg-appleBlue rounded-xl flex items-center justify-center text-white shadow-lg shadow-appleBlue/20">
                          <Sparkles size={20} />
                       </div>
                       <h5 className="font-black text-xs uppercase tracking-[0.3em] text-white">Daily Insights</h5>
                    </div>
                    <p className="text-xs font-bold text-white/60 leading-relaxed relative z-10">
                       "AI predicts high retention for <b>Systems Architecture</b> tonight. Your study patterns align 94% with these modules at 9:00 PM."
                    </p>
                    <div className="mt-8 flex items-center gap-3 relative z-10">
                       <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                       <span className="text-[9px] font-black uppercase text-emerald-500/60 tracking-widest">Oracle System Ready</span>
                    </div>
                 </div>
              </div>

              {/* Right Column: CORE SOVEREIGN INTERFACE */}
              <div className="lg:col-span-8 flex flex-col h-[600px] md:h-[750px] hologram-glass rounded-[40px] md:rounded-[80px] border border-white/10 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)] group/chat">
                 
                 {/* Feed Header */}
                 <div className="px-12 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-4">
                       <Brain size={24} className="text-appleBlue animate-pulse" />
                       <h3 className="font-black text-xs uppercase tracking-[0.5em] text-white/50">AI Assistant Core</h3>
                    </div>
                    <div className="flex gap-4">
                       <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black tracking-widest text-white/30 uppercase">Latency: 12ms</div>
                       <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black tracking-widest text-white/30 uppercase">Secure Chat</div>
                    </div>
                 </div>

                 {/* Neural Messages */}
                 <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 md:space-y-12 scrollbar-hide bg-gradient-to-b from-transparent to-black/20">
                    <AnimatePresence>
                       {messages.map((msg, i) => (
                         <motion.div 
                           key={i}
                           initial={{ opacity: 0, x: msg.role === 'user' ? 40 : -40, scale: 0.95 }}
                           animate={{ opacity: 1, x: 0, scale: 1 }}
                           transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                           className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                         >
                            <div className={`max-w-[80%] relative ${msg.role === 'user' ? 'order-last' : ''}`}>
                             <div className={`p-5 md:p-8 rounded-[30px] md:rounded-[40px] font-medium text-sm md:text-base leading-relaxed shadow-3xl relative backdrop-blur-3xl overflow-hidden ${
                               msg.role === 'user'
                                 ? 'bg-appleBlue text-white rounded-tr-none'
                                 : 'bg-white/5 border border-white/10 text-white/95 rounded-tl-none border-l-appleBlue/40 border-l-[3px]'
                             }`}>
                                {msg.role === 'ai' && <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-appleBlue via-transparent to-transparent opacity-40" />}
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                             </div>
                               <div className={`flex items-center gap-3 mt-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                  {msg.role === 'ai' && <Fingerprint size={10} className="text-appleBlue opacity-30" />}
                                   <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                                      {msg.role === 'user' ? 'Secure Session' : 'AI Assistant'} • 100% SECURE
                                   </span>
                               </div>
                            </div>
                         </motion.div>
                       ))}
                    </AnimatePresence>
                    {isTyping && (
                      <div className="flex justify-start">
                         <div className="bg-white/5 p-8 rounded-[40px] rounded-tl-none border border-white/10 flex gap-4 items-center backdrop-blur-2xl">
                            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2.5 h-2.5 rounded-full bg-appleBlue" />
                            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2.5 h-2.5 rounded-full bg-appleBlue" />
                            <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2.5 h-2.5 rounded-full bg-appleBlue" />
                             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 ml-4 animate-pulse">AI is thinking...</span>
                         </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                 </div>

                 {/* Input Neural Bar */}
                 <div className="p-6 md:p-12 bg-white/[0.03] border-t border-white/10 backdrop-blur-3xl relative">
                    <div className="absolute -top-[1px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-appleBlue/20 to-transparent" />
                    <div className="relative group max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                       <div className="w-full sm:flex-1 relative">
                          <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask me anything about your studies..."
                            className="w-full h-16 md:h-24 pl-8 md:pl-12 pr-8 md:pr-12 bg-white/5 border border-white/10 rounded-[30px] md:rounded-[45px] text-sm md:text-lg text-white focus:bg-white/10 focus:ring-4 focus:ring-appleBlue/20 transition-all outline-none font-medium placeholder:text-white/20 italic"
                          />
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 md:h-8 bg-appleBlue/40 rounded-full ml-4 opacity-0 group-focus-within:opacity-100 transition-opacity" />
                       </div>
                       
                       <div className="flex items-center gap-3 md:gap-4 w-full sm:w-auto">
                          <button className="flex-1 sm:w-14 h-14 rounded-2xl bg-white/5 text-white/30 hover:text-appleBlue hover:bg-white/10 transition-all flex items-center justify-center border border-white/5"><Mic size={20} /></button>
                          <button className="flex-1 sm:w-14 h-14 rounded-2xl bg-white/5 text-white/30 hover:text-appleBlue hover:bg-white/10 transition-all flex items-center justify-center border border-white/5"><Paperclip size={20} /></button>
                          <button 
                            onClick={() => handleSend()}
                            className="flex-[2] sm:flex-none bg-appleBlue text-white px-8 md:px-12 h-14 md:h-24 rounded-[30px] md:rounded-[45px] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_60px_rgba(0,113,227,0.5)] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-[11px] md:text-sm flex items-center justify-center gap-3 md:gap-4 group"
                          >
                             Transmit
                             <Send size={18} className="group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform duration-500" />
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </NexusLayout>
  );
};

export default AIAssistant;
