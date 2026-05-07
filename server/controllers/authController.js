const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const College = require("../models/College");
const { toSafeUser } = require("../utils/safeUser");
const { normalizeImageUrl } = require("../utils/mediaConfig");
const { respondWithServerError } = require("../utils/respondWithServerError");
const {
    buildTotpAuthUrl,
    buildTotpLabel,
    generateTotpSecret,
    normalizeTotpSecret
} = require("../utils/totpProvisioning");
let OAuth2Client = null;
try {
    ({ OAuth2Client } = require("google-auth-library"));
} catch (_) {
    OAuth2Client = null;
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId && OAuth2Client ? new OAuth2Client(googleClientId) : null;
const isProduction = process.env.NODE_ENV === "production";
const debugAuthLogs = process.env.DEBUG_AUTH_LOGS === "true";
const AUTH_FLOW_AUDIENCE = "vitam-auth-flow";
const AUTH_FLOW_ISSUER = "vitam-auth";
const AUTH_FLOW_TOKEN_TTL = process.env.AUTH_FLOW_TOKEN_TTL || "20m";
const MAX_PASSKEY_DEVICES = 2;
const TOTP_WINDOW = Number.isFinite(Number(process.env.TOTP_WINDOW))
    ? Math.max(1, Math.min(3, Number(process.env.TOTP_WINDOW)))
    : 2;
const FACE_DESCRIPTOR_LENGTH = 64;
const FACE_MIN_ENROLL_SAMPLES = 3;
const FACE_CHALLENGE_TTL_MS = 2 * 60 * 1000;
const FACE_CHALLENGE_MIN_REISSUE_MS = 4000;
const FACE_MAX_FAILURES = 5;
const FACE_LOCK_MS = 10 * 60 * 1000;
const FACE_MATCH_THRESHOLD_DEFAULT = 0.86;
const DEFAULT_PRODUCTION_ORIGIN = "https://vitam-ai.vercel.app";
const DEFAULT_PRODUCTION_RP_ID = "vitam-ai.vercel.app";
const AUTH_FLOW_STAGES = {
    PASSWORD_VERIFIED: "password-verified",
    OTP_VERIFIED: "otp-verified",
    SETUP_PENDING: "setup-pending",
    SETUP_VERIFIED: "setup-verified"
};

const normalizeOriginValue = (value) => {
    const raw = String(value || "").trim();
    if (!raw) {
        return null;
    }

    try {
        const parsed = new URL(raw);
        if (!["https:", "http:"].includes(parsed.protocol)) {
            return null;
        }
        return `${parsed.protocol}//${parsed.host}`.toLowerCase();
    } catch (_) {
        return null;
    }
};

const normalizeRpIdValue = (value) => {
    const raw = String(value || "")
        .trim()
        .replace(/^https?:\/\//i, "")
        .replace(/\/.*$/, "")
        .replace(/:\d+$/, "")
        .toLowerCase();

    return raw || null;
};

const parseOriginList = (value) => Array.from(
    new Set(
        String(value || "")
            .split(",")
            .map((entry) => normalizeOriginValue(entry))
            .filter(Boolean)
    )
);

const parseRpIdList = (value) => Array.from(
    new Set(
        String(value || "")
            .split(",")
            .map((entry) => normalizeRpIdValue(entry))
            .filter(Boolean)
    )
);

const extractOriginHost = (origin) => {
    if (!origin) {
        return null;
    }

    try {
        return new URL(origin).hostname.toLowerCase();
    } catch (_) {
        return null;
    }
};

const isLocalHostOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(String(origin || ""));

const resolveWebAuthnConfig = (req) => {
    const envOrigins = parseOriginList(process.env.ORIGIN);
    const envRpIds = parseRpIdList(process.env.RP_ID);
    const requestOrigin = normalizeOriginValue(req?.headers?.origin || req?.get?.("origin"));
    const requestHost = extractOriginHost(requestOrigin);

    const origins = envOrigins.length > 0
        ? [...envOrigins]
        : (isProduction ? [DEFAULT_PRODUCTION_ORIGIN] : []);
    const rpIDs = envRpIds.length > 0
        ? [...envRpIds]
        : (isProduction ? [DEFAULT_PRODUCTION_RP_ID] : []);

    if (!isProduction && requestOrigin && isLocalHostOrigin(requestOrigin) && !origins.includes(requestOrigin)) {
        origins.unshift(requestOrigin);
    }
    if (!isProduction && requestHost && /^(localhost|127\.0\.0\.1)$/i.test(requestHost) && !rpIDs.includes(requestHost)) {
        rpIDs.unshift(requestHost);
    }

    const selectedOrigin = requestOrigin && origins.includes(requestOrigin)
        ? requestOrigin
        : (origins[0] || null);
    const selectedRpId = requestHost && rpIDs.includes(requestHost)
        ? requestHost
        : (rpIDs[0] || null);

    return {
        origin: selectedOrigin,
        rpID: selectedRpId,
        origins,
        rpIDs,
        source: envOrigins.length > 0 && envRpIds.length > 0
            ? "env"
            : isProduction
                ? "production-default"
                : "incomplete"
    };
};

const isWebAuthnConfigured = () => {
    const config = resolveWebAuthnConfig();
    return Boolean(config.rpID && config.origin);
};
const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) {
        const error = new Error("JWT secret missing on server");
        error.status = 503;
        error.code = "AUTH_UNAVAILABLE";
        throw error;
    }

    return process.env.JWT_SECRET;
};

const buildAuthUser = (user, req) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    subRole: user.subRole || "none",
    isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled),
    isBiometricEnabled: Boolean(user.isBiometricEnabled),
    hasFaceAuth: isFaceEnrolled(user),
    collegeId: user.collegeId,
    tenant: req.tenant || null
});

const createSession = async (user, req, options = {}) => {
    if (options.markSetupComplete) {
        user.isFirstLogin = false;
    }

    invalidatePendingAuthFlow(user);
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role,
            subRole: user.subRole || "none",
            collegeId: user.collegeId,
            sessionVersion: user.sessionVersion || 0
        },
        getJwtSecret(),
        { expiresIn: "1d" }
    );

    return {
        token,
        user: buildAuthUser(user, req)
    };
};

const createPendingAuthToken = (user, req, stage) => jwt.sign(
    {
        id: user._id,
        stage,
        sessionVersion: user.sessionVersion || 0,
        authFlowVersion: user.authFlowVersion || 0,
        collegeId: user.collegeId,
        tenantId: req.tenant?.id || null
    },
    getJwtSecret(),
    {
        expiresIn: AUTH_FLOW_TOKEN_TTL,
        audience: AUTH_FLOW_AUDIENCE,
        issuer: AUTH_FLOW_ISSUER
    }
);

const sendWebAuthnUnavailable = (res, msg, detail = "RP_ID or ORIGIN not configured on server") =>
    res.status(503).json({
        code: "WEBAUTHN_UNAVAILABLE",
        msg,
        detail
    });

const sendAuthFlowError = (res, status, code, msg) =>
    res.status(status).json({
        code,
        msg
    });

const sendWebAuthnError = (res, status, code, msg, detail) =>
    res.status(status).json({
        code,
        msg,
        ...(detail ? { detail } : {})
    });

const sendRequestError = (res, err) =>
    res.status(err.status || 400).json({
        code: err.code,
        msg: err.message,
        ...(Number.isFinite(err.retryAfterSec) ? { retryAfterSec: err.retryAfterSec } : {}),
        ...(Number.isFinite(err.attemptsRemaining) ? { attemptsRemaining: err.attemptsRemaining } : {}),
        ...(err.lockUntil ? { lockUntil: err.lockUntil } : {}),
        ...(err.detail ? { detail: err.detail } : {})
    });

const createWebAuthnError = (status, code, msg, detail) => {
    const error = new Error(msg);
    error.status = status;
    error.code = code;
    if (detail) {
        error.detail = detail;
    }
    return error;
};

const createAuthFlowError = (status, code, msg) => {
    const error = new Error(msg);
    error.status = status;
    error.code = code;
    return error;
};

const createRequestError = (status, code, msg, detail = {}) => {
    const error = new Error(msg);
    error.status = status;
    error.code = code;
    if (detail && typeof detail === "object") {
        Object.assign(error, detail);
    }
    return error;
};

const requireTrimmedString = (value, code, msg) => {
    if (typeof value !== "string" || !value.trim()) {
        throw createRequestError(400, code, msg);
    }

    return value.trim();
};

const requireObjectId = (value, code, msg) => {
    const id = requireTrimmedString(value, code, msg);
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw createRequestError(400, code, msg);
    }

    return id;
};

const requireOtpToken = (value) => {
    const token = String(value ?? "").trim();
    if (!/^\d{6}$/.test(token)) {
        throw createRequestError(400, "INVALID_OTP_FORMAT", "OTP code must be 6 digits");
    }

    return token;
};

const requirePlainObject = (value, code, msg) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        throw createRequestError(400, code, msg);
    }

    return value;
};

const normalizeNickname = (value) => {
    if (value == null || value === "") {
        return undefined;
    }
    if (typeof value !== "string") {
        throw createRequestError(400, "INVALID_NICKNAME", "Device nickname must be text");
    }

    const nickname = value.trim();
    if (!nickname) {
        return undefined;
    }

    return nickname.slice(0, 50);
};

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value || {}, key);

const normalizeOptionalBoolean = (value, field, code) => {
    if (value === undefined) {
        return undefined;
    }
    if (typeof value !== "boolean") {
        throw createRequestError(400, code, `${field} must be true or false`);
    }

    return value;
};

const normalizeOptionalProfileText = (value, { field, code, maxLength, pattern, emptyValue = "" }) => {
    if (value === undefined) {
        return undefined;
    }
    if (value == null || value === "") {
        return emptyValue;
    }
    if (typeof value !== "string") {
        throw createRequestError(400, code, `${field} must be text`);
    }

    const normalized = value.trim();
    if (!normalized) {
        return emptyValue;
    }
    if (normalized.length > maxLength) {
        throw createRequestError(400, code, `${field} must be ${maxLength} characters or fewer`);
    }
    if (pattern && !pattern.test(normalized)) {
        throw createRequestError(400, code, `${field} format is invalid`);
    }

    return normalized;
};

const normalizeOptionalDob = (value) => {
    if (value === undefined) {
        return undefined;
    }
    if (value == null || value === "") {
        return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        throw createRequestError(400, "INVALID_DOB", "Date of birth is invalid");
    }

    const now = new Date();
    if (parsed > now) {
        throw createRequestError(400, "INVALID_DOB", "Date of birth cannot be in the future");
    }
    if (parsed.getFullYear() < 1900) {
        throw createRequestError(400, "INVALID_DOB", "Date of birth is outside the supported range");
    }

    return parsed;
};

