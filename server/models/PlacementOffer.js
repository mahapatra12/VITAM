const mongoose = require("mongoose");

const placementOfferSchema = new mongoose.Schema({
    id: {
        type: String, // e.g. OFF-001
        required: true,
        unique: true
    },
    student: {
        type: String, // Student Name
        required: true
    },
    roll: {
        type: String, // Student Roll No (CV2022009)
        required: true
    },
    company: {
        type: String,
        required: true
    },
    package: {
        type: String, // e.g. "18 LPA"
        required: true
    },
    date: {
        type: String, // Simplifying to match UI: "20 Mar"
        required: true
    },
    driveId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PlacementDrive",
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model("PlacementOffer", placementOfferSchema);
