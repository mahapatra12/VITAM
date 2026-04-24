const { respondWithServerError } = require("../utils/respondWithServerError");

exports.getFacultyStats = async (req, res) => {
    try {
        // Mock data fallback
        res.json({
            allocatedCourses: '4',
            totalStudents: '120',
            attendanceAvg: '88%',
            pendingGrading: '18'
        });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Get Faculty Stats Error",
            msg: "Unable to load faculty statistics right now"
        });
    }
};
