import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Calendar, Zap, Clock, BookOpen, Bell, Activity,
  TrendingUp, Brain, ChevronRight, AlertCircle, Sparkles,
  Target, BarChart2, CheckCircle, Star, Coffee
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import api from '../../utils/api';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';

const GPA_TREND = [
  { sem: 'S1', gpa: 7.8, target: 8.5 },
  { sem: 'S2', gpa: 8.1, target: 8.5 },
  { sem: 'S3', gpa: 7.9, target: 8.5 },
  { sem: 'S4', gpa: 8.4, target: 8.5 },
  { sem: 'S5', gpa: 8.6, target: 8.5 },
  { sem: 'S6', gpa: 8.8, target: 8.5 },
];

const SUBJECT_BARS = [
  { sub: 'OS', marks: 82, max: 100 },
  { sub: 'DBMS', marks: 91, max: 100 },
  { sub: 'DS', marks: 76, max: 100 },
  { sub: 'CN', marks: 88, max: 100 },
  { sub: 'AI', marks: 94, max: 100 },
];

const SKILL_RADAR = [
  { skill: 'Academics', value: 86 },
  { skill: 'Coding', value: 74 },
  { skill: 'Communication', value: 68 },
  { skill: 'Projects', value: 82 },
  { skill: 'Research', value: 60 },
];

const SCHEDULE_TODAY = [
  { time: '9:00 AM', subject: 'Data Structures', room: 'A-201', faculty: 'Dr. Sharma', status: 'done' },
  { time: '10:00 AM', subject: 'OS Lab', room: 'Lab-3', faculty: 'Prof. Reddy', status: 'done' },
  { time: '12:30 PM', subject: 'DBMS', room: 'B-105', faculty: 'Dr. Patel', status: 'current' },
  { time: '2:00 PM', subject: 'Cloud Computing', room: 'A-208', faculty: 'Prof. Naidu', status: 'upcoming' },
  { time: '3:30 PM', subject: 'AI Ethics', room: 'A-201', faculty: 'Dr. Iyer', status: 'upcoming' },
];

const ACHIEVEMENTS = [
  { title: 'Attendance Streak', value: '18 days', icon: '🔥', color: 'text-orange-400' },
  { title: 'Assignments Done', value: '24/26', icon: '✅', color: 'text-emerald-400' },
  { title: 'CGPA Rank', value: '#14 / 480', icon: '🏆', color: 'text-amber-400' },
  { title: 'Hackathons', value: '2 Won', icon: '⚡', color: 'text-blue-400' },
];

const TS = { contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }, itemStyle: { color: '#e2e8f0' } };

