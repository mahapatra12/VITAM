/**
 * Resource Sentinel
 * Monitoring and autonomous recovery for VITAM auxiliary processes (Workers).
 */

const sentinelRegistry = new Map();
const debugSentinel = import.meta.env.VITE_DEBUG_SENTINEL === 'true';

const sentinelWarn = (...args) => {
    if (debugSentinel) {
        console.warn(...args);
    }
};

const sentinelError = (...args) => {
    if (debugSentinel) {
        console.error(...args);
    }
};

/**
 * Tracks a worker and re-initializes it if it becomes unresponsive.
 */
export const registerWorkerSentinel = (name, workerInstance, factory) => {
    const sentinelId = btoa(name + Date.now()).slice(0, 8);
    
    const monitor = {
        name,
        instance: workerInstance,
        lastHeartbeat: Date.now(),
        retryCount: 0,
        timer: null,
        factory // Function to recreate the worker
    };

    const startMonitoring = () => {
        monitor.timer = setInterval(() => {
            const timeSincePulse = Date.now() - monitor.lastHeartbeat;
            if (timeSincePulse > 15000) { // 15s timeout
                sentinelWarn(`[Sentinel] Worker "${name}" heartbeat lost. Attempting recovery...`);
                recoverWorker(sentinelId);
            }
        }, 5000);
    };

    sentinelRegistry.set(sentinelId, monitor);
    
    // Attach heartbeat listener
    workerInstance.onmessage = (e) => {
        if (e.data.type === 'PONG' || e.data.type === 'HEARTBEAT') {
            monitor.lastHeartbeat = Date.now();
        }
    };

    startMonitoring();
    return sentinelId;
};

const recoverWorker = (id) => {
    const monitor = sentinelRegistry.get(id);
    if (!monitor) return;

    if (monitor.retryCount > 3) {
        sentinelError(`[Sentinel] Fatal: Worker "${monitor.name}" failed multiple recoveries. Raising institutional exception.`);
        return;
    }

    clearInterval(monitor.timer);
    monitor.instance.terminate();
    monitor.retryCount++;
    
    // Recreate
    const newWorker = monitor.factory();
    monitor.instance = newWorker;
    monitor.lastHeartbeat = Date.now();
    
    // Resume monitoring
    registerWorkerSentinel(monitor.name, newWorker, monitor.factory);
};

/**
 * Sends a pulse to all registered sentinels.
 */
export const pulseSentinels = () => {
    sentinelRegistry.forEach(monitor => {
        monitor.instance.postMessage({ type: 'PING' });
    });
};
