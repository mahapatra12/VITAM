import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Zap, Cpu } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const ShardEncryption = ({ onComplete }) => {
  const [sharding, setSharding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Standby');

  const initiateShard = () => {
    institutionalAudio.init();
    institutionalAudio.playPulse(1);
    setSharding(true);
    setStage('Initializing Shard Splitter...');
  };

  useEffect(() => {
    if (!sharding) return;
    
    let completeTimeout;
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + 1, 100);
        
        if (next % 10 === 0) institutionalAudio.playBeep(880 - next*2, 0.05);
        if (next % 25 === 0) institutionalAudio.playPulse(0.2);
        
        if (next >= 100) {
          clearInterval(timer);
          institutionalAudio.playSuccess();
          setStage('Institutional Seal: COMPLETE');
          completeTimeout = setTimeout(() => {
            if (onComplete) onComplete();
          }, 1500);
          return 100;
        }
        
        if (next === 20) setStage('Splitting Identity Matrix...');
        if (next === 50) setStage('Injecting Cryptographic Salt...');
        if (next === 80) setStage('Sealing Shards to Mainframe...');
        
        return next;
      });
    }, 40);

    return () => {
      clearInterval(timer);
      if (completeTimeout) clearTimeout(completeTimeout);
    };
  }, [sharding, onComplete]);

  return (
    <div className="relative w-full max-w-lg aspect-square bg-[#020202] rounded-[60px] border border-white/5 overflow-hidden flex flex-col items-center justify-center group shadow-[0_0_100px_#2563eb10]">
       <div className="absolute inset-0 bg-gradient-radial from-blue-600/[0.05] to-transparent pointer-events-none" />
       
       <AnimatePresence mode="wait">
         {!sharding ? (
           <motion.div 
             key="standby"
             className="flex flex-col items-center space-y-12"
           >
              <div className="relative">
                <div className="w-48 h-48 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.01]">
                   <Shield size={80} className="text-white/5 transition-all group-hover:text-blue-500/20 group-hover:scale-110" />
                </div>
                <motion.div 
                   animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                   transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, scale: { duration: 4, repeat: Infinity } }}
                   className="absolute -inset-8 border border-blue-500/10 border-t-blue-500/40 rounded-full"
                />
              </div>
              <button 
                onClick={initiateShard}
                className="bg-blue-600/10 border border-blue-600/20 px-14 py-5 rounded-[40px] text-[11px] font-black uppercase tracking-[0.5em] text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-[0_30px_60px_-15px_rgba(37,99,235,0.2)] active:scale-95 z-10 italic"
              >
                Seal Sovereign Shards
              </button>
           </motion.div>
         ) : (
           <motion.div 
             key="sharding"
             className="w-full h-full flex flex-col items-center justify-center p-16"
           >
              <div className="relative w-64 h-64 mb-16 flex items-center justify-center">
                 {/* The Shard Matrix */}
                 <div className="absolute inset-0 border border-blue-500/10 rounded-full" />
                 
                 {/* Rotating Shards (CSS shapes) */}
                 {[...Array(6)].map((_, i) => (
                   <motion.div 
                     key={i}
                     animate={{ 
                       rotate: (i * 60) + (progress * 3.6),
                       scale: [1, 1.2, 1],
                       opacity: [0.1, 0.4, 0.1]
                     }}
                     transition={{ scale: { duration: 2, repeat: Infinity, delay: i * 0.3 } }}
                     className="absolute w-20 h-20 border border-blue-500/30 rounded-lg group-hover:border-blue-400/50"
                     style={{ 
                       transformStyle: 'preserve-3d',
                       transform: `rotate(${(i * 60)}deg) translateY(-80px)` 
                     }}
                   >
                      <div className="absolute inset-0 bg-blue-600/10 blur-xl" />
                   </motion.div>
                 ))}

                 {/* Central Core Seal */}
                 <motion.div 
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: ['0 0 20px #2563eb40', '0 0 80px #2563eb60', '0 0 20px #2563eb40']
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="relative z-10 w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center border border-blue-400/50"
                 >
                    {progress < 100 ? (
                      <div className="w-10 h-10 border-4 border-white/40 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Lock size={40} className="text-white drop-shadow-[0_0_20px_#fff]" />
                    )}
                 </motion.div>

                 {/* Scan Lines Overlay */}
                 <div className="absolute inset-x-0 h-0.5 bg-blue-400 shadow-[0_0_20px_#60a5fa] z-20 animate-[scan_3s_infinite]" />
              </div>

              <div className="w-full space-y-6">
                 <div className="flex justify-between items-center font-mono italic">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/60">{stage}</p>
                    <p className="text-[11px] font-black text-blue-400 tabular-nums">{progress}%</p>
                 </div>
                 <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <motion.div 
                      className="h-full bg-blue-600 shadow-[0_0_20px_#2563eb] rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                 </div>
              </div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* Telemetry Labels */}
       <div className="absolute bottom-10 flex gap-10 opacity-30 group-hover:opacity-60 transition-opacity">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase text-white tracking-widest italic">SHARD_SPLIT</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={12} className="text-blue-500" />
            <span className="text-[9px] font-black uppercase text-white tracking-widest italic">HASH_SEAL</span>
          </div>
       </div>

       <style>{`
         @keyframes scan {
           0% { top: 10%; opacity: 0; }
           50% { opacity: 0.5; }
           100% { top: 90%; opacity: 0; }
         }
       `}</style>
    </div>
  );
};

export default ShardEncryption;
