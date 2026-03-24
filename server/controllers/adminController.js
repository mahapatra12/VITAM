const User = require("../models/User");
const mongoose = require("mongoose");

// Helper to check if DB is connected
const isDBConnected = () => mongoose.connection.readyState === 1;

exports.getUsers = async (req, res) => {
    try {
        if (!isDBConnected()) {
            return res.json([
                { _id: "1", name: "System Admin", email: "admin@vitam.edu", role: "ADMIN", hasBiometrics: true },
                { _id: "2", name: "Dr. John Smith", email: "hod@vitam.edu", role: "HOD", hasBiometrics: false },
                { _id: "3", name: "Prof. Sarah Jane", email: "faculty@vitam.edu", role: "FACULTY", hasBiometrics: false },
                { _id: "4", name: "Alex Rivera", email: "student@vitam.edu", role: "STUDENT", hasBiometrics: true }
            ]);
        }
        const users = await User.find().select("-password -twoFactorSecret");
        // Enrich with hasBiometrics boolean
        const usersWithSecurity = users.map(u => ({
            ...u.toObject(),
            hasBiometrics: u.credentials && u.credentials.length > 0
        }));
        res.json(usersWithSecurity);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        res.json({
            totalStudents: '1,284',
            activeFaculty: '84',
            atRiskStudents: '12',
            enrollmentGrowth: '15%'
        });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};
