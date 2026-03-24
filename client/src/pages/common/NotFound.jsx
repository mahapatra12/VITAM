import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft, RefreshCw } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020202] flex items-center justify-center overflow-hidden relative">
      {/* Ambient BG */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl" />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* Glitch 404 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8"
        >
          <span className="text-[120px] sm:text-[180px] font-black leading-none tracking-tighter bg-gradient-to-br from-slate-700 via-slate-500 to-slate-700 text-transparent bg-clip-text select-none">
            404
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <AlertTriangle size={16} className="text-amber-400" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Node Unreachable</span>
          </div>

          <h1 className="text-2xl font-black text-white">Route Not Found</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            The institutional node you're trying to access doesn't exist or you don't have clearance to reach it.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-10"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={14} /> Go Back
          </button>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
          >
            <Home size={14} /> Mission Control
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            <RefreshCw size={14} /> Retry Node
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-[9px] font-mono text-slate-700 uppercase tracking-widest"
        >
          VITAM OS · Error Code 404 · Route Matrix Lookup Failed
        </motion.p>
      </div>
    </div>
  );
}
