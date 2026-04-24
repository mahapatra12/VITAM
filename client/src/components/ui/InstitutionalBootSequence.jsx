import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ShieldCheck, Database, Cpu, Activity, Zap, Sparkles } from 'lucide-react';
import NeuralNetBackground from '../auth/NeuralNetBackground';

const SEQUENCE = [
  { text: 'SYNCHRONIZING VITAM SOVEREIGN KERNEL...', icon: <Terminal size={14}/>, delay: 100 },
  { text: 'VERIFYING INSTITUTIONAL SECURITY ENCLAVE... [OK]', icon: <ShieldCheck size={14}/>, delay: 500 },
  { text: 'ESTABLISHING NEURAL LINK TOPOLOGY... [OK]', icon: <Zap size={14}/>, delay: 900 },
  { text: 'CALIBRATING HOLOGRAPHIC INTERFACE LAYERS... [OK]', icon: <Sparkles size={14}/>, delay: 1300 },
  { text: 'MOUNTING EXECUTIVE COMMAND MODULES... [OK]', icon: <Cpu size={14}/>, delay: 1700 },
  { text: 'SYSTEM INTEGRITY: 100% // ZERO VARIANCES.', icon: <Activity size={14} className="text-[#00c6ff]"/>, delay: 2100 },
  { text: 'AUTHORIZING HANDSHAKE TRANSITION...', icon: <Terminal size={14}/>, delay: 2500 },
];

export default function InstitutionalBootSequence({ onComplete }) {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timers = [];
    SEQUENCE.forEach((item, index) => {
      const timer = setTimeout(() => {
        setLogs(prev => [...prev, item]);
        setProgress(((index + 1) / SEQUENCE.length) * 100);
        
        if (index === SEQUENCE.length - 1) {
          setTimeout(() => {
            onComplete();
          }, 1000);
        }
      }, item.delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[99999] bg-[#020810] flex flex-col items-center justify-center p-8 overflow-hidden font-['Poppins']"
    >
      {/* Background Cinematic Depth */}
      <div className="absolute inset-0 z-0 opacity-40">
         <NeuralNetBackground />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020810]/80 to-[#020810] z-1" />
      
      <div className="w-full max-w-2xl relative z-10">
        <div className="flex items-center gap-6 mb-12 border-b border-white/5 pb-8">
           <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-[#00c6ff]/10 border border-[#00c6ff]/30 rounded-2xl flex items-center justify-center shadow-2xl shadow-[#00c6ff]/10"
           >
              <Cpu size={32} className="text-[#00c6ff]" />
           </motion.div>
           <div>
              <h1 className="text-3xl font-black text-white tracking-widest uppercase italic leading-none">VITAM <span className="text-[#00c6ff]">OS</span></h1>
              <p className="text-[10px] text-[#00c6ff]/50 tracking-[0.5em] uppercase mt-2 font-black">Sovereign Boot Diagnostic v28.5</p>
           </div>
        </div>

        <div className="space-y-4 mb-12 min-h-[300px] flex flex-col justify-end">
          <AnimatePresence mode="popLayout">
            {logs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex items-center gap-4 text-xs"
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 ${i === SEQUENCE.length - 2 ? 'text-[#00c6ff] shadow-[0_0_15px_#00c6ff]' : 'text-white/40'}`}>
                   {log.icon}
                </span>
                <span className={`tracking-[0.15em] font-bold uppercase transition-all duration-500 ${i === SEQUENCE.length - 2 ? 'text-[#00c6ff] drop-shadow-[0_0_10px_#00c6ff]' : 'text-white/50'}`}>
                  {log.text}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-3">
           <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.4em] text-white/20">
              <span>Initializing Core Hierarchy</span>
              <span className="text-[#00c6ff]">{Math.round(progress)}%</span>
           </div>
           <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
             <motion.div 
                className="h-full bg-gradient-to-r from-[#00c6ff] to-[#0072ff] rounded-full shadow-[0_0_20px_#00c6ff]"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
             />
           </div>
        </div>

        <div className="mt-16 text-center">
           <p className="text-[8px] font-black uppercase tracking-[0.5em] text-white/10 animate-pulse italic">Authorization Protocol // 100% Reliable // Institutional Sovereignty</p>
        </div>
      </div>

      {/* Cinematic Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 opacity-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%]" />
    </motion.div>
  );
}
