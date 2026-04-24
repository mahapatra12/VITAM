const matchesTargetPath = (targetPath) => {
  if (typeof window === 'undefined' || !targetPath) {
    return false;
  }

  const currentPath = window.location.pathname || '/';
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

export const scheduleHardRedirectFallback = (targetPath, delayMs = 1800) => {
  if (typeof window === 'undefined' || !targetPath) {
    return () => {};
  }

  const timer = window.setTimeout(() => {
    if (matchesTargetPath(targetPath)) {
      return;
    }

    window.location.replace(targetPath);
  }, Math.max(500, delayMs));

  return () => {
    window.clearTimeout(timer);
  };
};

