// [VITAM-OS] Sentinel Update: 2026-03-24
const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const hodRoutes = require("./routes/hodRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const studentRoutes = require("./routes/studentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const financeRoutes = require("./routes/financeRoutes");
const chairmanRoutes = require("./routes/chairmanRoutes");
const directorRoutes = require("./routes/directorRoutes");
const importRoutes = require("./routes/importRoutes");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.set("io", io);

// Production Security Hardening
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: "Too many requests from this IP, please try again in 15 minutes."
});

app.use("/api/auth/login", apiLimiter);

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:5174",
            "https://vitam-portal.vercel.app",
            "https://vitam-ai.vercel.app",
            process.env.FRONTEND_URL
        ].filter(Boolean);
        
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));
app.use(express.json());

app.get("/api/health", async (req, res) => {
    try {
        const User = require("./models/User");
        const count = await User.countDocuments();
        res.status(200).json({
            status: "OK",
            users: count,
            db: mongoose.connection.readyState === 1 ? "Connected" : "Error",
            ts: new Date()
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get("/health", (req, res) => res.status(200).send("OK"));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chairman", chairmanRoutes);
app.use("/api/director", directorRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/timetable", require("./routes/timetableRoutes"));
app.use("/api/import", importRoutes); // New route

app.get("/", (req, res) => res.send("VITAM Command API is active."));

const PORT = process.env.PORT || 5100;
const MONGO_URI = process.env.MONGO_URI;

const startServices = async (dbType = "Atlas") => {
    // Seed only if DB is empty
    const User = require("./models/User");
    // Force re-seed for Phase 5 transition to ensure new roster is live
    console.log(`[DB] Forced seeding protocol active for Phase 5. Seeding ${dbType} database...`);
    const seedDatabase = require("./seed");
    await seedDatabase();

    // Initialize Cron Jobs & AI CEO
    require("./jobs/promotionJob")();
    require("./services/aiCEO").init(io);
    require("./jobs/aiJobs").startAIJobs(io);

    server.listen(PORT, () => {
        console.log(`✅ VITAM Server running on port ${PORT} [${dbType}]`);
        console.log(`   → Groq AI: llama-3.3-70b-versatile`);
        console.log(`   → Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME || "NOT SET"}`);
        console.log(`   → JWT: ${process.env.JWT_SECRET ? "Configured" : "MISSING ⚠️"}`);
    });
};

const connectInMemory = async () => {
    try {
        const { MongoMemoryServer } = require("mongodb-memory-server");
        const mongoServer = await MongoMemoryServer.create();
        const memoryUri = mongoServer.getUri();
        await mongoose.connect(memoryUri);
        console.log("✅ In-Memory MongoDB Connected:", memoryUri);
        process.env.MOCK_MODE = "false";
        await startServices("In-Memory");
    } catch (memErr) {
        console.error("❌ Failed to start in-memory database:", memErr.message);
        process.exit(1);
    }
};

if (!MONGO_URI) {
    console.warn("⚠️  MONGO_URI not set. Using in-memory MongoDB.");
    connectInMemory();
} else {
    mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000,   // fail fast if Atlas unreachable
        connectTimeoutMS: 15000,
        socketTimeoutMS: 30000,
    })
        .then(async () => {
            process.env.MOCK_MODE = "false";
            console.log("✅ MongoDB Atlas Connected:", MONGO_URI.split("@")[1]?.split("/")[0] || "Atlas");
            await startServices("Atlas");
        })
        .catch(async (err) => {
            console.warn("⚠️  MongoDB Atlas connection failed:", err.message);
            console.log("🔄 Falling back to In-Memory MongoDB for local development...");
            await connectInMemory();
        });
}

io.on("connection", (socket) => {
    console.log("📡 Subsystem Connected:", socket.id);
    socket.on("disconnect", () => console.log("📡 Subsystem Disconnected:", socket.id));
});
