const User = require("../models/User");
const bcrypt = require("bcryptjs");
const csv = require("csv-parser");
const fs = require("fs");

exports.bulkImportUsers = async (req, res) => {
    if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

    const results = [];
    const errors = [];
    let processed = 0;

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on("data", (data) => results.push(data))
        .on("end", async () => {
            const salt = await bcrypt.genSalt(10);
            const defaultPassword = await bcrypt.hash("vitam123", salt);

            for (const row of results) {
                try {
                    // Validation
                    if (!row.email || !row.role || !row.name) {
                        errors.push({ row: row.email || "Unknown", msg: "Missing required fields" });
                        continue;
                    }

                    const exists = await User.findOne({ email: row.email });
                    if (exists) {
                        errors.push({ row: row.email, msg: "User already exists" });
                        continue;
                    }

                    await User.create({
                        name: row.name,
                        email: row.email,
                        password: defaultPassword,
                        role: row.role.toUpperCase(),
                        department: row.department || "General",
                        subRole: row.subRole || "none"
                    });
                    processed++;
                } catch (err) {
                    errors.push({ row: row.email, msg: err.message });
                }
            }

            // Cleanup temp file
            fs.unlinkSync(req.file.path);

            res.json({
                msg: `Import complete. Processed: ${processed}. Errors: ${errors.length}`,
                errors: errors.length > 0 ? errors : null
            });
        });
};
