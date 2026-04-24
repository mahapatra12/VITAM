const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    txId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: "INR"
    },
    payer: {
        type: String, // E.g., Student Name, Corporate Partner
        required: true
    },
    type: {
        type: String,
        enum: ["Tuition Fee", "Hostel Fee", "Exam Fee", "Grant", "Donation", "Payroll", "Infrastructure", "Miscellaneous"],
        required: true
    },
    status: {
        type: String,
        enum: ["verified", "pending", "failed", "processing"],
        default: "pending"
    },
    direction: {
        type: String,
        enum: ["INBOUND", "OUTBOUND"],
        default: "INBOUND"
    },
    department: {
        type: String,
        enum: ["Tuition", "Research Grants", "Corporate Training", "Examinations", "Operations", "Welfare"],
        default: "Tuition"
    },
    remarks: {
        type: String
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        index: true
    }
}, { timestamps: true });
transactionSchema.index({ collegeId: 1, status: 1, createdAt: -1 });
transactionSchema.index({ collegeId: 1, type: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
