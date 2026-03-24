import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bus, Users, Wrench, Droplets, MapPin, Search, Filter,
  Plus, X, Edit3, Trash2, ChevronRight, BarChart2,
  AlertTriangle, Navigation, ShieldCheck, Zap,
  Settings, Phone, CheckCircle2, Database, Download
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const MOCK_FLEET = [
  { id: "B-201", model: "Tata Starbus 40", plate: "KA-01-VH-2024", driver: "Somesh K.", route: "Main City Express", status: "Active", fuel: "65%", lastService: "15 Mar", health: "Optimal", color: "#6366F1" },
  { id: "B-202", model: "Swaraj Mazda", plate: "KA-01-VH-2025", driver: "Manish R.", route: "Tech Park Loop", status: "In Workshop", fuel: "22%", lastService: "22 Mar", health: "Maintenance", color: "#10B981" },
  { id: "B-203", model: "EV shuttle (Compact)", plate: "EV-SH-01", driver: "Raju B.", route: "Hostel Shuttle", status: "Active", fuel: "88%", lastService: "10 Mar", health: "Optimal", color: "#F59E0B" },
];

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
          <h3 className="font-black text-white flex items-center gap-2 uppercase tracking-widest text-sm"><Plus size={18} className="text-indigo-500"/> Register Fleet Unit</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={15} /></button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Bus ID</label>
              <input value={form.id} onChange={e => setForm(f => ({...f, id: e.target.value}))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50" placeholder="B-204" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Model</label>
              <input value={form.model} onChange={e => setForm(f => ({...f, model: e.target.value}))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" placeholder="Tata Starbus" />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Assigned Driver</label>
            <input value={form.driver} onChange={e => setForm(f => ({...f, driver: e.target.value}))}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" placeholder="Search drivers..." />
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Route Assignment</label>
            <select className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-xs text-white uppercase font-black focus:outline-none focus:border-indigo-500/50 appearance-none">
               <option>Main City Express</option>
               <option>Tech Park Loop</option>
               <option>Hostel Shuttle</option>
            </select>
          </div>
        </div>
        <button onClick={() => { if(form.id) { onSubmit(form); onClose(); } }}
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]">
          Commission Fleet Unit
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function TransitAdmin() {
  const { user } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('fleet'); // fleet | maintenance | analysis
  const [fleet, setFleet] = useState(MOCK_FLEET);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const stats = {
    totalUnits: fleet.length,
    activeDrivers: 15,
    onRoad: fleet.filter(b => b.status === 'Active').length,
    delayed: 1,
    fuelAvg: "72%"
  };

  const handleCreate = (form) => {
    setFleet([{ id: form.id, ...form, fuel: "100%", lastService: "Today", health: "Optimal", color: "#6366F1" }, ...fleet]);
    push({ type: 'success', title: 'Fleet Expanded', body: `Bus Unit ${form.id} has been added to the institutional fleet.` });
  };

  return (
    <DashboardLayout title="Transit Control Hub" role={user?.role || 'ADMIN'}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
             <Navigation size={28} className="text-indigo-500" /> Fleet Orchestrator
          </h2>
          <p className="text-slate-400 mt-1">Manage institutional transport fleet, driver logistics, and lifecycle maintenance.</p>
        </div>
        <div className="flex gap-2">
           {['fleet', 'maintenance', 'analysis'].map(t => (
             <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${tab === t ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500 shadow-xl' : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-white'}`}>
               {t}
             </button>
           ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { l: 'Total Fleet', v: stats.totalUnits, i: Bus, c: 'text-indigo-400', b: 'bg-indigo-500/10' },
          { l: 'Drivers', v: stats.activeDrivers, i: Users, c: 'text-emerald-400', b: 'bg-emerald-500/10' },
          { l: 'Buses On Road', v: stats.onRoad, i: Navigation, c: 'text-blue-400', b: 'bg-blue-500/10' },
          { l: 'Avg Fuel', v: stats.fuelAvg, i: Droplets, c: 'text-amber-500', b: 'bg-amber-500/10' },
          { l: 'Incidents', v: stats.delayed, i: AlertTriangle, c: 'text-red-400', b: 'bg-red-500/10' },
        ].map(s => (
          <div key={s.l} className="p-5 rounded-3xl bg-[#080808] border border-white/5 flex flex-col gap-3">
             <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${s.b} ${s.c}`}><s.i size={16}/></div>
             <div>
               <p className="text-xl font-black text-white leading-none">{s.v}</p>
               <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1.5">{s.l}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Workspace */}
        <div className="lg:col-span-2">
           <AnimatePresence mode="wait">
             {tab === 'fleet' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-2">
                     <div className="relative w-full sm:flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Fleet ID, Plate or Route..." className="bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none w-full font-bold"/>
                     </div>
                     <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg whitespace-nowrap">
                        <Plus size={16}/> Commission Bus
                     </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                     {fleet.filter(b => b.id.includes(search) || b.route.includes(search)).map((b, i) => (
                        <motion.div key={b.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                          className="p-5 rounded-[2rem] bg-[#080808] border border-white/5 flex flex-wrap items-center justify-between gap-6 group hover:border-indigo-500/30 transition-all overflow-hidden relative">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] -mr-16 -mt-16" />
                           <div className="relative flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl" style={{ background: b.color }}>{b.id[0]}</div>
                              <div>
                                 <h3 className="text-sm font-black text-white uppercase tracking-tight">{b.id} <span className="text-slate-500 font-bold ml-1 text-xs">({b.plate})</span></h3>
                                 <p className="text-[10px] text-indigo-400 font-black uppercase mt-1 tracking-widest">{b.route}</p>
                              </div>
                           </div>

                           <div className="relative flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 px-6 border-l border-white/5">
                              <div>
                                 <p className="text-[9px] font-black text-slate-500 uppercase">Driver</p>
                                 <p className="text-[10px] font-black text-white uppercase">{b.driver}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-500 uppercase">Fuel</p>
                                 <p className="text-[10px] font-black text-emerald-400">{b.fuel}</p>
                              </div>
                              <div className="hidden md:block">
                                 <p className="text-[9px] font-black text-slate-500 uppercase">Last Svc</p>
                                 <p className="text-[10px] font-black text-white uppercase">{b.lastService}</p>
                              </div>
                              <div className="hidden md:block">
                                 <p className="text-[9px] font-black text-slate-500 uppercase">Health</p>
                                 <p className={`text-[10px] font-black uppercase ${b.health === 'Optimal' ? 'text-emerald-500' : 'text-amber-500'}`}>{b.health}</p>
                              </div>
                           </div>

                           <div className="relative flex items-center gap-3">
                              <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border ${
                                b.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                              }`}>{b.status}</span>
                              <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"><Edit3 size={16}/></button>
                           </div>
                        </motion.div>
                     ))}
                  </div>
               </motion.div>
             )}

             {tab === 'maintenance' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 text-center py-20 bg-[#080808] border border-white/5 rounded-[3rem]">
                  <Wrench size={48} className="mx-auto text-slate-800 mb-4" />
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Maintenance Ledger</h3>
                  <p className="text-slate-500 text-sm font-bold max-w-xs mx-auto">Asset management protocol is syncing repair logs with the mechanical department.</p>
                  {MAINTENANCE_LOGS.map(log => (
                    <div key={log.id} className="max-w-md mx-auto mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex justify-between text-left">
                       <div>
                          <p className="text-[10px] font-black text-white uppercase">{log.bus} · {log.type}</p>
                          <p className="text-[8px] text-slate-600 font-bold uppercase">{log.date}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-emerald-400 uppercase">{log.cost}</p>
                          <p className="text-[8px] text-slate-500 font-black uppercase">{log.outcome}</p>
                       </div>
                    </div>
                  ))}
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Sidebar Control */}
        <div className="space-y-6">
           <div className="p-8 rounded-[3rem] bg-indigo-600 shadow-2xl border border-indigo-500 relative overflow-hidden group">
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 blur-[50px] -mr-16 -mt-16" />
              <div className="relative">
                 <div className="flex items-center gap-3 text-white/80 mb-6">
                    <Zap size={20} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Panic Broadcast</span>
                 </div>
                 <p className="text-sm font-black text-white uppercase leading-tight">Emergency Fleet Override</p>
                 <p className="text-[10px] text-indigo-100 font-bold mt-2 opacity-60 italic">Send institutional SOS to all on-road drivers instantly.</p>
                 <button className="w-full mt-8 py-3.5 bg-white text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                    INITIATE BROADCAST
                 </button>
              </div>
           </div>

           <div className="p-8 rounded-[3rem] bg-[#080808] border border-white/5 space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-4">Departmental Links</h4>
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-indigo-500/20 cursor-pointer">
                    <div className="flex items-center gap-3">
                       <Droplets size={16} className="text-indigo-400" />
                       <span className="text-[10px] font-black text-slate-400 uppercase group-hover:text-white transition-colors">Fuel Depot Admin</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-800" />
                 </div>
                 <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 group hover:border-indigo-500/20 cursor-pointer">
                    <div className="flex items-center gap-3">
                       <Database size={16} className="text-indigo-400" />
                       <span className="text-[10px] font-black text-slate-400 uppercase group-hover:text-white transition-colors">Asset Inventory</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-800" />
                 </div>
              </div>
           </div>

           <div className="p-8 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/20">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Export Fleet Manifest</h4>
              <button className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 hover:text-white transition-all">
                 <Download size={14}/> Download PDF
              </button>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && <FleetModal onClose={() => setShowForm(false)} onSubmit={handleCreate} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
