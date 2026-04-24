const User = require("../models/User");
const bcrypt = require("bcryptjs");
const csv = require("csv-parser");
const { Readable } = require("stream");
const { respondWithServerError } = require("../utils/respondWithServerError");

const MAX_IMPORT_ROWS = Number(process.env.IMPORT_MAX_ROWS || 1000);
const VALID_SUBROLES = new Set(["principal", "vice_principal", "exam", "finance", "placement", "hod", "bus", "none"]);

const normalizeRole = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return null;

    const lowered = raw.toLowerCase();
    if (["superadmin", "admin", "chairman", "director"].includes(lowered)) {
        return lowered;
    }
    if (["faculty", "FACULTY".toLowerCase()].includes(lowered)) {
        return "FACULTY";
    }
    if (["student", "STUDENT".toLowerCase()].includes(lowered)) {
        return "STUDENT";
    }

    return null;
};

const normalizeSubRole = (value) => {
    const normalized = String(value || "none").trim().toLowerCase().replace(/\s+/g, "_");
    return VALID_SUBROLES.has(normalized) ? normalized : null;
};

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const normalizeName = (value) => String(value || "").trim();

const parseCsvBuffer = (buffer) => new Promise((resolve, reject) => {
    const rows = [];
    Readable.from([buffer])
        .pipe(csv())
        .on("data", (data) => {
            rows.push(data);
            if (rows.length > MAX_IMPORT_ROWS) {
                reject(new Error(`CSV row limit exceeded (${MAX_IMPORT_ROWS})`));
            }
        })
        .on("end", () => resolve(rows))
        .on("error", reject);
});

exports.bulkImportUsers = async (req, res) => {
    try {
        if (!req.file?.buffer?.length) {
            return res.status(400).json({
                code: "IMPORT_FILE_REQUIRED",
                msg: "A CSV file is required for bulk import",
                ...(req.id ? { requestId: req.id } : {})
            });
        }

        const results = await parseCsvBuffer(req.file.buffer);
        const errors = [];
        let processed = 0;
        const seenEmails = new Set();

        const salt = await bcrypt.genSalt(10);
        const defaultPassword = await bcrypt.hash("vitam123", salt);

        for (const row of results) {
            const email = normalizeEmail(row.email);
            const role = normalizeRole(row.role);
            const subRole = normalizeSubRole(row.subRole);
            const name = normalizeName(row.name);

            if (!email || !role || !name || !subRole) {
                errors.push({ row: email || "Unknown", msg: "Missing or invalid required fields" });
                continue;
            }

            if (seenEmails.has(email)) {
                errors.push({ row: email, msg: "Duplicate email in import file" });
                continue;
            }
            seenEmails.add(email);

            try {
                const exists = await User.findOne({ email });
                if (exists) {
                    errors.push({ row: email, msg: "User already exists" });
                    continue;
                }

                await User.create({
                    name,
                    email,
                    password: defaultPassword,
                    role,
                    subRole
                });
                processed++;
            } catch (_) {
                errors.push({ row: email, msg: "Unable to import this user" });
            }
        }

        return res.json({
            msg: `Import complete. Processed: ${processed}. Errors: ${errors.length}`,
            errors: errors.length > 0 ? errors : null,
            processed,
            failed: errors.length
        });
    } catch (err) {
        if (String(err?.message || "").includes("CSV row limit exceeded")) {
            return res.status(413).json({
                code: "IMPORT_TOO_LARGE",
                msg: `CSV files may include up to ${MAX_IMPORT_ROWS} rows per import`,
                ...(req.id ? { requestId: req.id } : {})
            });
        }
        return respondWithServerError(req, res, err, {
            logLabel: "Bulk Import Error",
            msg: "Unable to complete bulk import right now"
        });
    }
};
