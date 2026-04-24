const respondWithServerError = (req, res, err, options = {}) => {
    const {
        logLabel = "Unexpected Error",
        msg = "Unable to complete request right now",
        code = "INTERNAL_ERROR",
        status = 500
    } = options;

    const requestId = req?.id;
    const label = requestId ? `${logLabel} [${requestId}]` : logLabel;
    console.error(`${label}:`, err);

    return res.status(status).json({
        code,
        msg,
        ...(requestId ? { requestId } : {})
    });
};

module.exports = {
    respondWithServerError
};
