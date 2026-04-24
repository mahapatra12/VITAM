module.exports = function maintenanceMiddleware(req, res, next) {
    if (process.env.MAINTENANCE_MODE === "true") {
        const retryAfter = process.env.MAINTENANCE_RETRY_AFTER || 300;
        res.setHeader("Retry-After", retryAfter);
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
        return res.status(503).json({
            msg: "Maintenance window in progress",
            retryAfter
        });
    }
    next();
};
