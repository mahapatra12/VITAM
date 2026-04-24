import {
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { GlassCard } from '../../../components/ui/DashboardComponents';

const ATTENDANCE_TREND = [
  { week: 'W1', AI401: 91, CS302: 85, AI402: 88, CS201: 94 },
  { week: 'W2', AI401: 88, CS302: 82, AI402: 85, CS201: 91 },
  { week: 'W3', AI401: 84, CS302: 79, AI402: 90, CS201: 93 },
  { week: 'W4', AI401: 87, CS302: 83, AI402: 86, CS201: 88 },
  { week: 'W5', AI401: 90, CS302: 86, AI402: 91, CS201: 92 }
];

const HEALTH_DATA = [
  { name: 'On Track', value: 82, fill: '#10b981' },
  { name: 'Need Support', value: 18, fill: '#f43f5e' }
];

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#0c0c0c', border: '1px solid #1e293b', borderRadius: 12 },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8', fontWeight: 700 }
};

export default function FacultyInsightsSection() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <GlassCard title="Attendance Trajectory" subtitle="Course-wise 5-week presence analysis (%)" className="lg:col-span-2">
        <div className="mt-6 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ATTENDANCE_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Line type="monotone" dataKey="AI401" stroke="#3b82f6" strokeWidth={5} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#020617' }} />
              <Line type="monotone" dataKey="CS302" stroke="#10b981" strokeWidth={5} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#020617' }} />
              <Line type="monotone" dataKey="AI402" stroke="#6366f1" strokeWidth={5} dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#020617' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <GlassCard title="Class Performance Health" subtitle="Average student performance distribution" className="flex flex-col items-center justify-center text-center">
        <div className="relative mt-4 h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={HEALTH_DATA} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value" stroke="none">
                {HEALTH_DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip hide />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute left-1/2 top-[65%] -translate-x-1/2 text-center">
            <p className="text-5xl font-black leading-none tracking-tighter text-white">82%</p>
            <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-emerald-500">Optimal</p>
          </div>
        </div>
        <p className="mt-8 px-4 text-sm leading-relaxed text-slate-400">
          Overall class academic status is stable. 18% of the student body is identified for additional support.
        </p>
      </GlassCard>
    </div>
  );
}
