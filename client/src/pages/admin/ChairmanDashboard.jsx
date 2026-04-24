import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Award,
  BarChart3,
  Brain,
  DollarSign,
  Globe,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import ActionDialog from '../../components/ui/ActionDialog';
import SafeChart from '../../components/ui/SafeChart';
import { useToast } from '../../components/ui/ToastSystem';

const REVENUE_TREND = [
  { month: 'Jan', revenue: 1.2, expense: 0.8 },
  { month: 'Feb', revenue: 1.5, expense: 0.9 },
  { month: 'Mar', revenue: 1.1, expense: 1.1 },
  { month: 'Apr', revenue: 1.8, expense: 0.95 },
  { month: 'May', revenue: 2.1, expense: 1.0 },
  { month: 'Jun', revenue: 1.9, expense: 1.2 }
];

const HEALTH_SCORE_DATA = [
  { name: 'Healthy', value: 88, fill: '#10b981' },
  { name: 'Buffer', value: 12, fill: '#1e293b' }
];

const DIRECTIVES = [
  { label: 'Institutional Health Audit', description: 'Review finance, academic, and placement health together.', icon: ShieldCheck },
  { label: 'Strategic Funding Push', description: 'Prioritize high-growth academic and infrastructure lanes.', icon: DollarSign },
  { label: 'Global Partnership Drive', description: 'Expand recruiter, alumni, and innovation partnerships.', icon: Globe },
  { label: 'Placement Excellence Sprint', description: 'Boost hiring readiness and employer conversion velocity.', icon: Target }
];

const EXECUTIVE_FEED = [
  'Finance team finalized March disbursement verification.',
  'Placement office closed 4 new recruiter conversations this cycle.',
  'Academic board approved the next quality improvement review.',
  'Infrastructure team flagged one lab expansion for accelerated funding.'
];

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 16 },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8', fontWeight: 700 }
};

