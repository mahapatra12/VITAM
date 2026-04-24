const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    wing: {
        type: String,
        required: true
    },
    floor: {
        type: Number,
        required: true
    },
    occupancy: {
        type: Number,
        default: 0
    },
    capacity: {
        type: Number,
        default: 3
    },
    status: {
        type: String,
        enum: ["Normal", "Maintenance"],
        default: "Normal"
    },
    students: [{
        type: String
    }],
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
