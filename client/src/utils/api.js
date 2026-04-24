import axios from 'axios';
import { safeLocalStorage, safeSessionStorage } from './browserStorage';
import { API_BASE_URL, FREE_MODE_HEADER_ENABLED, FREE_MODE_HEADER_TOKEN, SOCKET_BASE_URL } from '../config/runtime';

const API_BASE = API_BASE_URL;
export const SOCKET_URL = SOCKET_BASE_URL;
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);
const SAFE_RETRY_METHODS = new Set(['get', 'head', 'options']);
const MAX_RETRIES = 2;
const MAX_RETRY_DELAY_MS = 5000;
const DEFAULT_GET_CACHE_MS = 12000;
const PERSISTED_CACHE_PREFIX = 'vitam_api_cache::';
const PERSISTED_CACHE_INDEX_KEY = 'vitam_api_cache_index';
const MAX_PERSISTED_CACHE_ENTRIES = 28;
const inflightGetRequests = new Map();
const responseCache = new Map();
const pendingCacheListeners = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const createClientRequestId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const getHeaderValue = (headers, key) => {
  if (!headers) {
    return undefined;
  }
  if (typeof headers.get === 'function') {
    return headers.get(key);
  }
  return headers[key] || headers[key.toLowerCase()];
};

const setHeaderValue = (headers, key, value) => {
  if (!headers) {
    return;
  }
  if (typeof headers.set === 'function') {
    headers.set(key, value);
    return;
  }
  headers[key] = value;
};

const calculateBackoffMs = (attempt) => {
  const base = 350 * Math.pow(2, Math.max(0, attempt - 1));
  const jitter = Math.floor(Math.random() * 180);
  return Math.min(base + jitter, MAX_RETRY_DELAY_MS);
};

