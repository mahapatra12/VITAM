import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import {
  DollarSign, CreditCard, Activity, FileText, TrendingUp,
  Users, AlertTriangle, CheckCircle, Send, X, Zap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AIChat from '../../components/AIChat';

const COLLECTION_DATA = [
  { month: 'Oct', collected: 1.8, pending: 0.6 },
  { month: 'Nov', collected: 2.1, pending: 0.5 },
  { month: 'Dec', collected: 1.4, pending: 0.9 },
  { month: 'Jan', collected: 2.4, pending: 0.4 },
  { month: 'Feb', collected: 2.0, pending: 0.7 },
  { month: 'Mar', collected: 1.9, pending: 0.8 },
];

const FEE_BREAKDOWN = [
  { name: 'Tuition', value: 62, color: '#3b82f6' },
  { name: 'Hostel', value: 18, color: '#10b981' },
  { name: 'Transport', value: 10, color: '#f59e0b' },
  { name: 'Library/Lab', value: 10, color: '#8b5cf6' },
];

const BRANCH_DUES = [
  { branch: 'CSE', collected: 3.2, pending: 0.4 },
  { branch: 'ECE', collected: 2.1, pending: 0.6 },
  { branch: 'MECH', collected: 1.5, pending: 0.8 },
  { branch: 'CIVIL', collected: 1.3, pending: 0.5 },
];

const RECENT_TXN = [
  { id: 'TXN-1042', student: 'Rahul Kumar', amount: '₹48,500', type: 'Tuition', status: 'success', time: '11:42 AM' },
  { id: 'TXN-1041', student: 'Priya Sharma', amount: '₹12,000', type: 'Hostel', status: 'success', time: '11:38 AM' },
  { id: 'TXN-1040', student: 'Aditya Singh', amount: '₹48,500', type: 'Tuition', status: 'pending', time: '11:20 AM' },
  { id: 'TXN-1039', student: 'Sonia Rao', amount: '₹5,000', type: 'Transport', status: 'failed', time: '10:55 AM' },
  { id: 'TXN-1038', student: 'Venkat P.', amount: '₹48,500', type: 'Tuition', status: 'success', time: '10:30 AM' },
];

const DEFAULTERS = [
  { name: 'Kiran Reddy', branch: 'MECH', due: '₹48,500', days: 32, risk: 'high' },
  { name: 'Ananya Blore', branch: 'CIVIL', due: '₹24,250', days: 18, risk: 'medium' },
  { name: 'Suresh Naidu', branch: 'ECE', due: '₹12,000', days: 8, risk: 'low' },
];

const TS = { contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }, itemStyle: { color: '#e2e8f0' }, labelStyle: { color: '#94a3b8', fontWeight: 700 } };

