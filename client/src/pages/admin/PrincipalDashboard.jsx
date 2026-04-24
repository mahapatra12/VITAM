import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import {
  BookOpen, Users, Flag, LayoutDashboard, TrendingUp,
  AlertTriangle, CheckCircle, Brain, Award, Clock, Target, Zap, ShieldCheck, Cpu,
  BarChart3, Shield, Activity, Search, RefreshCcw, Database, Globe
} from 'lucide-react';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, Legend
} from 'recharts';
import AIOrchestration from '../../components/ui/AIOrchestration';
import UnifiedDashboard from '../../components/ui/UnifiedDashboard';
import SystemAnnouncement from '../../components/ui/SystemAnnouncement';
import CommandFeed from '../../components/ui/CommandFeed';
import { useHealth } from '../../context/HealthContext';
import { useToast } from '../../components/ui/ToastSystem';
import Telemetry from '../../utils/telemetry';

const Motion = motion;

const DEPT_RADAR = [
  { dept: 'CSE', value: 98 },
  { dept: 'ECE', value: 89 },
  { dept: 'MECH', value: 74 },
  { dept: 'CIVIL', value: 77 },
  { dept: 'MBA', value: 92 },
  { dept: 'MCA', value: 95 },
];

const APPROVALS = [
  { item: 'Institutional Resource Optimization: Research', dept: 'All', amount: '₹2.8Cr', urgency: 'PRIORITY_ONE', days: 0 },
  { item: 'Departmental Performance Alignment: MECH', dept: 'MECH', amount: 'N/A', urgency: 'HIGH_PRIORITY', days: 1 },
  { item: 'Academic Curriculum Synchronization', dept: 'All', amount: 'N/A', urgency: 'DIRECTIVE', days: 0 },
];

const RISK_DATA = [
  { dept: 'CSE', risk: 2, pass: 98 },
  { dept: 'ECE', risk: 8, pass: 92 },
  { dept: 'MECH', risk: 14, pass: 84 },
  { dept: 'CIVIL', risk: 12, pass: 86 },
  { dept: 'MBA', risk: 4, pass: 97 },
  { dept: 'MCA', risk: 5, pass: 96 },
];

