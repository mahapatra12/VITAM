import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Database, ShieldAlert, Cpu, Zap } from 'lucide-react';
import Telemetry from '../../utils/telemetry';

const CommandFeed = ({ className = '', limit = 5, filter = ['INFO', 'ADVISORY', 'SECURITY', 'CRITICAL'] }) => {
  const [logs, setLogs] = useState(Telemetry.getBuffer().filter(l => filter.includes(l.level)).slice(-limit));
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleTelemetry = () => {
      setLogs(Telemetry.getBuffer().filter(l => filter.includes(l.level)).slice(-limit));
    };
    window.addEventListener('vitam_system_event', handleTelemetry);
    return () => window.removeEventListener('vitam_system_event', handleTelemetry);
  }, [limit, filter]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (level) => {
    switch (level) {
      case 'CRITICAL': return <ShieldAlert size={12} className="text-rose-500" />;
      case 'SECURITY': return <Zap size={12} className="text-blue-400" />;
      case 'ADVISORY': return <Database size={12} className="text-amber-400" />;
      default: return <Cpu size={12} className="text-slate-400" />;
    }
  };

  return (
    <div className={`p-6 bg-black/60 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group ${className}`}>
      {/* Dynamic Scan Line */}
      <div className="absolute top-0 left-0 w-full h-px bg-blue-500/10 animate-[scan-y_8s_linear_infinite] -z-10" />
      
      <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
        <div className="flex items-center gap-3">
          <Terminal size={14} className="text-blue-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Institutional Activity Log</span>
        </div>
        <div className="flex items-center gap-2.5 bg-blue-500/5 px-3 py-1 rounded-full border border-blue-500/10">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
          <span className="text-[9px] font-black text-blue-400/80 uppercase tracking-widest italic leading-none">Real-time Status Monitor</span>
        </div>
      </div>

      <div ref={scrollRef} className="h-44 overflow-y-auto space-y-3 custom-scrollbar pr-2">
        <AnimatePresence initial={false}>
          {logs.length > 0 ? logs.map((log) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-4 p-3 bg-white/[0.01] border border-white/5 rounded-2xl hover:bg-white/[0.03] transition-all duration-300"
            >
              <div className={`mt-0.5 p-2 rounded-xl bg-black/50 border border-white/10 shadow-inner`}>
                {getIcon(log.level)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest italic ${
                    log.level === 'CRITICAL' || log.level === 'SECURITY' ? 'text-blue-400' : 'text-slate-600'
                  }`}>{log.level}</span>
                  <span className="text-[9px] font-mono text-slate-800 tracking-tighter">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}</span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 leading-relaxed truncate px-1 italic">
                  {log.msg && log.msg.replace('[Sovereign OS]', '[Institutional System]')}
                </p>
              </div>
            </motion.div>
          )) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-800 space-y-4 opacity-10 group-hover:opacity-30 transition-all duration-700">
              <Terminal size={32} />
              <p className="text-[9px] font-black uppercase tracking-[0.6em] italic">System Synchronized</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommandFeed;
