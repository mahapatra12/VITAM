import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Users, Wrench, Coffee, CheckCircle2, XCircle,
  Clock, Search, Filter, Eye, Edit3, Trash2, X, Plus,
  ChevronRight, BarChart2, Map, ShieldAlert, Zap
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const WINGS = ["A-Block (Girls)", "B-Block (Boys)", "C-Block (Boys)", "D-Block (Staff)"];

const MOCK_ROOMS = Array.from({ length: 40 }).map((_, i) => ({
  id: `B-${301 + i}`,
  wing: "B-Block",
  floor: Math.floor(i / 10) + 1,
  occupancy: Math.floor(Math.random() * 4), // 0 to 3
  capacity: 3,
  status: Math.random() > 0.1 ? 'Normal' : 'Maintenance',
  students: Math.random() > 0.3 ? ['Rahul S', 'Aryan V', 'Deepak K'].slice(0, Math.floor(Math.random() * 4)) : []
}));

const COMPLAINTS = [
  { id: "T-001", student: "Rahul Sharma", room: "B-304", type: "Electrical", subject: "Tube light flickering", status: "In Progress", date: "21 Mar", priority: "High" },
  { id: "T-002", student: "Sneha Iyer", room: "A-102", type: "Plumbing", subject: "Water leakage", status: "Resolved", date: "15 Mar", priority: "Critical" },
  { id: "T-003", student: "Kiran Reddy", room: "B-205", type: "WiFi", subject: "No internet access", status: "Pending", date: "22 Mar", priority: "Medium" },
  { id: "T-004", student: "Aditya Singh", room: "C-410", type: "Carpentry", subject: "Table leg broken", status: "Pending", date: "22 Mar", priority: "Low" },
];

