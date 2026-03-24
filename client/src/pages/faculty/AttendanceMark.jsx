import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CheckCircle2, XCircle, Clock, BarChart2, ChevronDown,
  Zap, Send, Search, RotateCcw, BookOpen, Calendar, AlertTriangle
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const SUBJECTS = [
  { code: 'CS301', name: 'Data Structures & Algorithms', sem: 3, section: 'A' },
  { code: 'CS401', name: 'Operating Systems',           sem: 4, section: 'A' },
  { code: 'CS501', name: 'Cloud Computing',             sem: 5, section: 'B' },
];

const generateStudents = () => [
  'Aarav Mehta','Priya Sharma','Rahul Verma','Sneha Iyer','Kiran Patel',
  'Ananya Roy','Vikram Singh','Divya Nair','Arjun Gupta','Pooja Joshi',
  'Ravi Kumar','Isha Reddy','Nikhil Rao','Meera Das','Suresh Pillai',
  'Tanvi Shah','Rohit Bhat','Kavya Menon','Dev Sharma','Leena George',
].map((name, i) => ({
  id: `CS2022${String(i + 1).padStart(3, '0')}`,
  name,
  status: 'present', // present | absent | late | medical
  photo: name[0],
}));

const STATUS_CFG = {
  present: { label: 'Present', color: 'emerald', icon: CheckCircle2 },
  absent:  { label: 'Absent',  color: 'red',     icon: XCircle },
  late:    { label: 'Late',    color: 'amber',   icon: Clock },
  medical: { label: 'Medical', color: 'blue',    icon: Zap },
};

const COLOR = {
  emerald: { ring: 'ring-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-400', solid: 'bg-emerald-500' },
  red:     { ring: 'ring-red-500',     bg: 'bg-red-500/10',     text: 'text-red-400',     solid: 'bg-red-500' },
  amber:   { ring: 'ring-amber-500',   bg: 'bg-amber-500/10',   text: 'text-amber-400',   solid: 'bg-amber-500' },
  blue:    { ring: 'ring-blue-500',    bg: 'bg-blue-500/10',    text: 'text-blue-400',    solid: 'bg-blue-500' },
};

function StatusBtn({ status, current, onClick }) {
  const cfg = STATUS_CFG[status];
  const c = COLOR[cfg.color];
  const isActive = current === status;
  return (
    <button
      onClick={() => onClick(status)}
      className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all ${
        isActive ? `${c.solid} text-white shadow-lg` : `${c.bg} ${c.text} hover:ring-1 ${c.ring}`
      }`}
    >
      <cfg.icon size={10} />
      {cfg.label}
    </button>
  );
}

export default function FacultyAttendance() {
  const { user } = useAuth();
  const { push } = useToast();
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [students, setStudents] = useState(generateStudents());
  const [search, setSearch] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [date] = useState(() => new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }));

  // Reset when subject changes
  useEffect(() => {
    setStudents(generateStudents());
    setSubmitted(false);
  }, [selectedSubject.code]);

  const setStatus = (id, status) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const markAll = (status) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
    push({ type: 'info', title: `All Marked ${STATUS_CFG[status].label}`, body: `${students.length} students set to ${status}.` });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const counts = Object.fromEntries(Object.keys(STATUS_CFG).map(k => [k, students.filter(s => s.status === k).length]));
    push({
      type: 'success',
      title: 'Attendance Submitted',
      body: `${selectedSubject.code}: ${counts.present}P · ${counts.absent}A · ${counts.late}L · ${counts.medical}M — Synced to portal.`,
    });
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search));
  const counts = Object.fromEntries(Object.keys(STATUS_CFG).map(k => [k, students.filter(s => s.status === k).length]));
  const pct = Math.round((counts.present + counts.late) / students.length * 100);

  return (
    <DashboardLayout title="Attendance Manager" role={user?.role || 'FACULTY'}>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Users size={28} className="text-indigo-500" /> Attendance Engine
          </h2>
          <p className="text-slate-400 mt-1">Real-time student attendance marking with instant portal sync.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => markAll('present')} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5">
            <CheckCircle2 size={12} /> All Present
          </button>
          <button onClick={() => markAll('absent')} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-colors flex items-center gap-1.5">
            <XCircle size={12} /> All Absent
          </button>
          <button onClick={() => { setStudents(generateStudents()); setSubmitted(false); }} className="p-2 bg-white/5 border border-white/10 text-slate-400 rounded-xl hover:bg-white/10 transition-colors">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Subject Selector */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {SUBJECTS.map(sub => (
          <button key={sub.code} onClick={() => setSelectedSubject(sub)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${
              selectedSubject.code === sub.code
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                : 'bg-white/[0.02] border-white/10 text-slate-500 hover:border-white/20 hover:text-white'
            }`}
          >
            <BookOpen size={12} /> {sub.code}
            <span className="opacity-60">· Sem {sub.sem} Sec {sub.section}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        {/* Summary card */}
        <div className="lg:col-span-1 p-5 rounded-2xl bg-[#080808] border border-white/5 flex flex-col gap-4">
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Live Attendance</p>
            <div className="flex items-end gap-1 mb-3">
              <p className="text-5xl font-black text-white leading-none">{pct}</p>
              <p className="text-slate-500 text-xl font-black mb-1">%</p>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500" />
            </div>
          </div>
          <div className="space-y-2">
            {Object.entries(STATUS_CFG).map(([k, v]) => {
              const c = COLOR[v.color];
              return (
                <div key={k} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${c.solid}`} />
                    <span className={`text-[10px] font-black ${c.text}`}>{v.label}</span>
                  </div>
                  <span className="text-white font-black text-sm tabular-nums">{counts[k]}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold">
              <Calendar size={11} /> {date}
            </div>
            <div className="text-[9px] text-slate-500 font-bold truncate">{selectedSubject.name}</div>
          </div>
        </div>

        {/* Student Grid */}
        <div className="lg:col-span-3">
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
          </div>
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 custom-scroll">
            <AnimatePresence>
              {filtered.map((student, i) => {
                const sc = STATUS_CFG[student.status];
                const c = COLOR[sc.color];
                return (
                  <motion.div key={student.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className={`flex items-center gap-4 p-3 rounded-2xl border transition-all ${c.bg} ${c.ring.replace('ring-','border-').replace('500','500/30')}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 text-white ${c.solid} shadow-lg`}>
                      {student.photo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate">{student.name}</p>
                      <p className="text-[9px] text-slate-500 font-mono">{student.id}</p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0 flex-wrap justify-end">
                      {Object.keys(STATUS_CFG).map(s => (
                        <StatusBtn key={s} status={s} current={student.status} onClick={st => setStatus(student.id, st)} />
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Submit Bar */}
      <div className={`fixed bottom-6 right-6 z-40 transition-all ${submitted ? 'opacity-50' : 'opacity-100'}`}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleSubmit} disabled={submitted}
          className={`flex items-center gap-3 px-8 py-4 rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all ${
            submitted
              ? 'bg-emerald-500 text-white cursor-default'
              : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_30px_rgba(99,102,241,0.5)]'
          }`}
        >
          {submitted ? <><CheckCircle2 size={18} /> Submitted!</> : <><Send size={18} /> Submit Attendance ({students.length} students)</>}
        </motion.button>
      </div>

      {/* At-risk notice */}
      {counts.absent >= 3 && (
        <div className="mt-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-300">
            <span className="font-black">{counts.absent} students absent today.</span>{' '}
            Students with &gt;25% absences will be flagged for shortfall notices automatically.
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}
