import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { canAccessPath, getDashboardPathForUser } from '../utils/routing';

const LOADING_STALL_THRESHOLD_SECONDS = 8;

const getAuthFallbackNotice = (authStatus) => {
  if (authStatus?.reason) {
    return authStatus.reason;
  }
  return 'Secure session check is temporarily unavailable. Please sign in again.';
};

const LoadingRecoveryScreen = ({ authStatus, retrying, onRetry }) => {
  const delayed = authStatus?.serviceStatus === 'starting' || authStatus?.maintenanceMode;

  return (
    <div className="h-screen w-screen bg-[#020617] px-4 py-8">
      <div className="mx-auto flex h-full w-full max-w-xl items-center justify-center">
        <div className="glass-panel w-full p-8 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border ${
            delayed
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-200'
              : 'border-blue-500/30 bg-blue-500/10 text-blue-200'
          }`}>
            {delayed ? <AlertTriangle size={28} /> : <ShieldCheck size={28} />}
          </div>

          <h2 className="text-2xl font-black text-white">
            Secure Session Verification
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {authStatus?.reason || 'Session verification is taking longer than expected.'}
          </p>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-left">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              Runtime state
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>Service: {authStatus?.serviceStatus || 'checking'}</p>
              <p>Sign-in available: {authStatus?.signInAvailable ? 'Yes' : 'No'}</p>
              <p>Maintenance: {authStatus?.maintenanceMode ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={onRetry}
              disabled={retrying}
              className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-50"
            >
              {retrying ? 'Retrying...' : 'Retry Secure Check'}
              <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => window.location.replace('/login')}
              className="btn-secondary justify-center"
            >
              Continue to Login
              <Lock size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading, authStatus, refreshAuthStatus } = useAuth();
  const location = useLocation();
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!loading) {
      setLoadingSeconds(0);
      return undefined;
    }

    const timerId = setInterval(() => {
      setLoadingSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [loading]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await refreshAuthStatus?.();
      window.location.reload();
    } finally {
      setRetrying(false);
    }
  };

  if (loading && loadingSeconds < LOADING_STALL_THRESHOLD_SECONDS) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-appleBackground">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-appleBlue border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 font-bold animate-pulse text-xs uppercase tracking-widest">
            Verifying Secure Session...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <LoadingRecoveryScreen
        authStatus={authStatus}
        retrying={retrying}
        onRetry={handleRetry}
      />
    );
  }

  if (!user) {
    const notice = authStatus?.signInAvailable === false
      ? getAuthFallbackNotice(authStatus)
      : undefined;
    return <Navigate to="/login" replace state={notice ? { notice } : undefined} />;
  }

  if (!canAccessPath(user, location.pathname)) {
    return <Navigate to={getDashboardPathForUser(user)} replace state={{ deniedPath: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
