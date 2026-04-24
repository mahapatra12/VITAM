const express = require("express");
const router = express.Router();
const roleMiddleware = require("../middleware/roleMiddleware");

const getPrincipalStats = async (req, res) => {
    res.json({
        performance: "9.4",
        growth: "18.4%",
        learningNodes: 512,
        deptRadar: [
            { dept: 'CSE', value: 98 },
            { dept: 'ECE', value: 89 },
            { dept: 'MECH', value: 74 },
            { dept: 'CIVIL', value: 77 },
            { dept: 'MBA', value: 92 },
            { dept: 'MCA', value: 95 },
        ],
        approvals: [
            { item: 'Institutional Resource Optimization: Research', dept: 'All', amount: '₹2.8Cr', urgency: 'PRIORITY_ONE', days: 0 },
            { item: 'Departmental Performance Alignment: MECH', dept: 'MECH', amount: 'N/A', urgency: 'HIGH_PRIORITY', days: 1 },
            { item: 'Academic Curriculum Synchronization', dept: 'All', amount: 'N/A', urgency: 'DIRECTIVE', days: 0 },
        ],
        riskData: [
            { dept: 'CSE', risk: 2, pass: 98 },
            { dept: 'ECE', risk: 8, pass: 92 },
            { dept: 'MECH', risk: 14, pass: 84 },
            { dept: 'CIVIL', risk: 12, pass: 86 },
            { dept: 'MBA', risk: 4, pass: 97 },
            { dept: 'MCA', risk: 5, pass: 96 },
        ]
    });
};

router.get("/dashboard", roleMiddleware(["admin", "superadmin", "director"]), getPrincipalStats);

module.exports = router;
