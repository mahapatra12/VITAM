/**
 * Enforce per-tenant plan permissions.
 * Usage: app.use("/api/protected", planGuard(["pro","enterprise"]))
 * If no tenant, allows (for backward compatibility).
 */
const { isRequestFreeMode } = require("../utils/freeMode");

module.exports = function planGuard(allowedPlans = []) {
    return (req, res, next) => {
        // Free mode: bypass plan checks only when explicitly enabled.
        if (isRequestFreeMode(req)) {
            req.freeMode = true;
            return next();
        }
        if (!req.tenant) return next();
        if (!allowedPlans.length || allowedPlans.includes(req.tenant.plan)) return next();
        return res.status(403).json({ msg: "Plan restriction: upgrade required", required: allowedPlans });
    };
};
