import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, AreaChart, Area
} from 'recharts';
import { Award, Target, TrendingUp, BookOpen, Brain, Star, ChevronDown, Zap } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import AIChat from '../../components/AIChat';

const SEMESTER_GPA = [
  { sem: 'Sem 1', cgpa: 7.8, sgpa: 7.8 },
  { sem: 'Sem 2', cgpa: 8.1, sgpa: 8.4 },
  { sem: 'Sem 3', cgpa: 7.9, sgpa: 7.6 },
  { sem: 'Sem 4', cgpa: 8.4, sgpa: 8.9 },
  { sem: 'Sem 5', cgpa: 8.6, sgpa: 8.8 },
  { sem: 'Sem 6', cgpa: 8.8, sgpa: 9.2 },
];

const SKILLS = [
  { subject: 'Algorithms', score: 92, fullMark: 100 },
  { subject: 'Databases', score: 88, fullMark: 100 },
  { subject: 'Networking', score: 76, fullMark: 100 },
  { subject: 'AI/ML', score: 95, fullMark: 100 },
  { subject: 'Web Dev', score: 85, fullMark: 100 },
];

const SUBJECTS_CURRENT = [
  { name: 'Operating Systems', code: 'CS-302', internal: 42, maxInternal: 50, status: 'ahead' },
  { name: 'Database Systems', code: 'CS-304', internal: 48, maxInternal: 50, status: 'ahead' },
  { name: 'Data Structures', code: 'CS-201', internal: 34, maxInternal: 50, status: 'behind' },
  { name: 'Computer Networks', code: 'CS-306', internal: 38, maxInternal: 50, status: 'on-track' },
  { name: 'Artificial Intelligence', code: 'AI-401', internal: 46, maxInternal: 50, status: 'ahead' },
];

const TS = { contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }, itemStyle: { color: '#e2e8f0' } };

export default function AcademicScore() {
  const [aiReport, setAiReport] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setAiReport('Academic AI Profiler: Your SGPA trajectory is showing a +11.5% accelerating curve over the last 3 semesters. You are highly proficient in AI/ML (95) and Algorithms (92), making you a prime candidate for Data Science placements. Focus Area: Data Structures internal marks (34/50) are dragging down your potential top-10 rank. Recommend allocating 40% of future study time to CS-201 before finals.');
    }, 1400);
  }, []);

  return (
    <DashboardLayout title="Academic Portfolio" role="STUDENT">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">Academic Performance</h2>
        <p className="text-slate-400 font-medium mt-1">Deep institutional transcript & trajectory mapping</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Overall CGPA" value="8.84" icon={Award} color="bg-emerald-500" trend="+0.2" />
        <StatCard title="Current SGPA (Predicted)" value="9.2" icon={Target} color="bg-blue-500" />
        <StatCard title="Credits Earned" value="142" icon={BookOpen} color="bg-purple-500" />
        <StatCard title="Batch Rank" value="14th" icon={TrendingUp} color="bg-amber-500" trend="Top 3%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <GlassCard title="GPA Trajectory Mapping" subtitle="Semester over semester variance" className="lg:col-span-2">
          <div className="h-[250px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SEMESTER_GPA}>
                <defs>
                  <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="sem" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[7, 10]} />
                <Tooltip {...TS} />
                <Legend formatter={(v) => <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>{v}</span>} />
                <Area type="monotone" dataKey="sgpa" name="SGPA" stroke="#10b981" strokeWidth={3} fill="url(#sgpaGrad)" dot={{ r: 4, fill: '#10b981' }} />
                <Area type="monotone" dataKey="cgpa" name="Cumulative (CGPA)" stroke="#3b82f6" strokeWidth={2} fill="none" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Core Competency Matrix" subtitle="Skill balance across disciplines">
          <div className="h-[250px] mt-1">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={SKILLS} outerRadius={80}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6' }} />
                <Tooltip {...TS} formatter={(v) => [`${v}/100`]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard title="Current Semester Internals" subtitle="Continuous evaluation monitoring">
          <div className="mt-3 space-y-3">
            {SUBJECTS_CURRENT.map((s) => (
              <div key={s.code} className="p-3 bg-slate-800/50 rounded-xl border border-white/5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-white font-black text-sm">{s.name}</p>
                    <p className="text-slate-400 text-xs font-mono">{s.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg text-white leading-none">{s.internal}<span className="text-slate-500 text-xs">/{s.maxInternal}</span></p>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${s.status === 'ahead' ? 'text-emerald-400' : s.status === 'behind' ? 'text-red-400' : 'text-blue-400'}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.status === 'ahead' ? 'bg-emerald-500' : s.status === 'behind' ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${(s.internal/s.maxInternal)*100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="Academic AI Profiler" subtitle="Deep institutional learning curve analysis" icon={Brain}>
          <div className="mt-3 min-h-[60px] p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-1">
              <Zap size={20} className="text-purple-400" />
            </div>
            {aiReport ? (
              <p className="text-purple-200 font-medium leading-relaxed text-sm">{aiReport}</p>
            ) : (
              <span className="text-purple-400/50 italic flex items-center gap-2 text-sm mt-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />
                Aggregating academic transcript data...
              </span>
            )}
          </div>
        </GlassCard>
      </div>
      
      <AIChat role="student" />
    </DashboardLayout>
  );
}
