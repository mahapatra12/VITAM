import { Suspense, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Spinner from '../components/ui/Spinner';
import lazySimple from '../utils/lazySimple';
import { cancelIdleTask, scheduleIdleTask } from '../utils/idleTask';

const OPEN_COMMAND_PALETTE_EVENT = 'vitam:open-command-palette';
const CommandPalette = lazySimple(() => import('../components/CommandPalette'));
const GlobalComms = lazySimple(() => import('../components/ui/GlobalComms'));

const DashboardLayout = ({ children, title = 'Portal', role = 'ADMIN' }) => {
  const location = useLocation();
  const { health } = useHealth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCommsOpen, setIsCommsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [hasLoadedComms, setHasLoadedComms] = useState(false);
  const [hasLoadedCommandPalette, setHasLoadedCommandPalette] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsCommsOpen(false);
    setIsCommandPaletteOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const openCommandPalette = () => {
      setHasLoadedCommandPalette(true);
      setIsCommandPaletteOpen(true);
    };

    const openComms = () => {
      setHasLoadedComms(true);
      setIsCommsOpen(true);
    };

    const handlePaletteRequest = () => {
      openCommandPalette();
    };

    const handleKeyDown = (event) => {
      const isCommandShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      if (isCommandShortcut) {
        event.preventDefault();
        openCommandPalette();
        return;
      }

      if (event.key === 'm' && event.altKey) {
        event.preventDefault();
        openComms();
      }
    };

    const preloadHandle = scheduleIdleTask(() => {
      void CommandPalette.preload?.();
      void GlobalComms.preload?.();
    }, 1800, 500);

    window.addEventListener(OPEN_COMMAND_PALETTE_EVENT, handlePaletteRequest);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelIdleTask(preloadHandle);
      window.removeEventListener(OPEN_COMMAND_PALETTE_EVENT, handlePaletteRequest);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const statusMessage = useMemo(() => {
    if (health?.isHealthy === false) {
      return 'System health degraded';
    }
    if (health?.status === 'warning') {
      return 'Monitoring in progress';
    }
    return 'System secure and operational';
  }, [health]);

  return (
    <div className="min-h-screen text-slate-100">
      <Sidebar role={role} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col lg:pl-[18rem]">
        <Navbar
          title={title}
          onMenuClick={() => setIsSidebarOpen((open) => !open)}
          onCommsClick={() => {
            setHasLoadedComms(true);
            setIsCommsOpen(true);
          }}
        />

        <main className="flex-1 px-4 pb-8 pt-24 sm:px-6 lg:px-8 lg:pt-28">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="mx-auto w-full max-w-[1500px]"
          >
            {children}
          </motion.div>
        </main>

        <footer className="px-4 pb-4 sm:px-6 lg:px-8">
          <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>{statusMessage}</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400">
              <button
                type="button"
                onClick={() => {
                  setHasLoadedCommandPalette(true);
                  setIsCommandPaletteOpen(true);
                }}
                className="text-blue-300 hover:text-blue-200"
              >
                Command search `Ctrl+K`
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasLoadedComms(true);
                  setIsCommsOpen(true);
                }}
                className="text-cyan-300 hover:text-cyan-200"
              >
                Secure comms `Alt+M`
              </button>
            </div>
          </div>
        </footer>
      </div>

      {hasLoadedCommandPalette && (
        <Suspense fallback={<div className="fixed inset-0 z-[180] flex items-center justify-center bg-black/30"><Spinner label="Loading command center" /></div>}>
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
          />
        </Suspense>
      )}

      {hasLoadedComms && (
        <Suspense fallback={<div className="fixed inset-y-0 right-0 z-[180] flex w-full max-w-[28rem] items-center justify-center bg-black/30"><Spinner label="Loading secure comms" /></div>}>
          <GlobalComms
            isOpen={isCommsOpen}
            onClose={() => setIsCommsOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default DashboardLayout;
