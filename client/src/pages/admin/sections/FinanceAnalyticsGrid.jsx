import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Activity,
  ArrowUpRight,
  FileSearch,
  Wallet
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/DashboardComponents';
import SafeChart from '../../../components/ui/SafeChart';

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 14 },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8', fontWeight: 700 }
};

const ledgerTone = (state) => {
  if (state === 'Verified' || state === 'Approved') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
  }
  if (state === 'Pending') {
    return 'border-amber-500/20 bg-amber-500/10 text-amber-200';
  }
  return 'border-white/12 bg-white/[0.05] text-slate-200';
};

export default function FinanceAnalyticsGrid({ data }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard title="Collection and dues trajectory" subtitle="Monthly treasury flow (Cr)" icon={Wallet}>
          <SafeChart className="mt-4" minHeight={300}>
            <AreaChart data={data.collectionData || []}>
              <defs>
                <linearGradient id="financeCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="financePending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={3} fill="url(#financeCollected)" name="Collected" />
              <Area type="monotone" dataKey="pending" stroke="#f43f5e" strokeWidth={2.4} fill="url(#financePending)" name="Pending" />
            </AreaChart>
          </SafeChart>
        </GlassCard>

        <GlassCard title="Revenue allocation mix" subtitle="Department distribution (%)" icon={ArrowUpRight}>
          <SafeChart className="mt-4" minHeight={300}>
            <PieChart>
              <Pie
                data={data.revenueByDept || []}
                dataKey="value"
                nameKey="name"
                innerRadius={72}
                outerRadius={102}
                paddingAngle={4}
                stroke="none"
              />
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </SafeChart>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassCard title="Spend category pressure" subtitle="Current category utilization" icon={Activity}>
          <SafeChart className="mt-4" minHeight={320}>
            <BarChart data={data.spendByCategory || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {(data.spendByCategory || []).map((entry, index) => (
                  <Cell key={`spend-${entry.name || index}`} fill={index % 2 === 0 ? '#3b82f6' : '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </SafeChart>
        </GlassCard>

        <GlassCard title="Finance operations ledger" subtitle="Recent verified transactions" icon={FileSearch}>
          <div className="space-y-3">
            {(data.recentLedger || []).map((entry) => (
              <div key={entry.id} className="surface-card flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-black text-white">{entry.title}</p>
                  <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                    {entry.id} / {entry.time}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-sm font-black text-slate-100">{entry.amount}</p>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${ledgerTone(entry.state)}`}>
                    {entry.state}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
