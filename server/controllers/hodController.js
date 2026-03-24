exports.getHodStats = async (req, res) => {
    try {
        // Mock data fallback
        res.json({
            totalFaculty: '24',
            totalStudents: '840',
            courseCompletion: '92%'
        });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};
