require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const updateAdminPassword = async () => {
    console.log("Connecting to Database...");
    const uri = process.env.MONGO_DIRECT_URI || process.env.MONGO_URI;
    
    if (!uri) {
        console.error("No MONGO_URI found in local .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(uri);
        const User = require('../models/User'); // Load user model dynamically
        
        console.log("Hashing new password: AdminPassword123!* ...");
        const newPasswordHash = await bcrypt.hash('AdminPassword123!*', 10);
        
        const result = await User.updateOne(
            { email: 'admin@vitam.edu' },
            { $set: { password: newPasswordHash } }
        );
        
        if (result.matchedCount > 0) {
            console.log(`✅ Password successfully updated for admin@vitam.edu. (Modified: ${result.modifiedCount})`);
        } else {
            console.log("❌ User admin@vitam.edu not found in the database. Ensure the remote database has been seeded.");
        }
    } catch (err) {
        console.error("Fatal Error during password update:");
        console.error(err);
    } finally {
        await mongoose.disconnect();
        console.log("Database connection closed.");
    }
};

updateAdminPassword();
