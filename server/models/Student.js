const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    enrollmentNumber: {
        type: String,
        unique: true
    },
    rollNo: {
        type: String,
        unique: true
    },
    registrationNo: {
        type: String,
        unique: true
    },
    branch: {
        type: String
    },
    semester: {
        type: Number,
        default: 1
    },
    mobile: String,
    aadhaar: String,
    dob: Date,
    profileImage: String,
    promotionEligible: {
        type: Boolean,
        default: false
    },
    examCompleted: {
        type: Boolean,
        default: false
    },
    cgpa: {
        type: Number,
        default: 0
    },
    attendancePercentage: {
        type: Number,
        default: 0
    },
    skills: [String],
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }]
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
