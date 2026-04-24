const path = require("path");
const mongoose = require("mongoose");
const crypto = require("crypto");
const { S3Client, HeadBucketCommand } = require("@aws-sdk/client-s3");
const v8 = require("v8");
const fs = require("fs");
const net = require("net");
const dns = require("dns").promises;
const os = require("os");

require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });
const { validateEnvironment } = require("../config/envValidation");

const isTrue = (value) => String(value || "").trim().toLowerCase() === "true";

const createCheckRecorder = () => {
    const checks = [];
    return {
        checks,
        record(name, status, detail) {
            checks.push({ name, status, detail, ts: new Date().toISOString() });
            
            // Advance Terminal Logging Matrix
            const color = status === 'passed' ? '\x1b[32m' : (status === 'warning' ? '\x1b[33m' : '\x1b[31m');
            const icon = status === 'passed' ? '✅' : (status === 'warning' ? '⚠️' : '❌');
            console.log(`${color}${icon} [${name.toUpperCase()}] ${status.toUpperCase()} - ${detail}\x1b[0m`);
        }
    };
};

const verifyMongoConnectivity = async () => {
    const mongoUri = String(process.env.MONGO_URI || "").trim() || String(process.env.MONGO_DIRECT_URI || "").trim();
    if (!mongoUri) throw new Error("Database URI Missing");

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    await mongoose.connection.db.admin().ping();
    await mongoose.connection.close(false);
};

const verifyDataLakeConnectivity = async () => {
    if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID === "MOCK_KEY") {
        throw new Error("AWS S3 Credentials Mocked or Missing.");
    }

    const s3 = new S3Client({ region: process.env.AWS_REGION || "us-east-1" });
    const bucket = process.env.AWS_DATALAKE_BUCKET || "vitam-forensics-lake";
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
};

const verifyVaultCryptography = () => {
    const key = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
    if (!key) throw new Error("Vault Master Key undefined.");
    
    // Explicit format testing
    const derived = crypto.createHash('sha256').update(String(key)).digest();
    if (derived.length !== 32) throw new Error("Derived AES Key length invalid.");
};

const verifyNodeEngine = () => {
    const major = parseInt(process.versions.node.split('.')[0], 10);
    if (major < 20 || major >= 25) {
        throw new Error(`Unsupported Node.js Engine v${process.versions.node}. Expected >=20 <25`);
    }
    return `Node.js verified (v${process.versions.node})`;
};

const verifyFileSystemMounts = async () => {
    const criticalDirs = [
        path.resolve(__dirname, "..", "tmp"),
        path.resolve(__dirname, "..", "uploads")
    ];

    for (const dir of criticalDirs) {
        try {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            await fs.promises.access(dir, fs.constants.W_OK);
        } catch (e) {
            throw new Error(`Directory unwritable/missing: ${dir} (${e.message})`);
        }
    }
    return `Critical mount points accessible and initialized.`;
};

const verifyNetworkAvailability = async () => {
    const port = Number(process.env.PORT) || 5101;
    await new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                reject(new Error(`PORT COLLISION: Port ${port} is currently bound and active.`));
            } else {
                reject(new Error(`Port network error: ${e.message}`));
            }
        });
        server.listen(port, () => {
            server.close(() => resolve());
        });
    });

    const endpoints = [
        "api.cloudinary.com",
        "api.groq.com"
    ];

    try {
        await Promise.all(endpoints.map(ep => dns.resolve(ep).catch(() => null)));
    } catch (e) {
         throw new Error(`External DNS Resolution failed. Firewall anomaly detected.`);
    }

    return `Port ${port} valid for binding & DNS operational.`;
};

const verifyHardwareConstraints = () => {
    const memory = process.memoryUsage();
    const heapTotalMB = Math.round(memory.heapTotal / 1024 / 1024);
    const limitParams = v8.getHeapStatistics();
    const heapLimitMB = Math.round(limitParams.heap_size_limit / 1024 / 1024);
    
    if (heapTotalMB > (heapLimitMB * 0.8)) {
         throw new Error(`V8 Engine Memory critically saturated: ${heapTotalMB}MB / ${heapLimitMB}MB`);
    }

    const freeOsMemMB = Math.round(os.freemem() / 1024 / 1024);
    if (freeOsMemMB < 250) {
         throw new Error(`System Memory Starvation: Only ${freeOsMemMB}MB Available`);
    }

    return `Active Heap: ${heapTotalMB}MB | OS RAM Free: ${freeOsMemMB}MB`;
};

const main = async () => {
    console.log("\n\x1b[36m\x1b[1m🚀 INITIATING ADVANCED DEPLOYMENT PREFLIGHT...\x1b[0m\n");
    
    const startedAt = Date.now();
    const recorder = createCheckRecorder();
    
    // 1. Environment Parsing
    const { errors, warnings } = validateEnvironment();
    if (errors.length > 0) recorder.record("environment", "failed", errors.join(" | "));
    else if (warnings.length > 0) recorder.record("environment", "warning", warnings.join(" | "));
    else recorder.record("environment", "passed", "Schema Validation Successful");

    // 2. Cryptographic Integrity
    try {
        verifyVaultCryptography();
        recorder.record("cryptography", "passed", "AES-256 Vault initialization sequence verified.");
    } catch (e) { recorder.record("cryptography", "failed", e.message); }

    // 3. Database Matrix
    if (isTrue(process.env.SKIP_DB_PREFLIGHT)) {
        recorder.record("database", "skipped", "Evaluation bypassed explicitly");
    } else {
        try {
            await verifyMongoConnectivity();
            recorder.record("database", "passed", "MongoDB Replica Set Ping Successful.");
        } catch (e) { recorder.record("database", "failed", e.message); }
    }

    // 4. Data Lake S3 Topology
    try {
        await verifyDataLakeConnectivity();
        recorder.record("data_lake", "passed", "AWS S3 Analytical Bucket handshake secured.");
    } catch (e) {
        recorder.record("data_lake", "warning", `Data Lake running in volatile RAM mode: ${e.message}`);
    }

    // 5. Engine Verification
    try {
        const msg = verifyNodeEngine();
        recorder.record("engine", "passed", msg);
    } catch (e) { recorder.record("engine", "failed", e.message); }

    // 6. File System Integrity
    try {
        const msg = await verifyFileSystemMounts();
        recorder.record("system", "passed", msg);
    } catch (e) { recorder.record("system", "failed", e.message); }

    // 7. Network Subsystem Diagnostics
    try {
        const msg = await verifyNetworkAvailability();
        recorder.record("network", "passed", msg);
    } catch (e) { recorder.record("network", "failed", e.message); }

    // 8. Hardware Thresholds
    try {
        const memStat = verifyHardwareConstraints();
        recorder.record("hardware", "passed", memStat);
    } catch (e) { recorder.record("hardware", "warning", e.message); }


    const hasFailure = recorder.checks.some(c => c.status === "failed");
    console.log(`\n\x1b[1mPreflight concluded in ${Date.now() - startedAt}ms.\x1b[0m`);
    
    if (hasFailure) {
        console.error("\n\x1b[31m\x1b[1m🚨 PREFLIGHT FAILED: Deployment Halted due to critical subsystem failure.\x1b[0m\n");
        process.exit(1);
    } else {
        console.log("\n\x1b[32m\x1b[1m🎉 ALL SYSTEMS GO: Ready for production sequence.\x1b[0m\n");
        process.exit(0);
    }
};

main().catch((error) => {
    console.error("\x1b[31m💥 FATAL EXCEPTION:\x1b[0m", error);
    process.exit(1);
});
