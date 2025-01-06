// backend/routes/assignmentRoutes.js

const express = require("express");
const router = express.Router();
const {
  getAllAssignments,
  getAssignmentsByClass,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} = require("../controllers/assignmentController");
const AdminAuthMiddleware = require("../middlewares/adminUserAuthMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure 'uploads/' directory exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure 'uploads/' directory exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter to accept only PDF files
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    req.fileValidationError = "Invalid file type. Only PDF files are allowed.";
    cb(null, false);
  }
};

// Initialize multer for PDF uploads with a file size limit
const uploadPDF = multer({
  storage: storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB limit
  },
});

// Middleware to handle file size errors and validation errors
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === "LIMIT_FILE_SIZE") {
      console.warn("File size exceeds the limit.");
      return res.status(400).json({
        success: false,
        message: "File size exceeds the limit of 50 MB.",
      });
    }
  } else if (req.fileValidationError) {
    // Custom file validation errors
    console.warn("File validation error:", req.fileValidationError);
    return res.status(400).json({
      success: false,
      message: req.fileValidationError,
    });
  }
  next();
};

// Routes

// Route to get all assignments
router.get("/",AdminAuthMiddleware, getAllAssignments);

// Route to get assignments by class
router.get("/:className",AdminAuthMiddleware, getAssignmentsByClass);

// Route to create a new assignment under a class with file upload
router.post(
  "/:className",AdminAuthMiddleware,
  uploadPDF.single("pdf"),
  handleMulterErrors,
  createAssignment
);

// Route to update an existing assignment with optional file upload
router.put(
  "/:className/:assignmentId",
  AdminAuthMiddleware,
  uploadPDF.single("pdf"),
  handleMulterErrors,
  updateAssignment
);

// Route to delete an assignment
router.delete("/:className/:assignmentId",AdminAuthMiddleware, deleteAssignment);

module.exports = router;
