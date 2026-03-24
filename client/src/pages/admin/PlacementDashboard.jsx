import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import { Briefcase, Users, TrendingUp, Award, Star, Building2, Target, Zap } from 'lucide-react';
import AIChat from '../../components/AIChat';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

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

export default function PlacementDashboard() {
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
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">Placement Command</h2>
        <p className="text-slate-400 font-medium mt-1">Industry match analysis & recruiter intelligence</p>
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
            <ResponsiveContainer width="100%" height="100%">
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
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Package Distribution */}
        <GlassCard title="Package Distribution" subtitle="Students per salary bracket">
          <div className="h-[220px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PACKAGE_DIST}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12 }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="students" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Recruiter Tracker */}
        <GlassCard title="Top Recruiters" subtitle="On-campus drive analytics">
          <div className="mt-3 space-y-2 overflow-y-auto max-h-[220px] pr-1">
            {RECRUITER_DATA.map((r, i) => (
              <div key={r.company} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-xs font-black w-5">#{i + 1}</span>
                  <div>
                    <p className="text-white font-black text-sm">{r.company}</p>
                    <p className="text-slate-400 text-xs">{r.sector}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-black text-sm">₹{r.package} LPA</p>
                  <p className="text-slate-400 text-xs">{r.hired} hired</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI Placement Intelligence */}
      <GlassCard title="AI Placement Intelligence" subtitle="Autonomous market analysis & recommendations" icon={Zap}>
        <div className="mt-3 min-h-[80px] flex items-start">
          {aiInsight ? (
            <p className="text-emerald-400 font-medium leading-relaxed text-sm">{aiInsight}</p>
          ) : (
            <span className="text-slate-500 italic flex items-center gap-2 m-auto text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              Computing industry-match vectors...
            </span>
          )}
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}
