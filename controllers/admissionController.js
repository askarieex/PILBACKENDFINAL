const Registration = require("../models/registrationModel");

const register = async (req, res) => {
    try {
        console.log("Received body:", req.body);
        console.log("Received files:", req.files);

        const {
            username,
            email,
            password,
            class: studentClass,
            dated,
            student_name,
            dob,
            school_last_attended,
            father_name,
            father_profession,
            mother_name,
            mother_profession,
            guardian_name,
            guardian_profession,
            monthly_income,
            father_contact,
            mother_contact,
            father_qualification,
            mother_qualification,
            residence,
            village,
            tehsil,
            district,
            sibling_studying,
            sibling_details,
            pen_no,
            blood_group
        } = req.body;

        const { dobCertificate, bloodReport, aadharCard, passportPhotos, marksCertificate, schoolLeavingCert, studentPhoto } = req.files || {};

        const dobCertificatePath = dobCertificate ? dobCertificate[0].path : null;
        const bloodReportPath = bloodReport ? bloodReport[0].path : null;
        const aadharCardPath = aadharCard ? aadharCard[0].path : null;
        const passportPhotosPath = passportPhotos ? passportPhotos[0].path : null;
        const marksCertificatePath = marksCertificate ? marksCertificate[0].path : null;
        const schoolLeavingCertPath = schoolLeavingCert ? schoolLeavingCert[0].path : null;
        const studentPhotoPath = studentPhoto ? studentPhoto[0].path : null;

        // Check if the user with the same email already exists
        const userExist = await Registration.findOne({ email });
        if (userExist) {
            return res.status(400).json({ msg: "Email already exists" });
        }

        const newRegistration = await Registration.create({
            username,
            email,
            password,
            class: studentClass,
            dated,
            student_name,
            dob,
            school_last_attended,
            father_name,
            father_profession,
            mother_name,
            mother_profession,
            guardian_name,
            guardian_profession,
            monthly_income,
            father_contact,
            mother_contact,
            father_qualification,
            mother_qualification,
            residence,
            village,
            tehsil,
            district,
            sibling_studying,
            sibling_details,
            pen_no,
            blood_group,
            dob_certificate_path: dobCertificatePath,
            blood_report_path: bloodReportPath,
            aadhar_card_path: aadharCardPath,
            passport_photos_path: passportPhotosPath,
            marks_certificate_path: marksCertificatePath,
            school_leaving_cert_path: schoolLeavingCertPath,
            student_photo_path: studentPhotoPath
        });

        // After successful registration, redirect or send a success response
        // Frontend can handle the redirect. We'll send a success response with token.
        res.status(201).json({
            msg: "Successfully Inserted data",
            data: newRegistration,
            token: await newRegistration.generateWebToken(),
            userId: newRegistration._id.toString()
        });
    } catch (error) {
        console.error("Error in register controller:", error);
        res.status(500).json({ msg: error.message });
    }
};

module.exports = { register };
