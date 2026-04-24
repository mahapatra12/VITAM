import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, Sparkles, X, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { safeSessionStorage } from '../../utils/browserStorage';
import { getRuntimeProfile } from '../../utils/runtimeProfile';

const ToastContext = createContext({
  push: () => null,
  dismiss: () => {}
});

export const useToast = () => useContext(ToastContext);

const ICONS = {
  success: { Icon: CheckCircle2, color: 'text-emerald-300', badge: 'border-emerald-500/20 bg-emerald-500/10', progress: 'from-emerald-400 to-emerald-500' },
  warning: { Icon: AlertTriangle, color: 'text-amber-200', badge: 'border-amber-500/20 bg-amber-500/10', progress: 'from-amber-300 to-orange-400' },
  info: { Icon: Info, color: 'text-blue-200', badge: 'border-blue-500/20 bg-blue-500/10', progress: 'from-blue-300 to-cyan-400' },
  error: { Icon: XCircle, color: 'text-rose-200', badge: 'border-rose-500/20 bg-rose-500/10', progress: 'from-rose-300 to-rose-500' },
  system: { Icon: Sparkles, color: 'text-indigo-200', badge: 'border-indigo-500/20 bg-indigo-500/10', progress: 'from-indigo-300 to-blue-500' }
};

const ROLE_AUTO_ALERTS = {
  STUDENT: [
    { type: 'info', title: 'New Assignment', body: 'Prof. Sarah posted "Unit 4 Project" in OS Module.' },
    { type: 'success', title: 'Attendance Logged', body: 'Biometric confirmed for Slot 3 - Cloud Computing.' },
    { type: 'warning', title: 'Assignment Due Soon', body: 'DBMS Lab submission closes in 6 hours.' }
  ],
  FACULTY: [
    { type: 'info', title: '12 New Submissions', body: 'Students submitted Data Structures assignments.' },
    { type: 'success', title: 'Class Confirmed', body: 'Slot B2 timetable published for next semester.' },
    { type: 'warning', title: 'Attendance Threshold', body: '3 students below 75% - immediate action required.' }
  ],
  HOD: [
    { type: 'warning', title: 'Faculty Report Due', body: 'Monthly performance matrix required by Friday.' },
    { type: 'success', title: 'Accreditation Update', body: 'NAAC score updated to A++ across the CS department.' },
    { type: 'info', title: 'New Curriculum Draft', body: 'Academic Council posted revised syllabus v12.' }
  ],
  ADMIN: [
    { type: 'system', title: 'Server Health: Optimal', body: 'Node cluster running at 34% load. All APIs green.' },
    { type: 'warning', title: 'Login Anomaly', body: 'Unusual access attempt from external IP blocked.' },
    { type: 'success', title: 'Backup Complete', body: 'Incremental snapshot stored to cold storage.' }
  ],
  FINANCE: [
    { type: 'success', title: 'Fee Received', body: 'INR 24,500 credited from Batch 2022 (42 students).' },
    { type: 'warning', title: '18 Defaulters', body: 'Semester fee pending for 18 students. Reminder sent.' },
    { type: 'info', title: 'Payroll Processed', body: 'October salaries disbursed across all departments.' }
  ],
  CHAIRMAN: [
    { type: 'system', title: 'Executive Briefing', body: 'Weekly KPI matrix report ready for review.' },
    { type: 'success', title: 'Accreditation Passed', body: 'Institution ranked #3 in State University Rankings.' },
    { type: 'info', title: 'BOD Meeting Scheduled', body: 'Board of Directors session: Friday 11:00 AM IST.' }
  ],
  PARENT: [
    { type: 'success', title: 'Attendance Updated', body: 'Ward present for all 4 classes today.' },
    { type: 'info', title: 'Fee Receipt', body: 'Semester II fee receipt generated. Download available.' },
    { type: 'warning', title: 'Library Book Overdue', body: '"Data Structures" return deadline passed by 2 days.' }
  ]
};

const DEFAULT_ALERTS = [
  { type: 'system', title: 'Campus OS Online', body: 'All institutional nodes are active and responsive.' },
  { type: 'info', title: 'New Update Ready', body: 'VITAM OS v9.4 is available. Refresh to apply.' }
];

