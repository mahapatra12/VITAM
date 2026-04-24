const authMiddleware = require("./authMiddleware");

module.exports = ({ roles = [], subRoles = [] } = {}) => {
    const normalizedRoles = roles.map((role) => String(role || "").toLowerCase());
    const normalizedSubRoles = subRoles.map((subRole) => String(subRole || "").toLowerCase());

    return (req, res, next) => {
        authMiddleware(req, res, () => {
            const currentRole = String(req.user?.role || "").toLowerCase();
            const currentSubRole = String(req.user?.subRole || "").toLowerCase();

            const roleAllowed = normalizedRoles.length > 0 && normalizedRoles.includes(currentRole);
            const subRoleAllowed = normalizedSubRoles.length > 0 && normalizedSubRoles.includes(currentSubRole);

            if (!roleAllowed && !subRoleAllowed) {
                return res.status(403).json({ msg: "Access denied: insufficient institutional privileges" });
            }

            next();
        });
    };
};
