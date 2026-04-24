import localforage from 'localforage';

const debugQueue = import.meta.env.VITE_DEBUG_QUEUE === 'true';

const queueLog = (...args) => {
    if (debugQueue) {
        console.warn(...args);
    }
};

const queueError = (...args) => {
    if (debugQueue) {
        console.error(...args);
    }
};

// Initialize persistent store for VITAM System Resilience
const store = localforage.createInstance({
    name: 'vitam_system_store',
    storeName: 'mutation_queue'
});

/**
 * Adds a failed mutation to the persistent queue for later reconciliation.
 */
export const queueMutation = async (request) => {
    try {
        const id = `mutation_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const mutation = {
            id,
            url: request.url,
            method: request.method,
            data: request.data,
            headers: {
                ...request.headers,
                'x-idempotency-key': request.headers?.['x-idempotency-key'] || id
            },
            timestamp: new Date().toISOString(),
            retryCount: 0
        };

        const currentQueue = (await store.getItem('pending')) || [];
        await store.setItem('pending', [...currentQueue, mutation]);
        
        queueLog(`[System Resilience] Mutation queued: ${mutation.id} (${mutation.url})`);
        return id;
    } catch (err) {
        queueError('[System Resilience] Failed to queue mutation:', err);
        return null;
    }
};

/**
 * Retrieves all pending mutations.
 */
export const getPendingMutations = async () => {
    return (await store.getItem('pending')) || [];
};

/**
 * Removes a mutation from the queue after successful reconciliation.
 */
export const removeMutation = async (id) => {
    const currentQueue = (await store.getItem('pending')) || [];
    const updatedQueue = currentQueue.filter(m => m.id !== id);
    await store.setItem('pending', updatedQueue);
};

/**
 * Clears the entire queue (Emergency reset).
 */
export const clearMutationQueue = async () => {
    await store.setItem('pending', []);
};
