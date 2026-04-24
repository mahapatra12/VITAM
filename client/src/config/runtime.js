const PRODUCTION_API_BASE = 'https://vitam-ai.vercel.app/api';
const LOCAL_API_BASE = 'http://localhost:5101/api';

const trimValue = (value) => String(value || '').trim();
const trimTrailingSlashes = (value) => trimValue(value).replace(/\/+$/, '');

const normalizeApiBase = (value) => {
  const normalized = trimTrailingSlashes(value);
  if (!normalized) {
    return '';
  }

  if (/\/api$/i.test(normalized)) {
    return normalized;
  }

  return `${normalized}/api`;
};

const isLocalHostRuntime = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const configuredBase = normalizeApiBase(import.meta.env.VITE_API_URL);
const fallbackBase = isLocalHostRuntime() ? LOCAL_API_BASE : PRODUCTION_API_BASE;

export const API_BASE_URL = configuredBase || fallbackBase;
export const API_ORIGIN = API_BASE_URL.replace(/\/api$/i, '');
export const SOCKET_BASE_URL = API_ORIGIN;
export const FREE_MODE_HEADER_ENABLED = import.meta.env.VITE_FREE_MODE === 'true';
export const FREE_MODE_HEADER_TOKEN = trimValue(import.meta.env.VITE_FREE_MODE_TOKEN || '');
