const EventEmitter = require('events');

/**
 * [VITAM AI] Zero-Blocking Asynchronous Event Bus.
 * 
 * Concept: When a heavy action occurs (like detecting a hacker or transacting logic), 
 * the Express route instantly responds to the UI with a 200/400. IT DOES NOT WAIT.
 * 
 * Simultaneously, the route uses this bus to emit an event. 
 * Heavy Background micro-services (like the AI-CEO or S3 Micro-batchers) 
 * listen in parallel on separate threads/cycles, preserving ultra-low API latency.
 */
class EnterpriseEventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(25); // Set high max to avoid NodeJS memory warnings during heavy scaling
    }

    /**
     * Dispatch an event to the global matrix safely.
     */
    dispatch(eventName, payload) {
        try {
            // Append universal timestamps and correlation IDs instantly
            const enrichedPayload = {
                id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                timestamp: new Date().toISOString(),
                ...payload
            };
            
            // Emit async to guarantee Express event-loop sequence is never physically blocked
            setImmediate(() => {
                this.emit(eventName, enrichedPayload);
            });
            
        } catch (err) {
            console.error(`[EventBus] Critical Failure Dispatching ${eventName}:`, err.message);
        }
    }
}

// Global Singleton Instance
const coreBus = new EnterpriseEventBus();

module.exports = coreBus;
