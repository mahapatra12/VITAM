const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema({
    branch: { type: String, required: true },
    semester: { type: Number, required: true },
    day: { type: String, required: true },
    slots: [{
        time: String,
        subject: String,
        faculty: String,
        room: String
    }]
}, { timestamps: true });

module.exports = mongoose.model("Timetable", timetableSchema);
