import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Globe, Shield, Cpu, Activity, TrendingUp } from 'lucide-react';

const NODES = [
  { id: 'FISCAL', icon: TrendingUp, color: '#10b981', angle: 0 },
  { id: 'INFRA',  icon: Cpu,        color: '#3b82f6', angle: 90 },
  { id: 'ADMIT',  icon: Globe,       color: '#a855f7', angle: 180 },
  { id: 'SECURE', icon: Shield,      color: '#eab308', angle: 270 },
];

export default function StrategicOrchestration() {
  const [isActive, setIsActive] = useState(false);
  const [syncStatus, setSyncStatus] = useState('STANDBY');
  const [convergence, setConvergence] = useState(0);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      setSyncStatus('SYNCING');
      setConvergence(0);
      intervalRef.current = setInterval(() => {
        setConvergence(prev => {
          const next = Math.min(100, prev + Math.random() * 3 + 1);
          if (next >= 100) setSyncStatus('OPTIMAL');
          return next;
        });
        setTick(t => t + 1);
      }, 180);
    } else {
      clearInterval(intervalRef.current);
      setConvergence(0);
      setSyncStatus('STANDBY');
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const RADIUS = 52;

  return (
    <div className={`fixed bottom-8 right-24 z-[200] select-none transition-all duration-700 ${isActive ? 'scale-105' : ''}`}>
      {/* Main institutional layout */}
      <div className={`flex items-center gap-5 px-6 py-4 rounded-[28px] backdrop-blur-3xl border transition-all duration-700 ${
        isActive
          ? 'bg-blue-950/80 border-blue-500/50 shadow-[0_0_60px_rgba(59,130,246,0.25)]'
          : 'bg-black/70 border-white/10 shadow-2xl'
      }`}>

        {/* Orbit ring with 4 nodes */}
        <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
          <div className="absolute inset-0 bg-blue-500/5 rounded-full" />

          {/* System tunnel vortex */}
          <div className="absolute inset-2 border border-white/5 rounded-full" />

          {/* Orbit rings */}
          <div className={`absolute inset-1 orbit-sync-ring ${isActive ? 'opacity-100' : 'opacity-30'}`} />
          <div className={`absolute inset-4 orbit-sync-ring [animation-delay:1.5s] ${isActive ? 'opacity-70' : 'opacity-10'}`} />

          {/* 4 orbiting nodes */}
          {NODES.map((node) => {
            const rad = ((node.angle + (isActive ? tick * 1.2 : 0)) % 360) * (Math.PI / 180);
            const x = Math.cos(rad) * RADIUS * 0.44 + 50;
            const y = Math.sin(rad) * RADIUS * 0.44 + 50;
            return (
              <div
                key={node.id}
                className="absolute w-6 h-6 rounded-full flex items-center justify-center transition-all duration-100"
                style={{
                  left: `${x}%`, top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: `${node.color}20`,
                  border: `1px solid ${node.color}60`,
                  boxShadow: isActive ? `0 0- 10px ${node.color}80` : 'none',
                }}
              >
                <node.icon size={10} style={{ color: node.color }} />
              </div>
            );
          })}

          {/* Center core */}
          <button
            onClick={() => setIsActive(a => !a)}
            className={`relative z-10 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              isActive
                ? 'bg-blue-600 shadow-[0_0_24px_#2563eb]'
                : 'bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
          >
            <Zap size={18} className={isActive ? 'text-white animate-pulse' : 'text-slate-400'} />
          </button>
        </div>

        {/* Status panel */}
        <div className="flex flex-col gap-2 min-w-[160px]">
          <div>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-0.5 italic">Strategic Grid</p>
            <p className={`text-sm font-black tracking-tighter transition-colors duration-500 ${
              syncStatus === 'OPTIMAL' ? 'text-emerald-400' :
              syncStatus === 'SYNCING'     ? 'text-blue-400' :
              'text-white/40'
            }`}>{syncStatus} MODE</p>
          </div>

          {/* Convergence bar */}
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest italic">Convergence</p>
              <p className="text-[7px] font-black text-blue-400 italic">{convergence.toFixed(1)}%</p>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-150"
                style={{ width: `${convergence}%` }}
              />
            </div>
          </div>

          {/* Node status row */}
          <div className="flex items-center gap-1.5 mt-1">
            {NODES.map(node => (
              <div key={node.id} className="flex flex-col items-center gap-0.5">
                <div
                  className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: isActive ? node.color : '#334155',
                    boxShadow: isActive ? `0 0 6px ${node.color}` : 'none',
                  }}
                />
                <span className="text-[5px] font-black text-slate-600 uppercase italic">{node.id.slice(0,3)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sync arc ring (right side) */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className={`w-12 h-12 flex items-center justify-center transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-20'}`}>
            <Activity size={16} className={isActive ? 'text-blue-400' : 'text-slate-600'} />
          </div>
          <p className="text-[6px] font-black text-slate-600 uppercase tracking-widest italic">STRAT SYNC</p>
        </div>
      </div>

      {/* Live telemetry feed popup when active */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-3 left-0 right-0 p-4 bg-black/90 border border-blue-500/20 rounded-2xl backdrop-blur-2xl"
          >
            <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2 italic">
               <Globe size={9} /> Live Architecture Telemetry
            </p>
            <div className="space-y-2">
              {NODES.map((node, i) => (
                <div key={node.id} className="flex items-center gap-3">
                  <span className="text-[7px] font-black uppercase w-12 italic" style={{ color: node.color }}>{node.id}</span>
                  <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: ['30%', '90%', '55%', '80%'] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: node.color }}
                    />
                  </div>
                  <span className="text-[6px] font-mono text-slate-500 w-8 text-right italic">{(Math.random()*5+10).toFixed(1)}ms</span>
                </div>
              ))}
            </div>
            <p className="text-[6px] font-mono text-slate-600 mt-1.5 tracking-tighter uppercase italic">
              {syncStatus === 'OPTIMAL' ? 'ALL NODES SYNCHRONIZED · OPERATIONAL FIDELITY ACHIEVED' : 'SYNCING INSTITUTIONAL LEDGER...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
