const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  countryCode: {
    type: String,
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  name: {
    type: String,
  },
  userName: {
    type: String,
  },
  dateOfBirth: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Others'],
  },
  address: {
    type: String,
  },
  profileImage: {
    type: String,
    default: '',
  },
  referralCode: {
    type: String,
    default: '',
  },
  isVerify: {
    type: Boolean,
    default: false,
  },
  socialId: {
    type: String,
    default: ''
  },
  preferredLang: {
    type: String,
    enum: ["English", "Hindi"],
    default: "English",
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ["Active", "In-Active"],
    default: "Active"
  },
  banned_status:{
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Number,
    default: 0
  },
  accessToken: {
    type: String,
  },
  refreshToken: {
    type: String,
  },
  firebaseToken: {
    type: String,
  },
}, {
  timestamps: true,
});

// Create User model
const User = mongoose.model('User', userSchema);

module.exports = User;
