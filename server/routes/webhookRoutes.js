const router = require("express").Router();
const crypto = require("crypto");

const safeSignatureMatch = (expected, actual) => {
    if (typeof expected !== "string" || typeof actual !== "string") {
        return false;
    }

    const expectedBuffer = Buffer.from(expected, "utf8");
    const actualBuffer = Buffer.from(actual, "utf8");

    if (expectedBuffer.length === 0 || actualBuffer.length === 0 || expectedBuffer.length !== actualBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
};

// Validate Stripe-style webhook if STRIPE_WEBHOOK_SECRET is set; otherwise accept best-effort.
router.post("/billing", (req, res) => {
    const rawBody = req.rawBody || JSON.stringify(req.body || {});
    const sigHeader = req.headers["stripe-signature"];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;

    if (secret) {
        if (!sigHeader) {
            return res.status(400).json({
                code: "SIGNATURE_MISSING",
                msg: "Stripe signature header is required",
                ...(req.id ? { requestId: req.id } : {})
            });
        }

        try {
            // Stripe signature format: t=timestamp,v1=signature
            const [tPart, v1Part] = sigHeader.split(",").map(s => s.trim());
            const timestamp = tPart?.split("=")[1];
            const signature = v1Part?.split("=")[1];
            if (!timestamp || !signature) throw new Error("Invalid signature header");

            const signedPayload = `${timestamp}.${rawBody}`;
            const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");
            if (!safeSignatureMatch(expected, signature)) {
                console.warn("[Webhook] Stripe signature mismatch");
                return res.status(400).json({
                    code: "INVALID_SIGNATURE",
                    msg: "Invalid Stripe signature",
                    ...(req.id ? { requestId: req.id } : {})
                });
            }
        } catch (err) {
            console.warn("[Webhook] Stripe validation failed:", err.message);
            return res.status(400).json({
                code: "SIGNATURE_VERIFICATION_FAILED",
                msg: "Stripe signature verification failed",
                ...(req.id ? { requestId: req.id } : {})
            });
        }
    }

    console.log("[Webhook] Billing event received", req.body?.type || "unknown");
    res.status(200).json({ received: true });
});

// Minimal Razorpay signature check if configured
router.post("/razorpay", (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (secret) {
        try {
            const body = req.rawBody || JSON.stringify(req.body || {});
            const signature = req.headers["x-razorpay-signature"];
            if (!signature) {
                return res.status(400).json({
                    code: "SIGNATURE_MISSING",
                    msg: "Razorpay signature header is required",
                    ...(req.id ? { requestId: req.id } : {})
                });
            }

            const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
            if (!safeSignatureMatch(expected, signature)) {
                return res.status(400).json({
                    code: "INVALID_SIGNATURE",
                    msg: "Invalid Razorpay signature",
                    ...(req.id ? { requestId: req.id } : {})
                });
            }
        } catch (err) {
            console.warn("[Webhook] Razorpay validation failed:", err.message);
            return res.status(400).json({
                code: "SIGNATURE_VERIFICATION_FAILED",
                msg: "Razorpay signature verification failed",
                ...(req.id ? { requestId: req.id } : {})
            });
        }
    }
    console.log("[Webhook] Razorpay event received", req.body?.event || "unknown");
    res.status(200).json({ received: true });
});

module.exports = router;
