const express = require("express");
const router = express.Router();
const roleMiddleware = require("../middleware/roleMiddleware");
const aiCEO = require("../services/aiCEO");

const getChairmanStats = async (req, res) => {
    const aiData = aiCEO.getLatestDirective();
    res.json({
        totalRevenue: "₹12.4 Cr",
        enrollmentGrowth: "4,250",
        placementAvg: "₹6.5 LPA",
        reputation: "NAAC A+",
        revenueGraph: [
            { name: 'Jan', revenue: 1.2 },
            { name: 'Feb', revenue: 1.5 },
            { name: 'Mar', revenue: 1.1 },
            { name: 'Apr', revenue: 1.8 }
        ],
        aiStrategy: aiData?.ceoDirective || "Waiting for Autonomous AI CEO synchronization...",
        financeReport: aiData?.financeReport || ""
    });
};

router.get("/dashboard", roleMiddleware(["chairman", "superadmin"]), getChairmanStats);

module.exports = router;
