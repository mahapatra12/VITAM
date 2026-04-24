import './index.css';
import { shouldEnablePerformanceMode as shouldUsePerformanceMode } from './utils/runtimeProfile';

const debugBoot = import.meta.env.DEV && import.meta.env.VITE_DEBUG_BOOT === 'true';

const bootLog = (...args) => {
  if (debugBoot) {
    console.log(...args);
  }
};

const applyPerformanceModeClass = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  if (shouldUsePerformanceMode()) {
    root.classList.add('perf-mode');
    bootLog('[VITAM] Performance mode enabled');
    return;
  }

  root.classList.remove('perf-mode');
};

const installConsoleNoiseFilters = () => {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return;
  }

  const noisyPatterns = [
    /Download the React DevTools for a better development experience/i,
    /React Router Future Flag Warning/i,
    /The width\(-1\) and height\(-1\) of chart should be greater than 0/i,
    /startRegistration\(\) was not called correctly/i,
    /Attempting to use a disconnected port object/i,
    /Error in event handler: Error: Attempting to use a disconnected port object/i,
    /Failed to load resource: net::ERR_FILE_NOT_FOUND/i,
    /utils\.js:1\s+Failed to load resource/i,
    /extensionState\.js:1\s+Failed to load resource/i,
    /heuristicsRedefinitions\.js:1\s+Failed to load resource/i
  ];

  const shouldIgnore = (args) => {
    const text = args.map((part) => String(part)).join(' ');
    return noisyPatterns.some((pattern) => pattern.test(text));
  };

  const originalWarn = console.warn.bind(console);
  const originalError = console.error.bind(console);
  const originalInfo = console.info.bind(console);
  const originalLog = console.log.bind(console);

  console.warn = (...args) => {
    if (shouldIgnore(args)) {
      return;
    }
    originalWarn(...args);
  };

  console.error = (...args) => {
    if (shouldIgnore(args)) {
      return;
    }
    originalError(...args);
  };

  console.info = (...args) => {
    if (shouldIgnore(args)) {
      return;
    }
    originalInfo(...args);
  };

  console.log = (...args) => {
    if (shouldIgnore(args)) {
      return;
    }
    originalLog(...args);
  };

  window.addEventListener('error', (event) => {
    const message = event?.message || '';
    const filename = event?.filename || '';
    if (noisyPatterns.some((pattern) => pattern.test(`${filename} ${message}`))) {
      event.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason?.message || event?.reason || '';
    if (noisyPatterns.some((pattern) => pattern.test(String(reason)))) {
      event.preventDefault();
    }
  });
};

const cleanupLegacyServiceWorkers = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const disablePwa = import.meta.env.DEV || import.meta.env.VITE_DISABLE_PWA === 'true';
  if (!disablePwa) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    bootLog('[VITAM] Legacy service workers and cache cleared');
  } catch (error) {
    bootLog('[VITAM] Service worker cleanup skipped:', error?.message || error);
  }
};

const renderBootFailure = (error) => {
  const rootEl = document.getElementById('root');
  if (!rootEl) {
    return;
  }

  rootEl.innerHTML = `
    <div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0a0a0a;color:#fff;font-family:sans-serif;gap:16px;padding:24px">
      <h1 style="font-size:24px;font-weight:800;color:#f87171;letter-spacing:0.06em;text-transform:uppercase">VITAM Boot Failure</h1>
      <p style="max-width:700px;text-align:center;color:#cbd5e1;line-height:1.6">The application failed to initialize. Refresh once. If this continues, clear site data and retry.</p>
      <pre style="background:#111;border:1px solid #333;padding:14px;border-radius:10px;font-size:12px;color:#fecaca;max-width:720px;overflow:auto">${error?.message || String(error)}</pre>
      <button onclick="location.reload()" style="padding:10px 24px;background:#2563eb;color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:0.08em;text-transform:uppercase">Retry</button>
    </div>
  `;
};

const registerPwa = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  if (import.meta.env.DEV || import.meta.env.VITE_DISABLE_PWA === 'true') {
    return;
  }

  try {
    const { registerSW } = await import('virtual:pwa-register');
    registerSW({
      onNeedRefresh() {
        bootLog('[VITAM PWA] Update available');
      },
      onOfflineReady() {
        bootLog('[VITAM PWA] Offline mode ready');
      }
    });
  } catch (error) {
    bootLog('[VITAM PWA] Registration skipped:', error?.message || error);
  }
};

const initVitals = async () => {
  try {
    const { default: reportVitals } = await import('./vitals');
    const { default: Telemetry } = await import('./utils/telemetry');
    reportVitals((metric) => {
      Telemetry.info(`[WebVital] ${metric.name}: ${Math.round(metric.value)}`);
    });
  } catch (error) {
    bootLog('[VITAM] Vitals skipped:', error?.message || error);
  }
};

const schedulePostBootTasks = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const runTasks = () => {
    void registerPwa();
    void initVitals();
  };

  const scheduleIdle = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => runTasks(), { timeout: 3000 });
      return;
    }

    window.setTimeout(runTasks, 700);
  };

  if (document.readyState === 'complete') {
    scheduleIdle();
    return;
  }

  window.addEventListener('load', scheduleIdle, { once: true });
};

const bootApp = async () => {
  try {
    installConsoleNoiseFilters();
    applyPerformanceModeClass();
    await cleanupLegacyServiceWorkers();

    const [{ StrictMode }, { createRoot }, { default: App }] = await Promise.all([
      import('react'),
      import('react-dom/client'),
      import('./App.jsx')
    ]);

    const rootEl = document.getElementById('root');
    if (!rootEl) {
      throw new Error('Root element not found');
    }

    const useStrictMode = import.meta.env.DEV && import.meta.env.VITE_STRICT_MODE === 'true';
    const appTree = <App />;

    createRoot(rootEl).render(useStrictMode ? <StrictMode>{appTree}</StrictMode> : appTree);

    schedulePostBootTasks();
  } catch (error) {
    renderBootFailure(error);
  }
};

void bootApp();
