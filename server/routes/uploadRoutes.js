const router = require("express").Router();
const { upload, ensureUploadConfigured } = require("../config/upload");
const roleMiddleware = require("../middleware/roleMiddleware");
const { handleMulterRoute } = require("../utils/handleMulterRoute");

const uploadSingle = handleMulterRoute({
  middleware: upload.single("file"),
  invalidFileMsg: "Only JPG, PNG, PDF, or DOCX files are allowed",
  unexpectedFileMsg: "Upload Route Error"
});

router.post("/upload", roleMiddleware(["ADMIN", "FACULTY", "STUDENT"]), ensureUploadConfigured, uploadSingle, (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      code: "UPLOAD_FILE_REQUIRED",
      msg: "No file uploaded",
      ...(req.id ? { requestId: req.id } : {})
    });
  }

  res.json({
    msg: "File uploaded successfully",
    url: req.file.secure_url || req.file.path,
    originalName: req.file.originalname,
    bytes: req.file.size,
    mimeType: req.file.mimetype
  });
});

module.exports = router;
