const Attendance = require("../models/Attendance");
const { respondWithServerError } = require("../utils/respondWithServerError");
const { resolveScopedStudentId } = require("../utils/studentAccess");

const normalizeAttendanceStatus = (value) => {
    if (typeof value === "boolean") {
        return value ? "present" : "absent";
    }

    const normalized = String(value || "").trim().toLowerCase();
    if (!normalized) {
        return "present";
    }

    if (!["present", "absent", "late", "medical"].includes(normalized)) {
        return null;
    }

    return normalized;
};

const normalizeAttendanceMethod = (value) => {
    if (value == null || value === "") {
        return undefined;
    }

    const normalized = String(value).trim().toUpperCase().replace(/[\s-]+/g, "_");
    if (!["FACE_RECOGNITION", "BIOMETRIC", "GEO_FENCING", "QR_SCAN", "MANUAL"].includes(normalized)) {
        return null;
    }

    return normalized;
};

const normalizeLocation = (value) => {
    if (value == null || value === "") {
        return undefined;
    }
    if (typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const latitude = Number(value.latitude);
    const longitude = Number(value.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
    }
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return null;
    }

    return { latitude, longitude };
};

exports.markAttendance = async (req, res) => {
    try {
        const { studentId, courseId, subjectId, status, present, method, location } = req.body;
        const scopedStudent = resolveScopedStudentId(req, studentId);
        if (!scopedStudent.ok) {
            return res.status(scopedStudent.status).json(scopedStudent.body);
        }

        const resolvedSubjectId = String(subjectId || courseId || "").trim();
        if (!resolvedSubjectId) {
            return res.status(400).json({
                code: "INVALID_SUBJECT_ID",
                msg: "A valid subjectId or courseId is required",
                ...(req.id ? { requestId: req.id } : {})
            });
        }

        const normalizedStatus = normalizeAttendanceStatus(status ?? present);
        if (!normalizedStatus) {
            return res.status(400).json({
                code: "INVALID_ATTENDANCE_STATUS",
                msg: "Attendance status must be present, absent, late, or medical",
                ...(req.id ? { requestId: req.id } : {})
            });
        }

        const normalizedMethod = normalizeAttendanceMethod(method);
        if (method != null && normalizedMethod == null) {
            return res.status(400).json({
                code: "INVALID_ATTENDANCE_METHOD",
                msg: "Attendance method must be face recognition, biometric, geo fencing, QR scan, or manual",
                ...(req.id ? { requestId: req.id } : {})
            });
        }

        const normalizedLocation = normalizeLocation(location);
        if (location != null && normalizedLocation == null) {
            return res.status(400).json({
                code: "INVALID_ATTENDANCE_LOCATION",
                msg: "Location must include valid latitude and longitude values",
                ...(req.id ? { requestId: req.id } : {})
            });
        }
        
        const attendance = new Attendance({
            studentId: scopedStudent.studentId,
            subjectId: resolvedSubjectId,
            status: normalizedStatus,
            present: normalizedStatus !== "absent",
            method: normalizedMethod,
            location: normalizedLocation
        });

        await attendance.save();
        res.status(201).json({ msg: "Attendance marked successfully", attendance });
    } catch (err) {
        if (err?.name === "ValidationError") {
            return res.status(400).json({
                code: "INVALID_ATTENDANCE_PAYLOAD",
                msg: "Attendance payload is invalid",
                ...(req.id ? { requestId: req.id } : {})
            });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Mark Attendance Error",
            msg: "Unable to mark attendance right now"
        });
    }
};

exports.getStudentAttendance = async (req, res) => {
    try {
        const scopedStudent = resolveScopedStudentId(req, req.params.studentId);
        if (!scopedStudent.ok) {
            return res.status(scopedStudent.status).json(scopedStudent.body);
        }

        const attendance = await Attendance.find({ studentId: scopedStudent.studentId }).sort({ createdAt: -1 });
        res.json(attendance);
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Get Student Attendance Error",
            msg: "Unable to load attendance right now"
        });
    }
};
