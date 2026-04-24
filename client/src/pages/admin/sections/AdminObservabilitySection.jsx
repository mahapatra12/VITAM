import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Cpu,
  HardDrive,
  Shield,
  Terminal,
  Wifi
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/DashboardComponents';
import SafeChart from '../../../components/ui/SafeChart';

const CPU_DATA = [
  { time: '10:00', load: 45 },
  { time: '10:05', load: 52 },
  { time: '10:10', load: 88 },
  { time: '10:15', load: 61 },
  { time: '10:20', load: 43 },
  { time: '10:25', load: 48 },
  { time: '10:30', load: 94 },
  { time: '10:35', load: 72 }
];

const MEMORY_DATA = [
  { time: '10:00', usage: 62 },
  { time: '10:05', usage: 64 },
  { time: '10:10', usage: 68 },
  { time: '10:15', usage: 65 },
  { time: '10:20', usage: 61 },
  { time: '10:25', usage: 63 },
  { time: '10:30', usage: 78 },
  { time: '10:35', usage: 71 }
];

const API_TRAFFIC = [
  { hour: '08:00', requests: 1200 },
  { hour: '09:00', requests: 4500 },
  { hour: '10:00', requests: 8900 },
  { hour: '11:00', requests: 5200 },
  { hour: '12:00', requests: 3100 },
  { hour: '13:00', requests: 2800 }
];

const SECURITY_LOGS = [
  { id: 1, time: '10:31:42 AM', event: 'Failed Auth Attempt', ip: '192.168.1.104', threat: 'medium', agent: 'Unknown' },
  { id: 2, time: '10:28:15 AM', event: 'MFA Fallback Triggered', ip: '10.0.0.4', threat: 'low', agent: 'Chairman' },
  { id: 3, time: '10:15:02 AM', event: 'Excessive DB Queries', ip: '172.16.0.45', threat: 'high', agent: 'API Route /sync' },
  { id: 4, time: '09:54:11 AM', event: 'Invalid JWT Format', ip: '192.168.1.199', threat: 'medium', agent: 'Cron Bot' }
];

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: '#0f172a',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: 12,
    backdropFilter: 'blur(16px)'
  },
  itemStyle: { color: '#e2e8f0', fontSize: 12, fontWeight: 700 },
  labelStyle: {
    color: '#64748b',
    fontWeight: 800,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: '0.1em'
  }
};

const threatTone = (threat) => {
  if (threat === 'high') {
    return 'text-rose-400 bg-rose-500/10';
  }
  if (threat === 'medium') {
    return 'text-amber-400 bg-amber-500/10';
  }
  return 'text-emerald-400 bg-emerald-500/10';
};

export default function AdminObservabilitySection() {
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <GlassCard title="Processor Performance" subtitle="Cluster-wide computational load (%)" icon={Cpu}>
          <SafeChart className="mt-6" minHeight={280}>
            <AreaChart data={CPU_DATA}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="load" name="Load (%)" stroke="#2563eb" strokeWidth={4} fill="url(#cpuGrad)" dot={false} />
            </AreaChart>
          </SafeChart>
        </GlassCard>

        <GlassCard title="Memory Utilization" subtitle="Pool pressure and allocation metrics (GB)" icon={HardDrive}>
          <SafeChart className="mt-6" minHeight={280}>
            <AreaChart data={MEMORY_DATA}>
              <defs>
                <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="usage" name="Memory (%)" stroke="#6366f1" strokeWidth={4} fill="url(#memGrad)" dot={false} />
            </AreaChart>
          </SafeChart>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <GlassCard title="Gateway Ingress" subtitle="Institutional network requests per hour" icon={Wifi}>
          <SafeChart className="mt-6" minHeight={280}>
            <BarChart data={API_TRAFFIC}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="requests" name="Requests" fill="#2563eb" radius={[8, 8, 0, 0]}>
                {API_TRAFFIC.map((entry) => (
                  <Cell
                    key={entry.hour}
                    fill={entry.requests > 8000 ? '#f43f5e' : entry.requests > 4000 ? '#f59e0b' : '#2563eb'}
                    fillOpacity={0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </SafeChart>
        </GlassCard>

        <GlassCard title="Security Activity" subtitle="Real-time institutional access logs" icon={Shield}>
          <div className="custom-scrollbar mt-6 max-h-[280px] space-y-4 overflow-y-auto pr-4">
            {SECURITY_LOGS.map((log) => (
              <div key={log.id} className="flex items-center gap-5 rounded-2xl border border-white/5 bg-slate-950 p-5 transition-all duration-500 hover:border-blue-500/30">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-3 truncate text-sm font-black text-white">
                    <Terminal size={14} className="text-slate-600" />
                    {log.event}
                  </p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    {log.ip} - {log.agent}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="mb-2 block text-[10px] font-black text-slate-700">{log.time}</span>
                  <span className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest ${threatTone(log.threat)}`}>
                    {log.threat}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
