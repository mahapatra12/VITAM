import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, AlertTriangle, TrendingDown, Users, Search,
  ChevronDown, Shield, Activity, Clock, BarChart2, Zap,
  MessageSquare, FileText, Filter
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const RISK_LEVELS = {
  critical: { label: 'Critical',   color: '#ef4444', bg: 'bg-red-500/10',    border: 'border-red-500/30',    text: 'text-red-400',    bar: 'bg-red-500' },
  high:     { label: 'High Risk',  color: '#f59e0b', bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-400',  bar: 'bg-amber-500' },
  moderate: { label: 'Moderate',   color: '#6366f1', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', bar: 'bg-indigo-500' },
  low:      { label: 'Low Risk',   color: '#10b981', bg: 'bg-emerald-500/10',border: 'border-emerald-500/30',text: 'text-emerald-400',bar: 'bg-emerald-500' },
};

const STUDENTS = [
  {
    id: 'CS2022001', name: 'Kiran Reddy', dept: 'CSE', year: '3rd', sem: 5,
    attendance: 52, cgpa: 5.8, feesDue: 48500, assignmentsSubmitted: 45,
    riskLevel: 'critical',
    flags: ['Attendance below 60%', 'CGPA dropped 1.2 this sem', 'Outstanding fee dues'],
    aiInsight: 'Student shows multi-dimensional academic stress. Immediate counselling recommended before mid-semester break.',
  },
  {
    id: 'EC2022033', name: 'Sneha Iyer', dept: 'ECE', year: '2nd', sem: 3,
    attendance: 64, cgpa: 6.4, feesDue: 0, assignmentsSubmitted: 70,
    riskLevel: 'high',
    flags: ['Attendance borderline (64%)', 'Internal marks dropped 15% this sem'],
    aiInsight: 'Consistent decline in academic engagement. Recommend faculty outreach and peer support assignment.',
  },
  {
    id: 'ME2022015', name: 'Aditya Singh', dept: 'MECH', year: '3rd', sem: 5,
    attendance: 68, cgpa: 6.9, feesDue: 12000, assignmentsSubmitted: 80,
    riskLevel: 'high',
    flags: ['Partial fee dues pending', 'Timetable conflicts causing absence spikes'],
    aiInsight: 'Financial stress may be impacting academic performance. Consider scholarship referral.',
  },
  {
    id: 'CS2022088', name: 'Dev Sharma', dept: 'CSE', year: '2nd', sem: 3,
    attendance: 72, cgpa: 7.2, feesDue: 0, assignmentsSubmitted: 82,
    riskLevel: 'moderate',
    flags: ['3 assignments missed in CS401', 'Quiz average below class mean'],
    aiInsight: 'Student performance trending downward. Early intervention with faculty mentor suggested.',
  },
  {
    id: 'CV2022009', name: 'Ananya Blore', dept: 'CIVIL', year: '2nd', sem: 3,
    attendance: 75, cgpa: 7.5, feesDue: 0, assignmentsSubmitted: 90,
    riskLevel: 'moderate',
    flags: ['Frequent late arrivals reducing effective attendance'],
    aiInsight: 'Generally good profile but punctuality issues if uncorrected may escalate. Soft intervention recommended.',
  },
  {
    id: 'CS2022048', name: 'Priya Sharma', dept: 'CSE', year: '3rd', sem: 5,
    attendance: 88, cgpa: 8.9, feesDue: 0, assignmentsSubmitted: 98,
    riskLevel: 'low',
    flags: [],
    aiInsight: 'Top performer — no risk signals. Candidate for merit scholarship nomination.',
  },
];

function RiskBar({ value, max = 100, color }) {
  return (
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div initial={{ width: 0 }} animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8 }}
        className={`h-full rounded-full ${color}`} />
    </div>
  );
}

