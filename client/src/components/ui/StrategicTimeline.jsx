import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, TrendingUp, Zap } from 'lucide-react';

const TIMELINE_EVENTS = [
  {
    time: 'T-120D',
    label: 'Institutional Foundation',
    description: 'Strategic Grid v1 deployed. Phase 1 Institutional Protocol activated.',
    type: 'milestone',
    impact: 92,
    color: '#3b82f6',
    metrics: { variance: 4.2, fidelity: 88, nodes: 4 },
  },
  {
    time: 'T-60D',
    label: 'Institutional Resource Ledger',
    description: 'Autonomous resource arbitration achieved. Strategic Audit Grid online.',
    type: 'major',
    impact: 95,
    color: '#818cf8',
    metrics: { variance: 2.1, fidelity: 94, nodes: 8 },
  },
  {
    time: 'T-30D',
    label: 'Phase 9 Alignment',
    description: 'Predictive Variance Suppression active. Operational nodes projected.',
    type: 'major',
    impact: 97,
    color: '#fbbf24',
    metrics: { variance: 0.8, fidelity: 97, nodes: 11 },
  },
  {
    time: 'LIVE',
    label: 'Phase 12: Core Sync Grid',
    description: 'Strategic project mapping, holographic institutional layer, and Confidence Matrix active.',
    type: 'current',
    impact: 99.9,
    color: '#10b981',
    metrics: { variance: 0.02, fidelity: 99.9, nodes: 14 },
  },
  {
    time: 'T+30D',
    label: 'PROJECTED: Operational Maturity',
    description: 'Estimated full institutional alignment. Strategic autonomy index: 1.00.',
    type: 'projected',
    impact: 100,
    color: 'rgba(255,255,255,0.4)',
    metrics: { variance: 0, fidelity: 100, nodes: 18 },
    ghost: true,
  },
  {
    time: 'T+90D',
    label: 'PROJECTED: Autonomous Optimization',
    description: 'Self-healing institutional architecture. High-level strategic review protocols active.',
    type: 'projected',
    impact: 100,
    color: 'rgba(255,255,255,0.2)',
    metrics: { variance: 0, fidelity: 100, nodes: 24 },
    ghost: true,
  },
];

export default function PredictiveTimeline() {
  const [active, setActive] = useState(3); // default to NOW
  const [scrubPos, setScrubPos] = useState(3 / (TIMELINE_EVENTS.length - 1));

  const goTo = (i) => {
    setActive(i);
    setScrubPos(i / (TIMELINE_EVENTS.length - 1));
  };

  const ev = TIMELINE_EVENTS[active];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1 italic">Institutional Strategy Timeline</p>
          <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Predictive Decision Model</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">Live Projection</span>
        </div>
      </div>

      {/* Scrub track */}
      <div className="relative mb-8">
        <div className="relative h-1 bg-white/5 rounded-full">
          <div
            className="absolute h-full rounded-full transition-all duration-300"
            style={{
              width: `${scrubPos * 100}%`,
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #eab308, #10b981)',
            }}
          />
        </div>

        {/* Event nodes on track */}
        <div className="flex justify-between absolute -top-2 left-0 right-0">
          {TIMELINE_EVENTS.map((e, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center hover:scale-125 ${
                i === active ? 'scale-125 shadow-lg' : ''
              } ${e.ghost ? 'border-dashed' : ''}`}
              style={{
                backgroundColor: i <= active ? `${e.color}30` : 'rgba(30,41,59,0.8)',
                borderColor: i === active ? e.color : i < active ? `${e.color}60` : 'rgba(255,255,255,0.1)',
                boxShadow: i === active ? `0 0 12px ${e.color}60` : '',
              }}
            >
              {i === active && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ev.color }} />}
            </button>
          ))}
        </div>

        {/* Time labels */}
        <div className="flex justify-between mt-5">
          {TIMELINE_EVENTS.map((e, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`text-[6px] font-black uppercase tracking-widest transition-all ${
                i === active ? 'text-white' : 'text-slate-600 hover:text-slate-400'
              }`}
              style={{ color: i === active ? e.color : undefined }}
            >
              {e.time}
            </button>
          ))}
        </div>
      </div>

      {/* Active event detail card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={`p-6 rounded-3xl border relative overflow-hidden ${
            ev.ghost
              ? 'border-white/5 bg-white/2'
              : 'border-white/10 bg-black/40 backdrop-blur-xl'
          }`}
        >
          {ev.ghost && (
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.01) 0px, rgba(255,255,255,0.01) 1px, transparent 1px, transparent 8px)' }}
            />
          )}

          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {ev.ghost
                  ? <Zap size={14} className="text-white/30" />
                  : ev.type === 'current'
                    ? <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    : <Clock size={14} style={{ color: ev.color }} />
                }
                <span className="text-[9px] font-black uppercase tracking-[0.2em] italic"
                  style={{ color: ev.ghost ? 'rgba(255,255,255,0.3)' : ev.color }}>
                  {ev.type === 'current' ? 'SYNC ACTIVE' : ev.ghost ? 'STRATEGIC PROJECTION' : 'ARCHIVED'}
                </span>
              </div>
              <h4 className={`text-2xl font-black tracking-tighter mb-3 uppercase italic ${ev.ghost ? 'text-white/30' : 'text-white'}`}>
                {ev.label}
              </h4>
              <p className={`text-sm leading-relaxed font-bold italic ${ev.ghost ? 'text-white/20' : 'text-slate-400'}`}>
                {ev.description}
              </p>
            </div>

            {/* Impact score ring */}
            <div className="flex-shrink-0 text-center">
              <div className="relative w-16 h-16">
                <svg viewBox="0 0 64 64" className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                  <motion.circle
                    cx="32" cy="32" r="26"
                    fill="none"
                    stroke={ev.color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - ev.impact / 100) }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    filter="url(#mm-glow)"
                    style={{ filter: `drop-shadow(0 0 4px ${ev.color})` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-sm font-black text-white leading-none">{ev.impact}</p>
                  <p className="text-[5px] font-black text-slate-500 uppercase">INDEX</p>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics row */}
          <div className="mt-8 grid grid-cols-3 gap-4 relative z-10">
            {[
              { k: 'Variance', v: ev.metrics.variance === 0 ? 'Optimal' : `${ev.metrics.variance}ms` },
              { k: 'Fidelity', v: `${ev.metrics.fidelity}%` },
              { k: 'Nodes', v: ev.metrics.nodes },
            ].map(m => (
              <div key={m.k} className="p-4 bg-white/[0.02] rounded-2xl text-center border border-white/5">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2 italic">{m.k}</p>
                <p className="text-sm font-black italic" style={{ color: ev.ghost ? 'rgba(255,255,255,0.2)' : ev.color }}>{m.v}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => goTo(Math.max(0, active - 1))}
          disabled={active === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 disabled:opacity-20 transition-all"
        >
          <ChevronLeft size={12} /> Prev
        </button>
        <button
          onClick={() => goTo(Math.min(TIMELINE_EVENTS.length - 1, active + 1))}
          disabled={active === TIMELINE_EVENTS.length - 1}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-white/10 disabled:opacity-20 transition-all"
        >
          Next <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
