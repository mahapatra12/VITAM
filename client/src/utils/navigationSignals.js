const NAVIGATION_START_EVENT = 'vitam:navigation-start';

export const announceNavigationStart = (detail = {}) => {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
    return;
  }

  window.dispatchEvent(new CustomEvent(NAVIGATION_START_EVENT, {
    detail: {
      ...detail,
      ts: Date.now()
    }
  }));
};

export const subscribeToNavigationStart = (listener) => {
  if (typeof window === 'undefined' || typeof listener !== 'function') {
    return () => {};
  }

  const handler = (event) => {
    listener(event?.detail || {});
  };

  window.addEventListener(NAVIGATION_START_EVENT, handler);
  return () => window.removeEventListener(NAVIGATION_START_EVENT, handler);
};

export { NAVIGATION_START_EVENT };
