const FeatureFlag = require("../models/FeatureFlag");
const { isRequestFreeMode } = require("../utils/freeMode");

// Simple per-tenant feature flag guard with optional percentage rollout.
module.exports = function featureFlagGuard(flagKey) {
  return async (req, res, next) => {
    try {
      if (isRequestFreeMode(req)) {
        req.freeMode = true;
        return next();
      }
      if (!flagKey) return next();
      if (!req.tenant) return next();

      const flag = await FeatureFlag.findOne({ tenantId: req.tenant.id, key: flagKey }).lean();
      if (!flag || !flag.enabled) {
        return res.status(403).json({
          code: "FEATURE_DISABLED",
          msg: "Feature disabled",
          flag: flagKey,
          ...(req.id ? { requestId: req.id } : {})
        });
      }

      if (flag.rolloutPercent < 100) {
        // deterministic bucket by request-id to avoid per-request randomness
        const source = req.id || `${req.tenant.id}`;
        const hash = Array.from(source).reduce((acc, c) => acc + c.charCodeAt(0), 0) % 100;
        if (hash >= flag.rolloutPercent) {
          return res.status(403).json({
            code: "FEATURE_ROLLOUT_INELIGIBLE",
            msg: "Feature rollout not eligible",
            flag: flagKey,
            ...(req.id ? { requestId: req.id } : {})
          });
        }
      }

      next();
    } catch (err) {
      // fail open to avoid accidental outage
      next();
    }
  };
};