function StudentRiskCard({ student, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const rl = RISK_LEVELS[student.riskLevel];

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border overflow-hidden transition-all ${rl.border} ${rl.bg}`}>
      <div className="flex items-start gap-4 p-5 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg text-white flex-shrink-0"
          style={{ background: `${rl.color}25`, border: `1px solid ${rl.color}40` }}>
          {student.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="text-sm font-black text-white">{student.name}</p>
              <p className="text-[10px] text-slate-500 font-mono">{student.id} · {student.dept} · {student.year} Year</p>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex-shrink-0 border ${rl.bg} ${rl.border} ${rl.text}`}>
              ⬥ {rl.label}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[
              { label: 'Attendance', value: `${student.attendance}%`, warn: student.attendance < 75, bar: student.attendance },
              { label: 'CGPA', value: student.cgpa.toFixed(1), warn: student.cgpa < 7, bar: student.cgpa * 10 },
              { label: 'Assignments', value: `${student.assignmentsSubmitted}%`, warn: student.assignmentsSubmitted < 70, bar: student.assignmentsSubmitted },
            ].map(m => (
              <div key={m.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest">{m.label}</span>
                  <span className={`text-[10px] font-black ${m.warn ? rl.text : 'text-white'}`}>{m.value}</span>
                </div>
                <RiskBar value={m.bar} color={m.warn ? rl.bar : 'bg-slate-600'} />
              </div>
            ))}
          </div>

          {/* Risk Flags */}
          {student.flags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {student.flags.map((f, i) => (
                <span key={i} className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest ${rl.bg} ${rl.border} ${rl.text}`}>
                  ⚠ {f}
                </span>
              ))}
            </div>
          )}
        </div>
        <ChevronDown size={14} className={`text-slate-600 transition-transform flex-shrink-0 mt-1 ${expanded ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t" style={{ borderColor: `${rl.color}20` }}>
            <div className="p-5 space-y-4 bg-black/20">
              {/* AI Insight */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <Brain size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-1">AI Risk Analysis</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{student.aiInsight}</p>
                </div>
              </div>

              {/* Additional stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">Fee Dues</p>
                  <p className={`text-base font-black mt-0.5 ${student.feesDue > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {student.feesDue > 0 ? `₹${student.feesDue.toLocaleString()}` : 'Cleared ✓'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">Semester</p>
                  <p className="text-base font-black text-white mt-0.5">Sem {student.sem}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Send Alert to Student', icon: MessageSquare },
                  { label: 'Notify Parent',          icon: Users },
                  { label: 'Flag for Counselling',   icon: Shield },
                  { label: 'Generate Report',        icon: FileText },
                ].map(a => (
                  <button key={a.label} onClick={() => onAction(student, a.label)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 hover:text-white hover:bg-white/10 transition-colors uppercase tracking-widest">
                    <a.icon size={11} /> {a.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function StudentRiskAnalytics() {
  const { user } = useAuth();
  const { push } = useToast();
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

  const handleAction = (student, action) => {
    push({ type: 'success', title: action, body: `Action initiated for ${student.name} (${student.id}).` });
  };

  const filtered = STUDENTS.filter(s =>
    (filterRisk === 'all' || s.riskLevel === filterRisk) &&
    (search === '' || s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.includes(search) || s.dept.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = Object.fromEntries(Object.keys(RISK_LEVELS).map(k => [k, STUDENTS.filter(s => s.riskLevel === k).length]));

  return (
    <DashboardLayout title="Risk Analytics" role={user?.role || 'HOD'}>
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white flex items-center gap-3">
          <Brain size={28} className="text-purple-500" /> Student Risk Analytics
        </h2>
        <p className="text-slate-400 mt-1">AI-powered early warning system to identify and intervene for at-risk students.</p>
      </div>

      {/* Risk KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {Object.entries(RISK_LEVELS).map(([k, v], i) => (
          <motion.div key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            onClick={() => setFilterRisk(filterRisk === k ? 'all' : k)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${filterRisk === k ? `${v.bg} ${v.border}` : 'bg-[#080808] border-white/5 hover:border-white/10'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: v.color }}>{v.label}</p>
              {k === 'critical' && counts[k] > 0 && <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />}
            </div>
            <p className="text-3xl font-black text-white leading-none">{counts[k]}</p>
            <p className="text-[9px] text-slate-500 mt-0.5">students</p>
          </motion.div>
        ))}
      </div>

      {/* AI Summary Banner */}
      {counts.critical > 0 && (
        <div className="mb-5 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 flex items-start gap-3">
          <Brain size={18} className="text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-white mb-0.5">AI Risk Digest — {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              {counts.critical} student(s) are at <span className="text-red-400 font-bold">Critical Risk</span> — multi-factor alerts including attendance, CGPA, and fee status. Immediate department-level intervention recommended. {counts.high} student(s) at <span className="text-amber-400 font-bold">High Risk</span> need faculty counselling within the week.
            </p>
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, roll number, or department..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-slate-600" />
        </div>
        <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
          className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none">
          <option value="all" className="bg-slate-900">All Risk Levels</option>
          {Object.entries(RISK_LEVELS).map(([k, v]) => <option key={k} value={k} className="bg-slate-900">{v.label}</option>)}
        </select>
      </div>

      {/* Student Cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(s => <StudentRiskCard key={s.id} student={s} onAction={handleAction} />)}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <Shield size={28} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-bold">No students match your filters.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
