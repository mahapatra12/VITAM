import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import { FileText, Users, AlertTriangle, CheckCircle, Clock, BookOpen, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const EXAM_SCHEDULE = [
  { subject: 'Data Structures', branch: 'CSE', date: '2026-04-02', time: '9:00 AM', hall: 'A-101', status: 'Scheduled' },
  { subject: 'Network Theory', branch: 'ECE', date: '2026-04-03', time: '9:00 AM', hall: 'B-201', status: 'Scheduled' },
  { subject: 'Thermodynamics', branch: 'MECH', date: '2026-04-04', time: '2:00 PM', hall: 'C-301', status: 'Pending' },
  { subject: 'Structural Analysis', branch: 'CIVIL', date: '2026-04-05', time: '9:00 AM', hall: 'D-401', status: 'Scheduled' },
  { subject: 'DBMS', branch: 'CSE', date: '2026-04-07', time: '2:00 PM', hall: 'A-102', status: 'Draft' },
];

const PASS_RATE_DATA = [
  { subject: 'DSA', passRate: 87, fill: '#3b82f6' },
  { subject: 'DBMS', passRate: 79, fill: '#8b5cf6' },
  { subject: 'OS', passRate: 74, fill: '#06b6d4' },
  { subject: 'CN', passRate: 68, fill: '#f59e0b' },
  { subject: 'TOC', passRate: 61, fill: '#ef4444' },
];

const MALPRACTICE_LOG = [
  { id: 'S2023001', name: 'Rahul Kumar', exam: 'DSA', action: 'Phone Detected', severity: 'high' },
  { id: 'S2023078', name: 'Priya Sharma', exam: 'DBMS', action: 'Material Found', severity: 'medium' },
  { id: 'S2023112', name: 'Aditya Singh', exam: 'OS', action: 'Suspicious Activity', severity: 'low' },
];

export default function ExamDashboard() {
  const [aiAlert, setAiAlert] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setAiAlert(
        'VITAM Exam AI: Detected 3 anomalous seating patterns in Hall A-101. ' +
        'Network Theory has a 31% predicted repeat-fail rate based on prior semester attendance gaps. ' +
        'Recommend increasing invigilator ratio for DSA exam from 1:25 to 1:20. ' +
        'Automated hall ticket distribution ready for 4,250 students.'
      );
    }, 1200);
  }, []);

  const statusColor = (s) => s === 'Scheduled' ? 'text-emerald-400 bg-emerald-400/10' : s === 'Pending' ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 bg-slate-400/10';

  return (
    <DashboardLayout title="Examination Department" role="ADMIN">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">Exam Operations</h2>
        <p className="text-slate-400 font-medium mt-1">AI-monitored scheduling, seating & academic integrity</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Exams Scheduled" value="18" icon={FileText} color="bg-blue-500" />
        <StatCard title="Students Registered" value="4,250" icon={Users} color="bg-emerald-500" />
        <StatCard title="Pending Halls" value="3" icon={AlertTriangle} color="bg-amber-500" />
        <StatCard title="Avg Pass Rate" value="73.8%" icon={CheckCircle} color="bg-purple-500" trend="-2.1%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Upcoming Schedule */}
        <GlassCard title="Upcoming Exam Schedule" subtitle="Next 7 days" icon={Clock}>
          <div className="mt-3 space-y-2 overflow-y-auto max-h-[260px] pr-1">
            {EXAM_SCHEDULE.map((e, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div>
                  <p className="text-white font-black text-sm">{e.subject}</p>
                  <p className="text-slate-400 text-xs">{e.branch} · Hall {e.hall} · {e.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs">{e.date}</p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full mt-1 inline-block ${statusColor(e.status)}`}>
                    {e.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Pass Rate Analysis */}
        <GlassCard title="Subject Pass Rate Analysis" subtitle="Last semester performance">
          <div className="h-[240px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PASS_RATE_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
                <YAxis type="category" dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} width={40} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12 }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(v) => [`${v}%`, 'Pass Rate']}
                />
                <Bar dataKey="passRate" radius={[0, 6, 6, 0]}>
                  {PASS_RATE_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Malpractice Log */}
      <GlassCard title="Academic Integrity Log" subtitle="AI-detected anomalies this semester" className="mb-6">
        <div className="mt-3 space-y-2">
          {MALPRACTICE_LOG.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${m.severity === 'high' ? 'bg-red-500' : m.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                <div>
                  <p className="text-white font-black text-sm">{m.name} <span className="text-slate-500 font-normal">({m.id})</span></p>
                  <p className="text-slate-400 text-xs">{m.exam} · {m.action}</p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${m.severity === 'high' ? 'bg-red-500/10 text-red-400' : m.severity === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                {m.severity}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* AI Exam Intelligence */}
      <GlassCard title="AI Exam Intelligence" subtitle="Predictive analytics & operational recommendations" icon={BarChart2}>
        <div className="mt-3 min-h-[60px] flex items-start">
          {aiAlert ? (
            <p className="text-amber-400 font-medium leading-relaxed text-sm">{aiAlert}</p>
          ) : (
            <span className="text-slate-500 italic flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
              Analyzing exam telemetry...
            </span>
          )}
        </div>
      </GlassCard>

      <AIChat role="exam" />
    </DashboardLayout>
  );
}
