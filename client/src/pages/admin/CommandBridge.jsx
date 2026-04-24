import { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  Bot,
  Cpu,
  Globe,
  Radar,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  RadarChart,
  Radar as RadarPlot,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import DashboardLayout from '../../layouts/DashboardLayout';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import ActionDialog from '../../components/ui/ActionDialog';
import { GlassCard, StatCard } from '../../components/ui/DashboardComponents';
import SafeChart from '../../components/ui/SafeChart';
import { useToast } from '../../components/ui/ToastSystem';

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 14 },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8', fontWeight: 700 }
};

const LAYERS = ['Neural', 'Infra', 'Finance', 'Governance'];

const SIGNAL_TREND = [
  { tick: '09:00', confidence: 88, response: 72 },
  { tick: '10:00', confidence: 91, response: 74 },
  { tick: '11:00', confidence: 90, response: 78 },
  { tick: '12:00', confidence: 93, response: 81 },
  { tick: '13:00', confidence: 95, response: 83 },
  { tick: '14:00', confidence: 94, response: 85 }
];

const VARIANCE_RADAR = [
  { subject: 'Governance', A: 92, fullMark: 100 },
  { subject: 'Resilience', A: 88, fullMark: 100 },
  { subject: 'Latency', A: 84, fullMark: 100 },
  { subject: 'Coverage', A: 95, fullMark: 100 },
  { subject: 'Integrity', A: 93, fullMark: 100 }
];

const COMMAND_LOG = [
  { node: 'Director Lane', action: 'Infrastructure readiness sync', status: 'Completed' },
  { node: 'Chairman Lane', action: 'Funding variance review', status: 'Queued' },
  { node: 'Finance Lane', action: 'Treasury anomaly guard', status: 'Running' },
  { node: 'Governance Lane', action: 'Compliance trace checkpoint', status: 'Completed' }
];

const statusTone = (status) => {
  if (status === 'Completed') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
  }
  if (status === 'Running') {
    return 'border-blue-500/20 bg-blue-500/10 text-blue-200';
  }
  return 'border-amber-500/20 bg-amber-500/10 text-amber-200';
};

export default function CommandBridge() {
  const { push } = useToast();
  const [activeLayer, setActiveLayer] = useState(LAYERS[0]);
  const [selectedCommand, setSelectedCommand] = useState(null);

  const bridgeHealth = useMemo(() => {
    const confidence = SIGNAL_TREND[SIGNAL_TREND.length - 1]?.confidence || 0;
    return `${confidence}%`;
  }, []);

  const runCommand = () => {
    push({
      type: 'success',
      title: 'Command dispatched',
      body: `${selectedCommand?.label || 'Directive'} is now propagating through the ${activeLayer} layer.`
    });
    setSelectedCommand(null);
  };

  return (
    <DashboardLayout title="Command Bridge" role="ADMIN">
      <WorkspaceHero
        eyebrow="Executive command bridge"
        title="Multi-layer orchestration for strategic operations"
        description="Coordinate infrastructure, governance, and response signals from a single resilient command surface built for production reliability."
        icon={Cpu}
        badges={[
          `${activeLayer} layer active`,
          'Directive pipeline online',
          `Bridge health ${bridgeHealth}`
        ]}
        actions={[
          {
            label: 'Run synchronization',
            icon: Zap,
            tone: 'primary',
            onClick: () => setSelectedCommand({ label: 'Global synchronization' })
          }
        ]}
        stats={[
          { label: 'Active layers', value: String(LAYERS.length) },
          { label: 'Signal confidence', value: bridgeHealth },
          { label: 'Queued directives', value: '3' },
          { label: 'Command latency', value: '12 ms' }
        ]}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard title="Bridge Health" value={bridgeHealth} icon={ShieldCheck} color="bg-emerald-500" trend="Stable" />
        <StatCard title="Neural Confidence" value="94%" icon={Bot} color="bg-blue-500" trend="+2.1%" />
        <StatCard title="Directive Throughput" value="128/hr" icon={Activity} color="bg-indigo-500" trend="Optimized" />
        <StatCard title="Global Reach" value="4 Lanes" icon={Globe} color="bg-amber-500" trend="Linked" />
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        {LAYERS.map((layer) => (
          <button
            key={layer}
            type="button"
            onClick={() => setActiveLayer(layer)}
            className={`rounded-2xl border px-4 py-2 text-[10px] font-extrabold uppercase tracking-[0.22em] transition-all ${
              layer === activeLayer
                ? 'border-blue-500/30 bg-blue-500/12 text-blue-200'
                : 'border-white/10 bg-white/[0.03] text-slate-400 hover:text-white'
            }`}
          >
            {layer}
          </button>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <GlassCard title="Signal confidence stream" subtitle="Live command confidence and response index" icon={Sparkles}>
          <SafeChart className="mt-4" minHeight={300}>
            <AreaChart data={SIGNAL_TREND}>
              <defs>
                <linearGradient id="bridgeConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bridgeResponse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="tick" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="confidence" stroke="#3b82f6" strokeWidth={3} fill="url(#bridgeConfidence)" />
              <Area type="monotone" dataKey="response" stroke="#10b981" strokeWidth={2.4} fill="url(#bridgeResponse)" />
            </AreaChart>
          </SafeChart>
        </GlassCard>

        <GlassCard title="Layer variance radar" subtitle="Cross-layer resilience profile" icon={Radar}>
          <SafeChart className="mt-4" minHeight={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="78%" data={VARIANCE_RADAR}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <RadarPlot dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.32} />
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </SafeChart>
        </GlassCard>
      </div>

      <GlassCard title="Directive queue" subtitle="Current bridge execution state" icon={ArrowRight}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {COMMAND_LOG.map((entry) => (
            <button
              key={`${entry.node}-${entry.action}`}
              type="button"
              onClick={() => setSelectedCommand({ label: entry.action })}
              className="surface-card flex items-start justify-between gap-4 p-4 text-left transition-all hover:border-blue-500/20 hover:bg-blue-500/6"
            >
              <div>
                <p className="text-sm font-black text-white">{entry.node}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{entry.action}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${statusTone(entry.status)}`}>
                {entry.status}
              </span>
            </button>
          ))}
        </div>
      </GlassCard>

      <ActionDialog
        open={Boolean(selectedCommand)}
        tone="info"
        title={selectedCommand?.label || 'Command'}
        description={`Confirm to execute this directive across the ${activeLayer} command layer.`}
        confirmLabel="Execute command"
        cancelLabel="Cancel"
        onConfirm={runCommand}
        onClose={() => setSelectedCommand(null)}
      >
        <div className="surface-card p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
            Dispatch policy
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            The command is logged with trace metadata for governance review and operational rollback visibility.
          </p>
        </div>
      </ActionDialog>
    </DashboardLayout>
  );
}
