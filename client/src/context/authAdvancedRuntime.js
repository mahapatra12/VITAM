import { getPasskeyUnavailableReason } from '../utils/passkeySupport';

const resolveAuthFlowPayload = (authRef) => {
  if (authRef && typeof authRef === 'object') {
    return {
      userId: authRef.userId || null,
      pendingAuthToken: authRef.pendingAuthToken || null
    };
  }

  return {
    userId: authRef || null,
    pendingAuthToken: null
  };
};

const PASSKEY_OPTIONS_TIMEOUT_MS = 20000;
const PASSKEY_VERIFY_TIMEOUT_MS = 30000;
const PASSKEY_PROMPT_TIMEOUT_MS = 125000;
const FACE_AUTH_TIMEOUT_MS = 15000;

const resolveWebAuthnOptionsJSON = (payload, mode) => {
  const optionsJSON = payload?.optionsJSON || payload;
  if (!optionsJSON || typeof optionsJSON !== 'object') {
    throw new Error(`${mode} options missing`);
  }
  if (!optionsJSON.challenge) {
    throw new Error(`${mode} options missing challenge`);
  }
  return optionsJSON;
};

const assertWebAuthnChallenge = (optionsJSON, mode) => {
  if (!optionsJSON?.challenge || typeof optionsJSON.challenge !== 'string') {
    throw new Error(`${mode} challenge is missing from server response`);
  }
};

const getPasskeyErrorMessage = (err, fallback, getErrorMessage) => {
  const serverCode = err?.response?.data?.code;
  const domName = err?.name || err?.cause?.name;

  if (serverCode === 'WEBAUTHN_UNAVAILABLE' || serverCode === 'WEBAUTHN_CONFIGURATION_ERROR') {
    return 'Passkey service temporarily unavailable. Continue with OTP.';
  }
  if (serverCode === 'WEBAUTHN_CHALLENGE_EXPIRED' || serverCode === 'WEBAUTHN_CHALLENGE_INVALID') {
    return 'Passkey session expired. Tap again to retry.';
  }
  if (serverCode === 'DEVICE_LIMIT_REACHED') {
    return 'You already have 2 registered devices. Remove one before adding another.';
  }
  if (serverCode === 'CREDENTIAL_ALREADY_REGISTERED') {
    return 'This device is already registered.';
  }
  if (serverCode === 'NO_PASSKEY_REGISTERED') {
    return 'No passkey is registered for this account on the server yet.';
  }
  if (serverCode === 'CREDENTIAL_NOT_FOUND') {
    return 'This device is not recognized. Use a registered device or continue with OTP.';
  }
  if (serverCode === 'INVALID_BIOMETRIC_PAYLOAD') {
    return 'The passkey response was incomplete. Please retry.';
  }
  if (serverCode === 'INVALID_CREDENTIAL_ID') {
    return 'Saved device reference is invalid. Remove the device and register it again.';
  }
  if (serverCode === 'WEBAUTHN_VERIFICATION_FAILED') {
    return 'Passkey verification failed. Retry or continue with OTP.';
  }

  if (domName === 'NotAllowedError') {
    return 'Passkey prompt was cancelled or timed out. Retry to continue.';
  }
  if (domName === 'InvalidStateError') {
    return 'This passkey is already registered on this device.';
  }
  if (domName === 'AbortError') {
    return 'Passkey request was interrupted. Please retry.';
  }
  if (domName === 'SecurityError') {
    return getPasskeyUnavailableReason({ webAuthn: true }) || 'Passkeys require a secure browser context.';
  }

  return getErrorMessage(err, fallback);
};

const getFaceErrorMessage = (err, fallback, getErrorMessage) => {
  const serverCode = err?.response?.data?.code;
  const attemptsRemaining = Number(err?.response?.data?.attemptsRemaining);
  const retryAfterSec = Number(err?.response?.data?.retryAfterSec);
  const retryMinutes = Number.isFinite(retryAfterSec) ? Math.max(1, Math.ceil(retryAfterSec / 60)) : null;

  if (serverCode === 'FACE_AUTH_NOT_ENROLLED') {
    return 'Face authentication is not enrolled for this account yet.';
  }
  if (serverCode === 'FACE_CHALLENGE_MISSING' || serverCode === 'FACE_CHALLENGE_EXPIRED') {
    return 'Face challenge expired. Please request a new challenge.';
  }
  if (serverCode === 'FACE_CHALLENGE_INVALID') {
    if (Number.isFinite(attemptsRemaining)) {
      return `Challenge text does not match. Remaining attempts: ${attemptsRemaining}.`;
    }
    return 'Challenge text does not match. Please retry.';
  }
  if (serverCode === 'FACE_AUTH_LOCKED') {
    if (retryMinutes) {
      return `Face authentication is temporarily locked. Retry in ${retryMinutes} minute(s).`;
    }
    return 'Face authentication is temporarily locked after repeated failures.';
  }
  if (serverCode === 'FACE_MISMATCH') {
    return 'Face verification did not match. Improve lighting and try again.';
  }
  if (serverCode?.startsWith('INVALID_FACE_DESCRIPTOR')) {
    return 'Face capture quality is too low. Capture again with a clear camera view.';
  }

  return getErrorMessage(err, fallback);
};

