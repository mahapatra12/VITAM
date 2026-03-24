import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, UserCheck, AlertCircle, Brain, Target, 
  ArrowUpRight, Users, BookOpen, GraduationCap,
  Activity, Star, Zap, Search, Filter
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, RadarChart, PolarGrid, 
  PolarAngleAxis, Radar, BarChart, Bar, Cell
} from 'recharts';

const PREDICTION_DATA = [
  { month: 'Jan', graduation: 82, placement: 75, risk: 12 },
  { month: 'Feb', graduation: 85, placement: 78, risk: 10 },
  { month: 'Mar', graduation: 84, placement: 82, risk: 11 },
  { month: 'Apr', graduation: 88, placement: 85, risk: 8 },
  { month: 'May', graduation: 91, placement: 89, risk: 5 },
  { month: 'Jun', graduation: 94, placement: 92, risk: 4 },
];

const SKILL_RADAR = [
  { subject: 'Technical', A: 120, fullMark: 150 },
  { subject: 'Soft Skills', A: 98, fullMark: 150 },
  { subject: 'Attendance', A: 86, fullMark: 150 },
  { subject: 'Research', A: 99, fullMark: 150 },
  { subject: 'Innovation', A: 85, fullMark: 150 },
];

const SUCCESS_METRICS = [
  { name: 'Placement Velocity', value: '+12%', sub: 'Avg Salary hike' },
  { name: 'Gate Qualification', value: '88%', sub: 'Predicted Pass' },
  { name: 'Research Output', value: '4.2', sub: 'Papers/Faculty' },
  { name: 'Retention Rate', value: '98.5%', sub: 'Institutional Stability' }
];

export default function PredictiveAnalytics() {
  return (
    <DashboardLayout title="Neural Predictive Success Center" role="ADMIN">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">AI Synthesis Active</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-2">Neural Prediction Hub</h1>
          <p className="text-slate-500 font-medium">Predicting student success trajectories and institutional growth velocity.</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase text-slate-400 hover:text-white transition-all">Export Neural Log</button>
          <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase shadow-[0_0_20px_rgba(37,99,235,0.4)]">Trigger Global Audit</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {SUCCESS_METRICS.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-6 rounded-[2rem] bg-gradient-to-br from-slate-900 to-black border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <Brain size={60} className="text-blue-500" />
             </div>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{s.name}</p>
             <h3 className="text-2xl font-black text-white mb-1">{s.value}</h3>
             <p className="text-[9px] font-bold text-blue-500/60 uppercase">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <GlassCard title="Predictive Success Velocity" icon={TrendingUp} subtitle="6-month graduation & placement trajectory forecast">
            <div className="h-[350px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PREDICTION_DATA}>
                  <defs>
                    <linearGradient id="gradSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradRisk" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#666', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="graduation" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#gradSuccess)" />
                  <Area type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#gradRisk)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard title="Institutional Skill Matrix" icon={Target} subtitle="Global competency indexing">
            <div className="h-[350px] mt-6 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={SKILL_RADAR}>
                  <PolarGrid stroke="#222" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, fontWeight: 900 }} />
                  <Radar name="VITAM Average" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>

      <GlassCard title="Neural At-Risk Identification (AI-Agent Override)" icon={AlertCircle} subtitle="Top priority interventions predicted by neural engine">
        <div className="mt-6 space-y-4">
          {[
            { name: "Siddharth Mohanty", id: "CS24001", risk: "Critical", factor: "Attendance Drop-off (45%)", intervention: "Counselor Assigned" },
            { name: "Priya Dash", id: "ME24102", risk: "Medium", factor: "Assessment Decay (Sem 3)", intervention: "Remedial Alert" },
            { name: "Rakesh Mehra", id: "EE24056", risk: "Medium", factor: "Exam Stress Patterns", intervention: "Wellness Sync" }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/5 hover:border-white/10 transition-all group">
               <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-blue-500 transition-colors">
                     <UserCheck size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{item.name}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{item.id} · {item.factor}</p>
                  </div>
               </div>
               <div className="flex items-center gap-8">
                  <div className="text-right">
                     <p className="text-[9px] font-black uppercase text-slate-600 mb-1">Risk Level</p>
                     <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${item.risk === 'Critical' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {item.risk}
                     </span>
                  </div>
                  <button className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white">
                     <ChevronRight size={18} />
                  </button>
               </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}
