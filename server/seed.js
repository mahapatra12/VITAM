const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const College = require('./models/College');
const Fee = require('./models/Fee');
const Attendance = require('./models/Attendance');
const Result = require('./models/Result');
const PlacementDrive = require('./models/PlacementDrive');
const PlacementOffer = require('./models/PlacementOffer');
const Scholarship = require('./models/Scholarship');
const ScholarshipApplication = require('./models/ScholarshipApplication');
const Fleet = require('./models/Fleet');
const Room = require('./models/Room');
const Complaint = require('./models/Complaint');
const Transaction = require('./models/Transaction');

const seedDatabase = async (options = {}) => {
  const { forceReset = false } = options;
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0 && !forceReset) {
      console.log(`Seed skipped: ${existingUsers} users already exist.`);
      return {
        seeded: false,
        skipped: true,
        reason: "users-exist",
        users: existingUsers
      };
    }

    if (forceReset) {
      await User.deleteMany({});
      await Fee.deleteMany({});
      await Attendance.deleteMany({});
      await Result.deleteMany({});
      await PlacementDrive.deleteMany({});
      await PlacementOffer.deleteMany({});
      await Scholarship.deleteMany({});
      await ScholarshipApplication.deleteMany({});
      await Fleet.deleteMany({});
      await Room.deleteMany({});
      await Complaint.deleteMany({});
      await Transaction.deleteMany({});
      console.log("Cleared existing institutional data.");
    }

    // Ensure default college exists
    const defaultDomain = process.env.FRONTEND_URL?.replace(/^https?:\/\//, "") || "vitam-ai.vercel.app";
    let defaultCollege = await College.findOne({ domain: defaultDomain });
    if (!defaultCollege) {
      defaultCollege = await College.create({
        name: "VITAM Default",
        domain: defaultDomain,
        plan: "pro",
        apiKey: process.env.DEFAULT_TENANT_API_KEY || undefined
      });
      console.log("Created default college for seeding:", defaultDomain);
    }

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
        isTwoFactorEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        isFirstLogin: true,
        collegeId: defaultCollege._id
      },
      {
        name: 'Chairman Chairman',
        email: 'chairman@vitam.edu.in',
        password: hashedPassword,
        role: 'chairman',
        subRole: 'none',
        isTwoFactorEnabled: process.env.ALLOW_IN_MEMORY_FALLBACK !== 'true',
        isBiometricEnabled: process.env.ALLOW_IN_MEMORY_FALLBACK !== 'true',
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        isFirstLogin: false,
        collegeId: defaultCollege._id
      },
      {
        name: 'Director Director',
        email: 'director@vitam.edu.in',
        password: hashedPassword,
        role: 'director',
        subRole: 'none',
        isTwoFactorEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        isFirstLogin: false,
        collegeId: defaultCollege._id
      },
      {
        name: 'Principal Principal',
        email: 'principal@vitam.edu.in',
        password: hashedPassword,
        role: 'admin',
        subRole: 'principal',
        isTwoFactorEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        isFirstLogin: false,
        collegeId: defaultCollege._id
      },
      {
        name: 'Vice Principal',
        email: 'viceprincipal@vitam.edu.in',
        password: hashedPassword,
        role: 'admin',
        subRole: 'vice_principal',
        isTwoFactorEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        isFirstLogin: false,
        collegeId: defaultCollege._id
      },
      {
        name: 'Finance Executive',
        email: 'finance@vitam.edu.in',
        password: hashedPassword,
        role: 'admin',
        subRole: 'finance',
        isTwoFactorEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        isFirstLogin: false,
        collegeId: defaultCollege._id
      },
      {
        name: 'HOD CSE',
        email: 'hod@vitam.edu',
        password: hashedPassword,
        role: 'admin',
        subRole: 'hod',
        isTwoFactorEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        isFirstLogin: false,
        collegeId: defaultCollege._id
      },
      {
        name: 'Prof. Sarah Jane',
        email: 'faculty@vitam.edu',
        password: hashedPassword,
        role: 'FACULTY',
        subRole: 'none',
        isTwoFactorEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        isFirstLogin: false,
        collegeId: defaultCollege._id
      },
      {
        name: 'Alex Rivera',
        email: 'student@vitam.edu',
        password: hashedPassword,
        role: 'STUDENT',
        subRole: 'none',
        isTwoFactorEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP',
        isFirstLogin: false,
        collegeId: defaultCollege._id
      }
    ];

    if (String(process.env.ALLOW_IN_MEMORY_FALLBACK || '').trim().toLowerCase() === 'true') {
      users.forEach(u => {
        if (!u.isFirstLogin && u.role !== 'admin') {
          u.isTwoFactorEnabled = false;
          u.isBiometricEnabled = false;
        }
      });
    }

    const insertedUsers = await User.insertMany(users);
    console.log(`Successfully seeded ${insertedUsers.length} institutional users.`);

    // 1. Seed Finance Telemetry (CFO-AI Material)
    const studentUser = insertedUsers.find(u => u.email === 'student@vitam.edu');
    if (!studentUser) {
      throw new Error("Seed invariant failed: student@vitam.edu account missing after insert.");
    }
    const riskStudentUser = insertedUsers.find(u => u.email === 'mech@vitam.edu') || studentUser;

    await Fee.insertMany([
      { studentId: studentUser._id, total: 85000, paid: 85000, due: 0 },
      { studentId: studentUser._id, total: 85000, paid: 20000, due: 65000 }
    ]);

    // 2. Seed Academic Telemetry (CAO-AI Material)
    await Attendance.insertMany([
      { studentId: studentUser._id, subjectId: 'CS101', present: true, method: 'BIOMETRIC' },
      { studentId: studentUser._id, subjectId: 'CS102', present: true, method: 'BIOMETRIC' },
      { studentId: studentUser._id, subjectId: 'CS103', present: true, method: 'BIOMETRIC' }
    ]);

    // MECH Student - Poor Attendance & High Risk
    await Attendance.insertMany([
      { studentId: riskStudentUser._id, subjectId: 'ME101', present: false, method: 'QR_SCAN' },
      { studentId: riskStudentUser._id, subjectId: 'ME102', present: false, method: 'QR_SCAN' },
      { studentId: riskStudentUser._id, subjectId: 'ME103', present: true, method: 'QR_SCAN' }
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
        studentId: riskStudentUser._id, 
        semester: 5, 
        subjects: [
          { name: 'Metrology', internal: 12, lab: 10, viva: 5, semesterMarks: 32 },
          { name: 'Thermodynamics', internal: 14, lab: 8, viva: 4, semesterMarks: 35 }
        ]
      }
    ]);
 
    // 4. Seed Placement Hub
    const drives = await PlacementDrive.insertMany([
      { id: 'PL-001', company: 'Google', role: 'SDE I', salary: '32.5 LPA', type: 'Full Time', applicants: 450, shortlisted: 42, status: 'Interviewing', color: '#4285F4', collegeId: defaultCollege._id },
      { id: 'PL-002', company: 'Microsoft', role: 'Cloud Architect', salary: '28.0 LPA', type: 'Full Time', applicants: 320, shortlisted: 15, status: 'Applications Open', color: '#00A4EF', collegeId: defaultCollege._id }
    ]);
 
    await PlacementOffer.insertMany([
      { id: 'OFF-001', student: 'Ananya Blore', roll: 'CV2022009', company: 'Zomato', package: '18 LPA', date: '20 Mar', driveId: drives[0]._id, collegeId: defaultCollege._id }
    ]);
 
    // 5. Seed Scholarship Vault
    const schs = await Scholarship.insertMany([
      { id: 'SCH-001', name: 'Merit Excellence Award', color: '#f59e0b', budget: 500000, icon: 'Star', collegeId: defaultCollege._id },
      { id: 'SCH-002', name: 'Need-Based Financial Aid', color: '#10b981', budget: 1000000, icon: 'DollarSign', collegeId: defaultCollege._id }
    ]);
 
    await ScholarshipApplication.insertMany([
      { id: 'APP-001', studentId: studentUser._id, scholarshipId: schs[0]._id, status: 'shortlisted', academicSnapshot: { cgpa: 9.1, attendance: 94 }, aiScore: 96, remarks: 'Top decile performer.', collegeId: defaultCollege._id }
    ]);
 
    // 6. Seed Fleet & Hostel
    await Fleet.insertMany([
      { id: 'VIT-BUS-01', model: 'Volvo 9400 B11R', plate: 'OD-02-AX-1234', driver: 'Sanjeev Kumar', status: 'Active', route: 'Main City Express', collegeId: defaultCollege._id }
    ]);
 
    const room = await Room.create({ id: 'RM-101', wing: 'A-Block', floor: 1, occupancy: 1, capacity: 3, status: 'Normal', students: [studentUser.name], collegeId: defaultCollege._id });
    await Complaint.create({ id: 'CMP-001', student: studentUser.name, room: 'RM-101', type: 'Electrical', subject: 'Fan Noise', description: 'The fan in 101 is vibrating excessively.', priority: 'Medium', status: 'Pending', date: '21 Mar', collegeId: defaultCollege._id });
 
    // 7. Seed Treasury Ledgers
    await Transaction.insertMany([
      { txId: 'TX-9021', direction: 'INBOUND', type: 'Tuition Fee', amount: 85000, status: 'verified', payer: studentUser.name, department: 'Tuition', collegeId: defaultCollege._id }
    ]);
 
    console.log("Institutional Telemetry (Fee, Attendance, Results, Placements, Scholarships, Fleet, Hostel, Finance) seeded successfully.");

    console.log("Institutional Telemetry (Fee, Attendance, Results) seeded successfully.");
    console.log("Default Password for all: admin123");
    return {
      seeded: true,
      skipped: false,
      users: insertedUsers.length
    };
    
  } catch (err) {
    console.error("Seeding Error:", err);
    throw err;
  }
};

module.exports = seedDatabase;
