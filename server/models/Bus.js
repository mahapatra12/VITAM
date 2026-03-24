const mongoose = require("mongoose");

const busSchema = new mongoose.Schema({
    route: String,
    time: String,
    driver: String
}, { timestamps: true });

module.exports = mongoose.model("Bus", busSchema);
