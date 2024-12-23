const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
  },
  surname: { 
    type: String, 
    required: [true, 'Surname is required'], 
  },
  isLoggedIn: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: true, // Default role is admin
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to validate password
adminSchema.methods.validPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate JWT with isAdmin flag
adminSchema.methods.generateJWT = function () {
  return jwt.sign(
    { id: this._id, email: this.email, isAdmin: this.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

adminSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
