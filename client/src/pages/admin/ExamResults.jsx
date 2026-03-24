import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Search, Send, Eye, EyeOff, CheckCircle2, XCircle,
  AlertTriangle, Download, Filter, BarChart2, ChevronDown, Users, TrendingUp
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useToast } from '../../components/ui/ToastSystem';

const GRADE_MAP = (score) => {
  if (score >= 90) return { grade: 'O',  color: '#10b981' };
  if (score >= 80) return { grade: 'A+', color: '#3b82f6' };
  if (score >= 70) return { grade: 'A',  color: '#6366f1' };
  if (score >= 60) return { grade: 'B+', color: '#8b5cf6' };
  if (score >= 50) return { grade: 'B',  color: '#f59e0b' };
  if (score >= 40) return { grade: 'C',  color: '#f97316' };
  return { grade: 'F', color: '#ef4444' };
};

const SUBJECTS = [
  { code: 'CS301', name: 'Data Structures', credits: 4 },
  { code: 'CS401', name: 'Operating Systems', credits: 4 },
  { code: 'CS501', name: 'Cloud Computing', credits: 3 },
  { code: 'CS302', name: 'DBMS', credits: 4 },
  { code: 'CS601', name: 'Software Engineering', credits: 3 },
];

const generateStudents = () =>
  Array.from({ length: 18 }, (_, i) => ({
    id: `CS2022${String(i + 1).padStart(3, '0')}`,
    name: ['Aarav Mehta', 'Priya Sharma', 'Rahul Verma', 'Sneha Iyer', 'Kiran Patel',
           'Ananya Roy', 'Vikram Singh', 'Divya Nair', 'Arjun Gupta', 'Pooja Joshi',
           'Ravi Kumar', 'Isha Reddy', 'Nikhil Rao', 'Meera Das', 'Suresh Pillai',
           'Tanvi Shah', 'Rohit Bhat', 'Kavya Menon'][i],
    scores: SUBJECTS.reduce((acc, s) => ({
      ...acc,
      [s.code]: { internal: Math.floor(Math.random() * 15 + 28), external: Math.floor(Math.random() * 35 + 38) }
    }), {}),
    published: false,
    withheld: false,
  }));

const INITIAL_STUDENTS = generateStudents();

