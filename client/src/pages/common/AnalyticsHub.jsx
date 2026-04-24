import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, BarChart2, Users, Zap, RefreshCw, Download, ArrowUpRight, Brain } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';

// Pure SVG Sparkline — no external dependency required
function Sparkline({ data, color = '#3b82f6', height = 60 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200;
  const h = height;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`g-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#g-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Live dot at end */}
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - ((data[data.length-1] - min) / range) * (h - 8) - 4} r="3.5" fill={color} className="animate-pulse" />
    </svg>
  );
}

const ROLE_KPI_CONFIG = {
  STUDENT: {
    kpis: [
      { label: 'Attendance Rate', value: 94.2, unit: '%', trend: +1.2, color: '#10b981' },
      { label: 'CGPA Index', value: 8.7, unit: '/10', trend: +0.3, color: '#3b82f6' },
      { label: 'Pending Assignments', value: 3, unit: '', trend: -2, color: '#f59e0b' },
      { label: 'Library Credits', value: 480, unit: 'pts', trend: +60, color: '#8b5cf6' },
    ]
  },
  FACULTY: {
    kpis: [
      { label: 'Classes Delivered', value: 142, unit: '', trend: +8, color: '#10b981' },
      { label: 'Avg Student Score', value: 78.4, unit: '%', trend: +2.1, color: '#3b82f6' },
      { label: 'Assignments Graded', value: 319, unit: '', trend: +24, color: '#f59e0b' },
      { label: 'Satisfaction Score', value: 4.8, unit: '/5', trend: +0.1, color: '#8b5cf6' },
    ]
  },
  HOD: {
    kpis: [
      { label: 'Dept Attendance', value: 89.1, unit: '%', trend: +0.8, color: '#10b981' },
      { label: 'Faculty Efficiency', value: 92.4, unit: '%', trend: +1.5, color: '#3b82f6' },
      { label: 'Syllabus Coverage', value: 87.3, unit: '%', trend: -1.2, color: '#f59e0b' },
      { label: 'Research Output', value: 14, unit: 'papers', trend: +3, color: '#8b5cf6' },
    ]
  },
  ADMIN: {
    kpis: [
      { label: 'Campus Uptime', value: 99.97, unit: '%', trend: +0.01, color: '#10b981' },
      { label: 'Active Sessions', value: 1842, unit: '', trend: +234, color: '#3b82f6' },
      { label: 'Incidents Today', value: 2, unit: '', trend: -5, color: '#f59e0b' },
      { label: 'System Load', value: 34.8, unit: '%', trend: -11, color: '#8b5cf6' },
    ]
  },
  FINANCE: {
    kpis: [
      { label: 'Fee Collection', value: 94.1, unit: '%', trend: +3.2, color: '#10b981' },
      { label: 'Pending Amount', value: 8.4, unit: 'L', trend: -2.1, color: '#3b82f6' },
      { label: 'Budget Utilized', value: 71.2, unit: '%', trend: +5.4, color: '#f59e0b' },
      { label: 'Revenue This Mo', value: 42.6, unit: 'L', trend: +8.1, color: '#8b5cf6' },
    ]
  },
  PARENT: {
    kpis: [
      { label: "Ward Attendance", value: 91.0, unit: '%', trend: +2.0, color: '#10b981' },
      { label: "Latest Score", value: 82.5, unit: '%', trend: +4.3, color: '#3b82f6' },
      { label: "Fee Due", value: 0, unit: 'INR', trend: 0, color: '#f59e0b' },
      { label: "Library Visits", value: 8, unit: 'this mo', trend: +3, color: '#8b5cf6' },
    ]
  },
};

function generateTimeSeries(base, len = 20, variance = 10) {
  let v = base;
  return Array.from({ length: len }, () => {
    v = Math.max(0, v + (Math.random() - 0.48) * variance);
    return parseFloat(v.toFixed(1));
  });
}

function KPICard({ kpi, index }) {
  const [series, setSeries] = useState(() => generateTimeSeries(kpi.value));
  const isPositive = kpi.trend >= 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setSeries(prev => {
        const newVal = Math.max(0, prev[prev.length - 1] + (Math.random() - 0.48) * (kpi.value * 0.05));
        return [...prev.slice(1), parseFloat(newVal.toFixed(1))];
      });
    }, 2000 + index * 300);
    return () => clearInterval(interval);
  }, [kpi.value, index]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="relative overflow-hidden rounded-3xl bg-[#080808] border border-white/5 hover:border-white/10 transition-colors group"
    >
      <div className="absolute inset-x-0 bottom-0 h-24 opacity-30 pointer-events-none">
        <Sparkline data={series} color={kpi.color} height={96} />
      </div>

      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{kpi.label}</p>
          <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full ${isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isPositive ? '+' : ''}{kpi.trend}{kpi.unit}
          </span>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-black text-white tracking-tight" style={{ textShadow: `0 0 40px ${kpi.color}60` }}>
            {series[series.length - 1]}
          </span>
          <span className="text-sm font-bold text-slate-500 mb-1">{kpi.unit}</span>
        </div>
      </div>
    </motion.div>
  );
}

function LiveBarGraph({ title, data, color }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <GlassCard className="h-full">
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
          <BarChart2 size={14} className="text-indigo-400" /> {title}
        </h3>
        <RefreshCw size={12} className="text-slate-600 animate-spin" style={{ animationDuration: '3s' }} />
      </div>
      <div className="p-5 space-y-3">
        {data.map((item, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>{item.label}</span>
              <span style={{ color }}>{item.value}{item.unit || ''}</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / max) * 100}%` }}
                transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${color}80, ${color})`, boxShadow: `0 0 8px ${color}60` }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export default function AnalyticsHub() {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';
  const config = ROLE_KPI_CONFIG[role] || ROLE_KPI_CONFIG['STUDENT'];
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setLastRefresh(new Date()), 5000);
    return () => clearInterval(t);
  }, []);

  const barData = [
    { label: 'Mon', value: Math.floor(Math.random() * 40) + 60, unit: '%' },
    { label: 'Tue', value: Math.floor(Math.random() * 40) + 60, unit: '%' },
    { label: 'Wed', value: Math.floor(Math.random() * 40) + 55, unit: '%' },
    { label: 'Thu', value: Math.floor(Math.random() * 40) + 65, unit: '%' },
    { label: 'Fri', value: Math.floor(Math.random() * 40) + 50, unit: '%' },
  ];

  return (
    <DashboardLayout title="Strategic Analytics Hub" role={role}>
      <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase leading-none">
            <Activity size={40} className="text-rose-600" />
            Strategic Analytics Hub
          </h2>
          <p className="text-slate-400 font-bold mt-4 max-w-2xl italic text-lg leading-relaxed uppercase tracking-widest text-[10px]">
             Real-time strategic metrics for <span className="text-white font-black">{role}</span> identity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 bg-white/[0.02] rounded-2xl border border-white/10 text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-3 italic">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            Live · {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <button className="px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-500/20 transition-all italic shadow-xl">
            <Download size={14} /> Export Strategic CSV
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {config.kpis.map((kpi, i) => <KPICard key={kpi.label} kpi={kpi} index={i} />)}
      </div>

      {/* Lower Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GlassCard>
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2 italic">
                <Brain size={16} className="text-purple-500" /> Strategic Intelligence Feed
              </h3>
              <ArrowUpRight size={18} className="text-slate-700" />
            </div>
            <div className="p-6 space-y-4">
              {[
                { insight: `${role === 'STUDENT' ? 'Attendance trending up +4% this semester' : role === 'FACULTY' ? 'Your class avg is 8% above department median' : 'Department efficiency above college benchmark'}`, type: 'positive', icon: TrendingUp },
                { insight: `${role === 'FINANCE' ? 'Fee defaulters reduced by 12 accounts this week' : 'System detected optimal peak usage: 10AM–12PM'}`, type: 'info', icon: Zap },
                { insight: `Predictive models forecast ${Math.floor(Math.random() * 15) + 85}% operational efficiency for next semester`, type: 'neutral', icon: Brain },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-start gap-4 p-5 rounded-3xl bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${item.type === 'positive' ? 'bg-emerald-500/10 text-emerald-400' : item.type === 'info' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-purple-500/10 text-purple-400'}`}>
                    <item.icon size={16} />
                  </div>
                  <p className="text-sm text-slate-400 font-bold leading-relaxed italic uppercase tracking-wider mt-1">{item.insight}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div>
          <LiveBarGraph
            title="Weekly Activity Status"
            data={barData}
            color="#6366f1"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
