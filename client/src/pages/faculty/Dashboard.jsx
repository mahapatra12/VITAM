import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, BookOpen, Users, Calendar, ClipboardCheck,
  Plus, FileText, Search, X, TrendingUp, Clock,
  CheckCircle2, AlertCircle, BarChart2, Brain
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import AIChat from '../../components/AIChat';
import api, { MOCK_DATA } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ATTENDANCE_TREND = [
  { week: 'W1', AI401: 91, CS302: 85, AI402: 88, CS201: 94 },
  { week: 'W2', AI401: 88, CS302: 82, AI402: 85, CS201: 91 },
  { week: 'W3', AI401: 84, CS302: 79, AI402: 90, CS201: 93 },
  { week: 'W4', AI401: 87, CS302: 83, AI402: 86, CS201: 88 },
  { week: 'W5', AI401: 90, CS302: 86, AI402: 91, CS201: 92 },
];

const STUDENT_RADAR = [
  { metric: 'Attendance', score: 87 },
  { metric: 'Assignments', score: 74 },
  { metric: 'Internal Marks', score: 82 },
  { metric: 'Lab Work', score: 91 },
  { metric: 'Participation', score: 68 },
];

const ASSIGNMENTS = [
  { title: 'Operating Systems Quiz', due: 'Tomorrow', submitted: 42, total: 50, pct: 84 },
  { title: 'Networking Mini Project', due: 'In 3 days', submitted: 12, total: 50, pct: 24 },
  { title: 'Cloud Computing Lab', due: 'Next Week', submitted: 0, total: 50, pct: 0 },
  { title: 'AI Ethics Case Study', due: 'In 5 days', submitted: 28, total: 50, pct: 56 },
];

const AT_RISK = [
  { name: 'Suresh M.', course: 'AI-401', attendance: 62, marks: 41, risk: 'critical' },
  { name: 'Kavya R.', course: 'CS-302', attendance: 68, marks: 48, risk: 'high' },
  { name: 'Deva P.', course: 'AI-402', attendance: 71, marks: 52, risk: 'medium' },
];

