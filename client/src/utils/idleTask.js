import { getBackgroundTaskFallbackDelayMs, shouldRunBackgroundTasks } from './runtimeProfile';

export const scheduleIdleTask = (callback, timeout = 1500, fallbackDelay = 400) => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!shouldRunBackgroundTasks()) {
    return null;
  }

  if (typeof window.requestIdleCallback === 'function') {
    return window.requestIdleCallback(callback, { timeout });
  }

  return window.setTimeout(callback, Math.max(fallbackDelay, getBackgroundTaskFallbackDelayMs()));
};

export const cancelIdleTask = (handle) => {
  if (handle == null || typeof window === 'undefined') {
    return;
  }

  if (typeof window.cancelIdleCallback === 'function') {
    window.cancelIdleCallback(handle);
    return;
  }

  window.clearTimeout(handle);
};
