const pinoHttp = require("pino-http");

/**
 * [VITAM AI] Enterprise PII-Redacting Logger
 * Advanced observability middleware that scrubs sensitive payloads and tracks exact latency.
 */
const logger = pinoHttp({
  autoLogging: {
    ignore: (req) => ["/health", "/ready", "/api/health"].includes(req.url)
  },
  // Advanced PII Data Scrubbing (Never leak passwords/tokens to DataDog/CloudWatch)
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.token',
      'req.body.secret',
      'req.body.twoFactorSecret',
      'req.body.otp',
      'req.body.newPassword'
    ],
    censor: '[*** SECURITY REDACTED ***]'
  },
  customLogLevel(req, res, error) {
    if (error || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage(req, res, responseTime) {
    return `[${req.method}] ${req.url} ⚡ Completed ${res.statusCode} in ${responseTime}ms`;
  },
  customErrorMessage(req, res, error) {
    return `[${req.method}] ${req.url} ❌ FAILED ${res.statusCode}: ${error?.message || 'Unknown Exception'}`;
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: req.url,
        tenant: req.tenant?.id || 'GLOBAL',
        user: req.user ? req.user._id : 'GUEST',
        ip: req.headers['x-forwarded-for'] || req.remoteAddress,
        userAgent: req.headers['user-agent']
      };
    },
    res(res) {
      return {
        statusCode: res.statusCode
      };
    }
  }
});

module.exports = logger;
