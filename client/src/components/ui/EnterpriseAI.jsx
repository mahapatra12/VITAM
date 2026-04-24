import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, Zap, X, Terminal, ShieldCheck, Cpu, Globe, Database, TrendingUp, Search } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import Telemetry from '../../utils/telemetry';

const PERSONAS = [
  { id: 'STRAT', name: 'Strategic AI', icon: Globe, focus: 'Institutional Oversight' },
  { id: 'FISCAL', name: 'Fiscal AI', icon: TrendingUp, focus: 'Resource Flow' },
  { id: 'ANALYTIC', name: 'Analytical AI', icon: Search, focus: 'Data Intelligence' }
];

const EnterpriseAI = ({ isStable = true, isSynchronized = true }) => {
  const { health } = useHealth();
  const [expanded, setExpanded] = useState(false);
  const [persona, setPersona] = useState(PERSONAS[0]);
  const [whisper, setWhisper] = useState("");
  const timer = useRef(null);

  useEffect(() => {
    const showWhisper = () => {
      const messages = [
        "Strategic Alignment achieved.",
        "Resource Variance: NOMINAL.",
        "System Integrity verified.",
        "Operational Parity established.",
        "Institutional Logic: STABLE.",
        "Variance Trace: MINIMAL."
      ];
      setWhisper(messages[Math.floor(Math.random() * messages.length)]);
      setTimeout(() => setWhisper(""), 4000);
    };

    const interval = setInterval(showWhisper, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-24 right-4 z-[2005] hidden flex-col items-end lg:right-8 lg:flex xl:bottom-28 xl:right-10">
      <AnimatePresence>
        {expanded && (
          <motion.div
             initial={{ opacity: 0, scale: 0.9, y: 50 }}
             animate={{ opacity: 1, scale: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.9, y: 50 }}
             className="mb-6 w-[420px] bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden relative"
          >
             <div className="h-28 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent p-8 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shadow-2xl shadow-blue-500/10">
                      <persona.icon size={28} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1 italic">Strategic Engine</p>
                      <h3 className="text-xl font-black text-white italic tracking-tighter uppercase whitespace-nowrap">{persona.name}</h3>
                   </div>
                </div>
                <button onClick={() => setExpanded(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/5 transition-all"><X size={20}/></button>
             </div>

             <div className="p-8 space-y-6">
                <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                   <div className="flex items-center gap-3">
                      <Terminal size={14} className="text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 italic">Institutional Mandate</span>
                   </div>
                   <p className="text-sm font-black text-white leading-relaxed italic opacity-80">
                      "System architecture and Institutional Reality have achieved full parity. Operational protocols verified. Strategic resolution complete."
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button className="py-5 rounded-2xl bg-white text-black text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all italic">Strategic Review</button>
                   <button onClick={() => setPersona(PERSONAS[(PERSONAS.indexOf(persona) + 1) % PERSONAS.length])} className="py-5 rounded-2xl bg-white/5 border border-white/10 text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] hover:text-white hover:border-white/20 transition-all italic">Cycle Advisor</button>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_12px_#3b82f6] animate-pulse" />
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] italic">System Status: Optimal</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <ShieldCheck size={16} className="text-emerald-500" />
                      <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest italic leading-none">Integrity Verified</span>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setExpanded(!expanded)}
        className="w-20 h-20 rounded-[2.5rem] bg-white text-black flex items-center justify-center shadow-[0_20px_50px_rgba(255,255,255,0.2)] border border-white/20 relative group overflow-hidden"
      >
        <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <Sparkles size={32} className="relative z-10 transition-colors duration-500 group-hover:text-white" />
      </motion.button>

      <AnimatePresence>
        {whisper && (
          <motion.div
            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            className="absolute bottom-28 right-0 px-6 py-4 rounded-2xl bg-black/60 backdrop-blur-3xl border border-white/5 whitespace-nowrap shadow-2xl"
          >
             <p className="text-[11px] font-black text-white/60 uppercase tracking-[0.4em] italic whitespace-nowrap">
                {whisper}
             </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnterpriseAI;
