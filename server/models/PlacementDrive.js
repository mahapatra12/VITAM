const mongoose = require("mongoose");

const placementDriveSchema = new mongoose.Schema({
    id: {
        type: String, // e.g. PL-001
        required: true,
        unique: true
    },
    company: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["Full Time", "Internship", "Both"],
        default: "Full Time"
    },
    deadline: {
        type: String
    },
    applicants: {
        type: Number,
        default: 0
    },
    shortlisted: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["Applications Open", "Interviewing", "Drive Completed"],
        default: "Applications Open"
    },
    color: {
        type: String,
        default: "#4f46e5"
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model("PlacementDrive", placementDriveSchema);
