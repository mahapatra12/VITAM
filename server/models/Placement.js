const mongoose = require("mongoose");

const placementSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    domain: String,
    resumeLink: String,
    trainingProgress: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("Placement", placementSchema);
