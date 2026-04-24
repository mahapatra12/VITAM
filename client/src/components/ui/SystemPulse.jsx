import React from 'react';
import { motion } from 'framer-motion';
import { useHealth } from '../../context/HealthContext';
import { Activity, ShieldCheck, ShieldAlert, Cpu, Database, RefreshCw } from 'lucide-react';

const SystemPulse = ({ className = "" }) => {
    const { health } = useHealth();
    const { services, isHealthy, pendingSyncCount, isSyncing } = health;

    const getStatusColor = (status) => {
        if (status === 'ready' || status === 'healthy') return 'text-emerald-400 group-hover:text-emerald-300';
        if (status === 'degraded' || status === 'connecting') return 'text-amber-400 group-hover:text-amber-300';
        return 'text-red-500 group-hover:text-red-400';
    };

    return (
        <div className={`group flex flex-col items-end gap-2 p-3 bg-black/40 border border-white/5 backdrop-blur-md rounded-xl transition-all hover:bg-white/5 hover:border-white/10 ${className}`}>
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                        {health.variance > 0 && (
                            <span className={`text-[9px] font-black px-1.5 py-0.5 border rounded uppercase italic ${health.variance > 70 ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                                V:{health.variance}%
                            </span>
                        )}
                        <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] leading-none font-black italic">Institutional Sync</span>
                    </div>
                    <span className={`text-[11px] font-bold uppercase tracking-widest leading-none mt-1 italic ${isHealthy ? 'text-emerald-400' : 'text-rose-500 animate-pulse'}`}>
                        {isHealthy ? 'SYNC_OPTIMAL' : 'VAR_RECORDED'}
                    </span>
                </div>
                
                <div className="relative">
                    {(isSyncing || pendingSyncCount > 0) && (
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="absolute -inset-1 border border-blue-500/30 rounded-full blur-[1px]"
                        />
                    )}
                    <motion.div
                        animate={{
                            scale: isHealthy ? [1, 1.2, 1] : [1, 1.4, 1],
                            opacity: isHealthy ? [0.3, 0.6, 0.3] : [0.5, 0.8, 0.5],
                        }}
                        transition={{ duration: isHealthy ? 2 : 0.8, repeat: Infinity }}
                        className={`absolute inset-0 rounded-full blur-md ${isHealthy ? 'bg-emerald-500/30' : 'bg-red-500/50'}`}
                    />
                    <div className={`w-3 h-3 rounded-full border border-white/20 shadow-lg relative z-10 ${isHealthy ? 'bg-emerald-500' : 'bg-red-600'}`} />
                </div>
            </div>

            <div className="flex items-center gap-3 pt-1 border-t border-white/5">
                {(isSyncing || pendingSyncCount > 0) && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                        <RefreshCw className={`w-2.5 h-2.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span className="text-[9px] font-black text-blue-300 uppercase tracking-widest">{pendingSyncCount}</span>
                    </div>
                )}
                <div className="flex gap-2.5 opacity-50 group-hover:opacity-100 transition-opacity">
                    <StatusIcon icon={Database} status={services.db} color={getStatusColor(services.db)} label="DB NODE" />
                    <StatusIcon icon={Cpu} status={services.ai} color={getStatusColor(services.ai)} label="AI NODE" />
                    <StatusIcon icon={Activity} status={services.server} color={getStatusColor(services.server)} label="GS NODE" />
                </div>
            </div>
        </div>
    );
};

const StatusIcon = ({ icon: Icon, status, color, label }) => (
    <div className={`relative transition-colors duration-300 ${color}`} title={`${label}: ${status}`}>
        <Icon className="w-3 h-3" />
        {status !== 'ready' && status !== 'healthy' && (
            <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-current rounded-full blur-[2px]"
            />
        )}
    </div>
);

export default SystemPulse;
