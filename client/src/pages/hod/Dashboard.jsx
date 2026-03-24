import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Users, GraduationCap, BookOpen, Zap, X,
  Brain, TrendingDown, AlertTriangle, CheckCircle2, Award, Target
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
  LineChart, Line
} from 'recharts';
import AIChat from '../../components/AIChat';
import api, { MOCK_DATA } from '../../utils/api';

const COURSE_DATA = [
  { name: 'OS', avg: 3.4, students: 84, fail: 8 },
  { name: 'DBMS', avg: 3.8, students: 84, fail: 3 },
  { name: 'DS', avg: 3.2, students: 84, fail: 12 },
  { name: 'CN', avg: 3.6, students: 84, fail: 5 },
  { name: 'AI', avg: 3.5, students: 84, fail: 7 },
];

const FACULTY_RADAR = [
  { metric: 'Teaching', score: 88 },
  { metric: 'Research', score: 72 },
  { metric: 'Feedback', score: 91 },
  { metric: 'Innovation', score: 65 },
  { metric: 'Mentoring', score: 84 },
];

const DROPOUT_RISK = [
  { student: 'Suresh M.', roll: '20CS047', atd: 58, marks: 38, risk: 98 },
  { student: 'Kavya R.', roll: '20CS063', atd: 65, marks: 44, risk: 84 },
  { student: 'Deva P.', roll: '20CS091', atd: 69, marks: 49, risk: 71 },
  { student: 'Ananya B.', roll: '20CS102', atd: 72, marks: 51, risk: 63 },
];

const SEMESTER_TREND = [
  { sem: 'S1', pass: 94, avg: 8.1 },
  { sem: 'S2', pass: 92, avg: 7.9 },
  { sem: 'S3', pass: 91, avg: 7.7 },
  { sem: 'S4', pass: 89, avg: 7.8 },
  { sem: 'S5', pass: 87, avg: 7.6 },
  { sem: 'S6', pass: 91, avg: 7.9 },
];

const PIE_DATA = [
  { name: 'Core Courses', value: 40 },
  { name: 'Electives', value: 30 },
  { name: 'Lab/Practicals', value: 30 },
];
const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6'];
const TS = { contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }, itemStyle: { color: '#e2e8f0' }, labelStyle: { color: '#94a3b8', fontWeight: 700 } };