function RoomMap({ rooms, onSelect }) {
  return (
    <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
      {rooms.map(r => {
        const isFull = r.occupancy === r.capacity;
        const isEmpty = r.occupancy === 0;
        const color = r.status === 'Maintenance' ? 'bg-red-500/20 border-red-500/40 text-red-500' :
                    isFull ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' :
                    isEmpty ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
                    'bg-amber-500/20 border-amber-500/40 text-amber-400';
        return (
          <motion.div key={r.id} whileHover={{ scale: 1.05, zIndex: 10 }} onClick={() => onSelect(r)}
            className={`aspect-square rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all p-1 ${color}`}>
            <span className="text-[10px] font-black leading-none">{r.id.split('-')[1]}</span>
            <div className="flex gap-0.5 mt-1">
              {Array.from({ length: r.capacity }).map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i < r.occupancy ? 'bg-current' : 'bg-white/10'}`} />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function TicketReviewModal({ ticket, onClose, onResolve }) {
  const [remark, setRemark] = useState('');
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white">Review Complaint</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={15} /></button>
        </div>
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-white">{ticket.subject}</p>
            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${ticket.priority === 'Critical' ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]' : 'bg-white/10 text-slate-400'}`}>{ticket.priority}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[10px]">
             <div><p className="text-slate-500 uppercase font-black">Student</p><p className="text-white font-bold">{ticket.student}</p></div>
             <div><p className="text-slate-500 uppercase font-black">Room</p><p className="text-white font-bold">{ticket.room}</p></div>
          </div>
        </div>
        <div>
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Action Remarks</label>
          <textarea value={remark} onChange={e => setRemark(e.target.value)} rows={3}
            placeholder="Log technical action or warden response..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none transition-colors border-dashed" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => { onResolve(ticket.id, 'In Progress', remark); onClose(); }} className="flex-1 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500/20 transition-all">Mark In-Progress</button>
          <button onClick={() => { onResolve(ticket.id, 'Resolved', remark); onClose(); }} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">Mark Resolved ✓</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HostelAdmin() {
  const { user } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('inventory'); // inventory | complaints | mess
  const [wing, setWing] = useState(WINGS[1]);
  const [rooms] = useState(MOCK_ROOMS);
  const [complaints, setComplaints] = useState(COMPLAINTS);
  const [reviewing, setReviewing] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const stats = {
    total: rooms.length,
    occupied: rooms.reduce((s, r) => s + r.occupancy, 0),
    capacity: rooms.reduce((s, r) => s + r.capacity, 0),
    maintenance: rooms.filter(r => r.status === 'Maintenance').length,
    pendingTickets: complaints.filter(c => c.status !== 'Resolved').length
  };

  const handleStatusUpdate = (id, status, remark) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    push({ type: status === 'Resolved' ? 'success' : 'info', title: `Ticket ${status}`, body: `Complaint ${id} updated to ${status}.` });
  };

  return (
    <DashboardLayout title="Hostel Administration" role={user?.role || 'ADMIN'}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
             <ShieldAlert size={28} className="text-amber-500" /> Warden Control Center
          </h2>
          <p className="text-slate-400 mt-1">Monitor occupancy, resolve maintenance issues, and manage hostel living.</p>
        </div>
        <div className="flex gap-2">
           {['inventory', 'complaints', 'mess'].map(t => (
             <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${tab === t ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-xl' : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-white'}`}>
               {t}
             </button>
           ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { l: 'Live Occupancy', v: `${((stats.occupied / stats.capacity) * 100).toFixed(1)}%`, i: Users, c: 'text-indigo-400', b: 'bg-indigo-500/10' },
          { l: 'Active Tickets', v: stats.pendingTickets, i: Wrench, c: 'text-amber-500', b: 'bg-amber-500/10' },
          { l: 'Maint. Mode',  v: stats.maintenance, i: ShieldAlert, c: 'text-red-400', b: 'bg-red-500/10' },
          { l: 'Total Capacity', v: stats.capacity, i: Home, c: 'text-emerald-400', b: 'bg-emerald-500/10' },
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
        {/* Main Content Area */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {tab === 'inventory' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-2">
                   <div className="flex gap-2">
                      {WINGS.map(w => (
                        <button key={w} onClick={() => setWing(w)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${wing === w ? 'bg-white/10 border-white/20 text-white' : 'text-slate-500 border-white/5 hover:text-white'}`}>
                          {w.split(' ')[0]}
                        </button>
                      ))}
                   </div>
                   <div className="relative w-full sm:w-auto">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                     <input placeholder="Search Room/Student..." className="bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none w-full"/>
                   </div>
                </div>

                <div className="p-6 rounded-[2.5rem] bg-[#080808] border border-white/5 space-y-6">
                   <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-white">{wing} Inventory</h3>
                      <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest text-slate-500">
                         <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Empty</span>
                         <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"/> Available</span>
                         <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"/> Full</span>
                         <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"/> Maint.</span>
                      </div>
                   </div>
                   <RoomMap rooms={rooms} onSelect={setSelectedRoom} />
                </div>
              </motion.div>
            )}

            {tab === 'complaints' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                 <div className="p-6 rounded-[2.5rem] bg-[#080808] border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-lg font-black text-white">Maintenance Queue</h3>
                       <div className="flex gap-2">
                          {['All', 'Pending', 'In Progress', 'Resolved'].map(s => (
                            <button key={s} className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all">{s}</button>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-2">
                       {complaints.map(c => (
                         <div key={c.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-amber-500/20 transition-all">
                            <div className="flex items-center gap-4">
                               <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${c.priority === 'Critical' ? 'bg-red-500 text-white' : 'bg-white/10 text-slate-400'}`}>{c.room.split('-')[1]}</div>
                               <div>
                                  <p className="text-sm font-black text-white">{c.subject}</p>
                                  <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mt-0.5">{c.student} · {c.date} MAR</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-3">
                               <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border ${
                                 c.status === 'Resolved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                 c.status === 'In Progress' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                               }`}>{c.status}</span>
                               <button onClick={() => setReviewing(c)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-amber-500 transition-all">
                                  <ChevronRight size={16}/>
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </motion.div>
            )}

            {tab === 'mess' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="p-6 rounded-[2.5rem] bg-[#080808] border border-white/5 flex flex-col items-center justify-center text-center py-16">
                  <Coffee size={48} className="text-slate-800 mb-4" />
                  <h3 className="text-xl font-black text-white">Menu Management</h3>
                  <p className="text-slate-500 mt-2 max-w-xs text-sm">Interactive mess menu editing protocols are being synced with the Central Kitchen service.</p>
                  <button className="mt-6 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all">Launch Menu Editor Gateway</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
           {selectedRoom ? (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
               className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/20 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-black text-white">Room {selectedRoom.id}</h4>
                    <span className="text-[10px] font-black text-amber-500 uppercase">{selectedRoom.wing}</span>
                  </div>
                  <button onClick={() => setSelectedRoom(null)} className="text-slate-600 hover:text-white"><X size={16}/></button>
                </div>
                <div className="space-y-3">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Occupants ({selectedRoom.occupancy}/{selectedRoom.capacity})</p>
                   {selectedRoom.students.length > 0 ? (
                      <div className="space-y-2">
                        {selectedRoom.students.map((s, i) => (
                           <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5">
                              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-black text-[10px]">{s[0]}</div>
                              <span className="text-xs font-bold text-slate-300">{s}</span>
                           </div>
                        ))}
                      </div>
                   ) : <p className="text-xs text-slate-600 italic">No students allocated yet.</p>}
                </div>
                <div className="pt-4 border-t border-white/10 space-y-2">
                   <button className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                      <Edit3 size={12}/> Edit Allocation
                   </button>
                   <button className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedRoom.status === 'Maintenance' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-red-500/10 text-red-500 border border-red-500/30'}`}>
                      {selectedRoom.status === 'Maintenance' ? 'Reopen Room' : 'Set to Maintenance'}
                   </button>
                </div>
             </motion.div>
           ) : (
             <div className="p-6 rounded-[2rem] bg-[#080808] border border-white/5 flex flex-col items-center justify-center text-center text-slate-600 min-h-[300px]">
                <Map size={32} className="opacity-20 mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest">Select a room to view details</p>
             </div>
           )}

           <div className="p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Quick Allocation</h4>
              <div className="space-y-3">
                 <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <Plus size={16} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-slate-300 uppercase">Single Student Allocate</span>
                 </div>
                 <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <Plus size={16} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-slate-300 uppercase">Bulk Move Protocol</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {reviewing && <TicketReviewModal ticket={reviewing} onClose={() => setReviewing(null)} onResolve={handleStatusUpdate} />}
      </AnimatePresence>
    </DashboardLayout>
  );
}
