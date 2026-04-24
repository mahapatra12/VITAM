const getConnection = () => {
  if (typeof navigator === 'undefined') {
    return null;
  }

  return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
};

export const getRuntimeProfile = () => {
  const connection = getConnection();
  const effectiveType = String(connection?.effectiveType || '').toLowerCase();
  const saveData = Boolean(connection?.saveData);
  const downlink = Number(connection?.downlink || 0);
  const rtt = Number(connection?.rtt || 0);
  const cores = Number(globalThis?.navigator?.hardwareConcurrency || 8);
  const memory = Number(globalThis?.navigator?.deviceMemory || 8);
  const prefersReducedMotion = typeof window !== 'undefined'
    ? Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)
    : false;
  const offline = typeof navigator !== 'undefined' ? navigator.onLine === false : false;
  const hidden = typeof document !== 'undefined' ? document.visibilityState === 'hidden' : false;

  const constrainedNetwork =
    saveData ||
    effectiveType === 'slow-2g' ||
    effectiveType === '2g' ||
    (effectiveType === '3g' && ((downlink > 0 && downlink < 1.5) || rtt >= 450)) ||
    rtt >= 700;

  const constrainedDevice = prefersReducedMotion || cores <= 4 || memory <= 4;
  const constrained = constrainedNetwork || constrainedDevice;

  return {
    effectiveType,
    saveData,
    downlink,
    rtt,
    cores,
    memory,
    prefersReducedMotion,
    offline,
    hidden,
    constrainedNetwork,
    constrainedDevice,
    constrained
  };
};

export const shouldEnablePerformanceMode = () => getRuntimeProfile().constrained;

export const shouldRunBackgroundTasks = () => {
  const profile = getRuntimeProfile();
  return !profile.offline && !profile.hidden && !profile.constrainedNetwork;
};

export const shouldRunHoverPrefetch = () => {
  const profile = getRuntimeProfile();
  if (profile.offline || profile.hidden || profile.saveData) {
    return false;
  }

  if (profile.constrainedDevice) {
    return false;
  }

  return !['slow-2g', '2g', '3g'].includes(profile.effectiveType);
};

export const getDeferredRootMargin = () => {
  const profile = getRuntimeProfile();

  if (profile.constrained) {
    return '120px 0px';
  }

  if (!profile.effectiveType || profile.effectiveType === '4g') {
    return '380px 0px';
  }

  return '240px 0px';
};

export const getNavigationPrefetchBudgetMs = () => {
  const profile = getRuntimeProfile();

  if (profile.constrained) {
    return 140;
  }

  if (!profile.effectiveType || profile.effectiveType === '4g') {
    return 320;
  }

  return 220;
};

export const getBackgroundTaskFallbackDelayMs = () => {
  const profile = getRuntimeProfile();
  return profile.constrained ? 650 : 400;
};

export const getHealthCheckIntervalMs = () => {
  const profile = getRuntimeProfile();
  return profile.constrained ? 180000 : 60000;
};

export const getAuthHealthProbeIntervalMs = () => {
  const profile = getRuntimeProfile();
  return profile.constrained ? 240000 : 120000;
};
