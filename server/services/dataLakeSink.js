const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const eventBus = require("./eventBus");

/**
 * [VITAM AI] AWS S3 Data Lake Sink (Micro-Batcher)
 * 
 * Captures extreme influxes of autonomous events from the EventBus.
 * Instead of crashing the server by writing 10,000 files to S3 immediately,
 * it safely buffers them in RAM and commits compressed chunks to cold-storage every 60 seconds.
 */
class DataLakeSink {
    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || "us-east-1",
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || "MOCK_KEY",
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "MOCK_SECRET"
            }
        });
        
        this.bucketName = process.env.AWS_DATALAKE_BUCKET || "vitam-forensics-lake";
        this.batchBuffer = [];
        this.batchTimer = null;
        this.MAX_BUFFER_SIZE = 1000;
        
        this.startListening();
    }

    startListening() {
        console.log("🌊 [Data Lake Sink] Actively pooling telemetry headers...");
        
        // Listen to native high-priority security breaches
        eventBus.on("SECURITY_BREACH", (payload) => this.queueEvent("security", payload));
        
        // Listen to autonomous AI execution traces
        eventBus.on("SYSTEM_RATE_LIMIT", (payload) => this.queueEvent("network", payload));
        
        // Force a commit cycle every 60 seconds to ensure data isn't lost if the server stops
        setInterval(() => this.flushToS3(), 60000);
    }

    queueEvent(category, payload) {
        this.batchBuffer.push({ category, ...payload });
        
        // If the buffer gets critically heavy, flush instantly to save V8 Engine RAM
        if (this.batchBuffer.length >= this.MAX_BUFFER_SIZE) {
            this.flushToS3();
        }
    }

    async flushToS3() {
        if (this.batchBuffer.length === 0) return;

        // Isolate current batch and instantly reset buffer to accept new traffic safely
        const chunkToExport = [...this.batchBuffer];
        this.batchBuffer = [];

        const chunkId = `batch_${Date.now()}_${chunkToExport.length}evts`;
        console.log(`🧊 [Data Lake Sink] Compressing chunk ${chunkId} for cold-storage...`);

        try {
            // Compress to beautiful forensic JSON arrays
            const filePayload = JSON.stringify(chunkToExport);
            
            // Format: forensics/2026-04-17/batch_xyz.json
            const datePrefix = new Date().toISOString().split("T")[0];
            const fileKey = `forensics/${datePrefix}/${chunkId}.json`;

            await this.s3Client.send(new PutObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
                Body: filePayload,
                ContentType: "application/json"
            }));
            
            console.log(`✅ [Data Lake Sink] Chunk successfully vaulted to S3: ${fileKey}`);

        } catch (err) {
            console.error(`❌ [Data Lake Sink] Upload Failure on chunk ${chunkId}. Preserving in RAM.`);
            // Unshift failed events back to the top of the queue so they aren't lost permanently
            this.batchBuffer.unshift(...chunkToExport);
        }
    }
}

// Instantiate exactly once to manage cluster memory exclusively
module.exports = new DataLakeSink();
