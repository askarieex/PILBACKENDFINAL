const PDFDocument = require("pdfkit");
const RegistrationModel = require("../models/registrationModel");
const path = require("path");
const fs = require("fs");

/**
 * Controller to generate and download application in PDF format.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.downloadApplicationPDF = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch application by ID
    const application = await RegistrationModel.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=application_${id}.pdf`
    );

    // Create a new PDF document
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Error handling for the PDF stream
    let streamError = false;
    doc.on("error", (err) => {
      console.error("PDF generation error:", err);
      if (!streamError && !res.headersSent) {
        streamError = true;
        res.status(500).json({ message: "Error generating PDF." });
      }
    });

    // Pipe the document to the response
    doc.pipe(res);

    // Define colors
    const primaryColor = "#2E86C1";
    const secondaryColor = "#A9CCE3";
    const textColor = "#333333";

    // Function to register fonts safely
    const registerFonts = () => {
      const fontsPath = path.join(__dirname, "../assets/fonts/");
      try {
        doc.registerFont("HeaderFont", path.join(fontsPath, "Montserrat-Bold.ttf"));
        doc.registerFont("SubHeaderFont", path.join(fontsPath, "Montserrat-SemiBold.ttf"));
        doc.registerFont("BodyFont", path.join(fontsPath, "Montserrat-Regular.ttf"));
      } catch (fontError) {
        console.warn("Custom fonts not found. Using default fonts.", fontError);
        // Fallback to default fonts
        doc.font("Helvetica");
      }
    };

    // Register fonts
    registerFonts();

    // Include a logo (if available)
    const logoPath = path.join(__dirname, "../assets/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 20, { width: 100 }).moveDown(1);
    } else {
      console.warn("Logo file not found. Skipping logo.");
    }

    // Add header with a modern style
    if (doc._font && doc._font.family === "HeaderFont") {
      doc
        .font("HeaderFont")
        .fontSize(24)
        .fillColor(primaryColor)
        .text("PIONEER INSTITUTE OF LEARNING", { align: "center" })
        .moveDown(0.2);

      doc
        .font("SubHeaderFont")
        .fontSize(16)
        .fillColor(textColor)
        .text("Registration Form - Session: 2025", { align: "center" })
        .moveDown(1);
    } else {
      // Using default font
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .fillColor(primaryColor)
        .text("PIONEER INSTITUTE OF LEARNING", { align: "center" })
        .moveDown(0.2);

      doc
        .font("Helvetica")
        .fontSize(14)
        .fillColor(textColor)
        .text("Registration Form - Session: 2025", { align: "center" })
        .moveDown(1);
    }

    // Decorative line
    doc
      .strokeColor(primaryColor)
      .lineWidth(2)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(0.5);

    // Application Details Section
    const applicationDetailsTop = doc.y;
    doc
      .font(doc._font && doc._font.family === "SubHeaderFont" ? "SubHeaderFont" : "Helvetica-Bold")
      .fontSize(14)
      .fillColor(primaryColor)
      .text("Application Details", { underline: true });

    const details = [
      { label: "Admission Sought For:", value: application.class },
      { label: "Date:", value: new Date().toLocaleDateString() },
    ];

    // Create a table-like structure for application details
    details.forEach((detail) => {
      doc
        .font(doc._font && doc._font.family === "BodyFont" ? "BodyFont" : "Helvetica")
        .fontSize(12)
        .fillColor(textColor)
        .text(detail.label, { continued: true, width: 200 })
        .text(detail.value, { align: "right" });
    });

    doc.moveDown(1);

    // Personal Information Section
    doc
      .font(doc._font && doc._font.family === "SubHeaderFont" ? "SubHeaderFont" : "Helvetica-Bold")
      .fontSize(14)
      .fillColor(primaryColor)
      .text("Personal Information", { underline: true })
      .moveDown(0.5);

    const personalInfo = [
      { label: "Student Name:", value: application.student_name },
      { label: "Date of Birth:", value: application.dob },
      { label: "Last School Attended:", value: application.school_last_attended },
    ];

    personalInfo.forEach((info) => {
      doc
        .font(doc._font && doc._font.family === "BodyFont" ? "BodyFont" : "Helvetica")
        .fontSize(12)
        .fillColor(textColor)
        .text(info.label, { continued: true, width: 200 })
        .text(info.value, { align: "right" });
    });

    doc.moveDown(1);

    // Parent/Guardian Details Section
    doc
      .font(doc._font && doc._font.family === "SubHeaderFont" ? "SubHeaderFont" : "Helvetica-Bold")
      .fontSize(14)
      .fillColor(primaryColor)
      .text("Parent/Guardian Details", { underline: true })
      .moveDown(0.5);

    const parentDetails = [
      { label: "Father's Name:", value: application.father_name },
      { label: "Father's Profession:", value: application.father_profession },
      { label: "Father's Contact:", value: application.father_contact },
      { label: "Mother's Name:", value: application.mother_name },
      { label: "Mother's Profession:", value: application.mother_profession },
      { label: "Mother's Contact:", value: application.mother_contact },
    ];

    parentDetails.forEach((detail) => {
      doc
        .font(doc._font && doc._font.family === "BodyFont" ? "BodyFont" : "Helvetica")
        .fontSize(12)
        .fillColor(textColor)
        .text(detail.label, { continued: true, width: 200 })
        .text(detail.value, { align: "right" });
    });

    // Guardian Details (if available)
    if (application.guardian_name) {
      const guardianDetails = [
        { label: "Guardian's Name:", value: application.guardian_name },
        { label: "Guardian's Profession:", value: application.guardian_profession },
      ];

      guardianDetails.forEach((detail) => {
        doc
          .font(doc._font && doc._font.family === "BodyFont" ? "BodyFont" : "Helvetica")
          .fontSize(12)
          .fillColor(textColor)
          .text(detail.label, { continued: true, width: 200 })
          .text(detail.value, { align: "right" });
      });
    }

    doc.moveDown(1);

    // Contact Details Section
    doc
      .font(doc._font && doc._font.family === "SubHeaderFont" ? "SubHeaderFont" : "Helvetica-Bold")
      .fontSize(14)
      .fillColor(primaryColor)
      .text("Contact Details", { underline: true })
      .moveDown(0.5);

    const contactDetails = [
      { label: "Emergency Contact No:", value: application.emergency_contact },
      { label: "Residence:", value: application.residence },
      { label: "Village/Town:", value: application.village },
      { label: "Tehsil:", value: application.tehsil },
      { label: "District:", value: application.district },
    ];

    contactDetails.forEach((detail) => {
      doc
        .font(doc._font && doc._font.family === "BodyFont" ? "BodyFont" : "Helvetica")
        .fontSize(12)
        .fillColor(textColor)
        .text(detail.label, { continued: true, width: 200 })
        .text(detail.value, { align: "right" });
    });

    doc.moveDown(1);

    // Sibling Information Section
    doc
      .font(doc._font && doc._font.family === "SubHeaderFont" ? "SubHeaderFont" : "Helvetica-Bold")
      .fontSize(14)
      .fillColor(primaryColor)
      .text("Sibling Information", { underline: true })
      .moveDown(0.5);

    const siblingInfo = [
      {
        label: "Sibling Studying Here:",
        value: application.sibling_study ? "Yes" : "No",
      },
      {
        label: "Sibling Name:",
        value: application.sibling_name || "N/A",
      },
      {
        label: "Sibling Class:",
        value: application.sibling_class || "N/A",
      },
    ];

    siblingInfo.forEach((info) => {
      doc
        .font(doc._font && doc._font.family === "BodyFont" ? "BodyFont" : "Helvetica")
        .fontSize(12)
        .fillColor(textColor)
        .text(info.label, { continued: true, width: 200 })
        .text(info.value, { align: "right" });
    });

    doc.moveDown(1);

    // Signatures Section
    doc
      .font(doc._font && doc._font.family === "SubHeaderFont" ? "SubHeaderFont" : "Helvetica-Bold")
      .fontSize(14)
      .fillColor(primaryColor)
      .text("Signatures", { underline: true })
      .moveDown(0.5);

    const signatures = [
      "Father's Signature: ________________________",
      "Mother's Signature: ________________________",
      "Guardian's Signature: ________________________",
    ];

    signatures.forEach((sign) => {
      doc
        .font(doc._font && doc._font.family === "BodyFont" ? "BodyFont" : "Helvetica")
        .fontSize(12)
        .fillColor(textColor)
        .text(sign)
        .moveDown(0.5);
    });

    doc.moveDown(1);

    // Documents Required Section
    doc
      .font(doc._font && doc._font.family === "SubHeaderFont" ? "SubHeaderFont" : "Helvetica-Bold")
      .fontSize(14)
      .fillColor(primaryColor)
      .text("Documents Required at the Time of Interview/Interaction:", {
        underline: true,
      })
      .moveDown(0.5);

    const requiredDocs = [
      "D.O.B certificate from competent authority.",
      "Blood Group Report / Weight / Height.",
      "Aadhar Card (Xerox).",
      "Passport Size Photographs (06).",
      "Marks Certificate of Previous Class.",
      "School Leaving Certificate.",
    ];

    // Add a shaded box for the list
    const listStartY = doc.y;
    const listWidth = 500;
    const listHeight = requiredDocs.length * 20 + 20;

    doc
      .rect(50, listStartY - 10, listWidth, listHeight)
      .fillColor(secondaryColor)
      .fill()
      .strokeColor(primaryColor)
      .stroke();

    doc
      .font(doc._font && doc._font.family === "BodyFont" ? "BodyFont" : "Helvetica")
      .fontSize(12)
      .fillColor(textColor)
      .list(requiredDocs, 60, listStartY, { bulletIndent: 10, textIndent: 20 });

    doc.moveDown(2);

    // Footer Notes
    doc
      .font(doc._font && doc._font.family === "BodyFont" ? "BodyFont" : "Helvetica")
      .fontSize(10)
      .fillColor(textColor)
      .text(
        "Note: Students must be accompanied by their parents at the time of Interview.",
        { align: "center" }
      )
      .moveDown(0.5);

    // School Contacts
    doc
      .text(
        "School Contacts: +919596298036 | +917006571090 | +919906105878 | +917780923302 | +919622491862",
        { align: "center" }
      )
      .moveDown(0.2);

    // Email Address
    doc.text("E-Mail ID: pioneerinstitute2008@gmail.com", { align: "center" });

    // Finalize the PDF and end the stream
    doc.end();
  } catch (error) {
    console.error("Error generating PDF:", error);

    // Handle errors and ensure response is properly finalized
    if (!res.headersSent) {
      res.status(500).json({ message: "Internal server error." });
    }
  }
};
