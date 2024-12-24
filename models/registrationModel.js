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
      day: {
        type: String,
        required: [true, "DOB day is required"],
      },
      month: {
        type: String,
        required: [true, "DOB month is required"],
      },
      year: {
        type: String,
        required: [true, "DOB year is required"],
      },
      in_words: {
        type: String,
        required: [true, "DOB in words is required"],
      },
    },
    school_last_attended: {
      type: String,
      required: [true, "Last school attended is required"],
    },
    father_name: {
      type: String,
      required: [true, "Father's name is required"],
    },
    father_profession: {
      type: String,
      required: [true, "Father's profession is required"],
    },
    mother_name: {
      type: String,
      required: [true, "Mother's name is required"],
    },
    mother_profession: {
      type: String,
      required: [true, "Mother's profession is required"],
    },
    guardian_name: {
      type: String,
    },
    guardian_profession: {
      type: String,
    },
    monthly_income: {
      type: String,
    },
    father_contact: {
      type: String,
      required: [true, "Father's contact is required"],
    },
    mother_contact: {
      type: String,
    },
    father_qualification: {
      type: String,
    },
    mother_qualification: {
      type: String,
    },
    residence: {
      type: String,
      required: [true, "Residence is required"],
    },
    village: {
      type: String,
      required: [true, "Village is required"],
    },
    tehsil: {
      type: String,
      required: [true, "Tehsil is required"],
    },
    district: {
      type: String,
      required: [true, "District is required"],
    },
    pen_no: {
      type: String,
    },
    blood_group: {
      type: String,
    },
    sibling_studying: {
      type: Boolean,
      default: false,
    },
    sibling_details: {
      name: {
        type: String,
      },
      class: {
        type: String,
      },
    },
    dob_certificate_path: {
      type: String,
    },
    blood_report_path: {
      type: String,
    },
    aadhar_card_path: {
      type: String,
    },
    passport_photos_path: {
      type: String,
    },
    marks_certificate_path: {
      type: String,
    },
    school_leaving_cert_path: {
      type: String,
    },
    student_photo_path: {
      type: String,
    },
    applicationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"], // Define allowed statuses
      default: "pending",
    },
    isRead: {
      type: Boolean,
      default: false, // Indicates if the application has been read by the admin
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

// Hash password before saving
registrationSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate JWT token
registrationSchema.methods.generateWebToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }

  return jwt.sign(
    { email: this.email, id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Remove sensitive fields when converting to JSON
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
