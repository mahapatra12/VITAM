import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, CheckCircle2, XCircle, Brain, Star, DollarSign,
  Users, Zap, Search, Eye, BarChart2, X, Send, Radar
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';
import api from '../../utils/apiClient';

const STATUS_CFG = {
  submitted:   { label: 'Under Review', color: 'text-amber-400',   bg: 'bg-amber-500/10',    border: 'border-amber-500/20'   },
  shortlisted: { label: 'Shortlisted',  color: 'text-blue-400',    bg: 'bg-blue-500/10',     border: 'border-blue-500/20'    },
  awarded:     { label: 'Awarded ✓',    color: 'text-emerald-400', bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20' },
  rejected:    { label: 'Rejected',     color: 'text-red-400',     bg: 'bg-red-500/10',      border: 'border-red-500/20'     },
};

function ReviewModal({ app, onClose, onAction, scholarships }) {
  const [remark, setRemark] = useState(app.remarks || '');
  const sch = scholarships.find(s => s.id === app.schId);
  const st = STATUS_CFG[app.status];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white">Review Application</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"><X size={15} /></button>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white" style={{ background: `${sch?.color}20` }}>{app.name[0]}</div>
            <div>
              <p className="text-sm font-black text-white">{app.name}</p>
              <p className="text-[10px] text-slate-500">{app.rollNo} · {app.dept} · CGPA {app.cgpa}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500">Scholarship:</span>
            <span className="font-bold" style={{ color: sch?.color }}>{sch?.name}</span>
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-500 flex items-center gap-1"><Brain size={10} /> AI Likelihood:</span>
            <span className={`font-black ${app.aiScore >= 80 ? 'text-emerald-400' : app.aiScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{app.aiScore}%</span>
          </div>
          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${app.aiScore}%`, background: app.aiScore >= 80 ? '#10b981' : app.aiScore >= 60 ? '#f59e0b' : '#ef4444' }} />
          </div>
        </div>
        <div>
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Committee Remarks</label>
          <textarea value={remark} onChange={e => setRemark(e.target.value)} rows={3}
            placeholder="Add review notes for the selection committee..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none transition-colors placeholder:text-slate-600" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { action: 'shortlisted', label: 'Shortlist', cls: 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' },
            { action: 'awarded', label: '★ Award', cls: 'bg-emerald-500 hover:bg-emerald-400 text-white border-transparent' },
            { action: 'rejected', label: 'Reject', cls: 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20' },
          ].filter(b => b.action !== app.status).map(b => (
            <button key={b.action} onClick={() => { onAction(app.id, b.action, remark); onClose(); }}
              className={`py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${b.cls}`}>
              {b.label}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ScholarshipAdmin() {
  const { user } = useAuth();
  const { push } = useToast();
  const [scholarships, setScholarships] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSch, setFilterSch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reviewing, setReviewing] = useState(null);
  const [stats, setStats] = useState({ total: 0, awarded: 0, pending: 0, shortlisted: 0, totalBudget: 0, budgetUsed: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schRes, appRes, statsRes] = await Promise.all([
        api.get('/scholarships'),
        api.get('/scholarships/applications'),
        api.get('/scholarships/stats')
      ]);
      setScholarships(schRes.data);
      setApplicants(appRes.data);
      setStats(statsRes.data);
    } catch (err) {
      push({ type: 'error', title: 'Data Fetch Failed', body: 'Failed to synchronize with institutional ledger.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status, remark) => {
    try {
      await api.patch('/scholarships/status', { id, status, remarks: remark });
      setApplicants(prev => prev.map(a => a.id === id ? { ...a, status, remarks: remark } : a));
      
      const app = applicants.find(a => a.id === id);
      const icon = status === 'awarded' ? '🏆' : status === 'shortlisted' ? '📋' : '❌';
      push({ 
        type: status === 'awarded' ? 'success' : status === 'shortlisted' ? 'info' : 'warning', 
        title: `${icon} ${STATUS_CFG[status].label}`, 
        body: `${app?.name} — ${STATUS_CFG[status].label}. Student will be notified.` 
      });

      // Refresh stats
      const statsRes = await api.get('/scholarships/stats');
      setStats(statsRes.data);
    } catch (err) {
      push({ type: 'error', title: 'Action Failed', body: 'Failed to commit institutional override.' });
    }
  };

  const filtered = applicants.filter(a =>
    (filterSch === 'all' || a.schId === filterSch) &&
    (filterStatus === 'all' || a.status === filterStatus) &&
    (search === '' || a.name.toLowerCase().includes(search.toLowerCase()) || a.rollNo.includes(search))
  );

  const budgetUsed = stats.budgetUsed;
  const totalBudget = stats.totalBudget;

  return (
    <DashboardLayout title="Scholarship Admin" role={user?.role || 'ADMIN'}>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white flex items-center gap-3">
          <Award size={28} className="text-amber-500" /> Scholarship Management
        </h2>
        <p className="text-slate-400 mt-1">Review applicants, shortlist, and award scholarships for the academic year.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Applicants', value: stats.total,       color: '#6366f1', icon: Users       },
          { label: 'Pending Review',   value: stats.pending,     color: '#f59e0b', icon: CheckCircle2 },
          { label: 'Shortlisted',      value: stats.shortlisted, color: '#3b82f6', icon: Star         },
          { label: 'Awarded',          value: stats.awarded,     color: '#10b981', icon: Award        },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="p-4 rounded-2xl bg-[#080808] border border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15` }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-black text-white leading-none">{s.value}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Budget utilisation bar */}
      <div className="mb-6 p-4 rounded-2xl bg-[#080808] border border-white/5">
        <div className="flex justify-between mb-2">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Total Budget Utilisation</p>
          <p className="text-[10px] font-black text-white">₹{(budgetUsed/100000).toFixed(1)}L of ₹{(totalBudget/100000).toFixed(0)}L</p>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${(budgetUsed / totalBudget) * 100}%` }} transition={{ duration: 1 }}
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500" />
        </div>
      </div>

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or roll number..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-slate-600" />
        </div>
        <select value={filterSch} onChange={e => setFilterSch(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none">
          <option value="all" className="bg-slate-900">All Scholarships</option>
          {scholarships.map(s => <option key={s.id} value={s.id} className="bg-slate-900">{s.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none">
          <option value="all" className="bg-slate-900">All Status</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v.label}</option>)}
        </select>
      </div>

      {/* Applicant List */}
      <div className="space-y-3 relative min-h-[200px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-10 rounded-3xl">
            <Radar className="text-amber-500 animate-spin mb-3" size={40} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Synchronising Vault...</p>
          </div>
        )}
        <AnimatePresence>
          {filtered.map((app, i) => {
            const sch = scholarships.find(s => s.id === app.schId);
            const st = STATUS_CFG[app.status];
            return (
              <motion.div key={app.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${app.status === 'awarded' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#080808] border-white/5 hover:border-white/10'}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white flex-shrink-0"
                  style={{ background: `${sch?.color || '#3b82f6'}20`, color: sch?.color || '#3b82f6' }}>
                  {app.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white">{app.name} <span className="text-slate-500 font-normal text-xs">· {app.rollNo} · {app.dept}</span></p>
                  <div className="flex flex-wrap gap-x-4 text-[9px] text-slate-500 mt-0.5">
                    <span style={{ color: sch?.color || '#3b82f6' }}>{sch?.schName || sch?.name}</span>
                    <span>CGPA {app.cgpa}</span>
                    <span>Att. {app.attendance}%</span>
                    {app.income && <span>Income ₹{(app.income/100000).toFixed(1)}L</span>}
                    <span className="flex items-center gap-0.5 text-purple-400"><Brain size={8} /> {app.aiScore}%</span>
                  </div>
                </div>
                <div className="hidden sm:flex h-1.5 w-20 bg-white/5 rounded-full overflow-hidden flex-shrink-0">
                  <div className="h-full rounded-full" style={{ width: `${app.aiScore}%`, background: sch?.color || '#3b82f6' }} />
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${st.bg} ${st.border} ${st.color}`}>
                  {st.label}
                </div>
                {app.status !== 'awarded' && app.status !== 'rejected' && (
                  <button onClick={() => setReviewing(app)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 text-[10px] font-black uppercase tracking-widest transition-colors flex-shrink-0">
                    <Eye size={12} /> Review
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {reviewing && <ReviewModal app={reviewing} onClose={() => setReviewing(null)} onAction={handleAction} scholarships={scholarships} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
