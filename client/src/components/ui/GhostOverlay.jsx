import { motion, AnimatePresence } from 'framer-motion';
import { Radar, Activity, Zap, Brain, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

const GhostOverlay = ({ isActive }) => {
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
       const newNode = {
          id: Math.random(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          opacity: Math.random() * 0.4 + 0.1
       };
       setNodes(prev => [...prev, newNode].slice(-15));
    }, 1500);
    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[5] pointer-events-none overflow-hidden"
        >
          {/* Ghost Grid Layer */}
          <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(rgba(0,198,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,198,255,0.2)_1px,transparent_1px)] bg-[size:100px_100px]" />
          
          {/* Dynamic Radar Sweeps */}
          <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-[#00c6ff]/5 rounded-full"
          >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1/2 bg-gradient-to-t from-transparent to-[#00c6ff]/20 blur-sm" />
          </motion.div>

          {/* Floating Telemetry Nodes */}
          {nodes.map(node => (
             <motion.div 
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: node.opacity, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute"
                style={{ top: `${node.y}%`, left: `${node.x}%` }}
             >
                <div className="w-1 h-1 bg-[#00c6ff] rounded-full shadow-[0_0_8px_#00c6ff]" />
                <p className="whitespace-nowrap text-[8px] font-black uppercase tracking-[0.2em] text-[#00c6ff]/40 mt-1">Node // ACTIVE</p>
             </motion.div>
          ))}

          {/* Core HUD Elements (Static) */}
          <div className="absolute bottom-12 left-10 space-y-4 opacity-20">
             <div className="flex items-center gap-3">
                <Radar size={14} className="text-[#00c6ff]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00c6ff]">Institutional Scan Active</span>
             </div>
             <div className="flex items-center gap-3">
                <Brain size={14} className="text-[#00c6ff]" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00c6ff]">Neural Prediction Hub online</span>
             </div>
          </div>

          {/* Atmosphere Noise (v29.3) */}
          <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GhostOverlay;
