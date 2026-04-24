import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Shield, Zap, Target, Scan } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const RetinaScanner = ({ onComplete }) => {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('Iris Standby');

  const startScan = () => {
    institutionalAudio.init();
    institutionalAudio.playBeep(660, 0.1);
    setScanning(true);
    setStage('Aligning Neural Aperture...');
  };

  useEffect(() => {
    if (!scanning) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1;
        
        if (next % 8 === 0) institutionalAudio.playPulse(0.05);
        if (next % 15 === 0) institutionalAudio.playBeep(440 + next*2, 0.05);
        
        if (next >= 100) {
          clearInterval(timer);
          institutionalAudio.playSuccess();
          setStage('Retina Bound: Synchronized');
          setTimeout(onComplete, 1200);
          return 100;
        }
        
        if (next === 30) setStage('Mapping Iris Pattern...');
        if (next === 60) setStage('Verifying Vascular Pulse...');
        if (next === 90) setStage('Neural Handshake Confirmed...');
        
        return next;
      });
    }, 50);

    const timer = interval;
    return () => clearInterval(interval);
  }, [scanning, onComplete]);

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-square bg-[#050505] rounded-full border border-blue-500/10 overflow-hidden flex flex-col items-center justify-center group shadow-[0_0_100px_#2563eb10]">
       <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-blue-500/5 pointer-events-none" />
       
       <AnimatePresence mode="wait">
         {!scanning ? (
           <motion.div 
             key="standby"
             className="flex flex-col items-center space-y-10"
           >
              <div className="relative">
                <div className="w-40 h-40 rounded-full border border-white/5 flex items-center justify-center bg-white/[0.01]">
                   <Eye size={80} className="text-white/5 transition-colors group-hover:text-blue-500/20" />
                </div>
                <motion.div 
                   animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                   transition={{ rotate: { duration: 12, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }}
                   className="absolute -inset-6 border-2 border-blue-500/20 border-t-transparent border-b-transparent rounded-full"
                />
              </div>
              <button 
                onClick={startScan}
                className="bg-blue-600/10 border border-blue-600/20 px-12 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_30px_rgba(37,99,235,0.15)] active:scale-95 z-10 font-mono italic"
              >
                Engage Retina-Link
              </button>
           </motion.div>
         ) : (
           <motion.div 
             key="scanning"
             className="w-full h-full flex flex-col items-center justify-center p-12"
           >
              <div className="relative w-56 h-56 mb-12 flex items-center justify-center">
                 {/* The Aperture / Iris Visual */}
                 <div className="absolute inset-0 rounded-full border-2 border-blue-500/10" />
                 
                 {/* Rotating Rings */}
                 {[...Array(3)].map((_, i) => (
                   <motion.div 
                     key={i}
                     animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                     transition={{ duration: 10 + i * 5, repeat: Infinity, ease: 'linear' }}
                     className={`absolute inset-${i * 4} border border-blue-500/${20 - i*5} rounded-full border-t-transparent`}
                   />
                 ))}

                 {/* Focal Target */}
                 <div className="relative z-10">
                    <Target size={40} className="text-blue-600 animate-pulse drop-shadow-[0_0_10px_#2563eb]" />
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute -inset-4 bg-blue-500/10 rounded-full blur-md"
                    />
                 </div>

                 {/* Horizontal Scanning Laser */}
                 <motion.div 
                    animate={{ top: ['20%', '80%', '20%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute left-4 right-4 h-0.5 bg-blue-400 shadow-[0_0_15px_#60a5fa] z-20"
                 />
              </div>

              <div className="w-64 space-y-4">
                 <div className="flex justify-between items-center font-mono">
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-500/60 italic">{stage}</p>
                    <p className="text-[10px] font-black text-blue-400 italic tabular-nums">{progress}%</p>
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

       {/* Telemetry Dots */}
       <div className="absolute bottom-10 flex gap-6 opacity-30">
          <Scan size={12} className="text-blue-500" />
          <Zap size={12} className="text-blue-500" />
          <Shield size={12} className="text-blue-500" />
       </div>
    </div>
  );
};

export default RetinaScanner;
