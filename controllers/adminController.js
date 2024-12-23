// backend/controllers/adminController.js

const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Registration Controller for Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password, passwordCheck, name, surname } = req.body;

    // Validate input
    if (!email || !password || !passwordCheck) {
      return res.status(400).json({ msg: "Not all fields have been entered." });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters long." });
    }
    if (password !== passwordCheck) {
      return res.status(400).json({ msg: "Passwords do not match." });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ msg: "An account with this email already exists." });
    }

    // If name is not provided, set it to email
    const adminName = name || email;

    // Create new admin
    const newAdmin = new Admin({ email, password, name: adminName, surname });
    const savedAdmin = await newAdmin.save();

    res.status(201).json({
      success: true,
      admin: {
        id: savedAdmin._id,
        name: savedAdmin.name,
        surname: savedAdmin.surname,
        email: savedAdmin.email
      },
      msg: "Admin registered successfully"
    });
  } catch (err) {
    console.error("Error registering admin:", err);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// Login Controller for Admin
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ msg: "Not all fields have been entered." });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ success: false, msg: "Invalid credentials." });
    }

    // Validate password
    const isMatch = admin.validPassword(password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: "Invalid credentials." });
    }

    // Generate JWT
    const token = admin.generateJWT();

    // Update admin's isLoggedIn status
    admin.isLoggedIn = true;
    await admin.save();

    // Respond with token and admin info
    res.json({
      success: true,
      result: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          surname: admin.surname,
          email: admin.email,
          isLoggedIn: admin.isLoggedIn
        },
      },
      msg: "Successfully logged in"
    });
  } catch (err) {
    console.error("Error logging in admin:", err);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// Token Validation Middleware for Admin
exports.isValidAdminToken = async (req, res, next) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) {
      return res.status(401).json({ success: false, msg: "No authentication token, authorization denied." });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.status(401).json({ success: false, msg: "Token verification failed, authorization denied." });
    }

    const admin = await Admin.findById(verified.id);
    if (!admin) {
      return res.status(401).json({ success: false, msg: "Admin doesn't exist, authorization denied." });
    }

    if (!admin.isLoggedIn) {
      return res.status(401).json({ success: false, msg: "Admin is logged out, authorization denied." });
    }

    // Attach admin to request
    req.admin = admin;
    next();
  } catch (err) {
    console.error("Token validation error:", err);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

// Logout Controller for Admin
exports.logoutAdmin = async (req, res) => {
  try {
    // Admin must be authenticated first
    const admin = req.admin;
    if (!admin) {
      return res.status(401).json({ success: false, msg: "Not authenticated." });
    }

    // Update isLoggedIn status
    admin.isLoggedIn = false;
    await admin.save();

    res.json({ success: true, msg: "Logged out successfully" });
  } catch (err) {
    console.error("Error logging out admin:", err);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};
