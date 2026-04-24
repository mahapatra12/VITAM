const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Room = require("../models/Room");
const Complaint = require("../models/Complaint");

// GET /api/hostel/rooms
router.get("/rooms", authMiddleware, async (req, res) => {
    try {
        const query = req.tenant?.id ? { collegeId: req.tenant.id } : {};
        const rooms = await Room.find(query).sort({ id: 1 });
        return res.status(200).json(rooms);
    } catch (err) {
        console.error("[Hostel Room Query Error]", err);
        return res.status(500).json({ msg: "Failed to resolve room vectors", details: err.message });
    }
});

// GET /api/hostel/complaints
router.get("/complaints", authMiddleware, async (req, res) => {
    try {
        const query = req.tenant?.id ? { collegeId: req.tenant.id } : {};
        const complaints = await Complaint.find(query).sort({ createdAt: -1 });
        return res.status(200).json(complaints);
    } catch (err) {
        console.error("[Hostel Ticket Query Error]", err);
        return res.status(500).json({ msg: "Failed to fetch remediation tickets", details: err.message });
    }
});

// PATCH /api/hostel/complaints/:id/resolve
router.patch(
    "/complaints/:id/resolve",
    authMiddleware,
    authMiddleware.requireRoles(["admin", "superadmin", "warden"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { status, remark } = req.body;
            
            const query = req.tenant?.id ? { id, collegeId: req.tenant.id } : { id };

            const complaint = await Complaint.findOne(query);
            if (!complaint) {
                return res.status(404).json({ msg: "Complaint ID not found in institutional grid." });
            }

            if (status) complaint.status = status;
            if (remark) complaint.remark = remark;

            await complaint.save();

            return res.status(200).json(complaint);
        } catch (err) {
            console.error("[Hostel Ticket Update Error]", err);
            return res.status(500).json({ msg: "Failed to resolve ticket", details: err.message });
        }
    }
);

// We should also have POSTs natively to inject data if needed later, 
// for now this fulfills the core logic.

module.exports = router;
