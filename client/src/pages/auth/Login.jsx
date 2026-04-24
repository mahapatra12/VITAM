import { startTransition, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Fingerprint, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPathForUser } from '../../utils/routing';
import {
  clearPendingAuthFlow,
  getPendingAuthFlow,
  savePendingAuthFlow,
  saveSecuritySetupFlow
} from '../../utils/authFlowStorage';
import { writeClipboardText } from '../../utils/clipboard';
import { prefetchPostAuthRouteForUser, prefetchSetupRoute } from '../../utils/authRoutePrefetch';
import {
  cancelAuthJourneyWarmup,
  scheduleAuthJourneyWarmup,
  warmAuthJourney
} from '../../utils/authJourneyWarmup';
import { announceNavigationStart } from '../../utils/navigationSignals';
import { scheduleHardRedirectFallback } from '../../utils/navigationFallback';
import { getPasskeySupportState } from '../../utils/passkeySupport';

const restoredFlow = getPendingAuthFlow();

const buildPendingFlow = (payload = {}) => ({
  userId: payload.userId || null,
  pendingAuthToken: payload.pendingAuthToken || null,
  qrCode: payload.qrCode || null,
  totpSecret: payload.totpSecret || null,
  totpLabel: payload.totpLabel || '',
  hasBiometrics: Boolean(payload.hasBiometrics),
  needsTotpEnrollment: Boolean(payload.needsTotpEnrollment),
  step: payload.step || 1
});

const isExpiredFlowMessage = (message = '') =>
  /(session expired|out of sync|restart sign-?in|verification step is out of sync)/i.test(String(message));

