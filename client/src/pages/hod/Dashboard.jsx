import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Users, GraduationCap, BookOpen, X,
  Brain, TrendingDown, AlertTriangle, Zap,
  Search, Shield, Activity, BarChart3, Database, Globe
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  LineChart, Line
} from 'recharts';
import { MOCK_DATA } from '../../utils/api';
import api from '../../utils/api';
import SystemMirror from '../../components/ui/SystemMirror';
import CommandFeed from '../../components/ui/CommandFeed';
import { useHealth } from '../../context/HealthContext';
import { useToast } from '../../components/ui/ToastSystem';
import Telemetry from '../../utils/telemetry';
import SystemStatusPanel from '../../components/ui/SystemStatusPanel';
import SafeChart from '../../components/ui/SafeChart';

const DEPARTMENT_KPI = [
  { label: 'Curricular Alignment', value: 94, color: 'text-blue-500' },
  { label: 'Resource Utilization', value: 82, color: 'text-indigo-500' },
  { label: 'Student Satisfaction', value: 88, color: 'text-emerald-500' },
  { label: 'Outcome Attainment', value: 76, color: 'text-amber-500' },
];

const COURSE_DATA = [
  { name: 'OS', avg: 3.4, students: 84, fail: 8 },
  { name: 'DBMS', avg: 3.8, students: 84, fail: 3 },
  { name: 'DS', avg: 3.2, students: 84, fail: 12 },
  { name: 'CN', avg: 3.6, students: 84, fail: 5 },
  { name: 'AI', avg: 3.5, students: 84, fail: 7 },
];

const DROPOUT_RISK = [
  { student: 'Suresh M.', roll: '20CS047', atd: 58, marks: 38, risk: 98 },
  { student: 'Kavya R.', roll: '20CS063', atd: 65, marks: 44, risk: 84 },
  { student: 'Deva P.', roll: '20CS091', atd: 69, marks: 49, risk: 71 },
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
  { name: 'Core', value: 40, color: '#3b82f6' },
  { name: 'Electives', value: 30, color: '#10b981' },
  { name: 'Lab', value: 30, color: '#8b5cf6' },
];

