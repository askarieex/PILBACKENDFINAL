// backend/middlewares/authMiddleware.js

const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Middleware to validate admin JWT token
const authMiddleware = async (req, res, next) => {
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
    console.error("Auth Middleware Error:", err);
    res.status(500).json({ success: false, msg: "Server Error" });
  }
};

module.exports = authMiddleware;
