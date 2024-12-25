// backend/middlewares/AdminAuthMiddleware.js
const jwt = require('jsonwebtoken');
const Admin = require("../models/Admin");

const AdminAuthMiddleware = async (req, res, next) => {
    const token = req.header('Authorization');
    console.log(token);
    console.log("Askery");
    try {
        const token = req.header('Authorization');
        console.log("Token Askery");
        console.log(token)
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token not provided." });
        }

        const jwtToken = token.replace("Bearer", "").trim();
        console.log("Token Askery------------------------");
        console.log(jwtToken)
        const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
     
        console.log(jwtToken)

        const userData = await Admin.findById(decoded.id).select('-password');
        if (!userData) {
            return res.status(401).json({ message: "Unauthorized. Admin not found." });
        }

        if (!userData.isAdmin) {
            return res.status(403).json({ message: "Forbidden. Not an admin user." });
        }

        req.user = userData;
        next();
    } catch (error) {
        console.error("Error in AdminAuthMiddleware:", error.message);

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Unauthorized. Invalid token." });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized. Token has expired." });
        }

        return res.status(500).json({ message: "Server error." });
    }
};

module.exports = AdminAuthMiddleware;
