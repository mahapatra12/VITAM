import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Award, FileCheck, Landmark,
  BarChart2, PieChart, Users, Zap, Search, Filter,
  ChevronRight, ExternalLink, Download, Clock,
  MapPin, Settings, Info, Briefcase
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const ACCREDITATION_CRITERIA = [
  { id: 'C1', title: 'Curricular Aspects', score: '3.8', status: 'Optimal', color: 'text-emerald-400' },
  { id: 'C2', title: 'Teaching-Learning & Evaluation', score: '3.6', status: 'Optimal', color: 'text-emerald-400' },
  { id: 'C3', title: 'Research, Innovations & Extension', score: '2.9', status: 'Progress', color: 'text-orange-400' },
  { id: 'C4', title: 'Infrastructure & Learning Resources', score: '4.0', status: 'Elite', color: 'text-blue-400' },
  { id: 'C5', title: 'Student Support & Progression', score: '3.5', status: 'Optimal', color: 'text-emerald-400' },
];

const COMPLIANCE_LOGS = [
  { date: '22 Mar', title: 'BPUT Affiliation Review 2026', type: 'Affiliation', result: 'Compliant' },
  { date: '15 Mar', title: 'AICTE Mandatory Disclosure', type: 'Regulatory', result: 'Verified' },
  { date: '10 Mar', title: 'NAAC Cycle 2 Preparation', type: 'Accreditation', result: 'In Review' },
];

export default function Governance() {
  const { user } = useAuth();
  const { push } = useToast();

  return (
    <DashboardLayout title="Accreditation & Governance" role={user?.role || 'ADMIN'}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3 uppercase tracking-tighter">
             <Landmark size={28} className="text-blue-500" /> compliance pulse
          </h2>
          <p className="text-slate-400 mt-1 uppercase text-[10px] font-black tracking-widest">Official Governance HQ for Vignan Institute of Technology & Management.</p>
        </div>
        <div className="flex gap-2">
           <button className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Download size={14}/> Accredit Report
           </button>
           <button onClick={() => push({ type: 'info', title: 'Audit Started', body: 'AI-Audit protocol initiated for NAAC Criterion IV.' })} 
             className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 group overflow-hidden relative">
              <span className="relative z-10">Run Digital Audit</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform" />
           </button>
        </div>
      </div>

      {/* Institutional Vitality Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
         <div className="lg:col-span-2 p-8 rounded-[3rem] bg-[#0a0a0a] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] -mr-32 -mt-32" />
            <div className="relative flex flex-col md:flex-row gap-8 items-center">
               <div className="w-48 h-48 rounded-full border-[10px] border-blue-500/10 flex items-center justify-center relative">
                  <div className="text-center">
                     <p className="text-4xl font-black text-white leading-none">A+</p>
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">NAAC Grade</p>
                  </div>
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                     <circle cx="96" cy="96" r="86" fill="transparent" stroke="currentColor" strokeWidth="10" strokeDasharray="540" strokeDashoffset="40" className="text-blue-500" />
                  </svg>
               </div>
               <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter">Institutional Maturity Index</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-loose">Correlation of academic cycle efficiency, placement velocity, and research publication output relative to BPUT standards.</p>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Affiliation</p>
                        <p className="text-xs font-black text-white">BPUT Odisha</p>
                     </div>
                     <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <p className="text-[9px] font-black text-slate-600 uppercase mb-1">Recruiters</p>
                        <p className="text-xs font-black text-emerald-400">40+ Platinum</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="p-8 rounded-[3rem] bg-orange-600 shadow-2xl border border-orange-500 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute bottom-0 right-0 p-6 opacity-20"><ShieldCheck size={120} /></div>
            <div className="relative">
               <h4 className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Security protocol</h4>
               <p className="text-2xl font-black text-white uppercase leading-tight">Institutional Compliance Lockdown</p>
               <p className="text-[10px] text-orange-100 font-bold mt-4 opacity-70">Regulatory vault is synchronized with Biju Patnaik University of Technology (BPUT) cloud portal.</p>
               <button className="mt-8 px-6 py-3 bg-white text-orange-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Access Policy Vault</button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
         {/* Accreditation Criteria Grid */}
         <div className="p-8 rounded-[3rem] bg-[#0a0a0a] border border-white/10">
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
               <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Award size={18} className="text-blue-500" /> NAAC Assessment Engine</h3>
               <span className="text-[9px] font-black text-slate-500">2026 CYCLE</span>
            </div>
            <div className="space-y-6">
               {ACCREDITATION_CRITERIA.map(c => (
                  <div key={c.id} className="group cursor-pointer">
                     <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-slate-600 uppercase">{c.id}</span>
                           <span className="text-xs font-black text-slate-300 group-hover:text-white transition-colors">{c.title}</span>
                        </div>
                        <span className={`text-xs font-black ${c.color}`}>{c.score}/4.0</span>
                     </div>
                     <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(parseFloat(c.score)/4)*100}%` }} transition={{ duration: 1.5 }}
                          className={`h-full ${c.color.replace('text', 'bg')}`} />
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Compliance History / Audit Log */}
         <div className="space-y-6">
            <div className="p-8 rounded-[3rem] bg-[#080808] border border-white/5">
               <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2"><FileCheck size={18} className="text-emerald-500" /> Audit Trail</h3>
               <div className="space-y-4">
                  {COMPLIANCE_LOGS.map((log, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-blue-500/20 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="text-center min-w-[40px]">
                             <p className="text-xs font-black text-white">{log.date.split(' ')[0]}</p>
                             <p className="text-[8px] font-black text-slate-600 uppercase">{log.date.split(' ')[1]}</p>
                          </div>
                          <div>
                             <p className="text-xs font-black text-white uppercase tracking-tight">{log.title}</p>
                             <p className="text-[8px] font-black text-slate-500 uppercase">{log.type}</p>
                          </div>
                       </div>
                       <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{log.result}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 rounded-[2rem] bg-blue-500/10 border border-blue-500/20">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Infrastructure</p>
                  <p className="text-lg font-black text-white">36 Acres</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Berhampur Campus</p>
               </div>
               <div className="p-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Academic Rank</p>
                  <p className="text-lg font-black text-white">#1 Region</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Southern Odisha</p>
               </div>
            </div>
         </div>
      </div>
    </DashboardLayout>
  );
}
