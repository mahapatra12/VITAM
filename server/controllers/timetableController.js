const { tutorAgent } = require("../services/aiMultiAgentService");

exports.generateTimetable = async (req, res) => {
    try {
        const { facultyAvailability, roomAvailability, courseRequirements } = req.body;
        
        const prompt = `Generate a conflict-free university timetable based on this data:
        Faculty Availability: ${JSON.stringify(facultyAvailability)}
        Room Availability: ${JSON.stringify(roomAvailability)}
        Course Requirements: ${JSON.stringify(courseRequirements)}
        
        Provide the result in a structured format suitable for a dashboard view.`;

        const timetable = await tutorAgent(prompt);
        res.json({ timetable });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
