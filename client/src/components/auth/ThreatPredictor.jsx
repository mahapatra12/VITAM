import React from 'react';
import { motion } from 'framer-motion';

const ThreatPredictor = ({ score }) => {
  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden select-none">
       <svg className="w-full h-full opacity-60" viewBox="0 0 100 100">
          {/* Predictive Vectors (Animated lines from globe) */}
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            const x1 = 50 + 20 * Math.cos(angle);
            const y1 = 50 + 20 * Math.sin(angle);
            const x2 = 50 + 80 * Math.cos(angle + (Math.random() - 0.5) * 0.5);
            const y2 = 50 + 80 * Math.sin(angle + (Math.random() - 0.5) * 0.5);
            
            return (
              <motion.g key={i}>
                <motion.line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#ef4444" strokeWidth="0.2" strokeDasharray="1,1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: [0, 1, 0], opacity: [0, 0.4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                />
                <motion.circle 
                  cx={x2} cy={y2} r="0.5" fill="#ef4444"
                  animate={{ scale: [1, 2, 1], opacity: [0, 1, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                />
              </motion.g>
            );
          })}

          {/* Shield Shards (Projected defensive layers) */}
          {[...Array(4)].map((_, i) => (
             <motion.path 
                key={i}
                d={`M 50,5 Q 70,10 90,5`}
                fill="none" stroke="#2563eb" strokeWidth="0.5"
                initial={{ opacity: 0 }}
                animate={{ rotate: 360, opacity: [0.1, 0.3, 0.1] }}
                transition={{ rotate: { duration: 15 + i * 5, repeat: Infinity, ease: 'linear' } }}
                className="transform origin-center"
                style={{ transform: `scale(${0.8 + i*0.1})` }}
             />
          ))}
       </svg>

       {/* Holographic Labels */}
       <div className="absolute top-10 right-10 flex flex-col items-end">
          <p className="text-[7px] font-black text-red-500 uppercase tracking-[0.3em] italic">Predictive Threat Projection</p>
          <div className="flex gap-2 mt-1">
             <div className="w-8 h-0.5 bg-red-600/20" />
             <div className="w-8 h-0.5 bg-red-600/40 animate-pulse" />
          </div>
       </div>

       <div className="absolute bottom-20 left-10 flex flex-col">
          <p className="text-[7px] font-black text-blue-500 uppercase tracking-[0.3em] italic leading-none">Institutional Shielding Array</p>
          <div className="flex gap-1 mt-2">
             {[...Array(5)].map((_, i) => (
               <div key={i} className="w-1.5 h-1.5 rounded-full bg-blue-600/20 animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />
             ))}
          </div>
       </div>
    </div>
  );
};

export default ThreatPredictor;
