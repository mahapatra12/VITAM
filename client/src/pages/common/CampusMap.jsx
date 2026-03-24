import { useState } from 'react';
import { motion } from 'framer-motion';
import { Map, Cpu, Zap, Library, Users, ShieldCheck, Search, Crosshair, ChevronRight } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';

const CAMPUS_SECTORS = [
  { id: 'admin', name: 'Executive Tower', type: 'ADMIN', color: 'from-purple-500 to-indigo-600', icon: ShieldCheck, status: 'Secured', z: 40, x: 20, y: 30, height: 120 },
  { id: 'cs', name: 'Computer Science Hub', type: 'ACADEMIC', color: 'from-blue-500 to-cyan-500', icon: Cpu, status: 'Active Class', z: 30, x: 50, y: 20, height: 80 },
  { id: 'library', name: 'Central Library', type: 'RESOURCE', color: 'from-emerald-500 to-teal-600', icon: Library, status: 'High Traffic', z: 20, x: 75, y: 45, height: 60 },
  { id: 'hostel', name: 'Student Habitation', type: 'RESIDENT', color: 'from-yellow-500 to-orange-500', icon: Users, status: 'Safe', z: 10, x: 25, y: 65, height: 50 },
  { id: 'core', name: 'AI Server Array', type: 'SYSTEM', color: 'from-red-500 to-rose-600', icon: Zap, status: 'Optimal', z: 50, x: 65, y: 75, height: 40 },
];

