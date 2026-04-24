const authMiddleware = require("./authMiddleware");

module.exports = (roles = []) => {
    return (req, res, next) => {
        authMiddleware(req, res, () => {
            const normalizedAllowedRoles = roles.map((role) => String(role || "").toLowerCase());
            const currentRole = String(req.user?.role || "").toLowerCase();

            if (normalizedAllowedRoles.length && !normalizedAllowedRoles.includes(currentRole)) {
                return res.status(403).json({ msg: "Access denied: insufficient permissions" });
            }

            next();
        });
    };
};
