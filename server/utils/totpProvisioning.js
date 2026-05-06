const speakeasy = require("speakeasy");
const cryptoVault = require("./cryptoVault");

const TOTP_ISSUER = "VITAM AI";
const LEGACY_SHARED_TOTP_SECRET = "JBSWY3DPEHPK3PXP";
const CORE_TOTP_EMAILS = [
    "admin@vitam.edu",
    "chairman@vitam.edu.in",
    "director@vitam.edu.in",
    "principal@vitam.edu.in",
    "viceprincipal@vitam.edu.in",
    "finance@vitam.edu.in",
    "hod@vitam.edu",
    "faculty@vitam.edu",
    "student@vitam.edu"
];

const normalizeTotpSecret = (value) => {
    if (!value) {
        return "";
    }

    const decrypted = cryptoVault.decrypt(String(value));
    if (!decrypted || String(decrypted).startsWith("[REDACTED")) {
        return "";
    }

    return String(decrypted).replace(/\s+/g, "").toUpperCase();
};

const buildTotpLabel = (email) => `${TOTP_ISSUER} (${String(email || "user").trim().toLowerCase()})`;

const generateTotpSecret = (email) => (
    speakeasy.generateSecret({
        name: buildTotpLabel(email),
        issuer: TOTP_ISSUER,
        length: 20
    }).base32
);

const buildTotpAuthUrl = (email, secret) => speakeasy.otpauthURL({
    secret: normalizeTotpSecret(secret),
    label: buildTotpLabel(email),
    issuer: TOTP_ISSUER,
    encoding: "base32"
});

const isLegacySharedTotpSecret = (secret) => normalizeTotpSecret(secret) === LEGACY_SHARED_TOTP_SECRET;

const repairDuplicateTotpSecrets = async ({ User, emails = CORE_TOTP_EMAILS, forceEnrollment = true } = {}) => {
    if (!User) {
        throw new Error("User model is required for TOTP repair");
    }

    const normalizedEmails = emails.map((email) => String(email).trim().toLowerCase()).filter(Boolean);
    const users = await User.find({ email: { $in: normalizedEmails } });
    const secretCounts = new Map();

    users.forEach((user) => {
        const secret = normalizeTotpSecret(user.twoFactorSecret);
        if (!secret) {
            return;
        }
        secretCounts.set(secret, (secretCounts.get(secret) || 0) + 1);
    });

    const repairedEmails = [];

    for (const user of users) {
        const currentSecret = normalizeTotpSecret(user.twoFactorSecret);
        const mustRotate = (
            !currentSecret ||
            isLegacySharedTotpSecret(currentSecret) ||
            (secretCounts.get(currentSecret) || 0) > 1
        );

        if (!mustRotate) {
            continue;
        }

        user.twoFactorSecret = generateTotpSecret(user.email);
        user.isTwoFactorEnabled = true;
        if (forceEnrollment) {
            user.isFirstLogin = true;
        }
        user.authFlowVersion = (user.authFlowVersion || 0) + 1;
        await user.save();
        repairedEmails.push(user.email);
    }

    return {
        scanned: users.length,
        repaired: repairedEmails.length,
        repairedEmails
    };
};

module.exports = {
    TOTP_ISSUER,
    CORE_TOTP_EMAILS,
    LEGACY_SHARED_TOTP_SECRET,
    normalizeTotpSecret,
    buildTotpLabel,
    buildTotpAuthUrl,
    generateTotpSecret,
    isLegacySharedTotpSecret,
    repairDuplicateTotpSecrets
};
