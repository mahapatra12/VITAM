import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  ShieldCheck, QrCode, Clock, MapPin, Map, CreditCard,
  User, CheckCircle2, ChevronRight, Lock, ExternalLink,
  Zap, Info, Share2, Download, Printer, Bell, Database
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const ENTRY_LOGS = [
  { id: "LOG-991", location: "Main Gate (Entry)", time: "09:12 AM", date: "Today", status: "Verified" },
  { id: "LOG-982", location: "Central Library", time: "11:45 AM", date: "Today", status: "Verified" },
  { id: "LOG-973", location: "Hostel B-Block", time: "08:30 PM", date: "Yesterday", status: "Verified" },
  { id: "LOG-964", location: "Main Gate (Exit)", time: "05:15 PM", date: "22 Mar", status: "Verified" },
];

function HolographicID({ user }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-100, 100], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-100, 100], [-15, 15]), { stiffness: 300, damping: 30 });

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="flex justify-center py-10 perspective-1000" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative w-[340px] h-[520px] rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-900 p-1 shadow-[0_50px_100px_rgba(0,0,0,0.5)] group">
        
        <div className="absolute inset-2 rounded-[2.25rem] bg-gradient-to-tr from-white/10 via-transparent to-white/10 pointer-events-none z-10 opacity-50 mix-blend-overlay group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute -inset-px rounded-[2.5rem] bg-gradient-to-br from-white/20 via-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative h-full w-full bg-[#0a0a0a] rounded-[2.25rem] overflow-hidden flex flex-col p-8 border border-white/5">
              <div className="text-right w-full">
                 <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] italic">Institutional ID</h4>
                 <p className="text-xs font-black text-white uppercase tracking-wider mt-1 italic">VITAM 2026</p>
              </div>

           <div className="flex flex-col items-center flex-1" style={{ transform: 'translateZ(60px)' }}>
              <div className="relative w-32 h-32 mb-6">
                 <div className="absolute inset-0 rounded-full bg-indigo-500 blur-2xl opacity-20 animate-pulse" />
                 <div className="absolute -inset-2 rounded-full border border-indigo-500/20 border-dashed animate-[spin_10s_linear_infinite]" />
                 <div className="relative w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl font-black text-white shadow-2xl overflow-hidden border-2 border-white/10">
                    {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name?.[0] || 'S'}
                    <motion.div initial={{ top: -100 }} animate={{ top: 200 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent shadow-[0_0_10px_white]" />
                 </div>
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1 select-none">{user?.name || 'STUDENT NAME'}</h3>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">{user?.role || 'Undergraduate'} · {user?.department || 'CSE'}</p>
           </div>

           <div className="grid grid-cols-2 gap-6 mt-6 border-t border-white/5 pt-8" style={{ transform: 'translateZ(30px)' }}>
              <div>
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Identification ID</p>
                 <p className="text-[10px] font-bold text-white uppercase tracking-widest italic">{user?.roll || 'CS-2022-001'}</p>
              </div>
              <div className="text-right">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Expiry</p>
                 <p className="text-[10px] font-bold text-white uppercase tracking-widest italic">MAY 2026</p>
              </div>
           </div>

           <div className="mt-auto pt-8 flex justify-center" style={{ transform: 'translateZ(50px)' }}>
              <div className="relative p-2 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                 <QrCode size={48} className="text-black" />
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-ping" />
              </div>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

function AccessLog() {
  return (
    <div className="p-8 rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 space-y-6">
       <div className="flex items-center justify-between mb-8">
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2 italic">
            <Clock size={16} className="text-indigo-500" /> Activity Timeline
          </h3>
          <button className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic hover:underline">View All →</button>
       </div>
       <div className="space-y-4">
          {ENTRY_LOGS.map((log, i) => (
            <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 relative group">
               {i !== ENTRY_LOGS.length - 1 && <div className="absolute left-[7px] top-6 bottom-[-20px] w-px bg-white/10" />}
               <div className={`w-4 h-4 rounded-full border-2 ${i === 0 ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-[#111] border-slate-800'}`} />
               <div className="flex-1">
                  <div className="flex items-center justify-between">
                     <p className="text-xs font-black text-white group-hover:text-indigo-400 transition-colors uppercase italic">{log.location}</p>
                     <span className="text-[9px] font-bold text-slate-600 uppercase italic tracking-widest">{log.time}</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5 italic">{log.date} · Code: {log.id}</p>
               </div>
            </motion.div>
          ))}
       </div>
    </div>
  );
}

export default function DigitalID() {
  const { user } = useAuth();
  const { push } = useToast();

  const handleAction = (act) => {
    push({ type: 'info', title: 'Institutional Identity Hub', body: `Generating ${act} protocol for secure processing...` });
  };

  return (
    <DashboardLayout title="Digital Identity" role={user?.role || 'STUDENT'}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4 italic uppercase leading-none">
            <ShieldCheck size={40} className="text-indigo-600" />
            Institutional Identity Hub
          </h2>
          <p className="text-slate-400 font-bold mt-4 max-w-2xl italic text-lg leading-relaxed">
            Your secure institutional identity with holographic verification.
          </p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => handleAction('Print')} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"><Printer size={18}/></button>
           <button onClick={() => handleAction('Download')} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"><Download size={18}/></button>
           <button onClick={() => handleAction('Share')} className="p-3 rounded-2xl bg-indigo-500 text-white shadow-lg"><Share2 size={18}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Left: 3D ID Card */}
        <div className="space-y-6">
           <HolographicID user={user} />
           <div className="flex gap-4 justify-center">
              {[
                { l: 'Gate Entry', i: MapPin, c: 'text-blue-400' },
                { l: 'Library Pass', i: Clock, c: 'text-amber-500' },
                { l: 'Mess Token', i: Database, c: 'text-emerald-400' }
              ].map(o => (
                <button key={o.l} onClick={() => handleAction(o.l)}
                  className="px-4 py-2 rounded-xl bg-[#0a0a0a] border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:border-white/20 transition-all flex items-center gap-2">
                   <o.i size={12} className={o.c} /> {o.l}
                </button>
              ))}
           </div>
        </div>

        {/* Right: Security & Activity */}
        <div className="space-y-8">
           <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6">
                 <Lock size={32} className="text-indigo-500/20 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-lg font-black text-white flex items-center gap-2 italic uppercase tracking-tighter"><Lock size={18} className="text-indigo-400"/> Security Protocol</h3>
              <p className="text-slate-500 text-xs mt-3 leading-relaxed font-black italic uppercase tracking-widest">Your Digital ID uses <span className="text-indigo-400">INSTITUTIONAL-SEC-V2</span>. The QR code automatically refreshes every 60 seconds for gate entry security. Avoid sharing screenshots of the active QR.</p>
              
              <div className="mt-8 grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-3xl bg-[#0a0a0a] border border-white/5">
                    <div className="flex items-center gap-2 text-indigo-400 mb-2">
                       <Zap size={14}/>
                       <span className="text-[9px] font-black uppercase tracking-widest">Two-Factor</span>
                    </div>
                    <p className="text-xs font-bold text-white uppercase">Enabled</p>
                 </div>
                 <div className="p-4 rounded-3xl bg-[#0a0a0a] border border-white/5">
                    <div className="flex items-center gap-2 text-indigo-400 mb-2">
                       <Database size={14}/>
                       <span className="text-[9px] font-black uppercase tracking-widest">Metadata</span>
                    </div>
                    <p className="text-xs font-bold text-white uppercase">Encrypted</p>
                 </div>
              </div>
           </div>

           <AccessLog />

           <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Info size={16}/>
                <span className="text-[10px] font-black uppercase tracking-widest">Usage Guidelines</span>
              </div>
              <ul className="space-y-2">
                {["Display ID visually at security check", "Keep phone screen brightness high for scanning", "Lost physical ID must be reported immediately", "Refreshes via institution blockchain"].map(r => (
                  <li key={r} className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-600" /> {r}
                  </li>
                ))}
              </ul>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
