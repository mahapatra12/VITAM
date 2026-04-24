import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Search, Activity, Cpu, Hexagon } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const AIDroneAvatar = ({ status = 'Secure' }) => {
  const [targetPos, setTargetPos] = useState({ x: 100, y: 100 });
  const [scanning, setScanning] = useState(false);
  
  // HUD targets to scan (mock selectors)
  const targets = [
     { x: 15, y: 30, name: 'Mainframe' },
     { x: 45, y: 20, name: 'Globe' },
     { x: 75, y: 35, name: 'Synaptic' },
     { x: 80, y: 70, name: 'Ledger' },
     { x: 20, y: 65, name: 'Sovereign' }
  ];

  useEffect(() => {
     let index = 0;
     const moveDrone = () => {
        const target = targets[index];
        setTargetPos({ x: target.x + (Math.random() - 0.5) * 5, y: target.y + (Math.random() - 0.5) * 5 });
        setScanning(true);
        institutionalAudio.playBeep(1200, 0.02);
        
        setTimeout(() => setScanning(false), 2000);
        index = (index + 1) % targets.length;
     };

     const interval = setInterval(moveDrone, 8000);
     moveDrone(); // Initial move
     
     return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1100] overflow-hidden select-none">
       {/* The Floating AI Drone */}
       <motion.div 
         animate={{ 
            left: `${targetPos.x}%`, 
            top: `${targetPos.y}%`,
            scale: scanning ? 1.2 : 1,
            transition: { duration: 4, type: 'spring', damping: 20, stiffness: 40 }
         }}
         className="absolute w-16 h-16 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
       >
          <div className="relative w-full h-full flex items-center justify-center">
             {/* Drone Chassis (3D-ish) */}
             <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
               className={`w-8 h-8 rounded-xl border-2 shadow-xl transition-colors duration-1000 ${
                 status === 'Secure' ? 'bg-blue-600/20 border-blue-500 shadow-blue-500/20' : 
                 'bg-red-500/20 border-red-500 shadow-red-500/20'
               }`}
             >
                <div className="absolute inset-0 flex items-center justify-center">
                   <Hexagon size={14} className="text-white opacity-40" />
                </div>
             </motion.div>

             {/* Rotating Blades/Wings */}
             {[0, 90, 180, 270].map(angle => (
                <motion.div 
                   key={angle}
                   style={{ transform: `rotate(${angle}deg) translateY(-20px)` }}
                   className="absolute w-2 h-4 bg-white/10 rounded-full blur-[1px]"
                >
                   <motion.div 
                      animate={{ scaleY: [1, 2, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.1, repeat: Infinity }}
                      className="w-full h-full bg-blue-500/40 rounded-full"
                   />
                </motion.div>
             ))}

             {/* Scanning Laser Beam */}
             <AnimatePresence>
                {scanning && (
                  <motion.div 
                     initial={{ opacity: 0, scaleY: 0 }}
                     animate={{ opacity: 1, scaleY: 1 }}
                     exit={{ opacity: 0, scaleY: 0 }}
                     className="absolute bottom-[-100px] w-[1px] bg-gradient-to-b from-blue-500 via-cyan-400 to-transparent shadow-[0_0_10px_#2563eb] h-[200px] origin-top"
                  />
                )}
             </AnimatePresence>

             {/* Status Glow (Center) */}
             <motion.div 
                animate={{ opacity: [0.2, 0.8, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`absolute w-2 h-2 rounded-full ${status === 'Secure' ? 'bg-blue-400' : 'bg-red-400'} blur-sm`}
             />
          </div>

          {/* Label Card (HUD-Style) */}
          <motion.div 
             animate={{ x: 60, y: -20 }}
             className="absolute p-4 bg-black/60 backdrop-blur-xl border border-white/5 rounded-2xl whitespace-nowrap"
          >
             <p className="text-[7px] font-black uppercase text-white/20 tracking-[1em] mb-1 leading-none">Apex Sentinel Drone</p>
             <div className="flex items-center gap-3">
                <Activity size={10} className="text-blue-500 animate-pulse" />
                <p className="text-[10px] font-black text-white italic tracking-tighter uppercase leading-none">Scanning...</p>
             </div>
          </motion.div>
       </motion.div>

       <style>{`
          .preserve-3d { transform-style: preserve-3d; }
       `}</style>
    </div>
  );
};

export default AIDroneAvatar;
