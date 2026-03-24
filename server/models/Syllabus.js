const mongoose = require("mongoose");

const syllabusSchema = new mongoose.Schema({
    course: {
        type: String,
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    subjects: [{
        name: String,
        materials: [String]
    }]
}, { timestamps: true });

module.exports = mongoose.model("Syllabus", syllabusSchema);
