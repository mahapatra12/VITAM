const router = require("express").Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const roleMiddleware = require("../middleware/roleMiddleware");
const { bulkImportUsers } = require("../controllers/importController");

router.post("/bulk", roleMiddleware(["ADMIN"]), upload.single("file"), bulkImportUsers);

module.exports = router;
