import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap, Lock, Terminal, Radio, ShieldClose } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const SovereignLockdown = ({ onExit }) => {
  const [glitch, setGlitch] = useState(false);
  const [overrideCode, setOverrideCode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    institutionalAudio.init();
    institutionalAudio.playWarning();
    
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 100);
      institutionalAudio.playBeep(220, 0.05);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleOverride = (e) => {
    e.preventDefault();
    if (overrideCode.toLowerCase() === 'apex') {
       institutionalAudio.playSuccess();
       onExit();
    } else {
       institutionalAudio.playWarning();
       setError('CREDENTIAL MISMATCH: ACCESS DENIED');
       setOverrideCode('');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] bg-red-950/95 flex flex-col items-center justify-center space-y-16 overflow-hidden p-10 backdrop-blur-3xl"
    >
       {/* Glitch Overlay */}
       {glitch && (
         <div className="absolute inset-0 bg-red-500/20 mix-blend-overlay z-10 pointer-events-none" />
       )}

       <div className="relative">
          <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
             transition={{ duration: 0.5, repeat: Infinity }}
             className="w-48 h-48 rounded-full border-4 border-red-500 flex items-center justify-center shadow-[0_0_100px_#ef4444]"
          >
             <ShieldAlert size={80} className="text-red-500" />
          </motion.div>
          <div className="absolute -inset-10 border border-red-500/20 rounded-full animate-ping" />
       </div>

       <div className="text-center space-y-4 relative z-10">
          <h1 className="text-7xl font-black text-white italic uppercase tracking-tighter leading-none">Institutional <span className="text-red-500 underline decoration-white/20">Lockdown</span></h1>
          <p className="text-[14px] font-black uppercase text-red-400 tracking-[0.5em] italic">Zero-Trust Override Required // Node Isolated</p>
       </div>

       <div className="w-full max-w-sm bg-black/60 border border-red-500/30 rounded-[40px] p-10 space-y-8 shadow-3xl">
          <div className="flex items-center gap-3 opacity-40">
             <Terminal size={14} className="text-red-500" />
             <span className="text-[10px] font-bold uppercase tracking-widest text-white italic">Sovereign Override REPL</span>
          </div>
          
          <form onSubmit={handleOverride} className="space-y-6">
             <input 
               type="password"
               value={overrideCode}
               onChange={(e) => setOverrideCode(e.target.value)}
               placeholder="ENTER APEX CLEARANCE..."
               className="w-full bg-red-500/10 border border-red-500/20 px-6 py-6 rounded-[30px] text-center text-xl font-black text-white tracking-[0.5em] outline-none focus:border-red-500 transition-all font-mono"
               autoComplete="current-password"
               autoFocus
             />
             {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center italic">{error}</p>}
             
             <button className="w-full py-6 bg-red-600 rounded-[30px] text-white font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl shadow-red-600/30 hover:bg-white hover:text-black transition-all active:scale-95 italic text-center">
                Release Lockdown Shield
             </button>
          </form>
       </div>

       <div className="flex gap-12 opacity-30">
          {[
            { label: 'Network', icon: Radio },
            { label: 'Sovereign', icon: Lock },
            { label: 'Encryption', icon: Zap }
          ].map((item, i) => (
             <div key={i} className="flex flex-col items-center gap-2">
                <item.icon size={16} className="text-red-500" />
                <span className="text-[8px] font-black uppercase text-white tracking-widest">{item.label}: NULL</span>
             </div>
          ))}
       </div>
    </motion.div>
  );
};

export default SovereignLockdown;
