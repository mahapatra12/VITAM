// [VITAM-OS] Sentinel Update: 2026-03-24
const express = require("express");
const mongoose = require("mongoose");
mongoose.set("bufferCommands", false);
mongoose.set("bufferTimeoutMS", 5000);
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const cluster = require("cluster");
const os = require("os");
require("dotenv").config({ path: require('path').resolve(__dirname, '.env') });

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
const tenantRoutes = require("./routes/tenantRoutes");
const billingRoutes = require("./routes/billingRoutes");
const metricsRoutes = require("./routes/metricsRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const auditRoutes = require("./routes/auditRoutes");
const billingUpgradeRoutes = require("./routes/billingUpgradeRoutes");
const pkg = require("./package.json");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const tenantMiddleware = require("./middleware/tenantMiddleware");
const usageMiddleware = require("./middleware/usageMiddleware");
const logger = require("./middleware/logger");
const planGuard = require("./middleware/planGuard");
const quotaGuard = require("./middleware/quotaGuard");
const auditMiddleware = require("./middleware/auditMiddleware");
const requestId = require("./middleware/requestId");
const maintenance = require("./middleware/maintenance");
const httpsOnly = require("./middleware/httpsOnly");
const startAuditExportJob = require("./jobs/auditExportJob");
const startMetricsExportJob = require("./jobs/metricsExportJob");
const { forwardLog } = require("./services/logForwarder");
const { isCloudinaryConfigured } = require("./utils/mediaConfig");
const { validateEnvironment } = require("./config/envValidation");
const {
    isGoogleOAuthConfigured,
    isGroqConfigured,
    isRazorpayConfigured,
    isStripeConfigured
} = require("./utils/providerReadiness");

const app = express();
app.set("trust proxy", 1); // honor X-Forwarded-* from vercel/render/proxies
app.disable("x-powered-by");
const FREE_MODE = process.env.FREE_MODE === "true";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const ALLOW_IN_MEMORY_FALLBACK = process.env.ALLOW_IN_MEMORY_FALLBACK === "true" || !IS_PRODUCTION;
let memoryServerInstance = null;
const isLeaderWorker = () => !cluster.isWorker || cluster.worker?.id === 1;
const startupState = {
    mode: "booting",
    db: "booting",
    server: "booting",
    shutdown: false,
    startedAt: null,
    degradedReasons: [],
    services: {
        defaultTenant: "pending",
        seed: "pending",
        auditExport: "pending",
        metricsExport: "pending",
        promotionJob: "pending",
        aiCEO: "pending",
        aiJobs: "pending"
    }
};
const REQUIRED_STARTUP_SERVICES = ["defaultTenant", "seed"];
const PUBLIC_HEALTH_PATHS = new Set(["/health", "/ready", "/api/health"]);
const HEALTH_CACHE_TTL_MS = Math.max(1000, Number(process.env.HEALTH_CACHE_TTL_MS || (IS_PRODUCTION ? 10000 : 4000)));
const healthResponseCache = {
    at: 0,
    payload: null,
    inflight: null
};
const FAST_LOCAL_DB_FALLBACK = !IS_PRODUCTION
    && ALLOW_IN_MEMORY_FALLBACK
    && String(process.env.DB_FAST_FALLBACK ?? "true").trim().toLowerCase() !== "false";
const DB_CONNECT_MAX_RETRIES = Math.max(0, Number(process.env.DB_CONNECT_MAX_RETRIES || (FAST_LOCAL_DB_FALLBACK ? 1 : 10)));
const DB_SERVER_SELECTION_TIMEOUT_MS = Math.max(1000, Number(process.env.DB_SERVER_SELECTION_TIMEOUT_MS || (FAST_LOCAL_DB_FALLBACK ? 2500 : 5000)));
const DB_CONNECT_TIMEOUT_MS = Math.max(2000, Number(process.env.DB_CONNECT_TIMEOUT_MS || (FAST_LOCAL_DB_FALLBACK ? 5000 : 10000)));
const DB_SOCKET_TIMEOUT_MS = Math.max(5000, Number(process.env.DB_SOCKET_TIMEOUT_MS || 30000));

const normalizeOrigin = (value) => String(value || "").trim().replace(/\/+$/, "");
const parseOriginList = (value) => String(value || "")
    .split(",")
    .map((entry) => normalizeOrigin(entry))
    .filter(Boolean);
const isLocalDevOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(String(origin || ""));
const parseBooleanEnv = (value, fallback = false) => {
    const raw = String(value ?? "").trim().toLowerCase();
    if (!raw) return fallback;
    return raw === "true";
};
const hasWebAuthnEnv = () => Boolean(String(process.env.ORIGIN || "").trim() && String(process.env.RP_ID || "").trim());
const isWebAuthnRuntimeReady = () => hasWebAuthnEnv() || IS_PRODUCTION;

const buildAllowedOrigins = () => {
    const configured = [
        ...parseOriginList(process.env.ORIGIN),
        ...parseOriginList(process.env.FRONTEND_URL),
        ...parseOriginList(process.env.FRONTEND_ORIGIN),
        ...(process.env.VERCEL_URL ? [`https://${process.env.VERCEL_URL}`] : []),
        ...parseOriginList(process.env.CORS_ORIGINS)
    ];

    const defaults = IS_PRODUCTION
        ? ["https://vitam-ai.vercel.app"]
        : [
            "https://vitam-ai.vercel.app",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:4173",
            "http://127.0.0.1:4173"
        ];

    return Array.from(new Set([...defaults, ...configured].map(normalizeOrigin).filter(Boolean)));
};

const allowedOrigins = buildAllowedOrigins();
const allowedOriginsSet = new Set(allowedOrigins);

const corsOptions = {
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true);
        }

        const normalizedOrigin = normalizeOrigin(origin);
        if (allowedOriginsSet.has(normalizedOrigin)) {
            return callback(null, true);
        }
        if (!IS_PRODUCTION && isLocalDevOrigin(normalizedOrigin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Cache-Control",
        "Pragma",
        "Expires",
        "cache-control",
        "pragma",
        "expires",
        "x-request-id",
        "x-idempotency-key",
        "x-api-key",
        "x-college-id",
        "x-college-domain",
        "x-tenant-id",
        "x-tenant-domain",
        "x-tenant-api-key",
        "x-free-mode",
        "x-free-mode-token",
        "x-silent-auth-check",
        "x-auth-mode",
        "X-Silent-Auth-Check",
        "X-Auth-Mode",
        "X-Request-Id",
        "X-Idempotency-Key",
        "X-Free-Mode-Token"
    ],
    exposedHeaders: ["x-request-id"],
    optionsSuccessStatus: 204,
    maxAge: 86400 // Butter Smooth: Cache preflight requests for 24 hours to eliminate OPTIONS latency
};

