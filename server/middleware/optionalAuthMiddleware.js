const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const { AUTH_MIDDLEWARE_SELECT, toSafeUser } = require("../utils/safeUser");

module.exports = async function optionalAuthMiddleware(req, _res, next) {
  try {
    if (!process.env.JWT_SECRET || mongoose.connection.readyState !== 1) {
      return next();
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(AUTH_MIDDLEWARE_SELECT);
    if (!user) {
      return next();
    }
    if ((decoded.sessionVersion ?? 0) !== (user.sessionVersion || 0)) {
      return next();
    }
    if (req.tenant && user.collegeId && user.collegeId.toString() !== req.tenant.id?.toString()) {
      return next();
    }

    req.user = toSafeUser(user, req);
    return next();
  } catch (_) {
    return next();
  }
};
