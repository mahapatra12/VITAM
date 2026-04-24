import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, TrendingUp, Globe, AlertTriangle, CheckCircle, Activity, Info, BarChart3, Database } from 'lucide-react';

const BASE_EVENTS = [
  { id: 1,  type: 'success', icon: CheckCircle,  color: 'text-emerald-500', label: 'Resource Allocation: ₹2.1Cr synchronized across branches', tag: 'FINANCE' },
  { id: 2,  type: 'warning', icon: AlertTriangle, color: 'text-amber-500',  label: 'High Resource Load: MECH Node at 78% capacity', tag: 'SYS_LOAD' },
  { id: 3,  type: 'info',    icon: Database,      color: 'text-blue-500',    label: 'Virtual Node CSE_LAB: Integrity verified (0.02ms drift)', tag: 'INFRA' },
  { id: 4,  type: 'success', icon: TrendingUp,    color: 'text-emerald-500', label: 'Enrollment Prediction: 4,250 confirmed (94% accuracy)', tag: 'ANALYTICS' },
  { id: 5,  type: 'info',    icon: Activity,      color: 'text-indigo-500',  label: 'System Consistency: 99.97% data fidelity confirmed', tag: 'SYNC' },
  { id: 6,  type: 'critical',icon: Shield,        color: 'text-rose-500',     label: 'Security Firewall: External probe blocked (SEC_NODE_7)', tag: 'SECURITY' },
  { id: 7,  type: 'success', icon: Zap,           color: 'text-blue-400',    label: 'Infrastructure Stability: 99.99% uptime maintained', tag: 'INFRA' },
  { id: 8,  type: 'info',    icon: BarChart3,     color: 'text-blue-500',    label: 'Data Sync RESEARCH↔CSE: ₹4.2Cr allocation in progress', tag: 'FINANCE' },
];

const TYPE_BG = {
  success:  'bg-emerald-500/5 border-emerald-500/10',
  warning:  'bg-amber-500/5  border-amber-500/10',
  critical: 'bg-rose-500/5     border-rose-500/10',
  info:     'bg-blue-500/5    border-blue-500/10',
};

const TAG_COLOR = {
  FINANCE:   'text-emerald-500 bg-emerald-500/10',
  SYS_LOAD:  'text-rose-500    bg-rose-500/10',
  INFRA:     'text-blue-500    bg-blue-500/10',
  ANALYTICS: 'text-amber-500   bg-amber-500/10',
  SYNC:      'text-indigo-500   bg-indigo-500/10',
  SECURITY:  'text-rose-500     bg-rose-500/10',
};

let nextId = 100;

export default function SystemAnnouncement() {
  const [events, setEvents] = useState(BASE_EVENTS.slice(0, 3));
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const template = BASE_EVENTS[Math.floor(Math.random() * BASE_EVENTS.length)];
      const newEvent = { ...template, id: nextId++, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setEvents(prev => [newEvent, ...prev].slice(0, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="fixed top-8 right-8 z-[300] w-80 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end gap-3">
        {/* Header pill */}
        <div className="flex items-center gap-3 px-4 py-2 bg-[#0c0c0c] border border-white/10 rounded-xl backdrop-blur-2xl shadow-xl w-fit">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Live System Feed</span>
          <button
            onClick={() => setIsPaused(p => !p)}
            className={`ml-1 text-[7px] font-black uppercase px-2 py-0.5 rounded-lg border transition-all ${isPaused ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-white/5 border-white/5 text-slate-600 hover:text-slate-400'}`}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>

        {/* Event cards */}
        <div className="space-y-3 w-full">
          <AnimatePresence mode="popLayout" initial={false}>
            {events.map((ev, i) => (
              <motion.div
                key={ev.id}
                layout
                initial={{ opacity: 0, x: 20, y: -10, scale: 0.95 }}
                animate={{ opacity: 1 - i * 0.15, x: 0, y: 0, scale: 1 - i * 0.02 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`flex items-start gap-4 p-4 rounded-2xl border backdrop-blur-3xl ${TYPE_BG[ev.type]} bg-[#0c0c0c]/80 shadow-lg`}
              >
                <div className={`p-2 rounded-lg bg-white/5 ${ev.color} flex-shrink-0 mt-0.5`}>
                  <ev.icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-200 leading-normal tracking-tight">{ev.label}</p>
                  <div className="flex items-center gap-2.5 mt-2">
                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-md border border-white/5 ${TAG_COLOR[ev.tag]}`}>
                      {ev.tag}
                    </span>
                    {ev.time && <span className="text-[7px] font-bold text-slate-700 uppercase tracking-tighter">{ev.time}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

