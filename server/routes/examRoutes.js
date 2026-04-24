const express = require("express");
const router = express.Router();
const roleMiddleware = require("../middleware/roleMiddleware");

const getExamStats = async (req, res) => {
    res.json({
        totalExams: 18,
        students: "4,250",
        pendingHalls: 3,
        passRate: "73.8%",
        schedule: [
            { subject: 'Data Structures', branch: 'CSE', date: '2026-04-02', time: '9:00 AM', hall: 'A-101', status: 'Scheduled' },
            { subject: 'Network Theory', branch: 'ECE', date: '2026-04-03', time: '9:00 AM', hall: 'B-201', status: 'Scheduled' },
            { subject: 'Thermodynamics', branch: 'MECH', date: '2026-04-04', time: '2:00 PM', hall: 'C-301', status: 'Pending' },
            { subject: 'Structural Analysis', branch: 'CIVIL', date: '2026-04-05', time: '9:00 AM', hall: 'D-401', status: 'Scheduled' },
            { subject: 'DBMS', branch: 'CSE', date: '2026-04-07', time: '2:00 PM', hall: 'A-102', status: 'Draft' },
        ],
        passRateAnalysis: [
            { subject: 'DSA', passRate: 87, fill: '#3b82f6' },
            { subject: 'DBMS', passRate: 79, fill: '#8b5cf6' },
            { subject: 'OS', passRate: 74, fill: '#06b6d4' },
            { subject: 'CN', passRate: 68, fill: '#f59e0b' },
            { subject: 'TOC', passRate: 61, fill: '#ef4444' },
        ],
        malpracticeLog: [
            { id: 'S2023001', name: 'Rahul Kumar', exam: 'DSA', action: 'Phone Detected', severity: 'high' },
            { id: 'S2023078', name: 'Priya Sharma', exam: 'DBMS', action: 'Material Found', severity: 'medium' },
            { id: 'S2023112', name: 'Aditya Singh', exam: 'OS', action: 'Suspicious Activity', severity: 'low' },
        ]
    });
};

router.get("/dashboard", roleMiddleware(["admin", "superadmin"]), getExamStats);

module.exports = router;
