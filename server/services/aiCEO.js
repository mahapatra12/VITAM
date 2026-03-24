const cron = require("node-cron");
const { financeAgent, academicAgent, strategyAgent } = require("./aiMultiAgentService");

let latestDirective = null;

const runAutonomousEvaluation = async (io) => {
    console.log("[AI CEO] Initiating Institutional Synthesis...");
    
    // 1. Gather Telemetry (Mock data for V5.0 structural build)
    const financeData = {
        totalRevenue: 124000000,
        pendingFees: 18000000,
        defaulters: 420,
        recentExpenses: 3400000
    };

    const academicData = {
        totalStudents: 4250,
        avgAttendance: 81.2,
        departments: [
            { name: "CSE", passed: 92, attendance: 85 },
            { name: "ECE", passed: 88, attendance: 81 },
            { name: "MECH", passed: 71, attendance: 76 },
            { name: "CIVIL", passed: 74, attendance: 78 }
        ]
    };

    try {
        // 2. Multi-Agent Processing (Parallel)
        console.log("[AI CEO] Dispatching Subordinate Agents...");
        const [financeReport, academicReport] = await Promise.all([
            financeAgent(financeData),
            academicAgent(academicData)
        ]);

        // 3. Strategic AI CEO Aggregation
        console.log("[AI CEO] Synthesizing Strategic Directives...");
        const ceoDirective = await strategyAgent({ financeReport, academicReport });

        latestDirective = {
            timestamp: new Date().toISOString(),
            financeReport,
            academicReport,
            ceoDirective
        };

        // 4. Emit to Active Dashboards
        console.log("[AI CEO] Broadcasting Directives via Secure Websocket Layer.");
        if (io) {
            io.emit("ceo-update", latestDirective);
        }

    } catch (err) {
        console.error("[AI CEO] Critical Synthesis Failure:", err.message);
    }
};

module.exports = {
    init: (io) => {
        // Run Daily at 9:00 AM
        cron.schedule("0 9 * * *", () => {
            runAutonomousEvaluation(io);
        });

        // Also run immediately on startup for Demo purposes
        setTimeout(() => {
            runAutonomousEvaluation(io);
        }, 5000);
    },
    getLatestDirective: () => latestDirective
};
