import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL_NODES = [
  { id: 'VITAM',    label: 'VITAM Core',      x: 400, y: 280, r: 28, color: '#3b82f6', group: 'core'    },
  { id: 'CSE',      label: 'CSE Dept',        x: 200, y: 140, r: 18, color: '#10b981', group: 'dept'    },
  { id: 'ECE',      label: 'ECE Dept',        x: 600, y: 140, r: 18, color: '#10b981', group: 'dept'    },
  { id: 'MECH',     label: 'MECH Dept',       x: 200, y: 420, r: 18, color: '#10b981', group: 'dept'    },
  { id: 'CIVIL',    label: 'CIVIL Dept',      x: 600, y: 420, r: 18, color: '#10b981', group: 'dept'    },
  { id: 'FINANCE',  label: 'Finance',         x: 110, y: 280, r: 16, color: '#eab308', group: 'admin'   },
  { id: 'RESEARCH', label: 'Research',        x: 690, y: 280, r: 16, color: '#a855f7', group: 'admin'   },
  { id: 'ADMIT',    label: 'Admissions',      x: 400, y: 100, r: 16, color: '#06b6d4', group: 'admin'   },
  { id: 'PLACEM',   label: 'Placements',      x: 400, y: 460, r: 16, color: '#f97316', group: 'admin'   },
  { id: 'AI_HUB',   label: 'AI Hub (2027)',   x: 330, y: 220, r: 12, color: '#ffffff', group: 'projected', ghost: true },
  { id: 'STRAT_LAB', label: 'Strategy Lab (2027)', x: 470, y: 340, r: 12, color: '#ffffff', group: 'projected', ghost: true },
];

const EDGES = [
  ['VITAM','CSE'],['VITAM','ECE'],['VITAM','MECH'],['VITAM','CIVIL'],
  ['VITAM','FINANCE'],['VITAM','RESEARCH'],['VITAM','ADMIT'],['VITAM','PLACEM'],
  ['CSE','RESEARCH'],['ECE','RESEARCH'],['FINANCE','PLACEM'],
  ['VITAM','AI_HUB'],['VITAM','STRAT_LAB'],['AI_HUB','STRAT_LAB'],
];

