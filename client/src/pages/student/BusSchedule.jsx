import React from 'react';
import { motion } from 'framer-motion';
import { Bus, Clock, MapPin, Search, Navigation, AlertCircle, Info, Filter } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';

const BusSchedule = () => {
  const busRoutes = [
    { id: 'B01', route: 'Cuttack - VITAM', departure: '07:30 AM', arrival: '08:45 AM', status: 'ON TIME', driver: 'R. K. Nayak', phone: '+91 98765 43210' },
    { id: 'B02', route: 'Bhubaneswar (Master Canteen) - VITAM', departure: '07:00 AM', arrival: '08:45 AM', status: 'DELAYED (10m)', statusColor: 'text-amber-500', driver: 'S. Mohanty', phone: '+91 98765 43211' },
    { id: 'B03', route: 'Bhubaneswar (Patia) - VITAM', departure: '07:15 AM', arrival: '08:45 AM', status: 'ON TIME', driver: 'P. Swain', phone: '+91 98765 43212' },
    { id: 'B04', route: 'Khurda - VITAM', departure: '07:00 AM', arrival: '08:45 AM', status: 'ON TIME', driver: 'A. Das', phone: '+91 98765 43213' },
    { id: 'B05', route: 'Berhampur - VITAM', departure: '06:30 AM', arrival: '08:45 AM', status: 'ON TIME', driver: 'M. Rao', phone: '+91 98765 43214' },
  ];

  return (
    <DashboardLayout title="Institutional Logistics" role="STUDENT">
      <div className="relative min-h-screen">
        {/* Ambient background effects */}
        <div className="liquid-mesh" />
        <div className="absolute top-0 right-0 w-full h-[1000px] bg-[radial-gradient(circle_at_90%_10%,rgba(0,113,227,0.05)_0%,transparent_60%)] pointer-events-none" />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8 relative z-10 pt-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-appleBlue animate-pulse shadow-[0_0_15px_#0071e3]" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Logistics Node: Active</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter">
              Bus <span className="text-appleBlue not-italic">Schedule</span>
            </h2>
            <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[11px] italic">Institutional Transit Protocol // Phase 2.4</p>
          </div>

          <div className="flex gap-4">
            <div className="p-6 bg-white/5 border border-white/10 rounded-[30px] backdrop-blur-xl flex items-center gap-6">
               <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Transit Efficiency</p>
                  <p className="text-3xl font-black italic text-appleBlue">94.2%</p>
               </div>
               <div className="w-12 h-12 rounded-2xl bg-appleBlue/20 border border-appleBlue/20 flex items-center justify-center text-appleBlue">
                  <Navigation size={24} />
               </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 relative z-10">
           <div className="md:col-span-2 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-appleBlue transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="SEARCH ROUTES OR PICKUP POINTS..." 
                className="w-full bg-white/5 border border-white/10 rounded-full py-5 pl-16 pr-8 text-[11px] font-black tracking-widest text-white placeholder:text-white/10 focus:outline-none focus:border-appleBlue/50 focus:bg-white/[0.07] transition-all uppercase"
              />
           </div>
           <button className="flex items-center justify-center gap-4 bg-white/5 border border-white/10 rounded-full py-5 px-8 text-[11px] font-black tracking-widest text-white hover:bg-white/10 hover:border-white/20 transition-all uppercase">
              <Filter size={18} className="text-appleBlue" />
              Advanced Filters
           </button>
        </div>

        {/* Main Content: Routes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
          
          {/* Schedule Table */}
          <div className="lg:col-span-8">
            <div className="hyper-monolith p-1 bg-[#050505]/60 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="border-b border-white/5">
                           <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Route Node</th>
                           <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Temporal Offset</th>
                           <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">System Status</th>
                           <th className="p-8 text-[10px] font-black uppercase tracking-[0.3em] text-white/20 italic">Node Operator</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {busRoutes.map((bus) => (
                          <motion.tr 
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                            key={bus.id} 
                            className="group transition-colors"
                          >
                             <td className="p-8">
                                <div className="flex items-center gap-6">
                                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-appleBlue/20 group-hover:text-appleBlue transition-all">
                                      <Bus size={20} />
                                   </div>
                                   <div>
                                      <p className="text-[10px] font-black text-white/20 mb-1 uppercase tracking-widest">{bus.id}</p>
                                      <p className="text-sm font-black text-white uppercase tracking-tight">{bus.route}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="p-8">
                                <div className="flex items-center gap-4">
                                   <Clock size={16} className="text-white/20" />
                                   <div>
                                      <p className="text-xs font-black text-white">{bus.departure}</p>
                                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Institutional ETA: {bus.arrival}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="p-8">
                                <span className={`text-[10px] font-black px-4 py-2 rounded-full border ${bus.status === 'ON TIME' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'} italic uppercase tracking-widest`}>
                                   {bus.status}
                                </span>
                             </td>
                             <td className="p-8">
                                <div>
                                   <p className="text-xs font-black text-white mb-1">{bus.driver}</p>
                                   <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">{bus.phone}</p>
                                </div>
                             </td>
                          </motion.tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
          </div>

          {/* Sidebar Notifications/Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="hyper-monolith p-10 bg-appleBlue/10 border border-appleBlue/20 rounded-[40px] relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-appleBlue/10 blur-3xl -mr-16 -mt-16 group-hover:bg-appleBlue/20 transition-colors" />
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                     <AlertCircle size={24} className="text-appleBlue" />
                     <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white italic">Emergency Protocols</h4>
                  </div>
                  <p className="text-sm font-bold text-white/60 leading-relaxed mb-10 italic">
                     Technical malfunctions or delays exceeding 30 minutes must be reported to the Institutional Logistics Node immediately.
                  </p>
                  <button className="w-full py-4 bg-appleBlue text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_10px_30px_rgba(0,113,227,0.3)] hover:scale-105 transition-transform italic">
                     Contact Head dispatcher
                  </button>
               </div>
            </div>

            <div className="hyper-monolith p-10 bg-white/5 border border-white/10 rounded-[40px]">
               <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-white/40 mb-10 italic">Institutional Map</h4>
               <div className="aspect-square bg-black/40 rounded-3xl border border-white/5 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                     <MapPin size={40} className="text-appleBlue mb-6 group-hover:scale-125 transition-transform duration-700 animate-pulse" />
                     <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] italic">Real-time GPS synchronization pending node authorization...</p>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                     <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest italic">Live Feed</span>
                  </div>
               </div>
            </div>

            <div className="hyper-monolith p-10 bg-[#050505]/40 border border-white/5 rounded-[40px]">
               <div className="flex items-center gap-4 mb-6">
                  <Info size={20} className="text-white/20" />
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] italic">Transit Guidelines</p>
               </div>
               <ul className="space-y-4">
                  <li className="flex items-start gap-4">
                     <div className="w-1.5 h-1.5 rounded-full bg-appleBlue mt-1.5" />
                     <p className="text-[11px] font-bold text-white/40 leading-relaxed italic uppercase">ID verification required for node entry.</p>
                  </li>
                  <li className="flex items-start gap-4">
                     <div className="w-1.5 h-1.5 rounded-full bg-appleBlue mt-1.5" />
                     <p className="text-[11px] font-bold text-white/40 leading-relaxed italic uppercase">Arrive 5m prior to scheduled temporal offset.</p>
                  </li>
               </ul>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default BusSchedule;
