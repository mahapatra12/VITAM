const router = require("express").Router();

const authMiddleware = require("../middleware/authMiddleware");

const { 
    register, 
    login, 
    verify2FA, 
    verifyBiometric,
    registerOptions,
    verifyRegistration,
    authOptions,
    verifyAuth,
    removeBiometrics,
    getSecurityLogs,
    updateSecuritySettings,
    getSecuritySettings,
    getIdentityScore,
    completeSetup,
    updateProfile
} = require("../controllers/authController");

router.get("/profile", authMiddleware, (req, res) => {
    res.json({ message: "Profile access successful", user: req.user || null });
});
router.post("/register", register);
router.post("/login", login);
router.post("/verify-2fa", verify2FA);
router.post("/verify-biometric", verifyBiometric);
router.post("/biometric", verifyBiometric); // Alias
router.post("/complete-setup", completeSetup);
router.put("/update-profile", authMiddleware, updateProfile);

// WebAuthn Routes
router.post("/register-options", registerOptions);
router.post("/verify-registration", verifyRegistration);
router.post("/auth-options", authOptions);
router.post("/verify-auth", verifyAuth);
router.post("/remove-biometrics", removeBiometrics);

// Security Mastery Routes
router.get("/security-logs/:userId", getSecurityLogs);
router.get("/get-security-settings/:userId", getSecuritySettings);
router.post("/update-security-settings", updateSecuritySettings);
router.get("/get-identity-score/:userId", getIdentityScore);

module.exports = router;
