import { motion } from 'framer-motion';
import { 
  Users, MapPin, Briefcase, Award, TrendingUp, ChevronRight, CheckCircle2, QrCode, ShieldCheck, Download
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { StatCard, GlassCard } from '../../components/ui/DashboardComponents';
import AIChat from '../../components/AIChat';

export default function AlumniDashboard() {
  return (
    <DashboardLayout title="Alumni Network" role="ALUMNI">
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight">Global Alumni Hub</h2>
           <p className="text-slate-400 font-medium mt-1">Endowments, institutional mentoring, and network telemetry</p>
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500/20 text-amber-500 hover:bg-amber-500/30 font-black text-sm uppercase tracking-widest rounded-xl transition-all border border-amber-500/30">
          Fund Endowment
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Endowment" value="₹2.4Cr" icon={TrendingUp} trend="+12% YTD" />
        <span className="hidden">
           <StatCard title="Active Mentorships" value="14" icon={Users} trend="Current students" trendUp={true} color="blue" />
        </span>
        <StatCard title="Global Rank" value="Top 5%" icon={Award} trend="VITAM Network" trendUp={true} color="purple" />
        <StatCard title="Alumni Verified" value="8,400+" icon={CheckCircle2} trend="Active worldwide" color="emerald" />
        <StatCard title="Upcoming Reunions" value="3" icon={MapPin} trend="In next 6 months" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
        
        {/* Prestige ID */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <motion.div 
            whileHover={{ rotateY: 10, rotateX: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-full aspect-[1/1.5] rounded-[2rem] bg-gradient-to-br from-amber-600 to-slate-900 border border-amber-500/30 p-6 relative overflow-hidden shadow-[0_20px_50px_rgba(245,158,11,0.2)] flex flex-col justify-between group cursor-pointer perspective-1000"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Holographic overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-amber-300/20 via-yellow-500/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            {/* Header */}
            <div className="flex justify-between items-start relative z-10 text-white translate-z-10">
              <div>
                <h3 className="text-xl font-black tracking-widest text-amber-100">VITAM ALUMNI</h3>
                <p className="text-[8px] uppercase tracking-[0.3em] text-amber-500/80 font-bold">Gold Class Access</p>
              </div>
              <ShieldCheck size={28} className="text-amber-400" />
            </div>

            {/* Photo & ID */}
            <div className="flex flex-col items-center relative z-10 translate-z-20">
              <div className="w-28 h-28 rounded-full border-4 border-amber-500/50 bg-slate-900 shadow-[0_0_30px_rgba(245,158,11,0.3)] mb-4 overflow-hidden flex items-center justify-center">
                 <Users size={48} className="text-amber-600/50" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Rajesh Sharma</h2>
              <p className="text-xs text-amber-400 mt-1 font-black tracking-widest uppercase">Class of 2018</p>
              <div className="mt-4 px-4 py-1.5 rounded-full bg-black/40 border border-amber-500/30">
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-200 flex items-center gap-2">
                   <Briefcase size={12}/> Senior Architect, AWS
                </p>
              </div>
            </div>

            {/* Footer QR */}
            <div className="flex justify-between items-end relative z-10 translate-z-10">
              <div>
                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider mb-1">Lifetime</p>
                <p className="text-sm text-amber-100 font-mono font-bold">L-8402</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-lg p-1">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <button className="w-full py-4 rounded-2xl bg-amber-500/10 text-amber-400 font-black text-sm border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2">
            <Download size={18} /> Export Gold Pass
          </button>
        </div>

        {/* Dynamic Lists */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <GlassCard title="Endowment History" subtitle="Institutional funding and contributions" icon={TrendingUp}>
            <div className="space-y-4 mt-4">
              {[
                { name: 'Research Lab Expansion Fund', amount: '₹1,50,000', date: 'Feb 2026', status: 'Deployed' },
                { name: 'Scholarship Batch 2024', amount: '₹50,000', date: 'Aug 2024', status: 'Graduated' },
                { name: 'Library Digital Conversion', amount: '₹2,00,000', date: 'Nov 2022', status: 'Deployed' }
              ].map((fund, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-white/5 group hover:border-amber-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                      <TrendingUp size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">{fund.name}</p>
                      <p className="text-xs text-slate-500">{fund.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-400">{fund.amount}</p>
                    <p className="text-[9px] uppercase tracking-widest text-slate-400 font-black border border-white/10 px-2 py-0.5 rounded mt-1 bg-white/5">{fund.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard title="Mentorship Pipeline" subtitle="Current student advisory connections" icon={Users}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {[
                  { name: 'Arjun Das', course: 'B.Tech CSE Year 4', focus: 'Cloud Ops', status: 'Active' },
                  { name: 'Priya Verma', course: 'B.Tech IT Year 4', focus: 'System Design', status: 'Pending Review' }
                ].map((student, i) => (
                   <div key={i} className="p-4 bg-slate-800/40 rounded-2xl border border-white/5 relative overflow-hidden group cursor-pointer">
                      <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500/20 rounded-bl-[2rem] flex items-center justify-center group-hover:w-full group-hover:h-full group-hover:rounded-none group-hover:bg-blue-600 transition-all duration-500 z-0" />
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-4">
                           <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-white/50 group-hover:border-white/20 transition-all">
                             <Users size={16} />
                           </div>
                           <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${student.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                             {student.status}
                           </span>
                        </div>
                        <h4 className="text-lg font-black text-white group-hover:text-white transition-colors">{student.name}</h4>
                        <p className="text-xs text-slate-400 font-mono mt-1 group-hover:text-blue-100">{student.course}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-4 group-hover:text-white">Focus: {student.focus}</p>
                      </div>
                   </div>
                ))}
                
                <div className="p-4 bg-transparent border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-slate-500 hover:border-appleBlue hover:text-appleBlue hover:bg-appleBlue/5 transition-all cursor-pointer">
                   <Users size={24} className="mb-2" />
                   <span className="text-xs font-black uppercase tracking-widest">Accept New Scholar</span>
                </div>
             </div>
          </GlassCard>
        </div>
      </div>

      <AIChat role="alumni" />
    </DashboardLayout>
  );
}
