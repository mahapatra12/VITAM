// Enforce HTTPS in production; trust proxy must be enabled.
module.exports = function httpsOnly(req, res, next) {
  if (process.env.NODE_ENV === "production") {
    const proto = req.get("x-forwarded-proto");
    if (proto && proto !== "https") {
      return res.status(400).json({ msg: "HTTPS required" });
    }
  }
  next();
};
