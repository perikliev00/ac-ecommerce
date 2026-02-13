/**
 * One-time seed: create admin user if none exists.
 * Run: node scripts/seed-admin.js
 * Requires .env with MONGO_URI, ADMIN_USERNAME, ADMIN_PASSWORD.
 */
const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../lib/config');

async function seed() {
  if (!config.MONGO_URI || !config.ADMIN_USERNAME || !config.ADMIN_PASSWORD) {
    console.error('Set MONGO_URI, ADMIN_USERNAME and ADMIN_PASSWORD in .env');
    process.exit(1);
  }
  await mongoose.connect(config.MONGO_URI);
  const existing = await User.findOne({ username: config.ADMIN_USERNAME.toLowerCase() });
  if (existing) {
    console.log('Admin user already exists.');
    await mongoose.disconnect();
    return;
  }
  const user = new User({ username: config.ADMIN_USERNAME, password: config.ADMIN_PASSWORD });
  await user.save();
  console.log('Admin user created: username =', config.ADMIN_USERNAME);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
