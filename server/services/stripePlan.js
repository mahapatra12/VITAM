const Stripe = require("stripe");

const key = process.env.STRIPE_SECRET_KEY;
const priceMap = {
  free: process.env.STRIPE_PRICE_FREE,
  pro: process.env.STRIPE_PRICE_PRO,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE
};

const getClient = () => {
  if (!key) throw new Error("Stripe not configured");
  return Stripe(key, { apiVersion: "2023-10-16" });
};

module.exports.createCheckout = async ({ tenantId, plan, successUrl, cancelUrl }) => {
  const stripe = getClient();
  const price = priceMap[plan];
  if (!price) throw new Error("Plan price not configured");
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { tenantId, plan },
    line_items: [{ price, quantity: 1 }]
  });
  return session.url;
};
