const jwt = require("jsonwebtoken");

module.exports = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ msg: "No token, authorization denied" });

        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ msg: "Malformed token" });

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
            req.user = decoded;

            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ msg: "Access denied: insufficient permissions" });
            }

            next();
        } catch (err) {
            res.status(401).json({ msg: "Token is not valid" });
        }
    };
};
