import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarCheck2,
  Database,
  Globe,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Zap,
  ArrowRight
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import ActionDialog from '../../components/ui/ActionDialog';
import { useToast } from '../../components/ui/ToastSystem';

const PERFORMANCE_TREND = [
  { quarter: 'Q1', target: 92, actual: 91 },
  { quarter: 'Q2', target: 94, actual: 95 },
  { quarter: 'Q3', target: 88, actual: 88 },
  { quarter: 'Q4', target: 98, actual: 97 },
  { quarter: 'Current', target: 99, actual: 99.2 }
];

const DEPARTMENT_HEALTH = [
  { name: 'CSE', score: 92 },
  { name: 'ECE', score: 81 },
  { name: 'MECH', score: 76 },
  { name: 'CIVIL', score: 78 },
  { name: 'MBA', score: 86 }
];

const STRATEGIC_ACTIONS = [
  {
    label: 'Resource Efficiency',
    detail: 'Rebalance faculty and lab load across departments.',
    icon: Zap
  },
  {
    label: 'Infrastructure Audit',
    detail: 'Run safety, compliance, and facility readiness checks.',
    icon: ShieldCheck
  },
  {
    label: 'Department Sync',
    detail: 'Align attendance and quality performance initiatives.',
    icon: Activity
  },
  {
    label: 'Analytics Refresh',
    detail: 'Recompute executive metrics and trend confidence.',
    icon: Database
  }
];

const TOOLTIP_STYLE = {
  contentStyle: { 
    backgroundColor: 'rgba(15, 32, 39, 0.9)', 
    border: '1px solid rgba(255, 255, 255, 0.1)', 
    borderRadius: 16, 
    backdropFilter: 'blur(10px)' 
  },
  itemStyle: { color: '#ffffff', fontWeight: 600, fontSize: 12 },
  labelStyle: { color: '#00c6ff', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 10 }
};

