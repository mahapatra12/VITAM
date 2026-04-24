import { useMemo, useState } from 'react';
import {
  Award,
  Brain,
  Download,
  DollarSign,
  Globe,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import { GlassCard, StatCard } from '../../components/ui/DashboardComponents';
import ActionDialog from '../../components/ui/ActionDialog';

const INSTITUTIONAL_KPIS = [
  { label: 'Annual Revenue', value: 'Rs 42.8 Cr', trend: '+12%', icon: DollarSign, color: 'bg-emerald-500' },
  { label: 'Placement Velocity', value: '92.4%', trend: '+5%', icon: Target, color: 'bg-indigo-500' },
  { label: 'Student Satisfaction', value: '4.8/5', trend: '+0.2', icon: Award, color: 'bg-amber-500' },
  { label: 'Operational Efficiency', value: '96%', trend: '+2%', icon: Settings, color: 'bg-blue-500' }
];

const DEPARTMENT_GRADES = [
  { department: 'Computer Science', grade: 'A+' },
  { department: 'Mechanical Engineering', grade: 'B' },
  { department: 'Research Cell', grade: 'A' },
  { department: 'Placement Hub', grade: 'S' }
];

const FINANCIAL_UNITS = [
  { label: 'Fees Collected', value: 'Rs 28.4 Cr', progress: 88, color: 'bg-emerald-500' },
  { label: 'Grant Utilization', value: 'Rs 4.2 Cr', progress: 45, color: 'bg-blue-500' },
  { label: 'Scholarship Outgo', value: 'Rs 1.8 Cr', progress: 12, color: 'bg-amber-500' }
];

export default function ExecutiveCommand() {
  const { user } = useAuth();
  const { push } = useToast();
  const [advisorInput, setAdvisorInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Institutional vitals are currently stable. Strategic upside is strongest in alumni engagement and recruiter diversification.'
    }
  ]);
  const [pendingAction, setPendingAction] = useState(null);

  const handleAdvisorSend = () => {
    const trimmed = advisorInput.trim();
    if (!trimmed) {
      return;
    }

    setMessages((previous) => [...previous, { role: 'user', text: trimmed }]);
    setAdvisorInput('');

    setTimeout(() => {
      setMessages((previous) => [
        ...previous,
        {
          role: 'ai',
          text: 'Strategic recommendation: shift focused funding toward placement readiness and innovation outputs for the next cycle.'
        }
      ]);
    }, 900);
  };

  const latestInsight = useMemo(() => {
    const aiMessages = messages.filter((message) => message.role === 'ai');
    return aiMessages[aiMessages.length - 1]?.text || '';
  }, [messages]);

  const confirmAction = () => {
    push({
      type: 'success',
      title: 'Executive action submitted',
      body: `${pendingAction} has been added to the leadership action stream.`
    });
    setPendingAction(null);
  };

  return (
    <DashboardLayout title="Executive Command" role={user?.role || 'CHAIRMAN'}>
      <WorkspaceHero
        eyebrow="Command workspace"
        title="Institutional pulse and strategic command"
        description="Drive high-level decisions, monitor core KPIs, and coordinate AI-assisted governance actions from a resilient executive control surface."
        icon={Brain}
        badges={[
          'Executive sync online',
          'Strategic AI active',
          'Board review mode'
        ]}
        actions={[
          {
            label: 'Download audit',
            icon: Download,
            tone: 'secondary',
            onClick: () => push({ type: 'info', title: 'Audit export ready', body: 'Executive audit export can now be generated from this workspace.' })
          },
          {
            label: 'Broadcast directive',
            icon: Zap,
            tone: 'primary',
            onClick: () => setPendingAction('Broadcast strategic directive')
          }
        ]}
        stats={[
          { label: 'Revenue', value: 'Rs 42.8 Cr' },
          { label: 'Placement', value: '92.4%' },
          { label: 'Satisfaction', value: '4.8/5' },
          { label: 'Efficiency', value: '96%' }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Strategic insight
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Leadership momentum is positive
            </h3>
            <div className="mt-6 space-y-3">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  AI recommendation
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {latestInsight}
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Priority lane
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-300">
                  Pair recruiter acceleration with tighter scholarship governance to keep strategic outcomes balanced.
                </p>
              </div>
            </div>
          </div>
        )}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {INSTITUTIONAL_KPIS.map((item) => (
          <StatCard
            key={item.label}
            title={item.label}
            value={item.value}
            icon={item.icon}
            color={item.color}
            trend={item.trend}
          />
        ))}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassCard title="Department health grades" subtitle="Leadership overview matrix" icon={ShieldCheck}>
          <div className="space-y-3">
            {DEPARTMENT_GRADES.map((item) => (
              <div key={item.department} className="surface-card flex items-center justify-between p-4">
                <p className="text-sm font-black text-white">
                  {item.department}
                </p>
                <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] text-blue-200">
                  {item.grade}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.6rem] border border-indigo-500/20 bg-indigo-500/10 p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-indigo-200">
              Global reach
            </p>
            <p className="mt-2 text-2xl font-black text-white">
              450+ Alumni Hiring Partners
            </p>
            <p className="mt-2 text-sm leading-7 text-indigo-100/85">
              Expansion-ready leadership map for employer and alumni channels.
            </p>
          </div>
        </GlassCard>

        <GlassCard title="Strategic AI advisor" subtitle="Executive conversation stream" icon={Sparkles}>
          <div className="flex h-[360px] flex-col rounded-[1.6rem] border border-white/8 bg-slate-950/45 p-4">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === 'ai'
                      ? 'border border-white/10 bg-white/[0.04] text-slate-200'
                      : 'bg-blue-600 text-white'
                  }`}>
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={advisorInput}
                onChange={(event) => setAdvisorInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleAdvisorSend();
                  }
                }}
                placeholder="Ask for a strategic recommendation..."
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-400/40 focus:outline-none"
              />
              <button type="button" onClick={handleAdvisorSend} className="btn-primary">
                <Send size={14} />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard title="Financial velocity nodes" subtitle="Leadership finance distribution" icon={TrendingUp}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FINANCIAL_UNITS.map((item) => (
            <div key={item.label} className="surface-card p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                {item.label}
              </p>
              <p className="mt-3 text-2xl font-black text-white">
                {item.value}
              </p>
              <div className="mt-4 h-2 overflow-hidden rounded-full border border-white/8 bg-slate-900">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.progress}%` }} />
              </div>
              <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                {item.progress}% active
              </p>
            </div>
          ))}
        </div>
      </GlassCard>

      <ActionDialog
        open={Boolean(pendingAction)}
        tone="info"
        title={pendingAction || 'Executive action'}
        description="Confirm to push this command into the executive workflow."
        confirmLabel="Authorize"
        cancelLabel="Cancel"
        onConfirm={confirmAction}
        onClose={() => setPendingAction(null)}
      >
        <div className="space-y-3">
          <div className="surface-card p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Action impact
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              The directive will be shared with governance, operations, and finance channels for coordinated execution.
            </p>
          </div>
          <div className="surface-card p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Governance trace
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-300">
              A command log entry will be created for audit and board-level traceability.
            </p>
          </div>
        </div>
      </ActionDialog>
    </DashboardLayout>
  );
}
