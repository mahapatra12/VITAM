const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");
const { repairDuplicateTotpSecrets } = require("../utils/totpProvisioning");

const MONGO_URI = process.env.MONGO_DIRECT_URI || process.env.MONGO_URI;
const forceEnrollment = !process.argv.includes("--keep-active");

async function run() {
    if (!MONGO_URI) {
        throw new Error("MONGO_URI is required to repair 2FA secrets");
    }

    await mongoose.connect(MONGO_URI);
    const result = await repairDuplicateTotpSecrets({ User, forceEnrollment });

    console.log(`[2FA Repair] scanned=${result.scanned} repaired=${result.repaired}`);
    if (result.repairedEmails.length > 0) {
        console.log("[2FA Repair] Users requiring fresh authenticator pairing:");
        result.repairedEmails.forEach((email) => console.log(`- ${email}`));
    } else {
        console.log("[2FA Repair] No duplicate or legacy TOTP secrets found.");
    }
}

run()
    .catch((error) => {
        console.error("[2FA Repair] Failed:", error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