const HodDashboard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(MOCK_DATA.hod);
  const [aiDropoutInsight, setAiDropoutInsight] = useState('');

  useEffect(() => {
    api.get('/hod/dashboard').then(({ data }) => setStats(data)).catch(() => {});
    setTimeout(() => {
      setAiDropoutInsight('HOD-AI: 4 students flagged for critical dropout risk using our multi-factor prediction model (attendance + marks + submission rate). Suresh M. has 98% dropout probability — immediate counseling session required. DS course has highest failure rate (14.3%) — consider adding supplementary tutorial slots before next internal exam.');
    }, 1600);
  }, []);

  const analyzeDepartment = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/ai/generate-report', { type: 'COURSE_DIFFICULTY', data: stats });
      setReport(data.report);
    } catch {
      setReport(`🧠 AI Curriculum Strategy — CSE Department\n\nFaculty: ${stats.totalFaculty} | Students: ${stats.totalStudents} | Completion: ${stats.courseCompletion}\n\n📊 Difficulty Analysis:\n• DS: Highest failure rate (14.3%) → Add 2 extra tutorial sessions\n• DBMS: Best performance (3.3% fail) → Use as model for curriculum reform\n• AI: Moderate risk (8.3% fail) → Group study system recommended\n\n✅ Strategic Actions:\n1. Peer TA program for OS and DS immediately\n2. Mid-semester mock tests 2 weeks before internals\n3. Target: Push department pass rate from 87% → 93%`);
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Department Intelligence" role="HOD">
      <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400 mb-1">HOD Command Panel</p>
          <h2 className="text-3xl font-black text-white tracking-tight">Department Intelligence</h2>
          <p className="text-slate-400 font-medium mt-1">Faculty performance, curriculum analytics & AI dropout prediction</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={analyzeDepartment} disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 text-white text-sm font-black hover:bg-purple-500 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-60">
          <Sparkles size={16} />
          {loading ? 'Analyzing...' : 'AI Curriculum Report'}
        </motion.button>
      </div>

      {/* AI Report Banner */}
      <AnimatePresence>
        {report && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-6 p-5 rounded-3xl border border-purple-500/20 bg-purple-500/5 relative">
            <button onClick={() => setReport(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={16} /></button>
            <div className="flex items-center gap-2 mb-3 text-purple-400">
              <Brain size={18} /><span className="font-black text-sm uppercase tracking-wider">AI Curriculum Intelligence</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{report}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Faculty" value={stats.totalFaculty || '24'} icon={Users} color="bg-blue-500" />
        <StatCard title="Total Students" value={stats.totalStudents || '840'} icon={GraduationCap} color="bg-emerald-500" />
        <StatCard title="Course Completion" value={stats.courseCompletion || '92%'} icon={BookOpen} color="bg-purple-500" trend="+3%" />
        <StatCard title="Dropout Risk Count" value="4" icon={AlertTriangle} color="bg-red-500" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <GlassCard title="Semester Pass Rate & Avg GPA" subtitle="6-semester trend" className="lg:col-span-2">
          <div className="h-[220px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SEMESTER_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="sem" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" domain={[80, 100]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[7, 9]} />
                <Tooltip {...TS} />
                <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>{v}</span>} />
                <Line yAxisId="left" type="monotone" dataKey="pass" name="Pass Rate %" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="avg" name="Avg GPA" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Course Distribution" subtitle="Credit type breakdown">
          <div className="h-[180px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {PIE_DATA.map((e, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip {...TS} formatter={(v) => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {PIE_DATA.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between text-xs font-bold text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                {d.name}
              </div>
              <span>{d.value}%</span>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard title="Course Failure Rate Analysis" subtitle="Students failed per course this semester">
          <div className="h-[200px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COURSE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...TS} />
                <Bar dataKey="fail" name="Students Failed" fill="#ef4444" radius={[4, 4, 0, 0]}>
                  {COURSE_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.fail > 10 ? '#ef4444' : entry.fail > 5 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Faculty Evaluation Radar" subtitle="Department average across 5 performance dimensions">
          <div className="h-[210px] mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={FACULTY_RADAR} outerRadius={75}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
                <Tooltip {...TS} formatter={(v) => [`${v}/100`]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Dropout Risk Table */}
      <GlassCard title="AI Dropout Early Warning System" subtitle="Students with highest computed dropout probability" icon={TrendingDown}>
        <div className="mt-3 space-y-2">
          {DROPOUT_RISK.map((s) => (
            <div key={s.student} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-black text-sm ${s.risk >= 90 ? 'bg-red-500/20 text-red-400' : s.risk >= 75 ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {s.risk}%
              </div>
              <div className="flex-1">
                <p className="text-white font-black text-sm">{s.student} <span className="text-slate-500 font-normal text-xs">({s.roll})</span></p>
                <p className="text-slate-400 text-xs">Attendance: {s.atd}% · Internal: {s.marks}/100</p>
              </div>
              <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.risk >= 90 ? 'bg-red-500' : s.risk >= 75 ? 'bg-amber-500' : 'bg-blue-500'}`}
                  style={{ width: `${s.risk}%` }} />
              </div>
            </div>
          ))}
          <div className="p-3 bg-slate-900/50 rounded-xl border border-red-500/10 mt-2">
            <p className="text-xs text-red-400/80 italic">{aiDropoutInsight || 'AI scanning dropout patterns...'}</p>
          </div>
        </div>
      </GlassCard>

      <AIChat role="hod" />
    </DashboardLayout>
  );
};

export default HodDashboard;
