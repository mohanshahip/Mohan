const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  console.log('Attempting to connect with URI:', process.env.MONGO_URI.replace(/\/\/.*:.*@/, '//***:***@'));
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connection Successful!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection Failed!');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    if (err.reason) {
        console.error('Error Reason:', JSON.stringify(err.reason, null, 2));
    }
    process.exit(1);
  }
};

testConnection();
