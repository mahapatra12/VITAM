import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, Trophy, Plus, X, Edit3, Trash2, 
  ChevronRight, BarChart2, Zap, ShieldCheck, QrCode,
  Search, Filter, MapPin, Clock, Camera, CheckCircle2,
  AlertTriangle, Target, Radio, Share2
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const MOCK_EVENTS = [
  { id: "EV-001", title: "VITAM Tech Summit 2026", date: "28 Mar", category: "Technical", registrations: 1250, attendance: 0, status: "Upcoming", budget: "₹1,20,000", color: "#4285F4" },
  { id: "EV-002", title: "Cultural Fest: Harmony", date: "05 Apr", category: "Cultural", registrations: 3200, attendance: 0, status: "Planning", budget: "₹4,50,000", color: "#E91E63" },
  { id: "EV-003", title: "Python Workshop", date: "22 Mar", category: "Workshop", registrations: 180, attendance: 156, status: "Completed", budget: "₹5,000", color: "#4CAF50" },
];

function EventModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ title: '', date: '', category: 'Technical', location: '', budget: '' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white flex items-center gap-2 uppercase tracking-widest text-sm"><Plus size={18} className="text-indigo-500"/> Orchestrate Event</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={15} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Event Title</label>
            <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50" placeholder="e.g. Annual Sports Meet" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[10px] text-white focus:outline-none" />
            </div>
            <div>
              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Budget Approval</label>
              <input value={form.budget} onChange={e => setForm(f => ({...f, budget: e.target.value}))}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none" placeholder="₹50k" />
            </div>
          </div>
          <div>
            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Global Category</label>
            <div className="grid grid-cols-3 gap-2">
              {['Technical', 'Cultural', 'Sports', 'Workshop', 'NSS'].map(c => (
                <button key={c} onClick={() => setForm(f => ({...f, category: c}))}
                  className={`py-2 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${form.category === c ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' : 'bg-white/[0.02] border-white/10 text-slate-500'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={() => { if(form.title) { onSubmit(form); onClose(); } }}
          className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]">
          Publish to Institutional Calendar
        </button>
      </motion.div>
    </motion.div>
  );
}

function ScannerSim({ onClose }) {
  const [scanned, setScanned] = useState(null);
  const handleSimulate = () => {
    setScanned({ name: "Rahul Sharma", roll: "CS2022045", time: "10:04 AM", status: "Access Granted" });
    setTimeout(() => setScanned(null), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-sm flex flex-col items-center">
        <div className="w-full relative aspect-square rounded-[3rem] border-2 border-white/10 overflow-hidden mb-8 bg-black">
           <div className="absolute inset-x-8 top-1/2 h-0.5 bg-red-500 shadow-[0_0_20px_red] animate-bounce z-10" />
           <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-indigo-500/10" />
           <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-700">
              <Camera size={48} />
              <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Digital ID QR...</p>
           </div>
           
           <AnimatePresence>
             {scanned && (
               <motion.div initial={{ y: 300 }} animate={{ y: 0 }} exit={{ y: 300 }}
                 className="absolute inset-0 bg-white p-8 flex flex-col items-center justify-center text-center z-20">
                  <CheckCircle2 size={56} className="text-emerald-500 mb-4" />
                  <h4 className="text-xl font-black text-black uppercase tracking-tighter">{scanned.name}</h4>
                  <p className="text-slate-500 text-xs font-bold uppercase">{scanned.roll} · {scanned.time}</p>
                  <p className="mt-6 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-600 text-[9px] font-black uppercase tracking-widest">{scanned.status}</p>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
        <button onClick={handleSimulate} className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
          Simulate Scan
        </button>
        <button onClick={onClose} className="mt-4 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest">Close Scanner Protocol</button>
      </motion.div>
    </motion.div>
  );
}

export default function EventAdmin() {
  const { user } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('insights'); // insights | manage | scanner
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const stats = {
    totalReg: events.reduce((s, e) => s + e.registrations, 0),
    avgAttend: "84%",
    activeClubs: 12,
    upcoming: events.filter(e => e.status !== 'Completed').length
  };

  const handleCreate = (form) => {
    setEvents([{ id: `EV-${String(events.length+1).padStart(3, '0')}`, ...form, registrations: 0, attendance: 0, status: "Upcoming", color: "#6366F1" }, ...events]);
    push({ type: 'success', title: 'Event Orchestrated', body: `${form.title} is now visible to all students.` });
  };

  return (
    <DashboardLayout title="Engagement Admin" role={user?.role || 'ADMIN'}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
             <Target size={28} className="text-indigo-500" /> Pulse Control
          </h2>
          <p className="text-slate-400 mt-1">Institutional event orchestration, club oversight, and real-time attendance tracking.</p>
        </div>
        <div className="flex gap-2">
           {['insights', 'manage', 'scanner'].map(t => (
             <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${tab === t ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500 shadow-xl' : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-white'}`}>
               {t}
             </button>
           ))}
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { l: 'Total Registration', v: stats.totalReg, i: Users, c: 'text-indigo-400', b: 'bg-indigo-500/10' },
          { l: 'Attendance Velocity', v: stats.avgAttend, i: Radio, c: 'text-emerald-400', b: 'bg-emerald-500/10' },
          { l: 'Upcoming Events', v: stats.upcoming, i: Calendar, c: 'text-amber-500', b: 'bg-amber-500/10' },
          { l: 'Budget Utilisation', v: '64%', i: Target, c: 'text-blue-400', b: 'bg-blue-500/10' },
        ].map(s => (
          <div key={s.l} className="p-5 rounded-3xl bg-[#080808] border border-white/5 flex items-center gap-4">
             <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.b} ${s.c}`}><s.i size={20}/></div>
             <div>
               <p className="text-2xl font-black text-white leading-none">{s.v}</p>
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1.5">{s.l}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <AnimatePresence mode="wait">
             {tab === 'insights' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="p-8 rounded-[3rem] bg-[#080808] border border-white/5 flex flex-col items-center justify-center text-center py-20 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32" />
                     <BarChart2 size={56} className="text-indigo-500/30 mb-6" />
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter">Engagement Analytics Protocol</h3>
                     <p className="text-slate-500 mt-2 max-w-sm text-sm font-bold">Aggregating cross-departmental involvement across Technical, Cultural, and NSS activities for the Spring Semester.</p>
                     <div className="flex gap-4 mt-8">
                        <button className="px-6 py-3 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Export Institutional Report</button>
                        <button className="px-6 py-3 bg-white/5 border border-white/10 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">Audit Engagement</button>
                     </div>
                  </div>
               </motion.div>
             )}

             {tab === 'manage' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                     <h3 className="text-lg font-black text-white uppercase tracking-widest">Active Orchestrations</h3>
                     <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 hover:border-indigo-500/30 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                        <Plus size={16}/> Create Event
                     </button>
                  </div>
                  <div className="space-y-2">
                     {events.map(e => (
                       <div key={e.id} className="p-5 rounded-[2rem] bg-[#080808] border border-white/5 flex items-center justify-between group hover:border-indigo-500/20 transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black" style={{ background: e.color }}>{e.category[0]}</div>
                             <div>
                                <h4 className="text-sm font-black text-white uppercase">{e.title}</h4>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{e.date} · Budget: {e.budget}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-6 border-l border-white/5 pl-6">
                             <div className="text-center">
                                <p className="text-[10px] font-black text-white">{e.registrations}</p>
                                <p className="text-[8px] text-slate-500 uppercase font-black">Reg</p>
                             </div>
                             <div className="text-center">
                                <p className="text-[10px] font-black text-white">{e.attendance || '-'}</p>
                                <p className="text-[8px] text-slate-500 uppercase font-black">Present</p>
                             </div>
                             <button className="p-2 rounded-xl bg-white/5 text-slate-600 hover:text-white transition-all"><Edit3 size={14}/></button>
                          </div>
                       </div>
                     ))}
                  </div>
               </motion.div>
             )}

             {tab === 'scanner' && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="p-10 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col items-center justify-center text-center">
                     <div className="relative mb-6">
                        <div className="absolute -inset-4 rounded-full border border-indigo-500/20 animate-ping" />
                        <div className="relative w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                           <QrCode size={36} />
                        </div>
                     </div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tighter">Unified Entrance Portal</h3>
                     <p className="text-slate-500 mt-2 max-w-xs text-sm font-bold">Launch the cryptographic scanner to verify student Digital IDs at entry points.</p>
                     <button onClick={() => setShowScanner(true)} className="mt-8 px-10 py-4 bg-white text-black rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-transform">
                        INITIALIZE SCANNER
                     </button>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Control Sidebar */}
        <div className="space-y-6">
           <div className="p-6 rounded-[2rem] bg-[#080808] border border-white/5">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Event Policy Engine</h4>
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-[9px] font-black text-slate-300 uppercase">Auto-Certify</span>
                    <div className="w-8 h-4 bg-emerald-500 rounded-full relative"><div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" /></div>
                 </div>
                 <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 opacity-50">
                    <span className="text-[9px] font-black text-slate-300 uppercase">Gate Lockdown</span>
                    <div className="w-8 h-4 bg-slate-800 rounded-full relative"><div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white/40 rounded-full shadow-sm" /></div>
                 </div>
              </div>
           </div>

           <div className="p-6 rounded-[2.5rem] bg-indigo-600 shadow-[0_20px_40px_rgba(79,70,229,0.3)] border border-indigo-500">
              <h4 className="text-[10px] font-black text-white/60 uppercase tracking-widest">Global Broadcast</h4>
              <div className="mt-4 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white"><Share2 size={20}/></div>
                 <div>
                    <p className="text-xs font-black text-white uppercase">App Notification</p>
                    <p className="text-[9px] text-indigo-100 font-bold opacity-60">Push to all students (2,450)</p>
                 </div>
              </div>
              <button className="w-full mt-6 py-3 bg-white text-indigo-600 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-lg">Launch Campaign</button>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && <EventModal onClose={() => setShowForm(false)} onSubmit={handleCreate} />}
        {showScanner && <ScannerSim onClose={() => setShowScanner(false)} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
