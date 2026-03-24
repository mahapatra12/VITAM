const router = require("express").Router();
const { generateTimetable } = require("../controllers/timetableController");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/generate", roleMiddleware(["ADMIN", "HOD"]), generateTimetable);

module.exports = router;
