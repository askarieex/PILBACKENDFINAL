const Admin = require("../models/Admin");
const Contact = require("../models/Contact");
const Datesheet = require("../models/Datesheet");
const Message = require("../models/Message");
const Registration = require("../models/registrationModel");
const Syllabus = require("../models/Syllabus");

/**
 * @desc    Get total number of users
 * @route   GET /api/admin/total-users
 * @access  Private/Admin
 */
const getTotalUsers = async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching total users", error: error.message });
  }
};

/**
 * @desc    Get total number of contacts
 * @route   GET /api/admin/total-contacts
 * @access  Private/Admin
 */
const getTotalContacts = async (req, res) => {
  try {
    const count = await Contact.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching total contacts", error: error.message });
  }
};

/**
 * @desc    Get total number of datesheets
 * @route   GET /api/admin/total-datesheets
 * @access  Private/Admin
 */
const getTotalDatesheets = async (req, res) => {
  try {
    const count = await Datesheet.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching total datesheets", error: error.message });
  }
};

/**
 * @desc    Get total number of messages
 * @route   GET /api/admin/total-messages
 * @access  Private/Admin
 */
const getTotalMessages = async (req, res) => {
  try {
    const count = await Message.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching total messages", error: error.message });
  }
};

/**
 * @desc    Get total number of applications
 * @route   GET /api/admin/total-applications
 * @access  Private/Admin
 */
const getTotalApplications = async (req, res) => {
  try {
    const count = await Registration.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching total applications", error: error.message });
  }
};

/**
 * @desc    Get total number of syllabus uploaded
 * @route   GET /api/admin/total-syllabus
 * @access  Private/Admin
 */
const getTotalSyllabus = async (req, res) => {
  try {
    const count = await Syllabus.countDocuments();
    res.status(200).json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching total syllabus", error: error.message });
  }
};

module.exports = {
  getTotalUsers,
  getTotalContacts,
  getTotalDatesheets,
  getTotalMessages,
  getTotalApplications,
  getTotalSyllabus,
};
