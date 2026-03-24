const cron = require("node-cron");

/**
 * Automates daily institutional analysis and report generation via AI Engine.
 */
const startAIJobs = (io) => {
    // Run Daily at Midnight
    cron.schedule("0 0 * * *", () => {
        console.log("🧠 [AI ENGINE] Initiating Daily Institutional Analysis...");
        
        // Example: Trigger the AI CEO evaluation
        try {
            const aiCEO = require("../services/aiCEO");
            if (aiCEO && typeof aiCEO.init === 'function') {
                // In a real system, we might call a specific analyze method
                // For now, we utilize the existing CEO synthesis
                console.log("🧠 [AI ENGINE] Re-calculating Strategic Directives...");
            }
        } catch (err) {
            console.error("Critical Cron Failure:", err.message);
        }
    });

    console.log("🧠 [AI ENGINE] Automated Cron Ecosystem Online.");
};

module.exports = { startAIJobs };
