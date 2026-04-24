import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, Settings, BookOpen, Shield, Cpu, Bus, X, ArrowRight, User, Sparkles, Zap, Activity, Globe } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessPath, getDashboardPathForUser, normalizeRole } from '../utils/routing';
import { prefetchRoutePath } from '../utils/routePrefetch';
import { announceNavigationStart } from '../utils/navigationSignals';

const BASE_ACTIONS = [
  { id: 'dash-exam', label: 'Go to Exam Results', icon: Settings, route: '/admin/exam-results', category: 'Operational' },
  { id: 'dash-bus', label: 'Go to Transit Control', icon: Bus, route: '/admin/transit', category: 'Operational' },
  { id: 'action-search', label: 'Open Staff Directory', icon: Users, route: '/directory', category: 'Management' },
  { id: 'action-security', label: 'Open Security Center', icon: Shield, route: '/security', category: 'Security' },
  { id: 'action-profile', label: 'Open My Profile', icon: User, route: '/profile', category: 'Personal' },
];

const AI_DIRECTIVES = [
  { id: 'ai-audit', label: 'Run Predictive Performance Audit', icon: Sparkles, route: '#', isAI: true, description: 'AI-driven institutional health check' },
  { id: 'ai-sync', label: 'Optimize Resource Node Latency', icon: Zap, route: '#', isAI: true, description: 'Autonomous infrastructure rebalancing' },
  { id: 'ai-health', label: 'Check Campus Synchronization', icon: Activity, route: '#', isAI: true, description: 'Real-time telemetry verification' },
];

const DASHBOARD_ACTION_META = {
  chairman: { label: 'Go to Chairman Dashboard', icon: Globe },
  director: { label: 'Go to Director Dashboard', icon: Globe },
  admin: { label: 'Go to Admin Dashboard', icon: Globe },
  hod: { label: 'Go to HOD Dashboard', icon: Globe },
  faculty: { label: 'Go to Faculty Dashboard', icon: BookOpen },
  student: { label: 'Go to Student Dashboard', icon: Cpu },
};

export default function CommandPalette({ isOpen, onClose }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const actions = useMemo(() => {
    const role = normalizeRole(user?.subRole === 'hod' ? 'hod' : user?.role);
    const dashboardMeta = DASHBOARD_ACTION_META[role] || { label: 'Go to My Dashboard', icon: Globe };

    return [
      {
        id: 'dash-home',
        label: dashboardMeta.label,
        icon: dashboardMeta.icon,
        route: getDashboardPathForUser(user),
        category: 'Navigation'
      },
      ...AI_DIRECTIVES,
      ...BASE_ACTIONS,
    ].filter((action) => action.isAI || canAccessPath(user, action.route));
  }, [user]);

  const filtered = useMemo(() => {
    return actions.filter((action) => 
      action.label.toLowerCase().includes(query.toLowerCase()) ||
      (action.category && action.category.toLowerCase().includes(query.toLowerCase()))
    );
  }, [actions, query]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex(prev => Math.min(prev, Math.max(0, filtered.length - 1)));
  }, [filtered, isOpen]);

  const handleClose = () => {
    setQuery('');
    setActiveIndex(0);
    onClose();
  };

  const handleSelect = (action) => {
    if (!action) return;
    if (action.isAI) {
       window.dispatchEvent(new CustomEvent('vitam:ai-directive', { detail: action }));
       handleClose();
       return;
    }
    if (action.route && action.route !== location.pathname) {
      announceNavigationStart({ path: action.route, source: 'command-palette' });
      void prefetchRoutePath(action.route, user, { mode: 'navigation' });
    }
    navigate(action.route);
    handleClose();
  };

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
      if (filtered.length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelect(filtered[activeIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, filtered, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 font-['Poppins']">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -20 }}
            className="w-full max-w-2xl glass-card bg-[#0f2027]/80 backdrop-blur-3xl border-white/10 shadow-2xl relative z-10 flex flex-col overflow-hidden"
          >
            <div className="flex items-center px-6 py-5 border-b border-white/5">
              <Search size={22} className="text-[#00c6ff] mr-4" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                placeholder="Neural Input Engine (Search or Command)..."
                className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-white/20 font-semibold"
              />
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#00c6ff] animate-pulse shadow-[0_0_8px_#00c6ff]" />
                 <span className="text-[10px] font-black uppercase text-[#00c6ff]/60 tracking-widest">Neural Link Active</span>
              </div>
            </div>

            <div className="max-h-[450px] overflow-y-auto p-3 custom-scrollbar">
              {filtered.length > 0 ? (
                filtered.map((action, index) => (
                  <button
                    key={action.id}
                    onClick={() => handleSelect(action)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl group transition-all text-left outline-none mb-1 ${
                      index === activeIndex 
                      ? 'bg-white/10 border-white/10 shadow-lg' 
                      : 'hover:bg-white/[0.03] border-transparent'
                    } border`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        index === activeIndex 
                        ? 'bg-[#00c6ff] text-white shadow-lg shadow-[#00c6ff]/20' 
                        : 'bg-white/5 text-white/40 group-hover:text-white group-hover:bg-white/10'
                      }`}>
                        <action.icon size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[13px] font-bold transition-colors italic ${
                          index === activeIndex ? 'text-white' : 'text-white/60 group-hover:text-white'
                        }`}>
                          {action.label}
                        </p>
                        {action.description ? (
                           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#00c6ff]/50 mt-1">{action.description}</p>
                        ) : (
                           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mt-1">{action.category || 'System'}</p>
                        )}
                      </div>
                    </div>
                    {index === activeIndex && (
                       <motion.div layoutId="arrow">
                          <ArrowRight size={16} className="text-[#00c6ff]" />
                       </motion.div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="text-white/20 text-sm font-black uppercase tracking-widest italic">No Institutional Directives mapped to "{query}"</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Vitam OS // Command Engine v28.0</span>
              <div className="flex gap-4 text-[9px] text-white/30 font-black uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                   <span className="px-2 py-1 rounded bg-white/5 border border-white/10">↑ ↓</span>
                   <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1.5">
                   <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Enter</span>
                   <span>Execute</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
