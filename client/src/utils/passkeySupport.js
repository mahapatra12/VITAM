const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

const buildPreferredLocalOrigin = (protocol, port) => {
  const safeProtocol = protocol === 'https:' ? 'https:' : 'http:';
  const safePort = port ? `:${port}` : '';
  return `${safeProtocol}//localhost${safePort}`;
};

const readBrowserOrigin = () => {
  if (typeof window === 'undefined') {
    return {
      origin: '',
      hostname: '',
      protocol: '',
      port: ''
    };
  }

  return {
    origin: window.location.origin || '',
    hostname: window.location.hostname || '',
    protocol: window.location.protocol || '',
    port: window.location.port || ''
  };
};

export const getPasskeySupportState = (authStatus) => {
  if (!authStatus?.webAuthn) {
    return {
      available: false,
      reason: 'Passkey service is currently disabled on the server. Use OTP for now.'
    };
  }

  if (typeof window === 'undefined') {
    return {
      available: false,
      reason: 'Passkeys can only be used in a browser session.'
    };
  }

  if (!window.PublicKeyCredential) {
    return {
      available: false,
      reason: 'This browser does not support passkeys. Use OTP instead.'
    };
  }

  const { origin, hostname, protocol, port } = readBrowserOrigin();
  const isLoopback = LOOPBACK_HOSTS.has(String(hostname || '').toLowerCase());
  const preferredLocalOrigin = buildPreferredLocalOrigin(protocol, port);

  if (window.isSecureContext) {
    return {
      available: true,
      reason: '',
      origin,
      hostname,
      protocol,
      port,
      isLoopback
    };
  }

  if (isLoopback) {
    return {
      available: false,
      reason: `This browser is not treating ${origin} as a secure passkey origin. Reopen the app on ${preferredLocalOrigin} or use HTTPS.`
    };
  }

  return {
    available: false,
    reason: `Passkeys only work on HTTPS or localhost. Current origin: ${origin || 'unknown origin'}. For local testing, use ${preferredLocalOrigin}.`
  };
};

export const getPasskeyUnavailableReason = (authStatus) => getPasskeySupportState(authStatus).reason;