const STEP_CONTENT = {
  1: {
    eyebrow: 'Step 1 - Identity',
    title: 'Institution Account Login',
    description: 'Use your official email and password assigned by the admin team.'
  },
  2: {
    eyebrow: 'Step 2 - Verification',
    title: 'Two-Factor Verification',
    description: 'Enter the 6-digit code from your authenticator app to continue.'
  },
  3: {
    eyebrow: 'Step 3 - Device Trust',
    title: 'Passkey Verification',
    description: 'Use a registered passkey on this trusted device to complete sign-in.'
  }
};

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const inFlightRef = useRef(false);
  const initialWarmupRef = useRef(null);
  const redirectFallbackRef = useRef(null);

  const [step, setStep] = useState(restoredFlow?.step || 1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState(restoredFlow?.userId || null);
  const [pendingAuthToken, setPendingAuthToken] = useState(restoredFlow?.pendingAuthToken || null);
  const [qrCode, setQrCode] = useState(restoredFlow?.qrCode || null);
  const [totpSecret, setTotpSecret] = useState(restoredFlow?.totpSecret || null);
  const [totpLabel, setTotpLabel] = useState(restoredFlow?.totpLabel || 'VITAM AI');
  const [hasBiometrics, setHasBiometrics] = useState(Boolean(restoredFlow?.hasBiometrics));
  const [needsTotpEnrollment, setNeedsTotpEnrollment] = useState(Boolean(restoredFlow?.needsTotpEnrollment));
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    user,
    login,
    verify2FA,
    registerBiometrics,
    authenticateBiometrics,
    authStatus
  } = useAuth();

  const navigateToUserDashboard = (nextUser) => {
    if (!nextUser) {
      return;
    }

    const targetPath = getDashboardPathForUser(nextUser);
    redirectFallbackRef.current?.();
    announceNavigationStart({ path: targetPath, source: 'auth-login' });
    void prefetchPostAuthRouteForUser(nextUser);
    redirectFallbackRef.current = scheduleHardRedirectFallback(targetPath);
    startTransition(() => {
      navigate(targetPath, { replace: true });
    });
  };

  const currentStep = STEP_CONTENT[step] || STEP_CONTENT[1];
  const normalizedEmail = email.trim().toLowerCase();
  const isEmailReady = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const isPasswordReady = password.trim().length >= 6;
  const passkeySupport = getPasskeySupportState(authStatus);

  useEffect(() => {
    if (location.state?.notice) {
      setNotice(location.state.notice);
    }
  }, [location.state]);

  useEffect(() => {
    initialWarmupRef.current = scheduleAuthJourneyWarmup();

    return () => {
      cancelAuthJourneyWarmup(initialWarmupRef.current);
      initialWarmupRef.current = null;
      redirectFallbackRef.current?.();
      redirectFallbackRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    clearPendingAuthFlow();
    navigateToUserDashboard(user);
  }, [navigate, user]);

  useEffect(() => {
    if (step === 1) {
      return undefined;
    }

    const warmupHandle = scheduleAuthJourneyWarmup({
      advancedSecurity: true,
      passkeys: step >= 2
    });

    if (step >= 3) {
      void warmAuthJourney({
        advancedSecurity: true,
        passkeys: true
      });
    }

    return () => {
      cancelAuthJourneyWarmup(warmupHandle);
    };
  }, [step]);

  const handleAuthIntent = () => {
    cancelAuthJourneyWarmup(initialWarmupRef.current);
    initialWarmupRef.current = null;
    scheduleAuthJourneyWarmup({
      advancedSecurity: step > 1,
      passkeys: step >= 2
    });
  };

  const persistPendingFlow = (overrides = {}) => {
    const nextFlow = buildPendingFlow({
      userId,
      pendingAuthToken,
      qrCode,
      totpSecret,
      totpLabel,
      hasBiometrics,
      needsTotpEnrollment,
      step,
      ...overrides
    });

    if (nextFlow.userId && nextFlow.pendingAuthToken && nextFlow.step > 1) {
      savePendingAuthFlow(nextFlow);
    } else {
      clearPendingAuthFlow();
    }
  };

  const resetPendingState = () => {
    setUserId(null);
    setPendingAuthToken(null);
    setQrCode(null);
    setTotpSecret(null);
    setTotpLabel('VITAM AI');
    setHasBiometrics(false);
    setNeedsTotpEnrollment(false);
    setOtp('');
    clearPendingAuthFlow();
  };

  const handleRestart = () => {
    setStep(1);
    setError('');
    setNotice('');
    setLoading(false);
    resetPendingState();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (inFlightRef.current || loading) return;

    inFlightRef.current = true;
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const emailForAuth = normalizedEmail;
      setEmail(emailForAuth);
      const data = await login(emailForAuth, password);

      const nextState = {
        userId: data.userId || null,
        pendingAuthToken: data.pendingAuthToken || null,
        qrCode: data.qrCode || null,
        totpSecret: data.totpSecret || null,
        totpLabel: data.totpLabel || 'VITAM AI',
        hasBiometrics: Boolean(data.hasBiometrics),
        needsTotpEnrollment: Boolean(data.needsTotpEnrollment)
      };

      setUserId(nextState.userId);
      setPendingAuthToken(nextState.pendingAuthToken);
      setQrCode(nextState.qrCode);
      setTotpSecret(nextState.totpSecret);
      setTotpLabel(nextState.totpLabel);
      setHasBiometrics(nextState.hasBiometrics);
      setNeedsTotpEnrollment(nextState.needsTotpEnrollment);

      if (data.token && data.user) {
        resetPendingState();
        navigateToUserDashboard(data.user);
        return;
      }

      if (data.isFirstLogin) {
        const setupFlow = {
          userId: nextState.userId,
          pendingAuthToken: nextState.pendingAuthToken,
          qrCode: nextState.qrCode,
          totpSecret: nextState.totpSecret,
          totpLabel: nextState.totpLabel,
          step: 1
        };

        clearPendingAuthFlow();
        saveSecuritySetupFlow(setupFlow);
        void prefetchSetupRoute();
        navigate('/setup', { replace: true, state: setupFlow });
        return;
      }

      const nextStep = data.requires2FA ? 2 : data.requiresBiometric ? 3 : 1;
      setStep(nextStep);
      persistPendingFlow({ ...nextState, step: nextStep });
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please retry.');
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const data = await verify2FA({ userId, pendingAuthToken }, otp.trim());
      const nextPendingAuth = data.pendingAuthToken || pendingAuthToken;
      setPendingAuthToken(nextPendingAuth);

      if (data.token && data.user) {
        resetPendingState();
        navigateToUserDashboard(data.user);
        return;
      }

      const nextStep = data.requiresBiometric ? 3 : 1;
      setHasBiometrics(Boolean(data.hasBiometrics));
      setStep(nextStep);
      persistPendingFlow({
        pendingAuthToken: nextPendingAuth,
        hasBiometrics: Boolean(data.hasBiometrics),
        step: nextStep
      });
    } catch (err) {
      const message = err.message || 'Invalid verification code.';
      if (isExpiredFlowMessage(message)) {
        resetPendingState();
        setStep(1);
        setOtp('');
        setNotice('Secure verification session expired. Please sign in again.');
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricFlow = async () => {
    if (loading) return;

    setLoading(true);
    setError('');
    try {
      await warmAuthJourney({
        advancedSecurity: true,
        passkeys: true
      });

      if (hasBiometrics) {
        const signedInUser = await authenticateBiometrics({ userId, pendingAuthToken });
        resetPendingState();
        navigateToUserDashboard(signedInUser);
        return;
      }

      const result = await registerBiometrics({ userId, pendingAuthToken }, 'Primary Device', { completeLogin: true });
      if (result?.token && result?.user) {
        resetPendingState();
        navigateToUserDashboard(result.user);
      }
    } catch (err) {
      const message = err.message || 'Passkey verification failed.';
      if (isExpiredFlowMessage(message)) {
        resetPendingState();
        setStep(1);
        setNotice('Secure verification session expired. Please sign in again.');
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };


  const handleCopySecret = async () => {
    if (!totpSecret) return;
    try {
      await writeClipboardText(totpSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      setError(err?.message || 'Unable to copy authenticator secret.');
    }
  };

  return (
    <div
      className="appleBackground min-h-screen px-4 py-8 text-slate-100 sm:px-6 sm:py-10"
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 2rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)',
      }}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-5 sm:gap-6 lg:grid-cols-2">
        <section className="glass-card hidden p-6 sm:p-8 lg:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">VITAM Access Platform</p>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">Secure Login &amp; Verification</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Sign in with password, verify with authenticator code, and optionally use passkey authentication on trusted
            devices.
          </p>
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <ShieldCheck size={18} className="text-emerald-400" />
              <p className="text-sm">Role-based access and secure session controls</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <KeyRound size={18} className="text-blue-300" />
              <p className="text-sm">Authenticator app support for TOTP</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <Fingerprint size={18} className="text-indigo-300" />
              <p className="text-sm">WebAuthn passkeys (up to 2 trusted devices)</p>
            </div>
          </div>
        </section>

        <section className="glass-card p-5 sm:p-8">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-blue-300">
                {currentStep.eyebrow}
              </p>
              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">{currentStep.title}</h2>
              <p className="mt-1 text-xs text-slate-400">{currentStep.description}</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-appleBlue' : 'bg-white/15'}`} />
              <span className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-appleBlue' : 'bg-white/15'}`} />
              <span className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-appleBlue' : 'bg-white/15'}`} />
            </div>
          </div>

          {notice && (
            <div className="mb-4 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
              {notice}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          )}

          {step === 1 && (
            <form className="space-y-4" onSubmit={handleLogin}>
              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-wide text-slate-300">Email</span>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trimStart())}
                    onFocus={handleAuthIntent}
                    onBlur={() => setEmail((prev) => prev.trim().toLowerCase())}
                    className="premium-input py-3 pl-10 pr-3"
                    placeholder="name@vitam.edu"
                    autoComplete="username"
                    required
                  />
                </div>
              </label>

              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-wide text-slate-300">Password</span>
                <div className="relative">
                  <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={handleAuthIntent}
                    className="premium-input py-3 pl-10 pr-10"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-100"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                disabled={loading || !isEmailReady || !isPasswordReady}
                onMouseEnter={handleAuthIntent}
                onFocus={handleAuthIntent}
                className="btn-primary w-full justify-center py-3 disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form className="space-y-4" onSubmit={handle2FA}>
              {needsTotpEnrollment && qrCode && (
                <div className="rounded-lg border border-slate-700/70 bg-slate-900/70 p-3">
                  <p className="mb-3 text-xs text-slate-300">Scan this QR with Google Authenticator or Apple Passwords.</p>
                  <div className="flex justify-center">
                    <img src={qrCode} alt="Authenticator QR" className="h-44 w-44 rounded bg-white p-2" />
                  </div>
                </div>
              )}

              {totpSecret && (
                <div className="rounded-lg border border-slate-700/70 bg-slate-900/70 p-3 text-xs text-slate-300">
                  <p className="mb-2">Manual key ({totpLabel || 'VITAM'}):</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded bg-slate-800 px-2 py-1 text-[11px]">{totpSecret}</code>
                    <button type="button" onClick={handleCopySecret} className="btn-secondary px-3 py-1.5 text-xs">
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-wide text-slate-300">Authenticator code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="premium-input py-3 text-center text-xl tracking-[0.35em]"
                  placeholder="000000"
                  autoFocus
                  required
                />
              </label>

              <button
                type="submit"
                disabled={loading || otp.trim().length !== 6}
                onMouseEnter={handleAuthIntent}
                onFocus={handleAuthIntent}
                className="btn-primary w-full justify-center py-3 disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-700/70 bg-slate-900/70 p-4">
                <p className="text-sm text-slate-200">
                  {hasBiometrics
                    ? 'Use your registered passkey to complete sign-in.'
                    : 'No passkey is registered for this account yet. Register this device to continue.'}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  WebAuthn: {authStatus?.webAuthn ? 'available' : 'unavailable'}.
                </p>
                {!passkeySupport.available && passkeySupport.reason && (
                  <p className="mt-3 text-xs text-amber-300">{passkeySupport.reason}</p>
                )}
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={handleBiometricFlow}
                  disabled={loading || !passkeySupport.available}
                  onMouseEnter={handleAuthIntent}
                  onFocus={handleAuthIntent}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-60"
                >
                  <Fingerprint size={16} />
                  {loading ? 'Waiting for passkey...' : hasBiometrics ? 'Use Passkey' : 'Register Passkey'}
                </button>
              </div>
            </div>
          )}

          {step > 1 && (
            <div className="mt-6 text-center">
              <button type="button" onClick={handleRestart} className="text-sm text-slate-300 hover:text-white">
                Restart login
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default LoginPage;
