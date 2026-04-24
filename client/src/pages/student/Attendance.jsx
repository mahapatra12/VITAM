import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Activity, Clock, Fingerprint, ShieldAlert, Target } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard, StatCard } from '../../components/ui/DashboardComponents';
import WorkspaceHero from '../../components/ui/WorkspaceHero';
import AIChat from '../../components/AIChat';

const MONTHLY_TREND = [
  { month: 'Aug', att: 94 },
  { month: 'Sep', att: 88 },
  { month: 'Oct', att: 82 },
  { month: 'Nov', att: 76 },
  { month: 'Dec', att: 85 },
  { month: 'Jan', att: 91 },
  { month: 'Feb', att: 87 }
];

const SUBJECT_ATTENDANCE = [
  { name: 'CS-302', value: 45, max: 50, color: '#10b981' },
  { name: 'CS-304', value: 38, max: 42, color: '#3b82f6' },
  { name: 'CS-201', value: 24, max: 40, color: '#ef4444' },
  { name: 'AI-401', value: 32, max: 35, color: '#8b5cf6' }
];

const TS = {
  contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 },
  itemStyle: { color: '#e2e8f0' }
};

export default function Attendance() {
  const [report, setReport] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setReport('Your aggregate attendance is 87.4%, which safely clears the 75% university mandate. CS-201 is sitting at 60%, so protecting that subject over the next few classes should be your top attendance priority.');
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <DashboardLayout title="Attendance & Activity Log" role="STUDENT">
      <WorkspaceHero
        eyebrow="Attendance workspace"
        title="Biometric presence matrix"
        description="Monitor overall attendance, subject-level risk, and safe absence thresholds from a cleaner academic presence dashboard built for quick decisions."
        icon={Fingerprint}
        badges={[
          'Campus logs synchronized',
          'Overall attendance 87.4%',
          '1 critical subject'
        ]}
        stats={[
          { label: 'Overall attendance', value: '87.4%' },
          { label: 'Classes attended', value: '139' },
          { label: 'Critical subjects', value: '1' },
          { label: 'Buffer classes', value: '14' }
        ]}
        aside={(
          <div className="glass-panel h-full p-6 md:p-7">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
              Attendance insight
            </p>
            <h3 className="mt-2 text-2xl font-black text-white">
              One subject needs protection
            </h3>
            <div className="mt-6 space-y-3">
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Immediate focus
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-200">
                  Keep CS-201 above the minimum threshold over your next three classes to stay out of hall-ticket risk.
                </p>
              </div>
              <div className="surface-card p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                  Buffer status
                </p>
                <p className="mt-3 text-sm leading-6 text-emerald-300">
                  You can safely miss 4 classes in CS-302 and AI-401 without dropping below 85%.
                </p>
              </div>
            </div>
          </div>
        )}
      />

      <div className="mb-8 grid grid-cols-2 gap-5 lg:grid-cols-4">
        <StatCard title="Overall Attendance" value="87.4%" icon={Fingerprint} color="bg-emerald-500" trend="Safe" />
        <StatCard title="Classes Attended" value="139" icon={Activity} color="bg-blue-500" />
        <StatCard title="Critical Subjects" value="1" icon={ShieldAlert} color="bg-red-500" trend="CS-201" />
        <StatCard title="Buffer Classes" value="14" icon={Target} color="bg-amber-500" trend="Can safely miss" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <GlassCard title="Academic Year Trajectory" subtitle="Month-over-month campus presence" className="lg:col-span-2">
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MONTHLY_TREND}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[50, 100]} />
                <Tooltip {...TS} />
                <Area type="monotone" dataKey="att" name="Attendance %" stroke="#3b82f6" strokeWidth={3} fill="url(#attGrad)" dot={{ r: 4, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Subject Constraints" subtitle="Mandate risk threshold">
          <div className="relative mt-2 flex h-[280px] items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={SUBJECT_ATTENDANCE} innerRadius={62} outerRadius={86} paddingAngle={5} dataKey="value" stroke="none">
                  {SUBJECT_ATTENDANCE.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...TS} formatter={(value, name, props) => [`${value}/${props.payload.max} classes`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-2">
              <span className="text-3xl font-black text-white">87%</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total avg</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard title="Subject Deep Dive" subtitle="Granular class counts">
          <div className="mt-4 space-y-3">
            {SUBJECT_ATTENDANCE.map((subject) => (
              <div key={subject.name} className="surface-card flex items-center justify-between p-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-black text-white">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                    {subject.name}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Required: 75%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-white">
                    {((subject.value / subject.max) * 100).toFixed(1)}%
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    {subject.value}/{subject.max} logs
                  </p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="AI Strategy Engine" subtitle="Absence optimization and warnings" icon={Clock}>
          <div className="mt-4 min-h-[140px] rounded-[1.4rem] border border-blue-500/20 bg-blue-500/10 p-5">
            {report ? (
              <p className="text-sm leading-7 text-blue-100">
                {report}
              </p>
            ) : (
              <span className="mt-2 flex items-center gap-2 text-sm italic text-blue-300/70">
                <div className="h-2 w-2 animate-ping rounded-full bg-blue-400" />
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
