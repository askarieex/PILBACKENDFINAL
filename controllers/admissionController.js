// backend/controllers/admissionController.js

const Registration = require('../models/registrationModel');
const asyncHandler = require('express-async-handler');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    class: studentClass,
    dated,
    student_name,
    dob,
    school_last_attended,
    father_name,
    father_profession,
    mother_name,
    mother_profession,
    guardian_name,
    guardian_profession,
    monthly_income,
    father_contact,
    mother_contact,
    residence,
    village,
    tehsil,
    district,
    pen_no,
    blood_group,
    sibling_studying,
    sibling_details
  } = req.body;

  // Using multer's single upload -> req.file
  const studentPhoto = req.file;

  // If there's a file, get its path
  const studentPhotoPath = studentPhoto ? studentPhoto.path : null;

  // Check if the user with the same email already exists
  const userExists = await Registration.findOne({ email });
  if (userExists) {
    return res.status(400).json({
      success: false,
      msg: 'Email already exists'
    });
  }

  // Create user
  const user = await Registration.create({
    email,
    password,
    class: studentClass,
    dated,
    student_name,
    dob,
    school_last_attended,
    father_name,
    father_profession,
    mother_name,
    mother_profession,
    guardian_name,
    guardian_profession,
    monthly_income,
    father_contact,
    mother_contact,
    residence,
    village,
    tehsil,
    district,
    pen_no,
    blood_group,
    sibling_studying,
    sibling_details: sibling_studying ? sibling_details : {},
    // Only the student photo path is stored now
    student_photo_path: studentPhotoPath
  });

  if (user) {
    res.status(201).json({
      success: true,
      token: user.generateWebToken(),
      msg: 'User registered successfully',
      userId: user._id.toString()
    });
  } else {
    res.status(400).json({ success: false, msg: 'Invalid user data' });
  }
});

module.exports = { register };
