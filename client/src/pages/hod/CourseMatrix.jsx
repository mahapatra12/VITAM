import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ZAxis
} from 'recharts';
import { Network, Search, Zap, CheckCircle2, AlertCircle, TrendingDown, Users, FileText, Activity } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import AIChat from '../../components/AIChat';

const DEPARTMENT_COMPARISON = [
  { course: 'CS-101', avg: 82, highest: 98, failRate: 4 },
  { course: 'CS-201', avg: 68, highest: 92, failRate: 15 },
  { course: 'CS-302', avg: 75, highest: 94, failRate: 8 },
  { course: 'AI-401', avg: 88, highest: 100, failRate: 2 },
  { course: 'AI-402', avg: 71, highest: 95, failRate: 12 },
];

const SCATTER_CORRELATION = [
  { attendance: 95, marks: 92 }, { attendance: 88, marks: 85 }, { attendance: 92, marks: 88 },
  { attendance: 75, marks: 65 }, { attendance: 65, marks: 45 }, { attendance: 82, marks: 78 },
  { attendance: 98, marks: 96 }, { attendance: 60, marks: 42 }, { attendance: 85, marks: 72 },
  { attendance: 78, marks: 70 }, { attendance: 90, marks: 84 }, { attendance: 72, marks: 58 },
];

const CURRICULUM_NODES = [
  { id: 'Phase 1', status: 'completed', content: 'Syllabus Review & Board Approval' },
  { id: 'Phase 2', status: 'completed', content: 'Faculty Allocation & Timetable Sync' },
  { id: 'Phase 3', status: 'current', content: 'Mid-Semester Feedback Aggregation' },
  { id: 'Phase 4', status: 'pending', content: 'Internal Question Paper Generation' },
  { id: 'Phase 5', status: 'pending', content: 'Final Evaluation Matrix Setup' },
];

const TS = { contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }, itemStyle: { color: '#e2e8f0' } };

export default function CourseMatrix() {
  const [report, setReport] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setReport('HOD AI: Correlation analysis between Attendance and Marks (Scatter plot) yields an extremely high r-value of 0.89 for the CSE department. CS-201 (Data Structures) is an outlier with a 15% fail rate globally across all batches. Curriculum Pipeline is currently bottlenecked at Phase 3 (Mid-Semester Feedback) due to pending evaluation from 4 junior faculties. Recommend automated reminder disbursement.');
    }, 1500);
  }, []);

  return (
    <DashboardLayout title="Course Interweave Matrix" role="HOD">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">Curriculum Topography</h2>
        <p className="text-slate-400 font-medium mt-1">Cross-course difficulty mappings & pipeline state</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Modules" value="48" icon={Network} color="bg-blue-500" />
        <StatCard title="Avg Pass Rate" value="91.8%" icon={CheckCircle2} color="bg-emerald-500" />
        <StatCard title="High Risk Courses" value="2" icon={AlertCircle} color="bg-red-500" />
        <StatCard title="Pipeline Status" value="Phase 3" icon={Activity} color="bg-amber-500" trend="On Schedule" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard title="Course Difficulty Heatmap" subtitle="Average marks vs failure rate across department">
          <div className="h-[250px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DEPARTMENT_COMPARISON}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="course" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...TS} />
                <Bar yAxisId="left" dataKey="avg" name="Avg Score" radius={[4, 4, 0, 0]}>
                  {DEPARTMENT_COMPARISON.map((e, i) => (
                    <Cell key={i} fill={e.avg < 70 ? '#f59e0b' : '#3b82f6'} />
                  ))}
                </Bar>
                <Bar yAxisId="right" dataKey="failRate" name="Fail Rate %" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Attendance vs Performance Correlation" subtitle="Scatter analysis across 1,200 data points">
          <div className="h-[250px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" dataKey="attendance" name="Attendance" unit="%" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[50, 100]} />
                <YAxis type="number" dataKey="marks" name="Marks" unit="%" tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[30, 100]} />
                <ZAxis range={[60, 60]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} {...TS} />
                <Scatter name="Students" data={SCATTER_CORRELATION} fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard title="Curriculum Fulfillment Pipeline" subtitle="Semester operation workflow tracking">
          <div className="mt-4 px-4 pb-4 border-l-2 border-slate-700 ml-4 space-y-6">
            {CURRICULUM_NODES.map((node, i) => (
              <div key={node.id} className="relative">
                <div className={`absolute -left-[25px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-4 border-[#0f172a] ${
                  node.status === 'completed' ? 'bg-emerald-500' :
                  node.status === 'current' ? 'bg-blue-500 animate-pulse ring-4 ring-blue-500/20' :
                  'bg-slate-600'
                }`} />
                <div className={`p-3 rounded-xl border ${
                  node.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/5' :
                  node.status === 'current' ? 'bg-blue-500/10 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]' :
                  'bg-slate-800/50 border-white/5 opacity-50'
                }`}>
                  <p className={`font-black text-sm ${
                    node.status === 'completed' ? 'text-emerald-400' :
                    node.status === 'current' ? 'text-blue-400' :
                    'text-slate-400'
                  }`}>{node.id}</p>
                  <p className="text-white text-xs mt-0.5">{node.content}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="HOD AI Interweave Scanner" subtitle="Automated cross-course dependency analysis" icon={Zap}>
          <div className="mt-3 min-h-[60px] p-4 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shrink-0 mt-1 border border-slate-700 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
              <Network size={20} className="text-slate-300" />
            </div>
            {report ? (
              <p className="text-slate-200 font-medium leading-relaxed text-sm">{report}</p>
            ) : (
              <span className="text-slate-500 italic flex items-center gap-2 text-sm mt-2">
                <div className="w-2 h-2 bg-slate-500 rounded-full animate-ping" />
                Computing dependency graphs...
              </span>
            )}
          </div>
        </GlassCard>
      </div>

      <AIChat role="hod" />
    </DashboardLayout>
  );
}
