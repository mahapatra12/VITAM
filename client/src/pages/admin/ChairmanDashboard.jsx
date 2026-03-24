import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import { TrendingUp, Users, DollarSign, Award, Brain } from 'lucide-react';
import AIChat from '../../components/AIChat';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const ENROLLMENT_DATA = [
  { year: '2021', CSE: 280, ECE: 240, MECH: 200, CIVIL: 180 },
  { year: '2022', CSE: 310, ECE: 250, MECH: 210, CIVIL: 190 },
  { year: '2023', CSE: 360, ECE: 270, MECH: 215, CIVIL: 200 },
  { year: '2024', CSE: 420, ECE: 290, MECH: 220, CIVIL: 210 },
  { year: '2025', CSE: 480, ECE: 310, MECH: 230, CIVIL: 215 },
];

const REVENUE_TREND = [
  { month: 'Jan', revenue: 1.2, expense: 0.8 },
  { month: 'Feb', revenue: 1.5, expense: 0.9 },
  { month: 'Mar', revenue: 1.1, expense: 1.1 },
  { month: 'Apr', revenue: 1.8, expense: 0.95 },
  { month: 'May', revenue: 2.1, expense: 1.0 },
  { month: 'Jun', revenue: 1.9, expense: 1.2 },
];

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 },
  itemStyle: { color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8', fontWeight: 700 },
};

export default function ChairmanDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('vitam_token');
        const res = await axios.get('http://localhost:5100/api/chairman/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch Chairman data:", err);
        // Fallback data for demonstration
        setData({
          totalRevenue: '₹12.4 Cr',
          enrollmentGrowth: '4,250',
          placementAvg: '₹6.5 LPA',
          reputation: 'NAAC A+',
          aiStrategy: 'CEO-AI (Local Mode): Top priorities for this quarter — (1) Resolve ₹1.8Cr pending fee collections immediately. (2) Fast-track MECH/CIVIL corporate MoU signings for placement boost. (3) Initiate NIRF ranking documentation before deadline.',
          financeReport: 'CFO-AI (Local Mode): Revenue healthy at ₹12.4 Cr YTD. 3 critical areas: (a) 420 student fee defaulters at risk — recommend automated SMS outreach. (b) Infrastructure spend at 28% — on budget. (c) March shortfall of ₹0.3 Cr offset by February surplus.',
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
        aiStrategy: latestDirective.ceoDirective,
        financeReport: latestDirective.financeReport
      } : null);
    });

    return () => socket.disconnect();
  }, []);

  if (loading) return (
    <DashboardLayout title="Chairman Command Center" role="CHAIRMAN">
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-white/60 font-medium text-sm">Initializing Neural Command Link...</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Chairman Command Center" role="CHAIRMAN">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-white tracking-tight">Strategic Command</h2>
        <p className="text-slate-400 font-medium mt-1">Institutional performance, financial forecasting & AI strategy</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard title="Total Revenue (YTD)" value={data?.totalRevenue || '₹0'} icon={DollarSign} color="bg-emerald-500" trend="+15%" />
        <StatCard title="Total Enrollment" value={data?.enrollmentGrowth || '0'} icon={Users} color="bg-blue-500" trend="+8%" />
        <StatCard title="Placement Avg" value={data?.placementAvg || '₹0 LPA'} icon={TrendingUp} color="bg-purple-500" trend="+12%" />
        <StatCard title="Quality Ranking" value={data?.reputation || 'N/A'} icon={Award} color="bg-amber-500" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue vs Expense */}
        <GlassCard title="Revenue vs Expense (₹ Cr)" subtitle="6-month institutional financial trajectory">
          <div className="h-[220px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit=" Cr" />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v) => [`₹${v} Cr`]} />
                <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>{value}</span>} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" dot={{ fill: '#10b981', r: 4 }} />
                <Area type="monotone" dataKey="expense" name="Expense" stroke="#ef4444" strokeWidth={2} fill="url(#expGrad)" dot={{ fill: '#ef4444', r: 3 }} strokeDasharray="5 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Enrollment by Department */}
        <GlassCard title="5-Year Enrollment Growth" subtitle="Department-wise student intake trend">
          <div className="h-[220px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ENROLLMENT_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="year" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11, fontWeight: 700 }}>{value}</span>} />
                <Bar dataKey="CSE" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ECE" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="MECH" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="CIVIL" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* AI Reports Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard title="Finance AI (CFO) Report" subtitle="Autonomous cash flow analysis">
          <div className="h-[200px] mt-3 overflow-y-auto pr-2">
            {data?.financeReport ? (
              <div dangerouslySetInnerHTML={{ __html: data.financeReport.replace(/\n/g, '<br />') }}
                className="text-sm text-white/80 leading-relaxed" />
            ) : (
              <span className="text-white/30 italic flex items-center gap-2 text-sm mt-8 justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                Awaiting CFO-AI synchronization...
              </span>
            )}
          </div>
        </GlassCard>

        <GlassCard title="Strategic AI Insights (CEO)" subtitle="Executive priority mandates" icon={Brain}>
          <div className="h-[200px] mt-3 overflow-y-auto pr-2">
            {data?.aiStrategy ? (
              <div dangerouslySetInnerHTML={{ __html: data.aiStrategy.replace(/\n/g, '<br />') }}
                className="text-sm text-emerald-400 leading-relaxed font-medium" />
            ) : (
              <span className="text-emerald-500/30 italic flex items-center gap-2 text-sm mt-8 justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                Awaiting CEO-AI Executive Computation...
              </span>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Floating AI Chat */}
      <AIChat role="chairman" />
    </DashboardLayout>
  );
}
