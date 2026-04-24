const mongoose = require("mongoose");

const usageSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "College", required: true, index: true },
    metric: { type: String, required: true },
    value: { type: Number, default: 0 },
    periodStart: { type: Date, required: true }
}, { timestamps: true });

usageSchema.index({ tenantId: 1, metric: 1, periodStart: 1 }, { unique: true });

module.exports = mongoose.model("Usage", usageSchema);
