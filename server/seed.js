const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/vitam_ai";

const seedDatabase = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log("Cleared existing users.");

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
        name: 'B Srinivas Rao',
        email: 'viceprincipal@vitam.edu.in',
        password: hashedPassword,
        role: 'admin',
        subRole: 'vice_principal',
        stream: 'EEE',
        designation: 'Vice Principal',
        mobileNo: '9861817814',
        is2FAEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      },
      {
        name: 'Dr Padma Charan Das',
        email: 'finance@vitam.edu.in',
        password: hashedPassword,
        role: 'admin',
        subRole: 'finance',
        stream: 'EEE',
        designation: 'Professor',
        mobileNo: '9437359065',
        is2FAEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      },
      {
        name: 'Sunil Kumar Dash',
        email: 'hod@vitam.edu',
        password: hashedPassword,
        role: 'admin',
        subRole: 'hod',
        stream: 'ETC & AEIE',
        designation: 'HOD',
        mobileNo: '9437338358',
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
        department: 'Computer Science',
        is2FAEnabled: true,
        isBiometricEnabled: true,
        twoFactorSecret: 'JBSWY3DPEHPK3PXP'
      }
    ];

    await User.insertMany(users);
    console.log(`Successfully seeded ${users.length} institutional users.`);
    console.log("Default Password for all: admin123");
    
  } catch (err) {
    console.error("Seeding Error:", err);
  }
};

module.exports = seedDatabase;
