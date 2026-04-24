import { motion } from 'framer-motion';
import { Globe, Server, Network, Radio, Zap } from 'lucide-react';

const ClusterNode = ({ id, label, status, type, pos, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.6, 1, 0.6], 
      scale: [1, 1.05, 1],
      x: pos.x,
      y: pos.y
    }}
    transition={{ duration: 5, delay, repeat: Infinity, ease: 'easeInOut' }}
    className="absolute flex flex-col items-center gap-3 group cursor-pointer"
  >
     <div className="relative">
        <div className="w-20 h-20 rounded-[2.5rem] bg-black/40 border border-white/10 backdrop-blur-3xl flex items-center justify-center group-hover:bg-blue-600/20 group-hover:border-blue-500/40 transition-all shadow-2xl">
           <Server size={28} className={status === 'Stable' ? 'text-blue-400' : 'text-amber-400'} />
        </div>
        <div className="absolute -top-1 -right-1 p-2 rounded-xl bg-black border border-white/10 shadow-lg scale-75">
           <Network size={12} className="text-white/40" />
        </div>
        {status === 'Sync' && (
           <div className="absolute inset-0 bg-blue-400/10 rounded-[2.5rem] blur-2xl animate-pulse" />
        )}
     </div>
     <div className="text-center">
        <p className="text-[10px] font-black text-white uppercase tracking-tighter">{label}</p>
        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1 opacity-60 italic">{type} · {status}</p>
     </div>
  </motion.div>
);

export default function NetworkTopology() {
  const clusters = [
    { label: 'VITAM MAIN', status: 'Stable', type: 'CORE', pos: { x: 0, y: 0 }, delay: 0 },
    { label: 'RURAL MESH', status: 'Sync', type: 'BRANCH', pos: { x: -250, y: -120 }, delay: 1 },
    { label: 'RESEARCH WING', status: 'Active', type: 'ELITE', pos: { x: 250, y: -120 }, delay: 2 },
    { label: 'GLOBAL HANDSHAKE', status: 'Optimal', type: 'PEER', pos: { x: 0, y: 220 }, delay: 0.5 },
  ];

  return (
    <div className="relative w-full h-[650px] flex items-center justify-center bg-transparent overflow-hidden group">
       {/* Background Grid Particle Field (Simulated via SVG) */}
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
       
       <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10">
          <defs>
             <linearGradient id="clusterGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#2dd4bf" />
             </linearGradient>
          </defs>
          <motion.circle cx="50%" cy="50%" r="300" fill="none" stroke="url(#clusterGrad)" strokeWidth="1" strokeDasharray="5 15" className="animate-spin-slow" />
          <motion.circle cx="50%" cy="50%" r="150" fill="none" stroke="url(#clusterGrad)" strokeWidth="0.5" strokeDasharray="2 10" className="animate-spin-slow-reverse" />
       </svg>

       {/* Resonating Cluster Nodes */}
       <div className="relative z-10 w-full h-full flex items-center justify-center">
          {clusters.map((c, i) => (
             <ClusterNode key={c.label} {...c} />
          ))}
          
          {/* Central Quorum Pulse */}
          <div className="relative flex items-center justify-center">
             <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]"
             />
             <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_50px_white] animate-pulse" />
          </div>
       </div>

       {/* Operational Signal Telemetry */}
       <div className="absolute bottom-16 right-16 text-right">
          <div className="flex items-center gap-4 mb-4 justify-end">
             <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic animate-pulse">Operational Signal Active</span>
             <Zap size={18} className="text-blue-500 shadow-[0_0_15px_#3b82f6]" />
          </div>
          <p className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Institutional <br/> <span className="text-blue-500">Topology</span></p>
       </div>

       <div className="absolute top-16 left-16 flex flex-col gap-6">
          <div className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/10 rounded-[2rem] backdrop-blur-3xl shadow-2xl">
             <div className="w-3 h-3 rounded-full bg-blue-500 animate-ping shadow-[0_0_10px_#3b82f6]" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">System Synchronization Verified</span>
          </div>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] max-w-[200px] italic leading-[1.8] opacity-80">
             "VITAM Core node is currently synchronizing 4 sub-grids and 12,500 architecture nodes across the system bridge."
          </p>
       </div>

       <button className="absolute bottom-16 left-16 px-10 py-5 bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-blue-600/20 transition-all flex items-center gap-4 active:scale-95 italic">
          <Globe size={20} /> Force Strategic Sync
       </button>
    </div>
  );
}