export default function CampusMap() {
  const { user } = useAuth();
  const [activeSector, setActiveSector] = useState(null);
  const [zoom, setZoom] = useState(1);

  return (
    <DashboardLayout title="Campus Metaverse Mapping" role={user?.role || "STUDENT"}>
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             <Map size={28} className="text-indigo-500" /> 
             Live 3D Campus Matrix
           </h2>
           <p className="text-slate-400 font-medium mt-1">Real-time isometric spatial tracking of the physical university grounds.</p>
        </div>
        <div className="flex bg-black/50 p-1 rounded-xl border border-white/10 backdrop-blur-md">
           <button onClick={() => setZoom(z => Math.max(0.6, z - 0.2))} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">-</button>
           <button onClick={() => setZoom(1)} className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 hover:text-white"><Crosshair size={14}/> Re-center</button>
           <button onClick={() => setZoom(z => Math.min(1.8, z + 0.2))} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">+</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
        {/* 3D Render Zone */}
        <div className="lg:col-span-3 h-full relative overflow-hidden rounded-3xl bg-[#020202] border border-white/10 shadow-[inner_0_0_100px_rgba(255,255,255,0.02)]">
           <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#020202] to-transparent z-20 pointer-events-none" />
           <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#020202] to-transparent z-20 pointer-events-none" />
           
           <motion.div 
             className="w-full h-full relative cursor-grab active:cursor-grabbing perspective-1000"
             animate={{ scale: zoom }}
             transition={{ type: "spring", bounce: 0, duration: 0.4 }}
           >
             {/* The Isometric Ground Plane */}
             <motion.div 
                className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-slate-900/40 rounded-[20%] border-4 border-white/5 shadow-[0_0_100px_rgba(79,70,229,0.1)] overflow-visible"
                style={{ 
                  transform: 'translate(-50%, -50%) rotateX(60deg) rotateZ(-45deg)',
                  transformStyle: 'preserve-3d',
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px'
                }}
                drag
                dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
             >
                {/* 3D Buildings */}
                {CAMPUS_SECTORS.map((sector) => {
                  const isActive = activeSector?.id === sector.id;
                  
                  return (
                    <div 
                      key={sector.id}
                      className="absolute group"
                      style={{ 
                        left: `${sector.x}%`, 
                        top: `${sector.y}%`, 
                        transformStyle: 'preserve-3d',
                        zIndex: isActive ? 100 : sector.z
                      }}
                      onMouseEnter={() => setActiveSector(sector)}
                      onMouseLeave={() => setActiveSector(null)}
                    >
                      {/* Isometric CSS Cube */}
                      <motion.div 
                        className="relative w-16 h-16 cursor-pointer"
                        style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0)' }}
                        whileHover={{ translateZ: 20 }}
                      >
                         {/* Top Face */}
                         <div className={`absolute inset-0 bg-gradient-to-br ${sector.color} border border-white/40 shadow-xl opacity-90 transition-all ${isActive ? 'opacity-100 ring-4 ring-white/20' : ''}`} style={{ transform: `translateZ(${sector.height}px)`}}>
                            <div className="w-full h-full flex flex-col items-center justify-center text-white/90">
                              <sector.icon size={20} className="drop-shadow-lg" />
                            </div>
                         </div>
                         {/* Right Face */}
                         <div className={`absolute top-0 right-0 w-[${sector.height}px] h-full bg-slate-800 border-l border-t border-white/10 opacity-80 backdrop-blur-md`} style={{ transformOrigin: 'right center', transform: `rotateY(90deg) translateZ(0) scaleX(${sector.height/64})`}} />
                         {/* Bottom Face (Front) */}
                         <div className={`absolute bottom-0 left-0 w-full h-[${sector.height}px] bg-slate-900 border-t border-l border-white/10 opacity-90 backdrop-blur-md`} style={{ transformOrigin: 'bottom center', transform: `rotateX(-90deg) translateZ(0) scaleY(${sector.height/64})`}} />
                         
                         {/* Beam of Light / Halo */}
                         {isActive && (
                            <div className={`absolute inset-0 bg-gradient-to-t ${sector.color} opacity-30 blur-xl pointer-events-none`} style={{ height: '300px', bottom: '100%', transform: `translateZ(${sector.height}px) rotateX(-90deg)` }} />
                         )}
                      </motion.div>
                    </div>
                  );
                })}
             </motion.div>
           </motion.div>

           {/* Overlay Search HUD */}
           <div className="absolute top-6 left-6 right-6 z-30">
              <div className="relative max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Locate classroom, node, or sector..." 
                  className="w-full bg-black/60 backdrop-blur-xl border border-white/10 text-white rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-indigo-500/50 shadow-2xl transition-all"
                />
              </div>
           </div>
        </div>

        {/* Sector Analytics HUD */}
        <div className="lg:col-span-1 h-full">
           <GlassCard className="h-full flex flex-col">
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Sector Inspector</h3>
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-center">
                 {!activeSector ? (
                   <div className="text-center">
                     <div className="w-16 h-16 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center mx-auto mb-4">
                       <Crosshair size={24} className="text-slate-600" />
                     </div>
                     <p className="text-xs uppercase tracking-widest font-bold text-slate-500 leading-relaxed">Hover over a 3D construct to scan spatial telemetry.</p>
                   </div>
                 ) : (
                   <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeSector.color} flex items-center justify-center text-white mb-6 border border-white/20 shadow-xl`}>
                        <activeSector.icon size={28} className="drop-shadow-lg" />
                      </div>
                      
                      <h4 className="text-2xl font-black text-white mb-2">{activeSector.name}</h4>
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Zone Classification</span>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">{activeSector.type}</span>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-500 font-bold uppercase tracking-widest">Zone Status</span>
                           <span className="text-emerald-400 font-black tracking-widest">{activeSector.status}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-500 font-bold uppercase tracking-widest">Occupancy</span>
                           <span className="text-white font-mono">{Math.floor(Math.random()*400)+15} / 900</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-500 font-bold uppercase tracking-widest">Security Clearance</span>
                           <span className="text-purple-400 font-mono">T-{(Math.floor(Math.random()*4)+1)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-500 font-bold uppercase tracking-widest">Power Draw</span>
                           <span className="text-amber-400 font-mono">{(Math.random()*15 + 2).toFixed(1)} MW</span>
                        </div>
                      </div>

                      <button className="w-full mt-10 py-3 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2">
                        View Sector CCTV <ChevronRight size={14} />
                      </button>
                   </motion.div>
                 )}
              </div>
           </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
