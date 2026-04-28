// seed/mohanSeeder.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
};

const createMohanAdmin = async () => {
  try {
    await connectDB();

    const email = 'mohan@gmail.com';
    const username = 'mohan';

    // Check if user already exists
    let user = await User.findOne({ email }).select('+loginAttempts +lockUntil');

    if (user) {
      console.log(`\n⚠️  User with email ${email} already exists!`);
      console.log('Current Role:', user.role);
      
      const answer = await prompt('\nDo you want to reset the password and ensure this user is a Super Admin? (y/n): ');
      if (answer.toLowerCase() !== 'y') {
        console.log('Exiting...');
        process.exit(0);
      }
      console.log('\n--- Resetting Password & Promoting to Super Admin ---');
    } else {
      console.log(`\n--- Creating New Super Admin with email ${email} ---`);
    }

    // Password input
    console.log('\nPassword requirements:');
    console.log('- At least 8 characters');
    console.log('- At least 1 uppercase letter');
    console.log('- At least 1 lowercase letter');
    console.log('- At least 1 number');

    const password = await prompt('\nNew Password: ');
    const confirmPassword = await prompt('Confirm Password: ');

    if (password !== confirmPassword) {
      console.error('\n❌ Passwords do not match!');
      process.exit(1);
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      console.error('\n❌ Password does not meet requirements!');
      process.exit(1);
    }

    if (user) {
      // Update existing user
      user.password = password;
      user.role = 'superadmin';
      user.isActive = true;
      user.isVerified = true;
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      user.refreshTokens = [];
      await user.save();
      console.log('\n✅ User updated to Super Admin successfully!');
    } else {
      // Create new mohan admin
      user = new User({
        username,
        email,
        password,
        role: 'superadmin',
        profile: {
          firstName: 'Mohan',
          lastName: 'Kattel',
        },
        isActive: true,
        isVerified: true,
      });
      await user.save();
      console.log('\n✅ Mohan admin created successfully!');
    }

    console.log('📧 Email:', user.email);
    console.log('👤 Username:', user.username);
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
};

createMohanAdmin();
