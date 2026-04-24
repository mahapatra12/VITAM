import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, RefreshCw, Activity, Terminal, ShieldAlert } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const SovereignTestingSuite = ({ onInject, onClose }) => {
  const [activeChaos, setActiveChaos] = useState(null);

  const inject = (type, severity) => {
    setActiveChaos(type);
    institutionalAudio.playWarning();
    onInject({ type, severity });
    
    // Auto-resolve after 4 seconds (simulated)
    setTimeout(() => {
       setActiveChaos(null);
       institutionalAudio.playSuccess();
    }, 4000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-32 right-12 w-96 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[50px] p-10 z-[3000] shadow-3xl overflow-hidden"
    >
       {/* Diagnostic Layer */}
       <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Terminal size={120} className="text-red-500" />
       </div>

       <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-500">
                <AlertTriangle size={20} className="animate-pulse" />
             </div>
             <div>
                <h3 className="text-[12px] font-black text-white/40 uppercase tracking-[0.5em]">Chaos Testing Suite</h3>
                <p className="text-[9px] font-black text-red-500/40 uppercase tracking-widest mt-1 italic italic underline">Mode: APEX OVERRIDE</p>
             </div>
          </div>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-all text-xs font-black uppercase">Close</button>
       </div>

       <div className="space-y-6 relative z-10">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 shadow-red-500">Institutional Vulnerability Injection</p>
          
          <div className="grid grid-cols-2 gap-4">
             {[
               { id: 'node_breach', label: 'Node Breach', color: 'bg-red-600', icon: ShieldAlert },
               { id: 'parity_error', label: 'Parity Error', color: 'bg-amber-600', icon: Zap },
               { id: 'ledger_desync', label: 'Ledger Sync', color: 'bg-orange-600', icon: RefreshCw },
               { id: 'neural_lag', label: 'Neural Delay', color: 'bg-purple-600', icon: Activity }
             ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => inject(item.id, 0.8)}
                  disabled={activeChaos !== null}
                  className={`flex flex-col items-center gap-4 p-6 rounded-[35px] border border-white/5 transition-all duration-300 relative group overflow-hidden ${activeChaos === item.id ? 'bg-red-500/20 border-red-500 shadow-xl' : 'bg-white/5 hover:bg-white/10 opacity-60 hover:opacity-100'}`}
                >
                   <item.icon size={20} className={activeChaos === item.id ? 'text-red-500' : 'text-white/40'} />
                   <span className="text-[9px] font-black uppercase tracking-widest leading-none">{item.label}</span>
                   
                   {activeChaos === item.id && (
                     <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />
                   )}
                </button>
             ))}
          </div>

          <div className="pt-6 border-t border-white/5 mt-6">
             <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.5em] text-center italic">Self-Healing Diagnostic Matrix v15.0 // Apex Origin</p>
          </div>
       </div>
    </motion.div>
  );
};

export default SovereignTestingSuite;
