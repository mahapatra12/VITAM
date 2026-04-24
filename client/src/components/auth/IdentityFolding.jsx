import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cpu, Zap, Activity, Box } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const IdentityFolding = ({ onComplete }) => {
  const [stage, setStage] = useState('Expanding');

  useEffect(() => {
    institutionalAudio.init();
    institutionalAudio.playPulse(1);
    
    const timers = [
       setTimeout(() => { setStage('Folding'); institutionalAudio.playBeep(880, 0.1); }, 1000),
       setTimeout(() => { setStage('Collapsing'); institutionalAudio.playBeep(440, 0.2); }, 2500),
       setTimeout(() => { setStage('Finalizing'); institutionalAudio.playSuccess(); }, 3500),
       setTimeout(onComplete, 4500)
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[600] bg-[#020202] flex flex-col items-center justify-center space-y-20 overflow-hidden"
    >
       <div className="absolute inset-0 bg-gradient-radial from-blue-600/[0.05] to-transparent pointer-events-none" />

       <div className="relative perspective-[1000px] w-80 h-80 flex items-center justify-center">
          {/* Matrix Plane (Initial) */}
          <AnimatePresence>
             {stage === 'Expanding' && (
               <motion.div 
                 key="expanding"
                 initial={{ scale: 0, rotateY: 45 }}
                 animate={{ scale: 1.5, opacity: 1 }}
                 exit={{ scale: 2, opacity: 0 }}
                 className="absolute inset-0 border border-blue-500/20 grid grid-cols-8 grid-rows-8 opacity-40 shadow-[0_0_100px_#2563eb10]"
               >
                  {[...Array(64)].map((_, i) => (
                    <div key={i} className="border border-white/5 bg-white/[0.01]" />
                  ))}
               </motion.div>
             )}
          </AnimatePresence>

          {/* The Cube (Folding) */}
          <AnimatePresence>
             {stage === 'Folding' && (
               <motion.div 
                 key="folding"
                 initial={{ rotateX: 45, rotateY: 45, scale: 0.5 }}
                 animate={{ rotateX: 405, rotateY: 405, scale: 1.2 }}
                 exit={{ scale: 0, opacity: 0 }}
                 className="relative w-40 h-40 transform-style-3d shadow-[0_0_150px_#2563eb30]"
               >
                  {/* Cube Sides */}
                  {[
                    { rotateY: 0, translateZ: 80 },
                    { rotateY: 90, translateZ: 80 },
                    { rotateY: 180, translateZ: 80 },
                    { rotateY: -90, translateZ: 80 },
                    { rotateX: 90, translateZ: 80 },
                    { rotateX: -90, translateZ: 80 }
                  ].map((side, i) => (
                    <div 
                      key={i} 
                      className="absolute inset-0 bg-blue-600/10 border-2 border-blue-500/40 backdrop-blur-xl"
                      style={{ 
                        transform: `rotateY(${side.rotateY}deg) rotateX(${side.rotateX || 0}deg) translateZ(${side.translateZ}px)` 
                      }}
                    />
                  ))}
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Shield size={48} className="text-white drop-shadow-[0_0_20px_#fff]" />
                  </div>
               </motion.div>
             )}
          </AnimatePresence>

          {/* Collapse Point */}
          <AnimatePresence>
             {stage === 'Collapsing' && (
               <motion.div 
                 key="collapsing"
                 initial={{ scale: 5, opacity: 0 }}
                 animate={{ scale: 0, opacity: 1 }}
                 className="w-10 h-10 bg-white rounded-full shadow-[0_0_100px_#fff] flex items-center justify-center"
               >
                  <Zap size={20} className="text-blue-500" />
               </motion.div>
             )}
          </AnimatePresence>

          {/* Final Singularity Flash */}
          <AnimatePresence>
             {stage === 'Finalizing' && (
               <motion.div 
                 key="finalizing"
                 initial={{ scale: 0, opacity: 1 }}
                 animate={{ scale: 100, opacity: 0 }}
                 className="fixed inset-0 bg-white z-[700]"
               />
             )}
          </AnimatePresence>
       </div>

       <div className="text-center space-y-6 relative z-10">
          <p className="text-[11px] font-black uppercase tracking-[1em] text-blue-500 animate-pulse italic">{stage} Sovereign Identity...</p>
          <div className="flex items-center justify-center gap-4 opacity-20">
             <Box size={14} className="text-white" />
             <div className="w-48 h-[1px] bg-white/20" />
             <Cpu size={14} className="text-white" />
          </div>
       </div>

       <style>{`
          .perspective-[1000px] { perspective: 1000px; }
          .transform-style-3d { transform-style: preserve-3d; }
       `}</style>
    </motion.div>
  );
};

export default IdentityFolding;
