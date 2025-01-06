// backend/models/Assignment.js

const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    uploaded_date: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    pdf_url: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: true } // Enable _id for each assignment
);

module.exports = assignmentSchema;
