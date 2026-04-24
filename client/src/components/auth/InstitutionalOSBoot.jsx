import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cpu, Zap, Activity, Terminal, Database, Server, Smartphone, Fingerprint, Eye } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const KERNEL_LOGS = [
  'INITIALIZING VITAM-CORE KERNEL...',
  'ESTABLISHING INSTITUTIONAL BRIDGE: OK',
  'LOADING CRYPTOGRAPHIC MODULES...',
  'SEEDING IDENTITY SHARDS: 4096-BIT',
  'VERIFYING SOVEREIGN HANDSHAKE...',
  'HARDWARE AUDIT: 2 NODES DETECTED',
  'SYNCING BIOMETRIC HASHES...',
  'ALIGNING RETINA FOCAL ARRAYS...',
  'INJECTING NEURAL NET SUBSTRATE...',
  'BOOTING APEX SENTINEL HUD...',
  'SECURITY LEVEL: OMNISCIENT',
  'WELCOME, ADMIN.'
];

const InstitutionalOSBoot = ({ onComplete }) => {
  const [logs, setLogs] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    institutionalAudio.init();
    institutionalAudio.playPulse(1.5);
    
    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < KERNEL_LOGS.length) {
        setLogs(prev => [...prev, KERNEL_LOGS[logIndex]]);
        institutionalAudio.playBeep(220 + logIndex * 100, 0.05);
        logIndex++;
      } else {
        clearInterval(interval);
        institutionalAudio.playSuccess();
        setTimeout(onComplete, 1000);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] bg-[#010101] flex flex-col items-center justify-center space-y-16 overflow-hidden px-10"
    >
       {/* Background Rain Overdrive */}
       <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden flex flex-wrap">
          {[...Array(100)].map((_, i) => (
            <div key={i} className="text-[10px] text-blue-500 font-mono tracking-tighter opacity-10 m-2">
              {Math.random().toString(16).substr(2, 8).toUpperCase()}
            </div>
          ))}
       </div>

       {/* Central Kernel Logo */}
       <div className="relative">
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ rotate: { duration: 10, repeat: Infinity, ease: 'linear' }, scale: { duration: 2, repeat: Infinity } }}
            className="w-40 h-40 rounded-[3rem] bg-blue-600/10 border border-blue-500/30 flex items-center justify-center relative shadow-[0_0_100px_#2563eb10]"
          >
             <Shield size={64} className="text-blue-500 drop-shadow-[0_0_30px_#2563eb]" />
          </motion.div>
          {/* Diagnostic Pulse Rings */}
          <motion.div 
             animate={{ scale: [1, 2], opacity: [0.3, 0] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="absolute -inset-4 border border-blue-500/20 rounded-[3.5rem]"
          />
       </div>

       {/* Kernel Logs REPL */}
       <div className="w-full max-w-xl bg-black/60 backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 h-80 overflow-hidden relative shadow-3xl">
          <div className="flex items-center gap-3 mb-6 opacity-30">
             <Terminal size={12} className="text-blue-500" />
             <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white italic leading-none">Kernel Initialization Logs</span>
          </div>
          <div className="space-y-3 font-mono text-[11px] h-full overflow-y-auto scrollbar-hide pr-4">
             {logs.map((log, i) => (
               <motion.div 
                 key={i}
                 initial={{ x: -10, opacity: 0 }}
                 animate={{ x: 0, opacity: 1 }}
                 className={`flex items-start gap-4 ${i === logs.length - 1 ? 'text-blue-500' : 'text-white/40'}`}
               >
                  <span className="text-white/10 italic">[{i.toString().padStart(2, '0')}]</span>
                  <span className={`font-black tracking-tight ${i === logs.length - 1 ? 'animate-pulse' : ''}`}>{log}</span>
               </motion.div>
             ))}
             {logs.length < KERNEL_LOGS.length && <div className="w-3 h-4 bg-blue-500 animate-pulse mt-1" />}
          </div>
       </div>

       {/* Subsytem Integrity Matrix */}
       <div className="flex gap-12 pt-8">
          {[
            { label: 'Neural', icon: Activity, sync: 98.4 },
            { label: 'Sovereign', icon: Cpu, sync: 100.0 },
            { label: 'Crypto', icon: Zap, sync: 99.1 }
          ].map((node, i) => (
             <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-blue-500/40">
                   <node.icon size={20} />
                </div>
                <div className="text-center">
                   <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">{node.label}</p>
                   <p className="text-[11px] font-black text-blue-500 italic tracking-tighter tabular-nums">{node.sync}%</p>
                </div>
             </div>
          ))}
       </div>
    </motion.div>
  );
};

export default InstitutionalOSBoot;
