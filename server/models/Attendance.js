const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subjectId: {
        type: String,
        required: true
    },
    present: {
        type: Boolean,
        default: true
    },
    method: {
        type: String,
        enum: ["FACE_RECOGNITION", "BIOMETRIC", "GEO_FENCING", "QR_SCAN", "MANUAL"]
    },
    location: {
        latitude: Number,
        longitude: Number
    }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
