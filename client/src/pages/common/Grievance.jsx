import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Plus, Search, ChevronDown, Send, X, Clock,
  CheckCircle2, AlertTriangle, Zap, User, ArrowRight, Filter,
  LifeBuoy, ShieldAlert, BookOpen, Banknote, Bus, Wifi, Lock
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const CATEGORIES = [
  { id: 'academic',   label: 'Academic',       icon: BookOpen,    color: '#6366f1' },
  { id: 'finance',    label: 'Finance/Fees',   icon: Banknote,    color: '#10b981' },
  { id: 'transport',  label: 'Transport',      icon: Bus,         color: '#f59e0b' },
  { id: 'infra',      label: 'Infrastructure', icon: Wifi,        color: '#3b82f6' },
  { id: 'security',   label: 'Security',       icon: Lock,        color: '#ef4444' },
  { id: 'other',      label: 'Other',          icon: LifeBuoy,    color: '#8b5cf6' },
];

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: 'text-red-400',   bg: 'bg-red-500/10',   border: 'border-red-500/20' },
  medium: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  low:    { label: 'Low',    color: 'text-blue-400',  bg: 'bg-blue-500/10',  border: 'border-blue-500/20' },
};

const STATUS_CONFIG = {
  open:        { label: 'Open',        color: 'text-amber-400', bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   dot: 'bg-amber-400 animate-ping' },
  in_progress: { label: 'In Progress', color: 'text-blue-400',  bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    dot: 'bg-blue-400' },
  resolved:    { label: 'Resolved',    color: 'text-emerald-400',bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  escalated:   { label: 'Escalated',  color: 'text-red-400',   bg: 'bg-red-500/10',     border: 'border-red-500/20',     dot: 'bg-red-400 animate-ping' },
};

const INITIAL_TICKETS = [
  { id: 'GRV-1042', title: 'Internal marks not updated after re-evaluation', category: 'academic', priority: 'high', status: 'in_progress', raised: 'Rahul Kumar · CS2022001', date: '20 Mar 2026', dept: 'HOD – CSE', replies: [{ from: 'HOD Office', text: 'We have forwarded this to the concerned faculty. Expected resolution in 2 days.', time: '21 Mar, 10:30 AM' }] },
  { id: 'GRV-1041', title: 'Fee receipt not generated after online payment', category: 'finance', priority: 'high', status: 'open', raised: 'Priya Sharma · CS2022048', date: '21 Mar 2026', dept: 'Finance Cell', replies: [] },
  { id: 'GRV-1040', title: 'Bus route 7 consistently delayed by 30 min', category: 'transport', priority: 'medium', status: 'resolved', raised: 'Aditya Singh · ME2022015', date: '18 Mar 2026', dept: 'Transport Dept', replies: [{ from: 'Bus Management', text: 'Driver shift adjusted. Route 7 now departs 7:15 AM sharp. Resolved.', time: '19 Mar, 2:00 PM' }] },
  { id: 'GRV-1039', title: 'Library WiFi speed below 2 Mbps in reading hall', category: 'infra', priority: 'medium', status: 'escalated', raised: 'Sneha Iyer · EC2022033', date: '19 Mar 2026', dept: 'IT & Networks', replies: [{ from: 'IT Helpdesk', text: 'Issue escalated to ISP vendor. Replacement router scheduled for 23 Mar.', time: '20 Mar, 9:00 AM' }] },
  { id: 'GRV-1038', title: 'CCTV blind spot near girls hostel block B entry', category: 'security', priority: 'high', status: 'in_progress', raised: 'Anonymous', date: '17 Mar 2026', dept: 'Security Office', replies: [] },
];

function RaisedBadge({ role }) {
  const canRaise = !['ADMIN', 'CHAIRMAN', 'DIRECTOR'].includes(role?.toUpperCase());
  return canRaise;
}

function TicketCard({ ticket, isAdmin, onSelect, onStatusChange }) {
  const st = STATUS_CONFIG[ticket.status];
  const pr = PRIORITY_CONFIG[ticket.priority];
  const cat = CATEGORIES.find(c => c.id === ticket.category);

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      onClick={() => onSelect(ticket)}
      className="group p-5 rounded-2xl bg-[#080808] border border-white/5 hover:border-white/10 cursor-pointer transition-all">
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${cat?.color}15`, color: cat?.color }}>
          {cat && <cat.icon size={16} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-sm font-black text-white leading-snug group-hover:text-indigo-300 transition-colors">{ticket.title}</h3>
            <div className={`flex items-center gap-1.5 flex-shrink-0 px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${st.bg} ${st.border} ${st.color}`}>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
              {st.label}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500">
            <span className="font-mono">{ticket.id}</span>
            <span>{ticket.raised}</span>
            <span>{ticket.dept}</span>
            <span className={`font-black ${pr.color}`}>⬥ {pr.label}</span>
            <span>{ticket.date}</span>
            {ticket.replies.length > 0 && <span className="text-indigo-400">{ticket.replies.length} reply</span>}
          </div>
        </div>
        {isAdmin && (
          <select
            value={ticket.status}
            onClick={e => e.stopPropagation()}
            onChange={e => { e.stopPropagation(); onStatusChange(ticket.id, e.target.value); }}
            className="flex-shrink-0 bg-white/5 border border-white/10 rounded-xl px-2 py-1.5 text-[10px] font-black text-slate-300 focus:outline-none">
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k} className="bg-slate-900">{v.label}</option>
            ))}
          </select>
        )}
      </div>
    </motion.div>
  );
}

function TicketDetail({ ticket, onClose, onReply, isAdmin }) {
  const [reply, setReply] = useState('');
  const st = STATUS_CONFIG[ticket.status];
  const cat = CATEGORIES.find(c => c.id === ticket.category);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-start gap-4 flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${cat?.color}15`, color: cat?.color }}>
            {cat && <cat.icon size={18} />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-white text-base leading-snug">{ticket.title}</h3>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
              <span className="font-mono">{ticket.id}</span>
              <span>·</span>
              <span>{ticket.raised}</span>
              <span>·</span>
              <span className={`font-black ${st.color}`}>{st.label}</span>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors flex-shrink-0">
            <X size={15} />
          </button>
        </div>

        {/* Reply Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
          {ticket.replies.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">No replies yet. Be the first to respond.</p>
            </div>
          ) : ticket.replies.map((r, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[9px] font-black text-indigo-400">{r.from[0]}</div>
                <span className="text-xs font-black text-white">{r.from}</span>
                <span className="text-[9px] text-slate-500 ml-auto">{r.time}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>

        {/* Reply box */}
        <div className="p-5 border-t border-white/5 flex-shrink-0">
          <div className="flex gap-3">
            <textarea
              value={reply} onChange={e => setReply(e.target.value)}
              placeholder={isAdmin ? 'Write an official response...' : 'Add more details or follow up...'}
              rows={2}
              className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none transition-colors" />
            <button
              onClick={() => { if (reply.trim()) { onReply(ticket.id, reply); setReply(''); } }}
              disabled={!reply.trim()}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 text-white rounded-2xl transition-all flex items-center gap-2 flex-shrink-0 font-black text-xs uppercase tracking-widest">
              <Send size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function NewTicketModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', category: 'academic', priority: 'medium', description: '' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-black text-white text-lg flex items-center gap-2"><LifeBuoy size={18} className="text-indigo-400" /> Raise Grievance</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Subject *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Brief description of the issue..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none">
                {CATEGORIES.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Priority</label>
              <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none">
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={4}
              placeholder="Provide detailed information about the issue, when it occurred, and any steps taken..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none transition-colors placeholder:text-slate-600" />
          </div>
          <button onClick={() => { if (form.title) { onSubmit(form); onClose(); } }}
            disabled={!form.title}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Send size={14} /> Submit Grievance
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Grievance() {
  const { user } = useAuth();
  const { push } = useToast();
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const role = user?.role?.toUpperCase() || 'STUDENT';
  const isAdmin = ['ADMIN', 'HOD', 'CHAIRMAN', 'DIRECTOR', 'FACULTY'].includes(role);

  const filtered = tickets.filter(t =>
    (filterStatus === 'all' || t.status === filterStatus) &&
    (filterCat === 'all' || t.category === filterCat) &&
    (search === '' || t.title.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search))
  );

  const handleStatusChange = (id, newStatus) => {
    setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    push({ type: 'success', title: 'Status Updated', body: `Ticket ${id} marked as ${STATUS_CONFIG[newStatus].label}.` });
  };

  const handleReply = (id, text) => {
    const from = isAdmin ? 'Admin Office' : (user?.name || 'Student');
    setTickets(prev => prev.map(t => t.id === id
      ? { ...t, replies: [...t.replies, { from, text, time: 'Just now' }] }
      : t));
    if (selectedTicket?.id === id) {
      setSelectedTicket(prev => ({
        ...prev, replies: [...prev.replies, { from, text, time: 'Just now' }]
      }));
    }
    push({ type: 'success', title: 'Reply Sent', body: 'Your response has been recorded.' });
  };

  const handleNewTicket = (form) => {
    const newTicket = {
      id: `GRV-${1043 + tickets.length}`,
      title: form.title,
      category: form.category,
      priority: form.priority,
      status: 'open',
      raised: `${user?.name || 'You'} · ${user?.id || 'Unknown'}`,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      dept: CATEGORIES.find(c => c.id === form.category)?.label || 'General',
      replies: [],
    };
    setTickets(prev => [newTicket, ...prev]);
    push({ type: 'success', title: 'Grievance Raised', body: `${newTicket.id} has been submitted. You'll receive updates within 48 hours.` });
  };

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    escalated: tickets.filter(t => t.status === 'escalated').length,
  };

  return (
    <DashboardLayout title="Grievance Portal" role={user?.role || 'STUDENT'}>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <LifeBuoy size={28} className="text-indigo-500" />
            {isAdmin ? 'Grievance Management' : 'My Grievances'}
          </h2>
          <p className="text-slate-400 mt-1">{isAdmin ? 'Manage, respond, and resolve institutional complaints.' : 'Raise and track support requests with real-time status updates.'}</p>
        </div>
        {!['ADMIN', 'CHAIRMAN', 'DIRECTOR'].includes(role) && (
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]">
            <Plus size={15} /> Raise Grievance
          </button>
        )}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Open',        value: stats.open,       color: '#f59e0b', icon: Clock },
          { label: 'In Progress', value: stats.inProgress, color: '#3b82f6', icon: Zap },
          { label: 'Resolved',    value: stats.resolved,   color: '#10b981', icon: CheckCircle2 },
          { label: 'Escalated',   value: stats.escalated,  color: '#ef4444', icon: ShieldAlert },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => setFilterStatus(s.label.toLowerCase().replace(' ','_'))}
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title or ticket ID..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none">
          <option value="all" className="bg-slate-900">All Status</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v.label}</option>)}
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none">
          <option value="all" className="bg-slate-900">All Categories</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.label}</option>)}
        </select>
      </div>

      {/* Ticket List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} isAdmin={isAdmin}
              onSelect={setSelectedTicket} onStatusChange={handleStatusChange} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">No tickets match your filters.</p>
            {!isAdmin && <button onClick={() => setShowNew(true)} className="mt-4 text-indigo-400 text-sm font-black underline hover:no-underline">Raise your first grievance →</button>}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {selectedTicket && <TicketDetail ticket={selectedTicket} onClose={() => setSelectedTicket(null)} onReply={handleReply} isAdmin={isAdmin} />}
        {showNew && <NewTicketModal onClose={() => setShowNew(false)} onSubmit={handleNewTicket} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
