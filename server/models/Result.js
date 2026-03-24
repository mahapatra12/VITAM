const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    subjects: [{
        name: String,
        internal: Number,
        lab: Number,
        viva: Number,
        semesterMarks: Number
    }]
}, { timestamps: true });

module.exports = mongoose.model("Result", resultSchema);
