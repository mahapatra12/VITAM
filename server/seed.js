const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Fee = require('./models/Fee');
const Attendance = require('./models/Attendance');
const Result = require('./models/Result');

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Fee.deleteMany({});
    await Attendance.deleteMany({});
    await Result.deleteMany({});
    console.log("Cleared existing institutional data.");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const users = [
      {
        name: 'System Admin',
        email: 'admin@vitam.edu',
        password: hashedPassword,
        role: 'admin',
        subRole: 'none',
        department: 'Administration',
        isFirstLogin: true
      },
      {
        name: 'Chairman Chairman',
        email: 'chairman@vitam.edu.in',
        password: hashedPassword,
        role: 'chairman',
        subRole: 'none',
        isFirstLogin: true
      },
      {
        name: 'Director Director',
        email: 'director@vitam.edu.in',
        password: hashedPassword,
        role: 'director',
        subRole: 'none',
        isFirstLogin: true
      },
      {
        name: 'Principal Principal',
        email: 'principal@vitam.edu.in',
        password: hashedPassword,
        role: 'admin',
        subRole: 'principal',
        isFirstLogin: true
      },
      {
        name: 'Vice Principal',
        email: 'viceprincipal@vitam.edu.in',
        password: hashedPassword,
        role: 'admin',
        subRole: 'vice_principal',
        isFirstLogin: true
      },
      {
        name: 'Finance Executive',
        email: 'finance@vitam.edu.in',
        password: hashedPassword,
        role: 'admin',
        subRole: 'finance',
        isFirstLogin: true
      },
      {
        name: 'HOD CSE',
        email: 'hod@vitam.edu',
        password: hashedPassword,
        role: 'admin',
        subRole: 'hod',
        departmentId: null, // placeholder
        isFirstLogin: true
      },
      {
        name: 'Prof. Sarah Jane',
        email: 'faculty@vitam.edu',
        password: hashedPassword,
        role: 'FACULTY',
        subRole: 'none',
        isFirstLogin: true
      },
      {
        name: 'Alex Rivera',
        email: 'student@vitam.edu',
        password: hashedPassword,
        role: 'STUDENT',
        subRole: 'none',
        isFirstLogin: true
      }
    ];

    const insertedUsers = await User.insertMany(users);
    console.log(`Successfully seeded ${insertedUsers.length} institutional users.`);

    // 1. Seed Finance Telemetry (CFO-AI Material)
    const studentUser = insertedUsers.find(u => u.email === 'student@vitam.edu');
    const mechUser = insertedUsers.find(u => u.email === 'john.mech@vitam.edu');

    await Fee.insertMany([
      { studentId: studentUser._id, total: 85000, paid: 85000, due: 0 },
      { studentId: mechUser._id, total: 85000, paid: 20000, due: 65000 }
    ]);

    // 2. Seed Academic Telemetry (CAO-AI Material)
    // CSE Student - Excellent Attendance
    await Attendance.insertMany([
      { studentId: studentUser._id, subjectId: 'CS101', present: true, method: 'BIOMETRIC' },
      { studentId: studentUser._id, subjectId: 'CS102', present: true, method: 'BIOMETRIC' },
      { studentId: studentUser._id, subjectId: 'CS103', present: true, method: 'BIOMETRIC' }
    ]);

    // MECH Student - Poor Attendance & High Risk
    await Attendance.insertMany([
      { studentId: mechUser._id, subjectId: 'ME101', present: false, method: 'QR_SCAN' },
      { studentId: mechUser._id, subjectId: 'ME102', present: false, method: 'QR_SCAN' },
      { studentId: mechUser._id, subjectId: 'ME103', present: true, method: 'QR_SCAN' }
    ]);

    // 3. Seed Performance Data
    await Result.insertMany([
      { 
        studentId: studentUser._id, 
        semester: 5, 
        subjects: [
          { name: 'OS', internal: 28, lab: 18, viva: 9, semesterMarks: 62 },
          { name: 'DBMS', internal: 29, lab: 19, viva: 10, semesterMarks: 65 }
        ]
      },
      { 
        studentId: mechUser._id, 
        semester: 5, 
        subjects: [
          { name: 'Metrology', internal: 12, lab: 10, viva: 5, semesterMarks: 32 },
          { name: 'Thermodynamics', internal: 14, lab: 8, viva: 4, semesterMarks: 35 }
        ]
      }
    ]);

    console.log("Institutional Telemetry (Fee, Attendance, Results) seeded successfully.");
    console.log("Default Password for all: admin123");
    
  } catch (err) {
    console.error("Seeding Error:", err);
  }
};

module.exports = seedDatabase;