const TS = { 
  contentStyle: { backgroundColor: '#0c0c0c', border: '1px solid #1e293b', borderRadius: 12 }, 
  itemStyle: { color: '#e2e8f0', fontSize: 12, fontWeight: 700 }, 
  labelStyle: { color: '#64748b', fontWeight: 800, textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.1em', fontStyle: 'italic' } 
};

export default function PrincipalDashboard() {
  const { user } = useAuth();
  const { health } = useHealth();
  const { push } = useToast();
  const title = user?.subRole === 'vice_principal' ? 'Academic Governance' : 'Institutional Leadership';
  
  const [strategicCompletion, setStrategicCompletion] = useState(68);

  const handleRemediation = (node) => {
    Telemetry.advisory(`[Executive Action] Principal initiated intervention: ${node}`);
    push({
      type: 'success',
      title: 'Strategic Intervention',
      body: `Institutional resources synchronized for ${node} performance optimization.`
    });
  };

  useEffect(() => {
    const id = setInterval(() => {
      setStrategicCompletion(c => Math.min(100, Math.max(50, c + (Math.random() - 0.35) * 1.5)));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const urgencyColor = (u) => u === 'PRIORITY_ONE' || u === 'DIRECTIVE' ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' : u === 'HIGH_PRIORITY' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 'text-slate-500 bg-slate-500/10 border-slate-500/20';

  return (
    <DashboardLayout title={title} role="ADMIN">
      <Motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-14 flex flex-col xl:flex-row xl:items-center justify-between gap-12 bg-white/[0.02] p-12 rounded-[40px] border border-white/5 shadow-2xl"
      >
        <div className="flex-1">
          <div className="flex items-center gap-5 mb-6">
            <div className="p-3 bg-blue-600/10 border border-blue-600/20 rounded-2xl text-blue-500 shadow-inner">
              <Shield size={22} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 italic">
              Executive Oversight · Institutional Synchrony Optimal
            </p>
          </div>
          
          <h2 className="text-7xl font-black text-white tracking-tighter italic mb-6 leading-none">
            Institutional <span className="text-blue-500">Governance</span>
          </h2>
          <p className="text-slate-400 font-bold text-lg max-w-xl leading-relaxed italic tracking-tight">
            Advanced academic orchestration, strategic resource management, and multi-departmental performance monitoring.
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-5">
           <button onClick={() => window.location.reload()} className="p-6 rounded-[2rem] bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all active:scale-95 shadow-lg">
             <RefreshCcw size={22} />
           </button>
           <button className="px-12 py-6 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all italic underline-offset-8 decoration-white/20">
             Generate Institutional Audit
           </button>
        </div>
      </Motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-7 mb-14">
        <StatCard title="Faculty Performance" value="9.4" icon={TrendingUp} color="bg-blue-600" trend="Optimal" />
        <StatCard title="Strategic Growth" value="18.4%" icon={Award} color="bg-indigo-600" trend="+4.2% Gain" />
        <StatCard title="Learning Nodes" value="512" icon={BookOpen} color="bg-blue-500" trend="Active" />
        <StatCard title="System Variance" value={`${health.variance}%`} icon={Activity} color={health.variance > 40 ? 'bg-rose-600' : 'bg-blue-600'} trend={health.variance > 40 ? 'Record Identified' : 'Optimized'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
        <GlassCard title="Academic Proficiency Matrix" subtitle="Departmental competency and passing metrics (%)" className="lg:col-span-2 bg-[#0c0c0c]/40 border-white/5 rounded-[40px] p-10">
          <div className="h-[380px] mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={RISK_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                <XAxis dataKey="dept" tick={{ fill: '#475569', fontSize: 11, fontWeight: 900 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...TS} />
                <Bar dataKey="pass" name="Proficiency" fill="#2563eb" radius={[12, 12, 0, 0]} barSize={50} />
                <Bar dataKey="risk" name="Strategic Variance" fill="#475569" radius={[12, 12, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Competency Distribution" subtitle="Institutional skill-set mapping across sectors" className="bg-[#0c0c0c]/40 border-white/5 rounded-[40px] p-10">
          <div className="h-[380px] mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={DEPT_RADAR} outerRadius="80%">
                <PolarGrid stroke="#ffffff05" />
                <PolarAngleAxis dataKey="dept" tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} />
                <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={5} dot={{ r: 4, fill: '#3b82f6' }} />
                <Tooltip {...TS} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
        <GlassCard title="Strategic Authorizations" subtitle="Institutional strategic directives pending verification" icon={Flag} className="bg-[#0c0c0c]/40 border-white/5 rounded-[40px] p-10">
          <div className="mt-10 space-y-5">
            {APPROVALS.map((a, i) => (
              <div key={i} className="flex items-center gap-6 p-7 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-blue-500/20 transition-all group shadow-inner">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-base truncate uppercase tracking-tight italic">{a.item}</p>
                  <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mt-2 italic">{a.dept} · {a.amount} · PRIORITY ONE</p>
                </div>
                <span className={`text-[9px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-[0.2em] border italic ${urgencyColor(a.urgency)}`}>{a.urgency}</span>
                <button className="p-4 rounded-2xl bg-blue-600/10 text-blue-500 border border-blue-600/20 hover:bg-blue-600 hover:text-white transition-all active:scale-95"><CheckCircle size={20} /></button>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col bg-[#0c0c0c]/40 border-white/5 rounded-[40px] p-12 h-full shadow-2xl">
          <div className="flex items-center gap-5 mb-10">
            <div className="p-4 rounded-[1.5rem] bg-blue-600/10 text-blue-500 shadow-inner">
              <Brain size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Strategic Synthesis</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-2 italic">Institutional Performance Alignment</p>
            </div>
          </div>
          
           <div className="p-10 rounded-[3rem] bg-blue-600/5 border border-blue-500/10 border-l-blue-600 border-l-[6px] mb-12 shadow-inner">
              <p className="text-[15px] text-blue-400 font-bold tracking-tight italic leading-relaxed">
                "Governance Analysis: Institutional alignment has been stabilized. Strategic resource optimization has synchronized performance metrics by 84% across core technical nodes."
              </p>
           </div>

           <div className="flex-1 bg-black/40 p-12 rounded-[3.5rem] border border-white/5 shadow-inner">
              <div className="flex items-center justify-between mb-6">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Strategic KPI Alignment</p>
                <span className="text-2xl font-black text-blue-500 tabular-nums italic">{strategicCompletion.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  className="h-full bg-blue-600 shadow-[0_0_20px_#2563eb]"
                  animate={{ width: `${strategicCompletion}%` }}
                />
              </div>
              
              <div className="mt-12 grid grid-cols-2 gap-6">
                 {[
                   { id: 'SEC', label: 'Security Audit', icon: Shield, color: 'text-emerald-500' },
                   { id: 'AI', label: 'Systems Review', icon: BarChart3, color: 'text-blue-500' },
                 ].map(btn => (
                   <button 
                     key={btn.id}
                     onClick={() => handleRemediation(btn.label)}
                     className="flex flex-col items-center gap-5 p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-blue-500/30 hover:bg-white/[0.06] transition-all group shadow-lg"
                   >
                     <btn.icon size={28} className={`${btn.color} group-hover:scale-110 transition-transform shadow-2xl`} />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic group-hover:text-slate-300">{btn.label}</span>
                   </button>
                 ))}
              </div>
           </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-14">
         <CommandFeed limit={4} filter={['CRITICAL', 'INFO']} className="bg-[#0c0c0c]/40 border-white/5 rounded-[40px] p-10" />
      </div>

      <AIOrchestration />
      <UnifiedDashboard />
      <SystemAnnouncement />
    </DashboardLayout>
  );
}
