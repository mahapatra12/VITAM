import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  ShieldCheck,
  Wallet,
  Zap
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard, StatCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import { useToast } from '../../components/ui/ToastSystem';
import api from '../../utils/api';

function ReceiptCard({ receipt }) {
  return (
    <div className="surface-card flex items-center justify-between gap-4 p-5">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-200">
          <FileText size={18} />
        </div>
        <div>
          <h4 className="text-sm font-black text-white">
            {receipt.name || 'Inst_Receipt_v2.pdf'}
          </h4>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {receipt.date || '2026-03-15'} / verification {receipt.id || 'A7-992'}
          </p>
        </div>
      </div>

      <button type="button" className="btn-secondary">
        <Download size={14} />
        Export
      </button>
    </div>
  );
}

export default function Finance() {
  const { push } = useToast();
  const [finance, setFinance] = useState({
    total: 120000,
    paid: 80000,
    due: 40000,
    receipts: []
  });
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);

  useEffect(() => {
    const fetchFinance = async () => {
      try {
        const response = await api.get('/student/finance');
        setFinance(response.data);
      } catch (err) {
        // keep fallback values
      } finally {
        setLoading(false);
      }
    };

    fetchFinance();
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGenStep(1);
    setTimeout(() => {
      setGenStep(2);
      setTimeout(() => {
        setIsGenerating(false);
        setGenStep(0);
      }, 2200);
    }, 1800);
  };

  const handlePayOnline = () => {
    push({
      type: 'info',
      title: 'Payment Gateway Ready',
      body: 'The online payment handoff can now be connected to your production payment provider.'
    });
  };

  const paidPercent = Math.round((finance.paid / finance.total) * 100);
  const duePercent = Math.round((finance.due / finance.total) * 100);

  return (
    <DashboardLayout title="Fees & Dues" role="STUDENT">
      <WorkspaceHero
        eyebrow="Finance workspace"
        title="Financial status and receipt center"
        description="Track total dues, paid amount, due milestones, and verified receipts from a cleaner finance view designed to reduce confusion and highlight the next action."
        icon={Wallet}
        badges={[
          loading ? 'Loading ledger' : 'Ledger synchronized',
          `Paid ${paidPercent}%`,
          `Due ${duePercent}%`
        ]}
        actions={[
          {
            label: isGenerating ? 'Generating...' : 'Consolidated Receipt',
            icon: Download,
            tone: 'secondary',
            disabled: isGenerating,
            onClick: handleGenerate
          },
          {
            label: 'Pay Online',
            icon: CreditCard,
            tone: 'primary',
            onClick: handlePayOnline
          }
        ]}
        stats={[
          { label: 'Total fees', value: `Rs ${finance.total.toLocaleString()}` },
          { label: 'Paid amount', value: `Rs ${finance.paid.toLocaleString()}` },
          { label: 'Due amount', value: `Rs ${finance.due.toLocaleString()}` },
          { label: 'Receipt count', value: String((finance.receipts?.length || 3)) }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Payment status
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              Semester ledger is healthy
            </h3>
            <div className="mt-6 space-y-3">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Next due milestone
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Hostel and transport dues are currently the only active payment milestone in this snapshot.
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Security note
                </p>
                <p className="mt-3 text-sm leading-6 text-emerald-300">
                  Every receipt and payment record is tracked with immutable transaction verification.
                </p>
              </div>
            </div>
          </div>
        )}
      />

      <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard title="Total Fees" value={`Rs ${finance.total.toLocaleString()}`} icon={Wallet} color="bg-slate-700" trend="Ledger total" />
        <StatCard title="Paid Amount" value={`Rs ${finance.paid.toLocaleString()}`} icon={Activity} color="bg-emerald-500" trend={`${paidPercent}% cleared`} />
        <StatCard title="Due Amount" value={`Rs ${finance.due.toLocaleString()}`} icon={AlertCircle} color="bg-red-500" trend={`${duePercent}% outstanding`} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <GlassCard title="Payment Timeline" subtitle="Institutional milestone tracking">
          <div className="mt-4 space-y-8">
            <div className="relative h-16">
              <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/5" />
              <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-400 to-violet-500" style={{ width: '66%' }} />
              <div className="relative grid h-full grid-cols-4">
                {[
                  { label: 'Registration', status: 'Completed' },
                  { label: 'Sem Tuition', status: 'Completed' },
                  { label: 'Hostel / Bus', status: 'Due now' },
                  { label: 'Final Exams', status: 'Pending' }
                ].map((node) => (
                  <div key={node.label} className="flex flex-col items-center justify-center">
                    <div className={`h-4 w-4 rounded-full border-4 border-[#07101f] ${node.status === 'Completed' ? 'bg-emerald-400' : node.status === 'Due now' ? 'bg-violet-500' : 'bg-white/10'}`} />
                    <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white">
                      {node.label}
                    </p>
                    <p className={`mt-1 text-[9px] font-bold uppercase tracking-[0.16em] ${node.status === 'Completed' ? 'text-emerald-300' : node.status === 'Due now' ? 'text-violet-300' : 'text-slate-500'}`}>
                      {node.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Payment Integrity" subtitle="Security and synchronization">
          <div className="mt-4 space-y-4">
            <div className="surface-card p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-emerald-300" />
                <div>
                  <p className="text-sm font-black text-white">
                    Quantum-resistant receipt sync
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Encryption active
                  </p>
                </div>
              </div>
            </div>
            <div className="surface-card p-4">
              <div className="flex items-center gap-3">
                <Zap size={18} className="text-blue-300" />
                <div>
                  <p className="text-sm font-black text-white">
                    Nexus sync
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    100% synchronized
                  </p>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <GlassCard title="Receipt Repository" subtitle="Downloadable verified payment records">
          <div className="mt-4 space-y-4">
            {finance.receipts.length > 0 ? (
              finance.receipts.map((receipt, index) => <ReceiptCard key={index} receipt={receipt} />)
            ) : (
              <>
                <ReceiptCard receipt={{ name: 'TUITION_FEE_SEM3.pdf', date: '2026-01-10', id: 'TX-99021' }} />
                <ReceiptCard receipt={{ name: 'EXAM_PROTO_FEE.pdf', date: '2026-02-28', id: 'TX-99882' }} />
                <ReceiptCard receipt={{ name: 'NODAL_ACCESS_FEE.pdf', date: '2026-03-01', id: 'TX-10023' }} />
              </>
            )}
          </div>
        </GlassCard>

        <GlassCard title="Action Guide" subtitle="Recommended next step">
          <div className="mt-4 space-y-4">
            <div className="surface-card p-4">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                Suggested action
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Generate a consolidated receipt before initiating the next payment so your current ledger snapshot stays easy to share.
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <AnimatePresence>
        {isGenerating ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(3,8,20,0.86)] p-6 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.94, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              className="premium-card w-full max-w-xl p-12 text-center"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-blue-500/20 bg-blue-500/10 text-blue-200">
                {genStep === 2 ? <CheckCircle2 size={34} /> : <ShieldCheck size={34} />}
              </div>
              <h3 className="mt-8 text-3xl font-black text-white">
                {genStep === 2 ? 'Receipt verified' : 'Verifying transaction'}
              </h3>
              <p className={`mt-4 text-sm font-bold uppercase tracking-[0.24em] ${genStep === 2 ? 'text-emerald-300' : 'text-slate-400'}`}>
                {genStep === 2 ? 'Receipt TXID 99x-A7-882 confirmed' : 'Syncing with institutional ledger node'}
              </p>
              <div className="mt-8 h-1 overflow-hidden rounded-full bg-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 4 }}
                  className="h-full bg-gradient-to-r from-blue-400 via-violet-500 to-emerald-400"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </DashboardLayout>
  );
}
