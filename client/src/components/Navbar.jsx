import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CalendarDays, Eye, Menu, MessageSquare, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardPathForUser } from '../utils/routing';
import { announceNavigationStart } from '../utils/navigationSignals';

const OPEN_COMMAND_PALETTE_EVENT = 'vitam:open-command-palette';

const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'Campus data sync completed successfully.', time: '2 min ago', read: false },
  { id: 2, text: 'Security audit finished without critical findings.', time: '34 min ago', read: false },
  { id: 3, text: 'Timetable changes are ready for review.', time: 'Today', read: true }
];

const getInitials = (name = '') =>
  String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join('') || 'VU';

const Navbar = ({ title = 'Dashboard', onMenuClick, onCommsClick }) => {
  const { user, impersonateRole } = useAuth();
  const navigate = useNavigate();
  const notifRef = useRef(null);
  const [showNotif, setShowNotif] = useState(false);
  const notifications = MOCK_NOTIFICATIONS;

  const unreadCount = notifications.filter((n) => !n.read).length;
  const displayName = user?.name || 'Institution User';
  const displayRole = user?.role ? user.role.toUpperCase() : 'USER';
  const canImpersonate = Boolean(
    impersonateRole &&
    ['chairman', 'director', 'admin', 'superadmin'].includes(String(user?.role || '').toLowerCase())
  );

  const todayLabel = useMemo(
    () => new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
    []
  );

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const openCommandPalette = () => {
    window.dispatchEvent(new Event(OPEN_COMMAND_PALETTE_EVENT));
  };

  const handleImpersonate = (role) => {
    if (!role || !impersonateRole) return;
    impersonateRole(role);
    const targetPath = getDashboardPathForUser({ role });
    announceNavigationStart({ path: targetPath, source: 'impersonation' });
    navigate(targetPath, { replace: true });
    setShowNotif(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[100] border-b border-slate-700/50 bg-slate-950/85 backdrop-blur lg:left-[18rem]">
      <div className="mx-auto flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-900 text-slate-300 hover:text-white lg:hidden"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-white">{title}</p>
            <p className="truncate text-[11px] uppercase tracking-wide text-slate-400">VITAM Platform</p>
          </div>
        </div>

        <div className="hidden flex-1 justify-center xl:flex">
          <button
            type="button"
            onClick={openCommandPalette}
            className="flex w-full max-w-md items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-900/80 px-4 py-2 text-left text-slate-300 hover:border-blue-400/40"
          >
            <Search size={15} />
            <span className="flex-1 text-sm">Search pages, actions, users</span>
            <span className="rounded border border-slate-600 px-2 py-0.5 text-[11px] text-slate-400">Ctrl+K</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/80 px-3 py-2 text-xs text-slate-300 lg:flex">
            <CalendarDays size={14} />
            <span>{todayLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCommsClick}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-900 text-slate-300 hover:text-white"
            >
              <MessageSquare size={16} />
            </button>

            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotif((v) => !v)}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700/70 bg-slate-900 text-slate-300 hover:text-white"
              >
                <Bell size={16} />
                {unreadCount > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-400" />}
              </button>

              {showNotif && (
                <div className="absolute right-0 top-12 z-20 w-80 rounded-xl border border-slate-700/70 bg-slate-900/95 p-2 shadow-xl">
                  <div className="mb-2 border-b border-slate-700/70 px-3 py-2 text-xs font-semibold text-slate-300">
                    Notifications
                  </div>
                  <div className="custom-scrollbar max-h-72 overflow-y-auto p-1">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        className="mb-1 w-full rounded-lg px-3 py-2 text-left hover:bg-slate-800/80"
                      >
                        <p className="text-xs text-slate-200">{n.text}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{n.time}</p>
                      </button>
                    ))}
                  </div>
                  {canImpersonate && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleImpersonate('student')}
                        className="btn-secondary w-full justify-center text-xs"
                      >
                        <Eye size={14} />
                        Preview Student View
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-900/80 px-2 py-1">
            <div className="hidden text-right sm:block">
              <p className="max-w-[140px] truncate text-xs font-semibold text-slate-100">{displayName}</p>
              <p className="text-[11px] uppercase text-slate-400">{displayRole}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
              {getInitials(displayName)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
