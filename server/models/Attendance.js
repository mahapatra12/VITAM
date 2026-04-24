const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subjectId: {
        type: String,
        required: true,
        alias: "courseId"
    },
    present: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ["present", "absent", "late", "medical"],
        default: "present"
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
attendanceSchema.index({ studentId: 1, subjectId: 1 });
attendanceSchema.index({ studentId: 1, createdAt: 1 });

attendanceSchema.pre("validate", function syncStatusAndPresence() {
    if (typeof this.status === "string" && this.status.trim()) {
        this.status = this.status.trim().toLowerCase();
        this.present = this.status !== "absent";
        return;
    }

    this.status = this.present ? "present" : "absent";
    return;
});

module.exports = mongoose.model("Attendance", attendanceSchema);
