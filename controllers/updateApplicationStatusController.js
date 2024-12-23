
const AdmissionApplication = require("../models/registrationModel"); 

exports.updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { applicationStatus } = req.body;

  if (!["approved", "rejected", "pending"].includes(applicationStatus)) {
    return res.status(400).json({ message: "Invalid application status." });
  }

  try {
    const updatedApplication = await AdmissionApplication.findByIdAndUpdate(
      id,
      { applicationStatus },
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found." });
    }

    res.status(200).json({
      message: "Application status updated successfully.",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
