import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Activity, Calendar, ShieldAlert, Target, Clock, Fingerprint } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import AIChat from '../../components/AIChat';

const MONTHLY_TREND = [
  { month: 'Aug', att: 94 },
  { month: 'Sep', att: 88 },
  { month: 'Oct', att: 82 },
  { month: 'Nov', att: 76 },
  { month: 'Dec', att: 85 },
  { month: 'Jan', att: 91 },
  { month: 'Feb', att: 87 },
];

const SUBJECT_ATTENDANCE = [
  { name: 'CS-302', value: 45, max: 50, color: '#10b981' },
  { name: 'CS-304', value: 38, max: 42, color: '#3b82f6' },
  { name: 'CS-201', value: 24, max: 40, color: '#ef4444' }, // Danger
  { name: 'AI-401', value: 32, max: 35, color: '#8b5cf6' },
];

const TS = { contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }, itemStyle: { color: '#e2e8f0' } };

export default function Attendance() {
  const [report, setReport] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setReport('Academic AI: Your aggregate attendance is 87.4%, which clears the 75% university mandate. However, CS-201 (Data Structures) is at exactly 60%. If you miss 3 more CS-201 lectures, you will be flagged for Hall Ticket block. Strategy: You can safely miss 4 classes in CS-302 and AI-401 without dipping below 85% in those subjects.');
    }, 1200);
  }, []);

  return (
    <DashboardLayout title="Attendance & Activity Log" role="STUDENT">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">Biometric Presence Matrix</h2>
        <p className="text-slate-400 font-medium mt-1">Daily RFID logs and minimum mandate tracking</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Overall Attendance" value="87.4%" icon={Fingerprint} color="bg-emerald-500" trend="Safe" />
        <StatCard title="Classes Attended" value="139" icon={Activity} color="bg-blue-500" />
        <StatCard title="Critical Subjects" value="1" icon={ShieldAlert} color="bg-red-500" trend="CS-201" />
        <StatCard title="Buffer Classes" value="14" icon={Target} color="bg-amber-500" trend="Can Safely Miss" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <GlassCard title="Academic Year Trajectory" subtitle="Month-over-month campus presence" className="lg:col-span-2">
          <div className="h-[250px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_TREND}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[50, 100]} />
                <Tooltip {...TS} />
                {/* 75% Mandate Line */}
                <Area type="monotone" dataKey="att" name="Attendance %" stroke="#3b82f6" strokeWidth={3} fill="url(#attGrad)" dot={{ r: 4, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Subject Constraints" subtitle="Mandate risk threshold">
          <div className="h-[250px] mt-1 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={SUBJECT_ATTENDANCE} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                  {SUBJECT_ATTENDANCE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...TS} formatter={(val, name, props) => [`${val}/${props.payload.max} Classes`, name]} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
              <span className="text-3xl font-black text-white">87%</span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Total Avg</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard title="Subject Deep Dive" subtitle="Granular class counts">
          <div className="mt-3 space-y-3">
            {SUBJECT_ATTENDANCE.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-white/5">
                <div>
                  <p className="text-white font-black text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">Required: 75%</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{((s.value/s.max)*100).toFixed(1)}%</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{s.value}/{s.max} logs</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="AI Strategy Engine" subtitle="Absence optimization and warnings" icon={Clock}>
          <div className="mt-3 min-h-[60px] p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            {report ? (
              <p className="text-blue-300 font-medium leading-relaxed text-sm">{report}</p>
            ) : (
              <span className="text-blue-400/50 italic flex items-center gap-2 text-sm mt-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                Calculating absence thresholds...
              </span>
            )}
          </div>
        </GlassCard>
      </div>

      <AIChat role="student" />
    </DashboardLayout>
  );
}
