// backend/models/Registration.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registrationSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: [true, "Email is required"],
      match: [/\S+@\S+\.\S+/, "Email is invalid"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    class: {
      type: String,
      required: [true, "Class is required"],
    },
    dated: {
      type: String,
      required: [true, "Date is required"],
    },
    student_name: {
      type: String,
      required: [true, "Student name is required"],
    },
    dob: {
      day: String,
      month: String,
      year: String,
      in_words: String,
    },
    school_last_attended: String,
    father_name: String,
    father_profession: String,
    mother_name: String,
    mother_profession: String,
    guardian_name: String,
    guardian_profession: String,
    monthly_income: String,
    father_contact: String,
    mother_contact: String,
    father_qualification: String,
    mother_qualification: String,
    residence: String,
    village: String,
    tehsil: String,
    district: String,
    pen_no: String,
    blood_group: String,
    sibling_studying: {
      type: Boolean,
      default: false,
    },
    sibling_details: {
      name: String,
      class: String,
    },
    dob_certificate_path: String,
    blood_report_path: String,
    aadhar_card_path: String,
    passport_photos_path: String,
    marks_certificate_path: String,
    school_leaving_cert_path: String,
    student_photo_path: String,

    // **New Fields Added Below**
    applicationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"], // Define allowed statuses
      default: "pending",
    },
    isRead: {
      type: Boolean,
      default: false, // Indicates if the application has been read by the admin
    },
    // **New Fields End Here**

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

registrationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

registrationSchema.methods.generateWebToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  return jwt.sign(
    { email: this.email, id: this._id, role: this.role },
    process.env.JWT_SECRET, // Updated from JWT_KEY to JWT_SECRET
    { expiresIn: "7d" }
  );
};

registrationSchema.set("toJSON", {
  transform: function (doc, ret, options) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const Registration = mongoose.model("Registration", registrationSchema);

console.log("Registration model loaded");

module.exports = Registration;
