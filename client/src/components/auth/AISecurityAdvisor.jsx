import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Shield, Zap, Terminal, Activity, AlertTriangle } from 'lucide-react';

const AISecurityAdvisor = ({ logs, score }) => {
  const [directiveIdx, setDirectiveIdx] = useState(0);
  const [threatLevel, setThreatLevel] = useState(1);
  const [simulatedThreats, setSimulatedThreats] = useState([]);

  const directives = [
    "Institutional Pulse: All subsystems reporting within nominal parameters.",
    "Strategic Buffer: Hardware node binding required for maximized biometric coverage.",
    "Audit Log: Recent administrative activity indicates high session stability.",
    "Neural Defense: Synthetic threat simulation neutralized a zero-day probe.",
    "Identity Score: Current integrity is optimal for standard administrative ops.",
    "Hardware Bond: Multi-key redundancy recommended to offset physical key loss risk."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDirectiveIdx(prev => (prev + 1) % directives.length);
      setThreatLevel(prev => Math.max(1, Math.min(10, prev + (Math.random() > 0.7 ? 1 : -1))));
    }, 8000);
    return () => clearInterval(interval);
  }, [directives.length]);

  // Simulate a live threat feed
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        const threat = {
          id: Math.random().toString(36).substr(2, 9).toUpperCase(),
          type: ['SQL Probe', 'XSS Injection', 'Brute Pulse', 'Credential Stuffing'][Math.floor(Math.random() * 4)],
          origin: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          time: new Date().toLocaleTimeString([], { hour12: false }),
          status: 'NEUTRALIZED'
        };
        setSimulatedThreats(prev => [threat, ...prev].slice(0, 5));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* AI Header */}
      <div className="bg-[#050505] border border-blue-500/10 rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <Cpu size={80} className="text-blue-500" />
        </div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
               <Shield size={24} className="animate-pulse" />
            </div>
            <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="absolute -inset-1 bg-blue-500/20 rounded-2xl blur-md"
            />
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Institutional Core Intelligence</h4>
            <p className="text-xl font-black text-white tracking-tighter uppercase italic">Apex Sentinel v2.4</p>
          </div>
        </div>

        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl min-h-[100px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
          <AnimatePresence mode="wait">
            <motion.p 
              key={directiveIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xs font-bold font-mono text-blue-400 italic text-center leading-relaxed"
            >
              &gt; {directives[directiveIdx]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Threat Level HUD */}
        <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-8">
           <div className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Institutional Threat Index</p>
              <div className="flex items-center gap-2">
                 {[...Array(10)].map((_, i) => (
                   <div key={i} className={`flex-1 h-1.5 rounded-full ${i < threatLevel ? (threatLevel > 7 ? 'bg-red-500' : 'bg-blue-600') : 'bg-white/5'}`} />
                 ))}
                 <span className="text-[10px] font-black text-white/30 ml-2">{threatLevel * 10}%</span>
              </div>
           </div>
           <div className="flex items-center justify-end gap-6 text-right">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Status</p>
                <p className="text-sm font-black text-emerald-500 uppercase italic">Active Watch</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Activity size={20} className="animate-bounce" />
              </div>
           </div>
        </div>
      </div>

      {/* Simulated Live Threat ledger */}
      <div className="bg-[#050505] border border-white/5 rounded-[40px] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
             <Terminal size={14} className="text-white/20" />
             <h4 className="text-[9px] font-black uppercase tracking-widest text-white/20">Subsystem Defense Ledger</h4>
           </div>
           <div className="px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-500 text-[8px] font-black uppercase tracking-widest animate-pulse">
             Live Hub
           </div>
        </div>

        <div className="space-y-3 min-h-[220px]">
           {simulatedThreats.length > 0 ? simulatedThreats.map((threat, i) => (
             <motion.div 
               key={threat.id}
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all font-mono"
             >
                <div className="flex items-center gap-4">
                  <div className="text-[10px] p-2 bg-blue-500/10 text-blue-400 rounded-lg"><Zap size={12} /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-black text-white/80">{threat.type}</p>
                      <span className="text-[9px] text-white/20">@{threat.origin}</span>
                    </div>
                    <p className="text-[9px] text-white/30 uppercase mt-1">Ref: {threat.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-500/80 italic">{threat.status}</p>
                  <p className="text-[8px] text-white/10">{threat.time}</p>
                </div>
             </motion.div>
           )) : (
             <div className="h-full flex flex-col items-center justify-center py-10 opacity-20 italic">
               <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Pulse...</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default AISecurityAdvisor;
