const jwt = require('jsonwebtoken');
const user=require("../models/registrationModel");
const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization');

    // If no token is provided, return a 401 Unauthorized response
    if (!token) {
        return res.status(401).json({ message: "Unauthorized HTTP, Token not provided" });
    }
    try {
        const jwtToken = token.replace("Bearer", "").trim();
        const isVerified = jwt.verify(jwtToken, process.env.JWT_SECRET );
        console.log(isVerified);
        const userData=await user.findOne({email:isVerified.email}).select({
            password:0,
        })
        req.user=userData;
        req.token=token;
        req.userID=userData._id; 
        console.log(userData); 

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // If the token is invalid, return a 401 Unauthorized response
        return res.status(401).json({ message: "Unauthorized. Invalid token." });
    }
};

module.exports = authMiddleware;
