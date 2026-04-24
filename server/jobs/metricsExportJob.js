const cron = require("node-cron");
const { exportMetrics } = require("../services/s3MetricsExporter");

module.exports = function startMetricsExportJob(io) {
  const bucket = process.env.METRICS_S3_BUCKET || process.env.AUDIT_S3_BUCKET;
  if (!bucket) {
    console.log("[MetricsExport] S3 bucket not configured. Skipping metrics export job.");
    return;
  }

  const schedule = process.env.METRICS_S3_CRON || "15 2 * * *"; // 02:15 daily
  cron.schedule(schedule, async () => {
    try {
      const result = await exportMetrics();
      console.log("[MetricsExport] Exported metrics to", result.key);
      io?.emit?.("metrics-export", result);
    } catch (err) {
      console.error("[MetricsExport] Failed:", err.message);
    }
  });

  console.log("[MetricsExport] Scheduled metrics export job:", schedule);
};