export default function FinanceDashboard() {
  const [aiReport, setAiReport] = useState('');
  const [showReminder, setShowReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setAiReport('CFO-AI: Collection efficiency stands at 73.8% — below institutional target of 82%. Critical action required: 420 students with dues >30 days must receive automated SMS reminders. Recommend staged penalty system (0.5% late fee after 45 days). March forecast: ₹2.1 Cr expected. Cash flow stable but monitor infrastructure spend (currently at 29%). Suggest delaying ₹18L server upgrade to Q4 FY27 to preserve contingency buffer.');
    }, 1600);
  }, []);

  const txnColor = (s) => s === 'success' ? 'text-emerald-400 bg-emerald-400/10' : s === 'pending' ? 'text-amber-400 bg-amber-400/10' : 'text-red-400 bg-red-400/10';

  return (
    <DashboardLayout title="Financial Treasury" role="ADMIN">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Fee Treasury</h2>
          <p className="text-slate-400 font-medium mt-1">Real-time collection tracking, defaulter management & AI forecasting</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowReminder(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
        >
          <Send size={16} /> Bulk SMS Reminders
        </motion.button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Collected (YTD)" value="₹8.2 Cr" icon={DollarSign} color="bg-emerald-500" trend="+12.4%" />
        <StatCard title="Pending Dues" value="₹4.2 Cr" icon={CreditCard} color="bg-red-500" trend="-₹18L" />
        <StatCard title="Transactions Today" value="156" icon={Activity} color="bg-blue-500" />
        <StatCard title="Invoices Generated" value="4,250" icon={FileText} color="bg-purple-500" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <GlassCard title="Monthly Collection vs Pending (₹ Cr)" subtitle="6-month fee collection trend" className="lg:col-span-2">
          <div className="h-[220px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={COLLECTION_DATA}>
                <defs>
                  <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" Cr" />
                <Tooltip {...TS} formatter={(v) => [`₹${v} Cr`]} />
                <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>{v}</span>} />
                <Area type="monotone" dataKey="collected" name="Collected" stroke="#10b981" strokeWidth={2.5} fill="url(#colGrad)" dot={{ fill: '#10b981', r: 4 }} />
                <Area type="monotone" dataKey="pending" name="Pending" stroke="#ef4444" strokeWidth={2} fill="url(#pendGrad)" dot={{ fill: '#ef4444', r: 3 }} strokeDasharray="5 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Fee Breakdown" subtitle="Category distribution">
          <div className="h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={FEE_BREAKDOWN} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {FEE_BREAKDOWN.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip {...TS} formatter={(v) => [`${v}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-1">
            {FEE_BREAKDOWN.map(f => (
              <div key={f.name} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                {f.name} {f.value}%
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Branch-wise Collection */}
        <GlassCard title="Branch-wise Collection (₹ Cr)" subtitle="Collected vs outstanding by department">
          <div className="h-[200px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BRANCH_DUES}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="branch" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" Cr" />
                <Tooltip {...TS} formatter={(v) => [`₹${v} Cr`]} />
                <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Top Defaulters */}
        <GlassCard title="Top Fee Defaulters" subtitle="AI-ranked by payment risk score" icon={AlertTriangle}>
          <div className="mt-3 space-y-2">
            {DEFAULTERS.map((d) => (
              <div key={d.name} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div>
                  <p className="text-white font-black text-sm">{d.name}</p>
                  <p className="text-slate-400 text-xs">{d.branch} · {d.days} days overdue</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-black text-sm">{d.due}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${d.risk === 'high' ? 'bg-red-500/10 text-red-400' : d.risk === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {d.risk} risk
                  </span>
                </div>
              </div>
            ))}
            <button className="w-full mt-2 py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-500 text-xs font-bold hover:border-red-500/50 hover:text-red-400 transition-all">
              View all 420 defaulters →
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Recent Transactions */}
      <GlassCard title="Recent Transactions" subtitle="Live payment stream" className="mb-6">
        <div className="mt-3 space-y-2">
          {RECENT_TXN.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.status === 'success' ? 'bg-emerald-500/10' : t.status === 'pending' ? 'bg-amber-500/10' : 'bg-red-500/10'}`}>
                  {t.status === 'success' ? <CheckCircle size={14} className="text-emerald-400" /> : t.status === 'pending' ? <Activity size={14} className="text-amber-400" /> : <AlertTriangle size={14} className="text-red-400" />}
                </div>
                <div>
                  <p className="text-white font-black text-sm">{t.student}</p>
                  <p className="text-slate-400 text-xs">{t.id} · {t.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-black text-sm">{t.amount}</p>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-slate-500 text-xs">{t.time}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${txnColor(t.status)}`}>{t.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* CFO AI Report */}
      <GlassCard title="CFO AI — Financial Intelligence" subtitle="Autonomous anomaly detection & cashflow forecasting" icon={Zap}>
        <div className="mt-3 min-h-[60px]">
          {aiReport ? (
            <p className="text-emerald-400 font-medium leading-relaxed text-sm">{aiReport}</p>
          ) : (
            <span className="text-slate-500 italic flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              Running financial synthesis engine...
            </span>
          )}
        </div>
      </GlassCard>

      {/* SMS Modal */}
      <AnimatePresence>
        {showReminder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="w-full max-w-md rounded-3xl p-6 border border-white/10"
              style={{ background: 'rgba(15, 23, 42, 0.95)' }}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-white font-black text-lg">Bulk SMS Reminder</h3>
                <button onClick={() => { setShowReminder(false); setReminderSent(false); }}
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white">
                  <X size={16} />
                </button>
              </div>
              {!reminderSent ? (
                <>
                  <p className="text-slate-400 text-sm mb-4">Send automated SMS reminders to all students with outstanding dues.</p>
                  <div className="bg-slate-800/50 rounded-2xl p-4 mb-5 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Recipients</span><span className="text-white font-black">420 students</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Total Pending</span><span className="text-red-400 font-black">₹4.2 Cr</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-400">Avg Due Per Student</span><span className="text-white font-black">₹1,000</span></div>
                  </div>
                  <button onClick={() => setReminderSent(true)}
                    className="w-full py-3 rounded-2xl bg-blue-600 text-white font-black text-sm hover:bg-blue-500 transition-all flex items-center justify-center gap-2">
                    <Send size={16} /> Send 420 Reminders
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-emerald-400" />
                  </div>
                  <p className="text-white font-black text-lg">Reminders Dispatched!</p>
                  <p className="text-slate-400 text-sm mt-1">420 SMS messages queued successfully.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIChat role="finance" />
    </DashboardLayout>
  );
}
