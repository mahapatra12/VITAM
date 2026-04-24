const Usage = require("../models/Usage");
const { isRequestFreeMode } = require("../utils/freeMode");

// Enforce per-tenant monthly request caps by plan.
const PLAN_LIMITS = {
  free: 20000,       // requests/month
  pro: 200000,
  enterprise: Infinity
};

module.exports = function quotaGuard({ metric = "requests" } = {}) {
  return async (req, res, next) => {
    try {
      // Free mode bypasses quota enforcement (metering still runs elsewhere)
      if (isRequestFreeMode(req)) return next();
      if (!req.tenant) return next(); // allow legacy/public
      const limit = PLAN_LIMITS[req.tenant.plan || "free"] ?? PLAN_LIMITS.free;
      if (!isFinite(limit)) return next();

      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const usage = await Usage.findOne({ tenantId: req.tenant.id, metric, periodStart }).lean();
      const current = usage?.value || 0;
      if (current >= limit) {
        return res.status(429).json({ msg: "Monthly quota exceeded", metric, limit, current });
      }
    } catch (err) {
      // best-effort; do not block if metering failed
    }
    next();
  };
};
