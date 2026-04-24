const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const Usage = require("../models/Usage");
const User = require("../models/User");
const College = require("../models/College");

const bucket = process.env.METRICS_S3_BUCKET || process.env.AUDIT_S3_BUCKET;

const getClient = () => {
  if (!bucket || !process.env.AWS_REGION) return null;
  return new S3Client({ region: process.env.AWS_REGION });
};

module.exports.exportMetrics = async () => {
  const s3 = getClient();
  if (!s3) throw new Error("S3 not configured for metrics");

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [tenantCount, userCount, usageAgg] = await Promise.all([
    College.countDocuments({ isActive: true }),
    User.countDocuments(),
    Usage.aggregate([
      { $match: { metric: "requests", periodStart } },
      { $group: { _id: "$tenantId", value: { $sum: "$value" } } }
    ])
  ]);

  const payload = {
    generatedAt: now.toISOString(),
    tenantCount,
    userCount,
    requestsByTenant: usageAgg.reduce((acc, row) => {
      acc[row._id?.toString() || "unknown"] = row.value;
      return acc;
    }, {})
  };

  const key = `metrics/${now.toISOString().split("T")[0]}-metrics.json`;
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: JSON.stringify(payload, null, 2),
    ContentType: "application/json"
  }));

  return { bucket, key };
};
