const EventEmitter = require('events');

/**
 * [VITAM OS] Enterprise-Grade Exponential Circuit Breaker
 * Protects logic from cascading failures and shields external APIs during outages.
 * Features: Exponential Backoff, Event-Driven Observability, and Half-Open bleed limits.
 */
class CircuitBreaker extends EventEmitter {
    constructor(name, options = {}) {
        super();
        this.name = name;
        this.threshold = options.threshold || 5;
        this.baseCooldown = options.cooldown || 30000; // Base 30s
        
        this.failureCount = 0;
        this.tripCount = 0; // Tracks how many times it moved to OPEN for exp-backoff
        this.lastFailureTime = null;
        this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    }

    /**
     * Get the dynamic cooldown time based on exponential backoff
     */
    getDynamicCooldown() {
        // Cap the backoff multiplier at 6 (32x max) so it doesn't wait indefinitely
        const multiplier = Math.pow(2, Math.min(this.tripCount, 6)); 
        return this.baseCooldown * multiplier;
    }

    async execute(task, fallbackValue) {
        if (this.state === "OPEN") {
            const timeSinceFailure = Date.now() - this.lastFailureTime;
            
            // Should we attempt recovery?
            if (timeSinceFailure > this.getDynamicCooldown()) {
                console.warn(`[CircuitBreaker:${this.name}] Cooldown passed. Transitioning to HALF_OPEN to test stability...`);
                this.state = "HALF_OPEN";
                this.emit("half_open", { timeSinceFailure, cooldown: this.getDynamicCooldown() });
            } else {
                return typeof fallbackValue === 'function' ? fallbackValue() : fallbackValue;
            }
        }

        try {
            const result = await task();
            
            // If we succeed in HALF_OPEN, we heal the circuit.
            if (this.state === "HALF_OPEN") {
                this.onHeal();
            } else {
                this.onSuccess();
            }
            return result;
        } catch (error) {
            this.onFailure(error);
            return typeof fallbackValue === 'function' ? fallbackValue(error) : fallbackValue;
        }
    }

    onSuccess() {
        this.failureCount = 0;
    }
    
    onHeal() {
        console.log(`[CircuitBreaker:${this.name}] Healing detected. Restoring to CLOSED.`);
        this.failureCount = 0;
        this.tripCount = Math.max(0, this.tripCount - 1); // Slowly decay punishment 
        this.state = "CLOSED";
        this.emit("closed");
    }

    onFailure(error) {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        console.error(`[CircuitBreaker:${this.name}] Execution failure (#${this.failureCount}): ${error.message}`);

        if (this.state === "HALF_OPEN") {
            // Instant trip back to open if it fails while testing recovery
            this.tripCircuit(error);
        } else if (this.failureCount >= this.threshold) {
             this.tripCircuit(error);
        }
    }
    
    tripCircuit(error) {
        if (this.state !== "OPEN") {
            this.state = "OPEN";
            this.tripCount++;
            
            const cooldown = this.getDynamicCooldown();
            console.error(`[CircuitBreaker:${this.name}] 🚨 TRIGGERED. Circuit OPEN. Suspended for ${cooldown/1000}s.`);
            this.emit("tripped", { cause: error.message, cooldown, tripCount: this.tripCount });
        }
    }
}

// Singleton core instances
const aiCircuit = new CircuitBreaker("AI_SERVICES", { threshold: 3, cooldown: 15000 });
const mediaCircuit = new CircuitBreaker("MEDIA_SERVICES", { threshold: 5, cooldown: 30000 });

// System Observability Hooks
aiCircuit.on('tripped', (event) => console.log('\n❌ [AI SUB-SYSTEM OFFLINE]', event));
aiCircuit.on('closed', () => console.log('\n✅ [AI SUB-SYSTEM ONLINE RESTORED]'));

module.exports = {
    CircuitBreaker,
    aiCircuit,
    mediaCircuit
};
