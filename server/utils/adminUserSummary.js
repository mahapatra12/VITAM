const buildAdminUserSummary = (user) => ({
    id: user._id,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    subRole: user.subRole || "none",
    lastLogin: user.lastLogin || null,
    isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled),
    isBiometricEnabled: Boolean(user.isBiometricEnabled),
    hasBiometrics: Array.isArray(user.credentials) && user.credentials.length > 0,
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null
});

module.exports = {
    buildAdminUserSummary
};
