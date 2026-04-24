import { safeSessionStorage } from './browserStorage';

const RECOVERY_KEY = 'vitam_app_recovery';
const RECOVERY_WINDOW_MS = 2 * 60 * 1000;

const canUseSessionStorage = () => {
  try {
    return typeof window !== 'undefined';
  } catch {
    return false;
  }
};

const readRecoveryState = () => {
  if (!canUseSessionStorage()) {
    return {};
  }

  try {
    const raw = safeSessionStorage.getItem(RECOVERY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeRecoveryState = (state) => {
  if (!canUseSessionStorage()) {
    return;
  }

  safeSessionStorage.setItem(RECOVERY_KEY, JSON.stringify(state));
};

export const clearRecoveryAttempt = (reason) => {
  if (!reason) {
    return;
  }

  const state = readRecoveryState();
  if (!state[reason]) {
    return;
  }

  delete state[reason];
  writeRecoveryState(state);
};

const buildRecoveryUrl = (path, reason) => {
  const url = new URL(path, window.location.origin);
  url.searchParams.set('recover', reason);
  return `${url.pathname}${url.search}${url.hash}`;
};

export const requestAppRecovery = ({
  reason,
  maxReloads = 1,
  fallbackPath = '/',
}) => {
  if (typeof window === 'undefined' || !reason) {
    return 'noop';
  }

  const now = Date.now();
  const state = readRecoveryState();
  const current = state[reason];
  const freshAttempt = current && now - current.lastAttemptAt < RECOVERY_WINDOW_MS
    ? current
    : { count: 0, lastAttemptAt: 0 };

  if (freshAttempt.count < maxReloads) {
    state[reason] = {
      count: freshAttempt.count + 1,
      lastAttemptAt: now,
    };
    writeRecoveryState(state);

    const url = new URL(window.location.href);
    url.searchParams.set('__vitam_recover', `${reason}-${freshAttempt.count + 1}`);
    window.location.replace(url.toString());
    return 'reload';
  }

  clearRecoveryAttempt(reason);
  window.location.replace(buildRecoveryUrl(fallbackPath, reason));
  return 'fallback';
};
