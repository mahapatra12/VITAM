const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const AuditLog = require("../models/AuditLog");

const bucket = process.env.AUDIT_S3_BUCKET;

const getClient = () => {
  if (!bucket || !process.env.AWS_REGION) return null;
  return new S3Client({
    region: process.env.AWS_REGION,
  });
};

module.exports.exportAuditCsv = async (tenantId) => {
  const s3 = getClient();
  if (!s3) throw new Error("S3 not configured");

  const logs = await AuditLog.find({ tenantId })
    .sort({ createdAt: -1 })
    .limit(5000)
    .lean();

  const header = "timestamp,method,path,status,userId,ip,durationMs\n";
  const rows = logs
    .map((l) =>
      [
        l.createdAt?.toISOString() || "",
        l.method || "",
        `"${(l.path || "").replace(/"/g, '""')}"`,
        l.status || "",
        l.userId || "",
        l.ip || "",
        l.durationMs || "",
      ].join(",")
    )
    .join("\n");

  const body = Buffer.from(header + rows);
  const key = `audit/${tenantId}/${Date.now()}.csv`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: "text/csv",
    })
  );

  return { bucket, key, count: logs.length };
};