const TS = { 
  contentStyle: { backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, backdropFilter: 'blur(16px)' }, 
  itemStyle: { color: '#e2e8f0', fontSize: 12, fontWeight: 700 }, 
  labelStyle: { color: '#64748b', fontWeight: 800, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.1em' } 
};

export default function HodDashboard() {
  const { health } = useHealth();
  const { push } = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stats] = useState(MOCK_DATA.hod);
  const [aiDropoutInsight, setAiDropoutInsight] = useState('');

  const handleAcademicAction = (action) => {
    Telemetry.info(`[Action] HOD initiated departmental directive: ${action}`);
    push({
      type: 'info',
      title: 'Directive Issued',
      body: `Departmental directive [${action}] has been synchronized with all faculty and student nodes.`
    });
  };

  useEffect(() => {
    const insightTimer = setTimeout(() => {
      setAiDropoutInsight('Departmental AI: Critical focus required on Data Structures (12 students at risk). Research output in AI Lab has increased by 14% this quarter.');
    }, 1600);
    return () => clearTimeout(insightTimer);
  }, []);

  const analyzeDepartment = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/ai/generate-report', { type: 'COURSE_DIFFICULTY', data: stats });
      setReport(data.report);
    } catch {
      setReport(`📊 Departmental Strategy — Computer Science\n\nPriority Actions:\n1. Implement Peer Mentorship for Data Structures\n2. Schedule specialized preparatory modules\n3. Objective: Achieve 93% departmental pass rate.`);
    } finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Departmental Governance" role="HOD">
      <div className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
        <div className="max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <span className="px-4 py-1.5 bg-purple-500/10 text-purple-400 text-[11px] font-black uppercase tracking-[0.4em] rounded-full border border-purple-500/20 italic">Institutional Oversight Verified</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            <span className="text-slate-500 font-black text-[11px] uppercase tracking-[0.4em] italic">Term Cycle: Synchronized</span>
          </motion.div>
          
          <h2 className="text-7xl font-black text-white tracking-tighter mb-8 italic uppercase leading-none">Department <span className="text-purple-600">Governance Hub</span></h2>
          <p className="text-slate-400 font-bold text-xl max-w-2xl leading-relaxed italic tracking-tight uppercase text-[10px] opacity-70">
            STRATEGIC DEPARTMENTAL PERFORMANCE TRACKING, CURRICULUM OPTIMIZATION, AND STUDENT SUCCESS ANALYTICS.
          </p>
          
          <div className="mt-12 flex gap-6">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={analyzeDepartment} disabled={loading}
              className="flex items-center gap-4 px-10 py-5 rounded-[2rem] bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all shadow-2xl shadow-purple-600/20 disabled:opacity-60 italic">
              <Sparkles size={18} />
              {loading ? 'Processing...' : 'Syllabus Compliance Review'}
            </motion.button>
          </div>
        </div>

        <div className="flex-shrink-0 flex items-center gap-4">
           <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency</span>
              <span className="text-xl font-black text-white mt-1">94.2%</span>
           </div>
           <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Index</span>
              <span className="text-xl font-black text-rose-500 mt-1">Low</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Faculty" value={stats.totalFaculty || '24'} icon={Users} color="bg-blue-600" trend="Active" />
        <StatCard title="Enrolled Students" value={stats.totalStudents || '840'} icon={GraduationCap} color="bg-emerald-600" trend="Stable" />
        <StatCard title="Syllabus Progress" value={stats.courseCompletion || '92%'} icon={BookOpen} color="bg-purple-600" trend="+3%" />
        <StatCard title="Priority Alerts" value="04" icon={AlertTriangle} color="bg-rose-600" trend="Managed" />
      </div>

      <AnimatePresence>
        {report && (
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="mb-10 p-8 rounded-3xl border border-purple-500/20 bg-purple-500/5 relative overflow-hidden group">
            <button onClick={() => setReport(null)} className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all"><X size={16} /></button>
            <div className="flex items-center gap-3 mb-6 text-purple-400 font-black text-sm uppercase tracking-widest">
              <Activity size={20} /> Academic Performance Analysis
            </div>
            <p className="text-slate-300 text-base leading-relaxed whitespace-pre-wrap font-bold tracking-tight">
              {report}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <GlassCard title="Academic Velocity" subtitle="Departmental pass rates and GPA trajectory" className="lg:col-span-2">
          <div className="h-[300px] mt-6">
            <SafeChart minHeight={300}>
              <LineChart data={SEMESTER_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="sem" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[7, 9]} />
                <Tooltip {...TS} />
                <Legend iconType="circle" />
                <Line yAxisId="left" type="monotone" dataKey="pass" name="Success Rate" stroke="#10b981" strokeWidth={4} dot={{ r: 5, fill: '#10b981' }} />
                <Line yAxisId="right" type="monotone" dataKey="avg" name="Avg GPA" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 5, fill: '#8b5cf6' }} strokeDasharray="8 4" />
              </LineChart>
            </SafeChart>
          </div>
        </GlassCard>

        <GlassCard title="Resource Allocation" subtitle="Credit distribution by module type" className="flex flex-col items-center justify-center">
          <div className="h-[220px] w-full mt-4">
            <SafeChart minHeight={220}>
              <PieChart>
                <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none">
                  {PIE_DATA.map((e, index) => <Cell key={index} fill={e.color} />)}
                </Pie>
                <Tooltip {...TS} />
              </PieChart>
            </SafeChart>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-3">
            {PIE_DATA.map(d => (
              <div key={d.name} className="flex items-center gap-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="mb-14">
         <GlassCard title="Institutional Service Mirror" subtitle="High-fidelity simulation of departmental resources and academic health" className="overflow-hidden bg-[#0c0c0c]/40 border-white/5 rounded-[40px] p-0">
            <SystemMirror department="COMPUTER SCIENCE" />
         </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
        <GlassCard title="Early Warning Metrics" subtitle="Student performance risks and intervention points" icon={TrendingDown}>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              {DROPOUT_RISK.map((s) => (
                <div key={s.student} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.04] transition-all group">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg ${s.risk >= 90 ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'} border border-white/5`}>
                      {s.risk}%
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-base">{s.student}</p>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{s.roll} · {s.atd}% Attendance</p>
                    </div>
                    <div className="w-32 h-1.5 bg-slate-900 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.risk}%` }} transition={{ duration: 1.5 }}
                        className={`h-full rounded-full ${s.risk >= 90 ? 'bg-rose-500' : 'bg-amber-500'}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-3xl relative overflow-hidden group">
               <div className="relative z-10">
                  <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Strategic Intervention</h4>
                  <p className="text-xl font-bold text-white italic leading-relaxed mb-8">"{aiDropoutInsight}"</p>
                  <button className="px-8 py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">Authorize Action Plan</button>
               </div>
               <Database className="absolute bottom-0 right-0 p-8 opacity-5" size={120} />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <GlassCard title="Academic Success Panel" subtitle="Quality assurance and departmental controls" className="lg:col-span-2 relative overflow-hidden group">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {[
              { id: 'SYNC', label: 'Synchronize Curriculum', desc: 'Align faculty progression', color: 'bg-purple-600', icon: Zap },
              { id: 'SUPPRESS', label: 'Allocate Support Resources', desc: 'Deploy tailored mentorship', color: 'bg-blue-600', icon: GraduationCap },
              { id: 'AUDIT', label: 'Syllabus Compliance Review', desc: 'Audit course coverage metrics', color: 'bg-emerald-600', icon: Shield },
              { id: 'PEER', label: 'Peer Learning Networks', desc: 'Enable collaborative study groups', color: 'bg-slate-800', icon: Users },
            ].map((btn) => (
              <button 
                key={btn.id}
                onClick={() => handleAcademicAction(btn.label)}
                className="flex items-center gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all text-left group/btn"
              >
                <div className={`p-3.5 rounded-xl ${btn.color} text-white shadow-lg transition-transform group-hover/btn:scale-110`}>
                  <btn.icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-black text-white uppercase tracking-tight">{btn.label}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 italic">{btn.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>

        <CommandFeed className="h-full" limit={6} filter={['INFO', 'ADVISORY']} />
      </div>
    </DashboardLayout>
  );
}
