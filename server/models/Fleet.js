const mongoose = require("mongoose");

const fleetSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    model: {
        type: String,
        required: true
    },
    plate: {
        type: String,
    },
    driver: {
        type: String,
        required: true
    },
    route: {
        type: String,
        enum: ["Main City Express", "Tech Park Loop", "Hostel Shuttle", "Regional Transit", "VIP Conveyance"],
        default: "Main City Express"
    },
    status: {
        type: String,
        enum: ["Active", "In Workshop", "Maintenance", "Decommissioned"],
        default: "Active"
    },
    fuel: {
        type: String,
        default: "100%"
    },
    lastService: {
        type: String,
        default: "Today"
    },
    health: {
        type: String,
        enum: ["Optimal", "Maintenance", "Critical"],
        default: "Optimal"
    },
    color: {
        type: String,
        default: "#6366F1"
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Fleet", fleetSchema);
