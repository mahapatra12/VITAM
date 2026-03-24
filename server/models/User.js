const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["superadmin", "admin", "chairman", "director", "FACULTY", "STUDENT"],
        default: "STUDENT"
    },
    subRole: {
        type: String,
        enum: [
            "principal",
            "vice_principal",
            "exam",
            "finance",
            "placement",
            "hod",
            "bus",
            "none"
        ],
        default: "none"
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
    },
    twoFactorSecret: {
        type: String
    },
    isTwoFactorEnabled: {
        type: Boolean,
        default: false
    },
    isBiometricEnabled: {
        type: Boolean,
        default: false
    },
    biometricId: {
        type: String
    },
    credentials: [{
        credentialID: Buffer,
        publicKey: Buffer,
        counter: Number,
        transports: [String],
    }],
    profilePhoto: {
        type: String
    },
    mobileNo: {
        type: String
    },
    aadharNo: {
        type: String
    },
    dob: {
        type: Date
    },
    securityLogs: [{
        event: String,
        status: String,
        details: String,
        location: String,
        ip: String,
        device: String,
        timestamp: { type: Date, default: Date.now }
    }],
    lastLogin: {
        type: Date
    },
    isFirstLogin: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
