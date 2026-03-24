import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Plus, X, Pin, Megaphone, Calendar, Tag,
  ChevronDown, Users, BookOpen, Briefcase, Search, Globe
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const AUDIENCE_OPTS = ['All Roles', 'Students', 'Faculty', 'HOD', 'Parents', 'Alumni'];
const TYPE_CFG = {
  general:   { label: 'General',   color: '#6366f1', bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  text: 'text-indigo-400'  },
  academic:  { label: 'Academic',  color: '#3b82f6', bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    text: 'text-blue-400'    },
  exam:      { label: 'Exam',      color: '#ef4444', bg: 'bg-red-500/10',     border: 'border-red-500/20',     text: 'text-red-400'     },
  event:     { label: 'Event',     color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400' },
  placement: { label: 'Placement', color: '#f59e0b', bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   text: 'text-amber-400'   },
  holiday:   { label: 'Holiday',   color: '#8b5cf6', bg: 'bg-purple-500/10',  border: 'border-purple-500/20',  text: 'text-purple-400'  },
};

const INITIAL = [
  { id: 1, title: 'Semester 6 End Exams – Revised Schedule', body: 'Due to the upcoming national holidays, Sem 6 examinations have been rescheduled. The revised timetable is available in the Exam section. Students are advised to check updated hall assignments.', type: 'exam', audience: 'Students', pinned: true, author: 'Exam Department', date: '22 Mar 2026', read: false },
  { id: 2, title: 'TCS & Infosys Pre-Placement Talk – 28 March', body: 'TCS and Infosys will conduct a joint Pre-Placement Orientation on 28 March 2026 in the Main Auditorium at 10:00 AM. All final-year students are requested to attend with updated resumes. Dress code: Formal.', type: 'placement', audience: 'Students', pinned: true, author: 'Placement Cell', date: '21 Mar 2026', read: false },
  { id: 3, title: 'Internal Marks Submission Deadline – 25 Mar', body: 'All faculty members are reminded to submit CIE (Continuous Internal Evaluation) marks for the current semester through the Faculty Portal before 25 March 2026. Late submissions will not be accepted.', type: 'academic', audience: 'Faculty', pinned: false, author: 'Academic Office', date: '20 Mar 2026', read: true },
  { id: 4, title: 'National Science Day Symposium – Results', body: 'Congratulations to the winning teams from CSE and ECE departments! Full results and photos from the annual symposium are now available. Special awards: Best Research Paper – AI-Driven Smart Irrigation.', type: 'event', audience: 'All Roles', pinned: false, author: 'Dean of Students', date: '19 Mar 2026', read: true },
  { id: 5, title: 'Holi Holiday – 25 March', body: 'The institute will remain closed on 25th March 2026 (Tuesday) on account of Holi. Academic activities will resume on 26th March. Hostel students needing special arrangements should contact the warden.', type: 'holiday', audience: 'All Roles', pinned: false, author: 'Administration', date: '18 Mar 2026', read: true },
];

function AnnCard({ ann, canPin, onPin, onDelete, onRead }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CFG[ann.type];

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border transition-all overflow-hidden ${ann.pinned ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 bg-[#080808]'} ${!ann.read ? 'ring-1 ring-inset ring-white/10' : ''}`}>
      <div className="flex items-start gap-4 p-5 cursor-pointer" onClick={() => { setExpanded(e => !e); onRead(ann.id); }}>
        {!ann.read && <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0 mt-1.5" />}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {ann.pinned && <Pin size={11} className="text-indigo-400 flex-shrink-0" />}
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}>{cfg.label}</span>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">{ann.audience}</span>
          </div>
          <h3 className="text-sm font-black text-white leading-snug">{ann.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-[9px] text-slate-500 font-bold">
            <span>{ann.author}</span><span>·</span><span>{ann.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {canPin && (
            <button onClick={e => { e.stopPropagation(); onPin(ann.id); }}
              className={`p-1.5 rounded-lg transition-colors ${ann.pinned ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-600 hover:text-white'}`}>
              <Pin size={14} />
            </button>
          )}
          {canPin && (
            <button onClick={e => { e.stopPropagation(); onDelete(ann.id); }}
              className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-colors">
              <X size={14} />
            </button>
          )}
          <ChevronDown size={14} className={`text-slate-600 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5">
            <p className="px-5 py-4 text-sm text-slate-300 leading-relaxed">{ann.body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PostModal({ onClose, onPost }) {
  const [form, setForm] = useState({ title: '', body: '', type: 'general', audience: 'All Roles', pinned: false });
  const ok = form.title.trim() && form.body.trim();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-black text-white text-lg flex items-center gap-2"><Megaphone size={18} className="text-indigo-400" /> Post Announcement</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Headline *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Announcement title..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Content *</label>
            <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={4}
              placeholder="Full announcement text..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 resize-none transition-colors placeholder:text-slate-600" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none">
                {Object.entries(TYPE_CFG).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Audience</label>
              <select value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none">
                {AUDIENCE_OPTS.map(a => <option key={a} value={a} className="bg-slate-900">{a}</option>)}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => setForm(p => ({ ...p, pinned: !p.pinned }))}
              className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${form.pinned ? 'bg-indigo-500' : 'bg-white/10'}`}>
              <motion.div animate={{ x: form.pinned ? 16 : 0 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="w-4 h-4 rounded-full bg-white shadow" />
            </div>
            <span className="text-sm font-bold text-slate-300">Pin this announcement</span>
          </label>
          <button onClick={() => { if (ok) { onPost(form); onClose(); } }} disabled={!ok}
            className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-30 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2">
            <Megaphone size={14} /> Broadcast Announcement
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Announcements() {
  const { user } = useAuth();
  const { push } = useToast();
  const [announcements, setAnnouncements] = useState(INITIAL);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showPost, setShowPost] = useState(false);

  const role = user?.role?.toUpperCase() || 'STUDENT';
  const canPost = ['ADMIN', 'HOD', 'CHAIRMAN', 'DIRECTOR', 'FACULTY'].includes(role);
  const unread = announcements.filter(a => !a.read).length;

  const filtered = announcements.filter(a =>
    (filterType === 'all' || a.type === filterType) &&
    (search === '' || a.title.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  const handlePost = (form) => {
    const newAnn = {
      id: Date.now(),
      ...form,
      author: user?.name || 'Administration',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      read: false,
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    push({ type: 'success', title: 'Announcement Posted', body: `"${form.title}" broadcast to ${form.audience}.` });
  };

  const handlePin = (id) => setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a));
  const handleDelete = (id) => { setAnnouncements(prev => prev.filter(a => a.id !== id)); push({ type: 'warning', title: 'Announcement Removed', body: 'Notice deleted from the board.' }); };
  const handleRead = (id) => setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));

  return (
    <DashboardLayout title="Notice Board" role={user?.role || 'STUDENT'}>
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Bell size={28} className="text-amber-500" />
            Notice Board
            {unread > 0 && <span className="text-base bg-red-500 text-white px-2.5 py-0.5 rounded-full font-black">{unread}</span>}
          </h2>
          <p className="text-slate-400 mt-1">College-wide announcements, exam alerts, and event updates.</p>
        </div>
        {canPost && (
          <button onClick={() => setShowPost(true)}
            className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Plus size={15} /> Post Announcement
          </button>
        )}
      </div>

      {/* Type Filter Pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={() => setFilterType('all')}
          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${filterType === 'all' ? 'bg-white/10 text-white border-white/20' : 'bg-transparent text-slate-500 border-white/10 hover:border-white/20 hover:text-white'}`}>
          All ({announcements.length})
        </button>
        {Object.entries(TYPE_CFG).map(([k, v]) => {
          const count = announcements.filter(a => a.type === k).length;
          if (!count) return null;
          return (
            <button key={k} onClick={() => setFilterType(k)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${filterType === k ? `${v.bg} ${v.border} ${v.text}` : 'bg-transparent text-slate-500 border-white/10 hover:border-white/20 hover:text-white'}`}>
              {v.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..."
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(ann => (
            <AnnCard key={ann.id} ann={ann} canPost={canPost} canPin={canPost}
              onPin={handlePin} onDelete={handleDelete} onRead={handleRead} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <Bell size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">No announcements match your search.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showPost && <PostModal onClose={() => setShowPost(false)} onPost={handlePost} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
