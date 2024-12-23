const Registration = require("../models/registrationModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email and password
        if (!email || !password) {
            return res.status(400).json({ msg: "Please provide both email and password." });
        }

        // Check if the user exists
        const user = await Registration.findOne({ email });
        console.log("______________________________Askery")
        console.log(user);
        console.log("______________________________Askery")
        if (!user) {
            return res.status(401).json({ msg: "Invalid credentials." });
        }

        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: "Invalid credentials." });
        }

        // Generate a JWT token
        const token = await user.generateWebToken();

        // Send successful login response
        res.status(200).json({
            msg: "Successfully logged in.",
            data: {
                userId: user._id.toString(),
                email: user.email,
                token: token,
            },
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ msg: "Internal server error." });
    }
};

module.exports = { login };
