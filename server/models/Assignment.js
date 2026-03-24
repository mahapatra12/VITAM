const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    courseId: { type: String, required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date },
    maxScore: { type: Number, default: 100 },
    status: { type: String, enum: ["ACTIVE", "CLOSED"], default: "ACTIVE" }
}, { timestamps: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
