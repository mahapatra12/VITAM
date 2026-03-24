const router = require("express").Router();
const roleMiddleware = require("../middleware/roleMiddleware");
const { getUsers, getAdminStats } = require("../controllers/adminController");

router.get("/dashboard", roleMiddleware(["ADMIN"]), getAdminStats);
router.get("/users", roleMiddleware(["ADMIN"]), getUsers);

module.exports = router;
