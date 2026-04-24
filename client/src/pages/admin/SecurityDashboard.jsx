import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Activity, 
  Zap, 
  Lock, 
  Terminal, 
  AlertTriangle, 
  CheckCircle, 
  Cpu, 
  Globe, 
  Database,
  History,
  Trash2,
  RefreshCcw,
  ShieldAlert,
  Search,
  FileSearch,
  Shield
} from 'lucide-react';
import Telemetry from '../../utils/telemetry';
import { useHealth } from '../../context/HealthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { GlassCard } from '../../components/ui/DashboardComponents';

const SecurityDashboard = () => {
  const { health, checkHealth } = useHealth();
  const [logs, setLogs] = useState(Telemetry.getBuffer());
  const [activeTab, setActiveTab] = useState('telemetry');

  useEffect(() => {
    const handleTelemetry = () => {
      setLogs(Telemetry.getBuffer());
    };
    window.addEventListener('vitam_telemetry_event', handleTelemetry);
    return () => window.removeEventListener('vitam_telemetry_event', handleTelemetry);
  }, []);

  const stats = [
    { label: 'System Health', value: health.isHealthy ? 'OPTIMAL' : 'DEGRADED', icon: Activity, color: health.isHealthy ? 'text-emerald-400' : 'text-amber-400' },
    { label: 'Security Status', value: health.isLockdown ? 'RESTRICTED' : 'STANDARD', icon: ShieldCheck, color: health.isLockdown ? 'text-rose-500' : 'text-blue-500' },
    { label: 'Pending Syncs', value: `${health.pendingSyncCount} Tasks`, icon: Database, color: 'text-indigo-400' },
    { label: 'System Risk Score', value: `${health.entropy}%`, icon: Zap, color: health.entropy > 70 ? 'text-rose-500' : 'text-blue-400' },
  ];

  return (
    <DashboardLayout title="Security Operations" role="ADMIN">
      <div className="space-y-10 mt-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500">
                <Shield size={20} />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">
                Security Operations Center
              </h1>
            </div>
            <p className="text-slate-500 text-sm font-bold tracking-wide italic">
              Automated Monitoring • Predictive Risk Assessment • Automated Response
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={checkHealth}
              className="px-6 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-3 text-white"
            >
              <RefreshCcw size={14} className={health.isSyncing ? 'animate-spin' : ''} />
              Refresh Security State
            </button>
            <div className="px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Monitoring Active
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div 
              key={i}
              className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl group hover:border-blue-500/20 transition-all"
            >
              <div className="flex items-center justify-between mb-5">
                <div className={`p-3 rounded-xl bg-white/5 ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon size={20} />
                </div>
                <div className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic leading-none">Live Stream</div>
              </div>
              <div className="text-2xl font-black tracking-tighter text-white mb-1 uppercase italic">{stat.value}</div>
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Activity Log */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-[40px] overflow-hidden flex flex-col h-[650px] shadow-2xl">
              <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveTab('telemetry')}
                    className={`text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all ${activeTab === 'telemetry' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                  >
                    Security Activity
                  </button>
                  <button 
                    onClick={() => setActiveTab('audit')}
                    className={`text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all ${activeTab === 'audit' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                  >
                    System Archives
                  </button>
                </div>
                <button 
                  onClick={() => Telemetry.clearBuffer()}
                  className="p-2.5 hover:bg-rose-500/10 text-slate-600 hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="p-8 flex-1 overflow-y-auto space-y-4">
                <AnimatePresence initial={false}>
                  {logs.length > 0 ? logs.map((log) => (
                    <motion.div 
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl group hover:border-blue-500/20 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-5">
                          <div className={`mt-1.5 w-2 h-2 rounded-full ${
                            log.level === 'CRITICAL' || log.level === 'SENTINEL' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 
                            log.level === 'WARDEN' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-blue-500 shadow-[0_0_10px_#3b82f6]'
                          }`} />
                          <div>
                            <div className="flex items-center gap-3 mb-1.5">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">{log.level}</span>
                              <span className="text-[10px] font-bold text-slate-700 italic">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div className="text-sm font-bold text-slate-300 tracking-tight">{log.msg}</div>
                            {log.detail && (
                              <pre className="mt-4 p-4 bg-black/50 rounded-xl text-[10px] font-mono text-slate-500 border border-white/5 overflow-x-auto">
                                {JSON.stringify(log.detail, null, 2)}
                              </pre>
                            )}
                          </div>
                        </div>
                        <div className="text-[9px] font-black text-slate-800 uppercase tracking-widest italic">{log.id}</div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-6 opacity-30">
                      <FileSearch size={60} />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Active Threats Detected</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Sidebar Widgets */}
          <div className="space-y-8">
            
            {/* Network Subsystems */}
            <div className="bg-white/[0.02] border border-white/10 p-8 rounded-[40px] space-y-8 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 flex items-center gap-3 italic">
                <Globe size={16} className="text-blue-500" />
                Connectivity Nodes
              </h3>
              <div className="space-y-4">
                {Object.entries(health.services).map(([name, status], i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${status === 'ready' || status === 'connected' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                        {name === 'db' ? <Database size={16} /> : name === 'ai' ? <Cpu size={16} /> : <Globe size={16} />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tight text-slate-400">{name} Subsystem</span>
                    </div>
                    <div className={`text-[8px] font-black uppercase tracking-[0.2em] ${status === 'ready' || status === 'connected' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Response Box */}
            <div className="p-10 rounded-[40px] bg-blue-600 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-20 scale-150 rotate-12 group-hover:scale-110 transition-transform duration-700">
                <ShieldAlert size={120} className="text-white" />
              </div>
              <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 mb-6 flex items-center gap-3 italic leading-none">
                  <AlertTriangle size={16} />
                  Security Insights
                </h3>
                <p className="text-sm text-blue-50 text-white font-bold italic leading-relaxed mb-8">
                  Security Operations has audited {logs.length} transactions today. 
                  {health.entropy > 50 ? ' Strategic risk detected due to resource imbalance. Engaging proactive synchronization is recommended.' : ' System integrity verified within standard institutional parameters.'}
                </p>
                <button className="w-full py-5 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl hover:scale-[1.03] active:scale-95">
                  Engage Full System Sync
                </button>
              </div>
            </div>

            {/* Version Trace */}
            <div className="text-center p-6 border border-white/5 rounded-3xl bg-white/[0.01]">
              <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.5em] italic">
                VITAM CORE SYSTEM v13.0.4 • ANALYTICS BASE
              </p>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SecurityDashboard;

