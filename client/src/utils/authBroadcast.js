import { safeLocalStorage } from './browserStorage';

const AUTH_SYNC_KEY = 'vitam_auth_sync';
const AUTH_SYNC_CHANNEL = 'vitam-auth-sync';
const TOKEN_KEY = 'vitam_token';
const USER_KEY = 'vitam_user';

const isBrowser = () => typeof window !== 'undefined';

let broadcastChannel = null;

const getBroadcastChannel = () => {
  if (!isBrowser() || typeof window.BroadcastChannel === 'undefined') {
    return null;
  }

  if (!broadcastChannel) {
    broadcastChannel = new window.BroadcastChannel(AUTH_SYNC_CHANNEL);
  }

  return broadcastChannel;
};

const parseEvent = (value) => {
  if (!value) return null;

  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch (_) {
    return null;
  }
};

export const emitAuthEvent = (type, payload = {}) => {
  if (!isBrowser()) return;

  const event = {
    type,
    payload,
    emittedAt: Date.now()
  };

  safeLocalStorage.setItem(AUTH_SYNC_KEY, JSON.stringify(event));

  const channel = getBroadcastChannel();
  if (channel) {
    channel.postMessage(event);
  }
};

export const subscribeToAuthEvents = (callback) => {
  if (!isBrowser() || typeof callback !== 'function') {
    return () => {};
  }

  const notify = (event) => {
    if (event?.type) {
      callback(event);
    }
  };

  const handleBroadcast = (event) => {
    notify(event?.data);
  };

  const handleStorage = (event) => {
    if (!event?.key) return;

    if (event.key === AUTH_SYNC_KEY) {
      notify(parseEvent(event.newValue));
      return;
    }

    if (event.key === TOKEN_KEY || event.key === USER_KEY) {
      notify({
        type: event.newValue ? 'session-updated' : 'session-cleared',
        payload: {
          source: event.key
        }
      });
    }
  };

  const channel = getBroadcastChannel();
  if (channel) {
    channel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (channel) {
      channel.removeEventListener('message', handleBroadcast);
    }
  };
};
