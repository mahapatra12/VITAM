import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Zap,
  Globe,
  TrendingUp,
  Shield,
  Users,
  Cpu,
  Activity,
  ChevronRight,
  History,
  BarChart3,
  Command
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccessPath, getEffectiveRole } from '../../utils/routing';

const OPEN_COMMAND_PALETTE_EVENT = 'vitam:open-command-palette';

const SYSTEM_COMMANDS = [
  {
    id: 'future-enroll',
    label: 'Predictive Enrollment Analysis',
    desc: 'Simulate next-cycle student admission trends',
    icon: BarChart3,
    color: 'text-blue-400'
  },
  {
    id: 'past-audit',
    label: 'Security Audit History',
    desc: 'Review recent system integrity reports',
    icon: History,
    color: 'text-amber-400'
  },
  {
    id: 'stress-test',
    label: 'System Stress Test',
    desc: 'Verify infrastructure resilience under high load',
    icon: Zap,
    color: 'text-rose-400'
  }
];

const isTypingTarget = (target) => {
  if (!target) return false;
  const tagName = target.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable;
};

const buildCommands = (user) => {
  const effectiveRole = getEffectiveRole(user);

  return [
    {
      id: 'chairman',
      label: 'Chairman Dashboard',
      icon: TrendingUp,
      path: '/chairman/dashboard',
      tags: ['revenue', 'market', 'strategic']
    },
    {
      id: 'director',
      label: 'Director Operations',
      icon: Shield,
      path: effectiveRole === 'director' ? '/director/dashboard' : '/admin/director',
      tags: ['faculty', 'load', 'hr']
    },
    {
      id: 'principal',
      label: 'Principal Portal',
      icon: Users,
      path: '/admin/principal-dashboard',
      tags: ['academic', 'institutional']
    },
    {
      id: 'hod',
      label: 'Departmental Operations',
      icon: Cpu,
      path: '/hod/dashboard',
      tags: ['hod', 'department', 'workload']
    },
    {
      id: 'security',
      label: 'Security Operations Center',
      icon: Globe,
      path: '/admin/security',
      tags: ['integrity', 'audit', 'protection']
    },
    {
      id: 'integrity',
      label: 'System Integrity Hub',
      icon: Activity,
      path: '/admin/integrity',
      tags: ['health', 'sync', 'maintenance']
    }
  ];
};

export default function CommandHub({ showLauncher = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handler = (event) => {
      if (event.repeat || isTypingTarget(event.target)) return;

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen(true);
        setQuery('');
      }

      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const openFromEvent = () => {
      setIsOpen(true);
      setQuery('');
    };

    window.addEventListener('keydown', handler);
    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, openFromEvent);

    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, openFromEvent);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
    setQuery('');
  }, [location.pathname]);

  const commands = useMemo(
    () => buildCommands(user).filter((command) => canAccessPath(user, command.path)),
    [user]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return commands;
    }

    const systemResults = SYSTEM_COMMANDS.filter((command) =>
      command.label.toLowerCase().includes(normalizedQuery)
    );
    const navigationResults = commands.filter(
      (command) =>
        command.label.toLowerCase().includes(normalizedQuery) ||
        command.tags.some((tag) => tag.includes(normalizedQuery))
    );

    return [...systemResults, ...navigationResults];
  }, [commands, query]);

  const handleSelect = (command) => {
    if (command.path) {
      navigate(command.path);
    } else {
      setQuery(command.label);
    }
  };

  const handleKey = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocused((current) => Math.min(current + 1, filtered.length - 1));
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocused((current) => Math.max(current - 1, 0));
    }

    if (event.key === 'Enter' && filtered[focused]) {
      handleSelect(filtered[focused]);
    }
  };

  return (
    <>
      {showLauncher ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed left-1/2 top-6 z-[500] hidden -translate-x-1/2 items-center gap-4 rounded-2xl border border-white/10 bg-black/60 px-6 py-3.5 shadow-2xl backdrop-blur-3xl transition-all group hover:border-blue-500/40 xl:flex"
        >
          <Command size={14} className="text-blue-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-colors group-hover:text-white">
            Command Hub
          </span>
          <div className="ml-4 flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 py-1">
            <span className="text-[9px] font-black uppercase text-slate-500">Ctrl/Cmd</span>
            <span className="text-[9px] font-black uppercase text-slate-500">K</span>
          </div>
        </button>
      ) : null}

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[1500] bg-black/80 backdrop-blur-md"
          />
        ) : null}

        {isOpen ? (
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="fixed left-1/2 top-[12%] z-[1501] w-full max-w-2xl -translate-x-1/2 px-4"
          >
            <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#081321]/96 shadow-2xl">
              <div className="flex items-center gap-4 border-b border-white/10 px-6 py-5">
                <Search size={20} className="text-blue-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setFocused(0);
                  }}
                  onKeyDown={handleKey}
                  placeholder="Search dashboards, modules, or commands..."
                  className="flex-1 bg-transparent text-lg font-bold text-white outline-none placeholder:text-slate-500"
                />
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                  Ctrl/Cmd + K
                </div>
              </div>

              <div className="max-h-[28rem] overflow-y-auto custom-scrollbar p-2">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
                    <Search size={42} className="text-slate-600" />
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">
                      No matching workspace actions found
                    </p>
                  </div>
                ) : (
                  filtered.map((command, index) => (
                    <button
                      key={command.id || command.label}
                      type="button"
                      onClick={() => handleSelect(command)}
                      onMouseEnter={() => setFocused(index)}
                      className={`relative flex w-full items-center gap-4 rounded-[1.4rem] px-4 py-4 text-left transition ${
                        focused === index ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      {focused === index ? (
                        <motion.div
                          layoutId="active-nav-line"
                          className="absolute inset-y-4 left-1.5 w-1 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.7)]"
                        />
                      ) : null}

                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${
                        focused === index
                          ? 'border-blue-400/20 bg-blue-500/16 text-blue-100'
                          : 'border-white/10 bg-white/[0.04] text-slate-400'
                      }`}>
                        <command.icon size={20} className={command.color || ''} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-sm font-bold ${focused === index ? 'text-white' : 'text-slate-200'}`}>
                          {command.label}
                        </p>
                        <p className="mt-1 truncate text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                          {command.desc || command.path || 'Workspace Module'}
                        </p>
                      </div>

                      <ChevronRight size={16} className={focused === index ? 'text-blue-300' : 'text-slate-600'} />
                    </button>
                  ))
                )}
              </div>

              <div className="border-t border-white/10 px-6 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  {SYSTEM_COMMANDS.map((item) => (
                    <div key={item.id} className="status-pill">
                      <item.icon size={12} className={item.color} />
                      {item.label.split(' ')[0]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
