const Registration = require("../models/registrationModel"); // Replace with the correct model import

// Controller to fetch a single application by ID
const  AdmissionApplicationsByID = async (req, res) => {
  const { id } = req.params;

  try {
    // Find application by ID
    const application = await Registration.findById(id);

    // Check if the application exists
    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    // Send the application data in the response
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

module.exports = {  AdmissionApplicationsByID };
