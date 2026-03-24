import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bus, MapPin, Clock, Phone, Navigation, ShieldCheck,
  AlertTriangle, Search, Filter, Info, ChevronRight,
  Zap, Wind, Volume2, Wifi, Settings, Target, Map
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/ToastSystem';

const BUS_ROUTES = [
  { id: "R-01", name: "Main City Express", stops: ["Central Mall", "Clock Tower", "Station Road", "VITAM Gate 1"], eta: "12m", status: "On Time", busNo: "KA-01-VH-2024", driver: "Somesh K.", phone: "+91 98765 43210" },
  { id: "R-02", name: "Tech Park Loop", stops: ["Bannerghatta", "Electronic City", "Silk Board", "VITAM Gate 2"], eta: "5m", status: "Delayed", busNo: "KA-01-VH-2025", driver: "Manish R.", phone: "+91 98765 43211" },
  { id: "R-03", name: "Hostel Shuttle", stops: ["B-Block", "C-Block", "Mess Arena", "Academic Block"], eta: "2m", status: "On Time", busNo: "EV-SH-01", driver: "Raju B.", phone: "+91 98765 43212" },
];

function LiveMap() {
  const [buses, setBuses] = useState([
    { id: 1, x: 20, y: 30, color: 'bg-indigo-500' },
    { id: 2, x: 60, y: 70, color: 'bg-emerald-500' },
    { id: 3, x: 45, y: 45, color: 'bg-amber-500' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBuses(prev => prev.map(b => ({
        ...b,
        x: Math.min(Math.max(b.x + (Math.random() - 0.5) * 2, 5), 95),
        y: Math.min(Math.max(b.y + (Math.random() - 0.5) * 2, 5), 95),
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-video rounded-[3rem] bg-[#0c0c0c] border border-white/5 overflow-hidden group">
       <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
       
       {/* Animated Grid Lines */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white/20" />
          <div className="absolute top-0 bottom-0 left-2/4 w-px bg-white/20" />
          <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white/20" />
          <div className="absolute left-0 right-0 top-1/4 h-px bg-white/20" />
          <div className="absolute left-0 right-0 top-2/4 h-px bg-white/20" />
          <div className="absolute left-0 right-0 top-3/4 h-px bg-white/20" />
       </div>

       {/* Bus Indicators */}
       {buses.map(b => (
         <motion.div key={b.id} animate={{ left: `${b.x}%`, top: `${b.y}%` }} transition={{ duration: 2, ease: "linear" }}
           className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className={`w-4 h-4 rounded-full ${b.color} shadow-[0_0_20px_rgba(99,102,241,0.5)] border-2 border-white ring-4 ring-white/10`} />
            <div className="mt-2 px-2 py-0.5 rounded-lg bg-black/80 border border-white/10 text-[7px] font-black text-white uppercase whitespace-nowrap backdrop-blur-md">Bus {b.id}</div>
         </motion.div>
       ))}

       <div className="absolute bottom-6 left-6 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-white uppercase tracking-widest">Fleet Live (3 Active)</span>
          </div>
       </div>

       <div className="absolute top-6 right-6">
          <button className="p-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 transition-all"><Settings size={18}/></button>
       </div>
    </div>
  );
}

function RouteCard({ route, onTrack }) {
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      className="group p-6 rounded-[2.5rem] bg-[#080808] border border-white/5 hover:border-indigo-500/30 transition-all relative overflow-hidden flex flex-col">
       <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] -mr-16 -mt-16 group-hover:bg-indigo-500/10 transition-colors" />
       
       <div className="flex justify-between items-start mb-6 relative">
          <div>
             <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{route.name}</h3>
             <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mt-1">{route.id} · {route.busNo}</p>
          </div>
          <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
            route.status === 'On Time' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-500 animate-pulse'
          }`}>{route.status}</div>
       </div>

       <div className="space-y-4 flex-1">
          <div className="relative">
             <div className="absolute left-2 top-3 bottom-0 w-px border-l-2 border-dashed border-white/10" />
             {route.stops.map((stop, i) => (
                <div key={i} className="flex items-center gap-4 mb-3 relative group/stop">
                   <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 z-10 ${i === 2 ? 'bg-indigo-500 border-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-[#1a1a1a] border-slate-800'}`} />
                   <span className={`text-[10px] font-black uppercase ${i === 2 ? 'text-indigo-400' : 'text-slate-500'}`}>{stop}</span>
                   {i === 2 && <span className="ml-auto text-[8px] font-black text-indigo-500 uppercase">NEXT STOP</span>}
                </div>
             ))}
          </div>
       </div>

       <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6 relative">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-colors">
                <Clock size={18}/>
             </div>
             <div>
                <p className="text-[9px] font-black text-slate-500 uppercase">ETA</p>
                <p className="text-xl font-black text-white">{route.eta}</p>
             </div>
          </div>
          <div className="flex gap-2">
             <a href={`tel:${route.phone}`} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"><Phone size={16}/></a>
             <button onClick={() => onTrack(route.name)} className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-500/20">
                Live Track
             </button>
          </div>
       </div>
    </motion.div>
  );
}

export default function TransitService() {
  const { user } = useAuth();
  const { push } = useToast();
  const [search, setSearch] = useState('');

  const filteredRoutes = BUS_ROUTES.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));

  const handleTrack = (name) => {
    push({ type: 'info', title: 'Telemetry Uplink', body: `Broadcasting live telemetry for ${name}...` });
  };

  return (
    <DashboardLayout title="Institutional Transit" role={user?.role || 'STUDENT'}>
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
             <Bus size={28} className="text-indigo-500" /> Transit Matrix
          </h2>
          <p className="text-slate-400 mt-1">Real-time fleet tracking, institutional routes, and emergency driver support.</p>
        </div>
        <div className="flex gap-2 bg-[#080808] p-1 rounded-2xl border border-white/5 self-stretch md:self-auto overflow-x-auto">
          {['All Routes', 'City Express', 'Town Shuttle', 'Faculty Fleet'].map((t, i) => (
            <button key={t} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${i === 0 ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
         {/* Live Map Panel */}
         <div className="lg:col-span-2 space-y-6">
            <LiveMap />
            <div className="p-6 rounded-[2.5rem] bg-[#080808] border border-white/5 flex flex-wrap gap-8 items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Navigation size={24}/></div>
                  <div>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Fleet Area</p>
                     <p className="text-lg font-black text-white uppercase">South Bengaluru Outer Ring</p>
                  </div>
               </div>
               <div className="flex gap-12">
                  <div className="text-center">
                     <p className="text-2xl font-black text-white">15</p>
                     <p className="text-[9px] text-slate-600 uppercase font-black">Total Routes</p>
                  </div>
                  <div className="text-center">
                     <p className="text-2xl font-black text-emerald-400">12</p>
                     <p className="text-[9px] text-slate-600 uppercase font-black">Active Buses</p>
                  </div>
                  <div className="text-center text-red-500">
                     <p className="text-2xl font-black">01</p>
                     <p className="text-[9px] text-slate-600 uppercase font-black">Delayed</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Alerts & Schedule Sidebar */}
         <div className="space-y-6">
            <div className="p-8 rounded-[3rem] bg-amber-500 shadow-[0_20px_40px_rgba(245,158,11,0.2)] border border-amber-400 relative overflow-hidden group">
               <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-white/10 blur-[40px] rounded-full" />
               <div className="relative">
                  <div className="flex items-center gap-2 text-white mb-4">
                     <AlertTriangle size={18} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Transit Update</span>
                  </div>
                  <h4 className="text-2xl font-black text-black leading-tight uppercase tracking-tighter">Route R-02 Delay</h4>
                  <p className="text-xs font-bold text-amber-900 mt-2">Due to technical maintenance at Electronic City junction. High congestion alert.</p>
                  <button className="mt-6 w-full py-3 bg-black/10 border border-black/10 rounded-2xl text-[9px] font-black text-black uppercase tracking-[0.2em] hover:bg-black/20 transition-all">Alternative Routes</button>
               </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-[#080808] border border-white/5 space-y-6">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-4">Security Protocol</h4>
               <div className="space-y-4">
                  {[
                    { l: 'SOS Panic Link', i: Zap, c: 'text-red-500', bg: 'bg-red-500/10' },
                    { l: 'Fleet Compliance', i: ShieldCheck, c: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { l: 'Verified Drivers', i: User, c: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  ].map(p => (
                    <div key={p.l} className="flex items-center justify-between group cursor-pointer">
                       <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl ${p.bg} flex items-center justify-center ${p.c}`}><p.i size={16}/></div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{p.l}</span>
                       </div>
                       <ChevronRight size={14} className="text-slate-800 group-hover:text-white transition-colors" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-8 rounded-[3rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Wifi size={20}/></div>
                   <div>
                      <p className="text-xs font-black text-white uppercase">In-Bus WiFi</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Fleet-wide high speed 5G</p>
                   </div>
                </div>
            </div>
         </div>
      </div>

      <div className="space-y-6">
         <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Route Manifest</h3>
            <div className="relative w-full sm:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
               <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find your route number..." className="bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-xs text-white focus:outline-none w-full font-bold"/>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoutes.map(route => (
               <RouteCard key={route.id} route={route} onTrack={handleTrack} />
            ))}
            <div className="p-8 rounded-[3.5rem] bg-indigo-500/10 border border-dashed border-indigo-500/30 flex flex-col items-center justify-center text-center py-20 group cursor-pointer hover:border-indigo-500 transition-all h-full">
               <Map size={48} className="text-indigo-500/30 mb-4 group-hover:scale-110 transition-transform" />
               <h3 className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em]">Request New Stop</h3>
               <p className="text-[9px] text-slate-600 mt-2 font-bold max-w-[160px]">Suggest institutional route extensions to the Transit Board.</p>
            </div>
         </div>
      </div>
    </DashboardLayout>
  );
}
