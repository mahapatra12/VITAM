import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const SystemOperationalTrails = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="fixed inset-0 z-[10005] pointer-events-none overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            x: mousePos.x - 50,
            y: mousePos.y - 50,
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2 + i,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-24 h-24 rounded-full bg-blue-500/10 blur-3xl ring-1 ring-blue-500/20 shadow-inner shadow-blue-500/10"
        />
      ))}
      <div className="absolute bottom-10 right-10 text-[8px] font-black text-slate-800 uppercase tracking-widest italic opacity-20">Operational Trails Active</div>
    </div>
  );
};

export default SystemOperationalTrails;
