const express = require("express");
const router = express.Router();
const { catchErrors } = require("../handlers/errorHandlers");
const {
  isValidToken,
  login,
  logout,
} = require("../controllers/authController");

// Remove the demo login references
// const { loginDemo } = require("../controllers/authControllerDemo");

// Use the actual login controller now
router.route("/login").post(catchErrors(login));
router.route("/logout").post(isValidToken, catchErrors(logout));

module.exports = router;
