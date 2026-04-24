import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Smartphone, Cpu, Zap, Activity } from 'lucide-react';

const HardwareTopology = ({ devices = [] }) => {
  const nodes = [
    { id: 'mainframe', label: 'Mainframe', icon: Shield, x: 50, y: 50, color: '#2563eb' },
    ...devices.map((d, i) => ({
      id: d.id,
      label: d.nickname || `Node ${i+1}`,
      icon: Smartphone,
      x: 20 + (i * 60),
      y: 20 + (i * 60),
      color: '#10b981'
    }))
  ];

  return (
    <div className="bg-[#050505]/60 backdrop-blur-3xl border border-white/5 rounded-[50px] p-10 h-full relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Cpu size={180} className="text-blue-500" />
      </div>

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
            <Zap size={24} className="animate-pulse" />
          </div>
          <div>
             <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Hardware Topology Manifest</h3>
             <p className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest mt-1 italic">Sovereign Node Topology: Active</p>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-square bg-white/[0.01] border border-white/5 rounded-[40px] overflow-hidden flex items-center justify-center">
         <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            {/* Draw Links */}
            {devices.map((d, i) => {
              const dx = 20 + (i * 60);
              const dy = 20 + (i * 60);
              return (
                <motion.line
                  key={`link-${d.id}`}
                  x1="50" y1="50" x2={dx} y2={dy}
                  stroke="#2563eb" strokeWidth="0.5" strokeDasharray="2,2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.4 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                />
              );
            })}
            
            {/* Pulsing Mainframe Halo */}
            <motion.circle 
               cx="50" cy="50" r="10" fill="none" stroke="#2563eb" strokeWidth="0.2"
               animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }}
               transition={{ duration: 3, repeat: Infinity }}
            />
         </svg>

         {/* Mainframe Node */}
         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
               animate={{ scale: [1, 1.1, 1] }} 
               transition={{ duration: 4, repeat: Infinity }}
               className="w-20 h-20 bg-blue-600 rounded-[2rem] shadow-[0_0_50px_#2563eb50] border border-blue-400/40 flex flex-col items-center justify-center space-y-1 relative"
            >
               <Shield size={24} className="text-white" />
               <span className="text-[8px] font-black uppercase text-white/60 tracking-tighter italic leading-none">V-CORE</span>
            </motion.div>
         </div>

         {/* Device Nodes */}
         {devices.map((d, i) => {
            const top = 20 + (i * 60);
            const left = 20 + (i * 60);
            return (
              <motion.div 
                key={d.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ top: `${top}%`, left: `${left}%` }}
                className="absolute w-12 h-12 bg-emerald-500/10 backdrop-blur-md rounded-2xl border border-emerald-500/20 flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 group/node"
              >
                 <Smartphone size={16} className="text-emerald-500 group-hover/node:scale-125 transition-transform" />
                 <span className="absolute -bottom-6 text-[8px] font-black text-white/40 uppercase whitespace-nowrap italic">{d.nickname || 'Institutional Node'}</span>
              </motion.div>
            );
         })}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4">
         <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-2">Total Bridges</p>
            <p className="text-2xl font-black text-white leading-none">{devices.length + 1}</p>
         </div>
         <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest leading-none mb-2">Sync Status</p>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] font-black text-emerald-500 uppercase italic leading-none">OPTIMAL</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default HardwareTopology;
