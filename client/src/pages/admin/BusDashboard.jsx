import { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import { BusFront, MapPin, AlertTriangle, Users, Navigation, Wrench, ShieldCheck } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const ROUTES = [
  { id: 'R1', name: 'City Centre Loop', stops: 12, students: 84, driver: 'Raju K.', bus: 'AP09-TT-1234', status: 'On Time', eta: '7:45 AM', capacity: 92 },
  { id: 'R2', name: 'North Campus Express', stops: 8, students: 67, driver: 'Srinivas M.', bus: 'AP09-TT-5678', status: 'On Time', eta: '7:52 AM', capacity: 78 },
  { id: 'R3', name: 'South Zone Route', stops: 15, students: 91, driver: 'Venkat R.', bus: 'AP09-TT-9012', status: 'Delayed', eta: '8:10 AM', capacity: 98 },
  { id: 'R4', name: 'West Bypass', stops: 10, students: 53, driver: 'Prasad G.', bus: 'AP09-TT-3456', status: 'On Time', eta: '7:40 AM', capacity: 65 },
  { id: 'R5', name: 'East Village Circuit', stops: 18, students: 102, driver: 'Naresh P.', bus: 'AP09-TT-7890', status: 'On Route', eta: '8:05 AM', capacity: 110 },
];

const RIDERSHIP_DATA = [
  { day: 'Mon', students: 398 },
  { day: 'Tue', students: 412 },
  { day: 'Wed', students: 389 },
  { day: 'Thu', students: 423 },
  { day: 'Fri', students: 367 },
  { day: 'Sat', students: 210 },
];

const MAINTENANCE = [
  { bus: 'AP09-TT-1234', type: 'Oil Change', due: '2026-03-25', priority: 'medium' },
  { bus: 'AP09-TT-9012', type: 'Brake Inspection', due: '2026-03-22', priority: 'high' },
  { bus: 'AP09-TT-5678', type: 'Tyre Rotation', due: '2026-04-01', priority: 'low' },
];

export default function BusDashboard() {
  const [liveStatus, setLiveStatus] = useState('Connecting to GPS mesh...');

  useEffect(() => {
    setTimeout(() => {
      setLiveStatus('VITAM Transport AI: All 5 buses are GPS-tracked. Route R3 (South Zone) running 8 min late due to traffic on NH-16. Proactive SMS alerts sent to 91 students. Maintenance alert: Bus AP09-TT-9012 brake inspection is overdue by 2 days — recommend immediate service. Average morning ridership this week: 397.8 students/day.');
    }, 1800);
  }, []);

  const statusStyle = (s) => {
    if (s === 'On Time') return 'text-emerald-400 bg-emerald-400/10';
    if (s === 'Delayed') return 'text-red-400 bg-red-400/10';
    return 'text-amber-400 bg-amber-400/10';
  };

  return (
    <DashboardLayout title="Bus Management" role="ADMIN">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">Transport Operations</h2>
        <p className="text-slate-400 font-medium mt-1">Real-time fleet tracking, route management & student safety</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Active Buses" value="5" icon={BusFront} color="bg-blue-500" />
        <StatCard title="Students Today" value="397" icon={Users} color="bg-emerald-500" trend="+3%" />
        <StatCard title="Delayed Routes" value="1" icon={AlertTriangle} color="bg-red-500" />
        <StatCard title="On-Time Rate" value="92%" icon={ShieldCheck} color="bg-purple-500" trend="-2%" />
      </div>

      {/* Live Fleet Status */}
      <GlassCard title="Live Fleet Status" subtitle="GPS-synchronized route tracking" icon={Navigation} className="mb-6">
        <div className="mt-3 space-y-2">
          {ROUTES.map((r) => (
            <div key={r.id} className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.status === 'On Time' ? 'bg-emerald-500 animate-pulse' : r.status === 'Delayed' ? 'bg-red-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-sm truncate">{r.name}</p>
                <p className="text-slate-400 text-xs">{r.driver} · {r.bus} · {r.stops} stops</p>
              </div>
              <div className="text-center flex-shrink-0">
                <p className="text-slate-300 text-xs font-bold">{r.students}/{r.capacity}</p>
                <p className="text-slate-500 text-[10px]">students</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${statusStyle(r.status)}`}>{r.status}</span>
                <p className="text-slate-400 text-xs mt-1">ETA {r.eta}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ridership Trend */}
        <GlassCard title="Weekly Ridership Trend" subtitle="Student transport utilization">
          <div className="h-[200px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={RIDERSHIP_DATA}>
                <defs>
                  <linearGradient id="riderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 12 }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="students" stroke="#3b82f6" strokeWidth={2} fill="url(#riderGrad)" dot={{ fill: '#3b82f6', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Maintenance Alerts */}
        <GlassCard title="Fleet Maintenance Alerts" subtitle="Scheduled service & safety checks">
          <div className="mt-3 space-y-3">
            {MAINTENANCE.map((m) => (
              <div key={m.bus} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div>
                  <p className="text-white font-black text-sm">{m.bus}</p>
                  <p className="text-slate-400 text-xs">{m.type} · Due {m.due}</p>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${m.priority === 'high' ? 'bg-red-500/10 text-red-400' : m.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {m.priority}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI Transport Intelligence */}
      <GlassCard title="AI Transport Intelligence" subtitle="Real-time fleet AI analysis" icon={Wrench}>
        <div className="mt-3 min-h-[60px] flex items-start">
          {liveStatus.startsWith('VITAM') ? (
            <p className="text-blue-400 font-medium leading-relaxed text-sm">{liveStatus}</p>
          ) : (
            <span className="text-slate-500 italic flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              {liveStatus}
            </span>
          )}
        </div>
      </GlassCard>

    </DashboardLayout>
  );
}
