import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap } from 'lucide-react';

const NEXT_EVAL_HOURS = 6; // hours until next singularity evaluation

export default function ChronoLock({ className = '' }) {
  const [remaining, setRemaining] = useState(NEXT_EVAL_HOURS * 3600);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(r => Math.max(0, r - 1));
      setPhase(p => (p + 1) % 360);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const pct = 1 - remaining / (NEXT_EVAL_HOURS * 3600);

  const R = 54;
  const C = 2 * Math.PI * R;
  const dash = C * pct;

  const urgency = pct > 0.85 ? '#ef4444' : pct > 0.6 ? '#eab308' : '#3b82f6';

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">Singularity Lock</p>
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Background ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
          {/* Progress arc */}
          <motion.circle
            cx="64" cy="64" r={R}
            fill="none"
            stroke={urgency}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${C - dash}`}
            style={{ filter: `drop-shadow(0 0 6px ${urgency})` }}
            animate={{ strokeDasharray: [`${dash} ${C - dash}`] }}
            transition={{ duration: 0.5 }}
          />
          {/* Tick marks */}
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const x1 = 64 + (R - 8) * Math.cos(a);
            const y1 = 64 + (R - 8) * Math.sin(a);
            const x2 = 64 + (R - 3) * Math.cos(a);
            const y2 = 64 + (R - 3) * Math.sin(a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
          })}
        </svg>

        {/* Center */}
        <div className="text-center relative z-10">
          <div className="flex items-center gap-1 justify-center mb-1">
            <Lock size={8} style={{ color: urgency }} />
            <span className="text-[6px] font-black uppercase tracking-widest" style={{ color: urgency }}>EVAL</span>
          </div>
          <p className="text-base font-black text-white font-mono leading-none tracking-tighter">
            {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
          </p>
          <p className="text-[5px] font-black text-slate-600 uppercase tracking-widest mt-1">
            {(pct * 100).toFixed(1)}% elapsed
          </p>
        </div>

        {/* Rotating satellite */}
        <motion.div
          className="absolute"
          style={{ width: '100%', height: '100%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="absolute w-3 h-3 rounded-full flex items-center justify-center"
            style={{ top: '4px', left: '50%', transform: 'translateX(-50%)', backgroundColor: `${urgency}30`, border: `1px solid ${urgency}` }}
          >
            <Zap size={6} style={{ color: urgency }} />
          </div>
        </motion.div>
      </div>
      <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest mt-3 text-center">
        Next Singularity Evaluation
      </p>
      <div className="mt-1.5 flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: urgency }} />
        <span className="text-[7px] font-black uppercase" style={{ color: urgency }}>
          {pct > 0.85 ? 'IMMINENT' : pct > 0.6 ? 'APPROACHING' : 'SCHEDULED'}
        </span>
      </div>
    </div>
  );
}
