const IMAGE_EXTENSIONS = new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".svg",
    ".avif",
    ".heic",
    ".heif"
]);

const isLocalHostname = (hostname) => hostname === "localhost" || hostname === "127.0.0.1";

const createMediaError = (status, code, msg, detail) => {
    const error = new Error(msg);
    error.status = status;
    error.code = code;
    if (detail) {
        error.detail = detail;
    }
    return error;
};

const isCloudinaryConfigured = () => Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

const buildUploadUnavailablePayload = (req) => ({
    code: "UPLOAD_UNAVAILABLE",
    msg: "Media upload service is unavailable right now",
    detail: "Cloudinary storage is not configured on the server",
    ...(req?.id ? { requestId: req.id } : {})
});

const ensureUploadConfigured = (req, res, next) => {
    if (isCloudinaryConfigured()) {
        return next();
    }

    return res.status(503).json(buildUploadUnavailablePayload(req));
};

const normalizeImageUrl = (value, options = {}) => {
    const {
        allowEmpty = true,
        code = "INVALID_PROFILE_PHOTO",
        field = "Profile photo",
        maxLength = 2048
    } = options;

    if (value === undefined) {
        return undefined;
    }

    if (value == null || value === "") {
        if (allowEmpty) {
            return "";
        }
        throw createMediaError(400, code, `${field} is required`);
    }

    if (typeof value !== "string") {
        throw createMediaError(400, code, `${field} must be a valid image URL`);
    }

    const normalized = value.trim();
    if (!normalized) {
        if (allowEmpty) {
            return "";
        }
        throw createMediaError(400, code, `${field} is required`);
    }

    if (normalized.length > maxLength) {
        throw createMediaError(400, code, `${field} must be ${maxLength} characters or fewer`);
    }

    let parsed;
    try {
        parsed = new URL(normalized);
    } catch (_) {
        throw createMediaError(400, code, `${field} must be a valid image URL`);
    }

    if (!["http:", "https:"].includes(parsed.protocol)) {
        throw createMediaError(400, code, `${field} must use http or https`);
    }

    const hostname = String(parsed.hostname || "").toLowerCase();
    const localHost = isLocalHostname(hostname);
    if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:" && !localHost) {
        throw createMediaError(400, code, `${field} must use https in production`);
    }

    const pathname = String(parsed.pathname || "").toLowerCase();
    const extensionIndex = pathname.lastIndexOf(".");
    const extension = extensionIndex >= 0 ? pathname.slice(extensionIndex) : "";
    const looksLikeCloudinaryImage =
        hostname.endsWith("cloudinary.com") &&
        (pathname.includes("/image/upload/") || pathname.includes("/image/fetch/"));

    if (!IMAGE_EXTENSIONS.has(extension) && !looksLikeCloudinaryImage && !localHost) {
        throw createMediaError(400, code, `${field} must point to a supported image`);
    }

    return parsed.toString();
};

module.exports = {
    buildUploadUnavailablePayload,
    ensureUploadConfigured,
    isCloudinaryConfigured,
    normalizeImageUrl
};
