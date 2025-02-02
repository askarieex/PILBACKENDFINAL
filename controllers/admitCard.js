const { jsPDF } = require('jspdf');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // For image processing
const QRCode = require('qrcode'); // For QR code generation
const { v4: uuidv4 } = require('uuid'); // For unique serial numbers

const AdmitCard = async (req, res) => {
  try {
    const userData = req.user;

    // Generate a unique serial number for the Admit Card
    const serialNumber = uuidv4();

    // Initialize jsPDF
    const doc = new jsPDF('p', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginLeft = 40;
    const marginRight = 40;
    const contentWidth = pageWidth - marginLeft - marginRight;
    let cursorY = 50;

    // Paths to logo and student photo
    const logoPath = path.resolve(__dirname, '..', 'image.png'); // Replace with your logo path
    const userPhotoPath = userData.student_photo_path
      ? path.resolve(__dirname, '..', userData.student_photo_path)
      : null;

    let logoImage;
    let userPhoto;

    // Function to process images using sharp
    const processImage = async (imagePath, width, height, format = 'jpeg') => {
      if (!fs.existsSync(imagePath)) return null;
      let transformer = sharp(imagePath).resize(width, height, { fit: 'inside' });

      if (format === 'png') {
        transformer = transformer.png({
          compressionLevel: 3, // Lower compression for higher quality (0-9)
          adaptiveFiltering: true,
        });
      } else if (format === 'jpeg') {
        transformer = transformer.jpeg({
          quality: 90, // High quality for better image clarity (0-100)
          mozjpeg: true,
        });
      }

      const buffer = await transformer.toBuffer();
      return buffer.toString('base64');
    };

    // Process logo and user photo
    logoImage = logoPath
      ? await processImage(logoPath, 500, 85, 'png') // Keep logo as PNG for transparency
      : null;
    userPhoto = userPhotoPath
      ? await processImage(userPhotoPath, 120, 140, 'jpeg') // Convert photo to JPEG with higher quality
      : null;

    // ** HEADER WITH LOGO **
    const desiredLogoWidth = 500; // Desired width on the PDF
    const desiredLogoHeight = 85; // Adjusted height based on resized image

    const logoX = (pageWidth - desiredLogoWidth) / 2;
    const logoY = cursorY;
    if (logoImage) {
      doc.addImage(logoImage, 'PNG', logoX, logoY, desiredLogoWidth, desiredLogoHeight);
    }

    cursorY += desiredLogoHeight + 20; // Move below the logo with adjusted spacing

    // Add Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(0, 102, 204); // Blue color
    doc.text('Admission Entrance Examination Admit Card', pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 25;

    // Draw a subtle line after the title
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(1.5);
    doc.line(marginLeft, cursorY, marginLeft + contentWidth, cursorY);
    cursorY += 20;

    // ** CANDIDATE DETAILS SECTION **
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0); // Black color
    doc.text('Candidate Details', marginLeft, cursorY);
    cursorY += 20;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(12);

    // Essential details only
    const details = [
      { label: "Name", value: userData.student_name },
      { label: "Date of Birth", value: `${userData.dob.day}-${userData.dob.month}-${userData.dob.year}` },
      { label: "Father's Name", value: userData.father_name },
      { label: "Class", value: userData.class },
      { label: "Contact No.", value: userData.father_contact },
      {
        label: "Address",
        value: [userData.residence].filter(Boolean).join(', ')
      },
      { label: "PEN No", value: userData.pen_no },
      { label: "Blood Group", value: userData.blood_group }
    ];

    // Generate a unique serial number for the Admit Card
    // (Already generated above as `serialNumber`)

    // Filter out empty values
    const filteredDetails = details.filter(d => d.value && d.value.toString().trim() !== '');
    const lineHeight = 20;
    const detailStartY = cursorY;

    filteredDetails.forEach(item => {
      doc.setFont('Helvetica', 'bold');
      doc.text(`${item.label}:`, marginLeft, cursorY);
      doc.setFont('Helvetica', 'normal');
      doc.text(item.value, marginLeft + 150, cursorY);
      cursorY += lineHeight;
    });

    // Display Serial Number for additional security
    doc.setFont('Helvetica', 'bold');
    doc.text(`Serial No.:`, marginLeft, cursorY);
    doc.setFont('Helvetica', 'normal');
    doc.text(serialNumber, marginLeft + 150, cursorY);
    cursorY += lineHeight;

    // Add user photo if available (placing to the right of details)
    if (userPhoto) {
      const photoX = pageWidth - marginRight - 120;
      const photoY = detailStartY;
      doc.setLineWidth(1);
      doc.rect(photoX - 5, photoY - 5, 130, 150); // Frame for photo
      doc.addImage(userPhoto, 'JPEG', photoX, photoY, 120, 140);

      // Adjust cursor if image extends beyond text
      const imageBottom = photoY + 140 + 20;
      if (imageBottom > cursorY) {
        cursorY = imageBottom;
      }
    }

    cursorY += 20;

    // Draw a line before signatures
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(1.5);
    doc.line(marginLeft, cursorY, marginLeft + contentWidth, cursorY);
    cursorY += 20;

    // ** SIGNATURES SECTION **
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Black color
    doc.text("Invigilator's Signature:", marginLeft, cursorY);
    doc.rect(marginLeft, cursorY + 10, 150, 40); 

    doc.text("Candidate's Signature:", marginLeft + 250, cursorY);
    doc.rect(marginLeft + 250, cursorY + 10, 150, 40);
    cursorY += 60;

    // Draw a line before instructions
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(1.5);
    doc.line(marginLeft, cursorY, marginLeft + contentWidth, cursorY);
    cursorY += 20;

    // ** GENERAL INSTRUCTIONS **
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204); // Blue color
    doc.text('General Instructions for the Candidate', marginLeft, cursorY);
    cursorY += 20;

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0); // Black color
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

    // ** SECURITY FEATURES **

    // 1. Generate QR Code
    // Define the data to encode in the QR code
    const qrData = JSON.stringify({
      serialNumber: serialNumber, // Include serial number for verification
      userId: userData._id,
      name: userData.student_name,
      issuedBy: "Team PIL",
      issuedAt: new Date().toISOString()
    });

    // Generate QR code as Data URL (PNG format)
    const qrCodeDataURL = await QRCode.toDataURL(qrData, { 
      errorCorrectionLevel: 'H', // High error correction
      type: 'image/png',
      quality: 0.92,
      margin: 1
    });

    // Extract Base64 string without the data prefix
    const qrCodeBase64 = qrCodeDataURL.split(',')[1];

    // Define QR code dimensions
    const qrWidth = 100;
    const qrHeight = 100;

    // Position QR code at the bottom-right corner
    const qrX = pageWidth - marginRight - qrWidth;
    const qrY = pageHeight - marginRight - qrHeight;

    // Add QR code to PDF
    doc.addImage(qrCodeBase64, 'PNG', qrX, qrY, qrWidth, qrHeight);

    // ** OPTIONAL: Add Footer with Verification Token**
    // Instead of a verification URL without token, include the token directly.
    // This can be used for server-side verification when scanned.

    // Example: You might omit adding text since QR code contains all necessary information.
    // If you wish to add a small note, ensure it doesn't clutter the design.

    /*
    const verificationToken = 'your-verification-token'; // Ideally, include in qrData

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Verification Token: ${verificationToken}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    */

    // ** FINAL DESIGN ENHANCEMENTS **
    // Add borders to the entire page for a polished look
    doc.setDrawColor(0, 102, 204); // Blue color
    doc.setLineWidth(2);
    doc.rect(marginLeft / 2, 20, pageWidth - marginLeft, pageHeight - 40); // Adjusted positioning for border

    // ** FINALIZE AND SEND PDF **
    // Use 'arraybuffer' for output and send as binary
    const pdfOutput = doc.output('arraybuffer'); // Binary data

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${userData._id}_Admit_Card.pdf`,
      'Content-Length': Buffer.byteLength(Buffer.from(pdfOutput))
    });

    res.send(Buffer.from(pdfOutput));

  } catch (err) {
    console.error('Error generating Admit Card PDF:', err);
    res.status(500).send('Failed to generate PDF');
  }
};

module.exports = { AdmitCard };
