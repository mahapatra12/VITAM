const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { buildAdminUserSummary } = require("../utils/adminUserSummary");
const { respondWithServerError } = require("../utils/respondWithServerError");

// Helper to check if DB is connected
const isDBConnected = () => mongoose.connection.readyState === 1;
const ADMIN_CREATABLE_ROLES = new Set(["admin", "chairman", "director", "FACULTY", "STUDENT"]);
const ADMIN_SUBROLES = new Set([
    "principal",
    "vice_principal",
    "exam",
    "finance",
    "placement",
    "hod",
    "bus",
    "none"
]);

const normalizeRole = (value) => {
    const lowered = String(value || "").trim().toLowerCase();
    if (["admin", "chairman", "director"].includes(lowered)) return lowered;
    if (lowered === "faculty") return "FACULTY";
    if (lowered === "student") return "STUDENT";
    return null;
};

const normalizeSubRole = (value) => {
    const normalized = String(value || "none").trim().toLowerCase().replace(/\s+/g, "_");
    return ADMIN_SUBROLES.has(normalized) ? normalized : null;
};

const generateTemporaryPassword = () => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";
    let out = "";
    for (let i = 0; i < 12; i += 1) {
        out += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return out;
};

const resolveScopedCollegeId = (req) => {
    if (req.user?.collegeId) return req.user.collegeId;
    if (req.tenant?.id) return req.tenant.id;
    return undefined;
};

exports.getUsers = async (req, res) => {
    try {
        if (!isDBConnected()) {
            return res.json([
                { _id: "1", name: "System Admin", email: "admin@vitam.edu", role: "ADMIN", hasBiometrics: true },
                { _id: "2", name: "Dr. John Smith", email: "hod@vitam.edu", role: "HOD", hasBiometrics: false },
                { _id: "3", name: "Prof. Sarah Jane", email: "faculty@vitam.edu", role: "FACULTY", hasBiometrics: false },
                { _id: "4", name: "Alex Rivera", email: "student@vitam.edu", role: "STUDENT", hasBiometrics: true }
            ]);
        }
        const query = {};
        const scopedCollegeId = resolveScopedCollegeId(req);
        if (scopedCollegeId) {
            query.collegeId = scopedCollegeId;
        }

        const requestedLimit = Number.parseInt(String(req.query?.limit || ""), 10);
        const limit = Number.isFinite(requestedLimit)
            ? Math.max(1, Math.min(requestedLimit, 500))
            : 200;

        const users = await User.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    email: 1,
                    role: 1,
                    subRole: 1,
                    lastLogin: 1,
                    isTwoFactorEnabled: 1,
                    isBiometricEnabled: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    hasBiometrics: {
                        $gt: [
                            { $size: { $ifNull: ["$credentials", []] } },
                            0
                        ]
                    }
                }
            }
        ]);

        const usersWithSecurity = users.map((entry) => ({
            id: entry._id,
            _id: entry._id,
            name: entry.name,
            email: entry.email,
            role: entry.role,
            subRole: entry.subRole || "none",
            lastLogin: entry.lastLogin || null,
            isTwoFactorEnabled: Boolean(entry.isTwoFactorEnabled),
            isBiometricEnabled: Boolean(entry.isBiometricEnabled),
            hasBiometrics: Boolean(entry.hasBiometrics),
            createdAt: entry.createdAt || null,
            updatedAt: entry.updatedAt || null
        }));
        res.json(usersWithSecurity);
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Get Users Error",
            msg: "Unable to load users right now"
        });
    }
};

exports.createUser = async (req, res) => {
    try {
        if (!isDBConnected()) {
            return res.status(503).json({
                code: "DATABASE_UNAVAILABLE",
                msg: "Database is warming up. Please retry in a few seconds."
            });
        }

        const name = String(req.body?.name || "").trim();
        const email = String(req.body?.email || "").trim().toLowerCase();
        const role = normalizeRole(req.body?.role);
        const requestedSubRole = normalizeSubRole(req.body?.subRole);
        const inputPassword = String(req.body?.password || "").trim();
        const wantsAutoPassword = req.body?.autoGeneratePassword !== false;

        if (!name || name.length < 2 || name.length > 80) {
            return res.status(400).json({
                code: "INVALID_NAME",
                msg: "Name must be between 2 and 80 characters."
            });
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({
                code: "INVALID_EMAIL",
                msg: "A valid email address is required."
            });
        }

        if (!role || !ADMIN_CREATABLE_ROLES.has(role)) {
            return res.status(400).json({
                code: "INVALID_ROLE",
                msg: "Please choose a valid role for this account."
            });
        }

        const subRole = role === "admin" ? (requestedSubRole || "none") : "none";
        if (role === "admin" && !subRole) {
            return res.status(400).json({
                code: "INVALID_SUB_ROLE",
                msg: "Please choose a valid admin sub-role."
            });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({
                code: "EMAIL_ALREADY_EXISTS",
                msg: "A user with this email already exists."
            });
        }

        const plainPassword = inputPassword || (wantsAutoPassword ? generateTemporaryPassword() : "");
        if (!plainPassword || plainPassword.length < 6) {
            return res.status(400).json({
                code: "INVALID_PASSWORD",
                msg: "Password must be at least 6 characters."
            });
        }

        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        const scopedCollegeId = resolveScopedCollegeId(req);

        const created = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            subRole,
            isFirstLogin: true,
            isTwoFactorEnabled: false,
            isBiometricEnabled: false,
            ...(scopedCollegeId ? { collegeId: scopedCollegeId } : {})
        });

        return res.status(201).json({
            msg: "User account created successfully.",
            user: buildAdminUserSummary(created),
            provisionedPassword: inputPassword ? null : plainPassword
        });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Create User Error",
            msg: "Unable to create user right now"
        });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        res.json({
            totalStudents: '1,284',
            activeFaculty: '84',
            atRiskStudents: '12',
            enrollmentGrowth: '15%'
        });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Get Admin Stats Error",
            msg: "Unable to load admin statistics right now"
        });
    }
};
exports.seedTelemetry = async (req, res) => {
    try {
        const seedDatabase = require("../seed");
        const result = await seedDatabase();
        if (result?.skipped) {
            return res.json({
                msg: "Seed skipped because existing institutional data is already present.",
                skipped: true,
                users: result.users
            });
        }
        res.json({
            msg: "Institutional telemetry seeded successfully.",
            seeded: true,
            users: result?.users || 0
        });
    } catch (err) {
        return respondWithServerError(req, res, err, {
            logLabel: "Manual Seeding Error",
            msg: "Unable to seed telemetry right now"
        });
    }
};
