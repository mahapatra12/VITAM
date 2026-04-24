import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, BookOpen, Clock, AlertTriangle, TrendingUp, MessageCircle,
  ShieldCheck, Brain, Sparkles, ChevronRight, Mail, Phone, MapPin
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell
} from 'recharts';
import { useToast } from '../../components/ui/ToastSystem';

const WARD = {
  name: 'Aarav Mehta',
  regNo: 'CS2022047',
  branch: 'Computer Science',
  semester: '5th Semester',
  batch: '2022–26',
  cgpa: 8.74,
  attendance: 91.2,
};

const TRAJECTORY = [
  { term: 'SEM 1', gpa: 8.2 },
  { term: 'SEM 2', gpa: 8.5 },
  { term: 'SEM 3', gpa: 8.1 },
  { term: 'SEM 4', gpa: 8.4 },
  { term: 'SEM 5', gpa: 8.7 },
];

const SUBJECTS = [
  { name: 'Data Structures', code: 'CS301', faculty: 'Dr. S. Mehta', attendance: 94, internal: 38, max: 40, grade: 'O' },
  { name: 'Operating Systems', code: 'CS401', faculty: 'Dr. R. Patel', attendance: 88, internal: 35, max: 40, grade: 'A+' },
  { name: 'Cloud Computing', code: 'CS501', faculty: 'Prof. V. Iyer', attendance: 96, internal: 37, max: 40, grade: 'O' },
  { name: 'S/W Engineering', code: 'CS601', faculty: 'Dr. N. Singh', attendance: 85, internal: 32, max: 40, grade: 'A' },
];

const HEALTH_CHART = [
  { name: 'Attendance', value: 91, fill: '#10b981' },
  { name: 'Gap', value: 9, fill: '#ffffff10' },
];

const TS = { 
  contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }, 
  itemStyle: { color: '#e2e8f0' }, 
  labelStyle: { color: '#94a3b8', fontWeight: 700 } 
};

export default function ParentDashboard() {
  const { push } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setAiInsight('System Analysis: Aarav is in the top 15% of his batch. Attendance is optimal at 91.2%. Predicted end-semester CGPA: 8.85.');
    }, 1800);
  }, []);

  const handleMessage = (e) => {
    e.preventDefault();
    push({ type: 'success', title: 'Query Submitted', body: 'The Class Advisor has been notified of your inquiry.' });
  };

  return (
    <DashboardLayout title="Guardian Operations Portal" role="PARENT">
      
      <div className="mb-14 p-12 rounded-[4rem] bg-indigo-600/[0.02] border border-white/5 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-5xl font-black text-white border border-white/10 shadow-2xl italic">
            {WARD.name[0]}
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-500 mb-4 italic">Verified Institutional Guardian</p>
            <h2 className="text-7xl font-black text-white tracking-tighter italic uppercase leading-none">Ward: {WARD.name}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5">
              {[WARD.regNo, WARD.branch, WARD.semester, WARD.batch].map(v => (
                <span key={v} className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 bg-indigo-500/10 border border-indigo-500/10 px-4 py-2 rounded-2xl italic">{v}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-12">
            <div className="text-center">
              <p className="text-5xl font-black text-white tracking-tighter italic">{WARD.cgpa}</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 italic">Current CGPA</p>
            </div>
            <div className="w-px h-20 bg-white/5" />
            <div className="text-center">
              <p className="text-5xl font-black text-emerald-500 tracking-tighter italic">{WARD.attendance}%</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2 italic">Attendance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <GlassCard title="Performance Trajectory" subtitle="Semester-wise GPA progression analysis" className="lg:col-span-2 bg-white/[0.02] border-white/5 rounded-[40px] p-8">
          <div className="h-[320px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TRAJECTORY}>
                <defs>
                  <linearGradient id="colorGpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="term" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={[7, 10]} />
                <Tooltip {...TS} />
                <Area type="monotone" dataKey="gpa" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorGpa)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Attendance Overview" subtitle="Compliance with institutional standards" className="flex flex-col items-center justify-center bg-white/[0.02] border-white/5 rounded-[40px] p-8">
          <div className="h-[240px] w-full mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={HEALTH_CHART} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={80} outerRadius={120} paddingAngle={2} dataKey="value" stroke="none">
                  {HEALTH_CHART.map((e, index) => <Cell key={index} fill={e.fill} />)}
                </Pie>
                <Tooltip hide />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-[65%] left-1/2 -translate-x-1/2 text-center text-white">
              <p className="text-5xl font-black tracking-tighter italic">91%</p>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mt-2 italic">Optimal</p>
            </div>
          </div>
          <div className="p-8 bg-indigo-600/5 border border-indigo-500/10 mt-10 w-full rounded-[2.5rem] relative overflow-hidden group/insight">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-4 italic">Strategic Synthesis</p>
            <p className="text-base text-white font-bold italic leading-relaxed tracking-tight">"{aiInsight}"</p>
            <Brain size={48} className="absolute bottom-0 right-0 p-4 opacity-5 group-hover/insight:scale-110 transition-transform" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <GlassCard title="Academic Scorecard" subtitle="Live subject metrics & faculty assessment" className="bg-white/[0.02] border-white/5 rounded-[40px] p-10">
          <div className="mt-8 space-y-5">
            {SUBJECTS.map((s) => (
              <div key={s.code} className="p-6 bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all rounded-3xl">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <p className="text-white font-black text-base italic">{s.name}</p>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 italic">{s.faculty} · {s.code}</p>
                  </div>
                  <span className="text-xs font-black px-4 py-1.5 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 italic">{s.grade}</span>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">
                      <span>Attendance</span><span>{s.attendance}%</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${s.attendance}%` }} className={`h-full rounded-full ${s.attendance < 90 ? 'bg-amber-600' : 'bg-emerald-600'}`} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 italic">
                      <span>Internal Score</span><span>{s.internal}/{s.max}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(s.internal/s.max)*100}%` }} className="h-full bg-indigo-600 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="Support & Feedback" subtitle="Institutional communication channel" icon={ShieldCheck} className="bg-white/[0.02] border-white/5 rounded-[40px] p-10">
          <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: Phone, label: 'Reception', value: '+91 80-4521 9900' },
                { icon: Mail, label: 'Class Advisor', value: 'advisor.cs@vitam.edu.in' },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-5 p-5 bg-white/[0.03] border border-white/5 rounded-3xl">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400"><c.icon size={20} /></div>
                  <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{c.label}</p>
                    <p className="text-xs font-bold text-white mt-1 italic">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleMessage} className="space-y-6">
              <div className="group">
                <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3 block italic">Inquiry Details</label>
                <textarea placeholder="Specify your query or feedback for the academic department..." 
                  className="w-full h-40 p-6 bg-white/[0.03] border border-white/10 rounded-[2rem] text-white text-base font-bold focus:outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-700 italic" />
              </div>
              <button type="submit" className="w-full py-6 rounded-[2rem] bg-indigo-600 text-white font-black text-base hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-3 italic">
                <MessageCircle size={20} /> Submit Inquiry
              </button>
            </form>
          </div>
        </GlassCard>
      </div>

    </DashboardLayout>
  );
}
