const mongoose = require("mongoose");

const DatesheetSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      required: true,
    },
    pdf: {
      type: String, // Path to the uploaded PDF
      required: true,
    },
    date: {
      type: String, // Full date as a string in 'YYYY-MM-DD' format
      default: () => new Date().toISOString().split("T")[0], // Automatically set to current date
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Datesheet", DatesheetSchema);
