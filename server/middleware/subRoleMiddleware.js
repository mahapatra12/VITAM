const authMiddleware = require("./authMiddleware");

module.exports = (subRoles = []) => {
    return (req, res, next) => {
        authMiddleware(req, res, () => {
            const normalizedAllowedSubRoles = subRoles.map((subRole) => String(subRole || "").toLowerCase());
            const currentSubRole = String(req.user?.subRole || "").toLowerCase();

            if (normalizedAllowedSubRoles.length && !normalizedAllowedSubRoles.includes(currentSubRole)) {
                return res.status(403).json({ msg: "Access denied: insufficient administrative privileges" });
            }

            next();
        });
    };
};
