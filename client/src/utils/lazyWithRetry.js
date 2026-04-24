import { lazy } from 'react';
import { clearRecoveryAttempt, requestAppRecovery } from './appRecovery';

const CHUNK_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i,
  /Importing a module script failed/i,
  /Loading chunk [\d]+ failed/i,
  /ChunkLoadError/i,
];

const isChunkLoadError = (error) => {
  const message = `${error?.message || ''} ${error?.name || ''}`;
  return CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(message));
};

const getRecoveryReason = (key) => `chunk:${key}`;

export default function lazyWithRetry(importer, key) {
  return lazy(async () => {
    try {
      const module = await importer();
      clearRecoveryAttempt(getRecoveryReason(key));
      return module;
    } catch (error) {
      if (typeof window !== 'undefined' && isChunkLoadError(error)) {
        const action = requestAppRecovery({
          reason: getRecoveryReason(key),
          maxReloads: 1,
          fallbackPath: '/',
        });

        if (action === 'reload') {
          return new Promise(() => {});
        }
      }

      throw error;
    }
  });
}
