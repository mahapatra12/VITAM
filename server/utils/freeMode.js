const isTrue = (value) => String(value || "").trim().toLowerCase() === "true";

const isHeaderFreeModeAllowed = () => {
    if (isTrue(process.env.ALLOW_FREE_MODE_HEADER)) {
        return true;
    }

    return process.env.NODE_ENV !== "production";
};

const hasValidFreeModeToken = (req) => {
    const expectedToken = String(process.env.FREE_MODE_HEADER_TOKEN || "").trim();
    if (!expectedToken) {
        return false;
    }

    const providedToken = String(req.header("x-free-mode-token") || "").trim();
    return Boolean(providedToken && providedToken === expectedToken);
};

const isRequestFreeMode = (req) => {
    if (isTrue(process.env.FREE_MODE)) {
        return true;
    }

    const wantsFreeMode = isTrue(req.header("x-free-mode"));
    if (!wantsFreeMode) {
        return false;
    }

    if (hasValidFreeModeToken(req)) {
        return true;
    }

    return isHeaderFreeModeAllowed();
};

module.exports = {
    isRequestFreeMode
};
