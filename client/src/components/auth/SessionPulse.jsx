import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck } from 'lucide-react';

const SessionPulse = ({ status = 'Secure' }) => {
  return (
    <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 px-4 py-2 rounded-2xl backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        <motion.div 
           animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
           transition={{ duration: 2, repeat: Infinity }}
           className="absolute w-4 h-4 bg-emerald-500 rounded-full blur-md"
        />
        <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase tracking-widest text-white/20 leading-none mb-1">Session Integrity</span>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 italic leading-none">{status}</span>
        </div>
      </div>
      <div className="ml-2 pl-3 border-l border-white/5 opacity-40">
         <Activity size={12} className="text-blue-500 animate-[pulse_1s_infinite]" />
      </div>
    </div>
  );
};

export default SessionPulse;
