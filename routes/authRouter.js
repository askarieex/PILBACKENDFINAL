// backend/routes/authRouter.js

const express = require("express");
const { register } = require('../controllers/admissionController');
const { login } = require("../controllers/loginController");
const registerValidate = require("../middlewares/regsiterValMiddleware"); // Corrected spelling
const registerSchema = require("../validations/registrationFormValidation");
const loginValidate = require("../middlewares/loginValMiddleware");
const loginSchema = require("../validations/loginFormValidation");
const { getUser } = require("../controllers/getUser");
const authMiddleware = require("../middlewares/userAuthMiddleware");
const { AdmitCard } = require("../controllers/admitCard");
const { getAllSyllabus } = require("../controllers/Syllabus");
const multer = require('multer');
const path = require('path');
const {
  getAllDatesheets,
  createDatesheet,
  updateDatesheet,
  deleteDatesheet
} = require("../controllers/datesheetController"); // Ensure correct path
const { getAllMessages } = require("../controllers/messageController");

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'));
    }
  }
});

const router = express.Router();

// Transform middleware adapted to new field names from frontend
const transformRequestMiddleware = (req, res, next) => {
  console.log("Before transform:", req.body);

  // Convert dob from dob_day, dob_month, dob_year, dob_in_words
  if (req.body.dob_day && req.body.dob_month && req.body.dob_year && req.body.dob_in_words) {
    req.body.dob = {
      day: req.body.dob_day,
      month: req.body.dob_month,
      year: req.body.dob_year,
      in_words: req.body.dob_in_words
    };
  }

  // Convert sibling_studying from 'true'/'false' string to boolean if present
  if (req.body.sibling_studying === 'true') {
    req.body.sibling_studying = true;
  } else if (req.body.sibling_studying === 'false') {
    req.body.sibling_studying = false;
  }

  // If sibling_studying is true and sibling_name, sibling_class are given, create sibling_details object
  if (req.body.sibling_studying === true && req.body.sibling_name && req.body.sibling_class) {
    req.body.sibling_details = {
      name: req.body.sibling_name,
      class: req.body.sibling_class
    };
  }

  // Remove the now unused fields
  delete req.body.dob_day;
  delete req.body.dob_month;
  delete req.body.dob_year;
  delete req.body.dob_in_words;
  delete req.body.sibling_name;
  delete req.body.sibling_class;

  console.log("After transform:", req.body);
  next();
};

// Debugging Logs
console.log('Imported Controller Functions:');
console.log('register:', register);
console.log('login:', login);
console.log('registerValidate:', registerValidate);
console.log('getUser:', getUser);
console.log('AdmitCard:', AdmitCard);
console.log('getAllSyllabus:', getAllSyllabus);
console.log('getAllDatesheets:', getAllDatesheets);
console.log('createDatesheet:', createDatesheet);
console.log('updateDatesheet:', updateDatesheet);
console.log('deleteDatesheet:', deleteDatesheet);
console.log('getAllMessages:', getAllMessages);

// Routes
router.post(
  "/register",
  upload.fields([
    { name: 'dobCertificate', maxCount: 1 },
    { name: 'bloodReport', maxCount: 1 },
    { name: 'aadharCard', maxCount: 1 },
    { name: 'passportPhotos', maxCount: 1 },
    { name: 'marksCertificate', maxCount: 1 },
    { name: 'schoolLeavingCert', maxCount: 1 },
    { name: 'studentPhoto', maxCount: 1 },
  ]),
  transformRequestMiddleware,
  registerValidate(registerSchema),
  register
);

router.post("/login", loginValidate(loginSchema), login);
router.get("/user", authMiddleware, getUser);
router.get("/admitCard", authMiddleware, AdmitCard);
router.get("/syllabus", getAllSyllabus);
router.get("/datesheet", getAllDatesheets); // Ensure getAllDatesheets is defined
router.get("/messages", getAllMessages);
router.get("/register", registerValidate(register));

module.exports = router;
