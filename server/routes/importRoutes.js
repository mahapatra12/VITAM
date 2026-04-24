const router = require("express").Router();
const upload = require("../config/importUpload");
const roleMiddleware = require("../middleware/roleMiddleware");
const { bulkImportUsers } = require("../controllers/importController");
const { handleMulterRoute } = require("../utils/handleMulterRoute");

const importSingle = handleMulterRoute({
    middleware: upload.single("file"),
    invalidFileMsg: "Only CSV files are allowed for bulk import",
    unexpectedFileMsg: "Import Upload Route Error"
});

router.post("/bulk", roleMiddleware(["ADMIN"]), importSingle, bulkImportUsers);

module.exports = router;
