const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Registration Controller
exports.register = async (req, res) => {
  try {
    const { email, password, passwordCheck, name, surname } = req.body;

    // Validate input
    if (!email || !password || !passwordCheck) {
      return res.status(400).json({ msg: "Please fill in all required fields." });
    }
    if (password.length < 6) {
      return res.status(400).json({ msg: "Password must be at least 6 characters." });
    }
    if (password !== passwordCheck) {
      return res.status(400).json({ msg: "Passwords do not match." });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ msg: "An account with this email already exists." });
    }

    // Create new admin
    const newAdmin = new Admin({ email, password, name, surname });
    const savedAdmin = await newAdmin.save();

    res.status(201).json({
      success: true,
      admin: {
        id: savedAdmin._id,
        name: savedAdmin.name,
        surname: savedAdmin.surname,
        email: savedAdmin.email,
        isAdmin: savedAdmin.isAdmin,
      },
      msg: "Admin registered successfully.",
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ msg: "Server error." });
  }
};

// Login Controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ msg: "Please provide both email and password." });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ msg: "Invalid credentials." });
    }

    // Validate password
    const isMatch = await admin.validPassword(password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid credentials." });
    }

    // Generate JWT with isAdmin field
    const token = admin.generateJWT();

    // Update isLoggedIn status
    admin.isLoggedIn = true;
    await admin.save();

    res.status(200).json({
      success: true,
      result: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          surname: admin.surname,
          email: admin.email,
          isAdmin: admin.isAdmin,
          isLoggedIn: admin.isLoggedIn,
        },
      },
      msg: "Successfully logged in.",
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ msg: "Server error." });
  }
};

// Middleware for Token Validation
exports.isValidToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ msg: "Unauthorized: Token not provided." });
    }

    const jwtToken = token.replace("Bearer", "").trim();
    const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);

    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(404).json({ msg: "Admin not found." });
    }

    if (!admin.isLoggedIn) {
      return res.status(401).json({ msg: "Admin is logged out." });
    }

    req.admin = admin;
    next();
  } catch (err) {
    console.error("Token validation error:", err);
    res.status(401).json({ msg: "Unauthorized: Invalid token." });
  }
};

// Logout Controller
exports.logout = async (req, res) => {
  try {
    const admin = req.admin;

    // Update isLoggedIn status
    admin.isLoggedIn = false;
    await admin.save();

    res.status(200).json({ success: true, msg: "Successfully logged out." });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ msg: "Server error." });
  }
};
