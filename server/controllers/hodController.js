const { respondWithServerError } = require("../utils/respondWithServerError");

exports.getHodStats = async (req, res) => {
    try {
        // Mock data fallback
        res.json({
            totalFaculty: '24',
            totalStudents: '840',
            courseCompletion: '92%'
        });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Get HOD Stats Error",
            msg: "Unable to load HOD statistics right now"
        });
    }
};
