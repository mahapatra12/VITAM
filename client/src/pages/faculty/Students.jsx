import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Users, AlertTriangle, UserCheck, TrendingUp, Search, GraduationCap } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import AIChat from '../../components/AIChat';

const PERFORMANCE_ATTENDANCE = [
  { student: 'A. Sharma', marks: 88, attendance: 92 },
  { student: 'R. Verma', marks: 45, attendance: 68 },
  { student: 'K. Iyer', marks: 95, attendance: 98 },
  { student: 'N. Patel', marks: 72, attendance: 85 },
  { student: 'S. Singh', marks: 58, attendance: 71 },
];

const WEEKLY_ENGAGEMENT = [
  { week: 'W1', submissions: 95, activeTime: 120 },
  { week: 'W2', submissions: 92, activeTime: 115 },
  { week: 'W3', submissions: 88, activeTime: 95 },
  { week: 'W4', submissions: 75, activeTime: 82 },
  { week: 'W5', submissions: 98, activeTime: 140 },
  { week: 'W6', submissions: 94, activeTime: 130 },
];

const RISK_ALERTS = [
  { name: 'Ravi Verma (CSE-3)', issue: 'Consistent absence > 3 weeks', severity: 'critical' },
  { name: 'Priya Das (ECE-2)', issue: 'Failed 2 consecutive internals', severity: 'high' },
  { name: 'Karan Singh (ME-4)', issue: 'No portal login for 6 days', severity: 'medium' },
];

const TS = { contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }, itemStyle: { color: '#e2e8f0' } };

export default function FacultyStudents() {
  const [report, setReport] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setReport('Faculty AI Copilot: Class engagement dropped by 14% during Week 4. R. Verma and S. Singh are exhibiting identical poor attendance / low marks correlation. Recommend scheduling a mandatory 1-on-1 intervention. Shall I draft the email summons?');
    }, 1200);
  }, []);

  return (
    <DashboardLayout title="Student Intelligence" role="FACULTY">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Class Roster Analytics</h2>
          <p className="text-slate-400 font-medium mt-1">Behavioral tracking, academic standing, and risk prediction</p>
        </div>
        <div className="relative">
           <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
           <input type="text" placeholder="Search roll number..." className="bg-slate-800/80 border border-slate-700 text-white pl-12 pr-4 py-2.5 rounded-full text-sm font-medium focus:border-blue-500 outline-none w-64" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Assigned" value="142" icon={Users} color="bg-blue-500" />
        <StatCard title="Avg Class Score" value="78.4%" icon={GraduationCap} color="bg-purple-500" />
        <StatCard title="At-Risk Alerts" value="3" icon={AlertTriangle} color="bg-red-500" trend="Action Required" />
        <StatCard title="Active Enrollees" value="96%" icon={UserCheck} color="bg-emerald-500" trend="+2%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard title="Marks vs Attendance Distribution" subtitle="Evaluating the impact of presence on performance">
          <div className="h-[250px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PERFORMANCE_ATTENDANCE}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="student" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...TS} />
                <Bar dataKey="marks" name="Internal Marks" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                  {PERFORMANCE_ATTENDANCE.map((entry, index) => (
                    <Cell key={index} fill={entry.marks < 50 ? '#ef4444' : entry.marks > 85 ? '#10b981' : '#8b5cf6'} />
                  ))}
                </Bar>
                <Bar dataKey="attendance" name="Attendance %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Class Engagement Trajectory" subtitle="Weekly assignment interaction times (mins)">
          <div className="h-[250px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={WEEKLY_ENGAGEMENT}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="week" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...TS} />
                <Line yAxisId="left" type="monotone" dataKey="submissions" name="Submission %" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                <Line yAxisId="right" type="step" dataKey="activeTime" name="Avg Portal Minutes" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard title="Automated Risk Triage Queue" subtitle="AI-flagged students requiring immediate intervention">
          <div className="mt-4 space-y-3">
            {RISK_ALERTS.map((risk, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-xl border border-white/5 hover:bg-slate-800 transition-colors cursor-pointer">
                <div>
                  <p className="text-white font-black text-sm">{risk.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{risk.issue}</p>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border ${
                  risk.severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                  risk.severity === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                  'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {risk.severity} Risk
                </span>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="Faculty Teaching Copilot" subtitle="Behavioral insights generated by Academic AI" icon={TrendingUp}>
          <div className="mt-3 min-h-[60px] p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            {report ? (
              <p className="text-blue-300 font-medium leading-relaxed text-sm">{report}</p>
            ) : (
              <span className="text-blue-400/50 italic flex items-center gap-2 text-sm mt-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                Scanning roster databases...
              </span>
            )}
            <div className="mt-4 flex gap-3">
              <button disabled={!report} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg opacity-90 hover:opacity-100 disabled:opacity-50">Draft Interventions</button>
              <button disabled={!report} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50">Dismiss Flags</button>
            </div>
          </div>
        </GlassCard>
      </div>

      <AIChat role="faculty" />
    </DashboardLayout>
  );
}