const TS = { contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }, itemStyle: { color: '#e2e8f0' }, labelStyle: { color: '#94a3b8', fontWeight: 700 } };

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState(MOCK_DATA.faculty);
  const [activeTab, setActiveTab] = useState('overview');
  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => {
    api.get('/faculty/dashboard').then(({ data }) => setStats(data)).catch(() => {});
    setTimeout(() => {
      setAiInsight('Faculty AI: Class AI-401 shows a declining attendance trend (−4% over 5 weeks). Recommend scheduling a mid-semester intervention session. Top performer: CS-201 at 92% avg attendance. 3 students flagged for academic risk — immediate counseling recommended. Question bank for next internal exam ready for AI generation.');
    }, 1400);
  }, []);

  const analyzeGrading = async () => {
    setLoading(true);
    setReport(null);
    try {
      const { data } = await api.post('/ai/generate-report', { type: 'GRADING_INSIGHTS', data: stats });
      setReport(data.report);
    } catch {
      setReport(`📊 AI Grading Strategy — Class Report\n\nCourse: AI-401 | Students: ${stats.totalStudents} | Avg Attendance: ${stats.attendanceAvg}\n\n✅ Recommendation: Apply +3% normalization curve to OS Quiz (avg was 61 vs expected 70).\n\n⚠️ 3 students at critical risk — recommend immediate counseling.\n\n📌 Pending Grading: ${stats.pendingGrading} assignments — prioritize AI Ethics submissions.\n\n🎯 Projected Semester Pass Rate: 94.2% (up from 91% last sem).`);
    } finally { setLoading(false); }
  };

  const riskColor = (r) => r === 'critical' ? 'text-red-400 bg-red-500/10' : r === 'high' ? 'text-amber-400 bg-amber-500/10' : 'text-blue-400 bg-blue-500/10';

  return (
    <DashboardLayout title="Teaching Intelligence" role="FACULTY">
      <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-1">Faculty Portal</p>
          <h2 className="text-3xl font-black text-white tracking-tight">Welcome, Prof. {user?.name?.split(' ')[0] || 'Sarah'} 👋</h2>
          <p className="text-slate-400 font-medium mt-1">Class analytics, AI grading & student risk intelligence</p>
        </div>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white text-sm font-black hover:border-blue-500/40 transition-all">
            <Plus size={16} /> New Assessment
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={analyzeGrading} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-black hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-60">
            <Sparkles size={16} />
            {loading ? 'Analyzing...' : 'AI Grade Analysis'}
          </motion.button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Courses Teaching" value={stats.allocatedCourses || '4'} icon={BookOpen} color="bg-blue-500" />
        <StatCard title="Total Students" value={stats.totalStudents || '120'} icon={Users} color="bg-emerald-500" />
        <StatCard title="Avg Attendance" value={stats.attendanceAvg || '88%'} icon={Calendar} color="bg-purple-500" trend="-1.2%" />
        <StatCard title="Pending Grading" value={stats.pendingGrading || '18'} icon={ClipboardCheck} color="bg-amber-500" />
      </div>

      {/* AI Report Banner */}
      <AnimatePresence>
        {report && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 p-5 rounded-3xl border border-blue-500/20 bg-blue-500/5 relative">
            <button onClick={() => setReport(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={16} /></button>
            <div className="flex items-center gap-2 mb-3 text-blue-400">
              <Brain size={18} /><span className="font-black text-sm uppercase tracking-wider">AI Grading Intelligence</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{report}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <GlassCard title="Attendance Trend by Course" subtitle="5-week class presence analytics" className="lg:col-span-2">
          <div className="h-[220px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ATTENDANCE_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" domain={[60, 100]} />
                <Tooltip {...TS} formatter={(v) => [`${v}%`, 'Attendance']} />
                <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>{v}</span>} />
                <Line type="monotone" dataKey="AI401" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="CS302" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="AI402" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="CS201" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Class Performance Radar" subtitle="Average student score across 5 dimensions">
          <div className="h-[220px] mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={STUDENT_RADAR} outerRadius={75}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} />
                <Tooltip {...TS} formatter={(v) => [`${v}/100`]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Assignments */}
        <GlassCard title="Active Assessments" subtitle="Submission tracking & deadlines">
          <div className="mt-3 space-y-3">
            {ASSIGNMENTS.map((a) => (
              <div key={a.title} className="p-3 bg-slate-800/50 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white font-black text-sm">{a.title}</p>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">{a.due}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${a.pct > 70 ? 'bg-emerald-500' : a.pct > 30 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${a.pct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-slate-400">{a.submitted}/{a.total}</span>
                </div>
              </div>
            ))}
            <button onClick={() => setShowCreateModal(true)}
              className="w-full mt-1 py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-500 text-xs font-bold hover:border-blue-500/50 hover:text-blue-400 transition-all flex items-center justify-center gap-2">
              <Plus size={14} /> Create New Assessment
            </button>
          </div>
        </GlassCard>

        {/* At-Risk Students */}
        <GlassCard title="At-Risk Students" subtitle="AI-flagged for academic intervention" icon={AlertCircle}>
          <div className="mt-3 space-y-3">
            {AT_RISK.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div>
                  <p className="text-white font-black text-sm">{s.name}</p>
                  <p className="text-slate-400 text-xs">{s.course} · Attendance: {s.attendance}% · Marks: {s.marks}/100</p>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${riskColor(s.risk)}`}>{s.risk}</span>
              </div>
            ))}
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
              <p className="text-xs text-slate-500 italic">{aiInsight || 'AI scanning class patterns...'}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Create Assessment Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="w-full max-w-md rounded-3xl p-6 border border-white/10"
              style={{ background: 'rgba(15, 23, 42, 0.97)' }}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-white font-black text-lg">Create Assessment</h3>
                <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Title', type: 'text', placeholder: 'e.g. Data Structures Lab 4' },
                  { label: 'Due Date', type: 'date', placeholder: '' },
                  { label: 'Max Marks', type: 'number', placeholder: '50' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">{f.label}</label>
                    <input type={f.type} placeholder={f.placeholder}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-sm font-medium focus:outline-none focus:border-blue-500/50 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Course</label>
                  <select className="w-full px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none">
                    <option>AI-401</option><option>CS-302</option><option>AI-402</option><option>CS-201</option>
                  </select>
                </div>
                <button onClick={() => setShowCreateModal(false)}
                  className="w-full py-3 rounded-2xl bg-blue-600 text-white font-black text-sm hover:bg-blue-500 transition-all">
                  Create Assessment ✓
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIChat role="faculty" />
    </DashboardLayout>
  );
};

export default FacultyDashboard;
