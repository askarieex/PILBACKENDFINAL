// backend/controllers/syllabusController.js

const Syllabus = require("../models/Syllabus");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");
const fs = require("fs");
const path = require("path");

/**
 * @desc    Get all syllabi grouped by class
 * @route   GET /api/admin/syllabus
 * @access  Private/Admin
 */
const getAllSyllabus = asyncHandler(async (req, res) => {
  try {
    const syllabi = await Syllabus.find();

    // Group syllabi by class
    const classesMap = syllabi.reduce((acc, syllabus) => {
      const className = syllabus.class;

      if (!acc[className]) {
        acc[className] = [];
      }

      // Format uploaded_date
      const uploadedDate = syllabus.createdAt.toISOString().split("T")[0];

      // Extract filename from pdfUrl
      const filename = path.basename(syllabus.pdfUrl);

      // Construct PDF URL based on the request
      const pdfUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

      acc[className].push({
        _id: syllabus._id, // Include the _id field
        uploaded_date: uploadedDate,
        pdf_url: pdfUrl, // Correctly constructed URL
      });

      return acc;
    }, {});

    // Transform into desired array format
    const classes = Object.keys(classesMap).map((className) => ({
      class: className,
      syllabuses: classesMap[className],
    }));

    res.status(200).json({ Syllabus: classes });
  } catch (error) {
    console.error("Error fetching syllabi:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
});

/**
 * @desc    Get a single syllabus by ID
 * @route   GET /api/admin/syllabus/:id
 * @access  Private/Admin
 */
const getSyllabusById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error(`Invalid ID format: ${id}`);
    return res.status(400).json({ success: false, message: "Invalid ID format." });
  }

  const syllabus = await Syllabus.findById(id);

  if (!syllabus) {
    console.error(`No syllabus found for ID: ${id}`);
    return res.status(404).json({ success: false, message: "Syllabus not found." });
  }

  // Construct PDF URL based on the request
  const filename = path.basename(syllabus.pdfUrl);
  const pdfUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

  res.status(200).json({
    success: true,
    data: {
      _id: syllabus._id,
      class: syllabus.class,
      pdf_url: pdfUrl,
      createdAt: syllabus.createdAt,
      updatedAt: syllabus.updatedAt,
    },
  });
});

/**
 * @desc    Create a new syllabus
 * @route   POST /api/admin/syllabus
 * @access  Private/Admin
 */
const createSyllabus = asyncHandler(async (req, res) => {
  const { class: className } = req.body;

  console.log("Received create syllabus data:", req.body);
  console.log("Received file:", req.file);

  if (!className || !req.file) {
    res.status(400);
    throw new Error("Please provide all required fields: class and a valid PDF file.");
  }

  try {
    // Create new syllabus
    const newSyllabus = await Syllabus.create({
      class: className,
      pdfUrl: req.file.path, // Stored file path
    });

    res.status(201).json({ success: true, data: newSyllabus });
  } catch (error) {
    console.error("Error creating syllabus:", error);
    if (error.code === 11000) {
      // Extract the field that caused the duplication
      const duplicatedField = Object.keys(error.keyPattern)[0];
      res.status(400).json({
        success: false,
        message: `Duplicate entry for ${duplicatedField}. Please try again.`,
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
  const { class: className } = req.body;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid ID format." });
  }

  const syllabus = await Syllabus.findById(id);
  if (!syllabus) {
    return res.status(404).json({ success: false, message: "Syllabus not found." });
  }

  // Update fields if provided
  syllabus.class = className || syllabus.class;

  if (req.file) {
    // Delete the old PDF file
    if (syllabus.pdfUrl && fs.existsSync(syllabus.pdfUrl)) {
      fs.unlink(syllabus.pdfUrl, (err) => {
        if (err) {
          console.error("Error deleting old PDF file:", err);
          // Proceed even if file deletion fails
        }
      });
    }
    syllabus.pdfUrl = req.file.path;
  }

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

  // Delete the associated PDF file
  if (syllabus.pdfUrl && fs.existsSync(syllabus.pdfUrl)) {
    fs.unlink(syllabus.pdfUrl, (err) => {
      if (err) {
        console.error("Error deleting PDF file:", err);
        // Proceed even if file deletion fails
      }
    });
  }

  // Delete the syllabus document
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
