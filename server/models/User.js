const mongoose = require("mongoose");
const cryptoVault = require("../utils/cryptoVault");

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
    faceAuth: {
        enabled: {
            type: Boolean,
            default: false
        },
        descriptor: {
            type: [Number],
            default: []
        },
        descriptorVersion: {
            type: Number,
            default: 1
        },
        threshold: {
            type: Number,
            default: 0.86
        },
        enrolledAt: {
            type: Date
        },
        lastVerifiedAt: {
            type: Date
        },
        failedAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: {
            type: Date
        },
        challenge: {
            type: String
        },
        challengeExpiresAt: {
            type: Date
        },
        challengeIssuedAt: {
            type: Date
        },
        captureMeta: {
            model: String,
            sampleCount: Number,
            avgBrightness: Number,
            avgContrast: Number,
            deviceLabel: String
        }
    },
    credentials: [{
        credentialID: Buffer,
        publicKey: Buffer,
        counter: Number,
        transports: [String],
        nickname: String,
        lastUsed: Date,
    }],
    sessionVersion: {
        type: Number,
        default: 0
    },
    authFlowVersion: {
        type: Number,
        default: 0
    },
    registrationChallenge: { type: String },
    registrationChallengeAt: { type: Date },
    authChallenge: { type: String },
    authChallengeAt: { type: Date },
    totpFailures: { type: Number, default: 0 },
    totpLockUntil: { type: Date },
    loginFailures: { type: Number, default: 0 },
    loginLockUntil: { type: Date },
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
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        index: true
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

// --- Advanced Database Hyper-Indexing ---
// Compound indexes optimized for multi-tenant SaaS filtering.
// These allow MongoDB to pull frequent queries directly from RAM without table scans.
userSchema.index({ collegeId: 1, role: 1, departmentId: 1 });
userSchema.index({ collegeId: 1, subRole: 1 });
userSchema.index({ "faceAuth.enabled": 1, collegeId: 1 });

// Encrypt only freshly mutated plain-text fields before persistence.
userSchema.pre("save", function () {
    const fieldsToSecure = ["mobileNo", "aadharNo", "twoFactorSecret"];

    fieldsToSecure.forEach((field) => {
        const value = this[field];
        if (!this.isModified(field) || !value) {
            return;
        }

        const serializedValue = String(value);
        if (serializedValue.startsWith("VAULT::")) {
            return;
        }

        this[field] = cryptoVault.encrypt(serializedValue);
    });
});

// Magically unpacks the Vault lock into plain-text only when the UI specifically requests it
const decryptTransform = (doc, ret) => {
    ['mobileNo', 'aadharNo', 'twoFactorSecret'].forEach(field => {
        if (ret[field] && typeof ret[field] === 'string' && ret[field].startsWith('VAULT::')) {
            ret[field] = cryptoVault.decrypt(ret[field]);
        }
    });
    return ret;
};

userSchema.set('toJSON', { transform: decryptTransform });
userSchema.set('toObject', { transform: decryptTransform });

module.exports = mongoose.model("User", userSchema);
