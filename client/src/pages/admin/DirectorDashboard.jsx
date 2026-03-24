import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import { Activity, Clock, Users, Calendar, Cpu } from 'lucide-react';
import AIChat from '../../components/AIChat';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const DEPT_RADAR = [
  { dept: 'CSE', attendance: 92, performance: 88, disciplinary: 95 },
  { dept: 'ECE', attendance: 81, performance: 79, disciplinary: 90 },
  { dept: 'MECH', attendance: 76, performance: 71, disciplinary: 85 },
  { dept: 'CIVIL', attendance: 78, performance: 74, disciplinary: 88 },
];

const FACULTY_WORKLOAD = [
  { dept: 'CSE', lectures: 24, labs: 12 },
  { dept: 'ECE', lectures: 20, labs: 14 },
  { dept: 'MECH', lectures: 18, labs: 16 },
  { dept: 'CIVIL', lectures: 16, labs: 10 },
];

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 },
  itemStyle: { color: '#e2e8f0' },
};

const FALLBACK_TELEMETRY = [
  { name: 'CSE', presence: 92 },
  { name: 'ECE', presence: 81 },
  { name: 'MECH', presence: 76 },
  { name: 'CIVIL', presence: 78 },
];

export default function DirectorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('vitam_token');
        const res = await axios.get('http://localhost:5100/api/director/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch Director data:", err);
        setData({
          attendance: '89.5%',
          activeClasses: 124,
          resourceUtilization: '92%',
          upcomingEvents: 3,
          telemetry: FALLBACK_TELEMETRY,
          academicReport: 'CAO-AI (Local Mode): MECH department is the weakest performer with 76% average attendance. Recommended interventions: (1) Mandatory 8:30 AM attendance alerts to students. (2) Deploy study group model from CSE to MECH. (3) Flag 18 MECH students with <70% attendance for counseling.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const socket = io('http://localhost:5100');
    socket.on('ceo-update', (latestDirective) => {
      setData(prev => prev ? {
        ...prev,
        academicReport: latestDirective.academicReport
      } : null);
    });

    return () => socket.disconnect();
  }, []);

  if (loading) return (
    <DashboardLayout title="Director Command Center" role="DIRECTOR">
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-white/60 font-medium text-sm">Initializing Operational Link...</p>
      </div>
    </DashboardLayout>
  );

  const telemetry = data?.telemetry || FALLBACK_TELEMETRY;

  return (
    <DashboardLayout title="Director Command Center" role="DIRECTOR">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">Operational Command</h2>
        <p className="text-slate-400 font-medium mt-1">Campus-wide attendance, resource telemetry & academic health</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Daily Attendance" value={data?.attendance || '0%'} icon={Users} color="bg-blue-500" trend="-2%" />
        <StatCard title="Active Classes (Live)" value={data?.activeClasses || '0'} icon={Activity} color="bg-emerald-500" />
        <StatCard title="Resource Utilization" value={data?.resourceUtilization || '0%'} icon={Clock} color="bg-purple-500" trend="+5%" />
        <StatCard title="Upcoming Events" value={data?.upcomingEvents || '0'} icon={Calendar} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance Bars */}
        <GlassCard title="Live Attendance Telemetry" subtitle="Department-wise real-time presence">
          <div className="mt-4 space-y-4">
            {telemetry.map(t => (
              <div key={t.name}>
                <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  <span>{t.name}</span>
                  <span className={t.presence < 80 ? 'text-red-400' : t.presence < 90 ? 'text-amber-400' : 'text-emerald-400'}>
                    {t.presence}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${t.presence < 80 ? 'bg-red-500' : t.presence < 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${t.presence}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Faculty Workload */}
        <GlassCard title="Faculty Workload (hrs/week)" subtitle="Lectures vs lab hours per department">
          <div className="h-[220px] mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FACULTY_WORKLOAD}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="dept" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="lectures" name="Lectures" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="labs" name="Labs" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Academic AI Report */}
      <GlassCard title="Academic AI (CAO) Report" subtitle="Automated failure prediction & targeted interventions" icon={Cpu}>
        <div className="mt-3 min-h-[80px] flex items-start">
          {data?.academicReport ? (
            <div dangerouslySetInnerHTML={{ __html: data.academicReport.replace(/\n/g, '<br />') }}
              className="text-sm text-purple-300 leading-relaxed font-medium" />
          ) : (
            <span className="text-slate-500 italic flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-ping" />
              Processing academic telemetry...
            </span>
          )}
        </div>
      </GlassCard>

      <AIChat role="director" />
    </DashboardLayout>
  );
}