app.use(cors(corsOptions));

const createJsonRateLimiter = ({ windowMs, max, code, msg, keyGenerator, skip }) => rateLimit({
    windowMs,
    max,
    keyGenerator,
    skip,
    standardHeaders: true,
    legacyHeaders: false,
    validate: false,
    handler: (req, res, _next, options) => {
        const retryAfter = Math.ceil(options.windowMs / 1000);
        res.setHeader("Retry-After", String(retryAfter));
        res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
        res.status(options.statusCode).json({
            code,
            msg,
            retryAfter,
            requestId: req.id
        });
    }
});

const shouldSkipRequestSanitization = (req) => {
    const path = req?.path || req?.originalUrl || "";
    return ["OPTIONS", "HEAD"].includes(req?.method) || PUBLIC_HEALTH_PATHS.has(path);
};

const sanitizeRequestPayload = (target, options) => {
    if (!target || typeof target !== "object") {
        return false;
    }

    const shouldSanitize = mongoSanitize.has(target, options.allowDots);
    if (!shouldSanitize) {
        return false;
    }

    mongoSanitize.sanitize(target, options);
    return true;
};

const createSafeMongoSanitizer = (options = {}) => {
    const onSanitize = typeof options.onSanitize === "function" ? options.onSanitize : null;

    return (req, _res, next) => {
        if (shouldSkipRequestSanitization(req)) {
            return next();
        }

        ["body", "params", "query"].forEach((key) => {
            if (sanitizeRequestPayload(req[key], options)) {
                onSanitize?.({ req, key });
            }
        });

        next();
    };
};

const markDegraded = (reason) => {
    if (reason && !startupState.degradedReasons.includes(reason)) {
        startupState.degradedReasons.push(reason);
    }
};

const markServiceState = (name, state, detail) => {
    startupState.services[name] = state;
    if ((state === "degraded" || state === "failed") && detail) {
        markDegraded(`${name}: ${detail}`);
    }
};

let envValidationCompleted = false;
const assertEnvironmentReadiness = () => {
    if (envValidationCompleted) {
        return;
    }

    const { errors, warnings } = validateEnvironment();
    warnings.forEach((warning) => {
        console.warn(warning);
        markDegraded(warning);
    });

    if (errors.length > 0) {
        errors.forEach((error) => {
            console.error(error);
            markDegraded(error);
        });

        const failure = new Error("Startup blocked: invalid environment configuration.");
        failure.code = "INVALID_ENV_CONFIGURATION";
        throw failure;
    }

    envValidationCompleted = true;
};

