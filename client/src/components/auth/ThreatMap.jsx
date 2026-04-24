import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Globe, MapPin, Activity, Terminal } from 'lucide-react';

const ThreatMap = () => {
  const [nodes, setNodes] = useState([]);

  // Simulate threat discovery and neutralization
  useEffect(() => {
    const interval = setInterval(() => {
      const id = Math.random().toString(36).substr(2, 9).toUpperCase();
      const node = {
        id,
        x: Math.floor(Math.random() * 80) + 10,
        y: Math.floor(Math.random() * 60) + 20,
        type: ['SQL Probe', 'XSS Injection', 'Root Attempt', 'Protocol Violation'][Math.floor(Math.random() * 4)],
        status: 'NEUTRALIZED',
        city: ['New York', 'London', 'Tokyo', 'Berlin', 'Mumbai', 'Sofia'][Math.floor(Math.random() * 6)],
        timestamp: new Date().toLocaleTimeString([], { hour12: false })
      };
      
      setNodes(prev => [node, ...prev].slice(0, 5));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const latencyNodes = [
    { id: 'LDN-1', x: 25, y: 35, name: 'London-B', latency: '12ms' },
    { id: 'MUM-1', x: 65, y: 55, name: 'Mumbai-A', latency: '42ms' },
    { id: 'NYC-1', x: 15, y: 45, name: 'NewYork-C', latency: '8ms' }
  ];

  return (
    <div className="bg-[#050505]/60 backdrop-blur-3xl border border-white/5 rounded-[50px] p-10 h-full relative overflow-hidden group shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Globe size={180} className="text-blue-500" />
      </div>

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
            <Globe size={24} className="animate-pulse" />
          </div>
          <div>
             <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em]">Global Defense Cartography</h3>
             <p className="text-[9px] font-black text-blue-500/40 uppercase tracking-widest mt-1 italic">Sovereign Node Monitor: Active</p>
          </div>
        </div>
        <div className="px-4 py-2 border border-blue-500/20 bg-blue-500/5 rounded-full flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
           <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/80">Real-Time Sync</span>
        </div>
      </div>

      <div className="relative w-full aspect-[2/1] bg-white/[0.01] border border-white/5 rounded-3xl overflow-hidden mb-10">
         {/* Simple SVG World Map Outline Mock */}
         <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 800 400">
            <path d="M100 150 Q 150 100, 200 150 T 300 150 T 400 100 T 500 150 T 600 100 T 700 150" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-500" />
            <path d="M150 250 Q 200 300, 250 250 T 350 250 T 450 300 T 550 250 T 650 300 T 750 250" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-500" />
         </svg>

         <AnimatePresence>
            {nodes.map((node) => (
              <motion.g
                key={node.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                className="pointer-events-none"
              >
                <motion.circle 
                  cx={`${node.x}%`} 
                  cy={`${node.y}%`} 
                  r="4" 
                  fill="#ef4444" 
                  animate={{ scale: [1, 2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <circle cx={`${node.x}%`} cy={`${node.y}%`} r="1" fill="#fff" />
                
                {/* Threat Tag */}
                <motion.foreignObject x={`${node.x + 2}%`} y={`${node.y - 2}%`} width="100" height="40">
                   <div className="bg-black/80 border border-red-500/20 backdrop-blur-md px-2 py-1 rounded-lg">
                      <p className="text-[7px] font-black text-red-400 uppercase tracking-tighter">{node.type}</p>
                      <p className="text-[6px] font-black text-white/30 uppercase">{node.city}</p>
                   </div>
                </motion.foreignObject>
              </motion.g>
            ))}
         </AnimatePresence>

         {/* Latency Nodes */}
         {latencyNodes.map(node => (
            <div key={node.id} className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ left: `${node.x}%`, top: `${node.y}%` }}>
               <div className="relative">
                  <MapPin size={10} className="text-blue-500 shadow-blue-500/20 shadow-xl" />
                  <div className="absolute top-4 left-0 bg-black/60 border border-white/5 px-2 py-1 rounded-md">
                     <p className="text-[6px] font-black uppercase text-white/40 tracking-widest">{node.name}</p>
                     <p className="text-[7px] font-mono text-blue-400">{node.latency}</p>
                  </div>
               </div>
            </div>
         ))}

         {/* Packet Flow (Simulated) */}
         <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none">
            <motion.path 
               d="M25,35 Q50,20 85,45"
               fill="none" stroke="#2563eb" strokeWidth="0.5" strokeDasharray="2,2"
               animate={{ strokeDashoffset: [0, -20] }}
               transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
         </svg>
      </div>

      <div className="space-y-4">
         <div className="flex items-center gap-3 px-2 mb-4">
            <Terminal size={14} className="text-white/20" />
            <h4 className="text-[9px] font-black uppercase tracking-widest text-white/20">Neutralization Ledger</h4>
         </div>
         <div className="grid grid-cols-1 gap-2">
            <AnimatePresence mode="popLayout">
               {nodes.map((node, i) => (
                 <motion.div 
                   key={node.id}
                   layout
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1 - (i * 0.2), y: 0 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   className="flex items-center justify-between p-4 bg-white/[0.01] border border-white/5 rounded-2xl group/row"
                 >
                    <div className="flex items-center gap-4">
                       <MapPin size={12} className="text-red-500/40 group-hover/row:text-red-500 transition-colors" />
                       <div>
                          <p className="text-[10px] font-black text-white hover:text-blue-500 cursor-default transition-colors uppercase italic">{node.city}</p>
                          <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-0.5">{node.type} Protocol</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black text-emerald-500 uppercase italic tracking-tighter opacity-100!">{node.status}</p>
                       <p className="text-[8px] font-black text-white/10 uppercase font-mono mt-1">{node.timestamp}</p>
                    </div>
                 </motion.div>
               ))}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
};

export default ThreatMap;
