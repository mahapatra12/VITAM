import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Brain,
  ChevronRight,
  GraduationCap,
  ShieldCheck,
  Target,
  TrendingUp,
  UserCheck,
  Zap
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
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
import api from '../../utils/api';

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 14 },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8', fontWeight: 700 }
};

const FALLBACK_DATA = {
  PREDICTION_DATA: [
    { month: 'Jan', graduation: 82, risk: 28 },
    { month: 'Feb', graduation: 84, risk: 26 },
    { month: 'Mar', graduation: 86, risk: 24 },
    { month: 'Apr', graduation: 90, risk: 21 },
    { month: 'May', graduation: 92, risk: 18 },
    { month: 'Jun', graduation: 94, risk: 16 }
  ],
  SKILL_RADAR: [
    { subject: 'Core Tech', A: 88 },
    { subject: 'Research', A: 76 },
    { subject: 'Communication', A: 81 },
    { subject: 'Industry Ready', A: 85 },
    { subject: 'Leadership', A: 72 }
  ],
  SUCCESS_METRICS: [
    { name: 'Placement Forecast', value: '92.4%', sub: '+4.2%' },
    { name: 'Graduation Probability', value: '94.1%', sub: '+3.1%' },
    { name: 'Research Velocity', value: '81.7%', sub: 'Stable' },
    { name: 'Retention Shield', value: '88.2%', sub: '+1.9%' }
  ],
  RISK_STUDENTS: [
    { name: 'A. Kumar', id: 'VTM-23091', factor: 'Attendance drift', risk: 'Critical' },
    { name: 'R. Das', id: 'VTM-22917', factor: 'Grade variance', risk: 'High' },
    { name: 'S. Nayak', id: 'VTM-23102', factor: 'Assignment backlog', risk: 'High' }
  ]
};

const METRIC_ICON_MAP = {
  'Placement Forecast': TrendingUp,
  'Graduation Probability': GraduationCap,
  'Research Velocity': Activity,
  'Retention Shield': ShieldCheck
};

const RISK_DISTRIBUTION_COLORS = {
  Critical: '#f43f5e',
  High: '#fb7185',
  Medium: '#f59e0b',
  Low: '#10b981'
};

