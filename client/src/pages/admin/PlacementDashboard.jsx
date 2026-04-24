import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import { Briefcase, Users, TrendingUp, Award, Star, Building2, Target, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import SystemStatusPanel from '../../components/ui/SystemStatusPanel';
import CommandFeed from '../../components/ui/CommandFeed';
import { useHealth } from '../../context/HealthContext';
import Telemetry from '../../utils/telemetry';
import SafeChart from '../../components/ui/SafeChart';

const RECRUITER_DATA = [
  { company: 'Google', package: 32, hired: 4, sector: 'Tech' },
  { company: 'Microsoft', package: 28, hired: 6, sector: 'Tech' },
  { company: 'Infosys', package: 8, hired: 22, sector: 'IT Services' },
  { company: 'TCS', package: 7, hired: 45, sector: 'IT Services' },
  { company: 'Amazon', package: 18, hired: 9, sector: 'Tech' },
  { company: 'Wipro', package: 6, hired: 31, sector: 'IT Services' },
];

const DOMAIN_DATA = [
  { name: 'Software Dev', value: 42, color: '#3b82f6' },
  { name: 'Data Science', value: 21, color: '#8b5cf6' },
  { name: 'Cloud/DevOps', value: 16, color: '#06b6d4' },
  { name: 'Core/Mfg', value: 12, color: '#f59e0b' },
  { name: 'Management', value: 9, color: '#10b981' },
];

const PACKAGE_DIST = [
  { range: '<5 LPA', students: 18 },
  { range: '5-10 LPA', students: 87 },
  { range: '10-20 LPA', students: 34 },
  { range: '20-30 LPA', students: 12 },
  { range: '>30 LPA', students: 7 },
];

const INDUSTRY_MATCH = [
  { branch: 'CSE', match: 94, avg_pkg: 14.2, placed: 89 },
  { branch: 'ECE', match: 78, avg_pkg: 9.1, placed: 72 },
  { branch: 'MECH', match: 58, avg_pkg: 6.4, placed: 61 },
  { branch: 'CIVIL', match: 47, avg_pkg: 5.8, placed: 55 },
];

const TRAJECTORY_DATA = [
  { month: 'Oct', velocity: 15, predicted: 18 },
  { month: 'Nov', velocity: 32, predicted: 35 },
  { month: 'Dec', velocity: 48, predicted: 52 },
  { month: 'Jan', velocity: 64, predicted: 70 },
  { month: 'Feb', velocity: 78, predicted: 85 },
  { month: 'Mar', velocity: 89, predicted: 94 },
];

export default function PlacementDashboard() {
  const { health } = useHealth();
  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => {
    // Simulate AI placement analysis
    setTimeout(() => {
      setAiInsight(
        'VITAM Placement AI: CSE branch leads with 94% industry-match score. ' +
        'Top demand sectors: Cloud (AWS/GCP) +38% YoY, AI/ML +62% YoY. ' +
        'Recommendation: Fast-track 45 MECH students for Product Design roles to improve overall placement %. ' +
        'TCS and Infosys have confirmed on-campus drives for Q2. Initiate pre-screening round.'
      );
    }, 1500);
  }, []);

  return (
    <DashboardLayout title="Placement Management" role="ADMIN">
      <div className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-[10px] font-black uppercase tracking-[0.6em] mb-4 ${health.entropy > 40 ? 'text-red-400' : 'text-blue-400'} italic`}
          >
            INSTITUTIONAL PLACEMENT HUB · {health.entropy > 40 ? 'Market Drift' : 'Q1 Drive Active'}
          </motion.p>
          <h2 className="text-6xl font-black text-white tracking-tighter text-premium-gradient italic mb-1 uppercase">
             Placement <span className="text-blue-500">Command</span>
          </h2>
          <p className="text-slate-400 font-bold mt-2 max-w-xl italic leading-relaxed uppercase text-[10px] tracking-widest">
            Corporate matchmaking intelligence, neural trajectory predictions & institutional recruiter telemetry.
          </p>
        </div>

        <div className="flex-shrink-0">
          <SystemStatusPanel mode="CAMPUS" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Placed" value="158" icon={Users} color="bg-emerald-500" trend="+18%" />
        <StatCard title="Avg Package" value="₹8.4 LPA" icon={TrendingUp} color="bg-blue-500" trend="+12%" />
        <StatCard title="Highest Package" value="₹32 LPA" icon={Award} color="bg-amber-500" />
        <StatCard title="Active Recruiters" value="24" icon={Building2} color="bg-purple-500" trend="+4" />
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Industry Match by Branch */}
        <GlassCard title="Industry Match Score" subtitle="AI-computed compatibility with current market demand">
          <div className="mt-4 space-y-4">
            {INDUSTRY_MATCH.map(b => (
              <div key={b.branch}>
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1">
                  <span className="text-slate-300">{b.branch}</span>
                  <div className="flex gap-3 items-center">
                    <span className="text-slate-400">{b.placed}% placed</span>
                    <span className="text-emerald-400">₹{b.avg_pkg}L avg</span>
                    <span className={b.match >= 80 ? 'text-emerald-400 font-black' : b.match >= 60 ? 'text-amber-400 font-black' : 'text-red-400 font-black'}>
                      {b.match}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${b.match >= 80 ? 'bg-emerald-500' : b.match >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${b.match}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Domain Distribution */}
        <GlassCard title="Placement Domain Split" subtitle="Where students are getting placed">
          <div className="h-[240px] mt-2">
            <SafeChart minHeight={240}>
              <PieChart>
                <Pie data={DOMAIN_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={3} dataKey="value">
                  {DOMAIN_DATA.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(v) => [`${v}%`, 'Share']}
                />
                <Legend iconType="circle" iconSize={8}
                  formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>{value}</span>}
                />
              </PieChart>
            </SafeChart>
          </div>
        </GlassCard>
      </div>

      {/* Row 2: Matchmaking & Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Matchmaking Telemetry */}
        <GlassCard title="Matchmaking Telemetry" subtitle="Live corporate interaction vectors" className="lg:col-span-1">
           <CommandFeed limit={5} filter={['INFO']} className="h-[300px]" />
        </GlassCard>

        {/* Career Trajectory Prediction */}
        <GlassCard title="Career Trajectory Pulse" subtitle="Neural velocity vs Predicted growth" className="lg:col-span-2">
          <div className="h-[300px] mt-4">
            <SafeChart minHeight={300}>
              <AreaChart data={TRAJECTORY_DATA}>
                <defs>
                  <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '16px' }}
                  itemStyle={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: '900' }}
                />
                <Area type="monotone" dataKey="velocity" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorVelocity)" />
                <Area type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPredicted)" />
              </AreaChart>
            </SafeChart>
          </div>
          <div className="mt-4 flex items-center justify-between px-2">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Velocity</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Predicted Target</span>
             </div>
          </div>
        </GlassCard>
      </div>

      {/* Row 3: Advanced Recruiter Grid & AI Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard title="Top Recruiters" subtitle="On-campus drive analytics">
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-[300px] pr-1">
            {RECRUITER_DATA.map((r) => (
              <div key={r.company} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-blue-500/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Building2 size={14} />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm uppercase tracking-tight">{r.company}</p>
                    <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{r.sector}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-black text-sm">₹{r.package}L</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="AI Placement Intelligence" subtitle="Autonomous market analysis & recommendations" icon={Zap}>
          <div className="mt-3 min-h-[80px] flex flex-col justify-center">
            {aiInsight ? (
              <p className="text-emerald-400 font-bold leading-relaxed text-sm italic">"{aiInsight}"</p>
            ) : (
              <span className="text-slate-500 italic flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                Computing industry-match vectors...
              </span>
            )}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
