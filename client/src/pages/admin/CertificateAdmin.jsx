import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stamp, Search, CheckCircle2, XCircle, Clock, Send,
  X, AlertTriangle, Download, Filter, Eye, RefreshCw,
  Shield, BookOpen, Plane, FileText, Zap
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const CERT_LABELS = {
  bonafide: 'Bonafide Certificate',
  transcript: 'Official Transcript',
  conduct: 'Character & Conduct',
  tc: 'Transfer Certificate',
  migration: 'Migration Certificate',
  medium: 'Medium of Instruction',
};

const CERT_ICONS = { bonafide: Shield, transcript: BookOpen, conduct: CheckCircle2, tc: Plane, migration: FileText, medium: Stamp };

const STATUS_CFG = {
  pending:    { label: 'Pending',         color: 'text-amber-400',   bg: 'bg-amber-500/10',    border: 'border-amber-500/20',   dot: 'bg-amber-400 animate-ping' },
  processing: { label: 'Processing',      color: 'text-blue-400',    bg: 'bg-blue-500/10',     border: 'border-blue-500/20',    dot: 'bg-blue-400' },
  ready:      { label: 'Ready',           color: 'text-emerald-400', bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20', dot: 'bg-emerald-400 animate-ping' },
  dispatched: { label: 'Dispatched',      color: 'text-purple-400',  bg: 'bg-purple-500/10',   border: 'border-purple-500/20',  dot: 'bg-purple-400' },
  rejected:   { label: 'Rejected',        color: 'text-red-400',     bg: 'bg-red-500/10',      border: 'border-red-500/20',     dot: 'bg-red-400' },
};

const MOCK_REQUESTS = [
  { id: 'CERT-001', student: 'Rahul Kumar',   rollNo: 'CS2022001', dept: 'CSE', year: '3rd', type: 'bonafide',  purpose: 'Bank loan application for laptop financing',            mode: 'physical', copies: 1, status: 'processing', appliedOn: '20 Mar 2026', remark: '' },
  { id: 'CERT-002', student: 'Priya Sharma',  rollNo: 'CS2022048', dept: 'CSE', year: '3rd', type: 'transcript', purpose: 'Graduate school application – IIT Delhi',               mode: 'email',    copies: 1, status: 'ready',      appliedOn: '15 Mar 2026', remark: 'Please collect from AR Office, Room 102.' },
  { id: 'CERT-003', student: 'Aditya Singh',  rollNo: 'ME2022015', dept: 'MECH',year: '3rd', type: 'conduct',   purpose: 'Job application at Infosys',                            mode: 'physical', copies: 2, status: 'pending',    appliedOn: '22 Mar 2026', remark: '' },
  { id: 'CERT-004', student: 'Sneha Iyer',    rollNo: 'EC2022033', dept: 'ECE', year: '2nd', type: 'bonafide',  purpose: 'GATE 2027 application form – bonafide required',        mode: 'email',    copies: 1, status: 'pending',    appliedOn: '22 Mar 2026', remark: '' },
  { id: 'CERT-005', student: 'Venkat P.',     rollNo: 'CS2021007', dept: 'CSE', year: '4th', type: 'tc',        purpose: 'Transferring to BITS Pilani for 4th year (family reloc.)',mode:'physical',  copies: 1, status: 'pending',    appliedOn: '21 Mar 2026', remark: '' },
  { id: 'CERT-006', student: 'Kiran Reddy',   rollNo: 'ME2022018', dept: 'MECH',year: '3rd', type: 'migration', purpose: 'University transfer to VTU board',                      mode: 'physical', copies: 1, status: 'rejected',   appliedOn: '10 Mar 2026', remark: 'Pending clearance of library dues. Please clear dues and re-apply.' },
  { id: 'CERT-007', student: 'Ananya Blore',  rollNo: 'CV2022009', dept: 'CIVIL',year:'2nd', type: 'medium',    purpose: 'Required for IELTS application – proof of English medium',mode:'email',    copies: 1, status: 'dispatched', appliedOn: '12 Mar 2026', remark: 'Certificate sent to registered email.' },
];

const STATUS_TRANSITIONS = {
  pending:    ['processing', 'rejected'],
  processing: ['ready', 'rejected'],
  ready:      ['dispatched'],
  dispatched: [],
  rejected:   [],
};

function ReviewModal({ req, onClose, onUpdate }) {
  const [newStatus, setNewStatus] = useState('');
  const [remark, setRemark] = useState(req.remark || '');

  const transitions = STATUS_TRANSITIONS[req.status] || [];
  const CertIcon = CERT_ICONS[req.type] || FileText;
  const st = STATUS_CFG[req.status];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-black text-white flex items-center gap-2"><Eye size={16} className="text-indigo-400" /> Review Request</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Student info */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-lg flex-shrink-0">
              {req.student[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white">{req.student}</p>
              <p className="text-[10px] text-slate-500">{req.rollNo} · {req.dept} · {req.year} Year</p>
              <div className="mt-2 flex items-center gap-2">
                <CertIcon size={11} className="text-indigo-400" />
                <span className="text-[10px] text-indigo-400 font-bold">{CERT_LABELS[req.type]}</span>
                <span className="text-[9px] text-slate-500">· {req.mode} · {req.copies} copy</span>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${st.bg} ${st.border} ${st.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Purpose</p>
            <p className="text-sm text-slate-300 leading-relaxed">{req.purpose}</p>
          </div>

          {/* Action */}
          {transitions.length > 0 && (
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Update Status</p>
              <div className="flex gap-2 flex-wrap mb-3">
                {transitions.map(t => {
                  const sc = STATUS_CFG[t];
                  return (
                    <button key={t} onClick={() => setNewStatus(t)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${newStatus === t ? `${sc.bg} ${sc.border} ${sc.color}` : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:text-white'}`}>
                      → {sc.label}
                    </button>
                  );
                })}
              </div>
              <textarea value={remark} onChange={e => setRemark(e.target.value)} rows={3}
                placeholder="Add an official note or instruction for the student (optional)..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none transition-colors placeholder:text-slate-600" />
              <button onClick={() => { if (newStatus) { onUpdate(req.id, newStatus, remark); onClose(); } }}
                disabled={!newStatus}
                className="w-full mt-3 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                <Send size={14} /> Update Status
              </button>
            </div>
          )}

          {req.remark && (
            <div className={`p-3 rounded-xl text-[11px] leading-relaxed ${req.status === 'rejected' ? 'bg-red-500/5 border border-red-500/20 text-red-300' : 'bg-emerald-500/5 border border-emerald-500/20 text-emerald-300'}`}>
              <span className="font-black">Current Remark: </span>{req.remark}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CertificateAdmin() {
  const { user } = useAuth();
  const { push } = useToast();
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reviewing, setReviewing] = useState(null);

  const handleUpdate = (id, status, remark) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status, remark } : r));
    push({ type: 'success', title: 'Status Updated', body: `${id} → ${STATUS_CFG[status].label}. Student has been notified.` });
  };

  const filtered = requests.filter(r =>
    (filterStatus === 'all' || r.status === filterStatus) &&
    (search === '' || r.student.toLowerCase().includes(search.toLowerCase()) ||
      r.rollNo.includes(search) || r.id.includes(search))
  );

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    processing: requests.filter(r => r.status === 'processing').length,
    ready: requests.filter(r => r.status === 'ready').length,
  };

  return (
    <DashboardLayout title="Certificate Processing" role={user?.role || 'ADMIN'}>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Stamp size={28} className="text-indigo-500" /> Certificate Processing Centre
          </h2>
          <p className="text-slate-400 mt-1">Review student certificate requests and update issuance status in real time.</p>
        </div>
        <div className="flex items-center gap-2">
          {stats.pending > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-amber-400 font-black text-[10px] uppercase tracking-widest">{stats.pending} Pending Review</span>
            </div>
          )}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Requests', value: stats.total,      color: '#6366f1', icon: FileText },
          { label: 'Pending',        value: stats.pending,    color: '#f59e0b', icon: Clock },
          { label: 'Processing',     value: stats.processing, color: '#3b82f6', icon: Zap },
          { label: 'Ready',          value: stats.ready,      color: '#10b981', icon: CheckCircle2 },
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by student name, roll number, or ID..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none">
          <option value="all" className="bg-slate-900">All Status</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v.label}</option>)}
        </select>
      </div>

      {/* Request List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((req, i) => {
            const st = STATUS_CFG[req.status];
            const CertIcon = CERT_ICONS[req.type] || FileText;
            const transitions = STATUS_TRANSITIONS[req.status] || [];
            return (
              <motion.div key={req.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${req.status === 'pending' ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/5 bg-[#080808]'} hover:border-white/10`}>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <CertIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="text-sm font-black text-white">{req.student} <span className="text-slate-500 font-normal text-xs">· {req.rollNo} · {req.dept} {req.year} yr</span></p>
                      <p className="text-[10px] text-indigo-400 font-bold mt-0.5">{CERT_LABELS[req.type]}</p>
                    </div>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${st.bg} ${st.border} ${st.color}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-1">{req.purpose}</p>
                  <div className="flex items-center gap-4 text-[9px] text-slate-500 font-mono">
                    <span>{req.id}</span>
                    <span>Applied: {req.appliedOn}</span>
                    <span>{req.mode} · {req.copies} copy</span>
                  </div>
                  {req.remark && (
                    <div className={`mt-2 p-2 rounded-xl text-[10px] ${req.status === 'rejected' ? 'bg-red-500/5 border border-red-500/20 text-red-300' : 'bg-white/5 border border-white/10 text-slate-400'}`}>
                      {req.remark}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(req.status === 'ready' || req.status === 'dispatched') && (
                    <button onClick={() => push({ type: 'success', title: 'Downloading...', body: 'Certificate PDF prepared for dispatch.' })}
                      className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                      <Download size={14} />
                    </button>
                  )}
                  {transitions.length > 0 && (
                    <button onClick={() => setReviewing(req)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition-colors text-[10px] font-black uppercase tracking-widest">
                      <Eye size={12} /> Review
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <FileText size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">No requests match your filters.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {reviewing && <ReviewModal req={reviewing} onClose={() => setReviewing(null)} onUpdate={handleUpdate} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
