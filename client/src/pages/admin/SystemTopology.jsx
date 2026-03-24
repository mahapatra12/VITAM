import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Server, Database, Activity, Cpu, Brain, Lock, Users, ChevronRight, Zap } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';

const NODES = [
  { id: 'chairman', label: 'Chairman Node', type: 'executive', x: 50, y: 15 },
  { id: 'director', label: 'Director Core', type: 'executive', x: 25, y: 35 },
  { id: 'principal', label: 'Principal Hub', type: 'academic', x: 75, y: 35 },
  { id: 'hod', label: 'HOD Network', type: 'academic', x: 50, y: 55 },
  { id: 'faculty', label: 'Faculty Nodes (240)', type: 'academic', x: 25, y: 75 },
  { id: 'student', label: 'Student Array (8k)', type: 'users', x: 75, y: 75 },
  { id: 'admin', label: 'Root Admin', type: 'system', x: 50, y: 35 },
  { id: 'finance', label: 'Finance Engine', type: 'system', x: 10, y: 55 },
  { id: 'placement', label: 'Placement Bridge', type: 'system', x: 90, y: 55 },
  { id: 'alumni', label: 'Alumni Registry', type: 'users', x: 90, y: 85 },
  { id: 'parent', label: 'Guardian Auth', type: 'users', x: 10, y: 85 }
];

const CONNECTIONS = [
  ['chairman', 'director'], ['chairman', 'principal'], ['chairman', 'admin'],
  ['admin', 'finance'], ['admin', 'placement'], ['admin', 'hod'],
  ['director', 'hod'], ['principal', 'hod'],
  ['hod', 'faculty'], ['hod', 'student'],
  ['faculty', 'student'],
  ['finance', 'student'], ['placement', 'student'],
  ['student', 'alumni'], ['student', 'parent']
];

