const hasValue = (value) => typeof value === "string" ? Boolean(value.trim()) : Boolean(value);

const STRIPE_PRICE_ENV_BY_PLAN = {
    free: "STRIPE_PRICE_FREE",
    pro: "STRIPE_PRICE_PRO",
    enterprise: "STRIPE_PRICE_ENTERPRISE"
};

const isGroqConfigured = () => hasValue(process.env.GROQ_API_KEY);

const isStripeConfigured = (plan) => {
    if (!hasValue(process.env.STRIPE_SECRET_KEY)) {
        return false;
    }

    if (!plan) {
        return hasValue(process.env[STRIPE_PRICE_ENV_BY_PLAN.pro]) || hasValue(process.env[STRIPE_PRICE_ENV_BY_PLAN.enterprise]);
    }

    const priceKey = STRIPE_PRICE_ENV_BY_PLAN[String(plan || "").trim().toLowerCase()];
    return priceKey ? hasValue(process.env[priceKey]) : false;
};

const isRazorpayConfigured = () => (
    hasValue(process.env.RAZORPAY_KEY_ID) &&
    hasValue(process.env.RAZORPAY_KEY_SECRET)
);

const isGoogleOAuthConfigured = () => hasValue(process.env.GOOGLE_CLIENT_ID);

module.exports = {
    isGoogleOAuthConfigured,
    isGroqConfigured,
    isRazorpayConfigured,
    isStripeConfigured
};
