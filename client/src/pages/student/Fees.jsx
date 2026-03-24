import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, Receipt, Clock, Wallet, Download, CheckCircle2,
  AlertTriangle, ChevronRight, Shield, Zap, QrCode, X, TrendingDown,
  IndianRupee, Calendar, Lock, RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useToast } from '../../components/ui/ToastSystem';

const FEE_BREAKDOWN = [
  { label: 'Tuition Fee',    amount: 45000, color: '#6366f1', paid: true  },
  { label: 'Hostel Fee',     amount: 18000, color: '#8b5cf6', paid: true  },
  { label: 'Bus Transport',  amount: 12000, color: '#3b82f6', paid: true  },
  { label: 'Mess Bill',      amount:  4200, color: '#f59e0b', paid: false },
  { label: 'Library Fine',   amount:   150, color: '#ef4444', paid: true  },
  { label: 'Exam Fees',      amount:  2500, color: '#10b981', paid: false },
];

const TRANSACTIONS = [
  { id: 'TXN-001', date: '12 Mar 2026', desc: 'Semester 6 Tuition Fee', amount: 45000, status: 'Paid',    receipt: 'REC-001' },
  { id: 'TXN-002', date: '01 Mar 2026', desc: 'Hostel Mess Bill — March', amount: 4200, status: 'Due',    receipt: null,      dueDate: '2026-03-31' },
  { id: 'TXN-003', date: '15 Aug 2025', desc: 'Semester 5 Tuition Fee',  amount: 45000, status: 'Paid',   receipt: 'REC-002' },
  { id: 'TXN-004', date: '10 Aug 2025', desc: 'Bus Transport (Annual)',   amount: 12000, status: 'Paid',   receipt: 'REC-003' },
  { id: 'TXN-005', date: '12 Jun 2026', desc: 'Exam Registration Fees',  amount:  2500, status: 'Due',    receipt: null,      dueDate: '2026-04-20' },
  { id: 'TXN-006', date: '20 Jan 2025', desc: 'Library Fine — Late Return', amount: 150, status: 'Paid',  receipt: 'REC-004' },
];

const UPI_APPS = ['GPay', 'PhonePe', 'Paytm', 'BHIM'];

