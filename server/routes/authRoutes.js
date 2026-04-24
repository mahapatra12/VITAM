const router = require("express").Router();

const authMiddleware = require("../middleware/authMiddleware");
const optionalAuthMiddleware = require("../middleware/optionalAuthMiddleware");
const { toSafeUser } = require("../utils/safeUser");
const { validate, loginSchema, registerSchema, otpSchema } = require("../utils/validation");

router.use((req, res, next) => {
    res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
        Vary: "Origin, Authorization, x-college-domain"
    });
    next();
});

const { 
    register, 
    login, 
    googleLogin,
    verify2FA, 
    verifyBiometric,
    registerOptions,
    verifyRegistration,
    authOptions,
    verifyAuth,
    bypassBiometric,
    removeBiometrics,
    getSecurityLogs,
    updateSecuritySettings,
    getSecuritySettings,
    getIdentityScore,
    revokeAllSessions,
    completeSetup,
    updateProfile,
    listCredentials,
    removeCredential,
    renameCredential,
    getFaceChallenge,
    enrollFaceAuth,
    verifyFaceAuth,
    getFaceAuthStatus,
    disableFaceAuth,
    authStatus,
    authHealth
} = require("../controllers/authController");

router.get("/profile", authMiddleware, (req, res) => {
    res.json({ message: "Profile access successful", user: toSafeUser(req.user, req) || null });
});
router.get("/status", authStatus);
router.get("/health", authHealth);
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/login/google", googleLogin);
router.post("/verify-2fa", validate(otpSchema), verify2FA);
router.post("/verify-biometric", verifyBiometric);
router.post("/biometric", verifyBiometric); // Alias
router.post("/complete-setup", completeSetup);
router.put("/update-profile", authMiddleware, updateProfile);

// WebAuthn Routes
router.post("/register-options", optionalAuthMiddleware, registerOptions);
router.post("/verify-registration", optionalAuthMiddleware, verifyRegistration);
router.post("/auth-options", optionalAuthMiddleware, authOptions);
router.post("/verify-auth", optionalAuthMiddleware, verifyAuth);
router.post("/bypass-biometric", optionalAuthMiddleware, bypassBiometric);
router.post("/remove-biometrics", authMiddleware, removeBiometrics);
router.get("/credentials/:userId", authMiddleware, listCredentials);
router.post("/remove-credential", authMiddleware, removeCredential);
router.post("/rename-credential", authMiddleware, renameCredential);
router.post("/face/challenge", optionalAuthMiddleware, getFaceChallenge);
router.post("/face/enroll", optionalAuthMiddleware, enrollFaceAuth);
router.post("/face/verify", optionalAuthMiddleware, verifyFaceAuth);
router.get("/face/status/:userId", authMiddleware, getFaceAuthStatus);
router.post("/face/disable", authMiddleware, disableFaceAuth);

// Security Mastery Routes
router.get("/security-logs/:userId", authMiddleware, getSecurityLogs);
router.get("/get-security-settings/:userId", authMiddleware, getSecuritySettings);
router.post("/update-security-settings", authMiddleware, updateSecuritySettings);
router.get("/get-identity-score/:userId", authMiddleware, getIdentityScore);
router.post("/revoke-all-sessions", authMiddleware, revokeAllSessions);

module.exports = router;
