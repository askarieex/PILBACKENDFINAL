// backend/models/ClassAssignment.js

const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  pdf_url: {
    type: String,
    required: true,
  },
  uploaded_date: {
    type: Date,
    default: Date.now,
  },
});

const ClassAssignmentSchema = new mongoose.Schema({
  class: {
    type: String,
    required: true,
    unique: true,
  },
  assignments: [AssignmentSchema],
});

module.exports = mongoose.model("ClassAssignment", ClassAssignmentSchema);
