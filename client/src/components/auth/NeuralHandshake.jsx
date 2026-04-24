import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Cpu, Activity } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const NeuralHandshake = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Establishing Link');

  useEffect(() => {
    institutionalAudio.init();
    institutionalAudio.playPulse(1);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 2;
        if (next >= 100) {
          clearInterval(interval);
          institutionalAudio.playSuccess();
          setTimeout(onComplete, 1000);
          return 100;
        }
        
        if (next === 20) setStage('Synchronizing Neural Buffer');
        if (next === 50) setStage('Verifying Institutional Pulse');
        if (next === 80) setStage('Establishing Sovereign Bridge');
        
        if (next % 10 === 0) institutionalAudio.playBeep(220 * (next/20), 0.05);

        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#020202] flex flex-col items-center justify-center space-y-12 overflow-hidden"
    >
       {/* Background Grid Scan */}
       <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="w-full h-full grid grid-cols-12 grid-rows-12">
             {[...Array(144)].map((_, i) => (
               <div key={i} className="border-[0.5px] border-blue-500/20" />
             ))}
          </div>
       </div>

       {/* Central Handshake Visual */}
       <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-48 h-48 rounded-full border border-blue-500/40 border-t-transparent relative"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border border-blue-400/20 border-b-transparent"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="relative">
                <Shield size={48} className="text-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.5)]" />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-4 bg-blue-500 rounded-full blur-xl"
                />
             </div>
          </div>
       </div>

       <div className="w-full max-w-sm space-y-6 text-center">
          <div className="flex justify-between px-2">
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/60 font-mono italic animate-pulse">
               {stage}
             </p>
             <p className="text-[10px] font-black text-blue-400 font-mono italic">{progress}%</p>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
             <motion.div 
               className="h-full bg-blue-600 shadow-[0_0_15px_#2563eb]"
               style={{ width: `${progress}%` }}
             />
          </div>
          <div className="flex justify-center gap-8 opacity-20">
             <div className="flex items-center gap-2">
                <Zap size={10} className="text-blue-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white">Neural</span>
             </div>
             <div className="flex items-center gap-2">
                <Cpu size={10} className="text-blue-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white">Buffer</span>
             </div>
             <div className="flex items-center gap-2">
                <Activity size={10} className="text-blue-500" />
                <span className="text-[8px] font-black uppercase tracking-widest text-white">Sync</span>
             </div>
          </div>
       </div>
    </motion.div>
  );
};

export default NeuralHandshake;
