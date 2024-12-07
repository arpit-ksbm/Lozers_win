const mongoose = require('mongoose');

// Admin Schema
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
  },
}, {
  timestamps: true,
});

// Create User model
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
