const mongoose = require("mongoose");

const featureFlagSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true, index: true },
    key: { type: String, required: true },
    enabled: { type: Boolean, default: false },
    rolloutPercent: { type: Number, min: 0, max: 100, default: 100 }
}, { timestamps: true });

featureFlagSchema.index({ tenantId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model("FeatureFlag", featureFlagSchema);
