import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Clock, CheckCircle2, XCircle, Download,
  Send, X, AlertTriangle, Shield, Stamp, BookOpen, Plane
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const CERT_TYPES = [
  {
    id: 'bonafide',
    label: 'Bonafide Certificate',
    icon: Shield,
    color: '#6366f1',
    description: 'Certifies you are a bona-fide student of this institution.',
    processDays: 2,
    fee: 0,
  },
  {
    id: 'transcript',
    label: 'Official Transcript',
    icon: BookOpen,
    color: '#3b82f6',
    description: 'Certified academic transcript with all semester marks.',
    processDays: 5,
    fee: 100,
  },
  {
    id: 'conduct',
    label: 'Character & Conduct Certificate',
    icon: CheckCircle2,
    color: '#10b981',
    description: 'Certifies good character and conduct during the course.',
    processDays: 3,
    fee: 0,
  },
  {
    id: 'tc',
    label: 'Transfer Certificate',
    icon: Plane,
    color: '#f59e0b',
    description: 'Required for admission transfers. Confirms institutional release.',
    processDays: 7,
    fee: 200,
  },
  {
    id: 'migration',
    label: 'Migration Certificate',
    icon: FileText,
    color: '#8b5cf6',
    description: 'University-issued migration certificate for board transfers.',
    processDays: 10,
    fee: 500,
  },
  {
    id: 'medium',
    label: 'Medium of Instruction',
    icon: Stamp,
    color: '#ec4899',
    description: 'Certifies that instruction was conducted in English.',
    processDays: 2,
    fee: 0,
  },
];

