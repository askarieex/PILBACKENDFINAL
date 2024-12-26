// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Connect to the database without deprecated options
    await mongoose.connect(process.env.DATABASE);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit the process with a failure code
  }
};

module.exports = connectDB;
