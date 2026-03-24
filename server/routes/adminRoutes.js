const router = require("express").Router();
const roleMiddleware = require("../middleware/roleMiddleware");
const { getUsers, getAdminStats, seedTelemetry } = require("../controllers/adminController");

router.get("/dashboard", roleMiddleware(["ADMIN"]), getAdminStats);
router.get("/users", roleMiddleware(["ADMIN"]), getUsers);
router.post("/seed-telemetry", roleMiddleware(["ADMIN"]), seedTelemetry);

module.exports = router;
