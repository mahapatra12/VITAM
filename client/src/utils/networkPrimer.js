import { API_ORIGIN } from '../config/runtime';

const hintedResources = new Set();

const canPrimeOrigin = (origin) => /^https?:\/\//i.test(String(origin || ''));

const normalizeOrigin = (origin) => {
  try {
    return new URL(origin).origin;
  } catch {
    return '';
  }
};

const appendHint = ({ rel, href, crossOrigin }) => {
  if (typeof document === 'undefined' || !rel || !href) {
    return;
  }

  const key = `${rel}::${href}`;
  if (hintedResources.has(key)) {
    return;
  }

  const existing = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
  if (existing) {
    hintedResources.add(key);
    return;
  }

  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (crossOrigin) {
    link.crossOrigin = crossOrigin;
  }

  document.head.appendChild(link);
  hintedResources.add(key);
};

export const primeOriginTransport = (origin = API_ORIGIN) => {
  if (typeof window === 'undefined' || !canPrimeOrigin(origin)) {
    return;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    return;
  }

  const crossOrigin = normalizedOrigin !== window.location.origin ? 'anonymous' : '';
  appendHint({ rel: 'dns-prefetch', href: normalizedOrigin });
  appendHint({ rel: 'preconnect', href: normalizedOrigin, crossOrigin });
};
