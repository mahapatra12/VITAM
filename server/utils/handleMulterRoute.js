const multer = require("multer");

const createMulterErrorPayload = (req, error, fallbackMsg) => {
    const base = {
        code: "UPLOAD_INVALID",
        msg: fallbackMsg,
        ...(req?.id ? { requestId: req.id } : {})
    };

    if (!(error instanceof multer.MulterError)) {
        return base;
    }

    switch (error.code) {
    case "LIMIT_FILE_SIZE":
        return {
            ...base,
            code: "FILE_TOO_LARGE",
            msg: "Uploaded file exceeds the allowed size"
        };
    case "LIMIT_FILE_COUNT":
    case "LIMIT_UNEXPECTED_FILE":
        return {
            ...base,
            code: "INVALID_FILE_TYPE",
            msg: fallbackMsg
        };
    default:
        return base;
    }
};

const handleMulterRoute = ({ middleware, invalidFileMsg, unexpectedFileMsg }) => (req, res, next) => {
    middleware(req, res, (error) => {
        if (!error) {
            return next();
        }

        const payload = createMulterErrorPayload(req, error, invalidFileMsg);
        if (error instanceof multer.MulterError) {
            return res.status(payload.code === "FILE_TOO_LARGE" ? 413 : 400).json(payload);
        }

        console.error(`${unexpectedFileMsg}${req?.id ? ` [${req.id}]` : ""}:`, error);
        return res.status(500).json({
            code: "UPLOAD_UNAVAILABLE",
            msg: "File processing is unavailable right now",
            ...(req?.id ? { requestId: req.id } : {})
        });
    });
};

module.exports = {
    handleMulterRoute
};
