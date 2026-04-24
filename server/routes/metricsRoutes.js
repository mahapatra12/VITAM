const router = require("express").Router();
const User = require("../models/User");
const College = require("../models/College");
const Usage = require("../models/Usage");
const os = require("os");
const roleMiddleware = require("../middleware/roleMiddleware");
const { respondWithServerError } = require("../utils/respondWithServerError");
const MANAGEMENT_ROLES = require("../utils/managementRoles");

router.get("/", roleMiddleware(MANAGEMENT_ROLES), async (req, res) => {
    try {
        const [userCount, tenantCount] = await Promise.all([
            User.countDocuments(),
            College.countDocuments()
        ]);
        const now = new Date();
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const totalRequests = await Usage.aggregate([
            { $match: { metric: "requests", periodStart } },
            { $group: { _id: null, sum: { $sum: "$value" } } }
        ]);
        res.json({
            uptimeSeconds: Math.round(process.uptime()),
            memory: process.memoryUsage(),
            loadAvg: os.loadavg(),
            tenants: tenantCount,
            users: userCount,
            monthlyRequests: totalRequests[0]?.sum || 0,
            ts: new Date()
        });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Metrics Route Error",
            msg: "Unable to load system metrics right now"
        });
    }
});

module.exports = router;
