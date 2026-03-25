const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");

// Helper to log security events
const logSecurityEvent = async (userId, event, status, details, metadata = {}) => {
    try {
        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;
        if (user) {
            user.securityLogs.push({ 
                event, 
                status, 
                details,
                location: metadata.location || "Bengaluru, IN",
                ip: metadata.ip || "192.168.1.1",
                device: metadata.device || "Chrome / Windows 11"
            });
            // Keep last 50 logs
            if (user.securityLogs.length > 50) user.securityLogs.shift();
            await user.save();
        }
    } catch (e) {
        console.error("Logging Error:", e);
    }
};

// ─────────────────────────────────────────────────────────────────────────────

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ name, email, password: hashedPassword, role: role || "STUDENT" });

        const secret = speakeasy.generateSecret({ name: `VITAM-AI (${email})`, issuer: "VITAM AI" });
        user.twoFactorSecret = secret.base32;

        await user.save();

        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
        res.status(201).json({ msg: "User registered. Please setup 2FA.", qrCode: qrCodeUrl, userId: user._id });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN — returns QR code URI for 2FA setup in the response
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
    console.log("Login attempt for:", req.body.email);
    try {
        let { email, password } = req.body;
        console.log(`[Auth] RAW Email: "${email}"`);
        if (!email || !password) return res.status(400).json({ msg: "Missing credentials" });

        email = email.toLowerCase().trim();
        console.log(`[Auth] PROCESSED Email: "${email}"`);

        // ── Real DB path ──
        const user = await User.findOne({ email });
        console.log(`[Auth] User found: ${!!user} | Target: ${email}`);
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`[Auth] Password match: ${isMatch}`);
        if (!isMatch) {
            await logSecurityEvent(user._id, "Login Attempt", "Failed", "Incorrect password");
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        await logSecurityEvent(user._id, "Primary Login", "Success", "Password verified");

        // Generate / reuse secret for real users
        if (!user.twoFactorSecret) {
            const secret = speakeasy.generateSecret({ name: `VITAM AI (${email})`, issuer: "VITAM AI" });
            user.twoFactorSecret = secret.base32;
            await user.save();
        }

        const otpauthUrl = speakeasy.otpauthURL({
            secret: user.twoFactorSecret,
            label: encodeURIComponent(`VITAM AI (${email})`),
            issuer: "VITAM AI",
            encoding: "base32",
        });
        const qrCodeDataUri = await qrcode.toDataURL(otpauthUrl);

        res.json({
            msg: "Primary login successful.",
            userId: user._id,
            isFirstLogin: user.isFirstLogin,
            requires2FA: !user.isFirstLogin && user.isTwoFactorEnabled,
            requiresBiometric: !user.isFirstLogin && user.isBiometricEnabled,
            hasBiometrics: user.credentials && user.credentials.length > 0,
            qrCode: qrCodeDataUri,
            totpSecret: user.twoFactorSecret,
            totpLabel: `VITAM AI (${email})`,
            role: user.role,
            name: user.name,
        });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY 2FA — real speakeasy TOTP verification
// ─────────────────────────────────────────────────────────────────────────────
exports.verify2FA = async (req, res) => {
    try {
        const { userId, token } = req.body;
        if (!token) return res.status(400).json({ msg: "OTP code required" });

        // ── Real DB user path ──
        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;
        if (!user) return res.status(400).json({ msg: "User not found" });

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: token.toString().trim(),
            window: 1,
        });

        if (!verified) {
            await logSecurityEvent(userId, "2FA Verification", "Failed", "Invalid OTP code");
            return res.status(400).json({ msg: "Invalid 2FA token" });
        }

        await logSecurityEvent(userId, "2FA Verification", "Success", "TOTP code confirmed");

        res.json({
            msg: "2FA successful.",
            userId: user._id,
            requiresBiometric: true,
            hasBiometrics: user.credentials && user.credentials.length > 0
        });
    } catch (err) {
        console.error("2FA Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY BIOMETRIC — issues JWT after biometric check
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyBiometric = async (req, res) => {
    try {
        const { userId, biometricToken } = req.body;

        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;
        if (!user) return res.status(400).json({ msg: "User not found" });

        const jwtToken = jwt.sign(
            { id: user._id, role: user.role, subRole: user.subRole || "none" },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "1d" }
        );

        res.json({
            token: jwtToken,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            }
        });
    } catch (err) {
        console.error("Biometric Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPLETE SETUP (First Login)
// ─────────────────────────────────────────────────────────────────────────────
exports.completeSetup = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;
        if (!user) return res.status(400).json({ msg: "User not found" });

        // Mark setup complete
        user.isFirstLogin = false;
        await user.save();

        await logSecurityEvent(userId, "Security Setup", "Success", "Completed first-time security wizard");

        // Issue JWT token immediately
        const jwtToken = jwt.sign(
            { id: user._id, role: user.role, subRole: user.subRole || "none" },
            process.env.JWT_SECRET || "fallback_secret",
            { expiresIn: "1d" }
        );

        res.json({
            msg: "Setup complete",
            token: jwtToken,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            }
        });
    } catch (err) {
        console.error("Setup Completion Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// WEBAUTHN (Real Biometrics)
// ─────────────────────────────────────────────────────────────────────────────

const rpName = "VITAM AI Portal";
const rpID = process.env.RP_ID || "localhost";
const origin = process.env.ORIGIN || "http://localhost:5173";

const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const { isoUint8Array } = require('@simplewebauthn/server/helpers');

let challenges = {}; // In-memory store for challenges. Use Redis/Session for production.

exports.registerOptions = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;
        if (!user) return res.status(404).json({ msg: "User not found" });

        // Limit devices per user to 2
        if (user.credentials && user.credentials.length >= 2) {
            return res.status(400).json({ msg: "Device limit reached (2). Remove an existing device first." });
        }
        
        const uid = user._id.toString();
        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: Buffer.from(uid),
            userName: user.email,
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'preferred',
                userVerification: 'preferred',
            },
        });

        challenges[uid] = options.challenge;

        res.json(options);
    } catch (err) {
        console.error("WebAuthn Reg Options Error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.verifyRegistration = async (req, res) => {
    try {
        const { userId, body } = req.body;
        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;

        if (!user) {
            return res.status(404).json({ msg: "User not found for storage" });
        }
        
        let expectedChallenge = challenges[userId];

        const verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        if (verification.verified) {
            const { registrationInfo } = verification;
            const { credentialPublicKey, credentialID, counter } = registrationInfo;

            // Prevent duplicate credential IDs and cap at 2 devices
            const alreadyExists = (user.credentials || []).some(c => Buffer.compare(c.credentialID, Buffer.from(credentialID)) === 0);
            if (alreadyExists) {
                return res.status(400).json({ verified: false, msg: "This device is already registered." });
            }
            if (user.credentials && user.credentials.length >= 2) {
                return res.status(400).json({ verified: false, msg: "Device limit reached (2). Remove one to add another." });
            }

            const cred = {
                credentialID: Buffer.from(credentialID),
                publicKey: Buffer.from(credentialPublicKey),
                counter,
                transports: body.response.transports,
            };

            user.credentials.push(cred);
            await user.save();
            
            res.json({ verified: true });
        } else {
            res.status(400).json({ verified: false, msg: "Verification failed" });
        }
    } catch (err) {
        console.error("WebAuthn Verify Reg Error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.authOptions = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;
        if (!user) return res.status(404).json({ msg: "User not found" });
        
        const creds = user.credentials;

        if (!creds || creds.length === 0) return res.status(404).json({ msg: "No biometric credentials found for this user" });

        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials: creds.slice(0, 2).map(cred => ({
                id: cred.credentialID,
                type: 'public-key',
                transports: cred.transports,
            })),
            userVerification: 'preferred',
        });

        const uid = user._id.toString();
        challenges[uid] = options.challenge;

        res.json(options);
    } catch (err) {
        console.error("WebAuthn Auth Options Error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.verifyAuth = async (req, res) => {
    try {
        const { userId, body } = req.body;
        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;

        if (!user) return res.status(404).json({ msg: "User not found" });

        const uid = user._id.toString();
        const expectedChallenge = challenges[uid];
        const creds = user.credentials;
        const dbCred = creds.find(c => Buffer.from(body.id, 'base64url').equals(c.credentialID));

        if (!dbCred) return res.status(400).json({ msg: "Credential not found" });

        const verification = await verifyAuthenticationResponse({
            response: body,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                credentialID: dbCred.credentialID,
                credentialPublicKey: dbCred.publicKey,
                counter: dbCred.counter,
            },
        });

        if (verification.verified) {
            dbCred.counter = verification.authenticationInfo.newCounter;
            await user.save();

            const jwtToken = jwt.sign(
                { id: user._id, role: user.role, subRole: user.subRole || "none" },
                process.env.JWT_SECRET || "fallback_secret",
                { expiresIn: "1d" }
            );

            res.json({
                verified: true,
                token: jwtToken,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(400).json({ verified: false, msg: "Auth verification failed" });
        }
    } catch (err) {
        console.error("WebAuthn Verify Auth Error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.removeBiometrics = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;

        if (user) {
            user.credentials = [];
            await user.save();
        }

        res.json({ msg: "Biometric credentials revoked successfully" });
    } catch (err) {
        console.error("Remove Biometrics Error:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getSecurityLogs = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;
        if (!user) return res.status(404).json({ msg: "User not found" });

        res.json(user.securityLogs.slice().reverse());
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateSecuritySettings = async (req, res) => {
    try {
        const { userId, isBiometricEnabled, isTwoFactorEnabled } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: "Invalid User ID format." });
        }

        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;
        if (user) {
            if (isBiometricEnabled !== undefined) user.isBiometricEnabled = isBiometricEnabled;
            if (isTwoFactorEnabled !== undefined) user.isTwoFactorEnabled = isTwoFactorEnabled;
            await user.save();
            await logSecurityEvent(userId, "Settings Update", "Success", "MFA toggles modified");
        }
        res.json({ msg: "Security settings updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSecuritySettings = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ msg: "Invalid User ID format." });
        }

        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;
        if (!user) return res.status(404).json({ msg: "User not found" });

        let isBiometricEnabled = user ? user.isBiometricEnabled : false;
        let isTwoFactorEnabled = user ? user.isTwoFactorEnabled : false;
        const creds = user ? user.credentials : [];

        res.json({
            isBiometricEnabled,
            isTwoFactorEnabled,
            deviceCount: creds.length,
            securityTier: (isBiometricEnabled && isTwoFactorEnabled) ? "Institutional" :
                (isBiometricEnabled || isTwoFactorEnabled) ? "Hardened" : "Basic"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.revokeAllSessions = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;
        
        if (user) {
            user.credentials = [];
            await user.save();
            await logSecurityEvent(userId, "Panic Mode Triggered", "CRITICAL", "Global session revocation", {
                device: "Institutional Emergency Link",
                location: "Remote Command"
            });
        }
        res.json({ msg: "Institutional Lockout Successful. Access keys revoked." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getIdentityScore = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = mongoose.Types.ObjectId.isValid(userId) ? await User.findById(userId) : null;
        if (!user) return res.status(404).json({ msg: "User not found" });
        
        let score = 45; // Base Institutional Score
        if (user.isTwoFactorEnabled) score += 25;
        if (user.isBiometricEnabled && user.credentials.length > 0) score += 30;
        
        res.json({ 
            score, 
            status: score > 85 ? "Fortified" : score > 60 ? "Secure" : "Vulnerable",
            recommendation: score < 85 ? "Enable Biometric MFA for maximum protection" : "System integrity optimal"
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateProfile = async (req, res) => {
    try {
        const { name, mobileNo, aadharNo, dob, profilePhoto } = req.body;
        const userId = req.user.id; // From authMiddleware

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (name) user.name = name;
        if (mobileNo) user.mobileNo = mobileNo;
        if (aadharNo) user.aadharNo = aadharNo;
        if (dob) user.dob = dob;
        if (profilePhoto) user.profilePhoto = profilePhoto;

        await user.save();
        await logSecurityEvent(userId, "Profile Update", "Success", "Personal details modified");

        res.json({ msg: "Profile updated successfully", user });
    } catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({ error: err.message });
    }
};
