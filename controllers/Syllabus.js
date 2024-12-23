const Syllabus = require("../models/Syllabus");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

/**
 * @desc    Get all syllabi
 * @route   GET /api/admin/syllabus
 * @access  Private/Admin
 */
const getAllSyllabus = asyncHandler(async (req, res) => {
  const syllabi = await Syllabus.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: syllabi });
});

/**
 * @desc    Get a single syllabus by ID
 * @route   GET /api/admin/syllabus/:id
 * @access  Private/Admin
 */



const getSyllabusById = async (req, res) => {
  const { id } = req.params;
  console.log("Received ID for query:", id);

  const syllabus = await Syllabus.findById(id);
  console.log("Query Result:", syllabus);

  if (!syllabus) {
    console.error(`No syllabus found for ID: ${id}`);
    return res.status(404).json({ success: false, message: "Syllabus not found." });
  }

  res.status(200).json({ success: true, data: syllabus });
};




/**
 * @desc    Create a new syllabus
 * @route   POST /api/admin/syllabus
 * @access  Private/Admin
 */
const createSyllabus = asyncHandler(async (req, res) => {
  console.log(req.body)
  const { className, subject } = req.body;
  console.log(req.file)

  if (!className || !subject || !req.file) {
    res.status(400);
    throw new Error(
      "Please provide all required fields: className, subject, and a valid PDF file."
    );
  }

  try {
    const newSyllabus = await Syllabus.create({
      class: className,
      subject,
      pdfUrl: req.file.path,
    });

    res.status(201).json({ success: true, data: newSyllabus });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern.id) {
      res.status(400).json({
        success: false,
        message: "Duplicate entry detected. Please try again.",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal Server Error. Please try again later.",
      });
    }
  }
});


/**
 * @desc    Update an existing syllabus
 * @route   PUT /api/admin/syllabus/:id
 * @access  Private/Admin
 */
const updateSyllabus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { className, subject } = req.body;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID format." });
  }

  const syllabus = await Syllabus.findById(id);
  if (!syllabus) {
    return res.status(404).json({ success: false, message: "Syllabus not found." });
  }

  syllabus.class = className || syllabus.class;
  syllabus.subject = subject || syllabus.subject;
  if (req.file) syllabus.pdfUrl = req.file.path;

  await syllabus.save();

  res.status(200).json({ success: true, data: syllabus });
});

/**
 * @desc    Delete a syllabus
 * @route   DELETE /api/admin/syllabus/:id
 * @access  Private/Admin
 */
const deleteSyllabus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID format." });
  }

  const syllabus = await Syllabus.findById(id);
  if (!syllabus) {
    return res.status(404).json({ success: false, message: "Syllabus not found." });
  }

  await syllabus.deleteOne();
  res.status(200).json({ success: true, message: "Syllabus deleted successfully." });
});

module.exports = {
  getAllSyllabus,
  getSyllabusById,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
};
