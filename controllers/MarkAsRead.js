
const RegistrationModel = require("../models/registrationModel");
/**
 * Controller to mark an application as read.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.markAsRead = async (req, res) => {
  const { id } = req.params; // Extract application ID from the request

  try {
    // Find the application by ID and update its isRead field
    const updatedApplication = await RegistrationModel.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true } // Return the updated document
    );

    // If application not found, return 404
    if (!updatedApplication) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Respond with the updated application
    res.status(200).json({
      message: "Application marked as read.",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error marking application as read:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
