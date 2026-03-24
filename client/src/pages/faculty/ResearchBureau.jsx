import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, ClipboardCheck, Award, FileText,
  BarChart2, ShieldCheck, Zap, Globe, Search, Filter,
  ExternalLink, Plus, BookOpen, Quote, TrendingUp,
  Cpu, Users, Briefcase, GraduationCap
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const REAL_FACULTY = [
  { name: "Dr. MBNV Prasad", dept: "CSE", designation: "Professor", exp: "17 Years", papers: 24, citations: 450, hIndex: 12 },
  { name: "Dr. Govinda Rajulu Kosireddy", dept: "CSE", designation: "Professor", exp: "17 Years", papers: 18, citations: 320, hIndex: 9 },
  { name: "Dr. Padma Charan Das", dept: "EEE", designation: "Professor", exp: "17 Years", papers: 15, citations: 210, hIndex: 7 },
  { name: "Subhasmita Sahoo", dept: "Humanities", designation: "Assistant Professor", exp: "1 Year", papers: 2, citations: 5, hIndex: 1 },
  { name: "Taranisen Barik", dept: "Mechanical", designation: "Assistant Professor", exp: "7 Years", papers: 8, citations: 45, hIndex: 3 },
];

const ACTIVE_GRANTS = [
  { id: 'GR-2026-01', title: 'Sustainable AI for Rural Agriculture', agency: 'DST India', amount: '₹12,50,000', status: 'In Progress', lead: 'Dr. MBNV Prasad' },
  { id: 'GR-2026-02', title: 'Solar Grid Optimization', agency: 'IREDA', amount: '₹8,00,000', status: 'Approved', lead: 'Dr. Padma Charan Das' },
];

export default function ResearchBureau() {
  const { user } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('faculty'); // faculty | grants | publications

  return (
    <DashboardLayout title="Research & IP Bureau" role={user?.role || 'FACULTY'}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
             <FlaskConical size={28} className="text-orange-500" /> academic Excellence hub
          </h2>
          <p className="text-slate-400 mt-1">Official Research, Publications, and Institutional IP Tracking for VITAM.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <FileText size={14}/> Submit Paper
           </button>
           <button className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">IP Registration</button>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { l: 'Research Papers', v: '142', i: BookOpen, c: 'text-blue-400', b: 'bg-blue-500/10' },
          { l: 'Total Citations', v: '2,840', i: Quote, c: 'text-emerald-400', b: 'bg-emerald-500/10' },
          { l: 'Active Grants', v: '₹42L', i: TrendingUp, c: 'text-amber-500', b: 'bg-amber-500/10' },
          { l: 'H-Index (Avg)', v: '8.4', i: BarChart2, c: 'text-purple-400', b: 'bg-purple-500/10' },
        ].map(s => (
          <div key={s.l} className="p-6 rounded-[2.5rem] bg-[#080808] border border-white/5 flex flex-col gap-4">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.b} ${s.c}`}><s.i size={18}/></div>
             <div>
                <p className="text-2xl font-black text-white leading-none">{s.v}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-2">{s.l}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex gap-2 border-b border-white/5 pb-4 mb-4">
              {['faculty', 'grants', 'publications'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-600 hover:text-white'}`}>
                  {t}
                </button>
              ))}
           </div>

           <AnimatePresence mode="wait">
              {tab === 'faculty' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 gap-4">
                   {REAL_FACULTY.map((f, i) => (
                      <div key={f.name} className="p-6 rounded-[2rem] bg-[#0a0a0a] border border-white/5 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                         <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-black text-white border border-white/10 group-hover:bg-indigo-500 transition-colors">
                               {f.name[0]}
                            </div>
                            <div>
                               <h3 className="text-sm font-black text-white uppercase tracking-tight">{f.name}</h3>
                               <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1">{f.designation} · {f.dept}</p>
                            </div>
                         </div>
                         <div className="hidden md:flex gap-8 text-center border-l border-white/5 pl-8">
                            <div>
                               <p className="text-[9px] font-black text-slate-500 uppercase">Citations</p>
                               <p className="text-xs font-black text-emerald-400">{f.citations}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-slate-500 uppercase">Papers</p>
                               <p className="text-xs font-black text-white">{f.papers}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-slate-500 uppercase">H-Index</p>
                               <p className="text-xs font-black text-amber-500">{f.hIndex}</p>
                            </div>
                         </div>
                         <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"><ExternalLink size={16}/></button>
                      </div>
                   ))}
                </motion.div>
              )}

              {tab === 'grants' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                   {ACTIVE_GRANTS.map(g => (
                      <div key={g.id} className="p-8 rounded-[3rem] bg-[#0a0a0a] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                         <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                               <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black text-indigo-400 uppercase tracking-widest">{g.agency}</span>
                               <span className="text-[10px] font-black text-slate-500 uppercase">{g.id}</span>
                            </div>
                            <h4 className="text-lg font-black text-white leading-tight mb-2 uppercase tracking-tighter">{g.title}</h4>
                            <p className="text-[10px] text-slate-400 font-bold">Principal Investigator: <span className="text-indigo-400">{g.lead}</span></p>
                         </div>
                         <div className="text-right">
                            <p className="text-2xl font-black text-emerald-400">{g.amount}</p>
                            <div className="flex items-center gap-2 justify-end mt-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{g.status}</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </motion.div>
              )}
           </AnimatePresence>
        </div>

        {/* Sidebar: Compliance & Quick Submission */}
        <div className="space-y-6">
           <div className="p-8 rounded-[3rem] bg-indigo-600 shadow-2xl border border-indigo-500 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] -mr-16 -mt-16" />
              <div className="relative">
                 <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white mb-6"><Award size={24}/></div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-tight">Patent Filing Protocol</h3>
                 <p className="text-[10px] text-indigo-100 font-bold mt-2 opacity-60">Initiate institutional IP registration for faculty research innovations.</p>
                 <button className="w-full mt-8 py-3.5 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                    Start Disclosure
                 </button>
              </div>
           </div>

           <div className="p-8 rounded-[3rem] bg-[#0a0a0a] border border-white/10 space-y-6">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-4 flex items-center gap-2">
                 <ShieldCheck size={14} className="text-indigo-400" /> Compliance Pulse
              </h4>
              <div className="space-y-4">
                 {[
                   { l: 'Ethical Approval', v: '98%', c: 'text-emerald-400' },
                   { l: 'Grant Utilization', v: '72%', c: 'text-indigo-400' },
                   { l: 'Plagiarism Audit', v: '0.4%', c: 'text-emerald-500' },
                 ].map(c => (
                   <div key={c.l} className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{c.l}</span>
                      <span className={`text-[10px] font-black ${c.c}`}>{c.v}</span>
                   </div>
                 ))}
              </div>
           </div>

           <div className="p-8 rounded-[3rem] bg-orange-500/5 border border-orange-500/10">
              <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Zap size={14}/> Top Researcher Q3</h4>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-500 font-black">P</div>
                 <div>
                    <p className="text-sm font-black text-white">Dr. MBNV Prasad</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase uppercase">4 New IEEE Publications</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
