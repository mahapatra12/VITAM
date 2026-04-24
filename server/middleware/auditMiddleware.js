const AuditLog = require("../models/AuditLog");
const { forwardLog } = require("../services/logForwarder");

module.exports = function auditMiddleware(req, res, next) {
    const start = Date.now();
    res.on("finish", () => {
        // Log only mutating/important methods or any webhook calls
        if (!req.originalUrl.includes("/webhooks") && ["GET", "OPTIONS", "HEAD"].includes(req.method)) return;
        const entry = {
            tenantId: req.tenant?.id,
            userId: req.user?._id,
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            ip: req.ip,
            userAgent: req.get("user-agent"),
            durationMs: Date.now() - start
        };
        // Best-effort, avoid blocking the response
        AuditLog.create(entry).catch(() => {});
        forwardLog({ type: "audit", ...entry }).catch(() => {});
    });
    next();
};
