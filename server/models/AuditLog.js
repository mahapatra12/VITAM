const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "College", index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    method: String,
    path: String,
    status: Number,
    ip: String,
    userAgent: String,
    durationMs: Number
}, { timestamps: true });

auditLogSchema.index({ tenantId: 1, createdAt: -1 });
// Auto-expire audits after 90 days to keep the collection lean
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
