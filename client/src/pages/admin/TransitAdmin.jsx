import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bus, Users, Wrench, Droplets, MapPin, Search, Filter,
  Plus, X, Edit3, Trash2, ChevronRight, BarChart2,
  AlertTriangle, Navigation, ShieldCheck, Zap,
  Settings, Phone, CheckCircle2, Database, Download, Activity, Radar
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';
import { useHealth } from '../../context/HealthContext';
import SystemStatusPanel from '../../components/ui/SystemStatusPanel';
import Telemetry from '../../utils/telemetry';
import apiClient from '../../utils/apiClient';

const MAINTENANCE_LOGS = [
  { id: "M-401", bus: "B-201", type: "Oil Change", cost: "₹4,500", date: "15 Mar", outcome: "Pass" },
  { id: "M-402", bus: "B-202", type: "Brake Pad Replacement", cost: "₹8,200", date: "22 Mar", outcome: "In Progress" },
];

function FleetModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ id: '', driver: '', route: 'Main City Express', status: 'Active' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white flex items-center gap-2 uppercase tracking-widest text-sm italic"><Plus size={18} className="text-indigo-500"/> Register Fleet Unit</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={15} /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Transit ID</label>
              <input value={form.id} onChange={e => setForm(f => ({...f, id: e.target.value}))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm text-white focus:outline-none focus:border-indigo-500/50" placeholder="B-204" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Manufacturer</label>
              <input value={form.model} onChange={e => setForm(f => ({...f, model: e.target.value}))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm text-white focus:outline-none" placeholder="Tata Starbus" />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-2 italic">Assigned Transit Controller</label>
            <input value={form.driver} onChange={e => setForm(f => ({...f, driver: e.target.value}))}
              className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm text-white focus:outline-none" placeholder="Search controllers..." />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Route Assignment</label>
            <select value={form.route} onChange={e => setForm(f => ({...f, route: e.target.value}))} className="w-full bg-[#0a0a0a] border border-white/10 rounded-[1.5rem] px-5 py-4 text-xs text-white uppercase font-black focus:outline-none focus:border-indigo-500/50 appearance-none">
               <option value="Main City Express">Main City Express</option>
               <option>Tech Park Loop</option>
               <option>Hostel Shuttle</option>
            </select>
          </div>
        </div>
        <button onClick={() => { if(form.id) { onSubmit(form); onClose(); } }}
          className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 italic">
          Initialize Transit Node
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function TransitAdmin() {
  const { user } = useAuth();
  const { push } = useToast();
  const { health } = useHealth();
  const [tab, setTab] = useState('fleet'); // fleet | maintenance | analysis
  const [fleet, setFleet] = useState([]);
  const [loadingFleet, setLoadingFleet] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchFleet = async () => {
      try {
        const res = await apiClient.get('/fleet');
        if (mounted) {
          setFleet(res.data);
          setLoadingFleet(false);
        }
      } catch (err) {
        if (mounted) setLoadingFleet(false);
        push({ type: 'error', title: 'Telemetry Offline', body: 'Failed to synchronize with Transit Grid.' });
      }
    };
    if (loadingFleet && fleet.length === 0) fetchFleet();
    return () => { mounted = false; };
  }, []);

  const stats = {
    totalUnits: fleet.length,
    activeDrivers: fleet.filter(b => b.driver).length || 0,
    onRoad: fleet.filter(b => b.status === 'Active').length,
    delayed: fleet.filter(b => b.status === 'Maintenance' || b.status === 'In Workshop').length,
    fuelAvg: fleet.length ? `${Math.floor(fleet.reduce((acc, curr) => acc + parseInt(curr.fuel || '100'), 0) / fleet.length)}%` : '0%'
  };

  const handleCreate = async (form) => {
    try {
      const res = await apiClient.post('/fleet', form);
      setFleet([res.data, ...fleet]);
      Telemetry.remit('INFO', `New Fleet Unit Commissioned: ${form.id}`);
      push({ type: 'success', title: 'Fleet Expanded', body: `Hull ID ${form.id} deployed to institutional grid.` });
    } catch (err) {
      push({ type: 'error', title: 'Commissioning Failed', body: err.response?.data?.msg || err.message });
    }
  };

  return (
    <DashboardLayout title="Transit Control Hub" role={user?.role || 'ADMIN'}>
      <div className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.5em] mb-5 italic ${health.variance > 40 ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`}
          >
            <Navigation size={14} className="opacity-80" />
            <span>Institutional Transit Grid • {health.variance > 40 ? 'Route Congestion' : 'Flow Optimal'}</span>
          </motion.div>
          
          <h2 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black tracking-tighter italic mb-4 uppercase leading-[0.85] text-white drop-shadow-2xl">
             Transit<br/>
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-500 to-cyan-400 drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]">
               Governance
             </span>
          </h2>
          
          <p className="text-slate-400 font-bold mt-6 max-w-xl italic leading-relaxed text-sm border-l-2 border-indigo-500/30 pl-5 shadow-sm">
            Real-time high-fidelity fleet telemetry, autonomous routing optimizations, and strategic vehicular orchestration mapped to the VITAM central grid.
          </p>
        </div>

        <div className="flex-shrink-0 relative group mt-8 xl:mt-0">
          <motion.div 
            animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.4, 0.1], rotate: 360 }} 
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }} 
            className="absolute -inset-10 bg-gradient-to-tr from-indigo-500/20 to-cyan-500/20 blur-3xl rounded-full z-0 pointer-events-none" 
          />
          <div className="relative z-10 hover:scale-[1.02] transition-transform duration-500">
            <SystemStatusPanel mode="CAMPUS" />
          </div>
        </div>
      </div>

      <div className="flex justify-start gap-2 mb-8">
         {['fleet', 'maintenance', 'analysis'].map(t => (
           <button key={t} onClick={() => setTab(t)}
             className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${tab === t ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500 shadow-xl' : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-white'}`}>
             {t}
           </button>
         ))}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { l: 'Total Fleet', v: stats.totalUnits, i: Bus, c: 'text-indigo-400', b: 'bg-indigo-500/10' },
          { l: 'Transit Controllers', v: stats.activeDrivers, i: Users, c: 'text-emerald-400', b: 'bg-emerald-500/10' },
          { l: 'Units On Road', v: stats.onRoad, i: Navigation, c: 'text-blue-400', b: 'bg-blue-500/10' },
          { l: 'Fuel Reserve', v: stats.fuelAvg, i: Droplets, c: 'text-amber-500', b: 'bg-amber-500/10' },
          { l: 'Grid Exceptions', v: stats.delayed, i: AlertTriangle, c: 'text-red-400', b: 'bg-red-500/10' },
        ].map(s => (
          <div key={s.l} className="p-6 rounded-[2.5rem] bg-[#080808] border border-white/5 flex flex-col gap-4 group hover:border-indigo-500/30 transition-all cursor-pointer">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.b} ${s.c} group-hover:scale-110 transition-transform`}><s.i size={18}/></div>
             <div>
                <p className="text-3xl font-black text-white leading-none italic">{s.v}</p>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-2 italic">{s.l}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Workspace */}
        <div className="lg:col-span-2 space-y-6">
           <AnimatePresence mode="wait">
             {tab === 'fleet' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                     <div className="relative w-full sm:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Sync Fleet ID, Institutional ID or Deployment Path..." className="bg-white/[0.03] border border-white/10 rounded-xl py-4 pl-10 pr-4 text-[11px] uppercase font-black text-white focus:outline-none w-full tracking-[0.2em] italic"/>
                     </div>
                     <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 whitespace-nowrap italic">
                        <Plus size={16}/> Register Node
                     </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 relative min-h-[200px]">
                     {loadingFleet && (
                        <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1c]/50 backdrop-blur-sm z-10 rounded-3xl">
                           <div className="flex flex-col items-center gap-4">
                              <Radar size={40} className="text-indigo-500 animate-spin" />
                              <span className="text-[10px] uppercase font-black tracking-[0.4em] text-indigo-400">Syncing Institutional Grid</span>
                           </div>
                        </div>
                     )}
                     {!loadingFleet && fleet.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                           <Bus size={48} className="opacity-20 mb-4" />
                           <p className="text-xs uppercase font-black tracking-[0.2em]">Grid is empty. Commission a node.</p>
                        </div>
                     )}
                     {fleet.filter(b => b.id.includes(search) || b.route?.includes(search)).map((b, i) => (
                        <motion.div key={b.id || i} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                          className="p-6 rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 flex flex-wrap items-center justify-between gap-6 group hover:border-indigo-500/30 transition-all overflow-hidden relative cursor-pointer">
                           <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 blur-[60px] -mr-24 -mt-24 group-hover:bg-indigo-500/10 transition-all" />
                           <div className="relative flex items-center gap-6">
                              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-2xl border border-white/10" style={{ background: b.color }}>{b.id[0]}</div>
                              <div>
                                 <h3 className="text-base font-black text-white uppercase tracking-tight italic">{b.id} <span className="text-slate-600 font-bold ml-1 text-xs">{b.plate}</span></h3>
                                 <p className="text-[10px] text-indigo-400 font-black uppercase mt-1 tracking-[0.2em] flex items-center gap-2 italic">
                                    <Radar size={12} className="animate-pulse" /> {b.route}
                                 </p>
                              </div>
                           </div>

                           <div className="relative flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 px-8 border-l border-white/5">
                              <div>
                                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Commander</p>
                                 <p className="text-xs font-black text-white uppercase tracking-tighter">{b.driver}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Fuel Pulse</p>
                                 <p className="text-xs font-black text-emerald-400">{b.fuel}</p>
                              </div>
                              <div className="hidden md:block">
                                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Last Sync</p>
                                 <p className="text-xs font-black text-white uppercase tracking-tighter">{b.lastService}</p>
                              </div>
                              <div className="hidden md:block">
                                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Integrity</p>
                                 <p className={`text-xs font-black uppercase tracking-tighter ${b.health === 'Optimal' ? 'text-emerald-500' : 'text-amber-500'}`}>{b.health}</p>
                              </div>
                           </div>

                           <div className="relative flex items-center gap-3">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                b.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                              }`}>{b.status}</span>
                              <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/10 transition-all"><Edit3 size={16}/></button>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </motion.div>
             )}

             {tab === 'maintenance' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="p-16 rounded-[4rem] bg-[#080808] border border-white/5 flex flex-col items-center justify-center text-center py-24 border-dashed relative overflow-hidden">
                     <div className="absolute inset-0 bg-indigo-500/5 blur-[80px]" />
                     <Wrench size={64} className="text-slate-800 mb-8 relative z-10" />
                     <h3 className="text-3xl font-black text-white uppercase italic tracking-tight relative z-10">Structural Integrity Audit</h3>
                     <p className="text-slate-500 text-sm font-black italic max-w-sm mx-auto mt-4 relative z-10 leading-relaxed uppercase tracking-widest">The institutional transit network is synchronizing structural repair vectors across all nodes.</p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl mt-12 relative z-10">
                        {MAINTENANCE_LOGS.map(log => (
                          <div key={log.id} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex justify-between text-left group hover:border-indigo-500/30 transition-all">
                             <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">{log.bus} UNIT</p>
                                <p className="text-sm font-black text-white uppercase italic tracking-tight">{log.type}</p>
                                <p className="text-[9px] text-slate-600 font-bold uppercase mt-2 tracking-widest">{log.date} MAR 2026</p>
                             </div>
                             <div className="text-right flex flex-col justify-between">
                                <p className="text-sm font-black text-emerald-400 uppercase tracking-tighter">{log.cost}</p>
                                <span className={`text-[8px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-lg border ${log.outcome === 'Pass' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/10' : 'border-amber-500/30 text-amber-500 bg-amber-500/10'}`}>{log.outcome}</span>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Sidebar Control */}
        <div className="space-y-6">
           <div className="p-10 rounded-[3.5rem] bg-indigo-600 shadow-2xl border border-indigo-400/30 relative overflow-hidden group">
              {/* Animated Rings Background */}
              <div className="absolute inset-x-0 bottom-0 top-0 overflow-hidden opacity-20 flex items-center justify-center pointer-events-none">
                 <div className="w-[300px] h-[300px] border-4 border-white rounded-full animate-[ping_3s_infinite]" />
                 <div className="w-[200px] h-[200px] border-2 border-white rounded-full animate-[ping_4s_infinite] absolute" />
              </div>

              <div className="relative">
                 <div className="flex items-center gap-4 text-white/80 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white"><Zap size={24} className="fill-white" /></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">Emergency Pulse</span>
                 </div>
                 <p className="text-3xl font-black text-white italic tracking-tighter leading-none mb-3">SOS Override</p>
                 <p className="text-[10px] text-white/60 font-black uppercase tracking-widest italic mb-8">Institutional Broadcast Protocol Alpha</p>
                 
                 <div className="p-4 rounded-3xl bg-black/20 backdrop-blur-md border border-white/10 mb-8">
                    <p className="text-[10px] text-indigo-50 text-center font-bold italic leading-relaxed">"Immediate grid-wide frequency broadcast to all units active on the 36-acre campus."</p>
                 </div>

                 <button className="w-full py-5 bg-white text-indigo-700 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.03] transition-all transform hover:rotate-1 active:scale-95">
                    INITIATE BROADCAST
                 </button>
              </div>
           </div>

           <div className="p-8 rounded-[3.5rem] bg-[#080808] border border-white/5 space-y-6">
              <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] border-b border-white/5 pb-4 ml-2 italic">Institutional Grid Connect</h4>
              <div className="space-y-3">
                 {[
                   { l: 'Fuel Depot Logistics', i: Droplets, c: 'text-blue-400' },
                   { l: 'Asset Inventory Sync', i: Database, c: 'text-indigo-400' },
                   { l: 'Fleet Telemetry Export', i: Download, c: 'text-emerald-400' },
                 ].map(item => (
                    <div key={item.l} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 group hover:border-indigo-500/30 cursor-pointer transition-all">
                       <div className="flex items-center gap-4">
                          <item.i size={18} className={`${item.c} opacity-50 group-hover:opacity-100 transition-opacity`} />
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-white transition-colors">{item.l}</span>
                       </div>
                       <ChevronRight size={14} className="text-slate-800 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && <FleetModal onClose={() => setShowForm(false)} onSubmit={handleCreate} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
