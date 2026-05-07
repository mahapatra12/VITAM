const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");

const MONGO_URI = process.env.MONGO_DIRECT_URI || process.env.MONGO_URI;

const readArg = (name) => {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : null;
};

const emailArg = readArg("--emails") || readArg("--email") || "";
const emails = String(emailArg)
    .split(/[,\s]+/)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
const forceSetup = process.argv.includes("--force-setup");

async function run() {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is required");
    }
    if (emails.length === 0) {
        throw new Error("Usage: npm run reset:webauthn -- --email user@example.com OR --emails a@example.com,b@example.com");
    }

    await mongoose.connect(MONGO_URI);

    for (const email of emails) {
        const user = await User.findOne({ email });
        if (!user) {
            console.warn(`[WebAuthn Reset] skipped=${email} reason=user-not-found`);
            continue;
        }

        const previousDeviceCount = Array.isArray(user.credentials) ? user.credentials.length : 0;
        user.credentials = [];
        user.isBiometricEnabled = false;
        user.registrationChallenge = undefined;
        user.registrationChallengeAt = undefined;
        user.authChallenge = undefined;
        user.authChallengeAt = undefined;
        user.authFlowVersion = (user.authFlowVersion || 0) + 1;
        if (forceSetup) {
            user.isFirstLogin = true;
        }

        await user.save();

        console.log(`[WebAuthn Reset] ${email}`);
        console.log(`[WebAuthn Reset] removedDevices=${previousDeviceCount}`);
        console.log(`[WebAuthn Reset] passkeyRequired=false`);
        console.log(`[WebAuthn Reset] firstLogin=${Boolean(user.isFirstLogin)}`);
    }
}

run()
    .catch((error) => {
        console.error("[WebAuthn Reset] Failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
