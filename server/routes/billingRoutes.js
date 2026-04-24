const router = require("express").Router();
const Usage = require("../models/Usage");
const roleMiddleware = require("../middleware/roleMiddleware");
const { respondWithServerError } = require("../utils/respondWithServerError");
const MANAGEMENT_ROLES = require("../utils/managementRoles");

const managementAccess = roleMiddleware(MANAGEMENT_ROLES);

// Very lightweight billing projection endpoint (placeholder for real provider)
router.get("/estimate", managementAccess, async (req, res) => {
    try {
        if (!req.tenant) return res.status(403).json({ msg: "Tenant required" });
        const now = new Date();
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const usage = await Usage.find({ tenantId: req.tenant.id, periodStart }).lean();
        const requests = usage.find(u => u.metric === "requests")?.value || 0;
        const ratePerK = req.tenant.plan === "enterprise" ? 0.4 : req.tenant.plan === "pro" ? 0.7 : 1.0;
        const estimated = (requests / 1000) * ratePerK;
        res.json({ requests, ratePerK, estimatedUSD: Number(estimated.toFixed(2)) });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Billing Estimate Error",
            msg: "Unable to estimate billing right now"
        });
    }
});

module.exports = router;