const throwIfSignInUnavailable = (authStatus) => {
  if (authStatus?.signInAvailable === false) {
    throw new Error(authStatus.reason || 'Secure sign-in temporarily unavailable. Please retry.');
  }
};

const throwIfPasskeysUnavailable = (authStatus) => {
  const unavailableReason = getPasskeyUnavailableReason(authStatus);
  if (unavailableReason) {
    throw new Error(unavailableReason);
  }
};

export const registerBiometrics = async ({
  authStatus,
  authRef,
  nickname,
  options = {},
  api,
  persistAuthSession,
  clearAuthFlowSession,
  isAuthFlowError,
  getErrorMessage
}) => {
  try {
    throwIfSignInUnavailable(authStatus);
    throwIfPasskeysUnavailable(authStatus);

    const { userId, pendingAuthToken } = resolveAuthFlowPayload(authRef);
    const { startRegistration } = await import('@simplewebauthn/browser');
    const { data: registrationPayload } = await api.post('/auth/register-options', { userId, pendingAuthToken }, { timeout: PASSKEY_OPTIONS_TIMEOUT_MS });
    const registrationOptions = resolveWebAuthnOptionsJSON(registrationPayload, 'Registration');
    assertWebAuthnChallenge(registrationOptions, 'Registration');

    const attResp = await Promise.race([
      startRegistration({ optionsJSON: registrationOptions }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Passkey timed out. Retry or use OTP.')), PASSKEY_PROMPT_TIMEOUT_MS))
    ]);

    const { data: verification } = await api.post('/auth/verify-registration', {
      userId,
      pendingAuthToken,
      body: attResp,
      nickname,
      completeLogin: Boolean(options.completeLogin)
    }, { timeout: PASSKEY_VERIFY_TIMEOUT_MS });

    if (verification.token && verification.user) {
      persistAuthSession(verification.token, verification.user);
    }

    return verification;
  } catch (err) {
    if (isAuthFlowError(err)) {
      clearAuthFlowSession();
    }
    throw new Error(getPasskeyErrorMessage(err, err?.message || 'Biometric registration failed', getErrorMessage));
  }
};

export const authenticateBiometrics = async ({
  authStatus,
  authRef,
  api,
  persistAuthSession,
  clearAuthFlowSession,
  isAuthFlowError,
  getErrorMessage,
  onError
}) => {
  try {
    throwIfSignInUnavailable(authStatus);
    throwIfPasskeysUnavailable(authStatus);

    const { userId, pendingAuthToken } = resolveAuthFlowPayload(authRef);
    const { startAuthentication } = await import('@simplewebauthn/browser');
    const { data: authPayload } = await api.post('/auth/auth-options', { userId, pendingAuthToken }, { timeout: PASSKEY_OPTIONS_TIMEOUT_MS });
    const authOptions = resolveWebAuthnOptionsJSON(authPayload, 'Authentication');
    assertWebAuthnChallenge(authOptions, 'Authentication');

    const authResp = await Promise.race([
      startAuthentication({ optionsJSON: authOptions }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Passkey timed out. Use OTP instead.')), PASSKEY_PROMPT_TIMEOUT_MS))
    ]);

    const { data: verification } = await api.post('/auth/verify-auth', {
      userId,
      pendingAuthToken,
      body: authResp
    }, { timeout: PASSKEY_VERIFY_TIMEOUT_MS });

    if (!verification.verified || !verification.token || !verification.user) {
      throw new Error('Authentication failed');
    }

    persistAuthSession(verification.token, verification.user);
    return verification.user;
  } catch (err) {
    if (isAuthFlowError(err)) {
      clearAuthFlowSession();
    }
    onError?.('Authentication failed:', err);
    throw new Error(getPasskeyErrorMessage(err, 'Biometric authentication failed. Please try again.', getErrorMessage));
  }
};

export const bypassBiometrics = async ({
  authStatus,
  authRef,
  reason = 'user-fallback',
  api,
  persistAuthSession,
  clearAuthFlowSession,
  isAuthFlowError,
  getErrorMessage
}) => {
  try {
    throwIfSignInUnavailable(authStatus);

    const { userId, pendingAuthToken } = resolveAuthFlowPayload(authRef);
    const { data } = await api.post('/auth/bypass-biometric', {
      userId,
      pendingAuthToken,
      reason
    }, { timeout: PASSKEY_VERIFY_TIMEOUT_MS });

    if (!data?.token || !data?.user) {
      throw new Error('Unable to complete fallback sign-in.');
    }

    persistAuthSession(data.token, data.user);
    return data.user;
  } catch (err) {
    if (isAuthFlowError(err)) {
      clearAuthFlowSession();
    }
    throw new Error(getPasskeyErrorMessage(err, 'Unable to bypass biometric step right now.', getErrorMessage));
  }
};

export const getFaceChallenge = async ({
  authStatus,
  authRef,
  api,
  clearAuthFlowSession,
  isAuthFlowError,
  getErrorMessage
}) => {
  try {
    throwIfSignInUnavailable(authStatus);
    const { userId, pendingAuthToken } = resolveAuthFlowPayload(authRef);
    const { data } = await api.post('/auth/face/challenge', { userId, pendingAuthToken }, { timeout: FACE_AUTH_TIMEOUT_MS });
    return data;
  } catch (err) {
    if (isAuthFlowError(err)) {
      clearAuthFlowSession();
    }
    throw new Error(getFaceErrorMessage(err, 'Unable to issue face challenge right now.', getErrorMessage));
  }
};

export const enrollFaceAuthentication = async ({
  authStatus,
  authRef,
  payload = {},
  api,
  persistAuthSession,
  clearAuthFlowSession,
  isAuthFlowError,
  getErrorMessage
}) => {
  try {
    throwIfSignInUnavailable(authStatus);
    const { userId, pendingAuthToken } = resolveAuthFlowPayload(authRef);
    const requestBody = {
      userId,
      pendingAuthToken,
      challengeResponse: payload.challengeResponse,
      descriptors: payload.descriptors,
      captureMeta: payload.captureMeta,
      completeLogin: Boolean(payload.completeLogin)
    };
    const { data } = await api.post('/auth/face/enroll', requestBody, { timeout: FACE_AUTH_TIMEOUT_MS });
    if (data.token && data.user) {
      persistAuthSession(data.token, data.user);
    }
    return data;
  } catch (err) {
    if (isAuthFlowError(err)) {
      clearAuthFlowSession();
    }
    throw new Error(getFaceErrorMessage(err, 'Face enrollment failed. Please retry.', getErrorMessage));
  }
};

export const authenticateFace = async ({
  authStatus,
  authRef,
  payload = {},
  api,
  persistAuthSession,
  clearAuthFlowSession,
  isAuthFlowError,
  getErrorMessage
}) => {
  try {
    throwIfSignInUnavailable(authStatus);
    const { userId, pendingAuthToken } = resolveAuthFlowPayload(authRef);
    const requestBody = {
      userId,
      pendingAuthToken,
      challengeResponse: payload.challengeResponse,
      descriptor: payload.descriptor
    };
    const { data } = await api.post('/auth/face/verify', requestBody, { timeout: FACE_AUTH_TIMEOUT_MS });
    if (data.token && data.user) {
      persistAuthSession(data.token, data.user);
    }
    return data;
  } catch (err) {
    if (isAuthFlowError(err)) {
      clearAuthFlowSession();
    }
    throw new Error(getFaceErrorMessage(err, 'Face verification failed. Please retry.', getErrorMessage));
  }
};

export const getFaceAuthStatus = async ({
  userId,
  api,
  getErrorMessage
}) => {
  try {
    const { data } = await api.get(`/auth/face/status/${userId}`, { timeout: FACE_AUTH_TIMEOUT_MS });
    return data?.faceAuth || null;
  } catch (err) {
    throw new Error(getFaceErrorMessage(err, 'Unable to load face authentication status.', getErrorMessage));
  }
};

export const disableFaceAuthentication = async ({
  userId,
  api,
  getErrorMessage
}) => {
  try {
    const { data } = await api.post('/auth/face/disable', { userId }, { timeout: FACE_AUTH_TIMEOUT_MS });
    return data?.faceAuth || null;
  } catch (err) {
    throw new Error(getFaceErrorMessage(err, 'Unable to disable face authentication.', getErrorMessage));
  }
};
