import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays, Plus, CheckCircle2, XCircle, Clock, FileText,
  AlertTriangle, X, Search, ChevronDown, User, Stethoscope,
  Briefcase, Award, BookOpen, Plane, RefreshCw
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const LEAVE_TYPES = [
  { id: 'casual',   label: 'Casual Leave',      icon: Briefcase,     color: '#6366f1', balance: 12 },
  { id: 'medical',  label: 'Medical Leave',      icon: Stethoscope,   color: '#ef4444', balance: 15 },
  { id: 'earned',   label: 'Earned Leave',       icon: Award,         color: '#10b981', balance: 20 },
  { id: 'duty',     label: 'On Duty / OD',       icon: BookOpen,      color: '#3b82f6', balance: 10 },
  { id: 'vacation', label: 'Vacation Leave',     icon: Plane,         color: '#f59e0b', balance: 30 },
];

const STATUS_CFG = {
  pending:   { label: 'Pending',   color: 'text-amber-400', bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400 animate-ping' },
  approved:  { label: 'Approved',  color: 'text-emerald-400',bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  rejected:  { label: 'Rejected',  color: 'text-red-400',   bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-400' },
};

const INITIAL_LEAVES = [
  { id: 'LV-001', faculty: 'Dr. Priya Nair',     dept: 'CSE', type: 'medical',   from: '2026-03-18', to: '2026-03-20', days: 3, reason: 'Fever and medical check-up', status: 'approved', approverRemark: 'Approved. Get well soon.', appliedOn: '17 Mar 2026' },
  { id: 'LV-002', faculty: 'Prof. Rahul Sharma',  dept: 'ECE', type: 'duty',     from: '2026-03-25', to: '2026-03-26', days: 2, reason: 'Representing college at IEEE Conference, Bangalore', status: 'pending', approverRemark: '', appliedOn: '21 Mar 2026' },
  { id: 'LV-003', faculty: 'Dr. Sneha Menon',     dept: 'MECH',type: 'casual',   from: '2026-03-28', to: '2026-03-28', days: 1, reason: 'Family function', status: 'pending', approverRemark: '', appliedOn: '22 Mar 2026' },
  { id: 'LV-004', faculty: 'Prof. Kiran Reddy',   dept: 'CSE', type: 'earned',   from: '2026-04-05', to: '2026-04-08', days: 4, reason: 'Annual family vacation planned in advance', status: 'rejected', approverRemark: 'Clash with internal exam supervision duty. Please reschedule.', appliedOn: '10 Mar 2026' },
  { id: 'LV-005', faculty: 'Prof. Aditya Singh',  dept: 'ECE', type: 'vacation', from: '2026-05-01', to: '2026-05-10', days: 10, reason: 'Summer vacation travel', status: 'pending', approverRemark: '', appliedOn: '22 Mar 2026' },
];

const getDays = (from, to) => Math.max(1, Math.ceil((new Date(to) - new Date(from)) / 86400000) + 1);

function ApplyModal({ leaveTypes, onClose, onSubmit }) {
  const [form, setForm] = useState({ type: 'casual', from: '', to: '', reason: '', relief: '' });
  const days = form.from && form.to ? getDays(form.from, form.to) : 0;
  const typeData = leaveTypes.find(t => t.id === form.type);
  const ok = form.from && form.to && form.reason.trim() && days > 0 && days <= (typeData?.balance || 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-black text-white text-lg flex items-center gap-2"><CalendarDays size={18} className="text-indigo-400" /> Apply for Leave</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Leave Type */}
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Leave Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {leaveTypes.map(lt => (
                <button key={lt.id} onClick={() => setForm(p => ({ ...p, type: lt.id }))}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${form.type === lt.id ? 'border-indigo-500/50 bg-indigo-500/10 text-white' : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-white'}`}>
                  <lt.icon size={13} style={{ color: lt.color }} />
                  <span className="text-[10px] font-black leading-tight">{lt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Balance indicator */}
          {typeData && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <span className="text-[10px] text-slate-500 font-bold">Available Balance</span>
              <span className="text-sm font-black" style={{ color: typeData.color }}>{typeData.balance} days</span>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            {[['from','From Date'], ['to','To Date']].map(([k, label]) => (
              <div key={k}>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{label} *</label>
                <input type="date" value={form[k]} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors [color-scheme:dark]" />
              </div>
            ))}
          </div>

          {days > 0 && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black ${days > (typeData?.balance || 0) ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}>
              {days > (typeData?.balance || 0) ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
              {days} working day{days > 1 ? 's' : ''} selected{days > (typeData?.balance||0) ? ' — exceeds balance!' : ''}
            </div>
          )}

          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Reason *</label>
            <textarea value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} rows={3}
              placeholder="Detailed reason for leave..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none transition-colors placeholder:text-slate-600" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Relief Arrangement</label>
            <input value={form.relief} onChange={e => setForm(p => ({ ...p, relief: e.target.value }))} placeholder="Who will handle your classes? (optional)"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
          </div>
          <button onClick={() => { if (ok) { onSubmit({ ...form, days }); onClose(); } }} disabled={!ok}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2">
            <CalendarDays size={14} /> Submit Leave Application
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ApproveModal({ leave, onClose, onAction }) {
  const [remark, setRemark] = useState('');
  const lt = LEAVE_TYPES.find(t => t.id === leave.type);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-white">Review Application</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"><X size={15} /></button>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 mb-4 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white flex-shrink-0" style={{ background: `${lt?.color}20`, color: lt?.color }}>
              {lt && <lt.icon size={15} />}
            </div>
            <div>
              <p className="text-sm font-black text-white">{leave.faculty}</p>
              <p className="text-[10px] text-slate-500">{leave.dept} · {lt?.label} · {leave.days} day{leave.days > 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-2 border-t border-white/5">
            <strong>Dates:</strong> {leave.from} → {leave.to}
          </div>
          <p className="text-[10px] text-slate-400"><strong>Reason:</strong> {leave.reason}</p>
        </div>
        <div className="mb-4">
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Approver Remark (Optional)</label>
          <textarea value={remark} onChange={e => setRemark(e.target.value)} rows={3}
            placeholder="Add an official note..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none transition-colors placeholder:text-slate-600" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => { onAction(leave.id, 'approved', remark); onClose(); }}
            className="py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
            <CheckCircle2 size={14} /> Approve
          </button>
          <button onClick={() => { onAction(leave.id, 'rejected', remark); onClose(); }}
            className="py-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all">
            <XCircle size={14} /> Reject
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function LeaveManagement() {
  const { user } = useAuth();
  const { push } = useToast();
  const [leaves, setLeaves] = useState(INITIAL_LEAVES);
  const [showApply, setShowApply] = useState(false);
  const [reviewing, setReviewing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const role = user?.role?.toUpperCase() || 'FACULTY';
  const isManager = ['ADMIN', 'HOD', 'CHAIRMAN', 'DIRECTOR'].includes(role);

  const filtered = leaves.filter(l =>
    (filterStatus === 'all' || l.status === filterStatus) &&
    (search === '' || l.faculty.toLowerCase().includes(search.toLowerCase()) || l.id.includes(search))
  );

  const handleApply = (form) => {
    const newLeave = {
      id: `LV-${String(100 + leaves.length + 1)}`,
      faculty: user?.name || 'You',
      dept: user?.dept || 'Faculty',
      ...form,
      status: 'pending',
      approverRemark: '',
      appliedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    setLeaves(prev => [newLeave, ...prev]);
    push({ type: 'success', title: 'Leave Applied', body: `${newLeave.id} submitted. Awaiting HOD approval.` });
  };

  const handleAction = (id, action, remark) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: action, approverRemark: remark } : l));
    push({ type: action === 'approved' ? 'success' : 'warning', title: `Leave ${action === 'approved' ? 'Approved' : 'Rejected'}`, body: `${id} has been ${action}.` });
  };

  const stats = {
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  };

  return (
    <DashboardLayout title="Leave Management" role={user?.role || 'FACULTY'}>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <CalendarDays size={28} className="text-indigo-500" />
            {isManager ? 'Leave Approvals Centre' : 'My Leave Applications'}
          </h2>
          <p className="text-slate-400 mt-1">{isManager ? 'Review, approve, or reject faculty leave requests.' : 'Apply for leave and track approval status in real time.'}</p>
        </div>
        {!isManager && (
          <button onClick={() => setShowApply(true)}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Plus size={15} /> Apply for Leave
          </button>
        )}
      </div>

      {/* Leave Balance Cards (Faculty only) */}
      {!isManager && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {LEAVE_TYPES.map(lt => (
            <div key={lt.id} className="p-4 rounded-2xl bg-[#080808] border border-white/5 flex flex-col gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${lt.color}15`, color: lt.color }}>
                <lt.icon size={15} />
              </div>
              <p className="text-2xl font-black text-white leading-none">{lt.balance}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-snug">{lt.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Summary KPIs (Manager only) */}
      {isManager && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Pending', value: stats.pending, color: '#f59e0b', icon: Clock },
            { label: 'Approved', value: stats.approved, color: '#10b981', icon: CheckCircle2 },
            { label: 'Rejected', value: stats.rejected, color: '#ef4444', icon: XCircle },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              onClick={() => setFilterStatus(s.label.toLowerCase())}
              className="p-4 rounded-2xl bg-[#080808] border border-white/5 cursor-pointer hover:border-white/10 transition-all flex items-center gap-3">
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
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by faculty or application ID..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none">
          <option value="all" className="bg-slate-900">All Status</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v.label}</option>)}
        </select>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((leave, i) => {
            const st = STATUS_CFG[leave.status];
            const lt = LEAVE_TYPES.find(t => t.id === leave.type);
            return (
              <motion.div key={leave.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="p-5 rounded-2xl bg-[#080808] border border-white/5 hover:border-white/10 transition-all">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${lt?.color}15`, color: lt?.color }}>
                    {lt && <lt.icon size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                      <div>
                        <p className="text-sm font-black text-white">{leave.faculty} <span className="text-slate-500 font-normal text-xs">· {leave.dept}</span></p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{leave.id} · Applied {leave.appliedOn}</p>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${st.bg} ${st.border} ${st.color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-slate-400 mb-2">
                      <span><span className="font-black text-white">{lt?.label}</span></span>
                      <span>{leave.from} → {leave.to}</span>
                      <span className="font-black" style={{ color: lt?.color }}>{leave.days} day{leave.days > 1 ? 's' : ''}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{leave.reason}</p>
                    {leave.approverRemark && (
                      <div className={`mt-2 p-2.5 rounded-xl text-[10px] ${leave.status === 'approved' ? 'bg-emerald-500/5 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border border-red-500/20 text-red-400'}`}>
                        <span className="font-black">HOD Remark: </span>{leave.approverRemark}
                      </div>
                    )}
                  </div>
                  {isManager && leave.status === 'pending' && (
                    <button onClick={() => setReviewing(leave)}
                      className="flex-shrink-0 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-colors flex items-center gap-1.5">
                      <FileText size={12} /> Review
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <CalendarDays size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">No leave applications found.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showApply && <ApplyModal leaveTypes={LEAVE_TYPES} onClose={() => setShowApply(false)} onSubmit={handleApply} />}
        {reviewing && <ApproveModal leave={reviewing} onClose={() => setReviewing(null)} onAction={handleAction} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
