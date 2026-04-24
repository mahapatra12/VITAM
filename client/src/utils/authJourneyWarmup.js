import { cancelIdleTask, scheduleIdleTask } from './idleTask';
import { getRuntimeProfile } from './runtimeProfile';
import { primeOriginTransport } from './networkPrimer';

let advancedRuntimePromise = null;
let webAuthnBrowserPromise = null;

const warmAdvancedRuntime = () => {
  if (!advancedRuntimePromise) {
    advancedRuntimePromise = import('../context/authAdvancedRuntime');
  }
  return advancedRuntimePromise;
};

const warmWebAuthnBrowser = () => {
  if (!webAuthnBrowserPromise) {
    webAuthnBrowserPromise = import('@simplewebauthn/browser');
  }
  return webAuthnBrowserPromise;
};

export const warmAuthJourney = async (options = {}) => {
  const {
    advancedSecurity = false,
    passkeys = false
  } = options;

  primeOriginTransport();

  const tasks = [];
  if (advancedSecurity) {
    tasks.push(warmAdvancedRuntime());
  }

  const profile = getRuntimeProfile();
  if (passkeys && !profile.offline && !profile.constrainedNetwork) {
    tasks.push(warmWebAuthnBrowser());
  }

  if (!tasks.length) {
    return;
  }

  await Promise.allSettled(tasks);
};

export const scheduleAuthJourneyWarmup = (options = {}) => {
  const {
    immediate = false,
    timeout = 1800
  } = options;

  if (immediate) {
    void warmAuthJourney(options);
    return null;
  }

  return scheduleIdleTask(() => {
    void warmAuthJourney(options);
  }, timeout);
};

export const cancelAuthJourneyWarmup = (handle) => {
  cancelIdleTask(handle);
};
