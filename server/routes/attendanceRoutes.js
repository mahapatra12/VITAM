const router = require("express").Router();
const { markAttendance, getStudentAttendance } = require("../controllers/attendanceController");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/mark", roleMiddleware(["FACULTY", "ADMIN"]), markAttendance);
router.get("/student/:studentId", roleMiddleware(["STUDENT", "FACULTY", "ADMIN"]), getStudentAttendance);

module.exports = router;
