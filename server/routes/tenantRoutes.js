const router = require("express").Router();
const FeatureFlag = require("../models/FeatureFlag");
const Usage = require("../models/Usage");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { respondWithServerError } = require("../utils/respondWithServerError");
const MANAGEMENT_ROLES = require("../utils/managementRoles");

const managementAccess = roleMiddleware(MANAGEMENT_ROLES);
const FLAG_KEY_PATTERN = /^[a-z][a-z0-9:_-]{1,63}$/i;

const normalizeFlagKey = (value) => String(value || "").trim();

const normalizeRolloutPercent = (value) => {
    if (value === undefined || value === null || value === "") {
        return 100;
    }

    const percent = Number(value);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
        return null;
    }

    return Math.round(percent);
};

router.get("/info", authMiddleware, (req, res) => {
    if (!req.tenant) return res.json({ tenant: null, mode: "public" });
    res.json({ tenant: req.tenant, mode: "tenant" });
});

// List feature flags for current tenant
router.get("/flags", managementAccess, async (req, res) => {
    try {
        if (!req.tenant) return res.status(403).json({ msg: "Tenant required" });
        const flags = await FeatureFlag.find({ tenantId: req.tenant.id }).lean();
        res.json({ flags });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Get Tenant Flags Error",
            msg: "Unable to load tenant feature flags right now"
        });
    }
});

router.post("/flags", managementAccess, async (req, res) => {
    try {
        if (!req.tenant) return res.status(403).json({ msg: "Tenant required" });

        const key = normalizeFlagKey(req.body?.key);
        if (!key || !FLAG_KEY_PATTERN.test(key)) {
            return res.status(400).json({
                code: "INVALID_FLAG_KEY",
                msg: "Flag key must start with a letter and contain only letters, numbers, :, _, or -",
                ...(req.id ? { requestId: req.id } : {})
            });
        }

        const rolloutPercent = normalizeRolloutPercent(req.body?.rolloutPercent);
        if (rolloutPercent == null) {
            return res.status(400).json({
                code: "INVALID_ROLLOUT_PERCENT",
                msg: "rolloutPercent must be between 0 and 100",
                ...(req.id ? { requestId: req.id } : {})
            });
        }

        const flag = await FeatureFlag.findOneAndUpdate(
            { tenantId: req.tenant.id, key },
            { enabled: Boolean(req.body?.enabled), rolloutPercent },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );
        res.json({ flag });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Update Tenant Flag Error",
            msg: "Unable to update tenant feature flags right now"
        });
    }
});

// Basic usage snapshot for current tenant (requests per period)
router.get("/usage", managementAccess, async (req, res) => {
    try {
        if (!req.tenant) return res.status(403).json({ msg: "Tenant required" });
        const now = new Date();
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const usage = await Usage.find({ tenantId: req.tenant.id, periodStart }).lean();
        res.json({ usage });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Get Tenant Usage Error",
            msg: "Unable to load tenant usage right now"
        });
    }
});

module.exports = router;
