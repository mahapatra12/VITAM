import { motion } from 'framer-motion';

const HELIX_POINTS = 28; // number of rungs

export default function InstitutionalDNA({ className = '', animate = true }) {
  const width = 120;
  const height = 320;
  const cx = width / 2;
  const amplitude = 38;
  const phaseOffset = Math.PI / HELIX_POINTS;

  // Generate strand points
  const strand1 = [];
  const strand2 = [];
  const rungs   = [];

  for (let i = 0; i < HELIX_POINTS; i++) {
    const t = (i / (HELIX_POINTS - 1)) * Math.PI * 3; // 1.5 full turns
    const y = (i / (HELIX_POINTS - 1)) * height;
    const x1 = cx + Math.sin(t) * amplitude;
    const x2 = cx + Math.sin(t + Math.PI) * amplitude;
    strand1.push({ x: x1, y });
    strand2.push({ x: x2, y });
    rungs.push({ x1, x2, y, phase: t });
  }

  const toSvgPath = pts =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#eab308', '#ef4444', '#06b6d4'];

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-4 italic">Institutional Architecture</p>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="strand1grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#3b82f6" stopOpacity="0.8" />
            <stop offset="50%"  stopColor="#8b5cf6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="strand2grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#eab308" stopOpacity="0.7" />
            <stop offset="50%"  stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.7" />
          </linearGradient>
          <filter id="dna-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Strand 1 */}
        <motion.path
          d={toSvgPath(strand1)}
          fill="none"
          stroke="url(#strand1grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#dna-glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />

        {/* Strand 2 */}
        <motion.path
          d={toSvgPath(strand2)}
          fill="none"
          stroke="url(#strand2grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#dna-glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.3 }}
        />

        {/* Rungs (base pairs) */}
        {rungs.map((rung, i) => {
          const visible = Math.abs(Math.sin(rung.phase)) > 0.15;
          const opacity = Math.abs(Math.sin(rung.phase)) * 0.8;
          const color = COLORS[i % COLORS.length];
          return visible ? (
            <motion.g key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity }}
              transition={{ delay: 0.05 * i, duration: 0.4 }}
            >
              <line
                x1={rung.x1} y1={rung.y}
                x2={rung.x2} y2={rung.y}
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                filter="url(#dna-glow)"
              />
              {/* Base pair dots */}
              <circle cx={rung.x1} cy={rung.y} r="3" fill={color} opacity="0.9" />
              <circle cx={rung.x2} cy={rung.y} r="3" fill={COLORS[(i + 3) % COLORS.length]} opacity="0.9" />
            </motion.g>
          ) : null;
        })}

        {/* Animated traversal particle */}
        {animate && (
          <motion.circle
            r="4"
            fill="#ffffff"
            filter="url(#dna-glow)"
            animate={{
              cx: strand1.map(p => p.x),
              cy: strand1.map(p => p.y),
            }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
        )}
      </svg>
      <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] mt-3 italic">
        Core Model v4.0.1
      </p>
    </div>
  );
}
