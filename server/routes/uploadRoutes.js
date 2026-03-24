const router = require("express").Router();
const upload = require("../config/upload");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/upload", roleMiddleware(["ADMIN", "FACULTY", "STUDENT"]), upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "No file uploaded" });
  res.json({
    msg: "File uploaded successfully",
    url: req.file.path
  });
});

module.exports = router;