const toRiskDistribution = (riskStudents = []) => {
  const counters = riskStudents.reduce((accumulator, student) => {
    const riskName = student.risk || 'Low';
    accumulator[riskName] = (accumulator[riskName] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(counters).map(([name, count]) => ({ name, count }));
};

export default function PredictiveAnalytics() {
  const { push } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(FALLBACK_DATA);
  const [selectedRisk, setSelectedRisk] = useState(null);

  const refreshForecast = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/predictive');
      const payload = response?.data || {};

      setData({
        PREDICTION_DATA: payload.PREDICTION_DATA || FALLBACK_DATA.PREDICTION_DATA,
        SKILL_RADAR: payload.SKILL_RADAR || FALLBACK_DATA.SKILL_RADAR,
        SUCCESS_METRICS: payload.SUCCESS_METRICS || FALLBACK_DATA.SUCCESS_METRICS,
        RISK_STUDENTS: payload.RISK_STUDENTS || FALLBACK_DATA.RISK_STUDENTS
      });

      push({
        type: 'success',
        title: 'Predictive layer refreshed',
        body: 'Forecast and risk intelligence synchronized successfully.'
      });
    } catch (error) {
      setData(FALLBACK_DATA);
      push({
        type: 'warning',
        title: 'Fallback forecast enabled',
        body: error?.response?.data?.msg || 'Live predictive feed is unavailable right now.'
      });
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    refreshForecast();
  }, [refreshForecast]);

  const riskDistribution = useMemo(
    () => toRiskDistribution(data.RISK_STUDENTS || []),
    [data.RISK_STUDENTS]
  );

  const confirmIntervention = () => {
    push({
      type: 'info',
      title: 'Intervention queued',
      body: `${selectedRisk?.name} was routed to mentoring and advisor workflows.`
    });
    setSelectedRisk(null);
  };

  return (
    <DashboardLayout title="Predictive Insights" role="ADMIN">
      <WorkspaceHero
        eyebrow="Predictive intelligence workspace"
        title="Student success forecasting and risk orchestration"
        description="Use AI-backed forecasts to detect risk signals early, align interventions, and keep graduation and placement outcomes on track."
        icon={Brain}
        badges={[
          loading ? 'Forecast syncing' : 'Forecast synchronized',
          'Intervention queue active',
          'Institutional model online'
        ]}
        actions={[
          {
            label: loading ? 'Syncing...' : 'Refresh forecast',
            icon: Zap,
            tone: 'primary',
            disabled: loading,
            onClick: refreshForecast
          }
        ]}
        stats={[
          { label: 'Model coverage', value: 'Full campus' },
          { label: 'Risk cases', value: String(data.RISK_STUDENTS?.length || 0) },
          { label: 'Forecast horizon', value: '6 months' },
          { label: 'Data confidence', value: 'High' }
        ]}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {(data.SUCCESS_METRICS || []).map((metric, index) => {
          const Icon = METRIC_ICON_MAP[metric.name] || TrendingUp;
          return (
            <StatCard
              key={metric.name || index}
              title={metric.name}
              value={metric.value}
              icon={Icon}
              color={index % 2 === 0 ? 'bg-blue-500' : 'bg-indigo-500'}
              trend={metric.sub}
            />
          );
        })}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard title="Success velocity forecast" subtitle="Graduation trajectory vs risk pressure" icon={TrendingUp}>
          <SafeChart className="mt-4" minHeight={300}>
            <AreaChart data={data.PREDICTION_DATA || []}>
              <defs>
                <linearGradient id="predictiveSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="predictiveRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="graduation" stroke="#3b82f6" strokeWidth={3} fill="url(#predictiveSuccess)" name="Success score" />
              <Area type="monotone" dataKey="risk" stroke="#f43f5e" strokeWidth={2.4} fill="url(#predictiveRisk)" name="Risk score" />
            </AreaChart>
          </SafeChart>
        </GlassCard>

        <GlassCard title="Competency matrix" subtitle="Institutional skill index" icon={Target}>
          <SafeChart className="mt-4" minHeight={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="78%" data={data.SKILL_RADAR || []}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
              <Radar name="Institution score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.28} />
              <Tooltip {...TOOLTIP_STYLE} />
            </RadarChart>
          </SafeChart>
        </GlassCard>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassCard title="At-risk intervention queue" subtitle="Priority students flagged for action" icon={AlertTriangle}>
          <div className="space-y-3">
            {(data.RISK_STUDENTS || []).length === 0 ? (
              <div className="surface-card p-5 text-sm text-slate-300">
                No active risk clusters right now. Monitoring remains active.
              </div>
            ) : (
              (data.RISK_STUDENTS || []).map((student) => (
                <div key={`${student.id}-${student.name}`} className="surface-card flex flex-wrap items-center justify-between gap-4 p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-blue-200">
                      <UserCheck size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{student.name}</p>
                      <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                        {student.id} / {student.factor}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${
                      student.risk === 'Critical'
                        ? 'border-rose-500/20 bg-rose-500/10 text-rose-300'
                        : 'border-amber-500/20 bg-amber-500/10 text-amber-200'
                    }`}>
                      {student.risk}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedRisk(student)}
                      className="btn-secondary"
                    >
                      Intervene
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>

        <GlassCard title="Risk distribution" subtitle="Current cohort spread by severity" icon={ShieldCheck}>
          <SafeChart className="mt-4" minHeight={320}>
            <BarChart data={riskDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {riskDistribution.map((entry) => (
                  <Cell
                    key={`risk-${entry.name}`}
                    fill={RISK_DISTRIBUTION_COLORS[entry.name] || '#60a5fa'}
                  />
                ))}
              </Bar>
            </BarChart>
          </SafeChart>
        </GlassCard>
      </div>

      <ActionDialog
        open={Boolean(selectedRisk)}
        tone="warning"
        title={selectedRisk ? `Intervention for ${selectedRisk.name}` : 'Intervention'}
        description="Confirm to launch mentoring and advisor workflow for this risk signal."
        confirmLabel="Launch intervention"
        cancelLabel="Cancel"
        onConfirm={confirmIntervention}
        onClose={() => setSelectedRisk(null)}
      >
        <div className="surface-card p-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
            Action summary
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            This action notifies academic mentors, creates a follow-up checkpoint, and flags the profile in the weekly intervention board.
          </p>
        </div>
      </ActionDialog>
    </DashboardLayout>
  );
}
