import { motion } from 'framer-motion';
import { ChevronLeft, Sparkles, Cpu, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NexusLayout = ({ children, title = 'Institutional Nexus' }) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070c] text-white selection:bg-appleBlue/30">

      {/* Background Infrastructure */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,113,227,0.05)_0%,transparent_70%)]" />
        <div className="absolute inset-0 h-full w-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        {/* Data Pathways */}
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <svg className="h-full w-full">
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
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />
            <motion.path
              d="M 1200 600 Q 600 800 -100 600"
              fill="none"
              stroke="#a855f7"
              strokeWidth="1"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear', delay: 2 }}
            />
          </svg>
        </div>
      </div>

      {/* Header Bar — responsive + safe-area */}
      <header
        className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between gap-3 border-b border-white/5 bg-black/30 px-4 backdrop-blur-2xl sm:px-6 lg:px-10"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 0.5rem)', paddingBottom: '0.5rem', minHeight: '64px' }}
      >
        <div className="flex min-w-0 items-center gap-3 sm:gap-5">
          <motion.button
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft size={20} />
          </motion.button>
          <div className="hidden h-8 w-px bg-white/10 sm:block" />
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-appleBlue shadow-[0_0_20px_rgba(0,113,227,0.5)]">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-[11px] font-black uppercase italic tracking-[0.22em] sm:text-sm sm:tracking-[0.3em]">
                {title}
              </h1>
              <p className="hidden text-[9px] font-bold uppercase italic tracking-widest text-appleBlue/60 sm:block">
                VITAM Intelligence v5.0
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 sm:gap-6">
          <div className="hidden items-center gap-5 rounded-full border border-white/5 bg-white/5 px-5 py-2 lg:flex">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
              <span className="text-[10px] font-black uppercase italic tracking-widest text-emerald-500/80">
                System Link Stable
              </span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-appleBlue" />
              <span className="text-[10px] font-black uppercase italic tracking-widest text-white/40">
                Load: 2.4 GFlops
              </span>
            </div>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="h-10 w-10 rounded-full border border-white/20 bg-gradient-to-br from-appleBlue to-purple-600 shadow-xl"
          />
        </div>
      </header>

      {/* Main Experience Wrapper */}
      <main
        className="relative z-10 mx-auto w-full max-w-[1800px] px-4 pb-28 pt-24 sm:px-6 sm:pt-28 lg:px-10 lg:pb-16 lg:pt-32"
        style={{
          paddingLeft: 'max(env(safe-area-inset-left), 1rem)',
          paddingRight: 'max(env(safe-area-inset-right), 1rem)',
        }}
      >
        {children}
      </main>

      {/* Footer Interface — iOS floating pill */}
      <footer
        className="fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-black/50 px-4 py-2.5 backdrop-blur-2xl sm:gap-6 sm:px-8 sm:py-3"
        style={{ bottom: 'max(env(safe-area-inset-bottom), 1rem)' }}
      >
        <span className="hidden text-[9px] font-black uppercase italic tracking-[0.4em] text-white/20 sm:inline">
          Institutional Security Protocol Active
        </span>
        <span className="text-[9px] font-black uppercase italic tracking-[0.3em] text-white/30 sm:hidden">
          Secured
        </span>
        <div className="h-3 w-px bg-white/10" />
        <div className="flex items-center gap-3 sm:gap-4">
          <ShieldCheck size={14} className="text-appleBlue opacity-60" />
          <Zap size={14} className="text-appleBlue opacity-60" />
        </div>
      </footer>

    </div>
  );
};

export default NexusLayout;
