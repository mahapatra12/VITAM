const Razorpay = require("razorpay");

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;
const planAmounts = {
  free: Number(process.env.RAZORPAY_AMOUNT_FREE || 0), // in INR
  pro: Number(process.env.RAZORPAY_AMOUNT_PRO || 99900), // paise
  enterprise: Number(process.env.RAZORPAY_AMOUNT_ENTERPRISE || 199900)
};

const getClient = () => {
  if (!key_id || !key_secret) throw new Error("Razorpay not configured");
  return new Razorpay({ key_id, key_secret });
};

module.exports.createOrder = async ({ tenantId, plan, currency = "INR" }) => {
  const amount = planAmounts[plan];
  if (!amount) throw new Error("Plan amount not configured");
  const rp = getClient();
  const order = await rp.orders.create({
    amount,
    currency,
    receipt: `${tenantId}-${Date.now()}`,
    notes: { tenantId, plan }
  });
  return order;
};
