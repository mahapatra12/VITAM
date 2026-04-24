const router = require("express").Router();
const { getFeeStatus, getFinanceDashboard, auditAction } = require("../controllers/financeController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Keeping status alive for backwards frontend compat
router.get("/status/:studentId", roleMiddleware(["STUDENT", "ADMIN"]), getFeeStatus);

// Enterprise Finance Hub Routes
router.get("/dashboard", authMiddleware, authMiddleware.requireRoles(["admin", "superadmin", "chairman", "director"]), getFinanceDashboard);
router.post("/audit", authMiddleware, authMiddleware.requireRoles(["admin", "superadmin"]), auditAction);

module.exports = router;
