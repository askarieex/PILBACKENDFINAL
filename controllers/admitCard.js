// ./controllers/AdmitCardController.js

const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');
const ApplicationModel = require('../models/Application'); // Adjust the path based on your project structure

const AdmitCard = async (req, res) => {
  try {
    let applicationData = null;

    // Check if 'id' is present in query parameters (Admin Request)
    const applicationId = req.query.id;

    if (applicationId) {
      // ** Admin Request **
      
      // Verify that the requester is an admin
      if (!req.user || !req.user.isAdmin) { // Adjust the admin verification based on your middleware
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }

      // Fetch the application data using the provided ID
      applicationData = await ApplicationModel.findById(applicationId);

      if (!applicationData) {
        return res.status(404).json({ message: 'Application not found.' });
      }

      // Ensure the application is approved
      if (applicationData.applicationStatus !== 'approved') {
        return res.status(403).json({ message: 'Admit card is only available for approved applications.' });
      }
    } else {
      // ** User Request **

      // Ensure that the user is authenticated
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized. Please log in.' });
      }

      // Fetch the user's own application data
      applicationData = await ApplicationModel.findById(req.user.applicationId); // Adjust based on how you link user to application

      if (!applicationData) {
        return res.status(404).json({ message: 'Application not found.' });
      }

      // Ensure the application is approved
      if (applicationData.applicationStatus !== 'approved') {
        return res.status(403).json({ message: 'Admit card is only available for approved applications.' });
      }
    }

    // ** Generate Admit Card PDF Using applicationData **
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 40;
    const contentWidth = pageWidth - marginLeft * 2;
    let cursorY = 50;

    // Paths to logo and student photo
    const logoPath = path.resolve(__dirname, '..', 'assets', 'logo.png'); // Ensure the logo exists at this path
    const userPhotoPath = applicationData.student_photo_path
      ? path.resolve(__dirname, '..', applicationData.student_photo_path)
      : null;

    let logoImage;
    let userPhoto;

    // Read and encode the logo image
    if (fs.existsSync(logoPath)) {
      const logoData = fs.readFileSync(logoPath);
      logoImage = logoData.toString('base64');
    } else {
      console.warn('Logo image not found at:', logoPath);
    }

    // Read and encode the user photo
    if (userPhotoPath && fs.existsSync(userPhotoPath)) {
      const photoData = fs.readFileSync(userPhotoPath);
      userPhoto = photoData.toString('base64');
    } else {
      console.warn('User photo not found at:', userPhotoPath);
    }

    // ** HEADER WITH LOGO **
    const originalLogoWidth = 1000; // Example original width
    const originalLogoHeight = 170; // Example original height
    const desiredLogoWidth = 500;   // Desired width on the PDF
    const aspectRatio = originalLogoHeight / originalLogoWidth;
    const desiredLogoHeight = desiredLogoWidth * aspectRatio;

    const logoX = (pageWidth - desiredLogoWidth) / 2;
    const logoY = cursorY;
    if (logoImage) {
      doc.addImage(logoImage, 'PNG', logoX, logoY, desiredLogoWidth, desiredLogoHeight);
    }

    cursorY += desiredLogoHeight + 35; // Move below the logo

    // Add Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204); // Example color
    doc.text('Admission Entrance Examination Admit Card', pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 30;

    // Draw a subtle line after the title
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(2);
    doc.line(marginLeft, cursorY, marginLeft + contentWidth, cursorY);
    cursorY += 30;

    // ** CANDIDATE DETAILS SECTION **
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Candidate Details', marginLeft, cursorY);
    cursorY += 20;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(12);

    // Essential details only
    const details = [
      { label: "Name", value: applicationData.student_name },
      { label: "Date of Birth", value: `${applicationData.dob.day}-${applicationData.dob.month}-${applicationData.dob.year}` },
      { label: "Father's Name", value: applicationData.father_name },
      { label: "Class", value: applicationData.class },
      { label: "Contact No.", value: applicationData.father_contact },
      {
        label: "Address",
        value: [applicationData.residence, applicationData.village, applicationData.tehsil, applicationData.district].filter(Boolean).join(', ')
      },
      { label: "PEN No", value: applicationData.pen_no },
      { label: "Blood Group", value: applicationData.blood_group }
    ];

    // Filter out empty values
    const filteredDetails = details.filter(d => d.value && d.value.toString().trim() !== '');
    const lineHeight = 18;
    const detailStartY = cursorY;

    filteredDetails.forEach(item => {
      doc.setFont('Helvetica', 'bold');
      doc.text(`${item.label}:`, marginLeft, cursorY);
      doc.setFont('Helvetica', 'normal');
      doc.text(item.value.toString(), marginLeft + 150, cursorY);
      cursorY += lineHeight;
    });

    // Add user photo if available (placing to the right of details)
    if (userPhoto) {
      const photoX = pageWidth - marginLeft - 120;
      const photoY = detailStartY;
      doc.setLineWidth(1);
      doc.rect(photoX - 5, photoY - 5, 130, 150); // Frame for photo
      doc.addImage(userPhoto, 'PNG', photoX, photoY, 120, 140);

      // Adjust cursor if image extends beyond text
      const imageBottom = photoY + 140 + 20;
      if (imageBottom > cursorY) {
        cursorY = imageBottom;
      }
    }

    cursorY += 20;

    // Draw a line before signatures
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(2);
    doc.line(marginLeft, cursorY, marginLeft + contentWidth, cursorY);
    cursorY += 30;

    // ** SIGNATURES SECTION **
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.text("Invigilator's Signature:", marginLeft, cursorY);
    doc.rect(marginLeft, cursorY + 10, 150, 40); 

    doc.text("Candidate's Signature:", marginLeft + 250, cursorY);
    doc.rect(marginLeft + 250, cursorY + 10, 150, 40);
    cursorY += 60;

    // Draw a line before instructions
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(2);
    doc.line(marginLeft, cursorY, marginLeft + contentWidth, cursorY);
    cursorY += 30;

    // ** GENERAL INSTRUCTIONS **
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);
    doc.text('General Instructions for the Candidate', marginLeft, cursorY);
    cursorY += 20;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const instructions = [
      "1. Please bring this Admit Card and a valid Photo ID proof on the examination day.",
      "2. Arrive at the examination hall at least 30 minutes before the scheduled start time.",
      "3. Use only a blue or black ballpoint pen for filling in required details.",
      "4. Electronic devices (mobile phones, calculators) are strictly prohibited.",
      "5. Any form of misconduct will lead to immediate disqualification.",
      "6. Follow all instructions given by the invigilators and maintain proper decorum.",
      "7. No candidate will be allowed to leave the examination hall before the exam concludes.",
      "8. Keep your Admit Card safe; it may be required for further reference."
    ];

    instructions.forEach(line => {
      const wrapped = doc.splitTextToSize(line, contentWidth);
      wrapped.forEach((wLine) => {
        doc.text(wLine, marginLeft, cursorY);
        cursorY += 14;
      });
    });

    // Add the revised statement about the purpose of the Admit Card
    cursorY += 10;
    doc.setFont('Helvetica', 'italic');
    doc.setFontSize(12);
    doc.setTextColor(255, 0, 0); // Red color to highlight
    doc.text('This Admit Card is for the examination required for admission.', pageWidth / 2, cursorY, { align: 'center' });

    // Finalize the PDF and send it to the client without saving to the server
    const pdfOutput = doc.output();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${applicationData.student_name}_Admit_Card.pdf`,
      'Content-Length': Buffer.byteLength(pdfOutput)
    });

    res.send(Buffer.from(pdfOutput, 'binary'));

  } catch (err) {
    console.error('Error in AdmitCard Controller:', err);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
};

module.exports = { AdmitCard };
