const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");

const MONGO_URI = process.env.MONGO_DIRECT_URI || process.env.MONGO_URI;

async function upgradeSecurity() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        
        console.log("Upgrading 2FA and WebAuthn for all accounts to true...");
        const result = await User.updateMany(
            {}, 
            { 
               $set: { 
                   isTwoFactorEnabled: true, 
                   isBiometricEnabled: true,
                   isFirstLogin: true // Force them to set up their configurations
               } 
            }
        );
        
        console.log(`Successfully upgraded ${result.modifiedCount} accounts.`);
    } catch (error) {
        console.error("Migration Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
    }
}

upgradeSecurity();
