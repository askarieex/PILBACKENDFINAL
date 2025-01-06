// backend/routes/adminRoutes.js

const express = require("express");
const { catchErrors } = require("../handlers/errorHandlers"); // Middleware to catch async errors
const {
  registerAdmin,
  loginAdmin,
  isValidAdminToken,
  logoutAdmin,
} = require("../controllers/adminController");
const { AdmissionApplications } = require("../controllers/admissionApplications");
const AdminAuthMiddleware = require("../middlewares/adminUserAuthMiddleware");
const router = express.Router();
const { AdmissionApplicationsByID } = require("../controllers/AdmissionApplicationsByID");
const { updateApplicationStatus } = require("../controllers/updateApplicationStatusController");
const { downloadApplicationPDF } = require("../controllers/downloadApplicationPDF");
const { markAsRead } = require("../controllers/MarkAsRead");
const {
  getAllSyllabus,
  getSyllabusById,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
} = require("../controllers/Syllabus");
const {
  getAllDatesheets,
  getDatesheetById,
  createDatesheet,
  updateDatesheet,
  deleteDatesheet,
} = require("../controllers/datesheetController");
const {
  getAllMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
} = require("../controllers/messageController");

const { AdmitCard } = require("../controllers/admitCard");
const {
  getAllContacts,
  deleteContact,
} = require('../controllers/Contact');

const {
  getTotalUsers,
  getTotalContacts,
  getTotalDatesheets,
  getTotalMessages,
  getTotalApplications,
  getTotalSyllabus
} = require('../controllers/Dashboard');

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

// File filter to accept only PDF files for syllabus and datesheet
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
      return res.status(400).json({
        success: false,
        message: "File size exceeds the limit of 50 MB.",
      });
    }
  } else if (req.fileValidationError) {
    // Custom file validation errors
    return res.status(400).json({
      success: false,
      message: req.fileValidationError,
    });
  }
  next();
};

// Routes

// Authentication Routes
router.post("/register", catchErrors(registerAdmin));
router.post("/login", catchErrors(loginAdmin));
router.get("/validate-token", AdminAuthMiddleware, (req, res) => {
  res.json({ success: true, admin: req.user, msg: "Token is valid." });
});
router.post("/logout", AdminAuthMiddleware, catchErrors(logoutAdmin));

// Admission Applications Routes
router.get("/admissionApplications", AdminAuthMiddleware, catchErrors(AdmissionApplications));
router.get("/admissionApplication/:id", AdminAuthMiddleware, catchErrors(AdmissionApplicationsByID));
router.put(
  "/admissionApplication/:id/status",
  AdminAuthMiddleware,
  catchErrors(updateApplicationStatus)
);
router.get(
  "/admissionApplication/:id/downloadPDF",
  AdminAuthMiddleware,
  catchErrors(downloadApplicationPDF)
);
router.put(
  "/admissionApplication/:id/markAsRead",
  AdminAuthMiddleware,
  catchErrors(markAsRead)
);

// Syllabus Routes
router.get("/syllabus", AdminAuthMiddleware, catchErrors(getAllSyllabus));
router.get("/syllabus/:id", AdminAuthMiddleware, catchErrors(getSyllabusById));
router.post(
  "/syllabus",
  AdminAuthMiddleware,
  uploadPDF.single("pdf"),
  handleMulterErrors,
  catchErrors(createSyllabus)
);
router.put(
  "/syllabus/:id",
  AdminAuthMiddleware,
  uploadPDF.single("pdf"),
  handleMulterErrors,
  catchErrors(updateSyllabus)
);
router.delete("/syllabus/:id", AdminAuthMiddleware, catchErrors(deleteSyllabus));

// Datesheet Routes
router.get("/datesheet", AdminAuthMiddleware, catchErrors(getAllDatesheets));
router.get("/datesheet/:id", AdminAuthMiddleware, catchErrors(getDatesheetById));
router.post(
  "/datesheet",
  AdminAuthMiddleware,
  uploadPDF.single("pdf"),
  handleMulterErrors,
  catchErrors(createDatesheet)
);
router.put(
  "/datesheet/:id",
  AdminAuthMiddleware,
  uploadPDF.single("pdf"),
  handleMulterErrors,
  catchErrors(updateDatesheet)
);
router.delete("/datesheet/:id", AdminAuthMiddleware, catchErrors(deleteDatesheet));

// Message Routes
router.get("/messages", AdminAuthMiddleware, catchErrors(getAllMessages));
router.get("/messages/:id", AdminAuthMiddleware, catchErrors(getMessageById));
router.post("/messages", AdminAuthMiddleware, catchErrors(createMessage));
router.put("/messages/:id", AdminAuthMiddleware, catchErrors(updateMessage));
router.delete("/messages/:id", AdminAuthMiddleware, catchErrors(deleteMessage));

// Contact Routes
router.get('/contact', AdminAuthMiddleware, catchErrors(getAllContacts));
router.delete('/contact/:id', AdminAuthMiddleware, catchErrors(deleteContact));

// Admit Card and Dashboard Routes
router.get("/admitCard", AdminAuthMiddleware, AdmitCard);
router.get("/total-users", AdminAuthMiddleware, getTotalUsers);
router.get("/total-contacts", AdminAuthMiddleware, getTotalContacts);
router.get("/total-datesheets", AdminAuthMiddleware, getTotalDatesheets);
router.get("/total-messages", AdminAuthMiddleware, getTotalMessages);
router.get("/total-applications", AdminAuthMiddleware, getTotalApplications);
router.get("/total-syllabus", AdminAuthMiddleware, getTotalSyllabus);

// **Remove the Assignments Routes from Here**
// router.get("/", getAllAssignments);
// router.get("/:className", getAssignmentsByClass);
// router.post("/:className", createAssignment);
// router.put("/:className/:assignmentId", updateAssignment);
// router.delete("/:className/:assignmentId", deleteAssignment);

// **Mount Assignments Routes Separately**
const assignmentRoutes = require("./assignmentRoutes"); // Adjust the path as needed
router.use("/assignments", assignmentRoutes);

module.exports = router;
