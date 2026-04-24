const router = require("express").Router();
const AuditLog = require("../models/AuditLog");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const roleMiddleware = require("../middleware/roleMiddleware");
const { exportAuditCsv } = require("../services/s3AuditExporter");
const { respondWithServerError } = require("../utils/respondWithServerError");
const MANAGEMENT_ROLES = require("../utils/managementRoles");

const managementAccess = roleMiddleware(MANAGEMENT_ROLES);

// Telemetry ingress (soft-auth or no-auth depending on use-case, we just accept it here)
router.post("/telemetry", async (req, res) => {
    try {
        const { level, msg, detail } = req.body;
        // Optionally decode token if present, but do not block if absent/invalid
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        let userId = null;
        let tenantId = req.tenant?.id || null;

        if (token && process.env.JWT_SECRET) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (ignore) {}
        }

        if (tenantId && require('mongoose').connection.readyState === 1) {
            await AuditLog.create({
                tenantId,
                userId,
                method: "TELEMETRY",
                path: String(level || "INFO").slice(0, 50),
                status: level === "CRITICAL" || level === "ERROR" ? 500 : 200,
                ip: req.ip,
                userAgent: String(msg || "").slice(0, 200),
                durationMs: 0
            });
        }
        res.status(200).json({ status: "received" });
    } catch (err) {
        res.status(200).json({ status: "ignored" }); // prevent cascade failures
    }
});

// Tenant-scoped audit export (latest 100 entries)
router.get("/my", managementAccess, async (req, res) => {
    try {
        const tenantId = req.tenant?.id;
        if (!tenantId) return res.status(403).json({ msg: "Tenant required" });

        const logs = await AuditLog.find({ tenantId })
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        res.json({ logs });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Get Audit Logs Error",
            msg: "Unable to load audit logs right now"
        });
    }
});

// Export last 1000 audit rows as CSV for this tenant
router.get("/export", managementAccess, async (req, res) => {
    try {
        const tenantId = req.tenant?.id;
        if (!tenantId) return res.status(403).json({ msg: "Tenant required" });
        const logs = await AuditLog.find({ tenantId })
            .sort({ createdAt: -1 })
            .limit(1000)
            .lean();

        const header = "timestamp,method,path,status,userId,ip,durationMs\n";
        const rows = logs.map(l => [
            l.createdAt?.toISOString() || "",
            l.method || "",
            `"${(l.path || "").replace(/"/g,'""')}"`,
            l.status || "",
            l.userId || "",
            l.ip || "",
            l.durationMs || ""
        ].join(",")).join("\n");

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=\"audit.csv\"");
        res.send(header + rows);
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Export Audit CSV Error",
            msg: "Unable to export audit logs right now"
        });
    }
});

// Export to S3 (if configured)
router.post("/export-s3", managementAccess, async (req, res) => {
    try {
        const tenantId = req.tenant?.id;
        if (!tenantId) return res.status(403).json({ msg: "Tenant required" });
        const result = await exportAuditCsv(tenantId);
        res.json({ msg: "Exported", ...result });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Export Audit S3 Error",
            msg: "Unable to export audit logs right now"
        });
    }
});

module.exports = router;
