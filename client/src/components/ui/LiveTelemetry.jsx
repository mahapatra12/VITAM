import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldAlert, Cpu, Users, BookOpen, Fingerprint } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TELEMETRY_MESSAGES = [
  { text: "Bio-metric node Alpha sync complete", icon: Fingerprint, color: "emerald" },
  { text: "AI Model detecting anomaly in attendance registry", icon: ShieldAlert, color: "amber" },
  { text: "Prof. Sarah published 'Neural Networks Phase 2'", icon: BookOpen, color: "blue" },
  { text: "78 Students entered the Library Sector", icon: Users, color: "purple" },
  { text: "Server telemetry stabilizing at 92% efficiency", icon: Activity, color: "emerald" },
  { text: "HOD approved the new Course Matrix updates", icon: Cpu, color: "blue" },
  { text: "Security alert: Multiple failed physical accesses at Lab 4", icon: ShieldAlert, color: "red" },
  { text: "Endowment deposit of ₹1.5L verified remotely", icon: Activity, color: "green" }
];

export default function LiveTelemetry() {
  const { user } = useAuth();
  const [activeToasts, setActiveToasts] = useState([]);

  useEffect(() => {
    // Only dispatch telemetry if a user is logged in
    if (!user) return;

    const interval = setInterval(() => {
      // 30% chance to dispatch an event every 5 seconds
      if (Math.random() > 0.7) {
        const randomMsg = TELEMETRY_MESSAGES[Math.floor(Math.random() * TELEMETRY_MESSAGES.length)];
        const newToast = {
          id: Date.now(),
          ...randomMsg
        };
        
        setActiveToasts(prev => [...prev.slice(-2), newToast]); // Keep max 3 on screen

        // Auto remove after 5 seconds
        setTimeout(() => {
          setActiveToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, 5000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {activeToasts.map((toast) => {
          const Icon = toast.icon;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 w-80 pointer-events-auto"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-${toast.color}-500/20 border border-${toast.color}-500/30 text-${toast.color}-400`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[9px] font-black uppercase tracking-widest text-${toast.color}-400 mb-1`}>Live Telemetry</p>
                <p className="text-xs text-white/90 font-medium truncate">{toast.text}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
