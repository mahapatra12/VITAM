/**
 * ✅ [VITAM AI] Butter-Smooth Caching Layer
 * Native Map-based Least Recently Used (LRU) Cache engineered for sub-millisecond retrieval.
 * Bypass MongoDB entirely for static or highly-trafficked GET routes.
 */
class NativeLRUCache {
    constructor(maxSize = 2000) { // Limit to prevent runaway memory leaks
        this.cache = new Map();
        this.maxSize = maxSize;
    }

    get(key) {
        if (!this.cache.has(key)) return null;
        
        const entry = this.cache.get(key);
        // TTL Eviction
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }

        // LRU Promotion: if hit, delete and re-insert at the end of the Map
        this.cache.delete(key);
        this.cache.set(key, entry);
        return entry.payload;
    }

    set(key, payload, ttlMs) {
        // Eviction Policy
        if (this.cache.size >= this.maxSize) {
            const leastRecentlyUsedKey = this.cache.keys().next().value;
            this.cache.delete(leastRecentlyUsedKey);
        }
        this.cache.set(key, { payload, expiry: Date.now() + ttlMs });
    }
}

const instanceCache = new NativeLRUCache();

/**
 * Express Middleware to instantly cache and return JSON payloads.
 * Exclusively caches 200 GET requests dynamically isolated by Tenant context.
 * 
 * @param {number} ttlSeconds - Time To Live (default 60s)
 */
const cacheLayer = (ttlSeconds = 60) => {
    return (req, res, next) => {
        // Ignore mutations and file uploads
        if (req.method !== "GET") {
            return next();
        }

        // Context-aware key generation (Multi-Tenant safe)
        const tenantTag = req.tenant?.id || 'GLOBAL';
        const userTag = req.user?._id || 'ANONYMOUS';
        const key = `VITAM_CACHE::${tenantTag}::${userTag}::${req.originalUrl || req.url}`;

        const cachedData = instanceCache.get(key);
        if (cachedData) {
            res.setHeader("X-Cache", "HIT-BUTTER-SMOOTH");
            return res.json(JSON.parse(cachedData));
        }

        res.setHeader("X-Cache", "MISS");

        // Monkey-patch the response transport to grab the payload before dispatch
        const originalJson = res.json.bind(res);
        res.json = (body) => {
            // Only cache successful payloads
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    instanceCache.set(key, JSON.stringify(body), ttlSeconds * 1000);
                } catch (err) {
                    console.warn("[Cache Layer] Failed to serialize payload. Too large?");
                }
            }
            return originalJson(body);
        };

        next();
    };
};

module.exports = cacheLayer;
