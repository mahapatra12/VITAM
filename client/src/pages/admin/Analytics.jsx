import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Bar, Area
} from 'recharts';
import { Server, Activity, Users, Database, Shield, Zap } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import AIChat from '../../components/AIChat';

const TRAFFIC_DATA = [
  { day: 'Mon', logins: 1200, dbQueries: 45000, latency: 12 },
  { day: 'Tue', logins: 4500, dbQueries: 89000, latency: 34 },
  { day: 'Wed', logins: 8900, dbQueries: 112000, latency: 45 },
  { day: 'Thu', logins: 5200, dbQueries: 78000, latency: 22 },
  { day: 'Fri', logins: 3100, dbQueries: 51000, latency: 18 },
  { day: 'Sat', logins: 1800, dbQueries: 28000, latency: 10 },
  { day: 'Sun', logins: 1200, dbQueries: 22000, latency: 8 },
];

const RESOURCE_ALLOCATION = [
  { node: 'Web Servers', util: 68, limit: 100 },
  { node: 'MongoDB Cluster', util: 42, limit: 100 },
  { node: 'Redis Cache', util: 85, limit: 100 },
  { node: 'AI Microservice', util: 92, limit: 100 },
];

const TS = { contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }, itemStyle: { color: '#e2e8f0' } };

export default function Analytics() {
  const [report, setReport] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setReport('SysAdmin AI Diagnostic: Peak traffic occurred on Wednesday (8,900 concurrent logins) causing a latency spike to 45ms. Redis Cache hit 85% capacity, and the AI Microservice is redlining at 92%. Recommendation: Spin up 2 additional GPU container instances for the AI Microservice before the upcoming examination week to prevent cascading timeouts.');
    }, 1200);
  }, []);

  return (
    <DashboardLayout title="System Analytics & Telemetry" role="ADMIN">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">Data Center Telemetry</h2>
        <p className="text-slate-400 font-medium mt-1">Global load metrics, database queries, and instance health</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total DB Queries" value="425K" icon={Database} color="bg-blue-500" trend="+12%" />
        <StatCard title="Avg Latency" value="21ms" icon={Activity} color="bg-emerald-500" trend="-4ms" />
        <StatCard title="Active Users" value="8,900" icon={Users} color="bg-purple-500" />
        <StatCard title="Firewall Drops" value="45" icon={Shield} color="bg-red-500" trend="Stable" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <GlassCard title="Global Network Load" subtitle="Correlating user logins with database stress" className="lg:col-span-2">
          <div className="h-[280px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={TRAFFIC_DATA}>
                <defs>
                  <linearGradient id="queryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...TS} />
                <Area yAxisId="left" type="monotone" dataKey="dbQueries" name="DB Queries" fill="url(#queryGrad)" stroke="#3b82f6" />
                <Bar yAxisId="right" dataKey="logins" name="Active Logins" barSize={20} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="left" type="monotone" dataKey="latency" name="Latency (ms)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="flex flex-col gap-6">
          <GlassCard title="Instance Resource Pool" subtitle="Hardware container utilization rates">
            <div className="mt-4 space-y-4">
              {RESOURCE_ALLOCATION.map((res) => (
                <div key={res.node}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-white text-sm font-bold">{res.node}</span>
                    <span className={`text-xs font-black ${res.util > 90 ? 'text-red-400' : res.util > 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {res.util}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${res.util > 90 ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : res.util > 75 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${res.util}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Diagnostic AI" subtitle="Automated Load Balancing" icon={Server}>
            <div className="mt-2 min-h-[60px]">
              {report ? (
                <p className="text-red-400 font-medium leading-relaxed text-sm">{report}</p>
              ) : (
                <span className="text-slate-500 italic flex items-center gap-2 text-sm mt-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  Analyzing system logs...
                </span>
              )}
            </div>
          </GlassCard>
        </div>
      </div>

      <AIChat role="sysadmin" />
    </DashboardLayout>
  );
}
