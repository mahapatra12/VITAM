import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Award, Zap, Globe, Cpu, Brain, Terminal, FileCheck } from 'lucide-react';

const PHASES = [
  { id: 1, name: 'Architecture Core', tech: 'Dynamic CSS-Pulse' },
  { id: 5, name: 'Institutional Strategy-Sync', tech: 'Framer-Motion Sync' },
  { id: 10, name: 'Institutional Intelligence', tech: 'AI Prediction-Engine' },
  { id: 15, name: 'Institutional Core Hub', tech: 'Parallel State-Routing' },
  { id: 19, name: 'Strategic Reality', tech: 'Institutional-Sync Shaders' },
  { id: 22, name: 'Optimal Variance', tech: 'Variance Resolution' },
  { id: 23, name: 'Final Architectural Audit', tech: 'System DNA Audit' }
];

const LegacyAudit = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-8 bg-black/90 backdrop-blur-3xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        className="max-w-5xl w-full bg-[#02040a] border-2 border-[#d4af37]/20 rounded-[4rem] shadow-[0_0_120px_rgba(212,175,55,0.15)] overflow-hidden relative"
      >
        <div className="h-2 bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent w-full animate-pulse" />
        
        <div className="p-16 space-y-16">
          <div className="flex flex-col items-center text-center space-y-6">
             <div className="w-28 h-28 rounded-[2.5rem] bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] border-4 border-[#d4af37]/20 shadow-[0_0_60px_rgba(212,175,55,0.2)] mb-4">
                <FileCheck size={56} />
             </div>
             <div>
                <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-4">Institutional Audit</h1>
                <p className="text-[#d4af37] text-sm font-black uppercase tracking-[0.8em] italic">100% Phase-Verified · Strategic Resolution</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {PHASES.map((p) => (
               <div key={p.id} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-3 hover:border-[#d4af37]/40 transition-all group hover:bg-white/[0.04]">
                  <div className="text-[11px] font-black text-[#d4af37]/60 uppercase tracking-[0.3em] italic">Phase {p.id}</div>
                  <div className="text-base font-black text-white uppercase tracking-tight group-hover:text-[#d4af37] italic">{p.name}</div>
                  <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic">{p.tech}</div>
               </div>
             ))}
          </div>

          <div className="p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-6 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-[#d4af37]/5 to-transparent opacity-50" />
             <div className="relative z-10 flex items-center gap-4">
                <Terminal size={18} className="text-[#d4af37]" />
                <span className="text-[11px] font-black text-[#d4af37] uppercase tracking-[0.5em] italic">Architectural Benchmark Verification</span>
             </div>
             <p className="relative z-10 text-lg font-black text-white/80 leading-relaxed italic">
                "The VITAM Institutional Operating System has successfully traversed 23 evolutionary phases, from its initial architectural core to its absolute final audit. All institutional sectors have achieved full strategic alignment. The OS is now verified as the permanent institutional foundation."
             </p>
          </div>

          <div className="flex justify-center">
             <button 
               onClick={onClose}
               className="px-16 py-6 rounded-[2rem] bg-[#d4af37] text-black text-sm font-black uppercase tracking-[0.6em] shadow-[0_20px_50px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 transition-all italic"
             >
                Seal Audit
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LegacyAudit;
