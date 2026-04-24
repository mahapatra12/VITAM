import { useState } from 'react';
import {
  Award,
  Download,
  FileCheck,
  Globe2,
  Landmark,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import { GlassCard, StatCard } from '../../components/ui/DashboardComponents';
import ActionDialog from '../../components/ui/ActionDialog';

const ACCREDITATION_CRITERIA = [
  { id: 'C1', title: 'Curricular Aspects', score: 3.8, status: 'Optimal' },
  { id: 'C2', title: 'Teaching and Evaluation', score: 3.6, status: 'Optimal' },
  { id: 'C3', title: 'Research and Innovation', score: 2.9, status: 'Progress' },
  { id: 'C4', title: 'Infrastructure and Learning', score: 4.0, status: 'Elite' },
  { id: 'C5', title: 'Student Support', score: 3.5, status: 'Optimal' }
];

const COMPLIANCE_LOGS = [
  { date: '22 Mar', title: 'BPUT Affiliation Review 2026', type: 'Affiliation', result: 'Compliant' },
  { date: '15 Mar', title: 'AICTE Mandatory Disclosure', type: 'Regulatory', result: 'Verified' },
  { date: '10 Mar', title: 'NAAC Cycle 2 Preparation', type: 'Accreditation', result: 'In Review' },
  { date: '04 Mar', title: 'UGC Governance Audit', type: 'Governance', result: 'Compliant' }
];

const statusTone = (status) => {
  if (status === 'Elite') {
    return 'border-blue-500/20 bg-blue-500/10 text-blue-200';
  }

  if (status === 'Optimal') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
  }

  return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
};

export default function Governance() {
  const { user } = useAuth();
  const { push } = useToast();
  const [showAuditConfirm, setShowAuditConfirm] = useState(false);

  const runAudit = () => {
    push({
      type: 'info',
      title: 'Governance audit initiated',
      body: 'The compliance run has been queued for the NAAC and regulatory review pipeline.'
    });
    setShowAuditConfirm(false);
  };

  return (
    <DashboardLayout title="Institutional Governance" role={user?.role || 'ADMIN'}>
      <WorkspaceHero
        eyebrow="Governance workspace"
        title="Compliance, accreditation, and audit control"
        description="Track accreditation criteria, compliance logs, and strategic governance actions from a clean production-grade oversight panel."
        icon={Landmark}
        badges={[
          'NAAC A+ active',
          'BPUT aligned',
          'Compliance stream healthy'
        ]}
        actions={[
          {
            label: 'Download report',
            icon: Download,
            tone: 'secondary',
            onClick: () => push({ type: 'success', title: 'Report prepared', body: 'Governance report export flow is ready.' })
          },
          {
            label: 'Run audit',
            icon: ShieldCheck,
            tone: 'primary',
            onClick: () => setShowAuditConfirm(true)
          }
        ]}
        stats={[
          { label: 'NAAC grade', value: 'A+' },
          { label: 'Criteria tracked', value: '5' },
          { label: 'Recruiter base', value: '40+' },
          { label: 'Campus scale', value: '36 acres' }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Governance summary
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Compliance posture is strong
            </h3>
            <div className="mt-6 space-y-3">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Highest score area
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Infrastructure and learning resources currently hold the strongest score across the accreditation matrix.
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Improvement area
                </p>
                <p className="mt-2 text-sm leading-6 text-amber-300">
                  Research and innovation score can improve through publication and grant-driven initiatives.
                </p>
              </div>
            </div>
          </div>
        )}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard title="Compliance Score" value="94.1%" icon={ShieldCheck} color="bg-emerald-500" trend="Verified" />
        <StatCard title="NAAC Rating" value="A+" icon={Award} color="bg-blue-500" trend="Current cycle" />
        <StatCard title="Audit Logs" value={String(COMPLIANCE_LOGS.length)} icon={FileCheck} color="bg-violet-500" trend="Tracked" />
        <StatCard title="Global Alignment" value="High" icon={Globe2} color="bg-amber-500" trend="Stable" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <GlassCard title="Accreditation criteria" subtitle="Cycle 2026 strategic scoring" icon={Sparkles}>
          <div className="space-y-4">
            {ACCREDITATION_CRITERIA.map((criterion) => (
              <div key={criterion.id} className="surface-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-white">
                      {criterion.id} / {criterion.title}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Accreditation metric
                    </p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${statusTone(criterion.status)}`}>
                    {criterion.status}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                    <span>Score</span>
                    <span>{criterion.score.toFixed(1)} / 4.0</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full border border-white/6 bg-slate-950/60">
                    <div
                      className={`h-full rounded-full ${
                        criterion.status === 'Elite'
                          ? 'bg-blue-500'
                          : criterion.status === 'Optimal'
                            ? 'bg-emerald-500'
                            : 'bg-amber-500'
                      }`}
                      style={{ width: `${(criterion.score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard title="Compliance timeline" subtitle="Recent governance events" icon={FileCheck}>
            <div className="space-y-3">
              {COMPLIANCE_LOGS.map((log) => (
                <div key={`${log.date}-${log.title}`} className="surface-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-black text-white">
                      {log.title}
                    </p>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                      {log.date}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.16em]">
                    <span className="text-slate-400">{log.type}</span>
                    <span className="text-emerald-300">{log.result}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Policy vault" subtitle="Regulatory access and controls" icon={ShieldCheck}>
            <div className="rounded-[1.8rem] border border-blue-500/20 bg-blue-500/10 p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-blue-200">
                Compliance layer active
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-100/95">
                BPUT, AICTE, and NAAC policy references can be attached here for centralized review and audit response workflows.
              </p>
              <button
                type="button"
                onClick={() => push({ type: 'info', title: 'Policy access ready', body: 'Governance policy vault can be wired to your document source.' })}
                className="btn-secondary mt-5"
              >
                Open policy vault
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      <ActionDialog
        open={showAuditConfirm}
        tone="info"
        title="Run governance audit"
        description="Confirm to start the institutional compliance audit for the current cycle."
        confirmLabel="Start audit"
        cancelLabel="Cancel"
        onConfirm={runAudit}
        onClose={() => setShowAuditConfirm(false)}
      >
        <div className="space-y-3">
          <div className="surface-card p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Scope
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              The run will evaluate accreditation criteria, regulatory disclosures, and the latest governance compliance logs.
            </p>
          </div>
          <div className="surface-card p-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Output
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-300">
              A structured governance summary with pending actions and score changes for leadership review.
            </p>
          </div>
        </div>
      </ActionDialog>
    </DashboardLayout>
  );
}
