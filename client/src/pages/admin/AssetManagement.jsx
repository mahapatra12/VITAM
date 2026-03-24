import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Cpu, HardDrive, Monitor, Wrench,
  Plus, X, Search, Filter, ChevronRight,
  AlertTriangle, CheckCircle2, QrCode, Clipboard,
  BarChart2, Settings, History, Trash2, Edit3,
  Download, Printer, Landmark
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const MOCK_ASSETS = [
  { id: 'AS-1001', name: 'Workstation Pro (CSE Lab 1)', category: 'IT Hardware', status: 'Active', value: '₹65,000', purchased: 'Jan 2025', lastInspec: '12 Mar 2026', health: 'Optimal' },
  { id: 'AS-1002', name: 'Smart Projector XL', category: 'Multimedia', status: 'Under Repair', value: '₹42,000', purchased: 'Feb 2024', lastInspec: '05 Mar 2026', health: 'Degraded' },
  { id: 'AST-203', name: 'Spectrophotometer (Chem Lab)', category: 'Scientific', status: 'Active', value: '₹1,20,000', purchased: 'Dec 2024', lastInspec: '20 Feb 2026', health: 'Optimal' },
  { id: 'AST-405', name: 'HP Laserjet Enterprise', category: 'Peripherals', status: 'Maintenance', value: '₹35,000', purchased: 'Mar 2025', lastInspec: 'Today', health: 'Optimal' },
];

function AssetModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', category: 'IT Hardware', value: '', status: 'Active' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white flex items-center gap-2 uppercase tracking-widest text-sm"><Plus size={18} className="text-blue-500"/> Register New Asset</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={15} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Asset Name / Description</label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50" placeholder="e.g. Dell Precision 3660" />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Category</label>
                <select className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white uppercase font-black focus:outline-none appearance-none">
                   <option>IT Hardware</option>
                   <option>Scientific</option>
                   <option>Multimedia</option>
                   <option>Infrastructure</option>
                </select>
             </div>
             <div>
                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Estimated Value</label>
                <input value={form.value} onChange={e => setForm(f => ({...f, value: e.target.value}))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" placeholder="₹ Value" />
             </div>
          </div>
          <div>
             <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Institutional Tag (QR Placeholder)</label>
             <div className="w-full h-32 rounded-2xl bg-white/5 border border-white/10 border-dashed flex flex-col items-center justify-center text-slate-500 gap-2">
                <QrCode size={32} opacity={0.3} />
                <span className="text-[8px] font-black uppercase tracking-widest">Auto-Generating Tag...</span>
             </div>
          </div>
        </div>
        <button onClick={() => { if(form.name) { onAdd(form); onClose(); } }}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20">
          Commission Asset
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function AssetManagement() {
  const { user } = useAuth();
  const { push } = useToast();
  const [assets, setAssets] = useState(MOCK_ASSETS);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState('inventory'); // inventory | audit | maintenance
  const [search, setSearch] = useState('');

  const stats = {
    totalValue: '₹4.2 Cr',
    totalItems: '1,250+',
    maintenanceDue: 14,
    health: '94%'
  };

  const handleAdd = (form) => {
    setAssets([{ id: `AS-${Math.floor(Math.random()*9000)+1000}`, ...form, purchased: 'Now', lastInspec: 'Today', health: 'Optimal' }, ...assets]);
    push({ type: 'success', title: 'Asset Commissioned', body: `${form.name} added to the institutional ledger.` });
  };

  return (
    <DashboardLayout title="Asset Management" role={user?.role || 'ADMIN'}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
             <Package size={28} className="text-blue-500" /> institutional lifecycle
          </h2>
          <p className="text-slate-400 mt-1">Global inventory and asset governance for the VITAM 36-acre campus.</p>
        </div>
        <div className="flex gap-2">
           {['inventory', 'audit', 'maintenance'].map(t => (
             <button key={t} onClick={() => setTab(t)}
               className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${tab === t ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-xl' : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-white'}`}>
               {t}
             </button>
           ))}
        </div>
      </div>

      {/* High-Impact Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { l: 'Total Portfolio', v: stats.totalValue, i: Landmark, c: 'text-blue-400', b: 'bg-blue-500/10' },
          { l: 'Active Assets', v: stats.totalItems, i: Package, c: 'text-emerald-400', b: 'bg-emerald-500/10' },
          { l: 'Maint. Events', v: stats.maintenanceDue, i: Wrench, c: 'text-amber-500', b: 'bg-amber-500/10' },
          { l: 'Health Index', v: stats.health, i: BarChart2, c: 'text-indigo-400', b: 'bg-indigo-500/10' },
        ].map(s => (
          <div key={s.l} className="p-6 rounded-[2.5rem] bg-[#080808] border border-white/5 flex flex-col gap-4 group hover:border-blue-500/30 transition-all">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.b} ${s.c} group-hover:scale-110 transition-transform`}><s.i size={18}/></div>
             <div>
                <p className="text-2xl font-black text-white leading-none">{s.v}</p>
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-2">{s.l}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Interface */}
        <div className="lg:col-span-2 space-y-6">
           <AnimatePresence mode="wait">
              {tab === 'inventory' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                   <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="relative w-full sm:flex-1">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                         <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Asset tag, Category or Location..." className="bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none w-full font-bold uppercase tracking-tight"/>
                      </div>
                      <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 whitespace-nowrap">
                         <Plus size={16}/> Commission Asset
                      </button>
                   </div>

                   <div className="grid grid-cols-1 gap-4">
                      {assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase())).map((a, i) => (
                        <div key={a.id} className="p-6 rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 flex flex-wrap items-center justify-between gap-6 group hover:border-blue-500/30 transition-all cursor-pointer">
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/10 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                 {a.category === 'IT Hardware' ? <Cpu size={20}/> : <ArchiveIcon size={20} />}
                              </div>
                              <div>
                                 <h3 className="text-sm font-black text-white uppercase tracking-tight">{a.name}</h3>
                                 <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest">{a.category}</span>
                                    <span className="text-[8px] text-slate-700 font-black uppercase">{a.id}</span>
                                 </div>
                              </div>
                           </div>
                           
                           <div className="hidden md:flex flex-1 gap-12 px-8 border-l border-white/5">
                              <div>
                                 <p className="text-[9px] font-black text-slate-600 uppercase">Valuation</p>
                                 <p className="text-xs font-black text-emerald-400 uppercase tracking-tighter">{a.value}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-600 uppercase">Last Inspection</p>
                                 <p className="text-xs font-black text-white uppercase">{a.lastInspec}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-slate-600 uppercase">Health</p>
                                 <p className={`text-xs font-black uppercase ${a.health === 'Optimal' ? 'text-emerald-500' : 'text-orange-500'}`}>{a.health}</p>
                              </div>
                           </div>

                           <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                a.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-orange-400 bg-orange-500/10 border-orange-500/20'
                              }`}>{a.status}</span>
                              <button className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/10 transition-all"><Edit3 size={14}/></button>
                           </div>
                        </div>
                      ))}
                   </div>
                </motion.div>
              )}

              {tab === 'audit' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                   <div className="p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/5 border-dashed flex flex-col items-center justify-center text-center py-24">
                      <QrCode size={64} className="text-slate-800 mb-6" />
                      <h4 className="text-xl font-black text-white uppercase tracking-tighter">Institutional Stock Verification</h4>
                      <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">AI-Audit protocol for Q1 2026 is ready. Sync your handheld scanner or manual verify records.</p>
                      <button className="mt-8 px-8 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Initialize Audit Session</button>
                   </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
           <div className="p-8 rounded-[3rem] bg-blue-600 shadow-2xl border border-blue-500 relative overflow-hidden group h-64">
              <div className="absolute top-0 right-0 p-6 opacity-20"><Clipboard size={120} /></div>
              <div className="relative h-full flex flex-col justify-between">
                 <div>
                    <h4 className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">Audit Report</h4>
                    <p className="text-xl font-black text-white uppercase leading-tight">Total Asset Valuation Overview</p>
                 </div>
                 <button className="w-full py-3 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2">
                    <Download size={14}/> Download Ledger
                 </button>
              </div>
           </div>

           <div className="p-8 rounded-[3rem] bg-[#0a0a0a] border border-white/10 space-y-6">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-4">Departmental Breakdown</h4>
              <div className="space-y-4">
                 {[
                   { d: 'Computer Science', c: '450 Assets', p: '85%', color: 'bg-blue-500' },
                   { d: 'Mechanical Labs', c: '120 Assets', p: '30%', color: 'bg-orange-500' },
                   { d: 'Central Library', c: '2,400+ Units', p: '65%', color: 'bg-emerald-500' },
                 ].map(dep => (
                    <div key={dep.d} className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400 uppercase tracking-tighter">{dep.d}</span>
                          <span className="text-white">{dep.c}</span>
                       </div>
                       <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: dep.p }} transition={{ duration: 1.5 }} className={`h-full ${dep.color}`} />
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="p-8 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between">
              <div>
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Procurement Req.</p>
                 <p className="text-lg font-black text-white">4 Pending</p>
              </div>
              <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white"><ChevronRight size={18}/></button>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && <AssetModal onClose={() => setShowForm(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}

function ArchiveIcon({ size, opacity }) {
  return <Package size={size} opacity={opacity} />;
}
