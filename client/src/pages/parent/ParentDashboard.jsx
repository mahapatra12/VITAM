import { motion } from 'framer-motion';
import { 
  UserCircle, Calendar, GraduationCap, MapPin, AlertCircle, 
  Wallet, TrendingUp, HeartPulse, CreditCard, ChevronRight, Download
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard, ActivityFeed } from '../../components/ui/DashboardComponents';

export default function ParentDashboard() {
  return (
    <DashboardLayout title="Guardian Portal" role="PARENT">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight">Guardian Command</h2>
           <p className="text-slate-400 font-medium mt-1">Real-time academic telemetry and safety protocols for your ward</p>
        </div>
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
           {/* Ward Selector Mockup */}
           <button className="px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 font-black text-xs border border-blue-500/30">Alex Rivera (B.Tech CSE)</button>
           <button className="px-4 py-2 rounded-xl text-slate-500 font-bold text-xs hover:bg-slate-700/50 transition-colors">Add Ward +</button>
        </div>
      </div>

      {/* Ward Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Current GPA" value="8.92" icon={GraduationCap} trend="Top 12% of Class" trendUp={true} />
        <span className="hidden">
           <StatCard title="Overall Attendance" value="89.5%" icon={Calendar} trend="+2.1% this month" trendUp={true} color="emerald" />
        </span>
        <StatCard title="Overall Attendance" value="89.5%" icon={Calendar} trend="+2.1% this month" trendUp={true} color="emerald" />
        <StatCard title="Hostel Status" value="Secure" icon={MapPin} trend="Checked into Room 402" color="blue" />
        <StatCard title="Pending Fees" value="₹12,400" icon={Wallet} trend="Due in 14 days" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
        
        {/* Academic Radar */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard title="Academic Trajectory" subtitle="Semester over semester performance metrics" icon={TrendingUp}>
            <div className="mt-4 p-5 bg-slate-800/30 rounded-2xl border border-white/5 relative overflow-hidden group">
               <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-bl-full pointer-events-none" />
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h4 className="text-xl font-black text-white tracking-tight">Semester 5 Mid-Terms</h4>
                   <p className="text-xs text-slate-400 mt-1">2/5 Subjects completed marking</p>
                 </div>
                 <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-widest uppercase rounded border border-emerald-500/30">
                   Passing Trajectory
                 </span>
               </div>

               <div className="space-y-4 relative z-10">
                 {[
                   { sub: 'Data Structures (CS-302)', score: 88, max: 100, classAvg: 72 },
                   { sub: 'AI Ethics (AI-401)', score: 94, max: 100, classAvg: 81 },
                   { sub: 'Computer Networks (CS-304)', score: 'Pending', max: 100, classAvg: null }
                 ].map((subj, i) => (
                   <div key={i} className="flex flex-col gap-2">
                     <div className="flex justify-between items-end">
                       <span className="text-sm font-bold text-slate-300">{subj.sub}</span>
                       <span className="text-xs font-black text-white">{subj.score}{typeof subj.score === 'number' && `/${subj.max}`}</span>
                     </div>
                     <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden relative">
                       {typeof subj.score === 'number' && (
                         <>
                           <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(subj.score/subj.max)*100}%` }} />
                           <div className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10" style={{ left: `${(subj.classAvg/subj.max)*100}%` }} title={`Class Average: ${subj.classAvg}`} />
                         </>
                       )}
                     </div>
                     {typeof subj.score === 'number' && (
                       <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Class Average: {subj.classAvg}</p>
                     )}
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-start gap-4">
               <HeartPulse size={20} className="text-blue-400 shrink-0 mt-0.5" />
               <p className="text-xs text-blue-200 leading-relaxed font-medium">
                 <strong className="text-blue-400 font-black">AI Insights:</strong> Alex is performing 18% consistently above the class average. However, their library exit logs indicate late-night study sessions. We recommend ensuring adequate rest before the Computer Networks exam next Tuesday.
               </p>
            </div>
          </GlassCard>

          <GlassCard title="Attendance Heatmap" subtitle="Missed lectures and risk analysis" icon={AlertCircle}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {[
                { date: 'Mon, 15 Mar', status: 'Present', color: 'emerald' },
                { date: 'Tue, 16 Mar', status: 'Present', color: 'emerald' },
                { date: 'Wed, 17 Mar', status: 'Absent', color: 'red' },
                { date: 'Thu, 18 Mar', status: 'Present', color: 'emerald' }
              ].map((day, i) => (
                <div key={i} className={`p-4 rounded-2xl border border-${day.color}-500/20 bg-${day.color}-500/5 text-center`}>
                   <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">{day.date}</p>
                   <p className={`text-sm font-black text-${day.color}-400`}>{day.status}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Action Center */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <GlassCard title="Fee Ledger" subtitle="Pending dues and historical processing" icon={Wallet}>
             <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/10 border border-amber-500/30 relative overflow-hidden">
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-amber-500 mb-1">Total Due</p>
                <h3 className="text-4xl font-black text-white tracking-tighter mb-4">₹12,400</h3>
                <div className="space-y-2 mb-6">
                   <div className="flex justify-between text-xs text-slate-300 font-medium border-b border-white/10 pb-2">
                     <span>Tuition Balance (Sem 5)</span>
                     <span className="font-bold text-white">₹10,000</span>
                   </div>
                   <div className="flex justify-between text-xs text-slate-300 font-medium">
                     <span>Hostel Mess Dues</span>
                     <span className="font-bold text-white">₹2,400</span>
                   </div>
                </div>
                <button className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2">
                  <CreditCard size={18} /> Process Payment
                </button>
             </div>
             
             <div className="mt-4 space-y-2">
               <button className="w-full p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-white/5 text-xs font-bold text-slate-300 flex justify-between items-center transition-all group">
                 <span className="flex items-center gap-2"><Download size={14} className="text-slate-500 group-hover:text-blue-400"/> Last Semester Receipt</span>
                 <ChevronRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
               </button>
             </div>
          </GlassCard>

          <GlassCard title="Campus Dispatches" subtitle="Direct messages from HOD and Admin" icon={AlertCircle}>
             <div className="mt-4 space-y-4">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer">
                   <div className="flex justify-between text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">
                     <span>From: HOD (CSE)</span>
                     <span>2 Hrs Ago</span>
                   </div>
                   <p className="text-sm font-bold text-slate-200">Regarding mandatory attendance for the upcoming TCS placement drive briefing.</p>
                </div>
             </div>
          </GlassCard>
        </div>
      </div>

    </DashboardLayout>
  );
}
