const mongoose = require("mongoose");

const normalizeRole = (role) => String(role || "").trim().toLowerCase();

const resolveScopedStudentId = (req, requestedId) => {
    const normalizedId = String(requestedId || "").trim();
    if (!mongoose.Types.ObjectId.isValid(normalizedId)) {
        return {
            ok: false,
            status: 400,
            body: {
                code: "INVALID_STUDENT_ID",
                msg: "A valid studentId is required",
                ...(req?.id ? { requestId: req.id } : {})
            }
        };
    }

    const currentRole = normalizeRole(req?.user?.role);
    const currentUserId = String(req?.user?.id || "").trim();

    if (currentRole === "student" && currentUserId && currentUserId !== normalizedId) {
        return {
            ok: false,
            status: 403,
            body: {
                code: "STUDENT_SCOPE_FORBIDDEN",
                msg: "Students can only access their own records",
                ...(req?.id ? { requestId: req.id } : {})
            }
        };
    }

    return {
        ok: true,
        studentId: normalizedId
    };
};

module.exports = {
    resolveScopedStudentId
};
