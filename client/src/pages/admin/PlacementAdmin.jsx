import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, Users, Briefcase, TrendingUp, Search, Filter,
  Plus, X, Edit3, Trash2, ChevronRight, Eye, Building2,
  DollarSign, BarChart2, PieChart, FileText, CheckCircle2,
  AlertTriangle, Upload, Download, Star, Brain, Trophy, User, Radar
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';
import apiClient from '../../utils/apiClient';

function DriveModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ company: '', role: '', salary: '', type: 'Full Time', deadline: '' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white flex items-center gap-2 italic"><Plus size={18} className="text-indigo-500"/> New Placement Drive</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"><X size={15}/></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 italic">Company Name</label>
              <input value={form.company} onChange={e => setForm(f => ({...f, company: e.target.value}))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" placeholder="Google" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 italic">Job Role</label>
              <input value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" placeholder="SDE I" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 italic">Salary Package</label>
              <input value={form.salary} onChange={e => setForm(f => ({...f, salary: e.target.value}))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" placeholder="12 LPA" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 italic">Application Deadline</label>
              <input type="date" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50" />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 italic">Job Type</label>
            <div className="flex gap-2">
              {['Full Time', 'Internship', 'Both'].map(t => (
                <button key={t} onClick={() => setForm(f => ({...f, type: t}))}
                  className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all italic ${form.type === t ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500 shadow-xl' : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-white'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={() => { if(form.company) { onSubmit(form); onClose(); } }}
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] italic">
          Initiate Recruitment Sync
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function PlacementAdmin() {
  const { user } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('drives'); // drives | analytics | offers
  const [drives, setDrives] = useState([]);
  const [offers, setOffers] = useState([]);
  const [stats, setStats] = useState({ totalPlaced: 0, placementRate: '0%', avgPackage: '0 LPA', highestPackage: '0 LPA', activeDrives: 0 });
  const [loading, setLoading] = useState(true);
  const [showDriveForm, setShowDriveForm] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchPlacementData = async () => {
      try {
        setLoading(true);
        const [drivesRes, offersRes, statsRes] = await Promise.all([
          apiClient.get('/placement/drives'),
          apiClient.get('/placement/offers'),
          apiClient.get('/placement/stats')
        ]);
        if (mounted) {
          setDrives(drivesRes.data);
          setOffers(offersRes.data);
          setStats(statsRes.data);
        }
      } catch (err) {
        push({ type: 'error', title: 'Telemetry Offline', body: 'Failed to synchronize recruitment nodes.' });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPlacementData();
    return () => { mounted = false; };
  }, [push]);

  const handleCreateDrive = async (form) => {
    try {
      const res = await apiClient.post('/placement/drives', form);
      setDrives([res.data, ...drives]);
      push({ type: 'success', title: 'Drive Launched!', body: `${form.company} recruitment is now live for eligible students.` });
    } catch (err) {
      push({ type: 'error', title: 'Drive Commission Failed', body: err.response?.data?.msg || err.message });
    }
  };

  return (
    <DashboardLayout title="Placement Hub" role={user?.role || 'ADMIN'}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-white flex items-center gap-4 italic uppercase tracking-tighter">
             <Briefcase size={40} className="text-indigo-600" /> Institutional <span className="text-indigo-600">Career Hub</span>
          </h2>
          <p className="text-slate-400 font-bold mt-4 max-w-2xl italic text-lg leading-relaxed">Manage institutional recruitment syncs, track strategic offers, and monitor hiring velocity.</p>
        </div>
        <div className="flex gap-2">
           {['drives', 'analytics', 'offers'].map(t => (
             <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all italic ${tab === t ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500 shadow-xl' : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-white'}`}>
               {t === 'drives' ? 'Active Drives' : t}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { l: 'Placement %', v: stats.placementRate,  i: Target, c: 'text-indigo-400', b: 'bg-indigo-500/10' },
          { l: 'Students Placed', v: stats.totalPlaced, i: Users, c: 'text-emerald-400', b: 'bg-emerald-500/10' },
          { l: 'Avg Package', v: stats.avgPackage,     i: DollarSign, c: 'text-amber-500', b: 'bg-amber-500/10' },
          { l: 'Active Drives', v: stats.activeDrives, i: Building2, c: 'text-blue-400', b: 'bg-blue-500/10' },
          { l: 'Job Velocity', v: '+12%', i: TrendingUp, c: 'text-purple-400', b: 'bg-purple-500/10' },
        ].map(s => (
          <div key={s.l} className="p-5 rounded-3xl bg-[#080808] border border-white/5 flex flex-col gap-3">
             <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.b} ${s.c}`}><s.i size={16}/></div>
             <div>
               <p className="text-xl font-black text-white leading-none">{s.v}</p>
               <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1.5 italic">{s.l}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {tab === 'drives' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                 <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-2">
                    <div className="relative w-full sm:flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search company or role..." className="bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none w-full font-bold"/>
                    </div>
                    <button onClick={() => setShowDriveForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg whitespace-nowrap italic">
                       <Plus size={16}/> New Drive
                    </button>
                 </div>

                 <div className="grid grid-cols-1 gap-3 relative min-h-[200px]">
                   {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1c]/50 backdrop-blur-sm z-10 rounded-3xl">
                         <div className="flex flex-col items-center gap-4">
                            <Radar size={40} className="text-indigo-500 animate-spin" />
                            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-indigo-400">Scanning Recruitment APIs</span>
                         </div>
                      </div>
                   )}
                   {!loading && drives.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                         <Building2 size={48} className="opacity-20 mb-4" />
                         <p className="text-xs uppercase font-black tracking-[0.2em]">No Corporate Drives Found.</p>
                      </div>
                   )}
                   {drives.filter(d => d.company.toLowerCase().includes(search.toLowerCase())).map((d, i) => (
                      <motion.div key={d.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                        className="p-5 rounded-[2rem] bg-[#080808] border border-white/5 flex flex-wrap items-center justify-between gap-6 group hover:border-indigo-500/30 transition-all overflow-hidden relative">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
                         <div className="relative flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl" style={{ background: d.color }}>{d.company[0]}</div>
                            <div>
                               <h3 className="text-sm font-black text-white uppercase italic">{d.company} <span className="text-slate-500 font-bold ml-1 text-xs">({d.role})</span></h3>
                               <div className="flex gap-4 text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1 italic">
                                  <span>ID: {d.id}</span>
                                  <span className="text-emerald-400">{d.salary}</span>
                                  <span>{d.type}</span>
                               </div>
                            </div>
                         </div>

                         <div className="relative grid grid-cols-2 gap-8 px-6 border-l border-white/5">
                            <div>
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Candidates</p>
                               <p className="text-base font-black text-white">{d.applicants}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Shortlisted</p>
                               <p className="text-base font-black text-emerald-400">{d.shortlisted}</p>
                            </div>
                         </div>

                         <div className="relative flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border italic ${
                              d.status === 'Drive Completed' ? 'text-slate-400 bg-white/5 border-white/10' : 
                              d.status === 'Interviewing' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]'
                            }`}>{d.status}</span>
                            <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"><Edit3 size={16}/></button>
                         </div>
                      </motion.div>
                   ))}
                 </div>
              </motion.div>
            )}

            {tab === 'analytics' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                 <div className="p-8 rounded-[3rem] bg-[#080808] border border-white/5 flex flex-col items-center justify-center text-center py-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32" />
                    <BarChart2 size={56} className="text-indigo-500/30 mb-6" />
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Career Intelligence Model</h3>
                    <p className="text-slate-500 mt-2 max-w-sm text-sm font-bold italic">Deep learning models are computing the sector-wise hiring trends and CTC dispersion for the 2026 batch.</p>
                    <div className="flex gap-4 mt-8">
                       <button className="px-6 py-3 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl italic">Download Reports</button>
                       <button className="px-6 py-3 bg-white/5 border border-white/10 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all italic">Recruiter Feedback</button>
                    </div>
                 </div>
              </motion.div>
            )}

            {tab === 'offers' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                 <div className="p-6 rounded-[2.5rem] bg-[#080808] border border-white/5">
                    <div className="flex items-center justify-between mb-6 uppercase">
                       <h3 className="text-lg font-black text-white tracking-widest flex items-center gap-2"><Trophy size={20} className="text-amber-500"/> Recent Offer Vault</h3>
                       <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-slate-400 hover:text-white">BULK UPLOAD <Upload size={12}/></button>
                    </div>
                    <div className="space-y-3 relative min-h-[150px]">
                       {loading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1c]/50 backdrop-blur-sm z-10 rounded-3xl">
                             <Radar size={30} className="text-amber-500 animate-spin" />
                          </div>
                       )}
                       {!loading && offers.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                             <Trophy size={36} className="opacity-20 mb-3" />
                             <p className="text-xs uppercase font-black tracking-[0.2em]">Offer Vault is Empty.</p>
                          </div>
                       )}
                       {offers.map(o => (
                         <div key={o.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black">{o.company[0]}</div>
                               <div>
                                  <p className="text-sm font-black text-white">{o.student}</p>
                                  <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">{o.roll} · {o.company} · {o.date}</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className="text-xs font-black text-emerald-400">{o.package}</span>
                               <button className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-all"><Download size={14}/></button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
           <div className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/30">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Internal Referral Board</h4>
              <div className="space-y-3">
                 <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 group cursor-pointer hover:border-white/20 transition-all">
                    <User size={16} className="text-indigo-400" />
                    <span className="text-[9px] font-black text-slate-300 uppercase">Refer Alumni for SDE</span>
                    <ChevronRight size={14} className="ml-auto text-slate-700 group-hover:text-white" />
                 </div>
                 <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3 group cursor-pointer hover:border-white/20 transition-all">
                    <Building2 size={16} className="text-indigo-400" />
                    <span className="text-[9px] font-black text-slate-300 uppercase">New Recruiter Onboarding</span>
                 </div>
              </div>
           </div>

           <div className="p-6 rounded-[2rem] bg-[#080808] border border-white/5 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-[50px] -mr-16 -mt-16" />
              <div className="relative">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">AI Recruiter Insights</h4>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400"><Brain size={16}/></div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-bold">Predicted hiring surge in <span className="text-white">FinTech</span> for Q3. Suggesting early drive scheduling for ECE/CSE students.</p>
                </div>
                <button className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">View Market Report</button>
              </div>
           </div>

           <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
             <div className="flex items-center gap-2 text-slate-400">
               <Target size={16}/>
               <span className="text-[10px] font-black uppercase tracking-widest">Drive Policies</span>
             </div>
             <ul className="space-y-2">
               {["One student, one offer rule", "Min 7.0 CGPA for Tier-1", "Dress code mandatory", "Attendance > 80%"].map(r => (
                 <li key={r} className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                   <div className="w-1 h-1 rounded-full bg-slate-600" /> {r}
                 </li>
               ))}
             </ul>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showDriveForm && <DriveModal onClose={() => setShowDriveForm(false)} onSubmit={handleCreateDrive} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