export default function SystemTopology() {
  const { user } = useAuth();
  const [activeNode, setActiveNode] = useState(null);
  const [pulseLine, setPulseLine] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseLine(prev => (prev + 1) % CONNECTIONS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout title="System Topology" role={user?.role || "ADMIN"}>
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
           <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
             <Network size={28} className="text-blue-500" />
             Campus Operating Grid
           </h2>
           <p className="text-slate-400 font-medium mt-1">Live representation of the 13-node multi-tenant architecture</p>
        </div>
        <div className="flex gap-2">
          <button className="px-6 py-3 bg-red-500/20 text-red-500 hover:bg-red-500/30 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all border border-red-500/30 flex items-center gap-2">
            <Server size={14}/> Stress Test
          </button>
          <button className="px-6 py-3 bg-blue-500 text-white hover:bg-blue-400 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.4)] flex items-center gap-2">
            <Zap size={14}/> Calibrate Grid
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-6 h-[700px]">
        
        {/* Topology Map */}
        <div className="lg:col-span-3 h-full">
          <GlassCard className="w-full h-full p-0 relative overflow-hidden bg-[#050505] border border-white/5 flex items-center justify-center">
            
            {/* Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
            
            {/* SVG Connections */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.3))' }}>
               {CONNECTIONS.map(([src, dst], idx) => {
                 const sourceNode = NODES.find(n => n.id === src);
                 const destNode = NODES.find(n => n.id === dst);
                 const isPulsing = idx === pulseLine;
                 
                 return (
                   <g key={`${src}-${dst}`}>
                     <line 
                       x1={`${sourceNode.x}%`} y1={`${sourceNode.y}%`} 
                       x2={`${destNode.x}%`} y2={`${destNode.y}%`} 
                       stroke="rgba(255,255,255,0.1)" strokeWidth="1" 
                     />
                     {isPulsing && (
                       <motion.circle 
                         r="3" fill="#3b82f6"
                         initial={{ cx: `${sourceNode.x}%`, cy: `${sourceNode.y}%` }}
                         animate={{ cx: `${destNode.x}%`, cy: `${destNode.y}%` }}
                         transition={{ duration: 1.5, ease: "easeInOut" }}
                         style={{ filter: 'drop-shadow(0 0 10px #3b82f6)' }}
                       />
                     )}
                   </g>
                 );
               })}
            </svg>

            {/* Render Nodes */}
            {NODES.map((node) => {
              const isActive = activeNode === node.id;
              
              let colorClasses = "bg-slate-800 text-slate-400 border-white/10";
              let glowColor = "rgba(255,255,255,0.1)";
              
              if (node.type === 'executive') { colorClasses = "bg-purple-500text-white border-purple-400"; glowColor = "rgba(168,85,247,0.4)"; }
              else if (node.type === 'system') { colorClasses = "bg-blue-500 text-white border-blue-400"; glowColor = "rgba(59,130,246,0.4)"; }
              else if (node.type === 'academic') { colorClasses = "bg-emerald-500 text-white border-emerald-400"; glowColor = "rgba(16,185,129,0.4)"; }
              
              return (
                <motion.div
                  key={node.id}
                  whileHover={{ scale: 1.1 }}
                  onHoverStart={() => setActiveNode(node.id)}
                  onHoverEnd={() => setActiveNode(null)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-10`}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-2xl transition-all duration-300 ${isActive ? 'scale-110 z-20 ' + colorClasses : 'bg-slate-900 border-white/20 text-slate-500 hover:border-white/40'}`} style={{ boxShadow: isActive ? `0 0 30px ${glowColor}` : 'none' }}>
                    {node.type === 'executive' ? <Brain size={20} /> : node.type === 'system' ? <Database size={20} /> : <Users size={20} />}
                  </div>
                  <div className={`mt-3 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all whitespace-nowrap ${isActive ? 'bg-white/10 text-white border-white/20' : 'bg-black/50 text-slate-500 border-transparent opacity-0 group-hover:opacity-100'}`}>
                    {node.label}
                  </div>
                </motion.div>
              );
            })}
          </GlassCard>
        </div>

        {/* Node Inspector */}
        <div className="lg:col-span-1 h-full">
          <GlassCard className="h-full flex flex-col">
            <div className="p-4 border-b border-white/5 flex items-center gap-3">
               <Activity size={18} className="text-blue-400" />
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Node Inspector</h3>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-center border-b border-white/5">
              {!activeNode ? (
                 <div className="text-center text-slate-500 flex flex-col items-center gap-4">
                   <Cpu size={32} className="opacity-50" />
                   <p className="text-xs font-bold uppercase tracking-widest leading-loose">Hover over a grid node to inspect real-time telemetry and throughput</p>
                 </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
                   <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 mx-auto shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                     {NODES.find(n => n.id === activeNode)?.type === 'executive' ? <Brain size={28} /> : <Database size={28} />}
                   </div>
                   
                   <h2 className="text-xl font-black text-white text-center mb-1">{NODES.find(n => n.id === activeNode)?.label}</h2>
                   <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 text-center mb-8 pb-4 border-b border-white/5">Cluster Identity: {activeNode.toUpperCase()}</p>
                   
                   <div className="space-y-4">
                     <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400 font-bold">Latency</span>
                       <span className="text-emerald-400 font-black font-mono tracking-wider">{(Math.random() * 20 + 5).toFixed(1)}ms</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400 font-bold">Active Sessions</span>
                       <span className="text-white font-black font-mono tracking-wider">{Math.floor(Math.random() * 8000 + 10)}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                       <span className="text-slate-400 font-bold">Node Health</span>
                       <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black text-[9px] uppercase tracking-widest">Optimal</span>
                     </div>
                   </div>
                </motion.div>
              )}
            </div>
            
            <div className="p-4 bg-slate-800/20">
              <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl transition-all border border-white/5">
                <Lock size={14} /> Encrypt Subnet
              </button>
            </div>
          </GlassCard>
        </div>

      </div>
    </DashboardLayout>
  );
}
