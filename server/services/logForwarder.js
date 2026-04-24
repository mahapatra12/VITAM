const axios = require("axios");

const LOG_WEBHOOK_URL = process.env.LOG_WEBHOOK_URL;

// Best-effort async log forwarder; non-blocking on failure.
module.exports.forwardLog = async (payload) => {
  if (!LOG_WEBHOOK_URL) return;
  try {
    await axios.post(LOG_WEBHOOK_URL, payload, { timeout: 3000 });
  } catch (_) {
    // silently ignore to avoid cascading failures
  }
};
