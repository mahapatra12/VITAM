import { motion } from 'framer-motion';
import { Cpu, ShieldCheck, Zap, Globe, Users } from 'lucide-react';

const SphereNode = ({ angle, distance, label, icon: Icon, delay, active }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: [0.6, 1, 0.6], 
      scale: active ? [1.1, 1.25, 1.1] : 1,
      rotate: 360 
    }}
    transition={{ duration: 20, delay, repeat: Infinity, ease: 'linear' }}
    className="absolute pointer-events-auto"
    style={{ transformOrigin: 'center' }}
  >
    <div className={`p-4 rounded-[2rem] bg-black/40 border border-white/5 backdrop-blur-3xl flex flex-col items-center gap-2 group hover:border-blue-500/30 transition-all cursor-pointer`}
      style={{ transform: `rotate(-360deg) translate(${distance}px)` }}>
       <div className={`p-1.5 rounded-full ${active ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-white/5 text-slate-600'}`}>
          <Icon size={18} />
       </div>
       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-white transition-colors italic">{label}</span>
    </div>
  </motion.div>
);

export default function CommandSphere() {
  const departments = [
    { label: 'ENGINEERING CORE', icon: Cpu, distance: 200, delay: 0, active: true },
    { label: 'STRATEGIC NETWORK', icon: Zap, distance: 180, delay: 5 },
    { label: 'CAMPUS INFRA', icon: Globe, distance: 220, delay: 10 },
    { label: 'FACULTY OPERATIONS', icon: Users, distance: 160, delay: 15 },
    { label: 'INSTITUTIONAL SECURITY', icon: ShieldCheck, distance: 240, delay: 2.5, active: true },
  ];

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center bg-[#050505] rounded-[5rem] border border-white/5 overflow-hidden group shadow-3xl">
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
       
       {/* Background Pulse Rings */}
       {[...Array(4)].map((_, i) => (
          <motion.div
             key={i}
             animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
             transition={{ duration: 6 + i, repeat: Infinity }}
             className="absolute w-[400px] h-[400px] rounded-full border border-blue-500/20 pointer-events-none"
             style={{ width: 300 + i * 150, height: 300 + i * 150 }}
          />
       ))}

       {/* Transcendent Core Sphere */}
       <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="relative w-96 h-96 rounded-[5rem] bg-gradient-to-br from-blue-600/30 via-indigo-600/10 to-transparent flex items-center justify-center p-12 border border-white/10 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] z-10"
       >
          <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full animate-pulse" />
          <div className="relative z-20 text-center">
             <Globe size={80} className="text-white mx-auto mb-8 animate-spin-slow opacity-60" />
             <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                Institutional <br/> <span className="text-blue-500 text-3xl">Command Sphere</span>
             </h3>
             <div className="mt-8 p-3 rounded-2xl bg-white/[0.02] border border-white/5 inline-flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] italic">System Alignment Established</span>
             </div>
          </div>
       </motion.div>

       {/* Orbiting Departmental Nodes */}
       <div className="absolute z-20 w-1 h-1 flex items-center justify-center">
          {departments.map((dept, i) => (
             <SphereNode key={dept.label} {...dept} />
          ))}
       </div>

       {/* Synergy Pulse Lines (Simulated with SVG) */}
       <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          <defs>
             <linearGradient id="synergyGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#818cf8" />
             </linearGradient>
          </defs>
          <circle cx="50%" cy="50%" r="280" fill="none" stroke="url(#synergyGrad)" strokeWidth="1" strokeDasharray="10 20" className="animate-spin-slow" />
       </svg>

       <div className="absolute bottom-12 left-12 grid grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl">
             <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Grid Synergy</p>
             <p className="text-xl font-black text-emerald-400">99.8%</p>
          </div>
          <div className="p-5 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-xl">
             <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 italic">Operational Index</p>
             <p className="text-xl font-black text-blue-400">Elite</p>
          </div>
       </div>

        <div className="absolute top-12 left-1/2 -translate-x-1/2 text-center pointer-events-none">
           <p className="text-[11px] font-black text-slate-700 uppercase tracking-[0.8em] italic animate-pulse">Institutional Grid · Strategic Oversight</p>
        </div>
              <div className="absolute top-12 right-12 flex gap-3">
           <button className="px-6 py-3 bg-white/[0.02] border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all italic">Operational Replay</button>
           <button className="px-6 py-4 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl italic">System Refresh</button>
        </div>
    </div>
  );
}
