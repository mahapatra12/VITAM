import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Copy, Fingerprint, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPathForUser } from '../../utils/routing';
import {
  clearSecuritySetupFlow,
  getSecuritySetupFlow,
  saveSecuritySetupFlow
} from '../../utils/authFlowStorage';
import { writeClipboardText } from '../../utils/clipboard';
import { prefetchPostAuthRouteForUser } from '../../utils/authRoutePrefetch';
import {
  cancelAuthJourneyWarmup,
  scheduleAuthJourneyWarmup,
  warmAuthJourney
} from '../../utils/authJourneyWarmup';
import { announceNavigationStart } from '../../utils/navigationSignals';
import { scheduleHardRedirectFallback } from '../../utils/navigationFallback';
import { getPasskeySupportState } from '../../utils/passkeySupport';

const isRecoverableFlowMessage = (message = '') =>
  /(session expired|out of sync|restart sign-?in|verification step is out of sync|setup is already completed)/i.test(String(message));

const SecuritySetup = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, verify2FA, registerBiometrics, completeSetup, authStatus } = useAuth();
  const [setupFlow, setSetupFlow] = useState(() => state || getSecuritySetupFlow());
  const [step, setStep] = useState(() => (state || getSecuritySetupFlow())?.step || 1);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [finalizedUser, setFinalizedUser] = useState(null);
  const inFlightRef = useRef(false);
  const warmupHandleRef = useRef(null);
  const redirectFallbackRef = useRef(null);

  const navigateToUserDashboard = (nextUser) => {
    if (!nextUser) {
      return;
    }

    const targetPath = getDashboardPathForUser(nextUser);
    redirectFallbackRef.current?.();
    announceNavigationStart({ path: targetPath, source: 'auth-setup' });
    void prefetchPostAuthRouteForUser(nextUser);
    redirectFallbackRef.current = scheduleHardRedirectFallback(targetPath);
    startTransition(() => {
      navigate(targetPath, { replace: true });
    });
  };

  const passkeySupport = useMemo(() => getPasskeySupportState(authStatus), [authStatus]);
  const passkeysReady = passkeySupport.available;

  useEffect(() => {
    if (state?.userId) {
      setSetupFlow((prev) => {
        const nextFlow = {
          ...(prev || {}),
          ...state,
          step: state.step || prev?.step || 1
        };
        saveSecuritySetupFlow(nextFlow);
        return nextFlow;
      });
    }
  }, [state]);

  useEffect(() => {
    if (user) {
      clearSecuritySetupFlow();
      navigateToUserDashboard(user);
    }
  }, [user]);

  useEffect(() => {
    if (!setupFlow?.userId) {
      navigate('/login', { replace: true });
      return;
    }
    if (!setupFlow?.pendingAuthToken) {
      clearSecuritySetupFlow();
      navigate('/login', {
        replace: true,
        state: { notice: 'Secure setup session expired. Please sign in again.' }
      });
    }
  }, [navigate, setupFlow?.pendingAuthToken, setupFlow?.userId]);

  useEffect(() => {
    cancelAuthJourneyWarmup(warmupHandleRef.current);
    warmupHandleRef.current = scheduleAuthJourneyWarmup({
      advancedSecurity: true,
      passkeys: step >= 2
    });

    if (step >= 2) {
      void warmAuthJourney({
        advancedSecurity: true,
        passkeys: true
      });
    }

    return () => {
      cancelAuthJourneyWarmup(warmupHandleRef.current);
      warmupHandleRef.current = null;
      redirectFallbackRef.current?.();
      redirectFallbackRef.current = null;
    };
  }, [step]);

  const persistSetupFlow = (overrides = {}) => {
    const nextFlow = { ...(setupFlow || {}), ...overrides };
    setSetupFlow(nextFlow);
    saveSecuritySetupFlow(nextFlow);
  };

  const handleCopy = async () => {
    if (!setupFlow?.totpSecret) return;
    try {
      await writeClipboardText(setupFlow.totpSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      setError(err.message || 'Unable to copy secret.');
    }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    if (inFlightRef.current || !otp.trim()) return;

    inFlightRef.current = true;
    setLoading(true);
    setError('');

    try {
      const result = await verify2FA(
        { userId: setupFlow.userId, pendingAuthToken: setupFlow.pendingAuthToken },
        otp.trim()
      );
      const nextStep = result?.requiresBiometric && passkeysReady ? 2 : 3;
      setStep(nextStep);
      persistSetupFlow({
        step: nextStep,
        pendingAuthToken: result?.pendingAuthToken || setupFlow.pendingAuthToken
      });
    } catch (err) {
      const message = err.message || 'Invalid verification code.';
      if (isRecoverableFlowMessage(message)) {
        clearSecuritySetupFlow();
        navigate('/login', {
          replace: true,
          state: { notice: 'Secure setup session expired. Please sign in again.' }
        });
        return;
      }
      setError(message);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    setLoading(true);
    setError('');
    try {
      await warmAuthJourney({
        advancedSecurity: true,
        passkeys: true
      });

      const result = await registerBiometrics(
        { userId: setupFlow.userId, pendingAuthToken: setupFlow.pendingAuthToken },
        'Primary Device',
        { completeLogin: false }
      );
      setStep(3);
      persistSetupFlow({
        step: 3,
        pendingAuthToken: result?.pendingAuthToken || setupFlow.pendingAuthToken
      });
    } catch (err) {
      const message = err.message || 'Passkey registration failed.';
      if (isRecoverableFlowMessage(message)) {
        clearSecuritySetupFlow();
        navigate('/login', {
          replace: true,
          state: { notice: 'Secure setup session expired. Please sign in again.' }
        });
        return;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError('');
    try {
      const completedUser = await completeSetup({
        userId: setupFlow.userId,
        pendingAuthToken: setupFlow.pendingAuthToken
      });
      setFinalizedUser(completedUser || null);
      clearSecuritySetupFlow();
      const targetUser = completedUser || user;
      if (targetUser) {
        navigateToUserDashboard(targetUser);
        return;
      }
      navigate('/login', {
        replace: true,
        state: { notice: 'Session updated. Please sign in again to continue.' }
      });
    } catch (err) {
      const message = err.message || 'Unable to complete setup.';
      if (isRecoverableFlowMessage(message)) {
        clearSecuritySetupFlow();
        navigate('/login', {
          replace: true,
          state: { notice: 'Secure setup session expired. Please sign in again.' }
        });
        return;
      }
      setError(message);
      setLoading(false);
    }
  };

  const handleSecurityIntent = () => {
    cancelAuthJourneyWarmup(warmupHandleRef.current);
    warmupHandleRef.current = null;
    scheduleAuthJourneyWarmup({
      advancedSecurity: true,
      passkeys: step >= 2
    });
  };

  if (!setupFlow?.userId) {
    return null;
  }

  return (
    <div className="appleBackground min-h-screen px-4 py-10 text-slate-100 sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div className="glass-card p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-300">First Login Security Setup</p>
              <h1 className="mt-1 text-2xl font-bold text-white">Activate Account Protection</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-blue-400' : 'bg-slate-600'}`} />
              <span className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-blue-400' : 'bg-slate-600'}`} />
              <span className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-blue-400' : 'bg-slate-600'}`} />
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          )}

          {step === 1 && (
            <form className="space-y-4" onSubmit={handle2FA}>
              <div className="rounded-lg border border-slate-700/70 bg-slate-900/70 p-4">
                <p className="mb-3 text-sm text-slate-200">
                  Scan this QR code in Google Authenticator or Apple Passwords and enter the generated 6-digit code.
                </p>
                {setupFlow?.qrCode && (
                  <div className="flex justify-center pb-3">
                    <img src={setupFlow.qrCode} alt="Authenticator QR" className="h-48 w-48 rounded bg-white p-2" />
                  </div>
                )}
                {setupFlow?.totpSecret && (
                  <div className="flex items-center gap-2 rounded bg-slate-800/70 p-2 text-xs text-slate-200">
                    <code className="flex-1 truncate">{setupFlow.totpSecret}</code>
                    <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={handleCopy}>
                      {copied ? (
                        <>
                          <CheckCircle2 size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-wide text-slate-300">Authenticator code</span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  onFocus={handleSecurityIntent}
                  className="premium-input py-3 text-center text-xl tracking-[0.35em]"
                  placeholder="000000"
                  autoFocus
                  required
                />
              </label>

              <button
                type="submit"
                disabled={loading || otp.trim().length !== 6}
                onMouseEnter={handleSecurityIntent}
                onFocus={handleSecurityIntent}
                className="btn-primary w-full justify-center py-3 disabled:opacity-60"
              >
                {loading ? 'Verifying...' : 'Verify and Continue'}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-700/70 bg-slate-900/70 p-4">
                <p className="text-sm text-slate-200">
                  Register this device passkey to complete secure login quickly next time.
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  If passkey is not supported on this browser, you can skip this step.
                </p>
                {!passkeysReady && passkeySupport.reason && (
                  <p className="mt-3 text-xs text-amber-300">{passkeySupport.reason}</p>
                )}
              </div>

              <button
                type="button"
                onClick={handleBiometric}
                disabled={loading || !passkeysReady}
                onMouseEnter={handleSecurityIntent}
                onFocus={handleSecurityIntent}
                className="btn-primary w-full justify-center py-3 disabled:opacity-60"
              >
                <Fingerprint size={16} />
                {loading ? 'Registering passkey...' : 'Register Passkey'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(3);
                  persistSetupFlow({ step: 3 });
                }}
                className="btn-secondary w-full justify-center py-3"
              >
                Continue without passkey
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-slate-700/70 bg-slate-900/70 p-4">
                <p className="text-sm text-slate-200">Your account setup is almost complete.</p>
                <p className="mt-2 text-xs text-slate-400">
                  Finalize now to activate full access with your selected security methods.
                </p>
              </div>

              <button
                type="button"
                onClick={handleComplete}
                disabled={loading}
                onMouseEnter={handleSecurityIntent}
                onFocus={handleSecurityIntent}
                className="btn-primary w-full justify-center py-3 disabled:opacity-60"
              >
                <ShieldCheck size={16} />
                {loading ? 'Finalizing setup...' : 'Complete Setup'}
              </button>
            </div>
          )}

          {finalizedUser && (
            <div className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              <KeyRound size={16} className="mr-2 inline" />
              Setup completed for {finalizedUser.name}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySetup;