const buildExtendedHealthData = async () => {
    const snapshot = getHealthSnapshot();
    const { aiCircuit } = require("./utils/circuitBreaker");

    let count = null;
    if (snapshot.db === "ready" || snapshot.db === "connected") {
        try {
            const User = require("./models/User");
            count = await User.countDocuments().maxTimeMS(2000);
        } catch (_error) {
            count = null;
        }
    }

    const load = os.loadavg()[0];
    const memory = process.memoryUsage();
    const heapRatio = memory.heapTotal > 0 ? (memory.heapUsed / memory.heapTotal) : 0;
    const entropyScore = Math.round((load * 10) + (heapRatio * 40));

    return {
        ...snapshot,
        server: startupState.server,
        ai: aiCircuit.state === "CLOSED" ? "ready" : "degraded",
        users: count,
        entropy: Math.min(entropyScore, 100),
        status: ((snapshot.db === "ready" || snapshot.db === "connected") && aiCircuit.state === "CLOSED" && entropyScore < 90) ? "healthy" : "degraded",
        ts: new Date().toISOString()
    };
};

const getCachedHealthData = async () => {
    const now = Date.now();
    if (healthResponseCache.payload && (now - healthResponseCache.at) < HEALTH_CACHE_TTL_MS) {
        return healthResponseCache.payload;
    }

    if (healthResponseCache.inflight) {
        return healthResponseCache.inflight;
    }

    healthResponseCache.inflight = buildExtendedHealthData()
        .then((payload) => {
            healthResponseCache.payload = payload;
            healthResponseCache.at = Date.now();
            healthResponseCache.inflight = null;
            return payload;
        })
        .catch((error) => {
            healthResponseCache.inflight = null;
            throw error;
        });

    return healthResponseCache.inflight;
};

const getHealthSnapshot = () => {
    const dbReady = mongoose.connection.readyState === 1;
    const jwtReady = Boolean(process.env.JWT_SECRET);
    const maintenanceMode = process.env.MAINTENANCE_MODE === "true";
    const mediaUploadReady = isCloudinaryConfigured();
    const aiReady = isGroqConfigured();
    const stripeReady = isStripeConfigured();
    const razorpayReady = isRazorpayConfigured();
    const googleOAuthReady = isGoogleOAuthConfigured();
    const serviceEntries = Object.entries(startupState.services);
    const failedServices = serviceEntries
        .filter(([, state]) => state === "failed")
        .map(([name]) => name);
    const pendingServices = serviceEntries
        .filter(([, state]) => state === "pending")
        .map(([name]) => name);
    const requiredServicesReady = REQUIRED_STARTUP_SERVICES.every((name) => startupState.services[name] === "ready");
    const serverReady = server.listening && startupState.server === "listening";
    const ready = dbReady && jwtReady && serverReady && requiredServicesReady && !maintenanceMode && !startupState.shutdown;
    const starting = !startupState.shutdown && (!serverReady || !requiredServicesReady || startupState.db === "connecting" || pendingServices.length > 0);
    const status = startupState.shutdown
        ? "shutting_down"
        : starting
            ? "starting"
            : ready && startupState.degradedReasons.length === 0
                ? "ready"
                : "degraded";

    return {
        status,
        ready,
        version: pkg.version,
        environment: process.env.NODE_ENV || "development",
        pid: process.pid,
        workerId: cluster.isWorker ? cluster.worker?.id || null : null,
        leaderWorker: isLeaderWorker(),
        uptimeSec: Math.round(process.uptime()),
        mode: startupState.mode,
        db: dbReady ? startupState.db || "connected" : "disconnected",
        server: startupState.server,
        serverReady,
        requiredServicesReady,
        failedServices,
        pendingServices,
        freeMode: FREE_MODE,
        maintenanceMode,
        jwtReady,
        webAuthnReady: isWebAuthnRuntimeReady(),
        mediaUploadReady,
        aiReady,
        stripeReady,
        razorpayReady,
        googleOAuthReady,
        shutdown: startupState.shutdown,
        startedAt: startupState.startedAt,
        degradedReasons: [...startupState.degradedReasons],
        services: {
            ...startupState.services,
            mediaUpload: mediaUploadReady ? "ready" : "unavailable",
            aiProvider: aiReady ? "ready" : "fallback",
            stripe: stripeReady ? "ready" : "unavailable",
            razorpay: razorpayReady ? "ready" : "unavailable",
            googleOAuth: googleOAuthReady ? "ready" : "unavailable"
        }
    };
};

const server = http.createServer(app);
server.requestTimeout = Number(process.env.SERVER_REQUEST_TIMEOUT_MS || 30000);
server.headersTimeout = Number(process.env.SERVER_HEADERS_TIMEOUT_MS || 35000);
server.keepAliveTimeout = Number(process.env.SERVER_KEEPALIVE_TIMEOUT_MS || 65000);
server.maxRequestsPerSocket = Number(process.env.SERVER_MAX_REQUESTS_PER_SOCKET || 1000);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins.length > 0 ? allowedOrigins : true,
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.set("io", io);

