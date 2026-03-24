const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    departmentName: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    hodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    coursesOffered: [{
        type: String
    }]
}, { timestamps: true });

module.exports = mongoose.model("Department", departmentSchema);
