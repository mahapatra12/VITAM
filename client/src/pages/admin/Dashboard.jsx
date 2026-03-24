import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server, Shield, Activity, HardDrive, Cpu, Wifi, AlertTriangle,
  Terminal, Database, X, Zap, RefreshCcw
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from 'recharts';
import AIChat from '../../components/AIChat';

const CPU_DATA = [
  { time: '10:00', load: 45 }, { time: '10:05', load: 52 },
  { time: '10:10', load: 88 }, { time: '10:15', load: 61 },
  { time: '10:20', load: 43 }, { time: '10:25', load: 48 },
  { time: '10:30', load: 94 }, { time: '10:35', load: 72 },
];

const MEMORY_DATA = [
  { time: '10:00', usage: 62 }, { time: '10:05', usage: 64 },
  { time: '10:10', usage: 68 }, { time: '10:15', usage: 65 },
  { time: '10:20', usage: 61 }, { time: '10:25', usage: 63 },
  { time: '10:30', usage: 78 }, { time: '10:35', usage: 71 },
];

const API_TRAFFIC = [
  { hour: '08:00', requests: 1200 }, { hour: '09:00', requests: 4500 },
  { hour: '10:00', requests: 8900 }, { hour: '11:00', requests: 5200 },
  { hour: '12:00', requests: 3100 }, { hour: '13:00', requests: 2800 },
];

const SECURITY_LOGS = [
  { id: 1, time: '10:31:42 AM', event: 'Failed Auth Attempt', ip: '192.168.1.104', threat: 'medium', agent: 'Unknown' },
  { id: 2, time: '10:28:15 AM', event: 'MFA Fallback Triggered', ip: '10.0.0.4', threat: 'low', agent: 'Chairman' },
  { id: 3, time: '10:15:02 AM', event: 'Excessive DB Queries', ip: '172.16.0.45', threat: 'high', agent: 'API Route /sync' },
  { id: 4, time: '09:54:11 AM', event: 'Invalid JWT Format', ip: '192.168.1.199', threat: 'medium', agent: 'Cron Bot' },
];

const TS = { contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }, itemStyle: { color: '#e2e8f0' }, labelStyle: { color: '#94a3b8', fontWeight: 700 } };

export default function AdminDashboard() {
  const [sysAI, setSysAI] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    simulateAI();
  }, []);

  const simulateAI = () => {
    setRefreshing(true);
    setSysAI('');
    setTimeout(() => {
      setSysAI('SysOps AI: Core systems running stable. CPU spike detected at 10:30 AM due to automated roster sync — resolved. MongoDB cluster latency at 24ms. Blocked 3 rapid malicious auth attempts from 192.168.1.104. Recommend upscaling API Gateway container before tomorrow\'s expected traffic surge during exam registrations.');
      setRefreshing(false);
    }, 1500);
  };

  const threatColor = (t) => t === 'high' ? 'text-red-400 bg-red-500/10' : t === 'medium' ? 'text-amber-400 bg-amber-500/10' : 'text-blue-400 bg-blue-500/10';

  return (
    <DashboardLayout title="System Administration" role="ADMIN">
      <div className="mb-8 flex justify-between items-start flex-wrap gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500 mb-1">Root Access</p>
          <h2 className="text-3xl font-black text-white tracking-tight">System Infrastructure</h2>
          <p className="text-slate-400 font-medium mt-1">Live server telemetry, API traffic, and security orchestration</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={simulateAI} disabled={refreshing}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-black hover:bg-red-500/30 transition-all disabled:opacity-50">
          <RefreshCcw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? 'Scanning...' : 'Run Diagnostics'}
        </motion.button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Uptime" value="99.98%" icon={Server} color="bg-emerald-500" trend="Stable" />
        <StatCard title="Avg CPU Load" value="54%" icon={Cpu} color="bg-blue-500" />
        <StatCard title="Memory Usage" value="12.4 GB" icon={HardDrive} color="bg-purple-500" trend="71%" />
        <StatCard title="Blocked Threats" value="14" icon={Shield} color="bg-red-500" trend="+3" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard title="CPU Telemetry" subtitle="Live processor load distribution (%)" icon={Cpu}>
          <div className="h-[200px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={CPU_DATA}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip {...TS} />
                <Area type="monotone" dataKey="load" name="CPU Load (%)" stroke="#3b82f6" strokeWidth={2.5} fill="url(#cpuGrad)" dot={{ r: 3, fill: '#3b82f6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Memory Pool Utilization" subtitle="RAM pressure over time (GB)" icon={HardDrive}>
          <div className="h-[200px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MEMORY_DATA}>
                <defs>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip {...TS} />
                <Area type="monotone" dataKey="usage" name="Memory (%)" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#memGrad)" dot={{ r: 3, fill: '#8b5cf6' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <GlassCard title="API Gateway Traffic" subtitle="Network requests per hour" icon={Wifi}>
          <div className="h-[200px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={API_TRAFFIC}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...TS} />
                <Bar dataKey="requests" name="Requests" fill="#10b981" radius={[4, 4, 0, 0]}>
                  {API_TRAFFIC.map((entry, index) => (
                    <Cell key={index} fill={entry.requests > 8000 ? '#ef4444' : entry.requests > 4000 ? '#f59e0b' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Active Security Log" subtitle="Real-time threat monitoring firewall" icon={Shield}>
          <div className="mt-3 space-y-2 overflow-y-auto max-h-[200px] pr-2">
            {SECURITY_LOGS.map((log) => (
              <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black text-sm truncate flex items-center gap-2">
                    <Terminal size={12} className="text-slate-500" />
                    {log.event}
                  </p>
                  <p className="text-slate-400 text-xs font-mono mt-0.5">{log.ip} · {log.agent}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-slate-500 text-[10px] font-mono block mb-1">{log.time}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${threatColor(log.threat)}`}>
                    {log.threat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI System Ops */}
      <GlassCard title="SysOps AI — Infrastructure Intelligence" subtitle="Autonomous structural scanning & network health" icon={Database}>
        <div className="mt-3 min-h-[60px]">
          {sysAI ? (
            <p className="text-red-400 font-medium leading-relaxed text-sm">{sysAI}</p>
          ) : (
            <span className="text-slate-500 italic flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              Scanning institutional backend mesh...
            </span>
          )}
        </div>
      </GlassCard>

      <AIChat role="sysadmin" />
    </DashboardLayout>
  );
}
