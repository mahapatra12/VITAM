import { createContext, startTransition, useCallback, useContext, useEffect, useRef, useState } from 'react';
import api from '../utils/api';
import { clearPendingAuthFlow, clearSecuritySetupFlow } from '../utils/authFlowStorage';
import { emitAuthEvent, subscribeToAuthEvents } from '../utils/authBroadcast';
import { safeLocalStorage } from '../utils/browserStorage';
import { getAuthHealthProbeIntervalMs } from '../utils/runtimeProfile';

const TOKEN_KEY = 'vitam_token';
const USER_KEY = 'vitam_user';
const AUTH_RUNTIME_CACHE_MS = 12000;
const PROFILE_CACHE_MS = 15000;
const AUTH_STATUS_REFRESH_DEDUPE_MS = 4000;
const AUTH_REQUEST_TIMEOUT_MS = 12000;
const AUTH_SETUP_TIMEOUT_MS = 15000;
const isAuthDebug = import.meta.env.DEV && import.meta.env.VITE_DEBUG_AUTH === 'true';
let advancedAuthRuntimePromise = null;

const AuthContext = createContext();

const authLog = (...args) => {
  if (isAuthDebug) {
    console.log(...args);
  }
};

const authWarn = (...args) => {
  if (isAuthDebug) {
    console.warn(...args);
  }
};

const authError = (...args) => {
  if (isAuthDebug) {
    console.error(...args);
  }
};

const loadAdvancedAuthRuntime = () => {
  if (!advancedAuthRuntimePromise) {
    advancedAuthRuntimePromise = import('./authAdvancedRuntime');
  }
  return advancedAuthRuntimePromise;
};

const readStoredUser = () => {
  try {
    const raw = safeLocalStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    safeLocalStorage.removeItem(USER_KEY);
    return null;
  }
};

const clearStoredSession = (options = {}) => {
  const { broadcast = true } = options;
  safeLocalStorage.removeItem(TOKEN_KEY);
  safeLocalStorage.removeItem(USER_KEY);
  clearPendingAuthFlow();
  clearSecuritySetupFlow();
  if (broadcast) {
    emitAuthEvent('session-cleared');
  }
};

const persistSession = (token, user, setUser, options = {}) => {
  const { broadcast = true } = options;
  safeLocalStorage.setItem(TOKEN_KEY, token);
  safeLocalStorage.setItem(USER_KEY, JSON.stringify(user));
  clearPendingAuthFlow();
  clearSecuritySetupFlow();
  setUser(user);
  if (broadcast) {
    emitAuthEvent('session-updated', {
      userId: user?._id || user?.id || null
    });
  }
};

const getErrorMessage = (err, fallback) => {
  if (err?.response?.data?.code === 'AUTH_FLOW_EXPIRED' || err?.response?.data?.code === 'AUTH_FLOW_INVALID' || err?.response?.data?.code === 'AUTH_FLOW_STAGE_MISMATCH') {
    return 'Secure sign-in session expired. Please restart login.';
  }
  if (err?.response?.data?.code === 'SERVER_DRAINING') {
    return 'Service is restarting. Please retry in a few seconds.';
  }
  if (err?.response?.data?.code === 'SETUP_ALREADY_COMPLETED') {
    return 'Security setup is already complete. Please sign in again.';
  }
  if (err?.response?.data?.code === 'REQUEST_TIMEOUT' || err?.response?.status === 408 || err?.response?.status === 504) {
    return 'Secure request timed out. Please retry.';
  }
  if (err?.response?.status === 429) {
    return err?.response?.data?.msg || 'Too many attempts. Please wait and retry.';
  }
  if (err?.response?.data?.msg) return err.response.data.msg;
  if (err?.response?.data?.error) return err.response.data.error;
  if (!err?.response || err?.code === 'ECONNABORTED') {
    return 'Service temporarily unavailable. Please retry.';
  }
  return fallback;
};

const isAuthFlowError = (err) => ['AUTH_FLOW_EXPIRED', 'AUTH_FLOW_INVALID', 'AUTH_FLOW_STAGE_MISMATCH'].includes(err?.response?.data?.code);

const getOnlineState = () => (typeof navigator === 'undefined' ? true : navigator.onLine);

