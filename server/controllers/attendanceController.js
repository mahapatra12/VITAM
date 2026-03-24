const Attendance = require("../models/Attendance");

exports.markAttendance = async (req, res) => {
    try {
        const { studentId, courseId, status, method, location } = req.body;
        
        const attendance = new Attendance({
            studentId,
            courseId,
            status,
            method,
            location
        });

        await attendance.save();
        res.status(201).json({ msg: "Attendance marked successfully", attendance });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const attendance = await Attendance.find({ studentId }).sort({ date: -1 });
        res.json(attendance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
