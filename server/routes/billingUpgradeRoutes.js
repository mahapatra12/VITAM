const router = require("express").Router();
const roleMiddleware = require("../middleware/roleMiddleware");
const { createCheckout } = require("../services/stripePlan");
const { createOrder } = require("../services/razorpayPlan");
const { isRazorpayConfigured, isStripeConfigured } = require("../utils/providerReadiness");
const { respondWithServerError } = require("../utils/respondWithServerError");
const MANAGEMENT_ROLES = require("../utils/managementRoles");

const managementAccess = roleMiddleware(MANAGEMENT_ROLES);
const VALID_PLANS = new Set(["pro", "enterprise"]);

const normalizePlan = (value) => {
    const plan = String(value || "").trim().toLowerCase();
    return VALID_PLANS.has(plan) ? plan : null;
};

const normalizeReturnUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) {
        return null;
    }

    try {
        const parsed = new URL(value);
        const isLocalhost = ["localhost", "127.0.0.1"].includes(parsed.hostname);
        if (parsed.protocol === "https:" || (parsed.protocol === "http:" && isLocalhost)) {
            return parsed.toString();
        }
        return null;
    } catch (_) {
        return null;
    }
};

const normalizeCurrency = (value) => {
    if (value === undefined || value === null || value === "") {
        return "INR";
    }

    const normalized = String(value).trim().toUpperCase();
    return /^[A-Z]{3}$/.test(normalized) ? normalized : null;
};

// Start Stripe checkout for plan upgrade
router.post("/stripe/checkout", managementAccess, async (req, res) => {
    try {
        if (!req.tenant) {
            return res.status(403).json({
                code: "TENANT_REQUIRED",
                msg: "Tenant context is required",
                ...(req.id ? { requestId: req.id } : {})
            });
        }
        const plan = normalizePlan(req.body?.plan);
        const successUrl = normalizeReturnUrl(req.body?.successUrl);
        const cancelUrl = normalizeReturnUrl(req.body?.cancelUrl);

        if (!plan) {
            return res.status(400).json({
                code: "INVALID_PLAN",
                msg: "Plan must be pro or enterprise",
                ...(req.id ? { requestId: req.id } : {})
            });
        }
        if (!successUrl || !cancelUrl) {
            return res.status(400).json({
                code: "INVALID_RETURN_URL",
                msg: "successUrl and cancelUrl must be valid HTTPS URLs",
                ...(req.id ? { requestId: req.id } : {})
            });
        }
        if (!isStripeConfigured(plan)) {
            return res.status(503).json({
                code: "STRIPE_UNAVAILABLE",
                msg: "Stripe checkout is not configured for this plan right now",
                ...(req.id ? { requestId: req.id } : {})
            });
        }

        const url = await createCheckout({
            tenantId: req.tenant.id,
            plan,
            successUrl,
            cancelUrl
        });
        res.json({ url });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Stripe Checkout Error",
            msg: "Unable to start Stripe checkout right now"
        });
    }
});

// Start Razorpay order for plan upgrade
router.post("/razorpay/order", managementAccess, async (req, res) => {
    try {
        if (!req.tenant) {
            return res.status(403).json({
                code: "TENANT_REQUIRED",
                msg: "Tenant context is required",
                ...(req.id ? { requestId: req.id } : {})
            });
        }
        const plan = normalizePlan(req.body?.plan);
        const currency = normalizeCurrency(req.body?.currency);

        if (!plan) {
            return res.status(400).json({
                code: "INVALID_PLAN",
                msg: "Plan must be pro or enterprise",
                ...(req.id ? { requestId: req.id } : {})
            });
        }
        if (!currency) {
            return res.status(400).json({
                code: "INVALID_CURRENCY",
                msg: "currency must be a valid 3-letter code",
                ...(req.id ? { requestId: req.id } : {})
            });
        }
        if (!isRazorpayConfigured()) {
            return res.status(503).json({
                code: "RAZORPAY_UNAVAILABLE",
                msg: "Razorpay checkout is not configured right now",
                ...(req.id ? { requestId: req.id } : {})
            });
        }

        const order = await createOrder({
            tenantId: req.tenant.id,
            plan,
            currency
        });
        res.json({ order });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Razorpay Order Error",
            msg: "Unable to start Razorpay checkout right now"
        });
    }
});

module.exports = router;