export default function DirectorDashboard() {
  const { push } = useToast();
  const [pendingAction, setPendingAction] = useState(null);
  const [fidelity, setFidelity] = useState(3.5);

  const projectedRoi = useMemo(() => `Rs ${(fidelity * 12.4).toFixed(1)} Cr`, [fidelity]);
  const riskScore = useMemo(() => `${(100 - fidelity * 7).toFixed(1)}%`, [fidelity]);

  const confirmAction = () => {
    push({
      type: 'success',
      title: 'Action Synchronized',
      body: `${pendingAction} is queued for execution.`
    });
    setPendingAction(null);
  };

  return (
    <DashboardLayout title="Executive Operations" role="DIRECTOR">
      <WorkspaceHero
        eyebrow="Director Operational Hub"
        title="Institutional Control & Predictive Command"
        description="Monitor departmental health, strategic performance, and resource optimization through a resilient v27.4 glassmorphism interface designed for high-fidelity governance."
        icon={Globe}
        badges={['Sync 99.2%', '5 Regions Monitored', 'AI Stream Active']}
        actions={[
          {
            label: 'Trigger Resource Sync',
            icon: Zap,
            tone: 'primary',
            onClick: () => setPendingAction('Resource Efficiency')
          }
        ]}
        stats={[
          { label: 'Live Classes', value: '124' },
          { label: 'Attendance', value: '89.5%' },
          { label: 'Utilization', value: '92%' }
        ]}
        aside={(
          <GlassCard className="h-full bg-white/[0.02]">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#00c6ff]">Executive Alert</p>
            <h3 className="mt-4 text-3xl font-bold text-white italic leading-tight">Attendance Intervention Required</h3>
            <div className="mt-8 space-y-4">
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5">
                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Priority Dept</p>
                <p className="mt-2 text-sm text-white/70 italic">MECH operations show 76% health variance. Mentor sync recommended.</p>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
                <div>
                   <p className="text-[9px] font-black uppercase tracking-widest text-[#10b981]">Confidence</p>
                   <p className="mt-1 text-xl font-bold text-white">98.4%</p>
                </div>
                <div className="w-10 h-10 rounded-full border border-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                   <ShieldCheck size={20} />
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      />

      <div className="mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Institutional Sync" value="99.2%" icon={Activity} color="#00c6ff" trend="Stable" />
        <StatCard title="Resource Load" value="92%" icon={Zap} color="#10b981" trend="Optimized" />
        <StatCard title="Risk Threshold" value="1.2" icon={AlertTriangle} color="#f59e0b" trend="Safe" />
        <StatCard title="Active Nodes" value="124" icon={Users} color="#0072ff" trend="Live" />
      </div>

      <div className="mb-10 grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
        <GlassCard title="Strategic Performance Curve" subtitle="Institutional Growth Trajectory" icon={BarChart3}>
          <div className="h-[350px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE_TREND}>
                <defs>
                   <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00c6ff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00c6ff" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} domain={[80, 100]} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} />
                <Tooltip {...TOOLTIP_STYLE} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="target" stroke="#00c6ff" strokeWidth={3} fillOpacity={1} fill="url(#colorTarget)" />
                <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Departmental Vitality" subtitle="Live Operational Health" icon={Users}>
          <div className="h-[350px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_HEALTH}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} />
                 <Tooltip {...TOOLTIP_STYLE} />
                 <Bar dataKey="score" radius={[12, 12, 0, 0]}>
                    {DEPARTMENT_HEALTH.map((entry, index) => (
                      <cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00c6ff' : '#0072ff'} />
                    ))}
                 </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="mb-10 grid grid-cols-1 xl:grid-cols-2 gap-8">
        <GlassCard title="Predictive Hub" subtitle="High-Fidelity AI Forecasting" icon={Sparkles}>
          <div className="space-y-8">
             <div>
                <div className="flex justify-between items-center mb-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Model Fidelity</p>
                   <span className="px-3 py-1 bg-[#00c6ff]/10 text-[#00c6ff] text-[10px] font-black rounded-lg">x{fidelity.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="1" max="10" step="0.5" value={fidelity} 
                  onChange={(e) => setFidelity(parseFloat(e.target.value))}
                  className="w-full accent-[#00c6ff] h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer"
                />
             </div>
             <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Forecast Reliability', value: '94.2%' },
                  { label: 'System Risk Score', value: riskScore },
                  { label: 'Data Points Monitored', value: `${Math.round(fidelity * 12500).toLocaleString()}` },
                  { label: 'Projected Economic Impact', value: projectedRoi }
                ].map(item => (
                  <div key={item.label} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 group hover:border-[#00c6ff]/30 transition-all">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30 group-hover:text-[#00c6ff]">{item.label}</p>
                    <p className="mt-2 text-xl font-bold text-white italic">{item.value}</p>
                  </div>
                ))}
             </div>
          </div>
        </GlassCard>

        <GlassCard title="Strategic Action Center" subtitle="Institutional Directives" icon={Target}>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STRATEGIC_ACTIONS.map(action => (
                <button 
                  key={action.label}
                  onClick={() => setPendingAction(action.label)}
                  className="flex flex-col p-6 rounded-2xl bg-white/[0.03] border border-white/5 text-left group hover:bg-[#00c6ff]/10 hover:border-[#00c6ff]/30 transition-all"
                >
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-[#00c6ff] group-hover:bg-[#00c6ff]/10 transition-all mb-4">
                      <action.icon size={20} />
                   </div>
                   <p className="text-[13px] font-bold text-white italic mb-1 uppercase tracking-tighter">{action.label}</p>
                   <p className="text-[10px] text-white/40 leading-relaxed font-black uppercase tracking-tighter">{action.detail}</p>
                </button>
              ))}
           </div>
        </GlassCard>
      </div>

      <ActionDialog
        open={Boolean(pendingAction)}
        title={pendingAction}
        description="Verify this executive directive for operational deployment."
        onConfirm={confirmAction}
        onClose={() => setPendingAction(null)}
      />
    </DashboardLayout>
  );
}
