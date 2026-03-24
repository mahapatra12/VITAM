const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    paid: {
        type: Number,
        default: 0
    },
    due: {
        type: Number,
        default: 0
    },
    receipts: [String]
}, { timestamps: true });

module.exports = mongoose.model("Fee", feeSchema);