const cloneData = (value) => {
  if (value == null || typeof value !== 'object') {
    return value;
  }

  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const stableSerialize = (value) => {
  if (value == null) {
    return '';
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(',')}]`;
  }

  if (typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${key}:${stableSerialize(value[key])}`).join(',')}}`;
  }

  return String(value);
};

const queueCacheListener = (cacheKey, listener) => {
  if (typeof listener !== 'function') {
    return;
  }

  const listeners = pendingCacheListeners.get(cacheKey) || new Set();
  listeners.add(listener);
  pendingCacheListeners.set(cacheKey, listeners);
};

const readPersistedCacheIndex = () => {
  const raw = safeSessionStorage.getItem(PERSISTED_CACHE_INDEX_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    safeSessionStorage.removeItem(PERSISTED_CACHE_INDEX_KEY);
    return [];
  }
};

const writePersistedCacheIndex = (index) => {
  safeSessionStorage.setItem(PERSISTED_CACHE_INDEX_KEY, JSON.stringify(index.slice(-MAX_PERSISTED_CACHE_ENTRIES)));
};

const buildPersistedCacheStorageKey = (cacheKey) => `${PERSISTED_CACHE_PREFIX}${cacheKey}`;

const trackPersistedCacheKey = (storageKey) => {
  const nextIndex = readPersistedCacheIndex().filter((entry) => entry !== storageKey);
  nextIndex.push(storageKey);

  while (nextIndex.length > MAX_PERSISTED_CACHE_ENTRIES) {
    const oldestKey = nextIndex.shift();
    if (oldestKey) {
      safeSessionStorage.removeItem(oldestKey);
    }
  }

  writePersistedCacheIndex(nextIndex);
};

const evictPersistedCacheKey = (storageKey) => {
  safeSessionStorage.removeItem(storageKey);
  writePersistedCacheIndex(readPersistedCacheIndex().filter((entry) => entry !== storageKey));
};

const clearPersistedResponseCache = () => {
  const index = readPersistedCacheIndex();
  index.forEach((storageKey) => {
    safeSessionStorage.removeItem(storageKey);
  });
  safeSessionStorage.removeItem(PERSISTED_CACHE_INDEX_KEY);
};

const serializePersistedResponse = (entry) => {
  try {
    return JSON.stringify({
      ts: entry.ts,
      response: {
        status: entry.response?.status || 200,
        statusText: entry.response?.statusText || 'OK',
        headers: entry.response?.headers || {},
        data: entry.response?.data
      }
    });
  } catch {
    return null;
  }
};

const restorePersistedResponse = (url, config, payload) => ({
  ts: payload.ts,
  response: {
    data: payload.response?.data,
    status: payload.response?.status || 200,
    statusText: payload.response?.statusText || 'OK',
    headers: payload.response?.headers || {},
    config: {
      ...(config || {}),
      url,
      method: 'get'
    }
  }
});

const readPersistedCacheEntry = (cacheKey, url, config) => {
  const storageKey = buildPersistedCacheStorageKey(cacheKey);
  const raw = safeSessionStorage.getItem(storageKey);
  if (!raw) {
    return null;
  }

  try {
    const payload = JSON.parse(raw);
    if (!payload?.response || !Number.isFinite(payload?.ts)) {
      evictPersistedCacheKey(storageKey);
      return null;
    }
    return restorePersistedResponse(url, config, payload);
  } catch {
    evictPersistedCacheKey(storageKey);
    return null;
  }
};

const writePersistedCacheEntry = (cacheKey, entry) => {
  const storageKey = buildPersistedCacheStorageKey(cacheKey);
  const serialized = serializePersistedResponse(entry);
  if (!serialized) {
    return;
  }

  const written = safeSessionStorage.setItem(storageKey, serialized);
  if (!written) {
    return;
  }

  trackPersistedCacheKey(storageKey);
};

const flushCacheListeners = (cacheKey, response) => {
  const listeners = pendingCacheListeners.get(cacheKey);
  if (!listeners?.size) {
    return;
  }

  pendingCacheListeners.delete(cacheKey);
  listeners.forEach((listener) => {
    try {
      listener(cloneCachedResponse(response));
    } catch (_error) {
      // Silent by design: cache refresh callbacks should never break API flow.
    }
  });
};

const resolveGetCacheConfig = (config = {}) => {
  if (config.cache === false) {
    return {
      enabled: false,
      maxAge: 0,
      staleWhileRevalidate: false,
      revalidateAfter: 0,
      onUpdate: null,
      persist: false
    };
  }

  if (config.cache === true) {
    return {
      enabled: true,
      maxAge: DEFAULT_GET_CACHE_MS,
      staleWhileRevalidate: false,
      revalidateAfter: DEFAULT_GET_CACHE_MS,
      onUpdate: null,
      persist: false
    };
  }

  if (typeof config.cache === 'number' && Number.isFinite(config.cache)) {
    const maxAge = Math.max(0, config.cache);
    return {
      enabled: true,
      maxAge,
      staleWhileRevalidate: false,
      revalidateAfter: maxAge,
      onUpdate: null,
      persist: false
    };
  }

  if (config.cache && typeof config.cache === 'object') {
    const maxAge = Number.isFinite(Number(config.cache.maxAge))
      ? Math.max(0, Number(config.cache.maxAge))
      : DEFAULT_GET_CACHE_MS;
    const staleWhileRevalidate = config.cache.staleWhileRevalidate === true;
    const revalidateAfter = Number.isFinite(Number(config.cache.revalidateAfter))
      ? Math.max(0, Number(config.cache.revalidateAfter))
      : Math.max(0, Math.floor(maxAge * 0.6));
    return {
      enabled: true,
      maxAge,
      staleWhileRevalidate,
      revalidateAfter,
      onUpdate: typeof config.cache.onUpdate === 'function' ? config.cache.onUpdate : null,
      persist: config.cache.persist === true
    };
  }

  return {
    enabled: false,
    maxAge: 0,
    staleWhileRevalidate: false,
    revalidateAfter: 0,
    onUpdate: null,
    persist: false
  };
};

const buildGetCacheKey = (url, config = {}) => {
  const authToken = safeLocalStorage.getItem('vitam_token') || '';
  const tenantDomain = typeof window !== 'undefined' ? window.location.hostname : '';
  return [
    url,
    stableSerialize(config.params),
    stableSerialize(config.headers),
    authToken,
    tenantDomain
  ].join('::');
};

const cloneCachedResponse = (response) => ({
  ...response,
  headers: response?.headers ? { ...response.headers } : response?.headers,
  config: response?.config ? { ...response.config } : response?.config,
  data: cloneData(response?.data)
});

const clearResponseCache = () => {
  responseCache.clear();
  inflightGetRequests.clear();
  pendingCacheListeners.clear();
  clearPersistedResponseCache();
};

// Optional: attach tenant hints automatically when using custom domain
export const withTenantHeaders = (config = {}) => {
  const headers = {
    ...(config.headers || {}),
    'x-college-domain': typeof window !== 'undefined' ? window.location.hostname : undefined,
  };
  return { ...config, headers };
};

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

const shouldClearSession = (error) => {
  const status = error?.response?.status;
  const message = error?.response?.data?.msg || '';
  const code = error?.response?.data?.code || '';
  const url = error?.config?.url || '';

  if (status !== 401) {
    return false;
  }

  if (url.includes('/auth/profile')) {
    return true;
  }

  if (code === 'TOKEN_REVOKED') {
    return true;
  }

  return [
    'Invalid or expired token',
    'Session revoked. Please sign in again.',
    'Authorization token missing',
    'User not found'
  ].includes(message);
};

// Automatically attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = safeLocalStorage.getItem('vitam_token');
  setHeaderValue(config.headers, 'Cache-Control', 'no-store');
  setHeaderValue(config.headers, 'Pragma', 'no-cache');
  setHeaderValue(config.headers, 'Expires', '0');

  const requestId = getHeaderValue(config.headers, 'x-request-id') || createClientRequestId();
  setHeaderValue(config.headers, 'x-request-id', requestId);

  const method = (config.method || 'get').toLowerCase();
  if (MUTATING_METHODS.has(method) && !getHeaderValue(config.headers, 'x-idempotency-key')) {
    setHeaderValue(config.headers, 'x-idempotency-key', requestId);
  }

  if (token) {
    setHeaderValue(config.headers, 'Authorization', `Bearer ${token}`);
  }
  if (typeof window !== 'undefined') {
    setHeaderValue(config.headers, 'x-college-domain', window.location.hostname);
    if (FREE_MODE_HEADER_ENABLED) {
      setHeaderValue(config.headers, 'x-free-mode', 'true');
      if (FREE_MODE_HEADER_TOKEN) {
        setHeaderValue(config.headers, 'x-free-mode-token', FREE_MODE_HEADER_TOKEN);
      }
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const method = (response?.config?.method || 'get').toLowerCase();
    if (MUTATING_METHODS.has(method)) {
      clearResponseCache();
    }
    return response;
  },
  async (error) => {
    const config = error.config || {};
    const method = (config.method || 'get').toLowerCase();
    const hasIdempotencyKey = Boolean(getHeaderValue(config.headers, 'x-idempotency-key'));
    const canRetry = SAFE_RETRY_METHODS.has(method) || (MUTATING_METHODS.has(method) && hasIdempotencyKey);
    const retryableFailure = !error.response || error.code === 'ECONNABORTED';
    const retryAfterHeader = error?.response?.headers?.['retry-after'];
    const retryAfterSeconds = Number.parseInt(retryAfterHeader, 10);
    const retryAfterMs = Number.isFinite(retryAfterSeconds)
      ? Math.min(retryAfterSeconds * 1000, MAX_RETRY_DELAY_MS)
      : null;
    const temporarilyUnavailable = error?.response?.status === 503;
    const timeoutFailure = [408, 504].includes(error?.response?.status) || error?.response?.data?.code === 'REQUEST_TIMEOUT';
    const shouldRetry = canRetry && (retryableFailure || temporarilyUnavailable || timeoutFailure);
    const attempt = Number(config.__retryCount || 0);

    if (shouldRetry && attempt < MAX_RETRIES) {
      config.__retryCount = attempt + 1;
      const backoffMs = calculateBackoffMs(config.__retryCount);
      const delay = retryAfterMs == null ? backoffMs : Math.max(backoffMs, retryAfterMs);
      await sleep(delay);
      return api(config);
    }

    if (typeof window !== 'undefined' && shouldClearSession(error)) {
      safeLocalStorage.removeItem('vitam_token');
      safeLocalStorage.removeItem('vitam_user');
      clearResponseCache();
    }

    return Promise.reject(error);
  }
);

const originalGet = api.get.bind(api);

const startGetRequest = (url, config, cacheKey, cacheConfig) => {
  const request = originalGet(url, config)
    .then((response) => {
      if (cacheConfig.enabled) {
        const cacheEntry = {
          ts: Date.now(),
          response: cloneCachedResponse(response)
        };
        responseCache.set(cacheKey, cacheEntry);
        if (cacheConfig.persist) {
          writePersistedCacheEntry(cacheKey, cacheEntry);
        }
      }
      flushCacheListeners(cacheKey, response);
      return response;
    })
    .finally(() => {
      inflightGetRequests.delete(cacheKey);
    });

  inflightGetRequests.set(cacheKey, request);
  return request;
};

api.get = (url, config = {}) => {
  const cacheConfig = resolveGetCacheConfig(config);
  const cacheKey = buildGetCacheKey(url, config);
  const now = Date.now();

  if (cacheConfig.enabled && cacheConfig.persist && !responseCache.has(cacheKey)) {
    const persistedEntry = readPersistedCacheEntry(cacheKey, url, config);
    if (persistedEntry) {
      responseCache.set(cacheKey, persistedEntry);
    }
  }

  if (cacheConfig.enabled) {
    const cachedEntry = responseCache.get(cacheKey);
    if (cachedEntry) {
      const age = now - cachedEntry.ts;
      const shouldServeCached = age < cacheConfig.maxAge || cacheConfig.staleWhileRevalidate;

      if (shouldServeCached) {
        if (cacheConfig.staleWhileRevalidate && age >= cacheConfig.revalidateAfter) {
          if (cacheConfig.onUpdate) {
            queueCacheListener(cacheKey, cacheConfig.onUpdate);
          }

          if (!inflightGetRequests.has(cacheKey)) {
            void startGetRequest(url, config, cacheKey, cacheConfig);
          }
        }

        return Promise.resolve(cloneCachedResponse(cachedEntry.response));
      }
    }
  }

  const inflight = inflightGetRequests.get(cacheKey);
  if (inflight) {
    return inflight.then((response) => cloneCachedResponse(response));
  }

  return startGetRequest(url, config, cacheKey, cacheConfig);
};

// Mock data for offline/mock mode fallback
export const MOCK_DATA = {
  admin: {
    totalStudents: '1,284',
    activeFaculty: '84',
    atRiskStudents: '12',
    enrollmentGrowth: '15%',
  },
  hod: {
    totalFaculty: '24',
    totalStudents: '840',
    courseCompletion: '92%',
  },
  faculty: {
    allocatedCourses: '4',
    totalStudents: '120',
    attendanceAvg: '88%',
    pendingGrading: '18',
  },
  student: {
    cgpa: '3.74',
    attendance: '94%',
    nextTarget: 'Sem 6',
    classesToday: '4',
  },
};

export default api;