const normalizeUnitVector = (values, { code, msg }) => {
    const magnitude = Math.sqrt(values.reduce((acc, value) => acc + value * value, 0));
    if (!Number.isFinite(magnitude) || magnitude <= 0.000001) {
        throw createRequestError(400, code, msg);
    }

    return values.map((value) => Number((value / magnitude).toFixed(8)));
};

const normalizeFaceDescriptor = (value, code = "INVALID_FACE_DESCRIPTOR") => {
    if (!Array.isArray(value) || value.length !== FACE_DESCRIPTOR_LENGTH) {
        throw createRequestError(400, code, `Face descriptor must contain ${FACE_DESCRIPTOR_LENGTH} values`);
    }

    const numeric = value.map((entry) => Number(entry));
    if (numeric.some((entry) => !Number.isFinite(entry) || Math.abs(entry) > 1000)) {
        throw createRequestError(400, code, "Face descriptor contains invalid values");
    }

    return normalizeUnitVector(numeric, {
        code,
        msg: "Face descriptor magnitude is invalid"
    });
};

const normalizeFaceDescriptorSet = (value) => {
    if (!Array.isArray(value) || value.length < FACE_MIN_ENROLL_SAMPLES) {
        throw createRequestError(
            400,
            "INVALID_FACE_DESCRIPTOR_SET",
            `At least ${FACE_MIN_ENROLL_SAMPLES} face samples are required for enrollment`
        );
    }

    return value.slice(0, 5).map((sample, index) =>
        normalizeFaceDescriptor(sample, `INVALID_FACE_DESCRIPTOR_${index + 1}`)
    );
};

const computeAverageFaceDescriptor = (descriptors = []) => {
    const sums = new Array(FACE_DESCRIPTOR_LENGTH).fill(0);
    descriptors.forEach((descriptor) => {
        for (let i = 0; i < FACE_DESCRIPTOR_LENGTH; i += 1) {
            sums[i] += descriptor[i];
        }
    });

    return normalizeUnitVector(
        sums.map((value) => value / Math.max(1, descriptors.length)),
        {
            code: "INVALID_FACE_DESCRIPTOR_SET",
            msg: "Face descriptors are too inconsistent. Retake clearer samples."
        }
    );
};

const getFaceThreshold = () => {
    const parsed = Number.parseFloat(process.env.FACE_AUTH_THRESHOLD || "");
    if (Number.isFinite(parsed) && parsed >= 0.6 && parsed <= 0.99) {
        return parsed;
    }
    return FACE_MATCH_THRESHOLD_DEFAULT;
};

const hasFaceTemplate = (user) => Boolean(
    Array.isArray(user?.faceAuth?.descriptor) &&
    user.faceAuth.descriptor.length === FACE_DESCRIPTOR_LENGTH
);

const isFaceEnrolled = (user) => hasFaceTemplate(user);

const isFaceAuthActive = (user) => Boolean(user?.faceAuth?.enabled && hasFaceTemplate(user));

const clearFaceChallenge = (user) => {
    if (!user?.faceAuth) {
        user.faceAuth = {};
    }
    user.faceAuth.challenge = null;
    user.faceAuth.challengeIssuedAt = null;
    user.faceAuth.challengeExpiresAt = null;
};

const clearFaceLock = (user) => {
    if (!user?.faceAuth) {
        user.faceAuth = {};
    }
    user.faceAuth.failedAttempts = 0;
    user.faceAuth.lockUntil = null;
};

const FACE_CHALLENGE_WORDS = [
    "ALPHA",
    "BRAVO",
    "CAMPUS",
    "DELTA",
    "ECHO",
    "FOCUS",
    "GUARD",
    "NEXUS",
    "PRIME",
    "SECURE",
    "VECTOR",
    "VITAL"
];

const createFaceChallengeValue = () => {
    const first = FACE_CHALLENGE_WORDS[crypto.randomInt(0, FACE_CHALLENGE_WORDS.length)];
    const second = FACE_CHALLENGE_WORDS[crypto.randomInt(0, FACE_CHALLENGE_WORDS.length)];
    const digits = crypto.randomInt(10, 99);
    return `${first}-${second}-${digits}`;
};

const getActiveFaceChallenge = (user) => {
    const challenge = String(user?.faceAuth?.challenge || "").trim();
    const expiresAt = user?.faceAuth?.challengeExpiresAt instanceof Date ? user.faceAuth.challengeExpiresAt : null;
    if (!challenge || !expiresAt) {
        return null;
    }
    if (expiresAt.getTime() <= Date.now()) {
        return null;
    }
    return { challenge, expiresAt };
};

const issueFaceChallenge = (user) => {
    if (!user.faceAuth) {
        user.faceAuth = {};
    }

    const active = getActiveFaceChallenge(user);
    const issuedAt = user.faceAuth.challengeIssuedAt instanceof Date ? user.faceAuth.challengeIssuedAt : null;
    if (active && issuedAt && Date.now() - issuedAt.getTime() < FACE_CHALLENGE_MIN_REISSUE_MS) {
        return {
            challenge: active.challenge,
            expiresAt: active.expiresAt,
            reused: true
        };
    }

    const now = new Date();
    const challenge = createFaceChallengeValue();
    user.faceAuth.challenge = challenge;
    user.faceAuth.challengeIssuedAt = now;
    user.faceAuth.challengeExpiresAt = new Date(now.getTime() + FACE_CHALLENGE_TTL_MS);
    return {
        challenge,
        expiresAt: user.faceAuth.challengeExpiresAt,
        reused: false
    };
};

