import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import LoginPage from './pages/auth/Login';
import ErrorBoundary from './components/ErrorBoundary';
import lazySimple from './utils/lazySimple';
import { AuthProvider, useAuth } from './context/AuthContext';
import NavigationProgress from './components/ui/NavigationProgress';

const SecuritySetup = lazySimple(() => import('./pages/auth/SecuritySetup'));
const ProtectedAppRoutes = lazySimple(() => import('./routes/ProtectedAppRoutes'));
const LazyHealthProvider = lazySimple(() => import('./context/HealthContext').then((module) => ({ default: module.HealthProvider })));
const LazyThemeProvider = lazySimple(() => import('./context/ThemeContext').then((module) => ({ default: module.ThemeProvider })));
const LazyLocalizationProvider = lazySimple(() => import('./context/LocalizationContext').then((module) => ({ default: module.LocalizationProvider })));
const LazyToastProvider = lazySimple(() => import('./components/ui/ToastSystem').then((module) => ({ default: module.ToastProvider })));

const PUBLIC_APP_PATHS = new Set(['/', '/login', '/setup']);

function AppShellFallback() {
  return (
    <div className="min-h-screen px-6 py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="glass-card h-24 animate-pulse bg-slate-800/50" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="glass-card h-32 animate-pulse bg-slate-800/50" />
          <div className="glass-card h-32 animate-pulse bg-slate-800/50" />
          <div className="glass-card h-32 animate-pulse bg-slate-800/50" />
        </div>
      </div>
    </div>
  );
}

function RuntimeWarmup() {
  const location = useLocation();
  const { user } = useAuth();
  const isPublicPath = PUBLIC_APP_PATHS.has(location.pathname);

  useEffect(() => {
    if (isPublicPath && !user) {
      return undefined;
    }

    let disposed = false;
    let cancelWarmup = null;

    const startWarmup = async () => {
      try {
        const { warmCriticalRoutes } = await import('./utils/routePrefetch');
        if (disposed) {
          return;
        }

        cancelWarmup = warmCriticalRoutes({
          user,
          pathname: location.pathname
        });
      } catch {
        cancelWarmup = null;
      }
    };

    void startWarmup();

    return () => {
      disposed = true;
      cancelWarmup?.();
    };
  }, [isPublicPath, location.pathname, user?._id, user?.id, user?.role, user?.subRole]);

  return null;
}

function AppContent() {
  return (
    <div className="min-h-screen text-slate-100">
      <Suspense
        fallback={<AppShellFallback />}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/setup" element={<SecuritySetup />} />
          <Route path="*" element={<ProtectedAppRoutes />} />
        </Routes>
      </Suspense>
    </div>
  );
}

function HealthScopedContent() {
  const location = useLocation();
  const isPublicPath = PUBLIC_APP_PATHS.has(location.pathname);

  if (isPublicPath) {
    return <AppContent />;
  }

  return (
    <Suspense fallback={<AppShellFallback />}>
      <LazyThemeProvider>
        <LazyLocalizationProvider>
          <LazyToastProvider>
            <LazyHealthProvider>
              <AppContent />
            </LazyHealthProvider>
          </LazyToastProvider>
        </LazyLocalizationProvider>
      </LazyThemeProvider>
    </Suspense>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <AuthProvider>
          <NavigationProgress />
          <RuntimeWarmup />
          <HealthScopedContent />
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
