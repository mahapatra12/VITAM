const jwt = require("jsonwebtoken");

module.exports = (subRoles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ msg: "No token, authorization denied" });

        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ msg: "Malformed token" });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
            req.user = decoded;

            if (subRoles.length && !subRoles.includes(req.user.subRole)) {
                return res.status(403).json({ msg: "Access denied: insufficient administrative privileges" });
            }

            next();
        } catch (err) {
            res.status(401).json({ msg: "Token is not valid" });
        }
    };
};
