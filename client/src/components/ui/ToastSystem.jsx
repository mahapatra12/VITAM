import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, XCircle, X, Bell, Zap, Shield, TrendingUp, Users } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

const ICONS = {
  success: { Icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  warning: { Icon: AlertTriangle,  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  info:    { Icon: Info,            color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
  error:   { Icon: XCircle,         color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20' },
  system:  { Icon: Zap,             color: 'text-indigo-400',  bg: 'bg-indigo-500/10 border-indigo-500/20' },
};

// Auto-fire alerts per role to simulate a LIVE institutional system
const ROLE_AUTO_ALERTS = {
  STUDENT: [
    { type: 'info',    title: 'New Assignment',       body: 'Prof. Sarah posted "Unit 4 Project" in OS Module.' },
    { type: 'success', title: 'Attendance Logged',    body: 'Biometric confirmed for Slot 3 • Cloud Computing.' },
    { type: 'warning', title: 'Assignment Due Soon',  body: 'DBMS Lab submission closes in 6 hours.' },
  ],
  FACULTY: [
    { type: 'info',    title: '12 New Submissions',    body: 'Students submitted Data Structures assignments.' },
    { type: 'success', title: 'Class Confirmed',       body: 'Slot B2 timetable published for next semester.' },
    { type: 'warning', title: 'Attendance Threshold',  body: '3 students below 75% — immediate action required.' },
  ],
  HOD: [
    { type: 'warning', title: 'Faculty Report Due',    body: 'Monthly performance matrix required by Friday.' },
    { type: 'success', title: 'Accreditation Update',  body: 'NAAC Score updated to A++ across CS Department.' },
    { type: 'info',    title: 'New Curriculum Draft',  body: 'Academic Council posted revised syllabus v12.' },
  ],
  ADMIN: [
    { type: 'system',  title: 'Server Health: Optimal', body: 'Node cluster running at 34% load. All APIs green.' },
    { type: 'warning', title: 'Login Anomaly',          body: 'Unusual access attempt from external IP blocked.' },
    { type: 'success', title: 'Backup Complete',        body: 'Incremental snapshot stored to cold storage.' },
  ],
  FINANCE: [
    { type: 'success', title: 'Fee Received',          body: 'INR 24,500 credited from Batch 2022 (42 students).' },
    { type: 'warning', title: '18 Defaulters',         body: 'Semester fee pending for 18 students. Reminder sent.' },
    { type: 'info',    title: 'Payroll Processed',     body: 'October salaries disbursed across all departments.' },
  ],
  CHAIRMAN: [
    { type: 'system',  title: 'Executive Briefing',    body: 'Weekly KPI matrix report ready for review.' },
    { type: 'success', title: 'Accreditation Passed',  body: 'Institution ranked #3 in State University Rankings.' },
    { type: 'info',    title: 'BOD Meeting Scheduled', body: 'Board of Directors session: Friday 11:00AM IST.' },
  ],
  PARENT: [
    { type: 'success', title: 'Attendance Updated',    body: 'Ward present for all 4 classes today.' },
    { type: 'info',    title: 'Fee Receipt',           body: 'Semester II fee receipt generated. Download available.' },
    { type: 'warning', title: 'Library Book Overdue',  body: '"Data Structures" return deadline passed by 2 days.' },
  ],
};

const DEFAULT_ALERTS = [
  { type: 'system', title: 'Campus OS Online', body: 'All institutional nodes are active and responsive.' },
  { type: 'info',   title: 'New Update Ready', body: 'VITAM OS v9.4 is available. Refresh to apply.' },
];

function Toast({ toast, onDismiss }) {
  const config = ICONS[toast.type] || ICONS.info;
  const { Icon } = config;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9, transition: { duration: 0.2 } }}
      className={`relative flex items-start gap-3 p-4 rounded-2xl bg-[#080808]/95 backdrop-blur-xl border ${config.bg} shadow-[0_10px_40px_rgba(0,0,0,0.6)] w-80 max-w-[calc(100vw-2rem)] overflow-hidden group`}
    >
      {/* Progress Bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-0.5 ${config.color.replace('text-', 'bg-')}`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: toast.duration / 1000, ease: 'linear' }}
      />

      <div className={`mt-0.5 flex-shrink-0 ${config.color}`}>
        <Icon size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-white">{toast.title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{toast.body}</p>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded-lg text-slate-600 hover:text-white hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children, userRole }) {
  const [toasts, setToasts] = useState([]);
  const firedRef = useRef(false);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const push = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const duration = toast.duration || 5000;
    setToasts(prev => [...prev, { ...toast, id, duration }]);
    setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // Fire role-specific alerts automatically on mount to simulate live system
  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    const alerts = ROLE_AUTO_ALERTS[userRole] || DEFAULT_ALERTS;
    alerts.forEach((alert, i) => {
      setTimeout(() => push(alert), 1500 + i * 2200);
    });
  }, [userRole, push]);

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-3 items-end pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
