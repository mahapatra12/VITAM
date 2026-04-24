import React from 'react';
import { motion } from 'framer-motion';

const SystemPresence = ({ healthScore = 100, isDegraded = false }) => {
  // Map health to visual color states
  const getColor = () => {
    if (healthScore > 80) return '#3b82f6'; // Blue (Optimal)
    if (healthScore > 40) return '#eab308'; // Yellow (Elevated Risk)
    return '#ef4444'; // Red (Critical)
  };

  return (
    <div className={`flex items-center gap-4 transition-all duration-700 ${isDegraded ? 'opacity-40 grayscale' : 'opacity-100'}`}>
      <div className="flex flex-col items-end">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">System Status</span>
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-black text-blue-500/60 uppercase tracking-widest italic">Health Integrity</span>
           <span className="text-[10px] font-black text-white/80 tabular-nums">{healthScore.toFixed(1)}%</span>
        </div>
      </div>

      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* Modern Status Indicator Core */}
        <motion.div 
          animate={{ 
            scale: healthScore < 40 ? [1, 1.2, 1] : 1,
            boxShadow: `0 0 15px ${getColor()}40`
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="w-2.5 h-2.5 rounded-full bg-white relative z-10"
          style={{ backgroundColor: getColor() }}
        />

        {/* Outer Ring */}
        <div className="absolute inset-0 border border-white/5 rounded-full" />
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border border-dashed border-white/10 rounded-full"
        />
      </div>
    </div>
  );
};

export default SystemPresence;
