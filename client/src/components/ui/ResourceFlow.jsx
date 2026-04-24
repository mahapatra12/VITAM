import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const FLOW_NODES = [
  { id: 'CORE',     x: 360, y: 200, label: 'VITAM Core',  color: '#3b82f6', r: 28 },
  { id: 'FINANCE',  x: 100, y: 120, label: 'Finance',     color: '#10b981', r: 18 },
  { id: 'RESEARCH', x: 620, y: 120, label: 'Research',    color: '#a855f7', r: 18 },
  { id: 'INFRA',    x: 100, y: 280, label: 'Infra',       color: '#eab308', r: 16 },
  { id: 'ADMIT',    x: 620, y: 280, label: 'Admissions',  color: '#06b6d4', r: 16 },
  { id: 'PLACEM',   x: 250, y: 340, label: 'Placements',  color: '#f97316', r: 14 },
  { id: 'HR',       x: 470, y: 340, label: 'HR',          color: '#ec4899', r: 14 },
];

const FLOWS = [
  { from: 'CORE', to: 'FINANCE',  value: 42, label: '₹4.2Cr/h',  color: '#10b981' },
  { from: 'CORE', to: 'RESEARCH', value: 28, label: '₹2.8Cr/h',  color: '#a855f7' },
  { from: 'CORE', to: 'INFRA',    value: 18, label: '₹1.8Cr/h',  color: '#eab308' },
  { from: 'CORE', to: 'ADMIT',    value: 12, label: '₹1.2Cr/h',  color: '#06b6d4' },
  { from: 'FINANCE', to: 'PLACEM',value: 10, label: '₹1.0Cr/h',  color: '#f97316' },
  { from: 'RESEARCH',to: 'HR',    value: 8,  label: '₹0.8Cr/h',  color: '#ec4899' },
  { from: 'PLACEM', to: 'CORE',   value: 5,  label: 'ROI ↑',     color: '#64748b' },
];

function getXY(id) { return FLOW_NODES.find(n => n.id === id); }

function midPoint(a, b, curve = 0.3) {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.sqrt(dx*dx + dy*dy) || 1;
  return { cx: mx - dy * curve, cy: my + dx * curve };
}

export default function EnergyFlowMap({ condensed = false }) {
  const [pulseIdx, setPulseIdx] = useState(0);
  const [totals, setTotals] = useState({});

  useEffect(() => {
    const id = setInterval(() => setPulseIdx(p => (p + 1) % FLOWS.length), 600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t = {};
    FLOWS.forEach(f => {
      t[f.from] = (t[f.from] || 0) + f.value;
    });
    setTotals(t);
  }, []);

  const H = condensed ? 280 : 380;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-0.5">Autonomous Treasury Engine</p>
          <h3 className="text-lg font-black text-white tracking-tighter uppercase italic">Energy Flow Map</h3>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">₹10.8Cr Active Flow</span>
        </div>
      </div>

      <svg width="100%" viewBox={`0 0 720 ${H}`} className="overflow-visible">
        <defs>
          <filter id="ef-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {FLOWS.map(f => (
            <linearGradient key={f.from+f.to} id={`fg-${f.from}-${f.to}`} gradientUnits="userSpaceOnUse"
              x1={getXY(f.from).x} y1={getXY(f.from).y} x2={getXY(f.to).x} y2={getXY(f.to).y}>
              <stop offset="0%"   stopColor={getXY(f.from).color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={getXY(f.to).color}   stopOpacity="0.6" />
            </linearGradient>
          ))}
        </defs>

        {/* Grid */}
        <pattern id="efgrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1"/>
        </pattern>
        <rect width="720" height={H} fill="url(#efgrid)" rx="20" />

        {/* Flow paths (bezier) */}
        {FLOWS.map((flow, fi) => {
          const a = getXY(flow.from), b = getXY(flow.to);
          const { cx, cy } = midPoint(a, b);
          const pathId = `path-${fi}`;
          const active = pulseIdx === fi;
          const W = Math.max(1.5, flow.value * 0.12);
          const d = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;

          return (
            <g key={fi}>
              {/* Path definition for dot travel */}
              <path id={pathId} d={d} fill="none" />
              {/* Flow tube */}
              <path
                d={d}
                fill="none"
                stroke={`url(#fg-${flow.from}-${flow.to})`}
                strokeWidth={active ? W + 2 : W}
                strokeLinecap="round"
                opacity={active ? 0.9 : 0.3}
                filter={active ? 'url(#ef-glow)' : ''}
              />
              {/* Animated traversal dot */}
              <motion.circle
                r={active ? 5 : 3}
                fill={flow.color}
                filter="url(#ef-glow)"
                opacity={0.9}
                animate={{ cx: [a.x, cx, b.x], cy: [a.y, cy, b.y] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', delay: fi * 0.1 }}
              />
              {/* Label at midpoint */}
              <text x={cx} y={cy - 10} textAnchor="middle" fontSize="7" fontWeight="900"
                fill={flow.color} fontFamily="monospace" opacity={active ? 1 : 0.4}>
                {flow.label}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {FLOW_NODES.map(node => (
          <g key={node.id}>
            {/* Outer glow ring */}
            <motion.circle
              cx={node.x} cy={node.y} r={node.r + 8}
              fill="none"
              stroke={node.color}
              strokeWidth="0.8"
              animate={{ opacity: [0.1, 0.4, 0.1], r: [node.r + 6, node.r + 14, node.r + 6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Main */}
            <circle cx={node.x} cy={node.y} r={node.r}
              fill={`${node.color}18`} stroke={node.color} strokeWidth="1.5"
              filter="url(#ef-glow)"
            />
            {/* Flow indicator arc */}
            {totals[node.id] && (
              <circle cx={node.x} cy={node.y} r={node.r - 4}
                fill="none" stroke={node.color} strokeWidth="2" strokeOpacity="0.3"
                strokeDasharray={`${2 * Math.PI * (node.r - 4) * totals[node.id] / 50} ${2 * Math.PI * (node.r - 4)}`}
                transform={`rotate(-90 ${node.x} ${node.y})`}
              />
            )}
            <text x={node.x} y={node.y + node.r + 14} textAnchor="middle"
              fontSize="7" fontWeight="900" fill="rgba(255,255,255,0.6)"
              fontFamily="system-ui" letterSpacing="0.08em">
              {node.label}
            </text>
            <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="6"
              fontWeight="900" fill={node.color} fontFamily="monospace">
              {node.id.slice(0,4)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
