import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, TrendingUp, Users, DollarSign, Target,
  Zap, Brain, BarChart2, PieChart, Info, ChevronRight,
  Globe, Award, MessageSquare, Send, Search, Filter,
  Eye, Download, MoreHorizontal, Sparkles, Activity
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const INSTITUTIONAL_KPIS = [
  { label: 'Annual Revenue', value: '₹42.8 Cr', trend: '+12%', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Placement Velocity', value: '92.4%', trend: '+5%', icon: Target, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { label: 'Student Satisfaction', value: '4.8/5', trend: '+0.2', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Operational Efficiency', value: '96%', trend: '+2%', icon: Settings, color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

function Settings() { return <Activity size={20} />; } // Local fallback for missing import

function StrategicChart() {
  return (
    <div className="p-8 rounded-[3rem] bg-[#080808] border border-white/5 relative overflow-hidden flex flex-col items-center justify-center text-center py-24">
       <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32" />
       <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -ml-32 -mb-32" />
       
       <BarChart2 size={56} className="text-white/20 mb-6 animate-pulse" />
       <h3 className="text-xl font-black text-white uppercase tracking-tighter">AI Strategic Projection</h3>
       <p className="text-slate-500 mt-2 max-w-sm text-sm font-bold">Correlating 5,000+ data points across Financials, Admissions, and Alumni Engagement for Q3 Fiscal Year 2026.</p>
       
       <div className="w-full h-2 bg-white/5 rounded-full mt-10 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: '84%' }} transition={{ duration: 2 }} className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500" />
       </div>
       <div className="flex justify-between w-full mt-3">
          <span className="text-[9px] font-black text-slate-700 uppercase">Current Performance</span>
          <span className="text-[9px] font-black text-indigo-400 uppercase">Goal: 95% Enterprise Maturity</span>
       </div>
    </div>
  );
}

function AIAdvisor() {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Welcome, Executive. Core vitals are optimal. I have identified a 15% potential increase in Alumni donations if the "Mentorship Hub" is promoted in the next summit.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if(!input) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: 'Strategic analysis complete. Recommendation: Allocate 8% of the cultural budget toward technical club hackathons to boost placement readiness.' }]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full rounded-[3rem] bg-[#0a0a0a] border border-white/10 overflow-hidden shadow-2xl">
       <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg"><Brain size={20}/></div>
             <div>
                <h4 className="text-sm font-black text-white uppercase">VITAM Strategic AI</h4>
                <div className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Decision Support Active</span>
                </div>
             </div>
          </div>
          <Sparkles size={18} className="text-indigo-400" />
       </div>
       
       <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: m.role === 'ai' ? -10 : 10 }} animate={{ opacity: 1, x: 0 }}
              className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
               <div className={`max-w-[85%] p-4 rounded-3xl text-xs font-bold ${m.role === 'ai' ? 'bg-white/5 border border-white/10 text-slate-300' : 'bg-indigo-500 text-white'}`}>
                  {m.text}
               </div>
            </motion.div>
          ))}
       </div>

       <div className="p-4 border-t border-white/5">
          <div className="relative">
             <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()}
               placeholder="Consult AI on Institutional Strategy..." className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 pl-5 pr-12 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
             <button onClick={handleSend} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-400 transition-all"><Send size={16}/></button>
          </div>
       </div>
    </div>
  );
}

export default function ExecutiveCommand() {
  const { user } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('summary'); // summary | analytics | strategy

  const handleAudit = () => {
    push({ type: 'info', title: 'Audit Protocol', body: 'Generating institutional transparency report for board review...' });
  };

  return (
    <DashboardLayout title="Executive Command" role={user?.role || 'CHAIRMAN'}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
             <ShieldAlert size={28} className="text-indigo-500" /> institutional Pulse
          </h2>
          <p className="text-slate-400 mt-1">High-fidelity strategic overview and AI-powered decision support for top leadership.</p>
        </div>
        <div className="flex gap-2">
           <button onClick={handleAudit} className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Download size={14}/> Full Audit
           </button>
           <button className="px-6 py-3 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">Live Stream Panel</button>
        </div>
      </div>

      {/* Primary Intelligence Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {INSTITUTIONAL_KPIS.map(k => (
          <div key={k.label} className="p-6 rounded-[2.5rem] bg-[#080808] border border-white/5 flex flex-col gap-4 group hover:border-indigo-500/30 transition-all">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${k.bg} ${k.color} group-hover:scale-110 transition-transform`}>
                <k.icon size={24}/>
             </div>
             <div>
                <p className="text-3xl font-black text-white leading-none">{k.value}</p>
                <div className="flex items-center justify-between mt-2">
                   <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{k.label}</p>
                   <span className="text-[9px] font-black text-emerald-400">{k.trend}</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Strategic Analytics */}
        <div className="lg:col-span-2 space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StrategicChart />
              <div className="space-y-6">
                 <div className="p-8 rounded-[3rem] bg-[#080808] border border-white/5">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Departmental Health</h4>
                    <div className="space-y-4">
                       {[
                         { d: 'Computer Science', s: 'A+', c: 'text-indigo-400' },
                         { d: 'Mechanical Eng.', s: 'B', c: 'text-amber-500' },
                         { d: 'Research Cell', s: 'A', c: 'text-emerald-400' },
                         { d: 'Placement Hub', s: 'S', c: 'text-pink-500' },
                       ].map(d => (
                         <div key={d.d} className="flex items-center justify-between group cursor-pointer">
                            <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{d.d}</span>
                            <span className={`text-sm font-black ${d.c}`}>{d.s}</span>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="p-8 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-between">
                    <div>
                       <p className="text-2xl font-black text-white">450+</p>
                       <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Alumni Hiring Partners</p>
                    </div>
                    <Globe size={32} className="text-indigo-500/20" />
                 </div>
              </div>
           </div>

           <div className="p-8 rounded-[3rem] bg-[#0a0a0a] border border-indigo-500/20">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><TrendingUp size={16} className="text-indigo-500"/> Financial Velocity</h3>
                 <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:underline">Full Ledger →</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[
                   { l: 'Fees Collected', v: '₹28.4 Cr', p: '88%', c: 'bg-emerald-500' },
                   { l: 'Grant Utilisation', v: '₹4.2 Cr', p: '45%', c: 'bg-blue-500' },
                   { l: 'Scholarship Outgo', v: '₹1.8 Cr', p: '12%', c: 'bg-amber-500' },
                 ].map(f => (
                   <div key={f.l}>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{f.l}</p>
                      <p className="text-xl font-black text-white mb-2">{f.v}</p>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                         <div className={`h-full ${f.c}`} style={{ width: f.p }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Right: AI Strategic Advisor */}
        <div className="lg:col-span-1 h-[700px]">
           <AIAdvisor />
        </div>
      </div>
    </DashboardLayout>
  );
}
