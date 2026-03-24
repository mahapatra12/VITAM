const mongoose = require("mongoose");

const facultySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subjects: [{
        type: String
    }],
    experienceYears: {
        type: Number
    },
    researchAreas: [{
        type: String
    }],
    performanceScore: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("Faculty", facultySchema);
