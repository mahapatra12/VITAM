const isTrue = (value) => String(value || "").trim().toLowerCase() === "true";

const hasValue = (value) => typeof value === "string"
    ? Boolean(value.trim())
    : value !== undefined && value !== null;

const normalizeOrigin = (value) => {
    const raw = String(value || "").trim();
    if (!raw) {
        return null;
    }

    try {
        const parsed = new URL(raw);
        if (!["http:", "https:"].includes(parsed.protocol)) {
            return null;
        }
        return `${parsed.protocol}//${parsed.host}`.toLowerCase();
    } catch (_) {
        return null;
    }
};

const extractOriginHostname = (origin) => {
    if (!origin) {
        return null;
    }

    try {
        return new URL(origin).hostname.toLowerCase();
    } catch (_) {
        return null;
    }
};

const normalizeRpId = (value) => String(value || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .replace(/:\d+$/, "")
    .toLowerCase();

const splitEnvList = (value) => String(value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const normalizeOriginList = (value) => splitEnvList(value)
    .map((entry) => normalizeOrigin(entry))
    .filter(Boolean);

const normalizeRpIdList = (value) => splitEnvList(value)
    .map((entry) => normalizeRpId(entry))
    .filter(Boolean);

const validateEnvironment = () => {
    const errors = [];
    const warnings = [];
    const isProduction = process.env.NODE_ENV === "production";

    const required = ["JWT_SECRET"];
    if (isProduction) {
        required.push("ORIGIN", "RP_ID");
    }

    required.forEach((name) => {
        if (!hasValue(process.env[name])) {
            errors.push(`[Config] Missing required environment variable: ${name}`);
        }
    });

    const mongoUri = String(process.env.MONGO_URI || "").trim();
    const mongoDirectUri = String(process.env.MONGO_DIRECT_URI || "").trim();
    if (isProduction && !mongoUri && !mongoDirectUri) {
        errors.push("[Config] Missing database connection string. Set MONGO_URI or MONGO_DIRECT_URI.");
    }

    const rawOrigins = splitEnvList(process.env.ORIGIN);
    const origins = normalizeOriginList(process.env.ORIGIN);
    if (rawOrigins.length > origins.length) {
        errors.push("[Config] ORIGIN contains one or more invalid entries. Use comma-separated full URLs (for example: https://vitam-ai.vercel.app,http://localhost:5173)");
    }
    if (isProduction && origins.some((origin) => !origin.startsWith("https://"))) {
        errors.push("[Config] ORIGIN must use HTTPS in production");
    }
    if (isProduction) {
        const localOrigin = origins.find((origin) => {
            const host = extractOriginHostname(origin);
            return host === "localhost" || host === "127.0.0.1";
        });
        if (localOrigin) {
            errors.push("[Config] ORIGIN cannot target localhost in production");
        }
    }

    const rawRpIds = splitEnvList(process.env.RP_ID);
    const rpIds = normalizeRpIdList(process.env.RP_ID);
    if (rawRpIds.length > rpIds.length) {
        errors.push("[Config] RP_ID contains one or more invalid entries. Use comma-separated host values (for example: vitam-ai.vercel.app,localhost)");
    }
    if (isProduction && rpIds.some((rpId) => rpId === "localhost" || rpId === "127.0.0.1")) {
        errors.push("[Config] RP_ID cannot be localhost in production");
    }

    if (origins.length > 0 && rpIds.length > 0) {
        for (const origin of origins) {
            const originHost = extractOriginHostname(origin);
            if (!originHost) {
                continue;
            }

            const hostMatchesRp = rpIds.some((rpId) => originHost === rpId || originHost.endsWith(`.${rpId}`));
            if (!hostMatchesRp) {
                const message = `[Config] ORIGIN host (${originHost}) does not match any RP_ID (${rpIds.join(", ")})`;
                if (isProduction) {
                    errors.push(message);
                } else {
                    warnings.push(message);
                }
            }
        }
    }

    if (isProduction && isTrue(process.env.FREE_MODE)) {
        warnings.push("[Config] FREE_MODE is enabled in production. Disable it for strict tenant plan enforcement.");
    }

    if (isProduction && isTrue(process.env.ALLOW_FREE_MODE_HEADER) && !hasValue(process.env.FREE_MODE_HEADER_TOKEN)) {
        warnings.push("[Config] ALLOW_FREE_MODE_HEADER is enabled without FREE_MODE_HEADER_TOKEN. Add a token to avoid accidental bypass.");
    }

    if (isProduction && isTrue(process.env.ALLOW_IN_MEMORY_FALLBACK)) {
        errors.push("[Config] ALLOW_IN_MEMORY_FALLBACK must be disabled in production to protect persistent data integrity.");
    }

    const seedOnEmpty = hasValue(process.env.SEED_ON_EMPTY)
        ? isTrue(process.env.SEED_ON_EMPTY)
        : !isProduction;
    const allowProdSeed = isTrue(process.env.ALLOW_PROD_SEED);
    const bootstrapEmail = String(process.env.BOOTSTRAP_ADMIN_EMAIL || "").trim();
    const bootstrapPassword = String(process.env.BOOTSTRAP_ADMIN_PASSWORD || "").trim();

    if (isProduction && seedOnEmpty && !allowProdSeed) {
        errors.push("[Config] Production seeding is disabled by default. Set ALLOW_PROD_SEED=true only for controlled first-time bootstrap.");
    }

    if (isProduction && allowProdSeed) {
        warnings.push("[Config] ALLOW_PROD_SEED=true will create demo seed users when DB is empty. Disable it after initial setup.");
    }

    if (bootstrapPassword && bootstrapPassword.length < 12) {
        errors.push("[Config] BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.");
    }

    if (isProduction && !seedOnEmpty && (!bootstrapEmail || !bootstrapPassword)) {
        warnings.push("[Config] Empty production DB will fail startup unless BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD are provided.");
    }

    if (hasValue(process.env.FACE_AUTH_THRESHOLD)) {
        const threshold = Number.parseFloat(String(process.env.FACE_AUTH_THRESHOLD).trim());
        if (!Number.isFinite(threshold) || threshold < 0.6 || threshold > 0.99) {
            errors.push("[Config] FACE_AUTH_THRESHOLD must be a number between 0.60 and 0.99");
        }
    }

    return { errors, warnings };
};

module.exports = {
    validateEnvironment
};
