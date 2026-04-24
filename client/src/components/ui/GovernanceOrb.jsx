import { motion } from 'framer-motion';
import { Shield, Zap, Activity, Cpu, Globe } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';

const OrbNode = ({ delay, color, icon: Icon, label, position }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.4, 1, 0.4], 
      scale: [1, 1.1, 1],
      x: position.x,
      y: position.y
    }}
    transition={{ 
      duration: 4, 
      delay, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }}
    className={`absolute p-3 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl ${color} shadow-2xl flex flex-col items-center gap-1 group cursor-pointer hover:border-white/30 transition-all`}
  >
    <Icon size={20} className="group-hover:scale-110 transition-transform duration-500" />
    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50 group-hover:text-white transition-colors italic">{label}</span>
  </motion.div>
);

export default function GovernanceOrb() {
  const { health } = useHealth();
  
  const nodes = [
    { icon: Database, label: 'CENTRAL REPOSITORY', color: 'text-blue-400', pos: { x: -160, y: -160 }, delay: 0 },
    { icon: Cpu, label: 'STRATEGIC AI', color: 'text-blue-500', pos: { x: 160, y: -160 }, delay: 1.5 },
    { icon: Activity, label: 'SYNC LATENCY', color: 'text-emerald-400', pos: { x: -160, y: 160 }, delay: 3 },
    { icon: Globe, label: 'INSTITUTIONAL MESH', color: 'text-indigo-400', pos: { x: 160, y: 160 }, delay: 4.5 },
  ];

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center perspective-1000">
      {/* Central Quantum Orb */}
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 40px rgba(59,130,246,0.2)",
            "0 0 80px rgba(59,130,246,0.4)",
            "0 0 40px rgba(59,130,246,0.2)"
          ]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="relative w-64 h-64 rounded-full bg-gradient-to-br from-blue-600/30 via-indigo-600/10 to-transparent border border-white/20 backdrop-blur-3xl flex items-center justify-center p-8 active:scale-95 transition-transform cursor-pointer group"
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 rounded-full" />
        
        {/* Internal Fractal Pulse */}
        <motion.div
           animate={{ 
             scale: [0.8, 1.2, 0.8],
             opacity: [0.3, 0.6, 0.3]
           }}
           transition={{ duration: 3, repeat: Infinity }}
           className="absolute w-48 h-48 rounded-full bg-blue-500/10 blur-3xl"
        />

        <div className="relative z-10 text-center">
           <Shield size={80} className={`mx-auto mb-6 transition-all duration-700 ${health.variance > 70 ? 'text-amber-500 animate-pulse' : 'text-blue-500'} drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]`} />
           <p className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              Institutional <br/> <span className="text-blue-500">Hub</span>
           </p>
           <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mt-5 italic opacity-60">{health.variance}% Variance</p>
        </div>

        {/* Orbiting Rings */}
        {[...Array(3)].map((_, i) => (
           <motion.div
             key={i}
             animate={{ rotate: 360 }}
             transition={{ duration: 10 + i * 5, repeat: Infinity, ease: "linear" }}
             className="absolute inset-[-40px] border border-white/5 rounded-full pointer-events-none"
             style={{ borderStyle: 'dashed' }}
           />
        ))}

        {/* Connected Nodes */}
        {nodes.map((node, i) => (
           <OrbNode key={node.label} icon={node.icon} label={node.label} color={node.color} position={node.pos} delay={node.delay} />
        ))}
      </motion.div>

      {/* Connection Lines (Simulated with SVGs) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
         <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="1">
               <stop offset="0%" stopColor="#3b82f6" />
               <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
         </defs>
         {nodes.map((node, i) => (
            <motion.line
              key={`line-${i}`}
              x1="50%" y1="50%"
              x2={`calc(50% + ${node.pos.x}px)`} y2={`calc(50% + ${node.pos.y}px)`}
              stroke="url(#lineGrad)"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: [0, 1, 0] }}
              transition={{ duration: 5, delay: i * 0.5, repeat: Infinity }}
            />
         ))}
      </svg>
    </div>
  );
}

// Simple placeholder for Database, should import from lucide-react in real file
function Database({ size, className }) {
   return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>;
}
