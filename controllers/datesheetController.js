const Datesheet = require("../models/Datesheet");

/**
 * @desc    Get all datesheets
 * @route   GET /api/admin/datesheet
 * @access  Private/Admin
 */
const getAllDatesheets = async (req, res) => {
  try {
    const datesheets = await Datesheet.find();
    res.status(200).json({ success: true, data: datesheets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Get a single datesheet by ID
 * @route   GET /api/admin/datesheet/:id
 * @access  Private/Admin
 */
const getDatesheetById = async (req, res) => {
  try {
    const { id } = req.params;
    const datesheet = await Datesheet.findById(id);
    if (!datesheet) {
      return res.status(404).json({ success: false, message: "Datesheet not found." });
    }
    res.status(200).json({ success: true, data: datesheet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Create a new datesheet
 * @route   POST /api/admin/datesheet
 * @access  Private/Admin
 */
const createDatesheet = async (req, res) => {
  try {
    const { examName, class: className } = req.body;

    // Check for required fields
    if (!examName || !className || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields: examName, class, and a valid PDF file.",
      });
    }

    // Create a new datesheet entry
    const newDatesheet = await Datesheet.create({
      examName,
      class: className,
      pdf: req.file.path, // Save the file path from Multer
      date: new Date().toISOString().split("T")[0], // Set full date (YYYY-MM-DD)
    });

    res.status(201).json({ success: true, data: newDatesheet });
  } catch (error) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ success: false, message: "File size exceeds the allowed limit." });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Update an existing datesheet
 * @route   PUT /api/admin/datesheet/:id
 * @access  Private/Admin
 */
const updateDatesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { examName, class: className, date } = req.body;

    let datesheet = await Datesheet.findById(id);
    if (!datesheet) {
      return res.status(404).json({ success: false, message: "Datesheet not found." });
    }

    // Update fields if provided
    if (examName) datesheet.examName = examName;
    if (className) datesheet.class = className;
    if (date) datesheet.date = date; // Only update if explicitly provided
    if (req.file) datesheet.pdf = req.file.path;

    await datesheet.save();

    res.status(200).json({ success: true, data: datesheet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Delete a datesheet
 * @route   DELETE /api/admin/datesheet/:id
 * @access  Private/Admin
 */
const deleteDatesheet = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the datesheet exists
    const datesheet = await Datesheet.findById(id);
    if (!datesheet) {
      return res.status(404).json({ success: false, message: "Datesheet not found." });
    }

    // Use deleteOne instead of remove
    await datesheet.deleteOne();

    res.status(200).json({ success: true, message: "Datesheet deleted successfully." });
  } catch (error) {
    console.error("Error deleting datesheet:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllDatesheets,
  getDatesheetById,
  createDatesheet,
  updateDatesheet,
  deleteDatesheet,
};
