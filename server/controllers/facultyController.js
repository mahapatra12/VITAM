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
        res.status(500).json({ msg: "Server error" });
    }
};
