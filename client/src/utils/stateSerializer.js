import localforage from 'localforage';

const debugSerializer = import.meta.env.VITE_DEBUG_STATE === 'true';

const serializerError = (...args) => {
    if (debugSerializer) {
        console.error(...args);
    }
};

const stateStore = localforage.createInstance({
    name: 'vitam_state_vault',
    storeName: 'interaction_layers'
});

/**
 * Serializes the current interaction state (navigation, form inputs, etc.)
 */
export const captureInteraction = async (key, data) => {
    try {
        const payload = {
            data,
            ts: Date.now(),
            checksum: btoa(JSON.stringify(data)).slice(0, 8)
        };
        await stateStore.setItem(key, payload);
    } catch (err) {
        serializerError('[State Serializer] Failed to capture interaction segment:', err);
    }
};

/**
 * Restores a specific interaction segment.
 */
export const restoreInteraction = async (key) => {
    try {
        const segment = await stateStore.getItem(key);
        if (!segment) return null;
        
        // Only restore segments younger than 24 hours
        if (Date.now() - segment.ts > 86400000) {
            await stateStore.removeItem(key);
            return null;
        }
        
        return segment.data;
    } catch (err) {
        serializerError('[State Serializer] Recovery failure:', err);
        return null;
    }
};

/**
 * Global Snap-Back: Clears volatile interactions on successful institutional submissions.
 */
export const purgeInteraction = async (key) => {
    await stateStore.removeItem(key);
};
