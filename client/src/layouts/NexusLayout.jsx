import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NexusLayout = ({ children, title = "Institutional Nexus" }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020202] text-white overflow-hidden relative selection:bg-appleBlue/30">
      
      {/* Background Infrastructure */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,113,227,0.05)_0%,transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        
        {/* Data Pathways */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full">
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <motion.path 
              d="M -100 100 Q 400 300 1200 100" 
              fill="none" 
              stroke="#0071e3" 
              strokeWidth="1" 
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />
            <motion.path 
              d="M 1200 600 Q 600 800 -100 600" 
              fill="none" 
              stroke="#a855f7" 
              strokeWidth="1" 
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 2 }}
            />
          </svg>
        </div>
      </div>

      {/* Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-20 z-50 px-10 flex items-center justify-between backdrop-blur-3xl border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-6">
          <motion.button 
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-appleBlue flex items-center justify-center shadow-[0_0_20px_rgba(0,113,227,0.5)]">
                <Sparkles size={16} className="text-white" />
             </div>
             <div>
                <h1 className="text-sm font-black tracking-[0.3em] uppercase italic">{title}</h1>
                <p className="text-[9px] font-bold text-appleBlue/60 uppercase tracking-widest italic">VITAM Intelligence v5.0</p>
             </div>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="hidden md:flex items-center gap-6 px-6 py-2 bg-white/5 rounded-full border border-white/5">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80 italic">System Link Stable</span>
              </div>
              <div className="w-[1px] h-3 bg-white/10" />
              <div className="flex items-center gap-2">
                 <Cpu size={12} className="text-appleBlue" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Load: 2.4 GFlops</span>
              </div>
           </div>
           <motion.div whileHover={{ scale: 1.05 }} className="w-10 h-10 rounded-full bg-gradient-to-br from-appleBlue to-purple-600 border border-white/20 shadow-xl" />
        </div>
      </header>

      {/* Main Experience Wrapper */}
      <main className="relative z-10 pt-32 px-10 pb-16 w-full max-w-[1800px] mx-auto">
        {children}
      </main>

      {/* Footer Interface */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-8 py-3 bg-black/40 backdrop-blur-2xl rounded-full border border-white/10 flex items-center gap-6">
         <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] italic">Institutional Security Protocol Active</span>
         <div className="w-[1px] h-3 bg-white/10" />
         <div className="flex items-center gap-4">
            <ShieldCheck size={14} className="text-appleBlue opacity-40" />
            <Zap size={14} className="text-appleBlue opacity-40" />
         </div>
      </footer>

    </div>
  );
};

export default NexusLayout;
