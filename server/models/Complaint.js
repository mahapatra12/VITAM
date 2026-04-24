const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
    id: {
        type: String, // E.g. "T-001"
        required: true,
        unique: true
    },
    student: {
        type: String,
        required: true
    },
    room: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "In Progress", "Resolved", "Deferred"],
        default: "Pending"
    },
    date: {
        type: String, // Simplifying to match UI: "21 Mar"
        required: true
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        default: "Low"
    },
    remark: {
        type: String
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        index: true
    }
}, { timestamps: true });
complaintSchema.index({ collegeId: 1, status: 1 });
complaintSchema.index({ collegeId: 1, priority: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);
