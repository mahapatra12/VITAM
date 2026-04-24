import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, Search, AlertCircle, CheckCircle2 } from 'lucide-react';

const METRICS = ['Institutional Attendance', 'Revenue Streams', 'Research Output', 'Resource Efficiency'];

function generateStream(len = 40) {
  const base = 75 + Math.random() * 15;
  return Array.from({ length: len }, (_, i) => {
    const noise = (Math.random() - 0.5) * 16;
    // inject random anomalies
    const spike = Math.random() < 0.07 ? (Math.random() > 0.5 ? 40 : -40) : 0;
    return Math.max(5, Math.min(100, base + noise + spike));
  });
}

const COLORS = { 
  'Institutional Attendance': '#3b82f6', 
  'Revenue Streams': '#10b981', 
  'Research Output': '#a855f7', 
  'Resource Efficiency': '#eab308' 
};

function Sparkline({ data, color, width = 340, height = 70, anomalyThreshold = 22 }) {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const maxV = Math.max(...data);
  const minV = Math.min(...data);
  const range = maxV - minV || 1;

  const pt = (v, i) => `${(i / (data.length - 1)) * width},${height - ((v - minV) / range) * (height - 8) - 4}`;
  const polyline = data.map((v, i) => pt(v, i)).join(' ');

  const anomalies = data
    .map((v, i) => ({ v, i, isAnomaly: Math.abs(v - mean) > anomalyThreshold }))
    .filter(p => p.isAnomaly);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="anomaly-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <polygon
        points={`0,${height} ${polyline} ${width},${height}`}
        fill={`url(#sg-${color.slice(1)})`}
      />
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {(() => {
        const y = height - ((mean - minV) / range) * (height - 8) - 4;
        return (
          <line x1={0} y1={y} x2={width} y2={y}
            stroke={color} strokeWidth="1" strokeDasharray="4,4" opacity="0.4" />
        );
      })()}

      {anomalies.map(({ v, i }) => {
        const [px, py] = pt(v, i).split(',').map(Number);
        return (
          <g key={i} filter="url(#anomaly-glow)">
            <circle cx={px} cy={py} r={6} fill={v > mean ? '#fbbf24' : '#60a5fa'} opacity={0.6} />
            <line x1={px} y1={0} x2={px} y2={height}
              stroke={v > mean ? '#fbbf24' : '#60a5fa'} strokeWidth="1" opacity="0.3"
              strokeDasharray="4,4" />
          </g>
        );
      })}
    </svg>
  );
}

export default function AnomalyDetector() {
  const [streams, setStreams] = useState(() =>
    Object.fromEntries(METRICS.map(m => [m, generateStream()]))
  );
  const [anomalyCounts, setAnomalyCounts] = useState({});
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const recompute = (newStreams) => {
    const counts = {};
    METRICS.forEach(m => {
      const d = newStreams[m];
      const mean = d.reduce((a, b) => a + b, 0) / d.length;
      counts[m] = d.filter(v => Math.abs(v - mean) > 22).length;
    });
    setAnomalyCounts(counts);
  };

  useEffect(() => { recompute(streams); }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setStreams(prev => {
        const next = {};
        METRICS.forEach(m => {
          const old = prev[m];
          const newVal = Math.max(5, Math.min(100, old[old.length - 1] + (Math.random() - 0.5) * 18 + (Math.random() < 0.07 ? (Math.random() > 0.5 ? 38 : -38) : 0)));
          next[m] = [...old.slice(1), newVal];
        });
        recompute(next);
        setLastUpdated(new Date());
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const totalAnomalies = Object.values(anomalyCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] mb-1 italic">Institutional Security Sync</p>
          <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Operational Variance Trace</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-500 ${totalAnomalies > 3 ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]' : 'bg-blue-500/10 border-blue-500/20'}`}>
            <Activity size={14} className={totalAnomalies > 3 ? 'text-amber-500 animate-pulse' : 'text-blue-500'} />
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] italic ${totalAnomalies > 3 ? 'text-amber-500' : 'text-blue-400'}`}>
              {totalAnomalies} Variance Events
            </span>
          </div>
          <span className="text-[8px] font-mono text-slate-600 italic uppercase">{lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {METRICS.map(metric => {
          const data = streams[metric];
          const mean = data.reduce((a, b) => a + b, 0) / data.length;
          const current = data[data.length - 1];
          const delta = current - mean;
          const color = COLORS[metric];
          const anomalies = anomalyCounts[metric] || 0;

          return (
            <motion.div
              key={metric}
              className={`p-6 rounded-[2.5rem] border transition-all duration-700 ${anomalies > 0 ? 'border-amber-500/20 bg-amber-500/[0.02]' : 'border-white/5 bg-white/[0.01]'}`}
              animate={{ borderColor: anomalies > 2 ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic mb-1">{metric}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black italic tracking-tighter" style={{ color }}>{current.toFixed(1)}%</span>
                    <span className={`text-[10px] font-black ${delta >= 0 ? 'text-emerald-500' : 'text-amber-500'} italic`}>
                      {delta >= 0 ? '+' : ''}{delta.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {anomalies > 0 && (
                    <motion.div
                      animate={{ opacity: [1, 0.6, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl"
                    >
                      <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest italic">{anomalies} Variance Spike{anomalies > 1 ? 's' : ''}</p>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex justify-center py-2">
                <Sparkline data={data} color={color} width={340} height={70} />
              </div>

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                <span className="text-[8px] font-mono text-slate-600 italic">MEAN_REF: {mean.toFixed(1)}</span>
                <div className="flex items-center gap-2">
                   {anomalies === 0 ? <CheckCircle2 size={10} className="text-emerald-500/50" /> : <AlertCircle size={10} className="text-amber-500/50" />}
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] italic">
                     {anomalies === 0 ? 'SYNC ACTIVE' : anomalies < 3 ? 'MONITORING' : 'VARIANCE ALERT'}
                   </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
