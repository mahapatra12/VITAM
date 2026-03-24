const router = require("express").Router();
const { getFeeStatus, getFinanceStats } = require("../controllers/financeController");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/status/:studentId", roleMiddleware(["STUDENT", "ADMIN"]), getFeeStatus);
router.get("/stats", roleMiddleware(["ADMIN"]), getFinanceStats);

module.exports = router;
