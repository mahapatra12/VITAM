const mongoose = require("mongoose");

const collegeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    domain: { type: String, required: true, unique: true },
    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    apiKey: { type: String, unique: true, sparse: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("College", collegeSchema);
