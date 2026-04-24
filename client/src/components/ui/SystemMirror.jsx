import { motion } from 'framer-motion';
import { Shield, Users, GraduationCap, Box, Activity, Sparkles, Server } from 'lucide-react';
import { useHealth } from '../../context/HealthContext';

const MirrorNode = ({ type, color, icon: Icon, pos, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.3, 1, 0.3], 
      scale: [1, 1.05, 1],
      x: pos.x,
      y: pos.y
    }}
    transition={{ duration: 6, delay, repeat: Infinity, ease: 'easeInOut' }}
    className={`absolute p-6 rounded-[2.5rem] bg-black/40 border border-white/5 backdrop-blur-2xl ${color} shadow-2xl flex flex-col items-center gap-3 group hover:border-blue-500/30 transition-all cursor-pointer shadow-black/80`}
  >
    <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-blue-600/10 transition-colors shadow-inner">
       <Icon size={24} />
    </div>
    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors italic">{type}</span>
  </motion.div>
);

export default function SystemMirror({ department = "GENERAL" }) {
  const { health } = useHealth();
  
  const sectors = [
    { type: 'Faculty Grid', icon: Users, color: 'text-blue-400', pos: { x: -200, y: -120 }, delay: 0 },
    { type: 'Student Matrix', icon: GraduationCap, color: 'text-indigo-400', pos: { x: 200, y: -120 }, delay: 1.5 },
    { type: 'Asset Register', icon: Box, color: 'text-emerald-400', pos: { x: -200, y: 120 }, delay: 3 },
    { type: 'Strategic Data', icon: Shield, color: 'text-blue-500', pos: { x: 200, y: 120 }, delay: 4.5 },
  ];

  return (
    <div className="relative w-full h-[650px] bg-[#02040a] rounded-[4rem] border border-white/5 overflow-hidden flex items-center justify-center group shadow-2xl shadow-black/60">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.08),transparent_70%)] opacity-60" />
       
       {/* Background Grid */}
       <div className="absolute inset-0 system-grid opacity-[0.15] pointer-events-none" />

       {/* Institutional Core */}
       <div className="relative z-10 w-full h-full flex items-center justify-center pt-10">
          <motion.div
             animate={{ scale: [1, 1.03, 1], opacity: [0.9, 1, 0.9] }}
             transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
             className="relative w-[400px] h-[400px] rounded-full border border-white/5 flex items-center justify-center p-14 bg-white/[0.01] shadow-[0_60px_120px_rgba(0,0,0,0.9)] backdrop-blur-3xl"
          >
             <div className="text-center relative z-20">
                <div className="w-24 h-24 bg-blue-600/10 rounded-[2.5rem] mx-auto flex items-center justify-center text-blue-500 mb-8 border border-blue-500/20 shadow-2xl shadow-blue-500/10 overflow-hidden relative group/icon">
                   <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                   <Server size={44} className="relative z-10 transition-transform group-hover/icon:scale-110 duration-500" />
                </div>
                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                   {department} <br/> <span className="text-blue-500">System Mirror</span>
                </h3>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em] mt-6 italic opacity-60">Sync Protocol: Optimal</p>
             </div>

             <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute inset-6 border border-blue-500/10 rounded-full border-dashed opacity-40" />
             <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} className="absolute inset-12 border border-white/5 rounded-full border-dashed opacity-20" />
          </motion.div>

          {/* Mirror Sectors */}
          {sectors.map(s => (
             <MirrorNode key={s.type} type={s.type} icon={s.icon} color={s.color} pos={s.pos} delay={s.delay} />
          ))}
       </div>

       {/* Status Overlays */}
       <div className="absolute top-16 right-16 text-right">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2 italic">Operation Variance</p>
          <p className="text-5xl font-black text-white italic uppercase tracking-tighter">{health.variance}%</p>
       </div>

       <div className="absolute bottom-16 left-16 flex items-center gap-10">
          <div className="p-6 bg-white/[0.02] rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-xl">
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2 italic">Flow Rate</p>
             <p className="text-lg font-black text-emerald-400 italic">14.4 GB/S</p>
          </div>
          <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity }} className="flex items-center gap-4">
             <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-[0_0_12px_#3b82f6] animate-pulse" />
             <span className="text-[11px] font-black text-blue-400/60 uppercase tracking-[0.4em] italic">Infrastructure Active</span>
          </motion.div>
       </div>
       
       <button className="absolute bottom-16 right-16 px-12 py-6 bg-blue-600 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-blue-500 hover:shadow-blue-500/30 active:scale-95 transition-all shadow-2xl flex items-center gap-5 group/btn italic">
          <Sparkles size={18} className="group-hover/btn:rotate-12 transition-transform" />
          Deploy Strategic Model
       </button>
    </div>
  );
}
