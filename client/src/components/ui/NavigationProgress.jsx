import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { subscribeToNavigationStart } from '../../utils/navigationSignals';

const INITIAL_PROGRESS = 12;
const PASSIVE_INITIAL_PROGRESS = 24;
const MAX_PROGRESS = 88;

const NavigationProgress = () => {
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);
  const activeRef = useRef(false);
  const targetPathRef = useRef('');
  const progressTimerRef = useRef(null);
  const finishTimerRef = useRef(null);
  const [state, setState] = useState({ active: false, progress: 0 });

  const clearTimers = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    if (finishTimerRef.current) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  };

  const startProgress = (targetPath, initialProgress = INITIAL_PROGRESS) => {
    clearTimers();
    targetPathRef.current = targetPath || '';
    activeRef.current = true;
    setState({ active: true, progress: initialProgress });

    progressTimerRef.current = window.setInterval(() => {
      setState((prev) => {
        if (!prev.active || prev.progress >= MAX_PROGRESS) {
          return prev;
        }

        const remaining = MAX_PROGRESS - prev.progress;
        const nextProgress = prev.progress + Math.max(2, remaining * 0.18);
        return {
          ...prev,
          progress: Math.min(MAX_PROGRESS, nextProgress)
        };
      });
    }, 120);
  };

  const completeProgress = () => {
    clearTimers();
    activeRef.current = true;
    setState((prev) => ({ active: true, progress: Math.max(prev.progress, 100) }));

    finishTimerRef.current = window.setTimeout(() => {
      activeRef.current = false;
      targetPathRef.current = '';
      setState({ active: false, progress: 0 });
    }, 180);
  };

  useEffect(() => subscribeToNavigationStart(({ path }) => {
    if (path && path === location.pathname) {
      return;
    }
    startProgress(path, INITIAL_PROGRESS);
  }), [location.pathname]);

  useEffect(() => {
    if (previousPathRef.current === location.pathname) {
      return;
    }

    if (!activeRef.current) {
      startProgress(location.pathname, PASSIVE_INITIAL_PROGRESS);
    }

    completeProgress();
    previousPathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => () => clearTimers(), []);

  if (!state.active) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[140] h-1.5">
      <div
        key={targetPathRef.current || location.pathname}
        style={{ width: `${state.progress}%` }}
        className="h-full rounded-r-full bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 shadow-[0_0_24px_rgba(56,189,248,0.5)] transition-[width,opacity] duration-150 ease-out"
      />
    </div>
  );
};

export default NavigationProgress;
