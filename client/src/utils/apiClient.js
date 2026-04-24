import axios from 'axios';
import Telemetry from './telemetry';
import { API_BASE_URL, FREE_MODE_HEADER_ENABLED, FREE_MODE_HEADER_TOKEN } from '../config/runtime';
import { safeLocalStorage } from './browserStorage';
const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);
const SAFE_RETRY_METHODS = new Set(['get', 'head', 'options']);
const MAX_RETRIES = 2;
const MAX_RETRY_DELAY_MS = 5000;

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

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = safeLocalStorage.getItem('vitam_token');
    if (token) {
      setHeaderValue(config.headers, 'Authorization', `Bearer ${token}`);
    }

    const requestId = getHeaderValue(config.headers, 'x-request-id') || createClientRequestId();
    setHeaderValue(config.headers, 'x-request-id', requestId);

    const method = (config.method || 'get').toLowerCase();
    if (MUTATING_METHODS.has(method) && !getHeaderValue(config.headers, 'x-idempotency-key')) {
      setHeaderValue(config.headers, 'x-idempotency-key', requestId);
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
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const method = (originalRequest?.method || 'get').toLowerCase();
    const retryAfterHeader = error?.response?.headers?.['retry-after'];
    const retryAfterSeconds = Number.parseInt(retryAfterHeader, 10);
    const retryAfterMs = Number.isFinite(retryAfterSeconds)
      ? Math.min(retryAfterSeconds * 1000, MAX_RETRY_DELAY_MS)
      : null;
    const hasIdempotencyKey = Boolean(getHeaderValue(originalRequest?.headers, 'x-idempotency-key'));
    const canRetry = SAFE_RETRY_METHODS.has(method) || (MUTATING_METHODS.has(method) && hasIdempotencyKey);
    const retryableFailure = !error.response || error.code === 'ECONNABORTED';
    const temporarilyUnavailable = error?.response?.status === 503;
    const timeoutFailure = [408, 504].includes(error?.response?.status) || error?.response?.data?.code === 'REQUEST_TIMEOUT';
    const shouldRetry = canRetry && (retryableFailure || temporarilyUnavailable || timeoutFailure);
    const attempt = Number(originalRequest?.__retryCount || 0);

    if (originalRequest && shouldRetry && attempt < MAX_RETRIES) {
      originalRequest.__retryCount = attempt + 1;
      const backoffMs = calculateBackoffMs(originalRequest.__retryCount);
      const delay = retryAfterMs == null ? backoffMs : Math.max(backoffMs, retryAfterMs);
      await sleep(delay);
      return apiClient(originalRequest);
    }
    
    // Handle 401 Unauthorized (Expired token or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      Telemetry.warden('[API] Recovery Triggered: 401 Unauthorized');
      // Logic for logout or token refresh would go here
      // For now, we clear local storage to force re-login
      safeLocalStorage.removeItem('vitam_token');
      safeLocalStorage.removeItem('vitam_user');
      window.dispatchEvent(new Event('auth_failure'));
    }
    
    // Handle 403 Forbidden (RBAC violation)
    if (error.response?.status === 403) {
      Telemetry.sentinel('[API] Policy Violation: 403 Forbidden');
      window.dispatchEvent(new CustomEvent('api_error', { 
        detail: { msg: 'Access Denied: You do not have permission for this sector.' } 
      }));
    }

    // Handle 503 Service Unavailable (Maintenance or Start-up)
    if (error.response?.status === 503) {
        Telemetry.warden('[API] Sector Offline: 503 Service Unavailable');
        window.dispatchEvent(new CustomEvent('api_error', { 
            detail: { msg: error.response.data?.msg || 'Subsystem is currently recalibrating. Please wait.' } 
        }));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