function useForceSimulation(initialNodes) {
  const [nodes, setNodes] = useState(initialNodes.map(n => ({ ...n, vx: 0, vy: 0 })));
  const frameRef = useRef(null);

  useEffect(() => {
    const tick = () => {
      setNodes(prev => {
        const next = prev.map(n => ({ ...n }));
        const W = 800, H = 560;

        // Repulsion between nodes
        for (let i = 0; i < next.length; i++) {
          for (let j = i + 1; j < next.length; j++) {
            const dx = next[j].x - next[i].x;
            const dy = next[j].y - next[i].y;
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;
            const force = 1800 / (dist * dist);
            next[i].vx -= (dx / dist) * force * 0.01;
            next[i].vy -= (dy / dist) * force * 0.01;
            next[j].vx += (dx / dist) * force * 0.01;
            next[j].vy += (dy / dist) * force * 0.01;
          }
        }

        // Spring attraction along edges
        EDGES.forEach(([a, b]) => {
          const ni = next.find(n => n.id === a);
          const nj = next.find(n => n.id === b);
          if (!ni || !nj) return;
          const dx = nj.x - ni.x;
          const dy = nj.y - ni.y;
          const dist = Math.sqrt(dx*dx + dy*dy) || 1;
          const target = 160;
          const force = (dist - target) * 0.03;
          ni.vx += (dx / dist) * force;
          ni.vy += (dy / dist) * force;
          nj.vx -= (dx / dist) * force;
          nj.vy -= (dy / dist) * force;
        });

        // Center gravity + dampen + clamp
        next.forEach(n => {
          if (n.id === 'VITAM') { n.x = W/2; n.y = H/2; n.vx = 0; n.vy = 0; return; }
          n.vx += (W/2 - n.x) * 0.002;
          n.vy += (H/2 - n.y) * 0.002;
          n.vx *= 0.88;
          n.vy *= 0.88;
          n.x = Math.max(n.r+4, Math.min(W-n.r-4, n.x + n.vx));
          n.y = Math.max(n.r+4, Math.min(H-n.r-4, n.y + n.vy));
        });

        return next;
      });
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return nodes;
}

export default function InstitutionalProjectMap() {
  const nodes = useForceSimulation(INITIAL_NODES);
  const [selected, setSelected] = useState(null);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setPulse(p => (p + 1) % EDGES.length), 800);
    return () => clearInterval(id);
  }, []);

  const getNode = id => nodes.find(n => n.id === id);

  return (
    <div className="relative w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1 italic">Institutional Architecture Grid</p>
          <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Strategic Project Map</h3>
        </div>
        <div className="flex items-center gap-4">
          {['core','dept','admin','projected'].map(g => {
            const color = g==='core'?'#3b82f6':g==='dept'?'#10b981':g==='admin'?'#eab308':'rgba(255,255,255,0.3)';
            return (
              <div key={g} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{g}</span>
              </div>
            );
          })}
        </div>
      </div>

      <svg width="100%" viewBox="0 0 800 560" className="overflow-visible">
        <defs>
          <filter id="mm-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="mm-glow-strong">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="3" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="rgba(59,130,246,0.3)" />
          </marker>
        </defs>

        {/* Background grid */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
        </pattern>
        <rect width="800" height="560" fill="url(#grid)" rx="32" />

        {/* Edges */}
        {EDGES.map(([a, b], i) => {
          const na = getNode(a), nb = getNode(b);
          if (!na || !nb) return null;
          const isActive = pulse === i;
          const isGhost = na.ghost || nb.ghost;
          return (
            <g key={`${a}-${b}`}>
              <line
                x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={isGhost ? 'rgba(255,255,255,0.06)' : isActive ? '#3b82f6' : 'rgba(59,130,246,0.12)'}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isGhost ? '4,4' : '0'}
                markerEnd={!isGhost ? "url(#arrowhead)" : ''}
                filter={isActive ? "url(#mm-glow)" : ''}
              />
              {/* Traveling pulse dot */}
              {isActive && (
                <motion.circle
                  r="3.5"
                  fill="#60a5fa"
                  filter="url(#mm-glow)"
                  animate={{ cx: [na.x, nb.x], cy: [na.y, nb.y] }}
                  transition={{ duration: 0.8, ease: 'linear' }}
                />
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(node => (
          <g
            key={node.id}
            onClick={() => setSelected(s => s === node.id ? null : node.id)}
            className="cursor-pointer"
          >
            {/* Outer glow ring for selected */}
            <AnimatePresence>
              {selected === node.id && (
                <motion.circle
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.3, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  cx={node.x} cy={node.y} r={node.r + 12}
                  fill="none"
                  stroke={node.color}
                  strokeWidth="2"
                  filter="url(#mm-glow-strong)"
                />
              )}
            </AnimatePresence>
            {/* Main circle */}
            <circle
              cx={node.x} cy={node.y} r={node.r}
              fill={node.ghost ? 'rgba(255,255,255,0.03)' : `${node.color}15`}
              stroke={node.color}
              strokeWidth={node.ghost ? 1 : 1.5}
              strokeDasharray={node.ghost ? '4,4' : '0'}
              filter={selected === node.id ? "url(#mm-glow)" : ''}
              className="transition-all duration-300"
            />
            {/* Label */}
            <text
              x={node.x} y={node.y + node.r + 18}
              textAnchor="middle"
              fontSize={node.id === 'VITAM' ? 10 : 8}
              fontWeight="900"
              fill={node.ghost ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)'}
              fontFamily="system-ui"
              letterSpacing="0.1em"
              textTransform="uppercase"
              className="italic"
            >
              {node.label}
            </text>
            {/* Node ID inside circle */}
            <text
              x={node.x} y={node.y + (node.id === 'VITAM' ? 4 : 3)}
              textAnchor="middle"
              fontSize={node.id === 'VITAM' ? 8 : 6}
              fontWeight="900"
              fill={node.ghost ? 'rgba(255,255,255,0.15)' : node.color}
              fontFamily="monospace"
              className="italic"
            >
              {node.id.slice(0,4)}
            </text>
          </g>
        ))}

        {/* Central pulse ring on VITAM */}
        {nodes.filter(n => n.id === 'VITAM').map(n => (
          <motion.circle
            key="vitam-pulse"
            cx={n.x} cy={n.y} r={n.r}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.5"
            animate={{ r: [n.r, n.r + 35], opacity: [0.3, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
      </svg>

      {/* Selected node info panel */}
      {selected && (() => {
        const node = nodes.find(n => n.id === selected);
        if (!node) return null;
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="mt-6 p-6 bg-black/60 border border-white/10 rounded-[2rem] backdrop-blur-2xl shadow-2xl"
          >
            <div className="flex items-center gap-4">
               <div className="w-4 h-4 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: node.color }} />
               <p className="text-sm font-black text-white uppercase tracking-[0.2em] italic">{node.label}</p>
               <span className="text-[10px] font-black text-slate-600 uppercase ml-auto tracking-widest italic">{node.group} node</span>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-4">
              {[
                { k: 'Sync Status', v: node.ghost ? 'PROJECTED' : 'NOMINAL' },
                { k: 'Operational Load', v: node.ghost ? '0%' : '24%' },
                { k: 'Variance Trace', v: node.ghost ? 'N/A' : '0.02ms' },
              ].map(item => (
                <div key={item.k} className="text-center p-4 bg-white/[0.03] border border-white/5 rounded-2xl">
                  <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest italic mb-2">{item.k}</p>
                  <p className="text-xs font-black text-white italic tracking-tight">{item.v}</p>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}
