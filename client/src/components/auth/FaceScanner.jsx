import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Check, Scan, Zap } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const FaceScanner = ({ onComplete }) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Standby');

  const startScan = () => {
    institutionalAudio.init();
    institutionalAudio.playBeep(440, 0.1);
    setScanning(true);
    setStage('Initializing Biometric Array...');
  };

  useEffect(() => {
    if (!scanning) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1;
        
        if (next % 5 === 0) institutionalAudio.playPulse(0.1);
        
        if (next >= 100) {
          clearInterval(timer);
          institutionalAudio.playSuccess();
          setStage('Node Binding Complete');
          setTimeout(onComplete, 1000);
          return 100;
        }
        
        if (next === 30) setStage('Mapping Facial Vectors...');
        if (next === 60) setStage('Verifying Institutional Pulse...');
        if (next === 90) setStage('Finalizing Handshake...');
        
        return next;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [scanning, onComplete]);

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square bg-black/40 rounded-[60px] border border-white/5 overflow-hidden flex flex-col items-center justify-center group">
       <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
       
       <AnimatePresence mode="wait">
         {!scanning ? (
           <motion.div 
             key="standby"
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 1.2 }}
             className="flex flex-col items-center space-y-8"
           >
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-2 border-white/5 flex items-center justify-center">
                  <User size={60} className="text-white/10 group-hover:text-blue-500/40 transition-colors" />
                </div>
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                   className="absolute -inset-4 border-t-2 border-r-2 border-blue-500/20 rounded-full"
                />
              </div>
              <button 
                onClick={startScan}
                className="bg-blue-600/10 border border-blue-600/20 px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_20px_rgba(37,99,235,0.1)] active:scale-95"
              >
                Initiate Biometric Scan
              </button>
           </motion.div>
         ) : (
           <motion.div 
             key="scanning"
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="w-full h-full flex flex-col items-center justify-center p-12"
           >
              <div className="relative w-48 h-48 mb-10">
                 <div className="absolute inset-0 border-2 border-blue-500/10 rounded-3xl" />
                 <motion.div 
                   animate={{ top: ['0%', '100%', '0%'] }}
                   transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   className="absolute left-0 w-full h-0.5 bg-blue-500 shadow-[0_0_15px_#2563eb] z-10"
                 />
                 <div className="absolute inset-4 opacity-20">
                    <div className="w-full h-full border border-blue-500/30 rounded-full relative overflow-hidden">
                       <motion.div 
                         animate={{ opacity: [0.1, 0.3, 0.1] }}
                         transition={{ duration: 1, repeat: Infinity }}
                         className="absolute inset-0 grid grid-cols-6 grid-rows-6"
                       >
                          {[...Array(36)].map((_, i) => (
                            <div key={i} className="border-[0.5px] border-blue-500/20" />
                          ))}
                       </motion.div>
                    </div>
                 </div>
                 <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-blue-500" />
                 <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-blue-500" />
                 <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-blue-500" />
                 <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-blue-500" />
              </div>
              <div className="w-full space-y-4">
                 <div className="flex justify-between items-center px-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-500/60 font-mono italic">{stage}</p>
                    <p className="text-[10px] font-black text-blue-400 font-mono italic">{progress}%</p>
                 </div>
                 <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-blue-600 shadow-[0_0_10px_#2563eb]"
                      style={{ width: `${progress}%` }}
                    />
                 </div>
              </div>
           </motion.div>
         )}
       </AnimatePresence>

       <div className="absolute bottom-6 flex gap-4">
          <div className="flex items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
            <Zap size={10} className="text-blue-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-white">Quantum Sync</span>
          </div>
          <div className="flex items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
            <Scan size={10} className="text-blue-500" />
            <span className="text-[8px] font-black uppercase tracking-widest text-white">Bio-Bound</span>
          </div>
       </div>
    </div>
  );
};

export default FaceScanner;