const AUTO_ALERT_SESSION_PREFIX = 'vitam_role_alerts::';
const TOAST_EXIT_MS = 180;

const getRoleAlertSessionKey = (role) => `${AUTO_ALERT_SESSION_PREFIX}${role}`;

const hasSeenRoleAlerts = (role) => safeSessionStorage.getItem(getRoleAlertSessionKey(role)) === '1';

const markRoleAlertsSeen = (role) => {
  safeSessionStorage.setItem(getRoleAlertSessionKey(role), '1');
};

function Toast({ toast, onDismiss }) {
  const config = ICONS[toast.type] || ICONS.info;
  const { Icon } = config;

  return (
    <div
      className={`premium-card group relative w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden p-4 sm:p-5 transition-all duration-200 ${
        toast.closing
          ? 'translate-x-6 scale-[0.96] opacity-0'
          : 'animate-toast-enter opacity-100'
      }`}
    >
      <div
        className={`absolute left-0 top-0 h-1 bg-gradient-to-r ${config.progress}`}
        style={{
          width: '100%',
          animationName: 'toast-progress-shrink',
          animationTimingFunction: 'linear',
          animationFillMode: 'forwards',
          animationDuration: `${toast.duration}ms`
        }}
      />

      <div className="relative z-10 flex items-start gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${config.badge} ${config.color}`}>
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-slate-400">
                Live update
              </p>
              <p className="mt-1 text-sm font-black text-white">
                {toast.title}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-xl border border-transparent p-1.5 text-slate-500 opacity-0 transition-all hover:border-white/10 hover:text-white group-hover:opacity-100"
            >
              <X size={13} />
            </button>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            {toast.body}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ToastProvider({ children, userRole }) {
  const auth = useAuth();
  const [toasts, setToasts] = useState([]);
  const timerIdsRef = useRef([]);
  const lastRoleRef = useRef(null);
  const resolvedRole = String(userRole || auth?.user?.subRole || auth?.user?.role || '').trim().toUpperCase() || null;

  const clearTimers = useCallback(() => {
    timerIdsRef.current.forEach((timerId) => clearTimeout(timerId));
    timerIdsRef.current = [];
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((previous) => previous.map((toast) => (
      toast.id === id ? { ...toast, closing: true } : toast
    )));

    const timeoutId = setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
    }, TOAST_EXIT_MS);
    timerIdsRef.current.push(timeoutId);
  }, []);

  const push = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const duration = toast.duration || 5000;
    setToasts((previous) => [...previous, { ...toast, id, duration, closing: false }]);
    const timeoutId = setTimeout(() => dismiss(id), duration);
    timerIdsRef.current.push(timeoutId);
    return id;
  }, [dismiss]);

  useEffect(() => () => {
    clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    if (!resolvedRole) {
      lastRoleRef.current = null;
      clearTimers();
      setToasts([]);
      return undefined;
    }

    if (lastRoleRef.current === resolvedRole) {
      return undefined;
    }

    lastRoleRef.current = resolvedRole;
    clearTimers();
    setToasts([]);

    if (hasSeenRoleAlerts(resolvedRole)) {
      return clearTimers;
    }

    const runtime = getRuntimeProfile();
    const alerts = ROLE_AUTO_ALERTS[resolvedRole] || DEFAULT_ALERTS;
    const alertsToSchedule = runtime.constrained || runtime.hidden ? alerts.slice(0, 1) : alerts;

    const scheduleAlerts = () => {
      markRoleAlertsSeen(resolvedRole);
      alertsToSchedule.forEach((alert, index) => {
        const timeoutId = setTimeout(() => push(alert), 1700 + index * 2400);
        timerIdsRef.current.push(timeoutId);
      });
    };

    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      const onVisible = () => {
        if (document.visibilityState !== 'visible') {
          return;
        }
        document.removeEventListener('visibilitychange', onVisible);
        scheduleAlerts();
      };

      document.addEventListener('visibilitychange', onVisible);
      return () => {
        document.removeEventListener('visibilitychange', onVisible);
        clearTimers();
      };
    }

    scheduleAlerts();

    return clearTimers;
  }, [resolvedRole, clearTimers, push]);

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}

      <div className="pointer-events-none fixed bottom-6 right-6 z-[9999] flex flex-col-reverse items-end gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
