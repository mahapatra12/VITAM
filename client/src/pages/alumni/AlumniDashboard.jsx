import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, MapPin, Briefcase, Award, TrendingUp, ChevronRight, CheckCircle2, QrCode, ShieldCheck, Download,
  Globe, Sparkles, Heart
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const NETWORK_REACH = [
  { region: 'North America', count: 1200, growth: 12 },
  { region: 'Europe', count: 850, growth: 8 },
  { region: 'Asia Pacific', count: 4200, growth: 25 },
  { region: 'Middle East', count: 600, growth: 15 },
];

const ENDOWMENT_TREND = [
  { month: 'Sep', amount: 1.2 },
  { month: 'Oct', amount: 1.5 },
  { month: 'Nov', amount: 1.4 },
  { month: 'Dec', amount: 1.8 },
  { month: 'Jan', amount: 2.1 },
  { month: 'Feb', amount: 2.4 },
];

const TS = { 
  contentStyle: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 12 }, 
  itemStyle: { color: '#e2e8f0' }, 
  labelStyle: { color: '#94a3b8', fontWeight: 700 } 
};

export default function AlumniDashboard() {
  const [showIdCard, setShowIdCard] = useState(true);
  const [aiInsight, setAiInsight] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setAiInsight('Alumni-AI: Global network reach in Asia-Pacific grew by 25%. Mentorship connections up 40% this quarter. ₹2.4Cr endowment threshold breached.');
    }, 1500);
  }, []);

  return (
    <DashboardLayout title="Global Alumni Grid" role="ALUMNI">
      
      <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[11px] font-black uppercase tracking-[0.5em] text-amber-600 mb-4 italic"
          >
            Institutional Network · Strategic Phase 2
          </motion.p>
          <h2 className="text-6xl font-black text-white tracking-tighter italic mb-1 uppercase leading-none">Prestige Hub</h2>
          <p className="text-slate-400 font-bold mt-4 max-w-2xl italic leading-relaxed text-lg">
            Strategic endowment metrics, global mentorship syncs, and verified alumni identity management.
          </p>
        </div>
        <div className="flex gap-4">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-8 py-4 rounded-3xl glass-2-0 border border-amber-500/20 text-amber-400 text-sm font-black hover:bg-amber-500/10 transition-all">
            <Heart size={18} /> Fund Endowment
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-8 py-4 rounded-3xl bg-amber-600 text-white text-sm font-black hover:bg-amber-500 transition-all shadow-2xl shadow-amber-500/20">
            <Globe size={18} /> Global Grid
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Endowment" value="₹2.4Cr" icon={TrendingUp} color="bg-amber-500" trend="+12% YTD" />
        <StatCard title="Global Rank" value="Top 5%" icon={Award} color="bg-blue-500" trend="Network" />
        <StatCard title="Active Mentors" value="42" icon={Users} color="bg-emerald-500" trend="+8 this wk" />
        <StatCard title="Reunions" value="3" icon={MapPin} color="bg-purple-500" trend="Confirmed" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            whileHover={{ y: -10, rotateY: 5 }}
            className="relative aspect-[1/1.5] rounded-[3rem] bg-[#050505] border border-amber-500/30 p-8 overflow-hidden group shadow-[0_40px_80px_-15px_rgba(245,158,11,0.2)]"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-amber-200/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px]" />
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-amber-500 tracking-tighter">VITAM PRESTIGE</h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 mt-1">Institutional Gold Pass</p>
                </div>
                <ShieldCheck size={28} className="text-amber-500/50" />
              </div>

              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-amber-500/20 to-slate-900 border-2 border-amber-500/40 p-1 mb-6 group-hover:scale-105 transition-transform duration-500">
                  <div className="w-full h-full rounded-[2.2rem] bg-slate-900 flex items-center justify-center overflow-hidden">
                    <Users size={54} className="text-amber-500/20" />
                  </div>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tighter">Rajesh Sharma</h2>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-2">Class of 2018 · CSE</p>
                <div className="mt-4 px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <Briefcase size={12} className="text-amber-500" /> Senior Architect, AWS
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Lifetime ID</p>
                  <p className="text-lg font-mono font-black text-white">L-8402</p>
                </div>
                <div className="w-16 h-16 bg-white rounded-2xl p-2 group-hover:rotate-6 transition-transform">
                  <QrCode className="w-full h-full text-black" />
                </div>
              </div>
            </div>
          </motion.div>
          
          <button className="w-full py-5 rounded-3xl glass-2-0 border border-white/10 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/5 transition-all">
            <Download size={18} /> Export Credentials
          </button>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <GlassCard title="Endowment Growth" subtitle="Strategic institutional funding trajectory" icon={TrendingUp}>
            <div className="h-[280px] mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ENDOWMENT_TREND}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit="Cr" />
                  <Tooltip {...TS} />
                  <Area type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          <GlassCard title="Global Network Reach" subtitle="Regional alumni density & professional growth" icon={Globe}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {NETWORK_REACH.map((r) => (
                <div key={r.region} className="p-4 glass-2-0 border border-white/5 hover:bg-white/5 transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-white font-black text-sm uppercase tracking-tighter">{r.region}</p>
                    <span className="text-[10px] font-black px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400">+{r.growth}% Growth</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-white">{r.count.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Professionals</p>
                  </div>
                  <div className="w-full h-1 bg-white/5 mt-4 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(r.count / 4200) * 100}%` }} transition={{ duration: 1.5 }}
                      className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_#f59e0b]" />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 glass-2-0 border border-amber-500/10 mt-6">
              <p className="text-xs text-amber-500/80 font-bold italic leading-relaxed">"{aiInsight}"</p>
            </div>
          </GlassCard>
        </div>
      </div>

    </DashboardLayout>
  );
}