const DEFAULT_AUTH_STATUS = {
  webAuthn: true,
  faceAuth: true,
  faceThreshold: 0.86,
  totp: true,
  freeMode: true,
  serviceStatus: 'checking',
  online: getOnlineState(),
  signInAvailable: true,
  maintenanceMode: false,
  jwtReady: true,
  dbReady: true,
  reason: null
};

const areAuthStatusesEqual = (left = {}, right = {}) => {
  const keys = [
    'webAuthn',
    'faceAuth',
    'faceThreshold',
    'totp',
    'freeMode',
    'serviceStatus',
    'online',
    'signInAvailable',
    'maintenanceMode',
    'jwtReady',
    'dbReady',
    'reason'
  ];

  return keys.every((key) => left?.[key] === right?.[key]);
};

const areUsersStructurallyEqual = (left, right) => {
  if (left === right) {
    return true;
  }

  if (!left || !right) {
    return left === right;
  }

  const keys = [
    '_id',
    'id',
    'name',
    'email',
    'role',
    'subRole',
    'designation',
    'department',
    'stream',
    'isFirstLogin',
    'isTwoFactorEnabled',
    'is2FAEnabled'
  ];

  return keys.every((key) => left?.[key] === right?.[key]);
};

const applyHealthToStatus = (status = {}, health = {}) => {
  const online = getOnlineState();
  const serviceStatus = health?.status || 'ok';
  const maintenanceMode = Boolean(health?.maintenanceMode);
  const dbReady = health?.dbReady ?? (health?.dbState ? health.dbState === 'connected' : true);
  const jwtReady = health?.jwtReady ?? health?.jwtSecret ?? true;
  const degraded = Boolean(serviceStatus && !['ok', 'ready'].includes(serviceStatus));
  const signInAvailable = online && (typeof health?.signInAvailable === 'boolean'
    ? health.signInAvailable
    : dbReady && jwtReady && !maintenanceMode);
  const webAuthnAvailable = Boolean(status.webAuthn) && signInAvailable;
  const faceAuthAvailable = Boolean(status.faceAuth ?? true) && signInAvailable;

  return {
    ...status,
    serviceStatus,
    jwtReady,
    dbReady,
    maintenanceMode,
    online,
    signInAvailable,
    webAuthn: webAuthnAvailable,
    faceAuth: faceAuthAvailable,
    faceThreshold: Number(status.faceThreshold || 0.86),
    reason: !online
      ? 'You are offline. Sign-in and passkeys are paused until the network returns.'
      : maintenanceMode
        ? 'Platform maintenance is active. Secure sign-in will resume shortly.'
        : serviceStatus === 'starting'
          ? health?.reason || 'Secure sign-in is starting up. Retry in a few moments.'
        : !dbReady
          ? 'Secure sign-in is warming up. Retry in a few moments.'
          : !jwtReady
            ? 'Auth service configuration is incomplete.'
            : health?.reason || status.reason || (degraded ? 'Auth service is degraded. Passkeys are temporarily paused.' : null)
  };
};