export default function ChairmanDashboard() {
  const { push } = useToast();
  const [pendingDirective, setPendingDirective] = useState(null);
  const [feedIndex, setFeedIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFeedIndex((current) => (current + 1) % EXECUTIVE_FEED.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const currentFeed = useMemo(() => EXECUTIVE_FEED[feedIndex], [feedIndex]);

  const handleDirectiveConfirm = () => {
    push({
      type: 'success',
      title: 'Executive directive synchronized',
      body: `${pendingDirective} has been staged for leadership review and downstream execution.`
    });
    setPendingDirective(null);
  };

  return (
    <DashboardLayout title="Executive Operations" role="CHAIRMAN">
      <WorkspaceHero
        eyebrow="Chairman workspace"
        title="Executive oversight and institutional momentum"
        description="Monitor financial strength, growth velocity, academic quality, and strategic directives from a cleaner leadership dashboard built for fast top-level decisions."
        icon={Award}
        badges={[
          'Leadership review active',
          'Institutional health 88%',
          'Placement growth +12%'
        ]}
        actions={[
          {
            label: 'Run health audit',
            icon: ShieldCheck,
            tone: 'secondary',
            onClick: () => setPendingDirective('Institutional Health Audit')
          },
          {
            label: 'Issue directive',
            icon: Zap,
            tone: 'primary',
            onClick: () => setPendingDirective('Strategic Funding Push')
          }
        ]}
        stats={[
          { label: 'Revenue', value: 'Rs 12.4 Cr' },
          { label: 'Enrollment', value: '4,250' },
          { label: 'Placement avg', value: 'Rs 6.5 LPA' },
          { label: 'Reputation', value: 'NAAC A+' }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Executive pulse
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              The institution is in a growth cycle
            </h3>
            <div className="mt-6 space-y-3">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Immediate focus
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Fee collection variance and recruiter growth are the two best leverage points for the next leadership sprint.
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  AI brief
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-300">
                  Strategic analysis recommends higher alignment between funding, placement outcomes, and ranking visibility.
                </p>
              </div>
            </div>
          </div>
        )}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard title="Institutional Revenue" value="Rs 12.4 Cr" icon={DollarSign} color="bg-blue-500" trend="+15% projected" />
        <StatCard title="Enrollment Growth" value="4,250" icon={Users} color="bg-indigo-500" trend="+8% annualized" />
        <StatCard title="Placement Matrix" value="Rs 6.5 LPA" icon={TrendingUp} color="bg-emerald-500" trend="+12% gain" />
        <StatCard title="Reputation" value="NAAC A+" icon={Award} color="bg-amber-500" trend="Tier-1 status" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <GlassCard title="Revenue and expense momentum" subtitle="Six-month executive finance view" icon={BarChart3}>
          <SafeChart className="mt-4" minHeight={290}>
            <AreaChart data={REVENUE_TREND}>
              <defs>
                <linearGradient id="chairmanRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.34} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="chairmanExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#chairmanRevenue)" strokeWidth={3} />
              <Area type="monotone" dataKey="expense" stroke="#10b981" fill="url(#chairmanExpense)" strokeWidth={3} />
            </AreaChart>
          </SafeChart>
        </GlassCard>

        <GlassCard title="Institutional health" subtitle="Current executive score" icon={ShieldCheck}>
          <div className="relative mt-4 flex h-[290px] items-center justify-center">
            <SafeChart minHeight={290}>
              <PieChart>
                <Pie
                  data={HEALTH_SCORE_DATA}
                  dataKey="value"
                  innerRadius={72}
                  outerRadius={96}
                  stroke="none"
                  startAngle={90}
                  endAngle={-270}
                />
                <Tooltip {...TOOLTIP_STYLE} />
              </PieChart>
            </SafeChart>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">88%</span>
              <span className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                health index
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard title="Executive summary" subtitle="AI strategic brief" icon={Brain}>
          <div className="rounded-[1.6rem] border border-blue-500/18 bg-blue-500/8 p-5">
            <p className="text-sm leading-7 text-slate-200">
              Strategic analysis indicates strong institutional momentum. The fastest path to visible improvement is tighter fee settlement, recruiter conversion, and ranking-focused academic storytelling.
            </p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              { label: 'Priority one', value: 'Revenue variance' },
              { label: 'Priority two', value: 'Employer growth' }
            ].map((item) => (
              <div key={item.label} className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-black text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="Strategic directives" subtitle="Leadership actions and command feed" icon={Target}>
          <div className="grid gap-4 md:grid-cols-2">
            {DIRECTIVES.map((directive) => (
              <button
                key={directive.label}
                type="button"
                onClick={() => setPendingDirective(directive.label)}
                className="surface-card flex items-start gap-4 p-5 text-left transition-all hover:border-blue-500/20 hover:bg-blue-500/6"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-blue-200">
                  <directive.icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">
                    {directive.label}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {directive.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-[1.6rem] border border-white/8 bg-slate-950/45 p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Live executive feed
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              {currentFeed}
            </p>
          </div>
        </GlassCard>
      </div>

      <ActionDialog
        open={Boolean(pendingDirective)}
        tone="info"
        title={pendingDirective || 'Executive directive'}
        description="Confirm this leadership action so it can be pushed into the strategic workflow."
        confirmLabel="Authorize directive"
        cancelLabel="Cancel"
        onConfirm={handleDirectiveConfirm}
        onClose={() => setPendingDirective(null)}
      >
        <div className="space-y-3">
          <div className="surface-card p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Authorization scope
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              This action will be captured as a leadership directive and staged for operational execution review.
            </p>
          </div>
          <div className="surface-card p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Expected outcome
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-300">
              Teams receive a cleaner action signal with less dashboard clutter and lower execution ambiguity.
            </p>
          </div>
        </div>
      </ActionDialog>
    </DashboardLayout>
  );
}
