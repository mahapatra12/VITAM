const router = require("express").Router();
const roleMiddleware = require("../middleware/roleMiddleware");
const { getUsers, getAdminStats, seedTelemetry, createUser } = require("../controllers/adminController");

router.get("/dashboard", roleMiddleware(["ADMIN"]), getAdminStats);
router.get("/users", roleMiddleware(["ADMIN"]), getUsers);
router.post("/users", roleMiddleware(["ADMIN"]), createUser);
router.post("/seed-telemetry", roleMiddleware(["ADMIN"]), seedTelemetry);

module.exports = router;
