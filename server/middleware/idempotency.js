/**
 * [VITAM OS] Zero-Failure Idempotency Middleware
 * Prevents duplicate mutations during client retries by caching successful responses with x-idempotency-key.
 */
const { createHash } = require("crypto");

const responseCache = new Map(); // Simple in-memory cache per worker
const IDEMPOTENCY_TTL_MS = 15 * 60 * 1000;
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const hashPayload = (value) => createHash("sha256").update(value).digest("hex");

const buildFingerprint = (req) => {
    const body = req.body && typeof req.body === "object" ? JSON.stringify(req.body) : "";
    return {
        route: `${req.method}:${req.originalUrl || req.url}`,
        bodyHash: hashPayload(body)
    };
};

// Cleanup old keys every 15 minutes to prevent memory bloat
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of responseCache.entries()) {
        if (now - value.timestamp > IDEMPOTENCY_TTL_MS) {
            responseCache.delete(key);
        }
    }
}, 5 * 60 * 1000).unref();

module.exports = (req, res, next) => {
    // Only apply to state-changing requests
    if (!MUTATING_METHODS.has(req.method)) {
        return next();
    }

    const key = String(req.headers["x-idempotency-key"] || "").trim();
    if (!key) {
        return next();
    }

    const cacheKey = `${req.method}:${req.originalUrl || req.url}:${key}`;
    const fingerprint = buildFingerprint(req);

    // Check if we've processed this exact key before
    if (responseCache.has(cacheKey)) {
        const cached = responseCache.get(cacheKey);

        if (
            cached.fingerprint?.route !== fingerprint.route ||
            cached.fingerprint?.bodyHash !== fingerprint.bodyHash
        ) {
            return res.status(409).json({
                code: "IDEMPOTENCY_KEY_REUSED",
                msg: "Idempotency key reused with a different request payload"
            });
        }

        console.log(`[Idempotency] Duplicate request detected for key: ${key}. Returning cached response.`);
        res.setHeader("x-idempotency-replayed", "true");
        return res.status(cached.status).json(cached.body);
    }

    // Capture the original res.json to cache the outgoing body
    const originalJson = res.json;
    res.json = function(body) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
            responseCache.set(cacheKey, {
                status: res.statusCode,
                body: body,
                timestamp: Date.now(),
                fingerprint
            });
        }
        return originalJson.apply(this, arguments);
    };

    next();
};
