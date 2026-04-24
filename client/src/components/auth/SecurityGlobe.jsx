import React from 'react';
import ThreatPredictor from './ThreatPredictor';
import { motion, AnimatePresence } from 'framer-motion';

const SecurityGlobe = ({ score, sector = 'Global' }) => {
  const getRotation = () => {
    switch(sector) {
      case 'North': return 45;
      case 'South': return -45;
      case 'East': return 90;
      case 'West': return -90;
      default: return 0;
    }
  };

  return (
    <motion.div 
      animate={{ rotate: getRotation() }}
      transition={{ type: 'spring', stiffness: 50, damping: 20 }}
      className="relative w-[300px] h-[300px] md:w-[450px] md:h-[450px] flex items-center justify-center font-['Outfit']"
    >
       <ThreatPredictor score={score} />
       
       {/* Outer Atmosphere Ring */}
       <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} className="absolute inset-[-10%] border border-blue-500/5 rounded-full pointer-events-none" />
       <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute inset-[-15%] border border-cyan-500/5 rounded-full pointer-events-none border-dashed" />
       
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] text-center pointer-events-none">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white underline decoration-blue-500">{sector}</p>
          <p className="text-[7px] font-black uppercase tracking-[0.3em] text-blue-500/60 mt-1 italic">Administrative Node</p>
       </div>

       {/* Ambient Glows */}
       <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-[100px] animate-pulse pointer-events-none" />
       <div className="absolute inset-[15%] border border-blue-500/10 rounded-full pointer-events-none" />
       
       {/* 3D-Style Pulse Rings */}
       <motion.div 
         animate={{ scale: [1, 2], opacity: [0.3, 0] }}
         transition={{ duration: 4, repeat: Infinity, ease: 'easeOut' }}
         className="absolute w-64 h-64 border border-blue-500/20 rounded-full"
       />
       <motion.div 
         animate={{ scale: [1, 2], opacity: [0.2, 0] }}
         transition={{ duration: 4, repeat: Infinity, ease: 'easeOut', delay: 2 }}
         className="absolute w-64 h-64 border border-blue-600/10 rounded-full"
       />

       {/* The Main Hemisphere (Pure SVG/CSS 3D) */}
       <div className="relative w-72 h-72 preserve-3d">
          {/* Outer Rotating Latitude Rings */}
          <motion.div 
             animate={{ rotateY: 360, rotateZ: 360 }}
             transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
             className="absolute inset-0 border border-blue-500/20 rounded-full"
          />
          <motion.div 
             animate={{ rotateX: 360, rotateY: 180 }}
             transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
             className="absolute inset-0 border border-blue-400/10 rounded-full"
          />

          {/* Central Neural Core */}
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="relative">
                <motion.div 
                   animate={{ scale: [1, 1.2, 1], boxShadow: ['0 0 20px #2563eb40', '0 0 50px #2563eb60', '0 0 20px #2563eb40'] }}
                   transition={{ duration: 3, repeat: Infinity }}
                   className="w-16 h-16 bg-blue-600 rounded-full shadow-[0_0_30px_#2563eb] flex items-center justify-center"
                >
                   <div className="w-8 h-8 border-2 border-white/40 rounded-full border-t-transparent animate-spin" />
                </motion.div>
                
                <div className="absolute -inset-10 flex items-center justify-center text-center">
                   <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500/40 translate-y-16">
                     Shield Sync: Active
                   </p>
                </div>
             </div>
          </div>

          {/* Institutional Grid Nodes */}
          <svg className="absolute inset-0 w-full h-full opacity-30 select-none pointer-events-none" viewBox="0 0 100 100">
             <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-blue-500/20" />
             <path d="M50 2 L50 98 M2 50 L98 50" stroke="currentColor" strokeWidth="0.5" className="text-blue-500/20" />
             
             {/* Randomized Threat Nodes */}
             {[...Array(8)].map((_, i) => {
               const angle = (i / 8) * Math.PI * 2;
               const x = 50 + 40 * Math.cos(angle);
               const y = 50 + 40 * Math.sin(angle);
               return (
                 <motion.g 
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                 >
                    <circle cx={x} cy={y} r="1" fill="#2563eb" />
                    <circle cx={x} cy={y} r="3" fill="none" stroke="#2563eb" strokeWidth="0.2" className="animate-ping" />
                 </motion.g>
               );
             })}
          </svg>
       </div>

       {/* HUD Overlays */}
       <div className="absolute inset-x-0 bottom-0 flex justify-center gap-12 translated-y-8">
          <div className="border-l border-white/10 pl-4">
             <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Azimuth</p>
             <p className="text-[10px] font-mono text-white/50 tracking-tighter italic">284.2° NODE</p>
          </div>
          <div className="border-l border-white/10 pl-4">
             <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Zenith</p>
             <p className="text-[10px] font-mono text-white/50 tracking-tighter italic">004.9° SYNC</p>
          </div>
       </div>

       {/* Floating Detail Cards (Advanced UI) */}
       <motion.div 
         animate={{ y: [0, -10, 0] }}
         transition={{ duration: 5, repeat: Infinity }}
         className="absolute -top-12 -left-12 p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl"
       >
          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-2">Institutional Link</p>
          <div className="w-12 h-0.5 bg-blue-600 mb-2" />
          <p className="text-[10px] font-black text-white uppercase italic tracking-tighter">Verified Delta</p>
       </motion.div>

       <motion.div 
         animate={{ y: [0, 10, 0] }}
         transition={{ duration: 6, repeat: Infinity, delay: 1 }}
         className="absolute -bottom-12 -right-12 p-4 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl"
       >
          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-2">Protocol Health</p>
          <div className="flex gap-1 mb-2">
             {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1 h-3 bg-blue-600/40 rounded-full" />)}
          </div>
          <p className="text-[10px] font-black text-blue-500 uppercase italic tracking-tighter">100.0% PURE</p>
       </motion.div>

       <style>{`
         .preserve-3d {
           transform-style: preserve-3d;
           perspective: 1000px;
         }
       `}</style>
    </motion.div>
  );
};

export default SecurityGlobe;
