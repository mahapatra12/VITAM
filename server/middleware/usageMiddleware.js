const Usage = require("../models/Usage");

// Lightweight per-tenant usage tracker
module.exports = function usageMiddleware(req, res, next) {
    if (!req.tenant || ["OPTIONS", "HEAD"].includes(req.method)) {
        return next();
    }

    res.on("finish", () => {
        if ([429, 503].includes(res.statusCode) || req.originalUrl === "/api/health") {
            return;
        }

        const now = new Date();
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

        Usage.findOneAndUpdate(
            { tenantId: req.tenant.id, metric: "requests", periodStart },
            { $inc: { value: 1 } },
            { upsert: true, setDefaultsOnInsert: true }
        ).catch(() => {
            // best-effort; do not block the request lifecycle
        });
    });

    next();
};
