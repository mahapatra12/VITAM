const cron = require("node-cron");
const { financeAgent, academicAgent, strategyAgent } = require("./aiMultiAgentService");
const Fee = require("../models/Fee");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const User = require("../models/User");

let latestDirective = null;

const fetchTelemetry = async () => {
    try {
        // 1. Finance Aggregation (CFO-AI)
        const feeStats = await Fee.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$paid" },
                    totalDues: { $sum: "$due" },
                    defaulters: { $sum: { $cond: [{ $gt: ["$due", 0] }, 1, 0] } }
                }
            }
        ]);

        const financeData = feeStats[0] || { totalRevenue: 0, totalDues: 0, defaulters: 0 };

        // 2. Academic Aggregation (CAO-AI)
        const attendanceStats = await Attendance.aggregate([
            {
                $group: {
                    _id: null,
                    avgAttendance: { $avg: { $cond: ["$present", 100, 0] } }
                }
            }
        ]);

        // Department-wise pass rate
        const resultStats = await Result.aggregate([
            { $unwind: "$subjects" },
            {
                $group: {
                    _id: "$studentId",
                    studentAvg: { $avg: "$subjects.semesterMarks" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $group: {
                    _id: "$userDetails.department",
                    passRate: { $avg: { $cond: [{ $gte: ["$studentAvg", 40] }, 100, 0] } },
                    avgScore: { $avg: "$studentAvg" }
                }
            }
        ]);

        const academicData = {
            avgAttendance: attendanceStats[0]?.avgAttendance || 0,
            departments: resultStats.map(d => ({
                name: d._id,
                passed: Math.round(d.passRate),
                avgScore: Math.round(d.avgScore)
            }))
        };

        return { financeData, academicData };
    } catch (err) {
        console.error("[AI CEO] Telemetry Acquisition Error:", err);
        return null;
    }
};

const runAutonomousEvaluation = async (io) => {
    console.log("[AI CEO] Initiating Institutional Synthesis via Mongoose Pipelines...");
    
    // 1. Gather Telemetry (Real Data)
    const telemetry = await fetchTelemetry();
    if (!telemetry) return;

    const { financeData, academicData } = telemetry;

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

