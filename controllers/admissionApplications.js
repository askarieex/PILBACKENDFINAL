
const Registration =require("../models/registrationModel")

const AdmissionApplications = async (req, res) => {
  try {
    // Fetch all records from the Registration collection
    const allRegistrations = await Registration.find({});

    // Return the fetched data as JSON
    return res.status(200).json({
      success: true,
      data: allRegistrations,
      message: "All registration data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching registration data:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching registration data",
      error: error.message,
    });
  }
};

module.exports = { AdmissionApplications };