mongoose.connection.on("connected", () => {
    startupState.db = "connected";
});

mongoose.connection.on("disconnected", () => {
    startupState.db = "disconnected";
    console.warn("[DB] MongoDB disconnected");
});

mongoose.connection.on("error", (error) => {
    startupState.db = "error";
    console.error("[DB] MongoDB error:", error.message);
});

server.on("error", (error) => {
    startupState.server = "error";
    console.error("[Server] HTTP server error:", error.message);
});

server.on("timeout", (socket) => {
    try {
        socket.destroy();
    } catch (_) {
        // ignore best-effort socket cleanup
    }
});

server.on("clientError", (error, socket) => {
    const benignCodes = new Set(["ECONNRESET", "EPIPE", "ECONNABORTED"]);
    if (!benignCodes.has(error?.code)) {
        console.warn("[Server] Client connection error:", error.message);
    }
    try {
        socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
    } catch (_) {
        socket.destroy();
    }
});

app.use(helmet({
    crossOriginResourcePolicy: false
}));
app.use(compression());
app.use(httpsOnly);
app.use(requestId);

const shouldSkipRateLimit = (req) => process.env.RATE_LIMIT_DISABLED === "true" || PUBLIC_HEALTH_PATHS.has(req.path) || PUBLIC_HEALTH_PATHS.has(req.originalUrl);
const loginLimiter = createJsonRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.LOGIN_RATE_LIMIT_MAX || 30),
    code: "LOGIN_RATE_LIMITED",
    msg: "Too many login attempts from this client. Please retry shortly.",
    skip: shouldSkipRateLimit
});
const mfaLimiter = createJsonRateLimiter({
    windowMs: 60 * 1000,
    max: Number(process.env.MFA_RATE_LIMIT_MAX || 30),
    code: "AUTH_RATE_LIMITED",
    msg: "Too many authentication attempts. Please slow down.",
    skip: shouldSkipRateLimit
});
const webhookLimiter = createJsonRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: Number(process.env.WEBHOOK_RATE_LIMIT_MAX || 300),
    code: "WEBHOOK_RATE_LIMITED",
    msg: "Webhook traffic exceeded the allowed rate.",
    skip: shouldSkipRateLimit
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/verify-2fa", mfaLimiter);
app.use("/api/auth/register-options", mfaLimiter);
app.use("/api/auth/verify-registration", mfaLimiter);
app.use("/api/auth/auth-options", mfaLimiter);
app.use("/api/auth/verify-auth", mfaLimiter);
app.use("/api/auth/login/google", mfaLimiter);
app.use("/api/auth/face/challenge", mfaLimiter);
app.use("/api/auth/face/enroll", mfaLimiter);
app.use("/api/auth/face/verify", mfaLimiter);
app.use("/api/webhooks", webhookLimiter);

app.use(logger);
app.use(maintenance);
app.use((req, res, next) => {
    if (!startupState.shutdown) {
        return next();
    }

    res.setHeader("Retry-After", "5");
    res.setHeader("Connection", "close");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    return res.status(503).json({
        code: "SERVER_DRAINING",
        msg: "Service is restarting. Please retry shortly.",
        requestId: req.id
    });
});
app.use((req, res, next) => {
    req.startedAt = Date.now();
    res.setTimeout(server.requestTimeout, () => {
        if (res.headersSent) {
            return;
        }
        res.status(503).json({
            code: "REQUEST_TIMEOUT",
            msg: "Request timed out. Please retry.",
            requestId: req.id
        });
    });
    next();
});
// Capture raw body for webhook signature validation + set sane body limit
app.use(express.json({
    limit: "1mb",
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(createSafeMongoSanitizer({ allowDots: true, replaceWith: "_" })); // Butter Smooth Security
app.set("etag", "strong"); // Butter Smooth Caching
app.set("strict routing", true);
// Centralized Idempotency for mutations
app.use("/api", require("./middleware/idempotency"));

// Common response headers
app.use((req, res, next) => {
    if (req.id) res.setHeader("x-request-id", req.id);
    next();
});
// Multi-tenant resolver (non-blocking)
app.use("/api", tenantMiddleware);
// Tenant-aware general rate limiter (after tenant resolution, before DB-heavy middleware)
const tenantLimiter = createJsonRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.TENANT_RATE_LIMIT_MAX || 2000),
  keyGenerator: (req) => (req.tenant?.id ? `tenant:${req.tenant.id}` : req.ip),
  code: "TENANT_RATE_LIMITED",
  msg: "Tenant request quota exceeded. Please retry shortly.",
  skip: shouldSkipRateLimit
});
app.use("/api", tenantLimiter);
// Usage tracking per tenant (best-effort, non-blocking)
app.use("/api", usageMiddleware);
// Audit logging for mutating requests
app.use("/api", auditMiddleware);
// Example: enforce Pro/Enterprise for AI routes
app.use("/api/ai", planGuard(["pro","enterprise"]));
// Example: enforce monthly quota on AI routes (requests metric)
app.use("/api/ai", quotaGuard({ metric: "requests" }));
// Feature flag gate for AI routes (requires flag "ai_access")
app.use("/api/ai", require("./middleware/featureFlagGuard")("ai_access"));

