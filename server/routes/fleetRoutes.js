const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Fleet = require("../models/Fleet");

// Fetch the Institutional Fleet Grid
router.get("/", authMiddleware, async (req, res) => {
    try {
        const query = req.tenant?.id ? { collegeId: req.tenant.id } : {};
        const fleet = await Fleet.find(query).sort({ createdAt: -1 });
        return res.status(200).json(fleet);
    } catch (err) {
        console.error("[Transit Routing Error]", err);
        return res.status(500).json({ msg: "Core Telemetry Failure", details: err.message });
    }
});

// Commission a new Transit Node (Requires Admin/Director Security Clearance)
router.post(
    "/",
    authMiddleware,
    authMiddleware.requireRoles(["admin", "superadmin", "director", "chairman"]),
    async (req, res) => {
        try {
            const { id, model, driver, route, status, plate } = req.body;
            if (!id || !model || !driver) {
                return res.status(400).json({ msg: "Incomplete Telemetry payload. `id`, `model`, and `driver` are strictly required." });
            }

            const existing = await Fleet.findOne({ id });
            if (existing) {
                return res.status(409).json({ msg: `Hull ID ${id} is already commissioned in the Institutional Grid.` });
            }

            const unit = new Fleet({
                id,
                model,
                driver,
                route: route || "Main City Express",
                status: status || "Active",
                plate: plate || "UNKNOWN",
                color: "#6366F1", // Default to Indigo 500
                fuel: "100%",
                lastService: "Today",
                health: "Optimal"
            });

            if (req.tenant?.id) {
                unit.collegeId = req.tenant.id;
            }

            await unit.save();
            return res.status(201).json(unit);

        } catch (err) {
            console.error("[Transit Commissioning Error]", err);
            return res.status(500).json({ msg: "Hardware Binding Sequence Failed", details: err.message });
        }
    }
);

// We can also execute a simple DELETE in the future if a bus is decommissioned.

module.exports = router;
