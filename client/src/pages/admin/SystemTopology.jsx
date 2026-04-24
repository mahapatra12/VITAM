import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Network, Server, Database, Activity, Cpu, Brain, Lock, Users, ChevronRight, Zap, Shield } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';
import { useAuth } from '../../context/AuthContext';
import NeuralNetBackground from '../../components/auth/NeuralNetBackground';
import NeuroWaveOverlay from '../../components/auth/NeuroWaveOverlay';
import SentinelCompanion from '../../components/auth/SentinelCompanion';
import SecurityGlobe from '../../components/auth/SecurityGlobe';
import AIDroneAvatar from '../../components/auth/AIDroneAvatar';
import NeuralHeartbeat from '../../components/auth/NeuralHeartbeat';
import RecursiveAudit from '../../components/auth/RecursiveAudit';
import { institutionalAudio } from '../../utils/InstitutionalAudio';

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

export default function SystemTopology() {
  const { user } = useAuth();
  const [activeNode, setActiveNode] = useState(null);

  return (
    <DashboardLayout title="System Topology" role={user?.role || "ADMIN"}>
      <div className="relative pb-24 font-['Outfit'] overflow-hidden">
        <NeuralNetBackground />
        <NeuroWaveOverlay />
        <AIDroneAvatar status="Secure" />
        <SentinelCompanion />
        
        <div className="mb-12 flex flex-col md:flex-row justify-between md:items-center gap-10 bg-white/[0.02] p-12 rounded-[50px] border border-white/5 shadow-2xl relative z-10 transition-all">
          <div className="flex items-center gap-10">
             <div className="w-24 h-24 rounded-[30px] overflow-hidden border border-white/5 relative bg-black/40 flex items-center justify-center p-4">
                <NeuralHeartbeat score={98} />
             </div>
             <div>
                <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Security <span className="text-blue-500">Topology</span></h2>
                <div className="flex items-center gap-4 mt-3">
                   <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.5em] italic">Topological State: Sovereign Apex</p>
                </div>
             </div>
          </div>
          <div className="flex gap-4">
            <button className="px-8 py-4 bg-red-500/10 text-red-500 hover:bg-red-500/20 font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all border border-red-500/20 italic flex items-center gap-3">
              <Server size={14}/> Stress Test
            </button>
            <button className="px-8 py-4 bg-blue-600 text-white hover:bg-blue-500 font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-[0_20px_40px_-10px_rgba(37,99,235,0.5)] italic flex items-center gap-3">
              <Zap size={14}/> Calibrate Grid
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-6 h-[700px] relative z-10">
          {/* Topology Globe */}
          <div className="lg:col-span-3 flex items-center justify-center">
             <SecurityGlobe score={98} sector="Global" />
          </div>

          {/* Node Inspector */}
          <div className="lg:col-span-1">
             <GlassCard className="h-full flex flex-col bg-black/40 border-white/5 rounded-[40px] overflow-hidden">
                <div className="p-6 border-b border-white/5 flex items-center gap-3">
                   <Activity size={18} className="text-blue-400" />
                   <h3 className="text-sm font-black text-white uppercase tracking-widest italic">Node Inspector</h3>
                </div>
                
                <div className="p-10 flex-1 flex flex-col justify-center border-b border-white/5 relative overflow-hidden">
                   <RecursiveAudit logs={[
                      { id: 'NODE_ALPHA', action: 'Subnet Sync', status: 'Optimal' },
                      { id: 'NODE_BETA', action: 'Latency Audit', status: 'Optimal' }
                   ]} />
                   
                   {!activeNode ? (
                      <div className="text-center text-slate-500 flex flex-col items-center gap-6 relative z-10">
                        <Cpu size={48} className="opacity-20 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-loose italic max-w-[200px]">Synchronizing with topological substrate... Hover over sectors for telemetry.</p>
                      </div>
                   ) : (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full relative z-10">
                         <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-8 mx-auto">
                            <Shield size={32} />
                         </div>
                         <h2 className="text-2xl font-black text-white text-center mb-1 italic tracking-tighter uppercase">{activeNode} CORE</h2>
                         <p className="text-[9px] uppercase font-bold tracking-[0.4em] text-blue-500/60 text-center mb-10 italic">Apex Sentinel Node</p>
                      </motion.div>
                   )}
                </div>
                
                <div className="p-6 bg-slate-800/10">
                   <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 rounded-2xl transition-all border border-white/5 italic">
                      <Lock size={14} /> Encrypt Subnet
                   </button>
                </div>
             </GlassCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