const verifyFaceChallenge = (user, response) => {
    const expected = String(user?.faceAuth?.challenge || "").trim();
    const expiresAt = user?.faceAuth?.challengeExpiresAt instanceof Date ? user.faceAuth.challengeExpiresAt : null;
    const provided = String(response || "").trim().toUpperCase();

    if (!expected || !expiresAt) {
        throw createRequestError(
            409,
            "FACE_CHALLENGE_MISSING",
            "Face challenge missing. Request a new challenge.",
            { challengeDirty: false, attemptsRemaining: getFaceAttemptsRemaining(user) }
        );
    }

    if (Date.now() > expiresAt.getTime()) {
        clearFaceChallenge(user);
        throw createRequestError(
            409,
            "FACE_CHALLENGE_EXPIRED",
            "Face challenge expired. Request a new challenge.",
            { challengeDirty: true, attemptsRemaining: getFaceAttemptsRemaining(user) }
        );
    }

    const expectedBuffer = Buffer.from(expected.toUpperCase(), "utf8");
    const providedBuffer = Buffer.from(provided, "utf8");
    const challengeMatches = expectedBuffer.length === providedBuffer.length
        && crypto.timingSafeEqual(expectedBuffer, providedBuffer);

    if (!challengeMatches) {
        const failure = registerFaceFailure(user);
        const retryAfterSec = failure.lockUntil
            ? Math.max(1, Math.ceil((new Date(failure.lockUntil).getTime() - Date.now()) / 1000))
            : undefined;
        clearFaceChallenge(user);
        if (failure.lockUntil) {
            throw createRequestError(
                429,
                "FACE_AUTH_LOCKED",
                `Face authentication is temporarily locked. Retry in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
                {
                    challengeDirty: true,
                    attemptsRemaining: failure.attemptsRemaining,
                    lockUntil: failure.lockUntil || null,
                    retryAfterSec,
                    detail: "challenge-mismatch"
                }
            );
        }
        throw createRequestError(
            400,
            "FACE_CHALLENGE_INVALID",
            "Face challenge text does not match.",
            {
                challengeDirty: true,
                attemptsRemaining: failure.attemptsRemaining,
                lockUntil: failure.lockUntil || null,
                retryAfterSec,
                detail: "challenge-mismatch"
            }
        );
    }
};

const cosineSimilarity = (left = [], right = []) => {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length || left.length === 0) {
        return 0;
    }

    let dot = 0;
    for (let index = 0; index < left.length; index += 1) {
        dot += left[index] * right[index];
    }
    return dot;
};

const getFaceAttemptsRemaining = (user) => {
    const failures = Number(user?.faceAuth?.failedAttempts || 0);
    return Math.max(0, FACE_MAX_FAILURES - failures);
};

const ensureFaceAuthUnlocked = (user) => {
    const lockUntil = user?.faceAuth?.lockUntil instanceof Date ? user.faceAuth.lockUntil : null;
    if (lockUntil && lockUntil > new Date()) {
        const retryAfterSec = Math.max(1, Math.ceil((lockUntil.getTime() - Date.now()) / 1000));
        throw createRequestError(
            429,
            "FACE_AUTH_LOCKED",
            `Face authentication is temporarily locked. Retry in ${Math.ceil(retryAfterSec / 60)} minute(s).`,
            { retryAfterSec, lockUntil, attemptsRemaining: getFaceAttemptsRemaining(user) }
        );
    }
};

const registerFaceFailure = (user) => {
    if (!user.faceAuth) {
        user.faceAuth = {};
    }
    user.faceAuth.failedAttempts = Number(user.faceAuth.failedAttempts || 0) + 1;
    if (user.faceAuth.failedAttempts >= FACE_MAX_FAILURES) {
        user.faceAuth.lockUntil = new Date(Date.now() + FACE_LOCK_MS);
    }
    return {
        attemptsRemaining: getFaceAttemptsRemaining(user),
        lockUntil: user.faceAuth.lockUntil || null
    };
};

const getFaceStatusPayload = (user) => {
    const descriptor = Array.isArray(user?.faceAuth?.descriptor) ? user.faceAuth.descriptor : [];
    return {
        enabled: Boolean(user?.faceAuth?.enabled),
        enrolled: descriptor.length === FACE_DESCRIPTOR_LENGTH,
        descriptorVersion: user?.faceAuth?.descriptorVersion || 1,
        threshold: Number(user?.faceAuth?.threshold || getFaceThreshold()),
        failedAttempts: Number(user?.faceAuth?.failedAttempts || 0),
        attemptsRemaining: getFaceAttemptsRemaining(user),
        lockUntil: user?.faceAuth?.lockUntil || null,
        enrolledAt: user?.faceAuth?.enrolledAt || null,
        lastVerifiedAt: user?.faceAuth?.lastVerifiedAt || null
    };
};

const encodeCredentialId = (value) => Buffer.from(value).toString("base64url");

const decodeCredentialId = (value) => {
    if (!value || typeof value !== "string") {
        throw createWebAuthnError(400, "INVALID_CREDENTIAL_ID", "Credential identifier is required");
    }

    try {
        return Buffer.from(value, value.includes("-") || value.includes("_") ? "base64url" : "base64");
    } catch (_) {
        throw createWebAuthnError(400, "INVALID_CREDENTIAL_ID", "Credential identifier is invalid");
    }
};

const toBinaryBuffer = (value, { code, msg }) => {
    if (!value) {
        throw createWebAuthnError(400, code, msg);
    }

    if (Buffer.isBuffer(value)) {
        return value;
    }

    if (value instanceof Uint8Array) {
        return Buffer.from(value);
    }

    if (typeof value === "string") {
        try {
            const encoding = value.includes("-") || value.includes("_") ? "base64url" : "base64";
            return Buffer.from(value, encoding);
        } catch (_) {
            throw createWebAuthnError(400, code, msg);
        }
    }

    throw createWebAuthnError(400, code, msg);
};

const toCredentialIdBuffer = (value) => {
    if (!value) {
        throw createWebAuthnError(400, "INVALID_CREDENTIAL_ID", "Credential identifier is required");
    }

    if (Buffer.isBuffer(value)) {
        return value;
    }

    if (value instanceof Uint8Array) {
        return Buffer.from(value);
    }

    if (typeof value === "string") {
        return decodeCredentialId(value);
    }

    throw createWebAuthnError(400, "INVALID_CREDENTIAL_ID", "Credential identifier is invalid");
};

const extractRegistrationCredential = (registrationInfo = {}) => {
    const credential = registrationInfo.credential || {};
    const credentialIdValue = credential.id || registrationInfo.credentialID;
    const publicKeyValue = credential.publicKey || registrationInfo.credentialPublicKey;
    const counterValue = Number.isFinite(credential.counter)
        ? credential.counter
        : registrationInfo.counter;

    return {
        credentialID: toCredentialIdBuffer(credentialIdValue),
        publicKey: toBinaryBuffer(publicKeyValue, {
            code: "INVALID_CREDENTIAL_PUBLIC_KEY",
            msg: "Credential public key is missing or invalid"
        }),
        counter: Number.isFinite(counterValue) ? counterValue : 0,
        transports: Array.isArray(credential.transports) ? credential.transports : []
    };
};

const classifyWebAuthnError = (error, fallbackMsg) => {
    if (error?.code && error?.status) {
        return {
            status: error.status,
            code: error.code,
            msg: error.message || fallbackMsg,
            detail: error.detail
        };
    }

    const message = String(error?.message || "").toLowerCase();

    if (message.includes("origin") || message.includes("rpid") || message.includes("rp id")) {
        return {
            status: 503,
            code: "WEBAUTHN_CONFIGURATION_ERROR",
            msg: "Passkey configuration mismatch. Use OTP or retry after deployment sync."
        };
    }

    if (message.includes("challenge")) {
        return {
            status: 400,
            code: "WEBAUTHN_CHALLENGE_INVALID",
            msg: "Passkey challenge is no longer valid. Retry to continue."
        };
    }

    return {
        status: 400,
        code: "WEBAUTHN_VERIFICATION_FAILED",
        msg: fallbackMsg
    };
};

const resolveAuthFlowUser = async (req, { pendingAuthToken, userId, allowedStages = [], allowSessionUser = false } = {}) => {
    if (pendingAuthToken) {
        let decoded;
        try {
            decoded = jwt.verify(pendingAuthToken, getJwtSecret(), {
                audience: AUTH_FLOW_AUDIENCE,
                issuer: AUTH_FLOW_ISSUER
            });
        } catch (error) {
            if (error?.name === "TokenExpiredError") {
                throw createAuthFlowError(401, "AUTH_FLOW_EXPIRED", "Secure verification session expired. Restart sign-in.");
            }
            throw createAuthFlowError(401, "AUTH_FLOW_INVALID", "Secure verification session invalid. Restart sign-in.");
        }

        if (allowedStages.length > 0 && !allowedStages.includes(decoded.stage)) {
            throw createAuthFlowError(409, "AUTH_FLOW_STAGE_MISMATCH", "Secure verification step is out of sync. Restart sign-in.");
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            throw createAuthFlowError(404, "AUTH_FLOW_INVALID", "User not found for verification");
        }
        if ((decoded.sessionVersion ?? 0) !== (user.sessionVersion || 0)) {
            throw createAuthFlowError(401, "AUTH_FLOW_INVALID", "Secure verification session invalid. Restart sign-in.");
        }
        if ((decoded.authFlowVersion ?? 0) !== (user.authFlowVersion || 0)) {
            throw createAuthFlowError(401, "AUTH_FLOW_INVALID", "Secure verification session expired. Restart sign-in.");
        }
        if (isCrossTenant(req, user)) {
            throw createAuthFlowError(403, "AUTH_FLOW_INVALID", "Cross-tenant access denied");
        }

        return { user, decoded };
    }

    if (allowSessionUser && req.user) {
        const actorId = req.user._id?.toString?.() || req.user.id?.toString?.();
        const requestedId = userId?.toString?.();
        const targetId = requestedId || actorId;
        let targetUser = null;

        if (targetId && mongoose.Types.ObjectId.isValid(targetId)) {
            targetUser = await User.findById(targetId);
        }

        if (!actorId || !targetUser) {
            throw createAuthFlowError(404, "AUTH_FLOW_INVALID", "User not found for verification");
        }
        if (isCrossTenant(req, targetUser)) {
            throw createAuthFlowError(403, "AUTH_FLOW_INVALID", "Cross-tenant access denied");
        }
        if (!canManageUserSecurity(req.user, targetUser)) {
            throw createAuthFlowError(403, "AUTH_FLOW_INVALID", "Security access denied");
        }

        return {
            user: targetUser,
            decoded: {
                stage: "session-authenticated"
            }
        };
    }

    throw createAuthFlowError(401, "AUTH_FLOW_INVALID", "Secure verification session invalid. Restart sign-in.");
};

const clearRegistrationChallenge = (user) => {
    user.registrationChallenge = null;
    user.registrationChallengeAt = null;
};

const clearAuthChallenge = (user) => {
    user.authChallenge = null;
    user.authChallengeAt = null;
};

const invalidatePendingAuthFlow = (user) => {
    user.authFlowVersion = (user.authFlowVersion || 0) + 1;
    clearRegistrationChallenge(user);
    clearAuthChallenge(user);
};

const issuePendingAuthToken = async (user, req, stage) => {
    invalidatePendingAuthFlow(user);
    await user.save();
    return createPendingAuthToken(user, req, stage);
};

const getAuthRuntimeHealth = () => {
    const dbStateMap = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
    };
    const dbState = dbStateMap[mongoose.connection.readyState] || "unknown";
    const dbReady = mongoose.connection.readyState === 1;
    const jwtReady = Boolean(process.env.JWT_SECRET);
    const maintenanceMode = process.env.MAINTENANCE_MODE === "true";
    const webAuthnConfig = resolveWebAuthnConfig();
    const webAuthnEnabled = Boolean(webAuthnConfig.rpID && webAuthnConfig.origin);
    const status = maintenanceMode
        ? "maintenance"
        : dbState === "connecting"
            ? "starting"
            : dbReady && jwtReady
                ? "ok"
                : "degraded";
    const signInAvailable = dbReady && jwtReady && !maintenanceMode;

    return {
        status,
        dbReady,
        dbState,
        jwtReady,
        jwtSecret: jwtReady,
        maintenanceMode,
        webAuthn: webAuthnEnabled,
        faceAuth: true,
        faceThreshold: getFaceThreshold(),
        totp: true,
        freeMode: process.env.FREE_MODE === "true",
        deviceCap: MAX_PASSKEY_DEVICES,
        signInAvailable,
        reason: maintenanceMode
            ? "Maintenance window in progress"
            : dbState === "connecting"
                ? "Auth service is starting up"
            : !dbReady
                ? "Database connection unavailable"
                : !jwtReady
                    ? "JWT secret missing on server"
                    : null
    };
};

const ensureAuthRuntimeAvailable = (res) => {
    const runtime = getAuthRuntimeHealth();
    if (!runtime.signInAvailable) {
        res.setHeader("Retry-After", runtime.maintenanceMode ? "300" : "30");
        res.status(503).json({
            code: "AUTH_UNAVAILABLE",
            msg: runtime.reason || "Secure sign-in temporarily unavailable",
            maintenanceMode: runtime.maintenanceMode
        });
        return false;
    }

    return true;
};

// Lightweight status probe for clients to decide fallbacks
exports.authStatus = async (req, res) => {
    const runtime = getAuthRuntimeHealth();
    const webAuthnConfig = resolveWebAuthnConfig(req);
    return res.json({
        webAuthn: runtime.webAuthn,
        faceAuth: runtime.faceAuth,
        faceThreshold: runtime.faceThreshold,
        totp: runtime.totp,
        freeMode: runtime.freeMode,
        rpId: webAuthnConfig.rpID || null,
        rpIds: webAuthnConfig.rpIDs || [],
        origin: webAuthnConfig.origin || null,
        origins: webAuthnConfig.origins || [],
        deviceCap: runtime.deviceCap,
        dbReady: runtime.dbReady,
        maintenanceMode: runtime.maintenanceMode,
        signInAvailable: runtime.signInAvailable,
        reason: runtime.reason || (runtime.webAuthn ? null : "RP_ID or ORIGIN not configured on server")
    });
};

// Auth health probe for readiness checks
exports.authHealth = async (_req, res) => {
    res.json(getAuthRuntimeHealth());
};

// Helper to log security events
const logSecurityEvent = async (req, userId, event, status, details, metadata = {}) => {
    try {
        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;
        if (isCrossTenant(req, user)) return;
        if (user) {
            user.securityLogs.push({ 
                event, 
                status, 
                details,
                location: metadata.location || "Unspecified",
                ip: metadata.ip || req?.ip || "0.0.0.0",
                device: metadata.device || req?.get?.("user-agent") || "Unknown device"
            });
            // Keep last 50 logs
            if (user.securityLogs.length > 50) user.securityLogs.shift();
            await user.save();
        }
    } catch (e) {
        console.error("Logging Error:", e);
    }
};

// Tenant guard
const isCrossTenant = (req, user) => {
    if (!req.tenant || !user) return false;
    if (!user.collegeId) return false;
    return user.collegeId.toString() !== req.tenant.id.toString();
};

const normalizeRole = (role) => String(role || "").toLowerCase();
const securityAdminRoles = new Set(["superadmin", "admin", "chairman", "director"]);

const canManageUserSecurity = (actor, targetUser) => {
    if (!actor || !targetUser) return false;
    const actorId = actor._id?.toString?.() || actor.id?.toString?.();
    const targetId = targetUser._id?.toString?.();

    if (actorId && targetId && actorId === targetId) {
        return true;
    }

    return securityAdminRoles.has(normalizeRole(actor.role));
};

const ensureSecurityAccess = (req, res, targetUser) => {
    if (!targetUser) {
        res.status(404).json({ msg: "User not found" });
        return false;
    }
    if (isCrossTenant(req, targetUser)) {
        res.status(403).json({ msg: "Cross-tenant access denied" });
        return false;
    }
    if (!canManageUserSecurity(req.user, targetUser)) {
        res.status(403).json({ msg: "Security access denied" });
        return false;
    }
    return true;
};

// ─────────────────────────────────────────────────────────────────────────────

exports.register = async (req, res) => {
    try {
        if (!ensureAuthRuntimeAvailable(res)) return;
        const { name, email, password, role } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ 
            name, 
            email, 
            password: hashedPassword, 
            role: role || "STUDENT",
            collegeId: req.tenant ? req.tenant.id : undefined
        });

        const secret = generateTotpSecret(email);
        user.twoFactorSecret = secret;

        await user.save();

        const qrCodeUrl = await qrcode.toDataURL(buildTotpAuthUrl(email, secret));
        res.status(201).json({ msg: "User registered. Please setup 2FA.", qrCode: qrCodeUrl, userId: user._id });
    } catch (err) {
        if (err?.status && err?.code) {
            return res.status(err.status).json({ code: err.code, msg: err.message });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Register Error",
            msg: "Unable to register account right now"
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN — returns QR code URI for 2FA setup in the response
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
    try {
        if (!ensureAuthRuntimeAvailable(res)) return;
        const { email, password } = req.body;

        // ── Real DB path ──
        const user = await User.findOne(req.tenant ? { email, collegeId: req.tenant.id } : { email });
        if (!isProduction) {
    if (debugAuthLogs) {
        console.log(`[Auth] Login attempt for ${email} | userFound=${Boolean(user)}`);
    }
        }
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });
        if (isCrossTenant(req, user)) return res.status(403).json({ msg: "Cross-tenant access denied" });

        // Per-user login lockout
        if (user.loginLockUntil && user.loginLockUntil > new Date()) {
            return res.status(429).json({ msg: "Too many login attempts. Try again in a few minutes." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            user.loginFailures = (user.loginFailures || 0) + 1;
            if (user.loginFailures >= 5) {
                user.loginLockUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 min
            }
            await user.save();
            await logSecurityEvent(req, user._id, "Login Attempt", "Failed", "Incorrect password");
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        // reset lock counters on success and rotate pending MFA flow state
        user.loginFailures = 0;
        user.loginLockUntil = null;
        clearFaceChallenge(user);

        const webAuthnEnabled = isWebAuthnConfigured();
        const hasBiometrics = Array.isArray(user.credentials) && user.credentials.length > 0;
        if (!user.isFirstLogin && user.isBiometricEnabled && webAuthnEnabled && !hasBiometrics) {
            user.isBiometricEnabled = false;
        }
        const requiresBiometric = !user.isFirstLogin && user.isBiometricEnabled && webAuthnEnabled && hasBiometrics;
        const requires2FA = !user.isFirstLogin && user.isTwoFactorEnabled;
        const needsTotpProvisioning = user.isFirstLogin || requires2FA;
        let totpPlainSecret = normalizeTotpSecret(user.twoFactorSecret);
        const hadTwoFactorSecret = Boolean(totpPlainSecret);

        // Generate / reuse secret only when the active flow actually needs TOTP.
        if (needsTotpProvisioning && !totpPlainSecret) {
            totpPlainSecret = generateTotpSecret(email);
            user.twoFactorSecret = totpPlainSecret;
        }
        const pendingAuthToken = (user.isFirstLogin || requires2FA || requiresBiometric)
            ? await issuePendingAuthToken(
                user,
                req,
                user.isFirstLogin ? AUTH_FLOW_STAGES.SETUP_PENDING : AUTH_FLOW_STAGES.PASSWORD_VERIFIED
            )
            : null;

        await logSecurityEvent(req, user._id, "Primary Login", "Success", "Password verified");

        if (!user.isFirstLogin && !requires2FA && !requiresBiometric) {
            const session = await createSession(user, req);
            return res.json({
                msg: "Primary login successful.",
                ...session,
                requires2FA: false,
                requiresBiometric: false,
                requiresFaceAuth: false,
                needsTotpEnrollment: false,
                webAuthnEnabled,
                hasBiometrics,
                hasFaceAuth: false,
                role: user.role,
                name: user.name,
                tenant: req.tenant || null,
                collegeId: user.collegeId
            });
        }

        let qrCodeDataUri = null;
        let totpSecret = null;
        let totpLabel = null;
        const needsTotpEnrollment = user.isFirstLogin || (requires2FA && !hadTwoFactorSecret);
        if (needsTotpProvisioning && totpPlainSecret) {
            const otpauthUrl = buildTotpAuthUrl(email, totpPlainSecret);
            qrCodeDataUri = needsTotpEnrollment ? await qrcode.toDataURL(otpauthUrl) : null;
            totpSecret = needsTotpEnrollment ? totpPlainSecret : null;
            totpLabel = buildTotpLabel(email);
        }

        res.json({
            msg: "Primary login successful.",
            userId: user._id,
            pendingAuthToken,
            isFirstLogin: user.isFirstLogin,
            requires2FA,
            requiresBiometric,
            requiresFaceAuth: false,
            needsTotpEnrollment,
            webAuthnEnabled,
            hasBiometrics,
            hasFaceAuth: false,
            qrCode: qrCodeDataUri,
            totpSecret,
            totpLabel,
            user: buildAuthUser(user, req),
            role: user.role,
            name: user.name,
            tenant: req.tenant || null,
            collegeId: user.collegeId
        });
    } catch (err) {
        if (err?.status && err?.code) {
            return res.status(err.status).json({ code: err.code, msg: err.message });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Login Error",
            msg: "Unable to sign in right now"
        });
    }
};

// Google OAuth2 Login with ID token
exports.googleLogin = async (req, res) => {
    try {
        if (!ensureAuthRuntimeAvailable(res)) return;
        const { idToken } = req.body;
        if (!googleClient) {
            return res.status(503).json({
                code: "GOOGLE_OAUTH_UNAVAILABLE",
                msg: "Google sign-in is unavailable right now",
                ...(req.id ? { requestId: req.id } : {})
            });
        }
        if (!idToken) return res.status(400).json({ msg: "idToken required" });

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: googleClientId
        });
        const payload = ticket.getPayload();
        const email = payload.email?.toLowerCase();
        const name = payload.name || email;
        if (!email) return res.status(400).json({ msg: "Email missing in token" });

        // Enforce tenant if present
        let user = await User.findOne(req.tenant ? { email, collegeId: req.tenant.id } : { email });
        if (user && isCrossTenant(req, user)) return res.status(403).json({ msg: "Cross-tenant access denied" });

        if (!user) {
            user = await User.create({
                name,
                email,
                password: "",
                role: "STUDENT",
                subRole: "none",
                isFirstLogin: false,
                isTwoFactorEnabled: false,
                isBiometricEnabled: false,
                collegeId: req.tenant ? req.tenant.id : undefined
            });
        }

        const session = await createSession(user, req);

        res.json({
            ...session
        });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Google Login Error",
            msg: "Unable to complete Google sign-in right now"
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY 2FA — real speakeasy TOTP verification
// ─────────────────────────────────────────────────────────────────────────────
exports.verify2FA = async (req, res) => {
    try {
        if (!ensureAuthRuntimeAvailable(res)) return;
        const { userId, pendingAuthToken, token } = req.body;

        const { user, decoded } = await resolveAuthFlowUser(req, {
            pendingAuthToken,
            userId,
            allowedStages: [AUTH_FLOW_STAGES.PASSWORD_VERIFIED, AUTH_FLOW_STAGES.SETUP_PENDING]
        });

        // Lockout check
        if (user.totpLockUntil && user.totpLockUntil > new Date()) {
            return res.status(429).json({ msg: "Too many invalid codes. Try again in a few minutes." });
        }

        const totpPlainSecret = normalizeTotpSecret(user.twoFactorSecret);
        if (!totpPlainSecret) {
            return res.status(409).json({
                code: "TOTP_ENROLLMENT_REQUIRED",
                msg: "2FA setup is required again. Please sign in and scan your personal authenticator QR code."
            });
        }

        const verified = speakeasy.totp.verify({
            secret: totpPlainSecret,
            encoding: "base32",
            token,
            window: TOTP_WINDOW,
        });

        if (!verified) {
            user.totpFailures = (user.totpFailures || 0) + 1;
            if (user.totpFailures >= 5) {
                user.totpLockUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 min lock
            }
            await user.save();
            await logSecurityEvent(req, user._id, "2FA Verification", "Failed", "Invalid OTP code");
            return res.status(400).json({ msg: "Invalid 2FA token" });
        }

        user.totpFailures = 0;
        user.totpLockUntil = null;
        await user.save();

        await logSecurityEvent(req, user._id, "2FA Verification", "Success", "TOTP code confirmed");

        const isSetupFlow = decoded?.stage === AUTH_FLOW_STAGES.SETUP_PENDING || user.isFirstLogin;
        const webAuthnEnabled = isWebAuthnConfigured();
        const biometricsOn = user.isBiometricEnabled && webAuthnEnabled;
        const hasCreds = Array.isArray(user.credentials) && user.credentials.length > 0;
        if (biometricsOn && !hasCreds) {
            user.isBiometricEnabled = false;
        }
        const requiresBiometric = biometricsOn && hasCreds;

        if (isSetupFlow) {
            const nextPendingAuthToken = await issuePendingAuthToken(user, req, AUTH_FLOW_STAGES.SETUP_VERIFIED);
            return res.json({
                msg: "2FA successful.",
                userId: user._id,
                user: buildAuthUser(user, req),
                pendingAuthToken: nextPendingAuthToken,
                requiresBiometric: webAuthnEnabled,
                hasBiometrics: hasCreds,
                requiresFaceAuth: false,
                hasFaceAuth: false,
                webAuthnEnabled,
                requiresSetupCompletion: true
            });
        }

        if (!requiresBiometric) {
            const session = await createSession(user, req);
            return res.json({
                msg: "2FA successful.",
                ...session,
                requiresBiometric: false,
                hasBiometrics: hasCreds,
                requiresFaceAuth: false,
                hasFaceAuth: false
            });
        }

        const nextPendingAuthToken = await issuePendingAuthToken(user, req, AUTH_FLOW_STAGES.OTP_VERIFIED);
        res.json({
            msg: "2FA successful.",
            userId: user._id,
            user: buildAuthUser(user, req),
            pendingAuthToken: nextPendingAuthToken,
            requiresBiometric,
            hasBiometrics: hasCreds,
            requiresFaceAuth: false,
            hasFaceAuth: false,
            webAuthnEnabled
        });
    } catch (err) {
        if (err?.status && err?.code) {
            return sendAuthFlowError(res, err.status || 401, err.code, err.message);
        }
        return respondWithServerError(req, res, err, {
            logLabel: "2FA Error",
            msg: "Unable to complete two-factor verification"
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY BIOMETRIC — issues JWT after biometric check
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyBiometric = async (req, res) => {
    return res.status(410).json({
        code: "LEGACY_BIOMETRIC_DISABLED",
        msg: "Legacy biometric endpoint disabled. Use WebAuthn verification."
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE SETUP (First Login)
// ─────────────────────────────────────────────────────────────────────────────
const normalizeFaceCaptureMeta = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return undefined;
    }

    const next = {};
    if (typeof value.model === "string" && value.model.trim()) {
        next.model = value.model.trim().slice(0, 40);
    }
    if (Number.isFinite(value.sampleCount)) {
        next.sampleCount = Math.max(1, Math.min(10, Math.round(Number(value.sampleCount))));
    }
    if (Number.isFinite(value.avgBrightness)) {
        next.avgBrightness = Number(value.avgBrightness);
    }
    if (Number.isFinite(value.avgContrast)) {
        next.avgContrast = Number(value.avgContrast);
    }
    if (typeof value.deviceLabel === "string" && value.deviceLabel.trim()) {
        next.deviceLabel = value.deviceLabel.trim().slice(0, 80);
    }

    return Object.keys(next).length > 0 ? next : undefined;
};

exports.getFaceChallenge = async (req, res) => {
    try {
        if (!ensureAuthRuntimeAvailable(res)) return;
        const { userId, pendingAuthToken } = req.body || {};
        const { user } = await resolveAuthFlowUser(req, {
            pendingAuthToken,
            userId,
            allowedStages: [
                AUTH_FLOW_STAGES.PASSWORD_VERIFIED,
                AUTH_FLOW_STAGES.OTP_VERIFIED,
                AUTH_FLOW_STAGES.SETUP_VERIFIED
            ],
            allowSessionUser: true
        });

        ensureFaceAuthUnlocked(user);
        const challengePayload = issueFaceChallenge(user);
        if (!challengePayload.reused) {
            await user.save();
        }

        res.json({
            challenge: challengePayload.challenge,
            expiresAt: challengePayload.expiresAt,
            expiresInSec: Math.max(1, Math.ceil((new Date(challengePayload.expiresAt).getTime() - Date.now()) / 1000)),
            reused: Boolean(challengePayload.reused),
            attemptsRemaining: getFaceAttemptsRemaining(user),
            descriptorLength: FACE_DESCRIPTOR_LENGTH,
            algorithm: "vitam-face-v1"
        });
    } catch (err) {
        if (err?.status && err?.code?.startsWith?.("AUTH_FLOW_")) {
            return sendAuthFlowError(res, err.status || 401, err.code, err.message);
        }
        if (err?.status && err?.code) {
            return sendRequestError(res, err);
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Face Challenge Error",
            msg: "Unable to issue face challenge right now"
        });
    }
};

exports.enrollFaceAuth = async (req, res) => {
    let flowUser = null;
    try {
        if (!ensureAuthRuntimeAvailable(res)) return;
        const { userId, pendingAuthToken, challengeResponse, completeLogin } = req.body || {};
        const { user, decoded } = await resolveAuthFlowUser(req, {
            pendingAuthToken,
            userId,
            allowedStages: [
                AUTH_FLOW_STAGES.PASSWORD_VERIFIED,
                AUTH_FLOW_STAGES.OTP_VERIFIED,
                AUTH_FLOW_STAGES.SETUP_VERIFIED
            ],
            allowSessionUser: true
        });
        flowUser = user;

        ensureFaceAuthUnlocked(user);
        verifyFaceChallenge(user, challengeResponse);

        const normalizedSamples = normalizeFaceDescriptorSet(req.body?.descriptors);
        const descriptor = computeAverageFaceDescriptor(normalizedSamples);
        const captureMeta = normalizeFaceCaptureMeta(req.body?.captureMeta);

        user.faceAuth = {
            ...(user.faceAuth || {}),
            enabled: true,
            descriptor,
            descriptorVersion: 1,
            threshold: getFaceThreshold(),
            enrolledAt: new Date(),
            failedAttempts: 0,
            lockUntil: null,
            captureMeta: {
                ...(captureMeta || {}),
                sampleCount: normalizedSamples.length
            }
        };
        clearFaceChallenge(user);

        await logSecurityEvent(
            req,
            user._id,
            "Face Authentication Enrollment",
            "Success",
            `Face profile enrolled (${normalizedSamples.length} samples)`
        );

        if (completeLogin && (decoded?.stage === AUTH_FLOW_STAGES.OTP_VERIFIED || decoded?.stage === AUTH_FLOW_STAGES.PASSWORD_VERIFIED)) {
            const session = await createSession(user, req);
            return res.json({
                enrolled: true,
                ...session,
                faceAuth: getFaceStatusPayload(user)
            });
        }

        await user.save();
        return res.json({
            enrolled: true,
            user: buildAuthUser(user, req),
            faceAuth: getFaceStatusPayload(user)
        });
    } catch (err) {
        if (flowUser && err?.challengeDirty) {
            try {
                await flowUser.save();
            } catch (_) {
                // ignore best-effort persistence failures during challenge cleanup
            }
        }
        if (flowUser && err?.detail === "challenge-mismatch") {
            try {
                await logSecurityEvent(
                    req,
                    flowUser._id,
                    "Face Authentication Enrollment",
                    "Failed",
                    `Challenge mismatch during enrollment (${err.code}, remaining attempts ${getFaceAttemptsRemaining(flowUser)})`
                );
            } catch (_) {
                // non-blocking audit log failure
            }
        }
        if (err?.status && err?.code?.startsWith?.("AUTH_FLOW_")) {
            return sendAuthFlowError(res, err.status || 401, err.code, err.message);
        }
        if (err?.status && err?.code) {
            return sendRequestError(res, err);
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Face Enrollment Error",
            msg: "Unable to enroll face authentication right now"
        });
    }
};

exports.verifyFaceAuth = async (req, res) => {
    let flowUser = null;
    try {
        if (!ensureAuthRuntimeAvailable(res)) return;
        const { userId, pendingAuthToken, challengeResponse } = req.body || {};
        const { user, decoded } = await resolveAuthFlowUser(req, {
            pendingAuthToken,
            userId,
            allowedStages: [AUTH_FLOW_STAGES.PASSWORD_VERIFIED, AUTH_FLOW_STAGES.OTP_VERIFIED],
            allowSessionUser: true
        });
        flowUser = user;

        if (!isFaceEnrolled(user)) {
            throw createRequestError(409, "FACE_AUTH_NOT_ENROLLED", "Face authentication is not enrolled for this account.");
        }

        ensureFaceAuthUnlocked(user);
        verifyFaceChallenge(user, challengeResponse);

        const descriptor = normalizeFaceDescriptor(req.body?.descriptor);
        const storedDescriptor = normalizeFaceDescriptor(user.faceAuth.descriptor, "INVALID_STORED_FACE_DESCRIPTOR");
        const threshold = Number(user.faceAuth?.threshold || getFaceThreshold());
        const score = Number(cosineSimilarity(storedDescriptor, descriptor).toFixed(6));

        clearFaceChallenge(user);

        if (score < threshold) {
            registerFaceFailure(user);
            await user.save();
            await logSecurityEvent(
                req,
                user._id,
                "Face Authentication",
                "Failed",
                `Face mismatch (score ${score}, threshold ${threshold})`
            );
            return res.status(401).json({
                code: "FACE_MISMATCH",
                msg: "Face verification did not match. Please retry in better lighting.",
                score,
                threshold,
                attemptsRemaining: getFaceAttemptsRemaining(user),
                lockedUntil: user.faceAuth?.lockUntil || null,
                ...(user.faceAuth?.lockUntil ? { retryAfterSec: Math.max(1, Math.ceil((new Date(user.faceAuth.lockUntil).getTime() - Date.now()) / 1000)) } : {})
            });
        }

        clearFaceLock(user);
        user.faceAuth.lastVerifiedAt = new Date();

        await logSecurityEvent(
            req,
            user._id,
            "Face Authentication",
            "Success",
            `Face verified (score ${score}, threshold ${threshold})`
        );

        if (decoded?.stage === AUTH_FLOW_STAGES.PASSWORD_VERIFIED || decoded?.stage === AUTH_FLOW_STAGES.OTP_VERIFIED) {
            const session = await createSession(user, req);
            return res.json({
                verified: true,
                score,
                threshold,
                ...session,
                faceAuth: getFaceStatusPayload(user)
            });
        }

        await user.save();
        return res.json({
            verified: true,
            score,
            threshold,
            user: buildAuthUser(user, req),
            faceAuth: getFaceStatusPayload(user)
        });
    } catch (err) {
        if (flowUser && err?.challengeDirty) {
            try {
                await flowUser.save();
            } catch (_) {
                // ignore best-effort persistence failures during challenge cleanup
            }
        }
        if (flowUser && err?.detail === "challenge-mismatch") {
            try {
                await logSecurityEvent(
                    req,
                    flowUser._id,
                    "Face Authentication",
                    "Failed",
                    `Challenge mismatch during face verification (${err.code}, remaining attempts ${getFaceAttemptsRemaining(flowUser)})`
                );
            } catch (_) {
                // non-blocking audit log failure
            }
        }
        if (err?.status && err?.code?.startsWith?.("AUTH_FLOW_")) {
            return sendAuthFlowError(res, err.status || 401, err.code, err.message);
        }
        if (err?.status && err?.code) {
            return sendRequestError(res, err);
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Face Verification Error",
            msg: "Unable to verify face authentication right now"
        });
    }
};

exports.getFaceAuthStatus = async (req, res) => {
    try {
        const userId = requireObjectId(req.params?.userId, "INVALID_USER_ID", "Valid userId is required");
        const user = await User.findById(userId);
        if (!ensureSecurityAccess(req, res, user)) return;

        return res.json({
            faceAuth: getFaceStatusPayload(user)
        });
    } catch (err) {
        if (err?.status && err?.code) {
            return sendRequestError(res, err);
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Face Status Error",
            msg: "Unable to load face authentication status right now"
        });
    }
};

exports.disableFaceAuth = async (req, res) => {
    try {
        const userId = requireObjectId(req.body?.userId, "INVALID_USER_ID", "Valid userId is required");
        const user = await User.findById(userId);
        if (!ensureSecurityAccess(req, res, user)) return;

        user.faceAuth = {
            enabled: false,
            descriptor: [],
            descriptorVersion: 1,
            threshold: getFaceThreshold(),
            enrolledAt: null,
            lastVerifiedAt: null,
            failedAttempts: 0,
            lockUntil: null,
            challenge: null,
            challengeIssuedAt: null,
            challengeExpiresAt: null,
            captureMeta: {}
        };

        await user.save();
        await logSecurityEvent(req, userId, "Face Authentication", "Success", "Face profile disabled and cleared");

        return res.json({
            msg: "Face authentication disabled",
            faceAuth: getFaceStatusPayload(user)
        });
    } catch (err) {
        if (err?.status && err?.code) {
            return sendRequestError(res, err);
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Disable Face Auth Error",
            msg: "Unable to disable face authentication right now"
        });
    }
};

exports.completeSetup = async (req, res) => {
    try {
        if (!ensureAuthRuntimeAvailable(res)) return;
        const { userId, pendingAuthToken } = req.body;
        const { user, decoded } = await resolveAuthFlowUser(req, {
            pendingAuthToken,
            userId,
            allowedStages: [AUTH_FLOW_STAGES.SETUP_VERIFIED, AUTH_FLOW_STAGES.OTP_VERIFIED]
        });

        if (!user.isFirstLogin) {
            await logSecurityEvent(
                req,
                user._id,
                "Security Setup",
                "Info",
                "Setup completion requested for an already-completed account"
            );

            const session = await createSession(user, req);
            return res.json({
                msg: "Security setup already completed. Continuing secure sign-in.",
                alreadyCompleted: true,
                ...session
            });
        }

        if (decoded?.stage === AUTH_FLOW_STAGES.OTP_VERIFIED) {
            await logSecurityEvent(
                req,
                user._id,
                "Security Setup",
                "Warning",
                "Setup completed using OTP_VERIFIED compatibility flow"
            );
        }

        // First login can skip passkey, but WebAuthn becomes mandatory from next login.
        user.isBiometricEnabled = true;
        user.isTwoFactorEnabled = true;

        await logSecurityEvent(req, user._id, "Security Setup", "Success", "Completed first-time security wizard");

        const session = await createSession(user, req, { markSetupComplete: true });

        res.json({
            msg: "Setup complete",
            ...session
        });
    } catch (err) {
        if (err?.status && err?.code) {
            return sendAuthFlowError(res, err.status || 401, err.code, err.message);
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Setup Completion Error",
            msg: "Unable to complete secure setup right now"
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// WEBAUTHN (Real Biometrics)
// ─────────────────────────────────────────────────────────────────────────────

exports.bypassBiometric = async (req, res) => {
    try {
        if (!ensureAuthRuntimeAvailable(res)) return;
        const { userId, pendingAuthToken } = req.body || {};
        const reasonRaw = typeof req.body?.reason === "string" ? req.body.reason : "";
        const reason = reasonRaw.trim().slice(0, 120) || "user-requested-fallback";

        const { user, decoded } = await resolveAuthFlowUser(req, {
            pendingAuthToken,
            userId,
            allowedStages: [AUTH_FLOW_STAGES.SETUP_VERIFIED]
        });

        if (!user.isFirstLogin) {
            return sendAuthFlowError(res, 409, "BIOMETRIC_BYPASS_DISABLED", "Passkey bypass is disabled after first login.");
        }

        clearRegistrationChallenge(user);
        clearAuthChallenge(user);

        await logSecurityEvent(
            req,
            user._id,
            "Biometric Bypass",
            "Warning",
            `Biometric step bypassed for current session (${decoded?.stage || "unknown-stage"}). Reason: ${reason}`
        );

        const session = await createSession(user, req);
        res.json({
            msg: "Biometric step bypassed for this session",
            bypassed: true,
            ...session
        });
    } catch (err) {
        if (err?.status && err?.code) {
            return sendAuthFlowError(res, err.status || 401, err.code, err.message);
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Biometric Bypass Error",
            msg: "Unable to bypass biometric step right now"
        });
    }
};

const rpName = "VITAM AI Portal";
const getBoundedNumber = (value, fallback, min, max) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(min, Math.min(max, parsed));
};
const getWebAuthnRegistrationTimeout = () =>
    getBoundedNumber(process.env.WEBAUTHN_REGISTRATION_TIMEOUT_MS, 120000, 60000, 180000);
const getWebAuthnAuthenticatorSelection = () => {
    const residentKey = String(process.env.WEBAUTHN_RESIDENT_KEY || "preferred").trim();
    const userVerification = String(process.env.WEBAUTHN_USER_VERIFICATION || "required").trim();
    const attachment = String(process.env.WEBAUTHN_AUTHENTICATOR_ATTACHMENT || "").trim();
    const selection = {
        residentKey: ["discouraged", "preferred", "required"].includes(residentKey) ? residentKey : "preferred",
        userVerification: ["discouraged", "preferred", "required"].includes(userVerification) ? userVerification : "required"
    };

    // Leave attachment unset by default so Windows Hello, iPhone/Android hybrid passkeys,
    // and physical security keys can all appear in the browser prompt.
    if (["platform", "cross-platform"].includes(attachment)) {
        selection.authenticatorAttachment = attachment;
    }

    return selection;
};

const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} = require('@simplewebauthn/server');

exports.registerOptions = async (req, res) => {
    try {
        if (!ensureAuthRuntimeAvailable(res)) return;
        const { rpID, origin } = resolveWebAuthnConfig(req);
        if (!rpID || !origin) {
            return sendWebAuthnUnavailable(res, "Biometric registration temporarily unavailable. Use OTP instead.");
        }
        const { userId, pendingAuthToken } = req.body;
        const { user } = await resolveAuthFlowUser(req, {
            pendingAuthToken,
            userId,
            allowedStages: [AUTH_FLOW_STAGES.PASSWORD_VERIFIED, AUTH_FLOW_STAGES.OTP_VERIFIED, AUTH_FLOW_STAGES.SETUP_VERIFIED],
            allowSessionUser: true
        });

        // Limit devices per user to 2
        if (user.credentials && user.credentials.length >= MAX_PASSKEY_DEVICES) {
            return sendWebAuthnError(res, 400, "DEVICE_LIMIT_REACHED", `Device limit reached (${MAX_PASSKEY_DEVICES}). Remove an existing device first.`);
        }
        
        const uid = user._id.toString();
        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: Buffer.from(uid),
            userName: user.email,
            excludeCredentials: (user.credentials || []).map((cred) => ({
                id: encodeCredentialId(cred.credentialID),
                transports: cred.transports || []
            })),
            attestationType: 'none',
            authenticatorSelection: getWebAuthnAuthenticatorSelection(),
            timeout: getWebAuthnRegistrationTimeout()
        });

        const now = new Date();
        user.registrationChallenge = options.challenge;
        user.registrationChallengeAt = now;
        await user.save();

        res.json(options);
    } catch (err) {
        if (err?.code?.startsWith?.("AUTH_FLOW_")) {
            return sendAuthFlowError(res, err.status || 401, err.code, err.message);
        }
        console.error("WebAuthn Reg Options Error:", {
            requestId: req.id,
            message: err?.message || err
        });
        res.status(503).json({ code: "WEBAUTHN_UNAVAILABLE", msg: "Biometric registration temporarily unavailable. Use OTP or retry." });
    }
};

exports.verifyRegistration = async (req, res) => {
    try {
        if (!ensureAuthRuntimeAvailable(res)) return;
        const { rpID, origin, origins, rpIDs } = resolveWebAuthnConfig(req);
        if (!rpID || !origin) {
            return sendWebAuthnUnavailable(res, "Biometric registration temporarily unavailable. Use OTP instead.");
        }
        const { userId, completeLogin, pendingAuthToken } = req.body;
        const body = requirePlainObject(req.body?.body, "INVALID_BIOMETRIC_PAYLOAD", "Invalid biometric response payload");
        const nickname = normalizeNickname(req.body?.nickname);
        const { user, decoded } = await resolveAuthFlowUser(req, {
            pendingAuthToken,
            userId,
            allowedStages: [AUTH_FLOW_STAGES.PASSWORD_VERIFIED, AUTH_FLOW_STAGES.OTP_VERIFIED, AUTH_FLOW_STAGES.SETUP_VERIFIED],
            allowSessionUser: true
        });

        if (!user) {
            return res.status(404).json({ msg: "User not found for storage" });
        }

        const expectedChallenge = user.registrationChallenge;
        const issuedAt = user.registrationChallengeAt || new Date(0);
        const isExpired = Date.now() - issuedAt.getTime() > 5 * 60 * 1000; // 5 minutes
        if (!expectedChallenge || isExpired) {
            clearRegistrationChallenge(user);
            await user.save();
            return sendWebAuthnError(res, 400, "WEBAUTHN_CHALLENGE_EXPIRED", "Challenge expired. Restart login to register device.");
        }

        let verification;
        try {
            const expectedOrigin = origins.length > 0 ? origins : origin;
            const expectedRPID = rpIDs.length > 0 ? rpIDs : rpID;
            verification = await verifyRegistrationResponse({
                response: body,
                expectedChallenge,
                expectedOrigin,
                expectedRPID,
            });
        } catch (error) {
            clearRegistrationChallenge(user);
            await user.save();
            throw error;
        }
        clearRegistrationChallenge(user);

        if (verification.verified) {
            const { registrationInfo } = verification;
            const extractedCredential = extractRegistrationCredential(registrationInfo);

            // Prevent duplicate credential IDs and cap at 2 devices
            const alreadyExists = (user.credentials || []).some((c) => {
                const storedId = Buffer.isBuffer(c.credentialID) ? c.credentialID : Buffer.from(c.credentialID?.buffer ?? c.credentialID);
                return Buffer.compare(storedId, extractedCredential.credentialID) === 0;
            });
            if (alreadyExists) {
                await user.save();
                return sendWebAuthnError(res, 409, "CREDENTIAL_ALREADY_REGISTERED", "This device is already registered.");
            }
            if (user.credentials && user.credentials.length >= MAX_PASSKEY_DEVICES) {
                await user.save();
                return sendWebAuthnError(res, 400, "DEVICE_LIMIT_REACHED", `Device limit reached (${MAX_PASSKEY_DEVICES}). Remove one to add another.`);
            }

            const cred = {
                credentialID: extractedCredential.credentialID,
                publicKey: extractedCredential.publicKey,
                counter: extractedCredential.counter,
                transports: body.response.transports || extractedCredential.transports || [],
                nickname: nickname?.slice(0, 50) || `Device ${ (user.credentials?.length || 0) + 1 }`,
                lastUsed: new Date()
            };

            user.credentials.push(cred);
            user.isBiometricEnabled = true;

            await logSecurityEvent(req, user._id, "Biometric Registration", "Success", `Passkey added (${cred.nickname})`);

            if (completeLogin && (decoded?.stage === AUTH_FLOW_STAGES.OTP_VERIFIED || decoded?.stage === AUTH_FLOW_STAGES.PASSWORD_VERIFIED)) {
                const session = await createSession(user, req);
                return res.json({ verified: true, ...session });
            }

            let nextPendingAuthToken;
            if (decoded?.stage === AUTH_FLOW_STAGES.SETUP_VERIFIED) {
                nextPendingAuthToken = await issuePendingAuthToken(user, req, AUTH_FLOW_STAGES.SETUP_VERIFIED);
            } else {
                await user.save();
            }
            res.json({
                verified: true,
                user: buildAuthUser(user, req),
                pendingAuthToken: nextPendingAuthToken
            });
        } else {
            await user.save();
            sendWebAuthnError(res, 400, "WEBAUTHN_VERIFICATION_FAILED", "Biometric registration verification failed. Retry to continue.");
        }
    } catch (err) {
        if (err?.status && err?.code?.startsWith?.("AUTH_FLOW_")) {
            return sendAuthFlowError(res, err.status || 401, err.code, err.message);
        }
        const classified = classifyWebAuthnError(err, "Biometric registration verification failed. Retry or use OTP.");
        console.error("WebAuthn Verify Reg Error:", {
            requestId: req.id,
            code: classified.code,
            message: err?.message || err
        });
        sendWebAuthnError(res, classified.status, classified.code, classified.msg, classified.detail);
    }
};

exports.authOptions = async (req, res) => {
    try {
        if (!ensureAuthRuntimeAvailable(res)) return;
        const { rpID, origin } = resolveWebAuthnConfig(req);
        if (!rpID || !origin) {
            return sendWebAuthnUnavailable(res, "Biometric authentication temporarily unavailable. Use OTP instead.");
        }
        const { userId, pendingAuthToken } = req.body;
        const { user } = await resolveAuthFlowUser(req, {
            pendingAuthToken,
            userId,
            allowedStages: [AUTH_FLOW_STAGES.PASSWORD_VERIFIED, AUTH_FLOW_STAGES.OTP_VERIFIED],
            allowSessionUser: true
        });
        
        const creds = user.credentials;

        if (!creds || creds.length === 0) {
            return sendWebAuthnError(res, 404, "NO_PASSKEY_REGISTERED", "No biometric credentials found for this user");
        }

        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials: creds.map(cred => ({
                id: encodeCredentialId(cred.credentialID),
                transports: cred.transports,
            })),
            userVerification: 'required',
        });

        const now = new Date();
        user.authChallenge = options.challenge;
        user.authChallengeAt = now;
        await user.save();

        res.json(options);
    } catch (err) {
        if (err?.code?.startsWith?.("AUTH_FLOW_")) {
            return sendAuthFlowError(res, err.status || 401, err.code, err.message);
        }
        console.error("WebAuthn Auth Options Error:", {
            requestId: req.id,
            message: err?.message || err
        });
        res.status(503).json({ code: "WEBAUTHN_UNAVAILABLE", msg: "Biometric authentication temporarily unavailable. Use OTP or retry." });
    }
};

exports.verifyAuth = async (req, res) => {
    try {
        if (!ensureAuthRuntimeAvailable(res)) return;
        const { rpID, origin, origins, rpIDs } = resolveWebAuthnConfig(req);
        if (!rpID || !origin) {
            return sendWebAuthnUnavailable(res, "Biometric authentication temporarily unavailable. Use OTP instead.");
        }
        const { userId, pendingAuthToken } = req.body;
        const body = requirePlainObject(req.body?.body, "INVALID_BIOMETRIC_PAYLOAD", "Invalid biometric response payload");
        const { user } = await resolveAuthFlowUser(req, {
            pendingAuthToken,
            userId,
            allowedStages: [AUTH_FLOW_STAGES.PASSWORD_VERIFIED, AUTH_FLOW_STAGES.OTP_VERIFIED],
            allowSessionUser: true
        });

        const expectedChallenge = user.authChallenge;
        const issuedAt = user.authChallengeAt || new Date(0);
        const isExpired = Date.now() - issuedAt.getTime() > 5 * 60 * 1000; // 5 minutes
        if (!expectedChallenge || isExpired) {
            // Atomic — avoids Mongoose VersionError from concurrent __v increments
            await User.findByIdAndUpdate(user._id, { $set: { authChallenge: null, authChallengeAt: null } });
            return sendWebAuthnError(res, 400, "WEBAUTHN_CHALLENGE_EXPIRED", "Challenge expired. Restart login.");
        }
        if (!body?.id) {
            await User.findByIdAndUpdate(user._id, { $set: { authChallenge: null, authChallengeAt: null } });
            return sendWebAuthnError(res, 400, "INVALID_BIOMETRIC_PAYLOAD", "Invalid biometric response payload");
        }

        const creds = user.credentials;
        const credentialId = decodeCredentialId(body.id);
        const credIndex = creds.findIndex((c) => {
            const storedId = Buffer.isBuffer(c.credentialID)
                ? c.credentialID
                : Buffer.from(c.credentialID?.buffer ?? c.credentialID);
            return credentialId.equals(storedId);
        });

        if (credIndex === -1) {
            await User.findByIdAndUpdate(user._id, { $set: { authChallenge: null, authChallengeAt: null } });
            return sendWebAuthnError(res, 404, "CREDENTIAL_NOT_FOUND", "Credential not found");
        }

        const dbCred = creds[credIndex];

        let verification;
        try {
            const expectedOrigin = origins.length > 0 ? origins : origin;
            const expectedRPID = rpIDs.length > 0 ? rpIDs : rpID;
            // Mongoose stores Buffer fields as BSON Binary — unwrap to raw Buffer for @simplewebauthn/server
            const rawPublicKey = Buffer.isBuffer(dbCred.publicKey)
                ? dbCred.publicKey
                : Buffer.from(dbCred.publicKey?.buffer ?? dbCred.publicKey);
            const rawCredentialID = Buffer.isBuffer(dbCred.credentialID)
                ? dbCred.credentialID
                : Buffer.from(dbCred.credentialID?.buffer ?? dbCred.credentialID);
            verification = await verifyAuthenticationResponse({
                response: body,
                expectedChallenge,
                expectedOrigin,
                expectedRPID,
                credential: {
                    id: encodeCredentialId(rawCredentialID),
                    publicKey: rawPublicKey,
                    counter: dbCred.counter,
                    transports: dbCred.transports,
                },
            });
        } catch (error) {
            await User.findByIdAndUpdate(user._id, { $set: { authChallenge: null, authChallengeAt: null } });
            throw error;
        }

        if (verification.verified) {
            const newCounter = verification.authenticationInfo.newCounter;

            // Atomically clear challenge + update credential counter — no __v conflict
            await User.findByIdAndUpdate(user._id, {
                $set: {
                    authChallenge: null,
                    authChallengeAt: null,
                    [`credentials.${credIndex}.counter`]: newCounter,
                    [`credentials.${credIndex}.lastUsed`]: new Date(),
                }
            });

            await logSecurityEvent(req, user._id, "Biometric Authentication", "Success", `Credential ${dbCred.nickname || "Device"} verified`);

            // Re-fetch with fresh __v so createSession.save() succeeds
            const freshUser = await User.findById(user._id);
            const session = await createSession(freshUser, req);

            res.json({ verified: true, ...session });
        } else {
            await User.findByIdAndUpdate(user._id, { $set: { authChallenge: null, authChallengeAt: null } });
            sendWebAuthnError(res, 400, "WEBAUTHN_VERIFICATION_FAILED", "Biometric authentication verification failed. Retry to continue.");
        }
    } catch (err) {
        if (err?.status && err?.code?.startsWith?.("AUTH_FLOW_")) {
            return sendAuthFlowError(res, err.status || 401, err.code, err.message);
        }
        const classified = classifyWebAuthnError(err, "Biometric authentication failed. Retry or use OTP.");
        console.error("WebAuthn Verify Auth Error:", {
            requestId: req.id,
            code: classified.code,
            message: err?.message || err
        });
        sendWebAuthnError(res, classified.status, classified.code, classified.msg, classified.detail);
    }
};

exports.removeBiometrics = async (req, res) => {
    try {
        const userId = requireObjectId(req.body?.userId, "INVALID_USER_ID", "Valid userId is required");
        const user = await User.findById(userId);
        if (!ensureSecurityAccess(req, res, user)) return;

        user.credentials = [];
        user.isBiometricEnabled = false;
        clearRegistrationChallenge(user);
        clearAuthChallenge(user);
        user.authFlowVersion = (user.authFlowVersion || 0) + 1;
        await user.save();
        await logSecurityEvent(req, userId, "Biometric Reset", "Success", "All biometric credentials removed");

        res.json({ msg: "Biometric credentials revoked successfully" });
    } catch (err) {
        if (err?.status && err?.code) {
            return res.status(err.status).json({ code: err.code, msg: err.message });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Remove Biometrics Error",
            msg: "Unable to remove biometric access right now"
        });
    }
};

// List registered WebAuthn credentials (up to 2)
exports.listCredentials = async (req, res) => {
    try {
        const userId = requireObjectId(req.params?.userId, "INVALID_USER_ID", "Valid userId is required");
        const user = await User.findById(userId);
        if (!ensureSecurityAccess(req, res, user)) return;

        const creds = (user.credentials || []).map((c, idx) => ({
            id: encodeCredentialId(c.credentialID),
            transports: c.transports,
            counter: c.counter,
            index: idx,
            nickname: c.nickname || `Device ${idx + 1}`,
            lastUsed: c.lastUsed || user.updatedAt
        }));
        res.json({ credentials: creds });
    } catch (err) {
        if (err?.status && err?.code) {
            return res.status(err.status).json({ code: err.code, msg: err.message });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "List Credentials Error",
            msg: "Unable to load registered devices right now"
        });
    }
};

// Remove a single WebAuthn credential by id (base64)
exports.removeCredential = async (req, res) => {
    try {
        const userId = requireObjectId(req.body?.userId, "INVALID_USER_ID", "Valid userId is required");
        const credentialId = requireTrimmedString(req.body?.credentialId, "INVALID_CREDENTIAL_ID", "credentialId required");
        const user = await User.findById(userId);
        if (!ensureSecurityAccess(req, res, user)) return;

        const target = decodeCredentialId(credentialId);
        const removedCredential = (user.credentials || []).find(c => c.credentialID.equals(target));
        if (!removedCredential) {
            return sendWebAuthnError(res, 404, "CREDENTIAL_NOT_FOUND", "Credential not found");
        }
        user.credentials = (user.credentials || []).filter(c => !c.credentialID.equals(target));
        if (user.credentials.length === 0) {
            user.isBiometricEnabled = false;
        }
        clearRegistrationChallenge(user);
        clearAuthChallenge(user);
        user.authFlowVersion = (user.authFlowVersion || 0) + 1;
        await user.save();
        await logSecurityEvent(req, userId, "Credential Removal", "Success", `Passkey removed (${removedCredential.nickname || "Device"})`);
        res.json({ msg: "Credential removed", remaining: user.credentials.length });
    } catch (err) {
        if (err?.status && err?.code) {
            return res.status(err.status).json({ code: err.code, msg: err.message });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Remove Credential Error",
            msg: "Unable to remove this registered device right now"
        });
    }
};

// Rename a credential
exports.renameCredential = async (req, res) => {
    try {
        const userId = requireObjectId(req.body?.userId, "INVALID_USER_ID", "Valid userId is required");
        const credentialId = requireTrimmedString(req.body?.credentialId, "INVALID_CREDENTIAL_ID", "credentialId required");
        const nickname = requireTrimmedString(req.body?.nickname, "INVALID_NICKNAME", "nickname required").slice(0, 50);
        const user = await User.findById(userId);
        if (!ensureSecurityAccess(req, res, user)) return;

        const target = decodeCredentialId(credentialId);
        const cred = (user.credentials || []).find(c => c.credentialID.equals(target));
        if (!cred) return sendWebAuthnError(res, 404, "CREDENTIAL_NOT_FOUND", "Credential not found");

        cred.nickname = nickname.slice(0, 50);
        await user.save();
        await logSecurityEvent(req, userId, "Credential Rename", "Success", `Passkey renamed to ${cred.nickname}`);
        res.json({ msg: "Credential renamed", nickname: cred.nickname });
    } catch (err) {
        if (err?.status && err?.code) {
            return res.status(err.status).json({ code: err.code, msg: err.message });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Rename Credential Error",
            msg: "Unable to rename this registered device right now"
        });
    }
};

exports.getSecurityLogs = async (req, res) => {
    try {
        const userId = requireObjectId(req.params?.userId, "INVALID_USER_ID", "Valid userId is required");
        const user = await User.findById(userId);
        if (!ensureSecurityAccess(req, res, user)) return;

        res.json(user.securityLogs.slice().reverse());
    } catch (err) {
        if (err?.status && err?.code) {
            return res.status(err.status).json({ code: err.code, msg: err.message });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Get Security Logs Error",
            msg: "Unable to load security activity right now"
        });
    }
};

exports.updateSecuritySettings = async (req, res) => {
    try {
        const userId = requireObjectId(req.body?.userId, "INVALID_USER_ID", "Valid userId is required");
        const biometricProvided = hasOwn(req.body, "isBiometricEnabled");
        const twoFactorProvided = hasOwn(req.body, "isTwoFactorEnabled");
        const faceProvided = hasOwn(req.body, "isFaceAuthEnabled");
        if (!biometricProvided && !twoFactorProvided && !faceProvided) {
            throw createRequestError(400, "NO_SECURITY_CHANGES", "At least one security setting must be provided");
        }

        const isBiometricEnabled = normalizeOptionalBoolean(req.body?.isBiometricEnabled, "isBiometricEnabled", "INVALID_BIOMETRIC_SETTING");
        const isTwoFactorEnabled = normalizeOptionalBoolean(req.body?.isTwoFactorEnabled, "isTwoFactorEnabled", "INVALID_2FA_SETTING");
        const isFaceAuthEnabled = normalizeOptionalBoolean(req.body?.isFaceAuthEnabled, "isFaceAuthEnabled", "INVALID_FACE_AUTH_SETTING");
        const user = await User.findById(userId);
        if (!ensureSecurityAccess(req, res, user)) return;

        if (biometricProvided && isBiometricEnabled) {
            if (!isWebAuthnConfigured()) {
                throw createRequestError(409, "WEBAUTHN_UNAVAILABLE", "Passkeys are unavailable until RP_ID and ORIGIN are configured");
            }
            if (!Array.isArray(user.credentials) || user.credentials.length === 0) {
                throw createRequestError(409, "PASSKEY_REQUIRED", "Register at least one passkey before enabling biometric protection");
            }
        }
        if (faceProvided && isFaceAuthEnabled && !isFaceEnrolled(user)) {
            throw createRequestError(409, "FACE_AUTH_NOT_ENROLLED", "Enroll face authentication before enabling it.");
        }

        if (biometricProvided) user.isBiometricEnabled = isBiometricEnabled;
        if (twoFactorProvided) user.isTwoFactorEnabled = isTwoFactorEnabled;
        if (faceProvided) {
            user.faceAuth = {
                ...(user.faceAuth || {}),
                enabled: Boolean(isFaceAuthEnabled),
                threshold: Number(user.faceAuth?.threshold || getFaceThreshold())
            };
        }
        await user.save();
        await logSecurityEvent(req, userId, "Settings Update", "Success", "MFA toggles modified");

        res.json({
            msg: "Security settings updated",
            webAuthnAvailable: isWebAuthnConfigured(),
            needsTotpEnrollment: Boolean(twoFactorProvided && isTwoFactorEnabled && !user.twoFactorSecret),
            settings: {
                isBiometricEnabled: user.isBiometricEnabled,
                isTwoFactorEnabled: user.isTwoFactorEnabled,
                isFaceAuthEnabled: Boolean(user.faceAuth?.enabled),
                hasFaceAuth: isFaceEnrolled(user),
                deviceCount: user.credentials?.length || 0,
                deviceCap: MAX_PASSKEY_DEVICES
            }
        });
    } catch (err) {
        if (err?.status && err?.code) {
            return res.status(err.status).json({ code: err.code, msg: err.message });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Update Security Settings Error",
            msg: "Unable to update security settings right now"
        });
    }
};

exports.getSecuritySettings = async (req, res) => {
    try {
        const userId = requireObjectId(req.params?.userId, "INVALID_USER_ID", "Valid userId is required");
        const user = await User.findById(userId);
        if (!ensureSecurityAccess(req, res, user)) return;

        let isBiometricEnabled = user ? user.isBiometricEnabled : false;
        let isTwoFactorEnabled = user ? user.isTwoFactorEnabled : false;
        const creds = user ? user.credentials : [];
        const isFaceAuthEnabled = Boolean(user?.faceAuth?.enabled);
        const hasFaceAuth = isFaceEnrolled(user);

        res.json({
            isBiometricEnabled,
            isTwoFactorEnabled,
            isFaceAuthEnabled,
            hasFaceAuth,
            deviceCount: creds.length,
            deviceCap: MAX_PASSKEY_DEVICES,
            webAuthnAvailable: isWebAuthnConfigured(),
            securityTier: (isBiometricEnabled && isTwoFactorEnabled && isFaceAuthEnabled) ? "Sovereign" :
                (isBiometricEnabled && isTwoFactorEnabled) ? "Institutional" :
                (isBiometricEnabled || isTwoFactorEnabled || isFaceAuthEnabled) ? "Hardened" : "Basic"
        });
    } catch (err) {
        if (err?.status && err?.code) {
            return res.status(err.status).json({ code: err.code, msg: err.message });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Get Security Settings Error",
            msg: "Unable to load security settings right now"
        });
    }
};

exports.revokeAllSessions = async (req, res) => {
    try {
        const userId = requireObjectId(req.body?.userId, "INVALID_USER_ID", "Valid userId is required");
        const user = await User.findById(userId);
        if (!ensureSecurityAccess(req, res, user)) return;
        
        user.credentials = [];
        user.isBiometricEnabled = false;
        clearFaceChallenge(user);
        clearFaceLock(user);
        user.sessionVersion = (user.sessionVersion || 0) + 1;
        invalidatePendingAuthFlow(user);
        await user.save();
        await logSecurityEvent(req, userId, "Panic Mode Triggered", "CRITICAL", "Global session revocation", {
            device: "Institutional Emergency Link",
            location: "Remote Command"
        });
        res.json({ msg: "Institutional Lockout Successful. Access keys revoked." });
    } catch (err) {
        if (err?.status && err?.code) {
            return res.status(err.status).json({ code: err.code, msg: err.message });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Revoke All Sessions Error",
            msg: "Unable to revoke sessions right now"
        });
    }
};

exports.getIdentityScore = async (req, res) => {
    try {
        const userId = requireObjectId(req.params?.userId, "INVALID_USER_ID", "Valid userId is required");
        const user = await User.findById(userId);
        if (!ensureSecurityAccess(req, res, user)) return;
        
        let score = 40; // Base Institutional Score
        const deviceCount = user.credentials?.length || 0;
        const has2FA = user.isTwoFactorEnabled;
        const hasBiometric = user.isBiometricEnabled && deviceCount > 0;
        const hasFaceAuth = isFaceEnrolled(user);
        const lastLoginRecent = user.lastLogin && (Date.now() - user.lastLogin.getTime() < 7 * 24 * 60 * 60 * 1000);

        if (has2FA) score += 25;
        if (hasBiometric) score += 25;
        if (hasFaceAuth) score += 20;
        if (deviceCount > 1) score += 5; // Multi-device redundancy
        if (lastLoginRecent) score += 5; // Active health

        let status = "Vulnerable";
        let recommendation = "Enable MFA protocols immediately.";

        if (score >= 90) {
            status = "Fortified";
            recommendation = "System integrity optimal. Periodic audits recommended.";
        } else if (score >= 75) {
            status = "Secure";
            recommendation = "High protection active. Add secondary hardware key for 100%.";
        } else if (score >= 60) {
            status = "Protected";
            recommendation = "Standard MFA active. Enable biometrics for institutional grade.";
        }
        
        res.json({ 
            score, 
            status,
            recommendation,
            telemetry: {
                mfaActive: has2FA,
                biometricActive: hasBiometric,
                faceAuthActive: hasFaceAuth,
                deviceTrust: deviceCount > 0 ? "High" : "None",
                lastAudit: new Date().toISOString()
            }
        });
    } catch (err) {
        if (err?.status && err?.code) {
            return res.status(err.status).json({ code: err.code, msg: err.message });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Get Identity Score Error",
            msg: "Unable to calculate identity score right now"
        });
    }
};
exports.updateProfile = async (req, res) => {
    try {
        const userId = requireObjectId(req.user?.id, "INVALID_USER_ID", "Authenticated user is invalid");
        const updates = {};

        if (hasOwn(req.body, "name")) {
            updates.name = normalizeOptionalProfileText(req.body.name, {
                field: "Name",
                code: "INVALID_NAME",
                maxLength: 80
            });
            if (!updates.name) {
                throw createRequestError(400, "INVALID_NAME", "Name cannot be empty");
            }
        }

        if (hasOwn(req.body, "mobileNo")) {
            updates.mobileNo = normalizeOptionalProfileText(req.body.mobileNo, {
                field: "Mobile number",
                code: "INVALID_MOBILE",
                maxLength: 20,
                pattern: /^[0-9+\-\s()]{7,20}$/
            });
        }

        if (hasOwn(req.body, "aadharNo")) {
            updates.aadharNo = normalizeOptionalProfileText(req.body.aadharNo, {
                field: "Aadhar number",
                code: "INVALID_AADHAR",
                maxLength: 12,
                pattern: /^\d{12}$/
            });
        }

        if (hasOwn(req.body, "profilePhoto")) {
            updates.profilePhoto = normalizeImageUrl(req.body.profilePhoto, {
                field: "Profile photo",
                code: "INVALID_PROFILE_PHOTO"
            });
        }

        if (hasOwn(req.body, "dob")) {
            updates.dob = normalizeOptionalDob(req.body.dob);
        }

        if (Object.keys(updates).length === 0) {
            throw createRequestError(400, "NO_PROFILE_CHANGES", "At least one profile field must be provided");
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        Object.assign(user, updates);

        await user.save();
        await logSecurityEvent(req, userId, "Profile Update", "Success", "Personal details modified");

        res.json({ msg: "Profile updated successfully", user: toSafeUser(user, req) });
    } catch (err) {
        if (err?.status && err?.code) {
            return res.status(err.status).json({ code: err.code, msg: err.message });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Update Profile Error",
            msg: "Unable to update profile right now"
        });
    }
};
