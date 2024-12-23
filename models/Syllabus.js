const mongoose = require("mongoose");

const syllabusSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(), // Auto-generate unique IDs
      unique: true, // Ensure no duplicates
    },
    class: {
      type: String,
      required: true,
    },
   
    pdfUrl: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Syllabus", syllabusSchema);