export default function ExamResults() {
  const { push } = useToast();
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.includes(search)
  );

  const publishAll = () => {
    setStudents(prev => prev.map(s => ({ ...s, published: true, withheld: false })));
    push({ type: 'success', title: 'Results Published', body: `${students.length} student results are now LIVE and notified via email.` });
  };

  const publishOne = (id) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, published: true, withheld: false } : s));
    const name = students.find(s => s.id === id)?.name;
    push({ type: 'success', title: 'Result Published', body: `${name}'s marksheet is now visible in their portal.` });
  };

  const withholdOne = (id) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, published: false, withheld: true } : s));
    push({ type: 'warning', title: 'Result Withheld', body: `Student result flagged for admin review.` });
  };

  const getTotalScore = (s) => {
    const total = SUBJECTS.reduce((sum, sub) => {
      const sc = s.scores[sub.code];
      return sum + (sc ? sc.internal + sc.external : 0);
    }, 0);
    const max = SUBJECTS.length * (50 + 70);
    return { total, max, pct: Math.round((total / max) * 100) };
  };

  const getGradePoints = (pct) => {
    const { grade } = GRADE_MAP(pct);
    const map = { O: 10, 'A+': 9, A: 8, 'B+': 7, B: 6, C: 5, F: 0 };
    return map[grade] || 0;
  };

  const deptPassRate = Math.round(students.filter(s => {
    const { pct } = getTotalScore(s);
    return pct >= 40;
  }).length / students.length * 100);

  const avgScore = Math.round(students.reduce((sum, s) => sum + getTotalScore(s).pct, 0) / students.length);
  const published = students.filter(s => s.published).length;
  const withheld = students.filter(s => s.withheld).length;

  return (
    <DashboardLayout title="Result Management" role="ADMIN">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <FileText size={28} className="text-rose-500" />
            Result Publishing Engine
          </h2>
          <p className="text-slate-400 mt-1">Review, approve, withhold, and publish final marksheets.</p>
        </div>
        <button onClick={publishAll}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]">
          <Send size={15} /> Publish All Results
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Students', value: students.length, icon: Users, color: '#3b82f6' },
          { label: 'Published', value: published, icon: CheckCircle2, color: '#10b981' },
          { label: 'Withheld', value: withheld, icon: AlertTriangle, color: '#f59e0b' },
          { label: 'Pass Rate', value: `${deptPassRate}%`, icon: TrendingUp, color: '#8b5cf6' },
        ].map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="p-4 rounded-2xl bg-[#080808] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${kpi.color}15` }}>
              <kpi.icon size={18} style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-xl font-black text-white leading-none">{kpi.value}</p>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{kpi.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grade Distribution Bar */}
      <GlassCard className="mb-6">
        <div className="p-5 border-b border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><BarChart2 size={13} /> Grade Distribution</h3>
        </div>
        <div className="p-5">
          <div className="flex gap-1 h-12 items-end">
            {['O','A+','A','B+','B','C','F'].map((g) => {
              const count = students.filter(s => GRADE_MAP(getTotalScore(s).pct).grade === g).length;
              const h = Math.max(8, (count / students.length) * 100);
              const colors = { O:'#10b981','A+':'#3b82f6',A:'#6366f1','B+':'#8b5cf6',B:'#f59e0b',C:'#f97316',F:'#ef4444' };
              return (
                <div key={g} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-black text-slate-500">{count}</span>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="w-full rounded-t-lg" style={{ background: colors[g] }} />
                  <span className="text-[9px] font-black" style={{ color: colors[g] }}>{g}</span>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      {/* Search + Subject Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors placeholder:text-slate-600" />
        </div>
        <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
          className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500/50">
          <option value="ALL" className="bg-slate-900">All Subjects</option>
          {SUBJECTS.map(s => <option key={s.code} value={s.code} className="bg-slate-900">{s.name}</option>)}
        </select>
      </div>

      {/* Student Result Table */}
      <div className="space-y-2">
        {filtered.map((student, i) => {
          const { total, max, pct } = getTotalScore(student);
          const { grade, color } = GRADE_MAP(pct);
          const isExpanded = expandedId === student.id;
          const sgpa = SUBJECTS.reduce((sum, sub) => {
            const sc = student.scores[sub.code];
            const subPct = sc ? Math.round(((sc.internal + sc.external) / 120) * 100) : 0;
            return sum + getGradePoints(subPct) * sub.credits;
          }, 0) / SUBJECTS.reduce((s, sub) => s + sub.credits, 0);

          return (
            <motion.div key={student.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              className={`rounded-2xl border transition-all overflow-hidden ${student.withheld ? 'border-amber-500/20 bg-amber-500/5' : student.published ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 bg-[#080808]'}`}>
              {/* Row Header */}
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02]" onClick={() => setExpandedId(isExpanded ? null : student.id)}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background: `${color}20`, color }}>
                  {grade}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white">{student.name}</p>
                  <p className="text-[9px] text-slate-500 font-mono">{student.id} &middot; SGPA: {sgpa.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-black text-white">{total}<span className="text-slate-500 text-xs">/{max}</span></p>
                    <p className="text-[9px] text-slate-500">{pct}%</p>
                  </div>
                  {student.published && <span className="text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest hidden sm:block">Live</span>}
                  {student.withheld && <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-widest hidden sm:block">Held</span>}
                  <div className="flex gap-2">
                    <button onClick={e => { e.stopPropagation(); publishOne(student.id); }}
                      className="p-2 rounded-xl text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                      <Send size={13} />
                    </button>
                    <button onClick={e => { e.stopPropagation(); withholdOne(student.id); }}
                      className="p-2 rounded-xl text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors border border-amber-500/20">
                      <EyeOff size={13} />
                    </button>
                  </div>
                  <ChevronDown size={16} className={`text-slate-600 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
              </div>

              {/* Expanded Subject Breakdown */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/5">
                    <div className="p-5">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3">Subject-wise Breakdown</p>
                      <div className="space-y-2">
                        {SUBJECTS.map(sub => {
                          const sc = student.scores[sub.code];
                          const subTotal = sc.internal + sc.external;
                          const subPct = Math.round((subTotal / 120) * 100);
                          const { grade: sg, color: sc_color } = GRADE_MAP(subPct);
                          return (
                            <div key={sub.code} className="flex items-center gap-3">
                              <span className="text-[9px] font-black text-slate-500 w-14 flex-shrink-0">{sub.code}</span>
                              <span className="text-xs font-bold text-white flex-1 min-w-0 truncate">{sub.name}</span>
                              <span className="text-[10px] text-slate-400 hidden sm:block">{sc.internal}/50 + {sc.external}/70</span>
                              <span className="text-[10px] font-black text-white w-10 text-right">{subTotal}</span>
                              <span className="w-6 text-[9px] font-black text-center" style={{ color: sc_color }}>{sg}</span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-end mt-4">
                        <button onClick={() => push({ type: 'info', title: 'PDF Generated', body: `Marksheet for ${student.name} exported as PDF.` })}
                          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-colors">
                          <Download size={12} /> Download Marksheet
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
