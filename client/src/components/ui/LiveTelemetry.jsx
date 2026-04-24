import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, Cpu, Users, BookOpen, Fingerprint } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TELEMETRY_MESSAGES = [
  { text: 'Identification verification: Authorized entrance', icon: Fingerprint, color: 'emerald' },
  { text: 'System Analytics: Detected variance in attendance logs', icon: ShieldAlert, color: 'amber' },
  { text: 'Authorized Faculty: Published Advanced Systems Curriculum', icon: BookOpen, color: 'blue' },
  { text: 'Resource Library: Occupancy threshold reached', icon: Users, color: 'purple' },
  { text: 'Infrastructure Cluster: Efficiency optimized at 92%', icon: Activity, color: 'emerald' },
  { text: 'HOD: Authorized departmental course matrix update', icon: Cpu, color: 'blue' },
  { text: 'System Advisory: Multiple unauthorized access attempts at Lab 4', icon: ShieldAlert, color: 'red' },
  { text: 'Financial Verification: Institutional deposit confirmed', icon: Activity, color: 'green' }
];

const COLOR_STYLES = {
  emerald: {
    shell: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
    label: 'text-emerald-400'
  },
  amber: {
    shell: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    label: 'text-amber-400'
  },
  blue: {
    shell: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    label: 'text-blue-400'
  },
  purple: {
    shell: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    label: 'text-purple-400'
  },
  red: {
    shell: 'bg-red-500/20 border-red-500/30 text-red-400',
    label: 'text-red-400'
  },
  green: {
    shell: 'bg-green-500/20 border-green-500/30 text-green-400',
    label: 'text-green-400'
  }
};

export default function LiveTelemetry() {
  const { user } = useAuth();
  const [activeToasts, setActiveToasts] = useState([]);
  const timeoutIdsRef = useRef([]);

  useEffect(() => () => {
    timeoutIdsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
    timeoutIdsRef.current = [];
  }, []);

  useEffect(() => {
    if (!user) {
      setActiveToasts([]);
      timeoutIdsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutIdsRef.current = [];
      return undefined;
    }

    const interval = setInterval(() => {
      if (Math.random() <= 0.7) {
        return;
      }

      const randomMsg = TELEMETRY_MESSAGES[Math.floor(Math.random() * TELEMETRY_MESSAGES.length)];
      const newToast = {
        id: Date.now(),
        ...randomMsg
      };

      setActiveToasts((prev) => [...prev.slice(-2), newToast]);

      const timeoutId = setTimeout(() => {
        setActiveToasts((prev) => prev.filter((toast) => toast.id !== newToast.id));
      }, 5000);

      timeoutIdsRef.current.push(timeoutId);
    }, 5000);

    return () => {
      clearInterval(interval);
      timeoutIdsRef.current.forEach((timeoutId) => clearTimeout(timeoutId));
      timeoutIdsRef.current = [];
    };
  }, [user]);

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {activeToasts.map((toast) => {
          const Icon = toast.icon;
          const tone = COLOR_STYLES[toast.color] || COLOR_STYLES.blue;

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 w-80 pointer-events-auto"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${tone.shell}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 italic ${tone.label}`}>Institutional Activity</p>
                <p className="text-xs text-white/90 font-bold italic truncate">{toast.text}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