app.get("/api/health", async (req, res) => {
    try {
        const healthData = await getCachedHealthData();
        res.setHeader("Cache-Control", "no-store, max-age=0");
        res.status(healthData.status === "healthy" ? 200 : 503).json(healthData);
    } catch (err) {
        const snapshot = getHealthSnapshot();
        res.setHeader("Cache-Control", "no-store, max-age=0");
        res.status(503).json({
            ...snapshot,
            status: "degraded",
            entropy: 100,
            error: err.message,
            ts: new Date().toISOString()
        });
    }
});

app.get("/health", (req, res) => {
    const snapshot = getHealthSnapshot();
    res.status(snapshot.ready ? 200 : 503).send(snapshot.status.toUpperCase());
});

app.get("/ready", (req, res) => {
    const snapshot = getHealthSnapshot();
    res.status(snapshot.ready ? 200 : 503).json(snapshot);
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/fleet", require("./routes/fleetRoutes"));
app.use("/api/hostel", require("./routes/hostelRoutes"));
app.use("/api/placement", require("./routes/placementRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/scholarships", require("./routes/scholarshipRoutes"));
app.use("/api/chairman", chairmanRoutes);
app.use("/api/director", directorRoutes);
app.use("/api/hod", hodRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/timetable", require("./routes/timetableRoutes"));
app.use("/api/import", importRoutes); // New route
app.use("/api/billing", billingRoutes);
app.use("/api/billing-upgrade", billingUpgradeRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/ai", aiRoutes); // keep AI routes after guards set above
app.use("/api/tenant", tenantRoutes);

// Centralized error handler with request-id context
app.use((err, req, res, next) => {
    const isJsonParseError = err?.type === "entity.parse.failed" || err instanceof SyntaxError;
    const isPayloadTooLarge = err?.type === "entity.too.large";
    const isCorsError = err?.message === "Not allowed by CORS";
    const status = isJsonParseError
        ? 400
        : isPayloadTooLarge
            ? 413
            : isCorsError
                ? 403
                : err.status || err.statusCode || 500;
    const payload = isJsonParseError
        ? { code: "INVALID_JSON", msg: "Invalid request body", requestId: req.id }
        : isPayloadTooLarge
            ? { code: "PAYLOAD_TOO_LARGE", msg: "Request payload too large", requestId: req.id }
            : isCorsError
                ? { code: "CORS_BLOCKED", msg: "Origin not allowed", requestId: req.id }
                : { msg: "Something went wrong", requestId: req.id };

    console.error("[Error]", {
        id: req.id,
        tenant: req.tenant?.id,
        user: req.user?._id,
        path: req.originalUrl,
        message: err.message,
        type: err.type,
        status,
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    });
    forwardLog({
        type: "error",
        id: req.id,
        tenant: req.tenant?.id,
        user: req.user?._id,
        path: req.originalUrl,
        message: err.message,
        status
    });
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.status(status).json(payload);
});

app.get("/", (req, res) => res.send("VITAM Command API is active."));

const PORT = process.env.PORT || 5101;
const MONGO_URI = String(process.env.MONGO_URI || "").trim();
const MONGO_DIRECT_URI = String(process.env.MONGO_DIRECT_URI || "").trim();
const preferDirectMongo = process.env.MONGO_PREFER_DIRECT === "true";
const PRIMARY_MONGO_URI = preferDirectMongo && MONGO_DIRECT_URI
    ? MONGO_DIRECT_URI
    : (MONGO_URI || MONGO_DIRECT_URI);

const isSrvResolverFailure = (error) =>
    /querySrv|ECONNREFUSED|ENOTFOUND|ESERVFAIL/i.test(String(error?.message || ""));

const isMemoryFallbackCandidate = (error) =>
    /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET|querySrv|Server selection timed out|Could not connect to any servers|isn't whitelisted|ReplicaSetNoPrimary/i.test(String(error?.message || ""));

const listenOnPort = async (dbType) => {
    if (server.listening) {
        return;
    }

    await new Promise((resolve, reject) => {
        const handleListening = () => {
            server.off("error", handleListenError);
            startupState.server = "listening";
            startupState.startedAt = new Date().toISOString();
            console.log(`[Worker ${process.pid}] VITAM Server running on port ${PORT} [${dbType}]`);
            if (FREE_MODE) console.log("   -> FREE_MODE enabled: plan/quota guards bypassed (demo mode)");
            resolve();
        };

        const handleListenError = (error) => {
            server.off("listening", handleListening);
            reject(error);
        };

        server.once("listening", handleListening);
        server.once("error", handleListenError);

        try {
            server.listen(PORT);
        } catch (error) {
            server.off("listening", handleListening);
            server.off("error", handleListenError);
            reject(error);
        }
    });
};

const startServices = async (dbType = "Atlas") => {
    const User = require("./models/User");
    const College = require("./models/College");
    startupState.mode = dbType;
    startupState.db = "connected";

    const runStartupTask = async (name, task, options = {}) => {
        try {
            await task();
            markServiceState(name, "ready");
        } catch (error) {
            const state = options.required ? "failed" : "degraded";
            markServiceState(name, state, error.message);
            const prefix = options.required ? "[Startup] Required service failed" : "[Startup] Optional service degraded";
            console[options.required ? "error" : "warn"](`${prefix}: ${name} -> ${error.message}`);
            if (options.required) {
                throw error;
            }
        }
    };

    // Ensure default tenant exists before seeding so users get linked
    await runStartupTask("defaultTenant", async () => {
        const defaultDomain = process.env.FRONTEND_URL?.replace(/^https?:\/\//, "") || "vitam-ai.vercel.app";
        const setOnInsert = {
            name: "VITAM Default",
            domain: defaultDomain,
            plan: "pro"
        };
        if (process.env.DEFAULT_TENANT_API_KEY) {
            setOnInsert.apiKey = process.env.DEFAULT_TENANT_API_KEY;
        }

        const result = await College.updateOne(
            { domain: defaultDomain },
            { $setOnInsert: setOnInsert },
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            console.log("[Tenant] Default college created.");
        }
    }, { required: true });

    await runStartupTask("seed", async () => {
        const existing = await User.countDocuments();
        if (existing > 0) {
            return;
        }

        const seedOnEmpty = parseBooleanEnv(process.env.SEED_ON_EMPTY, !IS_PRODUCTION);
        const allowProdSeed = parseBooleanEnv(process.env.ALLOW_PROD_SEED, false);

        if (IS_PRODUCTION && seedOnEmpty && !allowProdSeed) {
            throw new Error("SEED_ON_EMPTY=true in production requires ALLOW_PROD_SEED=true");
        }

        if (seedOnEmpty) {
            console.log(`[DB] No users found. Seeding ${dbType} database...`);
            const seedDatabase = require("./seed");
            try {
                await seedDatabase();
            } catch (error) {
                const duplicateSeedRace = error?.code === 11000 || /E11000/i.test(String(error?.message || ""));
                if (duplicateSeedRace) {
                    const postRaceUsers = await User.countDocuments();
                    if (postRaceUsers > 0) {
                        console.warn("[DB] Seed race detected across workers. Existing data found; continuing startup.");
                        return;
                    }
                }
                throw error;
            }
            return;
        }

        const bootstrapEmail = String(process.env.BOOTSTRAP_ADMIN_EMAIL || "").trim().toLowerCase();
        const bootstrapPassword = String(process.env.BOOTSTRAP_ADMIN_PASSWORD || "").trim();
        const bootstrapName = String(process.env.BOOTSTRAP_ADMIN_NAME || "System Admin").trim() || "System Admin";

        if (!bootstrapEmail || !bootstrapPassword) {
            throw new Error("Database is empty. Provide BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD or enable SEED_ON_EMPTY.");
        }
        if (bootstrapPassword.length < 12) {
            throw new Error("BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.");
        }

        const defaultDomain = process.env.FRONTEND_URL?.replace(/^https?:\/\//, "") || "vitam-ai.vercel.app";
        const defaultTenant = await College.findOne({ domain: defaultDomain }).select("_id");
        if (!defaultTenant?._id) {
            throw new Error(`Default tenant (${defaultDomain}) not found for bootstrap admin creation.`);
        }

        const bcrypt = require("bcryptjs");
        const passwordHash = await bcrypt.hash(bootstrapPassword, 10);
        try {
            await User.create({
                name: bootstrapName,
                email: bootstrapEmail,
                password: passwordHash,
                role: "admin",
                subRole: "none",
                collegeId: defaultTenant._id,
                isTwoFactorEnabled: true,
                isFirstLogin: true
            });
            console.log("[DB] Bootstrap admin created for empty database.");
        } catch (error) {
            const duplicateSeedRace = error?.code === 11000 || /E11000/i.test(String(error?.message || ""));
            if (duplicateSeedRace) {
                const postRaceUsers = await User.countDocuments();
                if (postRaceUsers > 0) {
                    console.warn("[DB] Bootstrap race detected across workers. Existing admin found; continuing startup.");
                    return;
                }
            }
            throw error;
        }
    }, { required: true });

    // Only master process (or first worker) usually handles cron jobs to avoid duplicates
    // But in this cluster, we check if we are worker 1 or use a locking mechanism.
    // Simplifying: workers handles AI and Exports, but in production ideally these are separate.
    if (isLeaderWorker()) {
        await runStartupTask("auditExport", async () => { await startAuditExportJob(io); });
        await runStartupTask("metricsExport", async () => { await startMetricsExportJob(io); });
        await runStartupTask("promotionJob", async () => { require("./jobs/promotionJob")(); });
        await runStartupTask("aiCEO", async () => { await require("./services/aiCEO").init(io); });
        await runStartupTask("aiJobs", async () => { await require("./jobs/aiJobs").startAIJobs(io); });

    } else {
        ["auditExport", "metricsExport", "promotionJob", "aiCEO", "aiJobs"].forEach((service) => {
            markServiceState(service, "ready");
        });
        console.log(`[Startup] Worker ${process.pid} running API mode. Background jobs delegated to leader worker.`);
    }

    await listenOnPort(dbType);
    console.log(`[Worker ${process.pid}] VITAM Server Active [${dbType}]`);
};

const connectInMemory = async () => {
    if (!ALLOW_IN_MEMORY_FALLBACK) {
        console.error("[Startup] In-memory fallback disabled in production.");
        process.exit(1);
    }

    try {
        const { MongoMemoryServer } = require("mongodb-memory-server");
        const mongoServer = await MongoMemoryServer.create();
        memoryServerInstance = mongoServer;
        const memoryUri = mongoServer.getUri();
        startupState.mode = "In-Memory";
        startupState.db = "connecting";
        markDegraded("using in-memory database fallback");
        await mongoose.connect(memoryUri);
        console.log("[Worker] In-Memory MongoDB Connected");
        process.env.MOCK_MODE = "false";
        await startServices("In-Memory");
    } catch (memErr) {
        console.error("❌ Failed to start in-memory database:", memErr.message);
        process.exit(1);
    }
};

let hasStartedServer = false;
const startServer = async () => {
    if (hasStartedServer) return;
    assertEnvironmentReadiness();
    hasStartedServer = true;

    if (!PRIMARY_MONGO_URI) {
        if (!ALLOW_IN_MEMORY_FALLBACK) {
            console.error("[Startup] MONGO_URI or MONGO_DIRECT_URI required in production.");
            process.exit(1);
        }
        return connectInMemory();
    }

    startupState.mode = "Atlas";
    startupState.db = "connecting";

    const maxRetries = DB_CONNECT_MAX_RETRIES;
    const baseDelay = 1000;
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    for (let attempt = 0; attempt <= DB_CONNECT_MAX_RETRIES; attempt += 1) {
        try {
            if (mongoose.connection.readyState !== 0) {
                await mongoose.connection.close(false);
            }
            await mongoose.connect(PRIMARY_MONGO_URI, {
                serverSelectionTimeoutMS: DB_SERVER_SELECTION_TIMEOUT_MS,
                connectTimeoutMS: DB_CONNECT_TIMEOUT_MS,
                socketTimeoutMS: DB_SOCKET_TIMEOUT_MS,
                maxPoolSize: Number(process.env.DB_POOL_MAX || 150),
                minPoolSize: Number(process.env.DB_POOL_MIN || 15),
                maxIdleTimeMS: 120000,
                autoIndex: !IS_PRODUCTION, // Prevent blocking index building live
                family: 4, // Force IPv4 to avoid DNS latency
            });
            process.env.MOCK_MODE = "false";
            console.log(`✅ [Worker ${process.pid}] MongoDB Atlas Connected`);
            await startServices("Atlas");
            return;
        } catch (err) {
            const shouldTryDirectFallback =
                PRIMARY_MONGO_URI === MONGO_URI &&
                MONGO_URI.startsWith("mongodb+srv://") &&
                Boolean(MONGO_DIRECT_URI) &&
                isSrvResolverFailure(err);

            if (shouldTryDirectFallback) {
                try {
                    if (mongoose.connection.readyState === 1) {
                        await mongoose.connection.close(false);
                    }
                    await mongoose.connect(MONGO_DIRECT_URI, {
                        serverSelectionTimeoutMS: DB_SERVER_SELECTION_TIMEOUT_MS,
                        connectTimeoutMS: DB_CONNECT_TIMEOUT_MS,
                        socketTimeoutMS: DB_SOCKET_TIMEOUT_MS,
                        maxPoolSize: Number(process.env.DB_POOL_MAX || 150),
                        minPoolSize: Number(process.env.DB_POOL_MIN || 15),
                        autoIndex: !IS_PRODUCTION,
                        family: 4
                    });
                    process.env.MOCK_MODE = "false";
                    console.warn(`[Startup] SRV DNS failed (${err.message}). Connected via MONGO_DIRECT_URI fallback.`);
                    await startServices("Atlas");
                    return;
                } catch (directErr) {
                    err = directErr;
                }
            }

            const isFastLocalFallback = ALLOW_IN_MEMORY_FALLBACK && FAST_LOCAL_DB_FALLBACK && isMemoryFallbackCandidate(err);
            
            if (isFastLocalFallback) {
                console.warn(`⚡ [Circuit Breaker] Hard Network Failure (${err.message}). Bypassing retries. Instantly engaging In-Memory replica...`);
                return connectInMemory();
            }

            const retryAttempt = attempt + 1;
            if (attempt >= DB_CONNECT_MAX_RETRIES) {
                console.error(`❌ [Worker ${process.pid}] Max DB retries reached. Falling back/exiting.`);
                if (ALLOW_IN_MEMORY_FALLBACK) {
                    await connectInMemory();
                    return;
                }
                process.exit(1);
            }
            const delay = Math.min(baseDelay * Math.pow(2, retryAttempt), 30000);
            const retries = retryAttempt;
            console.warn(`⚠️ [Worker ${process.pid}] DB connection failed (${err.message}). Retrying in ${delay}ms... (Attempt ${retries}/${maxRetries})`);
            await sleep(delay);
        }
    }
};

// --- CLUSTER ORCHESTRATION ---
if (require.main === module) {
    const USE_CLUSTER = process.env.NODE_ENV === "production" && process.env.CLUSTER_DISABLED !== "true";
    
    if (USE_CLUSTER && cluster.isPrimary) {
        const numCPUs = os.cpus().length;
        const workersCount = Math.min(numCPUs, 4); // Cap to 4 for mid-size VPS stability
        console.log(`[Master ${process.pid}] Sovereign Singularity Cluster Booting: Spawning ${workersCount} workers...`);

        for (let i = 0; i < workersCount; i++) {
            cluster.fork();
        }

        cluster.on("exit", (worker, code, signal) => {
            if (code !== 0 && !worker.exitedAfterDisconnect) {
                console.warn(`[Master] Worker ${worker.process.pid} died (${signal || code}). Respawning Subsystem...`);
                cluster.fork();
            }
        });

        // Master memory watchdog
        setInterval(() => {
            const mem = process.memoryUsage();
            if (mem.rss > 1024 * 1024 * 1024) { // 1GB limit for Master
                console.error("[Master] Critical Memory Pressure Detected. Initiating Emergency OS Drain...");
                // In a real scenario, we might trigger a graceful rolling restart of workers
            }
        }, 30000).unref();

    } else {
        // Worker Process or Local Mode
        Promise.resolve(startServer()).catch((error) => {
            console.error("[Startup] Fatal Subsystem failure:", error.message);
            process.exit(1);
        });

        // Worker Memory Watchdog (Graceful self-destruct if leaking)
        setInterval(() => {
            const mem = process.memoryUsage();
            if (mem.rss > 512 * 1024 * 1024) { // 512MB per worker limit
                console.warn(`[Worker ${process.pid}] High Memory Usage (${Math.round(mem.rss / 1024 / 1024)}MB). Draining Subsystem...`);
                shutdown("MEMORY_PRESSURE")();
            }
        }, 60000).unref();
    }
}

// Replace generic unauthenticated sockets with the Advanced Encrypted Mesh
const socketManager = require("./services/socketManager");
socketManager.init(io);

// Graceful shutdown
const shutdown = (signal) => () => {
    if (startupState.shutdown) return;
    startupState.shutdown = true;
    startupState.server = "shutting_down";
    console.log(`[Worker ${process.pid}] ${signal} received. Draining connections...`);
    
    // Drain Socket.IO
    if (io) {
        io.close();
    }

    server.close(async () => {
        console.log(`[Worker ${process.pid}] HTTP server closed`);
        try {
            await mongoose.connection.close(false);
            if (memoryServerInstance) await memoryServerInstance.stop();
            console.log(`[Worker ${process.pid}] DB connection closed. Singularity offline.`);
            process.exit(0);
        } catch (error) {
            console.error("[Shutdown] Failed to close cleanly:", error.message);
            process.exit(1);
        }
    });
    setTimeout(() => process.exit(1), 10000).unref();
};

["SIGTERM", "SIGINT"].forEach(sig => process.on(sig, shutdown(sig)));

// Crash safeguards
process.on("unhandledRejection", (reason, promise) => {
    logger.error({ err: reason, promise }, "Unhandled Promise Rejection");
});

// Boot the Autonomous Data Lake Sink explicitly to begin catching Bus signals
require("./services/dataLakeSink");

process.env.MOCK_MODE = process.env.MOCK_MODE || "false";

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    markDegraded(`uncaught exception: ${err?.message || "unknown error"}`);
    shutdown("UNCAUGHT_EXCEPTION")();
});

module.exports = {
    app,
    getHealthSnapshot,
    io,
    server,
    startServer
};
