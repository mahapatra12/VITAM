const router = require("express").Router();
const roleMiddleware = require("../middleware/roleMiddleware");
const { getFacultyStats } = require("../controllers/facultyController");

router.get("/dashboard", roleMiddleware(["FACULTY"]), getFacultyStats);

module.exports = router;