function PaymentModal({ item, onClose }) {
  const { push } = useToast();
  const [step, setStep] = useState(1); // 1=method, 2=processing, 3=done
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const handlePay = async () => {
    setStep(2);
    await new Promise(r => setTimeout(r, 2200));
    setStep(3);
    push({ type: 'success', title: 'Payment Successful!', body: `₹${item.amount.toLocaleString()} for "${item.desc}" confirmed. Receipt sent.` });
    setTimeout(onClose, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="font-black text-white text-lg">Secure Payment</h3>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[260px]">{item.desc}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Amount */}
        <div className="px-6 py-5 bg-indigo-500/5 border-b border-white/5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <IndianRupee size={22} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-3xl font-black text-white">₹{item.amount.toLocaleString()}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Amount Due</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Shield size={10} /> SSL Secured
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-5">
              {/* Payment Method Tabs */}
              <div className="flex gap-2">
                {[['upi','UPI/QR'],['card','Card'],['netbank','Net Banking']].map(([id, label]) => (
                  <button key={id} onClick={() => setMethod(id)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${method === id ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {method === 'upi' && (
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    {UPI_APPS.map(app => (
                      <button key={app} onClick={() => setUpiId(`${app.toLowerCase()}@upi`)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-black border transition-all ${upiId.startsWith(app.toLowerCase()) ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
                        {app}
                      </button>
                    ))}
                  </div>
                  <input value={upiId} onChange={e => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID (e.g. name@upi)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
                  <div className="flex items-center justify-center p-4 bg-white rounded-2xl">
                    <div className="w-24 h-24 bg-slate-200 flex items-center justify-center rounded-xl">
                      <QrCode size={64} className="text-slate-800" />
                    </div>
                  </div>
                  <p className="text-center text-[10px] text-slate-500">Scan with any UPI app to pay instantly</p>
                </div>
              )}

              {method === 'card' && (
                <div className="space-y-3">
                  {[
                    { key: 'number', placeholder: '1234 5678 9012 3456', label: 'Card Number', type: 'text', maxLen: 19 },
                    { key: 'name',   placeholder: 'Cardholder Name',     label: 'Name',           type: 'text', maxLen: 40 },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{f.label}</label>
                      <input type={f.type} maxLength={f.maxLen} value={card[f.key]}
                        onChange={e => setCard(p => ({ ...p, [f.key]: e.target.value }))}
                        placeholder={f.placeholder}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'expiry', placeholder: 'MM / YY', label: 'Expiry' },
                      { key: 'cvv',    placeholder: '•••',       label: 'CVV' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{f.label}</label>
                        <input type={f.key === 'cvv' ? 'password' : 'text'} maxLength={f.key === 'cvv' ? 3 : 7} value={card[f.key]}
                          onChange={e => setCard(p => ({ ...p, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {method === 'netbank' && (
                <div className="space-y-2">
                  {['State Bank of India','HDFC Bank','ICICI Bank','Axis Bank','Kotak Mahindra'].map(bank => (
                    <button key={bank} onClick={() => setUpiId(bank)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${upiId === bank ? 'bg-indigo-500/10 border-indigo-500/30 text-white' : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                      <span className="text-sm font-bold">{bank}</span>
                      <ChevronRight size={14} className={upiId === bank ? 'text-indigo-400' : ''} />
                    </button>
                  ))}
                </div>
              )}

              <button onClick={handlePay}
                className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2">
                <Lock size={16} /> Pay ₹{item.amount.toLocaleString()} Securely
              </button>
              <p className="text-center text-[9px] text-slate-600">256-bit AES encrypted · PCI DSS Compliant · NPCI Licensed</p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-12 text-center">
              <RefreshCw size={40} className="mx-auto text-indigo-400 animate-spin mb-4" />
              <p className="text-white font-black text-lg">Processing Payment</p>
              <p className="text-slate-500 text-sm mt-1">Connecting to payment gateway...</p>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-12 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                <CheckCircle2 size={56} className="mx-auto text-emerald-400 mb-4" />
              </motion.div>
              <p className="text-white font-black text-xl">Payment Successful!</p>
              <p className="text-slate-400 text-sm mt-1">Receipt generated and emailed.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function DaysCountdown({ dueDate }) {
  const days = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
  return (
    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${days <= 7 ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
      {days > 0 ? `${days}d left` : 'Overdue'}
    </span>
  );
}

export default function StudentFees() {
  const [payingItem, setPayingItem] = useState(null);
  const { push } = useToast();

  const totalPaid = FEE_BREAKDOWN.filter(f => f.paid).reduce((s, f) => s + f.amount, 0);
  const totalDue = FEE_BREAKDOWN.filter(f => !f.paid).reduce((s, f) => s + f.amount, 0);
  const totalAll = FEE_BREAKDOWN.reduce((s, f) => s + f.amount, 0);
  const paidPct = Math.round((totalPaid / totalAll) * 100);

  return (
    <DashboardLayout title="Fee Treasury" role="STUDENT">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Wallet size={28} className="text-indigo-500" /> Fee Treasury
          </h2>
          <p className="text-slate-400 mt-1">Institutional payment history, secure checkout, and digital receipts.</p>
        </div>
        <button onClick={() => push({ type: 'info', title: 'Statement Generated', body: 'Annual fee statement exported as PDF.' })}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-colors">
          <Download size={14} /> Download Statement
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Progress card */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#080808] border border-white/5">
          <div className="flex justify-between items-start mb-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Total Fee Cleared</p>
              <p className="text-4xl font-black text-white mt-1">₹{totalPaid.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-0.5">of ₹{totalAll.toLocaleString()} · AY 2025–26</p>
            </div>
            <div className="text-right">
              {totalDue > 0 && (
                <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-black text-amber-400 flex items-center gap-2">
                  <AlertTriangle size={12} /> ₹{totalDue.toLocaleString()} Due
                </div>
              )}
            </div>
          </div>
          <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-2">
            <motion.div initial={{ width: 0 }} animate={{ width: `${paidPct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
          </div>
          <p className="text-[10px] text-slate-500 font-bold">{paidPct}% cleared</p>
        </div>

        {/* Pie breakdown visual */}
        <GlassCard>
          <div className="p-4 border-b border-white/5">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Breakdown</h3>
          </div>
          <div className="p-4 space-y-2">
            {FEE_BREAKDOWN.map(fee => (
              <div key={fee.label} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: fee.color }} />
                <span className="text-[11px] text-slate-400 flex-1 truncate">{fee.label}</span>
                <span className={`text-[9px] font-black ${fee.paid ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {fee.paid ? '✓' : '!'} ₹{(fee.amount / 1000).toFixed(1)}k
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Pending Dues highlighted */}
      {TRANSACTIONS.filter(t => t.status === 'Due').length > 0 && (
        <div className="mb-6 space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2 mb-3">
            <AlertTriangle size={13} /> Pending Payments
          </h3>
          {TRANSACTIONS.filter(t => t.status === 'Due').map(t => (
            <div key={t.id} className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
              <div className="flex-1">
                <p className="text-sm font-black text-white">{t.desc}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-slate-500 font-mono">{t.id}</span>
                  {t.dueDate && <DaysCountdown dueDate={t.dueDate} />}
                </div>
              </div>
              <p className="text-lg font-black text-white">₹{t.amount.toLocaleString()}</p>
              <button onClick={() => setPayingItem(t)}
                className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] flex items-center gap-2">
                <Zap size={12} /> Pay Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* All Transactions */}
      <GlassCard>
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <Receipt size={14} /> Payment History
          </h3>
          <span className="text-[9px] text-slate-600">{TRANSACTIONS.length} transactions</span>
        </div>
        <div className="divide-y divide-white/5">
          {TRANSACTIONS.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {t.status === 'Paid' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate">{t.desc}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[9px] text-slate-500 font-mono">{t.id} · {t.date}</span>
                </div>
              </div>
              <p className="font-black text-white tabular-nums">₹{t.amount.toLocaleString()}</p>
              {t.status === 'Paid' ? (
                <button onClick={() => push({ type: 'success', title: 'Receipt Downloaded', body: `${t.receipt} saved to your device.` })}
                  className="p-2 rounded-xl text-slate-400 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-all">
                  <Download size={14} />
                </button>
              ) : (
                <button onClick={() => setPayingItem(t)}
                  className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-colors">
                  Pay
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {/* Payment Modal */}
      <AnimatePresence>
        {payingItem && <PaymentModal item={payingItem} onClose={() => setPayingItem(null)} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
