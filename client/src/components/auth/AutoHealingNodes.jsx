import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Search, Activity, Cpu } from 'lucide-react';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

const AutoHealingNodes = ({ score }) => {
  const [nodes, setNodes] = useState([]);
  const [drones, setDrones] = useState([
    { id: 'drone-1', x: 20, y: 20, target: null },
    { id: 'drone-2', x: 80, y: 80, target: null }
  ]);

  useEffect(() => {
    // Initial nodes
    const initialNodes = Array.from({ length: 8 }, (_, i) => ({
      id: `node-${i}`,
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 70,
      status: Math.random() > 0.8 ? 'damaged' : 'optimal'
    }));
    setNodes(initialNodes);

    // Periodic Damage Simulation
    const damageInterval = setInterval(() => {
      setNodes(prev => prev.map(n => 
        (Math.random() > 0.95 && n.status === 'optimal') ? { ...n, status: 'damaged' } : n
      ));
    }, 5000);

    // Healing Loop
    const healingInterval = setInterval(() => {
       setDrones(prevDrones => prevDrones.map(drone => {
          // Use functional update for nodes to find target correctly
          let targetId = drone.target;
          
          if (!targetId) {
             const damagedNode = nodes.find(n => n.status === 'damaged' && !prevDrones.some(d => d.target === n.id));
             if (damagedNode) {
                institutionalAudio.playBeep(440, 0.05);
                targetId = damagedNode.id;
             }
          }
          
          if (targetId) {
             const targetNode = nodes.find(n => n.id === targetId);
             if (targetNode) {
                const dx = targetNode.x - drone.x;
                const dy = targetNode.y - drone.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 5) {
                   // Healed!
                   setNodes(prev => prev.map(n => n.id === targetId ? { ...n, status: 'optimal' } : n));
                   institutionalAudio.playSuccess();
                   return { ...drone, target: null };
                }
                
                return { ...drone, x: drone.x + dx/10, y: drone.y + dy/10, target: targetId };
             }
          }
          return drone;
       }));
    }, 100);

    return () => {
      clearInterval(damageInterval);
      clearInterval(healingInterval);
    };
  }, []); // Only run once on mount for production stability

  return (
    <div className="bg-[#050505]/60 backdrop-blur-3xl border border-white/5 rounded-[50px] p-10 h-full relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Shield size={180} className="text-blue-500" />
      </div>

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
            <Activity size={24} className="animate-pulse" />
          </div>
          <div>
             <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Recursive Auto-Healing Array</h3>
             <p className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest mt-1 italic">Sentinel Drones: ACTIVE</p>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-square bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden">
         {/* Grid background */}
         <div className="absolute inset-0 system-grid opacity-[0.05]" />
         
         {/* Links */}
         <svg className="absolute inset-0 w-full h-full opacity-10">
            {nodes.map(n => (
              <line key={`link-${n.id}`} x1="50%" y1="50%" x2={`${n.x}%`} y2={`${n.y}%`} stroke="white" strokeWidth="0.2" />
            ))}
         </svg>

         {/* Nodes */}
         {nodes.map(node => (
            <motion.div 
               key={node.id}
               layoutId={node.id}
               style={{ left: `${node.x}%`, top: `${node.y}%` }}
               className={`absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${
                 node.status === 'damaged' ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'
               }`}
            >
               <AnimatePresence>
                  {node.status === 'damaged' && (
                    <motion.div 
                       initial={{ scale: 1 }} animate={{ scale: [1, 2, 1], opacity: [0.3, 1, 0.3] }}
                       transition={{ duration: 1, repeat: Infinity }}
                       className="absolute inset-[-4px] border border-red-500 rounded-full"
                    />
                  )}
               </AnimatePresence>
            </motion.div>
         ))}

         {/* Drones */}
         {drones.map(drone => (
            <div 
               key={drone.id}
               style={{ left: `${drone.x}%`, top: `${drone.y}%` }}
               className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none"
            >
               <div className="relative w-full h-full flex items-center justify-center">
                  <Cpu size={12} className="text-blue-500 drop-shadow-[0_0_5px_#2563eb]" />
                  <motion.div 
                     animate={{ rotate: 360 }}
                     transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                     className="absolute inset-0 border border-blue-500/20 border-t-blue-500/60 rounded-full"
                  />
                  {drone.target && (
                    <motion.div 
                       animate={{ opacity: [0, 1, 0] }}
                       transition={{ duration: 0.5, repeat: Infinity }}
                       className="absolute -inset-2 bg-blue-500/10 blur-sm rounded-full"
                    />
                  )}
               </div>
            </div>
         ))}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 relative z-10">
         <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-2">Damaged Nodes</p>
            <p className="text-2xl font-black text-red-500 leading-none">{nodes.filter(n => n.status === 'damaged').length}</p>
         </div>
         <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-2">Repair Velocity</p>
            <p className="text-2xl font-black text-white leading-none">0.82 <span className="text-[9px] text-blue-500 font-bold uppercase italic">s/n</span></p>
         </div>
      </div>
    </div>
  );
};

export default AutoHealingNodes;
