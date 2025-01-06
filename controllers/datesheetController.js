// backend/controllers/datesheetController.js

const Datesheet = require('../models/Datesheet');
const multer = require('multer'); // Ensure Multer is imported
const fs = require('fs');
const path = require('path'); // Import the path module

/**
 * @desc    Get all datesheets grouped by class
 * @route   GET /api/admin/datesheet
 * @access  Private/Admin
 */
const getAllDatesheets = async (req, res) => {
  try {
    const datesheets = await Datesheet.find();

    // Group datesheets by class
    const classesMap = datesheets.reduce((acc, sheet) => {
      const className = sheet.class;

      if (!acc[className]) {
        acc[className] = [];
      }

      // Handle date field
      let formattedExamDate;
      if (sheet.date instanceof Date && !isNaN(sheet.date)) {
        formattedExamDate = sheet.date.toISOString().split('T')[0];
      } else {
        // Attempt to parse the date string
        const parsedDate = new Date(sheet.date);
        formattedExamDate = !isNaN(parsedDate) ? parsedDate.toISOString().split('T')[0] : sheet.date;
      }

      // Extract the filename from the stored path
      const filename = path.basename(sheet.pdf);

      // Construct the correct PDF URL based on the request
      const pdfUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;

      acc[className].push({
        _id: sheet._id, // Include the _id field
        name: sheet.examName,
        uploaded_date: sheet.createdAt.toISOString().split('T')[0],
        year: sheet.year,
        exam_date: formattedExamDate, // Safely formatted
        pdf_url: pdfUrl, // Correctly constructed URL
      });

      return acc;
    }, {});

    // Transform the map into the desired array format
    const classes = Object.keys(classesMap).map((className) => ({
      class: className,
      datesheets: classesMap[className],
    }));

    res.status(200).json({ classes });
  } catch (error) {
    console.error('Error fetching datesheets:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error. Please try again later.' });
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
      return res.status(404).json({ success: false, message: 'Datesheet not found.' });
    }
    res.status(200).json({ success: true, data: datesheet });
  } catch (error) {
    console.error('Error fetching datesheet by ID:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error. Please try again later.' });
  }
};

/**
 * @desc    Create a new datesheet
 * @route   POST /api/admin/datesheet
 * @access  Private/Admin
 */
const createDatesheet = async (req, res) => {
  try {
    const { examName, class: className, year, date } = req.body;

    // Check for required fields
    if (!examName || !className || !year || !date || !req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: examName, class, year, date, and a valid PDF file.',
      });
    }

    // Validate date
    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please provide a valid date.',
      });
    }

    // Create a new datesheet entry
    const newDatesheet = await Datesheet.create({
      examName,
      class: className,
      year,
      pdf: req.file.path, // Save the file path from Multer
      date: parsedDate, // Ensure date is stored as Date object
    });

    res.status(201).json({ success: true, data: newDatesheet });
  } catch (error) {
    console.error('Error creating datesheet:', error);
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File size exceeds the allowed limit of 10MB.' });
      }
    }
    res.status(500).json({ success: false, message: 'Internal Server Error. Please try again later.' });
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
    const { examName, class: className, year, date } = req.body;

    let datesheet = await Datesheet.findById(id);
    if (!datesheet) {
      return res.status(404).json({ success: false, message: 'Datesheet not found.' });
    }

    // Update fields if provided
    if (examName) datesheet.examName = examName;
    if (className) datesheet.class = className;
    if (year) datesheet.year = year;
    if (date) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate)) {
        return res.status(400).json({ success: false, message: 'Invalid date format. Please provide a valid date.' });
      }
      datesheet.date = parsedDate;
    }
    if (req.file) {
      // Delete the old PDF file if a new one is uploaded
      if (datesheet.pdf && fs.existsSync(datesheet.pdf)) {
        fs.unlink(datesheet.pdf, (err) => {
          if (err) {
            console.error('Error deleting old PDF file:', err);
            // Proceed even if file deletion fails
          }
        });
      }
      datesheet.pdf = req.file.path;
    }

    await datesheet.save();

    res.status(200).json({ success: true, data: datesheet });
  } catch (error) {
    console.error('Error updating datesheet:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error. Please try again later.' });
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
      return res.status(404).json({ success: false, message: 'Datesheet not found.' });
    }

    // Delete the associated PDF file from the server
    if (datesheet.pdf && fs.existsSync(datesheet.pdf)) {
      fs.unlink(datesheet.pdf, (err) => {
        if (err) {
          console.error('Error deleting PDF file:', err);
          // Proceed even if file deletion fails
        }
      });
    }

    // Delete the datesheet document
    await datesheet.deleteOne();

    res.status(200).json({ success: true, message: 'Datesheet deleted successfully.' });
  } catch (error) {
    console.error('Error deleting datesheet:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error. Please try again later.' });
  }
};

module.exports = {
  getAllDatesheets,
  getDatesheetById,
  createDatesheet,
  updateDatesheet,
  deleteDatesheet,
};
