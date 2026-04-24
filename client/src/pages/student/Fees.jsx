import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Lock,
  QrCode,
  Receipt,
  RefreshCw,
  Shield,
  Wallet,
  Zap
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard, StatCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import { useToast } from '../../components/ui/ToastSystem';
import api from '../../utils/api';
import {
  DEFAULT_FINANCE,
  DEFAULT_PORTAL_DATA,
  buildFinanceLedger,
  normalizePortalData
} from '../../utils/studentPortalData';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Card' },
  { id: 'bank', label: 'Net Banking' }
];

const UPI_APPS = ['GPay', 'PhonePe', 'Paytm', 'BHIM'];

function DaysCountdown({ dueDate }) {
  const days = Math.ceil((new Date(dueDate) - new Date()) / 86400000);

  return (
    <span className={`rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] ${
      days <= 7 ? 'border-rose-500/20 bg-rose-500/10 text-rose-300' : 'border-amber-500/20 bg-amber-500/10 text-amber-300'
    }`}>
      {days > 0 ? `${days}d left` : 'Overdue'}
    </span>
  );
}

function PaymentModal({ item, onClose, onSuccess }) {
  const { push } = useToast();
  const [step, setStep] = useState('form');
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });

  const handlePay = async () => {
    setStep('processing');
    await new Promise((resolve) => setTimeout(resolve, 1800));
    setStep('success');
    onSuccess?.(item);
    push({
      type: 'success',
      title: 'Payment successful',
      body: `Rs ${item.amount.toLocaleString()} for "${item.desc}" has been confirmed.`
    });
    setTimeout(onClose, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(3,8,20,0.78)] p-4 backdrop-blur-2xl"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        onClick={(event) => event.stopPropagation()}
        className="premium-card w-full max-w-lg overflow-hidden p-0"
      >
        <div className="border-b border-white/6 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                Secure payment
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">
                {item.desc}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-300 transition-all hover:text-white"
            >
              Close
            </button>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-[1.8rem] border border-violet-500/20 bg-violet-500/10 p-5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-violet-200">
              Amount payable
            </p>
            <p className="mt-3 text-4xl font-black text-white">
              Rs {item.amount.toLocaleString()}
            </p>
            <p className="mt-2 flex items-center gap-2 text-sm text-violet-100/85">
              <Shield size={14} />
              Encrypted payment flow
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 pb-6">
              <div className="mb-5 flex gap-2">
                {PAYMENT_METHODS.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setMethod(entry.id)}
                    className={method === entry.id ? 'btn-primary flex-1 justify-center' : 'btn-secondary flex-1 justify-center'}
                  >
                    {entry.label}
                  </button>
                ))}
              </div>

              {method === 'upi' ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {UPI_APPS.map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setUpiId(`${app.toLowerCase()}@upi`)}
                        className={upiId.startsWith(app.toLowerCase()) ? 'btn-primary' : 'btn-secondary'}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                  <input
                    value={upiId}
                    onChange={(event) => setUpiId(event.target.value)}
                    placeholder="Enter UPI ID"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/40 focus:outline-none"
                  />
                  <div className="surface-card flex flex-col items-center p-6">
                    <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white text-slate-900">
                      <QrCode size={56} />
                    </div>
                    <p className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                      Scan with any UPI app
                    </p>
                  </div>
                </div>
              ) : null}

              {method === 'card' ? (
                <div className="space-y-4">
                  <input
                    value={card.number}
                    onChange={(event) => setCard((previous) => ({ ...previous, number: event.target.value }))}
                    placeholder="Card number"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/40 focus:outline-none"
                  />
                  <input
                    value={card.name}
                    onChange={(event) => setCard((previous) => ({ ...previous, name: event.target.value }))}
                    placeholder="Cardholder name"
                    className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/40 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={card.expiry}
                      onChange={(event) => setCard((previous) => ({ ...previous, expiry: event.target.value }))}
                      placeholder="MM / YY"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/40 focus:outline-none"
                    />
                    <input
                      value={card.cvv}
                      onChange={(event) => setCard((previous) => ({ ...previous, cvv: event.target.value }))}
                      placeholder="CVV"
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/40 focus:outline-none"
                    />
                  </div>
                </div>
              ) : null}

              {method === 'bank' ? (
                <div className="space-y-3">
                  {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'].map((bank) => (
                    <button key={bank} type="button" className="surface-card flex w-full items-center justify-between p-4 text-left">
                      <span className="text-sm font-black text-white">
                        {bank}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
                        Select
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}

              <button type="button" onClick={handlePay} className="btn-primary mt-5 w-full justify-center">
                <Lock size={14} />
                Pay securely
              </button>
            </motion.div>
          ) : null}

          {step === 'processing' ? (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-6 pb-10 pt-2 text-center">
              <RefreshCw size={36} className="mx-auto animate-spin text-violet-300" />
              <p className="mt-5 text-xl font-black text-white">
                Processing payment
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Connecting to the payment gateway...
              </p>
            </motion.div>
          ) : null}

          {step === 'success' ? (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="px-6 pb-10 pt-2 text-center">
              <CheckCircle2 size={54} className="mx-auto text-emerald-300" />
              <p className="mt-5 text-2xl font-black text-white">
                Payment successful
              </p>
              <p className="mt-2 text-sm text-slate-400">
                Your receipt is now reflected in the transaction ledger.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export default function StudentFees() {
  const { push } = useToast();
  const [portalData, setPortalData] = useState(DEFAULT_PORTAL_DATA);
  const [loading, setLoading] = useState(true);
  const [payingItem, setPayingItem] = useState(null);
  const [paymentOverrides, setPaymentOverrides] = useState({});

  useEffect(() => {
    const loadPortalData = async () => {
      try {
        const { data } = await api.get('/student/portal', {
          cache: {
            maxAge: 30000,
            staleWhileRevalidate: true,
            revalidateAfter: 12000,
            persist: true,
            onUpdate: (response) => setPortalData(normalizePortalData(response?.data))
          }
        });
        setPortalData(normalizePortalData(data));
      } catch {
        setPortalData(DEFAULT_PORTAL_DATA);
      } finally {
        setLoading(false);
      }
    };

    loadPortalData();
  }, []);

  const finance = portalData.finance || DEFAULT_FINANCE;
  const baseTransactions = useMemo(() => buildFinanceLedger(finance), [finance]);

  const transactions = useMemo(
    () => baseTransactions.map((item) => (
      paymentOverrides[item.id]
        ? {
            ...item,
            status: 'Paid',
            receipt: paymentOverrides[item.id],
            dueDate: null
          }
        : item
    )),
    [baseTransactions, paymentOverrides]
  );

  const breakdown = useMemo(
    () => finance.breakdown.map((item, index) => ({
      ...item,
      paid: transactions[index]?.status === 'Paid'
    })),
    [finance.breakdown, transactions]
  );

  const totalAll = useMemo(
    () => breakdown.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [breakdown]
  );
  const totalPaid = useMemo(
    () => transactions.filter((item) => item.status === 'Paid').reduce((sum, item) => sum + item.amount, 0),
    [transactions]
  );
  const totalDue = Math.max(0, totalAll - totalPaid);
  const paidPct = totalAll ? Math.round((totalPaid / totalAll) * 100) : 0;
  const dueItems = transactions.filter((item) => item.status === 'Due');
  const receiptCount = transactions.filter((item) => item.receipt).length;

  const handlePaymentSuccess = (item) => {
    setPaymentOverrides((previous) => ({
      ...previous,
      [item.id]: `REC-${Date.now().toString().slice(-6)}`
    }));
  };

  if (loading) {
    return (
      <DashboardLayout title="Fee Treasury" role="STUDENT">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-violet-500/30 border-t-violet-500 shadow-2xl shadow-violet-500/20" />
          <p className="animate-pulse text-[11px] font-black uppercase tracking-[0.6em] text-slate-500">
            Fee ledger synchronization
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Fee Treasury" role="STUDENT">
      <WorkspaceHero
        eyebrow="Fees workspace"
        title="Payments, dues, and receipt ledger"
        description="Track what is cleared, what is due, and what still needs action from a cleaner fee management experience designed for faster decisions and safer payments."
        icon={Wallet}
        badges={[
          `${paidPct}% cleared`,
          `${dueItems.length} due items`,
          'Receipt archive ready'
        ]}
        actions={[
          {
            label: 'Download statement',
            icon: Download,
            tone: 'secondary',
            onClick: () => push({ type: 'info', title: 'Statement ready', body: 'Your annual fee statement export flow is ready from this screen.' })
          },
          {
            label: 'Pay dues',
            icon: Zap,
            tone: 'primary',
            onClick: () => setPayingItem(dueItems[0] || null)
          }
        ]}
        stats={[
          { label: 'Paid amount', value: `Rs ${totalPaid.toLocaleString()}` },
          { label: 'Due amount', value: `Rs ${totalDue.toLocaleString()}` },
          { label: 'Total ledger', value: `Rs ${totalAll.toLocaleString()}` },
          { label: 'Transactions', value: String(transactions.length) }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Payment health
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              {totalDue ? 'The ledger is mostly clear' : 'Your active cycle is fully clear'}
            </h3>
            <div className="mt-6 space-y-3">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Next action
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {dueItems.length
                    ? `${dueItems.length} payment item${dueItems.length > 1 ? 's are' : ' is'} still awaiting confirmation in the current cycle.`
                    : 'No pending payment items are currently blocking your academic operations.'}
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Security
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-300">
                  Payment confirmation and receipt delivery are both ready to connect to your production payment provider flow.
                </p>
              </div>
            </div>
          </div>
        )}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard title="Paid" value={`Rs ${totalPaid.toLocaleString()}`} icon={CheckCircle2} color="bg-emerald-500" trend="Cleared" />
        <StatCard title="Due" value={`Rs ${totalDue.toLocaleString()}`} icon={AlertTriangle} color="bg-amber-500" trend={totalDue ? 'Action needed' : 'Clear'} />
        <StatCard title="Total" value={`Rs ${totalAll.toLocaleString()}`} icon={Wallet} color="bg-blue-500" trend="Ledger" />
        <StatCard title="Receipts" value={String(receiptCount)} icon={Receipt} color="bg-violet-500" trend="Stored" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard title="Ledger progress" subtitle={`${portalData.profile.semesterLabel} | ${portalData.profile.program}`} icon={Wallet}>
          <div className="rounded-[1.8rem] border border-white/8 bg-slate-950/45 p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  Total cleared
                </p>
                <p className="mt-2 text-4xl font-black text-white">
                  Rs {totalPaid.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  of Rs {totalAll.toLocaleString()}
                </p>
              </div>
              {totalDue ? (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-300">
                    Due now
                  </p>
                  <p className="mt-2 text-xl font-black text-white">
                    Rs {totalDue.toLocaleString()}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="h-3 overflow-hidden rounded-full border border-white/6 bg-slate-900">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-400 via-violet-500 to-emerald-400" style={{ width: `${paidPct}%` }} />
            </div>
            <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              {paidPct}% cleared
            </p>
          </div>
        </GlassCard>

        <GlassCard title="Breakdown" subtitle="Fee component status" icon={CreditCard}>
          <div className="space-y-3">
            {breakdown.map((item) => (
              <div key={item.item} className="surface-card flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-black text-white">
                    {item.item}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {item.paid ? 'Paid' : 'Due'}
                  </p>
                </div>
                <p className={`text-sm font-black ${item.paid ? 'text-emerald-300' : 'text-amber-300'}`}>
                  Rs {Number(item.amount || 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {dueItems.length ? (
        <GlassCard title="Pending dues" subtitle="Payments needing attention" icon={AlertTriangle} className="mb-8">
          <div className="space-y-3">
            {dueItems.map((item) => (
              <div key={item.id} className="surface-card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-black text-white">
                    {item.desc}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      {item.id}
                    </span>
                    {item.dueDate ? <DaysCountdown dueDate={item.dueDate} /> : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-lg font-black text-white">
                    Rs {item.amount.toLocaleString()}
                  </p>
                  <button type="button" onClick={() => setPayingItem(item)} className="btn-primary">
                    <Zap size={14} />
                    Pay now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : null}

      <GlassCard title="Transaction ledger" subtitle="Payment history and receipt archive" icon={Receipt}>
        <div className="space-y-3">
          {transactions.map((item) => (
            <div key={item.id} className="surface-card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${
                  item.status === 'Paid'
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                    : 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                }`}>
                  {item.status === 'Paid' ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-white">
                    {item.desc}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    <span>{item.id}</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {item.date}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <p className="text-lg font-black text-white">
                  Rs {item.amount.toLocaleString()}
                </p>
                {item.status === 'Paid' ? (
                  <button
                    type="button"
                    onClick={() => push({ type: 'success', title: 'Receipt ready', body: `${item.receipt} download flow is available from this ledger.` })}
                    className="btn-secondary"
                  >
                    <Download size={14} />
                    Receipt
                  </button>
                ) : (
                  <button type="button" onClick={() => setPayingItem(item)} className="btn-secondary">
                    <CreditCard size={14} />
                    Pay
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <AnimatePresence>
        {payingItem ? <PaymentModal item={payingItem} onClose={() => setPayingItem(null)} onSuccess={handlePaymentSuccess} /> : null}
      </AnimatePresence>
    </DashboardLayout>
  );
}
