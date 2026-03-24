const express = require("express");
const router = express.Router();
const roleMiddleware = require("../middleware/roleMiddleware");
const aiCEO = require("../services/aiCEO");

const getDirectorStats = async (req, res) => {
    const aiData = aiCEO.getLatestDirective();
    res.json({
        attendance: "89.5%",
        activeClasses: 124,
        resourceUtilization: "92%",
        upcomingEvents: 3,
        telemetry: [
            { name: 'CSE', presence: 92 },
            { name: 'ECE', presence: 85 },
            { name: 'MECH', presence: 78 },
            { name: 'CIVIL', presence: 81 }
        ],
        academicReport: aiData?.academicReport || "Waiting for Autonomous AI CEO synchronization..."
    });
};

router.get("/dashboard", roleMiddleware(["director", "superadmin"]), getDirectorStats);

module.exports = router;
