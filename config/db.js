// backend/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    // Connection successful
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err; // Propagate the error
  }
};

module.exports = connectDB;
