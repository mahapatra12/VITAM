const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
      // ... (Previous users stay the same)
      {
        name: 'System Admin',
        email: 'admin@vitam.edu',
        password: hashedPassword,
        role: 'admin',
        subRole: 'none',
        department: 'Administration',
        is2FAEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      },
      {
        name: 'Chairman Chairman',
        email: 'chairman@vitam.edu.in',
        password: hashedPassword,
        role: 'chairman',
        subRole: 'none',
        is2FAEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      },
      {
        name: 'Director Director',
        email: 'director@vitam.edu.in',
        password: hashedPassword,
        role: 'director',
        subRole: 'none',
        is2FAEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      },
      {
        name: 'Gudivada Eswara Rao',
        email: 'principal@vitam.edu.in',
        password: hashedPassword,
        role: 'admin',
        subRole: 'principal',
        stream: 'EEE',
        designation: 'Principal',
        mobileNo: '9861875935',
        is2FAEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      },
      {
        name: 'Prof. Sarah Jane',
        email: 'faculty@vitam.edu',
        password: hashedPassword,
        role: 'FACULTY',
        subRole: 'none',
        department: 'Computer Science',
        is2FAEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      },
      {
        name: 'Alex Rivera',
        email: 'student@vitam.edu',
        password: hashedPassword,
        role: 'STUDENT',
        subRole: 'none',
        department: 'CSE',
        is2FAEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      },
      {
        name: 'John Mech',
        email: 'john.mech@vitam.edu',
        password: hashedPassword,
        role: 'STUDENT',
        subRole: 'none',
        department: 'MECH',
        is2FAEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
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
