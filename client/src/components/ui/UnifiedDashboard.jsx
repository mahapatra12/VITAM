import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Zap, Activity, TrendingUp, Shield, Cpu, X } from 'lucide-react';

const TELEMETRY_STREAMS = [
  { id: 'SYNC',     color: '#10b981', label: 'Sync Hash Rate',       unit: 'TX/S' },
  { id: 'STRATEGIC', color: '#3b82f6', label: 'Strategic Link Latency', unit: 'MS'   },
  { id: 'SYSTEM',    color: '#a855f7', label: 'System Coherence',      unit: '%'    },
  { id: 'VARIANCE',  color: '#eab308', label: 'Variance Suppression',  unit: 'DB'   },
];

function randomVal(min, max) {
  return (Math.random() * (max - min) + min).toFixed(2);
}

export default function InstitutionalDashboard() {
  const [show, setShow] = useState(false);
  const [streams, setStreams] = useState(TELEMETRY_STREAMS.map(s => ({ ...s, history: [50, 60, 55, 70], current: 66 })));
  const [arcProgress, setArcProgress] = useState(74);

  useEffect(() => {
    if (!show) return;
    const id = setInterval(() => {
      setStreams(prev => prev.map(s => {
        const next = parseFloat(randomVal(20, 99));
        return { ...s, current: next, history: [...s.history.slice(-7), next] };
      }));
      setArcProgress(p => {
        const next = p + (Math.random() - 0.4) * 2;
        return Math.min(99.9, Math.max(60, next));
      });
    }, 1200);
    return () => clearInterval(id);
  }, [show]);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setShow(s => !s)}
        className={`fixed bottom-8 right-8 z-[200] w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-500 border ${
          show
            ? 'bg-blue-600 border-blue-500 shadow-[0_0_30px_#2563eb60]'
            : 'bg-black/70 border-white/10 hover:border-blue-500/40 backdrop-blur-xl shadow-2xl'
        }`}
      >
        {show ? <X size={20} className="text-white" /> : <Globe size={20} className="text-slate-400" />}
      </button>

      {/* Deck overlay */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, x: 60, scale: 0.96 }}
            animate={{ opacity: 1, x: 0,  scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="fixed bottom-28 right-8 z-[199] w-80 bg-black/90 border border-white/10 rounded-3xl backdrop-blur-3xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic mb-1">Institutional Command Deck</p>
                <p className="text-xs font-black text-white tracking-tighter uppercase italic">Strategic System Monitor</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shadow-[0_0_6px_#10b981]" />
                <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">LIVE</span>
              </div>
            </div>

            {/* Singularity Arc indicator */}
            <div className="px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 flex items-center justify-center border-2 border-blue-500/20 rounded-full">
                    <div className="text-center">
                      <p className="text-sm font-black text-white leading-none italic">{arcProgress.toFixed(1)}</p>
                      <p className="text-[7px] text-blue-400 font-black uppercase italic">%</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1 italic">Strategic Alignment</p>
                  <p className="text-[10px] font-black text-white uppercase italic">Institutional Integrity Index</p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${arcProgress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Quantum Telemetry streams */}
            <div className="px-5 py-4 space-y-4">
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] italic mb-1">System Telemetry Streams</p>
              {streams.map(stream => (
                <div key={stream.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: stream.color }}>
                      {stream.label}
                    </span>
                    <span className="text-[8px] font-mono text-white/80">{stream.current.toFixed(1)} {stream.unit}</span>
                  </div>
                  {/* Mini spark bar */}
                  <div className="flex items-end gap-0.5 h-6">
                    {stream.history.map((v, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: `${v}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="flex-1 rounded-sm opacity-70 min-h-[2px]"
                        style={{ backgroundColor: stream.color }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Scrolling log feed */}
            <div className="border-t border-white/5 px-5 py-3">
              <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mb-2">Operational Log</p>
              <div className="space-y-1.5 font-mono text-[7px] max-h-24 overflow-hidden">
                {[
                  { col: 'text-blue-400',   msg: 'Audit alignment commit: +₹1.2Cr flow delta' },
                  { col: 'text-indigo-400', msg: 'Core node [STRAT_LAB] projection converging' },
                  { col: 'text-emerald-400',msg: 'System deviation: 0.01ms — SYNC ACTIVE' },
                  { col: 'text-blue-500',   msg: 'Consensus beam lock: RESEARCH ↔ CSE' },
                  { col: 'text-blue-300',   msg: 'Architecture integrity: 99.97%' },
                ].map((log, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 0.8, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={log.col}
                  >
                    &gt; {log.msg}
                  </motion.p>
                ))}
              </div>
            </div>

            {/* Bottom scan bar */}
            <div className="qt-bar" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
