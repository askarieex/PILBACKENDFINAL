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
const { createContact } = require("../controllers/Contact");
const multer = require('multer');
const path = require('path');
const {
  getAllDatesheets,
  createDatesheet,
  updateDatesheet,
  deleteDatesheet
} = require("../controllers/datesheetController");
const { getAllMessages } = require("../controllers/messageController");

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this directory exists
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
  registerValidate(registerSchema), // Apply validation middleware after file uploads
  register
);

router.post("/login", loginValidate(loginSchema), login);
router.get("/user", authMiddleware, getUser);
router.get("/admitCard", authMiddleware, AdmitCard);
router.get("/syllabus", getAllSyllabus);
router.get("/datesheet", getAllDatesheets);
router.get("/messages", getAllMessages);
router.post('/contact', createContact);

module.exports = router;
