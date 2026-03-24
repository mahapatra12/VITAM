import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import {
  BookOpen, Users, Flag, LayoutDashboard, TrendingUp,
  AlertTriangle, CheckCircle, Brain, Award, Clock
} from 'lucide-react';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend
} from 'recharts';
import AIChat from '../../components/AIChat';

const DEPT_PERF = [
  { dept: 'CSE', cgpa: 8.4, pass: 94, fill: '#3b82f6' },
  { dept: 'ECE', cgpa: 7.9, pass: 88, fill: '#10b981' },
  { dept: 'MECH', cgpa: 7.4, pass: 82, fill: '#f59e0b' },
  { dept: 'CIVIL', cgpa: 7.6, pass: 84, fill: '#8b5cf6' },
];

const DEPT_RADAR = [
  { dept: 'CSE', value: 92 },
  { dept: 'ECE', value: 81 },
  { dept: 'MECH', value: 74 },
  { dept: 'CIVIL', value: 77 },
  { dept: 'MBA', value: 85 },
  { dept: 'MCA', value: 88 },
];

const APPROVALS = [
  { item: 'Lab Equipment Purchase — CSE', dept: 'CSE', amount: '₹2.4L', urgency: 'high', days: 3 },
  { item: 'Faculty Hiring — MECH Dept', dept: 'MECH', amount: 'N/A', urgency: 'medium', days: 7 },
  { item: 'Curriculum Change — AI Minor', dept: 'All', amount: 'N/A', urgency: 'medium', days: 5 },
  { item: 'Hostel Renovation Phase 2', dept: 'Admin', amount: '₹18L', urgency: 'low', days: 14 },
];

const ATTENDANCE_WEEKLY = [
  { day: 'Mon', present: 3820, absent: 430 },
  { day: 'Tue', present: 3950, absent: 300 },
  { day: 'Wed', present: 3690, absent: 560 },
  { day: 'Thu', present: 4010, absent: 240 },
  { day: 'Fri', present: 3780, absent: 470 },
];

const TS = { contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }, itemStyle: { color: '#e2e8f0' }, labelStyle: { color: '#94a3b8', fontWeight: 700 } };

export default function PrincipalDashboard() {
  const [aiInsight, setAiInsight] = useState('');
  const [approvalStates, setApprovalStates] = useState({});

  useEffect(() => {
    setTimeout(() => {
      setAiInsight('Principal AI: MECH department shows declining performance — CGPA dropped from 7.8 to 7.4 over 2 semesters. Recommend emergency faculty review meeting. CSE department is excelling at 94% pass rate. Attendance drops on Wednesdays cluster around ECE Second Year — coordinate with HOD. Pending: 4 high-priority approvals require sign-off within 72 hours.');
    }, 1400);
  }, []);

  const handleApproval = (index, action) => {
    setApprovalStates(prev => ({ ...prev, [index]: action }));
  };

  const urgencyColor = (u) => u === 'high' ? 'text-red-400 bg-red-500/10' : u === 'medium' ? 'text-amber-400 bg-amber-500/10' : 'text-blue-400 bg-blue-500/10';

  return (
    <DashboardLayout title="Principal's Office" role="ADMIN">
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400 mb-1">Academic Governance</p>
        <h2 className="text-3xl font-black text-white tracking-tight">Principal's Command</h2>
        <p className="text-slate-400 mt-1">Institutional academic oversight, approvals & cross-department intelligence</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Departments" value="8" icon={LayoutDashboard} color="bg-blue-500" />
        <StatCard title="Active Courses" value="142" icon={BookOpen} color="bg-emerald-500" />
        <StatCard title="Total Students" value="4,250" icon={Users} color="bg-purple-500" trend="+180" />
        <StatCard title="Pending Approvals" value={`${Object.keys(approvalStates).length < 4 ? 4 - Object.keys(approvalStates).length : 0}`} icon={Flag} color="bg-amber-500" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Dept CGPA Bar */}
        <GlassCard title="Department CGPA Comparison" subtitle="Current semester average academic performance">
          <div className="h-[220px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPT_PERF}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[6, 10]} />
                <Tooltip {...TS} formatter={(v) => [v.toFixed(1), 'Avg CGPA']} />
                <Bar dataKey="cgpa" name="Avg CGPA" radius={[6, 6, 0, 0]}>
                  {DEPT_PERF.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Campus Attendance */}
        <GlassCard title="Daily Campus Attendance" subtitle="Present vs absent — this week">
          <div className="h-[220px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ATTENDANCE_WEEKLY}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...TS} />
                <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>{v}</span>} />
                <Bar dataKey="present" name="Present" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Pending Approvals */}
      <GlassCard title="Pending Administrative Approvals" subtitle="Items awaiting principal sign-off" className="mb-6" icon={Flag}>
        <div className="mt-3 space-y-3">
          {APPROVALS.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl">
              <div className="flex-1">
                <p className="text-white font-black text-sm">{a.item}</p>
                <p className="text-slate-400 text-xs">{a.dept} · {a.amount !== 'N/A' ? a.amount : 'Policy change'} · {a.days}d old</p>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${urgencyColor(a.urgency)}`}>{a.urgency}</span>
              {approvalStates[i] ? (
                <span className={`text-[10px] font-black px-3 py-1 rounded-xl ${approvalStates[i] === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {approvalStates[i]}
                </span>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => handleApproval(i, 'approved')}
                    className="text-[10px] font-black px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                    Approve
                  </button>
                  <button onClick={() => handleApproval(i, 'rejected')}
                    className="text-[10px] font-black px-3 py-1 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
                    Reject
  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </GlassCard>

      {/* AI Principal Insight */}
      <GlassCard title="Principal AI Intelligence" subtitle="Governance insights & priority alerts" icon={Brain}>
        <div className="mt-3 min-h-[60px]">
          {aiInsight ? (
            <p className="text-purple-300 font-medium leading-relaxed text-sm">{aiInsight}</p>
          ) : (
            <span className="text-slate-500 italic flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />
              Processing institutional intelligence...
            </span>
          )}
        </div>
      </GlassCard>

      <AIChat role="principal" />
    </DashboardLayout>
  );
}
