import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const InstitutionalBackground = ({ variance = 0, role = 'admin' }) => {
  // Memoize grid settings to avoid re-renders on variance shifts
  const gridLines = useMemo(() => Array.from({ length: 40 }), []);

  return (
    <div className="fixed inset-0 -z-10 bg-[#020202] overflow-hidden pointer-events-none">
      {/* Base Institutional Sync */}
      <motion.div 
        animate={{ 
          opacity: [0.05, 0.1, 0.05],
          scale: [1, 1.02, 1] 
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-radial from-blue-600/5 to-transparent"
      />

      {/* Institutional Architecture Grid */}
      <div className="absolute inset-0 [perspective:1200px] opacity-[0.15]">
        <div className="absolute inset-0 [transform:rotateX(60deg)]">
          {gridLines.map((_, i) => (
            <React.Fragment key={i}>
              {/* Horizontal Lines */}
              <div 
                className="absolute w-full h-[1px] bg-blue-500/10"
                style={{ top: `${(i / 40) * 100}%` }}
              />
              {/* Vertical Lines */}
              <div 
                className="absolute h-full w-[1px] bg-blue-500/10"
                style={{ left: `${(i / 40) * 100}%` }}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Variance Alert Layer */}
      <AnimatePresence>
        {variance > 70 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-amber-500/[0.03] backdrop-blur-[1px]"
          />
        )}
      </AnimatePresence>

      {/* Strategic Auras (Role-Specific) */}
      <div className="absolute inset-0">
        <div className={`absolute top-0 left-1/4 w-1/2 h-1/2 rounded-full blur-[150px] opacity-10 ${
          role === 'admin' ? 'bg-blue-600' : 'bg-indigo-600'
        }`} />
        <div className="absolute bottom-0 right-1/4 w-1/3 h-1/3 rounded-full blur-[120px] opacity-10 bg-blue-500" />
      </div>

      {/* Institutional Texture Grain */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default InstitutionalBackground;
