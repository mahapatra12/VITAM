const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ["alert", "sync", "update"],
        default: "update"
    }
}, { timestamps: true });

module.exports = mongoose.model("Notice", noticeSchema);