const Dashboard = () => {
  const { user } = useAuth();
  const [aiCoach, setAiCoach] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [tab, setTab] = useState('overview');
  const [data] = useState({
    name: user?.name || 'Vitam Scholar',
    attendance: 87,
    cgpa: 8.8,
    semProgress: 68,
    nextClass: 'DBMS — Now',
    rank: '#14',
  });

  useEffect(() => {
    setTimeout(() => {
      setAiCoach('Student AI Coach: You are on track for honour roll this semester! CGPA improved from 8.4 → 8.8. Areas to focus: Data Structures (76% marks) — suggested 4 LeetCode problems daily. Upcoming Internal Exam in 12 days. Recommended study plan: 2.5 hrs/day on DS, 1.5 hrs on CN. You have a 94% placement readiness score based on your academic profile.');
    }, 1500);
  }, []);

  const statusStyle = (s) => s === 'done' ? 'text-slate-500 line-through' : s === 'current' ? 'text-blue-400 font-black' : 'text-slate-300';
  const statusBadge = (s) => s === 'done' ? '' : s === 'current' ? 'bg-blue-500 animate-pulse' : 'bg-slate-600';

  return (
    <DashboardLayout title="Student Portal" role="STUDENT">
      {/* Hero Header */}
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-400 mb-2">Semester 6 · AI-integrated Portal</p>
        <h2 className="text-4xl font-black text-white tracking-tight">
          Hey, <span className="text-blue-400">{data.name.split(' ')[0]}</span> 👋
        </h2>
        <p className="text-slate-400 mt-1">Your AI-powered academic command center. Today is a great day to level up.</p>
      </div>

      {/* Achievement Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {ACHIEVEMENTS.map((a) => (
          <motion.div key={a.title} whileHover={{ y: -4 }}
            className="p-4 rounded-3xl border border-white/5 flex items-center gap-3"
            style={{ background: 'rgba(15, 23, 42, 0.8)' }}>
            <span className="text-2xl">{a.icon}</span>
            <div>
              <p className={`font-black text-lg leading-none ${a.color}`}>{a.value}</p>
              <p className="text-slate-500 text-xs font-medium mt-0.5">{a.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <motion.div whileHover={{ y: -3 }} className="p-5 rounded-3xl" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <p className="text-blue-400 text-xs font-black uppercase tracking-wider mb-1">Attendance</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-white">{data.attendance}</span>
            <span className="text-blue-400 font-black text-sm mb-0.5">%</span>
          </div>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full">
            <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${data.attendance}%` }} />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -3 }} className="p-5 rounded-3xl" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <p className="text-emerald-400 text-xs font-black uppercase tracking-wider mb-1">CGPA</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-white">{data.cgpa}</span>
            <span className="text-emerald-400 font-black text-sm mb-0.5">/ 10</span>
          </div>
          <p className="text-emerald-400/60 text-xs mt-1 font-medium">Rank {data.rank} of 480</p>
        </motion.div>
        <motion.div whileHover={{ y: -3 }} className="p-5 rounded-3xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <p className="text-purple-400 text-xs font-black uppercase tracking-wider mb-1">Semester Progress</p>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-black text-white">{data.semProgress}</span>
            <span className="text-purple-400 font-black text-sm mb-0.5">%</span>
          </div>
          <div className="mt-2 h-1.5 bg-slate-800 rounded-full">
            <div className="h-full rounded-full bg-purple-500 transition-all" style={{ width: `${data.semProgress}%` }} />
          </div>
        </motion.div>
        <motion.div whileHover={{ y: -3 }} className="p-5 rounded-3xl" style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <p className="text-amber-400 text-xs font-black uppercase tracking-wider mb-1">Next Class</p>
          <p className="text-white font-black text-lg leading-tight mt-1">DBMS</p>
          <p className="text-amber-400/70 text-xs mt-1 font-medium flex items-center gap-1"><Clock size={10} /> Starting Now</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <GlassCard title="GPA Trend vs Target" subtitle="Semester-wise academic trajectory" className="lg:col-span-2">
          <div className="h-[220px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={GPA_TREND}>
                <defs>
                  <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="sem" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[7, 10]} />
                <Tooltip {...TS} />
                <Area type="monotone" dataKey="gpa" name="Your GPA" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gpaGrad)" dot={{ fill: '#3b82f6', r: 5 }} />
                <Area type="monotone" dataKey="target" name="Target" stroke="#f59e0b" strokeWidth={1.5} fill="none" strokeDasharray="5 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Skill Profile" subtitle="Holistic competency radar">
          <div className="h-[220px] mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={SKILL_RADAR} outerRadius={75}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                <Tooltip {...TS} formatter={(v) => [`${v}/100`]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Subject Marks */}
        <GlassCard title="Internal Marks" subtitle="Current semester subject scores">
          <div className="h-[200px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SUBJECT_BARS}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="sub" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip {...TS} formatter={(v) => [`${v}/100`]} />
                <Bar dataKey="marks" name="Score" radius={[6, 6, 0, 0]}>
                  {SUBJECT_BARS.map((entry, index) => (
                    <Cell key={index} fill={entry.marks >= 85 ? '#10b981' : entry.marks >= 70 ? '#3b82f6' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Today's Schedule */}
        <GlassCard title="Today's Schedule" subtitle="Live class timeline" icon={Clock}>
          <div className="mt-3 space-y-2">
            {SCHEDULE_TODAY.map((c) => (
              <div key={c.time} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${c.status === 'current' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-slate-800/40'}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusBadge(c.status)}`} />
                <div className="flex-1 min-w-0">
                  <p className={`font-black text-sm truncate ${statusStyle(c.status)}`}>{c.subject}</p>
                  <p className="text-slate-500 text-xs">{c.faculty} · {c.room}</p>
                </div>
                <span className="text-slate-500 text-xs font-mono">{c.time}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI Coach */}
      <GlassCard title="AI Academic Coach" subtitle="Personalized learning intelligence & career readiness" icon={Brain}>
        <div className="mt-3 min-h-[60px]">
          {aiCoach ? (
            <p className="text-emerald-400 font-medium leading-relaxed text-sm">{aiCoach}</p>
          ) : (
            <span className="text-slate-500 italic flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              Analyzing your academic profile...
            </span>
          )}
        </div>
      </GlassCard>
    </DashboardLayout>
  );
};

export default Dashboard;
