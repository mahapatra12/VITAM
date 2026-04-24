const cron = require("node-cron");
const { exportAuditCsv } = require("../services/s3AuditExporter");
const College = require("../models/College");

// Nightly audit export to S3 per tenant when S3 is configured.
module.exports = function startAuditExportJob(io) {
  const bucket = process.env.AUDIT_S3_BUCKET;
  if (!bucket) {
    console.log("[AuditExport] S3 bucket not configured. Skipping audit export job.");
    return;
  }

  const schedule = process.env.AUDIT_S3_CRON || "0 2 * * *"; // 02:00 daily
  cron.schedule(schedule, async () => {
    try {
      const tenants = await College.find({ isActive: true }).select("_id").lean();
      for (const t of tenants) {
        const result = await exportAuditCsv(t._id);
        console.log("[AuditExport] Exported", result.count, "rows to", result.key);
        io?.emit?.("audit-export", { tenantId: t._id, key: result.key });
      }
    } catch (err) {
      console.error("[AuditExport] Failed:", err.message);
    }
  });

  console.log("[AuditExport] Scheduled audit export job:", schedule);
};
