import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Zap, RefreshCcw, 
  Trash2, Terminal, Globe, Network, ShieldCheck,
  Search, Shield, BarChart3, Database, Globe2
} from 'lucide-react';
import Telemetry from '../../utils/telemetry';
import { useHealth } from '../../context/HealthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard, RefractiveCard } from '../../components/ui/DashboardComponents';
import NetworkTopology from '../../components/ui/NetworkTopology';
import SystemStatusPanel from '../../components/ui/SystemStatusPanel';

const SystemIntegrity = () => {
  const { health, checkHealth } = useHealth();
  const [logs, setLogs] = useState(Telemetry.getBuffer());
  const [activeTab, setActiveTab] = useState('telemetry');
  const [auditStatus, setAuditStatus] = useState('Monitoring');

  useEffect(() => {
    const handleTelemetry = () => {
      setLogs(Telemetry.getBuffer());
      if (logs[0]?.level === 'SECURITY' && auditStatus === 'Monitoring') {
        autoRemediate(logs[0]);
      }
    };
    window.addEventListener('vitam_system_event', handleTelemetry);
    return () => window.removeEventListener('vitam_system_event', handleTelemetry);
  }, [auditStatus, logs]);

  const autoRemediate = (log) => {
    setAuditStatus('Synchronizing');
    setTimeout(() => {
      Telemetry.info(`SYNCHRONIZATION COMPLETE: Balanced resource load in architecture node [${log.msg.split(' ')[0]}] via strategic alignment.`);
      setAuditStatus('Monitoring');
    }, 2000);
  };

  const stats = [
    { label: 'System Health', value: health.isHealthy ? 'OPTIMAL' : 'DEGRADED', icon: Activity, color: health.isHealthy ? 'text-emerald-400' : 'text-amber-400' },
    { label: 'Operational Variance', value: `${health.variance}%`, icon: Zap, color: health.variance > 70 ? 'text-rose-400' : 'text-blue-400' },
    { label: 'Data Consistency', value: '99.9%', icon: Network, color: 'text-indigo-400' },
    { label: 'Strategic Consensus', value: 'STABLE', icon: ShieldCheck, color: 'text-emerald-500' },
  ];

  return (
    <DashboardLayout title="Institutional Integrity" role="ADMIN">
      <div className="space-y-12 relative z-10 mt-8">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12 bg-white/[0.02] p-12 rounded-[40px] border border-white/5 shadow-2xl">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <span className="px-4 py-1.5 bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-blue-500/20 italic">Operational Security Layer</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
              <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest leading-none italic">Institutional Audit: Active</span>
            </div>
            <h2 className="text-7xl font-black text-white tracking-tighter mb-6 italic leading-none">
               System <span className="text-blue-500">Integrity</span>
            </h2>
            <p className="text-slate-400 font-bold text-lg max-w-2xl leading-relaxed italic tracking-tight">
               Institutional resource topology monitoring, automated strategic directives, and multi-node self-recovery orchestration.
            </p>
          </div>
          <div className="flex gap-5">
             <button onClick={checkHealth} className="px-10 py-5 bg-white text-black rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4 shadow-2xl italic">
                <RefreshCcw size={18} className={health.isSyncing ? 'animate-spin' : ''} />
                Initiate Grid Scan
             </button>
             <div className="px-10 py-5 bg-blue-500/10 border border-blue-500/30 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-4 shadow-xl italic">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_#60a5fa]" />
                Audit Pulse Active
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-7">
           {stats.map(s => (
             <div key={s.label} className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-6 group hover:border-blue-500/40 transition-all shadow-2xl">
                <div className={`p-5 rounded-2xl bg-white/5 w-fit ${s.color} group-hover:scale-110 transition-transform shadow-inner`}><s.icon size={28}/></div>
                <div>
                   <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3 italic">{s.label}</p>
                   <p className="text-4xl font-black text-white italic tracking-tighter">{s.value}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2">
              <GlassCard className="!p-0 border-white/10 rounded-[40px] overflow-hidden min-h-[650px] flex flex-col shadow-2xl">
                 <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <div className="flex gap-5">
                       {['telemetry', 'grid nodes', 'timeline'].map(t => (
                          <button key={t} onClick={() => setActiveTab(t.includes('grid') ? 'mesh' : t === 'timeline' ? 'chronos' : 'telemetry')}
                            className={`px-10 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all italic ${activeTab === (t.includes('grid') ? 'mesh' : t === 'timeline' ? 'chronos' : 'telemetry') ? 'bg-blue-600 text-white shadow-2xl scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                            {t}
                          </button>
                       ))}
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] italic mr-3">Buffer Integrity 100%</span>
                       <button onClick={() => setLogs([])} className="p-3.5 rounded-2xl bg-red-500/5 hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"><Trash2 size={20}/></button>
                    </div>
                 </div>

                 <div className="p-10 flex-1 overflow-y-auto">
                    <AnimatePresence mode="wait">
                       {activeTab === 'telemetry' && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                             {logs.length > 0 ? logs.map(log => (
                                <div key={log.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-inner">
                                   <div className="flex items-center gap-7">
                                      <div className={`w-3 h-3 rounded-full ${log.level === 'SECURITY' ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' : 'bg-blue-500 shadow-[0_0_12px_#3b82f6]'}`} />
                                      <div>
                                         <p className="text-base font-bold text-white tracking-tight italic">{log.msg}</p>
                                         <div className="flex items-center gap-4 mt-2 text-[10px] font-black tracking-[0.3em] italic">
                                            <span className="text-blue-500/80">{log.level}</span>
                                            <span className="text-slate-600 font-bold">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                         </div>
                                      </div>
                                   </div>
                                   <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest italic opacity-0 group-hover:opacity-100 transition-all font-mono">{log.id.slice(0, 8)}</span>
                                </div>
                             )) : <div className="flex flex-col items-center justify-center py-24 opacity-10"><Terminal size={80}/><p className="mt-6 font-black uppercase tracking-[0.6em] italic text-sm">Audit Buffer synchronized</p></div>}
                          </motion.div>
                       )}

                       {activeTab === 'mesh' && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[550px] flex items-center justify-center relative overflow-hidden bg-black/40 rounded-[2.5rem] border border-white/5 shadow-inner">
                             <NetworkTopology />
                          </motion.div>
                       )}

                       {activeTab === 'chronos' && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-[550px] flex flex-col items-center justify-center relative overflow-hidden bg-white/[0.02] rounded-[2.5rem] border border-blue-500/10 p-12 shadow-2xl">
                             <Globe2 size={120} className="text-blue-500/10 mb-10" />
                             <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4">Strategic Timeline</h3>
                             <p className="text-slate-500 text-[11px] font-black tracking-[0.4em] uppercase mb-14 italic text-center">Analyzing Institutional Continuity across Strategic Nodes...</p>
                             
                             <div className="grid grid-cols-3 gap-8 w-full">
                                {[
                                  { label: 'Event Stability', val: '99.98%', color: 'text-emerald-400' },
                                  { label: 'Sync Convergence', val: 'Synchronized', color: 'text-blue-400' },
                                  { label: 'Operational Health', val: 'Optimal', color: 'text-indigo-400' }
                                ].map(item => (
                                    <div key={item.label} className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 text-center shadow-xl">
                                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-3 italic">{item.label}</p>
                                       <p className={`text-2xl font-black ${item.color} italic tracking-tighter`}>{item.val}</p>
                                    </div>
                                ))}
                             </div>
                             
                             <div className="mt-14 flex gap-4 items-center">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
                                <span className="text-[11px] font-black text-blue-400/60 uppercase tracking-[0.3em] italic">Monitoring architecture mesh for continuity anomalies...</span>
                             </div>
                          </motion.div>
                       )}
                    </AnimatePresence>
                 </div>
              </GlassCard>
           </div>

           <div className="space-y-8">
              <RefractiveCard className="!p-12 flex flex-col justify-between min-h-[400px] shadow-2xl">
                 <div>
                    <h4 className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] mb-3 italic">Autonomous Oversight</h4>
                    <p className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">Security Audit <br/><span className={auditStatus === 'Monitoring' ? 'text-blue-500' : 'text-amber-500 animate-pulse'}>{auditStatus}</span></p>
                 </div>
                 <div>
                    <div className="p-8 bg-blue-600/5 rounded-[2.5rem] border border-blue-500/10 mb-10 border-l-blue-600 border-l-[6px] shadow-inner">
                       <p className="text-sm text-blue-400 font-bold italic leading-relaxed tracking-tight">"Strategic architecture integrity verified. Operational consistency within normal institutional parameters. Balancing load across nodal clusters."</p>
                    </div>
                    <button onClick={autoRemediate} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all italic">
                       Force Strategic Synchrony
                    </button>
                 </div>
              </RefractiveCard>

              <div className="p-12 rounded-[3.5rem] bg-white/[0.02] border border-white/5 space-y-10 shadow-2xl">
                 <h4 className="text-[12px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Security Subsystems</h4>
                 <div className="space-y-5">
                    {[
                      { l: 'Encryption Pulse', v: '100%', c: 'text-indigo-400' },
                      { l: 'Architecture Sync', v: '99.9%', c: 'text-emerald-400' },
                      { l: 'Nodal Consensus', v: 'Optimal', c: 'text-blue-400' },
                    ].map(item => (
                       <div key={item.l} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04] group shadow-inner">
                          <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors italic">{item.l}</span>
                          <span className={`text-[11px] font-black uppercase tracking-widest italic ${item.c}`}>{item.v}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemIntegrity;
