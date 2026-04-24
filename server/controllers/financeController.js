const Fee = require("../models/Fee");
const Transaction = require("../models/Transaction");
const { respondWithServerError } = require("../utils/respondWithServerError");
const { resolveScopedStudentId } = require("../utils/studentAccess");

exports.getFeeStatus = async (req, res) => {
    try {
        const scopedStudent = resolveScopedStudentId(req, req.params.studentId);
        if (!scopedStudent.ok) {
            return res.status(scopedStudent.status).json(scopedStudent.body);
        }

        const fees = await Fee.find({ studentId: scopedStudent.studentId }).sort({ createdAt: -1 });
        res.json(fees);
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Get Fee Status Error",
            msg: "Unable to load fee status right now"
        });
    }
};

exports.getFinanceDashboard = async (req, res) => {
    try {
        const query = req.tenant?.id ? { collegeId: req.tenant.id } : {};
        
        // Parallel aggregations for speed
        const [totals, typeBreakdown, recentTransactions] = await Promise.all([
            Transaction.aggregate([
                { $match: query },
                { $group: {
                    _id: null,
                    totalCollected: { $sum: { $cond: [{ $and: [{ $eq: ["$direction", "INBOUND"] }, { $eq: ["$status", "verified"] }] }, "$amount", 0] } },
                    pendingDues: { $sum: { $cond: [{ $and: [{ $eq: ["$direction", "INBOUND"] }, { $eq: ["$status", "pending"] }] }, "$amount", 0] } },
                    operationalSpend: { $sum: { $cond: [{ $and: [{ $eq: ["$direction", "OUTBOUND"] }, { $ne: ["$department", "Welfare"] }] }, "$amount", 0] } },
                    scholarshipDisbursed: { $sum: { $cond: [{ $and: [{ $eq: ["$direction", "OUTBOUND"] }, { $eq: ["$department", "Welfare"] }] }, "$amount", 0] } }
                }}
            ]),
            Transaction.aggregate([
                { $match: { ...query, direction: "INBOUND", status: "verified" } },
                { $group: {
                    _id: "$department",
                    value: { $sum: "$amount" }
                }}
            ]),
            Transaction.find(query).sort({ createdAt: -1 }).limit(10)
        ]);

        const formatCurrency = (val) => {
           if (!val) return '₹0';
           if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)} Cr`;
           if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
           return `₹${val.toLocaleString('en-IN')}`;
        };

        const t = totals[0] || {};
        
        // Define colors per dept for UI piechart mapping
        const colorMap = {
            "Tuition": "#10b981",
            "Research Grants": "#3b82f6",
            "Corporate Training": "#8b5cf6",
            "Examinations": "#f59e0b",
            "Operations": "#ef4444",
            "Welfare": "#ec4899"
        };

        // Synthesize area chart payload (In production this would group by $month)
        const collectionData = [
            { month: 'Jan', collected: 1.2, pending: 0.4 },
            { month: 'Feb', collected: 2.1, pending: 0.2 },
            { month: 'Mar', collected: (t.totalCollected || 18000000) / 10000000, pending: (t.pendingDues || 3000000) / 10000000 },
            { month: 'Apr', collected: 2.4, pending: 0.1 }
        ];

        res.json({
            metrics: {
                totalCollections: formatCurrency(t.totalCollected),
                pendingDues: formatCurrency(t.pendingDues),
                operationalSpend: formatCurrency(t.operationalSpend),
                scholarshipDisbursed: formatCurrency(t.scholarshipDisbursed)
            },
            revenueByDept: typeBreakdown.map(dept => ({
                name: dept._id,
                value: dept.value,
                fill: colorMap[dept._id] || "#ffffff"
            })),
            collectionData,
            recentTransactions: recentTransactions.map(tx => ({
                id: tx.txId,
                student: tx.payer,
                amount: `₹${tx.amount.toLocaleString('en-IN')}`,
                type: tx.type,
                status: tx.status,
                time: "Recently"
            }))
        });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Get Finance Dashboard Error",
            msg: "Unable to load finance statistics right now"
        });
    }
};

exports.auditAction = async (req, res) => {
    try {
        const { action } = req.body;
        // In reality, this would bind directly to AuditLogs or dispatch Celery tasks
        console.log(`[TREASURY OVERRIDE] CFO dispatched: ${action}`);
        res.status(200).json({ success: true, timestamp: new Date().toISOString(), action });
    } catch (err) {
        return res.status(500).json({ msg: "Core Telemetry Failure", details: err.message });
    }
};
