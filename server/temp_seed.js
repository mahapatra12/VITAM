require('dotenv').config();
const mongoose = require('mongoose');
const seedDatabase = require('./seed');

const run = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/vitam';
    console.log(`Connecting to: ${mongoUri.split('@')[1] || mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('DB Connected. Starting Force Seed...');
    const result = await seedDatabase({ forceReset: true });
    console.log('Seed Result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Seed Failed:', err);
    process.exit(1);
  }
};

run();
