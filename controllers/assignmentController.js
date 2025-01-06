// backend/controllers/assignmentController.js

const ClassAssignment = require("../models/ClassAssignment");

/**
 * Controller to get all assignments
 */
const getAllAssignments = async (req, res) => {
  try {
    const assignments = await ClassAssignment.find();
    console.log("Fetched All Assignments:", assignments); // Log fetched assignments
    res.status(200).json({ Assignments: assignments });
  } catch (error) {
    console.error("Error fetching all assignments:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Controller to get assignments by class
 */
const getAssignmentsByClass = async (req, res) => {
  const { className } = req.params;
  console.log(`Fetching assignments for class: ${className}`); // Log className

  try {
    const classAssignment = await ClassAssignment.findOne({ class: className });
    if (!classAssignment) {
      console.warn(`Class not found: ${className}`); // Log warning
      return res.status(404).json({ message: "Class not found" });
    }
    console.log(`Assignments for ${className}:`, classAssignment.assignments); // Log assignments
    res.status(200).json({ Assignments: [classAssignment] });
  } catch (error) {
    console.error(`Error fetching assignments for class ${className}:`, error);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Controller to create a new assignment
 */
const createAssignment = async (req, res) => {
  const { className } = req.params;
  const { title, subject, description } = req.body;
  const file = req.file;

  // Log incoming request data
  console.log("Create Assignment Request Data:", {
    className,
    title,
    subject,
    description,
    file,
  });

  if (!title || !subject || !file) {
    console.warn("Missing required fields:", { title, subject, file });
    return res.status(400).json({ message: "Title, subject, and PDF file are required" });
  }

  try {
    let classAssignment = await ClassAssignment.findOne({ class: className });

    if (!classAssignment) {
      console.log(`Class not found. Creating new class: ${className}`);
      // If class doesn't exist, create it
      classAssignment = new ClassAssignment({
        class: className,
        assignments: [],
      });
    }

    const newAssignment = {
      title,
      subject,
      description,
      pdf_url: `${req.protocol}://${req.get("host")}/uploads/${file.filename}`,
    };

    classAssignment.assignments.push(newAssignment);
    await classAssignment.save();

    console.log("Created New Assignment:", newAssignment); // Log new assignment

    res.status(201).json({ message: "Assignment created successfully", assignment: newAssignment });
  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Controller to update an existing assignment
 */
const updateAssignment = async (req, res) => {
  const { className, assignmentId } = req.params;
  const { title, subject, description } = req.body;
  const file = req.file;

  // Log incoming request data
  console.log("Update Assignment Request Data:", {
    className,
    assignmentId,
    title,
    subject,
    description,
    file,
  });

  try {
    const classAssignment = await ClassAssignment.findOne({ class: className });

    if (!classAssignment) {
      console.warn(`Class not found: ${className}`);
      return res.status(404).json({ message: "Class not found" });
    }

    const assignment = classAssignment.assignments.id(assignmentId);

    if (!assignment) {
      console.warn(`Assignment not found: ${assignmentId}`);
      return res.status(404).json({ message: "Assignment not found" });
    }

    // Update fields if provided
    if (title) assignment.title = title;
    if (subject) assignment.subject = subject;
    if (description) assignment.description = description;
    if (file) {
      assignment.pdf_url = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
      console.log(`Updated PDF URL for assignment ${assignmentId}: ${assignment.pdf_url}`);
    }

    await classAssignment.save();

    console.log("Updated Assignment:", assignment); // Log updated assignment

    res.status(200).json({ message: "Assignment updated successfully", assignment });
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

/**
 * Controller to delete an assignment
 */
// backend/controllers/assignmentController.js

const deleteAssignment = async (req, res) => {
    const { className, assignmentId } = req.params;
  
    console.log("Delete Assignment Request Data:", { className, assignmentId });
  
    try {
      // Find the class assignment document
      const classAssignment = await ClassAssignment.findOne({ class: className });
  
      if (!classAssignment) {
        console.warn(`Class not found: ${className}`);
        return res.status(404).json({ message: "Class not found" });
      }
  
      // Check if the assignment exists
      const assignment = classAssignment.assignments.id(assignmentId);
  
      if (!assignment) {
        console.warn(`Assignment not found: ${assignmentId}`);
        return res.status(404).json({ message: "Assignment not found" });
      }
  
      // Use 'pull' to remove the assignment by its _id
      classAssignment.assignments.pull(assignmentId);
  
      // Save the updated document
      await classAssignment.save();
  
      console.log(`Deleted Assignment ${assignmentId} from Class ${className}`);
  
      res.status(200).json({ message: "Assignment deleted successfully" });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };
  

module.exports = {
  getAllAssignments,
  getAssignmentsByClass,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};
