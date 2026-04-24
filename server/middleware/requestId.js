const { randomUUID } = require("crypto");

module.exports = function requestId(req, res, next) {
    const id = req.header("x-request-id") || randomUUID();
    req.id = id;
    res.setHeader("x-request-id", id);
    next();
};
