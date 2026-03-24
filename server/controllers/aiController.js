const { tutorAgent, graderAgent, analyticsAgent, resumeAgent } = require("../services/aiMultiAgentService");

exports.chat = async (req, res) => {
    try {
        const { prompt } = req.body;
        // Basic chat uses the tutor agent
        const answer = await tutorAgent(prompt);
        res.json({ answer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.generateReport = async (req, res) => {
    try {
        const { type, data } = req.body;
        let report = "";
        
        if (type === "STUDENT_RISK" || type === "ENROLLMENT_PREDICTION") {
            report = await analyticsAgent(data, type);
        } else if (type === "GRADING_INSIGHTS") {
            report = await graderAgent(data);
        } else if (type === "RESUME_BUILD") {
            report = await resumeAgent(data);
        } else {
            report = await tutorAgent(`Explain this data summary: ${JSON.stringify(data)}`);
        }

        res.json({ report });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.predictFailure = async (req, res) => {
    try {
        const { attendance, marks } = req.body;
        const { predictPerformance } = require("../services/aiService");
        
        const prediction = predictPerformance(attendance || 85, marks || 75);
        res.json({ analysis: prediction });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.careerGuide = async (req, res) => {
    try {
        const { studentData } = req.body;
        const roadmap = await require("../services/aiMultiAgentService").careerGuide(studentData);
        res.json({ roadmap });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
