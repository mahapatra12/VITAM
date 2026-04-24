const cron = require("node-cron");
const mongoose = require("mongoose");
const { financeAgent, academicAgent, strategyAgent } = require("./aiMultiAgentService");
const Fee = require("../models/Fee");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");
const User = require("../models/User");

// --- Advanced Distributed Telemetry Engine ---
const fetchTelemetry = async () => {
    try {
        console.log("📊 [AI CEO] Gathering Cluster-Wide System Telemetry...");
        
        // 1. Finance Aggregation (CFO-AI)
        const feeStats = await Fee.aggregate([
            {
                $group: {
                    _id: "$collegeId", // Tenant Aware
                    totalRevenue: { $sum: "$paid" },
                    totalDues: { $sum: "$due" },
                    defaulters: { $sum: { $cond: [{ $gt: ["$due", 0] }, 1, 0] } }
                }
            }
        ]);

        const financeData = feeStats.length > 0 ? feeStats : [{ totalRevenue: 0, totalDues: 0, defaulters: 0 }];

        // 2. Academic Aggregation (CAO-AI)
        const attendanceStats = await Attendance.aggregate([
            {
                $group: {
                    _id: "$collegeId",
                    avgAttendance: { $avg: { $cond: ["$present", 100, 0] } }
                }
            }
        ]);

        // Department-wise pass rate
        const resultStats = await Result.aggregate([
            { $unwind: "$subjects" },
            {
                $group: {
                    _id: { studentId: "$studentId", collegeId: "$collegeId" },
                    studentAvg: { $avg: "$subjects.semesterMarks" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id.studentId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $group: {
                    _id: "$userDetails.departmentId",
                    passRate: { $avg: { $cond: [{ $gte: ["$studentAvg", 40] }, 100, 0] } },
                    avgScore: { $avg: "$studentAvg" }
                }
            }
        ]);

        // 3. Security & Infrastructure Metrics (CISO-AI)
        const securityThreats = await User.countDocuments({ "faceAuth.lockUntil": { $gt: new Date() } });
        const totalUsers = await User.countDocuments();
        
        const academicData = {
            avgAttendance: attendanceStats[0]?.avgAttendance || 0,
            departments: resultStats.map(d => ({
                departmentId: d._id,
                passed: Math.round(d.passRate),
                avgScore: Math.round(d.avgScore)
            })),
            infrastructure: { activeUsers: totalUsers, activeThreats: securityThreats }
        };

        return { financeData, academicData };
    } catch (err) {
        console.error("❌ [AI CEO] Telemetry Acquisition Error:", err);
        return null;
    }
};

const runAutonomousEvaluation = async (io) => {
    console.log("🧠 [AI CEO] Initiating Institutional Synthesis Pipeline...");
    
    // 1. Gather Telemetry
    const telemetry = await fetchTelemetry();
    if (!telemetry) return;

    const { financeData, academicData } = telemetry;

    try {
        // 2. Multi-Agent Processing (Parallel Subroutines)
        console.log("🤖 [AI CEO] Dispatching Subordinate Agents...");
        const [financeReport, academicReport] = await Promise.all([
            financeAgent(financeData),
            academicAgent(academicData)
        ]);

        // 3. Strategic AI CEO Aggregation
        console.log("🧠 [AI CEO] Synthesizing Strategic Directives...");
        const ceoDirective = await strategyAgent({ financeReport, academicReport });

        const latestDirective = {
            timestamp: new Date().toISOString(),
            financeReport,
            academicReport,
            ceoDirective
        };

        // 4. Clustered Persistence: Save to DB Instead of Volatile RAM
        // This ensures all V8 worker threads can retrieve the same executive state instantly
        const collection = mongoose.connection.collection("ai_ceo_reports");
        await collection.updateOne(
            { _id: "latest_directive" },
            { $set: latestDirective },
            { upsert: true }
        );
        console.log("💾 [AI CEO] Executive Report securely persisted to Central Matrix.");

        // 5. Emit to Active Dashboards
        if (io) {
            io.emit("ceo-update", latestDirective);
            console.log("🚀 [AI CEO] Directives broadcasted via Secure Websocket Layer.");
        }

    } catch (err) {
        console.error("💥 [AI CEO] Critical Synthesis Failure:", err.message);
    }
};

module.exports = {
    init: (io) => {
        // Cron: Run Daily at 9:00 AM (Handled by Primary Worker)
        cron.schedule("0 9 * * *", () => {
            runAutonomousEvaluation(io);
        });

        // Run delayed initialization to allow DB pool heating
        setTimeout(() => {
            runAutonomousEvaluation(io);
        }, 15000); // Wait 15s to bypass initial startup load
    },
    
    // Allows any cluster worker to fetch the universally synced state instantly
    getLatestDirective: async () => {
        try {
            const collection = mongoose.connection.collection("ai_ceo_reports");
            const doc = await collection.findOne({ _id: "latest_directive" });
            return doc;
        } catch (err) {
            console.error("❌ [AI CEO] Matrix Retrieval Error:", err.message);
            return null;
        }
    }
};

