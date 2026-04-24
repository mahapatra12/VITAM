import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { BarChart3, Brain } from 'lucide-react';
import { GlassCard } from '../../../components/ui/DashboardComponents';

const PERFORMANCE_DATA = [
  { time: '08:00', load: 30, retention: 95 },
  { time: '10:00', load: 65, retention: 88 },
  { time: '12:00', load: 85, retention: 70 },
  { time: '14:00', load: 45, retention: 92 },
  { time: '16:00', load: 70, retention: 85 }
];

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 12,
    backdropFilter: 'blur(16px)'
  },
  itemStyle: { color: '#e2e8f0', fontSize: 12, fontWeight: 700 },
  labelStyle: {
    color: '#64748b',
    fontWeight: 800,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: '0.1em'
  }
};

export default function StudentAnalyticsSection() {
  return (
    <GlassCard title="Institutional Analytics" subtitle="Academic workload and retention metrics" icon={BarChart3}>
      <div className="mt-4 flex flex-col gap-12 md:flex-row">
        <div className="h-[280px] flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PERFORMANCE_DATA}>
              <defs>
                <linearGradient id="loadG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="load" name="Academic Workload" stroke="#10b981" strokeWidth={4} fill="url(#loadG)" dot={false} />
              <Area type="monotone" dataKey="retention" name="Retention" stroke="#2563eb" strokeWidth={4} fill="transparent" strokeDasharray="8 8" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="w-full space-y-6 md:w-96">
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 border-l-[8px] border-l-blue-600 bg-[#050505] p-10 shadow-2xl">
            <div className="absolute right-0 top-0 p-6 opacity-10 transition-transform group-hover:rotate-12">
              <Brain size={48} className="text-blue-500" />
            </div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.5em] text-slate-600">
              Strategic Recommendation
            </p>
            <p className="text-lg font-black uppercase leading-tight tracking-tighter text-blue-500">
              "Retentive capacity at 85.2%. Operational recess recommended to optimize next module sync."
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/5 border-l-[6px] border-l-emerald-600 bg-slate-950 p-8 shadow-2xl">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
              Placement Readiness Index
            </p>
            <p className="text-4xl font-black tracking-tighter text-emerald-400">
              92.4%
            </p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
              Institutional Tier 1 Qualification
            </p>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
