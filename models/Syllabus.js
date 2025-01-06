// backend/models/Syllabus.js

const mongoose = require("mongoose");

const syllabusSchema = new mongoose.Schema(
  {
    class: {
      type: String,
      required: true,
      enum: [
        "Nursery",
        "LKG",
        "UKG",
        "1st Class",
        "2nd Class",
        "3rd Class",
        "4th Class",
        "5th Class",
        "6th Class",
        "7th Class",
        "8th Class",
        "9th Class",
        "10th Class",
        "11th Class",
        "12th Class",
      ],
    },
    pdfUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Syllabus", syllabusSchema);
