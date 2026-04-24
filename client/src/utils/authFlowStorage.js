import { safeSessionStorage } from './browserStorage';

const AUTH_FLOW_KEY = 'vitam_pending_auth_flow';
const SETUP_FLOW_KEY = 'vitam_security_setup_flow';
const FLOW_MAX_AGE_MS = 15 * 60 * 1000;

const isBrowser = () => typeof window !== 'undefined';

const readFlow = (key) => {
  if (!isBrowser()) return null;

  try {
    const raw = safeSessionStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const updatedAt = Number(parsed?.updatedAt || 0);
    if (!updatedAt || Date.now() - updatedAt > FLOW_MAX_AGE_MS) {
      safeSessionStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch (_) {
    safeSessionStorage.removeItem(key);
    return null;
  }
};

const writeFlow = (key, payload) => {
  if (!isBrowser()) return;

  safeSessionStorage.setItem(key, JSON.stringify({
    ...payload,
    updatedAt: Date.now()
  }));
};

const clearFlow = (key) => {
  if (!isBrowser()) return;
  safeSessionStorage.removeItem(key);
};

export const getPendingAuthFlow = () => readFlow(AUTH_FLOW_KEY);

export const savePendingAuthFlow = (payload) => writeFlow(AUTH_FLOW_KEY, payload);

export const clearPendingAuthFlow = () => clearFlow(AUTH_FLOW_KEY);

export const getSecuritySetupFlow = () => readFlow(SETUP_FLOW_KEY);

export const saveSecuritySetupFlow = (payload) => writeFlow(SETUP_FLOW_KEY, payload);

export const clearSecuritySetupFlow = () => clearFlow(SETUP_FLOW_KEY);
