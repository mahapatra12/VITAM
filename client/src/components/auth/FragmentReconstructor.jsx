import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Cpu, History } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const FragmentReconstructor = ({ isReconstructing, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Standby');

  useEffect(() => {
    if (!isReconstructing) return;
    
    institutionalAudio.init();
    institutionalAudio.playPulse(1);
    
    const interval = setInterval(() => {
       setProgress(prev => {
          const next = prev + 1;
          if (next % 15 === 0) institutionalAudio.playBeep(440 + next * 4, 0.05);
          if (next >= 100) {
             clearInterval(interval);
             institutionalAudio.playSuccess();
             setTimeout(onComplete, 1000);
             return 100;
          }
          if (next === 20) setStage('Aligning Signature Shards...');
          if (next === 50) setStage('Injecting Parity Bits...');
          if (next === 80) setStage('Synthesizing Core Identity...');
          return next;
       });
    }, 50);

    return () => clearInterval(interval);
  }, [isReconstructing, onComplete]);

  return (
    <div className="bg-[#050505]/60 backdrop-blur-3xl border border-white/5 rounded-[50px] p-10 h-full relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <History size={180} className="text-blue-500" />
      </div>

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
            <History size={24} className="animate-spin-slow" />
          </div>
          <div>
             <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Identity Fragment Reconstructor</h3>
             <p className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest mt-1 italic">Signature Analysis: ACTIVE</p>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-square bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden flex items-center justify-center">
         <AnimatePresence mode="wait">
            {!isReconstructing ? (
               <motion.div key="ready" className="flex flex-col items-center gap-6">
                  <Shield size={40} className="text-white/10" />
                  <p className="text-[9px] font-black uppercase text-white/20 tracking-[0.4em]">Awaiting Instruction...</p>
               </motion.div>
            ) : (
               <motion.div key="progress" className="w-full h-full flex flex-col items-center justify-center p-12">
                  <div className="relative w-48 h-48 mb-12">
                     {/* Shard Particles */}
                     {[...Array(12)].map((_, i) => (
                        <motion.div 
                           key={i}
                           animate={{ 
                             x: progress < 100 ? (Math.random() - 0.5) * 100 : 0,
                             y: progress < 100 ? (Math.random() - 0.5) * 100 : 0,
                             scale: progress < 100 ? [1, 2, 1] : 0,
                             opacity: progress < 100 ? [0.2, 0.4, 0.2] : 0
                           }}
                           transition={{ duration: 1, repeat: Infinity }}
                           className="absolute w-4 h-4 bg-blue-500/20 blur-md rounded-full"
                           style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                        />
                     ))}

                     {/* The Central Shard Core */}
                     <motion.div 
                        animate={{ 
                           rotate: progress * 3.6,
                           scale: [1, 1.1, 1],
                           borderColor: progress >= 100 ? '#10b981' : '#2563eb' 
                        }}
                        className="w-full h-full border-2 border-dashed rounded-[3rem] flex items-center justify-center"
                     >
                        <Zap size={48} className={`transition-colors duration-1000 ${progress >= 100 ? 'text-emerald-500' : 'text-blue-500'}`} />
                     </motion.div>
                  </div>

                  <div className="w-full space-y-4">
                     <div className="flex justify-between items-center font-mono italic">
                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-500/60">{stage}</p>
                        <p className="text-[10px] font-black text-blue-400">{progress}%</p>
                     </div>
                     <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                           className="h-full bg-blue-600 shadow-[0_0_15px_#2563eb]"
                           style={{ width: `${progress}%` }}
                        />
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>

      <div className="mt-10 flex flex-col gap-2 relative z-10 text-center">
         <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Quantum Signature Entanglement</p>
         <div className="flex justify-center gap-1">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`w-0.5 h-3 ${i < (progress / 5) ? 'bg-blue-500' : 'bg-white/5'}`} />
            ))}
         </div>
      </div>
    </div>
  );
};

export default FragmentReconstructor;
