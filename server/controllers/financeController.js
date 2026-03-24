const Fee = require("../models/Fee");

exports.getFeeStatus = async (req, res) => {
    try {
        const { studentId } = req.params;
        const fees = await Fee.find({ studentId });
        res.json(fees);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getFinanceStats = async (req, res) => {
    try {
        // Mock financial aggregation
        res.json({
            totalCollected: 4500000,
            pendingFees: 1200000,
            latePayments: 15,
            scholarshipsAwarded: 250000
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
