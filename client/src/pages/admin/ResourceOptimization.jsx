import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Droplets, Wind, Home, Activity, 
  BarChart3, Settings, ShieldCheck, 
  ArrowUpRight, AlertTriangle, Cpu, Globe,
  Users, BookOpen
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, CartesianGrid, Cell, PieChart, Pie
} from 'recharts';

const CONSUMPTION_DATA = [
  { zone: 'Main Block', energy: 84, water: 62 },
  { zone: 'Girls Hostel', energy: 92, water: 88 },
  { zone: 'Boys Hostel', energy: 88, water: 94 },
  { zone: 'Library', energy: 45, water: 22 },
  { zone: 'Labs', energy: 120, water: 45 },
];

const RESOURCE_MIX = [
  { name: 'Grid Energy', value: 65, color: '#3b82f6' },
  { name: 'Solar Array', value: 25, color: '#10b981' },
  { name: 'Generator Fallback', value: 10, color: '#ef4444' },
];

const OPTIMIZATION_STATS = [
  { label: 'Total Consumption', value: '14.5 MW', trend: '+2%', color: 'blue' },
  { label: 'Water Reserve', value: '450k L', trend: 'Stable', color: 'emerald' },
  { label: 'Carbon Offset', value: '12.4 Tons', trend: '+15%', color: 'purple' },
  { label: 'Operational Efficiency', value: '94.2%', trend: '+0.8%', color: 'amber' }
];

export default function ResourceOptimization() {
  return (
    <DashboardLayout title="Institutional Resource Optimization" role="ADMIN">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Global Grid Optimal</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-2">Resource Efficiency Hub</h1>
          <p className="text-slate-500 font-medium">Monitoring and optimizing the 36-acre campus resource telemetry (Energy, Water, Space).</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-500 uppercase">Current Load</p>
             <p className="text-xl font-black text-white">412.5 kW/h</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
             <Zap size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {OPTIMIZATION_STATS.map((s, i) => (
          <div key={i} className="p-6 rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">{s.label}</p>
             <div className="flex items-end justify-between">
                <h3 className="text-2xl font-black text-white">{s.value}</h3>
                <span className={`text-[10px] font-black uppercase text-${s.color}-500 flex items-center gap-1`}>
                   {s.trend} <ArrowUpRight size={12} />
                </span>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <GlassCard title="Zone-Wise Consumption Telemetry" icon={BarChart3} subtitle="Power and water distribution across institutional sectors">
            <div className="h-[350px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CONSUMPTION_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="zone" tick={{ fill: '#666', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#ffffff05'}} contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }} />
                  <Bar dataKey="energy" name="Energy (kWh)" radius={[8, 8, 0, 0]} fill="#3b82f6" fillOpacity={0.8} />
                  <Bar dataKey="water" name="Water (L/m)" radius={[8, 8, 0, 0]} fill="#10b981" fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        <div>
          <GlassCard title="Energy Mix Synergy" icon={Globe} subtitle="Source distribution analysis">
            <div className="h-[350px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={RESOURCE_MIX} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={8} dataKey="value">
                    {RESOURCE_MIX.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                 {RESOURCE_MIX.map((r, i) => (
                   <div key={i} className="flex items-center justify-between px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{r.name}</span>
                      </div>
                      <span className="text-xs font-black text-white">{r.value}%</span>
                   </div>
                 ))}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard title="Structural Health Alerts" icon={AlertTriangle} subtitle="Predicted structural and utility maintenance requirements">
          <div className="mt-4 space-y-3">
             <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-between">
                <div>
                   <p className="text-xs font-black text-white">Transformer T-4 Core Temperature Alert</p>
                   <p className="text-[10px] font-bold text-red-400 uppercase mt-0.5">Predicted failure: 48 Hours · Sector: Lab North</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[9px] font-black uppercase">Service</button>
             </div>
             <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div>
                   <p className="text-xs font-black text-white">Water Tank Reservoir Sensor Noise</p>
                   <p className="text-[10px] font-bold text-amber-400 uppercase mt-0.5">Intermittent signal detected · Sector: Girls Hostel</p>
                </div>
                <button className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[9px] font-black uppercase">Inspect</button>
             </div>
          </div>
        </GlassCard>

        <GlassCard title="Space Utilization Intel" icon={Home} subtitle="Institutional occupancy heat-map predicted via AI">
          <div className="mt-4 grid grid-cols-2 gap-4">
             <div className="p-5 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex flex-col items-center justify-center text-center">
                <Users size={24} className="text-blue-500 mb-2" />
                <h4 className="text-2xl font-black text-white">92%</h4>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Classroom Density</p>
             </div>
             <div className="p-5 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center justify-center text-center">
                <BookOpen size={24} className="text-emerald-500 mb-2" />
                <h4 className="text-2xl font-black text-white">18%</h4>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Library Vacancy</p>
             </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
