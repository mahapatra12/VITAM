import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Heart, Zap } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const NeuralHeartbeat = ({ score = 98 }) => {
  const [points, setPoints] = useState(Array(50).fill(25));
  const [bpm, setBpm] = useState(72);

  useEffect(() => {
    const interval = setInterval(() => {
       setPoints(prev => {
          const next = [...prev.slice(1)];
          const base = 25;
          const fluctuation = (Math.random() - 0.5) * 10;
          const pulse = (Math.random() > 0.9) ? (Math.random() > 0.5 ? 45 : 5) : base + fluctuation;
          
          if (pulse > 40 || pulse < 10) {
             institutionalAudio.playBeep(440, 0.02);
             setBpm(prevBpm => Math.min(120, Math.max(60, prevBpm + (Math.random() > 0.5 ? 1 : -1))));
          }
          
          return [...next, pulse];
       });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#050505]/60 backdrop-blur-3xl border border-white/5 rounded-[50px] p-10 h-full relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Activity size={180} className="text-blue-500" />
      </div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
            <Heart size={20} className="animate-pulse" />
          </div>
          <div>
             <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Neural Heartbeat Monitor</h3>
             <p className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest mt-1 italic italic underline">Status: BIOMETRIC LINK ACTIVE</p>
          </div>
        </div>
        <div className="text-right">
           <p className="text-3xl font-black text-white italic tabular-nums leading-none">{bpm}</p>
           <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mt-1">BPM</p>
        </div>
      </div>

      <div className="relative w-full h-48 bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden flex items-center justify-center">
         <svg className="w-full h-full p-8" viewBox="0 0 500 100" preserveAspectRatio="none">
            <polyline 
               fill="none" 
               stroke="#2563eb" 
               strokeWidth="3" 
               strokeLinejoin="round" 
               points={points.map((y, x) => `${x * 10},${y}`).join(' ')}
               className="transition-all duration-100"
            />
            <motion.line 
               initial={{ x1: 0, x2: 0 }}
               animate={{ x1: 500, x2: 500 }}
               transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
               y1="0" y2="100"
               stroke="rgba(37, 99, 235, 0.4)" strokeWidth="2"
            />
         </svg>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 relative z-10">
         <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-2">Synaptic Clarity</p>
            <p className="text-xl font-black text-blue-500 leading-none">99.2%</p>
         </div>
         <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-2">Neural Jitter</p>
            <p className="text-xl font-black text-white leading-none">0.04 <span className="text-[8px] text-blue-500">ms</span></p>
         </div>
      </div>
    </div>
  );
};

export default NeuralHeartbeat;