const fetchAuthRuntimeStatus = async () => {
  try {
    const [{ data: status }, { data: health }] = await Promise.all([
      api.get('/auth/status', {
        cache: {
          maxAge: AUTH_RUNTIME_CACHE_MS,
          staleWhileRevalidate: true,
          revalidateAfter: 5000,
          persist: true
        }
      }),
      api.get('/auth/health', {
        cache: {
          maxAge: AUTH_RUNTIME_CACHE_MS,
          staleWhileRevalidate: true,
          revalidateAfter: 5000,
          persist: true
        }
      })
    ]);

    return applyHealthToStatus(status, health);
  } catch {
    return applyHealthToStatus({
      ...DEFAULT_AUTH_STATUS,
      webAuthn: false,
      faceAuth: true,
      reason: 'Auth status probe unavailable. Falling back to protected mode.'
    }, {
      status: 'ok',
      jwtSecret: true,
      dbReady: true,
      maintenanceMode: false
    });
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState(DEFAULT_AUTH_STATUS);
  const authStatusRequestRef = useRef(null);
  const lastAuthStatusRefreshRef = useRef(0);
  const latestAuthStatusRef = useRef(DEFAULT_AUTH_STATUS);

  const commitUser = useCallback((nextUser) => {
    startTransition(() => {
      setUser((prev) => (areUsersStructurallyEqual(prev, nextUser) ? prev : nextUser));
    });
  }, []);

  const commitAuthStatus = useCallback((nextStatus) => {
    latestAuthStatusRef.current = nextStatus;
    startTransition(() => {
      setAuthStatus((prev) => (areAuthStatusesEqual(prev, nextStatus) ? prev : nextStatus));
    });
    return nextStatus;
  }, []);

  const refreshAuthStatus = useCallback(async (options = {}) => {
    const force = options.force === true;
    const now = Date.now();

    if (!force && authStatusRequestRef.current) {
      return authStatusRequestRef.current;
    }

    if (!force && (now - lastAuthStatusRefreshRef.current) < AUTH_STATUS_REFRESH_DEDUPE_MS) {
      return latestAuthStatusRef.current;
    }

    const request = fetchAuthRuntimeStatus()
      .then((nextStatus) => {
        lastAuthStatusRefreshRef.current = Date.now();
        return commitAuthStatus(nextStatus);
      })
      .finally(() => {
        authStatusRequestRef.current = null;
      });

    authStatusRequestRef.current = request;
    return request;
  }, [commitAuthStatus]);

  useEffect(() => {
    let cancelled = false;
    let syncTimer = null;

    const refreshCapabilities = async (options = {}) => {
      const nextStatus = await refreshAuthStatus(options);
      return nextStatus;
    };

    const initAuth = async () => {
      try {
        await refreshCapabilities();

        const storedToken = safeLocalStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          const storedUser = readStoredUser();
          if (!cancelled && storedUser) {
            commitUser(storedUser);
          }

          try {
            authLog('[Auth] Session detected, verifying identity...');
            const { data } = await api.get('/auth/profile', {
              headers: { 'X-Silent-Auth-Check': 'true' },
              cache: {
                maxAge: PROFILE_CACHE_MS,
                staleWhileRevalidate: true,
                revalidateAfter: 7000,
                persist: true,
                onUpdate: (response) => {
                  if (cancelled) {
                    return;
                  }

                  const nextUser = response?.data?.user;
                  if (!nextUser) {
                    return;
                  }

                  safeLocalStorage.setItem(USER_KEY, JSON.stringify(nextUser));
                  commitUser(nextUser);
                }
              }
            });

            if (data?.silentAuthFailed) {
              authWarn('[Auth] Session silently expired - clearing token');
              if (!cancelled) {
                clearStoredSession();
                commitUser(null);
              }
            } else if (!cancelled && data?.user) {
              safeLocalStorage.setItem(USER_KEY, JSON.stringify(data.user));
              commitUser(data.user);
            }
          } catch (err) {
            const status = err?.response?.status;
            const code = err?.response?.data?.code;

            if (status === 401 || status === 403) {
              authWarn('[Auth] Session expired - clearing token', err.message);
              if (!cancelled) {
                clearStoredSession();
                commitUser(null);
              }
            } else {
              authWarn('[Auth] Session verification deferred - keeping cached session', err.message || code || 'temporary failure');
              if (!cancelled && storedUser) {
                commitUser(storedUser);
              }
            }
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          authLog('[Auth] Initialization complete.');
        }
      }
    };

    initAuth();

    const safety = setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
        authLog('[Auth] Safety mount triggered (Cold Start Buffer).');
      }
    }, 10000);

    const syncNetworkState = async () => {
      if (!cancelled) {
        if (getOnlineState()) {
          await refreshCapabilities({ force: true });
          return;
        }
        startTransition(() => {
          setAuthStatus((prev) => {
            const next = applyHealthToStatus(prev, {
              status: prev.serviceStatus,
              jwtSecret: prev.jwtReady,
              dbReady: prev.dbReady,
              maintenanceMode: prev.maintenanceMode
            });
            latestAuthStatusRef.current = next;
            return areAuthStatusesEqual(prev, next) ? prev : next;
          });
        });
      }
    };

    const handleVisibilityChange = () => {
      if (!cancelled && typeof document !== 'undefined' && document.visibilityState === 'visible') {
        void refreshCapabilities({ force: true });
      }
    };

    const syncSessionFromStorage = () => {
      if (cancelled) return;

      const storedToken = safeLocalStorage.getItem(TOKEN_KEY);
      const storedUser = readStoredUser();

      if (!storedToken || !storedUser) {
        clearStoredSession({ broadcast: false });
        commitUser(null);
        return;
      }

      commitUser(storedUser);
    };

    const handleAuthEvent = (event) => {
      if (cancelled || !event?.type) return;

      if (syncTimer) {
        clearTimeout(syncTimer);
      }

      syncTimer = setTimeout(() => {
        if (event.type === 'session-cleared') {
          clearStoredSession({ broadcast: false });
          commitUser(null);
          return;
        }

        if (event.type === 'session-updated') {
          syncSessionFromStorage();
        }
      }, 60);
    };

    const healthProbe = setInterval(() => {
      if (!cancelled) {
        void refreshCapabilities();
      }
    }, getAuthHealthProbeIntervalMs());

    const unsubscribeAuthEvents = subscribeToAuthEvents(handleAuthEvent);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', syncNetworkState);
      window.addEventListener('offline', syncNetworkState);
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      cancelled = true;
      clearTimeout(safety);
      clearInterval(healthProbe);
      if (syncTimer) {
        clearTimeout(syncTimer);
      }
      unsubscribeAuthEvents();
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', syncNetworkState);
        window.removeEventListener('offline', syncNetworkState);
      }
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, []);

  const login = async (email, password) => {
    try {
      if (authStatus.signInAvailable === false) {
        throw new Error(authStatus.reason || 'Secure sign-in temporarily unavailable. Please retry.');
      }
      const { data } = await api.post('/auth/login', { email, password }, { timeout: AUTH_REQUEST_TIMEOUT_MS });
      if (data.token && data.user) {
        persistSession(data.token, data.user, commitUser);
      }
      return data;
    } catch (err) {
      throw new Error(getErrorMessage(err, 'Invalid credentials'));
    }
  };

  const verify2FA = async (authRef, otpToken) => {
    try {
      if (authStatus.signInAvailable === false) {
        throw new Error(authStatus.reason || 'Secure sign-in temporarily unavailable. Please retry.');
      }
      const userId = authRef && typeof authRef === 'object' ? authRef.userId || null : authRef || null;
      const pendingAuthToken = authRef && typeof authRef === 'object' ? authRef.pendingAuthToken || null : null;
      const { data } = await api.post('/auth/verify-2fa', { userId, pendingAuthToken, token: otpToken }, { timeout: AUTH_REQUEST_TIMEOUT_MS });
      if (data.token && data.user) {
        persistSession(data.token, data.user, commitUser);
      }
      return data;
    } catch (err) {
      if (isAuthFlowError(err)) {
        clearStoredSession({ broadcast: false });
      }
      throw new Error(getErrorMessage(err, 'Invalid OTP'));
    }
  };

  const verifyBiometric = async () => {
    throw new Error('Legacy biometric endpoint disabled. Use passkey verification instead.');
  };

  const registerBiometrics = async (authRef, nickname, options = {}) => {
    const runtime = await loadAdvancedAuthRuntime();
    return runtime.registerBiometrics({
      authStatus,
      authRef,
      nickname,
      options,
      api,
      persistAuthSession: (token, user) => persistSession(token, user, commitUser),
      clearAuthFlowSession: () => clearStoredSession({ broadcast: false }),
      isAuthFlowError,
      getErrorMessage
    });
  };

  const authenticateBiometrics = async (authRef) => {
    const runtime = await loadAdvancedAuthRuntime();
    return runtime.authenticateBiometrics({
      authStatus,
      authRef,
      api,
      persistAuthSession: (token, user) => persistSession(token, user, commitUser),
      clearAuthFlowSession: () => clearStoredSession({ broadcast: false }),
      isAuthFlowError,
      getErrorMessage,
      onError: authError
    });
  };

  const bypassBiometrics = async (authRef, reason = 'user-fallback') => {
    const runtime = await loadAdvancedAuthRuntime();
    return runtime.bypassBiometrics({
      authStatus,
      authRef,
      reason,
      api,
      persistAuthSession: (token, user) => persistSession(token, user, commitUser),
      clearAuthFlowSession: () => clearStoredSession({ broadcast: false }),
      isAuthFlowError,
      getErrorMessage
    });
  };

  const getFaceChallenge = async (authRef) => {
    const runtime = await loadAdvancedAuthRuntime();
    return runtime.getFaceChallenge({
      authStatus,
      authRef,
      api,
      clearAuthFlowSession: () => clearStoredSession({ broadcast: false }),
      isAuthFlowError,
      getErrorMessage
    });
  };

  const enrollFaceAuthentication = async (authRef, payload = {}) => {
    const runtime = await loadAdvancedAuthRuntime();
    return runtime.enrollFaceAuthentication({
      authStatus,
      authRef,
      payload,
      api,
      persistAuthSession: (token, user) => persistSession(token, user, commitUser),
      clearAuthFlowSession: () => clearStoredSession({ broadcast: false }),
      isAuthFlowError,
      getErrorMessage
    });
  };

  const authenticateFace = async (authRef, payload = {}) => {
    const runtime = await loadAdvancedAuthRuntime();
    return runtime.authenticateFace({
      authStatus,
      authRef,
      payload,
      api,
      persistAuthSession: (token, user) => persistSession(token, user, commitUser),
      clearAuthFlowSession: () => clearStoredSession({ broadcast: false }),
      isAuthFlowError,
      getErrorMessage
    });
  };

  const getFaceAuthStatus = async (userId) => {
    const runtime = await loadAdvancedAuthRuntime();
    return runtime.getFaceAuthStatus({
      userId,
      api,
      getErrorMessage
    });
  };

  const disableFaceAuthentication = async (userId) => {
    const runtime = await loadAdvancedAuthRuntime();
    return runtime.disableFaceAuthentication({
      userId,
      api,
      getErrorMessage
    });
  };

  const logout = () => {
    commitUser(null);
    clearStoredSession();
  };

  const updateCurrentUser = (nextUser) => {
    if (!nextUser) {
      return;
    }

    const resolvedUser = typeof nextUser === 'function' ? nextUser(readStoredUser() || user || null) : nextUser;
    if (!resolvedUser) {
      return;
    }

    safeLocalStorage.setItem(USER_KEY, JSON.stringify(resolvedUser));
    commitUser(resolvedUser);
    emitAuthEvent('session-updated', {
      userId: resolvedUser?._id || resolvedUser?.id || null
    });
  };

  const completeSetup = async (authRef) => {
    try {
      if (authStatus.signInAvailable === false) {
        throw new Error(authStatus.reason || 'Secure sign-in temporarily unavailable. Please retry.');
      }
      const userId = authRef && typeof authRef === 'object' ? authRef.userId || null : authRef || null;
      const pendingAuthToken = authRef && typeof authRef === 'object' ? authRef.pendingAuthToken || null : null;
      const { data } = await api.post('/auth/complete-setup', { userId, pendingAuthToken }, { timeout: AUTH_SETUP_TIMEOUT_MS });
      if (data.token && data.user) {
        persistSession(data.token, data.user, commitUser);
      }
      return data.user;
    } catch (err) {
      if (isAuthFlowError(err)) {
        clearStoredSession({ broadcast: false });
      }
      throw new Error(getErrorMessage(err, 'Failed to complete setup'));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authStatus,
      refreshAuthStatus,
      login,
      verify2FA,
      registerBiometrics,
        authenticateBiometrics,
        bypassBiometrics,
        getFaceChallenge,
        enrollFaceAuthentication,
        authenticateFace,
        getFaceAuthStatus,
        disableFaceAuthentication,
        verifyBiometric,
        completeSetup,
        logout,
        setUser: updateCurrentUser,
        updateCurrentUser
      }}
      >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // In a stable production environment, we return a safe mock during initial hydration races
    // to prevent immediate bridge crashes.
    return {
      user: null,
      loading: true,
      authStatus: DEFAULT_AUTH_STATUS,
      refreshAuthStatus: async () => DEFAULT_AUTH_STATUS,
      login: async () => { throw new Error('Auth bridge initializing'); },
      verify2FA: async () => { throw new Error('Auth bridge initializing'); },
      registerBiometrics: async () => { throw new Error('Auth bridge initializing'); },
      authenticateBiometrics: async () => { throw new Error('Auth bridge initializing'); },
      bypassBiometrics: async () => { throw new Error('Auth bridge initializing'); },
      getFaceChallenge: async () => { throw new Error('Auth bridge initializing'); },
      enrollFaceAuthentication: async () => { throw new Error('Auth bridge initializing'); },
      authenticateFace: async () => { throw new Error('Auth bridge initializing'); },
      getFaceAuthStatus: async () => { throw new Error('Auth bridge initializing'); },
      disableFaceAuthentication: async () => { throw new Error('Auth bridge initializing'); },
      logout: () => {},
      updateCurrentUser: () => {}
    };
  }
  return context;
};
