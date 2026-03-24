const router = require("express").Router();
const roleMiddleware = require("../middleware/roleMiddleware");
const { getHodStats } = require("../controllers/hodController");

router.get("/dashboard", roleMiddleware(["HOD"]), getHodStats);

module.exports = router;
