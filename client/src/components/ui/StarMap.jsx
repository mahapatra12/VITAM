import { motion } from 'framer-motion';
import { Star, Target, Zap, GraduationCap, Award } from 'lucide-react';

const StarNode = ({ pos, label, active, delay, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.4, 1, 0.4], 
      scale: active ? [1, 1.2, 1] : 1,
      x: pos.x,
      y: pos.y
    }}
    transition={{ duration: 4, delay, repeat: Infinity }}
    className={`absolute flex flex-col items-center gap-2 group cursor-pointer`}
  >
     <div className={`p-3 rounded-full border ${active ? 'bg-blue-500/20 border-blue-400 shadow-[0_0_20px_#3b82f6]' : 'bg-white/5 border-white/10'} backdrop-blur-xl transition-all group-hover:scale-110`}>
        <Icon size={16} className={active ? 'text-blue-400' : 'text-slate-500'} />
     </div>
     <span className={`text-[8px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-slate-600'} group-hover:text-white transition-colors`}>{label}</span>
     {active && (
        <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-2xl animate-pulse -z-10" />
     )}
  </motion.div>
);

export default function StarMap() {
  const nodes = [
    { label: 'Foundations', icon: GraduationCap, pos: { x: -200, y: 100 }, delay: 0 },
    { label: 'Data Architect', icon: Zap, pos: { x: -80, y: -50 }, delay: 1, active: true },
    { label: 'AI Specialization', icon: Target, pos: { x: 80, y: -80 }, delay: 2, active: true },
    { label: 'Distinguished Fellow', icon: Award, pos: { x: 220, y: 50 }, delay: 0.5 },
  ];

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden bg-black/40 rounded-[4rem] border border-white/5 shadow-inner group">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />
       
       {/* Background Constellation Lines */}
       <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
             <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
             </filter>
             <linearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
             </linearGradient>
          </defs>
          <motion.path
             d="M 50 350 Q 200 200 450 250 T 850 300"
             stroke="url(#starGrad)"
             strokeWidth="2"
             fill="none"
             strokeDasharray="10 5"
             filter="url(#glow)"
             initial={{ pathLength: 0 }}
             animate={{ pathLength: 1 }}
             transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />
       </svg>

       {/* Interactive Star Nodes */}
       <div className="relative z-10 w-full h-full">
          {nodes.map((node, i) => (
             <StarNode key={node.label} {...node} />
          ))}
       </div>

       {/* Mastery Pulse Indicator */}
       <div className="absolute bottom-12 left-12 flex flex-col gap-2">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] italic mb-2">Achievement Status: ELITE</p>
          <div className="flex gap-1.5">
             {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-6 h-1 rounded-full ${i < 4 ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' : 'bg-white/5'}`} />
             ))}
          </div>
       </div>

        <div className="absolute top-12 right-12 text-right">
          <div className="flex items-center gap-3 mb-2 justify-end">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">System Sync Status</span>
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Advanced <br/> <span className="text-blue-500">Scholar</span></p>
       </div>
       
       <button className="absolute bottom-12 right-12 px-8 py-4 bg-white text-black rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-2xl flex items-center gap-3 italic">
          <Star size={16} className="text-blue-500" />
          Visualize Roadmap
       </button>
    </div>
  );
}
