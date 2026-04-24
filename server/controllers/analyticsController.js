const User = require("../models/User");
const Attendance = require("../models/Attendance");
const Result = require("../models/Result");

const getPredictiveAnalytics = async (req, res) => {
    try {
        const query = req.tenant?.id ? { collegeId: req.tenant.id } : {};
        
        // 1. Traverse Users to find Students
        const students = await User.find({ ...query, role: "STUDENT" }).select('_id name email department');
        const studentIds = students.map(s => s._id);

        // 2. Aggregate Attendance Matrix
        const attendanceRecords = await Attendance.find({ studentId: { $in: studentIds } });
        
        // 3. Aggregate Results Matrix
        const results = await Result.find({ studentId: { $in: studentIds } });

        // Phase 4: Predict Risk Algorithms
        let riskStudents = [];
        let totalScoreAvg = 0;
        let validScores = 0;
        
        for (let student of students) {
            // Compute Attendance Percentage
            const stuAttends = attendanceRecords.filter(a => a.studentId.toString() === student._id.toString());
            const present = stuAttends.filter(a => a.present).length;
            const attendPercent = stuAttends.length > 0 ? (present / stuAttends.length) * 100 : 100;

            // Compute Academic Marks Percentage
            const stuResults = results.filter(r => r.studentId.toString() === student._id.toString());
            let marksPercent = 100;
            if (stuResults.length > 0) {
                let totalMarks = 0;
                let subjectsCount = 0;
                stuResults.forEach(r => {
                    r.subjects.forEach(sub => {
                        totalMarks += sub.semesterMarks || 0;
                        subjectsCount++;
                    });
                });
                marksPercent = subjectsCount > 0 ? (totalMarks / subjectsCount) : 100;
                totalScoreAvg += marksPercent;
                validScores++;
            }

            // AI Ruleset for Risk Threshold
            if (attendPercent < 75 || marksPercent < 50) {
                riskStudents.push({
                    name: student.name,
                    id: student.email.split('@')[0].toUpperCase(),
                    risk: attendPercent < 65 || marksPercent < 40 ? "Critical" : "Medium",
                    factor: attendPercent < 75 ? `Attendance Drop-off (${attendPercent.toFixed(1)}%)` : `Assessment Trend Under 50%`,
                    intervention: attendPercent < 75 ? "Advising Session Required" : "Remedial Track Enabled"
                });
            }
        }

        const systemAvgScore = validScores > 0 ? (totalScoreAvg / validScores) : 85;

        // Predictive Graph Mock (Calculated based on average score & student count dynamically)
        const PREDICTION_DATA = [];
        const riskVolume = riskStudents.length;
        const totalStu = students.length || 1;
        const baseGrad = Math.min(systemAvgScore + 5, 98);
        const basePlace = Math.min(systemAvgScore - 4, 95);

        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].forEach((m, i) => {
            PREDICTION_DATA.push({
                month: m,
                graduation: parseFloat((baseGrad - (5 - i)).toFixed(1)),
                placement: parseFloat((basePlace - (5 - i)).toFixed(1)),
                risk: Math.max(parseFloat(((riskVolume / totalStu) * 100 - i).toFixed(1)), 2)
            });
        });

        // Skill Radar (Dynamically anchoring around systemAvgScore)
        const SKILL_RADAR = [
            { subject: 'Technical', A: parseFloat((systemAvgScore * 1.3).toFixed(1)), fullMark: 150 },
            { subject: 'Soft Skills', A: parseFloat((systemAvgScore * 1.1).toFixed(1)), fullMark: 150 },
            { subject: 'Attendance', A: parseFloat((systemAvgScore * 1.05).toFixed(1)), fullMark: 150 },
            { subject: 'Research', A: parseFloat((systemAvgScore * 1.2).toFixed(1)), fullMark: 150 },
            { subject: 'Innovation', A: parseFloat((systemAvgScore * 0.95).toFixed(1)), fullMark: 150 }
        ];

        // Success Metrics Dynamic
        const SUCCESS_METRICS = [
            { name: 'Placement Forecast', value: `+${parseFloat((systemAvgScore * 0.15).toFixed(1))}%`, sub: 'Target Salary Hike' },
            { name: 'Graduation Probability', value: `${parseFloat(baseGrad.toFixed(1))}%`, sub: 'Predicted Pass' },
            { name: 'Research Velocity', value: parseFloat((systemAvgScore * 0.05).toFixed(1)).toString(), sub: 'Papers / Faculty' },
            { name: 'Student Retention', value: `${parseFloat((100 - (riskVolume / totalStu) * 100).toFixed(1))}%`, sub: 'Institutional Stability' }
        ];

        return res.status(200).json({
            PREDICTION_DATA,
            SKILL_RADAR,
            SUCCESS_METRICS,
            RISK_STUDENTS: riskStudents
        });

    } catch (err) {
        console.error("[Predictive Analytics Sync Error]", err);
        return res.status(500).json({ msg: "Failed to parse institutional trajectory models", details: err.message });
    }
};

module.exports = { getPredictiveAnalytics };
