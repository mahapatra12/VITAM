import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Users, Wrench, Coffee, CheckCircle2, XCircle,
  Clock, Search, Filter, Eye, Edit3, Trash2, X, Plus,
  ChevronRight, BarChart2, Map, ShieldAlert, Zap, Activity, Radar
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';
import { useHealth } from '../../context/HealthContext';
import SystemStatusPanel from '../../components/ui/SystemStatusPanel';
import Telemetry from '../../utils/telemetry';
import apiClient from '../../utils/apiClient';

const WINGS = ["A-Block (Girls)", "B-Block (Boys)", "C-Block (Boys)", "D-Block (Staff)"];

function RoomMap({ rooms, onSelect }) {
  return (
    <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
      {rooms.map(r => {
        const isFull = r.occupancy === r.capacity;
        const isEmpty = r.occupancy === 0;
        const color = r.status === 'Maintenance' ? 'bg-red-500/20 border-red-500/40 text-red-500' :
                    isFull ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' :
                    isEmpty ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
                    'bg-blue-500/20 border-blue-500/40 text-blue-400';
        return (
          <motion.div key={r.id} 
            whileHover={{ scale: 1.1, zIndex: 10 }} 
            onClick={() => onSelect(r)}
            className={`aspect-square rounded-2xl border flex flex-col items-center justify-center cursor-pointer transition-all p-1 relative group overflow-hidden ${color}`}>
            <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity ${r.status === 'Maintenance' ? 'bg-red-500 animate-pulse' : 'bg-current'}`} />
            <span className="text-[10px] font-black leading-none z-10">{r.id.split('-')[1]}</span>
            <div className="flex gap-0.5 mt-1.5 z-10">
              {Array.from({ length: r.capacity }).map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${i < r.occupancy ? 'bg-current shadow-[0_0_5px_currentColor]' : 'bg-white/10'}`} />
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
        onClick={e => e.stopPropagation()} className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] shadow-2xl p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white uppercase tracking-widest text-sm italic">Review Complaint</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all"><X size={15} /></button>
        </div>
        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-white uppercase tracking-tight">{ticket.subject}</p>
            <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase ${ticket.priority === 'Critical' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-white/10 text-slate-400'}`}>{ticket.priority}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[10px]">
             <div><p className="text-slate-500 uppercase font-black tracking-widest mb-1">Student</p><p className="text-white font-bold">{ticket.student}</p></div>
             <div><p className="text-slate-500 uppercase font-black tracking-widest mb-1">Room Node</p><p className="text-white font-bold">{ticket.room}</p></div>
          </div>
        </div>
        <div>
          <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-2">Warden Logic Pulse</label>
          <textarea value={remark} onChange={e => setRemark(e.target.value)} rows={3}
            placeholder="Log remediation vector..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-[1.5rem] px-5 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none transition-colors" />
        </div>
        <div className="flex gap-3">
          <button onClick={() => { onResolve(ticket.id, 'In Progress', remark); onClose(); }} className="flex-1 py-4 bg-white/5 border border-white/10 text-slate-400 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">Defer Pulse</button>
          <button onClick={() => { onResolve(ticket.id, 'Resolved', remark); onClose(); }} className="flex-1 py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-amber-600/20">Resolve Vector ✓</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HostelAdmin() {
  const { user } = useAuth();
  const { push } = useToast();
  const { health } = useHealth();
  const [tab, setTab] = useState('inventory'); // inventory | complaints | mess
  const [wing, setWing] = useState(WINGS[1]);
  const [rooms, setRooms] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchHostelData = async () => {
      try {
        const [roomRes, ticketRes] = await Promise.all([
          apiClient.get('/hostel/rooms'),
          apiClient.get('/hostel/complaints')
        ]);
        if (mounted) {
          setRooms(roomRes.data);
          setComplaints(ticketRes.data);
          setLoadingRooms(false);
          setLoadingComplaints(false);
        }
      } catch (err) {
        if (mounted) {
          setLoadingRooms(false);
          setLoadingComplaints(false);
        }
        push({ type: 'error', title: 'Telemetry Offline', body: 'Failed to synchronize with Hostel Grid.' });
      }
    };
    fetchHostelData();
    return () => { mounted = false; };
  }, []);

  const stats = {
    total: rooms.length,
    occupied: rooms.reduce((s, r) => s + (r.occupancy || 0), 0),
    capacity: rooms.reduce((s, r) => s + (r.capacity || 0), 0),
    maintenance: rooms.filter(r => r.status === 'Maintenance').length,
    pendingTickets: complaints.filter(c => c.status !== 'Resolved').length
  };

  const handleStatusUpdate = async (id, status, remark) => {
    try {
      await apiClient.patch(`/hostel/complaints/${id}/resolve`, { status, remark });
      setComplaints(prev => prev.map(c => c.id === id ? { ...c, status, remark } : c));
      Telemetry.remit('WARDEN', `Hostel Ticket ${id} ${status.toUpperCase()}`, { remark });
      push({ type: status === 'Resolved' ? 'success' : 'info', title: `Ticket ${status}`, body: `Complaint ${id} updated to ${status}.` });
    } catch (err) {
      push({ type: 'error', title: 'Update Failed', body: err.response?.data?.msg || err.message });
    }
  };

  return (
    <DashboardLayout title="Hostel Administration" role={user?.role || 'ADMIN'}>
      <div className="mb-12 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-[11px] font-black uppercase tracking-[0.5em] mb-5 italic ${health.variance > 40 ? 'text-amber-500' : 'text-blue-500'}`}
          >
            Institutional Presence Grid · {health.variance > 40 ? 'Variance Detected' : 'System Optimal'}
          </motion.p>
          <h2 className="text-7xl font-black text-white tracking-tighter italic mb-2 uppercase leading-none">
             Hostel <span className="text-amber-600">Governance</span>
          </h2>
          <p className="text-slate-400 font-bold mt-4 max-w-2xl italic leading-relaxed text-lg">
            Monitor real-time student occupancy, infrastructure variance, and security logic streams across all wings.
          </p>
        </div>

        <div className="flex-shrink-0">
          <SystemStatusPanel mode="CAMPUS" />
        </div>
      </div>

      <div className="flex justify-start gap-2 mb-8">
         {['inventory', 'complaints', 'mess'].map(t => (
           <button key={t} onClick={() => setTab(t)}
             className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${tab === t ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-xl' : 'bg-white/[0.02] border-white/10 text-slate-500 hover:text-white'}`}>
             {t}
           </button>
         ))}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { l: 'Presence Index', v: `${((stats.occupied / stats.capacity) * 100).toFixed(1)}%`, i: Activity, c: 'text-indigo-400', b: 'bg-indigo-500/10' },
          { l: 'Remediation Req.', v: stats.pendingTickets, i: Wrench, c: 'text-amber-500', b: 'bg-amber-500/10' },
          { l: 'Drift Nodes',  v: stats.maintenance, i: ShieldAlert, c: 'text-red-400', b: 'bg-red-500/10' },
          { l: 'Total Capacity', v: stats.capacity, i: Home, c: 'text-emerald-400', b: 'bg-emerald-500/10' },
        ].map(s => (
          <div key={s.l} className="p-6 rounded-[2.5rem] bg-[#080808] border border-white/5 flex flex-col gap-4 group hover:border-amber-500/30 transition-all cursor-pointer">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.b} ${s.c} group-hover:scale-110 transition-transform`}><s.i size={18}/></div>
             <div>
                <p className="text-2xl font-black text-white leading-none">{s.v}</p>
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-2">{s.l}</p>
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
                           className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${wing === w ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'text-slate-500 border-white/5 hover:text-white'}`}>
                           {w}
                         </button>
                      ))}
                   </div>
                   <div className="relative w-full sm:w-auto">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
                     <input placeholder="Sync Node/Student ID..." className="bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-[10px] uppercase font-black text-white focus:outline-none w-full"/>
                   </div>
                </div>

                <div className="p-8 rounded-[3rem] bg-[#080808] border border-white/5 space-y-8 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5"><Map size={150} className="text-amber-500" /></div>
                   <div className="flex items-center justify-between relative z-10">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight italic">{wing} Presence Topology</h3>
                      <div className="flex gap-4 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">
                         <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Empty</span>
                         <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"/> Nominal</span>
                         <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500"/> Saturated</span>
                         <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/> Drift</span>
                      </div>
                   </div>
                   <div className="relative z-10 min-h-[200px]">
                      {loadingRooms ? (
                         <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1c]/50 backdrop-blur-sm z-10 rounded-3xl">
                           <div className="flex flex-col items-center gap-4">
                              <Radar size={40} className="text-amber-500 animate-spin" />
                              <span className="text-[10px] uppercase font-black tracking-[0.4em] text-amber-400">Scanning Topographies</span>
                           </div>
                        </div>
                      ) : rooms.length === 0 ? (
                         <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                           <Home size={48} className="opacity-20 mb-4" />
                           <p className="text-xs uppercase font-black tracking-[0.2em]">No topological data found.</p>
                        </div>
                      ) : (
                         <RoomMap rooms={rooms.filter(r => r.wing === wing)} onSelect={setSelectedRoom} />
                      )}
                   </div>
                </div>
              </motion.div>
            )}

            {tab === 'complaints' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                 <div className="p-8 rounded-[3rem] bg-[#080808] border border-white/5">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xl font-black text-white uppercase italic">Remediation Queue</h3>
                       <div className="flex gap-2">
                          {['All', 'Critical', 'Resolved'].map(s => (
                            <button key={s} className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all">{s}</button>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-3 relative min-h-[150px]">
                       {loadingComplaints && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f1c]/50 backdrop-blur-sm z-10 rounded-3xl">
                             <div className="flex flex-col items-center gap-4">
                                <Radar size={30} className="text-amber-500 animate-spin" />
                             </div>
                          </div>
                       )}
                       {!loadingComplaints && complaints.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                             <CheckCircle2 size={36} className="opacity-20 mb-3" />
                             <p className="text-xs uppercase font-black tracking-[0.2em]">Queue Optimal. No Remediations Active.</p>
                          </div>
                       )}
                       {complaints.map(c => (
                         <div key={c.id} className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:border-amber-500/30 transition-all cursor-pointer">
                            <div className="flex items-center gap-5">
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${c.priority === 'Critical' ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-white/10 text-slate-400'}`}>{c.room.split('-')[1] || c.room}</div>
                               <div>
                                  <p className="text-sm font-black text-white uppercase tracking-tight">{c.subject}</p>
                                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mt-1">{c.student} · {c.date} · Q-{c.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                 c.status === 'Resolved' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 
                                 c.status === 'In Progress' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                               }`}>{c.status}</span>
                               <button onClick={() => setReviewing(c)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 transition-all">
                                  <ChevronRight size={18}/>
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
                <div className="p-12 rounded-[4rem] bg-[#080808] border border-white/5 border-dashed flex flex-col items-center justify-center text-center py-24">
                  <Coffee size={64} className="text-slate-800 mb-6" />
                  <h3 className="text-2xl font-black text-white uppercase italic">Sovereign Kitchen Ops</h3>
                  <p className="text-slate-500 mt-2 max-w-sm text-sm font-medium">Predictive meal-load balancing and nutritional grid monitoring is currently offline during the transition pulse.</p>
                  <button className="mt-8 px-10 py-4 bg-white text-black rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">Activate Culinary Pulse</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
           {selectedRoom ? (
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
               className="p-8 rounded-[3rem] bg-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.1)] border border-amber-400/20 space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-20"><Zap size={100} className="text-white" /></div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h4 className="text-3xl font-black text-white italic tracking-tighter">Node {selectedRoom.id}</h4>
                    <span className="text-[10px] font-black text-amber-100 uppercase tracking-widest">{selectedRoom.wing} · F-{selectedRoom.floor}</span>
                  </div>
                  <button onClick={() => setSelectedRoom(null)} className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center text-white hover:bg-black/40 transition-all"><X size={16}/></button>
                </div>
                <div className="relative z-10 space-y-4">
                   <p className="text-[10px] font-black text-amber-100 uppercase tracking-widest">Global Occupants ({selectedRoom.occupancy}/{selectedRoom.capacity})</p>
                   {selectedRoom.students.length > 0 ? (
                      <div className="space-y-2">
                        {selectedRoom.students.map((s, i) => (
                           <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-black/10 backdrop-blur-md border border-white/10 group/item hover:bg-black/20 transition-all">
                              <div className="w-10 h-10 rounded-xl bg-white text-amber-600 flex items-center justify-center font-black text-sm shadow-lg">{s[0]}</div>
                              <span className="text-sm font-black text-white uppercase tracking-tight">{s}</span>
                           </div>
                        ))}
                      </div>
                   ) : <p className="text-xs text-amber-100/50 italic font-medium">Node currently vacant. Ready for allocation.</p>}
                </div>
                <div className="relative z-10 pt-6 border-t border-white/10 space-y-3">
                   <button className="w-full py-4 bg-white text-amber-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                      <Edit3 size={14}/> Re-Sync Allocation
                   </button>
                   <button className={`w-full py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${selectedRoom.status === 'Maintenance' ? 'bg-emerald-600 text-white shadow-xl' : 'bg-red-600 text-white shadow-xl'}`}>
                      {selectedRoom.status === 'Maintenance' ? 'Restore Node Normalcy' : 'Initiate Maintenance Drift'}
                   </button>
                </div>
             </motion.div>
           ) : (
             <div className="p-12 rounded-[3.5rem] bg-[#080808] border border-white/5 flex flex-col items-center justify-center text-center text-slate-700 min-h-[400px] border-dashed">
                <Map size={48} className="opacity-10 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em]">Select presence node to initiate handshake</p>
             </div>
           )}

           <div className="p-8 rounded-[3rem] bg-indigo-600 shadow-2xl border border-indigo-500 relative overflow-hidden group">
              <div className="absolute -bottom-8 -right-8 p-4 opacity-20"><Activity size={150} className="text-white" /></div>
              <h4 className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-6 relative z-10">Presence Orchestration</h4>
              <div className="space-y-3 relative z-10">
                 <div className="p-4 rounded-[1.5rem] bg-black/10 backdrop-blur-md border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-black/20 transition-all group/btn">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-indigo-600 transition-all"><Plus size={18} /></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Single Node Allocate</span>
                 </div>
                 <div className="p-4 rounded-[1.5rem] bg-black/10 backdrop-blur-md border border-white/10 flex items-center gap-4 cursor-pointer hover:bg-black/20 transition-all group/btn">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white group-hover/btn:bg-white group-hover/btn:text-indigo-600 transition-all"><BarChart2 size={18} /></div>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Migration Sync</span>
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
