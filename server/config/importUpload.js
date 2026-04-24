const multer = require("multer");
const path = require("path");

const MAX_IMPORT_FILE_SIZE = Number(process.env.IMPORT_MAX_FILE_BYTES || 2 * 1024 * 1024);
const CSV_MIME_TYPES = new Set([
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
    "text/plain"
]);

const importUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_IMPORT_FILE_SIZE,
        files: 1
    },
    fileFilter: (_req, file, callback) => {
        const extension = path.extname(file.originalname || "").toLowerCase();
        const mimeType = String(file.mimetype || "").toLowerCase();
        if (extension !== ".csv" || !CSV_MIME_TYPES.has(mimeType)) {
            return callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "file"));
        }
        return callback(null, true);
    }
});

module.exports = importUpload;
