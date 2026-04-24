import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Search, Activity, Cpu, Radio } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const SentinelCompanion = ({ score = 98 }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [status, setStatus] = useState('Secure');

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target instanceof HTMLButtonElement || 
        target instanceof HTMLInputElement || 
        target.closest('.interactive-node')
      ) {
         setHovering(true);
         if (!hovering) institutionalAudio.playBeep(1200, 0.02);
      } else {
         setHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [hovering]);

  useEffect(() => {
    if (score < 90) setStatus('Warning');
    else if (score < 70) setStatus('Critical');
    else setStatus('Secure');
  }, [score]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1000] overflow-hidden select-none">
       {/* The Floating Sentinel */}
       <motion.div 
         animate={{ 
            x: mousePos.x + 30, 
            y: mousePos.y + 30,
            transition: { type: 'spring', damping: 25, stiffness: 150 }
         }}
         className="relative w-12 h-12 flex items-center justify-center"
       >
          {/* Inner Core */}
          <motion.div 
             animate={{ 
               scale: hovering ? 1.5 : 1,
               boxShadow: hovering ? '0 0 30px #2563eb' : '0 0 10px #2563eb20'
             }}
             className={`w-6 h-6 rounded-xl border flex items-center justify-center transition-colors duration-500 ${
               status === 'Secure' ? 'bg-blue-600/20 border-blue-500/40 text-blue-500' : 
               status === 'Warning' ? 'bg-amber-500/20 border-amber-500/40 text-amber-500' : 
               'bg-red-500/20 border-red-500/40 text-red-500'
             }`}
          >
             <Shield size={12} />
          </motion.div>

          {/* Outer Ring */}
          <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
             className="absolute inset-0 border border-white/5 border-t-white/20 rounded-full"
          />

          {/* Connection Line */}
          <svg className="absolute -top-10 -left-10 w-20 h-20 opacity-20">
             <motion.line 
                x1="0" y1="0" x2="40" y2="40" 
                stroke="#2563eb" strokeWidth="0.5" strokeDasharray="2,2" 
             />
          </svg>

          {/* Hover Laser Scan */}
          <AnimatePresence>
             {hovering && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0 }}
                 className="absolute -inset-10 border border-blue-500/40 rounded-full pointer-events-none"
               >
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-blue-500/60 shadow-[0_0_10px_#2563eb] animate-[scan_1s_infinite]" />
               </motion.div>
             )}
          </AnimatePresence>
       </motion.div>

       {/* Floating Labels */}
       <motion.div 
         animate={{ 
            x: mousePos.x + 85, 
            y: mousePos.y + 40,
            transition: { type: 'spring', damping: 20, stiffness: 100 }
         }}
         className="flex flex-col gap-1"
       >
          <div className="flex items-center gap-2">
             <div className="w-1 h-1 rounded-full bg-blue-500" />
             <span className="text-[7px] font-black uppercase text-white/40 tracking-[0.4em] italic leading-none">Apex Sentinel 1.0</span>
          </div>
          <p className="text-[9px] font-black uppercase text-blue-500/60 tracking-widest leading-none mt-1 shadow-blue-500/20">{status} Link Status</p>
       </motion.div>

       <style>{`
          @keyframes scan {
             0% { top: 0; opacity: 0; }
             50% { opacity: 1; }
             100% { top: 100%; opacity: 0; }
          }
       `}</style>
    </div>
  );
};

export default SentinelCompanion;