const STATUS_CFG = {
  pending:    { label: 'Pending Review', color: 'text-amber-400', bg: 'bg-amber-500/10',    border: 'border-amber-500/20',    dot: 'bg-amber-400 animate-ping' },
  processing: { label: 'Processing',     color: 'text-blue-400',  bg: 'bg-blue-500/10',     border: 'border-blue-500/20',     dot: 'bg-blue-400' },
  ready:      { label: 'Ready for Pickup',color: 'text-emerald-400',bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',  dot: 'bg-emerald-400 animate-ping' },
  dispatched: { label: 'Dispatched',     color: 'text-purple-400', bg: 'bg-purple-500/10',   border: 'border-purple-500/20',   dot: 'bg-purple-400' },
  rejected:   { label: 'Rejected',       color: 'text-red-400',   bg: 'bg-red-500/10',      border: 'border-red-500/20',      dot: 'bg-red-400' },
};

const INITIAL_REQUESTS = [
  { id: 'CERT-001', type: 'bonafide', purpose: 'Bank loan application for laptop financing', mode: 'physical', status: 'processing', appliedOn: '20 Mar 2026', expectedBy: '22 Mar 2026', remark: '' },
  { id: 'CERT-002', type: 'transcript', purpose: 'Graduate school application – IIT Delhi', mode: 'email', status: 'ready', appliedOn: '15 Mar 2026', expectedBy: '20 Mar 2026', remark: 'Please collect from AR Office, Room 102.' },
  { id: 'CERT-003', type: 'conduct', purpose: 'Job application at Infosys', mode: 'physical', status: 'rejected', appliedOn: '10 Mar 2026', expectedBy: '', remark: 'Pending clearance of library dues. Please clear dues and re-apply.' },
];

function ApplyModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ type: 'bonafide', purpose: '', mode: 'physical', copies: 1 });
  const certData = CERT_TYPES.find(c => c.id === form.type);
  const ok = form.purpose.trim().length > 10;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-black text-white text-lg flex items-center gap-2">
            <FileText size={18} className="text-indigo-400" /> Request a Certificate
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Certificate Type Grid */}
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Select Certificate Type</label>
            <div className="grid grid-cols-2 gap-2">
              {CERT_TYPES.map(ct => (
                <button key={ct.id} onClick={() => setForm(p => ({ ...p, type: ct.id }))}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${form.type === ct.id ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'}`}>
                  <ct.icon size={14} style={{ color: ct.color, flexShrink: 0 }} />
                  <span className={`text-[10px] font-black leading-tight ${form.type === ct.id ? 'text-white' : 'text-slate-400'}`}>{ct.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selected cert info */}
          {certData && (
            <div className="p-3 rounded-xl border flex items-start gap-3" style={{ borderColor: `${certData.color}30`, backgroundColor: `${certData.color}08` }}>
              <certData.icon size={14} style={{ color: certData.color, flexShrink: 0, marginTop: 1 }} />
              <div className="flex-1 min-w-0 text-[11px] text-slate-400 leading-relaxed">{certData.description}</div>
              <div className="flex-shrink-0 text-right">
                <p className="text-[9px] font-black text-slate-500 uppercase">{certData.processDays}d process</p>
                {certData.fee > 0 && <p className="text-[10px] font-black" style={{ color: certData.color }}>₹{certData.fee}</p>}
                {certData.fee === 0 && <p className="text-[9px] text-emerald-400 font-black">Free</p>}
              </div>
            </div>
          )}

          {/* Purpose */}
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Purpose / Reason *</label>
            <textarea value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} rows={3}
              placeholder="State the specific purpose for which this certificate is required..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none transition-colors placeholder:text-slate-600" />
            {form.purpose.length > 0 && form.purpose.length < 10 && (
              <p className="text-[9px] text-amber-400 mt-1">Please provide at least 10 characters.</p>
            )}
          </div>

          {/* Delivery + Copies */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Delivery Mode</label>
              <select value={form.mode} onChange={e => setForm(p => ({ ...p, mode: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none">
                <option value="physical" className="bg-slate-900">Physical Copy</option>
                <option value="email" className="bg-slate-900">Email (PDF)</option>
                <option value="both" className="bg-slate-900">Both</option>
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Copies Required</label>
              <input type="number" value={form.copies} onChange={e => setForm(p => ({ ...p, copies: Math.max(1, +e.target.value) }))} min={1} max={5}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors" />
            </div>
          </div>

          <button onClick={() => { if (ok) { onSubmit(form); onClose(); } }} disabled={!ok}
            className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2">
            <Send size={14} /> Submit Request
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function StudentCertificates() {
  const { user } = useAuth();
  const { push } = useToast();
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [showApply, setShowApply] = useState(false);

  const handleApply = (form) => {
    const cert = CERT_TYPES.find(c => c.id === form.type);
    const expectedBy = new Date();
    expectedBy.setDate(expectedBy.getDate() + cert.processDays);
    const newReq = {
      id: `CERT-${String(requests.length + 10).padStart(3, '0')}`,
      type: form.type,
      purpose: form.purpose,
      mode: form.mode,
      status: 'pending',
      appliedOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      expectedBy: expectedBy.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      remark: '',
    };
    setRequests(p => [newReq, ...p]);
    push({
      type: 'success',
      title: 'Certificate Requested',
      body: `${newReq.id}: "${cert.label}" submitted. Expected by ${newReq.expectedBy}.`,
    });
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    ready: requests.filter(r => r.status === 'ready').length,
    done: requests.filter(r => r.status === 'dispatched').length,
  };

  return (
    <DashboardLayout title="Certificates" role={user?.role || 'STUDENT'}>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Stamp size={28} className="text-indigo-500" /> Certificate Requests
          </h2>
          <p className="text-slate-400 mt-1">Apply for official university documents. Track status in real time.</p>
        </div>
        <button onClick={() => setShowApply(true)}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]">
          <Plus size={15} /> Request Certificate
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Requests', value: stats.total,   color: '#6366f1' },
          { label: 'Pending',        value: stats.pending, color: '#f59e0b' },
          { label: 'Ready',          value: stats.ready,   color: '#10b981' },
          { label: 'Dispatched',     value: stats.done,    color: '#8b5cf6' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="p-4 rounded-2xl bg-[#080808] border border-white/5 flex items-center gap-3">
            <div className="w-2 h-10 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <div>
              <p className="text-2xl font-black text-white leading-none">{s.value}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Certificate Type Cards */}
      <div className="mb-8">
        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Available Certificate Types</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CERT_TYPES.map(ct => (
            <button key={ct.id} onClick={() => setShowApply(true)}
              className="p-3.5 rounded-2xl bg-[#080808] border border-white/5 hover:border-white/10 text-left transition-all group">
              <ct.icon size={18} style={{ color: ct.color }} className="mb-2" />
              <p className="text-[11px] font-black text-white group-hover:text-indigo-300 transition-colors leading-snug">{ct.label}</p>
              <div className="flex items-center justify-between mt-2 text-[9px]">
                <span className="text-slate-600">{ct.processDays} days</span>
                <span style={{ color: ct.color }} className="font-black">{ct.fee > 0 ? `₹${ct.fee}` : 'Free'}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* My Requests */}
      <div>
        <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">My Requests</h3>
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="text-center py-12 text-slate-600">
              <FileText size={28} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-bold">No requests yet.</p>
            </div>
          ) : (
            <AnimatePresence>
              {requests.map((req, i) => {
                const st = STATUS_CFG[req.status];
                const ct = CERT_TYPES.find(c => c.id === req.type);
                return (
                  <motion.div key={req.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-4 p-5 rounded-2xl bg-[#080808] border border-white/5 hover:border-white/10 transition-all">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${ct?.color}15`, color: ct?.color }}>
                      {ct && <ct.icon size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <div>
                          <p className="text-sm font-black text-white">{ct?.label}</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">{req.id} · Applied {req.appliedOn}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex-shrink-0 ${st.bg} ${st.border} ${st.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{req.purpose}</p>
                      {req.expectedBy && req.status !== 'rejected' && (
                        <p className="text-[9px] text-slate-500 mt-1">Expected by: <span className="text-white font-bold">{req.expectedBy}</span></p>
                      )}
                      {req.remark && (
                        <div className={`mt-2 p-2.5 rounded-xl text-[10px] leading-relaxed ${req.status === 'rejected' ? 'bg-red-500/5 border border-red-500/20 text-red-300' : 'bg-emerald-500/5 border border-emerald-500/20 text-emerald-300'}`}>
                          <span className="font-black">Admin Note: </span>{req.remark}
                        </div>
                      )}
                    </div>
                    {req.status === 'ready' || req.status === 'dispatched' ? (
                      <button onClick={() => push({ type: 'success', title: 'Downloading...', body: `${ct?.label} PDF is being prepared.` })}
                        className="flex-shrink-0 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-colors">
                        <Download size={15} />
                      </button>
                    ) : null}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showApply && <ApplyModal onClose={() => setShowApply(false)} onSubmit={handleApply} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
