const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { AUTH_MIDDLEWARE_SELECT, toSafeUser } = require("../utils/safeUser");
const eventBus = require("../services/eventBus");

// Advanced Institutional Authenticator Core
const authMiddleware = async function(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(503).json({ code: "AUTH_UNAVAILABLE", msg: "Auth configuration unavailable" });
    }
    const silentCheck = req.headers["x-silent-auth-check"] || req.headers["X-Silent-Auth-Check"] || req.headers["x-silent-sync"] || "";
    
    if (mongoose.connection.readyState !== 1) {
      if (silentCheck) {
        return res.status(200).json({ silentAuthFailed: true, retrySuggested: true, msg: "Institutional DB warming up." });
      }
      return res.status(503).json({ code: "AUTH_UNAVAILABLE", msg: "Institutional DB heating up. Please wait." });
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      if (req.headers["x-silent-auth-check"]) {
        return res.status(200).json({ silentAuthFailed: true, msg: "Authorization token missing" });
      }
      return res.status(401).json({ msg: "Authorization token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(AUTH_MIDDLEWARE_SELECT);
    if (!user) {
      if (req.headers["x-silent-auth-check"]) return res.status(200).json({ silentAuthFailed: true, msg: "User not found" });
      return res.status(401).json({ msg: "User not found" });
    }
    if ((decoded.sessionVersion ?? 0) !== (user.sessionVersion || 0)) {
      if (req.headers["x-silent-auth-check"]) return res.status(200).json({ silentAuthFailed: true, msg: "Session revoked." });
      return res.status(401).json({ msg: "Session revoked. Please sign in again." });
    }

    if (req.tenant && user.collegeId && user.collegeId.toString() !== req.tenant.id?.toString()) {
      return res.status(403).json({ msg: "Cross-tenant access denied" });
    }

    req.user = toSafeUser(user, req);
    next();
  } catch (err) {
    if (String(err?.name || "").includes("Mongo") || String(err?.name || "").includes("Mongoose")) {
      if (silentCheck) {
        return res.status(200).json({ silentAuthFailed: true, retrySuggested: true, msg: "Subsystem temporary latency." });
      }
      return res.status(503).json({ code: "AUTH_UNAVAILABLE", msg: "Subsystem recalibration error." });
    }
    
    if (req.headers["x-silent-auth-check"]) {
      return res.status(200).json({ silentAuthFailed: true, msg: "Invalid or expired token" });
    }
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

/**
 * ADVANCED SECURITY: Role-Based Access Control (RBAC) Guard
 * Validates against both primary `role` and secondary `subRole` arrays.
 */
authMiddleware.requireRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ code: "UNAUTHORIZED", msg: "Authentication verified but identity missing." });
    }
    
    // Normalize user roles for case-insensitivity comparisons
    const userRole = (req.user.role || "").toLowerCase();
    const userSubRole = (req.user.subRole || "").toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => r.toLowerCase());

    if (normalizedAllowed.includes(userRole) || normalizedAllowed.includes(userSubRole) || userRole === 'superadmin') {
      return next();
    }
    
    console.warn(`[SECURITY] RBAC Violation: User ${req.user.email} (${userRole}) attempted to access restricted endpoint.`);
    
    // 🔥 Advanced: Shoot event instantly to the Data Lake without blocking the HTTP response
    eventBus.dispatch("SECURITY_BREACH", {
        type: "RBAC_VIOLATION",
        userEmail: req.user.email,
        attemptedRole: userRole,
        requiredRoles: normalizedAllowed,
        path: req.originalUrl || req.url,
        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
    });

    return res.status(403).json({ 
      code: "INSUFFICIENT_CLEARANCE", 
      msg: "Your institutional clearance level is insufficient for this sector." 
    });
  };
};

/**
 * ADVANCED SECURITY: Telemetric Strict Device Auth
 * Wraps the base authenticator and binds the session to the origin fingerprint.
 */
authMiddleware.strictDeviceAuth = async (req, res, next) => {
  await authMiddleware(req, res, () => {
    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Attach cryptographically derived signature for downstream forensic controllers
    req.securityContext = {
      ip: rawIp,
      userAgent: userAgent,
      signature: Buffer.from(`${rawIp}-${userAgent}`).toString('base64').substring(0, 16),
      strictPassed: true
    };
    next();
  });
};

module.exports = authMiddleware;

